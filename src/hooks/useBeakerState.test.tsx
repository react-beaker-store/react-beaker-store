import type { Async } from '../types';
import userEvent from '@testing-library/user-event'
import React, { act, Fragment, useEffect } from 'react';
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import { createBeaker } from '../factories/createBeaker';
import { useBeakerState } from './useBeakerState';

describe('useBeakerState() tests', () => {
  test('returns beaker state', () => {
    const beaker = createBeaker({
      state: {
        counter: 0
      },
      actions: {
        increment() {
          this.state.counter += 1;
        }
      }
    });
    const { result } = renderHook(() => useBeakerState(beaker))
    expect(result.current).toBe(beaker.state);
  });

  test('changes component as expected', async () => {
    const beaker = createBeaker({
      state: {
        counter: 0
      },
      actions: {
        increment() {
          this.state.counter += 1;
        }
      }
    });

    function Component() {
      const { counter } = useBeakerState(beaker);
      return <button data-testid='btn' onClick={beaker.actions.increment}>{counter}</button>;
    }

    render(<Component />);
    const btn = await screen.findByTestId('btn');
    expect(btn.textContent).toBe('0');
    await userEvent.click(btn);
    expect(btn.textContent).toBe('1');
  });

  test('async changes update component as expected', async () => {
    const beaker = createBeaker({
      state: {
        loading: false,
        error: null,
        result: null
      } as Async<string>,
      actions: {
        async load() {
          try {
            this.state.loading = true;
            await new Promise((r) => setTimeout(r, 1000));
            this.state.result = 'Complete';
          } catch (error) {
            if (error instanceof Error) {
              this.state.error = error as Error;
            }
          } finally {
            this.state.loading = false;
          }
        }
      }
    });

    function SuccessAsyncComponent() {
      const { loading, error, result } = useBeakerState(beaker);

      useEffect(() => {
        beaker.actions.load();
      }, []);

      return (
        <Fragment>
          {error && <div data-testid='error'>{error.message}</div>}
          {loading && <div data-testid='loading'>Loading</div>}
          {result && <div data-testid='result'>{result}</div>}
        </Fragment>
      );
    }

    await act(async () => render(<SuccessAsyncComponent />));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeDefined();
      expect(screen.getByTestId('loading').textContent).toBe('Loading');
    });

    await waitFor(() => {
      expect(screen.getByTestId('result')).toBeDefined();
      expect(screen.getByTestId('result').textContent).toBe('Complete');
    }, { timeout: 1500 });

    expect(() => screen.getByTestId('error')).toThrow();
  });


  test('async changes update component as expected even when errors occur', async () => {
    const beaker = createBeaker({
      state: {
        loading: false,
        error: null,
        result: null
      } as Async<string>,
      actions: {
        async load() {
          try {
            this.state.loading = true;
            await new Promise((r) => setTimeout(r, 1000));
            throw new Error('Unable to complete operation')
          } catch (error) {
            if (error instanceof Error) {
              this.state.error = error as Error;
            }
          } finally {
            this.state.loading = false;
          }
        }
      }
    });

    function UnsuccessAsyncComponent() {
      const { loading, error, result } = useBeakerState(beaker);

      useEffect(() => {
        beaker.actions.load();
      }, []);

      return (
        <Fragment>
          {error && <div data-testid='error'>{error.message}</div>}
          {loading && <div data-testid='loading'>Loading</div>}
          {result && <div data-testid='result'>{result}</div>}
        </Fragment>
      );
    }

    await act(async () => render(<UnsuccessAsyncComponent />));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeDefined();
      expect(screen.getByTestId('loading').textContent).toBe('Loading');
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeDefined();
      expect(screen.getByTestId('error').textContent).toBe('Unable to complete operation');
    }, { timeout: 1500 });

    expect(() => screen.getByTestId('result')).toThrow();
  });
});