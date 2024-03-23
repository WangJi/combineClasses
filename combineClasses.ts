import assign, { copyStaticMethods, copyProperties, copyStaticProperties } from "./assign";

export default function combineClasses<T extends NonEmptyArray<Constructor>>(...classes: T) {
    const onInitMethods: string[] = [];

    class CombinedClass {
        constructor(...args: any[]) {
            classes.forEach(cls => {
                const instance = new cls(...args);
                // copy properties，但是拒绝复制undefined
                assign(this, instance);

            });
            // call onInit methods
            onInitMethods.forEach(name => {
                this[name]();
            });
        }
    }

    classes.forEach(cls => {
        copyStaticMethods(CombinedClass, cls);
        copyStaticProperties(CombinedClass, cls);
        const list = copyProperties(CombinedClass.prototype, cls.prototype);
        list.forEach(([name, descriptor]) => {
            const method = descriptor?.value;
            if (method && method[On_Init_Tag]) {
                onInitMethods.push(name);
            }
        });
    });
    return CombinedClass as IntersectionOfConstructor<T> & IntersectionOfClassesStatic<T>;
}

const On_Init_Tag = Symbol('OnInit');


export const OnInit = (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    // 在此执行装饰器的逻辑
    descriptor.value[On_Init_Tag] = true;
};
/** 非空数组 */
type NonEmptyArray<T> = [T, ...T[]]

/** 构建函数，match class */
type Constructor = new (...args: any) => any;

/** 静态类型求交 */
type IntersectionOfClassesStatic<T extends any[]> = T extends [infer First, ...infer Rest]
    ? Omit<First, 'prototype'> & IntersectionOfClassesStatic<Rest>
    : unknown;

/** 实例类型求交 */
type IntersectionOfClasses<T extends any[]> = T extends [infer First extends abstract new (...args: any) => any, ...infer Rest]
    ? InstanceType<First> & IntersectionOfClasses<Rest>
    : unknown;

/** Class类型求交，构造函数以第一个Class的constructor为基准 */
type IntersectionOfConstructor<T extends any[]> = {
    new(...args: ConstructorParameters<T[0]>): IntersectionOfClasses<T>
};

