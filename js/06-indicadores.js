/* Evaluaciones ETI · index.html · bloque 06-indicadores (antes en la linea 6915) · extraido el 26-oct-2026 sin cambios (_EVAL_MODULAR_V1) */
/* ══════════════════════════════════════════════════════════════
   _INDICADORES_V2 (30-set-2026) — Indicadores y estadística de evaluaciones
   · Fuente principal: Azure SQL (/api/etieval/stats). Respaldo: Firebase.
   · Panel estadístico reutilizable: Indicadores, Estadísticas, Mi Dashboard y Dashboard del supervisor.
   · Admin: editar / eliminar por sector, ruta y código (Azure + Firebase).
   ══════════════════════════════════════════════════════════════ */
(function(){
'use strict';
const AZ_ETI='https://rl-fn-verfrut.azurewebsites.net/api/etieval';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const pct=v=>(Math.round((v||0)*1000)/10).toFixed(1)+'%';
const P1=v=>Math.round((v||0)*1000)/10;
const fmtN=n=>Number(n||0).toLocaleString('es-PE');
const hoyL=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const secId=nom=>{const s=(typeof SECS!=='undefined'?SECS:[]).find(x=>x.nom===nom);return s?s.id:String(nom||'').toLowerCase().normalize('NFD').replace(/[^a-z]/g,'').slice(0,12);};
const U=s=>String(s||'').trim().toUpperCase();
const esAdmin=()=>!!(SESSION&&SESSION.rol==='admin');
/* paleta (método dataviz): serie azul, estado bueno/crítico con etiqueta, rampa azul para magnitud */
const C={serie:'#2a78d6',bueno:'#0ca30c',critico:'#d03b3b',aviso:'#fab219',meta:'#52514e',grid:'#E6ECF6',
  rampa:['#cde2fb','#b7d3f6','#9ec5f4','#86b6ef','#6da7ec','#5598e7','#3987e5','#2a78d6','#256abf','#1c5cab','#184f95','#104281']};
const META=0.7;

/* ── Envío / administración en Azure ── */
async function azPost(registros){
  const r=await fetch(AZ_ETI+'/guardar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({registros})});
  if(!r.ok) throw new Error('Azure '+r.status);
  return r.json();
}
async function azAdmin(accion,filtro,cambios){
  const tk=sessionStorage.getItem('eti_token');
  const r=await fetch(AZ_ETI+'/admin/'+accion,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+(tk||'')},body:JSON.stringify({filtro,cambios})});
  const j=await r.json().catch(()=>({}));
  if(r.status===401) throw new Error('Tu sesión de administrador venció: vuelve a iniciar sesión');
  if(!r.ok||!j.success) throw new Error(j.error||('Azure '+r.status));
  return j;
}
function regsDeEval(ev,docId){
  if(!ev||ev.modalidad==='QR') return [];
  return (ev.rutas||[]).map((r,i)=>({id:docId+'_'+i,modalidad:'MANUAL',fecha:ev.fecha,empresa:ev.emp,supervisor:ev.sup,usuario:ev.usuario,
    sector:ev.sector,tipo:ev.tipo,ruta:r.nom,codigo:r.cod,evaluados:r.ne||1,resultado:r.resGrupo||0,
    secciones:(r.secs||[]).map(s=>({id:s.id||secId(s.nom),nom:s.nom,peso:s.peso,pct:s.pct!=null?s.pct:(s.cum||0)}))}));
}
function regDeRespuesta(d,id){
  return {id,modalidad:'QR',sesion_id:d.sesion,fecha:d.fecha,empresa:d.emp,supervisor:d.sup,usuario:d.usuarioSup,sector:d.sector,tipo:d.tipo,
    ruta:d.ruta,codigo:d.cod,evaluados:1,resultado:d.resultado||0,banco_version:d.bancoVersion||0,
    secciones:(d.secs||[]).map(s=>({id:s.id,nom:s.nom,peso:s.peso,pct:s.pct}))};
}
/* _TRAFICO_V1: helpers de Azure para el panel de tráfico */
window.etiAzure={post:azPost,regQR:regDeRespuesta,regsManual:regsDeEval,
  ping:async()=>{const t=Date.now(),ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),12000);try{const d=new Date().toISOString().slice(0,10);const r=await fetch(AZ_ETI+'/stats?desde='+d+'&hasta='+d,{signal:ctl.signal,cache:'no-store'});return {ok:r.ok,ms:Date.now()-t};}catch(e){return {ok:false,ms:Date.now()-t,err:e.message};}finally{clearTimeout(to);}}};
/* Recalificación al cerrar: Azure no actualiza registros existentes, así que (con token de admin) se borra y se vuelve a insertar.
   Se marca azOk:false antes, para que el panel de tráfico lo reenvíe si algo falla a mitad. */
/* _CAMBIAR_FECHA_V1 (19-oct-2026): corrige la FECHA DE EVALUACIÓN de un registro (QR o manual) en Azure y Firebase.
   Orden seguro: 1) se borra en Azure (si falla, no se toca nada) · 2) se actualiza Firebase guardando fechaOriginal · 3) se reinserta en Azure (si falla, queda azOk:false y Tráfico lo reenvía). */
window.etiCambiarFecha=async function(tipo,id,nueva){
  if(!fbdb) throw new Error('Sin conexión a Firebase');
  if(!sessionStorage.getItem('eti_token')) throw new Error('Tu sesión de administrador venció: vuelve a iniciar sesión');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(nueva)) throw new Error('Fecha inválida');
  const ref=fbdb.collection(tipo==='QR'?'respuestas_qr':COL_EVAL).doc(id), snap=await ref.get();
  if(!snap.exists) throw new Error('El registro ya no existe');
  const d=snap.data(), vieja=d.fecha; if(vieja===nueva) return {sinCambio:true};
  const marca={fecha:nueva,fechaOriginal:d.fechaOriginal||vieja,fechaEditadaPor:(SESSION&&SESSION.user)||'',fechaEditadaEn:new Date().toISOString(),azOk:false};
  if(tipo==='QR'){
    await azAdmin('eliminar',{sesion_id:d.sesion,ids:[id]});
    await ref.update(marca);
    try{await azPost([regDeRespuesta({...d,fecha:nueva},id)]);await ref.update({azOk:true,azEn:new Date().toISOString()});}catch(e){console.warn('Azure reinsertar (Tráfico lo reenvía):',e.message);}
  }else{
    const regs=regsDeEval(d,id);
    for(const r of regs) await azAdmin('eliminar',{desde:vieja,hasta:vieja,sector:d.sector||'',ruta:r.ruta||'',codigo:r.codigo||'',ids:[r.id]});
    await ref.update(marca);
    try{await azPost(regsDeEval({...d,fecha:nueva},id));await ref.update({azOk:true,azEn:new Date().toISOString()});}catch(e){console.warn('Azure reinsertar (Tráfico lo reenvía):',e.message);}
  }
  try{CACHE.clear();}catch(e){}
  return {vieja,nueva};
};
window.etiAzureRespQR=async function(lista,calif,refs){
  const regs=lista.map(([d,id],i)=>regDeRespuesta({...d,...(calif&&calif[i]||{})},id)); if(!regs.length) return;
  if(!sessionStorage.getItem('eti_token')){console.warn('Recalificación: sin sesión de administrador; Azure conserva el valor original de',regs.length,'respuesta(s)');return;}
  try{
    await Promise.all((refs||[]).map(r=>r.update({azOk:false}).catch(()=>{})));
    await azAdmin('eliminar',{sesion_id:regs[0].sesion_id,ids:regs.map(r=>r.id)});
    await azPost(regs);
    const en=new Date().toISOString(); await Promise.all((refs||[]).map(r=>r.update({azOk:true,azEn:en}).catch(()=>{})));
  }catch(e){console.warn('Azure recalificación (el panel de tráfico lo reenvía):',e.message);}
};
/* Manual → Azure con 3 intentos; al confirmar marca azOk en Firebase */
window.etiAzureEvalManual=function(ev,docId,ref){
  const regs=regsDeEval(ev,docId); if(!regs.length) return Promise.resolve(false);
  const go=n=>azPost(regs).then(()=>{if(ref)ref.update({azOk:true,azEn:new Date().toISOString()}).catch(()=>{});return true;},
    e=>{if(n<3)return new Promise(r=>setTimeout(r,3000*n)).then(()=>go(n+1));console.warn('Azure ETI (lo reenvía el panel de tráfico):',e.message);return false;});
  return go(1);
};

/* ── Lectura ── */
const binDe=v=>Math.min(9,Math.max(0,Math.floor((v||0)*10+1e-9)));
async function desdeAzure(desde,hasta){
  const ctl=new AbortController(); const t=setTimeout(()=>ctl.abort(),15000);
  try{
    const r=await fetch(AZ_ETI+'/stats?desde='+desde+'&hasta='+hasta,{signal:ctl.signal,cache:'no-store'});
    if(!r.ok) throw new Error('Azure '+r.status);
    const j=await r.json(); if(!j.success) throw new Error(j.error||'Azure');
    return (j.filas||[]).map(f=>{ if(!Array.isArray(f.bins)){f.bins=new Array(10).fill(0);f.bins[binDe(f.n?f.sr/f.n:0)]=f.n;} return f; });
  }finally{clearTimeout(t);}
}
async function desdeFirebase(desde,hasta){
  if(!fbdb) throw new Error('Sin Firebase');
  const filas=[];
  const qr=await fbdb.collection('respuestas_qr').where('fecha','>=',desde).where('fecha','<=',hasta).get();
  qr.docs.forEach(d=>{const x=d.data();const secs={};(x.secs||[]).forEach(s=>secs[s.id]={nom:s.nom,sp:s.pct||0});
    const bins=new Array(10).fill(0);bins[binDe(x.resultado)]=1;
    filas.push({fecha:x.fecha,empresa:x.emp,supervisor:x.sup,sector:x.sector,ruta:U(x.ruta),codigo:U(x.cod),modalidad:'QR',
      n:1,sr:x.resultado||0,apr:(x.resultado||0)>=META?1:0,regs:1,bins,secs});});
  const ev=await fbdb.collection(COL_EVAL).where('fecha','>=',desde).where('fecha','<=',hasta).get();
  ev.docs.forEach(d=>{const x=d.data(); if(x.modalidad==='QR') return;
    (x.rutas||[]).forEach(r=>{const n=r.ne||1,res=r.resGrupo||0,secs={};const bins=new Array(10).fill(0);bins[binDe(res)]=n;
      (r.secs||[]).forEach(s=>{secs[s.id||secId(s.nom)]={nom:s.nom,sp:(s.pct!=null?s.pct:(s.cum||0))*n};});
      filas.push({fecha:x.fecha,empresa:x.emp,supervisor:x.sup,sector:x.sector,ruta:U(r.nom),codigo:U(r.cod),modalidad:'MANUAL',
        n,sr:res*n,apr:res>=META?n:0,regs:1,bins,secs});});});
  return filas;
}
const CACHE=new Map();
async function cargarFilas(desde,hasta,forzar){
  const k=desde+'|'+hasta, c=CACHE.get(k);
  if(!forzar&&c&&Date.now()-c.t<60000) return c;
  let filas,fuente;
  try{ filas=await desdeAzure(desde,hasta); fuente='Azure SQL'; }
  catch(e){ console.warn('Indicadores: Azure no disponible, uso Firebase:',e.message); filas=await desdeFirebase(desde,hasta); fuente='Firebase (respaldo)'; }
  const v={filas,fuente,t:Date.now()}; CACHE.set(k,v); return v;
}

/* ── Agregación y estadística ── */
function semanaDe(f){const d=new Date(f+'T12:00:00');const w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return iso(d);}
function agregar(filas){
  const A={n:0,sr:0,apr:0,bins:new Array(10).fill(0),sect:new Map(),rutas:new Map(),temas:new Map(),sem:new Map(),sups:new Map(),mod:{QR:0,MANUAL:0},st:new Map(),dias:new Set()};
  filas.forEach(r=>{
    A.n+=r.n;A.sr+=r.sr;A.apr+=r.apr;A.mod[r.modalidad]=(A.mod[r.modalidad]||0)+r.n;A.dias.add(r.fecha);
    (r.bins||[]).forEach((b,i)=>A.bins[i]+=b);
    const sk=r.sector||'—';
    const S=A.sect.get(sk)||{sector:sk,n:0,sr:0,apr:0,rutas:new Set(),ult:''};S.n+=r.n;S.sr+=r.sr;S.apr+=r.apr;S.rutas.add(r.ruta+'|'+r.codigo);if(r.fecha>S.ult)S.ult=r.fecha;A.sect.set(sk,S);
    const rk=sk+'|'+(r.ruta||'—')+'|'+(r.codigo||'');
    const R=A.rutas.get(rk)||{sector:sk,ruta:r.ruta||'—',codigo:r.codigo||'',n:0,sr:0,apr:0,ult:'',sups:new Set(),mods:new Set()};
    R.n+=r.n;R.sr+=r.sr;R.apr+=r.apr;if(r.fecha>R.ult)R.ult=r.fecha;if(r.supervisor)R.sups.add(r.supervisor);R.mods.add(r.modalidad);A.rutas.set(rk,R);
    const wk=semanaDe(r.fecha);const W=A.sem.get(wk)||{sem:wk,n:0,sr:0,apr:0};W.n+=r.n;W.sr+=r.sr;W.apr+=r.apr;A.sem.set(wk,W);
    if(r.supervisor){const V=A.sups.get(r.supervisor)||{sup:r.supervisor,n:0,sr:0,apr:0};V.n+=r.n;V.sr+=r.sr;V.apr+=r.apr;A.sups.set(r.supervisor,V);}
    Object.entries(r.secs||{}).forEach(([id,s])=>{
      const T=A.temas.get(id)||{id,nom:s.nom,sp:0,n:0};T.sp+=s.sp;T.n+=r.n;if(!T.nom)T.nom=s.nom;A.temas.set(id,T);
      const k2=sk+'|'+id;const X=A.st.get(k2)||{sp:0,n:0};X.sp+=s.sp;X.n+=r.n;A.st.set(k2,X);
    });
  });
  /* estadística descriptiva aproximada con el histograma (centro de cada tramo de 10 puntos) */
  const tot=A.bins.reduce((a,b)=>a+b,0)||1, mean=A.n?A.sr/A.n:0;
  let v=0;A.bins.forEach((b,i)=>{const c=(i+0.5)/10;v+=b*(c-mean)*(c-mean);});
  let acc=0,med=0;for(let i=0;i<10;i++){if(acc+A.bins[i]>=tot/2){med=(i+(tot/2-acc)/(A.bins[i]||1))/10;break;}acc+=A.bins[i];}
  A.desv=Math.sqrt(v/tot);A.mediana=med;A.bajo50=(A.bins.slice(0,5).reduce((a,b)=>a+b,0))/tot;
  return A;
}

/* ── Gráficos (Chart.js) ── */
const CH=new Map();
function chart(id,cfg){if(typeof Chart!=='function')return;const el=$(id);if(!el)return;const prev=CH.get(id);if(prev)try{prev.destroy();}catch(e){}
  Chart.defaults.font.family="Barlow,'Segoe UI',sans-serif";Chart.defaults.color='#52514e';
  CH.set(id,new Chart(el,cfg));}
const ejes=(extra)=>Object.assign({grid:{color:C.grid},border:{display:false}},extra||{});
const est=(p)=>p>=META?'<span class="ix-st ok">✔ Aprobado</span>':'<span class="ix-st bad">▼ Refuerzo</span>';
const barra=(p)=>`<div class="ix-bar"><i style="width:${Math.min(100,p*100)}%;background:${p>=META?C.bueno:C.critico}"></i><b style="left:70%"></b></div>`;

function conclusiones(A){
  const out=[],prom=A.sr/A.n;
  out.push(`El promedio general es <b>${pct(prom)}</b> — ${prom>=META?'supera':'está por debajo de'} la meta de 70%.`);
  const t=[...A.temas.values()].map(x=>({...x,p:x.sp/x.n})).sort((a,b)=>a.p-b.p);
  if(t.length>1) out.push(`Tema más débil: <b>${esc(t[0].nom)}</b> (${pct(t[0].p)}). Tema más fuerte: <b>${esc(t[t.length-1].nom)}</b> (${pct(t[t.length-1].p)}).`);
  const s=[...A.sect.values()].map(x=>({...x,p:x.sr/x.n})).sort((a,b)=>a.p-b.p);
  if(s.length>1) out.push(`Sector con menor promedio: <b>${esc(s[0].sector)}</b> (${pct(s[0].p)}); con mayor: <b>${esc(s[s.length-1].sector)}</b> (${pct(s[s.length-1].p)}).`);
  const r=[...A.rutas.values()].map(x=>({...x,p:x.sr/x.n})).filter(x=>x.p<META).sort((a,b)=>a.p-b.p);
  if(r.length) out.push(`<b>${r.length}</b> de ${A.rutas.size} rutas están en refuerzo. Prioriza: ${r.slice(0,3).map(x=>`<b>${esc(x.ruta)}${x.codigo?' ('+esc(x.codigo)+')':''}</b> de ${esc(x.sector)} ${pct(x.p)}`).join(', ')}.`);
  else out.push('Todas las rutas evaluadas alcanzan la meta de 70%. 🎉');
  out.push(`El <b>${pct(A.bajo50)}</b> de los evaluados obtuvo menos de 50%.`);
  return out;
}
/* Pinta el panel estadístico en el contenedor pid */
function panelStats(pid,filas,opt){
  const el=$(pid); if(!el) return;
  if(!filas.length){el.innerHTML='<div class="m-empty">No hay evaluaciones registradas en este periodo.</div>';return;}
  const A=agregar(filas), prom=A.sr/A.n, rutas=[...A.rutas.values()].map(x=>({...x,p:x.sr/x.n}));
  const rRef=rutas.filter(x=>x.p<META).length;
  const sem=[...A.sem.values()].sort((a,b)=>a.sem.localeCompare(b.sem));
  const temas=[...A.temas.values()].map(x=>({...x,p:x.sp/x.n})).sort((a,b)=>a.p-b.p);
  const sect=[...A.sect.values()].map(x=>({...x,p:x.sr/x.n})).sort((a,b)=>b.n-a.n);
  const ord=[...rutas].sort((a,b)=>b.p-a.p);
  const p=pid;
  el.innerHTML=`
  <div class="kstrip ix-k">
    <div class="kcard"><div class="klbl">Evaluados</div><div class="kval">${fmtN(A.n)}</div><div class="ksub">📱 QR ${fmtN(A.mod.QR||0)} · 📋 Manual ${fmtN(A.mod.MANUAL||0)}</div></div>
    <div class="kcard ${prom>=META?'kg':'kr'}"><div class="klbl">Promedio general</div><div class="kval">${pct(prom)}</div>${barra(prom)}<div class="ksub">Meta 70% · ${prom>=META?'✔ cumple':'▼ no cumple'}</div></div>
    <div class="kcard"><div class="klbl">Aprobados (≥70%)</div><div class="kval">${pct(A.apr/A.n)}</div><div class="ksub">${fmtN(A.apr)} de ${fmtN(A.n)} trabajadores</div></div>
    <div class="kcard ${rRef?'kr':'kg'}"><div class="klbl">Rutas en refuerzo</div><div class="kval">${rRef}</div><div class="ksub">de ${rutas.length} rutas / códigos</div></div>
    <div class="kcard"><div class="klbl">Mediana · Desviación</div><div class="kval">${pct(A.mediana)}</div><div class="ksub">± ${P1(A.desv)} pts de dispersión</div></div>
    <div class="kcard"><div class="klbl">Cobertura</div><div class="kval">${A.sect.size}</div><div class="ksub">sectores · ${A.dias.size} día(s) · ${A.sups.size} supervisor(es)</div></div>
  </div>
  <div class="ix-concl"><div class="ix-concl-t">💡 Lectura rápida</div><ul>${conclusiones(A).map(x=>`<li>${x}</li>`).join('')}</ul></div>
  <div class="ix-g2">
    <div class="m-card"><h3 class="m-tit2">¿Cuántos trabajadores obtuvieron cada nota?</h3><p class="ix-sub">Distribución de resultados en tramos de 10 puntos. Verde = aprobado (≥70%), rojo = refuerzo.</p><div class="ix-ch"><canvas id="${p}-hist"></canvas></div></div>
    <div class="m-card"><h3 class="m-tit2">Promedio por tema</h3><p class="ix-sub">Del tema más débil al más fuerte. La línea punteada es la meta de 70%.</p><div class="ix-ch"><canvas id="${p}-temas"></canvas></div></div>
  </div>
  <div class="ix-g2">
    <div class="m-card"><h3 class="m-tit2">Evolución semanal del promedio</h3><p class="ix-sub">Promedio de cada semana frente a la meta.</p><div class="ix-ch sm"><canvas id="${p}-semp"></canvas></div></div>
    <div class="m-card"><h3 class="m-tit2">Trabajadores evaluados por semana</h3><p class="ix-sub">Avance de la cobertura.</p><div class="ix-ch sm"><canvas id="${p}-semn"></canvas></div></div>
  </div>
  <div class="ix-g2">
    <div class="m-card"><h3 class="m-tit2">Aprobados vs. refuerzo por sector</h3><p class="ix-sub">Proporción de trabajadores en cada sector (100%).</p><div class="ix-ch" style="height:${Math.max(220,sect.length*38+60)}px"><canvas id="${p}-apr"></canvas></div></div>
    <div class="m-card"><h3 class="m-tit2">Mejores y peores rutas</h3><p class="ix-sub">Por promedio; mínimo 1 evaluado.</p>
      <div class="ix-rank"><div><div class="ix-rk-t ok">🏆 Top 5</div>${ord.slice(0,5).map((x,i)=>`<div class="ix-rk"><span>${i+1}</span><b>${esc(x.ruta)}</b><small>${esc(x.sector)}${x.codigo?' · '+esc(x.codigo):''}</small><em>${pct(x.p)}</em></div>`).join('')}</div>
      <div><div class="ix-rk-t bad">⚠️ Requieren refuerzo</div>${ord.slice(-5).reverse().map((x,i)=>`<div class="ix-rk"><span>${i+1}</span><b>${esc(x.ruta)}</b><small>${esc(x.sector)}${x.codigo?' · '+esc(x.codigo):''}</small><em class="${x.p<META?'bad':''}">${pct(x.p)}</em></div>`).join('')}</div></div></div>
  </div>
  <div class="m-card" style="margin-bottom:1rem"><h3 class="m-tit2">Mapa de calor: tema × sector</h3><p class="ix-sub">% logrado. Más oscuro = mejor. Las celdas con borde rojo están bajo 70%.</p>
    <div class="m-tablewrap"><table class="ix-heat"><thead><tr><th>Sector</th>${[...temas].sort((a,b)=>a.id.localeCompare(b.id)).map(t=>`<th title="${esc(t.nom)}">${esc(t.nom)}</th>`).join('')}<th>General</th></tr></thead><tbody>
    ${sect.map(s=>`<tr><th>${esc(s.sector)}</th>${[...temas].sort((a,b)=>a.id.localeCompare(b.id)).map(t=>{const X=A.st.get(s.sector+'|'+t.id);if(!X||!X.n)return '<td>—</td>';const v=X.sp/X.n;const c=C.rampa[Math.min(11,Math.max(0,Math.round(v*11)))];
      return `<td style="background:${c};color:${v>0.55?'#fff':'#0b0b0b'};${v<META?'box-shadow:inset 0 0 0 2px '+C.critico:''}" title="${esc(s.sector)} · ${esc(t.nom)}: ${pct(v)}">${P1(v)}</td>`;}).join('')}<td><b>${pct(s.p)}</b></td></tr>`).join('')}
    </tbody></table></div></div>`;
  const tick={callback:v=>v+'%'};
  chart(p+'-hist',{type:'bar',data:{labels:['0-9','10-19','20-29','30-39','40-49','50-59','60-69','70-79','80-89','90-100'],datasets:[{label:'Trabajadores',data:A.bins,
    backgroundColor:A.bins.map((_,i)=>i>=7?C.bueno:C.critico),borderRadius:4,borderSkipped:'bottom',maxBarThickness:46}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{title:i=>'Nota '+i[0].label+'%',label:i=>' '+fmtN(i.raw)+' trabajador(es)'}}},
      scales:{x:ejes({grid:{display:false},title:{display:true,text:'Nota obtenida (%)'}}),y:ejes({beginAtZero:true,ticks:{precision:0},title:{display:true,text:'Trabajadores'}})}}});
  chart(p+'-temas',{data:{labels:temas.map(t=>t.nom),datasets:[
    {type:'bar',label:'% logrado',data:temas.map(t=>P1(t.p)),backgroundColor:temas.map(t=>t.p>=META?C.bueno:C.critico),borderRadius:4,maxBarThickness:26},
    {type:'line',label:'Meta 70%',data:temas.map(()=>70),borderColor:C.meta,borderDash:[5,4],borderWidth:2,pointRadius:0}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:i=>' '+i.dataset.label+': '+i.raw+'%'}}},
      scales:{x:ejes({min:0,max:100,ticks:tick}),y:ejes({grid:{display:false}})}}});
  const lbl=sem.map(w=>'Sem. '+w.sem.slice(8,10)+'/'+w.sem.slice(5,7));
  chart(p+'-semp',{type:'line',data:{labels:lbl,datasets:[
    {label:'Promedio',data:sem.map(w=>P1(w.sr/w.n)),borderColor:C.serie,backgroundColor:C.serie,borderWidth:2,pointRadius:4,tension:.25},
    {label:'Meta 70%',data:sem.map(()=>70),borderColor:C.meta,borderDash:[5,4],borderWidth:2,pointRadius:0}]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:i=>' '+i.dataset.label+': '+i.raw+'%'}}},
      scales:{y:ejes({min:0,max:100,ticks:tick}),x:ejes({grid:{display:false}})}}});
  chart(p+'-semn',{type:'bar',data:{labels:lbl,datasets:[{label:'Evaluados',data:sem.map(w=>w.n),backgroundColor:C.serie,borderRadius:4,maxBarThickness:46}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:i=>' '+fmtN(i.raw)+' evaluados'}}},
      scales:{y:ejes({beginAtZero:true,ticks:{precision:0}}),x:ejes({grid:{display:false}})}}});
  chart(p+'-apr',{type:'bar',data:{labels:sect.map(s=>s.sector),datasets:[
    {label:'✔ Aprobados (≥70%)',data:sect.map(s=>P1(s.apr/s.n)),backgroundColor:C.bueno,borderRadius:4,borderSkipped:false},
    {label:'▼ Refuerzo (<70%)',data:sect.map(s=>P1(1-s.apr/s.n)),backgroundColor:C.critico,borderRadius:4,borderSkipped:false}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:i=>' '+i.dataset.label+': '+i.raw+'%'}}},
      datasets:{bar:{borderColor:'#fff',borderWidth:{left:2,right:2}}},scales:{x:ejes({stacked:true,min:0,max:100,ticks:tick}),y:ejes({stacked:true,grid:{display:false}})}}});
}

/* ── Estado del módulo Indicadores ── */
const IND={filas:[],fuente:'',f:null,busca:'',orden:'prom'};
function filtrosIni(){const d=new Date();return {desde:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-01',hasta:hoyL(),empresa:'',sector:'',supervisor:'',modalidad:''};}
function filtrar(filas,f){
  return filas.filter(r=>(!f.empresa||r.empresa===f.empresa)&&(!f.sector||r.sector===f.sector)&&(!f.modalidad||r.modalidad===f.modalidad)
    &&(esAdmin()?(!f.supervisor||_cumCoincide(r.supervisor,f.supervisor)):_cumCoincide(r.supervisor,SESSION.nom)));
}
function contenedor(){return esAdmin()?$('admin-indicadores'):$('ind-sup');}
function pintarBase(){
  const box=contenedor(); if(!box) return;
  const f=IND.f, sects=(typeof SECTORES_TODOS!=='undefined'?SECTORES_TODOS:[]);
  box.innerHTML=`
  <div class="m-head" style="margin-bottom:.8rem"><div><h2 class="m-tit">📈 Indicadores de evaluaciones</h2>
    <p class="m-sub">Evaluados por sector, ruta y código — evaluación manual y por QR (anónima). <span id="ind-fuente" class="m-mut"></span></p></div>
    <div class="m-acts">
      <button class="btn bout bsm" onclick="ETIND.excel()">📊 Excel</button>
      ${esAdmin()?'<button class="btn bout bsm" onclick="ETIND.sincronizar()" title="Envía a Azure lo que quedó solo en Firebase">🔄 Sincronizar con Azure</button>':''}
      <button class="btn bpri bsm" onclick="ETIND.cargar(true)">↻ Actualizar</button></div></div>
  <div class="m-card" style="padding:.9rem 1rem;margin-bottom:1rem">
    <div class="ix-filtros">
      <div class="fg"><label class="fl">Desde</label><input class="fc" type="date" id="ind-desde" value="${f.desde}"></div>
      <div class="fg"><label class="fl">Hasta</label><input class="fc" type="date" id="ind-hasta" value="${f.hasta}"></div>
      <div class="fg"><label class="fl">Empresa</label><select class="fc" id="ind-emp"><option value="">Todas</option><option ${f.empresa==='VERFRUT S.A.C.'?'selected':''}>VERFRUT S.A.C.</option><option ${f.empresa==='RAPEL S.A.C.'?'selected':''}>RAPEL S.A.C.</option></select></div>
      <div class="fg"><label class="fl">Sector / fundo</label><select class="fc" id="ind-sec"><option value="">Todos</option>${sects.map(s=>`<option ${f.sector===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div>
      ${esAdmin()?`<div class="fg"><label class="fl">Supervisor</label><select class="fc" id="ind-sup"><option value="">Todos</option>${SUPERVISORES.filter(s=>s.rol!=='Administrador').map(s=>`<option ${f.supervisor===s.nom?'selected':''}>${esc(s.nom)}</option>`).join('')}</select></div>`:''}
      <div class="fg"><label class="fl">Modalidad</label><select class="fc" id="ind-mod"><option value="">Todas</option><option value="QR" ${f.modalidad==='QR'?'selected':''}>QR (anónima)</option><option value="MANUAL" ${f.modalidad==='MANUAL'?'selected':''}>Manual</option></select></div>
      <button class="btn bpri" onclick="ETIND.aplicar()">Filtrar</button>
    </div></div>
  <div id="ind-cuerpo"><div class="m-empty">Cargando indicadores…</div></div>`;
}
function pintarCuerpo(){
  const el=$('ind-cuerpo'); if(!el) return;
  const fu=$('ind-fuente'); if(fu) fu.innerHTML=IND.fuente?`· Fuente: <b>${esc(IND.fuente)}</b>`:'';
  const filas=filtrar(IND.filas,IND.f), A=agregar(filas);
  if(!A.n){el.innerHTML='<div class="m-empty">No hay evaluaciones registradas con estos filtros.</div>';return;}
  const adm=esAdmin(), sect=[...A.sect.values()].sort((a,b)=>b.n-a.n), rutas=[...A.rutas.values()];
  const q=IND.busca.toLowerCase();
  let rl=rutas.filter(r=>!q||(r.sector+' '+r.ruta+' '+r.codigo).toLowerCase().includes(q));
  rl.sort(IND.orden==='prom'?(a,b)=>a.sr/a.n-b.sr/b.n:IND.orden==='n'?(a,b)=>b.n-a.n:(a,b)=>a.sector.localeCompare(b.sector)||a.ruta.localeCompare(b.ruta,undefined,{numeric:true}));
  const acc=(tipo,s,r,c)=>adm?`<td class="ix-acc"><button class="m-ico" title="Editar" onclick="event.stopPropagation();ETIND.editar('${tipo}',${JSON.stringify(s).replace(/"/g,'&quot;')},${JSON.stringify(r).replace(/"/g,'&quot;')},${JSON.stringify(c).replace(/"/g,'&quot;')})">✏️</button><button class="m-ico" title="Eliminar" onclick="event.stopPropagation();ETIND.eliminar('${tipo}',${JSON.stringify(s).replace(/"/g,'&quot;')},${JSON.stringify(r).replace(/"/g,'&quot;')},${JSON.stringify(c).replace(/"/g,'&quot;')})">🗑</button></td>`:'';
  el.innerHTML=`<div id="ind-stats"></div>
  <div class="m-card" style="margin-bottom:1rem"><h3 class="m-tit2">📍 Por sector / fundo</h3>
    <div class="m-tablewrap"><table class="m-table"><thead><tr><th>Sector</th><th>Evaluados</th><th>Rutas</th><th>Promedio</th><th></th><th>Aprobados</th><th>Última</th><th>Estado</th>${adm?'<th></th>':''}</tr></thead><tbody>
    ${sect.map(s=>`<tr style="cursor:pointer" title="Ver solo este sector" onclick="ETIND.verSector('${esc(s.sector)}')"><td><b>${esc(s.sector)}</b></td><td>${fmtN(s.n)}</td><td>${s.rutas.size}</td><td><b>${pct(s.sr/s.n)}</b></td><td>${barra(s.sr/s.n)}</td><td>${pct(s.apr/s.n)}</td><td>${esc(fmtF(s.ult))}</td><td>${est(s.sr/s.n)}</td>${acc('sector',s.sector,null,null)}</tr>`).join('')}
    </tbody></table></div></div>
  <div class="m-card"><div class="m-head" style="margin-bottom:.6rem;align-items:center"><h3 class="m-tit2" style="margin:0">🚌 Por ruta y código</h3>
      <div class="m-acts"><input class="fc m-buscar" id="ind-busca" placeholder="🔎 Buscar sector, ruta o código…" value="${esc(IND.busca)}" oninput="ETIND.buscar(this.value)">
      <select class="fc" style="width:auto" onchange="ETIND.ordenar(this.value)"><option value="prom" ${IND.orden==='prom'?'selected':''}>Menor promedio primero</option><option value="n" ${IND.orden==='n'?'selected':''}>Más evaluados</option><option value="alf" ${IND.orden==='alf'?'selected':''}>Sector y ruta</option></select></div></div>
    <div class="m-tablewrap" style="max-height:560px;overflow:auto"><table class="m-table"><thead><tr><th>Sector</th><th>Ruta</th><th>Código</th><th>Evaluados</th><th>Promedio</th><th></th><th>Aprobados</th><th>Modalidad</th><th>Última</th><th>Estado</th>${adm?'<th></th>':''}</tr></thead><tbody>
    ${rl.slice(0,500).map(r=>`<tr><td>${esc(r.sector)}</td><td><b>${esc(r.ruta)}</b></td><td>${esc(r.codigo||'—')}</td><td>${fmtN(r.n)}</td><td><b>${pct(r.sr/r.n)}</b></td><td>${barra(r.sr/r.n)}</td><td>${pct(r.apr/r.n)}</td><td>${[...r.mods].map(m=>m==='QR'?'📱 QR':'📋 Manual').join(' · ')}</td><td>${esc(fmtF(r.ult))}</td><td>${est(r.sr/r.n)}</td>${acc('ruta',r.sector,r.ruta,r.codigo)}</tr>`).join('')}
    </tbody></table>${rl.length>500?`<div class="m-mut" style="padding:.6rem">Mostrando 500 de ${rl.length}. Usa el buscador o descarga el Excel.</div>`:''}</div></div>`;
  panelStats('ind-stats',filas);
}

/* ── Editar / eliminar (admin): Azure + Firebase ── */
window.etiMiniForm=function(){return miniForm.apply(this,arguments);};   /* _MINIFORM_GLOBAL_V1 (19-oct): lo usan Informe GH-04 y Cambiar fecha */
function miniForm(titulo,nota,campos,onOk){
  let m=$('ix-modal'); if(!m){m=document.createElement('div');m.id='ix-modal';m.className='ix-modal';document.body.appendChild(m);}
  m.innerHTML=`<div class="ix-mbox"><h3>${titulo}</h3><p>${nota}</p>${campos.map(c=>c.lista
    ?`<label class="fl">${c.lbl}</label><select class="fc" id="ixm-${c.k}">${c.lista.map(o=>`<option ${o===c.v?'selected':''}>${esc(o)}</option>`).join('')}</select>`
    :`<label class="fl">${c.lbl}</label><input class="fc" id="ixm-${c.k}" value="${esc(c.v||'')}">`).join('')}
    <div class="ix-macts"><button class="btn bout" id="ixm-no">Cancelar</button><button class="btn bpri" id="ixm-ok">${campos.length?'Guardar cambios':'Sí, eliminar'}</button></div></div>`;
  m.classList.add('on');
  $('ixm-no').onclick=()=>m.classList.remove('on');
  $('ixm-ok').onclick=()=>{const v={};campos.forEach(c=>v[c.k]=($('ixm-'+c.k).value||'').trim());m.classList.remove('on');onOk(v);};
}
async function fbAplicar(filtro,cambios){
  /* respuestas QR */
  let q=fbdb.collection('respuestas_qr');
  q=filtro.sesion_id?q.where('sesion','==',filtro.sesion_id):q.where('fecha','>=',filtro.desde).where('fecha','<=',filtro.hasta);
  const snap=await q.get(); let n=0;
  const ok=x=>(!filtro.ids||filtro.ids.includes(x.id))&&(!filtro.sector||x.d.sector===filtro.sector)&&(filtro.ruta==null||U(x.d.ruta)===U(filtro.ruta))&&(filtro.codigo==null||U(x.d.cod)===U(filtro.codigo));
  const docs=snap.docs.map(d=>({id:d.id,ref:d.ref,d:d.data()})).filter(ok);
  for(let i=0;i<docs.length;i+=400){const b=fbdb.batch();docs.slice(i,i+400).forEach(x=>{
    if(cambios){const u={};if(cambios.sector)u.sector=cambios.sector;if(cambios.ruta)u.ruta=U(cambios.ruta);if(cambios.codigo!=null)u.cod=U(cambios.codigo);b.update(x.ref,u);}else b.delete(x.ref);});
    await b.commit();n+=Math.min(400,docs.length-i);}
  /* evaluaciones manuales (por ruta dentro del documento) */
  if(!filtro.sesion_id&&!filtro.ids){
    const ev=await fbdb.collection(COL_EVAL).where('fecha','>=',filtro.desde).where('fecha','<=',filtro.hasta).get();
    for(const d of ev.docs){const x=d.data(); if(x.modalidad==='QR'||(filtro.sector&&x.sector!==filtro.sector)) continue;
      const match=r=>(filtro.ruta==null||U(r.nom)===U(filtro.ruta))&&(filtro.codigo==null||U(r.cod)===U(filtro.codigo));
      const rutas=x.rutas||[]; if(!rutas.some(match)) continue;
      if(cambios){
        const nr=rutas.map(r=>match(r)?{...r,nom:cambios.ruta?U(cambios.ruta):r.nom,cod:cambios.codigo!=null?U(cambios.codigo):r.cod}:r);
        const u={rutas:nr}; if(cambios.sector&&rutas.every(match)) u.sector=cambios.sector;
        await d.ref.update(u);
      }else{
        const nr=rutas.filter(r=>!match(r));
        if(!nr.length) await d.ref.delete(); else await d.ref.update({rutas:nr,resGen:nr.reduce((a,r)=>a+(r.resGrupo||0),0)/nr.length});
      }
      n++;}
  }
  return n;
}
async function aplicarCambio(filtro,cambios,texto){
  toast('⏳ '+texto+'…','i');
  let az=null,azErr=null;
  try{ az=await azAdmin(cambios?'editar':'eliminar',filtro,cambios); }catch(e){ azErr=e.message; }
  let fb=0; try{ fb=await fbAplicar(filtro,cambios); }catch(e){ console.error(e); toast('Firebase: '+e.message,'e'); }
  CACHE.clear();
  if(azErr) toast('⚠ Firebase actualizado ('+fb+'), pero Azure no: '+azErr,'e');
  else toast(`✅ Listo · Azure ${az.editados!=null?az.editados+' editados':az.eliminados+' eliminados'} · Firebase ${fb}`,'s');
}
window.etiAdminCambio=aplicarCambio;

/* ── Acciones ── */
const ETIND={
  abrir(){
    if(window.etiTieneAcceso&&!etiTieneAcceso('ind')){toast('🔒 No tienes acceso a Indicadores','e');return;}
    if(!$('sind')){const d=document.createElement('div');d.className='screen';d.id='sind';d.innerHTML='<div class="dlayout"><div id="ind-sup"></div></div>';document.body.appendChild(d);}
    go('sind'); ETIND.iniciar();
  },
  iniciar(){ if(!IND.f) IND.f=filtrosIni(); pintarBase(); ETIND.cargar();
    /* _IND_VIVO_V1 (07-oct-2026): mientras los indicadores estén visibles, se actualizan solos cada 2 min */
    if(!window._indVivo) window._indVivo=setInterval(()=>{const c=$('ind-cuerpo');if(c&&c.offsetParent!==null&&!document.hidden)ETIND.cargar(true);},120000); },
  aplicar(){
    const v=id=>($(id)?$(id).value:'');
    const nd=v('ind-desde'),nh=v('ind-hasta'); const cf=nd!==IND.f.desde||nh!==IND.f.hasta;
    Object.assign(IND.f,{desde:nd,hasta:nh,empresa:v('ind-emp'),sector:v('ind-sec'),supervisor:v('ind-sup'),modalidad:v('ind-mod')});
    if(cf) ETIND.cargar(); else pintarCuerpo();
  },
  async cargar(forzar){
    const el=$('ind-cuerpo'); if(el) el.innerHTML='<div class="m-empty">Cargando indicadores…</div>';
    try{ const r=await cargarFilas(IND.f.desde,IND.f.hasta,forzar); IND.filas=r.filas; IND.fuente=r.fuente; }
    catch(e){ if(el) el.innerHTML='<div class="m-empty">No se pudo leer los datos: '+esc(e.message)+'</div>'; return; }
    pintarCuerpo();
  },
  buscar(v){IND.busca=v;pintarCuerpo();const i=$('ind-busca');if(i){i.focus();i.setSelectionRange(v.length,v.length);}},
  ordenar(v){IND.orden=v;pintarCuerpo();},
  verSector(s){IND.f.sector=s;pintarBase();pintarCuerpo();},
  editar(tipo,sector,ruta,codigo){
    if(!esAdmin()) return;
    const {desde,hasta}=IND.f, sects=(typeof SECTORES_TODOS!=='undefined'?SECTORES_TODOS:[]);
    const campos=tipo==='sector'?[{k:'sector',lbl:'Nuevo nombre de sector / fundo',v:sector,lista:sects.includes(sector)?sects:[sector,...sects]}]
      :[{k:'sector',lbl:'Sector / fundo',v:sector,lista:sects.includes(sector)?sects:[sector,...sects]},{k:'ruta',lbl:'Ruta',v:ruta},{k:'codigo',lbl:'Código',v:codigo}];
    miniForm(tipo==='sector'?'✏️ Corregir sector':'✏️ Corregir ruta y código',`Se corregirán todos los registros de <b>${esc(tipo==='sector'?sector:ruta+' '+(codigo||''))}</b> entre ${fmtF(desde)} y ${fmtF(hasta)}, en Azure y en Firebase.`,campos,async v=>{
      const filtro={desde,hasta,sector}; if(tipo==='ruta'){filtro.ruta=ruta;filtro.codigo=codigo||'';}
      const cambios={}; if(v.sector&&v.sector!==sector)cambios.sector=v.sector; if(tipo==='ruta'){if(U(v.ruta)!==U(ruta))cambios.ruta=v.ruta; if(U(v.codigo)!==U(codigo))cambios.codigo=v.codigo;}
      if(!Object.keys(cambios).length){toast('No hay cambios','i');return;}
      await aplicarCambio(filtro,cambios,'Corrigiendo'); ETIND.cargar(true);
    });
  },
  eliminar(tipo,sector,ruta,codigo){
    if(!esAdmin()) return;
    const {desde,hasta}=IND.f, nom=tipo==='sector'?'el sector '+sector:'la ruta '+ruta+(codigo?' ('+codigo+')':'')+' de '+sector;
    miniForm('🗑 Eliminar registros',`Se eliminarán <b>todas</b> las evaluaciones de <b>${esc(nom)}</b> entre ${fmtF(desde)} y ${fmtF(hasta)} (Azure y Firebase). <b>No se puede deshacer.</b>`,[],async()=>{
      const filtro={desde,hasta,sector}; if(tipo==='ruta'){filtro.ruta=ruta;filtro.codigo=codigo||'';}
      await aplicarCambio(filtro,null,'Eliminando'); ETIND.cargar(true);
    });
  },
  excel(){
    if(typeof XLSX==='undefined'){toast('Excel no disponible','i');return;}
    const A=agregar(filtrar(IND.filas,IND.f)); if(!A.n){toast('No hay datos para exportar','i');return;}
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Indicadores Evaluaciones ETI'],['Desde',IND.f.desde,'Hasta',IND.f.hasta,'Fuente',IND.fuente],[],
      ['Evaluados',A.n],['Promedio %',P1(A.sr/A.n)],['Mediana % (aprox.)',P1(A.mediana)],['Desviación (pts)',P1(A.desv)],['Aprobados %',P1(A.apr/A.n)],['Rutas/códigos',A.rutas.size],['Sectores',A.sect.size],[],
      ['Distribución','Trabajadores'],...['0-9','10-19','20-29','30-39','40-49','50-59','60-69','70-79','80-89','90-100'].map((l,i)=>[l+'%',A.bins[i]])]),'Resumen');
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Sector','Evaluados','Rutas','Promedio %','Aprobados %','Última','Estado'],
      ...[...A.sect.values()].map(s=>[s.sector,s.n,s.rutas.size,P1(s.sr/s.n),P1(s.apr/s.n),s.ult,s.sr/s.n>=META?'APROBADO':'REFUERZO'])]),'Por sector');
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Sector','Ruta','Código','Evaluados','Promedio %','Aprobados %','Modalidad','Supervisor(es)','Última','Estado'],
      ...[...A.rutas.values()].map(r=>[r.sector,r.ruta,r.codigo,r.n,P1(r.sr/r.n),P1(r.apr/r.n),[...r.mods].join('/'),[...r.sups].join(' / '),r.ult,r.sr/r.n>=META?'APROBADO':'REFUERZO'])]),'Por ruta y código');
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Tema','% logrado'],...[...A.temas.values()].map(t=>[t.nom,P1(t.sp/t.n)])]),'Por tema');
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Semana (lunes)','Evaluados','Promedio %'],...[...A.sem.values()].sort((a,b)=>a.sem.localeCompare(b.sem)).map(w=>[w.sem,w.n,P1(w.sr/w.n)])]),'Por semana');
    XLSX.writeFile(wb,`Indicadores-ETI-${IND.f.desde}_a_${IND.f.hasta}.xlsx`);
  },
  async sincronizar(){
    if(!esAdmin()||!fbdb) return;
    confMod('¿Sincronizar con Azure?','Se enviarán a Azure SQL todas las evaluaciones guardadas en Firebase (manuales y QR). Las que ya existen no se duplican.',async()=>{
      try{
        toast('🔄 Leyendo Firebase…','i');
        const regs=[];
        (await fbdb.collection('respuestas_qr').get()).docs.forEach(d=>{const x=d.data();if(x.fecha&&x.resultado!=null)regs.push(regDeRespuesta(x,d.id));});
        (await fbdb.collection(COL_EVAL).get()).docs.forEach(d=>regs.push(...regsDeEval(d.data(),d.id)));
        let ins=0,ex=0;
        for(let i=0;i<regs.length;i+=100){const r=await azPost(regs.slice(i,i+100));ins+=r.insertados||0;ex+=r.existentes||0;
          if(i%500===0) toast(`🔄 Enviando… ${Math.min(i+100,regs.length)} de ${regs.length}`,'i');}
        toast(`✅ Azure al día: ${ins} nuevos · ${ex} ya estaban`,'s'); CACHE.clear(); ETIND.cargar(true);
      }catch(e){console.error(e);toast('No se pudo sincronizar: '+e.message,'e');}
    });
  }
};
window.ETIND=ETIND;

/* ── Panel estadístico en Estadísticas, Mi Dashboard y Dashboard del supervisor ── */
const PERIODOS=[['mes','Este mes'],['3m','Últimos 3 meses'],['anio','Este año'],['todo','Todo']];
function rango(k){const d=new Date(),h=hoyL();
  if(k==='mes') return [d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-01',h];
  if(k==='3m'){const a=new Date(d);a.setMonth(a.getMonth()-3);return [iso(a),h];}
  if(k==='anio') return [d.getFullYear()+'-01-01',h];
  return ['2020-01-01',h];}
const PANEL={};
async function montar(hostId,pid,titulo,soloMio){
  const host=$(hostId); if(!host) return;
  let box=$(pid+'-box');
  if(!box){box=document.createElement('div');box.id=pid+'-box';box.className='ix-panel';
    const ref=host.querySelector('#es-hero-adm')?host.querySelector('#es-hero-adm').nextSibling:host.firstElementChild?host.firstElementChild.nextSibling:null;
    host.insertBefore(box,ref);}
  const per=PANEL[pid]||'mes'; PANEL[pid]=per;
  box.innerHTML=`<div class="m-head" style="margin:0 0 .8rem;align-items:center"><div><h2 class="m-tit">📊 ${titulo}</h2><p class="m-sub">Evaluaciones manuales y por QR · <span id="${pid}-fu" class="m-mut">cargando…</span></p></div>
    <div class="ix-seg">${PERIODOS.map(([k,l])=>`<button class="${k===per?'on':''}" onclick="ETIND.periodo('${hostId}','${pid}','${esc(titulo)}',${soloMio?1:0},'${k}')">${l}</button>`).join('')}</div></div>
    <div id="${pid}"><div class="m-empty">Cargando estadísticas…</div></div>`;
  try{
    const [d,h]=rango(per); const r=await cargarFilas(d,h);
    const filas=soloMio||!esAdmin()?r.filas.filter(x=>_cumCoincide(x.supervisor,SESSION.nom)):r.filas;
    const fu=$(pid+'-fu'); if(fu) fu.innerHTML='Fuente: <b>'+esc(r.fuente)+'</b> · '+fmtF(d)+' – '+fmtF(h);
    panelStats(pid,filas);
  }catch(e){const x=$(pid);if(x)x.innerHTML='<div class="m-empty">No se pudo cargar: '+esc(e.message)+'</div>';}
}
ETIND.periodo=(hostId,pid,titulo,soloMio,k)=>{PANEL[pid]=k;montar(hostId,pid,titulo,!!soloMio);};
function inyectar(){
  if(!esAdmin()) return;
  if(!$('admin-indicadores')){const st=$('admin-stats');if(st){const p=document.createElement('div');p.id='admin-indicadores';p.style.display='none';st.parentNode.insertBefore(p,st);}}
  if(!$('atab12')){const ref=$('atab1');if(ref){const b=document.createElement('button');b.className='btn bout bsm';b.id='atab12';b.innerHTML='📈 Indicadores';b.onclick=()=>adminTab('indicadores');ref.parentNode.insertBefore(b,ref.nextSibling);}}
}
const _at=window.adminTab;
window.adminTab=function(t){
  const p=$('admin-indicadores'); if(p) p.style.display='none';
  const r=_at.apply(this,arguments);
  const b=$('atab12'); if(b) b.className=t==='indicadores'?'btn bpri bsm':'btn bout bsm';
  if(t==='indicadores') ETIND.iniciar();
  if(t==='stats') setTimeout(()=>montar('admin-stats','est-global','Estadística general de evaluaciones',false),60);
  if(t==='dash') setTimeout(()=>montar('admin-dash','est-mio','Mis indicadores',false),60);
  return r;
};
const _go=window.go;
window.go=function(id){
  if(id==='sadmin') inyectar();
  const r=_go.apply(this,arguments);
  if(id==='sadmin'){const st=$('admin-stats');if(st&&st.style.display!=='none')setTimeout(()=>montar('admin-stats','est-global','Estadística general de evaluaciones',false),120);}
  if(id==='sdash') setTimeout(()=>montar('sdash-host','est-sup','Mis indicadores',true),60);
  return r;
};
/* el dashboard del supervisor no tiene id propio en su contenido: se marca su contenedor */
function marcarSdash(){const d=document.querySelector('#sdash .dlayout');if(d&&!d.id)d.id='sdash-host';}
function arr(){ marcarSdash(); const a=document.querySelector('.screen.active'); if(a&&a.id==='sadmin'){inyectar();setTimeout(()=>montar('admin-stats','est-global','Estadística general de evaluaciones',false),800);} }
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arr);else arr();
console.log('[_INDICADORES_V2] listo');
})();
