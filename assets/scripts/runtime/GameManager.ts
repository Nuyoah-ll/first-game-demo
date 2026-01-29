import { _decorator, Component, Node } from 'cc';
import { TeamManagerInstance } from '../global/TeamManager';
import { Wizard } from '../role/Wizard';
import { Fighter } from '../role/Fighter';
import { GameNode } from '../common/classes/nodes/GameNode';
import { MapManagerInstance } from '../global/MapManager';
import { StaticSingleton } from '../global/StaticSingleton';
import { RoleType } from '../common/constants/role';
import { UIType } from '../common/constants';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    currentLevel: number = 0;
    currentNode: GameNode = null
    onLoad() {
        StaticSingleton.setGameManager(this);
    }

    gameStart() {
        StaticSingleton.UIManager.showUI([UIType.RoleSelectPage])
    }

    gameSetting() {
        // todo 设置页面后面再完善
        StaticSingleton.UIManager.showUI([UIType.SettingPage])
    }

    selectRole(roleType: RoleType) {
        // 初始化队伍
        TeamManagerInstance.initTeam([
            new Fighter(),
        ]);
        // 初始化地图
        const actMaps = MapManagerInstance.initMap(1234123);
        StaticSingleton.MapPage.renderMap(actMaps, this.currentLevel);
        // todo 跳转到地图的界面
        StaticSingleton.UIManager.showUI([UIType.MapPage])
    }
}

