// @ts-nocheck
/* Original page behaviour, moved verbatim from the static site. */
export function initHome(){
var SITE=window.__SITE__||{},_ph=SITE.phone||''+_ph+'',_tel=SITE.tel||'+447846292529',_wa=SITE.wa||'447846292529',_em=SITE.email||'yordandecoandbuilding@gmail.com';
function newRef(){return(window.crypto&&crypto.randomUUID)?crypto.randomUUID():'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,10)}
var REF=newRef();
var $=function(s,e){return(e||document).querySelector(s)},$$=function(s,e){return[].slice.call((e||document).querySelectorAll(s))};
var S=["Painting & decorating","Loft conversions","Plumbing","Electrical","Boiler & heating","Windows & doors","Double glazing","Deep cleaning","Garden & clearance","Handyman","Commercial fit-outs","Landlord & HMO","Emergency repair"];
var G=["linear-gradient(135deg,#6a5733,#1a1814)","linear-gradient(135deg,#3b4a4a,#111)","linear-gradient(135deg,#5a3d2a,#141210)","linear-gradient(135deg,#444,#161616)","linear-gradient(135deg,#7a6a4a,#201c14)","linear-gradient(135deg,#2c3a2c,#101310)"];
var PC=[["Paint","Painting & decorating"],["Renovate","Kitchens & bathrooms"],["Repair","Handyman"],["Build","Loft conversions"],["Restore","Property maintenance"],["Maintain","Landlord & HMO"]];
var PI=['var(--ip) center/cover','var(--i14) center/cover','var(--i2) center/cover','var(--i11) center/cover','var(--i13) center/cover','var(--i8) center/cover'],RV={0:'var(--spa) center/cover',1:'var(--slo) center/cover',2:'var(--i16) center/cover',3:'var(--sel) center/cover',4:'var(--she) center/cover',5:'var(--swi) center/cover',6:'var(--sdg) center/cover',7:'var(--scl) center/cover',8:'var(--sga) center/cover',10:'var(--sco) center/cover',12:'var(--sem) center/cover',9:'var(--i8) center/cover',11:'var(--i12) center/cover'};
$('#o1').innerHTML=S.map(function(s){return'<button>'+s+'</button>'}).join('');
// preloader (once per session)
var seen=0;try{seen=sessionStorage.getItem('y')}catch(e){}
function go(){$('#pre').classList.add('go');document.body.classList.add('ready');setTimeout(function(){$('#pre').style.display='none'},1100);try{sessionStorage.setItem('y',1)}catch(e){}}
if(seen){$('#pre').style.display='none';document.body.classList.add('ready')}else setTimeout(go,1700);
// header, mobile menu
var mm=$('#mm'),bg=$('#bg');bg.onclick=function(){mm.classList.toggle('o');bg.textContent=mm.classList.contains('o')?'CLOSE':'MENU'};
$$('#mm a').forEach(function(a){a.onclick=function(){mm.classList.remove('o');bg.textContent='MENU'}});
// reveals
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});
$$('.rv').forEach(function(e,i){e.style.transitionDelay=(i%4)*.08+'s';io.observe(e)});
var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){$$('.mk',e.target).forEach(function(m){m.classList.add('in')});io2.unobserve(e.target)}})},{threshold:.15});
$$('.mk').forEach(function(m){io2.observe(m.parentElement)});
// word scroll reveal
var st=$('#stm');st.innerHTML=st.textContent.split(' ').map(function(w){return'<span class="wd">'+w+'</span>'}).join(' ');var wds=$$('.wd');
// scroll effects
var tk=0;function sc(){tk=0;var y=scrollY,h=innerHeight;$('#hd').classList.toggle('s',y>60);
var r=st.getBoundingClientRect(),p=Math.min(1,Math.max(0,(h*.85-r.top)/(h*.7)));wds.forEach(function(w,i){w.classList.toggle('on',i/wds.length<p)});
var c=$('.cin').getBoundingClientRect(),q=Math.min(1,Math.max(0,(h-c.top)/(h+c.height)));$('#cim').style.transform='scale('+(1.15-.15*q)+') translateY('+((q-.5)*-60)+'px)';
var t=$('#tl').getBoundingClientRect();$('#tl').style.setProperty('--p',Math.min(100,Math.max(0,(h*.6-t.top)/t.height*100))+'%')}
addEventListener('scroll',function(){if(!tk)tk=requestAnimationFrame(sc)},{passive:true});sc();
// cursor
var cu=$('.cur'),c2=$('.cur2'),cx=0,cy=0,tx=0,ty=0;
if(matchMedia('(hover:hover) and (pointer:fine)').matches){addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;cu.style.transform='translate('+tx+'px,'+ty+'px)'});
(function l(){cx+=(tx-cx)*.15;cy+=(ty-cy)*.15;c2.style.transform='translate('+cx+'px,'+cy+'px)';requestAnimationFrame(l)})();
document.addEventListener('mouseover',function(e){var t=e.target.closest('[data-c]');if(t){c2.textContent=t.dataset.c;c2.classList.add('on')}else{c2.textContent='';c2.classList.remove('on')}})}
// documents modal
var D=[["Certificate of Insurance",[["Issued by","Simply Business"],["Company","Yordan Decorations & Building Ltd"],["Policy number","ZIBI5570537XB"],["Trade","Builder"],["Public liability","Up to £5,000,000"],["Employers' liability","Up to £10,000,000"],["Period","21 May 2026 – 20 May 2027"]]],["Employers' Liability Certificate",[["Insurer","Zurich Insurance Company Ltd"],["Policyholder","Yordan Decorations & Building Ltd"],["Policy number","ZIBI5570537XB"],["Cover","Minimum £5 million"],["Period","21/05/2026 – 20/05/2027"]]]];
$$('.dd').forEach(function(b){b.onclick=function(){var d=D[b.dataset.d];$('#mt').textContent=d[0];$('#mb2').innerHTML=d[1].map(function(r){return'<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'}).join('');$('#ov').classList.add('o')}});
$('#xx').onclick=function(){$('#ov').classList.remove('o')};$('#ov').onclick=function(e){if(e.target.id==='ov')$('#ov').classList.remove('o')};
// before/after
var ba=$('#ba'),mv=0;function set(x){var r=ba.getBoundingClientRect(),p=Math.min(100,Math.max(0,(x-r.left)/r.width*100));$('#b2').style.clipPath='inset(0 0 0 '+p+'%)';$('#hh').style.left=p+'%'}
ba.addEventListener('pointerdown',function(e){mv=1;ba.setPointerCapture(e.pointerId);set(e.clientX)});ba.addEventListener('pointermove',function(e){if(mv)set(e.clientX)});ba.addEventListener('pointerup',function(){mv=0});ba.addEventListener('pointercancel',function(){mv=0});
if(window.visualViewport){var vv=visualViewport,aiw=$('#ai');vv.addEventListener('resize',function(){var kb=innerHeight-vv.height-vv.offsetTop;aiw.style.bottom=kb>80?(kb+12)+'px':'';$('#ap').style.maxHeight=Math.max(200,vv.height-(innerWidth<=860?200:150))+'px'})}
// quote steps
var qs=$$('.qb .sl'),n=0,ans={},er=$('#er');
function draw(){qs.forEach(function(s,i){s.classList.toggle('a',i===n)});$('#pr').innerHTML=qs.map(function(_,i){return'<b class="'+(i<=n?'a':'')+'">0'+(i+1)+'</b>'+(i<qs.length-1?'<span>—</span>':'')}).join('');$('#pv').style.visibility=n?'visible':'hidden';$('#nt').textContent=n===qs.length-1?'Submit enquiry':'Next →';
if(n===qs.length-1)$('#rs').textContent=JSON.stringify({service:ans.service,propertyType:ans.property,description:$('#q3').value,postcode:$('#q4').value,customerName:$('#qn').value,phone:$('#qp').value,email:$('#qe').value},null,2)}
$$('.op').forEach(function(o){o.onclick=function(e){if(e.target.tagName!=='BUTTON')return;$$('button',o).forEach(function(b){b.classList.remove('sel')});e.target.classList.add('sel');ans[o.dataset.k]=e.target.textContent;er.textContent=''}});
$('#pv').onclick=function(){if(n){n--;er.textContent='';draw()}};
$('#nt').onclick=function(){er.textContent='';var m=[ans.service,ans.property,$('#q3').value.trim(),$('#q4').value.trim(),$('#qn').value&&$('#qp').value&&/^\S+@\S+\.\S+$/.test($('#qe').value)];
if(n<5&&!m[n]){er.textContent=n===4?'Please enter your name, phone and a valid email.':'Please complete this step.';return}
if(n<qs.length-1){n++;draw()}else{send()}};
var sending=false,WA='https://wa.me/'+_wa+'?text=Hello%20Yordan%20Decorations%20%26%20Building%2C%20I%27d%20like%20a%20quote.';
function send(){if(sending)return;var hp=$('#qh');if(hp&&hp.value)return;sending=true;var nt=$('#nt');nt.disabled=true;nt.textContent='Sending\u2026';er.textContent='';
var pc=$('#q4').value.trim(),pl={name:$('#qn').value.trim(),email:$('#qe').value.trim(),phone:$('#qp').value.trim(),service:ans.service,property_type:ans.property,postcode:pc,project_details:$('#q3').value.trim(),_subject:'New quote request: '+ans.service+' ('+pc+')',_template:'table',_captcha:'false',_honey:''};
function fin(ok){sending=false;if(ok){REF=newRef();$('.qb').innerHTML='<div class="ty"><h3>Thank you. Your enquiry has been sent.</h3><p style="color:var(--m)">We will review your details and get back to you shortly. For anything urgent, call <a href="tel:'+_tel+'" style="color:var(--g)">'+_ph+'</a>.</p><p style="color:var(--m)">Have photos of the job? Send them to us on WhatsApp.</p><a class="btn" href="'+WA+'" target="_blank" rel="noopener noreferrer">Send photos on WhatsApp</a></div>'}else{nt.disabled=false;nt.textContent='Submit enquiry';er.innerHTML='Sorry, we could not send your enquiry. Please call <a href="tel:'+_tel+'" style="color:var(--g)">'+_ph+'</a>, message us on <a href="'+WA+'" target="_blank" rel="noopener noreferrer" style="color:var(--g)">WhatsApp</a> or email '+_em+'.'}}
try{fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,body:JSON.stringify({ref:REF,source:'website',service:pl.service,property_type:pl.property_type,postcode:pl.postcode,details:pl.project_details,name:pl.name,phone:pl.phone,email:pl.email})}).catch(function(){})}catch(e){}
fetch('https://formsubmit.co/ajax/yordandecoandbuilding@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(pl)}).then(function(r){return r.json().catch(function(){return{}}).then(function(d){return r.ok&&(d.success===true||d.success==='true')})}).then(fin).catch(function(){fin(false)})}
function pre(s){ans.service=s;$$('#o1 button').forEach(function(b){b.classList.toggle('sel',b.textContent===s)});n=0;draw()}
$$('[data-svc]').forEach(function(a){a.addEventListener('click',function(){var s=a.dataset.svc,m=S.filter(function(x){return x.toLowerCase().indexOf(s.toLowerCase().split(' ')[0])===0})[0];pre(m||S[0]);if(a.tagName==='BUTTON')$('#quote').scrollIntoView({behavior:'smooth'})})});draw();
// FAQ
$$('.fq button').forEach(function(b){b.onclick=function(){var p=b.parentNode,o=p.classList.toggle('o');b.setAttribute('aria-expanded',o)}});
// concierge (scripted)
var lg=$('#lg'),ci=$('#ci'),ap=$('#ap'),step=0,L={};
function say(t,u){var p=document.createElement('p');if(u)p.className='u';p.textContent=t;lg.appendChild(p);lg.scrollTop=1e5}
var Q=["Your name?","Best phone number?","Your postcode?","Briefly, what's the problem or project?","How urgent is it?"],K=["name","phone","postcode","description","urgency"];
$('#qa').innerHTML=["I need urgent help","I need a quote","Loft conversion","Bathroom renovation","Plumbing help","Landlord / HMO","Commercial work"].map(function(t){return'<button>'+t+'</button>'}).join('');
function start(t){$('#qa').style.display='none';L.service=t;say(t,1);say("Happy to help. "+Q[0]);step=0}
$$('#qa button').forEach(function(b){b.onclick=function(){start(b.textContent)}});
ci.onkeydown=function(e){if(e.key!=='Enter'||!ci.value.trim())return;var v=ci.value.trim();ci.value='';if(!L.service){start(v);return}say(v,1);L[K[step]]=v;step++;
if(step<Q.length)say(Q[step]);else{say("Thank you. Here is your enquiry summary. It has not been sent yet because email delivery isn't connected:\n"+JSON.stringify(L,null,1));step=99}};
say("Hello. I'm the Yordan enquiry assistant. I collect your details for the team and don't give prices or guarantees. How can I help?");
$('#aib').onclick=function(){ap.classList.toggle('o')};$('#ax').onclick=function(){ap.classList.remove('o')};
(function(){var g=document.getElementById('gl');if(!g)return;var A=[].slice.call(g.querySelectorAll('a.gi')),L=A,k=0,b=document.createElement('div');b.className='lb';b.setAttribute('role','dialog');b.setAttribute('aria-label','Project photo viewer');b.innerHTML='<button class="x" aria-label="Close">\u00d7</button><button class="pv" aria-label="Previous">\u2039</button><img alt=""><button class="nx" aria-label="Next">\u203a</button><small></small>';document.body.appendChild(b);var im=b.querySelector('img'),c=b.querySelector('small');function show(i){k=(i+L.length)%L.length;var a=L[k];im.src=a.getAttribute('href');im.alt=a.firstChild.alt;c.textContent=(k+1)+' / '+L.length}function open(a){L=A.filter(function(x){return!x.hidden});show(L.indexOf(a));b.classList.add('on')}function close(){b.classList.remove('on');im.removeAttribute('src')}A.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();open(a)})});var f=document.getElementById('gf');if(f)f.addEventListener('click',function(e){var t=e.target.closest('button');if(!t)return;[].forEach.call(f.children,function(x){x.classList.toggle('on',x===t)});A.forEach(function(a){a.hidden=t.dataset.f!=='all'&&a.dataset.cat!==t.dataset.f})});b.querySelector('.x').onclick=close;b.querySelector('.pv').onclick=function(){show(k-1)};b.querySelector('.nx').onclick=function(){show(k+1)};b.addEventListener('click',function(e){if(e.target===b)close()});document.addEventListener('keydown',function(e){if(!b.classList.contains('on'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(k-1);if(e.key==='ArrowRight')show(k+1)});var sx=0;b.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});b.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>50)show(d<0?k+1:k-1)})})();
}
