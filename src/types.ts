export type NonEmptyArray<T> = [T, ...T[]];
export type Constructor<T = any> = new (...args: any[]) => T;

export type IntersectionOfClassesStatic<T extends any[]> = T extends [infer First, ...infer Rest]
  ? Omit<First, 'prototype'> & IntersectionOfClassesStatic<Rest>
  : unknown;

export type IntersectionOfClasses<T extends any[]> = T extends [
  infer First extends abstract new (...args: any) => any,
  ...infer Rest,
]
  ? InstanceType<First> & IntersectionOfClasses<Rest>
  : unknown;

export type IntersectionOfConstructor<T extends any[]> = {
  new (...args: ConstructorParameters<T[0]>): IntersectionOfClasses<T>;
};
