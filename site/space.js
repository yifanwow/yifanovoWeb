import * as THREE from './vendor/three.module.min.js';
import { buildApartment, insideApartment } from './apartment.js';
import { softBoxGeometry, makeSurfaceTextures, buildVisitor, addNightDetails } from './home-art.js';

// A small, original architectural study. All geometry is made here; no model
// or visual assets from the reference portfolios are used.
export function mountHome(root, { navigate, photos }) {
  let dirty = true;
  const canvas = root.querySelector('canvas');
  const layer = root.querySelector('.space-hotspots');
  const status = document.querySelector('#space-status');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 700px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.8));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-9, 9, 7, -7, 0.1, 100);
  const center = new THREE.Vector3(-4.8, 0.9, 2.8);
  const targetCenter = center.clone();
  let followVisitor = false;
  let azimuth = 0.56, targetAzimuth = 0.56, zoom = 1.4, targetZoom = 1.4;
  const hemi = new THREE.HemisphereLight(0x9fbcec, 0x373046, 1.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0x9bb7f2, 1.5);
  sun.position.set(-12, 20, -10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 768 : 1536, mobile ? 768 : 1536);
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 0.5, far: 75 });
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.00015;
  sun.shadow.radius = 4;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xe8b693, 0.65);
  fill.position.set(3, 10, 14);
  scene.add(fill);

  const materials = new Map();
  const geometries = [];
  const textures = [];
  const clickables = [];
  const obstacles = [];
  const surfaces = makeSurfaceTextures(textures);
  const palette = { '#e4ded0':'#657286', '#b4ac9c':'#273146', '#e3daca':'#424c62', '#c5bba8':'#48576e', '#c6b99f':'#647287', '#a77e5b':'#947059', '#76523b':'#4e3c3b', '#c1a17d':'#99785f', '#b8956e':'#88634f', '#c5a681':'#a38165', '#bf9d77':'#967258', '#c6aa85':'#a8896a', '#626f61':'#305969', '#8b987c':'#3f7883', '#839075':'#427780', '#97a185':'#63949a', '#d8bf8b':'#dca16a', '#d0cdb6':'#ca9d87', '#9ca591':'#657e9d', '#b9bfa9':'#8297af' };
  const woods = new Set(['#a77e5b','#76523b','#c1a17d','#b8956e','#c5a681','#bf9d77','#c6aa85','#a78862','#ae9271','#c5b79e','#a59a78','#c4b18e','#947059','#4e3c3b']);
  const fabrics = new Set(['#626f61','#8b987c','#839075','#97a185','#d8bf8b','#d0cdb6','#9ca591','#b9bfa9','#b78d69','#c4a17e','#477e89','#e3d7bd','#eee5d2','#c6ad87']);
  const m = (color, roughness = 0.8) => {
    const key = color + '/' + roughness;
    if (!materials.has(key)) {
      const surface = woods.has(color) ? surfaces.wood : fabrics.has(color) ? surfaces.fabric : color === '#e4ded0' ? surfaces.plaster : null;
      const material = new THREE.MeshStandardMaterial({ color: palette[color] || color, roughness, map:surface, bumpMap:mobile?null:surface, bumpScale: fabrics.has(color) ? .008 : .014 });
      materials.set(key, material);
    }
    return materials.get(key);
  };
  const mesh = (geometry, material, x, y, z, parent = scene) => {
    geometries.push(geometry);
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const boxCache = new Map();
  const box = (w, h, d, color, x, y, z, parent = scene) => {
    const softness = typeof color === 'string' && fabrics.has(color) ? .4 : .19;
    const key = `${w}/${h}/${d}/${softness}`;
    if (!boxCache.has(key)) boxCache.set(key, softBoxGeometry(w,h,d,softness));
    return mesh(boxCache.get(key), typeof color === 'string' ? m(color) : color, x, y, z, parent);
  };
  const cylinder = (top, bottom, height, color, x, y, z, parent = scene, sides = 28) => mesh(new THREE.CylinderGeometry(top, bottom, height, sides), typeof color === 'string' ? m(color) : color, x, y, z, parent);
  const ball = (r, color, x, y, z, parent = scene, scale = [1, 1, 1]) => {
    const obj = mesh(new THREE.SphereGeometry(r, 20, 12), m(color), x, y, z, parent);
    obj.scale.set(...scale);
    return obj;
  };
  const group = (x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); return g; };
  const obstacle = (x, z, w, d) => obstacles.push({ x, z, w: w / 2 + 0.24, d: d / 2 + 0.24 });
  const mark = (obj, id) => { obj.traverse(child => { if (child.isMesh) { child.userData.spot = id; clickables.push(child); } }); };
  const world = buildApartment({ scene, mesh, box, cylinder, ball, group, m, obstacle, mark, textures, materials, photos, invalidate: () => { dirty = true; } });
  const { vinyl } = world;

  // The visitor. Its position persists while switching between the rooms/pages.
  const { avatar, legL, legR, armL, armR } = buildVisitor({ group, box, ball, cylinder, mesh, m });
  addNightDetails({ scene, mesh, box, ball, cylinder, group, m, textures, materials });
  try {
    const saved = JSON.parse(sessionStorage.getItem('yifanovo-apartment-visitor') || 'null');
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.z) && insideApartment(saved.x, saved.z)) avatar.position.set(saved.x, 0.26, saved.z);
  } catch { /* Privacy mode can disable storage; exploration still works. */ }

  const spots = world.spots;
  for (const [i, spot] of spots.entries()) {
    const b = document.createElement('button');
    b.className = 'room-hotspot';
    b.dataset.spot = spot.id;
    b.setAttribute('aria-label', `${spot.title}：${spot.label}`);
    b.innerHTML = `<span class="spot-number">${String(i + 1).padStart(2, '0')}</span><span class="spot-caption">${spot.title}<small>${spot.label} ↗</small></span>`;
    layer.append(b);
    spot.button = b;
    spot.point = new THREE.Vector3(...spot.anchor);
  }

  // Share draw calls for repeated, non-interactive props. The character,
  // turntable and clickable furniture retain their individual meshes.
  const batches = [];
  scene.updateMatrixWorld(true);
  const repeated = new Map();
  scene.traverse(object => {
    if (!object.isMesh || object.userData.spot || object === vinyl || object.material.transparent || Array.isArray(object.material)) return;
    for (let p = object.parent; p; p = p.parent) if (p === avatar) return;
    const key = object.material.uuid + '/' + (object.geometry.userData.batchKey || object.geometry.type + '/' + JSON.stringify(object.geometry.parameters));
    if (!repeated.has(key)) repeated.set(key, []);
    repeated.get(key).push(object);
  });
  for (const nodes of repeated.values()) {
    if (nodes.length < 3) continue;
    const instanced = new THREE.InstancedMesh(nodes[0].geometry, nodes[0].material, nodes.length);
    instanced.castShadow = nodes.some(n => n.castShadow);
    instanced.receiveShadow = nodes.some(n => n.receiveShadow);
    nodes.forEach((node, i) => { instanced.setMatrixAt(i, node.matrixWorld); node.removeFromParent(); });
    instanced.instanceMatrix.needsUpdate = true;
    instanced.computeBoundingSphere();
    scene.add(instanced);
    batches.push(instanced);
  }

  let audio, audioPlaying = false;
  const soundButton = document.querySelector('[data-space-sound]');
  function toggleAudio() {
    if (!audio) {
      audio = new Audio('/assets/home-track.mp3');
      audio.loop = true;
      audio.volume = 0.2;
    }
    if (audioPlaying) {
      audio.pause();
      audioPlaying = false;
    } else {
      audio.play().then(() => {
        audioPlaying = true;
        if (soundButton) { soundButton.textContent = '声音开启'; soundButton.setAttribute('aria-pressed', 'true'); }
        if (status) status.textContent = '正在听：いすぼくろ — ドリームレス・ドリームス';
      }).catch(() => { if (status) status.textContent = '暂时没能播放，稍后再听一会儿。'; });
    }
    if (soundButton && !audioPlaying) { soundButton.textContent = '声音关闭'; soundButton.setAttribute('aria-pressed', 'false'); }
  }

  const bounds = world.bounds;
  const walkable = (x, z) => x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ && insideApartment(x, z) && !obstacles.some(o => Math.abs(x - o.x) < o.w && Math.abs(z - o.z) < o.d);
  if (!walkable(avatar.position.x, avatar.position.z)) avatar.position.set(-3.5, 0.26, 3.3);
  const step = 0.3;
  function findPath(goal) {
    const toCell = (x, z) => [Math.round((x - bounds.minX) / step), Math.round((z - bounds.minZ) / step)];
    const toPoint = ([x, z]) => ({ x: bounds.minX + x * step, z: bounds.minZ + z * step });
    const start = toCell(avatar.position.x, avatar.position.z);
    let target = toCell(goal[0], goal[1]);
    if (!walkable(...Object.values(toPoint(target)))) {
      let nearest, distance = Infinity;
      for (let x = 0; x <= Math.floor((bounds.maxX - bounds.minX) / step); x++) for (let z = 0; z <= Math.floor((bounds.maxZ - bounds.minZ) / step); z++) {
        const p = toPoint([x, z]);
        const d = (p.x - goal[0]) ** 2 + (p.z - goal[1]) ** 2;
        if (walkable(p.x, p.z) && d < distance) { nearest = [x, z]; distance = d; }
      }
      if (!nearest) return [];
      target = nearest;
    }
    const key = cell => cell.join(',');
    const queue = [start], parents = new Map([[key(start), null]]);
    let current;
    for (let n = 0; n < queue.length; n++) {
      current = queue[n];
      if (key(current) === key(target)) break;
      for (const [dx, dz] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const next = [current[0] + dx, current[1] + dz];
        const p = toPoint(next);
        if (!parents.has(key(next)) && walkable(p.x, p.z)) { parents.set(key(next), current); queue.push(next); }
      }
    }
    if (key(current) !== key(target)) return [];
    const path = [];
    while (current && key(current) !== key(start)) { path.unshift(toPoint(current)); current = parents.get(key(current)); }
    if (path.length < 3) return path;
    const turns = [path[0]];
    for (let i = 1; i < path.length - 1; i++) {
      const before = path[i - 1], here = path[i], after = path[i + 1];
      if (Math.abs((here.x - before.x) - (after.x - here.x)) > 0.001 || Math.abs((here.z - before.z) - (after.z - here.z)) > 0.001) turns.push(here);
    }
    turns.push(path[path.length - 1]);
    return turns;
  }

  let path = [], pendingSpot = null, nearestSpot = null, hoveredSpot = null;
  const keys = new Set();
  const controller = new AbortController();
  const on = (target, type, handler, options = {}) => target.addEventListener(type, event => { dirty = true; handler(event); }, { ...options, signal: controller.signal });
  function selectView(name) {
    const views = { overview: [0, 0, mobile ? 0.45 : 0.8], living: [-4.8, 2.8, 1.4], study: [-4, -4.5, 1.55], kitchen: [5.6, 4.2, 1.65], bedroom: [5.8, -4.2, 1.7] };
    const [x, z, scale] = views[name] || views.overview;
    followVisitor = false; targetCenter.set(x, 0.8, z); targetZoom = scale;
    root.dataset.view = name;
    root.closest('.home-world').classList.add('is-exploring');
    document.querySelectorAll('[data-space-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.spaceView === name)));
  }
  function follow() { followVisitor = true; targetZoom = Math.max(targetZoom, mobile ? 1.7 : 1.5); root.dataset.view = 'walking'; root.closest('.home-world').classList.add('is-exploring'); document.querySelectorAll('[data-space-view]').forEach(b => b.setAttribute('aria-pressed', 'false')); }
  function setZoom(value) { targetZoom = THREE.MathUtils.clamp(value, mobile ? 0.45 : 0.65, 3.0); if (targetZoom > 1.3) root.closest('.home-world').classList.add('is-exploring'); }
  document.querySelectorAll('[data-space-view]').forEach(b => on(b, 'click', () => selectView(b.dataset.spaceView)));
  on(document.querySelector('[data-space-zoom-in]'), 'click', () => setZoom(targetZoom + 0.35));
  on(document.querySelector('[data-space-zoom-out]'), 'click', () => setZoom(targetZoom - 0.35));
  function visit(id) {
    const spot = spots.find(p => p.id === id);
    if (!spot) return;
    if (spot.view) { selectView(spot.view); return; }
    if (spot.id === 'record') { toggleAudio(); return; }
    if (spot.id === 'outside') { document.querySelector('#outside-panel').showModal(); return; }
    path = findPath(spot.goal);
    follow();
    pendingSpot = spot;
    if (status) status.textContent = `去${spot.title}坐一会儿。`;
    if (reduceMotion) { avatar.position.set(spot.goal[0], 0.26, spot.goal[1]); path = []; arrive(); return; }
    if (!path.length) {
      if (Math.hypot(avatar.position.x - spot.goal[0], avatar.position.z - spot.goal[1]) < 0.8) arrive();
      else { pendingSpot = null; if (status) status.textContent = '这边暂时走不过去，换个方向试试。'; }
    }
  }
  function arrive() {
    if (!pendingSpot) return;
    const spot = pendingSpot;
    pendingSpot = null;
    try { sessionStorage.setItem('yifanovo-apartment-visitor', JSON.stringify({ x: avatar.position.x, z: avatar.position.z })); } catch { /* Optional state. */ }
    root.classList.add('space-departing');
    navigate(spot.path);
  }
  on(layer, 'click', e => { const b = e.target.closest('[data-spot]'); if (b) visit(b.dataset.spot); });
  on(layer, 'focusin', e => { hoveredSpot = e.target.closest('[data-spot]')?.dataset.spot; });
  on(layer, 'focusout', () => { hoveredSpot = null; });
  if (soundButton) on(soundButton, 'click', toggleAudio);
  on(document.querySelector('[data-space-reset]'), 'click', () => { targetAzimuth = 0.56; selectView('living'); avatar.position.set(-3.5, 0.26, 3.3); renderer.shadowMap.needsUpdate = true; path = []; pendingSpot = null; });
  on(window, 'keydown', e => {
    if (e.target.closest('input, select, textarea, dialog') || document.querySelector('#site-index.open')) return;
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      e.preventDefault(); keys.add(key); path = []; pendingSpot = null; follow();
    }
    if (key === 'enter' && nearestSpot && !e.target.closest('button, a')) { e.preventDefault(); visit(nearestSpot.id); }
  });
  on(window, 'keyup', e => keys.delete(e.key.toLowerCase()));
  on(window, 'blur', () => keys.clear());

  const ray = new THREE.Raycaster(), pointer = new THREE.Vector2();
  function cast(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    ray.setFromCamera(pointer, camera);
  }
  let down = null;
  on(canvas, 'pointerdown', e => {
    if (e.button !== 0) return;
    down = { x: e.clientX, y: e.clientY, azimuth: targetAzimuth, moved: false };
    canvas.setPointerCapture(e.pointerId);
  });
  on(canvas, 'pointermove', e => {
    if (down) {
      const dx = e.clientX - down.x;
      if (Math.abs(dx) + Math.abs(e.clientY - down.y) > 8) {
        down.moved = true;
        targetAzimuth = THREE.MathUtils.clamp(down.azimuth + dx * 0.003, -0.2, 1.3);
      }
      return;
    }
    cast(e);
    hoveredSpot = ray.intersectObjects(clickables, false)[0]?.object.userData.spot || null;
    canvas.style.cursor = hoveredSpot ? 'pointer' : 'grab';
  });
  on(canvas, 'pointerleave', () => { if (!down) hoveredSpot = null; });
  on(canvas, 'pointerup', e => {
    if (!down) return;
    if (!down.moved) {
      cast(e);
      const hit = ray.intersectObjects(clickables, false)[0];
      if (hit) visit(hit.object.userData.spot);
      else {
        const point = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.26), new THREE.Vector3());
        if (point) { path = findPath([point.x, point.z]); pendingSpot = null; if (path.length) follow(); }
      }
    }
    down = null;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  });
  on(canvas, 'pointercancel', () => { down = null; });
  on(canvas, 'wheel', e => { e.preventDefault(); setZoom(targetZoom - e.deltaY * 0.0015); }, { passive: false });

  let width = 1, height = 1, alive = true, raf = 0;
  const resize = new ResizeObserver(entries => {
    dirty = true;
    width = entries[0].contentRect.width;
    height = entries[0].contentRect.height;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const half = width / height < 0.95 ? 6.2 * height / width : 8.7;
    camera.left = -half * width / height;
    camera.right = half * width / height;
    camera.top = half;
    camera.bottom = -half;
    camera.updateProjectionMatrix();
  });
  resize.observe(root);
  const projected = new THREE.Vector3();
  const clock = new THREE.Clock();
  let walkingTime = 0;
  function tick() {
    if (!alive) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.25);
    if (document.hidden) return;
    if (followVisitor) targetCenter.set(avatar.position.x, 0.8, avatar.position.z);
    const cameraMoving = Math.abs(azimuth - targetAzimuth) > 0.0001 || Math.abs(zoom - targetZoom) > 0.0001 || center.distanceTo(targetCenter) > 0.001;
    if (!dirty && !cameraMoving && !keys.size && !path.length && !audioPlaying) return;
    dirty = false;
    azimuth = THREE.MathUtils.damp(azimuth, targetAzimuth, reduceMotion ? 100 : 8, dt);
    zoom = THREE.MathUtils.damp(zoom, targetZoom, reduceMotion ? 100 : 8, dt);
    center.lerp(targetCenter, reduceMotion ? 1 : 1 - Math.exp(-5 * dt));
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
    camera.position.set(center.x + Math.sin(azimuth) * 36, 28, center.z + Math.cos(azimuth) * 36);
    camera.lookAt(center);
    camera.updateMatrixWorld();
    let dx = 0, dz = 0;
    const forward = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'));
    const right = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
    if (forward || right) {
      dx = Math.cos(azimuth) * right - Math.sin(azimuth) * forward;
      dz = -Math.sin(azimuth) * right - Math.cos(azimuth) * forward;
    } else if (path.length) {
      const next = path[0]; dx = next.x - avatar.position.x; dz = next.z - avatar.position.z;
      if (Math.hypot(dx, dz) < 0.09) { path.shift(); dx = 0; dz = 0; if (!path.length) arrive(); }
    }
    const length = Math.hypot(dx, dz);
    if (length > 0) {
      const speed = Math.min(3.6 * dt, path.length ? length : Infinity);
      const increments = Math.max(1, Math.ceil(speed / .12));
      for (let i=0;i<increments;i++) {
        const nx = avatar.position.x + dx / length * speed / increments;
        const nz = avatar.position.z + dz / length * speed / increments;
        if (walkable(nx, avatar.position.z)) avatar.position.x = nx;
        if (walkable(avatar.position.x, nz)) avatar.position.z = nz;
      }
      renderer.shadowMap.needsUpdate = true;
      avatar.rotation.y = Math.atan2(dx, dz);
      walkingTime += dt * 12;
    }
    if (!alive) return;
    const swing = length > 0 && !reduceMotion ? Math.sin(walkingTime) * 0.55 : 0;
    legL.rotation.x = swing; legR.rotation.x = -swing;
    armL.rotation.x = -swing * 0.7; armR.rotation.x = swing * 0.7;
    avatar.position.y = 0.26 + (length > 0 && !reduceMotion ? Math.abs(Math.sin(walkingTime)) * 0.025 : 0);
    if (audioPlaying && !reduceMotion) vinyl.rotation.y += dt;
    let closest = null, distance = 1.6;
    for (const spot of spots) {
      const d = Math.hypot(avatar.position.x - spot.goal[0], avatar.position.z - spot.goal[1]);
      if (d < distance) { closest = spot; distance = d; }
      projected.copy(spot.point).project(camera);
      spot.button.style.left = `${(projected.x * 0.5 + 0.5) * width}px`;
      spot.button.style.top = `${(-projected.y * 0.5 + 0.5) * height}px`;
      spot.button.classList.toggle('is-hovered', hoveredSpot === spot.id);
      spot.button.classList.toggle('is-near', d < 1.6);
      spot.button.hidden = projected.z > 1 || Math.abs(projected.x) > 1.04 || Math.abs(projected.y) > 1.04;
    }
    if (closest?.id !== nearestSpot?.id && !pendingSpot && status) status.textContent = closest ? `${closest.title} / ${closest.label}　${mobile ? '轻点探索' : '按 Enter 或轻点进入'}` : '走近一点，发现生活里的不同角落。';
    nearestSpot = closest;
    renderer.render(scene, camera);
  }
  const initialView = avatar.position.z < -1.35 ? (avatar.position.x > 2 ? 'bedroom' : 'study') : (avatar.position.x > 3.5 ? 'kitchen' : 'living');
  selectView(initialView);
  center.copy(targetCenter);
  zoom = targetZoom;
  root.closest('.home-world').classList.add('is-exploring');
  root.classList.add('is-evening', 'space-ready');
  tick();

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    controller.abort();
    resize.disconnect();
    try { sessionStorage.setItem('yifanovo-apartment-visitor', JSON.stringify({ x: avatar.position.x, z: avatar.position.z })); } catch { /* Optional state. */ }
    if (audio) { audio.pause(); audio.src = ''; }
    scene.traverse(object => { if (object.isLight && object.shadow) object.shadow.dispose(); });
    for (const g of new Set(geometries)) g.dispose();
    for (const material of materials.values()) material.dispose();
    for (const texture of textures) texture.dispose();
    for (const batch of batches) batch.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    layer.replaceChildren();
  };
}
