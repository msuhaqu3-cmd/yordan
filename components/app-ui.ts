// @ts-nocheck
/* Mobile app UI behaviour, moved from the provided yordan-app.html (logic unchanged). */
export function initApp(){
const PHONE='447846292529', TEL='tel:+447846292529';
const I = {
  paint:'<path d="M19 3H5v6h14zM12 9v4M10 13h4v8h-4z"/>',
  bath:'<path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0"/>',
  kitchen:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 10h16M8 6h.01M8 14v3"/>',
  loft:'<path d="M3 21V10l9-7 9 7v11zM9 21v-6h6v6"/>',
  plumb:'<path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z"/>',
  elec:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  window:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 12h16"/>',
  clean:'<path d="M3 21h18M6 21l2-9h8l2 9M12 12V3"/>',
  tool:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  key:'<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3"/>',
  shop:'<path d="M3 9 5 3h14l2 6M3 9h18v12H3zM9 21v-6h6v6"/>',
  alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>'
};
const ic=(k,c='currentColor',s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg>`;

const SERVICES=[
  {id:'paint',name:'Painting & decorating',short:'Interior & exterior',icon:'paint',desc:'Interior and exterior painting with proper wall preparation and a clean, lasting finish.',inc:['Filling, sanding & priming','Walls, ceilings, woodwork','Exterior masonry & render','Wallpapering']},
  {id:'bath',name:'Bathrooms',short:'Full refits & repairs',icon:'bath',desc:'Bathroom renovations from strip-out to final tiling, with plumbing and electrics handled in-house.',inc:['Strip-out & disposal','Plumbing & waterproofing','Tiling & fitting','Lighting & extraction']},
  {id:'kitchen',name:'Kitchens',short:'Renovations & fit-outs',icon:'kitchen',desc:'Kitchen refurbishments and new fitted kitchens, planned and delivered by one team.',inc:['Fitting units & worktops','Plumbing & appliances','Electrics & lighting','Tiling & decorating']},
  {id:'loft',name:'Lofts & extensions',short:'Structural works',icon:'loft',desc:'Loft conversions, extensions and structural works, from planning through to finish.',inc:['Planning support','Structural alterations','Insulation & plastering','Second-fix & decoration']},
  {id:'plumb',name:'Plumbing & heating',short:'Boilers, leaks, radiators',icon:'plumb',desc:'Plumbing, boiler and heating repairs and installation.',inc:['Leaks & burst pipes','Boiler repairs','Radiators & valves','New installations']},
  {id:'elec',name:'Electrical',short:'Repairs & installs',icon:'elec',desc:'Electrical repairs and installation, from sockets and lighting to rewiring.',inc:['Fault finding','Sockets & lighting','Rewiring','Consumer units']},
  {id:'window',name:'Windows & doors',short:'Double glazing',icon:'window',desc:'Window and door supply, fitting and double glazing.',inc:['Double glazing','Internal & external doors','Repairs & adjustments','Sealing & draught-proofing']},
  {id:'clean',name:'Cleaning & clearance',short:'Deep clean, garden, waste',icon:'clean',desc:'Deep cleaning, garden clearance and waste removal.',inc:['End-of-build cleans','Garden clearance','Waste & rubbish removal','Decking & exterior']},
  {id:'handy',name:'Handyman & repairs',short:'Small jobs done right',icon:'tool',desc:'The odd jobs and repairs that need a reliable pair of hands.',inc:['Fixing & assembly','Shelving & storage','Minor repairs','Snagging lists']}
];
const BIZ=[
  {id:'landlord',name:'Landlords & HMO',short:'Turnarounds & maintenance',icon:'key',desc:'Repairs, tenancy turnarounds, decorating and planned maintenance for landlords and HMOs.',inc:['Fast tenancy turnarounds','Planned maintenance','Compliance-related repairs','Decorating between lets']},
  {id:'commercial',name:'Commercial fit-outs',short:'Restaurants, retail, offices',icon:'shop',desc:'Fit-outs and refits for restaurants, shops and offices, often outside trading hours.',inc:['Evening & weekend work','Refits & redecoration','Electrics & plumbing','Minimal disruption']},
  {id:'emergency',name:'Emergency repair',short:'Leaks, heating, damage',icon:'alert',desc:'Urgent repairs when something can’t wait.',inc:['Leaks & burst pipes','Heating failures','Electrical faults','Making safe']}
];
const ALL=[...SERVICES,...BIZ];
const REVIEWS=[
  {n:'Sarah M.',t:'Bathroom renovation',q:'Neat, tidy and finished on time. The bathroom looks fantastic.'},
  {n:'David K.',t:'Landlord',q:'Quick to respond and fair on price. They keep my HMOs in good shape.'},
  {n:'Emma R.',t:'Commercial refit',q:'Our restaurant was repainted and refitted over one weekend.'}
];
const PROJECTS=[
  ['Bathrooms','Walk-in shower','#5b6b73','#a9b7bc'],['Interiors','Living room','#8a7a63','#d9ccb6'],
  ['Bathrooms','Tiled family bath','#3f4f57','#93a4ab'],['On site','Ceiling rewire','#3a3a3a','#7a7a7a'],
  ['Interiors','Staircase','#6d5a45','#c2ad92'],['Interiors','Fitted kitchen','#2f3b33','#8aa293'],
  ['Bathrooms','Cloakroom','#575049','#b5aca2'],['On site','Brick feature wall','#7a3f2d','#c47a5e'],
  ['Interiors','Under-stairs storage','#5e5a52','#bab4a8'],['On site','Exterior decking','#5a4630','#a88b66']
];

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

function svcCard(s,wide){return `<button class="svc${wide?' wide':''}" data-svc="${s.id}"><span class="ic">${ic(s.icon)}</span><div><h3>${s.name}</h3><p>${s.short}</p></div></button>`}
$('#homeSvcs').innerHTML=['paint','bath','kitchen','plumb'].map(id=>svcCard(ALL.find(s=>s.id===id))).join('');
$('#allSvcs').innerHTML=SERVICES.map(s=>svcCard(s)).join('');
$('#bizSvcs').innerHTML=BIZ.map(s=>svcCard(s,true)).join('');
$('#reviews').innerHTML=REVIEWS.map(r=>`<div class="card review"><div class="stars">★★★★★</div><p>“${r.q}”</p><small><b>${r.n}</b> · ${r.t}</small></div>`).join('');

// projects
const cats=['All','Bathrooms','Interiors','On site'];let pc='All';
function drawProj(){
  $('#projChips').innerHTML=cats.map(c=>`<button class="chip${c===pc?' on':''}" data-pc="${c}">${c}</button>`).join('');
  $('#projGrid').innerHTML=PROJECTS.filter(p=>pc==='All'||p[0]===pc).map((p,i)=>`<div class="tile" style="background:linear-gradient(160deg,${p[3]},${p[2]})">
    <svg class="bg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 70 L30 55 L60 68 L100 50 L100 100 L0 100Z" fill="rgba(0,0,0,.18)"/><rect x="${20+i*7%40}" y="18" width="22" height="30" fill="rgba(255,255,255,.12)"/></svg>
    <span><small>${p[0]}</small>${p[1]}</span></div>`).join('');
}
drawProj();

// before/after
(function(){const st=$('#ba'),a=$('#baAfter'),h=$('#baHandle');let drag=false;
 const set=x=>{const r=st.getBoundingClientRect();let p=Math.min(100,Math.max(0,(x-r.left)/r.width*100));a.style.clipPath=`inset(0 0 0 ${p}%)`;h.style.left=p+'%'};
 st.addEventListener('pointerdown',e=>{drag=true;st.setPointerCapture(e.pointerId);set(e.clientX)});
 st.addEventListener('pointermove',e=>drag&&set(e.clientX));
 st.addEventListener('pointerup',()=>drag=false);})();

// navigation
function go(s){
  $$('.screen').forEach(x=>x.classList.toggle('on',x.dataset.s===s));
  $$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.go===s));
  $('#main').scrollTop=0;
  if(s==='about')drawReqs();
}

// sheet
function openSheet(html){$('#sheet').innerHTML='<div class="grab"></div>'+html;$('#sheet').classList.add('on');$('#sheetBg').classList.add('on')}
function closeSheet(){$('#sheet').classList.remove('on');$('#sheetBg').classList.remove('on')}
$('#sheetBg').onclick=closeSheet;
function svcSheet(id){const s=ALL.find(x=>x.id===id);
  openSheet(`<span class="ic" style="width:48px;height:48px;border-radius:14px;background:#fff;display:grid;place-items:center;border:1px solid var(--line)">${ic(s.icon,'currentColor',24)}</span>
  <h2 style="margin-top:14px">${s.name}</h2><p class="sub">${s.desc}</p><ul>${s.inc.map(x=>`<li>${x}</li>`).join('')}</ul>
  <div class="stack"><button class="btn btn-dark" data-quote-svc="${s.id}">Get a free quote</button><a class="btn btn-out" href="${TEL}">Call 07846 292529</a></div>`)}
function emergencySheet(){openSheet(`<h2>Emergency help</h2><p class="sub">For leaks, burst pipes, heating failures or anything unsafe. Calling is fastest.</p>
  <div class="stack" style="margin-top:18px"><a class="btn btn-danger" href="${TEL}">Call now · 07846 292529</a>
  <a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/${PHONE}?text=${encodeURIComponent('EMERGENCY: I need urgent help. Postcode: ')}">WhatsApp with photos</a>
  <button class="btn btn-out" data-quote-svc="emergency">Send details instead</button></div>
  <p class="sub" style="margin-top:16px;font-size:12px">If there is a gas smell, leave the property and call the National Gas Emergency line on 0800 111 999.</p>`)}

// quote wizard
const TYPES=ALL.map(s=>[s.id,s.name,s.icon]);
let q,step;
function resetQ(svc){q={svc:svc||'',prop:'',timing:'',details:'',postcode:'',name:'',phone:'',email:''};step=svc?1:0}
resetQ();
const STEPS=['What do you need?','Property','The job','Your details','Review'];
function drawWiz(){
  $('#prog').innerHTML=STEPS.map((_,i)=>`<i class="${i<=step?'on':''}"></i>`).join('');
  $('#err').textContent='';
  let h=`<h3 style="margin-bottom:12px">${STEPS[step]}</h3>`;
  if(step===0) h+=`<div class="opts">${TYPES.map(t=>`<button class="opt${q.svc===t[0]?' on':''}" data-pick="svc" data-v="${t[0]}">${ic(t[2])}${t[1]}</button>`).join('')}</div>`;
  if(step===1) h+=`<div class="opts">${[['house','House'],['flat','Flat'],['hmo','HMO / rental'],['commercial','Commercial']].map(t=>`<button class="opt${q.prop===t[0]?' on':''}" data-pick="prop" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
     <label class="f">When do you need it?</label><div class="seg">${['ASAP','1–4 weeks','Flexible'].map(t=>`<button class="${q.timing===t?'on':''}" data-pick="timing" data-v="${t}">${t}</button>`).join('')}</div>`;
  if(step===2) h+=`<label class="f">Describe the job</label><textarea id="fDetails" placeholder="e.g. Repaint 3 bedrooms and hallway, ceilings too. Some cracks to fill.">${q.details}</textarea>
     <label class="f">Postcode</label><input id="fPost" placeholder="N8 0HX" value="${q.postcode}" autocapitalize="characters">
     <p class="sub" style="font-size:12px;margin-top:8px">Tip: you can send photos on WhatsApp after you submit.</p>`;
  if(step===3) h+=`<label class="f">Name</label><input id="fName" value="${q.name}" autocomplete="name">
     <label class="f">Phone</label><input id="fPhone" type="tel" value="${q.phone}" autocomplete="tel">
     <label class="f">Email (optional)</label><input id="fEmail" type="email" value="${q.email}" autocomplete="email">`;
  if(step===4){const s=ALL.find(x=>x.id===q.svc);
    h+=`<div class="card"><dl class="summary"><dt>Service</dt><dd>${s.name}</dd><dt>Property</dt><dd>${cap(q.prop)} · ${q.timing}</dd><dt>Job</dt><dd>${esc(q.details)}</dd><dt>Postcode</dt><dd>${esc(q.postcode)}</dd><dt>Contact</dt><dd>${esc(q.name)} · ${esc(q.phone)}${q.email?' · '+esc(q.email):''}</dd></dl></div>
    <div class="send"><a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/${PHONE}?text=${encodeURIComponent(msg())}" data-sent>Send via WhatsApp</a>
    <a class="btn btn-dark" href="sms:+${PHONE}?&body=${encodeURIComponent(msg())}" data-sent>Send via text message</a></div>`;
  }
  $('#wiz').innerHTML=h;
  $('#wizNav').innerHTML=(step>0?`<button class="btn btn-out" data-wiz="back">Back</button>`:'')+(step<4?`<button class="btn btn-dark" data-wiz="next">Continue</button>`:'');
}
const cap=s=>s==='hmo'?'HMO / rental':s.charAt(0).toUpperCase()+s.slice(1);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function msg(){const s=ALL.find(x=>x.id===q.svc);return `Hi Yordan, I'd like a free quote.\n\nService: ${s.name}\nProperty: ${cap(q.prop)}\nTiming: ${q.timing}\nPostcode: ${q.postcode}\n\nJob: ${q.details}\n\nName: ${q.name}\nPhone: ${q.phone}${q.email?'\nEmail: '+q.email:''}`}
function capture(){
  if(step===2){q.details=$('#fDetails').value.trim();q.postcode=$('#fPost').value.trim().toUpperCase()}
  if(step===3){q.name=$('#fName').value.trim();q.phone=$('#fPhone').value.trim();q.email=$('#fEmail').value.trim()}
}
function valid(){
  if(step===0&&!q.svc)return'Pick a service to continue.';
  if(step===1&&(!q.prop||!q.timing))return'Choose a property type and timing.';
  if(step===2&&q.details.length<5)return'Add a short description of the job.';
  if(step===2&&!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d?[A-Z]{0,2}$/i.test(q.postcode))return'Enter a valid UK postcode.';
  if(step===3&&!q.name)return'Add your name.';
  if(step===3&&q.phone.replace(/\D/g,'').length<10)return'Add a valid phone number.';
  return'';
}
drawWiz();

function drawReqs(){const r=store.get('yordanReqs',[]);
  $('#myReqs').innerHTML=r.length?r.slice().reverse().map(x=>`<div class="row req"><div><b>${x.svc}</b><small>${x.date} · ${x.postcode}</small></div><span class="tag">Sent</span></div>`).join(''):'<div class="empty">No quote requests yet.</div>'}

function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');setTimeout(()=>el.classList.remove('on'),2200)}

// events
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-go],[data-svc],[data-sheet],[data-pick],[data-wiz],[data-quote-svc],[data-pc],[data-sent]');if(!t)return;
  if(t.dataset.go){if(t.dataset.go==='quote'&&step===4){resetQ();drawWiz()}go(t.dataset.go)}
  else if(t.dataset.svc)svcSheet(t.dataset.svc);
  else if(t.dataset.sheet)emergencySheet();
  else if(t.dataset.quoteSvc){closeSheet();resetQ(t.dataset.quoteSvc);drawWiz();go('quote')}
  else if(t.dataset.pc){pc=t.dataset.pc;drawProj()}
  else if(t.dataset.pick){q[t.dataset.pick]=t.dataset.v;drawWiz();if(step===0)setTimeout(()=>{step=1;drawWiz()},180)}
  else if(t.dataset.wiz){capture();if(t.dataset.wiz==='back'){step--;drawWiz()}else{const m=valid();if(m){$('#err').textContent=m;return}step++;drawWiz()}}
  else if(t.hasAttribute('data-sent')){const r=store.get('yordanReqs',[]);r.push({svc:ALL.find(x=>x.id===q.svc).name,postcode:q.postcode,date:new Date().toLocaleDateString('en-GB')});store.set('yordanReqs',r);toast('Opening your messages…')}
});
// Deep link support (manifest shortcuts): /app?tab=quote
(function(){const t=new URLSearchParams(location.search).get('tab');if(t&&document.querySelector('.screen[data-s="'+t+'"]')){if(t==='quote'&&step===4){resetQ();drawWiz()}go(t)}})();
}
