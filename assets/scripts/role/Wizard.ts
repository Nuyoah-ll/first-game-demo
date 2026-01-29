import { _decorator, Component, Node } from 'cc';
import { Role } from '../common/classes/Role';
import { INIT_WIZARD_INFO } from '../common/constants/role';
const { ccclass, property } = _decorator;

@ccclass('Wizard')
export class Wizard extends Role {
    init() {
        super.init(INIT_WIZARD_INFO);
    }
}

