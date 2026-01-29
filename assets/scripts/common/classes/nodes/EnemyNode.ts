import { EventManagerInstance } from "../../../runtime/EventManager";
import { Enemy } from "../Enemy";
import { GameNode } from "./GameNode";
import { EventName } from "../../constants/event";
import { _decorator } from "cc";

const { ccclass } = _decorator;
@ccclass('EnemyNode')
export class EnemyNode extends GameNode {
  // 在节点初始化的时候，怪物种类就确认了
  constructor(private enemyTeams: Enemy[]) {
    super();
  }
  onLoad() {
    super.onLoad();
  }

  // 当点击该节点后，触发战斗事件
  onNodeTouchEnd() {
    EventManagerInstance.emit(EventName.Battle, this)
  }
}