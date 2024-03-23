### What Does It Do?
This package provides a utility function that allows you to write code in multiple partial classes and then combine them into a single class with full type support, similar to the experience of writing C# partial classes.
> NOTE: Currently, Getter and Setter properties are not supported.

### Supported Module System
You can use this package with any module system, including CommonJS and ES6.
For optimal results, it is advised to define each partial class in a separate file.


### Why Not Use Typescript applyMixins, Object.assign, or Class Inheritance?
+ Typescript applyMixins and Object.assign can combine class constructors; however, they do not provide type support beyond the basic any type for the resulting object. This utility function enables you to merge constructors while preserving all type definitions from each class.

+ Using Class Inheritance is another method to combine classes. However, when merging more than three classes, you may encounter "inheritance hell," where maintaining the hierarchy becomes complex and error-prone. Our tool simplifies the process, allowing for easier maintenance without manually managing an inheritance chain.

### How to use
```typescript

import combineClasses, { OnInit } from 'partial_classes';
import * as events from 'node:events';

// A.ts
class A {
emitter: events.EventEmitter = new events.EventEmitter();
    static globalA = 'globalA';
    
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
    protected onInit(this: A & B) {
        this.emitter.on('publish', this.subscribe.bind(this));
    }

    protected subscribe(arg: number) {
        console.log(`${this.name} receives ${arg}`)
    }
}

// AB.ts
const AB = combineClasses(A, B);
const ab = new AB('AB combined');
ab.beforePublish()
ab.publish();
ab.globalA // globalA
ab.globalB // globalB
ab.afterSubscribe()
```