import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const canvas = document.querySelector('#island3dCanvas');
const loading = document.querySelector('#island3dLoading');
const moodCard = document.querySelector('#islandMoodCard');
const host = document.querySelector('#island3dScene');
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
let island = null, mixers = [], insects = [], rain = null, targetTurn = 0, openToken = 0;

const moods = {
  happy:{model:'Corgi.glb',animal:'柯基',face:'≧▽≦',clip:'walk',speed:1.25,sky:0xffe8a2,ground:0x9edb78,water:0x62d5e4},
  achievement:{model:'Owl.glb',animal:'貓頭鷹',face:'•̀ᴗ•́ و',clip:'attack',speed:.9,sky:0xffc96f,ground:0x91ca72,water:0x58c9dd},
  calm:{model:'Duck.glb',animal:'小鴨',face:'－‿－',clip:'idle',speed:.65,sky:0xc8e8e1,ground:0x9fcdb0,water:0x72cdd5},
  neutral:{model:'Hippo.glb',animal:'河馬',face:'・ᴗ・',clip:'idle',speed:.9,sky:0xd8e7df,ground:0xadd09b,water:0x80c7d4},
  tired:{model:'Marmot.glb',animal:'土撥鼠',face:'－_－ zZ',clip:'idle',speed:.35,sky:0x9dabb8,ground:0x879f98,water:0x6e9fb2},
  sad:{model:'Seal.glb',animal:'小海豹',face:'╥﹏╥',clip:'idle',speed:.5,sky:0x47586b,ground:0x718881,water:0x527d9c}
};

const colors = {soil:0xa56f50,soilDark:0x755145,stone:0xf0d7a2,stoneSide:0xc59672,wood:0xa56d43,trunk:0x76513c};
const standard = color => new THREE.MeshStandardMaterial({color,roughness:.85,metalness:0,flatShading:true});
const mesh = (geometry, material, position, parent=island) => { const value=new THREE.Mesh(geometry,material); value.position.set(...position); value.castShadow=true; value.receiveShadow=true; parent.add(value); return value; };

function resize(){
  const rect=host.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  renderer.setSize(rect.width,rect.height,false);
  const aspect=rect.width/rect.height,view=3.5;
  camera.left=-view*aspect;camera.right=view*aspect;camera.top=view;camera.bottom=-view;camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);

function clearScene(){
  mixers=[];insects=[];rain=null;
  if(island){scene.remove(island);island.traverse(o=>{if(o.geometry&&!o.userData.asset)o.geometry.dispose();if(o.material&&!o.userData.asset){const list=Array.isArray(o.material)?o.material:[o.material];list.forEach(m=>m.dispose())}})}
  scene.fog=null;
  while(scene.children.length)scene.remove(scene.children[0]);
}

function addLights(key){
  const hemi=new THREE.HemisphereLight(moods[key].sky,key==='sad'?0x303a45:0xf4dfb6,key==='sad'?1.35:2.1);scene.add(hemi);
  const sun=new THREE.DirectionalLight(key==='sad'?0xaac8e6:0xfff0cf,key==='sad'?2.1:3.4);sun.position.set(5,9,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;scene.add(sun);
  const fill=new THREE.DirectionalLight(key==='achievement'?0xffad66:0x8fd9ff,.9);fill.position.set(-5,3,-4);scene.add(fill);
}

function box(size,position,color,parent=island){return mesh(new THREE.BoxGeometry(...size),standard(color),position,parent)}

function buildIsland(key,count,profession){
  const mood=moods[key]; island=new THREE.Group(); island.rotation.y=targetTurn; scene.add(island);
  box([5.25,.72,5.25],[0,-.35,0],colors.soil);
  box([5.12,.18,5.12],[0,.1,0],mood.ground);
  for(let layer=0;layer<3;layer++){
    const hill=mesh(new THREE.CylinderGeometry(1.08-layer*.15,1.18-layer*.12,.36,8),standard(layer?mood.ground:0x6f8d65),[-1.55,.35+layer*.31,-1.45]);hill.rotation.y=.22;
  }
  const riverMat=new THREE.MeshStandardMaterial({color:mood.water,roughness:.25,metalness:.05,transparent:true,opacity:.9});
  const river=mesh(new THREE.PlaneGeometry(.7,4.9),riverMat,[.45,.205,.05]);river.rotation.x=-Math.PI/2;river.rotation.z=.06;
  const pond=mesh(new THREE.CircleGeometry(1.05,32),riverMat,[1.18,.22,1.55]);pond.rotation.x=-Math.PI/2;
  const waterfall=mesh(new THREE.PlaneGeometry(.72,.8),riverMat,[.62,-.22,2.63]);
  for(let i=0;i<6;i++){const step=box([.82,.16,.52],[-1.75+i*.2,.26+i*.17,.95-i*.32],colors.stone);step.rotation.y=-.08}
  for(let i=0;i<5;i++){const plank=box([.95,.12,.22],[.45,.42,-.58+i*.24],colors.wood);plank.rotation.y=.03}
  const arch=new THREE.Group();arch.position.set(1.58,.25,-1.26);island.add(arch);box([.3,1.25,.35],[-.58,.62,0],colors.stone,arch);box([.3,1.25,.35],[.58,.62,0],colors.stone,arch);box([1.45,.28,.35],[0,1.22,0],colors.stone,arch);
  const lookout=new THREE.Group();lookout.position.set(-1.55,1.35,-1.45);island.add(lookout);box([1.35,.22,1.35],[0,0,0],colors.stone,lookout);box([.18,.75,.18],[-.5,.45,-.5],colors.stoneSide,lookout);box([.18,.75,.18],[.5,.45,-.5],colors.stoneSide,lookout);
  addProfessionMarker(profession,key);
  addInsects(count,key);
  if(key==='sad')addRain();
  if(key==='tired'||key==='sad')scene.fog=new THREE.FogExp2(key==='sad'?0x526172:0x9aa9ae,key==='sad' ? .085 : .055);
}

function addProfessionMarker(profession,key){
  if(!profession)return;
  const palette={office:0x40577a,medical:0xf3f5ef,technology:0x3e8a7b,education:0x8c69a9,creative:0xf08a77,food:0xe5a94e,care:0x68a890,trades:0xe9a63b};
  const marker=new THREE.Group();marker.name='professionMarker';marker.position.set(0,.3,0);island.add(marker);
  const pole=box([.08,1.35,.08],[-2.18,.75,-2.15],0x68504a,marker);
  const flag=box([.78,.48,.06],[-1.82,1.18,-2.15],palette[profession]||0x6b86a8,marker);flag.userData.float=true;
}

function addInsects(count,key){
  const shown=Math.min(count,60);
  for(let i=0;i<shown;i++){
    const bug=new THREE.Group(),body=mesh(new THREE.SphereGeometry(.075,8,6),standard(i%2?0xf3bd3d:0xd95757),[0,0,0],bug);
    const wingMat=new THREE.MeshStandardMaterial({color:0xf8f2dc,transparent:true,opacity:.75,side:THREE.DoubleSide});
    const w1=mesh(new THREE.CircleGeometry(.075,8),wingMat,[-.075,.035,0],bug),w2=mesh(new THREE.CircleGeometry(.075,8),wingMat,[.075,.035,0],bug);w1.rotation.y=w2.rotation.y=Math.PI/2;
    const angle=(i/shown)*Math.PI*2+(key.charCodeAt(key.length-1)%8)*.16,radius=1.65+(i%3)*.28;
    bug.position.set(Math.cos(angle)*radius,.82+(i%4)*.12,Math.sin(angle)*radius);bug.userData={angle,radius,speed:.35+(i%5)*.05,phase:i*.8};island.add(bug);insects.push(bug);
  }
}

function addRain(){
  const points=260,positions=new Float32Array(points*3);
  for(let i=0;i<points;i++){positions[i*3]=(Math.random()-.5)*9;positions[i*3+1]=Math.random()*7;positions[i*3+2]=(Math.random()-.5)*9}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  rain=new THREE.Points(geo,new THREE.PointsMaterial({color:0xc9e6ff,size:.055,transparent:true,opacity:.75}));scene.add(rain);
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

async function addAnimal(key,profession,token){
  const cfg=moods[key];
  try{
    const gltf=await loader.loadAsync(`./assets/3d/${cfg.model}`);if(token!==openToken)return;
    const model=gltf.scene;model.userData.asset=true;model.traverse(o=>{o.userData.asset=true;if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
    const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),scale=1.55/Math.max(size.y,.001);
    const actor=new THREE.Group();actor.name='moodAnimal';actor.position.set(0,.28,.15);actor.scale.setScalar(scale);model.position.set(-center.x,-bounds.min.y,-center.z);actor.add(model);island.add(actor);
    if(key==='tired'){actor.rotation.z=-.12;actor.scale.y*=.9}if(key==='sad'){actor.rotation.x=.12;actor.scale.y*=.92}
    if(gltf.animations.length){const ranges={idle:[0,30],attack:[30,60],dead:[60,90],walk:[90,120]},range=ranges[cfg.clip],clip=THREE.AnimationUtils.subclip(gltf.animations[0],cfg.clip,range[0],range[1],24),mixer=new THREE.AnimationMixer(model),action=mixer.clipAction(clip);action.timeScale=cfg.speed;action.play();mixers.push(mixer)}
    addAnimalHat(actor,profession,size.y/Math.max(size.y,.001));
  }catch(error){loading.textContent='3D 動物載入失敗，請重新開啟';console.error(error);return}
  loading.hidden=true;canvas.removeAttribute('aria-busy');
}

function addAnimalHat(actor,profession){
  if(!profession)return;
  const colorsByRole={office:0x40577a,medical:0xf4f4ee,technology:0x2c8d7a,education:0x73528e,creative:0xe66f68,food:0xf1cf6b,care:0x65a98b,trades:0xe8a82f};
  const hat=new THREE.Group();hat.position.set(0,1.57,0);actor.add(hat);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(.3,.36,.09,12),standard(colorsByRole[profession]||0x577c8d));brim.rotation.x=0;hat.add(brim);
  const crown=new THREE.Mesh(new THREE.CylinderGeometry(.23,.29,.28,10),standard(colorsByRole[profession]||0x577c8d));crown.position.y=.16;hat.add(crown);
}

async function populateNature(token){
  await Promise.all([
    addProp('Mountain001.glb',[-1.8,.25,-1.75],1.4,.2),
    addProp('Mountain001.glb',[2,.25,-1.9],.9,-.4),
    addProp('TreeHigh001.glb',[-2.05,.2,.15],1.45,.5),
    addProp('TreeLow001.glb',[2.05,.2,.45],1.05,-.5),
    addProp('Rock001.glb',[-1.9,.2,1.8],.55,.3),
    addProp('Bush001.glb',[1.85,.2,1.9],.48,-.2)
  ]);if(token!==openToken)return;
}

function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),time=clock.elapsedTime;
  mixers.forEach(m=>m.update(dt));
  if(island){island.rotation.y=THREE.MathUtils.damp(island.rotation.y,targetTurn,8,dt);island.children.forEach(o=>{if(o.userData.float)o.position.y+=Math.sin(time*2)*.0005})}
  insects.forEach((bug,i)=>{bug.userData.angle+=dt*bug.userData.speed;bug.position.x=Math.cos(bug.userData.angle)*bug.userData.radius;bug.position.z=Math.sin(bug.userData.angle)*bug.userData.radius;bug.position.y=.82+(i%4)*.12+Math.sin(time*3+bug.userData.phase)*.09;bug.rotation.y=-bug.userData.angle});
  if(rain){const attr=rain.geometry.attributes.position;for(let i=1;i<attr.array.length;i+=3){attr.array[i]-=dt*5;if(attr.array[i]<-.3)attr.array[i]=6.5}attr.needsUpdate=true}
  renderer.render(scene,camera);
}

async function open(config){
  const token=++openToken,key=config.moodKey||'neutral',cfg=moods[key]||moods.neutral;
  loading.hidden=false;loading.textContent='正在長出真正的 3D 動物島…';canvas.setAttribute('aria-busy','true');
  moodCard.innerHTML=`<strong>${cfg.face} ${cfg.animal}</strong><span>${config.mood}${config.professionLabel?` · ${config.professionLabel}帽`:''}</span>`;
  clearScene();addLights(key);targetTurn=0;buildIsland(key,config.count||0,config.professionKey||'');
  if(key!=='sad'){addCloud(-3.4,3.5,-1.5,key==='tired'?0xb8c1c5:0xffffff);addCloud(3.2,2.8,-2,key==='tired'?0xaeb8bd:0xffffff)}
  await Promise.all([populateNature(token),addAnimal(key,config.professionKey||'',token)]);resize();
}

function setTurn(degrees){targetTurn=THREE.MathUtils.degToRad(degrees)}
window.realIsland3d={open,setTurn};
if(window.pendingIsland3d){open(window.pendingIsland3d);window.pendingIsland3d=null}
resize();animate();
