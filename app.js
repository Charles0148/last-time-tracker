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
function loadData(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY));if(!v||!Array.isArray(v.items)||!Array.isArray(v.records))throw Error();const merged={...structuredClone(defaultData),...v,version:5,moments:Array.isArray(v.moments)?v.moments:[],settings:{...defaultData.settings,...v.settings}};merged.items=merged.items.map(i=>({...i,type:inferType(i),residentKind:i.residentKind||'auto'}));merged.records=merged.records.map(r=>({...r,mood:normalizeMood(r.mood||merged.moments.find(m=>m.id===r.momentId)?.mood)}));return merged}catch{return structuredClone(defaultData)}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));renderAll()}
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
  return{count:records.length,mood,animalKey,animal,residents,neighbors,profession:professionFor(records),decor:records.length===0?'':records.length<3?'🌱':records.length<6?'🌼':records.length<9?'🌳':'🚩'};
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
  $('#todaySummary').textContent=today.length?`今天完成了 ${today.length} 件事，島上飛來 ${today.length} 隻昆蟲${spec.neighbors.length?`，住進 ${spec.neighbors.length} 位活動鄰居`:''}；主要心情是「${spec.mood}」${spec.profession?`，今天像一位${spec.profession.label}工作者`:''}。`:'今天還沒有紀錄。做完第一件事，主角動物就會登島，並飛來第一隻昆蟲。';
  const homeIsland={mood:spec.mood,moodKey:moodKeys[spec.mood]||'neutral',animalKey:spec.animalKey,count:today.length,key,neighbors:spec.neighbors,residentSignature:spec.neighbors.map(n=>`${n.kind}:${n.species}`).join('|'),professionKey:spec.profession?.key||'',professionLabel:spec.profession?.label||'',empty:today.length===0};
  $('#homeIslandScene').setAttribute('aria-label',today.length?`今天真正的 3D 動物島，主角${spec.animal.species}心情${spec.mood}，${spec.neighbors.length} 位活動鄰居，${today.length} 隻昆蟲`:'今天真正的 3D 動物島，正在等待第一位居民');
  window.currentHomeIsland3d=homeIsland;if(window.realIsland3d)window.realIsland3d.preview(homeIsland);else window.pendingHomeIsland3d=homeIsland;
  $('#islandCaption').textContent=today.length?`主角：${spec.animal.name}（${spec.animal.species} · ${spec.mood}）${spec.profession?` · ${spec.profession.icon} ${spec.profession.label}`:''} ${spec.neighbors.length?` · ${spec.neighbors.length} 位活動鄰居`:''} · ${today.length} 隻昆蟲`:'等待第一位居民登島';
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
function atlasMap(s,key){
  const tree=(x,y)=>`<g transform="translate(${x} ${y})"><circle r="13" fill="#527f62"/><circle cx="-3" cy="-3" r="10" fill="#79ac77"/><circle cx="-5" cy="-6" r="4" fill="#a1c58d"/></g>`;
  // Same cap and kind order (i%4) as the 3D island: up to 12 on an inner ring, the rest on an outer ring.
  const shown=Math.min(s.count,INSECT_DISPLAY_MAX),inner=Math.min(shown,12),outer=shown-inner;
  const bugs=Array.from({length:shown},(_,i)=>{
    const ring=i<inner?0:1,n=ring?outer:inner,j=ring?i-inner:i,a=j/n*Math.PI*2-(ring?.35:.6),x=150+Math.cos(a)*(ring?96:69),y=151+Math.sin(a)*(ring?74:56);
    return `<svg class="atlas-bug" x="${x-8}" y="${y-8}" width="16" height="16" viewBox="${(i%4)*100} 0 100 100"><image href="assets/pixel-insects-v1.png" width="400" height="200" preserveAspectRatio="none"/></svg>`;
  }).join('');
  const neighborSpots=[[96,120],[160,80],[196,162],[108,184]];
  const neighbors=s.neighbors.map((n,i)=>`<image class="atlas-neighbor" href="${animalDefs[n.species].src}" x="${neighborSpots[i][0]-15}" y="${neighborSpots[i][1]-17}" width="30" height="34"><title>${animalDefs[n.species].species}（${n.label}）</title></image>`).join('');
  return `<g class="atlas-terrain" transform="translate(18 12) scale(.9)">
    <path d="M74 106 106 78 163 72 211 91 234 130 222 182 184 218 122 224 76 201 58 155Z" fill="#f7e6b7"/>
    <path d="M80 108 109 85 161 79 204 97 226 133 215 177 181 210 123 216 83 194 65 155Z" fill="var(--atlas-land)"/>
    <path d="M82 109 110 85 160 80 180 101 153 115 108 129 66 153Z" fill="#d9e7af" opacity=".75"/>
    <path d="M147 81C121 110 171 119 139 142S92 158 106 188L124 217" fill="none" stroke="#82c6d0" stroke-width="11" stroke-linecap="round"/>
    <ellipse cx="112" cy="178" rx="22" ry="15" fill="#82c6d0"/>
    <path d="M103 178q9 6 17 0" fill="none" stroke="#c9eeea" stroke-width="2"/>
    <g transform="translate(143 136) rotate(30)"><rect x="-18" y="-10" width="36" height="20" rx="2" fill="#bc8860"/><path d="M-12-9v18m8-18v18m8-18v18m8-18v18" stroke="#ead1a0" stroke-width="3"/><path d="M-20-10h40m-40 20h40" stroke="#90634d" stroke-width="3"/></g>
    ${tree(98,116)}${tree(200,121)}
    <path d="m83 175 7-7 12 3 2 10-13 6Z m97-68 7-7 10 4-2 10-12 2Z" fill="#a0b29b" stroke="#809681" stroke-width="1.2"/>
    <g fill="#fff1cc"><circle cx="118" cy="102" r="2.5"/><circle cx="125" cy="108" r="2.5"/><circle cx="113" cy="109" r="2.5"/></g>
    ${neighbors}
    <image href="${s.animal.src}" x="141" y="133" width="62" height="70" aria-label="${s.animal.species}${s.animal.name}"/>
    ${s.profession?`<g><title>${s.profession.label}</title><circle cx="212" cy="148" r="10" fill="#fff8e8"/><text x="212" y="152" text-anchor="middle" font-size="12">${s.profession.icon}</text></g>`:''}
    ${bugs}
  </g>`;
}
function renderCollection(){
  const groups={};for(const r of data.records)(groups[dateKey(r.at)]??=[]).push(r);
  const entries=Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0]));
  $('#residentLegend').innerHTML=`<strong>${entries.length} 座日常小島</strong><span>每完成一件事，就多一隻昆蟲</span>`;
  const board=$('#archipelago');board.className='atlas-board';
  if(!entries.length){board.innerHTML='<div class="empty-state collection-empty"><img src="assets/pixel-red-panda.png" alt="小熊貓夥伴"><h2>拼圖還在等第一片</h2><p>完成第一件事，今天就會成為生活地圖的一片島嶼。</p></div>';return}
  const pieces=entries.map(([key,rs],index)=>{
    const s=islandSpec(rs,key),date=new Intl.DateTimeFormat('zh-TW',{month:'short',day:'numeric',weekday:'short'}).format(new Date(`${key}T12:00:00`));
    return `<button class="atlas-piece mood-${moodKeys[s.mood]}" data-island-date="${key}" aria-label="${date}，${s.animal.species}，${s.mood}，${s.neighbors.length?`鄰居${s.neighbors.map(n=>animalDefs[n.species].species).join('、')}，`:''}${rs.length} 件事，點擊進入可旋轉 3D 島嶼"><svg viewBox="0 0 340 300" class="atlas-svg" role="img" aria-label="${date}的${s.animal.species}島，${rs.length} 隻昆蟲"><path class="atlas-cut" d="${atlasOutline(index===0)}"/><text x="42" y="49" class="atlas-date">${date}</text><text x="257" y="49" text-anchor="end" class="atlas-open">看 3D ↗</text>${atlasMap(s,key)}<path d="M43 238H257" class="atlas-divider"/><text x="43" y="263" class="atlas-species">${s.animal.species}<tspan dx="8" class="atlas-mood">${s.mood}</tspan></text><text x="257" y="263" text-anchor="end" class="atlas-count">${rs.length} 隻昆蟲${rs.length>INSECT_DISPLAY_MAX?`（顯示 ${INSECT_DISPLAY_MAX}）`:''}</text></svg></button>`;
  }).join('');
  board.innerHTML=`<div class="atlas-scroll" tabindex="0" role="region" aria-label="每日島嶼拼圖，左右捲動查看更多"><div class="atlas-chain">${pieces}<div class="atlas-next" aria-label="下一座島的位置"><svg viewBox="0 0 190 300" class="atlas-svg"><path class="atlas-cut" d="${atlasOutline(false,true)}"/><path d="M100 137v-18m0 9q-15 0-15-14 15 0 15 14m0-7q0-14 14-14 0 14-14 14" class="atlas-sprout"/><text x="100" y="165" text-anchor="middle" class="atlas-next-title">留給下一天</text><text x="100" y="185" text-anchor="middle" class="atlas-next-copy">下一次紀錄會接上</text></svg></div></div></div><div class="atlas-caption"><span>點一座島，走進那一天</span><span>左右滑動瀏覽群島 ↔</span></div>`;
}
function openIsland3d(key){
  const rs=data.records.filter(r=>dateKey(r.at)===key),s=islandSpec(rs,key),moodKey=moodKeys[s.mood],scene=moodScenes[s.mood],date=new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date(`${key}T12:00:00`));
  islandTurn=0;
  $('#island3dTitle').textContent=date;$('#island3dSummary').textContent=`${rs.length} 件事 · ${rs.length} 隻昆蟲${rs.length>INSECT_DISPLAY_MAX?`（島上顯示 ${INSECT_DISPLAY_MAX} 隻）`:''} · ${scene.weather} · ${scene.story}${s.profession?` · ${s.profession.label}`:''}${s.neighbors.length?` · 鄰居：${s.neighbors.map(n=>`${animalDefs[n.species].species}（${n.label}）`).join('、')}`:''}`;
  $('#island3dScene').className=`island-3d-scene scene-${moodKey}`;
  $('#islandWeather').innerHTML='';
  $('#island3dWorld').className=`island-3d-world mood-${moodKey}`;
  setIslandTurn(0,false);
  const realIsland={mood:s.mood,moodKey,animalKey:s.animalKey,count:rs.length,key,neighbors:s.neighbors,residentSignature:s.neighbors.map(n=>`${n.kind}:${n.species}`).join('|'),professionKey:s.profession?.key||'',professionLabel:s.profession?.label||''};
  if(window.realIsland3d)window.realIsland3d.open(realIsland);else window.pendingIsland3d=realIsland;
  $('#island3dDialog').showModal();
}

function renderSettings(){
  const mode=data.settings.professionMode||'auto',today=data.records.filter(r=>sameDay(r.at)),detected=professionFor(today);
  $('#professionSelect').value=mode;
  $('#professionSettingHint').textContent=mode==='none'?'職業服裝已關閉，主角會保留原本模樣。':mode==='auto'?(detected?`已偵測：${detected.icon} ${detected.label}，${detected.reason}。判斷只在這個瀏覽器進行。`:'今天還沒有「工作」類紀錄；完成工作後就會自動換裝。'):`目前固定穿著：${professionDefs[mode].icon} ${professionDefs[mode].label}。`;
  $('#wardrobePreview').innerHTML=Object.entries(professionDefs).map(([key,def])=>`<button type="button" class="wardrobe-option ${mode===key||mode==='auto'&&detected?.key===key?'active':''}" data-profession-pick="${key}" title="選擇${def.label}"><span class="profession-sprite role-${key}" role="img" aria-label="${def.mascot}${def.label}"></span><span class="wardrobe-label">${def.label}</span></button>`).join('');
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
$('#importBtn').onclick=()=>$('#importFile').click();$('#importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const incoming=JSON.parse(await file.text());if(!Array.isArray(incoming.items)||!Array.isArray(incoming.records))throw Error();if(confirm(`匯入 ${incoming.items.length} 個活動與 ${incoming.records.length} 次紀錄，並取代目前資料？`)){data={...structuredClone(defaultData),...incoming,version:5,moments:Array.isArray(incoming.moments)?incoming.moments:[],settings:{...defaultData.settings,...incoming.settings}};data.items=data.items.map(i=>({...i,type:inferType(i),residentKind:i.residentKind||'auto'}));data.records=data.records.map(r=>({...r,mood:normalizeMood(r.mood)}));save();showToast('小島備份已還原')}}catch{alert('這不是有效的「距今小島」備份。')}e.target.value=''};
$('#clearBtn').onclick=()=>{if(confirm('永久清除所有活動、次數、心情和每日小島？此動作無法復原。')){data=structuredClone(defaultData);localStorage.removeItem(STORAGE_KEY);renderAll();showToast('小島已清空')}};
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
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js?v=36',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
renderAll();
