import assign from "./assign";
export default function combineClasses(...classes) {
    const onInitMethods = [];
    class CombinedClass {
        constructor(...args) {
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
        let proto = cls.prototype;
        while (proto !== Object.prototype) {
            Object.getOwnPropertyNames(proto).forEach(name => {
                const descriptor = Object.getOwnPropertyDescriptor(proto, name);
                if (!descriptor)
                    return;
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
    return CombinedClass;
}
const On_Init_Tag = Symbol('OnInit');
export const OnInit = (target, methodName, descriptor) => {
    // 在此执行装饰器的逻辑
    descriptor.value[On_Init_Tag] = true;
};
