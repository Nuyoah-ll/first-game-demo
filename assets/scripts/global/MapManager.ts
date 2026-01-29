import { BossNode } from "../common/classes/nodes/BossNode";
import { EliteEnemyNode } from "../common/classes/nodes/EliteEnemyNode";
import { EnemyNode } from "../common/classes/nodes/EnemyNode";
import { GameNode } from "../common/classes/nodes/GameNode";
import { RestNode } from "../common/classes/nodes/RestNode";
import { MAP_CONFIG, NodeType } from "../common/constants/map";
import { flattenDeep } from "lodash-es"
import { RockMouse } from "../enemy/RockMouse";
import { BigRockMouse } from "../enemy/BigRockMouse";
import { HugeRockMouse } from "../enemy/HugeRockMouse";
import { SeededRandom } from "../common/utils/SeedRandom";

// 节点结构：包含拓扑信息和连接关系
export interface MapNode {
  nodeId: string;
  row: number;
  col: number;
  type: NodeType;
  prevConnectedNodes: MapNode[]; // 连接的前一层节点
  nextConnectedNodes: MapNode[]; // 连接的后一层节点
  nodeInstance?: GameNode;
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

class MapManager {
  private gameMap: GameMap;
  private random!: SeededRandom;

  constructor(seed?: number) {
    this.gameMap = { seed: 0, actMaps: [] };
    this.initMap(seed || 12345);
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
        const node: MapNode = {
          nodeId,
          row,
          col,
          type: NodeType.Enemy,
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
    console.log(specialNodeTypes, "特殊节点类型")

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
  private createNodeInstance(type: NodeType): GameNode {
    switch (type) {
      case NodeType.Enemy:
        // todo 这里要用随机数算法生成敌人类型
        return new EnemyNode([new RockMouse()]);
      case NodeType.EliteEnemy:
        return new EliteEnemyNode(new BigRockMouse());
      // case NodeType.Store:
      //   return new StoreNode();
      case NodeType.Rest:
        return new RestNode();
      case NodeType.Boss:
        return new BossNode(new HugeRockMouse());
      // case NodeType.Event:
      //   return new EventNode();
      // case NodeType.Treasure:
      //   return new TreasureNode();
      // default:
      //   return new EnemyNode();
    }
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
}

export const MapManagerInstance = new MapManager();
