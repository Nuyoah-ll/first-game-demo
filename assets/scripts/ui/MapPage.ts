import { _decorator, Graphics, instantiate, Prefab, UITransform, Node, Vec3, ScrollView } from 'cc';
import { UIBase } from '../common/classes/ui/UIBase';
import { LAYOUT_CONFIG, MAP_CONFIG, NodeType } from '../common/constants/map';
import { StaticSingleton } from '../global/StaticSingleton';
import { SeededRandom } from '../common/utils/SeedRandom';
import { flattenDeep } from "lodash-es"
import { EnemyNode } from '../common/classes/nodes/EnemyNode';
import { RockMouse } from '../enemy/RockMouse';
import { BigRockMouse } from '../enemy/BigRockMouse';
import { HugeRockMouse } from '../enemy/HugeRockMouse';
import { EliteEnemyNode } from '../common/classes/nodes/EliteEnemyNode';
import { BossNode } from '../common/classes/nodes/BossNode';
const { ccclass, property } = _decorator;


// 节点结构：包含拓扑信息和连接关系
export interface MapNode {
    nodeId: string;
    row: number;
    col: number;
    type: NodeType;
    prevConnectedNodes: MapNode[]; // 连接的前一层节点
    nextConnectedNodes: MapNode[]; // 连接的后一层节点
    nodeInstance: Node;
}

// 单章地图结构
export interface ActMap {
    actId: number;
    rows: MapNode[][]; // 行->列->节点，有序排列保证路径不交叉
}

// 全局地图结构
export interface GameMap {
    seed: number;
    actMaps: ActMap[];
}

@ccclass('MapPage')
export class MapPage extends UIBase {
    @property({ type: Prefab, tooltip: '普通怪物节点预制体' })
    public enemyPrefab: Prefab;
    @property({ type: Prefab, tooltip: '精英怪物节点预制体' })
    public eliteEnemyPrefab: Prefab;
    @property({ type: Prefab, tooltip: '休息点节点预制体' })
    public restPrefab: Prefab;
    @property({ type: Prefab, tooltip: 'BOSS节点预制体' })
    public bossPrefab: Prefab;

    private _graphics: Graphics = null!; // 路径绘制组件
    private _nodeLayer: Node = null!;    // 节点层（层级高于路径，避免遮挡）
    private _currentActMap: ActMap = null!; // 当前渲染的章节地图
    private gameMap: GameMap = { seed: 0, actMaps: [] };
    private random: SeededRandom;
    private mapTotalHeight: number = 0;
    private mapTotalWidth: number = 0;

    protected onLoad(): void {
        super.onLoad();
        StaticSingleton.setMapPage(this);
        this._initRenderer();
    }

    /**
       * 初始化全局地图（入口）
       * @param seed 随机种子
       */
    public initMap(seed: number): ActMap[] {
        this.gameMap.seed = seed;
        this.random = new SeededRandom(seed);
        this.gameMap.actMaps = [];

        // 逐一生成每一章地图
        for (let actId = 1; actId <= MAP_CONFIG.actCount; actId++) {
            const actMap = this.generateSingleAct(actId);
            this.gameMap.actMaps.push(actMap);
        }
        return this.gameMap.actMaps;
    }

    /**
     * 生成单章地图：核心流程【1.生成拓扑节点 → 2.生成合规路径 → 3.分配节点类型】
     */
    private generateSingleAct(actId: number): ActMap {
        const actMap: ActMap = {
            actId,
            rows: [],
        };

        // 步骤1：生成基础拓扑节点（仅确定行列、ID，类型暂为默认怪物）
        this.generateTopologyNodes(actMap);

        // 步骤2：生成路径（满足：无交叉、入出边规则、首尾行特殊规则）
        this.generateValidPaths(actMap);

        // 步骤3：分配节点类型（满足：首行强制怪物、BOSS、数量上限、路径连续限制）
        this.assignNodeTypes(actMap);
        return actMap;
    }

    // =============== 步骤1：生成拓扑节点（仅骨架，无类型逻辑） ===============
    private generateTopologyNodes(actMap: ActMap): void {
        const { nodeCountPerRow, maxRowIndex } = MAP_CONFIG;

        for (let row = 0; row <= maxRowIndex; row++) {
            const currentRow: MapNode[] = [];
            let nodeCount: number;

            // 按行类型确定节点数量
            if (row === 0) {
                // 首行
                nodeCount = this.random.nextInt(nodeCountPerRow.firstRowMin, nodeCountPerRow.firstRowMax);
            } else if (row === maxRowIndex) {
                // 最后一行
                nodeCount = this.random.nextInt(nodeCountPerRow.finalRowMin, nodeCountPerRow.finalRowMax);
            } else {
                // 中间行
                nodeCount = this.random.nextInt(nodeCountPerRow.normalRowMin, nodeCountPerRow.normalRowMax);
            }

            // 创建节点，仅设置基础信息，类型默认怪物
            for (let col = 0; col < nodeCount; col++) {
                const nodeId = `act_${actMap.actId}_row_${row}_col_${col}`;
                // todo 基于规则创建随机的敌人
                const enemyNode = instantiate(this.enemyPrefab);
                const enemyNodeInstance = enemyNode.getComponent(EnemyNode);
                enemyNodeInstance.setEnemyTeams([new RockMouse()]);
                const node: MapNode = {
                    nodeId,
                    row,
                    col,
                    type: NodeType.Enemy,
                    nodeInstance: enemyNode,
                    prevConnectedNodes: [],
                    nextConnectedNodes: [],
                };
                currentRow.push(node);
            }

            actMap.rows.push(currentRow);
        }
    }

    // =============== 步骤2：生成合规路径（保证无交叉、入出边规则，和类型无关） ===============
    private generateValidPaths(actMap: ActMap): void {
        for (let row = 0; row < actMap.rows.length - 1; row++) {
            const currentRow = actMap.rows[row];
            const nextRow = actMap.rows[row + 1];
            this.generateValidPathForTwoRows(currentRow, nextRow, false);
        }
    }

    // =============== 步骤3：分配节点类型（满足：首行强制怪物、BOSS、数量上限、路径连续限制） ===============
    private assignNodeTypes(actMap: ActMap): void {
        const typeCounter: Record<NodeType, number> = {} as Record<NodeType, number>;
        // 1. 初始化类型计数器：统计各类型节点数量，防止超上限
        Object.values(NodeType).forEach((nodeType) => {
            typeCounter[nodeType] = nodeType === NodeType.Enemy ? flattenDeep(actMap.rows).length : 0;
        });
        // 2. 先设置【固定类型节点】
        this.setFixedTypeNodes(actMap, typeCounter);

        // 3. 收集【可编辑节点】：排除首行/BOSS行，仅保留默认怪物节点（可被替换为特殊节点）
        const editableNodes = this.collectEditableNodes(actMap);

        // 4. 按规则分配【特殊节点】：精英/休息/宝箱/商店/事件，保证数量+连续规则
        this.assignSpecialNodeTypes(actMap, editableNodes, typeCounter);
    }
    /**
     * 设置固定类型节点
     */
    private setFixedTypeNodes(actMap: ActMap, counter: Record<NodeType, number>): void {
        const { specialRowNodeLimit } = MAP_CONFIG;
        Object.entries(specialRowNodeLimit).forEach(([row, nodeType]) => {
            actMap.rows[Number(row)].forEach((node) => {
                node.type = nodeType;
                node.nodeInstance = this.createNodeInstance(nodeType);
                counter[nodeType]++;
                counter[NodeType.Enemy]--; // 减少原怪物类型计数
            });
        });
    }

    /**
     * 子方法2：收集可编辑节点（中间行，可替换为特殊节点）
     * 排除：首行、BOSS行，仅保留默认Enemy节点，随机洗牌保证分布均匀
     */
    private collectEditableNodes(actMap: ActMap): MapNode[] {
        const editableNodes: MapNode[] = [];
        // 遍历中间行（1 ~ actMap.rows.length - 2）
        for (let row = 0; row < actMap.rows.length; row++) {
            if (!MAP_CONFIG.specialRowNodeLimit[row]) {
                actMap.rows[row].forEach((node) => {
                    if (node.type === NodeType.Enemy) {
                        editableNodes.push(node);
                    }
                });
            }
        }
        // 种子化洗牌：保证随机分布，且相同种子结果一致
        return this.random.shuffle(editableNodes);
    }

    /**
     * 子方法3：分配特殊节点类型（核心规则校验）
     * 分配优先级：EliteEnemy → Rest → Treasure → Store → Event（可按需调整）
     */
    private assignSpecialNodeTypes(actMap: ActMap, editableNodes: MapNode[], counter: Record<NodeType, number>): void {
        const { nodeLimit } = MAP_CONFIG;
        // 特殊节点分配，排除boss节点和敌人节点（因为初始化时给所有节点赋值了敌人节点作为节点默认值）
        const specialNodeTypes: NodeType[] = [...Object.values(NodeType)].filter(
            (type) => ![NodeType.Enemy, NodeType.Boss].includes(type),
        );

        // 遍历可编辑节点，依次尝试分配特殊类型
        for (const node of editableNodes) {
            for (const targetType of specialNodeTypes) {
                // 规则校验：1.数量未超上限 2.比例未超过上限 3.当前节点所在行不会禁用该类型 4.禁止连续监测
                if (
                    counter[targetType] < nodeLimit[targetType].maxCount &&
                    !nodeLimit[targetType].disabledRows.includes(node.row) &&
                    !this.isNodeTypeConsecutive(node, targetType)
                ) {
                    // 分配类型并更新实例+计数器
                    node.type = targetType;
                    node.nodeInstance = this.createNodeInstance(targetType);
                    counter[targetType]++;
                    counter[NodeType.Enemy]--; // 减少原怪物类型计数
                    break; // 分配成功，跳过后续类型尝试
                }
            }
        }
    }

    /**
     * 子方法4：校验节点类型分配是否合法（核心：禁止相连节点同时为特殊类型）
     * @param node 待分配节点
     * @param targetType 目标类型
     * @returns true=合法，false=非法
     */
    private isNodeTypeConsecutive(node: MapNode, targetType: NodeType): boolean {
        if (MAP_CONFIG.nodeLimit[targetType].disableConsecutive) {
            // 合并所有相邻节点（前驱+后继）
            const allNeighbors = [...node.prevConnectedNodes, ...node.nextConnectedNodes];
            // 若相邻节点中存在一样的节点，校验失败
            return allNeighbors.some((neighbor) => neighbor.type === targetType);
        }
        // 若目标类型不是「禁止连续类型」，直接合法（如Event/Enemy）
        return false;
    }

    /**
     * 子方法5：创建节点实例（匹配类型）
     */
    private createNodeInstance(type: NodeType): Node | null {
        // todo 基于规则创建随机的敌人
        if (type === NodeType.Enemy) {
            const enemyNode = instantiate(this.enemyPrefab);
            const enemyNodeInstance = enemyNode.getComponent(EnemyNode);
            enemyNodeInstance.setEnemyTeams([new RockMouse()]);
            return enemyNode;
        }
        if (type === NodeType.EliteEnemy) {
            const eliteEnemyNode = instantiate(this.eliteEnemyPrefab);
            const eliteEnemyNodeInstance = eliteEnemyNode.getComponent(EliteEnemyNode);
            eliteEnemyNodeInstance.setEliteEnemy(new BigRockMouse());
            return eliteEnemyNode;
        }
        if (type === NodeType.Boss) {
            const bossNode = instantiate(this.bossPrefab);
            const bossNodeInstance = bossNode.getComponent(BossNode);
            bossNodeInstance.setBoss(new HugeRockMouse());
            return bossNode;
        }
        if (type === NodeType.Rest) {
            const restNode = instantiate(this.restPrefab);
            return restNode;
        }
        return null;
    }

    private splitArray<T>(arr: T[], count: number): T[][] {
        const res: T[][] = [];
        const splitPoints: number[] = [];

        // 要生成count - 1个分割点，且分割点不为数组起始位置和结束位置
        while (splitPoints.length < count - 1) {
            // 生成 [1, arr.length-1] 范围内的随机整数
            const randomPos = this.random.nextInt(1, arr.length - 1);
            // 保证分割点不重复
            if (splitPoints.indexOf(randomPos) === -1) {
                splitPoints.push(randomPos);
            }
        }
        // 分割点按升序排列
        splitPoints.sort((a, b) => a - b);
        const fullSplitPoints = [0, ...splitPoints, arr.length];
        for (let i = 0; i < fullSplitPoints.length - 1; i++) {
            const start = fullSplitPoints[i];
            const end = fullSplitPoints[i + 1];
            // 截取原数组的连续片段，保证顺序不变
            const chunk = arr.slice(start, end);
            res.push(chunk);
        }
        return res;
    }

    private generateValidPathForTwoRows(currentRow: MapNode[], nextRow: MapNode[], reverse = false): void {
        if (currentRow.length > nextRow.length) {
            return this.generateValidPathForTwoRows(nextRow, currentRow, true);
        }
        const prevField = !reverse ? 'prevConnectedNodes' : 'nextConnectedNodes';
        const nextField = !reverse ? 'nextConnectedNodes' : 'prevConnectedNodes';

        const splitNextRows = this.splitArray(nextRow, currentRow.length);
        for (let i = 0; i < splitNextRows.length; i++) {
            const currentNode = currentRow[i];
            // const prevSplit = splitNextRows[i - 1] || [];
            // const prevSplitLastNode = prevSplit[prevSplit.length - 1];
            const lastSplit = splitNextRows[i + 1] || [];
            const lastSplitFirstNode = lastSplit[0];
            // if (prevSplitLastNode && this.random.pick([true, false])) {
            //   currentNode[nextField].push(prevSplitLastNode);
            //   prevSplitLastNode[prevField].push(currentNode);
            // }
            currentNode[nextField].push(...splitNextRows[i]);
            splitNextRows[i].forEach((node) => node[prevField].push(currentNode));
            if (lastSplitFirstNode && this.random.pick([true, false])) {
                currentNode[nextField].push(lastSplitFirstNode);
                lastSplitFirstNode[prevField].push(currentNode);
            }
        }
    }

    // ===================== 对外暴露方法 =====================
    public getGameMap(): GameMap {
        return this.gameMap;
    }

    public regenerateMap(seed: number): void {
        this.initMap(seed);
    }

    /**
     * 初始化渲染器：创建路径层、节点层、预制体映射
     */
    private _initRenderer() {
        // 1.获取scrollView
        const scrollViewContent = this.node.getChildByPath("ScrollView/view/content")
        const { maxRowIndex, nodeCountPerRow: { normalRowMax } } = MAP_CONFIG
        const { nodeWidth, nodeHeight, colGap, rowHeight } = LAYOUT_CONFIG

        // 2.创建地图容器
        const mapContainer = new Node("MapContainer")
        this.mapTotalHeight = ((maxRowIndex + 1) * nodeHeight + maxRowIndex * rowHeight);
        this.mapTotalWidth = (normalRowMax * nodeWidth + (normalRowMax - 1) * colGap)
        scrollViewContent.y = this.mapTotalHeight + 200
        const deltaX = this.mapTotalWidth / 2;
        const deltaY = this.mapTotalHeight / 2;
        mapContainer.position = new Vec3(-deltaX, -deltaY, 0)
        // 创建路径层（cc.Graphics）
        const graphicsNode = new Node('PathLayer')
        this._graphics = graphicsNode.addComponent(Graphics);
        this._graphics.lineWidth = LAYOUT_CONFIG.pathWidth;
        this._graphics.strokeColor = LAYOUT_CONFIG.pathStroke;
        mapContainer.addChild(graphicsNode);
        // 创建节点层（所有地图节点的父节点）
        this._nodeLayer = new Node('NodeLayer');
        mapContainer.addChild(this._nodeLayer);

        this.node.addChild(mapContainer);

        // 3.设置滚动视图内容节点
        scrollViewContent.addChild(mapContainer);
    }

    /**
     * 对外暴露：渲染地图核心方法
     * @param actMaps MapManager 生成的全局地图数据
     * @param actIndex 要渲染的章节索引（0/1/2）
     */
    public renderMap(actIndex: number = 0) {
        // 1. 校验数据
        const targetAct = this.gameMap.actMaps[actIndex];
        if (!targetAct) {
            console.error(`MapRenderer: 章节${actIndex}无地图数据`);
            return;
        }
        this._currentActMap = targetAct;

        // 2. 清空原有内容（避免重复渲染）
        this._clearAll();

        // 4. 再生成所有地图节点（按 row/col 索引定位）
        this._generateAllNodes();

        // 3. 先绘制路径（路径层在下层，不遮挡节点）
        this._drawAllPaths();
    }

    /**
     * 清空原有路径和节点
     */
    private _clearAll() {
        this._graphics.clear(); // 清空路径
        this._nodeLayer.removeAllChildren(); // 清空所有节点
    }

    /**
     * 绘制所有路径：核心逻辑与 React 一致，上层底边中心 → 下层上边中心
     */
    private _drawAllPaths() {
        const { rows } = this._currentActMap;
        // 遍历所有节点，绘制当前节点 → nextConnectedNodes 的路径
        rows.forEach(rowNodes => {
            rowNodes.forEach((node: MapNode) => {
                node.nextConnectedNodes.forEach((nextNode: MapNode) => {
                    // 计算上层节点：底边中心坐标（x1, y1）
                    const { x: x1, y: y1 } = this._getNodeTopCenter(node);
                    // 计算下层节点：上边中心坐标（x2, y2）（锚点(0.5,0)，节点position就是上边中心）
                    const { x: x2, y: y2 } = this._getNodeBottomCenter(nextNode);
                    // 开始绘制路径
                    this._graphics.moveTo(x1, y1);
                    this._graphics.lineTo(x2, y2);
                    this._graphics.stroke(); // 执行绘制
                });
            });
        });
    }

    /**
     * 生成所有地图节点：按 row/col 索引绝对定位，创建预制体实例
     */
    private _generateAllNodes() {
        const { nodeWidth, nodeHeight, colGap, rowHeight } = LAYOUT_CONFIG;
        const { rows } = this._currentActMap;
        rows.forEach((rowNodes, rowIndex) => {
            rowNodes.forEach((node: MapNode, colIndex: number) => {
                const nodeInstance = node.nodeInstance
                nodeInstance.setParent(this._nodeLayer);
                nodeInstance.name = node.nodeId; // 节点命名与nodeId一致，方便调试
                const x = colIndex * nodeWidth + colGap * colIndex;
                const y = rowIndex * nodeHeight + rowHeight * rowIndex;
                // 随机偏移量，不要就会显得太过工整了
                const randomXOffset = this.random.nextInt(-30, 30)
                const randomYOffset = this.random.nextInt(-30, 30)
                nodeInstance.setPosition(x + randomXOffset, y + randomYOffset, 0);

                if (rowIndex === rows.length - 1) {
                    // boss节点，让他居中，因为节点的anchor是（0, 0），所以需要偏移一半宽度
                    const midX = this.mapTotalWidth / 2 - nodeWidth / 2;
                    nodeInstance.setPosition(midX, y, 0);
                }
            });
        });
    }

    /**
     * 计算节点【上边中心】坐标，锚点(0, 0)
     * @param node 地图节点数据
     * @returns 世界坐标（相对地图容器）
     */
    private _getNodeTopCenter(mapNode: MapNode): { x: number; y: number } {
        const { nodeWidth, nodeHeight } = LAYOUT_CONFIG;
        const x = mapNode.nodeInstance.position.x + nodeWidth / 2;
        const y = mapNode.nodeInstance.position.y + nodeHeight;
        return { x, y };
    }

    /**
     * 计算节点【底边中心】坐标, 锚点(0, 0)
     * @param node 地图节点数据
     * @returns 世界坐标（相对地图容器）
     */
    private _getNodeBottomCenter(mapNode: MapNode): { x: number; y: number } {
        const { nodeWidth, nodeHeight } = LAYOUT_CONFIG;
        const x = mapNode.nodeInstance.position.x + nodeWidth / 2;
        const y = mapNode.nodeInstance.position.y;
        return { x, y };
    }

    // 可选：节点点击交互示例（根据业务需求添加）
    public onNodeClick(nodeInstance: Node) {
        // todo 后续可实现：节点选中、路径高亮、跳转节点等逻辑
    }
}
