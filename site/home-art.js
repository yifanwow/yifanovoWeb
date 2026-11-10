import * as THREE from './vendor/three.module.min.js';

// Small bevels preserve simple silhouettes while giving furniture a real edge
// for the lights to catch. No external models or textures are used.
export function softBoxGeometry(w, h, d, softness = 0.19) {
  const radius = Math.min(Math.min(w, h, d) * softness, 0.12);
  if (radius < 0.006 || Math.min(w,h,d) < .09) return new THREE.BoxGeometry(w, h, d);
  // Project a subdivided cube onto a rounded cuboid. Matching analytical
  // normals keep the bevels smooth across face boundaries without stair steps.
  const segments=softness>.3?6:4;
  const geometry = new THREE.BoxGeometry(1,1,1,segments,segments,segments);
  const positions=geometry.attributes.position, normals=geometry.attributes.normal;
  const half=[w/2,h/2,d/2];
  const nodes=half.map(s=>segments===6?[-s,-s+radius*.3,-s+radius,0,s-radius,s-radius*.3,s]:[-s,-s+radius,0,s-radius,s]);
  for(let i=0;i<positions.count;i++) {
    const source=[positions.getX(i),positions.getY(i),positions.getZ(i)];
    const point=source.map((v,axis)=>nodes[axis][Math.round((v+.5)*segments)]);
    const inner=point.map((v,axis)=>THREE.MathUtils.clamp(v,-half[axis]+radius,half[axis]-radius));
    const normal=new THREE.Vector3(...point.map((v,axis)=>v-inner[axis])).normalize();
    positions.setXYZ(i,inner[0]+normal.x*radius,inner[1]+normal.y*radius,inner[2]+normal.z*radius);
    normals.setXYZ(i,normal.x,normal.y,normal.z);
  }
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  geometry.userData.batchKey = `soft/${w}/${h}/${d}/${softness}`;
  return geometry;
}

export function makeSurfaceTextures(textures) {
  let seed = 173;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const make = kind => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const c = canvas.getContext('2d'); c.fillStyle = '#eee8df'; c.fillRect(0, 0, 256, 256);
    if (kind === 'wood') {
      for (let j = 0; j < 150; j++) {
        c.strokeStyle = `rgba(77,50,35,${0.025 + random() * 0.07})`; c.lineWidth = 0.5 + random();
        const y = random() * 256; c.beginPath(); c.moveTo(0,y); c.bezierCurveTo(85,y+random()*8-4,170,y+random()*8-4,256,y); c.stroke();
      }
    } else {
      for (let j = 0; j < 7000; j++) {
        c.fillStyle = `rgba(50,43,45,${random() * 0.09})`;
        c.fillRect(random()*256,random()*256,kind==='fabric'?2:1,kind==='fabric'?1:2);
      }
      if (kind === 'fabric') for (let j=0;j<256;j+=4) { c.fillStyle='rgba(255,255,255,.08)'; c.fillRect(j,0,1,256); }
    }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 4;
    textures.push(texture); return texture;
  };
  return { wood: make('wood'), fabric: make('fabric'), plaster: make('plaster') };
}

export function buildVisitor({ group, box, ball, cylinder, mesh, m }) {
  const avatar = group(-3.5, 0.26, 3.3); avatar.scale.setScalar(1.4); avatar.rotation.y = 0.3;
  // Rounded, slightly oversized head and a tapered knitted jacket.
  const jacket = cylinder(0.17,0.23,0.43,'#477e89',0,0.61,0,avatar,16); jacket.scale.z=0.76;
  cylinder(0.18,0.18,0.055,'#355667',0,0.397,0,avatar,16).scale.z=0.76;
  ball(0.225,'#e7b58d',0,1.04,0.005,avatar,[1,1.05,0.92]);
  for (const x of [-0.226,0.226]) ball(0.048,'#dba980',x,1.03,0,avatar,[0.65,1,0.75]);
  ball(0.235,'#493e46',0,1.18,-0.022,avatar,[1.05,0.65,1.03]);
  for(const [x,y,z,s] of [[-.15,1.18,.13,.1],[-.025,1.23,.14,.11],[.1,1.2,.12,.1]]) ball(s,'#53424b',x,y,z,avatar,[1,0.65,0.65]);
  for(const x of [-0.082,0.082]) {
    ball(0.024,'#292d3c',x,1.06,0.204,avatar,[0.8,1.2,0.55]);
    ball(0.007,'#fff1d5',x-.004,1.069,0.218,avatar);
    ball(0.035,'#d9907c',x*1.58,1.005,0.183,avatar,[1,0.5,0.3]);
  }
  ball(0.03,'#d49f7c',0,1.025,0.219,avatar,[0.7,0.7,0.75]);
  box(0.035,0.008,0.012,'#9e6a62',0,0.974,0.213,avatar);
  const scarf=mesh(new THREE.TorusGeometry(0.135,0.055,8,20),m('#cd8e59'),0,0.852,0,avatar); scarf.rotation.x=Math.PI/2;
  box(0.11,0.27,0.055,'#cd8e59',0.1,0.702,0.173,avatar).rotation.z=0.12;
  for (const y of [0.5,0.61,0.72]) ball(0.015,'#d3b994',-0.035,y,0.171,avatar);
  const limb = (x,y) => { const g=new THREE.Group(); g.position.set(x,y,0); avatar.add(g); return g; };
  const legL=limb(-0.105,0.36), legR=limb(0.105,0.36);
  for(const leg of [legL,legR]) {
    mesh(new THREE.CapsuleGeometry(0.075,0.17,4,12),m('#354454'),0,-0.11,0,leg);
    box(0.17,0.105,0.25,'#252e3b',0,-0.28,0.045,leg);
    box(0.174,0.025,0.254,'#acaca0',0,-0.32,0.045,leg);
  }
  const armL=limb(-0.25,0.74), armR=limb(0.25,0.74);
  for(const arm of [armL,armR]) {
    mesh(new THREE.CapsuleGeometry(0.076,0.17,4,12),m('#477e89'),0,-0.12,0,arm);
    cylinder(0.075,0.075,0.05,'#cfbd9d',0,-0.26,0,arm,12);
    ball(0.067,'#e7b58d',0,-0.3,0,arm,[0.85,1,0.85]);
  }
  return { avatar, legL, legR, armL, armR };
}

export function addNightDetails({ scene, mesh, box, ball, cylinder, group, m, textures, materials }) {
  const radial = (center, edge) => {
    const canvas=document.createElement('canvas'); canvas.width=canvas.height=128;
    const c=canvas.getContext('2d'), gradient=c.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0,center); gradient.addColorStop(.32,center); gradient.addColorStop(1,edge);
    c.fillStyle=gradient; c.fillRect(0,0,128,128);
    const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace; textures.push(texture); return texture;
  };
  const shadowMap=radial('rgba(11,12,25,.6)','rgba(11,12,25,0)');
  const shadowMaterial=new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,opacity:.65}); materials.set('contact-shadow',shadowMaterial);
  for(const [x,z,w,d] of [[-5.5,2.65,3.4,1.85],[-4.58,3.73,1.7,1.7],[-8,5.6,1.7,1.7],[-8.77,1.92,1.3,1.6],[-6.5,-5.35,3.2,1.65],[-3.35,-6.43,2.9,.95],[-.2,-5.5,2.95,1.65],[5.1,-4.7,3.8,4.4],[1.9,5.65,3.5,2.3],[5.8,3.25,2.8,1.9]]) {
    const shadow=mesh(new THREE.PlaneGeometry(w,d),shadowMaterial,x,.263,z); shadow.rotation.x=-Math.PI/2; shadow.castShadow=false;
  }
  const baseShadow=mesh(new THREE.PlaneGeometry(29,24),shadowMaterial,0,-.47,0); baseShadow.rotation.x=-Math.PI/2; baseShadow.castShadow=false;
  const glowMap=radial('rgba(255,199,122,.21)','rgba(255,160,60,0)');
  const glowMat=new THREE.SpriteMaterial({map:glowMap,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.8}); materials.set('lamp-glow',glowMat);
  const core=new THREE.MeshStandardMaterial({color:'#ffe2a6',emissive:'#ffbd65',emissiveIntensity:2.2,roughness:.45}); materials.set('lamp-core',core);
  function light(x,y,z,intensity=18,distance=6) {
    const lamp=new THREE.PointLight('#ffbd7f',intensity,distance,2); lamp.position.set(x,y,z); scene.add(lamp);
    const glow=new THREE.Sprite(glowMat); glow.position.set(x,y,z); glow.scale.set(1.65,1.65,1); scene.add(glow);
    const bulb=mesh(new THREE.SphereGeometry(.055,12,8),core,x,y,z); bulb.castShadow=false;
    return lamp;
  }
  light(-8.9,2.04,3.3,23,7); light(-5.67,1.89,-5.65,17,5.5);
  for(const x of [3,7.18]) light(x,1.19,-5.7,9,4.6);
  // The pendant is hung from a short cable so the dining area reads as a room.
  cylinder(.014,.014,.8,'#424958',1.9,3.3,5.65,undefined,12);
  cylinder(.12,.43,.3,'#b67f55',1.9,2.76,5.65,undefined,24);
  const shadeInner=mesh(new THREE.CircleGeometry(.36,32),core,1.9,2.61,5.65); shadeInner.rotation.x=Math.PI/2; shadeInner.castShadow=false;
  light(1.9,2.55,5.65,25,7);
  light(8.8,2.4,4.9,15,5.5); light(7.9,2.35,.5,9,4);
  // One soft shadow-casting practical light; other lamps use contact shadows.
  const living=new THREE.SpotLight('#ffd0a0',29,11,1.12,.85,2);
  living.position.set(-5.8,5.6,2.8); living.target.position.set(-5.8,.26,2.8);
  living.castShadow=true; living.shadow.mapSize.set(matchMedia('(max-width:700px)').matches?512:768,matchMedia('(max-width:700px)').matches?512:768); living.shadow.bias=-.001; living.shadow.normalBias=.03; living.shadow.blurSamples=8;
  scene.add(living,living.target);
  // Curtains, trim and domestic details are shaped rather than painted on.
  for(const x of [-6.45,-4.62]) for(const z of [2.23,2.7]) box(.65,.014,.012,'#769ea0',x,.9,z);
  for(const [x,z] of [[-5.0,3.8],[-5.1,3.72]]) {
    const mag=group(x,.87,z); mag.rotation.y=x*.1;
    box(.35,.035,.43,'#bd8e77',0,0,0,mag); box(.25,.004,.12,'#d8b995',0,.02,-.07,mag);
  }
  // Small warm window reflections are local to the apartment, with no garden.
  const windowMat=new THREE.MeshStandardMaterial({color:'#6b8dab',emissive:'#344f78',emissiveIntensity:.45,roughness:.3}); materials.set('night-window',windowMat);
  for(const [x,w] of [[-7.6,4],[-1.7,6.4],[4.85,5]]) {
    const pane=mesh(new THREE.PlaneGeometry(w,1.72),windowMat,x,2.18,-7.405); pane.castShadow=false;
  }
  return { shadowMap };
}
