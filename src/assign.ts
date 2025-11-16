import type { Constructor } from './types';

export function assignInstanceProperties(target: object, source: object) {
  const descriptors = Object.getOwnPropertyDescriptors(source);

  Object.entries(descriptors).forEach(([key, descriptor]) => {
    if (key === '__proto__' || key === 'constructor') return;
    if (!descriptor) return;

    // Preserve getters/setters and avoid overwriting with undefined values
    if ('value' in descriptor && typeof descriptor.value === 'undefined') return;

    Object.defineProperty(target, key, descriptor);
  });
}

export function copyStaticMembers(
  target: Constructor,
  source: Constructor,
  seenNames: Set<string>,
  warn: (message: string) => void,
) {
  const descriptors = Object.getOwnPropertyDescriptors(source);

  Object.entries(descriptors).forEach(([name, descriptor]) => {
    if (!descriptor) return;
    if (['prototype', 'length', 'name'].includes(name)) return;

    if (seenNames.has(name)) {
      warn(`Static member \\"${name}\\" is being overwritten while merging classes.`);
    }

    seenNames.add(name);
    Object.defineProperty(target, name, descriptor);
  });
}

export function copyInstanceMembers(
  target: object,
  source: object,
  seenNames: Set<string>,
  warn: (message: string) => void,
) {
  const descriptorList: Array<[string, PropertyDescriptor]> = [];
  let proto = source;

  while (proto && proto !== Object.prototype) {
    Object.getOwnPropertyNames(proto).forEach((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      if (!descriptor) return;
      if (name === 'constructor') return;

      if (seenNames.has(name)) {
        warn(`Instance member \\"${name}\\" is being overwritten while merging classes.`);
      }

      seenNames.add(name);
      Object.defineProperty(target, name, descriptor);
      descriptorList.push([name, descriptor]);
    });

    proto = Object.getPrototypeOf(proto);
  }

  return descriptorList;
}
