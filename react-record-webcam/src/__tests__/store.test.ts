import { ExternalStore } from '../store';

describe('ExternalStore', () => {
  it('should create a store and allow getting and setting values', () => {
    const store = new ExternalStore<string>();

    expect(store.get('key')).toBeUndefined();

    store.set('key', 'value');
    expect(store.get('key')).toBe('value');
  });

  it('should notify listeners on set', () => {
    const store = new ExternalStore<string>();
    const listener = jest.fn();
    store.subscribe(listener);

    store.set('key', 'value');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should update snapshot on set', () => {
    const store = new ExternalStore<string>();
    expect(store.getSnapshot()).toEqual([]);

    store.set('key', 'value');
    expect(store.getSnapshot()).toEqual(['value']);
  });

  it('should handle clear and delete operations', () => {
    const store = new ExternalStore<string>();
    store.set('key1', 'value1');
    store.set('key2', 'value2');

    store.delete('key1');
    expect(store.has('key1')).toBe(false);
    expect(store.getSnapshot()).toEqual(['value2']);

    store.clear();
    expect(store.size).toBe(0);
    expect(store.getSnapshot()).toEqual([]);
  });

  it('should unsubscribe listeners', () => {
    const store = new ExternalStore<string>();
    const listener = jest.fn();
    const unsub = store.subscribe(listener);

    store.set('key', 'value');
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
    store.set('key2', 'value2');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should return stable snapshot reference when unchanged', () => {
    const store = new ExternalStore<string>();
    store.set('key', 'value');
    const snap1 = store.getSnapshot();
    const snap2 = store.getSnapshot();
    expect(snap1).toBe(snap2);
  });
});
