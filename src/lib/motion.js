// One switch for reduced motion: the OS setting, or ?motion=reduce (handy for testing and demos).
const params = new URLSearchParams(location.search);
if (params.get('motion') === 'reduce') document.documentElement.dataset.motion = 'reduce';

export const reducedMotion = () =>
  document.documentElement.dataset.motion === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
