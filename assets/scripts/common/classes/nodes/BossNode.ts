import { EventManagerInstance } from "../../../runtime/EventManager";
import { GameNode } from "./GameNode";
import { EventName } from "../../constants/event";
import { _decorator } from "cc";
import { Boss } from "../Boss";

const { ccclass, property } = _decorator;
@ccclass('BossNode')
export class BossNode extends GameNode {
  private boss: Boss;

  constructor() {
    super();
  }

  onLoad() {
    super.onLoad();
  }

  // 当点击该节点后，触发战斗事件
  onNodeTouchEnd() {
    EventManagerInstance.emit(EventName.Battle, this)
  }

  setBoss(boss: Boss) {
    this.boss = boss;
  }
}