import { _decorator, Component, Node, tween } from 'cc';
import { UIBase } from '../common/classes/ui/UIBase';
import { bindTouchEvent } from '../common/utils';
import { StaticSingleton } from '../global/StaticSingleton';
const { ccclass, property } = _decorator;

@ccclass('HomePage')
export class HomePage extends UIBase {
    @property({ type: Node, displayName: '开始游戏按钮' })
    startGameButton: Node | null = null;

    @property({ type: Node, displayName: '设置按钮' })
    settingButton: Node | null = null;

    protected onLoad(): void {
        super.onLoad();
        this.addEventListenerForButton();
    }

    addEventListenerForButton() {
        bindTouchEvent(this.startGameButton, {
            end: () => StaticSingleton.GameManager.gameStart()
        }, this)

        bindTouchEvent(this.settingButton, {
            end: () => StaticSingleton.GameManager.gameSetting()
        }, this)
    }
}
