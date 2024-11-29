import { createBeaker } from './createBeaker';

describe('createBeaker() tests', () => {
  test('createBeaker() does not throw', () => {
    expect(() => {
      createBeaker({
        state: {},
        actions: {}
      });
    }).not.toThrow();
  });

  test('createBeaker() wont return null or undefined', () => {
    const beaker = createBeaker({
      state: {},
      actions: {}
    });
    expect(beaker).toBeDefined();
    expect(beaker).not.toBeNull();
  });
});