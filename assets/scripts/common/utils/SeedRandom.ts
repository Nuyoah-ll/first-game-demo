/**
 * 伪随机数生成器（保证相同种子输出一致，替代Math.random）
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  /**
   * 生成0-1之间的伪随机数
   * @returns 随机数（0 <= x < 1）
   */
  next(): number {
    return (this.seed = (this.seed * 16807) % 2147483647) / 2147483647;
  }

  /**
   * 生成指定范围的整数 [min, max]
   * @param min 最小值（包含）
   * @param max 最大值（包含）
   * @returns 随机整数
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * 从数组中随机选一个元素
   * @param arr 待选择的数组
   * @returns 随机选中的元素
   */
  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }

  /**
  * 数组洗牌（Fisher-Yates算法）
  * @param arr 待洗牌的数组
  * @returns 洗牌后的新数组（不修改原数组，仅浅拷贝原数组，如果是数组元素使引用类型，那么在新数组里修改元素，则会导致原数组里的元素也会改变）
  */
  shuffle<T>(arr: T[]): T[] {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }
}