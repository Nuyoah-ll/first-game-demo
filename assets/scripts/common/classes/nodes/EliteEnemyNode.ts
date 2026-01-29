import { EventManagerInstance } from "../../../runtime/EventManager";
import { GameNode } from "./GameNode";
import { EventName } from "../../constants/event";
import { _decorator } from "cc";
import { Boss } from "../Boss";
import { EliteEnemy } from "../EliteEnemy";

const { ccclass } = _decorator;
@ccclass('EliteEnemyNode')
export class EliteEnemyNode extends GameNode {
  constructor(private eliteEnemy: EliteEnemy) {
    super();
  }
  onLoad() {
    super.onLoad();
  }

  // 当点击该节点后，触发战斗事件
  onNodeTouchEnd() {
    EventManagerInstance.emit(EventName.EliteBattle, this)
  }
}