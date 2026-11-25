import { mountMist } from './poetry.js';
import { screenHeight, onResize } from './viewport.js';

const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dated = date => `${date.slice(5, 7)}/${date.slice(8, 10)}/${date.slice(0, 4)}`;

// Small icons for phones (the names stay for screen readers); desktop shows the names.
const ICONS = {"GitHub": "<svg class=\"social-icon\" viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z\"/></svg>", "Instagram": "<svg class=\"social-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\"><rect x=\"2.8\" y=\"2.8\" width=\"18.4\" height=\"18.4\" rx=\"5.2\"/><circle cx=\"12\" cy=\"12\" r=\"4.3\"/></g><circle cx=\"17.4\" cy=\"6.6\" r=\"1.15\" fill=\"currentColor\"/></svg>", "Steam": "<svg class=\"social-icon\" viewBox=\"0 0 32 32\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M18.102 12.129c0-0 0-0 0-0.001 0-1.564 1.268-2.831 2.831-2.831s2.831 1.268 2.831 2.831c0 1.564-1.267 2.831-2.831 2.831-0 0-0 0-0.001 0h0c-0 0-0 0-0.001 0-1.563 0-2.83-1.267-2.83-2.83 0-0 0-0 0-0.001v0zM24.691 12.135c0-2.081-1.687-3.768-3.768-3.768s-3.768 1.687-3.768 3.768c0 2.081 1.687 3.768 3.768 3.768v0c2.080-0.003 3.765-1.688 3.768-3.767v-0zM10.427 23.76l-1.841-0.762c0.524 1.078 1.611 1.808 2.868 1.808 1.317 0 2.448-0.801 2.93-1.943l0.008-0.021c0.155-0.362 0.246-0.784 0.246-1.226 0-1.757-1.424-3.181-3.181-3.181-0.405 0-0.792 0.076-1.148 0.213l0.022-0.007 1.903 0.787c0.852 0.364 1.439 1.196 1.439 2.164 0 1.296-1.051 2.347-2.347 2.347-0.324 0-0.632-0.066-0.913-0.184l0.015 0.006zM15.974 1.004c-7.857 0.001-14.301 6.046-14.938 13.738l-0.004 0.054 8.038 3.322c0.668-0.462 1.495-0.737 2.387-0.737 0.001 0 0.002 0 0.002 0h-0c0.079 0 0.156 0.005 0.235 0.008l3.575-5.176v-0.074c0.003-3.12 2.533-5.648 5.653-5.648 3.122 0 5.653 2.531 5.653 5.653s-2.531 5.653-5.653 5.653h-0.131l-5.094 3.638c0 0.065 0.005 0.131 0.005 0.199 0 0.001 0 0.002 0 0.003 0 2.342-1.899 4.241-4.241 4.241-2.047 0-3.756-1.451-4.153-3.38l-0.005-0.027-5.755-2.383c1.841 6.345 7.601 10.905 14.425 10.905 8.281 0 14.994-6.713 14.994-14.994s-6.713-14.994-14.994-14.994c-0 0-0.001 0-0.001 0h0z\"/></svg>", "小红书": "<svg class=\"social-icon\" viewBox=\"0 0 256 256\" aria-hidden=\"true\"><path fill=\"currentColor\" fill-rule=\"evenodd\" transform=\"translate(-256 -256)\" d=\"M289.44,256H477.67c17.93,0,33.86,15.57,34.33,33.48V477.72A35.09,35.09,0,0,1,477.66,512H289.5A35.14,35.14,0,0,1,256,477.64V289.56C256.43,271.93,271.81,256.5,289.44,256Zm16.73,91.44c-.13,19.87-.06,39.75-.16,59.63a2.1,2.1,0,0,1-2.13,2.6c-2.39.14-4.79.06-7.19.08,1.61,4,3.35,7.86,5.15,11.73,4.52-.15,9.68.79,13.54-2.17,3.47-2.58,4.58-7.17,4.51-11.3,0-20.19,0-40.39-.09-60.58C315.26,347.41,310.71,347.4,306.17,347.44Zm56.08-.9q-5.08,11.67-10.36,23.24c-1,2.31-2.21,5.37-.11,7.46,2.69,2.44,6.64,1.5,9.94,1.72-2.29,5.78-5.3,11.27-7.23,17.19-1.07,2.92,1.6,5.89,4.52,5.92,5.29.36,10.6,0,15.9.14,1.73-3.87,3.47-7.73,5.17-11.62-3.09,0-6.21.22-9.25-.39,3.29-8.26,7.19-16.25,10.68-24.41-4.27-.5-9.1.89-13-.77,1.9-6.4,5.36-12.27,7.8-18.5C371.61,346.5,366.93,346.47,362.25,346.54Zm72.75.05,0,5.21c-3.06,0-6.12,0-9.18,0q0,7,0,13.93c3.07,0,6.13,0,9.19.06q.12,6,0,12.08c-4.6.09-9.21,0-13.81.07-.06,4.64-.05,9.27,0,13.9,4.61.05,9.23,0,13.84,0,0,9.86,0,19.73,0,29.59,4.62,0,9.23,0,13.85,0q0-14.79,0-29.57c6.74,0,13.47-.1,20.21,0,2.37-.2,5.08,1.46,5,4.07a110.67,110.67,0,0,1,0,11.08,2.26,2.26,0,0,1-2.12,2.39c-3.85.28-7.71,0-11.57.13,1.7,4,3.35,8,5.28,11.95,6.35-.33,14.11,1.27,18.95-4,4.6-4.26,3.22-11,3.41-16.56-.29-5.85,1.14-12.46-2.49-17.58-3.09-4.34-8.66-5.52-13.68-5.61-.3-7,1.37-15.19-3.78-20.88-4.8-5.38-12.53-5.4-19.17-5.14l0-5.2C444.23,346.56,439.61,346.57,435,346.59Zm-49.42,5.22q0,7,0,13.92c2.9,0,5.79,0,8.69,0,0,13.91,0,27.83,0,41.74-4.15.07-8.31,0-12.46.05-2.15,4.62-4.25,9.26-6.34,13.9,15.48.06,31,0,46.44,0q0-6.94,0-13.9c-4.45,0-8.91,0-13.36-.05q0-20.88,0-41.77c2.91,0,5.81,0,8.72,0,0-4.64,0-9.29,0-13.93C406.73,351.79,396.16,351.77,385.58,351.81Zm91.35,1.28c-3.88,2.94-2.61,8.32-2.78,12.51,2.59,0,5.19.14,7.78-.09,4.16-.38,7.29-5.23,5.62-9.15C486.24,352.06,480.43,350.19,476.93,353.09ZM283,365.72c-.7,9.12-1.41,18.23-2.07,27.35a22.12,22.12,0,0,1-1.32,6.06c2.34,5.35,4.68,10.7,7.18,16,5.6-7.49,7.68-16.93,8.26-26.1.49-7.8,1.36-15.59,1.64-23.4C292.1,365.79,287.54,365.68,283,365.72Zm46.13,0q1,12.69,2,25.37c.73,8.48,2.92,17.12,8.1,24,2.47-5.29,4.83-10.63,7.17-16A21.67,21.67,0,0,1,345,393c-.66-9.09-1.38-18.18-2.08-27.27Q336,365.69,329.1,365.72Zm17.16,54.69c7.08,2.09,14.58.66,21.85,1.05,2.14-4.63,4.27-9.27,6.35-13.93-7.27-.28-14.67.76-21.8-1.07Q349.42,413.41,346.26,420.41Z\"/></svg>"};
const WECHAT_ICON = "<svg class=\"social-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><defs><mask id=\"wechat-cut\"><rect width=\"24\" height=\"24\" fill=\"#fff\"/><ellipse cx=\"16.2\" cy=\"15\" rx=\"7.4\" ry=\"6.3\" fill=\"#000\"/></mask></defs><g fill=\"currentColor\"><g mask=\"url(#wechat-cut)\"><ellipse cx=\"9.2\" cy=\"9.4\" rx=\"7.7\" ry=\"6.5\"/><path d=\"M4.3 13.4 3.5 17.4l3.9-2.3z\"/></g><ellipse cx=\"16.2\" cy=\"15\" rx=\"6.1\" ry=\"5.1\"/><path d=\"M19.9 18.3l.9 2.9-3.4-1.6z\"/></g><g fill=\"#0e1019\"><circle cx=\"6.6\" cy=\"8\" r=\"1.05\"/><circle cx=\"11.8\" cy=\"8\" r=\"1.05\"/><circle cx=\"14.1\" cy=\"13.9\" r=\".85\"/><circle cx=\"18.3\" cy=\"13.9\" r=\".85\"/></g></svg>";
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
  const selectedPoems = ['2019-04-01', '2019-04-24', '2017-12-30'].map(date => data.poems.find(p => p.date === date)).filter(Boolean);
  const poemLinks = `<div class="door-poems">${selectedPoems.map(p => {
    const date = dated(p.date), line = (p.body || p.excerpt || '').split('\n').find(line => line.trim()) || '';
    return `<a class="door-poem" href="/poetry/${encodeURIComponent(p.id)}"><time datetime="${esc(p.date)}"><span>${date.slice(0, 5)}</span><span class="poem-year">${date.slice(5)}</span></time><span class="poem-glimpse">${esc(line.trim())}</span></a>`;
  }).join('')}</div>`;
  return [
    { mode: 'rain', cn: '诗歌', en: 'Poetry', href: '/poetry', text: '无关风月。<br>字里行间，都是我青春无数的瞬间。', meta: `${data.poems.length} 首 · ${Math.min(...years)}—${Math.max(...years)}`,
      extra: (latest ? `<p class="door-quote"><time datetime="${latest.date}">${dated(latest.date)}</time><span>「${esc(firstLine)}」</span></p>` : '') + poemLinks },
    { mode: 'build', cn: '项目', en: 'Projects', href: '/project', text: '科技之美。<br>创造与实现，进步就在指尖。', meta: `${data.projects.length} 个作品`,
      extra: `<ul class="door-list">${data.projects.slice(0, 3).map(p => `<li><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(p.title)}<i aria-hidden="true">↗</i></span><small>${esc(p.category)}</small></a></li>`).join('')}</ul>` },
    { mode: 'lens', cn: '摄影', en: 'Photography', text: '我眼中的世界。', meta: `${data.photos.length} 张`,
      extra: `<div class="door-photos">${data.photos.slice(0, 3).map(p => `<img src="${p.src}" alt="${esc(p.title)}" loading="lazy">`).join('')}</div>` },
    { mode: 'room', cn: '家居', en: 'Home', text: 'Caer Fannos，<br>属于我回忆的归处，收藏我人生的过往。' },
    { mode: 'film', cn: '影视', en: 'Film', text: 'Your mind is a walled garden，<br>even death cannot touch the flowers blooming there.' },
    { mode: 'sound', cn: '音乐', en: 'Music', text: '让我们在熏风送香的海滨，<br>再次相遇吧。' },
  ];
}

export function homeLanding(data) {
  const list = sections(data);
  const social = SOCIAL.map(s => `<a href="${s.href}" target="_blank" rel="noopener noreferrer">${ICONS[s.name] || ''}<i class="social-name">${esc(s.name)}</i><span aria-hidden="true">↗</span></a>`).join('')
    + `<span class="wechat"><button type="button" aria-describedby="wechat-qr">${WECHAT_ICON}<i class="social-name">公众号</i><span aria-hidden="true">+</span></button><span class="wechat-qr" id="wechat-qr" role="tooltip"><img src="/assets/wechat-qr.jpg" alt="微信公众号二维码" width="143" height="143" loading="lazy"><small>微信扫一扫</small></span></span>`;
  const doors = list.map((s, i) => {
    const side = i % 2 ? 'is-right' : 'is-left'; // text side; the clock takes the other half
    const action = s.href ? `<a class="door-link" href="${s.href}">进入${s.cn}<span aria-hidden="true">→</span></a>` : '<span class="door-soon">即将到来</span>';
    return `<section class="home-door ${side}${s.href ? '' : ' is-soon'}" data-mode="${s.mode}" aria-labelledby="door-${i}">
      <div class="page-air" aria-hidden="true"></div>
      <div class="door-copy">
        <p class="door-head" aria-hidden="true"><span>${String(i + 1).padStart(2, '0')} <i>/</i> ${String(list.length).padStart(2, '0')}</span><i class="door-rule"></i>${s.meta ? `<span class="door-head-meta">${esc(s.meta)}</span>` : ''}</p>
        <span class="door-no">${String(i + 1).padStart(2, '0')} <i>/</i> ${String(list.length).padStart(2, '0')}</span>
        <h2 id="door-${i}"><span class="door-cn">${s.cn}</span><span class="door-en">${s.en}</span></h2>
        <p class="door-text">${s.text}</p>
        ${s.extra || ''}
        <div class="door-foot">${s.meta ? `<span class="door-meta">${esc(s.meta)}</span>` : ''}${action}</div>
      </div>
    </section>`;
  }).join('');
  const rail = ['此刻', ...list.map(x => x.cn)].map((name, i) => `<button type="button" data-stop="${i}" aria-label="${name}"><i></i><span>${String(i).padStart(2, '0')} ${name}</span></button>`).join('');
  const dots = ['此刻', ...list.map(x => x.cn)].map((name, i) => `<button type="button" data-page="${i}" aria-label="${name}"><i></i></button>`).join('');
  return `<canvas class="home-clock" aria-hidden="true"></canvas>
  <nav class="home-rail" aria-label="首页栏目">${rail}</nav>
  <div class="home-pager"><div class="home-deck">
  <section class="home-hero" data-mode="time" aria-labelledby="home-name">
    <span class="hero-tag hero-tag-left" aria-hidden="true">0119 · 起始</span>
    <span class="hero-tag hero-tag-right"><span class="field-clock"></span></span>
    <div class="page-air" aria-hidden="true"></div>
    <div class="hero-foot">
      <div class="hero-id"><p class="hero-thought">The Future named Past<br>无数过往回忆，引领此刻你我的相遇。</p><h1 id="home-name"><span class="name-en">Yifan Yu</span><span class="name-dot" aria-hidden="true">·</span><span class="name-cn">叙己</span></h1><p class="hero-intro">一个现实的浪漫主义者。<small>A REALISTIC ROMANTIC.</small></p></div>
      <nav class="hero-social" aria-label="社交媒体">${social}</nav>
    </div>
  </section>
  ${doors}
  </div><nav class="home-dots" aria-label="首页栏目">${dots}</nav></div>`;
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
// Desktop resting states chosen from reference screenshots. Instead of spinning away from that view they sway
// gently around it (sway: how far, in radians). Roll turns a scene in the screen's own plane.
// fill: share of the screen's width and height the object may take (default .36 wide, .62 tall).
const DESK_CAMERA = {
  rain:  { rx: 0,   ry: -.5,   rz: .1,   roll: -.4, spin: 0, sway: .3, size: .92, fill: [.46, .9] },
  build: { rx: .62, ry: .32,   rz: -.32, spin: 0, sway: .25, size: .88 },
  room:  { rx: .45, ry: -2.55, rz: -.2,  roll: -.35, spin: 0, sway: .25, size: .82, fill: [.44, .8] },
  film:  { rx: .95, ry: -.5,   rz: -.8,  roll: 1.15, spin: 0, sway: .45, size: .95 },
};
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
  let shownWords = '', tops = [], shown = -1, tx = 0, ty = 0, px = 0, py = 0, vx = 0, vy = 0;
  // Turned by hand: press and drag to turn the object; let go and it coasts, rests a moment, then drifts home.
  let dYaw = 0, dPitch = 0, vYaw = 0, vPitch = 0, grab = null, letGo = 0;
  // Desktop: each scene's visible middle and size, measured once at its resting angle (unit size, centred at 0).
  const extents = {}, probe = new Float32Array(N * 8);
  function extent(name, C, clock) {
    if (extents[name]) return extents[name];
    const f = 3.6, cX = Math.cos(C.rx), sX = Math.sin(C.rx), cY = Math.cos(C.ry), sY = Math.sin(C.ry), cZ = Math.cos(C.rz), sZ = Math.sin(C.rz);
    const roll = C.roll || 0, cR = Math.cos(roll), sR = Math.sin(roll), xs = [], ys = [];
    const add = (x, y, z) => {
      const x1 = x * cZ - y * sZ, y1 = x * sZ + y * cZ, y2 = y1 * cX - z * sX, z2 = y1 * sX + z * cX;
      const x3 = x1 * cY + z2 * sY, z3 = -x1 * sY + z2 * cY, k = f / (f - z3);
      xs.push((x3 * cR - y2 * sR) * k); ys.push((x3 * sR + y2 * cR) * k);
    };
    // Several moments, so moving parts (falling drops) are measured where they usually are.
    for (const t of [0, 2.3, 4.7, 7.1, 9.4]) {
      SCENES[name](probe, t, clock);
      for (let i = 0; i < N; i++) { const o = i * 8; if (probe[o + 6] > .05) { add(probe[o], probe[o + 1], probe[o + 2]); add(probe[o + 3], probe[o + 4], probe[o + 5]); } }
    }
    xs.sort((a, b) => a - b); ys.sort((a, b) => a - b);
    // Ignore the outermost 1% of points (stray drops and rays), but keep whole rings in view.
    const lo = Math.floor(xs.length * .01), hi = xs.length - 1 - lo;
    return (extents[name] = { mx: (xs[lo] + xs[hi]) / 2, my: (ys[lo] + ys[hi]) / 2, w: Math.max(.05, xs[hi] - xs[lo]), h: Math.max(.05, ys[hi] - ys[lo]) });
  }
  // Pointer on the object: where it is over the object (-.5 to .5 across it); null when it is elsewhere.
  let aim = null, hot = { x: 0, y: 0, rx: 0, ry: 0 };
  const A = new Float32Array(N * 8), B = new Float32Array(N * 8);
  const BUCKETS = 6;

  // Section centres: a scene is complete when its section sits in the middle of the screen.
  function measure() { tops = stops.map(s => { const r = s.getBoundingClientRect(); return r.top + scrollY + r.height / 2; }); }
  function resize() {
    width = innerWidth; height = screenHeight(); narrow = width < 760;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    measure();
  }
  // Phones, per page: 0 clock, 1 rain, 2 build, 3 lens, 4 room, 5 film, 6 sound (x, y share of the screen; s size).
  const PHONE_PLACE = [{ x: .63, y: .40, s: 1.08 }, { x: .63, y: .32, s: 1.16 }, { x: .61, y: .32, s: 1.1 }, { x: .64, y: .40, s: 1.12 }, { x: .66, y: .44, s: 1.22 }, { x: .61, y: .41, s: 1.02 }, { x: .66, y: .45, s: 1.24 }];
  function place(index) {
    // Phones: the object fills the upper part of the screen at nearly full width; the words scroll below it.
    // Phones: the words sit bottom-left, so each object leans into the space they leave: mostly right and down.
    if (narrow) { const p = PHONE_PLACE[index] || PHONE_PLACE[5], k = height < 700 ? .9 : 1; return { x: p.x, y: p.y, s: p.s * k }; }
    if (index === 0) return { x: .54, y: .49, s: .94 };
    const textLeft = (index - 1) % 2 === 0;
    return { x: textLeft ? .69 : .31, y: .5, s: .86 };
  }
  const deck = root.querySelector('.home-deck');
  const swiping = () => narrow && deck && deck.scrollWidth > deck.clientWidth + 4;
  function progress() {
    // Phones: the sections sit side by side and the object follows the sideways swipe.
    if (swiping()) return clamp(deck.scrollLeft / deck.clientWidth, 0, stops.length - 1);
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
    if (shown < 0 || reduced) shown = progress();
    else if (swiping()) {
      // Phones: the page snaps quickly, but the object takes its time (about two seconds per page),
      // easing in and out, so it leads the eye; the words of the new page rise only once it is nearly formed.
      // (A jump of several pages, from the dashes, travels faster so it never takes long.)
      const goal = progress(), cap = dt * Math.max(.6, Math.abs(goal - shown) * .75), step = (goal - shown) * (1 - Math.exp(-dt * 1.8));
      shown += Math.max(-cap, Math.min(cap, step)); if (Math.abs(goal - shown) < .02) shown = goal; // the shape is already complete this close
      // The words never go blank: the next page's words are already there, faint and soft, and sharpen as the
      // object forms; the last page's words soften as it comes apart.
      // Words are fully sharp once the object is 80% of the way; then the blur is removed entirely (a blur filter,
      // even a tiny one, keeps text soft until it is gone).
      const words = stops.map((st, i) => { const v = Math.min(1, (1 - clamp(Math.abs(i - shown) / .85)) / .8); return (v * v * (3 - 2 * v)).toFixed(3); }).join(',');
      if (words !== shownWords) { shownWords = words; const k = words.split(','); stops.forEach((st, i) => { st.classList.add('is-in'); st.classList.toggle('is-settled', k[i] === '1.000'); st.style.setProperty('--scene-reveal', k[i]); }); }
    } else shown += (progress() - shown) * Math.min(1, dt * 6);
    // A short hold at each end: the scene stays assembled for the first and last 10% of the way to its
    // neighbour, so most of the travel between scenes stays visible.
    const i0 = Math.floor(shown), i1 = Math.min(stops.length - 1, i0 + 1), w = clamp((shown - i0 - .1) / .8);
    const cam = n => narrow || !DESK_CAMERA[n] ? CAMERA[n] : { ...CAMERA[n], ...DESK_CAMERA[n] };
    const n0 = sceneOf(i0), n1 = sceneOf(i1), C0 = cam(n0), C1 = cam(n1);
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

    const rx = mix(C0.rx, C1.rx, we) + .04 * Math.sin(t * .23) + py * .5;
    const ry = mix(C0.ry + C0.spin * t + (C0.sway || 0) * Math.sin(t * .14), C1.ry + C1.spin * t + (C1.sway || 0) * Math.sin(t * .14), we) + .06 * Math.sin(t * .31) + px * .75 + travel * .5 * (i0 % 2 ? -1 : 1) + dYaw;
    const rz = mix(C0.rz, C1.rz, we);
    // Desktop: each object is measured on screen and eased so its visible middle sits on its spot and it fills
    // its half of the screen evenly (a new viewing angle shifts a shape's visual centre). The clock keeps its own.
    // Desktop: each object's visible middle sits on its spot and it fills its half of the screen evenly
    // (a new viewing angle shifts a shape's visual centre). Measured once per scene, so it never wanders.
    const fitOf = (n, C, p) => {
      const base = Math.min(width, height) * .3 * p.s * C.size;
      if (narrow || n === 'time') return { x: 0, y: 0, R: base, hw: base * .8, hh: base * .8 };
      const e = extent(n, C, clock), fill = C.fill || [.36, .62], s = clamp(Math.min(width * fill[0] / (e.w * base), height * fill[1] / (e.h * base)), .85, 2);
      return { x: -e.mx * base * s, y: -e.my * base * s, R: base * s, hw: e.w * base * s / 2, hh: e.h * base * s / 2 };
    };
    const F0 = fitOf(n0, C0, p0), F1 = fitOf(n1, C1, p1);
    const cx = mix(p0.x, p1.x, we) * width + px * width * .03 + mix(F0.x, F1.x, we), cy = mix(p0.y, p1.y, we) * height + py * height * .03 + mix(F0.y, F1.y, we);
    const R = narrow ? Math.min(width, height) * .38 * mix(p0.s * C0.size, p1.s * C1.size, we) : mix(F0.R, F1.R, we);
    // The pointer only steers the object while it is over it.
    // The hot zone is the object's own drawn area, a little inside its edges.
    hot = { x: mix(p0.x, p1.x, we) * width, y: mix(p0.y, p1.y, we) * height, rx: mix(F0.hw, F1.hw, we) * .85, ry: mix(F0.hh, F1.hh, we) * .85 };
    if (aim) { tx = aim.x; ty = aim.y; } else { tx = 0; ty = 0; }
    const f = 3.6;
    const cX = Math.cos(rx), sX = Math.sin(rx), cY = Math.cos(ry), sY = Math.sin(ry), cZ = Math.cos(rz), sZ = Math.sin(rz);
    // The hand's up-down tilt is applied last, about the screen's own horizontal axis: dragging down always
    // brings the front of the object down, however far it has been turned around.
    const cP = Math.cos(dPitch), sP = Math.sin(dPitch);
    // A scene may also be turned in the screen's own plane (roll).
    const roll = mix(C0.roll || 0, C1.roll || 0, we), cR = Math.cos(roll), sR = Math.sin(roll);
    const project = (x, y, z) => {
      const x1 = x * cZ - y * sZ, y1 = x * sZ + y * cZ;
      const y2 = y1 * cX - z * sX, z2 = y1 * sX + z * cX;
      const x3 = x1 * cY + z2 * sY, z3 = -x1 * sY + z2 * cY;
      const y4 = y2 * cP + z3 * sP, z4 = z3 * cP - y2 * sP;
      const k = f / (f - z4), xs = x3 * cR - y4 * sR, ys = x3 * sR + y4 * cR;
      return [cx + xs * R * k, cy + ys * R * k, z4];
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
  onResize(() => { resize(); draw(0); }, { signal: controller.signal });
  const overObject = e => {
    const dx = (e.clientX - hot.x) / hot.rx, dy = (e.clientY - hot.y) / hot.ry;
    return dx * dx + dy * dy < 1 && !e.target.closest(HANDS_OFF) ? { x: dx * .5, y: dy * .5 } : null;
  };
  // Mouse: the object leans toward the pointer only while the pointer is over it; elsewhere it keeps its own slow show.
  on(window, 'pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    aim = overObject(e);
    document.documentElement.classList.toggle('can-turn', !!aim && !narrow);
  }, { passive: true });
  const off = () => { aim = null; document.documentElement.classList.remove('can-turn'); };
  on(document, 'pointerleave', off); on(window, 'blur', off);
  // Mouse: press on the object (not on a link or control) and drag to turn (left-right) and tip (up-down).
  // Touch: a sideways swipe turns it; up-down swipes still scroll the page.
  const HANDS_OFF = 'a, button, input, textarea, select, label, summary, [role="button"], .site-header, .home-rail, .wechat-qr, dialog';
  const turn = (dx, dy, dtS) => {
    const ay = dx / width * 3.4, ap = dy / height * 2.4;
    dYaw += ay; dPitch = clamp(dPitch + ap, -1.1, 1.1);
    vYaw = vYaw * .4 + (ay / dtS) * .6; vPitch = vPitch * .4 + (ap / dtS) * .6;
  };
  const release = () => { if (grab?.moved) { letGo = performance.now(); document.documentElement.classList.remove('is-turning'); } grab = null; };
  on(window, 'pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || reduced || !overObject(e)) return;
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
    // Phones: swiping on the words changes page; a drag in the empty area above them turns the object.
    const air = !!e.target.closest('.page-air');
    if (reduced || (swiping() && !air) || e.touches.length !== 1 || e.target.closest(HANDS_OFF)) { swipe = null; return; }
    const p = e.touches[0]; swipe = { x: p.clientX, y: p.clientY, t: performance.now(), mode: '', air };
  }, { passive: true });
  on(window, 'touchmove', e => {
    if (!swipe) return;
    const p = e.touches[0], dx = p.clientX - swipe.x, dy = p.clientY - swipe.y, now = performance.now();
    if (!swipe.mode) { if (Math.hypot(dx, dy) < 6) return; swipe.mode = swipe.air || Math.abs(dx) > Math.abs(dy) * 1.2 ? 'turn' : 'scroll'; if (swipe.mode === 'turn') { grab = { moved: true }; vYaw = vPitch = 0; } }
    if (swipe.mode !== 'turn') return;
    turn(dx, swipe.air ? dy : 0, Math.max(.008, (now - swipe.t) / 1000));
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
  function glide(to, duration, even = false) {
    stopGlide(); settling = true;
    const from = scrollY, start = performance.now();
    // Speeds up, then slows to rest. "even" is a gentler curve whose top speed is close to its average.
    const easeInOut = even ? x => (1 - Math.cos(Math.PI * x)) / 2 : x => x < .5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2;
    const step = now => {
      const p = Math.min(1, (now - start) / duration);
      scrollTo({ top: from + (to - from) * easeInOut(p), behavior: 'instant' });
      if (p < 1) glideFrame = requestAnimationFrame(step); else { glideFrame = 0; setTimeout(() => { settling = false; }, 80); }
    };
    glideFrame = requestAnimationFrame(step);
  }
  let restAt = -1; // the section the page last came to rest on
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(type => on(window, type, () => { if (glideFrame) stopGlide(); }, { passive: true }));
  // After 1 second without any input, a page left between two sections glides slowly to the nearest one.
  // The first screen settles to the very top; the bottom of the page (the footer) is left alone.
  function settle() {
    if (innerWidth < 760 || reducedMotion || !centres.length || glideFrame) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (scrollY >= max - 4) return;
    const targets = centres.map((c, i) => i === 0 ? 0 : Math.max(0, Math.min(max, c - innerHeight / 2)));
    let to = targets[0];
    targets.forEach(tg => { if (Math.abs(tg - scrollY) < Math.abs(to - scrollY)) to = tg; });
    const gap = to - scrollY;
    restAt = targets.indexOf(to);
    if (Math.abs(gap) < 4) return;
    glide(to, Math.min(2400, 1100 + Math.abs(gap) * 1.6));
  }
  // As soon as a scroll ends (wheel or trackpad let go, momentum done), read the intent: a clear move away from
  // the section the page rested on carries on to the next section in that direction, gliding slowly so the
  // object leads the eye. Small nudges are left to the 1-second settle above, which returns to the nearest.
  let release = 0;
  function carryOn() {
    if (innerWidth < 760 || reducedMotion || !centres.length || glideFrame) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    const targets = centres.map((c, i) => i === 0 ? 0 : Math.max(0, Math.min(max, c - innerHeight / 2)));
    let near = 0; targets.forEach((tg, i) => { if (Math.abs(tg - scrollY) < Math.abs(targets[near] - scrollY)) near = i; });
    const last = targets.length - 1;
    if (scrollY > targets[last] + innerHeight * .2) return; // down at the footer: leave it
    if (restAt < 0) restAt = near;
    const delta = scrollY - targets[restAt];
    let to = -1;
    if (near !== restAt) to = near;
    else if (Math.abs(delta) > innerHeight * .08) to = Math.max(0, Math.min(last, restAt + Math.sign(delta)));
    if (to < 0 || (to === last && restAt === last && delta > 0)) return;
    const gap = targets[to] - scrollY;
    restAt = to; clearTimeout(idle);
    if (Math.abs(gap) < 4) return;
    glide(targets[to], Math.min(2600, 1500 + Math.abs(gap) * .8));
  }
  const wait = () => { clearTimeout(idle); if (!settling) idle = setTimeout(settle, 1000); };
  on(window, 'scroll', () => { if (settling) return; wait(); clearTimeout(release); release = setTimeout(carryOn, 180); }, { passive: true });
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
    if (deck && deck.scrollWidth > deck.clientWidth + 4) {
      // Phones: the page in view shows its words; a page sliding away lets them go a moment before it leaves.
      // (Which page's words show is decided by the object, in mountClock: they follow its morph.)
      const at = deck.scrollLeft / deck.clientWidth; best = Math.round(at);
      dots.forEach((d, j) => d.classList.toggle('is-active', j === best));
    } else {
      if (best === current) return;
      stops.forEach((st, i) => st.classList.toggle('is-in', i === best));
    }
    current = best;
    railButtons.forEach((b, j) => b.classList.toggle('is-active', j === best));
  }
  const deck = root.querySelector('.home-deck'), dots = [...root.querySelectorAll('.home-dots button')];
  const queue = () => { if (!pick) pick = requestAnimationFrame(choose); };
  on(window, 'scroll', queue, { passive: true });
  if (deck) on(deck, 'scroll', queue, { passive: true });
  dots.forEach(d => on(d, 'click', () => deck.scrollTo({ left: Number(d.dataset.page) * deck.clientWidth, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth' })));
  on(window, 'resize', () => { measureStops(); queue(); }, { passive: true });
  const ro = new ResizeObserver(() => { measureStops(); queue(); }); ro.observe(root);
  measureStops(); choose();
  // The side rail travels with our own glide, at most about one section per 1.3 seconds, so each change of shape
  // on the way has time to play (jumping several sections takes longer).
  railButtons.forEach(b => on(b, 'click', () => {
    const idx = Number(b.dataset.stop), target = stops[idx]; if (!target) return;
    const r = target.getBoundingClientRect(), max = document.documentElement.scrollHeight - innerHeight;
    const to = idx === 0 ? 0 : Math.max(0, Math.min(max, r.top + scrollY - Math.max(0, (innerHeight - r.height) / 2)));
    if (reducedMotion) { scrollTo({ top: to, behavior: 'instant' }); return; }
    const mid = scrollY + innerHeight / 2;
    let from = 0; centres.forEach((c, i) => { if (Math.abs(c - mid) < Math.abs(centres[from] - mid)) from = i; });
    const passes = Math.max(Math.abs(idx - from), Math.abs(to - scrollY) / innerHeight);
    restAt = idx; clearTimeout(idle); clearTimeout(release);
    if (Math.abs(to - scrollY) > 4) glide(to, Math.max(1500, passes * 1300), passes > 1.2);
  }));

  return () => { controller.abort(); clearTimeout(idle); clearTimeout(release); cancelAnimationFrame(glideFrame); cancelAnimationFrame(pick); ro.disconnect(); disposeClock(); disposeLabel(); };
}
