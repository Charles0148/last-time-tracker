import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { mergeVertices } from './vendor/BufferGeometryUtils.js';

const canvas = document.querySelector('#island3dCanvas');
const loading = document.querySelector('#island3dLoading');
const moodCard = document.querySelector('#islandMoodCard');
const animalLabels={redPanda:'小熊貓',cat:'貓咪',panda:'貓熊',otter:'水獺',sloth:'樹懶',capybara:'水豚',hedgehog:'刺蝟',penguin:'企鵝'};
const host = document.querySelector('#island3dScene');
const dialog = document.querySelector('#island3dDialog');
const homeCanvas = document.querySelector('#homeIslandCanvas');
const homeHost = document.querySelector('#homeIslandScene');
const homeLoading = document.querySelector('#homeIslandLoading');
const homeContext = homeCanvas.getContext('2d');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-4.35,4.35,3.35,-3.35,.1,100);
camera.position.set(7.2,6.3,7.2);
camera.lookAt(0,.25,0);
const loader = new GLTFLoader();
const clock = new THREE.Clock();
let lightning = null, island = null, mixers = [], insects = [], characterActors = [], rain = null, targetTurn = 0, openToken = 0, renderTarget = 'home', homeConfig = null, thumbnailRun = 0;
const thumbnailCache = new Map();

const moods = {
  happy:{species:'redPanda',animal:'小熊貓',face:'≧▽≦',sky:0xffe8a2,ground:0x9edb78,water:0x62d5e4},
  achievement:{species:'cat',animal:'貓咪',face:'•̀ᴗ•́ و',sky:0xffc96f,ground:0x91ca72,water:0x58c9dd},
  calm:{species:'penguin',animal:'小企鵝',face:'－‿－',sky:0xc8e8e1,ground:0x9fcdb0,water:0x72cdd5},
  neutral:{species:'capybara',animal:'水豚',face:'・ᴗ・',sky:0xd8e7df,ground:0xadd09b,water:0x80c7d4},
  tired:{species:'sloth',animal:'樹懶',face:'－_－ zZ',sky:0x9dabb8,ground:0x879f98,water:0x6e9fb2},
  sad:{species:'otter',animal:'小水獺',face:'╥﹏╥',sky:0x47586b,ground:0x718881,water:0x527d9c}
};

const residentSlots = [
  {position:[-.55,.36,-1.5],scale:.68,rotation:.55,motion:'look'},
  {position:[1.95,.36,1.15],scale:.63,rotation:.32,motion:'wander'},
  {position:[-2.18,.36,.62],scale:.66,rotation:.92,motion:'look'},
  {position:[.28,.36,1.82],scale:.6,rotation:.68,motion:'wander'}
];
const INSECT_DISPLAY_MAX=30;
const hashString=value=>{let hash=2166136261;for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return hash>>>0};

const colors = {soil:0xa56f50,soilDark:0x755145,stone:0xf0d7a2,stoneSide:0xc59672,wood:0xa56d43,trunk:0x76513c};
// The whole scene uses smooth toon shading; characters add a same-hue ink outline (matches the GPT-illustrated 2D art).
const toonRamp=(()=>{const t=new THREE.DataTexture(new Uint8Array([150,150,150,255,205,205,205,255,255,255,255,255]),3,1);t.minFilter=t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t})();
const toon=color=>new THREE.MeshToonMaterial({color,gradientMap:toonRamp});
const inkFor=color=>{const c=new THREE.Color(color),hsl={};c.getHSL(hsl);return new THREE.Color().setHSL(hsl.h,Math.min(1,hsl.s*.9+.05),Math.max(.08,hsl.l*.42))};
const standard = color => toon(color);
const mesh = (geometry, material, position, parent=island) => { const value=new THREE.Mesh(geometry,material); value.position.set(...position); value.castShadow=true; value.receiveShadow=true; parent.add(value); return value; };

function resize(){
  const surface=renderTarget==='home'?homeHost:host,rect=surface.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  renderer.setSize(rect.width,rect.height,false);
  const aspect=rect.width/rect.height,view=Math.max(3.5,4.3/aspect);
  camera.left=-view*aspect;camera.right=view*aspect;camera.top=view;camera.bottom=-view;camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
new ResizeObserver(resize).observe(homeHost);

function clearScene(){
  mixers=[];insects=[];characterActors=[];rain=null;lightning=null;
  if(island){scene.remove(island);island.traverse(o=>{if(o.geometry&&!o.userData.asset)o.geometry.dispose();if(o.material&&!o.userData.asset){const list=Array.isArray(o.material)?o.material:[o.material];list.forEach(m=>m.dispose())}})}
  scene.fog=null;
  while(scene.children.length)scene.remove(scene.children[0]);
}

function addLights(key){
  const hemi=new THREE.HemisphereLight(moods[key].sky,key==='sad'?0x46525e:0xf4dfb6,key==='sad'?1.9:2.1);scene.add(hemi);
  const sun=new THREE.DirectionalLight(key==='sad'?0xaac8e6:0xfff0cf,key==='sad'?2.1:3.4);sun.position.set(5,9,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;scene.add(sun);
  const fill=new THREE.DirectionalLight(key==='achievement'?0xffad66:0x8fd9ff,.9);fill.position.set(-5,3,-4);scene.add(fill);
}

function box(size,position,color,parent=island){return mesh(new THREE.BoxGeometry(...size),standard(color),position,parent)}
function cylinder(top,bottom,height,segments,position,color,parent=island){return mesh(new THREE.CylinderGeometry(top,bottom,height,Math.max(segments,20)),standard(color),position,parent)}
function ribbon(points,widths,material,yOffset=0,parent=island){
  const vertices=[],indices=[];
  points.forEach((point,index)=>{
    const previous=points[Math.max(0,index-1)],next=points[Math.min(points.length-1,index+1)];
    const dx=next[0]-previous[0],dz=next[2]-previous[2],length=Math.hypot(dx,dz)||1;
    const sideX=-dz/length,sideZ=dx/length,width=Array.isArray(widths)?widths[index]:widths;
    vertices.push(point[0]+sideX*width,point[1]+yOffset,point[2]+sideZ*width);
    vertices.push(point[0]-sideX*width,point[1]+yOffset,point[2]-sideZ*width);
    if(index<points.length-1){const base=index*2;indices.push(base,base+1,base+2,base+1,base+3,base+2)}
  });
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  const surface=mesh(geometry,material,[0,0,0],parent);surface.castShadow=false;return surface;
}

function islandBody(radii,topY,bottomY,topMaterial,sideMaterial){
  const count=radii.length,vertices=[0,topY,0],indices=[];
  for(let i=0;i<count;i++){const angle=(i/count)*Math.PI*2;vertices.push(Math.cos(angle)*radii[i],topY,Math.sin(angle)*radii[i])}
  for(let i=0;i<count;i++){const angle=(i/count)*Math.PI*2;vertices.push(Math.cos(angle)*radii[i]*.91,bottomY,Math.sin(angle)*radii[i]*.91)}
  vertices.push(0,bottomY,0);
  for(let i=0;i<count;i++){const next=(i+1)%count;indices.push(0,1+next,1+i)}
  const sideStart=indices.length;
  for(let i=0;i<count;i++){
    const next=(i+1)%count,top=1+i,topNext=1+next,bottom=1+count+i,bottomNext=1+count+next;
    indices.push(top,bottomNext,bottom,top,topNext,bottomNext);
  }
  const bottomCenter=1+count*2;
  for(let i=0;i<count;i++){const next=(i+1)%count;indices.push(bottomCenter,1+count+i,1+count+next)}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  geometry.clearGroups();geometry.addGroup(0,sideStart,0);geometry.addGroup(sideStart,indices.length-sideStart,1);
  return mesh(geometry,[topMaterial,sideMaterial],[0,0,0]);
}

// Layout coordinates are screen units (l: left/right, d: back/front of the default view); see islandLayout in app.js.
const worldXZ=(l,d)=>[(l+d)/Math.SQRT2,(d-l)/Math.SQRT2];
const worldRotation=a=>{const [x,z]=worldXZ(Math.cos(a),Math.sin(a));return Math.atan2(-z,x)};
const GROUND=.34;
const fallbackLayout={radii:[2.88,3.03,2.78,3.08,2.84,3.02,2.76,2.98,3.1,2.82,3,2.79],size:1,features:[],hero:[.78,.75],slots:[[-1.25,.85],[1.65,.05],[-.15,1.55],[1.05,-.85]],sign:[1.95,-.55]};
function coastRadius(layout,x,z){
  const n=layout.radii.length,t=((Math.atan2(z,x)/(Math.PI*2))*n+n)%n,i=Math.floor(t),f=t-i;
  return (layout.radii[i]*(1-f)+layout.radii[(i+1)%n]*f)*layout.size;
}
function flat(geometry,material,x,z,y){const value=mesh(geometry,material,[x,y,z]);value.rotation.x=-Math.PI/2;value.castShadow=false;return value}

function buildIsland(key,count,profession,layout=fallbackLayout){
  const mood=moods[key]; island=new THREE.Group(); island.rotation.y=targetTurn; scene.add(island);
  const waterMat=new THREE.MeshStandardMaterial({color:mood.water,roughness:.22,metalness:.04,transparent:true,opacity:.86});
  const water=mesh(new THREE.CylinderGeometry(3.75,3.75,.1,72),waterMat,[0,-.73,0]);water.receiveShadow=true;
  islandBody(layout.radii.map(r=>r*layout.size),GROUND,-.58,standard(mood.ground),standard(colors.soil));
  const mats={
    ground:mood.ground,
    bank:Object.assign(standard(0x78936f),{side:THREE.DoubleSide}),
    stream:Object.assign(waterMat.clone(),{side:THREE.DoubleSide,opacity:.94}),
    path:Object.assign(standard(0xc9a56d),{side:THREE.DoubleSide})
  };
  const clearingMat=standard(0xc7e9a0);clearingMat.color.lerp(new THREE.Color(mood.ground),.58);
  flat(new THREE.CircleGeometry(.75,20),clearingMat,...worldXZ(...layout.hero),GROUND+.012);
  const loads=layout.features.map(feature=>(featureBuilders[feature.type]||(()=>{}))(feature,layout,mats,key));
  if(key==='achievement'&&!layout.features.some(f=>f.type==='hill'&&f.lookout)){
    // Days without a lookout still raise the achievement flag, just behind the hero.
    const [x,z]=worldXZ(layout.hero[0]-.5,layout.hero[1]-.55),pole=new THREE.Group();pole.position.set(x,GROUND,z);island.add(pole);addFlag(pole,0);
  }
  addProfessionMarker(profession,layout);
  addInsects(count,key);
  if(key==='sad')addRain();
  if(key==='tired'||key==='sad')scene.fog=new THREE.FogExp2(key==='sad'?0x526172:0x9aa9ae,key==='sad' ? .045 : .04);
  return Promise.all(loads);
}

function addFlag(parent,y){
  cylinder(.025,.025,.62,6,[.22,y+.31,-.05],colors.trunk,parent);
  const flag=mesh(new THREE.BoxGeometry(.34,.2,.02),standard(0xf1bf5b),[.4,y+.51,-.05],parent);flag.userData.flag=true;
}

function addPond(x,z,r,mats){
  flat(new THREE.CircleGeometry(r*1.17,24),mats.bank,x,z,GROUND+.012);
  flat(new THREE.CircleGeometry(r,24),mats.stream,x,z,GROUND+.034);
}

function addTree(f){
  const [x,z]=worldXZ(f.l,f.d),h=f.h||.8;
  if(f.kind==='high')return addProp('TreeHigh001.glb',[x,GROUND,z],h,f.l);
  if(f.kind==='low')return addProp('TreeLow001.glb',[x,GROUND,z],h,f.d);
  if(f.kind==='bush')return addProp('Bush001.glb',[x,GROUND,z],h,f.l*2);
  const tree=new THREE.Group();tree.position.set(x,GROUND,z);island.add(tree);
  if(f.kind==='pine'){
    cylinder(.05,.07,h*.3,6,[0,h*.15,0],colors.trunk,tree);
    [[.36,.42,.28],[.28,.36,.5],[.18,.3,.7]].forEach(([r,ch,y])=>mesh(new THREE.ConeGeometry(r*h*1.2,ch*h,18),standard(0x3f7a5a),[0,y*h+ch*h*.3,0],tree));
  }else if(f.kind==='blossom'){
    cylinder(.05,.08,h*.45,6,[0,h*.22,0],colors.trunk,tree);
    [[0,.62,0,.3],[.18,.55,.1,.22],[-.16,.58,-.08,.22],[.04,.78,-.04,.2]].forEach(([px,py,pz,r])=>mesh(new THREE.SphereGeometry(r*h*1.15,20,14),standard(px>0?0xf3b2c4:0xf6c6d3),[px*h,py*h,pz*h],tree));
  }else if(f.kind==='palm'){
    const trunk=[0,.18,.36,.54,.72];trunk.forEach((t,i)=>cylinder(.055,.065,h*.2,6,[t*.22*h,t*h+.1*h,0],i%2?0x9a7350:0xb08860,tree));
    for(let i=0;i<6;i++){const leaf=mesh(new THREE.BoxGeometry(.5*h,.03,.13*h),standard(i%2?0x4f9a5a:0x62ad66),[.16*h,.92*h,0],tree);leaf.rotation.y=i/6*Math.PI*2;leaf.rotation.z=-.35;leaf.position.x+=Math.cos(i/6*Math.PI*2)*.2*h;leaf.position.z-=Math.sin(i/6*Math.PI*2)*.2*h}
  }
  return null;
}

const flowerTones={pink:[0xf39ab4,0xfbd0dc],yellow:[0xf4c84f,0xfff0b0],purple:[0xb294d6,0xe1d1f4],red:[0xe9677a,0xffc2c9]};
const featureBuilders={
  hill(f,layout,mats,key){
    const [x,z]=worldXZ(f.l,f.d),top=GROUND+f.h;
    mesh(new THREE.CylinderGeometry(f.r*.68,f.r,f.h,32),standard(0x789b69),[x,GROUND+f.h/2,z]);
    cylinder(f.r*.68,f.r*.71,.07,32,[x,top+.035,z],0x92bf79);
    // Stairs climb from the front so they face the camera and the hero.
    const dir=new THREE.Vector2(...worldXZ(.55,1)).normalize();
    for(let i=0;i<5;i++){const t=i/4,dist=f.r*(1.02-t*.5),step=box([.36,.085,.24],[x+dir.x*dist,GROUND+.08+t*(f.h-.08),z+dir.y*dist],i%2?0xc8b994:0xd3c39e);step.rotation.y=Math.atan2(dir.x,dir.y)}
    if(f.spring){
      const [sx,sz]=worldXZ(f.l-.25,f.d+.25);flat(new THREE.CircleGeometry(.24,18),mats.bank,sx,sz,top+.075);flat(new THREE.CircleGeometry(.19,18),mats.stream,sx,sz,top+.09);
      const [fx,fz]=worldXZ(f.l-f.r*.62,f.d+f.r*.62),fall=mesh(new THREE.PlaneGeometry(.16,f.h*.8),mats.stream,[fx,GROUND+f.h*.5,fz]);fall.rotation.y=Math.atan2(...worldXZ(-1,1));fall.castShadow=false;
    }
    if(f.lookout){
      const lookout=new THREE.Group();lookout.position.set(x-.12,top+.12,z-.1);island.add(lookout);
      cylinder(.36,.4,.105,8,[0,0,0],colors.stone,lookout);
      [[-.27,.2,-.24],[.27,.2,-.24]].forEach(pos=>box([.065,.36,.065],pos,colors.trunk,lookout));
      box([.6,.06,.06],[0,.38,-.24],colors.wood,lookout);
      if(key==='achievement')addFlag(lookout,.05);
    }
  },
  pond(f,layout,mats){addPond(...worldXZ(f.l,f.d),f.r,mats)},
  lake(f,layout,mats){addPond(...worldXZ(f.l,f.d),f.r,mats)},
  islet(f){const [x,z]=worldXZ(f.l,f.d);cylinder(f.r,f.r*1.1,.08,10,[x,GROUND+.06,z],0xa9cf8f);return addTree({kind:'low',l:f.l,d:f.d,h:.5})},
  creek(f,layout,mats){
    const pts=f.pts.map(p=>worldXZ(...p)),last=pts[pts.length-1],edge=coastRadius(layout,...last),dist=Math.hypot(...last),n=pts.length;
    // Extend to the coast so the stream always ends in the waterfall.
    const end=[last[0]/dist*edge*.99,last[1]/dist*edge*.99],points=[...pts,end].map(([x,z],i)=>[x,GROUND+.03-(i>=n-1?.04:0),z]),widths=points.map((_,i)=>.14-i*.012);
    ribbon(points,widths.map(w=>w+.055),mats.bank,-.012);ribbon(points,widths,mats.stream,.01);
    if(f.fall){const fall=mesh(new THREE.PlaneGeometry(.18,.74),mats.stream,[end[0]*1.005,-.1,end[1]*1.005]);fall.rotation.y=Math.atan2(end[0],end[1]);fall.castShadow=false}
  },
  path(f,layout,mats){const pts=f.pts.map(p=>[...worldXZ(...p)]).map(([x,z])=>[x,GROUND+.03,z]);ribbon(pts,pts.map(()=>.15),mats.path,.004)},
  stones(f){f.pts.forEach(([l,d])=>{const [x,z]=worldXZ(l,d);cylinder(.13,.15,.05,7,[x,GROUND+.03,z],0xd8cdb8)})},
  bridge(f){
    const [x,z]=worldXZ(f.l,f.d),bridge=new THREE.Group();bridge.position.set(x,GROUND+.115,z);bridge.rotation.y=worldRotation(f.a);island.add(bridge);
    for(let i=-2;i<=2;i++)box([.12,.07,.6],[i*.12,0,0],i%2?colors.wood:0xb77b4b,bridge);
    box([.66,.05,.05],[0,.06,-.3],colors.trunk,bridge);box([.66,.05,.05],[0,.06,.3],colors.trunk,bridge);
  },
  dock(f){
    const [x,z]=worldXZ(f.l,f.d),dock=new THREE.Group();dock.position.set(x,GROUND+.07,z);dock.rotation.y=worldRotation(f.a);island.add(dock);
    for(let i=0;i<6;i++)box([.12,.05,.34],[-.3+i*.13,0,0],i%2?colors.wood:0xb77b4b,dock);
    [[.32,-.16],[.32,.16]].forEach(([px,pz])=>cylinder(.03,.03,.3,6,[px,-.08,pz],colors.trunk,dock));
  },
  tree:addTree,
  rock(f){
    const [x,z]=worldXZ(f.l,f.d);
    if(!f.dark)return addProp('Rock001.glb',[x,GROUND,z],f.s,f.l);
    const rock=mesh(new THREE.DodecahedronGeometry(f.s*.75,0),standard(0x737a86),[x,GROUND+f.s*.4,z]);rock.scale.y=.8;rock.rotation.set(f.l,f.d,0);
  },
  flowers(f){
    const [x,z]=worldXZ(f.l,f.d),tones=flowerTones[f.tone]||[[0xf39ab4,0xf4c84f,0xb294d6][Math.abs(Math.round(f.l*3))%3],0xffffff];
    flat(new THREE.CircleGeometry(f.r,14),standard(0x7fae5f),x,z,GROUND+.014);
    for(let i=0;i<7;i++){const a=i*2.4,r=f.r*(.25+.65*((i*37)%10)/10);cylinder(.012,.012,.12,4,[x+Math.cos(a)*r,GROUND+.07,z+Math.sin(a)*r],0x5d8f4b);mesh(new THREE.SphereGeometry(.05,10,8),standard(tones[i%2]),[x+Math.cos(a)*r,GROUND+.14,z+Math.sin(a)*r])}
  },
  mushroom(f){
    const [x,z]=worldXZ(f.l,f.d);cylinder(.05,.06,.16,8,[x,GROUND+.08,z],0xf3e8d4);
    const cap=mesh(new THREE.SphereGeometry(.14,10,6,0,Math.PI*2,0,Math.PI/2),standard(0xd9534f),[x,GROUND+.15,z]);cap.scale.y=.8;
    [[.06,.04],[-.05,.06],[0,-.07]].forEach(([dx,dz])=>mesh(new THREE.SphereGeometry(.022,6,4),standard(0xffffff),[x+dx,GROUND+.25,z+dz]));
  },
  field(f){
    const [x,z]=worldXZ(f.l,f.d),field=new THREE.Group();field.position.set(x,GROUND,z);field.rotation.y=worldRotation(f.a);island.add(field);
    box([f.w,.05,f.dd],[0,.025,0],0x8c6448,field);
    for(let row=0;row<4;row++)for(let i=0;i<6;i++)box([.08,.1+((row+i)%3)*.03,.08],[-f.w/2+.18+i*(f.w-.36)/5,.1,-f.dd/2+.17+row*(f.dd-.34)/3],row%2?0x7fbf5a:0x9ccc5f,field);
    const posts=[[-1,-1],[1,-1],[1,1],[-1,1]];posts.forEach(([px,pz])=>box([.05,.22,.05],[px*(f.w/2+.06),.11,pz*(f.dd/2+.06)],colors.wood,field));
    box([f.w+.12,.035,.035],[0,.16,-(f.dd/2+.06)],colors.wood,field);box([.035,.035,f.dd+.12],[-(f.w/2+.06),.16,0],colors.wood,field);box([.035,.035,f.dd+.12],[f.w/2+.06,.16,0],colors.wood,field);
  },
  house(f){
    const [x,z]=worldXZ(f.l,f.d),house=new THREE.Group();house.position.set(x,GROUND,z);house.rotation.y=worldRotation(f.a)+Math.PI/2;island.add(house);
    box([.62,.42,.52],[0,.21,0],0xf3e3c3,house);
    const roof=mesh(new THREE.ConeGeometry(.52,.36,4),standard(0xd9645a),[0,.6,0],house);roof.rotation.y=Math.PI/4;roof.scale.z=.9;
    box([.14,.24,.02],[0,.12,.27],0x8a5a3c,house);box([.12,.1,.02],[.2,.26,.27],0xa9d8e8,house);
  },
  haystack(f){const [x,z]=worldXZ(f.l,f.d);cylinder(.2,.24,.24,10,[x,GROUND+.12,z],0xe8c766);mesh(new THREE.ConeGeometry(.21,.18,20),standard(0xf0d47f),[x,GROUND+.33,z])},
  beach(f,layout){
    // Screen angle φ maps to world angle φ-45°; build a sand band hugging the coast.
    const from=THREE.MathUtils.degToRad(f.from-45),to=THREE.MathUtils.degToRad(f.to-45),steps=24,vertices=[],indices=[];
    for(let i=0;i<=steps;i++){const a=from+(to-from)*i/steps,cx=Math.cos(a),cz=Math.sin(a),edge=coastRadius(layout,cx,cz)*.985;vertices.push(cx*edge,GROUND+.008,cz*edge,cx*edge*.66,GROUND+.008,cz*edge*.66);if(i<steps){const b=i*2;indices.push(b,b+2,b+1,b+1,b+2,b+3)}}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    const sand=mesh(geometry,Object.assign(standard(0xf1d9a5),{side:THREE.DoubleSide}),[0,0,0]);sand.castShadow=false;
  },
  umbrella(f){
    const [x,z]=worldXZ(f.l,f.d);cylinder(.02,.02,.62,6,[x,GROUND+.31,z],0xf6efe3);
    mesh(new THREE.ConeGeometry(.42,.2,24),standard(0xf08a77),[x,GROUND+.66,z]);box([.34,.02,.18],[x+.12,GROUND+.02,z+.18],0x7fbcd2);
  },
  shells(f){f.pts.forEach(([l,d],i)=>{const [x,z]=worldXZ(l,d),shell=mesh(new THREE.SphereGeometry(.05,8,4,0,Math.PI*2,0,Math.PI/2),standard(i%2?0xffe3ea:0xfff6e8),[x,GROUND+.01,z]);shell.scale.set(1.2,.6,1)})},
  arch(f){
    const [x,z]=worldXZ(f.l,f.d),arch=new THREE.Group();arch.position.set(x,GROUND,z);arch.rotation.y=worldRotation(f.a);island.add(arch);
    mesh(new THREE.TorusGeometry(.42,.13,6,12,Math.PI),standard(0x8b919b),[0,.05,0],arch);
    box([.3,.12,.3],[-.42,.06,0],0x737a86,arch);box([.3,.12,.3],[.42,.06,0],0x737a86,arch);
  }
};

function addProfessionMarker(profession,layout){
  if(!profession)return;
  const [x,z]=worldXZ(...layout.sign);
  const palette={office:0x40577a,medical:0xf3f5ef,technology:0x3e8a7b,education:0x8c69a9,creative:0xf08a77,food:0xe5a94e,care:0x68a890,trades:0xe9a63b};
  const marker=new THREE.Group();marker.name='professionMarker';marker.position.set(x,GROUND,z);marker.rotation.y=-.42;island.add(marker);
  box([.09,.88,.09],[0,.44,0],0x68504a,marker);
  const sign=box([.7,.38,.08],[.28,.72,0],palette[profession]||0x6b86a8,marker);sign.userData.float=true;
}

function addInsects(count,key){
  // Same cap and the same four kinds (ladybug, bee, blue butterfly, grasshopper) as the 2D atlas piece.
  const shown=Math.min(count,INSECT_DISPLAY_MAX);
  for(let i=0;i<shown;i++){
    const bug=new THREE.Group(),kind=i%4;
    const palettes=[
      {body:0xd94d45,head:0x342d2b,wing:0xe0453c},
      {body:0xf2bf3f,head:0x3d342f,wing:0xf7f2d8},
      {body:0xead2ae,head:0xead2ae,wing:0x3f95e0},
      {body:0x7fb24a,head:0x8cc257,wing:0x5f9a3c}
    ],palette=palettes[kind],wingSize=kind===2?[.24,.02,.22]:[.14,.035,.15];
    mesh(new THREE.SphereGeometry(.085,14,10),standard(palette.body),[0,0,0],bug).scale.set(.9,.8,1.35);
    mesh(new THREE.SphereGeometry(.058,12,10),standard(palette.head),[0,.01,.15],bug);
    const wingMat=new THREE.MeshStandardMaterial({color:palette.wing,roughness:.7,transparent:true,opacity:kind===1?.72:.95});
    const w1=mesh(new THREE.CylinderGeometry(wingSize[0]/2,wingSize[0]/2,wingSize[1],16),wingMat,[-(wingSize[0]/2+.05),.055,-.01],bug),w2=mesh(new THREE.CylinderGeometry(wingSize[0]/2,wingSize[0]/2,wingSize[1],16),wingMat,[wingSize[0]/2+.05,.055,-.01],bug);
    if(kind===3){mesh(new THREE.BoxGeometry(.03,.14,.03),standard(0x5f9a3c),[-.08,-.02,-.1],bug).rotation.x=.9;mesh(new THREE.BoxGeometry(.03,.14,.03),standard(0x5f9a3c),[.08,-.02,-.1],bug).rotation.x=.9}
    if(kind===1){mesh(new THREE.TorusGeometry(.072,.014,6,18),standard(0x3d342f),[0,0,-.03],bug);mesh(new THREE.TorusGeometry(.068,.014,6,18),standard(0x3d342f),[0,0,.04],bug)}
    if(kind===0){mesh(new THREE.SphereGeometry(.02,8,6),standard(0x342d2b),[-.035,.065,-.045],bug);mesh(new THREE.SphereGeometry(.02,8,6),standard(0x342d2b),[.035,.065,.035],bug)}
    const angle=(i/shown)*Math.PI*2+(key.charCodeAt(key.length-1)%8)*.16,radius=1.55+(i%3)*.22;
    bug.position.set(Math.cos(angle)*radius,.68+(i%4)*.1,.05+Math.sin(angle)*radius);bug.userData={angle,radius,speed:.35+(i%5)*.05,phase:i*.8,wings:[w1,w2]};island.add(bug);insects.push(bug);
  }
}

function addRain(){
  // Short falling streaks (two vertices each) read as rain without hiding the island.
  const drops=220,positions=new Float32Array(drops*6);
  for(let i=0;i<drops;i++){const x=(Math.random()-.5)*9,y=Math.random()*7,z=(Math.random()-.5)*9;positions.set([x,y,z,x+.04,y-.28,z+.04],i*6)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  rain=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xd4ebff,transparent:true,opacity:.55}));scene.add(rain);
}

function addEgg(layout){
  const [x,z]=worldXZ(...layout.hero),egg=mesh(new THREE.SphereGeometry(.34,18,14),standard(0xf0b16e),[x,.72,z]);
  egg.scale.set(.74,1.04,.74);egg.rotation.z=-.06;
  const glow=new THREE.PointLight(0xffd79a,1.1,4);glow.position.set(0,1.8,.5);island.add(glow);
}

// Screen-anchored sky position: sx/sy in view units from the look-at point, pushed behind the island.
function skyPoint(sx,sy){
  camera.updateMatrixWorld();
  const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1),back=camera.getWorldDirection(new THREE.Vector3());
  return new THREE.Vector3(0,.25,0).addScaledVector(right,sx).addScaledVector(up,sy).addScaledVector(back,6);
}

function addSky(key){
  if(key==='happy'||key==='achievement'){
    const at=skyPoint(-3.1,2.45);
    const sun=new THREE.Mesh(new THREE.SphereGeometry(.42,20,14),new THREE.MeshBasicMaterial({color:key==='achievement'?0xffd36a:0xffe58a}));sun.position.copy(at);scene.add(sun);
    const halo=new THREE.Mesh(new THREE.SphereGeometry(.62,20,14),new THREE.MeshBasicMaterial({color:0xfff6d0,transparent:true,opacity:.4}));halo.position.copy(at).addScaledVector(camera.getWorldDirection(new THREE.Vector3()),.3);scene.add(halo);
  }
  if(key==='sad'){
    [[-3,2.55],[0,2.95],[3,2.55]].forEach(([x,y])=>addCloud(...skyPoint(x,y).toArray(),0x5d6878));
    lightning=new THREE.DirectionalLight(0xe4f0ff,0);lightning.position.set(-3,8,2);scene.add(lightning);
  }else{
    const shade=key==='tired'?0xb8c1c5:0xffffff;
    addCloud(...skyPoint(2.9,2.5).toArray(),shade);addCloud(...skyPoint(key==='happy'||key==='achievement'?-.4:-2.8,2.95).toArray(),shade);
  }
}

function addCloud(x,y,z,shade=0xffffff){
  const g=new THREE.Group();[[0,0,0,.45],[.38,.02,0,.32],[-.38,.01,.04,.3],[.05,.2,.02,.34]].forEach(([px,py,pz,s])=>mesh(new THREE.SphereGeometry(s,20,14),standard(shade),[px,py,pz],g));g.position.set(x,y,z);scene.add(g);return g;
}

// GLB attributes may be interleaved or quantized; rebuild plain float positions, then weld and smooth the normals.
function smoothGeometry(source){
  const pos=source.getAttribute('position'),flat=new Float32Array(pos.count*3);
  for(let i=0;i<pos.count;i++){flat[i*3]=pos.getX(i);flat[i*3+1]=pos.getY(i);flat[i*3+2]=pos.getZ(i)}
  const plain=new THREE.BufferGeometry();plain.setAttribute('position',new THREE.BufferAttribute(flat,3));if(source.index)plain.setIndex(Array.from(source.index.array));
  const welded=mergeVertices(plain,.02);welded.computeVertexNormals();return welded;
}

async function addProp(file,position,height,rotation=0){
  const target=island;
  try{
    const gltf=await loader.loadAsync(`./assets/3d/${file}`),object=gltf.scene;object.userData.asset=true;object.traverse(o=>{o.userData.asset=true;if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const m=Array.isArray(o.material)?o.material[0]:o.material;if(!m.map)o.geometry=smoothGeometry(o.geometry);o.material=Object.assign(toon(m.color),{map:m.map||null,vertexColors:!!m.vertexColors})}});
    const box3=new THREE.Box3().setFromObject(object),size=box3.getSize(new THREE.Vector3()),center=box3.getCenter(new THREE.Vector3()),scale=height/Math.max(size.y,.001);
    object.scale.setScalar(scale);object.position.set(position[0]-center.x*scale,position[1]-box3.min.y*scale,position[2]-center.z*scale);object.rotation.y=rotation;target.add(object);return object;
  }catch(error){console.warn('3D prop failed',file,error)}
}

function characterPart(geometry,color,position,scale,parent,outline=false){
  const part=mesh(geometry,toon(color),position,parent);part.scale.set(...scale);
  if(outline&&Math.max(...scale)>=.08){const hull=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:inkFor(color),side:THREE.BackSide}));hull.scale.setScalar(1+.045/Math.max(.12,Math.min(...scale.map(Math.abs))));hull.castShadow=false;part.add(hull)}
  return part;
}

function softPart(color,position,scale,parent,segments=12,outline=false){
  return characterPart(new THREE.SphereGeometry(1,Math.max(20,segments*2),Math.max(14,segments)),color,position,scale,parent,outline);
}

function addEar(parent,x,color,inner,round=false){
  if(round){softPart(color,[x*1.04,1.52,.01],[.17,.17,.11],parent,12,true);softPart(inner,[x*1.04,1.53,.1],[.09,.09,.035],parent);return}
  const ear=characterPart(new THREE.ConeGeometry(.19,.38,12),color,[x*1.1,1.62,.02],[1,1,1],parent,true);ear.rotation.z=x<0?.22:-.22;
  const inset=characterPart(new THREE.ConeGeometry(.1,.22,12),inner,[x*1.1,1.6,.12],[1,1,1],parent);inset.rotation.z=ear.rotation.z;
}

function addWhiskers(rig,y,z,color=0x4a3a35){
  [-1,1].forEach(side=>[.03,-.03].forEach(dy=>{const whisker=box([.24,.012,.012],[side*.27,y+dy,z],color,rig);whisker.rotation.z=side*dy*4}));
}

function addFace(rig,palette,moodKey,species){
  const sleepy=moodKey==='calm'||moodKey==='tired',sad=moodKey==='sad';
  // Species set where the eyes sit; capybara eyes are high and wide, the hedgehog face is a narrow cone.
  const eyeY=species==='capybara'?1.32:species==='hedgehog'?1.25:1.23,eyeX=species==='capybara'?.21:species==='hedgehog'?.12:.15,eyeZ=species==='capybara'?.36:species==='hedgehog'?.44:.435;
  if(species==='penguin')softPart(palette.face,[0,1.17,.285],[.35,.32,.18],rig);
  if(species==='panda'){
    const left=softPart(palette.mask,[-.17,1.23,.35],[.16,.19,.055],rig),right=softPart(palette.mask,[.17,1.23,.35],[.16,.19,.055],rig);left.rotation.z=-.3;right.rotation.z=.3;
  }
  if(species==='sloth'){
    softPart(palette.face,[0,1.16,.3],[.36,.3,.12],rig);
    const left=softPart(palette.mask,[-.18,1.22,.4],[.17,.065,.03],rig),right=softPart(palette.mask,[.18,1.22,.4],[.17,.065,.03],rig);left.rotation.z=.32;right.rotation.z=-.32;
  }
  if(species==='redPanda'){
    softPart(0xfff4e6,[-.17,1.17,.35],[.15,.12,.05],rig);softPart(0xfff4e6,[.17,1.17,.35],[.15,.12,.05],rig);
    softPart(0xfff4e6,[-.15,1.36,.37],[.06,.04,.02],rig);softPart(0xfff4e6,[.15,1.36,.37],[.06,.04,.02],rig);
    [-.15,.15].forEach(x=>box([.035,.13,.02],[x,1.12,.42],palette.detail,rig));
  }
  if(species==='cat'){
    [-.07,0,.07].forEach((x,index)=>{const stripe=box([.035,.13,.02],[x,1.5,.3],palette.detail,rig);stripe.rotation.x=-.5;stripe.rotation.z=(index-1)*-.25});
  }
  if(species==='otter')softPart(palette.muzzle,[0,1.06,.33],[.3,.16,.1],rig);
  if(species==='hedgehog'){
    softPart(palette.face,[0,1.08,.4],[.17,.13,.17],rig);
  }
  [-eyeX,eyeX].forEach((x,index)=>{
    const eye=softPart(0x2f2928,[x,eyeY,eyeZ],[.066,sleepy?.02:.082,.03],rig,10,false);
    if(sad)eye.rotation.z=index?-.28:.28;
    if(!sleepy){softPart(0xffffff,[x-.022,eyeY+.03,eyeZ+.025],[.022,.026,.012],rig,8,false);softPart(0xffffff,[x+.02,eyeY-.03,eyeZ+.024],[.01,.012,.008],rig,8,false)}
    if(species!=='panda')softPart(0xf3a3a8,[x*1.85,eyeY-.11,eyeZ-.04],[.07,.04,.02],rig,8,false);
  });
  if(species==='capybara'){
    // Blunt, box-like capybara snout instead of the rounded bear muzzle.
    const snout=softPart(palette.muzzle,[0,1.1,.33],[.36,.25,.26],rig);snout.scale.x=.36;
    box([.3,.1,.08],[0,1.22,.5],palette.muzzle,rig);
    box([.05,.03,.02],[-.08,1.22,.545],0x3b2d2b,rig);box([.05,.03,.02],[.08,1.22,.545],0x3b2d2b,rig);
    return box([.12,.02,.02],[0,1.02,.56],0x5a3a2c,rig);
  }
  if(species==='hedgehog'){
    softPart(0x3b2d2b,[0,1.11,.565],[.05,.04,.035],rig,8,false);
    return softPart(moodKey==='sad'?0x58718a:0xc64f55,[0,1.0,.5],[.04,moodKey==='happy'?.04:.02,.015],rig,8,false);
  }
  softPart(palette.muzzle||palette.face,[-.095,1.08,.405],[.15,.12,.065],rig);softPart(palette.muzzle||palette.face,[.095,1.08,.405],[.15,.12,.065],rig);
  softPart(species==='penguin'?0xe8a63d:0x3b2d2b,[0,1.1,.48],[species==='penguin'?.09:.052,species==='penguin'?.055:.045,.035],rig,8);
  if(species==='cat'||species==='otter')addWhiskers(rig,1.08,.44,species==='cat'?0x7a4a35:0xe8d7c0);
  const mouth=softPart(moodKey==='sad'?0x58718a:0xc64f55,[0,moodKey==='sad'?1.015:1.025,.47],[.045,moodKey==='happy'?.055:.025,.018],rig,8);
  if(moodKey==='achievement'){
    [-.15,.15].forEach((x,index)=>{const brow=box([.12,.025,.025],[x,1.33,.45],0x463330,rig);brow.rotation.z=index?-.2:.2});
  }
  return mouth;
}

function addProfessionAccessory(rig,profession){
  if(!profession)return;
  const colorsByRole={office:0x40577a,medical:0xf4f4ee,technology:0x2c8d7a,education:0x73528e,creative:0xe66f68,food:0xf1cf6b,care:0x65a98b,trades:0xe8a82f};
  const accent=colorsByRole[profession]||0x577c8d,cap=new THREE.Group();cap.position.set(0,1.58,0);rig.add(cap);
  const brim=cylinder(.27,.32,.07,12,[.08,0,.13],accent,cap);brim.rotation.z=-.04;
  const crown=softPart(accent,[0,.11,0],[.28,.17,.27],cap);crown.rotation.z=-.04;
  const badge=box([.1,.1,.025],[.12,.13,.26],profession==='medical'?0xd66b6b:0xffe4a8,cap);badge.rotation.z=-.04;
}

function createCharacter(species,moodKey,scale=1,profession=''){
  const palettes={
    cat:{body:0xf0a35e,face:0xffe3bb,muzzle:0xfff0dc,detail:0xc06a38},
    redPanda:{body:0xb9532f,face:0xfff4e6,muzzle:0xfff4e6,detail:0x3d2a26},
    penguin:{body:0x344b5c,face:0xf7f0dc,muzzle:0xf7f0dc,detail:0xe4a33e},
    capybara:{body:0xa87850,face:0xa87850,muzzle:0x9a6b46,detail:0x6f4938},
    sloth:{body:0xa59a86,face:0xeadfc8,muzzle:0xf3ead8,mask:0x4f4540,detail:0x6e6258},
    otter:{body:0x6f4a3a,face:0x8a5f4a,muzzle:0xe2c6a2,detail:0x4a3129},
    panda:{body:0xf5eee1,face:0xfaf6ed,muzzle:0xffffff,mask:0x353432,detail:0x353432},
    hedgehog:{body:0xe9cfa8,face:0xf6e3c6,muzzle:0xf6e3c6,detail:0x8a6446,spike:0x5a3c2b,spikeTip:0x7a5640}
  },palette=palettes[species]||palettes.capybara;
  const actor=new THREE.Group(),rig=new THREE.Group();actor.add(rig);actor.scale.setScalar(scale);
  const bodyScale=species==='capybara'?[.5,.5,.5]:species==='otter'?[.38,.6,.36]:[.43,.57,.39];
  const body=softPart(palette.body,[0,.64,0],bodyScale,rig,12,true),head=softPart(species==='hedgehog'?palette.face:palette.body,[0,1.18,species==='hedgehog'?.06:.02],species==='capybara'?[.44,.42,.48]:species==='hedgehog'?[.4,.38,.36]:[.48,.45,.42],rig,12,true);
  const limbColor=species==='redPanda'||species==='panda'?palette.detail:palette.body;
  const leftArm=softPart(limbColor,[-.42,.67,.03],[.15,.36,.15],rig,12,true),rightArm=softPart(limbColor,[.42,.67,.03],[.15,.36,.15],rig,12,true);
  leftArm.rotation.z=-.18;rightArm.rotation.z=.18;
  const leftFoot=softPart(palette.detail,[-.22,.18,.13],[.2,.14,.25],rig,12,true),rightFoot=softPart(palette.detail,[.22,.18,.13],[.2,.14,.25],rig,12,true);
  if(species==='cat'){addEar(rig,-.27,palette.body,0xf3a8a0);addEar(rig,.27,palette.body,0xf3a8a0)}
  if(species==='redPanda'){addEar(rig,-.3,0xfff4e6,palette.body);addEar(rig,.3,0xfff4e6,palette.body)}
  if(species==='otter'){softPart(palette.body,[-.36,1.3,0],[.09,.09,.07],rig);softPart(palette.body,[.36,1.3,0],[.09,.09,.07],rig);softPart(palette.muzzle,[0,.7,.3],[.27,.38,.1],rig)}
  if(species==='capybara'){softPart(palette.detail,[-.22,1.5,-.16],[.06,.05,.04],rig);softPart(palette.detail,[.22,1.5,-.16],[.06,.05,.04],rig)}
  if(species==='sloth'){
    // Long hanging arms with cream claws.
    [leftArm,rightArm].forEach((arm,index)=>{arm.scale.set(.13,.5,.13);arm.position.y=.55;const side=index?1:-1;[-.05,0,.05].forEach(dx=>{const claw=characterPart(new THREE.ConeGeometry(.025,.14,4),0xf3ead8,[side*.44+dx,.06,.08],[1,1,1],rig);claw.rotation.x=Math.PI})});
  }
  if(species==='panda'){
    addEar(rig,-.31,palette.detail,palette.detail,true);addEar(rig,.31,palette.detail,palette.detail,true);
    softPart(palette.detail,[0,.92,0],[.445,.16,.405],rig);
  }
  if(species==='hedgehog'){
    // Spine cloak over the crown and back; spines lean backwards along it, the cream face stays clear in front.
    softPart(palette.spike,[0,1.17,-.1],[.5,.47,.44],rig,12,true);softPart(palette.spike,[0,.7,-.14],[.45,.52,.38],rig,12,true);
    const up=new THREE.Vector3(0,1,0),n=110;
    for(let i=0;i<n;i++){
      const y=1-2*(i+.5)/n,r=Math.sqrt(1-y*y),a=i*2.39996+(i%2)*.7,dir=new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);
      if(dir.z>.05||dir.y<-.55)continue;
      const onHead=i%2===0,center=onHead?new THREE.Vector3(0,1.17,-.1):new THREE.Vector3(0,.7,-.14),radii=onHead?[.5,.47,.44]:[.45,.52,.38];
      const at=center.clone().add(new THREE.Vector3(dir.x*radii[0],dir.y*radii[1],dir.z*radii[2]).multiplyScalar(.96));
      const lean=dir.clone().add(new THREE.Vector3(0,.12,-.45)).normalize();
      const spike=characterPart(new THREE.ConeGeometry(.075,.36,6),i%3?palette.spike:palette.spikeTip,at.toArray(),[1,1,1],rig,false);spike.quaternion.setFromUnitVectors(up,lean);
    }
    [-1,1].forEach(side=>{softPart(palette.face,[side*.3,1.43,.08],[.1,.1,.06],rig,12,true);softPart(0xf3a8a0,[side*.3,1.43,.13],[.055,.055,.02],rig,8,false)});
  }
  if(species==='penguin'){
    leftArm.scale.set(.13,.43,.13);rightArm.scale.set(.13,.43,.13);leftArm.rotation.z=-.48;rightArm.rotation.z=.48;
    softPart(palette.face,[0,.66,.34],[.29,.39,.08],rig);leftFoot.material=standard(0xe4a33e);rightFoot.material=standard(0xe4a33e);
  }
  let tail=null;
  if(species==='redPanda'){
    tail=new THREE.Group();tail.position.set(.39,.5,-.2);tail.rotation.z=-.72;rig.add(tail);
    [0,.2,.4,.6,.78].forEach((y,index)=>softPart(index%2?0xf3d8b8:palette.body,[0,y,0],[.24,.2,.24],tail,12,true));
  }else if(species==='cat'){
    tail=new THREE.Group();tail.position.set(.3,.36,-.3);rig.add(tail);
    [[0,0,0],[.12,.14,-.04],[.2,.3,-.06],[.22,.48,-.06],[.18,.64,-.04]].forEach(([x,y,z],index)=>softPart(index%2?palette.detail:palette.body,[x,y,z],[.085,.11,.085],tail,12,true));
  }else if(species==='otter'){
    tail=characterPart(new THREE.ConeGeometry(.16,.7,14),palette.body,[0,.24,-.5],[1,1,.6],rig,true);tail.rotation.x=-1.25;
  }
  addFace(rig,palette,moodKey,species);addProfessionAccessory(rig,profession);
  actor.userData={rig,body,head,leftArm,rightArm,leftFoot,rightFoot,tail,moodKey,phase:0,anchor:new THREE.Vector3(),baseRotation:0,motion:'look',baseScale:scale,bodyY:bodyScale[1],tailBaseX:tail?tail.rotation.x:0};
  return actor;
}

async function addAnimal(key,profession,token,animalKey='',layout=fallbackLayout){
  if(token!==openToken)return;
  const [x,z]=worldXZ(...layout.hero),actor=createCharacter(animalKey||moods[key].species,key,.92,profession);actor.name='moodAnimal';actor.position.set(x,.36,z);actor.rotation.y=.62;
  actor.userData.anchor.copy(actor.position);actor.userData.baseRotation=actor.rotation.y;actor.userData.motion='hero';actor.userData.phase=.4;
  island.add(actor);characterActors.push(actor);
  loading.hidden=true;homeLoading.hidden=true;canvas.removeAttribute('aria-busy');homeCanvas.removeAttribute('aria-busy');
}

async function addResidentAnimal(species,residentMood,slot,index,token,spot){
  if(token!==openToken)return;
  const [x,z]=worldXZ(...spot),actor=createCharacter(species,residentMood,slot.scale);actor.name=`residentAnimal-${index+1}`;actor.position.set(x,.36,z);actor.rotation.y=slot.rotation;
  const phase=index*1.37+(hashString(species)%11)*.17;
  actor.userData.anchor.copy(actor.position);actor.userData.baseRotation=slot.rotation;actor.userData.motion=slot.motion;actor.userData.phase=phase;
  island.add(actor);characterActors.push(actor);
}

async function addResidentAnimals(config,key,token){
  const neighbors=(config.neighbors||[]).slice(0,residentSlots.length);
  const residents=neighbors.map((neighbor,index)=>addResidentAnimal(neighbor.species,key,residentSlots[index],index,token,(config.layout||fallbackLayout).slots[index]));
  await Promise.all(residents);
}


function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),time=clock.elapsedTime;
  mixers.forEach(m=>m.update(dt));
  if(island){island.rotation.y=THREE.MathUtils.damp(island.rotation.y,targetTurn,8,dt);island.children.forEach(o=>{if(o.userData.float)o.position.y+=Math.sin(time*2)*.0005})}
  insects.forEach((bug,i)=>{bug.userData.angle+=dt*bug.userData.speed;bug.position.x=Math.cos(bug.userData.angle)*bug.userData.radius;bug.position.z=.05+Math.sin(bug.userData.angle)*bug.userData.radius;bug.position.y=.72+(i%4)*.1+Math.sin(time*3+bug.userData.phase)*.09;bug.rotation.y=-bug.userData.angle;const flap=.18+Math.abs(Math.sin(time*12+bug.userData.phase))*.42;bug.userData.wings[0].rotation.z=flap;bug.userData.wings[1].rotation.z=-flap});
  characterActors.forEach(actor=>{
    const {anchor,baseRotation,motion,phase,rig,body,head,leftArm,rightArm,leftFoot,rightFoot,tail,moodKey}=actor.userData;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,amount=reduced?.18:1,pulse=Math.sin(time*1.8+phase);
    actor.position.set(anchor.x,anchor.y,anchor.z);actor.rotation.y=baseRotation;rig.position.y=0;rig.rotation.set(0,0,0);body.scale.y=actor.userData.bodyY*(1+pulse*.018*amount);head.rotation.set(0,0,0);
    leftArm.rotation.z=-.18;rightArm.rotation.z=.18;leftFoot.rotation.x=0;rightFoot.rotation.x=0;
    if(motion==='wander'){
      const angle=time*.24+phase;actor.position.x=anchor.x+Math.cos(angle)*.14*amount;actor.position.z=anchor.z+Math.sin(angle)*.1*amount;actor.rotation.y=baseRotation+Math.sin(angle)*.32*amount;
      rig.position.y=Math.abs(Math.sin(time*3+phase))*.035*amount;leftFoot.rotation.x=Math.sin(time*3+phase)*.3*amount;rightFoot.rotation.x=-leftFoot.rotation.x;
    }else if(motion==='hero'){
      if(moodKey==='happy'){rig.position.y=Math.abs(Math.sin(time*2.4+phase))*.12*amount;leftArm.rotation.z=-.55;rightArm.rotation.z=.55;head.rotation.z=Math.sin(time*2.4)*.08*amount}
      else if(moodKey==='achievement'){rig.position.y=Math.abs(Math.sin(time*1.8+phase))*.07*amount;leftArm.rotation.z=-.82;rightArm.rotation.z=.82;head.rotation.y=Math.sin(time*.8)*.12*amount}
      else if(moodKey==='calm'){rig.rotation.z=Math.sin(time*.65+phase)*.035*amount;head.rotation.y=Math.sin(time*.48)*.14*amount}
      else if(moodKey==='tired'){rig.rotation.z=-.08;head.rotation.x=.16+Math.sin(time*.7)*.035*amount;leftArm.rotation.z=-.08;rightArm.rotation.z=.08}
      else if(moodKey==='sad'){rig.rotation.x=.08;head.rotation.x=.18;leftArm.rotation.z=.04;rightArm.rotation.z=-.04;rig.position.y=Math.sin(time*.8)*.012*amount}
      else{head.rotation.y=Math.sin(time*.55+phase)*.11*amount;rig.position.y=Math.sin(time*1.4+phase)*.018*amount}
    }else{
      actor.position.y=anchor.y+Math.sin(time*1.25+phase)*.012*amount;actor.rotation.y=baseRotation+Math.sin(time*.55+phase)*.13*amount;head.rotation.y=Math.sin(time*.7+phase)*.1*amount;
    }
    if(tail)tail.rotation.x=actor.userData.tailBaseX+Math.sin(time*2.2+phase)*.16*amount;
  });
  if(lightning){const cycle=time%4.2,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;lightning.intensity=!reduced&&(cycle<.07||(cycle>.18&&cycle<.24))?4:0}
  if(rain){const attr=rain.geometry.attributes.position,a=attr.array,fall=dt*(matchMedia('(prefers-reduced-motion: reduce)').matches?1:5);for(let i=1;i<a.length;i+=6){a[i]-=fall;a[i+3]-=fall;if(a[i+3]<-.3){a[i]=6.8;a[i+3]=6.52}}attr.needsUpdate=true}
  renderer.render(scene,camera);
  if(renderTarget==='home'&&homeHost.offsetParent!==null){
    const rect=homeHost.getBoundingClientRect(),ratio=Math.min(devicePixelRatio,1.7),width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));
    if(homeCanvas.width!==width||homeCanvas.height!==height){homeCanvas.width=width;homeCanvas.height=height}
    homeContext.clearRect(0,0,width,height);homeContext.drawImage(canvas,0,0,width,height);
  }
}

async function open(config,target='modal'){
  thumbnailRun++;
  renderTarget=target;resize();
  const token=++openToken,key=config.moodKey||'neutral',cfg=moods[key]||moods.neutral;
  const loadingTarget=target==='home'?homeLoading:loading;loadingTarget.hidden=false;loadingTarget.textContent=target==='home'?'正在長出今天的小島…':'正在長出真正的 3D 動物島…';
  (target==='home'?homeCanvas:canvas).setAttribute('aria-busy','true');
  const neighbors=(config.neighbors||[]).slice(0,residentSlots.length),shownBugs=Math.min(config.count||0,INSECT_DISPLAY_MAX);
  const animalLabel=animalLabels[config.animalKey]||cfg.animal;
  moodCard.innerHTML=`<strong>${cfg.face} ${animalLabel}</strong><span>${config.mood}${config.professionLabel?` · ${config.professionLabel}帽`:''}${neighbors.length?` · ${neighbors.length} 位鄰居`:''} · ${config.count||0} 隻昆蟲${config.count>shownBugs?`（顯示 ${shownBugs}）`:''}</span>`;
  const layout=config.layout||fallbackLayout;
  clearScene();addLights(key);targetTurn=0;const nature=buildIsland(key,config.count||0,config.professionKey||'',layout);
  addSky(key);
  if(config.empty){addEgg(layout);await nature;loadingTarget.hidden=true;homeCanvas.removeAttribute('aria-busy')}else await Promise.all([nature,addAnimal(key,config.professionKey||'',token,config.animalKey||'',layout),addResidentAnimals(config,key,token)]);resize();
}

function preview(config){
  const changed=!homeConfig||['moodKey','animalKey','count','key','residentSignature','professionKey','empty'].some(field=>homeConfig[field]!==config[field]);
  homeConfig=config;if(!dialog.open&&(renderTarget!=='home'||changed))open(config,'home');
}

function thumbnailSignature(config){return [config.key,config.moodKey,config.animalKey,config.count,config.professionKey,config.residentSignature].join(':')}

function paintCachedThumbnail(target,source){
  return new Promise(resolve=>{const image=new Image();image.onload=()=>{target.width=560;target.height=360;target.getContext('2d').drawImage(image,0,0,target.width,target.height);target.closest('.puzzle-island')?.classList.add('thumbnail-ready');resolve()};image.onerror=resolve;image.src=source})
}

async function renderThumbnails(configs){
  const run=++thumbnailRun;
  for(const config of configs){
    if(run!==thumbnailRun||dialog.open)return;
    const target=document.querySelector(`.puzzle-canvas[data-island-key="${config.key}"]`);if(!target)continue;
    const signature=thumbnailSignature(config),cached=thumbnailCache.get(signature);if(cached){await paintCachedThumbnail(target,cached);continue}
    renderTarget='thumbnail';
    const token=++openToken,key=config.moodKey||'neutral';
    clearScene();addLights(key);targetTurn=.18;const nature=buildIsland(key,config.count||0,config.professionKey||'',config.layout||fallbackLayout);
    await Promise.all([nature,addAnimal(key,config.professionKey||'',token,config.animalKey||'',config.layout||fallbackLayout),addResidentAnimals(config,key,token)]);
    if(run!==thumbnailRun||token!==openToken||dialog.open)return;
    island.rotation.y=.18;camera.position.set(0,9.2,4.25);camera.lookAt(0,.12,0);
    const width=560,height=360,view=4.05,aspect=width/height;camera.left=-view*aspect;camera.right=view*aspect;camera.top=view;camera.bottom=-view;camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);renderer.render(scene,camera);
    target.width=width;target.height=height;const context=target.getContext('2d');context.clearRect(0,0,width,height);context.drawImage(canvas,0,0,width,height);target.closest('.puzzle-island')?.classList.add('thumbnail-ready');
    try{thumbnailCache.set(signature,target.toDataURL('image/webp',.82))}catch{}
  }
  if(run===thumbnailRun&&!dialog.open){camera.position.set(7.2,6.3,7.2);camera.lookAt(0,.25,0);const restore=homeConfig||window.currentHomeIsland3d;if(restore)await open(restore,'home');else resize()}
}

function cancelThumbnails(){thumbnailRun++;if(!dialog.open){const restore=homeConfig||window.currentHomeIsland3d;if(restore)open(restore,'home')}}

function setTurn(degrees){targetTurn=THREE.MathUtils.degToRad(degrees)}
window.realIsland3d={open:(config)=>open(config,'modal'),preview,setTurn,renderThumbnails,cancelThumbnails};
if(window.pendingIsland3d){open(window.pendingIsland3d);window.pendingIsland3d=null}
if(window.pendingHomeIsland3d){preview(window.pendingHomeIsland3d);window.pendingHomeIsland3d=null}
if(window.pendingIslandThumbnails){renderThumbnails(window.pendingIslandThumbnails);window.pendingIslandThumbnails=null}
dialog.addEventListener('close',()=>{if(homeConfig||window.currentHomeIsland3d)preview(homeConfig||window.currentHomeIsland3d)});
resize();animate();
