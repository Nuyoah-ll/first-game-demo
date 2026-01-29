import { Enemy } from "../common/classes/Enemy";
import { ROCK_MOUSE } from "../common/constants/enemy";

export class RockMouse extends Enemy {
  init() {
    super.init(ROCK_MOUSE);
  }
}