import { mountMist } from './poetry.js';

const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dated = date => `${date.slice(5, 7)}/${date.slice(8, 10)}/${date.slice(0, 4)}`;

const SOCIAL = [
  { name: 'GitHub', href: 'https://github.com/yifanwow' },
  { name: 'Instagram', href: 'https://instagram.com/yifanovo_' },
  { name: 'Steam', href: 'https://steamcommunity.com/id/yifanovo/' },
  { name: '小红书', href: 'https://www.xiaohongshu.com/user/profile/5b2eb172f7e8b940e52e00c2' },
];

// One full-screen section per door. Each has a "mode": how the clock's tick marks behave while it is in view.
function sections(data) {
  const years = data.poems.map(p => Number(p.year)), latest = data.poems[0];
  const firstLine = (latest?.excerpt || '').split('\n')[0].replace(/[，、；：,;:]+$/, '');
  return [
    { mode: 'rain', cn: '诗歌', en: 'Poetry', href: '/poetry', text: '无关风月。<br>字里行间，都是我青春无数的瞬间。', meta: `${data.poems.length} 首 · ${Math.min(...years)}—${Math.max(...years)}`,
      extra: latest ? `<p class="door-quote"><time datetime="${latest.date}">${dated(latest.date)}</time><span>「${esc(firstLine)}」</span></p>` : '' },
    { mode: 'build', cn: '项目', en: 'Projects', href: '/project', text: '科技之美。<br>创造与实现，进步就在指尖。', meta: `${data.projects.length} 个作品`,
      extra: `<ul class="door-list">${data.projects.slice(0, 5).map(p => `<li><span>${esc(p.title)}</span><small>${esc(p.category)}</small></li>`).join('')}</ul>` },
    { mode: 'lens', cn: '摄影', en: 'Photography', href: '/photos', text: '我眼中的世界。', meta: `${data.photos.length} 张`,
      extra: `<div class="door-photos">${data.photos.slice(0, 3).map(p => `<img src="${p.src}" alt="${esc(p.title)}" loading="lazy">`).join('')}</div>` },
    { mode: 'room', cn: '家居', en: 'Home', text: 'Caer Fannos，<br>属于我回忆的归处，收藏我人生的过往。' },
    { mode: 'film', cn: '影视', en: 'Film', text: 'Your mind is a walled garden，<br>even death cannot touch the flowers blooming there.' },
    { mode: 'sound', cn: '音乐', en: 'Music', text: '让我们在熏风送香的海滨，<br>再次相遇吧。' },
  ];
}

export function homeLanding(data) {
  const list = sections(data);
  const social = SOCIAL.map(s => `<a href="${s.href}" target="_blank" rel="noopener noreferrer">${esc(s.name)}<span aria-hidden="true">↗</span></a>`).join('')
    + `<span class="wechat"><button type="button" aria-describedby="wechat-qr">公众号<span aria-hidden="true">+</span></button><span class="wechat-qr" id="wechat-qr" role="tooltip"><img src="/assets/wechat-qr.jpg" alt="微信公众号二维码" width="143" height="143" loading="lazy"><small>微信扫一扫</small></span></span>`;
  const doors = list.map((s, i) => {
    const side = i % 2 ? 'is-right' : 'is-left'; // text side; the clock takes the other half
    const action = s.href ? `<a class="door-link" href="${s.href}">进入${s.cn}<span aria-hidden="true">→</span></a>` : '<span class="door-soon">即将到来</span>';
    return `<section class="home-door ${side}${s.href ? '' : ' is-soon'}" data-mode="${s.mode}" aria-labelledby="door-${i}">
      <div class="door-copy">
        <span class="door-no">${String(i + 1).padStart(2, '0')} <i>/</i> ${String(list.length).padStart(2, '0')}</span>
        <h2 id="door-${i}"><span class="door-cn">${s.cn}</span><span class="door-en">${s.en}</span></h2>
        <p class="door-text">${s.text}</p>
        ${s.extra || ''}
        <div class="door-foot">${s.meta ? `<span class="door-meta">${esc(s.meta)}</span>` : ''}${action}</div>
      </div>
    </section>`;
  }).join('');
  const rail = ['此刻', ...list.map(x => x.cn)].map((name, i) => `<button type="button" data-stop="${i}" aria-label="${name}"><i></i><span>${String(i).padStart(2, '0')} ${name}</span></button>`).join('');
  return `<canvas class="home-clock" aria-hidden="true"></canvas>
  <nav class="home-rail" aria-label="首页栏目">${rail}</nav>
  <section class="home-hero" data-mode="time" aria-labelledby="home-name">
    <span class="hero-tag hero-tag-left" aria-hidden="true">0119 · 起始</span>
    <span class="hero-tag hero-tag-right"><span class="field-clock"></span></span>
    <div class="hero-foot">
      <div class="hero-id"><p class="hero-thought">The Future named Past<br>无数过往回忆，引领此刻你我的相遇。</p><h1 id="home-name"><span class="name-en">Yifan Yu</span><span class="name-dot" aria-hidden="true">·</span><span class="name-cn">叙己</span></h1><p class="hero-intro">一个现实的浪漫主义者。<small>A REALISTIC ROMANTIC.</small></p></div>
      <nav class="hero-social" aria-label="社交媒体">${social}</nav>
    </div>
  </section>
  ${doors}`;
}

/* ---------- Time ----------
   About 640 thin line parts drawn in 3D on one fixed canvas. On the first screen they form time itself:
   a spiral of the past receding into depth, the bright ring of the present (its warm point is the real
   second), and a sparse dashed future continuing the same curve toward the viewer. Scrolling pulls the parts
   apart and reassembles them into a different object for each section: rain, a gear construction, a lens,
   a room, a film loop, a sphere of sound. */
const N = 820;
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = t => t * t * (3 - 2 * t);
const mix = (a, b, w) => a + (b - a) * w;
const hash = i => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
// Where a hidden part waits: a point scattered through the volume, so parts appear out of the air.
const REST = Array.from({ length: N }, (_, i) => { const u = hash(i) * TAU, v = Math.acos(2 * hash(i + 911) - 1), r = .4 + .9 * Math.cbrt(hash(i + 1733)); return [Math.cos(u) * Math.sin(v) * r, Math.sin(u) * Math.sin(v) * r, Math.cos(v) * r]; });
// The direction each part drifts while travelling between scenes.
const DRIFT = Array.from({ length: N }, (_, i) => { const u = hash(i + 41) * TAU, v = Math.acos(2 * hash(i + 97) - 1); return [Math.cos(u) * Math.sin(v), Math.sin(u) * Math.sin(v), Math.cos(v)]; });
const DELAY = Array.from({ length: N }, (_, i) => hash(i + 313));

// Each scene fills out[i*8 ...] = x1, y1, z1, x2, y2, z2, brightness, warmth for every part.
function put(out, i, x1, y1, z1, x2, y2, z2, a, warm = 0) { const o = i * 8; out[o] = x1; out[o + 1] = y1; out[o + 2] = z1; out[o + 3] = x2; out[o + 4] = y2; out[o + 5] = z2; out[o + 6] = a; out[o + 7] = warm; }
function rest(out, from) { for (let i = from; i < N; i++) { const [x, y, z] = REST[i]; put(out, i, x, y, z, x, y, z, 0); } }
function arc(out, i, count, fn) { for (let k = 0; k < count; k++) { const p = fn(k / count), q = fn((k + 1) / count); put(out, i + k, p[0], p[1], p[2], q[0], q[1], q[2], p[3], p[4] || 0); } return i + count; }

const SCENES = {
  // Past, present, future.
  time(out, t, clock) {
    let i = 0;
    const sec = clock.sec, now = sec * TAU - Math.PI / 2, TURNS = 5;
    // The past: a spiral coiling around the time axis, receding into depth.
    const past = u => { const a = now - (1 - u) * TURNS * TAU, r = .28 + .72 * u ** 1.25, z = -1.9 * (1 - u); return [Math.cos(a) * r, Math.sin(a) * r, z, .05 + .5 * u ** 1.8, u > .992 ? 1 : 0]; };
    i = arc(out, i, 300, past);
    // Fragments of the past: small frames floating along the spiral, like moments already lived.
    for (const u of [.18, .32, .46, .6, .72, .84]) {
      const [x, y, z] = past(u), w = .1 + .06 * u, h = w * .66, tilt = u * 4;
      const c = Math.cos(tilt), s = Math.sin(tilt), P = [[-w, -h], [w, -h], [w, h], [-w, h]].map(([px, py]) => [x + px * c - py * s, y + px * s + py * c, z]);
      P.forEach((p, k) => { const q = P[(k + 1) % 4]; put(out, i++, ...p, ...q, .16 + .28 * u); });
    }
    // The dial: minute track, plate edge, and a faint sunburst like a guilloché dial.
    for (let k = 0; k < 120; k++) {
      const a = k / 120 * TAU - Math.PI / 2, major = k % 10 === 0, isNow = k === Math.round(sec * 120) % 120;
      put(out, i++, Math.cos(a) * (major ? .86 : .92), Math.sin(a) * (major ? .86 : .92), 0, Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0, isNow ? 1 : major ? .7 : .3, isNow ? 1 : 0);
    }
    i = arc(out, i, 72, u => [Math.cos(u * TAU) * 1.04, Math.sin(u * TAU) * 1.04, -.01, .3]);
    i = arc(out, i, 60, u => [Math.cos(u * TAU) * .62, Math.sin(u * TAU) * .62, -.01, .14]);
    for (let k = 0; k < 48; k++) { const a = k / 48 * TAU; put(out, i++, Math.cos(a) * .2, Math.sin(a) * .2, -.015, Math.cos(a) * .6, Math.sin(a) * .6, -.015, .07); }
    // Day-and-night sub-dial at six o'clock: a 24-hour hand.
    const sx = 0, sy = .4, sr = .13;
    i = arc(out, i, 32, u => [sx + Math.cos(u * TAU) * sr, sy + Math.sin(u * TAU) * sr, .005, .45]);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU - Math.PI / 2; put(out, i++, sx + Math.cos(a) * sr * .78, sy + Math.sin(a) * sr * .78, .005, sx + Math.cos(a) * sr, sy + Math.sin(a) * sr, .005, k % 3 ? .3 : .6); }
    { const a = clock.day * TAU - Math.PI / 2; put(out, i++, sx, sy, .02, sx + Math.cos(a) * sr * .86, sy + Math.sin(a) * sr * .86, .02, .9, 1); }
    // The future: the same curve, continued, only sketched in dashes.
    const future = u => { const a = now + u * 1.1 * TAU, r = 1 + .22 * u, z = .95 * u; return [Math.cos(a) * r, Math.sin(a) * r, z, .5 * (1 - u) ** 1.3, 0]; };
    for (let k = 0; k < 90; k++) { const p = future(k / 90), q = future((k + .6) / 90); put(out, i++, p[0], p[1], p[2], q[0], q[1], q[2], k % 2 ? 0 : p[3]); }
    // The time axis: solid through the past, dashed into the future, with year ticks behind the dial.
    for (let k = 0; k < 12; k++) { const z0 = -1.9 + k * (1.9 / 12), z1 = z0 + 1.9 / 12; put(out, i++, 0, 0, z0, 0, 0, z1, .22 + .3 * k / 12); }
    for (let k = 0; k < 8; k++) { const z0 = k * .14; put(out, i++, 0, 0, z0, 0, 0, z0 + .07, .3 * (1 - k / 8)); }
    for (const y of clock.years) { const z = y.z; put(out, i++, -.06, 0, z, .06, 0, z, .45); put(out, i++, 0, -.06, z, 0, .06, z, .45); }
    put(out, i++, Math.cos(now) * .78, Math.sin(now) * .78, 0, Math.cos(now) * 1.1, Math.sin(now) * 1.1, 0, 1, 1); // now
    // Hands, each a little above the dial; hour and minute drawn as parallel strokes for weight.
    const hand = (angle, len, tail, z, width, strokes, a, warm) => {
      const c = Math.cos(angle - Math.PI / 2), s = Math.sin(angle - Math.PI / 2);
      for (let k = 0; k < strokes; k++) { const o = (k - (strokes - 1) / 2) * width; put(out, i++, -c * tail - s * o, -s * tail + c * o, z, c * len - s * o * .4, s * len + c * o * .4, z, a, warm); }
    };
    hand(clock.hour * TAU, .5, .08, .05, .012, 3, .95, 0);
    hand(clock.min * TAU, .76, .1, .08, .008, 2, .9, 0);
    hand(sec * TAU, .9, .18, .11, 0, 1, 1, 1);
    i = arc(out, i, 12, u => [Math.cos(u * TAU) * .035, Math.sin(u * TAU) * .035, .12, 1, 1]);
    rest(out, i);
  },
  // Rain falling through a column of air, rippling on the water below; a few warm drops are poems.
  rain(out, t) {
    let i = 0;
    for (let k = 0; k < 380; k++, i++) {
      const h = hash(k + 5), rr = Math.sqrt((k + .5) / 380) * 1.05, a = k * 2.39996;
      const y = ((h + t * (.18 + .16 * hash(k + 77))) % 1) * 2.4 - 1.3, len = .06 + .12 * hash(k + 9);
      const fade = 1 - clamp((y - .7) / .5);
      put(out, i, Math.cos(a) * rr, y, Math.sin(a) * rr, Math.cos(a) * rr, y + len, Math.sin(a) * rr, (.12 + .5 * h) * fade, k % 23 === 0 ? 1 : 0);
    }
    for (let j = 0; j < 6; j++) {
      const phase = (t * .22 + j / 6) % 1, ox = (hash(j + 400) - .5) * .9, oz = (hash(j + 500) - .5) * .9, r = .08 + phase * .9;
      i = arc(out, i, 32, u => [ox + Math.cos(u * TAU) * r, 1.15, oz + Math.sin(u * TAU) * r, .5 * (1 - phase) ** 1.5]);
    }
    i = arc(out, i, 60, u => [Math.cos(u * TAU) * 1.12, 1.15, Math.sin(u * TAU) * 1.12, .12]);
    i = arc(out, i, 48, u => [Math.cos(u * TAU) * 1.12, -1.3, Math.sin(u * TAU) * 1.12, .06]);
    // Splashes: tiny strokes thrown up where drops meet the water.
    for (let k = 0; k < 36; k++) {
      const ph = (t * .9 + hash(k + 700)) % 1, a = hash(k + 701) * TAU, r = Math.sqrt(hash(k + 702)) * 1.0, x = Math.cos(a) * r, z = Math.sin(a) * r;
      const up = Math.sin(ph * Math.PI) * .12, spread = ph * .06;
      put(out, i++, x - spread, 1.15 - up, z, x - spread * 1.6, 1.15 - up - .03, z, .4 * (1 - ph));
    }
    rest(out, i);
  },
  // Built from curiosity: three gears turning at meshing rates, pillars, a blueprint grid beneath.
  build(out, t) {
    let i = 0;
    const gear = (z, R, teeth, rot, a) => {
      for (let k = 0; k < teeth; k++) {
        const g = k / teeth * TAU + rot, g2 = (k + 1) / teeth * TAU + rot;
        put(out, i++, Math.cos(g) * R, Math.sin(g) * R, z, Math.cos(g) * R * 1.1, Math.sin(g) * R * 1.1, z, a);
        put(out, i++, Math.cos(g) * R, Math.sin(g) * R, z, Math.cos(g2) * R, Math.sin(g2) * R, z, a * .7);
      }
      for (let k = 0; k < 6; k++) { const g = k / 6 * TAU + rot; put(out, i++, Math.cos(g) * R * .16, Math.sin(g) * R * .16, z, Math.cos(g) * R * .9, Math.sin(g) * R * .9, z, a * .55); }
    };
    const base = t * .1;
    gear(-.6, .95, 64, base, .5); gear(0, .62, 40, -base * 64 / 40, .62); gear(.6, .38, 24, base * 64 / 24, .75);
    // A small pinion beside the top gear, turning the other way.
    { const ox = .38 * 1.1 + .2 * 1.1, z = .6, R = .2, teeth = 14, rot = -base * 64 / 24 * 24 / 14;
      for (let k = 0; k < teeth; k++) { const g = k / teeth * TAU + rot, g2 = (k + 1) / teeth * TAU + rot; put(out, i++, ox + Math.cos(g) * R, Math.sin(g) * R, z, ox + Math.cos(g) * R * 1.14, Math.sin(g) * R * 1.14, z, .7); put(out, i++, ox + Math.cos(g) * R, Math.sin(g) * R, z, ox + Math.cos(g2) * R, Math.sin(g2) * R, z, .5); }
      put(out, i++, ox, 0, -.2, ox, 0, .75, .35); }
    for (let k = 0; k < 16; k++) { const z = -.75 + k * .1; put(out, i++, 1.12, 0, z, 1.12 + (k % 4 ? .04 : .09), 0, z, .3); }
    for (let k = 0; k < 6; k++) { const g = k / 6 * TAU + .3; for (let s = 0; s < 4; s++) put(out, i++, Math.cos(g) * 1.12, Math.sin(g) * 1.12, -.75 + s * .375, Math.cos(g) * 1.12, Math.sin(g) * 1.12, -.75 + (s + 1) * .375, .2); }
    for (let s = 0; s < 4; s++) put(out, i++, 0, 0, -.9 + s * .45, 0, 0, -.9 + (s + 1) * .45, .85, 1);
    for (let d = 0; d < 2; d++) for (let l = 0; l < 11; l++) for (let s = 0; s < 6; s++) {
      const c = -1.25 + l * .25, p0 = -1.25 + s * (2.5 / 6), p1 = p0 + 2.5 / 6;
      d ? put(out, i++, c, p0, -.95, c, p1, -.95, .08) : put(out, i++, p0, c, -.95, p1, c, -.95, .08);
    }
    rest(out, i);
  },
  // A lens: the barrel's rings in depth, a knurled grip, glass, and an aperture opening and closing.
  lens(out, t) {
    let i = 0;
    for (let j = 0; j < 9; j++) { const z = -.9 + j * .225, r = j > 6 ? .78 : j % 2 ? .86 : 1; i = arc(out, i, 40, u => [Math.cos(u * TAU) * r, Math.sin(u * TAU) * r, z, j > 6 ? .55 : .32]); }
    for (let k = 0; k < 72; k++) { const a = k / 72 * TAU; put(out, i++, Math.cos(a), Math.sin(a), -.2, Math.cos(a), Math.sin(a), .2, .22); }
    const open = .5 + .5 * Math.sin(t * .7);
    for (let b = 0; b < 9; b++) {
      const a0 = b / 9 * TAU + t * .05;
      i = arc(out, i, 6, u => { const r = mix(.12 + open * .3, .76, u), a = a0 + u * 1.15; return [Math.cos(a) * r, Math.sin(a) * r, .62, .6, b === 0 ? 1 : 0]; });
    }
    for (const z of [.3, -.45]) i = arc(out, i, 24, u => [Math.cos(u * TAU) * .62, Math.sin(u * TAU) * .62, z, .16]);
    // Reflections on the front glass.
    for (const [r0, a0, a1] of [[.5, 2.3, 3.2], [.36, 2.5, 3.0], [.56, 5.6, 6.0]]) i = arc(out, i, 14, u => [Math.cos(mix(a0, a1, u)) * r0, Math.sin(mix(a0, a1, u)) * r0, .66, .55, 1]);
    for (let k = 0; k < 40; k++) { const a = k / 40 * TAU; put(out, i++, Math.cos(a) * .8, Math.sin(a) * .8, .98, Math.cos(a) * (k % 5 ? .85 : .9), Math.sin(a) * (k % 5 ? .85 : .9), .98, .4); }
    rest(out, i);
  },
  // A room, waiting to be furnished: floor grid, window light, a hanging lamp, shelves, a table.
  room(out, t) {
    let i = 0;
    for (let d = 0; d < 2; d++) for (let l = 0; l < 9; l++) for (let s = 0; s < 4; s++) {
      const c = -1 + l * .25, p0 = -1 + s * .5, p1 = p0 + .5;
      d ? put(out, i++, c, 1, p0, c, 1, p1, .12) : put(out, i++, p0, 1, c, p1, 1, c, .12);
    }
    const C = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
    [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [3, 7], [4, 7], [1, 5], [2, 6], [4, 5], [5, 6], [6, 7]].forEach(([a, b], e) => {
      const back = e < 7;
      for (let s = 0; s < 4; s++) { const p = C[a].map((v, k) => mix(v, C[b][k], s / 4)), q = C[a].map((v, k) => mix(v, C[b][k], (s + 1) / 4)); put(out, i++, ...p, ...q, back ? .38 : .1); }
    });
    const W = [[.1, -.6], [.7, -.6], [.7, .1], [.1, .1]];
    W.forEach((p, k) => { const q = W[(k + 1) % 4]; put(out, i++, p[0], p[1], -1, q[0], q[1], -1, .8, 1); });
    put(out, i++, .4, -.6, -1, .4, .1, -1, .6, 1); put(out, i++, .1, -.25, -1, .7, -.25, -1, .6, 1);
    for (let k = 0; k < 8; k++) { const fx = mix(.1, .7, hash(k + 60)), fy = mix(-.6, .1, hash(k + 61)); put(out, i++, fx, fy, -1, fx - .25 + hash(k + 62) * .2, 1, -.1 + hash(k + 63) * .5, .1, 1); }
    const sway = Math.sin(t * .8) * .03;
    put(out, i++, 0, -1, 0, sway, -.42, 0, .5);
    i = arc(out, i, 12, u => [sway + Math.cos(u * TAU) * .14, -.38, Math.sin(u * TAU) * .14, .7, 1]);
    for (let k = 0; k < 3; k++) { const y = -.35 + k * .32; put(out, i++, -1, y, -.85, -1, y, -.05, .45); for (let b = 0; b < 6; b++) { const z = -.8 + b * .11 + hash(k * 9 + b) * .04, h = .12 + hash(k * 9 + b + 3) * .1; put(out, i++, -.98, y, z, -.98, y - h, z, .35 + (b === 2 && k === 1 ? .4 : 0), b === 2 && k === 1 ? 1 : 0); } }
    i = arc(out, i, 28, u => [.15 + Math.cos(u * TAU) * .6, .99, .2 + Math.sin(u * TAU) * .42, .22]); // rug
    const F = [[-.75, -.7], [-.25, -.7], [-.25, -.3], [-.75, -.3]];
    F.forEach((p, k) => { const q = F[(k + 1) % 4]; put(out, i++, p[0], p[1], -.99, q[0], q[1], -.99, .5); }); // a frame on the wall
    for (let k = 0; k < 7; k++) { const a = -2.2 + k * .55 + Math.sin(t * .6 + k) * .05; put(out, i++, .82, .55, .75, .82 + Math.cos(a) * .22, .55 + Math.sin(a) * .26 - .1, .75 + Math.sin(a * 1.7) * .08, .45); } // a plant
    put(out, i++, .82, .55, .75, .82, 1, .75, .35);
    const H = [[.65, .6, .1], [.95, .6, .1], [.95, .6, .4], [.65, .6, .4]];
    H.forEach((p, k) => { const q = H[(k + 1) % 4]; put(out, i++, ...p, ...q, .4); put(out, i++, p[0], .6, p[2], p[0], 1, p[2], .26); });
    put(out, i++, .95, .6, .1, .95, .15, .1, .4); put(out, i++, .95, .6, .4, .95, .15, .4, .4); put(out, i++, .95, .15, .1, .95, .15, .4, .4); // a chair
    const T = [[-.2, .35, -.1], [.5, .35, -.1], [.5, .35, .5], [-.2, .35, .5]];
    T.forEach((p, k) => { const q = T[(k + 1) % 4]; put(out, i++, ...p, ...q, .45); put(out, i++, p[0], .35, p[2], p[0], 1, p[2], .3); });
    rest(out, i);
  },
  // Film: a strip with a half twist, running in a loop; the frame at the front glows.
  film(out, t) {
    let i = 0;
    const run = t * .025, hw = .24;
    const edge = (u, side, inset = 1) => {
      const th = (u + run) * TAU, ph = th / 2;
      const c = [Math.cos(th), .2 * Math.sin(th * 2), Math.sin(th)], rad = [Math.cos(th), 0, Math.sin(th)];
      const n = [Math.cos(ph) * 0 + Math.sin(ph) * rad[0], Math.cos(ph), Math.sin(ph) * rad[2]];
      return [c[0] + n[0] * hw * side * inset, c[1] + n[1] * hw * side * inset, c[2] + n[2] * hw * side * inset];
    };
    for (const side of [-1, 1]) i = arc(out, i, 150, u => [...edge(u, side), .55]);
    for (let k = 0; k < 32; k++) { const u = k / 32, p = edge(u, -1), q = edge(u, 1); const front = Math.abs(((u + run) % 1) - .25) < 1 / 64; put(out, i++, ...p, ...q, front ? 1 : .32, front ? 1 : 0); }
    for (const side of [-1, 1]) for (let k = 0; k < 64; k++) { const p = edge(k / 64, side, .78), q = edge((k + .4) / 64, side, .78); put(out, i++, ...p, ...q, .3); }
    // A projector beam: light from behind the loop reaching the lit frame.
    const fu = .25 - run % 1, lamp = [0, -.1, -1.6];
    for (const [u, side] of [[fu - 1 / 64, -1], [fu - 1 / 64, 1], [fu + 1 / 64, -1], [fu + 1 / 64, 1]]) { const p = edge(u, side); put(out, i++, ...lamp, ...p, .22, 1); }
    i = arc(out, i, 16, u => [lamp[0] + Math.cos(u * TAU) * .06, lamp[1] + Math.sin(u * TAU) * .06, lamp[2], .5, 1]);
    rest(out, i);
  },
  // Sound: a sphere of rings moving like a waveform; the equator is warm.
  sound(out, t) {
    let i = 0;
    const pulse = .6 + .4 * Math.sin(t * 1.3);
    for (let j = 0; j < 13; j++) {
      const lat = (-72 + j * 12) * Math.PI / 180;
      i = arc(out, i, 44, u => {
        const lon = u * TAU, r = 1 + .15 * Math.sin(lon * 5 + t * 2.4 + lat * 3) * Math.cos(lat * 2) * pulse;
        return [Math.cos(lat) * Math.cos(lon) * r, Math.sin(lat) * r, Math.cos(lat) * Math.sin(lon) * r, j === 6 ? .85 : .16 + .3 * Math.cos(lat), j === 6 ? 1 : 0];
      });
    }
    // Meridians, faint, so the sphere reads as a whole.
    for (let m = 0; m < 6; m++) {
      const lon = m / 6 * Math.PI + t * .1;
      i = arc(out, i, 24, u => { const lat = (u - .5) * Math.PI * .86; return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon), .1]; });
    }
    rest(out, i);
  },
};
// How each scene is seen: tilt (rx), turn (ry), roll (rz), slow spin, and size.
const CAMERA = {
  time:  { rx: -.42, ry: .58, rz: -.15, spin: 0,   size: 1.05 },
  rain:  { rx: .32, ry: .2,   rz: 0,   spin: .05,  size: .92 },
  build: { rx: 1.05,ry: -.6,  rz: .3,  spin: .03,  size: .9 },
  lens:  { rx: .3,  ry: .95,  rz: -.2, spin: 0,    size: .9 },
  room:  { rx: .42, ry: .62,  rz: 0,   spin: .04,  size: .78 },
  film:  { rx: .55, ry: 0,    rz: .1,  spin: .06,  size: .95 },
  sound: { rx: .35, ry: 0,    rz: 0,   spin: .1,   size: .9 },
};

// Years along the time axis, from the first poem (2017) up to now; the present sits at the dial (z = 0).
const FIRST_YEAR = 2017;
const YEARS = (() => {
  const nowYear = new Date().getFullYear() + new Date().getMonth() / 12, span = nowYear - FIRST_YEAR;
  return [2017, 2019, 2021, 2023, 2025].map(year => ({ year, z: -1.9 * (1 - (year - FIRST_YEAR) / span) * .96 }));
})();

function mountClock(root) {
  const canvas = root.querySelector('.home-clock');
  const stops = [...root.querySelectorAll('.home-hero, .home-door')];
  if (!canvas || !stops.length) return () => {};
  const ctx = canvas.getContext('2d'), media = matchMedia('(prefers-reduced-motion:reduce)');
  const controller = new AbortController(), on = (t, n, f, o = {}) => t.addEventListener(n, f, { ...o, signal: controller.signal });
  let width = 0, height = 0, narrow = false, frame = 0, last = 0, time = 0, reduced = media.matches;
  let tops = [], shown = -1, tx = 0, ty = 0, px = 0, py = 0, vx = 0, vy = 0;
  // Turned by hand: press and drag to turn the object; let go and it coasts, rests a moment, then drifts home.
  let dYaw = 0, dPitch = 0, vYaw = 0, vPitch = 0, grab = null, letGo = 0;
  const A = new Float32Array(N * 8), B = new Float32Array(N * 8);
  const BUCKETS = 6;

  // Section centres: a scene is complete when its section sits in the middle of the screen.
  function measure() { tops = stops.map(s => { const r = s.getBoundingClientRect(); return r.top + scrollY + r.height / 2; }); }
  function resize() {
    width = innerWidth; height = innerHeight; narrow = width < 760;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    measure();
  }
  function place(index) {
    if (index === 0) return narrow ? { x: .5, y: .37, s: .78 } : { x: .54, y: .49, s: .94 };
    const textLeft = (index - 1) % 2 === 0;
    return narrow ? { x: .5, y: .27, s: .56 } : { x: textLeft ? .67 : .33, y: .5, s: .86 };
  }
  function progress() {
    const mid = scrollY + height * .5;
    for (let i = 0; i < tops.length - 1; i++) {
      const a = tops[i], b = tops[i + 1];
      if (mid < b) return i + clamp((mid - a) / (b - a));
    }
    return tops.length - 1;
  }
  const sceneOf = i => stops[i]?.dataset.mode || 'time';

  function draw(dt) {
    // A mechanical tick: the second hand jumps once a second with a tiny overshoot.
    const now = new Date(), ms = now.getMilliseconds(), p = Math.min(1, ms / 150);
    const back = 1 + 2.7 * (p - 1) ** 3 + 1.7 * (p - 1) ** 2;
    const sec = (now.getSeconds() - 1 + (reduced ? 1 : back)) / 60;
    const dayFrac = (now.getHours() + (now.getMinutes() + sec) / 60) / 24;
    const clock = { sec, min: (now.getMinutes() + sec) / 60, hour: (now.getHours() % 12 + (now.getMinutes() + sec) / 60) / 12, day: dayFrac, years: YEARS };
    shown = shown < 0 || reduced ? progress() : shown + (progress() - shown) * Math.min(1, dt * 6);
    // A short hold at each end: the scene stays assembled for the first and last 10% of the way to its
    // neighbour, so most of the travel between scenes stays visible.
    const i0 = Math.floor(shown), i1 = Math.min(stops.length - 1, i0 + 1), w = clamp((shown - i0 - .1) / .8);
    const n0 = sceneOf(i0), n1 = sceneOf(i1), C0 = CAMERA[n0], C1 = CAMERA[n1];
    const p0 = place(i0), p1 = place(i1), we = ease(w);
    const t = reduced ? 0 : time, travel = Math.sin(Math.PI * w);
    // The object leans toward the pointer like something with weight: a soft spring that lags, then settles.
    const kS = 9, cS = 4.6, sdt = Math.min(dt, .033);
    vx += ((tx - px) * kS - vx * cS) * sdt; vy += ((ty - py) * kS - vy * cS) * sdt;
    px += vx * sdt; py += vy * sdt;
    SCENES[n0](A, t, clock); if (n1 !== n0) SCENES[n1](B, t, clock);
    const second = n1 !== n0 ? B : A;
    if (!grab?.moved) {
      dYaw += vYaw * sdt; dPitch = clamp(dPitch + vPitch * sdt, -1.1, 1.1);
      const coast = Math.exp(-sdt * 2.6); vYaw *= coast; vPitch *= coast;
      if (performance.now() - letGo > 2600) {
        const home = Math.round(dYaw / TAU) * TAU, back = 1 - Math.exp(-sdt * .9);
        dYaw += (home - dYaw) * back; dPitch -= dPitch * back;
      }
    }

    const rx = mix(C0.rx, C1.rx, we) + .04 * Math.sin(t * .23) + py * .5 + dPitch;
    const ry = mix(C0.ry + C0.spin * t, C1.ry + C1.spin * t, we) + .06 * Math.sin(t * .31) + px * .75 + travel * .5 * (i0 % 2 ? -1 : 1) + dYaw;
    const rz = mix(C0.rz, C1.rz, we);
    const cx = mix(p0.x, p1.x, we) * width + px * width * .03, cy = mix(p0.y, p1.y, we) * height + py * height * .03;
    const R = Math.min(width, height) * (narrow ? .38 : .3) * mix(p0.s * C0.size, p1.s * C1.size, we);
    const f = 3.6;
    const cX = Math.cos(rx), sX = Math.sin(rx), cY = Math.cos(ry), sY = Math.sin(ry), cZ = Math.cos(rz), sZ = Math.sin(rz);
    const project = (x, y, z) => {
      const x1 = x * cZ - y * sZ, y1 = x * sZ + y * cZ;
      const y2 = y1 * cX - z * sX, z2 = y1 * sX + z * cX;
      const x3 = x1 * cY + z2 * sY, z3 = -x1 * sY + z2 * cY;
      const k = f / (f - z3);
      return [cx + x3 * R * k, cy + y2 * R * k, z3];
    };

    // Parts travel one by one: each starts at its own moment, flies out along its drift and lands in the next scene.
    const cool = Array.from({ length: BUCKETS }, () => new Path2D()), warm = Array.from({ length: 3 }, () => new Path2D());
    for (let i = 0; i < N; i++) {
      const o = i * 8;
      const e = n1 === n0 ? 0 : ease(clamp((w * 1.6 - DELAY[i] * .6)));
      const lift = Math.sin(Math.PI * e) * .55, d = DRIFT[i];
      const alpha = mix(A[o + 6], second[o + 6], e) * (1 - .25 * Math.sin(Math.PI * e));
      if (alpha < .02) continue;
      const x1 = mix(A[o], second[o], e) + d[0] * lift, y1 = mix(A[o + 1], second[o + 1], e) + d[1] * lift, z1 = mix(A[o + 2], second[o + 2], e) + d[2] * lift;
      const x2 = mix(A[o + 3], second[o + 3], e) + d[0] * lift, y2 = mix(A[o + 4], second[o + 4], e) + d[1] * lift, z2 = mix(A[o + 5], second[o + 5], e) + d[2] * lift;
      const p = project(x1, y1, z1), q = project(x2, y2, z2);
      // Depth cue: parts nearer the viewer are brighter.
      const depth = clamp(.75 + (p[2] + q[2]) * .14, .35, 1.15);
      const level = alpha * depth, isWarm = mix(A[o + 7], second[o + 7], e) > .5;
      const path = isWarm ? warm[Math.min(2, Math.floor(level * 3))] : cool[Math.min(BUCKETS - 1, Math.floor(level * BUCKETS))];
      path.moveTo(p[0], p[1]); path.lineTo(q[0], q[1]);
    }
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    cool.forEach((path, k) => { ctx.strokeStyle = `rgba(214,208,232,${(.08 + k * .16).toFixed(2)})`; ctx.lineWidth = k > 3 ? 1.2 : 1; ctx.stroke(path); });
    warm.forEach((path, k) => { ctx.strokeStyle = `rgba(234,190,132,${(.35 + k * .3).toFixed(2)})`; ctx.lineWidth = 1.3 + k * .3; ctx.stroke(path); });
    ctx.lineCap = 'butt';

    // On the first screen: labels for past, present and future.
    const labels = (1 - clamp(shown * 2.2)) * (narrow ? 0 : 1);
    // Dial text on the first screen: quarter numerals, minute numbers round the rim, years along the time axis.
    const dialText = 1 - clamp(shown * 2.2);
    if (dialText > .02) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const text = (str, x, y, z, size, rgba) => { const [px, py, pz] = project(x, y, z), k = f / (f - pz); ctx.font = `300 ${Math.max(8, size * R * k).toFixed(1)}px 'Yifanovo Serif', serif`; ctx.fillStyle = rgba; ctx.fillText(str, px, py); };
      // Hour numerals sit outside the ring: the hands and the present live inside it.
      [['十二', 0], ['三', .25], ['六', .5], ['九', .75]].forEach(([str, fr]) => { const a = fr * TAU - Math.PI / 2; text(str, Math.cos(a) * 1.16, Math.sin(a) * 1.16, 0, .05, `rgba(206,198,218,${(.7 * dialText).toFixed(3)})`); });
      text('昼夜', 0, .4 + .13 * .45, .01, .024, `rgba(170,164,190,${(.6 * dialText).toFixed(3)})`);
      if (!narrow) {
        ctx.textAlign = 'left';
        YEARS.forEach(y => { const [px, py] = project(.09, 0, y.z); ctx.font = `400 10px 'Yifanovo Serif', serif`; ctx.fillStyle = `rgba(178,172,196,${(.7 * dialText).toFixed(3)})`; ctx.fillText(String(y.year), px + 4, py); });
        const [nx, ny] = project(.09, 0, .02); ctx.fillStyle = `rgba(236,206,160,${(.8 * dialText).toFixed(3)})`; ctx.fillText('此刻', nx + 4, ny + 12);
      }
    }
    if (labels > .02) {
      const now = sec * TAU - Math.PI / 2;
      const pastU = .55, pastA = now - (1 - pastU) * 5 * TAU, pastR = .28 + .72 * pastU ** 1.25;
      const futU = .3, futA = now + futU * 1.1 * TAU, futR = 1 + .22 * futU;
      const marks = [
        ['过去', project(Math.cos(pastA) * pastR, Math.sin(pastA) * pastR, -1.9 * (1 - pastU)), -.62],
        ['现在', project(Math.cos(now) * 1.1, Math.sin(now) * 1.1, 0), 0],
        ['未来', project(Math.cos(futA) * futR, Math.sin(futA) * futR, .95 * futU), .62],
      ];
      const leader = new Path2D();
      ctx.font = `400 12px 'Yifanovo Serif', serif`; ctx.textBaseline = 'middle';
      // Each label keeps its own row (top, middle, bottom); its side follows where its point is.
      marks.forEach(([name, [ax, ay], row], j) => {
        if (j === 1) {
          // "Now" rides with the present: the label travels around the ring with the real second.
          const dx = ax - cx, dy = ay - cy, d = Math.hypot(dx, dy) || 1;
          ctx.textAlign = 'center'; ctx.fillStyle = `rgba(236,206,160,${(.95 * labels).toFixed(3)})`;
          ctx.fillText(name, ax + dx / d * 24, ay + dy / d * 18);
          return;
        }
        const side = ax < cx ? -1 : 1, lx = cx + side * R * 1.5, ly = cy + row * R;
        leader.moveTo(ax, ay); leader.lineTo(lx - side * 34, ly); leader.lineTo(lx - side * 8, ly);
        ctx.textAlign = side > 0 ? 'left' : 'right';
        ctx.fillStyle = `rgba(${j === 1 ? '236,206,160' : '200,194,216'},${(.9 * labels).toFixed(3)})`;
        ctx.fillText(name, lx, ly);
        ctx.beginPath(); ctx.arc(ax, ay, 1.8, 0, TAU); ctx.fill();
      });
      ctx.strokeStyle = `rgba(200,194,216,${(.3 * labels).toFixed(3)})`; ctx.lineWidth = .7; ctx.stroke(leader);
    }
  }
  function loop(ts) {
    frame = 0; if (document.hidden) return;
    const dt = last ? Math.min((ts - last) / 1000, .05) : 1 / 60; last = ts; time += dt;
    draw(dt);
    frame = requestAnimationFrame(loop);
  }
  const start = () => { if (!frame && !document.hidden) { last = 0; frame = requestAnimationFrame(loop); } };
  on(window, 'resize', () => { resize(); draw(0); }, { passive: true });
  on(window, 'pointermove', e => { if (e.pointerType !== 'mouse') return; tx = e.clientX / width - .5; ty = e.clientY / height - .5; }, { passive: true });
  // Mouse: press anywhere that isn't a link or control and drag to turn (left-right) and tip (up-down).
  // Touch: a sideways swipe turns it; up-down swipes still scroll the page.
  const HANDS_OFF = 'a, button, input, textarea, select, label, summary, [role="button"], .site-header, .home-rail, .wechat-qr, dialog';
  const turn = (dx, dy, dtS) => {
    const ay = dx / width * 3.4, ap = dy / height * 2.4;
    dYaw += ay; dPitch = clamp(dPitch + ap, -1.1, 1.1);
    vYaw = vYaw * .4 + (ay / dtS) * .6; vPitch = vPitch * .4 + (ap / dtS) * .6;
  };
  const release = () => { if (grab?.moved) { letGo = performance.now(); document.documentElement.classList.remove('is-turning'); } grab = null; };
  on(window, 'pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || reduced || e.target.closest(HANDS_OFF)) return;
    grab = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
  });
  on(window, 'pointermove', e => {
    if (!grab || e.pointerType !== 'mouse') return;
    const dx = e.clientX - grab.x, dy = e.clientY - grab.y, now = performance.now();
    if (!grab.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      grab.moved = true; vYaw = vPitch = 0; getSelection()?.removeAllRanges(); document.documentElement.classList.add('is-turning');
    }
    turn(dx, dy, Math.max(.008, (now - grab.t) / 1000));
    grab.x = e.clientX; grab.y = e.clientY; grab.t = now;
  }, { passive: true });
  on(window, 'pointerup', release); on(window, 'pointercancel', release); on(window, 'blur', release);
  // A drag that turned the object is not a click.
  on(window, 'click', e => { if (performance.now() - letGo < 60) { e.preventDefault(); e.stopPropagation(); } }, { capture: true });
  let swipe = null;
  on(window, 'touchstart', e => {
    if (reduced || e.touches.length !== 1 || e.target.closest(HANDS_OFF)) { swipe = null; return; }
    const p = e.touches[0]; swipe = { x: p.clientX, y: p.clientY, t: performance.now(), mode: '' };
  }, { passive: true });
  on(window, 'touchmove', e => {
    if (!swipe) return;
    const p = e.touches[0], dx = p.clientX - swipe.x, dy = p.clientY - swipe.y, now = performance.now();
    if (!swipe.mode) { if (Math.hypot(dx, dy) < 8) return; swipe.mode = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'turn' : 'scroll'; if (swipe.mode === 'turn') { grab = { moved: true }; vYaw = vPitch = 0; } }
    if (swipe.mode !== 'turn') return;
    turn(dx, 0, Math.max(.008, (now - swipe.t) / 1000));
    swipe.x = p.clientX; swipe.y = p.clientY; swipe.t = now;
  }, { passive: true });
  on(window, 'touchend', () => { if (swipe?.mode === 'turn') { letGo = performance.now(); grab = null; } swipe = null; }, { passive: true });
  on(document, 'visibilitychange', () => { if (!document.hidden) start(); });
  on(media, 'change', e => { reduced = e.matches; });
  const ro = new ResizeObserver(measure); ro.observe(root);
  resize(); start();
  return () => { controller.abort(); cancelAnimationFrame(frame); ro.disconnect(); };
}

// One scene on its own canvas (used by the project page): same parts and projection as the homepage,
// slowly turning and leaning toward the pointer.
export function mountScene(canvas, name, { scale = .36 } = {}) {
  if (!canvas || !SCENES[name]) return () => {};
  const ctx = canvas.getContext('2d'), cam = CAMERA[name], out = new Float32Array(N * 8);
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const controller = new AbortController(), on = (t, n, f, o = {}) => t.addEventListener(n, f, { ...o, signal: controller.signal });
  let width = 0, height = 0, frame = 0, last = 0, time = 0, visible = true, tx = 0, ty = 0, px = 0, py = 0, vx = 0, vy = 0;
  function resize() {
    const r = canvas.getBoundingClientRect(); width = r.width; height = r.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw(dt) {
    const sdt = Math.min(dt, .033);
    vx += ((tx - px) * 9 - vx * 4.6) * sdt; vy += ((ty - py) * 9 - vy * 4.6) * sdt; px += vx * sdt; py += vy * sdt;
    const t = reduced ? 0 : time, now = new Date(), sec = now.getSeconds() / 60;
    SCENES[name](out, t, { sec, min: now.getMinutes() / 60, hour: now.getHours() % 12 / 12, day: now.getHours() / 24, years: YEARS });
    const rx = cam.rx + py * .5, ry = cam.ry + cam.spin * t + .06 * Math.sin(t * .31) + px * .75, rz = cam.rz;
    const cx = width / 2 + px * width * .03, cy = height / 2 + py * height * .03, R = Math.min(width, height) * scale * cam.size, f = 3.6;
    const cX = Math.cos(rx), sX = Math.sin(rx), cY = Math.cos(ry), sY = Math.sin(ry), cZ = Math.cos(rz), sZ = Math.sin(rz);
    const project = (x, y, z) => {
      const x1 = x * cZ - y * sZ, y1 = x * sZ + y * cZ, y2 = y1 * cX - z * sX, z2 = y1 * sX + z * cX, x3 = x1 * cY + z2 * sY, z3 = -x1 * sY + z2 * cY, k = f / (f - z3);
      return [cx + x3 * R * k, cy + y2 * R * k, z3];
    };
    const cool = Array.from({ length: 6 }, () => new Path2D()), warm = Array.from({ length: 3 }, () => new Path2D());
    for (let i = 0; i < N; i++) {
      const o = i * 8, alpha = out[o + 6]; if (alpha < .02) continue;
      const p = project(out[o], out[o + 1], out[o + 2]), q = project(out[o + 3], out[o + 4], out[o + 5]);
      const level = alpha * clamp(.75 + (p[2] + q[2]) * .14, .35, 1.15);
      const path = out[o + 7] > .5 ? warm[Math.min(2, Math.floor(level * 3))] : cool[Math.min(5, Math.floor(level * 6))];
      path.moveTo(p[0], p[1]); path.lineTo(q[0], q[1]);
    }
    ctx.clearRect(0, 0, width, height); ctx.lineCap = 'round';
    cool.forEach((path, k) => { ctx.strokeStyle = `rgba(214,208,232,${(.08 + k * .16).toFixed(2)})`; ctx.lineWidth = k > 3 ? 1.2 : 1; ctx.stroke(path); });
    warm.forEach((path, k) => { ctx.strokeStyle = `rgba(234,190,132,${(.35 + k * .3).toFixed(2)})`; ctx.lineWidth = 1.3 + k * .3; ctx.stroke(path); });
  }
  function loop(ts) { frame = 0; if (!visible || document.hidden) return; const dt = last ? Math.min((ts - last) / 1000, .05) : 1 / 60; last = ts; time += dt; draw(dt); frame = requestAnimationFrame(loop); }
  const start = () => { if (!frame && visible && !document.hidden) { last = 0; frame = requestAnimationFrame(loop); } };
  on(window, 'pointermove', e => { if (e.pointerType !== 'mouse') return; tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  on(document, 'visibilitychange', start);
  const io = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) start(); }); io.observe(canvas);
  const ro = new ResizeObserver(() => { resize(); draw(0); }); ro.observe(canvas);
  resize(); start();
  return () => { controller.abort(); cancelAnimationFrame(frame); io.disconnect(); ro.disconnect(); };
}

// The visitor's own time of day.
function mountTimeLabel(root) {
  const el = root.querySelector('.field-clock'); if (!el) return () => {};
  const part = h => h < 5 || h >= 19 ? '夜' : h < 9 ? '晨' : h < 17 ? '昼' : '暮';
  const tick = () => { const d = new Date(); el.textContent = `此刻 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} · ${part(d.getHours())}`; };
  tick(); const id = setInterval(tick, 15000);
  return () => clearInterval(id);
}

export function mountHome(root) {
  mountMist();
  const controller = new AbortController(), on = (t, n, f, o = {}) => t.addEventListener(n, f, { ...o, signal: controller.signal });
  const disposeClock = mountClock(root), disposeLabel = mountTimeLabel(root);
  // A gentle settle: only when scrolling stops very close to a section does the page ease it to the centre.
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let idle = 0, settling = false;
  // Our own glide (the browser's smooth scroll is short and abrupt): slow, eased in and out.
  let glideFrame = 0;
  const stopGlide = () => { cancelAnimationFrame(glideFrame); glideFrame = 0; settling = false; };
  function glide(to, duration) {
    stopGlide(); settling = true;
    const from = scrollY, start = performance.now();
    const easeInOut = x => x < .5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2; // speeds up, then slows to rest
    const step = now => {
      const p = Math.min(1, (now - start) / duration);
      scrollTo({ top: from + (to - from) * easeInOut(p), behavior: 'instant' });
      if (p < 1) glideFrame = requestAnimationFrame(step); else { glideFrame = 0; setTimeout(() => { settling = false; }, 80); }
    };
    glideFrame = requestAnimationFrame(step);
  }
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(type => on(window, type, () => { if (glideFrame) stopGlide(); }, { passive: true }));
  // After 1 second without any input, a page left between two sections glides slowly to the nearest one.
  // The first screen settles to the very top; the bottom of the page (the footer) is left alone.
  function settle() {
    if (reducedMotion || !centres.length || glideFrame) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (scrollY >= max - 4) return;
    const targets = centres.map((c, i) => i === 0 ? 0 : Math.max(0, Math.min(max, c - innerHeight / 2)));
    let to = targets[0];
    targets.forEach(tg => { if (Math.abs(tg - scrollY) < Math.abs(to - scrollY)) to = tg; });
    const gap = to - scrollY;
    if (Math.abs(gap) < 4) return;
    glide(to, Math.min(2400, 1100 + Math.abs(gap) * 1.6));
  }
  const wait = () => { clearTimeout(idle); if (!settling) idle = setTimeout(settle, 1000); };
  on(window, 'scroll', () => { if (!settling) wait(); }, { passive: true });
  ['wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown'].forEach(type => on(window, type, wait, { passive: true }));

  // Each section's words rise in while it holds the middle of the screen, and blur away as it leaves.
  const stops = [...root.querySelectorAll('.home-hero, .home-door')];
  const railButtons = [...root.querySelectorAll('.home-rail button')];
  // Only the section nearest the middle of the screen shows its words; the others blur away.
  // Positions are cached, so scrolling does not force a layout.
  let centres = [], current = -1, pick = 0;
  const measureStops = () => { centres = stops.map(st => { const r = st.getBoundingClientRect(); return r.top + scrollY + r.height / 2; }); };
  function choose() {
    pick = 0;
    const mid = scrollY + innerHeight / 2;
    let best = 0, gap = Infinity;
    centres.forEach((c, i) => { const g = Math.abs(c - mid); if (g < gap) { gap = g; best = i; } });
    if (best === current) return;
    current = best;
    stops.forEach((st, i) => st.classList.toggle('is-in', i === best));
    railButtons.forEach((b, j) => b.classList.toggle('is-active', j === best));
  }
  const queue = () => { if (!pick) pick = requestAnimationFrame(choose); };
  on(window, 'scroll', queue, { passive: true });
  on(window, 'resize', () => { measureStops(); queue(); }, { passive: true });
  const ro = new ResizeObserver(() => { measureStops(); queue(); }); ro.observe(root);
  measureStops(); choose();
  railButtons.forEach(b => on(b, 'click', () => {
    const target = stops[Number(b.dataset.stop)]; if (!target) return;
    const r = target.getBoundingClientRect();
    scrollTo({ top: r.top + scrollY - Math.max(0, (innerHeight - r.height) / 2), behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth' });
  }));

  return () => { controller.abort(); clearTimeout(idle); cancelAnimationFrame(glideFrame); cancelAnimationFrame(pick); ro.disconnect(); disposeClock(); disposeLabel(); };
}
