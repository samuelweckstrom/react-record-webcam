import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

type Store<K extends string | number | symbol, V> = Map<K, V> | Record<K, V>;

type Callback<V> = {
  set?: (value: V) => void;
  get?: (key: keyof Store<string | number | symbol, V>) => V;
  delete?: (key: keyof Store<string | number | symbol, V>) => void;
  clear?: () => void;
};

type ProxiedMap<K, V> = {
  get: (key: K) => V | undefined;
  set: (key: K, value: V, shouldUpdate: boolean) => V;
  clear: (shouldUpdate: boolean) => void;
  delete: (key: K, shouldUpdate: boolean) => void;
  values: () => V[];
  entries: () => [K, V][];
  has: (key: K) => boolean;
  keys: () => K[];
  size: number;
};

export function createStore<K extends string | number | symbol, V>(
  store: Map<K, V> | Record<K, V>
): (
  stateUpdater: Dispatch<SetStateAction<number>>,
  callbacks?: Partial<Callback<V>>
) => ProxiedMap<K, V> {
  return (
    stateUpdater: Dispatch<SetStateAction<number>>,
    callbacks?: Partial<Callback<V>>
  ) => {
    return new Proxy(store, {
      get(target: Map<K, V>, prop: string, receiver: any) {
        if (prop === 'size') {
          return target.size;
        }
        const value = Reflect.get(target, prop, receiver);
        if (value instanceof Function) {
          return function (...args: (string | boolean)[]) {
            const result = value.apply(target, args);
            const shouldTriggerUpdate = args[args.length - 1] === true;

            if (shouldTriggerUpdate) {
              stateUpdater((prev) => prev + 1);
            }

            if (prop === 'set') {
              return result.get(args[0]);
            }

            if (callbacks && callbacks[prop as keyof Partial<Callback<V>>]) {
              callbacks[prop as keyof Partial<Callback<V>>]?.(result);
            }
            return result;
          };
        }
        return value;
      },
    }) as ProxiedMap<K, V>;
  };
}

export function useStore<K extends string | number | symbol, V>(
  store: (
    updater: Dispatch<SetStateAction<number>>,
    callbacks?: Partial<Callback<V>>
  ) => ProxiedMap<K, V>,
  callbacks?: Partial<Callback<V>>
): { state: ProxiedMap<K, V> } {
  const [, forceUpdate] = useState(0);
  const triggerUpdate = useCallback(() => forceUpdate((prev) => prev + 1), []);
  const state = useMemo(() => store(triggerUpdate, callbacks), []);

  return {
    state,
  };
}
