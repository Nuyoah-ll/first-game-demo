import { Boss } from "../common/classes/Boss";
import { HUGE_ROCK_MOUSE } from "../common/constants/enemy";

export class HugeRockMouse extends Boss {
  init() {
    super.init(HUGE_ROCK_MOUSE);
  }
}