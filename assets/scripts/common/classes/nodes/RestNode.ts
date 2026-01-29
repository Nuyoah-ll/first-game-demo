import { EventManagerInstance } from "../../../runtime/EventManager";
import { GameNode } from "./GameNode";
import { EventName } from "../../constants/event";
import { _decorator } from "cc";
import { Boss } from "../Boss";

const { ccclass } = _decorator;
@ccclass('RestNode')
export class RestNode extends GameNode {
  constructor() {
    super();
  }
  onLoad() {
    super.onLoad();
  }

  onNodeTouchEnd() {
    EventManagerInstance.emit(EventName.Rest, this)
  }
}