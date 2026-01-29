import { Enemy } from "../common/classes/Enemy";
import { Singleton } from "../common/classes/Singleton";

class EnemyManager extends Singleton {
  teams: Enemy[]

  private constructor() {
    super();
  }

  public static getInstance<T>(): T {
    return super.getInstance<T>();
  }

  initTeam(teams: Enemy[]) {
    this.teams = teams;
  }
}

export const EnemyManagerInstance = EnemyManager.getInstance<EnemyManager>();