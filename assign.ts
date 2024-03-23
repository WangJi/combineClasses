export default function assign(target: Object, obj: Object) {
    Object.keys(obj).forEach(key => {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] !== 'undefined') {
                target[key] = obj[key];
            }
        }
    });
}

export function copyStaticMethods(source: new (...args: any) => any, cls: new (...args: any) => any) {
    let currentCls = cls;
    // 递归地沿着原型链向上查找，直到Object
    while (currentCls !== Function.prototype) {
        // 获取所有自有属性名（包括不可枚举的）
        let ownProps = Object.getOwnPropertyNames(currentCls);
        ownProps.forEach(prop => {
            const descriptor = Object.getOwnPropertyDescriptor(currentCls, prop);
            if (typeof descriptor.value === 'function' &&
                prop !== 'prototype' &&
                prop !== 'name' &&
                prop !== 'length' &&
                prop !== 'constructor') {
                Object.defineProperty(source, prop, descriptor);
            }
        })
        // 上移一级到原型链中的下一个构造函数
        currentCls = Object.getPrototypeOf(currentCls);
    }
}

export function copyStaticProperties<T extends Object>(target: T, source: T) {
    Object.assign(target, source);
}

export function copyProperties<T extends Object>(target: T, source: T) {
    let descriptorList = []
    let proto = source;
    while (proto !== Object.prototype) {
        Object.getOwnPropertyNames(proto).forEach(name => {
            const descriptor = Object.getOwnPropertyDescriptor(proto, name);
            if (!descriptor) return;
            Object.defineProperty(target, name, descriptor);
            descriptorList.push([name, descriptor]);
        });
        proto = Object.getPrototypeOf(proto);
    }
    return descriptorList;
}