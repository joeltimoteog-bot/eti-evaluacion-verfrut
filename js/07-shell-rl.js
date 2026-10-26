/* Evaluaciones ETI · index.html · bloque 07-shell-rl (antes en la linea 7542) · extraido el 26-oct-2026 sin cambios (_EVAL_MODULAR_V1) */
/* ══ _SHELL_RL_V1 (29-set-2026): barra lateral + barra superior como el Sistema RR.LL ══ */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const TIT={smis:'Mis evaluaciones',sind:'Indicadores',sm:'Inicio',sp1:'Nueva Evaluación',sp2:'Nueva Evaluación',sp3:'Nueva Evaluación',sres:'Resultados',sdash:'Dashboard',sqr:'Evaluación por QR'};
const TAB_TIT={stats:'Estadísticas',users:'Usuarios',registros:'Registros',eval:'Nueva Evaluación',dash:'Mi Dashboard',prog:'Programación',conectados:'Conectados',cumplimiento:'Cumplimiento',banco:'Banco de Preguntas',accesos:'Control de Accesos',indicadores:'Indicadores',trafico:'Tráfico en vivo'};
let tabActual='stats';
function crear(){
  if($('eti-side')) return;
  const a=document.createElement('aside'); a.id='eti-side';
  a.innerHTML=`<div class="es-brand"><div class="logo-uni" role="img" aria-label="Unifrutti"></div><div><b>Evaluaciones ETI</b><small>Ética Social · Relaciones Laborales</small></div></div>
    <div class="es-user"><span class="es-av" id="es-av">?</span><div><b id="es-nom">—</b><small id="es-rol">—</small></div></div>
    <nav id="es-nav"></nav>
    <div class="es-foot"><button class="es-home" onclick="volverRRLL()">🏠 Sistema RR.LL</button><button onclick="doLogout()">🚪 Cerrar Sesión</button></div>`;
  document.body.appendChild(a);
  const t=document.createElement('div'); t.id='eti-top';
  t.innerHTML=`<button class="es-ham" onclick="document.body.classList.toggle('side-open')">☰</button><div class="logo-uni" role="img" aria-label="Unifrutti"></div><h1 id="es-tit">—</h1>
    <div class="es-right"><span class="es-fecha">${new Date().toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'short',year:'numeric'})}</span><span class="es-badge" id="es-badge">ETI</span></div>`;
  document.body.appendChild(t);
  const bk=document.createElement('div'); bk.className='es-back'; bk.onclick=()=>document.body.classList.remove('side-open'); document.body.appendChild(bk);
}
function sec(nav,txt){const d=document.createElement('div');d.className='es-sec';d.textContent=txt;nav.appendChild(d);}
function mover(nav,id){const b=$(id);if(!b)return;nav.appendChild(b);
  if(!b.dataset.es){b.dataset.es='1';b.addEventListener('click',()=>{document.body.classList.remove('side-open');const act=document.querySelector('.screen.active');if(id!=='atab9'&&act&&act.id!=='sadmin')go('sadmin');},true);}}
function it(nav,ico,txt,fn,key){const b=document.createElement('button');b.className='es-it';b.dataset.k=key;b.innerHTML=`<span>${ico}</span><span>${txt}</span>`;b.onclick=()=>{document.body.classList.remove('side-open');fn();};nav.appendChild(b);}
function armarNav(){
  const nav=$('es-nav'); if(!nav||!SESSION) return;
  const rol=SESSION.rol==='admin'?'admin':'sup';
  const a10=$('atab10');
  if(nav.dataset.rol===rol+'|'+SESSION.user && (rol!=='admin'||($('atab1')&&$('atab1').parentNode===nav&&(!a10||(a10.previousElementSibling&&a10.previousElementSibling.classList.contains('es-sec')))))) return;
  nav.dataset.rol=rol+'|'+SESSION.user;
  if(rol==='admin'){
    // devolver botones previos por si se rearma
    nav.innerHTML='';
    sec(nav,'Principal');['atab1','atab12','atab13','atab5','atab4','atab3'].forEach(i=>mover(nav,i));
    it(nav,'🗂','Evaluaciones por supervisor',()=>window.ETIMIS&&ETIMIS.abrir(),'mis');   /* _MIS_EVAL_V1 */
    sec(nav,'Gestión');['atab6','atab8','atab7','atab2'].forEach(i=>mover(nav,i));
    sec(nav,'Evaluación en campo');mover(nav,'atab9');
    if($('atab10')){sec(nav,'Configuración 🔒');['atab10','atab11'].forEach(i=>mover(nav,i));}
  }else{
    nav.innerHTML='';
    sec(nav,'Principal');
    it(nav,'🏠','Inicio',()=>go('sm'),'sm');
    const T=k=>(window.etiTieneAcceso?etiTieneAcceso(k):true);
    if(T('eval')) it(nav,'📋','Nueva Evaluación',()=>iniciar(),'eval');
    if(T('qr')) it(nav,'📱','Evaluación por QR',()=>ETIM.abrirQR(),'qr');
    sec(nav,'Reportes');
    if(T('dash')) it(nav,'📊','Dashboard',()=>irDash(),'dash');
    if(T('ult')) it(nav,'🧾','Último Reporte',()=>verUlt(),'ult');
    if(T('ind')) it(nav,'📈','Indicadores',()=>ETIND.abrir(),'ind');
    it(nav,'🗂','Mis evaluaciones',()=>window.ETIMIS&&ETIMIS.abrir(),'mis');   /* _MIS_EVAL_V1 */
  }
}
function heroAdmin(){
  const st=$('admin-stats'); if(!st||$('es-hero-adm')) return;
  const h=document.createElement('div'); h.id='es-hero-adm'; h.className='es-hero'; h.style.marginBottom='1.4rem';
  st.insertBefore(h,st.firstChild);
}
function heroSup(){
  const mh=document.querySelector('#sm .mhero'); if(!mh) return;
  let h=$('es-hero-sup'); if(!h){h=document.createElement('div');h.id='es-hero-sup';h.className='es-hero';mh.insertBefore(h,mh.firstChild);}
}
function pintarHero(id,sub){
  const h=$(id); if(!h||!SESSION) return;
  const n=String(SESSION.nom||'').split(' ')[0];
  h.innerHTML=`<div><h2>Bienvenido, ${esc(n)} <span class="es-live"><i></i>En vivo</span></h2><p>${sub}</p></div><div class="logo-uni" role="img" aria-label="Unifrutti"></div>`;
}
function actualizar(){
  const act=document.querySelector('.screen.active');
  const on=!!(SESSION&&act&&act.id!=='slogin');
  document.body.classList.toggle('shell-on',on);
  if(!on){document.body.classList.remove('side-open');return;}
  crear(); armarNav();
  if(window.innerWidth<1000&&!window._esDockMin){window._esDockMin=1;setTimeout(()=>{const gd=$('gDock');if(gd)gd.classList.add('min');},900);}
  const ini=String(SESSION.nom||'?').trim().charAt(0).toUpperCase();
  $('es-av').textContent=ini; $('es-nom').textContent=SESSION.nom||SESSION.user;
  $('es-rol').textContent=SESSION.rol==='admin'?'Administrador del sistema':'Supervisor de Gestión Humana';
  $('es-badge').textContent=SESSION.rol==='admin'?'ADMIN':'SUPERVISOR';
  let tit=TIT[act.id]||'Evaluaciones ETI';
  if(act.id==='sadmin') tit=TAB_TIT[tabActual]||'Administración';
  $('es-tit').textContent=tit;
  // resaltar item activo
  if(SESSION.rol!=='admin'){
    const k={sm:'sm',sp1:'eval',sp2:'eval',sp3:'eval',sqr:'qr',sdash:'dash',sres:'ult',sind:'ind'}[act.id];
    document.querySelectorAll('#es-nav .es-it').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
    heroSup(); pintarHero('es-hero-sup','Supervisor · Evaluaciones ETI — '+(typeof SECS!=='undefined'?SECS.reduce((a,s)=>a+s.pregs.length,0):36)+' preguntas · '+(typeof SECS!=='undefined'?SECS.length:6)+' temas · cálculo automático');
  }else{
    const b9=$('atab9'); if(b9) b9.className=(act.id==='sqr'?'btn bpri bsm':'btn bout bsm');
    if(act.id==='sqr') document.querySelectorAll('#es-nav .btn').forEach(b=>{if(b.id!=='atab9')b.className=b.className.replace('bpri','bout');});
    heroAdmin(); pintarHero('es-hero-adm','Administrador · Evaluaciones ETI — Ética Social');
  }
}
const _go=window.go;
window.go=function(){const r=_go.apply(this,arguments);setTimeout(actualizar,0);return r;};
const _at=window.adminTab;
window.adminTab=function(t){tabActual=t;const r=_at.apply(this,arguments);setTimeout(actualizar,0);return r;};
const _lo=window.doLogout;
if(typeof _lo==='function') window.doLogout=function(){const r=_lo.apply(this,arguments);setTimeout(actualizar,0);return r;};
function arranque(){actualizar();setTimeout(actualizar,700);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arranque);else arranque();
console.log('[_SHELL_RL_V1] listo');
})();
