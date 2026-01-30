import { _decorator, Component, Node, UITransform, Vec3 } from "cc";
const { ccclass } = _decorator;

@ccclass('GameNode')
export class GameNode extends Component {
  onLoad() {
    console.log("触发绑定事件了吗？")
    this.node.on(Node.EventType.MOUSE_ENTER, this.onNodeMouseEnter, this)
    this.node.on(Node.EventType.MOUSE_LEAVE, this.onNodeMouseLeave, this)
  }

  onNodeMouseEnter() {
    this.node.scale = new Vec3(1.2, 1.2, 0)
  }

  onNodeMouseLeave() {
    this.node.scale = new Vec3(1, 1, 1)
  }
}