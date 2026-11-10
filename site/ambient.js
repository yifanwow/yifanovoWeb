function randomSource(seed) { return () => { seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296; }; }
function setupCanvas(canvas, width, height) {
  const ratio=Math.min(devicePixelRatio||1,matchMedia('(max-width:700px)').matches?1.25:1.5);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);return ctx;
}

// A shared, quiet atmosphere stays behind every section of the site.
export function mountAmbient(body) {
  if(body.querySelector('.ambient-field'))return;
  const canvas=document.createElement('canvas');canvas.className='ambient-field';canvas.setAttribute('aria-hidden','true');body.prepend(canvas);
  const media=matchMedia('(prefers-reduced-motion:reduce)'), controller=new AbortController();
  let reduced=media.matches,ctx,width=0,height=0,raf=0,last=0,px=0,py=0;
  const random=randomSource(12703);
  const stars=Array.from({length:110},(_,i)=>({x:random(),y:random(),r:.35+random()*.7,phase:random()*Math.PI*2,bright:i%12===0}));
  const clusters=[[[.05,.22],[.12,.14],[.19,.2],[.15,.3]],[[.75,.1],[.82,.17],[.91,.13],[.94,.28]],[[.72,.73],[.81,.66],[.87,.76],[.8,.87]]];
  const glow=document.createElement('canvas');glow.width=glow.height=48;
  const g=glow.getContext('2d'),gradient=g.createRadialGradient(24,24,0,24,24,24);
  gradient.addColorStop(0,'rgba(203,205,250,.55)');gradient.addColorStop(.15,'rgba(174,178,236,.16)');gradient.addColorStop(1,'rgba(153,165,226,0)');g.fillStyle=gradient;g.fillRect(0,0,48,48);
  function draw(time=0) {
    if(!ctx)return;ctx.clearRect(0,0,width,height);
    const shift=reduced?0:Math.min(scrollY*.009,70);
    for(const s of stars){
      const x=s.x*width+px*(s.bright?6:3),y=((s.y*height-shift+height)%height)+py*3;
      const twinkle=reduced?.65:.48+.28*Math.sin(time*.00033+s.phase)**2;
      ctx.fillStyle=`rgba(207,214,245,${twinkle*(s.bright?.75:.48)})`;
      ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);ctx.fill();
      if(s.bright){ctx.globalAlpha=twinkle*.65;ctx.drawImage(glow,x-14,y-14,28,28);ctx.globalAlpha=1;ctx.strokeStyle=`rgba(206,210,245,${twinkle*.45})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.moveTo(x,y-3);ctx.lineTo(x,y+3);ctx.stroke();}
    }
    ctx.lineWidth=.6;ctx.strokeStyle='rgba(169,181,229,.065)';
    for(const points of clusters){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*width+px*4,y*height-shift*.3):ctx.moveTo(x*width+px*4,y*height-shift*.3));ctx.stroke();}
  }
  function loop(time){raf=0;if(document.hidden||reduced)return;if(time-last>50&&!/theme-(poetry|index|project)\b/.test(body.className)){last=time;draw(time);}raf=requestAnimationFrame(loop);} // the poetry page and homepage hide the stars, so skip drawing there
  function start(){if(!document.hidden&&!reduced&&!raf)raf=requestAnimationFrame(loop);else if(reduced)draw(0);}
  function resize(){width=innerWidth;height=innerHeight;ctx=setupCanvas(canvas,width,height);draw(performance.now());start();}
  const on=(target,name,fn,options={})=>target.addEventListener(name,fn,{...options,signal:controller.signal});
  on(window,'resize',resize,{passive:true});
  on(window,'pointermove',e=>{if(e.pointerType==='mouse'){px=(e.clientX/width-.5);py=(e.clientY/height-.5);}},{passive:true});
  on(document,'visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
  on(media,'change',e=>{reduced=e.matches;cancelAnimationFrame(raf);raf=0;draw(0);start();});
  resize();
  return ()=>{controller.abort();cancelAnimationFrame(raf);canvas.remove();};
}

