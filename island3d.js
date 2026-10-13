import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

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
const standard = color => new THREE.MeshStandardMaterial({color,roughness:.85,metalness:0,flatShading:true});
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
function cylinder(top,bottom,height,segments,position,color,parent=island){return mesh(new THREE.CylinderGeometry(top,bottom,height,segments),standard(color),position,parent)}
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
  const body=mesh(geometry,[topMaterial,sideMaterial],[0,0,0]);body.rotation.y=.08;return body;
}

function buildIsland(key,count,profession){
  const mood=moods[key]; island=new THREE.Group(); island.rotation.y=targetTurn; scene.add(island);
  const waterMat=new THREE.MeshStandardMaterial({color:mood.water,roughness:.22,metalness:.04,transparent:true,opacity:.86,flatShading:true});
  const water=mesh(new THREE.CylinderGeometry(3.75,3.75,.1,48),waterMat,[0,-.73,0]);water.receiveShadow=true;
  const islandRadii=[2.88,3.03,2.78,3.08,2.84,3.02,2.76,2.98,3.1,2.82,3,2.79];
  islandBody(islandRadii,.34,-.58,standard(mood.ground),standard(colors.soil));

  const clearingMat=standard(0xc7e9a0);clearingMat.color.lerp(new THREE.Color(mood.ground),.58);
  const clearing=mesh(new THREE.CircleGeometry(.8,20),clearingMat,[1.36,.355,-.34]);clearing.rotation.x=-Math.PI/2;

  const hill=mesh(new THREE.CylinderGeometry(.68,1.02,.62,10),standard(0x789b69),[-1.55,.65,-.72]);hill.scale.z=.82;hill.rotation.y=.14;
  const hillTop=cylinder(.68,.72,.07,10,[-1.55,.995,-.72],0x92bf79);hillTop.scale.z=.82;hillTop.rotation.y=.14;

  const riverbedMat=standard(0x78936f);riverbedMat.side=THREE.DoubleSide;
  const streamMat=waterMat.clone();streamMat.side=THREE.DoubleSide;streamMat.opacity=.94;
  const springBank=mesh(new THREE.CircleGeometry(.28,18),riverbedMat,[-1.28,1.04,-.63]);springBank.rotation.x=-Math.PI/2;
  const spring=mesh(new THREE.CircleGeometry(.22,18),streamMat,[-1.28,1.06,-.63]);spring.rotation.x=-Math.PI/2;spring.castShadow=false;
  const upperCreek=[[-1.22,1.05,-.58],[-1.12,1.04,-.46],[-1.04,1.025,-.34]];
  ribbon(upperCreek,[.1,.105,.11],riverbedMat,-.015);ribbon(upperCreek,[.065,.07,.075],streamMat,.008);
  const hillFall=mesh(new THREE.PlaneGeometry(.17,.5),streamMat,[-1,.75,-.29]);hillFall.rotation.y=.78;hillFall.castShadow=false;

  const landingCreek=[[-.98,.39,-.18],[-.9,.38,-.04],[-.84,.375,.08]];
  ribbon(landingCreek,[.11,.12,.13],riverbedMat,-.018);ribbon(landingCreek,[.075,.085,.095],streamMat,.01);
  const pondBank=mesh(new THREE.CircleGeometry(.54,22),riverbedMat,[-.82,.352,.22]);pondBank.rotation.x=-Math.PI/2;
  const pond=mesh(new THREE.CircleGeometry(.46,22),streamMat,[-.82,.374,.22]);pond.rotation.x=-Math.PI/2;pond.castShadow=false;
  const creek=[[-.8,.374,.55],[-.79,.372,.78],[-.78,.37,1.02],[-.76,.365,1.32],[-.73,.355,1.68],[-.7,.32,2.1],[-.67,.27,2.55]];
  const creekWidths=[.145,.14,.135,.125,.115,.1,.085];
  ribbon(creek,creekWidths.map(width=>width+.055),riverbedMat,-.018);ribbon(creek,creekWidths,streamMat,.01);
  const waterfall=mesh(new THREE.PlaneGeometry(.19,.74),streamMat,[-.67,-.1,2.68]);waterfall.rotation.y=.08;waterfall.castShadow=false;

  const pathMat=standard(0xc9a56d);pathMat.side=THREE.DoubleSide;
  const entryPath=[[1.78,.365,1.62],[1.52,.37,1.22],[1.42,.37,.72],[1.36,.37,.25],[1.15,.37,-.05],[.72,.37,.18],[.3,.37,.58],[-.24,.37,.96]];
  ribbon(entryPath,[.16,.17,.18,.18,.17,.16,.15,.14],pathMat,.006);
  const hillPath=[[-1.3,.37,.96],[-1.38,.37,.65],[-1.42,.375,.36]];
  ribbon(hillPath,[.14,.15,.14],pathMat,.006);

  const bridge=new THREE.Group();bridge.position.set(-.78,.455,1);island.add(bridge);
  for(let i=-2;i<=2;i++)box([.84,.07,.12],[0,0,i*.12],i%2?colors.wood:0xb77b4b,bridge);
  box([.9,.05,.05],[0,.04,-.28],colors.trunk,bridge);box([.9,.05,.05],[0,.04,.28],colors.trunk,bridge);
  [[-.46,-.025,-.25],[-.46,-.025,.25],[.46,-.025,-.25],[.46,-.025,.25]].forEach(position=>cylinder(.075,.095,.14,6,position,colors.stoneSide,bridge));

  const stairPath=[[-1.43,.42,.28],[-1.47,.54,.08],[-1.51,.66,-.12],[-1.55,.78,-.32],[-1.58,.9,-.52]];
  stairPath.forEach(([x,y,z],index)=>{const step=box([.38,.085,.26],[x,y,z],index%2?0xc8b994:0xd3c39e);step.rotation.y=.16});

  const lookout=new THREE.Group();lookout.position.set(-1.65,1.08,-.82);island.add(lookout);
  cylinder(.4,.45,.105,8,[0,0,0],colors.stone,lookout);
  [[-.3,.2,-.27],[.3,.2,-.27]].forEach(pos=>box([.065,.36,.065],pos,colors.trunk,lookout));
  box([.66,.06,.06],[0,.38,-.27],colors.wood,lookout);
  if(key==='achievement'){
    cylinder(.025,.025,.62,6,[.22,.36,-.05],colors.trunk,lookout);
    const flag=mesh(new THREE.BoxGeometry(.34,.2,.02),standard(0xf1bf5b),[.4,.56,-.05],lookout);flag.userData.flag=true;
  }
  addProfessionMarker(profession,key);
  addInsects(count,key);
  if(key==='sad')addRain();
  if(key==='tired'||key==='sad')scene.fog=new THREE.FogExp2(key==='sad'?0x526172:0x9aa9ae,key==='sad' ? .045 : .04);
}

function addProfessionMarker(profession,key){
  if(!profession)return;
  const palette={office:0x40577a,medical:0xf3f5ef,technology:0x3e8a7b,education:0x8c69a9,creative:0xf08a77,food:0xe5a94e,care:0x68a890,trades:0xe9a63b};
  const marker=new THREE.Group();marker.name='professionMarker';marker.position.set(1.95,.34,-.75);marker.rotation.y=-.42;island.add(marker);
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
    mesh(new THREE.BoxGeometry(.13,.1,.22),standard(palette.body),[0,0,0],bug);
    mesh(new THREE.BoxGeometry(.11,.09,.1),standard(palette.head),[0,.01,.15],bug);
    const wingMat=new THREE.MeshStandardMaterial({color:palette.wing,roughness:.7,transparent:true,opacity:kind===1?.72:.95});
    const w1=mesh(new THREE.BoxGeometry(...wingSize),wingMat,[-(wingSize[0]/2+.05),.055,-.01],bug),w2=mesh(new THREE.BoxGeometry(...wingSize),wingMat,[wingSize[0]/2+.05,.055,-.01],bug);
    if(kind===3){mesh(new THREE.BoxGeometry(.03,.14,.03),standard(0x5f9a3c),[-.08,-.02,-.1],bug).rotation.x=.9;mesh(new THREE.BoxGeometry(.03,.14,.03),standard(0x5f9a3c),[.08,-.02,-.1],bug).rotation.x=.9}
    if(kind===1){mesh(new THREE.BoxGeometry(.14,.105,.035),standard(0x3d342f),[0,0,-.04],bug);mesh(new THREE.BoxGeometry(.14,.105,.035),standard(0x3d342f),[0,0,.045],bug)}
    if(kind===0){mesh(new THREE.BoxGeometry(.035,.025,.035),standard(0x342d2b),[-.035,.065,-.045],bug);mesh(new THREE.BoxGeometry(.035,.025,.035),standard(0x342d2b),[.035,.065,.035],bug)}
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

function addEgg(){
  const egg=mesh(new THREE.SphereGeometry(.34,18,14),standard(0xf0b16e),[1.36,.72,-.34]);
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
  const g=new THREE.Group();[[0,0,0,.45],[.38,.02,0,.32],[-.38,.01,.04,.3],[.05,.2,.02,.34]].forEach(([px,py,pz,s])=>mesh(new THREE.SphereGeometry(s,10,7),standard(shade),[px,py,pz],g));g.position.set(x,y,z);scene.add(g);return g;
}

async function addProp(file,position,height,rotation=0){
  try{
    const gltf=await loader.loadAsync(`./assets/3d/${file}`),object=gltf.scene;object.userData.asset=true;object.traverse(o=>{o.userData.asset=true;if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
    const box3=new THREE.Box3().setFromObject(object),size=box3.getSize(new THREE.Vector3()),center=box3.getCenter(new THREE.Vector3()),scale=height/Math.max(size.y,.001);
    object.scale.setScalar(scale);object.position.set(position[0]-center.x*scale,position[1]-box3.min.y*scale,position[2]-center.z*scale);object.rotation.y=rotation;island.add(object);return object;
  }catch(error){console.warn('3D prop failed',file,error)}
}

function characterPart(geometry,color,position,scale,parent){
  const part=mesh(geometry,standard(color),position,parent);part.scale.set(...scale);return part;
}

function softPart(color,position,scale,parent,segments=12){
  return characterPart(new THREE.SphereGeometry(1,segments,8),color,position,scale,parent);
}

function addEar(parent,x,color,inner,round=false){
  if(round){softPart(color,[x,1.45,.01],[.17,.17,.11],parent);softPart(inner,[x,1.46,.1],[.09,.09,.035],parent);return}
  const ear=characterPart(new THREE.ConeGeometry(.19,.38,5),color,[x,1.48,.02],[1,1,1],parent);ear.rotation.z=x<0?.15:-.15;
  const inset=characterPart(new THREE.ConeGeometry(.1,.22,5),inner,[x,1.48,.12],[1,1,1],parent);inset.rotation.z=ear.rotation.z;
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
    const snout=characterPart(new THREE.ConeGeometry(.17,.34,10),palette.face,[0,1.1,.48],[1,1,1],rig);snout.rotation.x=Math.PI/2;
    softPart(palette.face,[0,1.2,.32],[.3,.27,.12],rig);
  }
  [-eyeX,eyeX].forEach((x,index)=>{
    const eye=softPart(0x2f2928,[x,eyeY,eyeZ],[.052,sleepy?.022:.065,.026],rig,10);
    if(sad)eye.rotation.z=index?-.28:.28;
    if(!sleepy)softPart(0xffffff,[x-.016,eyeY+.025,eyeZ+.02],[.014,.018,.01],rig,8);
  });
  if(species==='capybara'){
    // Blunt, box-like capybara snout instead of the rounded bear muzzle.
    const snout=softPart(palette.muzzle,[0,1.1,.33],[.36,.25,.26],rig);snout.scale.x=.36;
    box([.3,.1,.08],[0,1.22,.5],palette.muzzle,rig);
    box([.05,.03,.02],[-.08,1.22,.545],0x3b2d2b,rig);box([.05,.03,.02],[.08,1.22,.545],0x3b2d2b,rig);
    return box([.12,.02,.02],[0,1.02,.56],0x5a3a2c,rig);
  }
  if(species==='hedgehog'){
    softPart(0x2f2928,[0,1.1,.66],[.055,.05,.05],rig,8);
    return softPart(moodKey==='sad'?0x58718a:0xc64f55,[0,1.01,.5],[.04,moodKey==='happy'?.04:.02,.015],rig,8);
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
    hedgehog:{body:0xe3c39b,face:0xf2dcbd,muzzle:0xf2dcbd,detail:0x7a5640,spike:0x4e3426,spikeTip:0x7d5a40}
  },palette=palettes[species]||palettes.capybara;
  const actor=new THREE.Group(),rig=new THREE.Group();actor.add(rig);actor.scale.setScalar(scale);
  const bodyScale=species==='capybara'?[.5,.5,.5]:species==='otter'?[.38,.6,.36]:[.43,.57,.39];
  const body=softPart(palette.body,[0,.64,0],bodyScale,rig),head=softPart(palette.body,[0,1.18,.02],species==='capybara'?[.42,.4,.46]:[.45,.42,.4],rig);
  const limbColor=species==='redPanda'||species==='panda'?palette.detail:palette.body;
  const leftArm=softPart(limbColor,[-.42,.67,.03],[.15,.36,.15],rig),rightArm=softPart(limbColor,[.42,.67,.03],[.15,.36,.15],rig);
  leftArm.rotation.z=-.18;rightArm.rotation.z=.18;
  const leftFoot=softPart(palette.detail,[-.22,.18,.13],[.2,.14,.25],rig),rightFoot=softPart(palette.detail,[.22,.18,.13],[.2,.14,.25],rig);
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
    // Spines cover the crown and back, so the silhouette reads as a hedgehog from every side.
    const up=new THREE.Vector3(0,1,0),center=new THREE.Vector3(0,.95,-.06);let index=0;
    for(let ring=0;ring<4;ring++){
      const elevation=-.35+ring*.42,count=[14,15,13,7][ring];
      for(let i=0;i<count;i++){
        const azimuth=(i/count)*Math.PI*2+ring*.3,dir=new THREE.Vector3(Math.sin(azimuth)*Math.cos(elevation),Math.sin(elevation),Math.cos(azimuth)*Math.cos(elevation));
        if(dir.z>.3&&dir.y<.42)continue;
        const spike=characterPart(new THREE.ConeGeometry(.09,.4,5),index++%3?palette.spike:palette.spikeTip,center.clone().addScaledVector(dir,.52).toArray(),[1,1,1],rig);
        spike.quaternion.setFromUnitVectors(up,dir.normalize());
      }
    }
  }
  if(species==='penguin'){
    leftArm.scale.set(.13,.43,.13);rightArm.scale.set(.13,.43,.13);leftArm.rotation.z=-.48;rightArm.rotation.z=.48;
    softPart(palette.face,[0,.66,.34],[.29,.39,.08],rig);leftFoot.material=standard(0xe4a33e);rightFoot.material=standard(0xe4a33e);
  }
  let tail=null;
  if(species==='redPanda'){
    tail=new THREE.Group();tail.position.set(.39,.5,-.2);tail.rotation.z=-.72;rig.add(tail);
    [0,.2,.4,.6,.78].forEach((y,index)=>softPart(index%2?0xf3d8b8:palette.body,[0,y,0],[.24,.2,.24],tail));
  }else if(species==='cat'){
    tail=new THREE.Group();tail.position.set(.3,.36,-.3);rig.add(tail);
    [[0,0,0],[.12,.14,-.04],[.2,.3,-.06],[.22,.48,-.06],[.18,.64,-.04]].forEach(([x,y,z],index)=>softPart(index%2?palette.detail:palette.body,[x,y,z],[.085,.11,.085],tail));
  }else if(species==='otter'){
    tail=characterPart(new THREE.ConeGeometry(.16,.7,8),palette.body,[0,.24,-.5],[1,1,.6],rig);tail.rotation.x=-1.25;
  }
  addFace(rig,palette,moodKey,species);addProfessionAccessory(rig,profession);
  actor.userData={rig,body,head,leftArm,rightArm,leftFoot,rightFoot,tail,moodKey,phase:0,anchor:new THREE.Vector3(),baseRotation:0,motion:'look',baseScale:scale,bodyY:bodyScale[1],tailBaseX:tail?tail.rotation.x:0};
  return actor;
}

async function addAnimal(key,profession,token,animalKey=''){
  if(token!==openToken)return;
  const actor=createCharacter(animalKey||moods[key].species,key,1.04,profession);actor.name='moodAnimal';actor.position.set(1.34,.36,-.28);actor.rotation.y=.62;
  actor.userData.anchor.copy(actor.position);actor.userData.baseRotation=actor.rotation.y;actor.userData.motion='hero';actor.userData.phase=.4;
  island.add(actor);characterActors.push(actor);
  loading.hidden=true;homeLoading.hidden=true;canvas.removeAttribute('aria-busy');homeCanvas.removeAttribute('aria-busy');
}

async function addResidentAnimal(species,residentMood,slot,index,token){
  if(token!==openToken)return;
  const actor=createCharacter(species,residentMood,slot.scale);actor.name=`residentAnimal-${index+1}`;actor.position.set(...slot.position);actor.rotation.y=slot.rotation;
  const phase=index*1.37+(hashString(species)%11)*.17;
  actor.userData.anchor.copy(actor.position);actor.userData.baseRotation=slot.rotation;actor.userData.motion=slot.motion;actor.userData.phase=phase;
  island.add(actor);characterActors.push(actor);
}

async function addResidentAnimals(config,key,token){
  const neighbors=(config.neighbors||[]).slice(0,residentSlots.length);
  const residents=neighbors.map((neighbor,index)=>addResidentAnimal(neighbor.species,key,residentSlots[index],index,token));
  await Promise.all(residents);
}

async function populateNature(token){
  await Promise.all([
    addProp('TreeHigh001.glb',[2.25,.34,-1.4],1.2,.45),
    addProp('TreeLow001.glb',[-2.3,.34,-1.15],.9,-.35),
    addProp('TreeLow001.glb',[2.25,.34,.75],.7,.6),
    addProp('Rock001.glb',[2.25,.34,-.05],.3,.25),
    addProp('Rock001.glb',[-2.25,.34,1.3],.26,-.1),
    addProp('Bush001.glb',[-2.15,.34,-1.45],.42,-.2),
    addProp('Bush001.glb',[-2.48,.34,-1.5],.34,.35)
  ]);if(token!==openToken)return;
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
  clearScene();addLights(key);targetTurn=0;buildIsland(key,config.count||0,config.professionKey||'');
  addSky(key);
  if(config.empty){addEgg();await populateNature(token);loadingTarget.hidden=true;homeCanvas.removeAttribute('aria-busy')}else await Promise.all([populateNature(token),addAnimal(key,config.professionKey||'',token,config.animalKey||''),addResidentAnimals(config,key,token)]);resize();
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
    clearScene();addLights(key);targetTurn=.18;buildIsland(key,config.count||0,config.professionKey||'');
    await Promise.all([populateNature(token),addAnimal(key,config.professionKey||'',token,config.animalKey||''),addResidentAnimals(config,key,token)]);
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
