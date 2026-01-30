import { EventTouch, Node, Tween, tween, Vec3 } from "cc"

export function bindTouchEvent(node: Node, handlers: {
  start?: (event: EventTouch) => any,
  move?: (event: EventTouch) => any,
  end?: (event: EventTouch) => any,
  cancel?: (event: EventTouch) => any,
}, thisArg?: any, scale = true) {
  node.on(Node.EventType.TOUCH_START, (e) => {
    if (scale) {
      Tween.stopAllByTarget(node)
      tween(node).to(0.1, { scale: new Vec3(0.9, 0.9, 0.9) }).start()
    }
    handlers?.start?.call(thisArg, e)
  }, thisArg)
  node.on(Node.EventType.TOUCH_MOVE, (e: EventTouch) => {
    handlers?.move?.call(thisArg, e)
  }, thisArg)
  node.on(Node.EventType.TOUCH_END, (e) => {
    if (scale) {
      Tween.stopAllByTarget(node)
      tween(node).to(0.1, { scale: new Vec3(1, 1, 1) }).start()
    }
    handlers?.end?.call(thisArg, e)
  }, thisArg)
  node.on(Node.EventType.TOUCH_CANCEL, (e) => {
    if (scale) {
      Tween.stopAllByTarget(node)
      tween(node).to(0.1, { scale: new Vec3(1, 1, 1) }).start()
    }
    handlers?.cancel?.call(thisArg, e)
  }, thisArg)
}


export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}