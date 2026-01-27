import { _decorator, Component, Node } from 'cc';
import { Role } from '../common/Role';
const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
    private _roles: Role[] = [];
    private _enemies: Role[] = [];
    private _actionQueue: Role[] = [];
    private _currentActor: Role | null = null;
    private _currentRound: number = 0;
    private _totalRounds: number = 0;

    init(roles: Role[], enemies: Role[]) {
        this._roles = roles;
        this._enemies = enemies;
        this._currentRound = 1
        this._totalRounds = 1
    }

    initActionQueue() {
        this._actionQueue = [...this._roles, ...this._enemies];
    }
}

