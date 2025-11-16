import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import combineClasses, { OnInit } from '../src';

describe('combineClasses', () => {
  it('merges instance members, getters, and static properties from all classes', () => {
    class Position {
      public x: number;
      static entity = 'position';

      constructor(payload: number) {
        this.x = payload;
      }

      get doubleX() {
        return this.x * 2;
      }
    }

    class Identity {
      public readonly id: string;
      static prefix = 'id:';

      constructor(value: number) {
        this.id = `${Identity.prefix}${value}`;
      }

      describe() {
        return `${this.id}:${(this as Record<string, any>).x}`;
      }
    }

    const Combined = combineClasses(Position, Identity);
    const instance = new Combined(5);

    expect(instance.x).toBe(5);
    expect(instance.doubleX).toBe(10);
    expect(instance.id).toBe('id:5');
    expect(instance.describe()).toBe('id:5:5');
    expect((Combined as any).entity).toBe('position');
    expect((Combined as any).prefix).toBe('id:');
  });

  it('runs methods decorated with OnInit after instances merge', () => {
    class WithState {
      public log: string[];

      constructor() {
        this.log = ['ctor:first'];
      }

      @OnInit
      hydrate() {
        this.log.push('init:first');
      }
    }

    class WithLifecycleHook {
      @OnInit
      tail() {
        (this as unknown as WithState).log.push('init:second');
      }
    }

    const Combined = combineClasses(WithState, WithLifecycleHook);
    const instance = new Combined();

    expect(instance.log).toEqual(['ctor:first', 'init:first', 'init:second']);
  });

  describe('warnings', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('warns when constructor signatures and member names conflict', () => {
      class First {
        static duplicated = 1;

        constructor(_value: number) {}

        duplicatedMethod() {
          return 'first';
        }
      }

      class Second {
        static duplicated = 2;

        constructor(_value: number, _extra: number) {}

        duplicatedMethod() {
          return 'second';
        }
      }

      combineClasses(First, Second);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Constructor parameter length mismatch/),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Static member "duplicated" is being overwritten/),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Instance member "duplicatedMethod" is being overwritten/),
      );
    });
  });

  it('does not overwrite defined properties with undefined values', () => {
    class WithValue {
      public value: number;

      constructor() {
        this.value = 42;
      }
    }

    class WithUndefined {
      public value: number | undefined;

      constructor() {
        this.value = undefined;
      }
    }

    const Combined = combineClasses(WithValue, WithUndefined);
    const instance = new Combined();

    expect(instance.value).toBe(42);
  });
});
