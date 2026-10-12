import { boot, store, toggleCompare } from '../shell.js';
import { lightAt } from '../model/light.js';
import { mountHomes } from '../components/homes.js';
import { mountCompare } from '../components/compare.js';

boot();
const homes = mountHomes({ store, list: true, compare: true, onCompare: toggleCompare });
const compare = mountCompare(document.getElementById('compare-host'), {
  store,
  onRemove: (id) => store.set({ compare: store.get().compare.filter((x) => x !== id) }),
});

store.subscribe((state, prev) => {
  const light = lightAt(state.season, state.minutes);
  homes.update(state, prev, light);
  const timeChanged = !prev || prev.minutes !== state.minutes || prev.season !== state.season;
  if (timeChanged || prev.compare !== state.compare || prev.units !== state.units) compare.render(state, light);
});
