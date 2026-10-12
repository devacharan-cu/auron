// Minimal shared state with subscribe — the three experiences read and write the same values.

export function createStore(initial) {
  let state = { ...initial };
  const subs = new Set();
  return {
    get: () => state,
    set(patch) {
      const prev = state;
      state = { ...state, ...patch };
      for (const fn of subs) fn(state, prev);
    },
    subscribe(fn) {
      subs.add(fn);
      fn(state, null);
      return () => subs.delete(fn);
    },
  };
}
