export default function combineClasses<T extends NonEmptyArray<Constructor>>(...classes: T): IntersectionOfConstructor<T> & IntersectionOfClassesStatic<T>;
/** 非空数组 */
type NonEmptyArray<T> = [T, ...T[]];
/** 构建函数，match class */
type Constructor = new (...args: any) => any;
/** 静态类型求交 */
type IntersectionOfClassesStatic<T extends any[]> = T extends [infer First, ...infer Rest] ? Omit<First, 'prototype'> & IntersectionOfClassesStatic<Rest> : unknown;
/** 实例类型求交 */
type IntersectionOfClasses<T extends any[]> = T extends [infer First extends abstract new (...args: any) => any, ...infer Rest] ? InstanceType<First> & IntersectionOfClasses<Rest> : unknown;
/** Class类型求交，构造函数以第一个Class的constructor为基准 */
type IntersectionOfConstructor<T extends any[]> = {
    new (...args: ConstructorParameters<T[0]>): IntersectionOfClasses<T>;
};
export {};
