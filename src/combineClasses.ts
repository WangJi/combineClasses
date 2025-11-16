import { assignInstanceProperties, copyInstanceMembers, copyStaticMembers } from './assign';
import type {
  Constructor,
  IntersectionOfClassesStatic,
  IntersectionOfConstructor,
  NonEmptyArray,
} from './types';

const ON_INIT_TAG = Symbol('OnInit');
const warningPrefix = '[partial_classes]';

const warn = (message: string) => {
  // eslint-disable-next-line no-console
  console.warn(`${warningPrefix} ${message}`);
};

export default function combineClasses<T extends NonEmptyArray<Constructor>>(...classes: T) {
  const onInitMethods: string[] = [];
  const seenStaticNames = new Set<string>();
  const seenInstanceNames = new Set<string>();

  const [firstClass, ...restClasses] = classes;
  restClasses.forEach((cls, index) => {
    if (cls.length !== firstClass.length) {
      warn(
        `Constructor parameter length mismatch between ${firstClass.name || 'Class1'} ` +
          `and ${cls.name || `Class${index + 2}`} (${firstClass.length} vs ${cls.length}). ` +
          'Only the first constructor signature will be reflected in the combined class.',
      );
    }
  });

  class CombinedClass {
    constructor(...args: any[]) {
      classes.forEach((cls) => {
        const instance = new cls(...args);
        assignInstanceProperties(this, instance);
      });

      onInitMethods.forEach((name) => {
        const method = (this as Record<string, any>)[name];
        if (typeof method === 'function') {
          method.call(this);
        }
      });
    }
  }

  classes.forEach((cls) => {
    copyStaticMembers(CombinedClass, cls, seenStaticNames, warn);
    const descriptorList = copyInstanceMembers(CombinedClass.prototype, cls.prototype, seenInstanceNames, warn);

    descriptorList.forEach(([name, descriptor]) => {
      const method = descriptor?.value;
      if (typeof method === 'function' && method[ON_INIT_TAG]) {
        onInitMethods.push(name);
      }
    });
  });

  return CombinedClass as IntersectionOfConstructor<T> & IntersectionOfClassesStatic<T>;
}

export const OnInit: MethodDecorator = (_target, _propertyKey, descriptor) => {
  if (descriptor?.value) {
    (descriptor.value as Record<symbol, boolean>)[ON_INIT_TAG] = true;
  }
};
