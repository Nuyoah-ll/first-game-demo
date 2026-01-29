import { _decorator, Component, Node, tween } from 'cc';
import { UIBase } from '../common/classes/ui/UIBase';
import { bindTouchEvent } from '../common/utils';
import { StaticSingleton } from '../global/StaticSingleton';
const { ccclass, property } = _decorator;

@ccclass('MapPage')
export class MapPage extends UIBase {
    protected onLoad(): void {
        super.onLoad();
    }
}
