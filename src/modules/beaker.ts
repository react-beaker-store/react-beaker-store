
import type { AnyFunction, BeakerActions, BeakerOptions, BeakerState, IBeaker } from '../types';
import type { Draft, Objectish } from 'immer';
import { beakerActionDecorator } from '../decorators/beakerActionDecorator';
import { createDraft, enableMapSet, finishDraft } from 'immer';

enableMapSet();

export class Beaker<S extends BeakerState, A extends BeakerActions> implements IBeaker<S, A> {
  private _state: S;
  private _actions: A;
  private _subscribers: Set<AnyFunction>;
  private _draft?: Draft<Objectish>;
  private _scheduledCommit?: number;

  public get state(): S {
    return this._draft as S;
  }

  public get actions(): Readonly<A> {
    return this._actions;
  }

  public constructor(options: BeakerOptions<S, A>) {
    this._subscribers = new Set<AnyFunction>();
    this._state = options.state;
    this._actions = options.actions;
    this._draft = createDraft(this._state as Objectish);
    for (const fn in options.actions) {
      this._actions[fn] = beakerActionDecorator(this, this._actions[fn]!);
    }
  }

  private _notify(): void {
    for (const sub of this._subscribers) {
      try { sub(); } catch { } /* ignore */
    }
  }

  private _commit(): void {
    const newState = finishDraft(this._draft) as S;
    if (this._state === newState) return;
    this._state = newState;
    this._draft = createDraft(this._state as Objectish);
    this._notify();
  }

  public commit(): void {
    clearTimeout(this._scheduledCommit);
    this._scheduledCommit = setTimeout(() => this._commit(), 0) as any as number;
  }

  public subscribe(subscriber: AnyFunction): void {
    this._subscribers.add(subscriber);
  }

  public unsubscribe(subscriber: AnyFunction): void {
    this._subscribers.delete(subscriber);
  }
}