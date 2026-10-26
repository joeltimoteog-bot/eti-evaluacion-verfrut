/* Evaluaciones ETI · index.html · bloque 10-mis-evaluaciones (antes en la linea 7958) · extraido el 26-oct-2026 sin cambios (_EVAL_MODULAR_V1) */
/* ══════════════════════════════════════════════════════════════
   _MIS_EVAL_V1 (08-oct-2026) — 🗂 Mis evaluaciones
   El supervisor ve, en vivo, TODAS sus evaluaciones: las de su QR (cada
   trabajador) y las manuales. El admin puede elegir cualquier supervisor.
   En el Inicio del supervisor aparece el contador de hoy.
   ══════════════════════════════════════════════════════════════ */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const db=()=>(typeof fbdb!=='undefined'?fbdb:null);
const ses=()=>(typeof SESSION!=='undefined'?SESSION:null);
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const hoyI=()=>iso(new Date());
const pc=v=>(Math.round((v||0)*1000)/10).toFixed(1)+'%';
const fF=f=>f?String(f).split('-').reverse().join('/'):'—';
const coincide=(a,b)=>{try{return a===b||(typeof _cumCoincide==='function'&&_cumCoincide(a,b));}catch(e){return a===b;}};
const M={user:'',nom:'',desde:hoyI(),hasta:hoyI(),qrA:[],qrB:[],man:[],unsub:[],pintT:null,todos:false,cargando:false,f:{emp:'',mod:'',tipo:''}};
/* _MIS_EVAL_TODOS_V1 (08-oct-2026): vista general del admin — todos los supervisores, QR y manual, por rango de fechas */
async function cargarTodos(){
  const f=db(); if(!f) return; M.cargando=true; render();
  try{
    const [q,m]=await Promise.all([f.collection('respuestas_qr').where('fecha','>=',M.desde).where('fecha','<=',M.hasta).get(),
      f.collection('evaluaciones_conocimiento').where('fecha','>=',M.desde).where('fecha','<=',M.hasta).get()]);
    M.qrA=q.docs.map(d=>({id:d.id,...d.data()})); M.qrB=[]; M.man=m.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.modalidad!=='QR');
    await cargarInformes();
  }catch(e){console.warn('Vista general:',e);if(typeof toast==='function')toast('No se pudo cargar: '+e.message,'e');}
  M.cargando=false; render();
}

/* nombre del supervisor tal como figura en los QR (lista de Gestión) */
function nomSup(nom){try{const s=(typeof SUPERVISORES!=='undefined'?SUPERVISORES:[]).find(x=>coincide(x.nom,nom));return s?s.nom:nom;}catch(e){return nom;}}
function escuchar(user,nom){
  M.unsub.forEach(u=>{try{u();}catch(e){}}); M.unsub=[]; M.qrA=[];M.qrB=[];M.man=[]; M.user=user; M.nom=nom; M.todos=false;
  const f=db(); if(!f) return;
  const map=s=>s.docs.map(d=>({id:d.id,...d.data()}));
  const er=e=>console.warn('Mis evaluaciones:',e&&e.message);
  if(user) M.unsub.push(f.collection('respuestas_qr').where('usuarioSup','==',user).onSnapshot(s=>{M.qrA=map(s);pintar();},er));
  if(nom)  M.unsub.push(f.collection('respuestas_qr').where('sup','==',nomSup(nom)).onSnapshot(s=>{M.qrB=map(s);pintar();},er));
  if(user) M.unsub.push(f.collection('evaluaciones_conocimiento').where('usuario','==',user).onSnapshot(s=>{M.man=map(s).filter(x=>x.modalidad!=='QR');pintar();},er));
}
function filas(desde,hasta){
  const en=f=>f&&f>=desde&&f<=hasta, vis=new Map();
  [...M.qrA,...M.qrB].forEach(r=>{if(en(r.fecha))vis.set(r.id,{mod:'QR',sup:r.sup,ts:r.ts||0,fecha:r.fecha,emp:r.emp,sector:r.sector,tipo:r.tipo,ruta:r.ruta,cod:r.cod,n:1,res:+r.resultado||0,apr:(+r.resultado||0)>=0.7?1:0,az:!!r.azOk,apl:r.supQR||'',key:r.id,ses:r.sesion||'',fo:r.fechaOriginal||'',hom:r.sexo==='H'?1:0,muj:r.sexo==='M'?1:0,ssx:r.sexo?0:1,secs:(r.secs||[]).map(x=>({nom:x.nom,peso:+x.peso||0,pct:+x.pct||0}))});});
  M.man.forEach(m=>{if(!en(m.fecha))return;(m.rutas||[]).forEach((r,i)=>vis.set(m.id+'_'+i,{mod:'MANUAL',sup:m.sup,ts:m.ts||0,fecha:m.fecha,emp:m.emp,sector:m.sector,tipo:m.tipo,ruta:r.nom,cod:r.cod,n:+r.ne||1,res:+r.resGrupo||0,apr:(+r.resGrupo||0)>=0.7?(+r.ne||1):0,az:!!m.azOk,key:m.id+'_'+i,doc:m.id,fo:m.fechaOriginal||'',hom:+r.hom||0,muj:+r.muj||0,ssx:(r.hom==null&&r.muj==null)?(+r.ne||1):Math.max(0,(+r.ne||1)-(+r.hom||0)-(+r.muj||0)),secs:(r.secs||[]).map(x=>({nom:x.nom,peso:+x.peso||0,pct:x.pct!=null?+x.pct:(+x.cum||0)}))}));});
  return [...vis.values()].filter(r=>(!M.f.emp||r.emp===M.f.emp)&&(!M.f.mod||r.mod===M.f.mod)&&(!M.f.tipo||(M.f.tipo==='empleado'?r.tipo==='empleado':r.tipo!=='empleado'))).sort((a,b)=>b.ts-a.ts);
}
function resumen(F){const q=F.filter(r=>r.mod==='QR'),m=F.filter(r=>r.mod!=='QR');const n=F.reduce((a,r)=>a+r.n,0);
  return {n,qr:q.length,man:m.reduce((a,r)=>a+r.n,0),prom:n?F.reduce((a,r)=>a+r.res*r.n,0)/n:0,apr:F.reduce((a,r)=>a+r.apr,0),
    obr:F.filter(r=>r.tipo!=='empleado').reduce((a,r)=>a+r.n,0),emp:F.filter(r=>r.tipo==='empleado').reduce((a,r)=>a+r.n,0),
    hom:F.reduce((a,r)=>a+(r.hom||0),0),muj:F.reduce((a,r)=>a+(r.muj||0),0),ssx:F.reduce((a,r)=>a+(r.ssx||0),0)};}   /* _SEXO_V1 */
function pintar(){clearTimeout(M.pintT);M.pintT=setTimeout(()=>{render();banner();},250);}
function crearPantalla(){
  if($('smis')) return;
  const d=document.createElement('div'); d.className='screen'; d.id='smis';
  d.innerHTML='<div class="dlayout" style="padding:1.2rem;max-width:1200px;margin:0 auto"><div id="mis-box"></div></div>';
  document.body.appendChild(d);
}
function render(){
  const box=$('mis-box'); if(!box||!$('smis').classList.contains('active')) return;
  const F=filas(M.desde,M.hasta), R=resumen(F), S=ses(), adm=S&&S.rol==='admin', TD=adm&&M.todos;
  let sups=[]; if(adm){try{sups=(typeof SUPERVISORES!=='undefined'?SUPERVISORES:[]).filter(x=>x.rol!=='Administrador').map(x=>x.nom);}catch(e){}
    /* _SUPS_DATOS_V1 (18-oct): también todo supervisor que ya tenga evaluaciones registradas (aunque no esté en la lista fija) */
    try{const V=window._etiSupsVistos=window._etiSupsVistos||new Set();[...M.qrA,...M.qrB,...M.man].forEach(r=>{if(r&&r.sup)V.add(String(r.sup).trim());});
      const admN=(typeof SUPERVISORES!=='undefined'?SUPERVISORES:[]).filter(x=>x.rol==='Administrador').map(x=>x.nom);
      V.forEach(n=>{if(n&&!sups.some(s=>coincide(s,n))&&!admN.some(s=>coincide(s,n)))sups.push(n);});
      sups.sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'}));}catch(e){}}
  const k=(v,t,c)=>`<div style="background:#fff;border:1px solid #D9E0EC;border-radius:14px;padding:.8rem .9rem"><b style="display:block;font-size:1.5rem;line-height:1.1;color:${c||'#14213D'}">${v}</b><span style="font-size:.72rem;color:#5B6B85;font-weight:700;text-transform:uppercase">${t}</span></div>`;
  const pre=(t,d,h)=>`<button class="btn ${M.desde===d&&M.hasta===h?'bpri':'bout'} bsm" onclick="ETIMIS.rango('${d}','${h}')">${t}</button>`;
  const h=new Date(), d7=new Date(Date.now()-6*864e5), m1=new Date(h.getFullYear(),h.getMonth(),1);
  box.innerHTML=`
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.8rem;margin-bottom:1rem">
    <div><h2 class="m-tit" style="margin:0">🗂 ${TD?'Evaluaciones de todos los supervisores':adm?'Evaluaciones por supervisor':'Mis evaluaciones'} ${TD?'':'<span style="font-size:.72rem;font-weight:800;color:#007A3D;background:#E6F7EE;border-radius:99px;padding:3px 9px;vertical-align:middle">● en vivo</span>'}</h2>
      <div class="m-mut" style="font-size:.82rem">${TD?'Vista general: QR (cada trabajador) y manuales de todos los supervisores en el rango elegido.'+(M.cargando?' <b>Cargando…</b>':''):esc(M.nom||'—')+' · Evaluaciones por <b>QR</b> (cada trabajador) y <b>manuales</b>, apenas se registran.'}</div></div>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center">
      ${adm?`<select class="fc" style="width:auto" onchange="ETIMIS.sup(this.value)"><option value="*" ${TD?'selected':''}>👥 Todos los supervisores</option>${sups.map(n=>`<option ${!TD&&coincide(n,M.nom)?'selected':''}>${esc(n)}</option>`).join('')}</select>`:''}
      ${pre('Hoy',iso(h),iso(h))}${pre('Últimos 7 días',iso(d7),iso(h))}${pre('Este mes',iso(m1),iso(h))}
      <input type="date" class="fc" style="width:auto" value="${esc(M.desde)}" onchange="ETIMIS.rango(this.value,null)"><input type="date" class="fc" style="width:auto" value="${esc(M.hasta)}" onchange="ETIMIS.rango(null,this.value)">
    </div></div>
  ${adm?`<div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;margin:-.3rem 0 .8rem">
    <select class="fc" style="width:auto" onchange="ETIMIS.filtro('emp',this.value)"><option value="">Todas las empresas</option>${['VERFRUT S.A.C.','RAPEL S.A.C.'].map(e=>`<option ${M.f.emp===e?'selected':''}>${e}</option>`).join('')}</select>
    <select class="fc" style="width:auto" onchange="ETIMIS.filtro('mod',this.value)"><option value="">QR y manual</option><option value="QR" ${M.f.mod==='QR'?'selected':''}>Solo QR</option><option value="MANUAL" ${M.f.mod==='MANUAL'?'selected':''}>Solo manual</option></select>
    <select class="fc" style="width:auto" onchange="ETIMIS.filtro('tipo',this.value)"><option value="">Obreros y empleados</option><option value="obrero" ${M.f.tipo==='obrero'?'selected':''}>Solo obreros</option><option value="empleado" ${M.f.tipo==='empleado'?'selected':''}>Solo empleados</option></select>
    ${TD?`<button class="btn bout bsm" onclick="ETIMIS.recargar()">🔄 Actualizar</button>`:''}
    <button class="btn bpri bsm" onclick="window.ETITF&&ETITF.exportar('${esc(M.desde)}','${esc(M.hasta)}')">📥 Excel de este rango</button>
    ${TD&&M.hasta<hoyI()?`<button class="btn bout bsm" style="border-color:#C8102E;color:#C8102E;font-weight:800" title="Elimina en Azure y Firebase TODAS las evaluaciones (QR y manual) del rango elegido. Útil para borrar pruebas." onclick="ETIMIS.limpiarRango()">🧹 Eliminar todo el rango</button>`:''}</div>`:''}
  ${!adm?infBarra(R):''}
  ${(()=>{if(adm)return'';const t0=new Date(hoyI()+'T00:00:00').getTime();const fuera=[...M.qrA,...M.qrB,...M.man].filter(r=>(r.ts||0)>=t0&&r.fecha&&(r.fecha<M.desde||r.fecha>M.hasta));if(!fuera.length)return'';const fs=[...new Set(fuera.map(r=>r.fecha))].sort();const n=fuera.reduce((a,r)=>a+(r.rutas?r.rutas.reduce((b,x)=>b+(+x.ne||1),0):1),0);
    return `<div style="background:#EAF1FF;border:1px solid #B9CDF5;border-radius:12px;padding:.6rem .9rem;margin:-.3rem 0 .9rem;font-size:.84rem;display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap"><span>📌 Hoy registraste <b>${n}</b> evaluado(s) con fecha de evaluación <b>${fs.map(fF).join(', ')}</b>, fuera del rango elegido.</span><button class="btn bout bsm" onclick="ETIMIS.rango('${fs[0]<M.desde?fs[0]:M.desde}','${hoyI()}')">Ver esas evaluaciones →</button></div>`;})()}
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.7rem;margin-bottom:1rem">
    ${k(R.n,'Trabajadores evaluados')}${k(R.qr,TD?'📱 Por QR':'📱 Por mi QR','#003DA5')}${k(R.man,'📋 Manual','#6A3FC0')}
    ${k(R.n?pc(R.prom):'—','Promedio',R.n?(R.prom>=0.7?'#007A3D':'#C8102E'):'')}${k(R.apr,'Aprobados ≥70%','#007A3D')}${k(R.obr+' / '+R.emp,'👷 Obreros / 💼 Empleados')}${k(R.hom+' / '+R.muj,'👨 Hombres / 👩 Mujeres'+(R.ssx?' · '+R.ssx+' sin dato':''))}
  </div>
  ${TD&&F.length?(()=>{const g=new Map();F.forEach(r=>{const x=g.get(r.sup||'—')||{sup:r.sup||'—',qr:0,man:0,s:0,n:0,apr:0,ult:0};if(r.mod==='QR')x.qr++;else x.man+=r.n;x.s+=r.res*r.n;x.n+=r.n;x.apr+=r.apr;x.ult=Math.max(x.ult,r.ts);g.set(x.sup,x);});
    const L=[...g.values()], env=L.filter(x=>infDe(x.sup)).length;
    return `<section class="m-card" style="margin-bottom:1rem"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem"><h3 class="m-tit2" style="margin:0">Resumen por supervisor</h3>
      <span style="font-size:.8rem;font-weight:800;padding:.3rem .7rem;border-radius:99px;background:${env===L.length?'#E6F7EE':'#FFF6E0'};color:${env===L.length?'#0B5E33':'#8A5A00'}">📧 Informes enviados: ${env} de ${L.length} supervisores con evaluaciones</span></div>
    <div style="overflow:auto;margin-top:.6rem"><table class="m-table"><thead><tr><th>Supervisor</th><th>📱 QR</th><th>📋 Manual</th><th>Total</th><th>Promedio</th><th>Aprobados</th><th>Último registro</th><th>Informe</th><th></th></tr></thead><tbody>
    ${L.sort((a,b)=>b.n-a.n).map(x=>{const i=infDe(x.sup);const nq=esc(x.sup).replace(/'/g,"\\'");return `<tr><td><b>${esc(x.sup)}</b></td><td>${x.qr}</td><td>${x.man}</td><td><b>${x.n}</b></td><td><b style="color:${x.s/x.n>=0.7?'#007A3D':'#C8102E'}">${pc(x.s/x.n)}</b></td><td>${x.apr}</td>
      <td>${x.ult?new Date(x.ult).toLocaleString('es-PE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—'}</td>
      <td>${i?`<span style="color:#007A3D;font-weight:700" title="${esc(i.por&&i.por!==i.usuario?'Emitido por '+i.por:'')}">✅ ${new Date(i.en).toLocaleString('es-PE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>`:`<span style="color:#8A5A00;font-weight:700">⚠️ pendiente</span>`}</td>
      <td style="white-space:nowrap"><button class="btn bout bsm" onclick="ETIMIS.sup('${nq}')">Ver →</button> <button class="btn bpri bsm" title="Ver / enviar el reporte consolidado de este supervisor" onclick="ETIMIS.reporteDe('${nq}')">📄 Reporte</button> <button class="btn bpri bsm" style="background:#007A3D" title="Emite el Informe Check List ETI (INF-SC-GH-03) en Word" onclick="ETIMIS.checklistDe('${nq}')">📝 Informe</button></td></tr>`;}).join('')}
    </tbody></table></div></section>`;})():''}
  <section class="m-card">${TD?'<h3 class="m-tit2">Detalle de registros</h3>':''}${F.length?`<div style="overflow:auto;max-height:560px"><table class="m-table"><thead><tr><th>Fecha eval.</th><th>Registrado</th>${TD?'<th>Supervisor</th>':''}<th>Modalidad</th><th>Empresa</th><th>Sector</th><th>Tipo</th><th>Ruta / Área</th><th>Código</th><th>Eval.</th><th>Resultado</th><th>Guardado</th>${adm?'<th></th>':''}</tr></thead><tbody>
    ${F.slice(0,800).map(r=>`<tr><td><b>${fF(r.fecha)}</b>${r.fo?`<div style="font-size:.68rem;color:#5B6B85" title="Fecha corregida por el administrador">antes ${fF(r.fo)}</div>`:''}</td><td style="font-size:.75rem;${r.ts&&iso(new Date(r.ts))!==r.fecha?'color:#B26A00;font-weight:700':''}" title="${r.ts&&iso(new Date(r.ts))!==r.fecha?'Registrado en un día distinto a la fecha de evaluación':''}">${r.ts?new Date(r.ts).toLocaleString('es-PE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—'}</td>${TD?`<td>${esc(r.sup||'—')}</td>`:''}
      <td>${r.mod==='QR'?'📱 QR':'📋 Manual'}</td><td>${esc(String(r.emp||'').replace(' S.A.C.',''))}</td><td>${esc(r.sector||'—')}</td>
      <td>${r.tipo==='empleado'?'💼 Empleado':'👷 Obrero'}</td><td><b>${esc(r.ruta||'—')}</b>${r.apl?` <span title="Aplicada con el QR de ${esc(r.apl)} (atribuida por programación)" style="font-size:.72rem;color:#5B6B85">🤝 ${esc(r.apl.split(' ')[0])}</span>`:''}</td><td>${esc(r.cod||'—')}</td><td>${r.n}</td>
      <td><b style="color:${r.res>=0.7?'#007A3D':'#C8102E'}">${pc(r.res)}</b></td><td>${r.az?'☁ ✓':'⏳'}</td>${adm?`<td style="white-space:nowrap"><button class="m-ico" title="Cambiar la fecha de evaluación (Azure y Firebase)" onclick="ETIMIS.editarFecha('${esc(r.key)}')">📅</button><button class="m-ico" title="Eliminar (Azure y Firebase)" onclick="ETIMIS.eliminar('${esc(r.key)}')">🗑</button></td>`:''}</tr>`).join('')}
    </tbody></table></div>${F.length>800?`<div class="m-mut" style="font-size:.78rem;margin-top:.4rem">Mostrando 800 de ${F.length}. Usa 📥 Excel para ver todos.</div>`:''}`:`<div class="m-empty">${M.cargando?'Cargando…':''} No hay evaluaciones entre ${fF(M.desde)} y ${fF(M.hasta)}. Apenas un trabajador responda tu QR o registres una manual, aparecerá aquí.</div>`}</section>`;
}
/* contador en el Inicio del supervisor */
function banner(){
  const S=ses(); if(!S||S.rol==='admin') return;
  const sm=$('sm'); if(!sm) return;
  let b=$('mis-banner');
  if(!b){const ref=sm.querySelector('.mgrid'); if(!ref) return; b=document.createElement('div'); b.id='mis-banner'; ref.parentNode.insertBefore(b,ref);}
  const F=filas(hoyI(),hoyI()), R=resumen(F);
  b.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:.8rem;flex-wrap:wrap;background:#fff;border:1px solid #D9E0EC;border-left:5px solid #003DA5;border-radius:14px;padding:.8rem 1rem;margin:0 0 1rem;cursor:pointer" onclick="ETIMIS.abrir()">
    <div><b>📊 Hoy llevas ${R.n} evaluado(s)</b><div class="m-mut" style="font-size:.82rem">📱 ${R.qr} por tu QR · 📋 ${R.man} manual${R.n?' · promedio '+pc(R.prom):''}</div>
      ${R.n&&!infEnviado()?`<div style="margin-top:.35rem;font-size:.82rem;color:#8A5A00;font-weight:700">⚠️ Recuerda enviar por correo tu informe de evaluaciones de hoy (QR + manual) al terminar.</div>`:infEnviado()?`<div style="margin-top:.35rem;font-size:.82rem;color:#007A3D;font-weight:700">✅ Informe de hoy enviado.</div>`:''}</div>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap">${R.n&&!infEnviado()?`<button class="btn bout bsm" style="border-color:#0B2A6F;color:#0B2A6F;font-weight:800" onclick="event.stopPropagation();ETIMIS.informeHoy()">📧 Enviar informe</button>`:''}<button class="btn bpri bsm">Ver mis evaluaciones →</button></div></div>`;
}
function iniciarSup(){const S=ses(); if(!S||S.rol==='admin'||M.user===S.user) return; escuchar(S.user,S.nom);}
/* _INFORME_SUP_V1 (15-oct-2026): informe consolidado del supervisor (QR + manual, todas sus evaluaciones)
   — se arma solo con lo que ya está en vivo; 📧 correo + 📥 Excel; marca "enviado hoy" y recordatorio en el Inicio. */
const infKey=()=>'eti_informe_env_'+(M.user||'')+'_'+hoyI();
function infEnviado(){try{return localStorage.getItem(infKey())||'';}catch(e){return '';}}
function infMarcar(R,nom,user){const S=ses();nom=nom||M.nom;user=user||M.user;const en=new Date().toISOString();if(!nom||coincide(nom,M.nom)){try{localStorage.setItem(infKey(),en);}catch(e){}}
  try{const f=db();if(f)f.collection('informes_enviados').doc((user||nom||'x').replace(/[^\w.-]+/g,'_')+'_'+hoyI()).set({usuario:user||'',sup:nom,desde:M.desde,hasta:M.hasta,dia:hoyI(),n:R.n,qr:R.qr,man:R.man,prom:R.prom,apr:R.apr,en:en,por:S?S.user:''},{merge:true}).catch(()=>{});}catch(e){}}
/* _INFORMES_ADMIN_V1 (15-oct-2026): el admin ve quién envió su informe y puede emitir el de cualquier supervisor */
async function cargarInformes(){const f=db();if(!f)return;try{const q=await f.collection('informes_enviados').where('dia','>=',M.desde).where('dia','<=',M.hasta).get();M.inf=q.docs.map(d=>d.data());}catch(e){M.inf=[];}}
function infDe(nom){return (M.inf||[]).filter(x=>coincide(x.sup,nom)).sort((a,b)=>String(b.en).localeCompare(String(a.en)))[0]||null;}
function grupos(F){const g=new Map();F.forEach(r=>{const k=[r.tipo==='empleado'?'E':'O',r.sector||'—',String(r.ruta||'—').toUpperCase(),String(r.cod||'').toUpperCase()].join('|');
  const x=g.get(k)||{tipo:r.tipo,sector:r.sector||'—',ruta:String(r.ruta||'—').toUpperCase(),cod:String(r.cod||'').toUpperCase(),n:0,s:0,apr:0,qr:0,man:0};
  x.n+=r.n;x.s+=r.res*r.n;x.apr+=r.apr;if(r.mod==='QR')x.qr+=r.n;else x.man+=r.n;g.set(k,x);});
  return [...g.values()].sort((a,b)=>a.sector.localeCompare(b.sector)||a.ruta.localeCompare(b.ruta,undefined,{numeric:true}));}
function rangoTxt(){return M.desde===M.hasta?fF(M.desde):fF(M.desde)+' al '+fF(M.hasta);}
function excelMio(F,R){
  if(typeof XLSX==='undefined'){toast('Excel no disponible','e');return false;}
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Informe de Evaluaciones ETI'],['Supervisor',M.nom],['Período',rangoTxt()],['Emitido',new Date().toLocaleString('es-PE')],[],
    ['Trabajadores evaluados',R.n],['Por QR',R.qr],['Manual',R.man],['Promedio',pc(R.prom)],['Aprobados ≥70%',R.apr],['Obreros',R.obr],['Empleados',R.emp]]),'Resumen');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Tipo','Sector','Ruta / Área','Código','Evaluados','QR','Manual','Promedio %','Aprobados','Estado'],
    ...grupos(F).map(g=>[g.tipo==='empleado'?'Empleado':'Obrero',g.sector,g.ruta,g.cod,g.n,g.qr,g.man,Math.round(g.s/g.n*1000)/10,g.apr,g.s/g.n>=0.7?'APROBADO':'REFUERZO'])]),'Por ruta');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Fecha','Hora','Modalidad','Empresa','Sector','Tipo','Ruta / Área','Código','Evaluados','Resultado %','Estado'],
    ...F.map(r=>[fF(r.fecha),r.ts?new Date(r.ts).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'}):'',r.mod==='QR'?'QR':'Manual',r.emp||'',r.sector||'',r.tipo==='empleado'?'Empleado':'Obrero',r.ruta||'',r.cod||'',r.n,Math.round(r.res*1000)/10,r.res>=0.7?'APROBADO':'REFUERZO'])]),'Detalle');
  XLSX.writeFile(wb,`Informe-ETI-${(M.nom||M.user||'').replace(/[^\w]+/g,'_')}-${M.desde}${M.hasta!==M.desde?'_a_'+M.hasta:''}.xlsx`);
  return true;}
function enviarInforme(nomO,userO){
  const S=ses(); if(!S) return;
  const nomI=M.nom; if(nomO) M.nom=nomO;   /* admin: informe de otro supervisor con los datos ya cargados */
  const F=(nomO?filas(M.desde,M.hasta).filter(r=>coincide(r.sup,nomO)):filas(M.desde,M.hasta)), R=resumen(F);
  if(!R.n){M.nom=nomI;toast(nomO?'Ese supervisor no tiene evaluaciones en este período':'No tienes evaluaciones en este período','i');return;}
  const hora=new Date().getHours(), saludo=hora<12?'Buenos días':hora<18?'Buenas tardes':'Buenas noches', G=grupos(F);
  let c=`${saludo},\n\nAdjunto el informe consolidado de mis evaluaciones de conocimiento ETI (QR y manuales) del período ${rangoTxt()}.\n\n`;
  c+=reporteTxt(F,R,M.nom);
  c+=`\n\nNota: se adjunta el Excel con el detalle de cada evaluación.\n\nAtentamente,\n${M.nom}\nGestión Humana – Relaciones Laborales\nVERFRUT S.A.C. / RAPEL S.A.C. – UNIFRUTTI GROUP`;
  excelMio(F,R);
  const asunto=encodeURIComponent(`Informe de Evaluaciones ETI – ${M.nom} – ${rangoTxt()}`);
  setTimeout(()=>{window.location.href=`mailto:?subject=${asunto}&body=${encodeURIComponent(c)}`;},600);
  infMarcar(R,nomO,userO); M.nom=nomI; if(nomO){const x=(M.inf||[]).find(y=>coincide(y.sup,nomO));if(!x)(M.inf=M.inf||[]).push({sup:nomO,usuario:userO||'',dia:hoyI(),en:new Date().toISOString(),n:R.n});}
  toast('✅ Abriendo Outlook con el informe consolidado','s'); setTimeout(()=>toast('💡 Adjunta el PDF (botón 📄 PDF del reporte) y el Excel descargado antes de enviar','i'),2500); setTimeout(()=>{render();banner();},800);
}
/* _REPORTE_MIS_V1 (15-oct-2026): informe consolidado con el MISMO formato del Reporte Gerencial de Nueva Evaluación */
const pesoF=p=>p>1?p/100:p;
function temas(F){const m=new Map();F.forEach(r=>(r.secs||[]).forEach(s=>{const x=m.get(s.nom)||{nom:s.nom,peso:pesoF(s.peso),sp:0,n:0};x.sp+=s.pct*r.n;x.n+=r.n;x.peso=x.peso||pesoF(s.peso);m.set(s.nom,x);}));return [...m.values()].map(x=>({nom:x.nom,peso:x.peso,prom:x.n?x.sp/x.n:0}));}
function reporteTxt(F,R,nom){
  const G=grupos(F), T=temas(F), L='━'.repeat(48), l='─'.repeat(48);
  const secsU=[...new Set(F.map(r=>r.sector).filter(Boolean))], empU=[...new Set(F.map(r=>String(r.emp||'').replace(' S.A.C.','')).filter(Boolean))];
  const pg=(R.prom*100).toFixed(1), ok=R.prom>=0.7, nR=G.length, aprR=G.filter(g=>g.s/g.n>=0.7).length;
  let t=`${L}\nSistema ETI – Evaluación de Conocimiento\nde Buenas Prácticas Sociales y Laborales\nInforme Consolidado de Evaluaciones ETI\n${L}\nPeríodo           : ${rangoTxt()}\nEmpresa           : ${empU.join(' / ')||'VERFRUT / RAPEL'}\nSupervisor        : ${nom}\nSector(es)        : ${secsU.join(', ')||'—'}\nModalidad         : 📱 QR ${R.qr}  ·  📋 Manual ${R.man}\nRutas / áreas     : ${nR}\nTotal evaluaciones: ${R.n} personas (👷 ${R.obr} obreros · 💼 ${R.emp} empleados)\n\n${l}\nPROMEDIO POR TEMA (todos los grupos)\n${l}`;
  T.forEach(s=>{const sp=(s.prom*100).toFixed(1),o=s.prom>=0.7;t+=`\n  ${o?'✓':'✗'} ${s.nom.padEnd(36)} ${sp.padStart(5)}%   ${o?'APROBADO':'REFUERZO'}`;});
  t+=`\n\n${l}\nDETALLE POR SECTOR / RUTA\n${l}`;
  G.forEach(g=>{const rows=F.filter(r=>(r.tipo==='empleado'?'E':'O')===(g.tipo==='empleado'?'E':'O')&&(r.sector||'—')===g.sector&&String(r.ruta||'—').toUpperCase()===g.ruta&&String(r.cod||'').toUpperCase()===g.cod);
    const Ts=temas(rows), rp=(g.s/g.n*100).toFixed(1), est=g.s/g.n>=0.7?'✅ APROBADO':'⚠️ REFUERZO';
    t+=`\n\n[${g.cod||'—'}] ${g.ruta}  ·  ${g.sector}  (${g.n} evaluado${g.n>1?'s':''}${g.qr&&g.man?` · QR ${g.qr} / manual ${g.man}`:g.qr?' · QR':' · manual'})\n${'─'.repeat(52)}`;
    Ts.forEach(s=>{const pts=s.prom*s.peso*100,sp=(s.prom*100).toFixed(1);t+=`\n  ${s.prom>=0.7?'✓':'✗'} ${s.nom.padEnd(34)} ${pts.toFixed(2).padStart(5)} pts  ${sp.padStart(5)}%  Pond:${(s.peso*100).toFixed(2)}%`;});
    t+=`\n  ${'─'.repeat(48)}\n  RESULTADO : ${rp.padStart(6)}%   ${est}`;});
  t+=`\n\n${L}\nRESULTADO GENERAL\n${L}\nPromedio general   : ${pg}%\nEstado             : ${ok?'✅ APROBADO – Cumple estándar ETI':'⚠️ REQUIERE REFUERZO – Planificar capacitación'}\nAprobados (≥70%)   : ${R.apr} / ${R.n} personas\nRutas aprobadas    : ${aprR} / ${nR}\nRutas en refuerzo  : ${nR-aprR} / ${nR}\n\nSEMAFORO: ROJO (0-69%)  |  VERDE (70-100%)\n\nGenerado por Sistema ETI · Evaluaciones\nSistema – Departamento de Gestión Humana – Área de Relaciones Laborales\n${new Date().toLocaleString('es-PE')}\n${L}`;
  return t;}
/* _CUADROS_MIS_V1 (15-oct-2026): los mismos cuadros visuales de Resultados (por ruta, por tema, semáforo) con los datos consolidados */
function cuadrosHTML(F,R){
  const T=temas(F), G=grupos(F), r1=v=>Math.round(v*10)/10, r2=v=>Math.round(v*100)/100;
  const gt=g=>temas(F.filter(r=>(r.tipo==='empleado'?'E':'O')===(g.tipo==='empleado'?'E':'O')&&(r.sector||'—')===g.sector&&String(r.ruta||'—').toUpperCase()===g.ruta&&String(r.cod||'').toUpperCase()===g.cod));
  const ab=n=>{const w=n.split(' ').filter(x=>x.length>2);return (w[0]||n).slice(0,8)+'.';};
  /* 1) Resultado por ruta */
  let t1=`<div class="ptit" style="font-size:.98rem;margin-bottom:.75rem">Resultado por Ruta</div><div style="overflow-x:auto"><table class="rtbl"><thead><tr><th>Cód.</th><th>Ruta / Grupo</th><th>Sector</th><th>Tipo</th><th>Eval.</th>${T.map(s=>`<th title="${esc(s.nom)}">${esc(ab(s.nom))}</th>`).join('')}<th>Resultado</th><th>Estado</th></tr></thead><tbody>`;
  G.forEach(g=>{const Ts=gt(g), rp=g.s/g.n, ok=rp>=0.7;
    t1+=`<tr><td><span class="cpill">${esc(g.cod||'—')}</span></td><td style="font-weight:600">${esc(g.ruta)}</td><td style="font-size:.72rem">${esc(g.sector)}</td><td style="font-size:.7rem">${g.tipo==='empleado'?'Empleado':'Obrero'}</td><td style="text-align:center">${g.n}</td>`+
      T.map(s=>{const x=Ts.find(y=>y.nom===s.nom);const v=x?x.prom:0;return `<td style="text-align:center;font-size:.74rem;color:${v>=0.7?'var(--gdim)':'var(--red)'}">${x?(v*100).toFixed(1)+'%':'—'}</td>`;}).join('')+
      `<td style="text-align:center;font-weight:800;color:${ok?'var(--gdim)':'var(--red)'}">${(rp*100).toFixed(1)}%</td><td style="text-align:center"><span class="bdg ${ok?'bg':'br'}">${ok?'APROBADO':'REFUERZO'}</span></td></tr>`;});
  t1+=`</tbody></table></div>`;
  /* 2) Promedio por tema */
  const t2=`<div class="ptit" style="font-size:.98rem;margin:1rem 0 .75rem">Promedio por Tema (todos los grupos)</div><div class="sgrid">`+T.map(s=>{const pv=(s.prom*100).toFixed(1),ok=s.prom>=0.7;
    return `<div class="scard"><div class="scdhdr"><div class="scdname">${esc(s.nom)}</div><div class="scdpct${ok?'':' r'}">${pv}%</div></div><div class="btrk"><div class="bfil${ok?'':' r'}" style="width:${Math.min(100,+pv)}%"></div></div><div class="scdmeta"><span>Peso: ${+(s.peso*100).toFixed(2)}%</span><span class="bdg ${ok?'bg':'br'}">${ok?'APROBADO':'REFUERZO'}</span></div></div>`;}).join('')+`</div>`;
  /* 3) Semáforo por sección (idéntico al de Resultados) */
  const pca='-webkit-print-color-adjust:exact;print-color-adjust:exact;', th=`padding:6px 8px;border:1px solid #8a8a8a;font-size:10.5px;text-align:center;font-weight:800;${pca}`, td=`padding:5px 8px;border:1px solid #8a8a8a;font-size:10.5px;${pca}`;
  const VF='#1F9D44',VC='#d6f5df',RF='#E00000',RC='#ffd9d9',GH='#d9d9d9',GF='#f2f2f2',GG='#c9c9c9',AM='#FFFF00';
  const proms=T.map(s=>({nom:'DE '+s.nom.toUpperCase(),peso:r2(s.peso*100),val:r2(s.prom*s.peso*100)})), totalPct=r1(R.prom*100);
  let c1=`<table style="border-collapse:collapse;width:100%;margin-bottom:16px;"><tr><th style="${th}background:${GH};">SECCIÓN</th><th style="${th}background:${GH};">RESULTADO</th><th style="${th}background:${RF};color:#fff;">ROJO</th><th style="${th}background:${VF};color:#fff;">VERDE</th><th style="${th}background:${AM};">%R</th></tr>`;
  proms.forEach(s=>{const lim=r2(s.peso*0.7),v=s.val>=lim;c1+=`<tr><td style="${td}background:${GF};font-weight:700;">${esc(s.nom)}</td><td style="${td}text-align:center;font-weight:800;background:${v?VF:RF};color:#fff;">${s.val}</td><td style="${td}text-align:center;">0 - ${r2(lim-0.01)}%</td><td style="${td}text-align:center;">${lim} - ${s.peso}%</td><td style="${td}text-align:center;font-weight:800;">${s.peso}%</td></tr>`;});
  c1+=`<tr><td style="${td}background:${GG};font-weight:800;">GENERAL DEL GRUPO</td><td style="${td}text-align:center;font-weight:800;background:${totalPct>=70?VF:RF};color:#fff;">${totalPct}%</td><td style="${td}text-align:center;font-weight:700;background:${GG};">0 - 69.9%</td><td style="${td}text-align:center;font-weight:700;background:${GG};">70 - 100%</td><td style="${td}text-align:center;font-weight:800;background:${GG};">100%</td></tr></table>`;
  let c2=`<table style="border-collapse:collapse;width:100%;"><tr><th style="${th}background:${GH};min-width:130px;">RUTA</th><th style="${th}background:${GH};">COD</th><th style="${th}background:${GH};">SECTOR</th>`+proms.map(s=>`<th style="${th}background:${GH};font-size:8.6px;">${esc(s.nom)}</th>`).join('')+`</tr>`;
  G.forEach(g=>{const Ts=gt(g);c2+=`<tr><td style="${td}font-weight:700;">${esc(g.ruta)}</td><td style="${td}text-align:center;">${esc(g.cod||'—')}</td><td style="${td}">${esc(g.sector)}</td>`+T.map(s=>{const x=Ts.find(y=>y.nom===s.nom);const v=x?r1(x.prom*s.peso*100):0,ok=v>=r2(s.peso*100*0.7);return `<td style="${td}text-align:center;font-weight:800;background:${ok?VC:RC};color:${ok?'#1a8040':'#cc0000'};">${x?v:'—'}</td>`;}).join('')+`</tr>`;});
  c2+=`<tr><td style="${td}background:${GG};font-weight:800;text-align:center;">GENERAL DEL GRUPO</td><td style="${td}background:${GG};"></td><td style="${td}background:${GG};"></td>`+proms.map(s=>`<td style="${td}text-align:center;font-weight:800;background:${s.val>=r2(s.peso*0.7)?VF:RF};color:#fff;">${r1(s.val)}</td>`).join('')+`</tr></table>`;
  const t3=`<div class="ptit" style="font-size:.98rem;margin:1rem 0 .75rem">Detalle de Resultados — Semáforo por Sección (puntos ponderados)</div><div style="overflow-x:auto;">${c1}</div><div style="overflow-x:auto;">${c2}</div><div style="font-size:.72rem;color:#4A5A80;margin-top:.5rem;">Criterio: VERDE = resultado ≥ 70% del peso de la sección (%R) · ROJO = menor al 70% · Valores en puntos ponderados sobre 100.</div>`;
  return t1+t2+t3;
}
/* _REPORTE_SECTOR_V1 (16-oct-2026): el reporte/informe se emite POR SECTOR */
function filasRpt(nomO,sector){let F=nomO?filas(M.desde,M.hasta).filter(r=>coincide(r.sup,nomO)):filas(M.desde,M.hasta); if(sector) F=F.filter(r=>(r.sector||'—')===sector); return F;}
function verReporte(nomO,userO,sector){
  const nom=nomO||M.nom, Fall=nomO?filas(M.desde,M.hasta).filter(r=>coincide(r.sup,nomO)):filas(M.desde,M.hasta);
  const sects=[...new Set(Fall.map(r=>r.sector||'—'))].sort();
  if(sector===undefined) sector=sects.length>1?sects[0]:'';
  const F=filasRpt(nomO,sector), R=resumen(F);
  if(!R.n){toast('No hay evaluaciones en este período','i');return;}
  const txt=reporteTxt(F,R,nom); M.rpt={txt,nomO,userO,sector,sects};
  let m=$('mis-rpt'); if(!m){m=document.createElement('div');m.id='mis-rpt';m.style.cssText='position:fixed;inset:0;background:rgba(10,20,40,.55);z-index:990;display:flex;align-items:center;justify-content:center;padding:1rem';document.body.appendChild(m);}
  m.innerHTML=`<div style="background:#fff;border-radius:16px;max-width:900px;width:100%;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap;padding:.9rem 1.1rem;border-bottom:1px solid #D9E0EC"><div><b style="font-size:1.05rem">📄 Reporte · ${esc(nom)}${sector?' · '+esc(sector):''}</b><div class="m-mut" style="font-size:.8rem">${esc(rangoTxt())} · ${R.n} evaluados (QR ${R.qr} · manual ${R.man})</div>
      ${sects.length>1?`<div style="margin-top:.35rem;font-size:.82rem">📍 Sector: <select class="fc" style="width:auto;padding:.25rem .5rem" onchange="ETIMIS.rptSector(this.value)"><option value="" ${!sector?'selected':''}>Todos (consolidado)</option>${sects.map(x=>`<option ${x===sector?'selected':''}>${esc(x)}</option>`).join('')}</select> <span class="m-mut">el informe oficial se emite por sector</span></div>`:''}</div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap"><button class="btn bpri bsm" style="background:#007A3D;box-shadow:0 0 0 3px rgba(0,122,61,.25)" onclick="ETIMIS.rptChecklist()" title="Informe oficial para las evaluaciones ETI (INF-SC-GH-03). Se genera en Word; tú insertas las fotos.">📝 Informe Check List ETI (GH-03) ⭐ USAR ESTE</button><button class="btn bpri bsm" style="background:#0B2A6F" onclick="ETIMIS.rptInforme()" title="Emite en Word el Informe de Capacitaciones INF-SC-GH-04 con los datos de esta evaluación (no se guarda; tú insertas las fotos)">📝 Informe GH-04 (Word)</button><button class="btn bout bsm" onclick="ETIMIS.rptHojasQR()" title="Hojas de respuesta digitales de cada trabajador evaluado por QR (evidencia)">🧾 Hojas QR</button><button class="btn bout bsm" onclick="ETIMIS.rptCopiarCuadros()" title="Copia los cuadros con formato para pegarlos en Word u Outlook">📋 Copiar cuadros</button><button class="btn bout bsm" onclick="ETIMIS.rptCopiar()" title="Copia el reporte en texto">📋 Copiar texto</button><button class="btn bout bsm" onclick="ETIMIS.rptImprimir()" title="Abre el informe listo para Guardar como PDF (cabecera, cuadros e informe)">📄 PDF</button><button class="btn bout bsm" onclick="ETIMIS.rptExcel()">📥 Excel</button><button class="btn bpri bsm" onclick="ETIMIS.rptCorreo()">📧 Enviar por correo</button><button class="btn bout bsm" onclick="document.getElementById('mis-rpt').style.display='none'">✕</button></div></div>
    <div style="overflow:auto;flex:1"><div id="mis-rpt-cuadros" style="padding:1rem 1.2rem;background:#F4F6FA">${cuadrosHTML(F,R)}</div>
    <pre id="mis-rpt-txt" style="margin:0;padding:1rem 1.2rem;background:#0B2A6F;color:#fff;font:13px/1.5 'Consolas','Courier New',monospace;white-space:pre-wrap">${esc(txt)}</pre></div></div>`;
  m.style.display='flex';
}
/* _INFORME_WORD_V2 (16-oct-2026): el Informe INF-SC-GH-04 se genera en Word (.docx) con lib/docx.iife.js + lib/eti-informe-gh04.js (carga diferida) */
function cargarScript(src){return new Promise((ok,no)=>{const e=document.createElement('script');e.src=src;e.onload=()=>ok();e.onerror=()=>no(new Error('No se pudo cargar '+src));document.head.appendChild(e);});}
async function libsInforme(){if(typeof window.docx==='undefined')await cargarScript('lib/docx.iife.js?v=951');if(typeof window.etiInformeGH04!=='function')await cargarScript('lib/eti-informe-gh04.js?v=2');}
function infBarra(R){
  const env=infEnviado();
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap;background:${env?'#E6F7EE':'#FFF6E0'};border:1px solid ${env?'#9BD8B4':'#F3D48A'};border-radius:12px;padding:.7rem .9rem;margin:-.3rem 0 .9rem">
    <div style="font-size:.86rem">${env?`✅ <b>Informe enviado hoy</b> a las ${new Date(env).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})}. Si registras más evaluaciones, puedes reenviarlo actualizado.`:R.n?`⚠️ <b>Aún no has enviado tu informe.</b> Al terminar tus evaluaciones (QR + manual) envíalo por correo <b>una sola vez</b>: se arma solo con todas las del período.`:`ℹ️ Cuando termines tus evaluaciones, envía desde aquí tu informe consolidado por correo.`}</div>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap"><button class="btn bpri bsm" style="background:#007A3D" onclick="ETIMIS.checklistDe()" ${R.n?'':'disabled'} title="Emite el Informe Check List ETI (INF-SC-GH-03) en Word">📝 Informe Check List</button><button class="btn bout bsm" style="border-color:#0B2A6F;color:#0B2A6F;font-weight:800" onclick="ETIMIS.reporte()" ${R.n?'':'disabled'}>📄 Ver reporte</button><button class="btn bout bsm" onclick="ETIMIS.excel()" ${R.n?'':'disabled'}>📥 Excel</button><button class="btn bpri bsm" onclick="ETIMIS.enviarInforme()" ${R.n?'':'disabled'}>📧 Enviar informe (${R.n})</button></div></div>`;}
window.ETIMIS={
  excel(){const F=filas(M.desde,M.hasta);excelMio(F,resumen(F));},
  enviarInforme(){enviarInforme();},
  informeHoy(){M.desde=M.hasta=hoyI();enviarInforme();},
  /* _ELIMINAR_MIS_V1 (15-oct-2026): eliminar desde Evaluaciones por supervisor, por la misma ruta probada (etiAdminCambio = Azure + Firebase) */
  eliminar(key){
    const S=ses(); if(!S||S.rol!=='admin'||!window.etiAdminCambio){toast('Solo el administrador puede eliminar','e');return;}
    const r=filas(M.desde,M.hasta).find(x=>x.key===key); if(!r){toast('Registro no encontrado','e');return;}
    let filtro,txt;
    if(r.mod==='QR'){ if(!r.ses){toast('Esta respuesta no tiene sesión QR; elimínala desde Indicadores','e');return;}
      filtro={sesion_id:r.ses,ids:[r.key]}; txt=`la respuesta QR de ${fF(r.fecha)} · ${r.sector||'—'} · ${r.ruta||'—'} ${r.cod||''} (${pc(r.res)})`; }
    else { filtro={desde:r.fecha,hasta:r.fecha,sector:r.sector||'',ruta:r.ruta||'',codigo:r.cod||''};
      txt=`la evaluación manual de ${fF(r.fecha)} · ${r.sector||'—'} · ${r.ruta||'—'} ${r.cod||''} (${r.n} evaluados). Nota: se eliminan todos los registros de esa ruta/código en ese sector y fecha`; }
    if(typeof confMod==='function') confMod('¿Eliminar '+(r.mod==='QR'?'esta respuesta QR?':'esta evaluación manual?'),'Se elimina en Azure y Firebase '+txt+'. No se puede deshacer.',async()=>{await window.etiAdminCambio(filtro,null,'Eliminando');if(M.todos)cargarTodos();else render();});
  },
  reporte(){verReporte();},
  /* _BTN_CHECKLIST_V1 (19-oct): acceso directo al Informe Check List (abre el reporte y lanza el formulario) */
  checklistDe(n){let u='';if(n){try{const x=(typeof getUsuarios==='function'?getUsuarios(true):[]).find(y=>y.rol!=='admin'&&coincide(y.nom,n));u=x?x.user:'';}catch(e){}}
    verReporte(n||undefined,u||undefined); const o=M.rpt||{}; if(!o.txt) return;
    if(o.sects&&o.sects.length>1&&!o.sector){toast('Elige el sector 📍 en el reporte y pulsa 📝 Informe Check List','i');return;}
    if(o.sects&&o.sects.length>1) toast('📍 Informe del sector '+o.sector+'. Si necesitas otro sector, cámbialo en el reporte y vuelve a pulsar el botón verde.','i');
    window.ETIMIS.rptChecklist();},
  reporteDe(n){let u='';try{const x=(typeof getUsuarios==='function'?getUsuarios(true):[]).find(y=>y.rol!=='admin'&&coincide(y.nom,n));u=x?x.user:'';}catch(e){} verReporte(n,u);},
  /* _INFORME_GH04_V1 (16-oct-2026): Informe INF-SC-GH-04 con datos de la evaluación. NO se guarda. */
  rptInforme(){
    const o=M.rpt||{}; if(!o.txt){toast('Abre primero el reporte','e');return;}
    const F=filasRpt(o.nomO,o.sector), R=resumen(F); if(!R.n){toast('No hay evaluaciones','e');return;}
    const sects=[...new Set(F.map(r=>r.sector||'—'))];
    if(sects.length>1){toast('El informe se emite por sector: elige un sector en el selector 📍','e');return;}
    const fechas=[...new Set(F.map(r=>r.fecha))].sort();
    const campos=[{k:'dur',lbl:'Duración de la capacitación',v:'45 minutos'},{k:'lugar',lbl:'Lugar',v:'Campo – Sector '+sects[0]},{k:'prog',lbl:'Participantes programados (N°)',v:String(R.n)},{k:'h',lbl:'Hombres (N°) — vacío = automático',v:''},{k:'m',lbl:'Mujeres (N°) — vacío = automático',v:''},{k:'ini',lbl:'Promedio evaluación inicial verbal (%) — vacío si no se midió',v:''},{k:'firma',lbl:'Firma (nombre)',v:o.nomO||M.nom},{k:'cargo',lbl:'Cargo',v:'Supervisor de Gestión Humana'}];
    const go=async v=>{
      if(v.h==='') v.h=String(R.hom||''); if(v.m==='') v.m=String(R.muj||'');   /* _SEXO_V1 */
      toast('⏳ Generando el informe en Word…','i');
      try{ await libsInforme(); }catch(e){toast('No se pudo cargar el generador de Word: '+e.message,'e');return;}
      const G=grupos(F).map(g=>{const rows=F.filter(r=>(r.tipo==='empleado'?'E':'O')===(g.tipo==='empleado'?'E':'O')&&(r.sector||'—')===g.sector&&String(r.ruta||'—').toUpperCase()===g.ruta&&String(r.cod||'').toUpperCase()===g.cod);return {tipo:g.tipo,ruta:g.ruta,cod:g.cod,n:g.n,prom:g.n?g.s/g.n:0,temas:temas(rows)};});
      let logo='';try{logo=(getComputedStyle(document.documentElement).getPropertyValue('--logo').match(/base64,([^)'"]+)/)||[])[1]||'';}catch(e){}
      const empX=String((F.find(r=>r.emp)||{}).emp||'').toUpperCase();
      const datos={nom:o.nomO||M.nom,sector:sects[0],fechas:fechas.map(fF),fechaInforme:fF(hoyI()),temas:temas(F),grupos:G,R:R,v:v,logoBase64:logo,razonHead:empX.indexOf('RAPEL')>=0?'Sociedad Agricola Rapel S.A.C.':'Sociedad Exportadora Verfrut S.A.C.'};
      const nombre='Informe_INF-SC-GH-04_ETI_'+String(sects[0]).replace(/[^\w]+/g,'_')+'_'+(fechas[0]||'').replace(/-/g,'')+'.docx';
      try{const blob=await window.etiInformeGH04(datos);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=nombre;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},800);}
      catch(e){console.error(e);toast('No se pudo generar el Word: '+e.message,'e');return;}
      const msg='✅ Se emitió tu Informe INF-SC-GH-04 de Evaluación ETI · '+sects[0]+' · '+fechas.map(fF).join(', ')+' en Word ('+nombre+'). RECUERDA: debes INSERTAR en el informe la evidencia fotográfica (sección 11: hoja de evaluación y grupo participante) y adjuntar el registro de asistencia y el material antes de enviarlo. El sistema no guarda el informe ni las fotos; puedes volver a emitirlo desde este mismo reporte.';
      toast('📝 Informe en Word descargado · inserta las fotos antes de enviarlo','s'); try{if(typeof confMod==='function')confMod('📝 Informe emitido en Word',msg,()=>{});}catch(e){}};
    if(window.etiMiniForm) window.etiMiniForm('📝 Datos para el Informe INF-SC-GH-04','Completa los datos que el sistema no tiene. Lo demás (fechas, sector, rutas, indicadores, resultados y conclusiones) se llena solo con la evaluación de <b>'+esc(sects[0])+' · '+fechas.map(fF).join(', ')+'</b>.',campos,go);
    else go(Object.fromEntries(campos.map(c=>[c.k,c.v])));
  },
  /* _INFORME_CHECKLIST_V1 (19-oct-2026): Informe Check List ETI (INF-SC-GH-03) sobre el modelo oficial (lib/plantilla-informe-checklist-eti.docx). No se guarda. */
  rptChecklist(){
    const o=M.rpt||{}; if(!o.txt){toast('Abre primero el reporte','e');return;}
    const Fall=filasRpt(o.nomO,o.sector); if(!Fall.length){toast('No hay evaluaciones','e');return;}
    const sects=[...new Set(Fall.map(r=>r.sector||'—'))];
    if(sects.length>1){toast('El informe se emite por sector: elige un sector en el selector 📍','e');return;}
    const fechas=[...new Set(Fall.map(r=>r.fecha))].sort().reverse();
    const nom=o.nomO||M.nom;
    /* _INFORME_CHECKLIST_V2 (19-oct): formato actualizado CAP-SC-10 — una fecha o todas las del período (rango "03 al 06 de enero") */
    const TODAS=fechas.length>1?'Todas las fechas ('+fF(fechas[fechas.length-1])+' al '+fF(fechas[0])+')':null;
    const campos=[{k:'fecha',lbl:'Fecha(s) de la evaluación',v:fechas[0],lista:TODAS?[TODAS,...fechas]:fechas},{k:'dur',lbl:'Duración',v:'2 horas'},{k:'h',lbl:'Hombres (N°) — vacío = automático desde las evaluaciones',v:''},{k:'m',lbl:'Mujeres (N°) — vacío = automático',v:''},
      {k:'resp',lbl:'Responsable (como figura en el informe)',v:nom+'.'},{k:'firma',lbl:'Firma (nombre)',v:nom},{k:'reportado',lbl:'Reportado a',v:'Luis Eduardo Coveñas Chero – Subgerente de personas'},{k:'sem',lbl:'Semana (vacío = automática)',v:''},
      {k:'conc',lbl:'V. Conclusiones del supervisor según observación del grupo (vacío = texto automático con los resultados; puedes editarlo luego en Word)',v:''}];
    const go=async v=>{
      const todas=!!(TODAS&&v.fecha===TODAS), fe=todas?fechas[0]:(v.fecha||fechas[0]), F=todas?Fall:Fall.filter(r=>r.fecha===fe), R=resumen(F); if(!R.n){toast('No hay evaluaciones en esa fecha','e');return;}
      const fechasSel=[...new Set(F.map(r=>r.fecha))].sort();
      if(v.h==='') v.h=String(R.hom); if(v.m==='') v.m=String(R.muj);   /* _SEXO_V1 */
      if(R.ssx) toast('ℹ️ '+R.ssx+' evaluado(s) sin dato de hombre/mujer (registros anteriores)','i');
      toast('⏳ Generando el Informe Check List en Word…','i');
      try{ if(typeof window.JSZip==='undefined') await cargarScript('lib/jszip.min.js?v=3101'); if(typeof window.etiInformeChecklist!=='function') await cargarScript('lib/eti-informe-checklist.js?v=2'); }
      catch(e){toast('No se pudo cargar el generador: '+e.message,'e');return;}
      let plantilla; try{const r=await fetch('lib/plantilla-informe-checklist-eti.docx?v=2',{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); plantilla=await r.arrayBuffer();}
      catch(e){toast('No se pudo leer la plantilla del informe: '+e.message,'e');return;}
      const cnt={}; F.forEach(r=>{const e=r.emp||'';cnt[e]=(cnt[e]||0)+r.n;}); const emp=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0]||'';
      const datos={plantilla,emp,sector:sects[0],nom,fechaEval:fe,fechasEval:fechasSel,fechaInforme:hoyI(),tipos:[...new Set(F.map(r=>r.tipo==='empleado'?'empleado':'obrero'))],temas:temas(F),R,v};
      const nombre='Informe_CheckList_ETI_GH-03_'+String(sects[0]).replace(/[^\w]+/g,'_')+'_'+fechasSel[0].replace(/-/g,'')+(fechasSel.length>1?'_al_'+fechasSel[fechasSel.length-1].replace(/-/g,''):'')+'.docx';
      try{const blob=await window.etiInformeChecklist(datos);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=nombre;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},800);}
      catch(e){console.error(e);toast('No se pudo generar el Word: '+e.message,'e');return;}
      const msg='✅ Se emitió tu Informe Check List ETI (INF-SC-GH-03) · '+sects[0]+' · '+fechasSel.map(fF).join(', ')+' en Word ('+nombre+'). Este es el informe que debes utilizar para tus evaluaciones ETI. RECUERDA: inserta la EVIDENCIA FOTOGRÁFICA en la sección IV (Foto 1 a Foto 4), revisa tus CONCLUSIONES (sección V), coloca tu FIRMA DIGITAL y adjunta el registro de asistencia antes de enviarlo. El sistema no guarda el informe ni las fotos; puedes volver a emitirlo desde este reporte.';
      toast('📝 Informe Check List descargado · inserta las fotos antes de enviarlo','s'); try{if(typeof confMod==='function')confMod('📝 Informe Check List emitido',msg,()=>{});}catch(e){}};
    if(window.etiMiniForm) window.etiMiniForm('📝 Informe Check List ETI (INF-SC-GH-03)','<b>Este es el informe que debes utilizar para las evaluaciones ETI.</b> Completa los datos que el sistema no tiene; lo demás (empresa, sector, total evaluados, semáforo por temas y conclusiones) se llena solo con la evaluación de <b>'+esc(sects[0])+'</b>.',campos,go);
    else go(Object.fromEntries(campos.map(c=>[c.k,c.v])));
  },
  /* _HOJAS_QR_V1: evidencia de respuesta de cada trabajador evaluado por QR (anónima) */
  async rptHojasQR(){
    const o=M.rpt||{}; const F=filasRpt(o.nomO,o.sector).filter(r=>r.mod==='QR'); if(!F.length){toast('No hay evaluaciones por QR en este reporte','i');return;}
    const f=db(); if(!f){toast('Sin conexión','e');return;}
    toast('⏳ Preparando '+F.length+' hoja(s)…','i');
    const secs=(typeof SECS!=='undefined'?SECS:[]); const preg={}; secs.forEach(s=>(s.pregs||[]).forEach(p=>{preg[p.n]={t:p.tq||p.t,ops:(p.ops||[]).map(x=>x.t),tema:s.nom};}));
    const docs=[]; for(const r of F.slice(0,300)){try{const d=await f.collection('respuestas_qr').doc(r.key).get();if(d.exists)docs.push({id:d.id,...d.data()});}catch(e){}}
    docs.sort((a,b)=>(a.ts||0)-(b.ts||0));
    const w=window.open('','_blank'); if(!w){toast('Activa los pop-ups para este sitio y vuelve a intentar','e');return;}
    const hojas=docs.map((d,i)=>{const resp=d.resp||{}, ns=Object.keys(resp).map(Number).sort((a,b)=>a-b);
      return `<div class="hoja"><div class="hh"><b>HOJA DE RESPUESTAS DIGITAL · Evaluación ETI (QR)</b><span>N.º ${String(i+1).padStart(4,'0')} · ${fF(d.fecha)} ${d.ts?new Date(d.ts).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):''}</span></div>
      <div class="hm">Sector: <b>${esc(d.sector||'—')}</b> · ${d.tipo==='empleado'?'Área':'Ruta'}: <b>${esc(d.ruta||'—')}</b> · Código: <b>${esc(d.cod||'—')}</b> · ${d.tipo==='empleado'?'Empleado':'Obrero'} · Supervisor: ${esc(d.sup||'')} · <i>Evaluación anónima</i> · Banco v${esc(String(d.bancoVersion||''))} · Registro: ${esc(d.id)}</div>
      <div class="hr">Resultado: <b style="color:${(d.resultado||0)>=0.7?'#007A3D':'#C8102E'}">${((d.resultado||0)*100).toFixed(1)} % – ${(d.resultado||0)>=0.7?'APROBADO':'REFUERZO'}</b></div>
      ${ns.map((n,k)=>{const p=preg[n]||{t:'Pregunta '+n,ops:[]};const sel=(resp[n]||[]).map(Number);const pts=d.pts&&d.pts[n]!=null?d.pts[n]:null;
        return `<div class="q"><div class="qt">${k+1}. <span class="tm">${esc(p.tema||'')}</span> ${esc(p.t)}${pts!=null?` <span class="pt">(${pts} pts)</span>`:''}</div>${p.ops.length?p.ops.map((t,j)=>`<div class="op${sel.includes(j)?' sel':''}">${sel.includes(j)?'●':'○'} ${esc(t)}</div>`).join(''):`<div class="op sel">● Alternativa(s) marcada(s): ${sel.map(x=>x+1).join(', ')}</div>`}</div>`;}).join('')}</div>`;}).join('');
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Hojas de respuesta QR</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;font-size:10pt;color:#111}
@media screen{.instruccion{position:fixed;top:0;left:0;right:0;z-index:9;background:#003DA5;color:#fff;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;font-size:14px}.btn-imprimir{background:#C8102E;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:700;cursor:pointer}body{padding-top:70px}}
@media print{.instruccion{display:none!important}body{padding-top:0!important}@page{margin:12mm;size:A4 portrait}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.hoja{max-width:800px;margin:0 auto 18px;border:1px solid #444;padding:10px 14px;page-break-after:always}.hh{display:flex;justify-content:space-between;font-size:9pt;border-bottom:2px solid #003DA5;padding-bottom:4px;margin-bottom:4px}.hm{font-size:9pt;color:#333;margin:3px 0}.hr{font-size:10pt;margin:4px 0 8px}
.q{margin:5px 0 7px;page-break-inside:avoid}.qt{font-weight:700}.tm{font-weight:400;color:#003DA5;font-size:8.5pt}.pt{font-weight:400;color:#555;font-size:8.5pt}.op{margin-left:16px;font-size:9.5pt}.op.sel{font-weight:800;color:#003DA5}</style></head><body>
<div class="instruccion"><div><strong>🧾 ${docs.length} hoja(s) de respuesta</strong> &nbsp;<span style="font-size:12px;opacity:.85">Una página por trabajador · Guardar como PDF</span></div><button class="btn-imprimir" onclick="window.print()">🖨️ Guardar como PDF</button></div>${hojas}</body></html>`);
    w.document.close(); toast('✅ '+docs.length+' hoja(s) listas — usa "Guardar como PDF"','s');
  },
  rptCopiarCuadros(){const el=$('mis-rpt-cuadros');if(!el)return;const r=document.createRange();r.selectNodeContents(el);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);let ok=false;try{ok=document.execCommand('copy');}catch(e){}sel.removeAllRanges();toast(ok?'📋 Cuadros copiados: pégalos en Word u Outlook':'No se pudo copiar; selecciona los cuadros y usa Ctrl+C','s');},
  rptCopiar(){const t=(M.rpt||{}).txt||'';(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('📋 Reporte copiado','s'),()=>{const p=$('mis-rpt-txt');if(p){const r=document.createRange();r.selectNodeContents(p);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);document.execCommand('copy');toast('📋 Reporte copiado','s');}});},
  /* _PDF_MIS_V1 (16-oct-2026): PDF del reporte consolidado con el mismo mecanismo que Resultados (ventana + Guardar como PDF): cabecera, cuadros e informe */
  rptImprimir(){
    const o=M.rpt||{}; if(!o.txt){toast('Abre primero el reporte','e');return;}
    const nom=o.nomO||M.nom, F=filasRpt(o.nomO,o.sector), R=resumen(F);
    const pg=(R.prom*100).toFixed(1), ok=R.prom>=0.7, G=grupos(F);
    const secsU=[...new Set(F.map(r=>r.sector).filter(Boolean))], empU=[...new Set(F.map(r=>String(r.emp||'').replace(' S.A.C.','')).filter(Boolean))];
    let logo=''; try{logo=getComputedStyle(document.documentElement).getPropertyValue('--logo').trim();}catch(e){}
    const w=window.open('','_blank'); if(!w){toast('Activa los pop-ups para este sitio y vuelve a intentar','e');return;}
    const pca='-webkit-print-color-adjust:exact;print-color-adjust:exact;';
    const info=[['Período',rangoTxt()],['Empresa',empU.join(' / ')||'VERFRUT / RAPEL'],['Supervisor',nom],['Sector(es)',secsU.join(', ')||'—'],['Modalidad','QR '+R.qr+' · Manual '+R.man],['Rutas / áreas',G.length],['Total evaluaciones',R.n+' personas'],['Obreros / Empleados',R.obr+' / '+R.emp],['Aprobados ≥70%',R.apr+' / '+R.n]];
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Informe-ETI-${esc(nom)}-${esc(M.desde)}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Tahoma,Arial,sans-serif;font-size:10pt;background:#fff;color:#1A2340}
@media screen{.instruccion{position:fixed;top:0;left:0;right:0;z-index:9999;background:#003DA5;color:#fff;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;font-size:14px;box-shadow:0 2px 10px rgba(0,0,0,.3);flex-wrap:wrap;gap:8px}.instruccion strong{font-size:15px}.instruccion .pasos{font-size:12px;opacity:.85;margin-top:2px}.btn-imprimir{background:#C8102E;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap}.btn-imprimir:hover{background:#A00D24}body{padding-top:70px}}
@media print{.instruccion{display:none !important}body{padding-top:0 !important;${pca}}@page{margin:10mm;size:A4 portrait}}
.doc{max-width:900px;margin:0 auto}.ptit{font-size:11px;font-weight:800;color:#fff;background:#003DA5;padding:6px 10px;border-radius:4px 4px 0 0;text-transform:uppercase;letter-spacing:.06em;margin:14px 0 0;${pca}}.ptit+div,.ptit+table{border:1px solid #C0CEEA;border-top:none;padding:10px;border-radius:0 0 6px 6px}
.rtbl{width:100%;border-collapse:collapse;font-size:9.5px}.rtbl th{background:#003DA5;color:#fff;padding:5px 6px;text-align:left;font-size:8.5px;letter-spacing:.04em;${pca}}.rtbl td{padding:5px 6px;border-bottom:1px solid #e8eef8;vertical-align:middle}
.sgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.scard{border:1px solid #C0CEEA;border-radius:8px;padding:8px;page-break-inside:avoid}.scdhdr{display:flex;justify-content:space-between;align-items:center;gap:6px;font-weight:700;font-size:10px}.scdpct{color:#007a3d;font-size:14px;font-weight:800}.scdpct.r{color:#C8102E}.btrk{height:6px;background:#e9edf3;border-radius:4px;margin:6px 0}.bfil{height:6px;background:#007a3d;border-radius:4px;${pca}}.bfil.r{background:#C8102E}.scdmeta{display:flex;justify-content:space-between;font-size:8.5px;color:#4A5A80}
.bdg{font-weight:800;padding:2px 6px;border-radius:8px;font-size:8px;${pca}}.bg{background:#e0f2e9;color:#007a3d}.br{background:#FCE4E7;color:#C8102E}.cpill{background:#003DA5;color:#fff;padding:1px 6px;border-radius:6px;font-size:8.5px;font-weight:700;${pca}}
.sec{page-break-inside:avoid;margin-bottom:6px}pre{font:9.5px/1.45 Consolas,"Courier New",monospace;white-space:pre-wrap;margin-top:16px;page-break-before:always}
table{${pca}}</style></head><body>
<div class="instruccion"><div><strong>📄 Guardar como PDF</strong><div class="pasos">1. Haz clic en "Guardar como PDF" &nbsp;→&nbsp; 2. En el diálogo: <strong>Destino = "Guardar como PDF"</strong> &nbsp;→&nbsp; 3. Clic en <strong>Guardar</strong></div></div><button class="btn-imprimir" onclick="window.print()">🖨️ Guardar como PDF</button></div>
<div class="doc">
  <div style="${pca}background:#003DA5;padding:22px 28px;position:relative">
    ${logo?`<div style="position:absolute;top:15px;right:20px;height:50px;width:41px;background:${logo} center/contain no-repeat;border-radius:7px"></div>`:''}
    <div style="padding-right:120px">
      <div style="color:#FF99A8;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin-bottom:4px">VERFRUT S.A.C / RAPEL S.A.C - UNIFRUTTI GROUP</div>
      <div style="color:#fff;font-size:18px;font-weight:800;line-height:1.2">Sistema ETI – Evaluación de Conocimiento de Buenas Prácticas Sociales y Laborales</div>
      <div style="color:#FF99A8;font-size:13px;font-weight:700;margin-top:4px">Informe Consolidado de Evaluaciones ETI · ${esc(nom)}</div>
      <div style="display:inline-block;text-align:center;background:${ok?'#007a3d':'#C8102E'};padding:10px 18px;border-radius:8px;min-width:120px;margin-top:14px"><div style="color:#fff;font-size:26px;font-weight:800;line-height:1">${pg}%</div><div style="color:rgba(255,255,255,.9);font-size:9px;font-weight:700;margin-top:3px">${ok?'APROBADO':'REQUIERE REFUERZO'}</div></div>
    </div></div>
  <div style="${pca}background:#F5F7FA;padding:14px 28px;border-bottom:2px solid #C0CEEA"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
    ${info.map(([l,v])=>`<div><div style="font-size:8px;font-weight:700;color:#4A5A80;text-transform:uppercase;letter-spacing:.06em">${l}</div><div style="font-size:12px;font-weight:700;margin-top:2px">${esc(String(v))}</div></div>`).join('')}</div></div>
  <div style="padding:0 4px">${cuadrosHTML(F,R)}</div>
  <pre>${esc(o.txt)}</pre>
  <div style="font-size:8px;color:#4A5A80;margin-top:12px;text-align:center">Generado por Sistema ETI · Evaluaciones · ${new Date().toLocaleString('es-PE')}</div>
</div></body></html>`);
    w.document.close(); toast('✅ Se abrió el informe — usa "Guardar como PDF"','s');
  },
  rptSector(sec){const o=M.rpt||{};verReporte(o.nomO,o.userO,sec);},
  rptExcel(){const o=M.rpt||{};const F=filasRpt(o.nomO,o.sector);const nI=M.nom;if(o.nomO)M.nom=o.nomO;excelMio(F,resumen(F));M.nom=nI;},
  rptCorreo(){const o=M.rpt||{};const m=$('mis-rpt');if(m)m.style.display='none';enviarInforme(o.nomO,o.userO);},
  /* _LIMPIAR_RANGO_V1 (15-oct-2026): borrado masivo de pruebas por rango (admin). Recorre cada sector con la misma ruta probada (etiAdminCambio) y al final el resto (sin sector). Nunca incluye hoy. */
  async limpiarRango(){
    const S=ses(); if(!S||S.rol!=='admin'||!window.etiAdminCambio) return;
    if(M.hasta>=hoyI()){toast('El rango no puede incluir hoy. Ajusta la fecha "hasta" a un día anterior.','e');return;}
    const F=filas(M.desde,M.hasta), n=F.reduce((a,r)=>a+r.n,0); if(!n){toast('No hay evaluaciones en el rango','i');return;}
    const sects=[...new Set(F.map(r=>r.sector||''))];
    const ok=await new Promise(res=>{if(typeof confMod!=='function'){res(confirm('¿Eliminar '+n+' evaluados?'));return;}confMod('🧹 ¿Eliminar TODO el rango '+fF(M.desde)+' – '+fF(M.hasta)+'?','Se eliminarán '+n+' evaluado(s) de '+F.length+' registro(s) ('+sects.filter(Boolean).length+' sector(es)) en Azure y Firebase. No se puede deshacer.',()=>res(true));setTimeout(()=>{const b=document.getElementById('mov');const chk=setInterval(()=>{if(!b.classList.contains('open')){clearInterval(chk);res(false);}},300);},500);});
    if(!ok) return;
    let i=0; for(const sec of sects){i++; try{await window.etiAdminCambio({desde:M.desde,hasta:M.hasta,sector:sec},null,'Eliminando '+(sec||'sin sector')+' ('+i+'/'+sects.length+')');}catch(e){console.error(e);} }
    toast('🧹 Limpieza terminada. Verifica Indicadores y Tráfico.','s'); cargarTodos();
  },
  editarFecha(key){
    const S=ses(); if(!S||S.rol!=='admin'||!window.etiCambiarFecha||!window.etiMiniForm){toast('Solo el administrador puede cambiar la fecha','e');return;}
    const r=filas(M.desde,M.hasta).find(x=>x.key===key); if(!r){toast('Registro no encontrado','e');return;}
    const tipo=r.mod==='QR'?'QR':'MANUAL', id=tipo==='QR'?r.key:r.doc;
    const nota=`Registro de <b>${esc(r.sup||'')}</b> · ${esc(r.sector||'—')} · ${esc(r.ruta||'—')} ${esc(r.cod||'')}<br>Fecha de evaluación actual: <b>${fF(r.fecha)}</b> · registrado el ${r.ts?new Date(r.ts).toLocaleString('es-PE'):'—'}`+
      (tipo==='MANUAL'?'<br><b>Nota:</b> en una evaluación manual la fecha se cambia para todas las rutas de ese registro.':'')+'<br>Se corrige en Azure y Firebase y se guarda la fecha original.';
    window.etiMiniForm('📅 Cambiar fecha de evaluación',nota,[{k:'f',lbl:'Fecha real de la evaluación (dd/mm/aaaa)',v:fF(r.fecha)}],async v=>{
      const t=String(v.f||'').trim(), m1=t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/), m2=t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      const nueva=m1?m1[3]+'-'+m1[2].padStart(2,'0')+'-'+m1[1].padStart(2,'0'):m2?t:'';
      if(!nueva||isNaN(new Date(nueva+'T00:00:00'))){toast('Escribe la fecha como dd/mm/aaaa','e');return;}
      if(nueva>hoyI()){toast('La fecha de evaluación no puede ser futura','e');return;}
      toast('⏳ Cambiando la fecha en Azure y Firebase…','i');
      try{const x=await window.etiCambiarFecha(tipo,id,nueva);
        if(x&&x.sinCambio){toast('La fecha ya era esa','i');return;}
        toast('✅ Fecha corregida: '+fF(x.vieja)+' → '+fF(x.nueva),'s');
        if(nueva<M.desde||nueva>M.hasta){M.desde=nueva<M.desde?nueva:M.desde;M.hasta=nueva>M.hasta?nueva:M.hasta;}
        if(M.todos)cargarTodos();else render();
      }catch(e){console.error(e);toast('No se cambió la fecha: '+e.message,'e');}
    });
  },
  informeDe(n){let u='';try{const x=(typeof getUsuarios==='function'?getUsuarios(true):[]).find(y=>y.rol!=='admin'&&coincide(y.nom,n));u=x?x.user:'';}catch(e){} enviarInforme(n,u);},
  abrir(){const S=ses(); if(!S) return; crearPantalla(); if(S.rol!=='admin'){iniciarSup(); if(!M.ini){M.ini=true;M.desde=iso(new Date(Date.now()-6*864e5));M.hasta=hoyI();}} go('smis');   /* _RANGO_SUP_V1: el supervisor abre con sus últimos 7 días */
    if(S.rol==='admin'&&!M.nom&&!M.todos){M.todos=true;const h=new Date();M.desde=iso(new Date(h.getFullYear(),h.getMonth(),1));M.hasta=iso(h);cargarTodos();} render();},
  rango(d,h){if(d)M.desde=d;if(h)M.hasta=h;if(M.hasta<M.desde){const t=M.desde;M.desde=M.hasta;M.hasta=t;}if(M.todos)cargarTodos();else render();},
  filtro(k,v){M.f[k]=v;render();},
  recargar(){if(M.todos)cargarTodos();},
  sup(n){if(!n)return; if(n==='*'){M.unsub.forEach(u=>{try{u();}catch(e){}});M.unsub=[];M.nom='';M.user='';M.todos=true;cargarTodos();return;} let u='';try{const x=(typeof getUsuarios==='function'?getUsuarios(true):[]).find(y=>y.rol!=='admin'&&coincide(y.nom,n));u=x?x.user:'';}catch(e){} escuchar(u,n); render();}
};
const _go=window.go;
window.go=function(id){const r=_go.apply(this,arguments); if(id==='sm'){iniciarSup();setTimeout(banner,300);} if(id==='smis') setTimeout(render,50); return r;};
setTimeout(()=>{iniciarSup();banner();},1500);
})();
