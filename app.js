const STORAGE_KEY='lastnote.v1';
const typeDefs={
  '喜歡':{color:'#ef929b',icon:'💗'},'工作':{color:'#8bbbc7',icon:'💼'},'興趣':{color:'#aa94cb',icon:'🎨'},
  '照顧':{color:'#88bd91',icon:'🌱'},'家務':{color:'#e7bd66',icon:'🧺'},'休息':{color:'#8eaed6',icon:'☕'},'不開心':{color:'#9a91a8',icon:'🌧️'}
};
const counterIcons={
  done:'<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m12 3 1.15 3.85L17 8l-3.85 1.15L12 13l-1.15-3.85L7 8l3.85-1.15L12 3Z"/><path d="m18.5 13 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z"/></svg>',
  love:'<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 0 0-7.1 7.1L12 21l8.4-8.3a5 5 0 0 0 0-7.1Z"/></svg>',
  work:'<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></svg>',
  hobby:'<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0 0 18h1.4a1.8 1.8 0 0 0 1.2-3.1 1.8 1.8 0 0 1 1.2-3.1H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14" cy="7" r="1"/><circle cx="17" cy="10" r="1"/></svg>'
};
const moodDefs={
  '開心':{face:'happy',icon:'●ᴗ●'},'有成就':{face:'achievement',icon:'★ᴗ★'},'平靜':{face:'calm',icon:'─ᴗ─'},
  '普通':{face:'normal',icon:'•ᴗ•'},'疲累':{face:'tired',icon:'─︿─'},'不開心':{face:'sad',icon:'•︿•'}
};
const animalDefs={
  redPanda:{name:'小莓',species:'小熊貓',src:'assets/pixel-red-panda.png'},cat:{name:'橘橘',species:'貓咪',src:'assets/pixel-cat.png'},
  panda:{name:'團團',species:'貓熊',src:'assets/pixel-panda.png'},otter:{name:'小獺',species:'水獺',src:'assets/pixel-otter.png'},
  sloth:{name:'慢慢',species:'樹懶',src:'assets/pixel-sloth.png'},capybara:{name:'暖暖',species:'水豚',src:'assets/pixel-capybara.png'},
  hedgehog:{name:'眠眠',species:'刺蝟',src:'assets/pixel-hedgehog.png'},penguin:{name:'雨點',species:'企鵝',src:'assets/pixel-penguin.png'}
};
const moodAnimals={'開心':['redPanda','cat'],'有成就':['otter','panda'],'平靜':['capybara','sloth'],'普通':['cat','capybara'],'疲累':['hedgehog','sloth'],'不開心':['penguin','sloth']};
const residentKindDefs={
  love:{label:'喜愛收藏',emoji:'🐰',keywords:/喜歡|收藏|追星|紀念|約會/},office:{label:'辦公行政',emoji:'🐝',keywords:/報告|會議|簡報|行政|業務|財務|會計|企劃|提案|合約/},
  technology:{label:'科技程式',emoji:'🦝',keywords:/程式|開發|軟體|網站|app|debug|api|資料庫|伺服器|前端|後端|code|coding/i},study:{label:'學習研究',emoji:'🦉',keywords:/學習|課程|上課|考試|研究|論文|作業|筆記|複習/},
  reading:{label:'閱讀寫作',emoji:'🦜',keywords:/閱讀|讀書|小說|文章|寫作|日記|書評/},creative:{label:'創作設計',emoji:'🦊',keywords:/設計|畫|插畫|攝影|拍攝|剪輯|動畫|美術|ui|ux/i},
  music:{label:'音樂表演',emoji:'🐦',keywords:/音樂|唱歌|樂器|鋼琴|吉他|表演|演出|練琴/},health:{label:'醫療健康',emoji:'🐢',keywords:/醫|護理|看診|吃藥|復健|治療|健康|牙|心理/},
  exercise:{label:'運動健身',emoji:'🐕',keywords:/運動|跑步|健身|瑜伽|游泳|球|騎車|散步|重訓/},food:{label:'飲食料理',emoji:'🐻',keywords:/吃|料理|烹飪|餐廳|烘焙|咖啡|飲料|備料|甜點/},
  home:{label:'家務整理',emoji:'🐭',keywords:/家務|清潔|整理|洗衣|打掃|收納|倒垃圾|洗碗/},care:{label:'照顧陪伴',emoji:'🦌',keywords:/照顧|陪伴|家人|長輩|幼兒|育兒|志工/},
  social:{label:'朋友社交',emoji:'🐒',keywords:/朋友|聚會|聊天|社交|聚餐|拜訪|聯絡|派對/},travel:{label:'旅行戶外',emoji:'🐧',keywords:/旅行|旅遊|戶外|登山|露營|通勤|搭車|飛機|景點/},
  nature:{label:'園藝自然',emoji:'🐸',keywords:/植物|園藝|澆水|花|種植|自然|公園/},pet:{label:'寵物時光',emoji:'🐶',keywords:/寵物|狗|貓|毛孩|遛狗|獸醫/},
  shopping:{label:'購物財務',emoji:'🐹',keywords:/購物|買|採買|繳費|銀行|記帳|投資|預算/},rest:{label:'休息睡眠',emoji:'🦥',keywords:/休息|睡|午睡|放空|發呆|冥想|泡澡/},
  sad:{label:'低潮時刻',emoji:'🐈‍⬛',keywords:/不開心|難過|壓力|焦慮|生氣|哭|低潮/},other:{label:'日常其他',emoji:'🐼',keywords:/$^/}
};
// Activity kind -> neighbour species. The same pick drives the 2D atlas piece and the 3D island.
const residentSpeciesPools={
  love:['redPanda','cat'],office:['sloth','penguin'],technology:['sloth','cat'],study:['penguin','cat'],
  reading:['sloth','capybara'],creative:['cat','redPanda'],music:['penguin','redPanda'],health:['capybara','otter'],
  exercise:['redPanda','otter'],food:['capybara','redPanda'],home:['sloth','cat'],care:['capybara','otter'],
  social:['redPanda','penguin'],travel:['otter','penguin'],nature:['penguin','capybara'],pet:['cat','redPanda'],
  shopping:['sloth','capybara'],rest:['otter','capybara'],sad:['otter','sloth'],other:['capybara','penguin']
};
const NEIGHBOR_MAX=4,INSECT_DISPLAY_MAX=30;
const residentFallback={'喜歡':'love','工作':'office','興趣':'creative','照顧':'care','家務':'home','休息':'rest','不開心':'sad'};
const professionDefs={
  office:{label:'辦公行政',icon:'📋',mascot:'橘貓',keywords:/報告|會議|簡報|文書|行政|業務|財務|會計|管理|企劃|提案|合約|office|sales/i},
  medical:{label:'醫療照護',icon:'🩺',mascot:'小熊貓',keywords:/醫|護理|病人|藥|診|手術|復健|治療|心理|醫院|clinic|patient/i},
  technology:{label:'科技開發',icon:'💻',mascot:'浣熊',keywords:/程式|開發|軟體|網站|app|debug|api|資料庫|伺服器|工程師|前端|後端|code|coding|deploy/i},
  education:{label:'教育研究',icon:'📚',mascot:'貓頭鷹',keywords:/教學|老師|學生|課程|備課|批改|講義|研究|論文|實驗|學校|teacher|research/i},
  creative:{label:'創作設計',icon:'🎨',mascot:'狐狸',keywords:/設計|畫|剪輯|拍攝|寫作|文案|音樂|攝影|插畫|動畫|美術|ui|ux|creative/i},
  food:{label:'餐飲烘焙',icon:'🍳',mascot:'棕熊',keywords:/料理|廚|烹飪|餐廳|烘焙|咖啡|飲料|備料|甜點|外場|chef|cook/i},
  care:{label:'照顧服務',icon:'🤝',mascot:'水豚',keywords:/照顧|社工|幼兒|清潔|客服|服務|美容|陪伴|接待|諮詢|care|service/i},
  trades:{label:'工程技職',icon:'🦺',mascot:'企鵝',keywords:/工地|維修|製造|機械|電工|水電|施工|搬運|倉庫|運輸|建築|設備|修理|technician/i}
};
const defaultData={version:5,items:[],records:[],moments:[],settings:{theme:'system',professionMode:'auto'}};
let data=loadData(),activeType='全部',toastTimer,undoRecord=null;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;

function inferType(item){const s=`${item.type||''} ${item.category||''} ${item.name||''}`;if(typeDefs[item.type])return item.type;if(/工作|上班|會議|加班|報告/.test(s))return'工作';if(/畫|閱讀|遊戲|攝影|音樂|興趣/.test(s))return'興趣';if(/照顧|健康|運動|醫|寵物|植物/.test(s))return'照顧';if(/家|清潔|整理|洗|打掃/.test(s))return'家務';if(/休息|睡|放空|咖啡/.test(s))return'休息';if(/不開心|壓力|討厭/.test(s))return'不開心';return'喜歡'}
function normalizeMood(m){if(moodDefs[m])return m;if(/明亮|快樂|開心/.test(m||''))return'開心';if(/安定|平靜/.test(m||''))return'平靜';if(/有勁|成就/.test(m||''))return'有成就';if(/低潮|不開心/.test(m||''))return'不開心';if(/緊繃|疲/.test(m||''))return'疲累';return'普通'}
function normalizeData(v){if(!v||!Array.isArray(v.items)||!Array.isArray(v.records))throw Error('invalid');const merged={...structuredClone(defaultData),...v,version:5,moments:Array.isArray(v.moments)?v.moments:[],settings:{...defaultData.settings,...v.settings}};merged.items=merged.items.map(i=>({...i,type:inferType(i),residentKind:i.residentKind||'auto'}));merged.records=merged.records.map(r=>({...r,mood:normalizeMood(r.mood||merged.moments.find(m=>m.id===r.momentId)?.mood)}));return merged}
function loadData(){try{return normalizeData(JSON.parse(localStorage.getItem(STORAGE_KEY)))}catch{return structuredClone(defaultData)}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));window.diaryCloud?.queue(data);renderAll()}
function recordsFor(id){return data.records.filter(r=>r.itemId===id).sort((a,b)=>new Date(b.at)-new Date(a.at))}
function lastRecord(item){return recordsFor(item.id)[0]||null}
function dateKey(v){const d=new Date(v),p=n=>String(n).padStart(2,'0');return`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`}
function sameDay(v,d=new Date()){return dateKey(v)===dateKey(d)}
function daysSince(v){if(!v)return null;const a=new Date(v),b=new Date(),start=new Date(a.getFullYear(),a.getMonth(),a.getDate()),end=new Date(b.getFullYear(),b.getMonth(),b.getDate());return Math.max(0,Math.floor((end-start)/864e5))}
function elapsed(v){if(!v)return{n:'—',unit:'還沒做過'};const d=daysSince(v);if(d===0){const h=Math.max(0,Math.floor((Date.now()-new Date(v))/36e5));return{n:h<1?'剛剛':h,unit:h<1?'':'小時前'}}return{n:d,unit:'天前'}}
function localDateTime(d=new Date()){const p=n=>String(n).padStart(2,'0');return`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
function displayDate(v){return new Intl.DateTimeFormat('zh-TW',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}
function median(nums){if(!nums.length)return null;const a=[...nums].sort((x,y)=>x-y),m=Math.floor(a.length/2);return a.length%2?a[m]:Math.round((a[m-1]+a[m])/2)}
function rhythm(item){const rs=recordsFor(item.id);if(rs.length<2)return null;return median(rs.slice(0,9).slice(0,-1).map((r,i)=>Math.max(0,Math.round((new Date(r.at)-new Date(rs[i+1].at))/864e5))))}
function urgency(item){const last=lastRecord(item);return last?(daysSince(last.at)||0):999}
function countMap(values){return values.reduce((a,x)=>(a[x]=(a[x]||0)+1,a),{})}
function dominant(map,fallback){return Object.entries(map).sort((a,b)=>b[1]-a[1])[0]?.[0]||fallback}

function hashString(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const insectKinds=['ladybug','bee','butterfly','grasshopper','firefly','beetle','moth','dragonfly'];
const moodKeys={'開心':'happy','有成就':'achievement','平靜':'calm','普通':'neutral','疲累':'tired','不開心':'sad'};
const moodScenes={
  '開心':{weather:'晴朗',expression:'≧▽≦',aura:'♡ ✿ ♡',story:'太陽照著小島，主角開心得跳了起來'},
  '有成就':{weather:'金色晴空',expression:'•̀ᴗ•́ و',aura:'★ ✦ ★',story:'山頂觀景台升起旗幟，主角舉起雙手'},
  '平靜':{weather:'微風薄雲',expression:'－‿－',aura:'～ ❧ ～',story:'溪水緩緩流過，主角安靜地深呼吸'},
  '普通':{weather:'柔和多雲',expression:'・ᴗ・',aura:'· ○ ·',story:'雲慢慢飄過，是一座平穩的日常小島'},
  '疲累':{weather:'暮色起霧',expression:'－_－ zZ',aura:'z Z z',story:'小島起了霧，主角垂著頭打瞌睡'},
  '不開心':{weather:'雷雨',expression:'╥﹏╥',aura:'☂ ϟ ☂',story:'雷雨落在島上，主角低著頭等雨停'}
};
function islandMainVisual(spec,className='puzzle-main'){
  return`<img class="${className}" src="${spec.animal.src}" alt="${spec.mood}的${spec.animal.species}${spec.animal.name}">${spec.profession?`<span class="puzzle-profession-badge" title="${spec.profession.label}" aria-label="${spec.profession.label}">${spec.profession.icon}</span>`:''}`;
}
function insectHtml(count,key,mode='puzzle'){
  const gallerySpots=[[5,15],[95,15],[5,85],[95,85],[50,5],[3,50],[97,50],[50,95],[22,30],[78,70],[22,70],[78,30]];
  const mapSpots=[[20,35],[79,34],[18,68],[82,69],[34,25],[68,81],[31,82],[85,50],[43,19],[65,23],[38,69],[66,67]];
  return Array.from({length:count},(_,i)=>{const h=hashString(`${key}-bug-${i}`),kind=insectKinds[h%insectKinds.length],spot=mode==='three-d'?gallerySpots[i%gallerySpots.length]:mode==='map'?mapSpots[i%mapSpots.length]:null,x=spot?.[0]??12+(h%7600)/100,y=spot?.[1]??18+(Math.floor(h/97)%6500)/100;return`<span class="pixel-insect insect-${kind} ${mode}-insect" style="--bug-x:${x}%;--bug-y:${y}%;--bug-delay:-${(h%25)/10}s" aria-hidden="true"></span>`}).join('');
}
function residentForItem(item){
  if(!item)return{key:'other',...residentKindDefs.other};
  if(item.residentKind&&item.residentKind!=='auto'&&residentKindDefs[item.residentKind])return{key:item.residentKind,...residentKindDefs[item.residentKind]};
  const text=`${item.name||''} ${item.category||''}`;
  const found=Object.entries(residentKindDefs).find(([key,def])=>key!=='other'&&def.keywords.test(text));
  const key=found?.[0]||residentFallback[item.type]||'other';
  return{key,...residentKindDefs[key]};
}
function professionFor(records){
  const mode=data.settings.professionMode||'auto';
  if(mode==='none')return null;
  if(mode!=='auto'&&professionDefs[mode])return{key:mode,...professionDefs[mode],reason:'由你指定的職業服'};
  const workRows=records.map(r=>({r,item:data.items.find(i=>i.id===r.itemId)})).filter(x=>x.item?.type==='工作');
  if(!workRows.length)return null;
  const scores={},evidence={};
  for(const {r,item} of workRows){const text=`${item.name||''} ${item.category||''} ${r.note||''}`;for(const [key,def] of Object.entries(professionDefs)){if(def.keywords.test(text)){scores[key]=(scores[key]||0)+1;evidence[key]??=item.name}}}
  const key=dominant(scores,'office'),def=professionDefs[key];
  return{key,...def,reason:evidence[key]?`從「${evidence[key]}」判斷`:`今天有 ${workRows.length} 筆工作紀錄`};
}
function islandSpec(records,key=dateKey(new Date())){
  const moods=countMap(records.map(r=>normalizeMood(r.mood))),mood=dominant(moods,'普通'),choices=moodAnimals[mood];
  const animalKey=choices[hashString(`${key}-${records.length}`)%choices.length],animal=animalDefs[animalKey];
  const residents=records.map(r=>residentForItem(data.items.find(i=>i.id===r.itemId)));
  const used=new Set([animalKey]);
  const neighbors=[...new Map(residents.map(r=>[r.key,r])).values()].slice(0,NEIGHBOR_MAX).map((r,index)=>{
    const pool=residentSpeciesPools[r.key]||residentSpeciesPools.other,offset=hashString(`${key}-${r.key}-${index}`)%pool.length,ordered=[...pool.slice(offset),...pool.slice(0,offset)];
    const species=ordered.find(x=>!used.has(x))||ordered.find(x=>x!==animalKey)||ordered[0];used.add(species);return{kind:r.key,label:r.label,species};
  });
  return{count:records.length,mood,animalKey,animal,residents,neighbors,layout:islandLayout(records,key),profession:professionFor(records),decor:records.length===0?'':records.length<3?'🌱':records.length<6?'🌼':records.length<9?'🌳':'🚩'};
}
// Island terrain. Coordinates are "screen" units: l = left/right, d = back(-)/front(+) as seen from the default 3D
// camera; island3d.js converts them to world x/z and atlasMap draws them top-down, so both views share one layout.
const ISLAND_SLOTS={hero:[.78,.75],neighbors:[[-1.25,.85],[1.65,.05],[-.15,1.55],[1.05,-.85]]};
const biomeByType={'喜歡':'garden','工作':'mountain','興趣':'lake','照顧':'forest','家務':'farm','休息':'beach','不開心':'rocky'};
const islandBiomes={
  mountain:{label:'高山島',sign:[1.95,-.55],features:[
    {type:'hill',l:-.95,d:-1,r:1,h:.62,lookout:1,spring:1},{type:'pond',l:-1.85,d:-.05,r:.42},
    {type:'creek',pts:[[-1.85,.3],[-1.95,.9],[-1.85,1.4],[-1.6,1.75]],fall:1},{type:'bridge',l:-1.92,d:1.05,a:0},
    {type:'path',pts:[[.6,.9],[-.4,1.05],[-1.45,1.05]]},{type:'path',pts:[[-.1,-.15],[.35,.25]]},
    {type:'tree',kind:'high',l:1.5,d:-1.7,h:1.2},{type:'tree',kind:'low',l:-2,d:-1.25,h:.8},{type:'tree',kind:'low',l:2.05,d:.95,h:.7},
    {type:'tree',kind:'bush',l:.3,d:-2,h:.42},{type:'rock',l:2.05,d:-.2,s:.3},{type:'rock',l:-.6,d:2,s:.26},{type:'flowers',l:.9,d:-1.6,r:.25}],
    extras:[{type:'tree',kind:'bush',l:1,d:-1.95,h:.38},{type:'flowers',l:1.25,d:1.45,r:.25},{type:'tree',kind:'low',l:-2.15,d:-.65,h:.6},{type:'rock',l:.3,d:2.05,s:.22}]},
  garden:{label:'花園島',sign:[1.95,-.6],features:[
    {type:'pond',l:-.55,d:-.95,r:.55},{type:'stones',pts:[[-.05,-.4],[.2,-.08]]},
    {type:'tree',kind:'blossom',l:-1.6,d:-1.3,h:1},{type:'tree',kind:'blossom',l:1.45,d:-1.6,h:1.1},{type:'tree',kind:'blossom',l:-2.05,d:.25,h:.9},
    {type:'flowers',l:.5,d:-1.8,r:.35,tone:'pink'},{type:'flowers',l:-1,d:.15,r:.3,tone:'yellow'},{type:'flowers',l:2,d:.9,r:.3,tone:'purple'},{type:'flowers',l:-.9,d:1.85,r:.3,tone:'red'},
    {type:'path',pts:[[.9,2.05],[.75,1.2],[.6,.85]]}],
    extras:[{type:'flowers',l:1.2,d:1.35,r:.25,tone:'yellow'},{type:'tree',kind:'blossom',l:-2,d:-.6,h:.7},{type:'flowers',l:-1.75,d:1.35,r:.25,tone:'pink'},{type:'flowers',l:.1,d:-2.15,r:.22,tone:'purple'}]},
  lake:{label:'湖心島',sign:[1.95,-.4],features:[
    {type:'lake',l:-1,d:-.75,r:1},{type:'islet',l:-1.15,d:-.95,r:.28},{type:'dock',l:-.3,d:-.15,a:Math.PI+.71},
    {type:'tree',kind:'high',l:1.55,d:-1.75,h:1.1},{type:'tree',kind:'low',l:-2.05,d:.35,h:.8},{type:'tree',kind:'pine',l:-1.75,d:-1.75,h:.95},{type:'tree',kind:'bush',l:2.1,d:.7,h:.4},
    {type:'rock',l:-1.3,d:1.5,s:.28},{type:'flowers',l:.6,d:2,r:.25},{type:'path',pts:[[1,1.9],[.7,1],[.6,.75]]}],
    extras:[{type:'tree',kind:'bush',l:-2,d:-.6,h:.38},{type:'flowers',l:1.4,d:1.4,r:.25},{type:'tree',kind:'low',l:1.75,d:-1.2,h:.6},{type:'rock',l:-.65,d:1.95,s:.22}]},
  forest:{label:'森林島',sign:[2,-1.15],features:[
    {type:'tree',kind:'pine',l:-1.75,d:-1.35,h:1.1},{type:'tree',kind:'high',l:-.75,d:-1.95,h:1.2},{type:'tree',kind:'pine',l:.4,d:-2,h:1},
    {type:'tree',kind:'high',l:1.5,d:-1.55,h:1.15},{type:'tree',kind:'low',l:2.15,d:-.45,h:.8},{type:'tree',kind:'pine',l:-2.15,d:-.35,h:.95},
    {type:'tree',kind:'low',l:-.95,d:-.75,h:.75},{type:'tree',kind:'bush',l:2.05,d:1.1,h:.4},{type:'tree',kind:'pine',l:-1.95,d:1.25,h:.8},
    {type:'mushroom',l:.15,d:-1},{type:'mushroom',l:-.4,d:.3},{type:'mushroom',l:1.6,d:1.35},
    {type:'path',pts:[[.9,2.1],[.65,1],[.4,.2],[.1,-.6],[-.35,-1.25]]}],
    extras:[{type:'mushroom',l:-.95,d:1.6},{type:'tree',kind:'bush',l:-1.2,d:-.15,h:.36},{type:'tree',kind:'pine',l:1.05,d:-1.95,h:.8},{type:'mushroom',l:1.3,d:-.3}]},
  farm:{label:'田園島',sign:[2.05,.75],features:[
    {type:'field',l:-1,d:-1,w:1.5,dd:1,a:0},{type:'house',l:1.55,d:-1.6,a:0},{type:'pond',l:-1.95,d:.55,r:.35},
    {type:'tree',kind:'low',l:-2,d:-.3,h:.75},{type:'tree',kind:'high',l:.3,d:-2.05,h:1},{type:'haystack',l:2,d:-.6},
    {type:'path',pts:[[1.5,-1.2],[1.15,-.3],[.85,.35]]},{type:'path',pts:[[.75,.9],[.9,2]]}],
    extras:[{type:'haystack',l:-.2,d:-.25},{type:'flowers',l:1.3,d:1.45,r:.25},{type:'tree',kind:'bush',l:-.9,d:1.9,h:.38},{type:'tree',kind:'low',l:1.95,d:-1.15,h:.55}]},
  beach:{label:'沙灘島',sign:[2,-.6],features:[
    {type:'beach',from:20,to:160},{type:'hill',l:-.8,d:-1.2,r:.8,h:.42},
    {type:'tree',kind:'palm',l:-2,d:.55,h:1.1},{type:'tree',kind:'palm',l:1.8,d:1.3,h:1},{type:'umbrella',l:.9,d:1.7},
    {type:'tree',kind:'low',l:1.5,d:-1.6,h:.8},{type:'tree',kind:'bush',l:-1.9,d:-1,h:.4},{type:'rock',l:-1.6,d:1.55,s:.25},
    {type:'shells',pts:[[.2,2.05],[-1,1.75],[1.3,2]]}],
    extras:[{type:'shells',pts:[[1,2.15],[-.4,1.95]]},{type:'flowers',l:-1.9,d:0,r:.22},{type:'tree',kind:'bush',l:.6,d:-2,h:.38},{type:'rock',l:2.15,d:.45,s:.22}]},
  rocky:{label:'礁岩島',sign:[.25,-1.35],features:[
    {type:'arch',l:-.6,d:-1.45,a:0},{type:'rock',l:-1.7,d:-.9,s:.55,dark:1},{type:'rock',l:1.5,d:-1.55,s:.6,dark:1},{type:'rock',l:-2,d:.6,s:.4,dark:1},
    {type:'rock',l:2.05,d:.8,s:.35,dark:1},{type:'rock',l:.3,d:-2.05,s:.4,dark:1},{type:'pond',l:-.9,d:.15,r:.35},
    {type:'stones',pts:[[.9,1.3],[1.1,1.9]]},{type:'tree',kind:'bush',l:-1.1,d:-1.85,h:.38},{type:'tree',kind:'pine',l:2,d:-.65,h:.8}],
    extras:[{type:'rock',l:-.7,d:2,s:.28,dark:1},{type:'tree',kind:'bush',l:1,d:-2,h:.34},{type:'rock',l:-2.2,d:-.2,s:.3,dark:1},{type:'pond',l:1.4,d:1.6,r:.22}]}
};
function seededRandom(seed){return()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function islandLayout(records,key){
  const types=countMap(records.map(r=>data.items.find(i=>i.id===r.itemId)?.type||'喜歡')),type=dominant(types,'喜歡'),biome=biomeByType[type]||'garden',def=islandBiomes[biome];
  const rand=seededRandom(hashString(`${key}-coast`)),mirror=rand()<.5,count=records.length,size=.9+Math.min(count,10)*.015;
  const control=Array.from({length:12},()=>2.74+rand()*.36),radii=Array.from({length:48},(_,i)=>{const t=i/4,j=Math.floor(t),f=(1-Math.cos((t-j)*Math.PI))/2;return control[j%12]*(1-f)+control[(j+1)%12]*f});
  // Mirroring left/right keeps every feature's depth, so nothing new ends up in front of the animals.
  const point=(l,d)=>[(mirror?-l:l)*size,d*size],angle=a=>mirror?Math.PI-a:a;
  const place=f=>{const g={...f};if('l'in f)[g.l,g.d]=point(f.l,f.d);if(f.pts)g.pts=f.pts.map(p=>point(...p));if('a'in f)g.a=angle(f.a);if('r'in f)g.r=f.r*size;if(f.type==='beach'&&mirror)[g.from,g.to]=[180-f.to,180-f.from];return g};
  const extras=def.extras.slice(0,Math.min(def.extras.length,Math.floor(count/2)));
  return{biome,label:def.label,type,size,radii,features:[...def.features,...extras].map(place),hero:point(...ISLAND_SLOTS.hero),slots:ISLAND_SLOTS.neighbors.map(p=>point(...p)),sign:point(...def.sign)};
}
function islandHtml(records,key,mini=false){
  const s=islandSpec(records,key),visible=s.residents.slice(0,12),more=s.count-visible.length;
  const residents=visible.map((r,i)=>`<span class="island-resident resident-${i+1}" title="${r.label}" aria-label="${r.label}居民">${r.emoji}</span>`).join('');
  const main=s.count?`<img class="island-main-animal" src="${s.animal.src}" alt="今日主角${s.animal.species}${s.animal.name}">${s.profession?`<span class="island-profession-badge" title="${s.profession.label}" aria-label="${s.profession.label}">${s.profession.icon}</span>`:''}`:`<span class="island-egg" aria-label="等待第一件事的蛋">🥚</span>`;
  return`<div class="daily-island ${mini?'mini-island':''}" aria-label="${s.count} 件事組成的小島，主角是${s.animal.species}"><span class="island-cloud">☁</span><div class="island-water"></div><div class="island-soil"></div><div class="island-grass"></div><span class="island-decor">${s.decor}</span>${main}<div class="island-residents">${residents}${more?`<span class="resident-more">+${more}</span>`:''}</div></div>`;
}

function applyTheme(){const mode=data.settings.theme||'system',dark=mode==='dark'||(mode==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';$('#themeBtn').innerHTML=dark?'<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>':'<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z"/></svg>';$('#themeSelect').value=mode}
function renderAll(){applyTheme();renderHome();renderHistory();renderCollection();renderInsights();renderSettings();populateRecordItems();populateResidentOptions()}
function renderHome(){
  const today=data.records.filter(r=>sameDay(r.at)),key=dateKey(new Date()),spec=islandSpec(today,key),typeCounts=countMap(today.map(r=>data.items.find(i=>i.id===r.itemId)?.type||'喜歡'));
  $('#todayLabel').textContent=new Intl.DateTimeFormat('zh-TW',{month:'long',day:'numeric',weekday:'long'}).format(new Date());
  $('#todaySummary').textContent=today.length?`今天完成了 ${today.length} 件事，島上飛來 ${today.length} 隻昆蟲${spec.neighbors.length?`，住進 ${spec.neighbors.length} 位活動鄰居`:''}；今天是一座${spec.layout.label}（${spec.layout.type}最多）；主要心情是「${spec.mood}」${spec.profession?`，今天像一位${spec.profession.label}工作者`:''}。`:'今天還沒有紀錄。做完第一件事，主角動物就會登島，並飛來第一隻昆蟲。';
  const homeIsland={mood:spec.mood,moodKey:moodKeys[spec.mood]||'neutral',animalKey:spec.animalKey,count:today.length,key,neighbors:spec.neighbors,layout:spec.layout,residentSignature:`${spec.layout.biome}:${spec.layout.size}|`+spec.neighbors.map(n=>`${n.kind}:${n.species}`).join('|'),professionKey:spec.profession?.key||'',professionLabel:spec.profession?.label||'',empty:today.length===0};
  $('#homeIslandScene').setAttribute('aria-label',today.length?`今天真正的 3D 動物島，主角${spec.animal.species}心情${spec.mood}，${spec.neighbors.length} 位活動鄰居，${today.length} 隻昆蟲`:'今天真正的 3D 動物島，正在等待第一位居民');
  window.currentHomeIsland3d=homeIsland;if(window.realIsland3d)window.realIsland3d.preview(homeIsland);else window.pendingHomeIsland3d=homeIsland;
  $('#islandCaption').textContent=today.length?`${spec.layout.label} · 主角：${spec.animal.name}（${spec.animal.species} · ${spec.mood}）${spec.profession?` · ${spec.profession.icon} ${spec.profession.label}`:''} ${spec.neighbors.length?` · ${spec.neighbors.length} 位活動鄰居`:''} · ${today.length} 隻昆蟲`:'等待第一位居民登島';
  const counters=[['今日完成',today.length,counterIcons.done,'#f6d887'],['喜歡',typeCounts['喜歡']||0,counterIcons.love,'#f8c6cc'],['工作',typeCounts['工作']||0,counterIcons.work,'#b9dce2'],['興趣',typeCounts['興趣']||0,counterIcons.hobby,'#d8cbed']];
  $('#todayCounters').innerHTML=counters.map(([label,n,icon,tone])=>`<article class="counter-card" style="--tone:${tone}"><i>${icon}</i><div><strong>${n}</strong><span>${label}</span></div></article>`).join('');
  const types=['全部',...Object.keys(typeDefs)];if(!types.includes(activeType))activeType='全部';$('#typeChips').innerHTML=types.map(t=>`<button class="chip ${t===activeType?'active':''}" data-type="${t}">${t==='全部'?'全部':`${typeDefs[t].icon} ${t}`}</button>`).join('');
  const q=$('#searchInput').value.trim().toLowerCase();let items=data.items.filter(i=>(activeType==='全部'||i.type===activeType)&&(!q||`${i.name} ${i.category||''} ${i.type}`.toLowerCase().includes(q)));const sort=$('#sortSelect').value;items.sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'zh-Hant'):sort==='recent'?new Date(lastRecord(b)?.at||0)-new Date(lastRecord(a)?.at||0):sort==='count'?recordsFor(b.id).length-recordsFor(a.id).length:urgency(b)-urgency(a));
  $('#emptyState').hidden=!!data.items.length;$('#itemGrid').hidden=!data.items.length;$('#itemGrid').innerHTML=items.length?items.map(itemCard).join(''):(data.items.length?'<div class="panel">這個篩選裡還沒有活動。</div>':'');
}
function itemCard(i){const r=lastRecord(i),e=elapsed(r?.at),def=typeDefs[i.type]||typeDefs['喜歡'],resident=residentForItem(i),count=recordsFor(i.id).length;return`<article class="item-card" data-item-card="${i.id}" style="--tone:${def.color}"><div class="card-top"><div class="item-icon">${esc(i.icon)}</div><button class="more-button" data-edit="${i.id}" aria-label="編輯 ${esc(i.name)}">•••</button></div><h3>${esc(i.name)}</h3><div class="card-labels"><span class="type-label">${def.icon} ${esc(i.type)}</span><span class="resident-label">${resident.emoji} ${resident.label}</span></div><div class="elapsed"><strong>${e.n}</strong><span>${e.unit}</span></div><div class="card-bottom"><span class="card-meta">只是紀錄 · 累積 ${count} 次${i.category?` · ${esc(i.category)}`:''}</span><button class="complete-button" data-log="${i.id}">完成一次</button></div></article>`}

function renderHistory(){const list=[...data.records].sort((a,b)=>new Date(b.at)-new Date(a.at));if(!list.length){$('#historyList').innerHTML='<div class="empty-state"><img src="assets/pixel-panda.png" alt="貓熊夥伴"><h2>還沒有足跡</h2><p>完成活動時，次數、距離與當下心情會一起留在這裡。</p></div>';return}const groups={};for(const r of list)(groups[dateKey(r.at)]??=[]).push(r);$('#historyList').innerHTML=Object.entries(groups).map(([key,rs])=>`<section class="history-group"><div class="history-date">${new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(new Date(`${key}T12:00:00`))}</div>${rs.map(r=>{const i=data.items.find(x=>x.id===r.itemId);if(!i)return'';const def=typeDefs[i.type]||typeDefs['喜歡'];return`<article class="history-entry"><div class="item-icon" style="--tone:${def.color}">${esc(i.icon)}</div><div class="history-main"><strong>${esc(i.name)} <span class="mood-badge">${moodDefs[normalizeMood(r.mood)].icon} ${normalizeMood(r.mood)}</span></strong><small>${esc(r.note||`${i.type}的一次紀錄`)}</small></div><time class="history-time">${displayDate(r.at)}</time><button class="delete-record" data-delete-record="${r.id}" aria-label="刪除紀錄">×</button></article>`}).join('')}</section>`).join('')}

// A shared 260-unit edge is used by both neighbours; never independently draw sockets.
function atlasOutline(first=false,future=false){
  const right=future?170:280;
  return `M20 20H${right}V132${future?'': 'c0 7 8 7 13 3c22-14 35 5 35 15s-13 29-35 15c-5-4-13-4-13 3'}V280H20V168${first?'':'c0-7 8-7 13-3c22 14 35-5 35-15s-13-29-35-15c-5 4-13 4-13-3'}V20Z`;
}
// Atlas piece illustration: a 3/4 top-down plate of the same layout the 3D island uses (see islandLayout).
// One bold element (the island); light from the upper left, warm cocoa-tinted shadows, no outlines.
const ATLAS_CENTER=[170,146],ATLAS_SCALE=30,ATLAS_TILT=.56,ATLAS_RISE=.8,ATLAS_DEPTH=.72;
// The small piece shows landmarks only (garden beds count); loose flowers, stones, shells and mushrooms stay in 3D.
const ATLAS_SKIP=new Set(['stones','shells','mushroom']);
const atlasShade='#4a383d';
// Residents use the GPT-illustrated sheets in assets/atlas-animals (one row per species, 6 moods, 96px cells,
// feet at 247/256 of the cell, character ~210/256 tall); colours match the 3D characters in island3d.js.
const atlasHatColors={office:'#40577a',medical:'#f4f4ee',technology:'#2c8d7a',education:'#73528e',creative:'#e66f68',food:'#f1cf6b',care:'#65a98b',trades:'#e8a82f'};
const ATLAS_MOOD_CELL={happy:0,achievement:1,calm:2,neutral:3,tired:4,sad:5};
// Profession caps (assets/atlas-animals/hats.png, same order as professionDefs). Per species and mood:
// [head centre x, cap baseline y, cap scale] in 256px cell units, measured from the sprite alpha in art-source.
const ATLAS_HAT_ORDER=['office','medical','technology','education','creative','food','care','trades'];
const ATLAS_HAT_ANCHORS={"cat":[[127,80,0.822],[122,67,0.834],[122,67,0.834],[126,68,0.822],[128,77,0.803],[123,72,0.859]],"redPanda":[[127,82,0.816],[117,73,0.846],[120,69,0.871],[123,70,0.853],[124,78,0.834],[120,72,0.883]],"panda":[[126,78,0.859],[126,72,0.908],[128,70,0.883],[127,69,0.908],[127,71,0.871],[128,70,0.877]],"otter":[[128,82,0.889],[124,81,0.883],[124,82,0.895],[123,82,0.883],[125,81,0.859],[126,82,0.859]],"sloth":[[127,93,0.938],[128,96,0.987],[128,86,0.846],[128,86,0.859],[128,86,0.871],[128,86,0.859]],"capybara":[[130,89,0.926],[132,93,0.994],[138,80,0.828],[141,80,0.828],[141,82,0.859],[134,83,0.84]],"hedgehog":[[128,87,0.951],[132,88,0.951],[133,89,0.926],[128,90,0.908],[132,91,0.926],[124,87,0.92]],"penguin":[[128,101,0.987],[127,101,0.987],[128,95,0.889],[128,94,0.889],[128,95,0.895],[128,96,0.883]]};
function atlasAnimal(species,moodKey,x,y,size,hat=''){
  // (x,y) is the feet position; size is the character height in px.
  const f=n=>(+n).toFixed(1),cell=size*256/210,col=ATLAS_MOOD_CELL[moodKey]??3,file=animalDefs[species]?species:'capybara';
  return`<ellipse cx="${f(x+1.5)}" cy="${f(y)}" rx="${f(size*.3)}" ry="${f(size*.085)}" fill="${atlasShade}" opacity=".2"/><svg x="${f(x-cell/2)}" y="${f(y-cell*247/256)}" width="${f(cell)}" height="${f(cell)}" viewBox="${col*96} 0 96 96"><image href="assets/atlas-animals/${file}.png" width="576" height="96"/></svg>${atlasHat(file,col,x-cell/2,y-cell*247/256,cell/256,hat)}`;
}
function atlasHat(species,col,x0,y0,k,hat){
  const index=ATLAS_HAT_ORDER.indexOf(hat);if(index<0)return'';
  const [hx,by,sc]=ATLAS_HAT_ANCHORS[species][col],size=256*sc*k,f=n=>(+n).toFixed(1);
  return`<svg x="${f(x0+hx*k-128*sc*k)}" y="${f(y0+by*k-200*sc*k)}" width="${f(size)}" height="${f(size)}" viewBox="${index*96} 0 96 96"><image href="assets/atlas-animals/hats.png" width="768" height="96"/></svg>`;
}

function atlasMap(s,key){
  const L=s.layout,[cx,cy]=ATLAS_CENTER,S=ATLAS_SCALE,K=ATLAS_TILT,H=ATLAS_RISE,T=ATLAS_DEPTH,id=`a${key.replace(/\D/g,'')}`;
  const f1=n=>(+n).toFixed(1),P=(l,d,h=0)=>[cx+l*S,cy+d*S*K-h*S*H],pt=p=>p.map(f1).join(' ');
  const rand=seededRandom(hashString(`${key}-plate`)),moodKey=moodKeys[s.mood]||'neutral';
  const coastAt=phi=>{const theta=phi-Math.PI/4,n=L.radii.length,t=((theta/(Math.PI*2))*n%n+n)%n,i=Math.floor(t),f=t-i;return(L.radii[i]*(1-f)+L.radii[(i+1)%n]*f)*L.size};
  // Coast vertices in screen (l,d) units; world angle θ maps to screen angle θ+45°.
  const coast=L.radii.map((r,i)=>{const t=i/L.radii.length*Math.PI*2,x=Math.cos(t)*r*L.size,z=Math.sin(t)*r*L.size;return[(x-z)/Math.SQRT2,(x+z)/Math.SQRT2]});
  const smooth=pts=>{const n=pts.length;let d=`M${pt(pts[0])}`;for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];d+=`C${f1(p1[0]+(p2[0]-p0[0])/6)} ${f1(p1[1]+(p2[1]-p0[1])/6)} ${f1(p2[0]-(p3[0]-p1[0])/6)} ${f1(p2[1]-(p3[1]-p1[1])/6)} ${pt(p2)}`}return d+'Z'};
  const ring=(k,h,dy=0)=>coast.map(([l,d])=>{const p=P(l*k,d*k,h);return[p[0],p[1]+dy]});
  const poly=(pts,attrs)=>`<polygon points="${pts.map(pt).join(' ')}" ${attrs}/>`;
  const ellipse=(l,d,h,rx,attrs)=>{const [x,y]=P(l,d,h);return`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx*S)}" ry="${f1(rx*S*K)}" ${attrs}/>`};
  const shadow=(l,d,rx)=>ellipse(l+.14,d+.1,0,rx,`fill="${atlasShade}" opacity=".16"`);
  const front=coast.filter(([l,d])=>d>-.25).sort((p,q)=>p[0]-q[0]);

  // Island block: lagoon, foam, two soil strata, grass overhang, lit top with tufts.
  const lagoon=`<path d="${smooth(ring(1.13,-T,2))}" fill="#a9dcdc"/><path d="${smooth(ring(1.04,-T,1))}" fill="none" stroke="#fff1e6" stroke-width="2" opacity=".9"/><path d="${smooth(ring(1.2,-T,4))}" fill="none" stroke="#c9ece8" stroke-width="1" stroke-dasharray="6 9" opacity=".9"/>`;
  const body=`<path d="${smooth(ring(.93,-T))}" fill="#7c523d"/>`+`<path d="${smooth(ring(.965,-T*.5))}" fill="#9c6a4c"/>`+`<path d="${smooth(ring(1,0,T*S*H*.12))}" fill="#b98059"/>`;
  const pebbles=front.filter((_,i)=>i%3===1).map(([l,d])=>{const [x,y]=P(l*.96,d*.96,-T*.62);return`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="2.2" ry="1.3" fill="#c79a74" opacity=".8"/>`}).join('');
  const drips=front.filter((_,i)=>i%2===0).map(([l,d])=>{const [x,y]=P(l,d,0);return`<ellipse cx="${f1(x)}" cy="${f1(y+1.5)}" rx="${f1(3+rand()*2.5)}" ry="${f1(2.4+rand()*1.6)}" fill="#6f9f63"/>`}).join('');
  const top=`<path d="${smooth(ring(1,0))}" fill="var(--atlas-land)"/><path d="${smooth(ring(1,0))}" fill="url(#${id}-glow)"/><path d="${smooth(ring(.98,0,-1))}" fill="none" stroke="#fff1e6" stroke-width="1.2" opacity=".45" stroke-dasharray="0 0"/>`;
  const tufts=Array.from({length:7},()=>{const a=rand()*Math.PI*2,r=Math.sqrt(rand())*2.1*L.size,[x,y]=P(Math.cos(a)*r,Math.sin(a)*r);return`<path d="M${f1(x-2)} ${f1(y)}l1 -2.6l1 2.6l1 -2l1 2" fill="none" stroke="#5f8f5c" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/>`}).join('');

  const tones={pink:['#e98598','#ffd1d8'],yellow:['#f1bf5b','#fff0b0'],purple:['#9b88bb','#e1d1f4'],red:['#e9677a','#ffd1d8']};
  const tree=f=>{const h=f.h||.8,[bx,by]=P(f.l,f.d,0);
    if(f.kind==='pine'){const w=h*S*.34,ht=h*S*1.1;return shadow(f.l,f.d,h*.32)+`<rect x="${f1(bx-1.5)}" y="${f1(by-5)}" width="3" height="5" fill="#76513c"/>`+[0,1,2].map(i=>{const y0=by-3-i*ht*.25,ww=w*(1-i*.24),y1=y0-ht*.42;return`<path d="M${f1(bx-ww)} ${f1(y0)}Q${f1(bx)} ${f1(y0+2.5)} ${f1(bx+ww)} ${f1(y0)}L${f1(bx)} ${f1(y1)}Z" fill="#3f7a5a"/><path d="M${f1(bx)} ${f1(y1)}L${f1(bx+ww)} ${f1(y0)}Q${f1(bx+ww*.5)} ${f1(y0+1.8)} ${f1(bx)} ${f1(y0+1.3)}Z" fill="#2f604a"/><path d="M${f1(bx-ww*.55)} ${f1(y0-1.5)}L${f1(bx-1)} ${f1(y1+3)}" stroke="#7fb58b" stroke-width="1" stroke-linecap="round"/>`}).join('')}
    if(f.kind==='palm'){const ht=h*S*.95,tx=bx+h*S*.2,ty=by-ht;return shadow(f.l+.25,f.d,h*.35)+`<path d="M${f1(bx)} ${f1(by)}Q${f1(bx-2)} ${f1(by-ht*.55)} ${f1(tx)} ${f1(ty)}" fill="none" stroke="#9a7350" stroke-width="3.4" stroke-linecap="round"/><path d="M${f1(bx-.6)} ${f1(by-ht*.3)}l2.4 -.6M${f1(bx-.4)} ${f1(by-ht*.55)}l2.4 -.8" stroke="#7b5a3c" stroke-width="1"/>`+[[-1,-.2],[-.6,-.8],[.25,-.95],[.95,-.45],[1,.2],[-.95,.35]].map(([dx,dy],i)=>`<path d="M${f1(tx)} ${f1(ty)}q${f1(dx*8)} ${f1(dy*8-5)} ${f1(dx*15)} ${f1(dy*9+4)}" fill="none" stroke="${i%2?'#4f9a5a':'#66a78e'}" stroke-width="3.6" stroke-linecap="round"/>`).join('')+`<circle cx="${f1(tx-1)}" cy="${f1(ty+2)}" r="1.8" fill="#7b5a3c"/><circle cx="${f1(tx+1.5)}" cy="${f1(ty+2.4)}" r="1.6" fill="#8a6644"/>`}
    const bush=f.kind==='bush',r=(bush?.36:.27)*h*S+3.5,cyy=by-(bush?r*.55:h*S*.66),[dark,mid,light]=f.kind==='blossom'?['#d77894','#e98598','#ffd6e2']:bush?['#4f7f55','#66a78e','#a9d1a4']:['#3f7a5a','#5c9868','#a8cf93'];
    const blobs=[[-.45,.18,.62],[.42,.2,.6],[0,-.22,.78]];
    return shadow(f.l,f.d,r/S*.95)+(bush?'':`<path d="M${f1(bx-1.8)} ${f1(by)}L${f1(bx-1.1)} ${f1(cyy+r*.4)}L${f1(bx+1.1)} ${f1(cyy+r*.4)}L${f1(bx+1.8)} ${f1(by)}Z" fill="#76513c"/>`)+
      blobs.map(([dx,dy,k])=>`<circle cx="${f1(bx+dx*r)}" cy="${f1(cyy+dy*r)}" r="${f1(r*k)}" fill="${dark}"/>`).join('')+
      blobs.map(([dx,dy,k])=>`<circle cx="${f1(bx+dx*r-r*.12)}" cy="${f1(cyy+dy*r-r*.12)}" r="${f1(r*k*.82)}" fill="${mid}"/>`).join('')+
      `<path d="M${f1(bx-r*.62)} ${f1(cyy-r*.3)}q${f1(r*.25)} ${f1(-r*.55)} ${f1(r*.7)} ${f1(-r*.6)}" fill="none" stroke="${light}" stroke-width="${f1(Math.max(1.4,r*.16))}" stroke-linecap="round" opacity=".9"/>`+
      (f.kind==='blossom'?[[.35,.1],[-.2,.42],[-.45,-.1],[.15,-.45]].map(([dx,dy])=>`<circle cx="${f1(bx+dx*r)}" cy="${f1(cyy+dy*r)}" r="1.3" fill="#fff6f8"/>`).join(''):'')};
  const draw={
    beach:f=>{const a=[],b=[];for(let i=0;i<=28;i++){const phi=(f.from+(f.to-f.from)*i/28)*Math.PI/180,r=coastAt(phi);a.push([Math.cos(phi)*r*.99,Math.sin(phi)*r*.99]);b.unshift([Math.cos(phi)*r*.68,Math.sin(phi)*r*.68])}
      return`<path d="M${[...a,...b].map(p=>pt(P(...p))).join('L')}Z" fill="#f3dfae"/><polyline points="${b.map(p=>pt(P(...p))).join(' ')}" fill="none" stroke="#e8cf98" stroke-width="1.6" stroke-linecap="round"/>`},
    field:f=>{const c=Math.cos(f.a),sn=Math.sin(f.a),corner=(u,v)=>P(f.l+u*c-v*sn,f.d+u*sn+v*c),w=f.w/2,h=f.dd/2;
      const rows=[-.62,-.21,.21,.62].map((v,i)=>{const p0=corner(-w*.84,v*h),p1=corner(w*.84,v*h);return`<path d="M${pt(p0)}L${pt(p1)}" stroke="#77513a" stroke-width="3.6" stroke-linecap="round"/>`+Array.from({length:7},(_,j)=>{const t=j/6,x=p0[0]+(p1[0]-p0[0])*t,y=p0[1]+(p1[1]-p0[1])*t;return`<path d="M${f1(x)} ${f1(y)}q-1.6 -2.6 0 -3.6q1.6 1 0 3.6Z" fill="${i%2?'#7fbf5a':'#a6d06a'}"/>`}).join('')}).join('');
      const fence=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>{const [x,y]=corner(u*(w+.08),v*(h+.08));return`<rect x="${f1(x-1)}" y="${f1(y-6)}" width="2" height="6" rx=".6" fill="#a56d43"/>`}).join('');
      const rail=(u0,v0,u1,v1)=>{const a=corner(u0*(w+.08),v0*(h+.08)),b=corner(u1*(w+.08),v1*(h+.08));return`<path d="M${f1(a[0])} ${f1(a[1]-4.5)}L${f1(b[0])} ${f1(b[1]-4.5)}" stroke="#c08a5f" stroke-width="1.3"/>`};
      return`<path d="M${pt(corner(-w,-h))}L${pt(corner(w,-h))}L${pt(corner(w,h))}L${pt(corner(-w,h))}Z" fill="#9a6d4f"/>`+rows+rail(-1,-1,1,-1)+rail(-1,-1,-1,1)+rail(1,-1,1,1)+fence},
    pond:f=>ellipse(f.l,f.d,0,f.r*1.14,'fill="#7fa778"')+ellipse(f.l,f.d+.03,0,f.r,`fill="url(#${id}-water)"`)+(()=>{const [x,y]=P(f.l-f.r*.4,f.d-f.r*.2);return`<path d="M${f1(x)} ${f1(y)}q${f1(f.r*S*.3)} -3 ${f1(f.r*S*.6)} 0" fill="none" stroke="#fff1e6" stroke-width="1.4" opacity=".85" stroke-linecap="round"/><path d="M${f1(x+f.r*S*.5)} ${f1(y+5)}q${f1(f.r*S*.2)} -2 ${f1(f.r*S*.4)} 0" fill="none" stroke="#fff1e6" stroke-width="1" opacity=".6" stroke-linecap="round"/>`})(),
    islet:f=>ellipse(f.l,f.d+.03,-.05,f.r,'fill="#5f8f5c" opacity=".45"')+ellipse(f.l,f.d,0,f.r,'fill="#a6cf88"'),
    creek:f=>{const last=f.pts[f.pts.length-1],dist=Math.hypot(...last),edge=coastAt(Math.atan2(last[1],last[0]))*.99,end=[last[0]/dist*edge,last[1]/dist*edge],line=[...f.pts,end].map(p=>pt(P(...p))).join(' '),[ex,ey]=P(...end),[bx,by]=P(end[0]*.93,end[1]*.93,-T);
      return`<polyline points="${line}" fill="none" stroke="#7fa778" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${line}" fill="none" stroke="url(#${id}-water)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`+(f.fall?`<path d="M${f1(ex-3.4)} ${f1(ey)}L${f1(ex+3.4)} ${f1(ey)}L${f1(bx+3)} ${f1(by+4)}L${f1(bx-3)} ${f1(by+4)}Z" fill="#d9f3f3"/><path d="M${f1(ex-1)} ${f1(ey+2)}L${f1(bx-1)} ${f1(by+2)}" stroke="#fff" stroke-width="1" opacity=".9"/><ellipse cx="${f1(bx)}" cy="${f1(by+5)}" rx="7" ry="2.2" fill="#fff1e6"/>`:'')},
    path:f=>{const line=f.pts.map(p=>pt(P(...p))).join(' ');return`<polyline points="${line}" fill="none" stroke="#d2b07a" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${line}" fill="none" stroke="#ecd3a2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2.5 4.5"/>`},
    bridge:f=>{const c=Math.cos(f.a),sn=Math.sin(f.a),q=(u,v)=>P(f.l+u*c-v*sn,f.d+u*sn+v*c,.12);return`<path d="M${pt(q(-.36,-.3))}L${pt(q(.36,-.3))}L${pt(q(.36,.3))}L${pt(q(-.36,.3))}Z" fill="#c08a5f"/>`+[-.2,0,.2].map(u=>`<path d="M${pt(q(u,-.3))}L${pt(q(u,.3))}" stroke="#9a6a48" stroke-width="1"/>`).join('')+`<path d="M${pt(q(-.36,.3))}L${pt(q(.36,.3))}M${pt(q(-.36,-.3))}L${pt(q(.36,-.3))}" stroke="#76513c" stroke-width="2.2" stroke-linecap="round"/>`},
    dock:f=>{const c=Math.cos(f.a),sn=Math.sin(f.a),q=(u,v)=>P(f.l+u*c-v*sn,f.d+u*sn+v*c,.05);return`<path d="M${pt(q(-.32,-.15))}L${pt(q(.36,-.15))}L${pt(q(.36,.15))}L${pt(q(-.32,.15))}Z" fill="#c08a5f"/>`+[-.1,.1,.3].map(u=>`<path d="M${pt(q(u,-.15))}L${pt(q(u,.15))}" stroke="#9a6a48" stroke-width=".9"/>`).join('')},
    flowers:f=>{const c=tones[f.tone]||tones.pink;return ellipse(f.l,f.d,0,f.r,'fill="#7fae5f"')+Array.from({length:8},(_,i)=>{const a=i*2.4,r=f.r*(.15+.65*((i*37)%10)/10),[x,y]=P(f.l+Math.cos(a)*r,f.d+Math.sin(a)*r,.08);return`<circle cx="${f1(x)}" cy="${f1(y)}" r="2.1" fill="${c[i%2]}"/><circle cx="${f1(x)}" cy="${f1(y)}" r=".7" fill="#fff6dc"/>`}).join('')},
    hill:f=>{const [bx,by]=P(f.l,f.d,0),[tx,ty]=P(f.l,f.d,f.h),rb=f.r*S,rt=f.r*.68*S;
      const side=`<path d="M${f1(bx-rb)} ${f1(by)}A${f1(rb)} ${f1(rb*K)} 0 0 0 ${f1(bx+rb)} ${f1(by)}L${f1(tx+rt)} ${f1(ty)}A${f1(rt)} ${f1(rt*K)} 0 0 1 ${f1(tx-rt)} ${f1(ty)}Z" fill="url(#${id}-hill)"/>`;
      const stairs=[0,1,2,3].map(i=>{const t=i/3,[x,y]=P(f.l+f.r*.42*(1-t*.3),f.d+f.r*(.95-t*.4),f.h*t*.9);return`<rect x="${f1(x-4.2)}" y="${f1(y-1.6)}" width="8.4" height="3.2" rx="1" fill="#e2d2ad"/><rect x="${f1(x-4.2)}" y="${f1(y+.8)}" width="8.4" height=".9" fill="#b9a57d"/>`}).join('');
      const spring=f.spring?ellipse(f.l-.22,f.d+.12,f.h,.2,`fill="url(#${id}-water)"`)+(()=>{const [x,y]=P(f.l-f.r*.55,f.d+f.r*.5,f.h*.95),[x2,y2]=P(f.l-f.r*.75,f.d+f.r*.7,0);return`<path d="M${f1(x)} ${f1(y)}L${f1(x2)} ${f1(y2)}" stroke="#d9f3f3" stroke-width="3" stroke-linecap="round"/>`})():'';
      const look=f.lookout?(()=>{const [x,y]=P(f.l+.1,f.d-.15,f.h);return`<ellipse cx="${f1(x)}" cy="${f1(y+1.2)}" rx="9.5" ry="4.6" fill="#c9ad7c"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="9.5" ry="4.6" fill="#f0d7a2"/><rect x="${f1(x-7)}" y="${f1(y-10)}" width="1.8" height="10" fill="#76513c"/><rect x="${f1(x+5.2)}" y="${f1(y-10)}" width="1.8" height="10" fill="#76513c"/><rect x="${f1(x-7)}" y="${f1(y-10)}" width="14" height="1.8" rx=".6" fill="#a56d43"/>`+(s.mood==='有成就'?`<rect x="${f1(x+2)}" y="${f1(y-21)}" width="1.4" height="15" fill="#76513c"/><path d="M${f1(x+3.4)} ${f1(y-21)}q5 .6 9.5 3q-4.5 2.4 -9.5 3Z" fill="#f1bf5b"/>`:'')})():'';
      return shadow(f.l,f.d,f.r*1.02)+side+`<ellipse cx="${f1(tx)}" cy="${f1(ty)}" rx="${f1(rt)}" ry="${f1(rt*K)}" fill="#a6cf88"/><ellipse cx="${f1(tx-rt*.22)}" cy="${f1(ty-rt*K*.22)}" rx="${f1(rt*.6)}" ry="${f1(rt*K*.5)}" fill="#c3e0a2" opacity=".75"/>`+stairs+spring+look},
    rock:f=>{const [x,y]=P(f.l,f.d,0),r=4+f.s*13,[top,side,lit]=f.dark?['#8b919b','#5f6670','#b4bac2']:['#c3cbbd','#93a08f','#e2e8dc'];return shadow(f.l,f.d,r/S*.8)+`<path d="M${f1(x-r)} ${f1(y)}L${f1(x-r*.62)} ${f1(y-r*.88)}L${f1(x+r*.3)} ${f1(y-r*1.04)}L${f1(x+r)} ${f1(y-r*.3)}L${f1(x+r*.8)} ${f1(y+r*.12)}Z" fill="${side}"/><path d="M${f1(x-r*.62)} ${f1(y-r*.88)}L${f1(x+r*.3)} ${f1(y-r*1.04)}L${f1(x+r*.55)} ${f1(y-r*.55)}L${f1(x-r*.45)} ${f1(y-r*.4)}Z" fill="${top}"/><path d="M${f1(x-r*.55)} ${f1(y-r*.8)}L${f1(x+r*.2)} ${f1(y-r*.95)}" stroke="${lit}" stroke-width="1.1" stroke-linecap="round"/>`},
    house:f=>{const [x,y]=P(f.l,f.d,0),w=10,h=11,dep=6;return shadow(f.l,f.d,.45)+`<rect x="${f1(x-w)}" y="${f1(y-h)}" width="${w*2}" height="${h}" fill="#f3e3c3"/><rect x="${f1(x-w)}" y="${f1(y-2.4)}" width="${w*2}" height="2.4" fill="#d9c49e"/><path d="M${f1(x-w-2)} ${f1(y-h)}L${f1(x)} ${f1(y-h-10)}L${f1(x+w+2)} ${f1(y-h)}Z" fill="#e98598"/><path d="M${f1(x)} ${f1(y-h-10)}L${f1(x+w+2)} ${f1(y-h)}L${f1(x+w+2)} ${f1(y-h-dep)}L${f1(x+2)} ${f1(y-h-10-dep)}Z" fill="#c9667a"/><path d="M${f1(x-w-2)} ${f1(y-h)}L${f1(x)} ${f1(y-h-10)}" stroke="#ffd1d8" stroke-width="1.2" stroke-linecap="round"/><rect x="${f1(x-2.6)}" y="${f1(y-7.4)}" width="5.2" height="7.4" rx="2.4" fill="#8a5a3c"/><rect x="${f1(x+4)}" y="${f1(y-8.6)}" width="4.2" height="3.8" rx=".6" fill="#bfe3ee"/><rect x="${f1(x+5)}" y="${f1(y-h-14)}" width="2.6" height="6" fill="#b06d5a"/>`},
    haystack:f=>{const [x,y]=P(f.l,f.d,0);return shadow(f.l,f.d,.26)+`<path d="M${f1(x-6.5)} ${f1(y)}Q${f1(x-6.5)} ${f1(y-12)} ${f1(x)} ${f1(y-12)}Q${f1(x+6.5)} ${f1(y-12)} ${f1(x+6.5)} ${f1(y)}Z" fill="#f1cf6b"/><path d="M${f1(x)} ${f1(y-12)}Q${f1(x+6.5)} ${f1(y-12)} ${f1(x+6.5)} ${f1(y)}L${f1(x+1)} ${f1(y)}Z" fill="#d6ad4c"/><path d="M${f1(x-4)} ${f1(y-5)}h6M${f1(x-3)} ${f1(y-8)}h4" stroke="#c99a3c" stroke-width=".8"/>`},
    umbrella:f=>{const [x,y]=P(f.l,f.d,0);return shadow(f.l+.15,f.d,.42)+`<rect x="${f1(x-.7)}" y="${f1(y-15)}" width="1.4" height="15" fill="#fff1e6"/><path d="M${f1(x-11.5)} ${f1(y-13)}Q${f1(x)} ${f1(y-26)} ${f1(x+11.5)} ${f1(y-13)}Z" fill="#e98598"/><path d="M${f1(x-3.6)} ${f1(y-13)}Q${f1(x-2)} ${f1(y-21.6)} ${f1(x)} ${f1(y-20)}Q${f1(x+2)} ${f1(y-21.6)} ${f1(x+3.6)} ${f1(y-13)}Z" fill="#fff1e6"/><rect x="${f1(x+2)}" y="${f1(y-2)}" width="10" height="4" rx="1.4" fill="#72afbd" transform="rotate(-8 ${f1(x+7)} ${f1(y)})"/>`},
    arch:f=>{const [x,y]=P(f.l,f.d,0);return shadow(f.l,f.d,.55)+`<path d="M${f1(x-13)} ${f1(y)}V${f1(y-9)}A13 12 0 0 1 ${f1(x+13)} ${f1(y-9)}V${f1(y)}H${f1(x+7)}V${f1(y-9)}A7 7 0 0 0 ${f1(x-7)} ${f1(y-9)}V${f1(y)}Z" fill="#7d838d"/><path d="M${f1(x+7)} ${f1(y)}V${f1(y-9)}A7 7 0 0 0 ${f1(x+3)} ${f1(y-15)}" fill="none" stroke="#5f6670" stroke-width="2"/><path d="M${f1(x-12)} ${f1(y-9)}A12 11 0 0 1 ${f1(x+2)} ${f1(y-20.5)}" fill="none" stroke="#b4bac2" stroke-width="2" stroke-linecap="round"/>`},
    tree
  };
  const flatTypes=['beach','field','pond','lake','islet','creek','path','bridge','dock','flowers'];
  const features=L.features.filter(f=>!ATLAS_SKIP.has(f.type)&&!(f.type==='rock'&&f.s<.3)&&!(f.type==='flowers'&&!f.tone)).map(f=>f.type==='lake'?{...f,type:'pond'}:f);
  const ground=flatTypes.flatMap(t=>features.filter(f=>f.type===t).map(f=>draw[f.type](f))).join('');
  const upright=[
    ...features.filter(f=>!flatTypes.includes(f.type)&&draw[f.type]).map(f=>({d:f.d,svg:draw[f.type](f)})),
    ...s.neighbors.map((n,i)=>{const [l,d]=L.slots[i],[x,y]=P(l,d);return{d,svg:`<g class="atlas-neighbor"><title>${animalDefs[n.species].species}（${n.label}）</title>${atlasAnimal(n.species,moodKey,x,y,24)}</g>`}}),
    {d:L.hero[1],svg:(()=>{const [x,y]=P(...L.hero);return`<g role="img" aria-label="${s.animal.species}${s.animal.name}">${atlasAnimal(s.animalKey,moodKey,x,y,38,s.profession?.key||'')}</g>`})()},
    ...(s.profession?[{d:L.sign[1],svg:(()=>{const [x,y]=P(...L.sign);return`<g><title>${s.profession.label}</title>${shadow(...L.sign,.2)}<rect x="${f1(x-1)}" y="${f1(y-16)}" width="2" height="16" fill="#76513c"/><rect x="${f1(x-9)}" y="${f1(y-24)}" width="18" height="11" rx="2" fill="#fff8e8"/><rect x="${f1(x-9)}" y="${f1(y-14.6)}" width="18" height="1.6" fill="${atlasHatColors[s.profession.key]||'#577c8d'}"/><text x="${f1(x)}" y="${f1(y-15.8)}" text-anchor="middle" font-size="8">${s.profession.icon}</text></g>`})()}]:[])
  ].sort((a,b)=>a.d-b.d).map(x=>x.svg).join('');
  const defs=`<defs><radialGradient id="${id}-glow" cx="34%" cy="22%" r="80%"><stop offset="0" stop-color="#fff6dc" stop-opacity=".42"/><stop offset=".55" stop-color="#fff6dc" stop-opacity="0"/><stop offset="1" stop-color="${atlasShade}" stop-opacity=".16"/></radialGradient><linearGradient id="${id}-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e0e4"/><stop offset="1" stop-color="#72afbd"/></linearGradient><linearGradient id="${id}-hill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#93c27b"/><stop offset=".5" stop-color="#76a466"/><stop offset="1" stop-color="#5b8653"/></linearGradient></defs>`;
  return `<g class="atlas-terrain">${defs}${lagoon}${body}${pebbles}${drips}${top}${tufts}${ground}${upright}</g>`;
}
function atlasInsectTally(count){
  const counts=[0,1,2,3].map(k=>Math.floor(count/4)+(k<count%4?1:0)),names=['瓢蟲','蜜蜂','蝴蝶','蚱蜢'];let x=257;
  return counts.map((n,k)=>({n,k})).filter(t=>t.n).reverse().map(({n,k})=>{const w=String(n).length*6.5+20;x-=w;return`<g><title>${names[k]} ${n} 隻</title><svg x="${(x).toFixed(1)}" y="252" width="15" height="15" viewBox="${k*100} 0 100 100"><image href="assets/pixel-insects-v1.png" width="400" height="200" preserveAspectRatio="none"/></svg><text x="${(x+16).toFixed(1)}" y="263.5" class="atlas-count">${n}</text></g>`}).join('');
}
function renderCollection(){
  const groups={};for(const r of data.records)(groups[dateKey(r.at)]??=[]).push(r);
  const entries=Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0]));
  $('#residentLegend').innerHTML=`<strong>${entries.length} 座日常小島</strong><span>每完成一件事，就多一隻昆蟲</span>`;
  const board=$('#archipelago');board.className='atlas-board';
  if(!entries.length){board.innerHTML='<div class="empty-state collection-empty"><img src="assets/pixel-red-panda.png" alt="小熊貓夥伴"><h2>拼圖還在等第一片</h2><p>完成第一件事，今天就會成為生活地圖的一片島嶼。</p></div>';return}
  const pieces=entries.map(([key,rs],index)=>{
    const s=islandSpec(rs,key),date=new Intl.DateTimeFormat('zh-TW',{month:'short',day:'numeric',weekday:'short'}).format(new Date(`${key}T12:00:00`));
    return `<button class="atlas-piece mood-${moodKeys[s.mood]}" data-island-date="${key}" aria-label="${date}，${s.layout.label}，${s.animal.species}，${s.mood}，${s.neighbors.length?`鄰居${s.neighbors.map(n=>animalDefs[n.species].species).join('、')}，`:''}${rs.length} 件事，點擊進入可旋轉 3D 島嶼"><svg viewBox="0 0 340 300" class="atlas-svg" role="img" aria-label="${date}的${s.animal.species}島，${rs.length} 隻昆蟲"><path class="atlas-cut" d="${atlasOutline(index===0)}"/><text x="42" y="49" class="atlas-date">${date}<tspan dx="6" class="atlas-mood">${s.layout.label}</tspan></text><text x="257" y="49" text-anchor="end" class="atlas-open">旋轉看 3D</text>${atlasMap(s,key)}<path d="M43 238H257" class="atlas-divider"/><text x="43" y="263" class="atlas-species">${s.animal.species}<tspan dx="8" class="atlas-mood">${s.mood}</tspan></text><g class="atlas-tally" aria-label="${rs.length} 隻昆蟲"><title>${rs.length} 隻昆蟲</title>${atlasInsectTally(rs.length)}</g></svg></button>`;
  }).join('');
  board.innerHTML=`<div class="atlas-scroll" tabindex="0" role="region" aria-label="每日島嶼拼圖，左右捲動查看更多"><div class="atlas-chain">${pieces}<div class="atlas-next" aria-label="下一座島的位置"><svg viewBox="0 0 190 300" class="atlas-svg"><path class="atlas-cut" d="${atlasOutline(false,true)}"/><path d="M100 137v-18m0 9q-15 0-15-14 15 0 15 14m0-7q0-14 14-14 0 14-14 14" class="atlas-sprout"/><text x="100" y="165" text-anchor="middle" class="atlas-next-title">留給下一天</text><text x="100" y="185" text-anchor="middle" class="atlas-next-copy">下一次紀錄會接上</text></svg></div></div></div><div class="atlas-caption"><span>點一座島，走進那一天</span><span>左右滑動瀏覽群島 ↔</span></div>`;
}
function openIsland3d(key){
  const rs=data.records.filter(r=>dateKey(r.at)===key),s=islandSpec(rs,key),moodKey=moodKeys[s.mood],scene=moodScenes[s.mood],date=new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date(`${key}T12:00:00`));
  islandTurn=0;
  $('#island3dTitle').textContent=date;$('#island3dSummary').textContent=`${s.layout.label}（${s.layout.type}最多） · ${rs.length} 件事 · ${rs.length} 隻昆蟲${rs.length>INSECT_DISPLAY_MAX?`（島上顯示 ${INSECT_DISPLAY_MAX} 隻）`:''} · ${scene.weather} · ${scene.story}${s.profession?` · ${s.profession.label}`:''}${s.neighbors.length?` · 鄰居：${s.neighbors.map(n=>`${animalDefs[n.species].species}（${n.label}）`).join('、')}`:''}`;
  $('#island3dScene').className=`island-3d-scene scene-${moodKey}`;
  $('#islandWeather').innerHTML='';
  $('#island3dWorld').className=`island-3d-world mood-${moodKey}`;
  setIslandTurn(0,false);
  const realIsland={mood:s.mood,moodKey,animalKey:s.animalKey,count:rs.length,key,neighbors:s.neighbors,layout:s.layout,residentSignature:`${s.layout.biome}:${s.layout.size}|`+s.neighbors.map(n=>`${n.kind}:${n.species}`).join('|'),professionKey:s.profession?.key||'',professionLabel:s.profession?.label||''};
  if(window.realIsland3d)window.realIsland3d.open(realIsland);else window.pendingIsland3d=realIsland;
  $('#island3dDialog').showModal();
}

function renderSettings(){
  const mode=data.settings.professionMode||'auto',today=data.records.filter(r=>sameDay(r.at)),detected=professionFor(today);
  $('#professionSelect').value=mode;
  $('#professionSettingHint').textContent=mode==='none'?'職業服裝已關閉，主角會保留原本模樣。':mode==='auto'?(detected?`已偵測：${detected.icon} ${detected.label}，${detected.reason}。判斷只在這個瀏覽器進行。`:'今天還沒有「工作」類紀錄；完成工作後就會自動換裝。'):`目前固定穿著：${professionDefs[mode].icon} ${professionDefs[mode].label}。`;
  $('#wardrobePreview').innerHTML=Object.entries(professionDefs).map(([key,def])=>`<button type="button" class="wardrobe-option ${mode===key||mode==='auto'&&detected?.key===key?'active':''}" data-profession-pick="${key}" title="選擇${def.label}"><img class="wardrobe-img" src="assets/professions/${key}.png" alt="${def.mascot}${def.label}" loading="lazy"><span class="wardrobe-label">${def.label}</span></button>`).join('');
}

function renderInsights(){
  const now=new Date(),weekAgo=new Date(Date.now()-6*864e5);weekAgo.setHours(0,0,0,0);const recent=data.records.filter(r=>new Date(r.at)>=weekAgo),today=data.records.filter(r=>sameDay(r.at));
  const thisMonth=data.records.filter(r=>{const d=new Date(r.at);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()});const activeDays=new Set(thisMonth.map(r=>dateKey(r.at))).size;
  $('#statGrid').innerHTML=`<article class="stat-card"><strong>${today.length}</strong><span>今天完成</span></article><article class="stat-card"><strong>${recent.length}</strong><span>近 7 天完成</span></article><article class="stat-card"><strong>${thisMonth.length}</strong><span>本月完成</span></article><article class="stat-card"><strong>${activeDays}</strong><span>本月有紀錄天數</span></article>`;
  const typeCount=countMap(recent.map(r=>data.items.find(i=>i.id===r.itemId)?.type||'喜歡')),typeMax=Math.max(1,...Object.values(typeCount));$('#typeChart').innerHTML=Object.keys(typeDefs).map(t=>`<div class="chart-row"><span>${typeDefs[t].icon} ${t}</span><div class="chart-track"><i style="width:${(typeCount[t]||0)/typeMax*100}%;background:${typeDefs[t].color}"></i></div><strong>${typeCount[t]||0}</strong></div>`).join('');
  const moodCount=countMap(recent.map(r=>normalizeMood(r.mood))),moodMax=Math.max(1,...Object.values(moodCount));$('#moodChart').innerHTML=Object.keys(moodDefs).map(m=>`<div class="chart-row"><span>${moodDefs[m].icon} ${m}</span><div class="chart-track"><i style="width:${(moodCount[m]||0)/moodMax*100}%;background:${m==='不開心'?'#9a91a8':m==='疲累'?'#8eaed6':'#efb56e'}"></i></div><strong>${moodCount[m]||0}</strong></div>`).join('');
  const rows=data.items.map(i=>({i,r:rhythm(i),count:recordsFor(i.id).length})).sort((a,b)=>b.count-a.count),rhythmMax=Math.max(1,...rows.map(x=>x.r||0));$('#rhythmList').innerHTML=rows.length?rows.map(({i,r,count})=>`<div class="rhythm-row"><div class="item-icon" style="--tone:${typeDefs[i.type].color}">${esc(i.icon)}</div><div><strong>${esc(i.name)}</strong><div class="card-meta">${count} 次 · ${i.type}</div></div><div class="rhythm-bar"><i style="width:${r?r/rhythmMax*100:0}%;background:${typeDefs[i.type].color}"></i></div><div class="rhythm-meta">${r?`通常 ${r} 天`:'再記一次就能計算'}</div></div>`).join(''):'<p class="card-meta">有兩次以上的活動紀錄後，這裡會出現你的節奏。</p>';
}

function populateRecordItems(){const current=$('#recordItem').value;$('#recordItem').innerHTML=data.items.map(i=>`<option value="${i.id}">${esc(i.icon)} ${esc(i.name)} · ${esc(i.type)}</option>`).join('');if(data.items.some(i=>i.id===current))$('#recordItem').value=current}
function populateResidentOptions(){const select=$('#itemResident'),current=select.value||'auto';select.innerHTML='<option value="auto">✨ 依活動名稱自動判斷</option>'+Object.entries(residentKindDefs).map(([key,def])=>`<option value="${key}">${def.emoji} ${def.label}</option>`).join('');select.value=(current==='auto'||residentKindDefs[current])?current:'auto'}
function openItem(item=null){$('#itemForm').reset();populateResidentOptions();$('#itemId').value=item?.id||'';$('#itemName').value=item?.name||'';$('#itemType').value=item?.type||'喜歡';$('#itemIcon').value=item?.icon||'💗';$('#itemCategory').value=item?.category||'';$('#itemResident').value=item?.residentKind||'auto';$('#itemDialogTitle').textContent=item?'調整活動':'加入小島';$('#itemDialogEyebrow').textContent=item?'編輯活動':'新的活動';$('#deleteItemBtn').hidden=!item;$('#itemDialog').showModal()}
function openRecord(itemId=''){if(!data.items.length){showToast('請先建立一個活動');openItem();return}populateRecordItems();$('#recordItem').value=itemId&&data.items.some(i=>i.id===itemId)?itemId:data.items[0].id;$('#recordDate').value=localDateTime();$('#recordNote').value='';$('input[name="recordMood"][value="普通"]').checked=true;$('#recordDialog').showModal()}
function openDetail(item){const rs=recordsFor(item.id),last=rs[0],r=rhythm(item);$('#detailContent').innerHTML=`<div class="modal-head"><div><p class="eyebrow">${typeDefs[item.type].icon} ${item.type}</p><h2>${esc(item.name)}</h2></div><button class="round-button" data-close-detail>×</button></div><div class="detail-summary"><div class="mini-stat"><strong>${last?elapsed(last.at).n:'—'}</strong><span>${last?elapsed(last.at).unit:'尚未記錄'}</span></div><div class="mini-stat"><strong>${rs.length}</strong><span>累積次數</span></div><div class="mini-stat"><strong>${r??'—'}</strong><span>${r?'通常間隔天數':'等待更多紀錄'}</span></div></div><div class="detail-history">${rs.length?rs.map(x=>`<div class="detail-record"><div><strong>${displayDate(x.at)}</strong><small> · ${moodDefs[normalizeMood(x.mood)].icon} ${normalizeMood(x.mood)}${x.note?` · ${esc(x.note)}`:''}</small></div><button class="delete-record" data-delete-record="${x.id}">×</button></div>`).join(''):'<p class="card-meta">還沒有紀錄。</p>'}</div><div class="modal-actions"><button class="soft-button" data-detail-edit="${item.id}">編輯活動</button><span></span><button class="primary-button" data-detail-log="${item.id}">完成一次</button></div>`;$('#detailDialog').showModal()}
function showToast(text,action=''){clearTimeout(toastTimer);$('#toastText').textContent=text;$('#toastAction').hidden=!action;$('#toastAction').textContent=action;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4200)}
function switchView(target){$$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===target));$$('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.target===target));scrollTo({top:0,behavior:'smooth'});window.realIsland3d?.cancelThumbnails()}

$('#itemForm').addEventListener('submit',e=>{e.preventDefault();const id=$('#itemId').value,item={id:id||uid(),name:$('#itemName').value.trim(),type:$('#itemType').value,icon:$('#itemIcon').value,category:$('#itemCategory').value.trim(),residentKind:$('#itemResident').value,createdAt:new Date().toISOString()};if(id){const old=data.items.find(i=>i.id===id);Object.assign(old,item,{createdAt:old.createdAt})}else data.items.push(item);$('#itemDialog').close();save();showToast(id?'活動已更新':'活動已加入小島')});
$('#recordForm').addEventListener('submit',e=>{e.preventDefault();const rec={id:uid(),itemId:$('#recordItem').value,at:new Date($('#recordDate').value).toISOString(),mood:$('input[name="recordMood"]:checked').value,note:$('#recordNote').value.trim()};data.records.push(rec);undoRecord=rec;$('#recordDialog').close();save();showToast('一位小居民住進今天的島了','復原')});
$('#deleteItemBtn').onclick=()=>{const id=$('#itemId').value;if(confirm('刪除這個活動和它的全部紀錄？過去每天的小島也會跟著改變。')){data.items=data.items.filter(i=>i.id!==id);data.records=data.records.filter(r=>r.itemId!==id);$('#itemDialog').close();save();showToast('活動已刪除')}};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b){if(b.matches('[data-log]'))openRecord(b.dataset.log);else if(b.matches('[data-edit]'))openItem(data.items.find(i=>i.id===b.dataset.edit));else if(b.matches('[data-delete-record]')){if(confirm('刪除這次紀錄？當天的小島會重新生成。')){data.records=data.records.filter(r=>r.id!==b.dataset.deleteRecord);if($('#detailDialog').open)$('#detailDialog').close();save();showToast('紀錄已刪除')}}else if(b.matches('[data-close-detail]'))$('#detailDialog').close();else if(b.matches('[data-detail-log]')){$('#detailDialog').close();openRecord(b.dataset.detailLog)}else if(b.matches('[data-detail-edit]')){$('#detailDialog').close();openItem(data.items.find(i=>i.id===b.dataset.detailEdit))}else if(b.matches('[data-island-date]'))openIsland3d(b.dataset.islandDate);else if(b.matches('[data-type]')){activeType=b.dataset.type;renderHome()}else if(b.matches('[data-profession-pick]')){data.settings.professionMode=b.dataset.professionPick;save();showToast(`已換上${professionDefs[b.dataset.professionPick].label}服裝`)}else if(b.matches('.nav-button'))switchView(b.dataset.target);else if(b.matches('[data-go]'))switchView(b.dataset.go);return}const card=e.target.closest('[data-item-card]');if(card)openDetail(data.items.find(i=>i.id===card.dataset.itemCard))});
$('#addItemBtn').onclick=$('#emptyAddBtn').onclick=()=>openItem();$('#quickRecordBtn').onclick=()=>openRecord();$('#manualRecordBtn').onclick=()=>openRecord();$('#searchInput').oninput=renderHome;$('#sortSelect').onchange=renderHome;
$('#themeBtn').onclick=()=>{data.settings.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';save()};$('#themeSelect').onchange=e=>{data.settings.theme=e.target.value;save()};$('#professionSelect').onchange=e=>{data.settings.professionMode=e.target.value;save();showToast(e.target.value==='auto'?'已開啟自動職業換裝':e.target.value==='none'?'職業服裝已關閉':`已換上${professionDefs[e.target.value].label}服裝`)};matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(data.settings.theme==='system')applyTheme()});
$('#toastAction').onclick=()=>{if(undoRecord){data.records=data.records.filter(r=>r.id!==undoRecord.id);undoRecord=null;save();$('#toast').classList.remove('show')}};
$('#exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify({...data,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`距今小島備份-${dateKey(new Date())}.json`;a.click();URL.revokeObjectURL(a.href);showToast('備份已下載')};
$('#importBtn').onclick=()=>$('#importFile').click();$('#importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const incoming=JSON.parse(await file.text());if(!Array.isArray(incoming.items)||!Array.isArray(incoming.records))throw Error();if(confirm(`匯入 ${incoming.items.length} 個活動與 ${incoming.records.length} 次紀錄，並取代目前資料？`)){data=normalizeData(incoming);save();showToast('小島備份已還原')}}catch{alert('這不是有效的「距今小島」備份。')}e.target.value=''};
$('#clearBtn').onclick=async()=>{if(!confirm('永久清除這個帳號在雲端與這個瀏覽器裡的所有活動、次數、心情和每日小島？此動作無法復原。'))return;try{if(window.diaryCloud?.user)await window.diaryCloud.removeCloud()}catch(error){alert(`雲端資料沒有清除：${error.message}`);return}data=structuredClone(defaultData);localStorage.removeItem(STORAGE_KEY);renderAll();showToast('小島已清空')};
$$('.close-modal').forEach(b=>b.addEventListener('click',e=>e.currentTarget.closest('dialog').close()));
let islandDrag=null,islandTurn=0;
const islandDirections=['南岸','西岸','北岸','東岸'];
function updateIslandDirection(){const index=((Math.round(islandTurn/90)%4)+4)%4,label=islandDirections[index],scene=$('#island3dScene'),reset=$('#resetIslandView');$('#islandTurnLabel').textContent=label;$$('#islandTurnDots i').forEach((dot,i)=>dot.classList.toggle('active',i===index));scene.setAttribute('aria-label',`正在查看${label}，可拖曳或使用左右方向鍵旋轉真正的 3D 動物島`);reset.setAttribute('aria-label',index===0?'目前是南岸視角':`目前是${label}視角，點擊回到南岸`)}
function setIslandTurn(next,animate=true){islandTurn=next;window.realIsland3d?.setTurn(islandTurn);const world=$('#island3dWorld');world.classList.toggle('turning',animate);world.style.setProperty('--turn',`${islandTurn}deg`);world.style.setProperty('--counter',`${-(45+islandTurn)}deg`);updateIslandDirection()}
function snapIslandTurn(){setIslandTurn(Math.round(islandTurn/90)*90)}
$('#island3dScene').addEventListener('pointerdown',e=>{islandDrag={x:e.clientX,start:islandTurn};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.add('dragging')});
$('#island3dScene').addEventListener('pointermove',e=>{if(!islandDrag)return;setIslandTurn(islandDrag.start+(e.clientX-islandDrag.x)*.7,false)});
$('#island3dScene').addEventListener('pointerup',e=>{if(!islandDrag)return;islandDrag=null;e.currentTarget.classList.remove('dragging');snapIslandTurn()});
$('#island3dScene').addEventListener('pointercancel',e=>{islandDrag=null;e.currentTarget.classList.remove('dragging');snapIslandTurn()});
$('#island3dScene').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();setIslandTurn(Math.round(islandTurn/90)*90+(e.key==='ArrowLeft'?-90:90))});
$('#turnIslandLeft').onclick=()=>setIslandTurn(Math.round(islandTurn/90)*90-90);
$('#turnIslandRight').onclick=()=>setIslandTurn(Math.round(islandTurn/90)*90+90);
$('#resetIslandView').onclick=()=>setIslandTurn(0);
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js?v=38',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
// ---- Account gate: the diary opens only after sign-in. On localhost without a cloud config it runs as an unsynced preview.
let authMode='signin';
const cloud=window.diaryCloud;
function setAuthMode(mode){
  authMode=mode;const signup=mode==='signup',recovery=mode==='recovery',forgot=mode==='forgot';
  $$('#authTabs [data-auth-mode]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.authMode===mode)));
  $('#authTabs').hidden=recovery||forgot;$('#authEmailField').hidden=recovery;$('#authPassword').closest('.field').hidden=forgot;
  $('#authTitle').textContent=recovery?'設定新密碼':forgot?'重設密碼':signup?'建立你的小島帳號':'登入你的小島';
  $('#authLead').textContent=recovery?'輸入新的密碼，完成後就會進入小島。':forgot?'輸入註冊時的 Email，我們會寄一封重設密碼的信。':'登入後，手機和電腦會看到同一份紀錄。';
  $('#authPasswordLabel').textContent=recovery?'新密碼':'密碼';$('#authPasswordHint').hidden=!(signup||recovery);
  $('#authPassword').autocomplete=signup||recovery?'new-password':'current-password';
  $('#authSubmit').textContent=recovery?'更新密碼':forgot?'寄送重設信':signup?'註冊並進入':'登入';
  $('#authForgot').textContent=forgot?'回到登入':'忘記密碼？';$('#authForgot').hidden=recovery||signup;authNotice('');
}
function authNotice(text,kind='error'){const el=$('#authMessage');el.hidden=!text;el.textContent=text;el.dataset.kind=kind}
function showAuth(mode='signin'){document.body.classList.add('auth-locked');$('#authGate').hidden=false;setAuthMode(mode);setTimeout(()=>(mode==='recovery'?$('#authPassword'):$('#authEmail')).focus(),50)}
function renderAccount(){
  const user=cloud?.user,labels={idle:'已登入',syncing:'同步中…',pending:'等待上傳…',synced:'已同步',error:'同步失敗，恢復連線後會再試'};
  $('#accountStatus').textContent=user?`${user.email} · ${labels[cloud.state]||''}`:cloud?.configured()?'尚未登入':'本機預覽：雲端尚未設定，資料只存在這個瀏覽器';
  $('#signOutBtn').hidden=!user;
}
async function enterApp(){
  document.body.classList.remove('auth-locked');$('#authGate').hidden=true;
  if(cloud?.user){try{data=normalizeData(await cloud.start(data));localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}catch(error){showToast(`暫時無法同步（${error.message}），先顯示這台裝置的紀錄`)}}
  renderAll();renderAccount();
}
$$('#authTabs [data-auth-mode]').forEach(b=>b.addEventListener('click',()=>setAuthMode(b.dataset.authMode)));
$('#authForgot').onclick=()=>setAuthMode(authMode==='forgot'?'signin':'forgot');
$('#authForm').addEventListener('submit',async e=>{
  e.preventDefault();const email=$('#authEmail').value.trim(),password=$('#authPassword').value,button=$('#authSubmit');
  if(authMode!=='recovery'&&!/^\S+@\S+\.\S+$/.test(email))return authNotice('請輸入正確的 Email');
  if(authMode!=='forgot'&&password.length<6)return authNotice('密碼至少要 6 個字元');
  button.disabled=true;authNotice('');
  try{
    if(authMode==='forgot'){await cloud.resetPassword(email);authNotice('重設信已寄出，請到信箱點連結。','ok');return}
    if(authMode==='recovery'){await cloud.updatePassword(password);await cloud.loadUser();showToast('密碼已更新');return enterApp()}
    const session=authMode==='signup'?await cloud.signUp(email,password):await cloud.signIn(email,password);
    if(!session){setAuthMode('signin');$('#authEmail').value=email;authNotice('註冊成功！請到信箱點驗證連結，再回來登入。','ok');return}
    $('#authPassword').value='';enterApp();
  }catch(error){authNotice(error.message)}finally{button.disabled=false}
});
$('#signOutBtn').onclick=async()=>{if(!confirm('登出後需要重新登入才能看到紀錄，確定登出？'))return;await cloud.signOut();showAuth('signin')};
cloud?.onChange(()=>renderAccount());
(function boot(){
  if(!cloud||!cloud.configured()){renderAll();renderAccount();return}
  if(cloud.takeRecovery())return showAuth('recovery');
  // First visit on this device (never signed in here) opens on sign-up; returning devices open on sign-in.
  if(!cloud.user){let known=false;try{known=!!JSON.parse(localStorage.getItem('lastnote.cloud.sync')||'null')?.owner}catch{}return showAuth(known?'signin':'signup')}
  enterApp();
})();
