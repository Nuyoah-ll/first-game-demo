import { Color } from "cc";

/** 地图节点类型 */
export enum NodeType {
  Enemy = 'enemy', //
  EliteEnemy = 'eliteEnemy',
  Rest = 'rest',
  Boss = 'boss',
  // Event = 'event',
  // Treasure = 'treasure',
  // Store = 'store',
}

export enum NodeStatus {
  /** 普通节点 */
  Normal = "Normal",
  /** 可选择节点 */
  Available = "Available",
  /** 高亮节点 */
  Highlight = "Highlight",
  /** 已通过节点 */
  Pass = "Pass",
}

/** 地图最大行索引 */
export const MAX_ROW_INDEX = 14;

/** 地图生成规则相关的配置 */
export const MAP_CONFIG: MapConfig = {
  actCount: 3,
  maxRowIndex: MAX_ROW_INDEX,
  nodeCountPerRow: {
    normalRowMin: 1,
    normalRowMax: 6,
    firstRowMin: 2,
    firstRowMax: 4,
    finalRowMin: 1,
    finalRowMax: 1,
  },
  specialRowNodeLimit: {
    0: NodeType.Enemy,
    [MAX_ROW_INDEX - 1]: NodeType.Rest,
    [MAX_ROW_INDEX]: NodeType.Boss,
  },
  nodeLimit: {
    [NodeType.Enemy]: {
      maxCount: Number.MAX_SAFE_INTEGER,
      disabledRows: [],
      disableConsecutive: false,
    },
    [NodeType.EliteEnemy]: {
      maxCount: 5,
      disabledRows: [0, 1, 2, 3],
      disableConsecutive: true,
    },
    [NodeType.Boss]: {
      maxCount: 1,
      disabledRows: [],
      disableConsecutive: true,
    },
    [NodeType.Rest]: {
      maxCount: 10,
      disabledRows: [],
      disableConsecutive: true,
    },
    // [NodeType.Treasure]: {
    //   maxCount: 5,
    //   disabledRows: [],
    //   disableConsecutive: true,
    // },
    // [NodeType.Store]: {
    //   maxCount: 4,
    //   disabledRows: [],
    //   disableConsecutive: true,
    // },
    // [NodeType.Event]: {
    //   maxCount: 10,
    //   disabledRows: [],
    //   disableConsecutive: false,
    // },

  },
};

export const LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 50,
  nodeHeight: 50,
  colGap: 100,
  rowHeight: 200,
  pathStroke: new Color(102, 102, 102),
  pathWidth: 5,
  pathHoverStroke: new Color(255, 68, 0),
};

export interface LayoutConfig {
  /** 普通节点宽度（与预制体一致） */
  nodeWidth: number;
  /** 普通节点高度（与预制体一致） */
  nodeHeight: number;
  /** 列间距（col索引每+1的x偏移） */
  colGap: number;
  /** 行高（row索引每+1的y偏移） */
  rowHeight: number;
  /** 路径颜色 */
  pathStroke: Color;
  /** 路径宽度 */
  pathWidth: number;
  /** 路径悬浮颜色（可选） */
  pathHoverStroke: Color;
}

/** 地图生成规则相关的配置 */
export interface MapConfig {
  /** 总章节数 */
  actCount: number;
  /** 每章最大行索引 */
  maxRowIndex: number;
  /** 行节点数量配置 */
  nodeCountPerRow: NodeCountPerRow
  /** 特殊行节点类型限制 */
  specialRowNodeLimit: Record<number, NodeType>
  /** 节点分配限制 */
  nodeLimit: Record<NodeType, NodeLimit>
}

interface NodeCountPerRow {
  /** 普通行最小节点数 */
  normalRowMin: number;
  /** 普通行最大节点数 */
  normalRowMax: number;
  /** 首行最小节点数 */
  firstRowMin: number;
  /** 首行最大节点数 */
  firstRowMax: number;
  /** 最后一行最小节点数 */
  finalRowMin: number;
  /** 最后一行最大节点数 */
  finalRowMax: number;
}

interface NodeLimit {
  /** 每层最大数量 */
  maxCount: number;
  /** 每层禁用行索引 */
  disabledRows: number[];
  /** 禁止连续两个节点同时出现 */
  disableConsecutive: boolean;
}





