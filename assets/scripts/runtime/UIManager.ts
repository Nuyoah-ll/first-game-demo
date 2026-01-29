import { _decorator, Button, Component, EventHandler, instantiate, Label, Layout, Prefab, Node } from 'cc';
import { UIType } from '../common/constants';
import { UIBase } from '../common/classes/ui/UIBase';
import { StaticSingleton } from '../global/StaticSingleton';
import { HomePage } from '../ui/HomePage';
import { RoleSelectPage } from '../ui/RoleSelectPage';
import { SettingPage } from '../ui/SettingPage';
import { MapPage } from '../ui/MapPage';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Prefab)
    homePagePrefab: Prefab | null = null;

    @property(Prefab)
    roleSelectPagePrefab: Prefab | null = null;

    @property(Prefab)
    settingPagePrefab: Prefab | null = null;

    @property(Prefab)
    mapPagePrefab: Prefab | null = null;

    uiMap: Map<UIType, UIBase> = new Map();

    protected onLoad(): void {
        StaticSingleton.setUIManager(this);
        this.initHomePage();
        this.initRoleSelectPage();
        this.initSettingPage();
        this.initMapPage();
    }

    initHomePage() {
        const homePageNode = instantiate(this.homePagePrefab);
        homePageNode.parent = this.node;
        this.uiMap.set(UIType.HomePage, homePageNode.getComponent(HomePage))
    }

    initRoleSelectPage() {
        const roleSelectPageNode = instantiate(this.roleSelectPagePrefab);
        roleSelectPageNode.parent = this.node;
        this.uiMap.set(UIType.RoleSelectPage, roleSelectPageNode.getComponent(RoleSelectPage))
    }

    initSettingPage() {
        const settingPageNode = instantiate(this.settingPagePrefab);
        settingPageNode.parent = this.node;
        this.uiMap.set(UIType.SettingPage, settingPageNode.getComponent(SettingPage))
    }

    initMapPage() {
        const mapPageNode = instantiate(this.mapPagePrefab);
        mapPageNode.parent = this.node;
        this.uiMap.set(UIType.MapPage, mapPageNode.getComponent(MapPage))
    }

    showUI(types: UIType[], hideOthers = true) {
        this.uiMap.forEach((node, uiType) => {
            console.log(types, uiType)
            if (types.includes(uiType)) {
                node.show();
            } else if (hideOthers) {
                node.hide();
            }
        })
    }

    hideUI(types: UIType[]) {
        this.uiMap.forEach((node, uiType) => {
            if (types.includes(uiType)) {
                node.hide();
            }
        })
    }
}

