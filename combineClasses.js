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
        Object.getOwnPropertyNames(cls.prototype).forEach(name => {
            const descriptor = Object.getOwnPropertyDescriptor(cls.prototype, name);
            if (descriptor) {
                Object.defineProperty(CombinedClass.prototype, name, descriptor);
            }
        });
    });
    Object.assign(CombinedClass, ...classes);
    return CombinedClass;
}
