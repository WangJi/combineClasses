# partial_classes

Compose TypeScript classes the way C# handles `partial class`: split a large implementation into focused pieces, then merge them
into a single, fully-typed class with lifecycle hooks.

## Why partial_classes?
- **Productive authoring** – keep each concern in its own file while still delivering a single class to your consumers.
- **Type-safe merging** – resulting constructors, instance members, and static members retain full type inference.
- **Lifecycle-ready** – annotate methods with `@OnInit` to auto-run setup logic after the composed instance is created.
- **Safety hints** – warns when constructors have different parameter counts or when duplicate members would be overwritten.

### How does this compare to other libraries?
Libraries like [`ts-mixer`](https://github.com/tannerntannern/ts-mixer) and [`mixwith`](https://github.com/justinfagnani/mixwith.js)
offer mixin composition. `partial_classes` focuses specifically on the “partial class” workflow: merging complete class fragments
(including statics), preserving descriptors (getters/setters), and providing an initialization decorator.

## Installation
```bash
npm install partial_classes
```

## Usage
```typescript
import combineClasses, { OnInit } from 'partial_classes';
import * as events from 'node:events';

class Publisher {
  emitter: events.EventEmitter = new events.EventEmitter();

  static channel = 'news';
  static identify() {
    return 'publisher';
  }

  constructor(protected name: string) {}

  public publish() {
    this.emitter.emit('publish', `${this.name} sent an update`);
  }
}

class Subscriber {
  static identify() {
    return 'subscriber';
  }

  constructor(protected name: string) {}

  @OnInit
  protected bind(this: Publisher & Subscriber) {
    this.emitter.on('publish', this.onMessage.bind(this));
  }

  protected onMessage(message: string) {
    console.log(`${this.name} received: ${message}`);
  }
}

const NewsClient = combineClasses(Publisher, Subscriber);
const client = new NewsClient('Alice');
client.publish(); // Triggers Subscriber.onMessage via @OnInit binding
```

## Features
- Merges constructors, static members, instance fields, methods, and accessors.
- Runs `@OnInit` methods after the composed instance is constructed.
- Preserves property descriptors (getters/setters and enumerability).
- Warns when duplicate member names are encountered or when constructor parameter counts differ. The first constructor’s
  signature is used for type inference.

## Build & Contribute
- Source code lives in `src/`, bundled with [`tsup`](https://tsup.egoist.dev/).
- Run `npm run build` to produce ESM, CJS, and `.d.ts` outputs in `dist/`.
- `npm run dev` watches for changes while developing.

## Notes on member merging
- Members named `constructor` are never copied from prototypes.
- Duplicate member names are allowed, but later classes overwrite earlier ones; a console warning is emitted so you can resolve
  conflicts explicitly.

## License
MIT
