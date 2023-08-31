export default function combineClasses(...classes) {
    class CombinedClass {
        constructor(...args) {
            classes.forEach(cls => {
                const instance = new cls(...args);
                Object.assign(this, instance);
            });
        }
    }
    classes.forEach(cls => {
        let proto = cls.prototype;
        while (proto !== Object.prototype) {
            Object.getOwnPropertyNames(proto).forEach(name => {
                const descriptor = Object.getOwnPropertyDescriptor(proto, name);
                if (descriptor) {
                    Object.defineProperty(CombinedClass.prototype, name, descriptor);
                }
            });
            proto = Object.getPrototypeOf(proto);
        }
    });
    Object.assign(CombinedClass, ...classes);
    return CombinedClass;
}
