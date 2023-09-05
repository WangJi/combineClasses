export default function combineClasses<T extends NonEmptyArray<Constructor>>(...classes: T) {
    const onInitMethods: string[] = [];

    class CombinedClass {
        constructor(...args: any[]) {
            classes.forEach(cls => {
                const instance = new cls(...args);
                // copy properties
                Object.assign(this, instance);

            });
            // call onInit methods
            onInitMethods.forEach(name => {
                this[name]();
            });
        }
    }

    classes.forEach(cls => {
        let proto = cls.prototype;
        while (proto !== Object.prototype) {
            Object.getOwnPropertyNames(proto).forEach(name => {
                const descriptor = Object.getOwnPropertyDescriptor(proto, name);
                if (!descriptor) return;
                Object.defineProperty(CombinedClass.prototype, name, descriptor);
                const method = descriptor?.value;
                // 检查方法是否具有 OnInit 装饰器
                if (method && method[On_Init_Tag]) {
                    onInitMethods.push(name);
                }
            });
            proto = Object.getPrototypeOf(proto);
        }
    });

    Object.assign(CombinedClass, ...classes);

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
type IntersectionOfConstructor<T extends any[]> = { new(...args: ConstructorParameters<T[0]>): IntersectionOfClasses<T> };

