import { _decorator, Component, Node } from 'cc';
import { Role } from '../common/Role';
const { ccclass, property } = _decorator;

@ccclass('Warrior')
export class Warrior extends Role {
    start() {

    }

    update(deltaTime: number) {
        
    }

    public attack(target: Role): void {
        // 闪避判定
        // 暴击判定
        // 伤害计算：（攻击力-目标防御力）* （1+暴击伤害）
        
    }
}

