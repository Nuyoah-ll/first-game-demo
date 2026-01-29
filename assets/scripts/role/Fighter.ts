import { _decorator, Component, Node } from 'cc';
import { Role } from '../common/classes/Role';
import { INIT_FIGHTER_INFO } from '../common/constants/role';
const { ccclass, property } = _decorator;

@ccclass('Fighter')
export class Fighter extends Role {
    init() {
        super.init(INIT_FIGHTER_INFO);
    }
}

