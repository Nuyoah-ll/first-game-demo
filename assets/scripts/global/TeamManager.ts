import { Role } from "../common/classes/Role";
import { Singleton } from "../common/classes/Singleton";

class TeamManager extends Singleton {
  teams: Role[]

  private constructor() {
    super();
  }

  public static getInstance<T>(): T {
    return super.getInstance<T>();
  }

  initTeam(teams: Role[]) {
    this.teams = teams;
  }
}

export const TeamManagerInstance = TeamManager.getInstance<TeamManager>();