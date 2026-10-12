// Link a numbered list to the numbered markers on a drawing (hover or keyboard focus highlights both).
export function linkList(list, attr, plan) {
  if (!list || !plan) return;
  const on = (n) => {
    plan.highlight(n);
    for (const li of list.querySelectorAll(`[${attr}]`)) li.classList.toggle('is-on', li.getAttribute(attr) === n);
  };
  for (const li of list.querySelectorAll(`[${attr}]`)) {
    const n = li.getAttribute(attr);
    li.addEventListener('pointerenter', () => on(n));
    li.addEventListener('focusin', () => on(n));
    li.addEventListener('pointerleave', () => on(null));
    li.addEventListener('focusout', () => on(null));
  }
}
