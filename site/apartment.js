import * as THREE from './vendor/three.module.min.js';

export const APARTMENT_BOUNDS = { minX: -9.65, maxX: 9.65, minZ: -7.05, maxZ: 7.05 };
export const insideApartment = (x, z) => x >= -9.65 && x <= 9.65 && z >= -7.05 && z <= 7.05;

// A single roofless apartment. Room partitions, flooring and doors define its
// layout; every object is an original, stylized, softly bevelled game prop.
export function buildApartment(h) {
  const { mesh, box, cylinder, ball, group, m, obstacle, mark, textures, materials, photos, invalidate } = h;
  const wood = '#a77e5b', darkWood = '#76523b', wall = '#e4ded0', cream = '#f1e8d8', ink = '#363b38', green = '#68795d';
  const groundMaterial = new THREE.ShadowMaterial({ color: '#514835', opacity: 0.13 });
  materials.set('ground-shadow', groundMaterial);
  const ground = mesh(new THREE.PlaneGeometry(200, 200), groundMaterial, 0, -0.48, 0);
  ground.rotation.x = -Math.PI / 2; ground.castShadow = false; ground.receiveShadow = false;
  box(20.45, 0.4, 15.35, '#b4ac9c', 0, -0.1, 0);
  box(20.55, 0.12, 15.45, '#e3daca', 0, 0.15, 0);
  const planks = ['#c1a17d', '#b8956e', '#c5a681', '#bf9d77', '#c6aa85'];
  for (let x = 0; x < 34; x++) for (let z = 0; z < 7; z++) {
    box(0.585, 0.06, 2.12, planks[(x * 3 + z) % 5], -9.65 + x * 0.585, 0.22, -6.35 + z * 2.12);
  }
  // Exterior walls are cut away at the front. Openings are actual gaps.
  function wallX(a, b, z, height = 3.3) {
    box(b-a, height, 0.16, wall, (a+b)/2, 0.25+height/2, z);
    box(b-a, 0.12, 0.05, '#c5bba8', (a+b)/2, 0.32, z+0.1);
    obstacle((a+b)/2, z, b-a, 0.16);
  }
  function wallZ(x, a, b, height = 1.1) {
    box(0.16, height, b-a, wall, x, 0.25+height/2, (a+b)/2);
    box(0.2, 0.045, b-a, '#c6b99f', x, 0.28+height, (a+b)/2);
    obstacle(x, (a+b)/2, 0.16, b-a);
  }
  // Rear window walls and sill, with a muted city-sky tint in the glass.
  wallX(-10, 10, -7.4, 0.95);
  box(20, 0.4, 0.16, wall, 0, 3.35, -7.4);
  for (const x of [-9.9, -5.3, 1.9, 7.7, 9.9]) box(0.22, 2.0, 0.18, wall, x, 2.2, -7.4);
  const glass = new THREE.MeshStandardMaterial({ color: '#b9cfce', transparent: true, opacity: 0.14, roughness: 0.2, depthWrite: false });
  materials.set('window-glass', glass);
  for (const [a,b] of [[-9.75,-5.45],[-5.15,1.75],[2.1,7.55],[7.85,9.75]]) {
    box(b-a, 1.9, 0.025, glass, (a+b)/2, 2.2, -7.39).castShadow=false;
    for (const x of [a,b]) box(0.055,1.94,0.12,darkWood,x,2.2,-7.32);
    for (const y of [1.24,3.16]) box(b-a,0.055,0.12,darkWood,(a+b)/2,y,-7.32);
    box(b-a+0.16,0.09,0.42,'#c8b392',(a+b)/2,1.21,-7.22);
    for (const edge of [a+0.08,b-0.32]) for (let j=0;j<5;j++) cylinder(0.055,0.055,1.95,j%2?'#d8cfbb':'#e9dfca',edge+j*0.06,2.21,-7.06,undefined,8);
  }
  // Left exterior window; the right/front walls stay low to preserve sightlines.
  wallZ(-10,-7.4,7.4,0.95);
  box(0.16,0.4,14.8,wall,-10,3.35,0);
  for (const z of [-7.3,-1.5,7.3]) box(0.16,2.0,0.2,wall,-10,2.2,z);
  box(0.025,1.9,14.5,glass,-10,2.2,0).castShadow=false;
  box(0.4,0.09,14.6,'#c8b392',-9.87,1.21,0);
  wallZ(10,-7.4,7.4,0.65);
  wallX(-10,10,7.4,0.32);
  // Study / bedroom / bathroom partitions, with generous indoor doorways.
  wallX(-10,-7.5,-1.35,1.05); wallX(-5.7,-0.8,-1.35,1.05);
  wallZ(2,-7.4,-1.35,1.05);
  wallX(2,3.1,-1.35,1.05); wallX(5.1,10,-1.35,1.05);
  wallZ(7,-1.35,0.1,1.05); wallZ(7,1.8,2.75,1.05);
  wallX(7,10,2.75,0.85);
  // Door jambs hint at complete rooms without obstructing the visitor or camera.
  for (const [x,z] of [[-7.5,-1.35],[-5.7,-1.35],[3.1,-1.35],[5.1,-1.35]]) {
    box(0.12,1.3,0.23,'#b49b79',x,0.9,z);
  }
  // Local prop coordinates let rooms share the same hand-made furniture language.
  function zone(ox, oz) {
    return {
      ...h,
      group: (x=0,y=0,z=0) => group(x+ox,y,z+oz),
      box: (w,h,d,c,x,y,z,p) => box(w,h,d,c,x+(p?0:ox),y,z+(p?0:oz),p),
      cylinder: (a,b,h,c,x,y,z,p,n) => cylinder(a,b,h,c,x+(p?0:ox),y,z+(p?0:oz),p,n),
      mesh: (g,m,x,y,z,p) => mesh(g,m,x+(p?0:ox),y,z+(p?0:oz),p),
      obstacle: (x,z,w,d) => obstacle(x+ox,z+oz,w,d),
    };
  }
  function plant(x, z, size = 1, pot = '#b58b70') {
    const g = group(x, 0.25, z);
    cylinder(0.22 * size, 0.15 * size, 0.39 * size, pot, 0, 0.195 * size, 0, g);
    cylinder(0.19 * size, 0.19 * size, 0.025, '#665544', 0, 0.4 * size, 0, g);
    cylinder(0.018 * size, 0.023 * size, 0.65 * size, '#696447', 0, 0.69 * size, 0, g, 10);
    for (let j = 0; j < 7; j++) {
      const angle = j * 2.4;
      const leaf = ball(0.17 * size, ['#63785a', '#7f8b64', '#52674c'][j % 3], Math.cos(angle) * 0.17 * size, (0.58 + j * 0.07) * size, Math.sin(angle) * 0.17 * size, g, [1, 0.35, 2.1]);
      leaf.rotation.set(0.4, -angle, 0.5);
    }
    return g;
  }
  function book(parent, x, y, z, color, h = 0.45, w = 0.11) {
    box(w, h, 0.29, color, x, y + h / 2, z, parent);
    box(w * 0.9, 0.014, 0.22, '#e6ddc7', x, y + h - 0.03, z + 0.025, parent);
  }
  const bookColors = ['#5f746e', '#b66f51', '#d4bd85', '#69768a', '#e5d5b8', '#824d48'];
  let vinyl;
  { const { group, box, cylinder, mesh, obstacle } = zone(-3.5, -2.7);
  const desk = group(-3, 0, -2.65);
  box(2.75, 0.13, 1.15, wood, 0, 1.31, 0, desk);
  for (const x of [-1.17, 1.17]) for (const z of [-0.42, 0.42]) box(0.08, 1.05, 0.08, darkWood, x, 0.77, z, desk);
  box(0.74, 0.025, 0.53, '#f6eedf', -0.24, 1.395, 0.06, desk).rotation.y = 0.13;
  // Tiny handwritten strokes give the blank paper a little life.
  for (let j = 0; j < 5; j++) box(0.32 - (j % 2) * 0.08, 0.005, 0.009, '#a19d8d', -0.29, 1.411, -0.06 + j * 0.055, desk).rotation.y = 0.13;
  cylinder(0.13, 0.12, 0.18, '#d6d2ba', 0.8, 1.46, 0.15, desk);
  cylinder(0.105, 0.105, 0.008, '#594b3d', 0.8, 1.553, 0.15, desk);
  const cupHandle = mesh(new THREE.TorusGeometry(0.07, 0.016, 8, 18), m('#d6d2ba'), 0.95, 1.46, 0.15, desk);
  box(0.27, 0.09, 0.4, '#b66f51', -0.95, 1.42, -0.2, desk);
  box(0.22, 0.055, 0.34, '#dfcba9', -0.94, 1.49, -0.19, desk);
  cylinder(0.19, 0.19, 0.055, green, 0.83, 1.4, -0.3, desk);
  cylinder(0.022, 0.022, 0.55, '#414943', 0.83, 1.69, -0.3, desk);
  const shade = cylinder(0.12, 0.26, 0.22, green, 0.83, 1.99, -0.3, desk);
  shade.rotation.z = -0.2;
  const chair = group(-3, 0, -1.5);
  box(0.7, 0.1, 0.65, '#927459', 0, 0.83, 0, chair);
  box(0.7, 0.56, 0.09, '#927459', 0, 1.15, 0.28, chair);
  for (const x of [-0.26, 0.26]) for (const z of [-0.22, 0.22]) box(0.055, 0.6, 0.055, darkWood, x, 0.52, z, chair);
  obstacle(-3, -2.65, 2.8, 1.3);
  mark(desk, 'poetry');

  const shelf = group(0.15, 0.25, -3.73);
  for (const x of [-1.16, 1.16]) box(0.08, 2.65, 0.48, wood, x, 1.325, 0, shelf);
  for (let j = 0; j < 5; j++) box(2.4, 0.075, 0.5, wood, 0, 0.15 + j * 0.6, 0, shelf);
  for (let row = 0; row < 4; row++) {
    for (let j = 0; j < 12; j++) {
      if ((j + row * 2) % 9 === 0) continue;
      book(shelf, -0.97 + j * 0.174, 0.19 + row * 0.6, 0, bookColors[(j + row) % 6], 0.33 + ((j * 17 + row) % 7) * 0.022, 0.1 + (j % 3) * 0.02);
    }
  }
  obstacle(0.15, -3.7, 2.5, 0.6);
  mark(shelf, 'article');

  const work = group(3.3, 0, -2.8);
  box(2.5, 0.12, 1.13, '#d8d1bd', 0, 1.31, 0, work);
  for (const x of [-1.02, 1.02]) box(0.08, 1.05, 0.86, '#5e635f', x, 0.78, 0, work);
  box(0.45, 0.025, 0.28, '#8e9390', 0, 1.4, -0.23, work);
  box(0.07, 0.3, 0.06, '#818883', 0, 1.55, -0.25, work);
  box(1.25, 0.77, 0.075, '#303632', 0, 1.98, -0.26, work);
  const screenMaterial = new THREE.MeshStandardMaterial({ color: '#576f70', emissive: '#526e72', emissiveIntensity: 1.2, roughness: 0.4 });
  materials.set('screen', screenMaterial);
  box(1.16, 0.66, 0.01, screenMaterial, 0, 1.99, -0.216, work);
  for (let row = 0; row < 6; row++) {
    box(0.48 - (row % 3) * 0.1, 0.018, 0.012, row % 2 ? '#d8cb9a' : '#9fc3b4', -0.18, 2.2 - row * 0.075, -0.204, work);
  }
  box(0.8, 0.035, 0.26, '#c5c9c3', 0, 1.4, 0.27, work);
  for (let row = 0; row < 3; row++) box(0.7, 0.006, 0.009, '#878f87', 0, 1.421, 0.2 + row * 0.07, work);
  box(0.13, 0.05, 0.22, '#919b93', 0.72, 1.4, 0.28, work);
  box(0.25, 0.4, 0.3, '#474e47', 0.97, 1.56, -0.2, work);
  cylinder(0.25, 0.25, 0.1, '#646e62', 3.2, 0.78, -1.53);
  cylinder(0.045, 0.045, 0.5, '#656d64', 3.2, 0.5, -1.53);
  obstacle(3.3, -2.8, 2.55, 1.3);
  mark(work, 'project');

  }
  { const { group, box, cylinder, obstacle } = zone(-2.6, 1);
  // A muted green sofa and low table: the unhurried part of the room.
  const sofa = group(-2.9, 0, 1.65);
  box(2.65, 0.32, 1.1, '#626f61', 0, 0.53, 0, sofa);
  box(2.6, 0.65, 0.27, '#8b987c', 0, 1.0, -0.43, sofa);
  for (const x of [-1.23, 1.23]) box(0.22, 0.49, 1.12, '#839075', x, 0.83, 0, sofa);
  for (const x of [-0.59, 0.59]) box(1.1, 0.2, 0.85, '#97a185', x, 0.78, 0.06, sofa);
  const pillow = box(0.52, 0.4, 0.18, '#d8bf8b', -0.77, 1.02, -0.18, sofa);
  pillow.rotation.set(-0.15, 0.1, 0.15);
  const pillow2 = box(0.48, 0.4, 0.18, '#d0cdb6', 0.8, 1.01, -0.17, sofa);
  pillow2.rotation.z = -0.18;
  for (const x of [-1.02, 1.02]) for (const z of [-0.35, 0.35]) cylinder(0.055, 0.04, 0.25, darkWood, x, 0.33, z, sofa);
  obstacle(-2.9, 1.65, 2.85, 1.15);
  box(3.4, 0.025, 2.75, '#d5c4a7', -2.35, 0.262, 2.15);
  for (let j = 0; j < 13; j++) box(0.018, 0.003, 2.7, '#c5b295', -3.9 + j * 0.25, 0.278, 2.15);
  cylinder(0.62, 0.62, 0.09, darkWood, -1.98, 0.77, 2.73);
  for (const a of [0, 2.1, 4.2]) cylinder(0.035, 0.035, 0.48, darkWood, -1.98 + Math.cos(a) * 0.38, 0.49, 2.73 + Math.sin(a) * 0.38);
  box(0.35, 0.04, 0.42, '#ddc990', -2, 0.84, 2.73).rotation.y = 0.4;
  obstacle(-1.98, 2.73, 1.1, 1.1);

  }
  { const { group, box, cylinder, mesh, obstacle } = zone(-4.4, 2.0);
  const records = group(-4.37, 0, -0.08);
  box(0.75, 0.66, 1.05, wood, 0, 0.63, 0, records);
  box(0.79, 0.06, 1.1, darkWood, 0, 0.99, 0, records);
  box(0.61, 0.06, 0.66, '#c0aa85', 0, 1.05, -0.1, records);
  vinyl = cylinder(0.245, 0.245, 0.025, '#272d29', 0, 1.096, -0.1, records, 44);
  cylinder(0.06, 0.06, 0.028, '#ba795c', 0, 1.112, -0.1, records);
  const groove = mesh(new THREE.TorusGeometry(0.18, 0.002, 4, 44), m('#484c41'), 0, 1.112, -0.1, records);
  groove.rotation.x = Math.PI / 2;
  box(0.02, 0.02, 0.32, '#9a9c8b', 0.2, 1.14, -0.07, records).rotation.y = -0.3;
  for (let j = 0; j < 5; j++) box(0.1, 0.38, 0.6, bookColors[j], -0.23 + j * 0.11, 0.57, 0, records);
  obstacle(-4.37, -0.08, 0.85, 1.15);
  mark(records, 'record');

  }
  { const { group, box, mesh, obstacle } = zone(-3.5, 0.4);
  // Photographer's wall, deliberately open toward the camera.
  const gallery = group(4.25, 0, 0.25);
  box(0.15, 2.65, 2.2, '#c7c0ae', 0, 1.58, 0, gallery);
  const loader = new THREE.TextureLoader();
  const sunriseTexture = loader.load(photos[0].src, invalidate);
  sunriseTexture.colorSpace = THREE.SRGBColorSpace;
  textures.push(sunriseTexture);
  const pictureMat = new THREE.MeshStandardMaterial({ map: sunriseTexture, roughness: 0.9 });
  materials.set('picture', pictureMat);
  const picture = box(0.035, 1.05, 1.55, '#6e5a43', 0.1, 1.93, 0, gallery);
  const art = mesh(new THREE.PlaneGeometry(1.39, 0.9), pictureMat, 0.125, 1.93, 0, gallery);
  art.rotation.y = Math.PI / 2;
  // Small prints on the back wall complete the lived-in scene.
  for (const [x, color] of [[-3.7, '#8e9a90'], [-2.35, '#c7b28b'], [3.15, '#8e9c97']]) {
    box(0.73, 0.95, 0.065, darkWood, x, 2.82, -7.25);
    box(0.6, 0.81, 0.018, '#eee6d5', x, 2.82, -7.207);
    box(0.4, 0.55, 0.02, color, x, 2.82, -7.19);
  }
  obstacle(4.25, 0.25, 0.35, 2.2);
  mark(gallery, 'photos');
  }
  // The living room: textiles, a reading chair, records and everyday objects.
  box(0.65,0.04,0.82,'#c6ad87',-6.3,0.89,2.8).rotation.y=0.04;
  for (let j=0;j<7;j++) box(0.55,0.006,0.016,'#a48b67',-6.3,0.914,2.49+j*0.1);
  for (const x of [-5.5,-5.16]) ball(0.16,'#b8a98e',x,0.32,3.65,undefined,[0.65,0.3,1.4]);
  const game = group(-4.6,0.88,3.8); game.rotation.y=0.35;
  box(0.45,0.045,0.2,'#4e5854',0,0,0,game); box(0.28,0.012,0.15,'#8ea9a1',0,0.03,0,game);
  for (const x of [-0.18,0.18]) cylinder(0.025,0.025,0.012,'#d4d4bb',x,0.034,0,game,8);
  cylinder(0.25,0.25,0.05,'#b2aa91',-8.9,0.3,3.3);
  cylinder(0.025,0.025,1.95,'#6e7361',-8.9,1.3,3.3);
  cylinder(0.28,0.4,0.4,'#e5d9b8',-8.9,2.22,3.3);
  const armchair=group(-8,0,5.6); armchair.rotation.y=0.5;
  box(1,0.4,0.9,'#b78d69',0,0.6,0,armchair); box(1,0.65,0.2,'#c4a17e',0,1,-0.4,armchair);
  for (const x of [-0.5,0.5]) box(0.17,0.35,0.95,'#b78d69',x,0.85,0,armchair);
  for (const x of [-0.4,0.4]) for (const z of [-0.32,0.32]) cylinder(0.04,0.03,0.3,darkWood,x,0.35,z,armchair,8);
  obstacle(-8,5.6,1.3,1.3);
  cylinder(0.34,0.34,0.06,wood,-6.85,0.9,6);
  cylinder(0.035,0.035,0.62,darkWood,-6.85,0.57,6);
  box(0.3,0.04,0.4,'#75867b',-6.85,0.95,6).rotation.y=-0.2;
  plant(-9,6.65,1.55,'#c9b99c'); plant(-9.2,-6.7,1.0,'#9f8771'); plant(1.25,-6.8,1.25,'#c6b294');
  obstacle(-9,6.65,0.75,0.75);
  // Desk accessories and a board of pinned notes.
  for (let row=0;row<3;row++) for (let col=0;col<9;col++) box(0.055,0.012,0.045,'#d5d8d0',-0.51+col*0.078,1.425,-5.39+row*0.067);
  cylinder(0.065,0.06,0.16,'#bca37d',-7.4,1.46,-5.0,undefined,10);
  for (let j=0;j<4;j++) box(0.012,0.27,0.012,j%2?'#c7ae7c':'#86705b',-7.44+j*0.022,1.6,-5);
  box(1.5,0.75,0.06,'#a98c63',-6.5,2.45,-7.25);
  for (const [x,y,c] of [[-6.9,2.55,'#e2d4b3'],[-6.5,2.4,'#f3e7cb'],[-6.1,2.58,'#b5c3b1']]) {
    box(0.27,0.3,0.012,c,x,y,-7.21).rotation.z=(x+6.5)*0.15;
    ball(0.018,'#8f6b4e',x,y+0.1,-7.19);
  }
  // Bedroom: low bed, folded duvet, bedside books and a slatted wardrobe.
  const bed=group(5.1,0,-4.7);
  box(3,0.4,3.6,'#a78862',0,0.52,0,bed); box(3.05,1.15,0.15,'#ae9271',0,0.95,-1.85,bed);
  box(2.85,0.26,3.4,'#eee5d2',0,0.82,0,bed);
  for (const x of [-0.72,0.72]) box(1.15,0.22,0.65,'#e3d7bd',x,1.05,-1.05,bed).rotation.y=x*0.07;
  box(2.9,0.09,2.15,'#9ca591',0,1.005,0.62,bed); box(2.91,0.13,0.45,'#b9bfa9',0,1.06,-0.23,bed);
  for (let j=0;j<8;j++) box(0.018,0.004,1.9,'#8b9982',-1.2+j*0.35,1.055,0.64,bed);
  obstacle(5.1,-4.7,3.15,3.75);
  for (const x of [3.0,7.18]) {
    box(0.72,0.6,0.7,wood,x,0.55,-5.7); box(0.17,0.025,0.04,darkWood,x,0.64,-5.33);
    cylinder(0.14,0.14,0.035,'#8a805f',x,0.88,-5.7); cylinder(0.02,0.02,0.28,'#7f7b68',x,1.02,-5.7);
    cylinder(0.13,0.24,0.22,'#e6d7b3',x,1.23,-5.7); obstacle(x,-5.7,0.72,0.7);
  }
  box(0.34,0.05,0.46,'#b28268',3,0.9,-5.32).rotation.y=0.15;
  const wardrobe=group(9.2,0,-4.7);
  box(1.15,2.7,4.0,'#c5b79e',0,1.6,0,wardrobe);
  for(let j=0;j<4;j++) {
    box(0.04,2.54,0.96,j%2?'#cdbfa7':'#d9cdb8',-0.597,1.6,-1.48+j*0.99,wardrobe);
    box(0.06,0.28,0.035,'#998569',-0.63,1.5,-1.05+j*0.99,wardrobe);
  }
  obstacle(9.2,-4.7,1.2,4.1);
  box(3.8,0.025,1.35,'#d6c6ac',5,0.267,-1.95);
  const bedroomBook=group(7.4,0,-2.35);
  box(0.8,0.07,0.52,wood,0,0.62,0,bedroomBook); for(const x of [-0.3,0.3]) box(0.05,0.35,0.36,darkWood,x,0.42,0,bedroomBook);
  box(0.36,0.045,0.4,'#a0ac9a',0,0.69,0,bedroomBook).rotation.y=-0.15; mark(bedroomBook,'bedroom-book');
  plant(2.6,-6.8,1.15,'#b5aa90');
  // Bathroom behind a cutaway wall, with tiles, tub, vanity and laundry details.
  for(let x=0;x<5;x++) for(let z=0;z<6;z++) box(0.57,0.02,0.64,(x+z)%2?'#d5d8cf':'#e5e6db',7.3+x*0.6,0.26,-0.99+z*0.65);
  box(1.12,0.62,1.8,'#e8e7df',9.16,0.56,-0.25); box(0.84,0.03,1.48,'#b4c9c6',9.16,0.89,-0.25);
  cylinder(0.04,0.04,0.4,'#969e95',9.5,1.05,-0.95); box(0.3,0.04,0.04,'#969e95',9.38,1.26,-0.95);
  box(1.0,0.65,0.58,'#b9ad96',7.75,0.6,-0.85); box(1.1,0.09,0.66,'#edebdf',7.75,0.98,-0.85);
  cylinder(0.3,0.23,0.045,'#c5d2cc',7.75,1.04,-0.85,undefined,20);
  box(0.68,0.85,0.035,'#b6c8c4',7.75,1.8,-1.23); box(0.78,0.95,0.02,'#9a9d8c',7.75,1.8,-1.25);
  // Mirror surface sits in front of its frame.
  box(0.68,0.85,0.025,'#b6c8c4',7.75,1.8,-1.21);
  const washer=group(9.15,0,1.7);
  box(0.95,1.0,0.9,'#dedfd5',0,0.76,0,washer);
  const washerDoor=cylinder(0.32,0.32,0.04,'#677c78',0,0.72,0.47,washer,20); washerDoor.rotation.x=Math.PI/2;
  for(let j=0;j<3;j++) box(0.65,0.08,0.48,['#c5b59a','#e2d6bd','#a6b09b'][j],0,1.31+j*0.085,0,washer);
  obstacle(9.16,-0.25,1.2,1.9); obstacle(7.75,-0.85,1.1,0.7); obstacle(9.15,1.7,1.0,1.0);
  box(1.1,0.018,0.65,'#97a89b',7.9,0.283,1.7);
  // Kitchen: a long counter, sink, hob, fridge and open shelves.
  const kitchen=group(9.05,0,4.85);
  box(1.24,0.95,3.8,'#b1b89c',0,0.74,0,kitchen); box(1.38,0.12,3.95,'#e4dbc4',0,1.27,0,kitchen);
  for(let j=0;j<4;j++) {
    box(0.025,0.76,0.86,'#c4c7af',-0.64,0.77,-1.42+j*0.95,kitchen);
    box(0.05,0.045,0.22,'#7e846f',-0.68,0.99,-1.42+j*0.95,kitchen);
  }
  box(0.85,0.018,0.7,'#a0b3ab',0,1.344,-0.8,kitchen);
  cylinder(0.025,0.025,0.35,'#8a9b94',0.35,1.5,-0.8,kitchen,10);
  box(0.36,0.04,0.04,'#8a9b94',0.2,1.68,-0.8,kitchen);
  box(0.88,0.025,1.0,'#434c44',0,1.35,0.8,kitchen);
  for(const x of [-0.23,0.23]) for(const z of [0.53,1.04]) {
    const ring=mesh(new THREE.TorusGeometry(0.15,0.014,6,16),m('#929b8b'),x,1.371,z,kitchen); ring.rotation.x=Math.PI/2;
  }
  cylinder(0.19,0.17,0.19,'#a87352',0.23,1.48,1.04,kitchen,16);
  box(0.22,0.045,0.055,'#73543f',0.5,1.55,1.04,kitchen);
  obstacle(9.05,4.85,1.4,4.0);
  box(1.3,2.35,1.2,'#d9dbcd',9.0,1.43,2.65); box(0.04,0.8,0.035,'#8e9889',8.32,1.4,2.3);
  box(0.025,0.025,1.15,'#abb19f',8.335,1.6,2.65); obstacle(9,2.65,1.4,1.3);
  // An island with a chopping board, fruit bowl and two stools.
  box(2.1,0.96,1.05,'#9eaa8f',5.8,0.76,3.25); box(2.28,0.13,1.23,'#ddd0b3',5.8,1.3,3.25);
  box(0.52,0.045,0.34,wood,5.3,1.39,3.28).rotation.y=0.15;
  box(0.24,0.018,0.045,'#8e9589',5.35,1.42,3.25).rotation.y=0.4;
  cylinder(0.3,0.2,0.12,'#d5bf8f',6.35,1.42,3.2,undefined,16);
  for (let j=0;j<5;j++) ball(0.1,j%2?'#b78458':'#a8a86f',6.2+(j%3)*0.13,1.51+(j>2?0.08:0),3.12+(j%2)*0.15);
  obstacle(5.8,3.25,2.3,1.3);
  for(const x of [5.2,6.4]) {
    cylinder(0.28,0.28,0.1,wood,x,0.93,4.35,undefined,16);
    for(const d of [-0.17,0.17]) box(0.05,0.63,0.05,darkWood,x+d,0.56,4.35);
    obstacle(x,4.35,0.55,0.55);
  }
  // Dining table and four chairs; plates and a vase make the scale legible.
  box(2.7,0.13,1.55,wood,1.9,1.2,5.65);
  for(const x of [0.8,3.0]) for(const z of [5.08,6.22]) box(0.09,0.83,0.09,darkWood,x,0.72,z);
  for(const x of [1.2,2.6]) for(const z of [5.22,6.08]) {
    cylinder(0.22,0.22,0.025,'#e4dfce',x,1.29,z,undefined,24);
    box(0.035,0.018,0.3,'#9a9e8b',x+0.29,1.294,z);
  }
  for(const x of [1.15,2.65]) for(const z of [4.45,6.85]) {
    box(0.6,0.09,0.6,'#a59a78',x,0.74,z);
    box(0.61,0.5,0.08,'#a89c7b',x,1.03,z+(z<5?-0.25:0.25));
    for(const d of [-0.23,0.23]) for(const e of [-0.23,0.23]) box(0.05,0.42,0.05,darkWood,x+d,0.49,z+e);
    obstacle(x,z,0.62,0.62);
  }
  cylinder(0.12,0.16,0.3,'#a78064',1.9,1.44,5.65,undefined,12);
  for(let j=0;j<3;j++) { cylinder(0.012,0.012,0.35,'#85926e',1.84+j*0.06,1.7,5.65,undefined,6); ball(0.065,'#d6ba82',1.84+j*0.06,1.9+j*0.04,5.65); }
  obstacle(1.9,5.65,2.8,1.65);
  // Entrance furniture and an indoor pinboard leading to the wider web.
  const entrance=group(6,0,6.65);
  box(2.4,0.66,0.6,'#c4b18e',0,0.58,0,entrance);
  for(const x of [-0.8,0,0.8]) box(0.72,0.45,0.025,'#d9c7a6',x,0.61,-0.32,entrance);
  for(const x of [-0.65,-0.3]) ball(0.15,'#87937b',x,0.32,-0.68,entrance,[0.65,0.3,1.4]);
  const pinboard=group(6,0,6.8);
  box(1.75,1.1,0.1,'#c5b18c',0,1.95,0,pinboard);
  for(const [x,y,c] of [[-0.45,2.1,'#e9e1c8'],[0,1.95,'#b7c3ad'],[0.45,2.13,'#dfc7a4']]) {
    box(0.34,0.43,0.025,c,x,y,-0.065,pinboard).rotation.z=x*0.12;
    ball(0.022,'#92785c',x,y+0.13,-0.085,pinboard);
  }
  mark(pinboard,'outside'); obstacle(6,6.65,2.5,0.7);
  const rack=group(8,0,6.6);
  cylinder(0.23,0.23,0.05,'#93816b',0,0.29,0,rack,12);
  cylinder(0.025,0.04,1.6,'#9b7c58',0,1.1,0,rack,8);
  for(const a of [0,2.1,4.2]) box(0.45,0.04,0.04,'#9b7c58',Math.cos(a)*0.12,1.8,Math.sin(a)*0.12,rack).rotation.y=-a;
  box(0.33,0.7,0.12,'#798b7b',0.17,1.4,0.08,rack).rotation.z=0.13;
  box(0.36,0.48,0.13,'#d6c3a0',-0.15,1.12,0.14,rack); box(0.13,0.14,0.045,'#b9a57f',-0.15,1.43,0.14,rack);
  box(1.65,0.02,0.8,'#9b9d7b',8.1,0.28,5.45);
  for(let j=0;j<9;j++) box(0.04,0.004,0.7,'#b7b593',7.45+j*0.16,0.294,5.45);
  // The entry door belongs to the apartment's right-hand exterior wall.
  box(0.13,2.4,1.5,'#ac9272',9.93,1.45,5.5);
  for(const z of [4.7,6.3]) box(0.2,2.55,0.12,'#d1c1a5',9.92,1.53,z);
  box(0.2,0.12,1.72,'#d1c1a5',9.92,2.85,5.5);
  box(0.09,0.06,0.24,'#706f5e',9.82,1.35,4.98);
  ball(0.025,'#6c6d5e',9.85,1.98,5.5);
  plant(3.2,0.1,1.6,'#bdb5a0'); obstacle(3.2,0.1,0.8,0.8);
  return {
    bounds: APARTMENT_BOUNDS, vinyl,
    spots: [
      { id:'poetry', title:'书桌', label:'诗歌', path:'/poetry', anchor:[-6.5,2.1,-4.9], goal:[-6.2,-3.95] },
      { id:'article', title:'书架', label:'随笔', path:'/article', anchor:[-3.35,2.85,-6.15], goal:[-3.35,-5] },
      { id:'project', title:'工作台', label:'项目', path:'/project', anchor:[-0.2,2.55,-5.2], goal:[-0.8,-4] },
      { id:'photos', title:'照片墙', label:'相册', path:'/photos', anchor:[0.7,2.7,0.6], goal:[1.6,1] },
      { id:'record', title:'唱片机', label:'听一会儿', anchor:[-8.7,1.7,1.9], goal:[-7.9,1.85] },
      { id:'bedroom-book', title:'床边的书', label:'读一首诗', path:'/poetry/2020-07-24', anchor:[7.4,1.3,-2.35], goal:[7.4,-1.75] },
      { id:'outside', title:'玄关留言板', label:'其他地方', anchor:[6,2.6,6.8], goal:[6,5.85] },
    ],
  };
}
