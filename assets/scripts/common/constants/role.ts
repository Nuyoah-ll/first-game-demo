import { EntityStatus } from "./index";
import { EntityInfo } from "../classes/Entity";

export enum RoleType {
  Fighter = "Fighter",
  Wizard = "Wizard",
}

export const INIT_FIGHTER_INFO: EntityInfo = {
  maxHp: 100,
  maxMp: 30,
  hp: 100,
  mp: 30,
  attack: 10,
  defense: 3,
  speed: 100,
  dodge: 0.3,
  criticalRate: 0.1,
  criticalDamage: 0.5,
  skills: [],
  status: EntityStatus.Normal,
}

export const INIT_WIZARD_INFO: EntityInfo = {
  maxHp: 50,
  maxMp: 100,
  hp: 50,
  mp: 100,
  attack: 6,
  defense: 0,
  speed: 80,
  dodge: 0.1,
  criticalRate: 0,
  criticalDamage: 0,
  skills: [],
  status: EntityStatus.Normal,
}