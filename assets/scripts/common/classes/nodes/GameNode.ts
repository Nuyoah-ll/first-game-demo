import { _decorator, Component, EventTouch, Input } from "cc";
const { ccclass } = _decorator;

@ccclass('GameNode')
export abstract class GameNode extends Component {
  onLoad() {
    this.node.on(Input.EventType.TOUCH_END, this.onNodeTouchEnd, this)
  }

  onNodeTouchEnd() { }
}