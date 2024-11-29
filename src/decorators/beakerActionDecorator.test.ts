import type { IBeaker } from '../types';
import { beakerActionDecorator } from './beakerActionDecorator';

describe("beakerActionDecorator() tests", () => {
  test("decorator passes arguments correctly to target function", () => {
    const target = jest.fn();
    const fakeBeaker = {
      commit: jest.fn()
    } as unknown as IBeaker;
    const decoratedAction = beakerActionDecorator(fakeBeaker, target);
    const args = [{}, [{}], {}]
    decoratedAction(...args);
    expect(target).toHaveBeenCalled();
    expect(target).toHaveBeenCalledWith(...args);
    expect(fakeBeaker.commit).toHaveBeenCalledTimes(2);
  });

  test("decorator returns the same returned value of action", () => {
    const expectedReturn = {};
    const target = jest.fn().mockReturnValue(expectedReturn);
    const fakeBeaker = {
      commit: jest.fn()
    } as unknown as IBeaker;
    const decoratedAction = beakerActionDecorator(fakeBeaker, target);
    const result = decoratedAction();
    expect(target).toHaveBeenCalled();
    expect(fakeBeaker.commit).toHaveBeenCalledTimes(2);
    expect(result).toBe(expectedReturn);
  });

  test("decorator returns the same promise value as action and commits after promise resolves", async () => {
    const expectedResolve = {};
    const target = jest.fn(async () => expectedResolve);
    const fakeBeaker = {
      commit: jest.fn()
    } as unknown as IBeaker;
    const decoratedAction = beakerActionDecorator(fakeBeaker, target);
    const promise = decoratedAction();

    expect(target).toHaveBeenCalled();
    expect(fakeBeaker.commit).toHaveBeenCalledTimes(2);
    expect(promise instanceof Promise).toBe(true);

    const result = await promise;

    expect(result).toBe(expectedResolve);
    expect(fakeBeaker.commit).toHaveBeenCalledTimes(3);
  });

  test("decorator throws when action throws", () => {
    const target = jest.fn(() => {
      throw new Error();
    });
    const fakeBeaker = {
      commit: jest.fn()
    } as unknown as IBeaker;
    const decoratedAction = beakerActionDecorator(fakeBeaker, target);
    expect(() => decoratedAction()).toThrow();
  });
});