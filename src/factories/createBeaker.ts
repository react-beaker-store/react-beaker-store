import type { BeakerActions, BeakerOptions, BeakerState, IBeaker } from '../types';
import { Beaker } from '../modules/beaker';

export function createBeaker<S extends BeakerState, A extends BeakerActions>(options: BeakerOptions<S, A>): IBeaker<S, A> {
  return new Beaker<S, A>(options);
}