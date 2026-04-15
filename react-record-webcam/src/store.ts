import { useSyncExternalStore } from 'react';

type Listener = () => void;

export class ExternalStore<V> {
  private map = new Map<string, V>();
  private listeners = new Set<Listener>();
  private _snapshot: V[] = [];

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): V[] => {
    return this._snapshot;
  };

  private emit(): void {
    this._snapshot = Array.from(this.map.values());
    for (const listener of this.listeners) {
      listener();
    }
  }

  get(key: string): V | undefined {
    return this.map.get(key);
  }

  set(key: string, value: V): V {
    this.map.set(key, value);
    this.emit();
    return value;
  }

  delete(key: string): void {
    this.map.delete(key);
    this.emit();
  }

  clear(): void {
    this.map.clear();
    this.emit();
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  values(): V[] {
    return this._snapshot;
  }

  get size(): number {
    return this.map.size;
  }
}

export function useExternalStore<V>(store: ExternalStore<V>): V[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
