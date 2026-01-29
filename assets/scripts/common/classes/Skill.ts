import { _decorator } from 'cc';
import { Debuff } from './Debuff';

export abstract class Skill {
  name: string;
  mpCost: number;
  damage: number;
  // 伤害范围
  damageRange: number;
  // debuff 效果
  debuffs: Debuff[];
}

