import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIBase')
export class UIBase extends Component {
    @property({ displayName: '初始是否展示' })
    isDisplayInit = false;

    protected onLoad(): void {
        this.isDisplayInit ? this.show() : this.hide();
    }

    show() {
        this.node.active = true
    }

    hide() {
        this.node.active = false
    }
}

