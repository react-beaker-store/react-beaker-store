import { createBeaker } from './factories/createBeaker';
import { useBeakerState } from './hooks/useBeakerState';

describe("index tests", () => {
  test("exports createBeaker() as expected", () => {
    const module = jest.requireActual<typeof import('./index')>('./index');
    expect(module.createBeaker).toBe(createBeaker);
  });
  test("exports useBeakerState() as expected", () => {
    const module = jest.requireActual<typeof import('./index')>('./index');
    expect(module.useBeakerState).toBe(useBeakerState);
  });
});