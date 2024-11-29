
type AnySerializablePrimitive = null | undefined | boolean | number | string | Error;
type AnySerializableArray = Array<AnySerializable>;
type AnySerializableSet = Set<AnySerializable>;
type AnySerializableObject = { [key: string]: AnySerializable };
type AnySerializableMap = Map<string, AnySerializable>;


export type Async<T extends Exclude<AnySerializable, null | undefined>> = {
  loading: boolean;
  error: Error | null;
  result: T | null
};

export type AnySerializable = AnySerializablePrimitive | AnySerializableArray | AnySerializableSet | AnySerializableObject | AnySerializableMap;
export type AnyFunction = (...args: any[]) => any;

export type BeakerState = AnySerializable;
export type BeakerActions = Record<string, AnyFunction | undefined>;

export type BeakerOptions<S extends BeakerState, A extends BeakerActions = BeakerActions> = {
  state: S;
  actions: A & ThisType<IBeaker<S, A>>;
};

export interface IBeaker<S extends BeakerState = BeakerState, A extends BeakerActions = BeakerActions> {
  state: S;
  actions: Readonly<A>;
  commit: () => void;
  subscribe: (fn: AnyFunction) => void;
  unsubscribe: (fn: AnyFunction) => void;
};