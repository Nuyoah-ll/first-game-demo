import { _decorator, Component, Node, tween } from 'cc';
import { UIBase } from '../common/classes/ui/UIBase';
import { bindTouchEvent } from '../common/utils';
import { StaticSingleton } from '../global/StaticSingleton';
import { Role } from '../common/classes/Role';
const { ccclass, property } = _decorator;

@ccclass('BattlePage')
export class BattlePage extends UIBase {
    private _roles: Role[] = [];
    private _enemies: Role[] = [];
    private _actionQueue: Role[] = [];
    private _currentActor: Role | null = null;
    private _currentRound: number = 0;

    protected onLoad(): void {
        super.onLoad();
        this.addEventListenerForButton();
    }

    addEventListenerForButton() {
        // todo
    }

    initActionQueue() {
        // todo 先写死为角色先行动，后面基于速度决定排序
        this._actionQueue = [...this._roles, ...this._enemies];
    }
}
