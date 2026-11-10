import { mountAmbient } from './ambient.js';
import { poetryLanding, poetryReading, poetryResults, mountPoetry } from './poetry.js';
import { homeLanding, mountHome } from './home.js';
import { projectLanding, mountProject } from './project.js';
mountAmbient(document.body);
const main = document.querySelector('main');
const dialog = document.querySelector('#photo-dialog');
const labels = { poetry: '无关风月', essay: '白马非马', story: '南风过境', note: '随遇而安', letter: '十二月的晚安' };
const kindNames = { essay: '随笔', story: '故事', note: '短句', letter: '分享日志' };
const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stamp = value => value.replaceAll('-', '.');
const workTitle = work => work.kind === 'poetry' ? `${work.date.slice(5,7)}/${work.date.slice(8,10)}/${work.date.slice(0,4)}` : work.title;
const arrow = '<span aria-hidden="true">↗</span>';
let data;
let disposePoetry = null;
let disposeHome = null;
let disposeProject = null;
let currentPhoto = 0;
const siteIndex = document.querySelector('#site-index');
const indexTrigger = document.querySelector('#index-trigger');

function safeUrl(value) {
  try {
    const url = new URL(value.replaceAll('&amp;', '&'), location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? escape(url.href) : '#';
  } catch {
    return '#';
  }
}

function inline(text) {
  return escape(text)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy">`)
    .replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (_, title, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${title}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function markdown(body) {
  const text = body
    .replace(/<img\b[^>]*>/gi, tag => {
      const src = /src=["']([^"']+)["']/i.exec(tag)?.[1] || '';
      const alt = /alt=["']([^"']*)["']/i.exec(tag)?.[1] || '';
      return `\n\n![${alt}](${src})\n\n`;
    })
    .replace(/<\/?(?:div|p)\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();
  return text.split(/\n\s*\n/).map(block => {
    const lines = block.trim().split('\n').map(line => line.trimEnd());
    if (!lines.some(line => line.trim())) return '';
    if (/^[-_]{3,}$/.test(block.trim())) return '<hr>';
    if (lines[0].startsWith('>')) {
      return `<blockquote>${lines.map(line => inline(line.replace(/^>\s?/, ''))).join('<br>')}</blockquote>`;
    }
    if (/^#{1,6}\s/.test(lines[0])) {
      return `<h2>${inline(lines[0].replace(/^#+\s*/, ''))}</h2>${lines.length > 1 ? `<p>${lines.slice(1).map(inline).join('<br>')}</p>` : ''}`;
    }
    if (lines[0].startsWith('![')) {
      const images = lines.filter(line => line.startsWith('!['));
      const caption = lines.filter(line => !line.startsWith('!['));
      return `<figure>${images.map(inline).join('')}${caption.length ? `<figcaption>${caption.map(inline).join('<br>')}</figcaption>` : ''}</figure>`;
    }
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}

function pageHeading(english, title, description, count = '') {
  return `<header class="page-heading"><span class="eyebrow">${english}</span><h1>${title}${count !== '' ? `<span class="page-count">${count}</span>` : ''}</h1><p>${description}</p></header>`;
}

function articleRow(article, heading = 'h3') {
  return `<a class="article-row" href="/article/${article.id}"><span class="subtle-meta">${escape(labels[article.kind])} · ${stamp(article.date)}</span><${heading}>${escape(article.title)}</${heading}><p>${escape(article.excerpt)}…</p></a>`;
}

function homePage() {
  return `<section class="collection-pending"><span class="poetry-kicker">HOME / A PERSONAL COLLECTION</span><h1>喜欢的事物，<br>慢慢收藏<span>.</span></h1><p>小家，一间私人的收藏馆。<br>展览准备中。</p><a class="poetry-link" href="/poetry">诗歌 <span>↗</span></a><div class="collection-outline" aria-hidden="true"><span>Y.</span><small>THINGS I KEEP.</small></div></section>`;
}

function filters(works, article = false) {
  const params = new URLSearchParams(location.search);
  const years = [...new Set(works.map(p => p.year))].sort().reverse();
  const kind = params.get('kind') || 'all';
  return `<form class="filter-bar" role="search" aria-label="搜索${article ? '随笔' : '诗歌'}">${article ? `<div class="kind-filter" aria-label="体裁">${[['all', '全部'], ...Object.entries(kindNames)].map(([value, name]) => `<button type="button" data-kind="${value}" aria-pressed="${kind === value}">${name}</button>`).join('')}</div>` : '<span class="subtle-meta">循着年份，慢慢翻阅。</span>'}<div class="filter-controls"><input name="q" type="search" value="${escape(params.get('q') || '')}" placeholder="${article ? '搜索标题或正文…' : '搜索日期或诗句…'}" aria-label="${article ? '搜索标题或正文' : '搜索日期或诗句'}"><select name="year" aria-label="按年份筛选"><option value="all">所有年份</option>${years.map(year => `<option${params.get('year') === year ? ' selected' : ''} value="${year}">${year} 年</option>`).join('')}</select></div></form><p id="results-note" class="results-note" aria-live="polite"></p><div id="results"></div>`;
}

function libraryPage(article = false) {
  if (article) return `<header class="journal-hero"><span class="eyebrow">02 / THE BOOKSHELF</span><h1>Thinking<br>out loud<span>.</span></h1><div><p>一页随笔，一段故事。<br>有些想法，慢慢才有答案。</p><span class="subtle-meta">${data.articles.length} PIECES / 2017—2024</span></div></header>` + filters(data.articles, true);
  return poetryLanding(data.poems);
}

function updateResults() {
  const container = document.querySelector('#results');
  if (!container) return;
  const article = location.pathname.startsWith('/article');
  if (!article) { container.innerHTML = poetryResults(data.poems); return; }
  const works = article ? data.articles : data.poems;
  const params = new URLSearchParams(location.search);
  const q = (params.get('q') || '').trim().toLocaleLowerCase();
  const year = params.get('year') || 'all';
  const kind = params.get('kind') || 'all';
  const results = works.filter(p => (year === 'all' || p.year === year) && (kind === 'all' || p.kind === kind) && (!q || (workTitle(p) + '\n' + p.date + '\n' + p.body).toLocaleLowerCase().includes(q)));
  document.querySelector('#results-note').textContent = `共 ${results.length} ${article ? '篇文字' : '首诗'}${q ? ` · 与「${params.get('q')}」有关` : ''}`;
  if (!results.length) {
    container.innerHTML = '<p class="empty">这一页暂时没有找到相应的文字。试试其他词语，或换一个年份。</p>';
    main.dispatchEvent(new CustomEvent('poetry:results'));
    return;
  }
  if (article) {
    container.innerHTML = `<div class="article-list">${results.map(a => articleRow(a, 'h2')).join('')}</div>`;
    return;
  }
  container.innerHTML = poetryResults(results);
  main.dispatchEvent(new CustomEvent('poetry:results'));
}


function photosPage() {
  return `<header class="gallery-hero"><span class="eyebrow">04 / THROUGH THE LENS</span><h1>Through<br>my eyes<span>.</span></h1><div><p>那些，不想忘记的片刻。</p><span class="subtle-meta">${String(data.photos.length).padStart(2, '0')} MOMENTS / AN ONGOING COLLECTION</span></div></header><div class="photo-grid">${data.photos.map((p, i) => `<figure><button class="photo-button" data-photo="${p.id}" aria-label="放大照片：${escape(p.title)}"><img src="${p.src}" alt="${escape(p.title)}${p.location ? '，' + escape(p.location) : ''}" loading="${i ? 'lazy' : 'eager'}"></button><figcaption class="photo-caption"><strong><span>${String(i + 1).padStart(2, '0')}</span> ${escape(p.title)}${p.location ? ' / ' + escape(p.location) : ''}</strong><span>${stamp(p.date)}</span></figcaption></figure>`).join('')}</div>`;
}

function readingPage(work, poetry) {
  if (poetry) return poetryReading(work, data.poems, { markdown });
  const type = poetry ? 'poetry' : 'article';
  const works = poetry ? data.poems : data.articles;
  const index = works.findIndex(p => p.id === work.id);
  const previous = works[index - 1];
  const next = works[index + 1];
  return `<article class="reading-shell"><a class="back-link" href="/${type}">← 回到${poetry ? '诗集' : '随笔'}</a><header class="reading-heading"><span class="subtle-meta">${escape(labels[work.kind])} / ${poetry ? 'POETRY' : stamp(work.date)}</span><h1>${poetry ? `<time datetime="${work.date}">${workTitle(work)}</time>` : escape(work.title)}</h1><a class="source-link" href="${work.source}" target="_blank" rel="noopener noreferrer">阅读仓库原文 ↗</a></header><div class="reading-body${poetry ? ' poetry' : ''}">${markdown(work.body)}</div><nav class="reading-foot" aria-label="相邻篇目">${previous ? `<a href="/${type}/${previous.id}">← ${escape(workTitle(previous))}</a>` : `<a href="/${type}">← 返回目录</a>`}${next ? `<a href="/${type}/${next.id}">${escape(workTitle(next))} →</a>` : `<a href="/${type}">返回目录 →</a>`}</nav></article>`;
}

function notFound() {
  return '<section class="error-page"><span class="eyebrow">404 / A LITTLE DETOUR</span><h1>似乎走到了一条小岔路。</h1><p>这一页还不存在，一起回到熟悉的地方吧。</p><a class="text-link" href="/home">回到首页 <span>↗</span></a></section>';
}

function render() {
  if (disposePoetry) { disposePoetry(); disposePoetry = null; }
  if (disposeHome) { disposeHome(); disposeHome = null; }
  if (disposeProject) { disposeProject(); disposeProject = null; }
  if (dialog.open) dialog.close();
  document.querySelectorAll('#site-index, #outside-panel').forEach(d => { if (d.open) d.close(); });
  const parts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const page = parts[0] || 'index'; // '/' is the homepage; '/home' is the 家居 collection
  document.body.className = `theme-${page}${parts.length === 2 ? ' is-reading' : ''}${page === 'home' ? ' is-collection' : ''}`;
  let title = '';
  let html;
  if (parts.length > 2) html = notFound();
  else if (parts.length === 2 && ['poetry', 'article'].includes(page)) {
    const work = (page === 'poetry' ? data.poems : data.articles).find(p => p.id === parts[1]);
    html = work ? readingPage(work, page === 'poetry') : notFound();
    if (work) title = workTitle(work);
  } else if (parts.length > 1) html = notFound();
  else {
    const pages = { index: () => homeLanding(data), home: homePage, poetry: () => libraryPage(), article: () => libraryPage(true), project: () => projectLanding(data), photos: photosPage };
    html = (pages[page] || notFound)();
    title = ({ poetry: '诗歌', article: '随笔', project: '项目', photos: '摄影', home: '家居' })[page] || title;
  }
  main.innerHTML = html;
  // The site is 叙己 Yifanovo; inner pages put their own name in front.
  document.title = title ? `${title} · 叙己 Yifanovo` : '叙己 Yifanovo';
  document.querySelectorAll('#site-index .index-list a').forEach(link => {
    const here = link.pathname === location.pathname || (link.pathname !== '/' && location.pathname.startsWith(link.pathname + '/'));
    if (here) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('.site-header nav a').forEach(link => {
    if (link.pathname === `/${page}`) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  updateResults();
  if (page === 'poetry') disposePoetry = mountPoetry(main, { poems:data.poems, navigate, setFilter });
  if (page === 'index') disposeHome = mountHome(main);
  if (page === 'project') disposeProject = mountProject(main, data);
}

function navigate(path) {
  const update = () => { history.pushState(null, '', path); render(); window.scrollTo(0, 0); main.focus({ preventScroll: true }); };
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(update).finished.catch(() => {});
  else update();
}

function showPhoto(index) {
  currentPhoto = (index + data.photos.length) % data.photos.length;
  const p = data.photos[currentPhoto];
  dialog.querySelector('figure').innerHTML = `<img src="${p.src}" alt="${escape(p.title)}"><figcaption>${String(currentPhoto + 1).padStart(2, '0')} / ${String(data.photos.length).padStart(2, '0')} · ${escape(p.title)} · ${escape(p.location)} ${stamp(p.date)}<br>${escape(p.caption)}</figcaption>`;
  if (!dialog.open) dialog.showModal();
}

function setFilter(key, value) {
  const url = new URL(location.href);
  if (!value || value === 'all') url.searchParams.delete(key);
  else url.searchParams.set(key, value);
  history.replaceState(null, '', url);
  document.querySelectorAll('[data-kind]').forEach(button => button.setAttribute('aria-pressed', (url.searchParams.get('kind') || 'all') === button.dataset.kind));
  updateResults();
}

document.addEventListener('click', event => {
  const kind = event.target.closest('[data-kind]');
  if (kind) return setFilter('kind', kind.dataset.kind);
  const photo = event.target.closest('[data-photo]');
  if (photo) {
    showPhoto(data.photos.findIndex(item => item.id === photo.dataset.photo));
    return;
  }
  const link = event.target.closest('a');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || url.hash || !['', 'home', 'poetry', 'article', 'project', 'photos'].includes(url.pathname.split('/')[1])) return;
  event.preventDefault();
  navigate(url);
});
document.addEventListener('input', event => {
  if (event.target.matches('.filter-bar input[name=q]')) setFilter('q', event.target.value);
});
document.addEventListener('change', event => {
  if (event.target.matches('.filter-bar select[name=year]')) setFilter('year', event.target.value);
});
document.addEventListener('submit', event => {
  if (event.target.matches('.filter-bar')) event.preventDefault();
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.photo-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
dialog.querySelector('.photo-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
window.addEventListener('keydown', e => {
  if (!dialog.open) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(currentPhoto + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(currentPhoto - 1); }
});
indexTrigger.addEventListener('click', () => {
  const d = new Date(), part = h => h < 5 || h >= 19 ? '夜' : h < 9 ? '晨' : h < 17 ? '昼' : '暮';
  siteIndex.querySelector('.index-now').textContent = `此刻 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} · ${part(d.getHours())}`;
  siteIndex.showModal(); siteIndex.classList.add('open'); indexTrigger.setAttribute('aria-expanded', 'true');
  siteIndex.focus({ preventScroll: true }); // focus the panel, not the close button, so no focus ring appears on open
});
// WeChat QR wherever it appears (homepage, footer, index): hover or focus shows it, a tap toggles it.
document.addEventListener('click', event => {
  const button = event.target.closest('.wechat button');
  document.querySelectorAll('.wechat.is-open').forEach(w => { if (!button || w !== button.parentElement) w.classList.remove('is-open'); });
  if (button) button.parentElement.classList.toggle('is-open');
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') document.querySelectorAll('.wechat.is-open').forEach(w => w.classList.remove('is-open')); });
siteIndex.addEventListener('close', () => { siteIndex.classList.remove('open'); indexTrigger.setAttribute('aria-expanded', 'false'); });
document.querySelectorAll('#site-index, #outside-panel').forEach(d => {
  d.querySelector('.dialog-close').addEventListener('click', () => d.close());
  d.addEventListener('click', e => { if (e.target === d) { const b = d.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) d.close(); } });
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  }
});
window.addEventListener('popstate', () => { render(); window.scrollTo(0, history.state?.poetryScroll || 0); });

try {
  const response = await fetch('/content.json');
  if (!response.ok) throw new Error('Content unavailable');
  data = await response.json();
  render();
} catch (error) {
  main.innerHTML = '<section class="error-page"><h1>这一页暂时没能翻开。</h1><p>请刷新后再试，也可以先去阅读原文。</p><a class="text-link" href="https://github.com/yifanwow/esilhmt">打开文字仓库 <span>↗</span></a></section>';
  console.error(error);
}
