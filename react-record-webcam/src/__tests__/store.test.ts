import { createStore } from '../store';

describe('createStore', () => {
  let updateCount = 0;
  const mockStateUpdater = jest.fn(() => updateCount++);

  it('should create a store and allow getting and setting values', () => {
    const initialStore = new Map();
    const store = createStore(initialStore)(mockStateUpdater);

    expect(store.get('key')).toBeUndefined();

    store.set('key', 'value', true);
    expect(store.get('key')).toBe('value');
    expect(mockStateUpdater).toHaveBeenCalled();
  });

  it('should trigger updates when specified', () => {
    const initialStore = new Map([['key', 'value']]);
    const store = createStore(initialStore)(mockStateUpdater);

    expect(store.get('key')).toBe('value');
    store.set('key', 'updatedValue', true);
    expect(store.get('key')).toBe('updatedValue');
    expect(updateCount).toBeGreaterThan(0);
  });

  it('should handle clear and delete operations', () => {
    const initialStore = new Map([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ]);
    const store = createStore(initialStore)(mockStateUpdater);

    store.delete('key1', true);
    expect(store.has('key1')).toBe(false);

    store.clear(true);
    expect(store.size).toBe(0);
  });
});
