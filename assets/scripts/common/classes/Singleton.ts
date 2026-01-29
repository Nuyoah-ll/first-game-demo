/**
 * TypeScript 通用单例基类
 * @template T - 子类类型
 */
export abstract class Singleton {
  // 静态私有属性，存储唯一实例
  private static instance: any;

  /**
   * 获取单例实例（核心方法）
   * @param constructor - 子类的构造函数
   * @returns 子类的唯一实例
   */
  protected static getInstance<T>(this: new () => T): T {
    // 检查实例是否已存在，不存在则创建
    if (!Singleton.instance) {
      Singleton.instance = new this();
    }
    return Singleton.instance;
  }

  // 保护构造函数，防止外部直接 new（子类需继承此约束）
  protected constructor() {
    // 防止通过 Reflect.construct 绕过单例（可选的安全校验）
    if (Singleton.instance) {
      throw new Error("该类已实现单例模式，请勿重复实例化！");
    }
  }
}