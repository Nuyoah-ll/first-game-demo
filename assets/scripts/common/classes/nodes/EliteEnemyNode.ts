import { EventManagerInstance } from "../../../runtime/EventManager";
import { GameNode } from "./GameNode";
import { EventName } from "../../constants/event";
import { _decorator } from "cc";
import { Boss } from "../Boss";
import { EliteEnemy } from "../EliteEnemy";

const { ccclass } = _decorator;
@ccclass('EliteEnemyNode')
export class EliteEnemyNode extends GameNode {
  private eliteEnemy: EliteEnemy
  
  onLoad() {
    super.onLoad();
  }

  // 当点击该节点后，触发战斗事件
  onNodeTouchEnd() {
    EventManagerInstance.emit(EventName.EliteBattle, this)
  }

  setEliteEnemy(eliteEnemy: EliteEnemy) {
    this.eliteEnemy = eliteEnemy;
  }
}