import { _decorator, Component, Node } from 'cc';
import { Entity } from './Entity';
const { ccclass } = _decorator;

@ccclass('EliteEnemy')
export class EliteEnemy extends Entity {
  // 行动前
  beforeAction() { }

  // 执行动作
  performAction() { }

  // 行动后
  afterAction() { }

  // 回合开始前
  beforeRound() { }

  // 回合结束后
  afterRound() { }
}

