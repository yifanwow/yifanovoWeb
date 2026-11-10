import { mountMist } from './poetry.js';

const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ext = href => href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';

/* The project page is written in code from top to bottom. One fixed layer of code characters sits behind the
   whole page: on the first screen a widescreen frame, turned slightly in depth, plays a film written in code;
   scrolling carries the characters from project to project, assembling each picture in code (the real picture
   shows on hover). Every title and line of text decodes out of code as it arrives. */

export function projectLanding(data) {
  const list = data.projects, featured = list.filter(p => p.featured), earlier = list.filter(p => !p.featured);
  const years = list.map(p => p.year);
  const links = p => p.links.map(l => `<a href="${l.href}"${ext(l.href)}>${esc(l.label)}<span aria-hidden="true">↗</span></a>`).join('');
  const blocks = featured.map((p, i) => `
    <article class="work${i % 2 ? ' is-flip' : ''}" id="work-${p.id}" data-tone="${p.id === 'mne' ? '#b9a2ff' : p.id === 'watchdog' ? '#ff6a7a' : ''}" aria-labelledby="work-title-${p.id}">
      <a class="work-frame" href="${p.url}"${ext(p.url)} aria-label="打开 ${esc(p.title)}">
        <span class="work-glass"><img src="${p.image}" alt="${esc(p.title)} 的页面截图" loading="${i ? 'lazy' : 'eager'}"></span>
        <span class="work-caption" aria-hidden="true">FIG.${String(i + 1).padStart(2, '0')} · ${esc(p.url.replace(/^https?:\/\//, ''))}</span>
      </a>
      <div class="work-copy">
        <span class="work-no">${String(i + 1).padStart(2, '0')} <i>/</i> ${String(list.length).padStart(2, '0')}</span>
        <h2 id="work-title-${p.id}">${esc(p.title)}</h2>
        <p class="work-tagline">${esc(p.tagline || '')}</p>
        <p class="work-text">${esc(p.description)}</p>
        <dl class="work-meta"><span class="brace">{</span><div><dt>platform:</dt><dd>'${esc(p.category)}',</dd></div><div><dt>year:</dt><dd>${p.year},</dd></div><div><dt>status:</dt><dd>'${esc(p.status || '')}'</dd></div><span class="brace">}</span></dl>
        <nav class="work-links" aria-label="${esc(p.title)} 的链接">${links(p)}</nav>
      </div>
    </article>`).join('');
  const rows = earlier.map((p, i) => `<li id="work-${p.id}"><a class="archive-row" href="${p.url}"${ext(p.url)} data-preview="${p.image}"><span class="archive-year">${p.year}</span><span class="archive-title">${esc(p.title)}</span><span class="archive-cat">${esc(p.category)}</span><span class="archive-text">${esc(p.description)}</span><span class="archive-arrow" aria-hidden="true">-&gt;</span></a></li>`).join('');
  return `<canvas class="code-field" aria-hidden="true"></canvas>
    <video class="code-film" src="/assets/code-film.mp4" muted loop playsinline preload="auto" aria-hidden="true"></video>
    <section class="proj-hero" aria-labelledby="proj-title">
      <div class="proj-hero-copy">
        <span class="proj-kicker">项目 <i>/</i> 科技之美</span>
        <h1 id="proj-title" data-text="Beauty of Tech">Beauty of Tech</h1>
        <p class="proj-slogan">Tech makes life better.</p>
        <p class="proj-lede">模糊的界限，却让本质更加清晰。</p>
      </div>
      <span class="proj-scroll" aria-hidden="true">// film.play() · scroll()</span>
    </section>
    <div class="proj-section-head" data-tone=""><span>// 最近</span><small>RECENT</small></div>
    ${blocks}
    <section class="proj-archive" aria-labelledby="archive-title">
      <div class="proj-section-head"><span id="archive-title">// 更早</span><small>EARLIER</small></div>
      <ol class="archive-list">${rows}</ol>
    </section>
    <img class="archive-preview" alt="" aria-hidden="true">`;
}

// The code layer: fixed behind the whole page. One swarm of code characters travels down the page with the
// reader. On the first screen it plays the film inside a widescreen frame turned slightly in depth; scrolling
// on, the characters leave one by one and fly to the next project's frame, where they settle into a picture
// of that project written in code, then on to the next project, and back again when scrolling up. Frames the
// swarm has not reached keep a faint trace of their picture. A field of still code stays behind everything.
function mountCodeField(root) {
  const canvas = root.querySelector('.code-field'), video = root.querySelector('.code-film');
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d'), media = matchMedia('(prefers-reduced-motion:reduce)');
  const controller = new AbortController(), on = (t, n, f, o = {}) => t.addEventListener(n, f, { ...o, signal: controller.signal });
  const CHARS = Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i));
  // Bright colours (the film uses the first nine; project pictures may use all); darkness is transparency.
  const PALETTE = ['#5b6fb8', '#4f86e8', '#6fa8ff', '#8fd8ff', '#5fe0e8', '#c8f0ff', '#ffffff', '#f2c8b8', '#d8a890', '#a98bff', '#f3a6c8', '#cbb8ff', '#ffd9b0'];
  const RGB = PALETTE.map(c => [1, 3, 5].map(k => parseInt(c.slice(k, k + 2), 16)));
  const ASSEMBLE = 2.6, SCAN_RATE = .25, SCAN_PAUSE = 1.4, GHOST = .14;
  let reduced = media.matches, text = '', W = 0, H = 0, cw = 9, ch = 15, cols = 0, rows = 0, dpr = 1;
  let fcols = 0, frows = 0, fn = 0, sx, sy, delay, leave, seed, drift, lum, shade, rowVer, colW, colH, colX, rowY, rowH, rowS, frameMid = 0, fx0 = 0, fw = 0, fh = 0;
  // The screen's tilt: a resting turn (left side farther), plus a little lean toward the pointer or the phone's angle.
  let baseNear = 1.16, baseFar = .7, tiltX = 0, tiltY = 0, aimX = 0, aimY = 0, shownTiltX = NaN, shownTiltY = NaN;
  let atlases = [], blocks = [], scanAtlas = null, bgCache = null, tone = '', sampler = null, sctx = null;
  let stations = [], anchors = [0];
  let lastY = -1, vY = -1, wasFlying = false, frame = 0, last = 0, assembleT = 0, scan = -1, scanWait = 0, sampleAcc = 0, drawAcc = 0, glitchRow = -1, glitchT = 0, glitchShift = 0;
  const range = { lo: 0, hi: 1 }, A = {}, B = {};

  function atlas(color, weight = 500, w = cw, h = ch) {
    const a = document.createElement('canvas'); a.width = Math.ceil(CHARS.length * w * dpr); a.height = Math.ceil(h * dpr);
    const g = a.getContext('2d'); g.scale(dpr, dpr); g.fillStyle = color; g.textBaseline = 'middle'; g.textAlign = 'center';
    g.font = `${weight} ${Math.round(h * .74)}px ui-monospace, 'SF Mono', Menlo, Consolas, monospace`;
    CHARS.forEach((c, i) => g.fillText(c, i * w + w / 2, h / 2 + .5));
    return a;
  }
  // Letters flying to large titles get their own sharp, large glyphs.
  const BW = 26, BH = 42;
  let bigAtlas = [];
  const block = color => { const b = document.createElement('canvas'); b.width = b.height = 2; const g = b.getContext('2d'); g.fillStyle = color; g.fillRect(0, 0, 2, 2); return b; };
  const codeAt = k => { if (!text) return 0; k %= text.length; if (k < 0) k += text.length; const c = text.charCodeAt(k); return c > 32 && c < 127 ? c - 33 : -1; };
  const nearest = (r, g, b, upto) => { let best = 0, bd = Infinity; for (let k = 0; k < upto; k++) { const q = RGB[k], d = (q[0] - r) ** 2 + (q[1] - g) ** 2 + (q[2] - b) ** 2; if (d < bd) { bd = d; best = k; } } return best; };
  const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const glyphAt = (s, r, c) => codeAt(r * 977 + c + s.rowVer[r] * s.gcols * 13 + (s.k + 1) * 7919);
  const alphaFor = l => .06 + .94 * l ** .8;

  // Faint still code over the whole screen, painted once.
  function paintBackground() {
    bgCache = document.createElement('canvas'); bgCache.width = canvas.width; bgCache.height = canvas.height;
    const g = bgCache.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const grey = atlas('#8d89a0'), tinted = tone ? atlas(tone) : null;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const ci = codeAt(r * cols + c + 9000); if (ci < 0) continue;
      const k = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453, h = k - Math.floor(k);
      g.globalAlpha = .035 + h * .045; g.drawImage(tinted && h > .55 ? tinted : grey, ci * cw * dpr, 0, cw * dpr, ch * dpr, c * cw, r * ch, cw, ch);
    }
  }
  function layout() {
    W = innerWidth; H = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const narrow = W < 760;
    cw = narrow ? 5 : 6; ch = Math.round(cw * 1.6);
    while ((W / cw) * (H / ch) > (narrow ? 7000 : 24000)) { cw += 1; ch = Math.round(cw * 1.6); }
    cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
    // The film's frame (in page coordinates at the top of the page): widescreen, on the right.
    const head = narrow ? 76 : 88;
    fw = narrow ? W * .94 : Math.min(W * .7, 1280); fh = fw / 2.4;
    fx0 = narrow ? W * .03 : W - fw - Math.max(24, (W - 1320) / 2 - 20);
    frameMid = narrow ? head + 36 + fh / 2 : head + (H - head) * .4;
    // A bigger screen gets slightly bigger characters rather than more of them (about 5,600 at most).
    while (!narrow && (fw / cw) * (fh / ch) > 5600) { cw += 1; ch = Math.round(cw * 1.6); }
    cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
    fcols = Math.round(fw / cw); frows = Math.round(fh / ch); fn = fcols * frows;
    // Perspective: columns grow toward the right, as if the frame were turned slightly away on its left.
    colX = new Float32Array(fcols); colW = new Float32Array(fcols); colH = new Float32Array(fcols);
    rowY = new Float32Array(frows); rowH = new Float32Array(frows); rowS = new Float32Array(frows);
    baseNear = narrow ? 1 : 1.16; baseFar = narrow ? 1 : .7;
    shownTiltX = NaN; perspective();
    sx = new Float32Array(fn); sy = new Float32Array(fn); delay = new Float32Array(fn); leave = new Float32Array(fn); seed = new Float32Array(fn); drift = new Float32Array(fn);
    for (let i = 0; i < fn; i++) {
      const r = Math.floor(i / fcols), c = i - r * fcols;
      sx[i] = (Math.random() * 1.3 - .15) * W; sy[i] = (Math.random() * 1.3 - .3) * H;
      delay[i] = (r / frows) * 1.1 + Math.random() * .55;
      // Leaving order: from the left side first, with some scatter.
      leave[i] = (c / fcols) * .45 + Math.random() * .3;
      seed[i] = Math.random(); drift[i] = Math.random() - .5;
    }
    lum = new Float32Array(fn); shade = new Uint8Array(fn); rowVer = new Uint16Array(frows);
    atlases = PALETTE.map(c => atlas(c)); blocks = PALETTE.map(block); scanAtlas = atlas('#e8f6ff', 600);
    bigAtlas = [atlas(PALETTE[3], 400, BW, BH), atlas(PALETTE[6], 400, BW, BH)];
    sampler = document.createElement('canvas'); sampler.width = fcols; sampler.height = frows; sctx = sampler.getContext('2d', { willReadFrequently: true });
    stations = [];
    measure();
    paintBackground();
  }
  // Columns and rows of the screen for the current tilt. Turning right pushes the right side away; tipping
  // down pushes the bottom away (its rows get shorter and narrower).
  function perspective() {
    if (Math.abs(tiltX - shownTiltX) < 1e-4 && Math.abs(tiltY - shownTiltY) < 1e-4) return;
    shownTiltX = tiltX; shownTiltY = tiltY;
    const near = baseNear - tiltX * .13, far = baseFar + tiltX * .11; let total = 0;
    for (let c = 0; c < fcols; c++) total += far + (near - far) * (c + .5) / fcols;
    for (let c = 0, x = 0; c < fcols; c++) { const k = far + (near - far) * (c + .5) / fcols; colW[c] = fw * k / total; colX[c] = x; x += colW[c]; colH[c] = fh * k / ((far + near) / 2); }
    let sum = 0;
    for (let r = 0; r < frows; r++) { const v = (r + .5) / frows - .5; rowH[r] = 1 - tiltY * .22 * v; rowS[r] = 1 - tiltY * .07 * v * 2; sum += rowH[r]; }
    for (let r = 0, y = 0; r < frows; r++) { rowH[r] /= sum / frows; rowY[r] = y / frows; y += rowH[r]; }
  }
  // Each project is a stop for the swarm. Some characters land on the project's words (one for every letter of
  // its title, tagline, description, details and links); the rest form its picture on a grid.
  function measure() {
    if (!fn) return;
    const old = stations;
    stations = [...root.querySelectorAll('.work')].map((work, k) => {
      const frameEl = work.querySelector('.work-frame'), glass = work.querySelector('.work-glass'), img = glass?.querySelector('img');
      if (!frameEl || !glass || !img) return null;
      const r = frameEl.getBoundingClientRect(), w = glass.clientWidth, h = glass.clientHeight;
      const chars = work._codeChars || [], T = Math.min(chars.length, Math.floor(fn * .4));
      const s = old[k] && old[k].w === w && old[k].h === h && old[k].T === T ? old[k] : { k, w, h, T, src: img.currentSrc || img.src };
      s.x = r.left + glass.clientLeft; s.y = r.top + scrollY + glass.clientTop; s.chars = chars;
      // Where every letter sits on the page.
      s.cx = new Float32Array(T); s.cy = new Float32Array(T); s.cwid = new Float32Array(T); s.chgt = new Float32Array(T);
      for (let j = 0; j < T; j++) { const b = chars[j].el.getBoundingClientRect(); s.cx[j] = b.left; s.cy[j] = b.top + scrollY; s.cwid[j] = b.width; s.chgt[j] = b.height; }
      if (!s.slot) {
        const cells = fn - T, unit = Math.sqrt(w * h / (cells * 1.6));
        s.gcols = Math.max(1, Math.floor(w / unit)); s.grows = Math.max(1, Math.floor(h / (unit * 1.6)));
        s.gn = s.gcols * s.grows; s.cw = w / s.gcols; s.ch = h / s.grows; s.rowVer = new Uint16Array(s.grows);
        // Letters take evenly spaced characters from the film, so every part of the picture sends some to the words.
        s.slot = new Int32Array(fn); s.charOf = new Int32Array(T);
        for (let i = 0, cell = 0; i < fn; i++) {
          const a = Math.floor(i * T / fn), b = Math.floor((i + 1) * T / fn);
          if (b > a) { s.slot[i] = -2 - a; s.charOf[a] = i; } else s.slot[i] = cell < s.gn ? cell++ : -1;
        }
        const im = new Image(); im.decoding = 'async'; im.onload = () => { sampleStation(s, im); paintCache(s); }; im.src = s.src;
      }
      return s;
    }).filter(Boolean);
    anchors = [0];
    stations.forEach(s => anchors.push(Math.max(anchors[anchors.length - 1] + H * .5, s.y + s.h / 2 - H / 2)));
    root._codeStops = anchors;
  }
  // A project picture, read on its grid: brightness and the nearest bright colour of every cell.
  function sampleStation(s, im) {
    const c = document.createElement('canvas'); c.width = s.gcols; c.height = s.grows;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0, s.gcols, s.grows);
    const px = g.getImageData(0, 0, s.gcols, s.grows).data;
    s.lum = new Float32Array(s.gn); s.shade = new Uint8Array(s.gn);
    for (let i = 0; i < s.gn; i++) {
      const r = px[i * 4], gg = px[i * 4 + 1], b = px[i * 4 + 2], m = (r + gg + b) / 3;
      s.lum[i] = (.2126 * r + .7152 * gg + .0722 * b) / 255;
      s.shade[i] = nearest(m + (r - m) * 1.7, m + (gg - m) * 1.7, m + (b - m) * 1.7, PALETTE.length);
    }
    // Stretch the picture's own range (most captures are dark interfaces) so its shapes read clearly in code.
    const sorted = Float32Array.from(s.lum).sort(), lo = sorted[Math.floor(s.gn * .3)], hi = Math.max(lo + .05, sorted[Math.floor(s.gn * .985)]);
    for (let i = 0; i < s.gn; i++) s.lum[i] = clamp((s.lum[i] - lo) / (hi - lo)) ** .75;
  }
  // The settled picture is painted once; a line is repainted when the scan line rewrites it.
  function paintCache(s) {
    if (!s.lum) return;
    s.cache = document.createElement('canvas'); s.cache.width = Math.round(s.w * dpr); s.cache.height = Math.round(s.h * dpr);
    s.g = s.cache.getContext('2d'); s.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let r = 0; r < s.grows; r++) paintRow(s, r);
  }
  function paintRow(s, r) {
    const g = s.g; if (!g) return;
    g.clearRect(0, r * s.ch, s.w, s.ch);
    for (let c = 0; c < s.gcols; c++) {
      const j = r * s.gcols + c, l = s.lum[j], ci = glyphAt(s, r, c); if (l < .035 || ci < 0) continue;
      const x = c * s.cw, y = r * s.ch, sh = s.shade[j];
      if (l > .08) { g.globalAlpha = l * .3; g.drawImage(blocks[sh], x, y, s.cw - .4, s.ch - .4); }
      g.globalAlpha = alphaFor(l); g.drawImage(atlases[sh], ci * cw * dpr, 0, cw * dpr, ch * dpr, x, y, s.cw, s.ch);
    }
    g.globalAlpha = 1;
  }
  function sample() {
    if (!video || video.readyState < 2 || !video.videoWidth) return;
    const s = Math.max(fcols / video.videoWidth, frows / video.videoHeight), w = video.videoWidth * s, h = video.videoHeight * s;
    sctx.drawImage(video, (fcols - w) / 2, (frows - h) / 2, w, h);
    const px = sctx.getImageData(0, 0, fcols, frows).data;
    let lo = 1, hi = 0;
    for (let i = 0; i < fn; i++) {
      const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2], l = (.2126 * r + .7152 * g + .0722 * b) / 255;
      lum[i] = l; if (l < lo) lo = l; if (l > hi) hi = l;
      const m = (r + g + b) / 3; shade[i] = nearest(m + (r - m) * 1.8, m + (g - m) * 1.8, m + (b - m) * 1.8, 9);
    }
    range.lo += (lo - range.lo) * .2; range.hi += (Math.max(range.lo + .12, hi) - range.hi) * .2;
    for (let i = 0; i < fn; i++) lum[i] = Math.max(0, Math.min(1, (lum[i] - range.lo) / (range.hi - range.lo)));
  }
  // A playback HUD around the film: corner brackets, timecode, frame counter and a decoding status line.
  function hud(alpha, top) {
    if (alpha < .02) return;
    const x0 = fx0, x1 = fx0 + fw, hL = colH[0], hR = colH[fcols - 1], yL = top + fh / 2 - hL / 2, yR = top + fh / 2 - hR / 2, k = 16;
    ctx.globalAlpha = alpha * .8; ctx.strokeStyle = '#8fd8ff'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0 - 8, yL - 8 + k); ctx.lineTo(x0 - 8, yL - 8); ctx.lineTo(x0 - 8 + k, yL - 8);
    ctx.moveTo(x1 + 8 - k, yR - 10); ctx.lineTo(x1 + 8, yR - 10); ctx.lineTo(x1 + 8, yR - 10 + k);
    ctx.moveTo(x1 + 8 - k, yR + hR + 10); ctx.lineTo(x1 + 8, yR + hR + 10); ctx.lineTo(x1 + 8, yR + hR + 10 - k);
    ctx.stroke();
    const t = video?.currentTime || 0, f = Math.floor(t * 24), tc = `00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(f % 24).padStart(2, '0')}`;
    ctx.font = `400 10px ui-monospace, 'SF Mono', Menlo, monospace`; ctx.fillStyle = '#8fd8ff'; ctx.textBaseline = 'bottom';
    ctx.globalAlpha = alpha * .9; ctx.fillText(`● PLAY  ${tc}`, x0 - 8, yL - 16);
    ctx.textAlign = 'right'; ctx.globalAlpha = alpha * .7; ctx.fillText(`FRAME ${String(f).padStart(4, '0')} / 0515`, x1 + 8, yR - 18);
    ctx.textBaseline = 'top'; ctx.globalAlpha = alpha * .55;
    ctx.fillText(`decode ${fcols}×${frows} · 24fps · ${scan >= 0 ? 'rewriting line ' + String(Math.floor(scan * frows)).padStart(2, '0') : 'idle'}`, x1 + 8, yR + hR + 18);
    const dur = video?.duration || 21.5;
    const px0 = x1 + 8 - fw * .3, py0 = yR + hR + 34;
    ctx.textAlign = 'left'; ctx.globalAlpha = alpha * .35; ctx.fillRect(px0, py0, fw * .3, 1);
    ctx.globalAlpha = alpha * .9; ctx.fillRect(px0, py0, fw * .3 * (t / dur), 1);
    ctx.globalAlpha = 1;
  }
  // Where character i sits at stop st (0 = the film, then each project), written into o.
  function stop(st, i, sY, o) {
    o.txt = 0;
    if (st === 0) {
      const r = (i / fcols) | 0, c = i - r * fcols, gw = colW[c] * rowS[r], gh = colH[c] * rowH[r] / frows;
      let x = fx0 + fw / 2 + (colX[c] - fw / 2) * rowS[r] - tiltX * 10, y = frameMid - sY - colH[c] / 2 + rowY[r] * colH[c] - tiltY * 6;
      if (r === glitchRow) x += glitchShift;
      const local = reduced ? 1 : clamp((assembleT - delay[i]) / 1.1), e = 1 - (1 - local) ** 3;
      o.x = sx[i] + (x - sx[i]) * e; o.y = sy[i] + (y - sy[i]) * e; o.w = gw; o.h = gh; o.e = e;
      o.l = lum[i]; o.sh = shade[i]; o.ci = codeAt(r * 977 + c + rowVer[r] * fcols * 13); o.on = 1; o.r = r;
      return;
    }
    const s = stations[st - 1], slot = s.slot[i];
    o.e = 1; o.r = -1;
    if (slot <= -2) {
      // A letter: a code glyph the height of the letter, centred on it.
      const j = -2 - slot, h = s.chgt[j] * .82, w = Math.min(s.cwid[j], h / 1.6);
      o.x = s.cx[j] + (s.cwid[j] - w) / 2; o.y = s.cy[j] - sY + (s.chgt[j] - h) / 2; o.w = w; o.h = h;
      o.l = .95; o.sh = s.chars[j].big ? 6 : 3; o.ci = codeAt(i * 31 + j); o.on = 1; o.txt = 1;
      return;
    }
    o.w = s.cw; o.h = s.ch;
    if (slot < 0 || !s.lum) { o.on = 0; o.x = s.x + seed[i] * s.w; o.y = s.y - sY + (drift[i] + .5) * s.h; o.l = 0; o.sh = 0; o.ci = -1; return; }
    const r = (slot / s.gcols) | 0, c = slot - r * s.gcols;
    o.x = s.x + c * s.cw; o.y = s.y - sY + r * s.ch; o.l = s.lum[slot]; o.sh = s.shade[slot]; o.ci = glyphAt(s, r, c); o.on = 1;
  }
  // How far along its flight character i is when the leg has progressed by q.
  // How bright a character is once it has landed.
  const restA = o => o.txt ? .85 : o.on && o.l >= .035 ? alphaFor(o.l) : 0;
  const flight = (i, q) => { if (reduced) return q > .5 ? 1 : 0; const t = clamp((q - leave[i] * .5) / .5); return t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; };
  function draw() {
    // Things sit where the page is (sY); the journey runs on vY, which follows the scroll at a limited speed.
    const sY = scrollY, jY = vY < 0 ? sY : vY, now = performance.now();
    lastY = sY;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bgCache, 0, 0, W, H);
    // Which leg of the journey: between stop k and stop k + 1, with the flight in the middle of the leg.
    let k = 0; while (k < anchors.length - 1 && jY >= anchors[k + 1]) k++;
    const lastStop = k >= anchors.length - 1, p = lastStop ? 0 : (jY - anchors[k]) / (anchors[k + 1] - anchors[k]);
    let q = lastStop ? 0 : k === 0 ? clamp((p - .06) / .94) : clamp((p - .15) / .7);
    let from = k, to = k + 1;
    if (q >= .995) { from = to; q = 0; }
    const flying = q > 0; wasFlying = flying || from === 0;
    // Each project's words: present where the swarm rests, forming or dissolving where it is flying.
    for (const s of stations) {
      const st = s.k + 1;
      for (let j = 0; j < s.T; j++) {
        const c = s.chars[j], i = s.charOf[j];
        const e = !flying ? (from === st ? 1 : 0) : st === from ? 1 - flight(i, q) : st === to ? flight(i, q) : 0;
        let state;
        if (e >= .999) { if (!c.arrived) c.arrived = now; state = now - c.arrived > c.wait ? 2 : 1; }
        else { c.arrived = 0; state = e > .8 ? 1 : 0; }
        if (state === 1 && c.state === 1 && Math.random() < .5) continue;
        setChar(c, state);
      }
    }
    // Project pictures: full where the swarm rests, a faint trace elsewhere.
    for (const s of stations) {
      if (!s.cache) continue;
      const y = s.y - sY; if (y > H || y + s.h < 0) continue;
      const st = s.k + 1;
      ctx.globalAlpha = !flying && from === st ? 1 : st === from ? GHOST * q : st === to && flying ? GHOST * (1 - q) : GHOST;
      ctx.drawImage(s.cache, s.x, y, s.w, s.h);
      // A scan line walks down the resting picture and rewrites each line it passes.
      if (!flying && from === st && scan >= 0) {
        const r = Math.min(s.grows - 1, Math.floor(scan * s.grows));
        if (s.scanRow !== r) { s.scanRow = r; s.rowVer[r]++; paintRow(s, r); }
        for (let c = 0; c < s.gcols; c++) {
          const ci = glyphAt(s, r, c); if (ci < 0) continue;
          ctx.globalAlpha = s.lum[r * s.gcols + c] < .035 ? .35 : .95;
          ctx.drawImage(scanAtlas, ci * cw * dpr, 0, cw * dpr, ch * dpr, s.x + c * s.cw, y + r * s.ch, s.cw, s.ch);
        }
      }
    }
    ctx.globalAlpha = 1;
    // The characters themselves: while the film plays, and during every flight.
    if (from === 0 || flying) {
      const filmRow = from === 0 && !flying && scan >= 0 ? Math.floor(scan * frows) : -1;
      for (let i = 0; i < fn; i++) {
        stop(from, i, sY, A);
        const m = flying ? flight(i, q) : 0;
        if (m > 0) stop(to, i, sY, B);
        // Letters resting in place are the page's own text; only moving ones are drawn.
        if ((m === 0 && A.txt) || (m >= 1 && B.txt)) continue;
        let x = A.x, y = A.y, w = A.w, h = A.h, src = A, presence = A.on;
        if (m >= 1) { x = B.x; y = B.y; w = B.w; h = B.h; src = B; presence = B.on; }
        else if (m > 0) {
          const bend = Math.sin(Math.PI * m);
          x += (B.x - x) * m + drift[i] * bend * W * .16; y += (B.y - y) * m + bend * (seed[i] - .2) * H * .2;
          w += (B.w - w) * m; h += (B.h - h) * m; if (m > .5) src = B; presence = A.on + (B.on - A.on) * m;
          // Letters fade into (and out of) the real text at either end.
          if (A.txt) presence *= clamp(m / .12);
          if (B.txt) presence *= clamp((1 - m) / .12);
        }
        const ci = src.ci; if (ci < 0 || presence <= 0) continue;
        if (y > H + h || y < -h || x > W + w || x < -w) continue;
        const l = src.l, settled = src.e > .98, still = m === 0 || m >= 1, scanned = filmRow >= 0 && settled && m === 0 && src.r === filmRow;
        if (settled && still && l < .035 && !scanned) continue; // the darkest cells stay empty
        let a = alphaFor(l);
        if (!settled) a = Math.max(a, .25) * (.4 + .6 * src.e);
        // In flight: blend from the brightness it had to the one it will have, plus a little in mid-air.
        if (!still) a = Math.max(restA(A) + (restA(B) - restA(A)) * m, .36 * Math.sin(Math.PI * m));
        a *= presence;
        if (settled && still && l > .08) { ctx.globalAlpha = l * .3 * presence; ctx.drawImage(blocks[src.sh], x, y, w - .4, h - .4); }
        ctx.globalAlpha = scanned ? 1 : a;
        if (src.txt && h > ch * 1.6) ctx.drawImage(bigAtlas[src.sh === 6 ? 1 : 0], ci * BW * dpr, 0, BW * dpr, BH * dpr, x, y, w, h);
        else ctx.drawImage(scanned ? scanAtlas : atlases[src.sh], ci * cw * dpr, 0, cw * dpr, ch * dpr, x, y, w, h);
      }
      ctx.globalAlpha = 1;
    }
    if (k === 0) { ctx.save(); ctx.translate(-tiltX * 10, -tiltY * 6); hud((1 - Math.min(1, p / .12)) * clamp((assembleT - ASSEMBLE) / .8), frameMid - fh / 2 - sY); ctx.restore(); }
  }
  function loop(ts) {
    frame = 0; if (document.hidden) return;
    const dt = last ? Math.min((ts - last) / 1000, .05) : 1 / 60; last = ts;
    if (!reduced) {
      assembleT += dt;
      // Once assembled, a scan line walks down whatever the swarm has formed; each line it passes is rewritten.
      if (assembleT > ASSEMBLE + 1.2) {
        if (scan < 0) { scanWait -= dt; if (scanWait <= 0) scan = 0; }
        else {
          const before = Math.floor(scan * frows); scan += dt * SCAN_RATE; const now = Math.floor(Math.min(scan, 1) * frows);
          for (let r = before; r < Math.min(now, frows); r++) rowVer[r]++;
          if (scan >= 1) { scan = -1; scanWait = SCAN_PAUSE; stations.forEach(s => { s.scanRow = -1; }); }
        }
      }
      // Now and then one line of the film glitches sideways for a moment.
      glitchT -= dt;
      if (glitchT <= 0) { if (glitchRow >= 0) { glitchRow = -1; glitchT = 1.5 + Math.random() * 3; } else { glitchRow = Math.floor(Math.random() * frows); glitchShift = (Math.random() - .5) * 40; glitchT = .08 + Math.random() * .08; } }
    }
    // The screen leans after the pointer slowly, like something with weight.
    const ease = 1 - Math.exp(-dt * 3.2);
    tiltX += (aimX - tiltX) * ease; tiltY += (aimY - tiltY) * ease;
    if (scrollY < (anchors[1] ?? H)) perspective();
    // However fast the page is flung, the swarm travels at most about one screen every 1.6 seconds.
    if (vY < 0 || reduced) vY = scrollY;
    else {
      const gap = scrollY - vY, max = Math.max(420, H * .62) * dt;
      if (Math.abs(gap) > H * 2.2) vY = scrollY - Math.sign(gap) * H * 2.2; // far behind: skip ahead, then travel
      else { vY += Math.max(-max, Math.min(max, gap * (1 - Math.exp(-dt * 5)))); if (Math.abs(scrollY - vY) < .5) vY = scrollY; }
    }
    sampleAcc += dt; drawAcc += dt;
    if (scrollY < (anchors[1] ?? H) && sampleAcc > 1 / 24) { sampleAcc = 0; sample(); }
    // Scrolling redraws every frame, so the code stays locked to the page; otherwise 24 frames a second.
    // (While thousands of characters are in the air, at most 45 frames a second.)
    if (drawAcc > 1 / 24 || ((scrollY !== lastY || vY !== scrollY) && (!wasFlying || drawAcc > 1 / 45))) { drawAcc = 0; draw(); }
    frame = requestAnimationFrame(loop);
  }
  const start = () => { if (!frame && !document.hidden && text) { last = 0; frame = requestAnimationFrame(loop); } };
  on(window, 'resize', () => { if (!text) return; layout(); assembleT = ASSEMBLE + 2; draw(); }, { passive: true });
  on(document, 'visibilitychange', () => { if (document.hidden) video?.pause(); else { if (!reduced) video?.play().catch(() => {}); start(); } });
  on(media, 'change', e => { reduced = e.matches; });
  // The pointer (anywhere on the first screen) or, on phones, the way the phone is held tilts the screen a little.
  on(window, 'pointermove', e => { if (e.pointerType !== 'mouse' || reduced) return; aimX = (e.clientX / W - .5) * 2; aimY = (e.clientY / H - .5) * 2; }, { passive: true });
  on(document, 'pointerleave', () => { aimX = aimY = 0; });
  const lim = v => Math.max(-1, Math.min(1, v));
  on(window, 'deviceorientation', e => { if (reduced || e.gamma == null) return; aimX = lim(e.gamma / 25); aimY = lim((e.beta - 45) / 25); }, { passive: true });
  // iPhone asks once for motion access; the first tap on the first screen requests it.
  const DOE = window.DeviceOrientationEvent;
  if (DOE && typeof DOE.requestPermission === 'function') root.querySelector('.proj-hero')?.addEventListener('touchend', () => DOE.requestPermission().catch(() => {}), { once: true, signal: controller.signal });
  // Fonts and images can move the frames after the first measure.
  const ro = new ResizeObserver(() => { if (text) measure(); });
  ro.observe(root);
  // While a project is in view, the background code leans toward its colour.
  const toneObserver = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) { const next = en.target.dataset.tone || ''; if (next !== tone) { tone = next; if (text) paintBackground(); } }
  }, { rootMargin: '-45% 0px -45% 0px' });
  root.querySelectorAll('[data-tone]').forEach(el => toneObserver.observe(el));
  video?.play().catch(() => {});
  fetch('/assets/life-code.json').then(r => r.json()).then(json => { text = json.life; layout(); start(); }).catch(() => {});
  return () => { controller.abort(); cancelAnimationFrame(frame); toneObserver.disconnect(); ro.disconnect(); video?.pause(); };
}

// Words on this page are written over code. Each character is wrapped and can be absent, scrambled or itself.
// A scrambled character keeps the page's own typeface: Latin letters turn into other letters, digits and code
// symbols, Chinese characters into other characters from the page. The projects' words are formed by the code
// swarm (mountCodeField decides when each letter arrives); every other block decodes in a sweep as it comes
// into view and scrambles away as it leaves. Resolved text still flickers back now and then, and on the larger
// titles the letters near the cursor scramble as it passes.
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789{}<>/=+*#;:_';
let HAN = '码代日常顺手点美记忆碎片触可及整理照应用节奏重温留下张或先放到边每个小选择都会慢累积成看见长名字取自女神轻装守护性能归你量内存异追踪工具持续录各进程走势按增期趋识别疑泄漏并直接处置窗口驻只占约';
const pickFor = c => c.han ? HAN[Math.floor(Math.random() * HAN.length)] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
function setChar(c, state) {
  if (c.state === state && state !== 1) return;
  if (state === 1) c.el.dataset.g = pickFor(c);
  if (c.state !== state) { c.el.className = state === 2 ? 'cx' : state === 1 ? 'cx g' : 'cx h'; c.state = state; }
}
function mountCodeText(root) {
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const controller = new AbortController(), on = (t, n, f, o = {}) => t.addEventListener(n, f, { ...o, signal: controller.signal });
  const GROUPS = [
    ['.proj-hero-copy', '.proj-kicker, h1, .proj-slogan, .proj-lede', 1],
    ['.proj-section-head', 'span, small', 0],
    ['.work', '.work-no, h2, .work-tagline, .work-text, .work-meta .brace, .work-meta dt, .work-meta dd, .work-links a, .work-caption', 0, true],
    ['.archive-list li', '.archive-year, .archive-title, .archive-cat, .archive-text', 0],
  ];
  const groups = [], all = [];
  function wrap(el, big) {
    const chars = [], label = document.createElement('span');
    label.className = 'cx-sr'; label.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) if (!walker.currentNode.parentElement.closest('[aria-hidden="true"]')) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const box = document.createElement('span'); box.setAttribute('aria-hidden', 'true');
      for (const c of node.textContent) {
        if (/\s/.test(c)) { box.append(c); continue; }
        const s = document.createElement('span'); s.className = 'cx'; s.textContent = c; box.append(s);
        chars.push({ el: s, th: 0, state: 2, until: 0, han: c.charCodeAt(0) > 0x2e80 && c.charCodeAt(0) < 0xff00, big, arrived: 0, wait: 120 + Math.random() * 620 });
      }
      node.replaceWith(box);
    }
    chars.forEach((c, i) => { c.th = (i / Math.max(1, chars.length)) * .5 + Math.random() * .2; });
    el.prepend(label);
    return chars;
  }
  for (const [box, sel, hero, driven] of GROUPS) root.querySelectorAll(box).forEach(container => {
    const parts = [...container.querySelectorAll(sel)].filter(el => el.textContent.trim()).map(el => ({ el, chars: wrap(el, el.matches('h2, .work-tagline')) }));
    if (!parts.length) return;
    // A project's letters are handed to the code swarm, in reading order.
    if (driven) { container._codeChars = parts.flatMap(p => p.chars); if (!reduced) container._codeChars.forEach(c => setChar(c, 0)); return; }
    const g = { container, parts, v: reduced ? 1 : 0, target: reduced ? 1 : 0, hero, nextGlitch: 0, seen: false };
    parts.forEach(p => all.push(...p.chars));
    groups.push(g);
  });
  // Chinese characters scramble into others from this page, so the typeface never changes.
  HAN = [...new Set([...root.querySelectorAll('.cx')].map(el => el.textContent).filter(ch => /[\u4e00-\u9fff]/.test(ch)))].join('') || HAN;
  if (reduced) return () => controller.abort();
  all.forEach(c => setChar(c, 0));
  const io = new IntersectionObserver(entries => entries.forEach(e => { const g = groups.find(x => x.container === e.target); if (g) { g.target = e.isIntersecting ? 1 : 0; if (e.isIntersecting) wake(); } }), { rootMargin: '-10% 0px -10% 0px' });
  groups.forEach(g => io.observe(g.container));
  // The cursor scrambles the letters of large titles near it.
  let pointer = null;
  const near = [...root.querySelectorAll('.proj-hero h1, .proj-slogan, .work h2')];
  near.forEach(el => {
    on(el, 'pointermove', e => { if (e.pointerType === 'mouse') { pointer = { x: e.clientX, y: e.clientY, el }; wake(); } }, { passive: true });
    on(el, 'pointerleave', () => { pointer = null; });
  });
  let frame = 0, last = 0, acc = 0;
  function tick(ts) {
    frame = 0;
    const dt = last ? Math.min((ts - last) / 1000, .05) : 1 / 60; last = ts; acc += dt;
    if (acc < 1 / 30) { frame = requestAnimationFrame(tick); return; }
    const step = acc; acc = 0;
    let busy = !!pointer;
    for (const g of groups) {
      // Coming in takes a little over a second; leaving is quicker.
      const speed = g.target > g.v ? step / (g.hero ? 2.4 : 1.7) : step / .6;
      if (g.v !== g.target) { g.v = g.target > g.v ? Math.min(g.target, g.v + speed) : Math.max(g.target, g.v - speed); busy = true; }
      if (g.v === 0 && g.target === 0 && !g.dirty) continue;
      g.dirty = g.v > 0;
      const n = g.parts.length, off = Math.min(.08, .45 / n), span = 1 - off * (n - 1);
      // Now and then a few resolved letters flicker back into code.
      if (g.v === 1 && ts > g.nextGlitch) {
        const part = g.parts[Math.floor(Math.random() * n)], len = part.chars.length;
        if (len) { const at = Math.floor(Math.random() * len), run = 1 + Math.floor(Math.random() * 3), hold = g.hero ? 260 + Math.random() * 520 : 120 + Math.random() * 200; for (let i = at; i < Math.min(len, at + run); i++) part.chars[i].until = ts + hold; }
        g.nextGlitch = ts + (g.hero ? 110 + Math.random() * 260 : 900 + Math.random() * 2200);
      }
      g.parts.forEach((part, pi) => {
        const ve = clamp01((g.v - pi * off) / span);
        let rect = null;
        if (pointer && pointer.el === part.el) rect = true;
        for (const c of part.chars) {
          let state = ve >= c.th + .28 ? 2 : ve >= c.th ? 1 : 0;
          if (state === 1) busy = true;
          if (state === 2 && c.until > ts) { state = 1; busy = true; }
          if (state === 2 && rect) {
            const r = c.el.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - pointer.x, r.top + r.height / 2 - pointer.y);
            if (d < 90 && Math.random() < 1 - d / 90) state = 1;
          }
          if (state === 1 && c.state === 1 && Math.random() < .5) continue; // glyphs change at about half the rate
          setChar(c, state);
        }
      });
    }
    if (busy || groups.some(g => g.v === 1)) frame = requestAnimationFrame(tick);
  }
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  function wake() { if (!frame) { last = 0; frame = requestAnimationFrame(tick); } }
  wake();
  return () => { controller.abort(); io.disconnect(); cancelAnimationFrame(frame); };
}

export function mountProject(root, data) {
  const list = data.projects;
  mountMist();
  const controller = new AbortController(), on = (t, n, f, o = {}) => t.addEventListener(n, f, { ...o, signal: controller.signal });
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const disposeText = mountCodeText(root);
  const disposeCode = mountCodeField(root);

  // Like the homepage: after 1 second without input, a page left between two stops (the top, then each
  // project) glides to the nearest one. The list of earlier works and the footer are left alone.
  let idle = 0, settling = false, glideFrame = 0;
  const stopGlide = () => { cancelAnimationFrame(glideFrame); glideFrame = 0; settling = false; };
  function glide(to, duration) {
    stopGlide(); settling = true;
    const from = scrollY, t0 = performance.now(), ease = x => x < .5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2;
    const step = now => {
      const k = Math.min(1, (now - t0) / duration);
      scrollTo({ top: from + (to - from) * ease(k), behavior: 'instant' });
      if (k < 1) glideFrame = requestAnimationFrame(step); else { glideFrame = 0; setTimeout(() => { settling = false; }, 80); }
    };
    glideFrame = requestAnimationFrame(step);
  }
  function settle() {
    const stops = root._codeStops || [];
    if (reduced || stops.length < 2 || glideFrame) return;
    if (scrollY > stops[stops.length - 1] + innerHeight * .35) return;
    let to = stops[0]; stops.forEach(t => { if (Math.abs(t - scrollY) < Math.abs(to - scrollY)) to = t; });
    const gap = to - scrollY;
    if (Math.abs(gap) < 4) return;
    glide(to, Math.min(2400, 1100 + Math.abs(gap) * 1.6));
  }
  const wait = () => { clearTimeout(idle); if (!settling) idle = setTimeout(settle, 1000); };
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(type => on(window, type, () => { if (glideFrame) stopGlide(); }, { passive: true }));
  on(window, 'scroll', () => { if (!settling) wait(); }, { passive: true });
  ['wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown'].forEach(type => on(window, type, wait, { passive: true }));

  // Frames lean toward the pointer, with weight.
  const frames = [...root.querySelectorAll('.work-frame')];
  let frame = 0;
  const state = frames.map(() => ({ tx: 0, ty: 0, x: 0, y: 0, vx: 0, vy: 0 }));
  function tick() {
    frame = 0; let moving = false;
    frames.forEach((el, i) => {
      const s = state[i];
      s.vx += ((s.tx - s.x) * 120 - s.vx * 16) / 60; s.vy += ((s.ty - s.y) * 120 - s.vy * 16) / 60;
      s.x += s.vx / 60; s.y += s.vy / 60;
      el.style.setProperty('--rx', `${(-s.y * 9).toFixed(2)}deg`); el.style.setProperty('--ry', `${(s.x * 12).toFixed(2)}deg`);
      if (Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) + Math.abs(s.vx) + Math.abs(s.vy) > .002) moving = true;
    });
    if (moving) frame = requestAnimationFrame(tick);
  }
  const wake = () => { if (!frame && !reduced) frame = requestAnimationFrame(tick); };
  frames.forEach((el, i) => {
    on(el, 'pointermove', e => { if (e.pointerType !== 'mouse') return; const r = el.getBoundingClientRect(); state[i].tx = (e.clientX - r.left) / r.width - .5; state[i].ty = (e.clientY - r.top) / r.height - .5; wake(); }, { passive: true });
    on(el, 'pointerleave', () => { state[i].tx = 0; state[i].ty = 0; wake(); });
    // The real picture shows on hover; on touch screens the first tap shows it and the second opens the link.
    on(el, 'pointerdown', e => { el.dataset.touch = e.pointerType === 'mouse' ? '' : '1'; });
    on(el, 'click', e => { if (el.dataset.touch && !el.classList.contains('is-real')) { e.preventDefault(); frames.forEach(f => f.classList.toggle('is-real', f === el)); } });
  });

  // Earlier works: a preview follows the cursor beside the hovered row.
  const preview = root.querySelector('.archive-preview');
  let px = 0, py = 0, cx = 0, cy = 0, pf = 0;
  const follow = () => { pf = 0; cx += (px - cx) * .16; cy += (py - cy) * .16; preview.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0) translate(-50%,-50%)`; if (Math.abs(px - cx) + Math.abs(py - cy) > .5) pf = requestAnimationFrame(follow); };
  root.querySelectorAll('.archive-row').forEach(row => {
    on(row, 'pointerenter', e => { if (e.pointerType !== 'mouse' || !preview) return; if (preview.getAttribute('src') !== row.dataset.preview) preview.src = row.dataset.preview; if (!preview.classList.contains('is-on')) { cx = px = e.clientX + 170; cy = py = e.clientY; } preview.classList.add('is-on'); follow(); });
    on(row, 'pointermove', e => { px = e.clientX + 170; py = e.clientY; if (!pf) pf = requestAnimationFrame(follow); }, { passive: true });
    on(row, 'pointerleave', () => preview?.classList.remove('is-on'));
  });
  on(window, 'scroll', () => preview?.classList.remove('is-on'), { passive: true });
  return () => { controller.abort(); clearTimeout(idle); cancelAnimationFrame(glideFrame); cancelAnimationFrame(frame); cancelAnimationFrame(pf); disposeCode(); disposeText(); };
}
