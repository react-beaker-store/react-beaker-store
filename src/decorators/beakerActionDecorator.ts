import { AnyFunction, IBeaker } from '../types';

export function beakerActionDecorator<A extends AnyFunction>(beaker: IBeaker, action: A): A {
  return ((...args: any[]) => {
    beaker.commit();
    let _return = action.apply(beaker, args);
    if (_return instanceof Promise) {
      _return = _return.then((resolution) => {
        beaker.commit();
        return resolution;
      });
    }
    beaker.commit();
    return _return;
  }) as A;
}