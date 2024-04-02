### What Does It Do?
This package provides a utility function that allows you to write code in multiple partial classes and then combine them into a single class with full type support, similar to the experience of writing C# partial classes.

### Quick Look

```typescript
import combineClasses from "partial_classes";
import BigClassPart1 from './BigClassPart1'
import BigClassPart2 from './BigClassPart2'
const BigClass = combineClasses(BigClassPart1, BigClassPart2)
const instance = new BigClass()
// instance now has all the props defined in 2 above classes 
// with Type Inference Support 
```

### Supported Features
| Feature                      | Supported |
|------------------------------|-----------|
| Constructor                  | ✔️        |
| Static Property              | ✔️        |
| Static Method                | ✔️        |
| Class Field                  | ✔️        |
| Instance Property            | ✔️        |
| Instance Method              | ✔️        |
| Getter&Setter Method         | ✔️        |
| Constructor Conflict Warning | ❌         |
| Member OverWrite Warning     | ❌         |

> We assume all the Constructors should have identical signatures, and only **First Constructor's Signature** will be used in the final constructor.

### Why Not Use Typescript applyMixins, Object.assign, or Class Inheritance?
+ Typescript applyMixins and Object.assign can combine class constructors; however, they do not provide type support beyond the basic any type for the resulting object. This utility function enables you to merge constructors while preserving all type definitions from each class.

+ Using Class Inheritance is another method to combine classes. However, when merging more than three classes, you may encounter "inheritance hell," where maintaining the hierarchy becomes complex and error-prone. Our tool simplifies the process, allowing for easier maintenance without manually managing an inheritance chain.

### How to use

Both CommonJS and ES6 module systems are supported.  

For optimal results, it is advised to define each partial class in a separate file.

In Node.js, you can use the following tsconfig.json, then `npx ts-node YOUR_TS_FILE.ts`
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "commonjs",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "experimentalDecorators": true
  }
}
```

```typescript

import combineClasses, { OnInit } from 'partial_classes';
import * as events from 'node:events';

// A.ts
class A {
emitter: events.EventEmitter = new events.EventEmitter();
    static globalA = 'globalA';
    static globalAMethod() {
        console.log('globalAMethod')
    }
    constructor(protected name: string) {

    }

    public beforePublish() {
        console.log(`${this.name} is now publishing`)
    }

    public publish() {
        this.emitter.emit('publish', 1234);
    }
}

// B.ts
class B {
    static globalB = 'globalB';
    constructor(protected name: string) {

    }

    public afterPublish() {
        console.log(`${this.name} is publish finished`)
    }

    @OnInit
    protected onInitAfterInstanceIsCreated(this: A & B) {
        this.emitter.on('publish', this.subscribe.bind(this));
    }

    protected subscribe(arg: number) {
        console.log(`${this.name} receives ${arg}`)
    }
}

// AB.ts
const AB = combineClasses(A, B);
AB.globalAMethod() // static method
AB.globalA // static property from A
AB.globalB // static property from B
const ab = new AB('AB combined');
// we use @OnInit to define the method that will be automatically called after the constructor is generated
// thus onInitAfterInstanceIsCreated in B gets called
ab.beforePublish() // method in A
ab.publish(); // method in A
ab.afterSubscribe() // method in B
```