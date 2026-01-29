import { _decorator, Component, Node, tween } from 'cc';
import { UIBase } from '../common/classes/ui/UIBase';
import { bindTouchEvent } from '../common/utils';
import { StaticSingleton } from '../global/StaticSingleton';
import { RoleType } from '../common/constants/role';
const { ccclass, property } = _decorator;

@ccclass('RoleSelectPage')
export class RoleSelectPage extends UIBase {
    @property({ type: Node, displayName: '战士按钮' })
    fighterButton: Node | null = null;

    @property({ type: Node, displayName: '法师按钮' })
    wizardButton: Node | null = null;

    protected onLoad(): void {
        super.onLoad();
        this.addEventListenerForButton();
    }

    addEventListenerForButton() {
        bindTouchEvent(this.fighterButton, {
            end: () => StaticSingleton.GameManager.selectRole(RoleType.Fighter)
        }, this)

        bindTouchEvent(this.wizardButton, {
            end: () => StaticSingleton.GameManager.selectRole(RoleType.Wizard)
        }, this)
    }
}
