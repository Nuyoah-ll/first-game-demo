import { _decorator, Component, Node } from 'cc';
import { Skill } from './Skill';
import { EntityStatus } from '../constants';
const { ccclass } = _decorator;

export class EntityInfo {
  maxHp: number;
  maxMp: number;
  hp: number;
  mp: number;
  attack: number;
  defense: number;
  speed: number;
  dodge: number;
  criticalRate: number;
  criticalDamage: number;
  skills: Skill[] = [];
  status: EntityStatus
}

@ccclass('Entity')
export class Entity extends Component {
  /** 最大血量 */
  maxHp: number = 0;
  /** 最大蓝量 */
  maxMp: number = 0;
  /** 血量 */
  _hp: number = 0;
  /** 蓝量 */
  _mp: number = 0;
  /** 攻击力 */
  attack: number = 0;
  /** 防御力 */
  defense: number = 0;
  /** 速度 */
  speed: number = 0;
  /** 闪避率 */
  dodge: number = 0;
  /** 暴击率 */
  criticalRate: number = 0; // 浮点数，百分比，比如0.1代表10%
  /** 暴击伤害 */
  criticalDamage: number = 0; // 浮点数，百分比，比如1.5代表150%
  /** 技能 */
  skills: Skill[] = [];
  /** 状态 */
  _status: EntityStatus = EntityStatus.Normal;

  get status(): EntityStatus {
    return this._status;
  }

  set status(value: EntityStatus) {
    this._status = value;
    // todo 修改动画
  }

  set hp(value: number) {
    this._hp = value;
    if (this._hp < 0) {
      this._hp = 0;
      this.status = EntityStatus.Dead;
    }
    if (this._hp > this.maxHp) {
      this._hp = this.maxHp;
    }
  }

  get hp(): number {
    return this._hp;
  }

  init(initRoleInfo: EntityInfo) {
    this.maxHp = initRoleInfo.maxHp;
    this.maxMp = initRoleInfo.maxMp;
    this._hp = initRoleInfo.hp;
    this._mp = initRoleInfo.mp;
    this.attack = initRoleInfo.attack;
    this.defense = initRoleInfo.defense;
    this.speed = initRoleInfo.speed;
    this.dodge = initRoleInfo.dodge;
    this.criticalRate = initRoleInfo.criticalRate;
    this.criticalDamage = initRoleInfo.criticalDamage;
    this.skills = initRoleInfo.skills;
    this._status = initRoleInfo.status;
  }

  // 普通攻击
  public launchAttack(target: Entity) {
    // 闪避判定
    if (Math.random() < target.dodge) {
      console.log('目标闪避成功');
      return;
    }
    // 暴击判定
    if (Math.random() < this.criticalRate) {
      console.log('攻击命中暴击');
    }
    // 基础伤害计算：（攻击力-目标防御力）* （1+暴击伤害） * （目标状态不是防御状态时为1，否则为0.5）
    const damage = (this.attack - target.defense) * (1 + this.criticalDamage) * (target.status !== EntityStatus.Defense ? 1 : 0.5);
    // 血量计算：目标血量-伤害
    target.hp -= damage;
  }

  // 防御姿态
  public launchDefense() {
    this.status = EntityStatus.Defense;
  }

  // 释放技能
  public launchSkill(target: Entity, skill: Skill) {
    // todo: 检查技能是否学会
    // todo: 检查蓝量是否足够
    // todo: 消耗蓝量
    // todo: 执行技能效果
  }
}

