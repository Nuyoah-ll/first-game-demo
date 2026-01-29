import { EliteEnemy } from "../common/classes/EliteEnemy";
import { BIG_ROCK_MOUSE } from "../common/constants/enemy";

export class BigRockMouse extends EliteEnemy {
  init() {
    super.init(BIG_ROCK_MOUSE);
  }
}