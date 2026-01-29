import { EntityStatus } from "./index";
import { EntityInfo } from "../classes/Entity";

export const ROCK_MOUSE: EntityInfo = {
  maxHp: 30,
  maxMp: 10,
  hp: 30,
  mp: 10,
  attack: 5,
  defense: 5,
  speed: 30,
  dodge: 0,
  criticalRate: 0,
  criticalDamage: 0,
  skills: [],
  status: EntityStatus.Normal,
}

export const BIG_ROCK_MOUSE: EntityInfo = {
  maxHp: 50,
  maxMp: 20,
  hp: 50,
  mp: 20,
  attack: 10,
  defense: 7,
  speed: 50,
  dodge: 0,
  criticalRate: 0,
  criticalDamage: 0,
  skills: [],
  status: EntityStatus.Normal,
}

export const HUGE_ROCK_MOUSE: EntityInfo = {
  maxHp: 100,
  maxMp: 40,
  hp: 100,
  mp: 40,
  attack: 20,
  defense: 14,
  speed: 80,
  dodge: 0,
  criticalRate: 0,
  criticalDamage: 0,
  skills: [],
  status: EntityStatus.Normal,
}