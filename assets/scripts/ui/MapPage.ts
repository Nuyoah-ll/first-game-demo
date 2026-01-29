import { _decorator, Graphics, instantiate, Prefab, UITransform, Node, Vec3, ScrollView } from 'cc';
import { UIBase } from '../common/classes/ui/UIBase';
import { LAYOUT_CONFIG, NodeType } from '../common/constants/map';
import { ActMap, MapNode } from '../global/MapManager';
import { StaticSingleton } from '../global/StaticSingleton';
const { ccclass, property } = _decorator;

@ccclass('MapPage')
export class MapPage extends UIBase {
    @property({ type: Prefab, tooltip: '普通怪物节点预制体' })
    public enemyPrefab: Prefab = null!;
    @property({ type: Prefab, tooltip: '精英怪物节点预制体' })
    public eliteEnemyPrefab: Prefab = null!;
    @property({ type: Prefab, tooltip: '休息点节点预制体' })
    public restPrefab: Prefab = null!;
    @property({ type: Prefab, tooltip: 'BOSS节点预制体' })
    public bossPrefab: Prefab = null!;

    private _graphics: Graphics = null!; // 路径绘制组件
    private _nodeLayer: Node = null!;    // 节点层（层级高于路径，避免遮挡）
    private _prefabMap: Map<NodeType, Prefab> = new Map(); // 预制体映射表
    private _currentActMap: ActMap = null!; // 当前渲染的章节地图

    protected onLoad(): void {
        super.onLoad();
        StaticSingleton.setMapPage(this);
        this._initRenderer();
    }

    /**
     * 初始化渲染器：创建路径层、节点层、预制体映射
     */
    private _initRenderer() {
        // 1.获取scrollView
        const scrollViewContent = this.node.getChildByPath("ScrollView/view/content")

        // 2.创建地图容器
        const mapContainer = new Node("MapContainer")
        mapContainer.addComponent(UITransform);
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

        // 4. 构建预制体映射表（将编辑器拖入的预制体与 NodeType 关联）
        this._prefabMap.set(NodeType.Enemy, this.enemyPrefab);
        this._prefabMap.set(NodeType.EliteEnemy, this.eliteEnemyPrefab);
        this._prefabMap.set(NodeType.Rest, this.restPrefab);
        this._prefabMap.set(NodeType.Boss, this.bossPrefab);
        // this._prefabMap.set(NodeType.Event, this.eventPrefab);
        // this._prefabMap.set(NodeType.Treasure, this.treasurePrefab);
        // this._prefabMap.set(NodeType.Rest, this.restPrefab);
        // this._prefabMap.set(NodeType.Store, this.storePrefab);

        // const uiTransform = this.node.getComponent(UITransform)

        // // 4. 地图容器锚点：左上角（方便从左上开始布局，可选）
        // uiTransform.anchorX = 0;
        // uiTransform.anchorY = 1;
        // this.node.position = new Vec3(50, -50, 0); // 场景内偏移，避免贴边
    }

    /**
     * 对外暴露：渲染地图核心方法
     * @param actMaps MapManager 生成的全局地图数据
     * @param actIndex 要渲染的章节索引（0/1/2）
     */
    public renderMap(actMaps: ActMap[], actIndex: number = 0) {
        // 1. 校验数据
        const targetAct = actMaps[actIndex];
        if (!targetAct) {
            console.error(`MapRenderer: 章节${actIndex}无地图数据`);
            return;
        }
        this._currentActMap = targetAct;

        // 2. 清空原有内容（避免重复渲染）
        this._clearAll();

        // 3. 先绘制路径（路径层在下层，不遮挡节点）
        this._drawAllPaths();

        // 4. 再生成所有地图节点（按 row/col 索引定位）
        this._generateAllNodes();
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
                    const { x: x1, y: y1 } = this._getNodeBottomCenter(node);
                    // 计算下层节点：上边中心坐标（x2, y2）（锚点(0.5,0)，节点position就是上边中心）
                    const { x: x2, y: y2 } = this._getNodeTopCenter(nextNode);
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
        const { rows } = this._currentActMap;
        console.log(rows, this._prefabMap, "试一下")
        rows.forEach((rowNodes, rowIndex) => {
            rowNodes.forEach((node: MapNode) => {
                // 1. 获取当前节点类型的预制体
                const prefab = this._prefabMap.get(node.type);
                if (!prefab) {
                    console.error(`MapRenderer: 无${node.type}对应的预制体`);
                    return;
                }

                // 2. 实例化预制体，设置父节点为节点层
                const nodeInstance = instantiate(prefab);
                nodeInstance.parent = this._nodeLayer;
                nodeInstance.name = node.nodeId; // 节点命名与nodeId一致，方便调试

                // 3. 按 row/col 计算节点位置（锚点(0.5,0)，此坐标为上边中心）
                const { x, y } = this._getNodeTopCenter(node);
                console.log(x, y, "node节点位置")
                nodeInstance.setPosition(x, y, 0);
            });
        });
    }

    /**
     * 计算节点【上边中心】坐标（锚点(0.5,0)，与节点position一致）
     * @param node 地图节点数据
     * @returns 世界坐标（相对地图容器）
     */
    private _getNodeTopCenter(node: MapNode): { x: number; y: number } {
        const { nodeWidth, colGap, rowHeight } = LAYOUT_CONFIG;
        // x = col * (节点宽度 + 列间距)
        const x = node.col * (nodeWidth + colGap);
        // y = row * 行高（锚点(0.5,0)，y为节点上边的y坐标）
        const y = node.row * rowHeight;
        return { x, y };
    }

    /**
     * 计算节点【底边中心】坐标（路径起始点）
     * @param node 地图节点数据
     * @returns 世界坐标（相对地图容器）
     */
    private _getNodeBottomCenter(node: MapNode): { x: number; y: number } {
        const { nodeHeight } = LAYOUT_CONFIG;
        const topCenter = this._getNodeTopCenter(node);
        // 底边中心y = 上边中心y + 节点高度
        const y = topCenter.y + nodeHeight;
        return { x: topCenter.x, y };
    }

    // 可选：节点点击交互示例（根据业务需求添加）
    public onNodeClick(nodeInstance: Node) {
        // todo 后续可实现：节点选中、路径高亮、跳转节点等逻辑
    }
}
