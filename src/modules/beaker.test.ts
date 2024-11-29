import { Beaker } from './beaker';
import { faker } from '@faker-js/faker';

type JsSerializableType = 'boolean' | 'int' | 'float' | 'string' | 'date' | 'array' | 'object' | 'set' | 'map';

const fakerex = {
  // faker extensions
  random: {
    _maxComplexObjects: 8,
    _complexObjectsCount: 0,

    resetComplexObjectsCount() {
      this._complexObjectsCount = 0;
    },

    type(exclude: JsSerializableType[] = []): JsSerializableType {
      while (true) {
        const result = faker.helpers.arrayElement(['boolean', 'int', 'float', 'string', 'date', 'array', 'object', 'set', 'map']);
        if (!exclude.includes(result)) {
          if (['array', 'object', 'set', 'map'].includes(result) && this._complexObjectsCount < this._maxComplexObjects) {
            return result;
          } else {
            return result;
          }
        }
      }
    },

    typeof(value: any): JsSerializableType {
      if (typeof value === 'boolean') {
        return 'boolean';
      } else if (typeof value === 'number') {
        return Number.isSafeInteger(value) ? 'int' : 'float';
      } else if (typeof value === 'string') {
        return 'string';
      } else if (value instanceof Date) {
        return 'date';
      } else if (Array.isArray(value)) {
        return 'array';
      } else if (value instanceof Set) {
        return 'set';
      } else if (value instanceof Map) {
        return 'map';
      } else {
        return 'object';
      }
    },

    value(type?: JsSerializableType) {
      if (!type) {
        type = this.type();
      }
      switch (type) {
        case 'boolean':
          return faker.datatype.boolean();
        case 'int':
          return faker.number.int();
        case 'float':
          return faker.number.float();
        case 'string':
          return faker.word.words({ count: { max: 8, min: 0 } });
        case 'date':
          return faker.date.anytime();
        case 'array':
          return this.array();
        case 'object':
          return this.object();
        case 'set':
          return this.set();
        case 'map':
          return this.map();
      }
    },

    array(): any[] {
      this._complexObjectsCount += 1;
      const result = [];
      const length = faker.number.int({ max: 8 });
      const type = this.type(['boolean', 'array', 'object', 'set', 'map']);
      for (let index = 0; index < length; index++) {
        result.push(this.value(type));
      }
      return result;
    },

    set(): Set<any> {
      this._complexObjectsCount += 1;
      const result = new Set<any>();
      const length = faker.number.int({ max: 8 });
      const type = this.type(['boolean', 'array', 'object', 'set', 'map']);
      for (let index = 0; index < length; index++) {
        result.add(this.value(type));
      }
      return result;
    },

    object(): Record<string, any> {
      this._complexObjectsCount += 1;
      const result: Record<string, any> = {};
      const keys = faker.word.words({ count: { max: 8, min: 4 } }).split(' ');
      for (const key of keys) {
        result[key] = this.value();
      }
      return result;
    },

    map(): Map<string, any> {
      this._complexObjectsCount += 1;
      const result = new Map<string, any>();
      const keys = faker.word.words({ count: { max: 8, min: 1 } }).split(' ');
      const type = this.type(['boolean', 'array', 'object', 'set', 'map']);
      for (const key of keys) {
        result.set(key, this.value(type));
      }
      return result;
    }
  }
};

function expectResultToMatchOriginal(resultObject: any, expectedObject: any) {
  for (const property in expectedObject) {
    const type = fakerex.random.typeof(expectedObject[property]);
    switch (type) {
      case 'boolean':
      case 'int':
      case 'float':
      case 'string':
      case 'date':
        {
          expect(resultObject[property]).toBe(expectedObject[property]);
          break;
        }
      case 'array':
        {
          expect((resultObject[property] as Array<any>).length).toBe((expectedObject[property] as Array<any>).length);
          for (let index = 0; index < (resultObject[property] as Array<any>).length; index++) {
            const result = (resultObject[property] as Array<any>)[index];
            const expected = (expectedObject[property] as Array<any>)[index];
            expect(result).toBe(expected);
          }
          break;
        }
      case 'set':
        {
          const result = [...(resultObject[property] as Set<any>).values()];
          const expected = [...(expectedObject[property] as Set<any>).values()];
          for (let index = 0; index < expected.length; index++) {
            expect(result[index]).toBe(expected[index]);
          }
          break;
        }
      case 'map':
        {
          const result = [...(resultObject[property] as Map<string, any>).entries()]
          const expected = [...(expectedObject[property] as Map<string, any>).entries()]
          for (let index = 0; index < expected.length; index++) {
            expect(result[index][0]).toBe(expected[index][0]);
            expect(result[index][1]).toBe(expected[index][1]);
          }
          break;
        }
      case 'object':
        {
          expectResultToMatchOriginal(resultObject[property], expectedObject[property]);
          break;
        }
    }
  }
}

describe('Beaker class tests', () => {
  test('Can create instance', () => {
    expect(() => {
      new Beaker({
        state: fakerex.random.object(),
        actions: {
          helloWorld() {
            return 'Hello World';
          },
          goodBye(name: string) {
            return `Good bye ${name}`;
          }
        }
      });
    }).not.toThrow();
  });

  test('Beaker state has the same shape from given object state', () => {
    const originalState = fakerex.random.object();
    fakerex.random.resetComplexObjectsCount();
    const beaker = new Beaker({
      state: originalState,
      actions: {}
    });
    expectResultToMatchOriginal(beaker.state, originalState);
  });

  test('Action can change state', () => {
    const beaker = new Beaker({
      state: {
        counter: 0
      },
      actions: {
        increase() {
          this.state.counter += 1;
        }
      }
    });
    expect(beaker.state.counter).toBe(0);
    expect(() => {
      beaker.actions.increase();
    }).not.toThrow();
    expect(beaker.state.counter).toBe(1);
  });

  test('Subscribers are called when state changes', async () => {
    const beaker = new Beaker({
      state: {
        counter: 0
      },
      actions: {
        increase() {
          this.state.counter += 1;
        }
      }
    });
    const subscriber = jest.fn();
    beaker.subscribe(subscriber);
    expect(subscriber).not.toHaveBeenCalled();
    beaker.actions.increase();
    setTimeout(() => {
      expect(subscriber).toHaveBeenCalledTimes(1);
    }, 0);
  });


  test('Subscribers are not called after unsubscribing', async () => {
    const beaker = new Beaker({
      state: {
        counter: 0
      },
      actions: {
        increase() {
          this.state.counter += 1;
        }
      }
    });
    const subscriber = jest.fn();
    beaker.subscribe(subscriber);
    beaker.actions.increase();
    beaker.unsubscribe(subscriber);
    setTimeout(() => {
      expect(subscriber).not.toHaveBeenCalled();
    }, 0);
  });


  test('All subscribers are called when state changes', async () => {
    const beaker = new Beaker({
      state: {
        counter: 0
      },
      actions: {
        increase() {
          this.state.counter += 1;
        }
      }
    });
    const subscriber1 = jest.fn();
    const subscriber2 = jest.fn();
    const subscriber3 = jest.fn();
    beaker.subscribe(subscriber1);
    beaker.subscribe(subscriber2);
    beaker.subscribe(subscriber3);
    beaker.actions.increase();
    setTimeout(() => {
      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
      expect(subscriber3).toHaveBeenCalledTimes(1);
    }, 0);
  });

  test('All subscribers are called even when any throws an error', async () => {
    const beaker = new Beaker({
      state: {
        counter: 0
      },
      actions: {
        increase() {
          this.state.counter += 1;
        }
      }
    });
    const error = new Error();
    const subscriber1 = jest.fn();
    const subscriber2 = jest.fn(() => {
      throw error;
    });

    const ogConsoleError = console.error;
    console.error = jest.fn();

    const subscriber3 = jest.fn();
    beaker.subscribe(subscriber1);
    beaker.subscribe(subscriber2);
    beaker.subscribe(subscriber3);
    beaker.actions.increase();
    setTimeout(() => {
      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(error);
      expect(subscriber3).toHaveBeenCalledTimes(1);
      console.error = ogConsoleError;
    }, 0);
  });

  test('Subscriber is called after changing state out of action and commiting', async () => {
    const beaker = new Beaker({
      state: {
        counter: 0
      },
      actions: {}
    });
    const subscriber = jest.fn();
    beaker.subscribe(subscriber);
    beaker.state.counter += 10;
    beaker.commit();
    setTimeout(() => {
      expect(subscriber).toHaveBeenCalledTimes(1);
    }, 0);
  });

  test('Subscriber wont be called after if the state does not change even after committing', async () => {
    const beaker = new Beaker({
      state: {
        counter: 0
      },
      actions: {}
    });
    const subscriber = jest.fn();
    beaker.subscribe(subscriber);
    beaker.commit();
    setTimeout(() => {
      expect(subscriber).not.toHaveBeenCalled();
    }, 0);
  });
  test('Subscriber wont be called after if the state does not change even after calling an action', async () => {
    const beaker = new Beaker({
      state: {
        counter: 0
      },
      actions: {
        increment() {
          this.state.counter = 0;
        }
      }
    });
    const subscriber = jest.fn();
    beaker.subscribe(subscriber);
    beaker.actions.increment();
    setTimeout(() => {
      expect(subscriber).not.toHaveBeenCalled();
    }, 0);
  });
});

