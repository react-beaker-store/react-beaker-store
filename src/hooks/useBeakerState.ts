import type { BeakerState, IBeaker } from '../types';
import { useEffect, useState } from 'react';

export function useBeakerState<S extends BeakerState>(beaker: IBeaker<S>): S {
  const [_, set] = useState(false);

  useEffect(() => {
    const trigger = () => set((v) => !v);
    beaker.subscribe(trigger);
    return () => beaker.unsubscribe(trigger);
  }, [beaker]);

  return beaker.state;
}
