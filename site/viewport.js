// Phones show and hide the address bar while scrolling, which changes window.innerHeight by roughly 50–120px.
// The fixed, full-screen visuals (clock, code layer, mist) are sized to the tallest viewport — as if the bar were
// hidden — and ignore those height-only changes, so nothing is rebuilt or jumps mid-scroll. Page sections keep
// using CSS svh, which does not change either.

let probe = null;
// The viewport height with the address bar hidden (CSS 100lvh), never less than the current one.
export function screenHeight() {
  if (!probe) {
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';
    document.body.append(probe);
  }
  return Math.max(probe.offsetHeight || 0, innerHeight);
}

// Calls fn on real resizes only: any width change (rotation, window resize), or any change with a mouse.
// On touch screens a height-only change smaller than 260px is the address bar (or a toolbar) and is ignored.
export function onResize(fn, { signal } = {}) {
  let w = innerWidth, h = innerHeight;
  const handler = () => {
    const nw = innerWidth, nh = innerHeight;
    if (matchMedia('(pointer:coarse)').matches && nw === w && Math.abs(nh - h) < 260) return;
    w = nw; h = nh; fn();
  };
  addEventListener('resize', handler, { passive: true, signal });
  return () => removeEventListener('resize', handler);
}
