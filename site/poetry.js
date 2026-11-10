const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dated = date => `${date.slice(5,7)}/${date.slice(8,10)}/${date.slice(0,4)}`;
const storage = {
  read(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
  write(key, value) { try { sessionStorage.setItem(key, value); } catch { /* Optional position. */ } },
};
function archivePosition() {
  try { return JSON.parse(storage.read('poetry-archive') || 'null')?.scroll || 0; }
  catch { return 0; }
}

const chineseDigits = '零一二三四五六七八九';
function chineseNumber(value) {
  if(value<10)return chineseDigits[value];
  if(value===10)return '十';
  return (value<20?'':chineseDigits[Math.floor(value/10)])+'十'+(value%10?chineseDigits[value%10]:'');
}
const chineseYear = year => [...year].map(n=>chineseDigits[Number(n)]).join('');
function chineseDate(date) {
  return chineseYear(date.slice(0,4))+'年'+chineseNumber(Number(date.slice(5,7)))+'月'+chineseNumber(Number(date.slice(8,10)))+'日';
}
function seeded(seed) {
  return () => { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
}

// One horizontal reading of time, shared by the rain and the word cloud's time track.
// Half calendar, half order: busy years spread out, quiet years keep their gaps.
const timelines = new WeakMap();
function timeline(poems) {
  if(timelines.has(poems))return timelines.get(poems);
  const asc=[...poems].sort((a,b)=>a.date<b.date?-1:1),time=p=>Date.parse(p.date);
  const t0=time(asc[0]),span=Math.max(1,time(asc.at(-1))-t0),n=asc.length;
  const pos=new Map(asc.map((p,i)=>[p.id,.42*(time(p)-t0)/span+.58*(n>1?i/(n-1):.5)]));
  const years=[...new Set(asc.map(p=>p.year))].map(year=>{
    const xs=asc.filter(p=>p.year===year).map(p=>pos.get(p.id));
    return {year,x:(Math.min(...xs)+Math.max(...xs))/2};
  });
  const result={pos,years};timelines.set(poems,result);return result;
}

const plainText = body => body.replace(/<[^>]*>/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/『[^』]*』/g,'');

// Word frequencies for the cloud. Single characters only count when whitelisted (你 is a presence in these poems);
// longer words drop pronoun-led phrases and function words. Edit the two lists to tune what appears.
const CLOUD_KEEP=new Set('你 风 光 雨 梦 雾 云 钟 窗 爱 声 雪 花 海 星 月 心 山 夜 灯 你我 一阵 也许'.split(' '));
const CLOUD_SKIP=new Set(('一样 最后 有人 没有 一个 一次 什么 站在 自己 还是 似乎 只是 我们 他们 她们 再次 一天 人们 随着 那些 一起 开始 成了 一片 不知 过去 '+
  '透过 落在 向前 一半 每一 一点 一切 总是 偶尔 不同 感受 过的 连同 都是 不断 这个 像是 所有 因为 如果 还有 而后 发出 一步 时而 他人 中央 不曾 无法 '+
  '只剩下 点点 转眼 已经 好的 看到 逐渐 都在 属于 朝着 存在 一声 无数 好像 仿佛 依然 之间 这样 那样 可以 知道 觉得 一直 然后 之后 之前 起来 出来 下来 '+
  '不再 不会 时候 但是 可是 所以 就是 这些 一些 一种 每个 有些 那个 其中 并不 只有 不过 甚至 而已 当时 此时 那时 一同 一边 一直 面前 低头 双手 发现').split(' '));
const CLOUD_SIZE=240;
const cloudCache=new WeakMap();
function cloudWords(poems) {
  if(cloudCache.has(poems))return cloudCache.get(poems);
  const counts=new Map();
  let segmenter=null;try{segmenter=new Intl.Segmenter('zh',{granularity:'word'});}catch{ /* Older browsers: no cloud. */ }
  if(segmenter)for(const poem of poems){
    for(const s of segmenter.segment(plainText(poem.body))){
      const w=s.segment;
      if(!s.isWordLike||!/^\p{Script=Han}+$/u.test(w))continue;
      if(w.length===1?!CLOUD_KEEP.has(w):(!CLOUD_KEEP.has(w)&&(CLOUD_SKIP.has(w)||w.length>4||/^[我你他她它这那一每些有没不是在的了着也都还就又很再只被把]|[的了着吗呢吧啊过]$/.test(w))))continue;
      let entry=counts.get(w);if(!entry){entry={word:w,total:0,byPoem:new Map()};counts.set(w,entry);}
      entry.total++;entry.byPoem.set(poem,(entry.byPoem.get(poem)||0)+1);
    }
  }
  const list=[...counts.values()].filter(e=>e.total>=2).sort((x,y)=>y.total-x.total||x.word.localeCompare(y.word)).slice(0,CLOUD_SIZE)
    .map(e=>({word:e.word,total:e.total,hits:[...e.byPoem].map(([poem,n])=>({poem,n}))}));
  cloudCache.set(poems,list);return list;
}

function mountTimeRain(root, poems) {
  const scene=root.querySelector('.time-rain');if(!scene||!poems.length)return ()=>{};
  const atmosphere=scene.querySelector('.time-rain-atmosphere'),field=scene.querySelector('.time-rain-letters'),canvas=scene.querySelector('canvas'),caption=scene.querySelector('.time-rain-caption'),toggle=scene.querySelector('.time-rain-motion');
  const ctx=canvas.getContext('2d'),controller=new AbortController(),media=matchMedia('(prefers-reduced-motion:reduce)');
  const on=(target,name,handler,options={})=>target.addEventListener(name,handler,{...options,signal:controller.signal});
  const random=seeded(73841),between=(a,b)=>a+(b-a)*random();
  const {pos}=timeline(poems);
  let sceneTop=0,width=0,height=0,far=0,near=0,pad=0,frame=0,lastTime=0,visible=true,paused=media.matches,scrollPush=0,lastScroll=scrollY,narrow=false;
  let pointer=null,held=null,strokes=[],ripples=[],beads=[];
  const gravity=260;
  // The ground is a plane seen at an angle: far drops land higher and smaller, near drops lower and larger.
  const groundAt=depth=>far+(near-far)*depth;

  // Each poem is one drop. It keeps its column; only its moment of falling changes.
  const drops=poems.map(poem=>{
    const el=document.createElement('a');el.className='rain-drop';el.href='/poetry/'+poem.id;el.tabIndex=-1;
    const column=document.createElement('span');column.className='rain-glyphs';
    const chars=[...chineseDate(poem.date)];
    // Tail fades toward the top via per-glyph opacity (a CSS mask here forced a repaint every frame).
    const glyphs=chars.map((char,i)=>{const g=document.createElement('span');g.textContent=char;g.style.setProperty('--o',(.18+.82*Math.pow(i/(chars.length-1),1.3)).toFixed(3));column.append(g);return g;});
    el.append(column);
    const depth=random();
    el.style.setProperty('--depth',depth.toFixed(3));
    field.append(el);
    return {poem,el,glyphs,depth,jitter:between(-4,4),vmax:between(62,92)+depth*92,v:0,y:0,len:0,x:0,ground:0,state:'wait',wait:0,slow:1,spread:0,
      line:(poem.excerpt||'').split('\n')[0].trim()};
  });

  function place(d) {
    d.el.style.transform=`translate3d(${(d.x-d.half).toFixed(1)}px,${(d.y-d.len).toFixed(1)}px,0)`;
  }
  function ripple(x,y,depth,strength=1) {
    ripples.push({x,y,depth,t:0,size:(9+depth*40)*strength,alpha:(.16+depth*.38)*strength,life:.9+strength*1.1});
  }
  // On touching the ground the drop keeps sinking; each character that reaches the surface loosens and spreads like ink in water.
  function spreadGlyph(d,g,index) {
    const lift=index/d.glyphs.length,side=random()<.5?-1:1;
    g.style.setProperty('--sx',(side*between(5,12+lift*20)*(.6+d.depth*.7)).toFixed(1)+'px');
    g.style.setProperty('--sy',(between(-3,4)-d.v*d.slow*1.25).toFixed(1)+'px'); // stay near the surface while the column keeps sinking
    g.style.setProperty('--ss',between(1.4,2).toFixed(2));
    g.style.setProperty('--sb',(2+d.depth*2.5).toFixed(1)+'px');
    g.classList.add('is-spread');
  }
  function touch(d) {
    d.state='sink';d.spread=0;d.v*=.32;
    ripple(d.x,d.ground,d.depth);
    for(let i=0;i<1+Math.round(d.depth*3);i++)beads.push({x:d.x,y:d.ground,ground:d.ground,vx:between(-24,24)*(.5+d.depth),vy:-between(30,80)*(.5+d.depth*.7),t:0,depth:d.depth});
  }
  function sink(d,k) {
    d.y+=d.v*k;
    const glyphHeight=(d.len-12)/d.glyphs.length;
    // Characters count from the bottom: the head is the first to reach the water.
    while(d.spread<d.glyphs.length){
      const index=d.glyphs.length-1-d.spread,centre=d.y-d.len+6+(index+.5)*glyphHeight;
      if(centre<d.ground)break;
      spreadGlyph(d,d.glyphs[index],d.spread);
      if(d.spread%3===2)ripple(d.x+between(-3,3),d.ground,d.depth,.45);
      d.spread++;
    }
    if(d.spread>=d.glyphs.length&&d.y-d.len>d.ground+12){d.state='wait';d.wait=between(2.5,13)*(narrow?1.8:1);}
  }
  function release(d) {
    d.state='fall';d.y=-between(0,50);d.v=between(10,30);
    for(const g of d.glyphs){g.style.transition='none';g.classList.remove('is-spread');}
    d.el.offsetWidth;for(const g of d.glyphs)g.style.transition='';
  }
  function stepDrops(dt) {
    for(const d of drops){
      if(d===held)continue;
      // Time thins out around the cursor: rain in that column slows almost to a stop.
      const close=pointer&&pointer.y<d.ground+20&&Math.abs(d.x-pointer.x)<70;
      d.slow+=((close?.16:1)-d.slow)*Math.min(1,dt*5);
      const k=dt*d.slow*(1+scrollPush/55);
      if(d.state==='wait'){d.wait-=k;if(d.wait<=0)release(d);}
      else if(d.state==='fall'){d.v=Math.min(d.vmax,d.v+gravity*k);d.y+=d.v*k;if(d.y>=d.ground)touch(d);}
      else sink(d,k);
      if(d.state!=='wait')place(d);
    }
  }
  function stepAir(dt) {
    const k=dt*(1+scrollPush/40);
    for(const s of strokes){
      s.y+=s.speed*k;
      if(s.y+s.length>s.ground){
        if(random()<.22)ripple(s.x,s.ground,s.depth,.32);
        s.y=-s.length-between(0,160);s.x=between(0,width);
      }
    }
    for(const r of ripples)r.t+=dt/r.life;
    ripples=ripples.filter(r=>r.t<1).slice(-120);
    for(const b of beads){b.t+=dt;b.vy+=300*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;}
    beads=beads.filter(b=>b.y<=b.ground+1&&b.t<1.2);
  }
  function ring(r,scale,alpha) {
    const e=1-(1-Math.min(1,r.t/scale.until))**3,rx=r.size*scale.size*e;
    // Flatter when far away, rounder when close: the eye looks down onto nearer water.
    const ry=rx*(.07+r.depth*.17);
    ctx.lineWidth=.45+r.depth*.6;ctx.strokeStyle=`rgba(214,208,226,${alpha})`;
    ctx.beginPath();ctx.ellipse(r.x,r.y,rx,ry,0,0,Math.PI*2);ctx.stroke();
  }
  const streak=document.createElement('canvas');streak.width=2;streak.height=64;
  {const g=streak.getContext('2d'),grad=g.createLinearGradient(0,0,0,64);grad.addColorStop(0,'rgba(195,200,223,0)');grad.addColorStop(1,'rgba(195,200,223,1)');g.fillStyle=grad;g.fillRect(0,0,2,64);}
  function draw() {
    if(!ctx)return;ctx.clearRect(0,0,width,height);
    for(const s of strokes){
      const bottom=Math.min(s.y+s.length,s.ground);if(bottom<=s.y)continue;
      ctx.globalAlpha=s.alpha;ctx.drawImage(streak,s.x,s.y,s.width*1.4,bottom-s.y);
    }
    ctx.globalAlpha=1;
    for(const r of ripples){
      const fade=(1-r.t)**1.7*r.alpha;
      ring(r,{size:1,until:1},fade);
      if(r.size>16&&r.t>.18)ring({...r,t:r.t-.18},{size:.56,until:.82},fade*.55);
    }
    for(const b of beads){ctx.fillStyle=`rgba(226,220,232,${.5*(1-b.t/1.2)})`;const s=.7+b.depth*.8;ctx.fillRect(b.x-s/2,b.y-s/2,s,s);}
  }
  function canRun(){return visible&&!document.hidden&&!paused;}
  function stop(){cancelAnimationFrame(frame);frame=0;lastTime=0;}
  function start(){if(canRun()&&!frame){lastTime=0;frame=requestAnimationFrame(loop);}}
  function loop(time) {
    frame=0;if(!canRun())return;
    const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;
    scrollPush*=Math.pow(.05,dt);
    applyFade(fadeShown<0?fadeTarget:fadeShown+(fadeTarget-fadeShown)*Math.min(1,dt*10));
    stepDrops(dt);stepAir(dt);draw();
    frame=requestAnimationFrame(loop);
  }
  function updateToggle(){toggle.classList.toggle('is-paused',paused);toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'播放时间雨':'暂停时间雨');}
  function showCaption(d) {
    caption.replaceChildren();
    const time=document.createElement('time');time.dateTime=d.poem.date;time.textContent=dated(d.poem.date);caption.append(time);
    if(d.line){const line=document.createElement('span');line.textContent=d.line;caption.append(line);}
    const left=d.x>width-280;
    caption.classList.toggle('is-left',left);
    caption.style.transform=`translate3d(${(d.x+(left?-18:18)).toFixed(1)}px,${Math.max(14,d.y-d.len).toFixed(1)}px,0)${left?' translateX(-100%)':''}`;
    caption.classList.add('is-visible');
  }
  function hold(d){if(d.state!=='fall')return;if(held)unhold();held=d;d.el.classList.add('is-held');showCaption(d);}
  function unhold(){if(!held)return;held.el.classList.remove('is-held');held=null;caption.classList.remove('is-visible');}
  function measure(){for(const d of drops){d.len=d.el.offsetHeight;d.half=d.el.offsetWidth/2;}} // read once, never inside the frame loop
  function resize(first=false) {
    const rect=scene.getBoundingClientRect();if(!rect.width||!rect.height)return;
    const oldHeight=height;
    width=rect.width;height=rect.height;narrow=width<700;sceneTop=rect.top+scrollY;
    pad=narrow?22:Math.max(56,width*.075);
    far=height*(narrow?.7:.68);near=height-(narrow?26:38);
    const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);
    measure();
    for(const d of drops){
      d.x=pad+pos.get(d.poem.id)*(width-2*pad)+d.jitter;d.ground=groundAt(d.depth);
      if(first){
        // Start mid-shower: some drops already in the air, the rest waiting their turn.
        if(paused||random()<.42){d.state='fall';d.y=between(d.len*.7,d.ground-6);d.v=d.vmax*.8;}
        else{d.state='wait';d.wait=between(0,9)*(narrow?1.6:1);d.glyphs.forEach(g=>g.classList.add('is-spread'));}
      } else if(oldHeight) d.y=Math.min(d.y*height/oldHeight,d.state==='fall'?d.ground:Infinity);
      place(d);
    }
    strokes=Array.from({length:Math.round(width/(narrow?16:12))},()=>{const depth=random();return {depth,ground:groundAt(depth),x:between(0,width),y:between(-200,height*.6),length:between(14,30)+depth*40,speed:between(240,330)+depth*120,alpha:between(.03,.06)+depth*.07,width:.3+depth*.45,slant:between(.6,2.6)};});
    if(held)showCaption(held);
    draw();start();
  }
  // Scrolling away fades and lifts the rain. Progress comes from the cached top of the scene, so scrolling never
  // forces a layout, and it is written to one element only (a CSS variable here restyled every glyph below it).
  let fadeTarget=0,fadeShown=-1;
  function applyFade(value) {
    if(Math.abs(value-fadeShown)<.0005)return;fadeShown=value;
    atmosphere.style.opacity=(1-value*.82).toFixed(4);atmosphere.style.transform=`translate3d(0,${(-value*40).toFixed(2)}px,0)`;
  }
  function scroll() {
    fadeTarget=height?Math.max(0,Math.min(1,(scrollY-sceneTop)/height)):0;
    scrollPush=Math.min(40,scrollPush+Math.abs(scrollY-lastScroll)*.04);lastScroll=scrollY;
    if(!frame)applyFade(fadeTarget); // paused or off screen: no frame loop to ease it
  }
  on(window,'scroll',scroll,{passive:true});
  on(scene,'pointermove',event=>{if(event.pointerType!=='mouse')return;const rect=scene.getBoundingClientRect();pointer={x:event.clientX-rect.left,y:event.clientY-rect.top};},{passive:true});
  on(scene,'pointerleave',()=>{pointer=null;});
  on(field,'pointerover',event=>{const el=event.target.closest('.rain-drop');const d=el&&drops.find(x=>x.el===el);if(d&&event.pointerType==='mouse')hold(d);});
  on(field,'pointerout',event=>{const el=event.target.closest('.rain-drop');if(el&&!el.contains(event.relatedTarget))unhold();});
  on(toggle,'click',()=>{paused=!paused;updateToggle();if(paused)stop();else start();});
  on(document,'visibilitychange',()=>{if(document.hidden)stop();else start();});
  on(media,'change',event=>{paused=event.matches;updateToggle();if(paused)stop();else start();});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{threshold:0});observer.observe(scene);
  let sized=false;
  const resizeObserver=new ResizeObserver(()=>{resize(!sized);sized=true;scroll();});resizeObserver.observe(scene);
  document.fonts.ready.then(()=>{if(!controller.signal.aborted){measure();drops.forEach(place);}});
  updateToggle();
  return ()=>{controller.abort();stop();observer.disconnect();resizeObserver.disconnect();};
}

function motifSection(poems) {
  if(!cloudWords(poems).length)return '';
  const {years}=timeline(poems);
  let lastX=Infinity;
  const axis=[...years].reverse().filter(({x})=>{const keep=lastX-x>=.06;if(keep)lastX=x;return keep;}).reverse()
    .map(({year,x})=>`<span style="--x:${x.toFixed(4)}">${year}</span>`).join('');
  return `<section class="motifs" aria-labelledby="motifs-title"><h2 id="motifs-title" class="year-mark motifs-title"><span>你的印记</span></h2><div class="word-cloud" role="group" aria-label="词频：越常出现的词越大"></div><div class="word-time" aria-hidden="true"><p class="word-time-label"><b></b><span></span></p><div class="word-time-track"></div><div class="word-time-axis">${axis}</div></div></section>`;
}

// All words stand vertically, like the dates in the rain. The largest words gather loosely around two or
// three points; the rest settle around them, each keeping about one character's width from its neighbours.
function layoutCloud(list, width, height, narrow) {
  const random=seeded(51907),placed=[];
  const count=Math.min(list.length,narrow?72:Math.round(Math.min(150,width*height/6200)));
  const words=list.slice(0,count);
  const maxTotal=words[0].total,minTotal=words.at(-1).total;
  const maxSize=Math.min(height*(narrow?.13:.16),narrow?64:110),minSize=narrow?12:13;
  const scale=t=>{const k=(Math.log(t)-Math.log(minTotal))/Math.max(.001,Math.log(maxTotal)-Math.log(minTotal));return minSize+(maxSize-minSize)*k**1.4;};
  const margin=narrow?6:20;
  const groups=narrow?2:3,centres=Array.from({length:groups},(_,i)=>({x:width*((i+.5)/groups+(random()-.5)*.14),y:height*(.3+random()*.4)}));
  words.forEach((entry,rank)=>{
    // The most frequent words stay in the middle-to-near range so they never sink out of sight.
    const depth=rank<8?.5+random()*.5:random();
    let size=scale(entry.total)*(.84+depth*.3);
    const centre=rank<14?centres[rank%centres.length]:null;
    for(let attempt=0;attempt<6;attempt++){
      const w=size*1.18,h=entry.word.length*size*1.04+size*.16,gap=Math.max(6,size*.2),want=size*.9+14;
      let best=null,bestScore=-Infinity;
      for(let k=0;k<70;k++){
        let x,y;
        if(centre){x=centre.x+(random()+random()-1)*width*.2-w/2;y=centre.y+(random()+random()-1)*height*.32-h/2;}
        else{x=margin+random()*(width-2*margin-w);y=margin+random()*(height-2*margin-h);}
        if(x<margin||y<margin||x+w>width-margin||y+h>height-margin)continue;
        let clear=true,nearest=Infinity;
        for(const r of placed){
          const dx=Math.max(r.x-(x+w),x-(r.x+r.w),0),dy=Math.max(r.y-(y+h),y-(r.y+r.h),0);
          if(dx<gap&&dy<gap){clear=false;break;}
          nearest=Math.min(nearest,Math.hypot(dx,dy));
        }
        if(!clear)continue;
        // Prefer a spot about one character away from the nearest word: close enough to read as a whole, with air between.
        const score=centre?-Math.hypot(x+w/2-centre.x,y+h/2-centre.y)*.02-Math.abs(Math.min(nearest,400)-want)*.4:-Math.abs(Math.min(nearest,400)-want);
        if(score>bestScore){bestScore=score;best={x,y};}
      }
      if(best){placed.push({entry,x:best.x,y:best.y,w,h,size,vertical:true,rank,depth});return;}
      size*=.86;
    }
  });
  return placed;
}

function mountMotifs(root, poems) {
  const section=root.querySelector('.motifs');if(!section)return {dispose(){}};
  const cloud=section.querySelector('.word-cloud'),track=section.querySelector('.word-time-track'),label=section.querySelector('.word-time-label');
  const controller=new AbortController(),on=(t,n,f,o={})=>t.addEventListener(n,f,{...o,signal:controller.signal});
  const list=cloudWords(poems),{pos}=timeline(poems),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const index=root.querySelector('.date-index'),note=root.querySelector('.motif-note');
  let active=null,preview=null,buttons=[],width=0,depthLayers=[],frame=0,live=false,last=0,px=0,py=0,tx=0,ty=0;
  let sectionTop=0,sectionHeight=0,leaveShown=-1,settleTimer=0;
  const random=seeded(3301);
  const peak=Math.max(...list.flatMap(e=>e.hits.map(h=>h.n)));
  function render() {
    const w=cloud.clientWidth;if(!w||w===width)return;width=w;
    // The words and the time track below them fit on one screen together.
    const narrow=w<620,height=Math.round(Math.max(380,innerHeight-(narrow?220:250)));
    cloud.style.height=height+'px';
    const placed=layoutCloud(list,w,height,narrow);
    cloud.replaceChildren();
    // Three depth layers: the pointer parallax moves 3 layers instead of every word.
    depthLayers=[.32,.66,1].map(()=>{const layer=document.createElement('div');layer.className='cloud-layer';cloud.append(layer);return layer;});
    const maxRank=Math.max(1,placed.length-1);
    buttons=placed.map(({entry,x,y,size,vertical,rank,depth})=>{
      const b=document.createElement('button');
      b.type='button';b.className='cloud-word'+(vertical?' is-vertical':'');b.textContent=entry.word;b.dataset.word=entry.word;
      b.setAttribute('aria-pressed',String(active?.word===entry.word));
      b.setAttribute('aria-label',`${entry.word}，出现 ${entry.total} 次，见于 ${entry.hits.length} 首。在日期列表中标出`);
      if(rank>=40)b.tabIndex=-1;
      // The slow sway is a CSS animation (runs off the main thread); nearer words sway a little more.
      const z=.25+depth*.75;
      b.style.cssText=`left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;font-size:${size.toFixed(1)}px;--t:${(rank/maxRank).toFixed(3)};--z:${depth.toFixed(3)};--d:${Math.round(random()*900)}ms;--sx:${(3.5*z).toFixed(2)}px;--sy:${(2.6*z).toFixed(2)}px;--sdur:${(14+random()*12).toFixed(1)}s;--sdel:${(-random()*26).toFixed(1)}s`;
      depthLayers[depth<.34?0:depth<.67?1:2].append(b);return b;
    });
    measure();
    showTrack();
  }
  // The track under the cloud: when a word is hovered or chosen, its poems fall as ticks along time.
  function showTrack() {
    const entry=preview||active;
    track.replaceChildren();
    section.classList.toggle('has-word',!!entry);
    if(!entry){label.querySelector('b').textContent='';label.querySelector('span').textContent=(matchMedia('(hover:none)').matches?'点一个词':'悬停一个词')+'，看它落在哪些日子';return;}
    label.querySelector('b').textContent=entry.word;
    label.querySelector('span').textContent=`${entry.total} 次 · ${entry.hits.length} 首`;
    entry.hits.forEach(({poem,n},i)=>{
      const tick=document.createElement('i');
      tick.style.cssText=`--x:${pos.get(poem.id).toFixed(4)};--h:${(n/peak).toFixed(3)};--d:${i*18}ms`;
      track.append(tick);
    });
  }
  function apply(word) {
    active=list.find(e=>e.word===word)||null;
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.word===active?.word)));
    section.classList.toggle('has-active',!!active);
    const hits=new Map(active?active.hits.map(h=>[h.poem.id,h.n]):[]);
    index?.classList.toggle('is-filtering',!!active);
    index?.querySelectorAll('.poem-date').forEach(link=>{
      const n=hits.get(link.dataset.id);
      link.classList.toggle('is-match',!!n);
      if(n)link.dataset.hits=n;else delete link.dataset.hits;
    });
    index?.querySelectorAll('.date-year-group').forEach(g=>g.classList.toggle('is-empty',!!active&&!g.querySelector('.is-match')));
    if(note){note.hidden=!active;if(active)note.querySelector('span').textContent=`含「${active.word}」的 ${active.hits.length} 首`;}
    showTrack();
  }
  on(cloud,'click',event=>{const b=event.target.closest('.cloud-word');if(b)apply(b.dataset.word===active?.word?null:b.dataset.word);});
  const hover=b=>{const next=b?list.find(e=>e.word===b.dataset.word):null;if(next===preview)return;preview=next;buttons.forEach(x=>x.classList.toggle('is-hover',x===b));cloud.classList.toggle('is-hovering',!!b);showTrack();};
  on(cloud,'pointerover',e=>hover(e.target.closest('.cloud-word')));
  on(cloud,'pointerleave',()=>hover(null));
  on(cloud,'focusin',e=>hover(e.target.closest('.cloud-word')));
  on(cloud,'focusout',()=>hover(null));
  if(note)on(note.querySelector('button'),'click',()=>{const word=active?.word;apply(null);cloud.querySelector(`[data-word="${word}"]`)?.focus({preventScroll:true});});
  // Depth: the near layer drifts farther with the pointer, the far layer barely moves.
  // One loop eases both the parallax and the scroll fade, and stops itself once both have settled.
  function measure(){const r=section.getBoundingClientRect();sectionTop=r.top+scrollY;sectionHeight=r.height;}
  function leaveTarget() {
    const vh=innerHeight,top=sectionTop-scrollY,bottom=top+sectionHeight;
    const seen=Math.max(0,Math.min(bottom,vh)-Math.max(top,0))/Math.max(1,Math.min(sectionHeight,vh));
    const leave=1-Math.max(0,Math.min(1,seen));return leave*leave*(3-2*leave);
  }
  function applyLeave(value) {
    // Blur is stepped in quarter pixels: each new blur radius costs a repaint, tiny changes are not visible.
    const blur=Math.round(value*12*4)/4,prevBlur=Math.round(leaveShown*12*4)/4;
    if(Math.abs(value-leaveShown)<.002&&blur===prevBlur)return;
    layers.forEach(el=>{el.style.opacity=(1-value).toFixed(3);if(blur!==prevBlur)el.style.filter=blur>0?`blur(${blur}px)`:'';});
    leaveShown=value;
  }
  function loop(time) {
    frame=0;
    const dt=last?Math.min((time-last)/1000,.05):1/60;last=time;
    const k=Math.min(1,dt*(reduced?60:4.5));
    px+=(tx-px)*k;py+=(ty-py)*k;
    depthLayers.forEach((layer,i)=>{const z=[.3,.62,1][i];layer.style.transform=`translate3d(${(px*34*z).toFixed(2)}px,${(py*22*z).toFixed(2)}px,0)`;});
    const target=reduced?0:leaveTarget();
    applyLeave(leaveShown<0?target:leaveShown+(target-leaveShown)*Math.min(1,dt*9));
    const moving=Math.abs(tx-px)>.002||Math.abs(ty-py)>.002||Math.abs(target-leaveShown)>.002;
    if(live&&moving)frame=requestAnimationFrame(loop);else last=0;
  }
  const wake=()=>{if(live&&!frame)frame=requestAnimationFrame(loop);};
  function setLive(value){live=value;wake();}
  on(section,'pointermove',e=>{if(e.pointerType!=='mouse')return;const r=cloud.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*-2;ty=((e.clientY-r.top)/r.height-.5)*-2;wake();},{passive:true});
  on(section,'pointerleave',()=>{tx=0;ty=0;wake();});
  on(document,'visibilitychange',()=>setLive(!document.hidden&&section.classList.contains('is-live')));
  const liveObserver=new IntersectionObserver(entries=>{const v=entries[0].isIntersecting;section.classList.toggle('is-live',v);setLive(v&&!document.hidden);},{threshold:0});
  liveObserver.observe(section);
  const resizeObserver=new ResizeObserver(()=>render());resizeObserver.observe(cloud);
  // Scroll-linked fade: the more of the section has left the screen, the fainter and blurrier it gets, eased so
  // wheel steps glide instead of jumping. Positions are cached, so scrolling never forces a layout.
  const layers=[section.querySelector('.motifs-title'),cloud,section.querySelector('.word-time')].filter(Boolean);
  on(window,'scroll',wake,{passive:true});
  on(window,'resize',()=>{measure();wake();},{passive:true});
  const pageObserver=new ResizeObserver(()=>{measure();wake();});pageObserver.observe(root);
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.intersectionRatio>=.2&&!section.classList.contains('is-in')){
        section.classList.add('is-in');
        // Once every word has surfaced, drop the staggered delays so hover and fade respond at once.
        clearTimeout(settleTimer);settleTimer=setTimeout(()=>section.classList.add('is-settled'),2600);
      }
      // Fully off screen: reset, so the words surface again next time.
      else if(!entry.isIntersecting&&section.classList.contains('is-in')){section.classList.remove('is-in','is-settled');clearTimeout(settleTimer);hover(null);}
      wake();
    }
  },{threshold:[0,.2]});
  if(reduced)section.classList.add('is-in');else observer.observe(section);
  render();
  return {dispose(){controller.abort();clearTimeout(settleTimer);observer.disconnect();resizeObserver.disconnect();liveObserver.disconnect();pageObserver.disconnect();cancelAnimationFrame(frame);live=false;}};
}

export function poetryLanding(poems = []) {
  return `<section class="time-rain" aria-label="时间雨"><div class="time-rain-atmosphere"><canvas aria-hidden="true"></canvas><div class="time-rain-letters" aria-hidden="true"></div></div><p class="time-rain-caption" aria-hidden="true"></p><button class="time-rain-motion" type="button" aria-label="暂停时间雨" aria-pressed="false"><span aria-hidden="true"></span></button></section><section class="poetry-dates" aria-label="诗歌日期"><div class="memory-field" aria-hidden="true"></div><h1 class="visually-hidden">无关风月</h1><div id="results"></div></section><div class="poetry-index">${motifSection(poems)}<p class="motif-note" aria-live="polite" hidden><span></span><button type="button" aria-label="清除意象筛选">清除 ×</button></p></div>`;
}

// One date per line, newest first; years as quiet dividers. Rows land like drops as they scroll into view.
export function poetryResults(poems) {
  const years=[...new Set(poems.map(p=>p.year))];
  return `<div class="date-index">${years.map(year=>`<section class="date-year-group" aria-labelledby="year-${year}"><h2 id="year-${year}" class="year-mark" aria-label="${year}" data-drop><span>${chineseYear(year)}</span></h2><ol class="date-list">${poems.filter(p=>p.year===year).map(poem=>`<li data-drop><a class="poem-date" data-id="${poem.id}" href="/poetry/${poem.id}" aria-label="${dated(poem.date)}"><time datetime="${poem.date}">${dated(poem.date)}</time></a></li>`).join('')}</ol></section>`).join('')}</div>`;
}

function mountDateDrops(root) {
  const items=[...root.querySelectorAll('.date-index [data-drop]')];
  if(!items.length||matchMedia('(prefers-reduced-motion:reduce)').matches)return ()=>{};
  let batch=0,frame=0;
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      // Rows arriving together fall one after another, not all at once.
      entry.target.style.setProperty('--delay',(batch++*90)+'ms');
      entry.target.classList.add('is-landed');observer.unobserve(entry.target);
    }
    cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{batch=0;});
  },{rootMargin:'0px 0px -6% 0px'});
  items.forEach(item=>{
    // Rows already passed (e.g. when returning to the list) stay put instead of replaying.
    if(item.getBoundingClientRect().bottom<0)item.classList.add('is-landed');
    else{item.classList.add('is-falling');observer.observe(item);}
  });
  return ()=>{observer.disconnect();cancelAnimationFrame(frame);};
}

// Words that surface from a poem: two to four characters, skipping pronoun-led and function phrases.
const MEMORY_SKIP=new Set('站在 感受 透过 只为 连同 摄于 似乎 自己 样子 中央 向前 看见 落在 开口 低头 第一次 哥伦布 时候 已经 因为 所以 如果 可是 但是 只是 还是 仿佛 依旧 一直 然后 之后 之前 起来 出来 下来 不再 不会 可以 知道 觉得'.split(' '));
const memoryCache=new Map();
function memoryWords(poem) {
  if(memoryCache.has(poem.id))return memoryCache.get(poem.id);
  const words=new Set();
  try{
    const segmenter=new Intl.Segmenter('zh',{granularity:'word'});
    for(const s of segmenter.segment(plainText(poem.body))){
      const w=s.segment;
      if(s.isWordLike&&/^\p{Script=Han}{2,4}$/u.test(w)&&!/^[我你他她它这那一每些有没不是在的了着也都还就又很再]|[的了着吗呢吧啊]$/.test(w)&&!MEMORY_SKIP.has(w))words.add(w);
    }
  }catch{ /* No segmenter: fall back to short lines below. */ }
  if(words.size<4)plainText(poem.body).split(/[\n，。、；：！？,.!?\s]+/).filter(l=>l.length>=2&&l.length<=6).forEach(l=>words.add(l));
  const list=[...words];memoryCache.set(poem.id,list);return list;
}

// The date nearest the middle of the screen is in focus; the others soften with distance.
// Behind them, words from the poems around that moment drift up like something remembered.
function mountDateFocus(root, poems) {
  const section=root.querySelector('.poetry-dates'),field=root.querySelector('.memory-field');
  const links=[...root.querySelectorAll('.date-index .poem-date')];
  if(!section||!links.length)return ()=>{};
  const controller=new AbortController(),on=(t,n,f,o={})=>t.addEventListener(n,f,{...o,signal:controller.signal});
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const random=seeded(20871),pick=list=>list[Math.floor(random()*list.length)];
  let items=[],frame=0,hovered=null,focused=null,active=false,timer=0,live=0;
  const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
  function measure(){items=links.map(a=>{const r=a.getBoundingClientRect();return {a,mid:r.top+scrollY+r.height/2};});}
  function update() {
    frame=0;
    const centre=scrollY+innerHeight/2,reach=innerHeight*.5;
    let best=null,gap=Infinity;
    for(const it of items){
      const d=Math.abs(it.mid-centre);if(d<gap){gap=d;best=it;}
      if(d>innerHeight*1.2&&it.done)continue;
      let f=1-smooth(0,.42,d/reach);
      if(hovered)f=it.a===hovered?1:f*.3;
      const v=f.toFixed(2);if(v!==it.v){it.v=v;it.a.style.setProperty('--focus',v);} // write only on change: each write restyles that dateit.done=d>innerHeight*1.2;
    }
    const next=hovered||best?.a;
    if(next!==focused){focused=next;if(active&&!reduced){surface();surface();}}
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  function surface() {
    if(!field||!focused||live>16)return;
    // Words come from the ten poems nearest the focused date (the window shifts at either end of the list).
    const i=poems.findIndex(p=>p.id===focused.dataset.id);
    const from=Math.max(0,Math.min(poems.length-10,i-5)),source=poems[from+Math.floor(random()*Math.min(10,poems.length))];
    const words=memoryWords(source);if(!words.length)return;
    const el=document.createElement('span');el.className='memory-word';el.textContent=pick(words);
    const narrow=innerWidth<700,side=random()<.5;
    const x=narrow?4+random()*80:side?4+random()*30:64+random()*30;
    const depth=random();
    el.style.left=x.toFixed(1)+'%';el.style.top=(38+random()*52).toFixed(1)+'%';
    el.style.fontSize=(narrow?13:15)+depth*(narrow?14:26)+'px';
    el.style.setProperty('--alpha',(.22+depth*.3).toFixed(3));
    field.append(el);live++;
    const rise=40+depth*70,duration=7000+random()*5000;
    const sharp=(.15+(1-depth)*.75).toFixed(1);
    const anim=el.animate([
      {opacity:0,transform:'translate3d(0,30px,0) scale(.97)',filter:'blur(8px)'},
      {opacity:1,transform:`translate3d(0,${(-rise*.3).toFixed(0)}px,0) scale(1)`,filter:`blur(${sharp}px)`,offset:.3},
      {opacity:1,transform:`translate3d(0,${(-rise*.68).toFixed(0)}px,0) scale(1.01)`,filter:`blur(${sharp}px)`,offset:.66},
      {opacity:0,transform:`translate3d(0,${-rise}px,0) scale(1.03)`,filter:'blur(7px)'},
],{duration,easing:'ease-in-out',fill:'both'});
    anim.onfinish=()=>{el.remove();live--;};
  }
  function setActive(value) {
    active=value;field?.classList.toggle('is-active',value);
    clearInterval(timer);timer=0;
    if(value&&!reduced&&field)timer=setInterval(()=>{if(!document.hidden)surface();},620);
  }
  on(window,'scroll',schedule,{passive:true});
  on(window,'resize',()=>{measure();schedule();},{passive:true});
  on(section,'pointerover',e=>{const a=e.target.closest('.poem-date');if(a&&a!==hovered){hovered=a;schedule();}});
  on(section,'pointerout',e=>{const a=e.target.closest('.poem-date');if(a&&!a.contains(e.relatedTarget)){hovered=null;schedule();}});
  on(section,'focusin',e=>{const a=e.target.closest('.poem-date');if(a){hovered=a;schedule();}});
  on(section,'focusout',()=>{hovered=null;schedule();});
  // Memories only rise while the list is the thing being read.
  const observer=new IntersectionObserver(entries=>setActive(entries[0].isIntersecting),{rootMargin:'-35% 0px -35% 0px'});
  observer.observe(section.querySelector('.date-index')||section);
  document.fonts.ready.then(()=>{if(!controller.signal.aborted){measure();update();}});
  // Rows settle after their drop-in; measure again once they have landed.
  const settle=setTimeout(()=>{measure();schedule();},1600);
  measure();update();
  return ()=>{controller.abort();cancelAnimationFrame(frame);clearInterval(timer);clearTimeout(settle);observer.disconnect();field?.replaceChildren();};
}

export function poetryReading(work, poems, { markdown }) {
  const index=poems.findIndex(p=>p.id===work.id), previous=poems[index-1], next=poems[index+1];
  const adjacent=p=>p?`<a href="/poetry/${p.id}" aria-label="${dated(p.date)}"><time datetime="${p.date}">${dated(p.date)}</time></a>`:'<span></span>';
  return `<article class="poetry-reader"><a href="/poetry" data-archive-return class="poetry-back" aria-label="返回诗集">←</a><header class="poem-heading"><h1><time datetime="${work.date}">${dated(work.date)}</time></h1></header><div class="poem-prose">${markdown(work.body)}</div><nav class="poem-neighbours" aria-label="相邻诗歌">${adjacent(previous)}${adjacent(next)}</nav></article>`;
}

// Rain-night mist, painted once per size with fine noise mixed in. The noise dithers the gradients:
// soft gradients on a dark screen otherwise show up as visible bands.
export function mountMist() {
  let canvas=document.querySelector('.poetry-mist');
  if(canvas)return;
  canvas=document.createElement('canvas');canvas.className='poetry-mist';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);
  let timer=0;
  function paint() {
    const scale=Math.min(devicePixelRatio||1,1.5),w=Math.round(innerWidth*scale),h=Math.round(innerHeight*scale);
    if(!w||!h)return;
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');
    // Opaque on the page colour: transparent pixels on a dark page only have ~30 alpha steps, which is what banded.
    ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--paper').trim()||'#0e1019';ctx.fillRect(0,0,w,h);
    const glow=(cx,cy,rx,ry,rgb,a)=>{
      ctx.save();ctx.translate(cx*w,cy*h);ctx.scale(rx*w,ry*h);
      const g=ctx.createRadialGradient(0,0,0,0,0,1);
      for(let i=0;i<=8;i++){const t=i/8;g.addColorStop(t,`rgba(${rgb},${(a*(1-t)*(1-t)*(1+2*t)).toFixed(4)})`);}
      ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
    };
    glow(.24,.7,.42,.3,'118,120,158',.13);glow(.76,.3,.38,.26,'98,104,142',.11);
    glow(.56,1,.5,.28,'206,176,128',.08);glow(.5,.4,.62,.44,'70,74,104',.1);
    const image=ctx.getImageData(0,0,w,h),data=image.data;
    for(let i=0;i<data.length;i+=4){
      const n=(Math.random()+Math.random()-1)*3; // about ±3 levels: invisible as grain, enough to break up banding
      data[i]+=n;data[i+1]+=n;data[i+2]+=n;
    }
    ctx.putImageData(image,0,0);
  }
  addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(paint,200);},{passive:true});
  paint();
}

export function mountPoetry(root, { poems, navigate }) {
  mountMist();
  const controller=new AbortController();let restoreFrame=0;
  const disposeRain=mountTimeRain(root,poems);
  const motifState=mountMotifs(root,poems);
  const disposeDrops=mountDateDrops(root);
  const disposeFocus=mountDateFocus(root,poems);
  const reader=root.querySelector('.poetry-reader');
  const on=(target,name,fn)=>target.addEventListener(name,fn,{signal:controller.signal});
  on(root,'click',event=>{
    const link=event.target.closest('a');if(!link)return;
    if(!reader && link.matches('a[href^="/poetry/"]')){
      storage.write('poetry-archive',JSON.stringify({scroll:scrollY}));
      history.replaceState({...history.state,poetryScroll:scrollY},'',location.href);
    }
    if(link.hasAttribute('data-archive-return'))storage.write('poetry-restore','1');
  });
  if(!reader && storage.read('poetry-restore')==='1'){
    storage.write('poetry-restore','0');restoreFrame=requestAnimationFrame(()=>{restoreFrame=requestAnimationFrame(()=>scrollTo({top:archivePosition(),behavior:'instant'}));});
  }
  if(reader){
    const index=poems.findIndex(p=>location.pathname.endsWith('/'+p.id));
    on(window,'keydown',event=>{
      if(event.metaKey||event.ctrlKey||event.altKey||event.repeat||document.querySelector('dialog[open]')||event.target.closest('input,textarea,select,button,a,[contenteditable=true]'))return;
      const poem=event.key==='ArrowRight'?poems[index+1]:event.key==='ArrowLeft'?poems[index-1]:null;
      if(poem){event.preventDefault();navigate('/poetry/'+poem.id);}
    });
  }
  return ()=>{controller.abort();cancelAnimationFrame(restoreFrame);disposeRain();disposeDrops();disposeFocus();motifState.dispose?.();};
}
