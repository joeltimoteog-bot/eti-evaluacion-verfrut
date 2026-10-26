/* Evaluaciones ETI · index.html · bloque 09-trafico-vivo (antes en la linea 7652) · extraido el 26-oct-2026 sin cambios (_EVAL_MODULAR_V1) */
/* ══════════════════════════════════════════════════════════════
   _TRAFICO_V1 (03-oct-2026) — 📡 Tráfico en vivo (solo administrador)
   Muestra en tiempo real cada evaluación del día: QR (cada trabajador) y
   manual (supervisor / usuario), con su estado en Azure.
   - Lee Firebase en vivo (onSnapshot por ts del día elegido).
   - "En Azure ✓" = el registro tiene azOk:true (lo marca el celular del
     trabajador, el guardado manual o este panel al reenviar).
   - Reenvío automático cada 60 s de lo que no tenga confirmación de Azure
     (Azure no duplica: lo que ya existe responde "existentes").
   ══════════════════════════════════════════════════════════════ */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const esAdm=()=>typeof SESSION!=='undefined'&&!!SESSION&&SESSION.rol==='admin';
const db=()=>(typeof fbdb!=='undefined'?fbdb:null);
const hoy=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const pc=v=>(Math.round((v||0)*1000)/10).toFixed(1)+'%';
const hora=ts=>ts?new Date(ts).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'—';
const T={dia:hoy(),qr:[],man:[],unsub:[],auto:true,sync:false,ultSync:null,ultMsg:'',vistos:null,err:'',timer:null,pintT:null};

function css(){
  if($('tf-css')) return;
  const s=document.createElement('style');s.id='tf-css';
  s.textContent=`.tf-top{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;justify-content:space-between;margin-bottom:1rem}
  .tf-live{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-weight:800;color:#007A3D;background:#E6F7EE;border-radius:99px;padding:4px 10px}
  .tf-live i{width:8px;height:8px;border-radius:50%;background:#1DB954;animation:tfp 1.4s infinite}
  @keyframes tfp{0%{box-shadow:0 0 0 0 rgba(29,185,84,.6)}100%{box-shadow:0 0 0 8px rgba(29,185,84,0)}}
  .tf-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.7rem;margin-bottom:1rem}
  .tf-k{background:#fff;border:1px solid #D9E0EC;border-radius:14px;padding:.8rem .9rem}
  .tf-k b{display:block;font-size:1.5rem;line-height:1.1;color:#14213D}.tf-k span{font-size:.72rem;color:#5B6B85;font-weight:700;text-transform:uppercase;letter-spacing:.03em}
  .tf-k.ok b{color:#007A3D}.tf-k.bad b{color:#C8102E}
  .tf-grid{display:grid;grid-template-columns:2fr 1fr;gap:1rem}@media(max-width:1000px){.tf-grid{grid-template-columns:1fr}}
  .tf-wrap{overflow:auto;max-height:560px}
  .tf-t{width:100%;border-collapse:collapse;font-size:.8rem}.tf-t th{position:sticky;top:0;background:#F4F6FB;text-align:left;padding:.45rem .5rem;font-size:.7rem;text-transform:uppercase;color:#5B6B85}
  .tf-t td{padding:.42rem .5rem;border-top:1px solid #EEF1F6;vertical-align:top}
  .tf-nuevo td{animation:tff 3s ease}@keyframes tff{0%{background:#FFF4C2}100%{background:transparent}}
  .tf-b{display:inline-block;border-radius:99px;padding:2px 8px;font-size:.68rem;font-weight:800}
  .tf-qr{background:#EEF3FB;color:#003DA5}.tf-man{background:#F3ECFF;color:#6A3FC0}
  .tf-az{background:#E6F7EE;color:#007A3D}.tf-pe{background:#FFF4E5;color:#B86E00}
  .tf-msg{font-size:.75rem;color:#5B6B85;margin-top:.4rem}`;
  document.head.appendChild(s);
}
/* _SALUD_V1 (08-oct-2026): semáforo de salud del sistema */
const SAL={t:0,fb:null,az:null,resp:null,banco:null,qr:null};
async function chequeo(){
  if(Date.now()-SAL.t<50000) return; SAL.t=Date.now();
  const f=db(); const t0=Date.now();
  try{const d=await Promise.race([f.collection('config_eti').doc('banco').get(),new Promise((_,n)=>setTimeout(()=>n(new Error('sin respuesta')),12000))]);
    SAL.fb={ok:true,ms:Date.now()-t0}; const x=d.exists?d.data():{}; SAL.banco={v:x.version||0,vb:(x.secs||[]).reduce((a,s)=>a+(s.pregs||[]).filter(p=>p.vb!==false).length,0)};}
  catch(e){SAL.fb={ok:false,err:e.message};}
  SAL.az=window.etiAzure&&window.etiAzure.ping?await window.etiAzure.ping():{ok:false,err:'no disponible'};
  try{const r=await f.collection('config_eti').doc('respaldo').get();SAL.resp=r.exists?r.data():{};}catch(e){}
  try{const q=await f.collection('sesiones_qr').where('permanente','==',true).get();SAL.qr={tot:q.size,act:q.docs.filter(d=>d.data().estado==='abierta').length};}catch(e){}
  const el=$('tf-salud'); if(el) el.innerHTML=saludHTML();
}
function saludHTML(){
  const ch=(ok,t,d)=>`<span style="display:inline-flex;align-items:center;gap:6px;background:${ok===null?'#EEF1F6':ok?'#E6F7EE':'#FCE4E7'};color:${ok===null?'#5B6B85':ok?'#0B5E33':'#9B0D22'};border-radius:10px;padding:6px 10px;font-size:.76rem;font-weight:700">${ok===null?'⏳':ok?'🟢':'🔴'} ${t}${d?` <span style="font-weight:500;opacity:.8">${d}</span>`:''}</span>`;
  const F=filas(), pend=F.filter(r=>!r.az&&r.ts<Date.now()-180000).length, band=window.etiBandeja?window.etiBandeja.pendientes():0;
  const dias=SAL.resp&&SAL.resp.ultimo?Math.floor((new Date(hoy()+'T00:00:00')-new Date(SAL.resp.ultimo+'T00:00:00'))/864e5):null;
  return `<div style="display:flex;gap:.45rem;flex-wrap:wrap;align-items:center;margin:.2rem 0 .6rem"><b style="font-size:.78rem;color:#5B6B85">🩺 Salud del sistema:</b>
    ${ch(SAL.fb?SAL.fb.ok:null,'Firebase',SAL.fb?(SAL.fb.ok?SAL.fb.ms+' ms':SAL.fb.err):'')}
    ${ch(SAL.az?SAL.az.ok:null,'Azure',SAL.az?(SAL.az.ok?SAL.az.ms+' ms':'no responde'):'')}
    ${ch(pend===0,'Pendientes Azure',String(pend))}
    ${ch(band===0,'Manual sin subir (este equipo)',String(band))}
    ${ch(SAL.banco?SAL.banco.vb>0:null,'Banco',SAL.banco?'v'+SAL.banco.v+' · '+SAL.banco.vb+' preguntas ✅':'')}
    ${ch(SAL.qr?SAL.qr.act>0:null,'QR permanentes',SAL.qr?SAL.qr.act+' activos de '+SAL.qr.tot:'')}
    ${ch(SAL.resp?(dias!==null&&dias<35):null,'Respaldo',SAL.resp?(dias===null?'nunca':'hace '+dias+' día(s)'):'')}</div>`;
}
function filaQR(d){return {id:d.id,ref:d.ref,raw:d.data,mod:'QR',ts:d.data.ts||0,emp:d.data.emp,sup:d.data.sup,sector:d.data.sector,tipo:d.data.tipo,
  ruta:d.data.ruta,cod:d.data.cod,n:1,res:+d.data.resultado||0,apr:(+d.data.resultado||0)>=0.7?1:0,az:d.data.azOk===true,ses:d.data.sesion,por:'Trabajador (QR)'};}
function filaMan(d){const x=d.data, rs=x.rutas||[], n=rs.reduce((a,r)=>a+(+r.ne||1),0)||1;
  return {id:d.id,ref:d.ref,raw:x,mod:'MANUAL',ts:x.ts||0,emp:x.emp,sup:x.sup,sector:x.sector,tipo:x.tipo,
  ruta:rs.map(r=>r.nom).filter(Boolean).join(', '),cod:rs.map(r=>r.cod).filter(Boolean).join(', '),n,res:+x.resGen||0,
  apr:rs.reduce((a,r)=>a+((+r.resGrupo||0)>=0.7?(+r.ne||1):0),0),az:x.azOk===true,por:x.nomUsuario||x.usuario||'—'};}
function escuchar(){
  T.unsub.forEach(u=>{try{u();}catch(e){}}); T.unsub=[]; T.qr=[]; T.man=[]; T.vistos=null; T.err='';
  const f=db(); if(!f){T.err='Sin conexión a Firebase';pintar();return;}
  const t0=new Date(T.dia+'T00:00:00').getTime(), t1=t0+864e5;
  const fe=e=>{console.error('Tráfico:',e);T.err=e.message;pintar();};
  T.unsub.push(f.collection('respuestas_qr').where('ts','>=',t0).where('ts','<',t1).onSnapshot(s=>{
    T.qr=s.docs.map(d=>filaQR({id:d.id,ref:d.ref,data:d.data()}));pintar();},fe));
  T.unsub.push(f.collection('evaluaciones_conocimiento').where('ts','>=',t0).where('ts','<',t1).onSnapshot(s=>{
    T.man=s.docs.map(d=>({id:d.id,ref:d.ref,data:d.data()})).filter(d=>d.data.modalidad!=='QR').map(filaMan);pintar();},fe));
}
function filas(){return [...T.qr,...T.man].sort((a,b)=>b.ts-a.ts);}
function pintar(){clearTimeout(T.pintT);T.pintT=setTimeout(render,300);}
function render(){
  const box=$('admin-trafico'); if(!box||box.style.display==='none') return;
  const F=filas(), now=Date.now();
  const nQR=T.qr.length, nMan=T.man.reduce((a,r)=>a+r.n,0), tot=nQR+nMan;
  const prom=tot?(T.qr.reduce((a,r)=>a+r.res,0)+T.man.reduce((a,r)=>a+r.res*r.n,0))/tot:0;
  const apr=T.qr.reduce((a,r)=>a+r.apr,0)+T.man.reduce((a,r)=>a+r.apr,0);
  const az=F.filter(r=>r.az).length, pend=F.length-az, ult10=T.qr.filter(r=>r.ts>now-600000).length;
  const sups=new Map(); F.forEach(r=>{const k=r.sup||'—';const g=sups.get(k)||{sup:k,qr:0,man:0,s:0,n:0,ult:0};
    if(r.mod==='QR')g.qr++;else g.man+=r.n; g.s+=r.res*r.n; g.n+=r.n; g.ult=Math.max(g.ult,r.ts); sups.set(k,g);});
  const primera=T.vistos===null; const vistos=T.vistos||new Set();
  box.innerHTML=`
  <div class="tf-top"><div><h2 class="m-tit" style="margin:0">📡 Tráfico en vivo <span class="tf-live"><i></i>Tiempo real</span></h2>
    <div class="m-mut" style="font-size:.8rem">Cada evaluación aparece aquí apenas se guarda: QR (cada trabajador) y manual (supervisor / usuario).</div></div>
    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
      <input type="date" class="fc" style="width:auto" value="${esc(T.dia)}" onchange="ETITF.dia(this.value)">
      <label class="m-mut" style="font-size:.8rem;display:flex;gap:4px;align-items:center"><input type="checkbox" ${T.auto?'checked':''} onchange="ETITF.auto(this.checked)"> Reenvío automático a Azure</label>
      <button class="btn bout bsm" onclick="ETITF.exportarDlg()" title="Descarga en Excel todas las evaluaciones (QR y manuales) de un rango de fechas">📥 Exportar Excel</button>
      <button class="btn bpri bsm" ${T.sync?'disabled':''} onclick="ETITF.sincronizar(true)">${T.sync?'⏳ Enviando…':'☁ Enviar pendientes a Azure'}</button>
    </div></div>
  ${T.err?`<div class="m-empty" style="color:#C8102E">No se pudo leer Firebase: ${esc(T.err)}</div>`:''}
  <div class="tf-kpis">
    <div class="tf-k"><b>${tot}</b><span>Trabajadores evaluados</span></div>
    <div class="tf-k"><b>${nQR}</b><span>📱 Por QR</span></div>
    <div class="tf-k"><b>${nMan}</b><span>📋 Manual (${T.man.length} registros)</span></div>
    <div class="tf-k ${prom>=0.7?'ok':tot?'bad':''}"><b>${tot?pc(prom):'—'}</b><span>Promedio</span></div>
    <div class="tf-k"><b>${apr}</b><span>Aprobados ≥70%</span></div>
    <div class="tf-k ok"><b>${az}</b><span>☁ Confirmados en Azure</span></div>
    <div class="tf-k ${pend?'bad':'ok'}"><b>${pend}</b><span>⏳ Por confirmar en Azure</span></div>
    <div class="tf-k"><b>${ult10}</b><span>QR últimos 10 min</span></div>
  </div>
  <div id="tf-salud">${saludHTML()}</div>
  <div class="tf-msg">${T.ultSync?'Último envío a Azure: '+hora(T.ultSync)+' · '+esc(T.ultMsg):'Aún no se reenvió nada en esta sesión.'}</div>
  <div class="tf-grid" style="margin-top:.8rem">
    <section class="m-card"><h3 class="m-tit2">Evaluaciones del día (más recientes primero)</h3>
      ${F.length?`<div class="tf-wrap"><table class="tf-t"><thead><tr><th>Hora</th><th>Modalidad</th><th>Empresa</th><th>Supervisor</th><th>Sector</th><th>Tipo</th><th>Ruta / Área</th><th>Código</th><th>Eval.</th><th>Resultado</th><th>Azure</th></tr></thead><tbody>
      ${F.slice(0,300).map(r=>`<tr class="${!primera&&!vistos.has(r.mod+r.id)?'tf-nuevo':''}" title="${esc(r.por)}">
        <td>${hora(r.ts)}</td><td><span class="tf-b ${r.mod==='QR'?'tf-qr':'tf-man'}">${r.mod==='QR'?'📱 QR':'📋 Manual'}</span></td>
        <td>${esc(String(r.emp||'').replace(' S.A.C.',''))}</td><td>${esc(r.sup||'—')}</td><td>${esc(r.sector||'—')}</td>
        <td>${r.tipo==='empleado'?'💼 Empleado':r.tipo==='obrero'?'👷 Obrero':esc(r.tipo||'—')}</td><td><b>${esc(r.ruta||'—')}</b></td><td>${esc(r.cod||'—')}</td><td>${r.n}</td>
        <td><b style="color:${r.res>=0.7?'var(--green,#007A3D)':'var(--red,#C8102E)'}">${pc(r.res)}</b></td>
        <td>${r.az?'<span class="tf-b tf-az">☁ ✓</span>':'<span class="tf-b tf-pe">⏳</span>'}</td></tr>`).join('')}
      </tbody></table></div>${F.length>300?`<div class="tf-msg">Mostrando 300 de ${F.length}.</div>`:''}`
      :'<div class="m-empty">Aún no hay evaluaciones este día. Aparecerán aquí automáticamente.</div>'}
    </section>
    <section class="m-card"><h3 class="m-tit2">Por supervisor</h3>
      ${sups.size?`<div class="tf-wrap"><table class="tf-t"><thead><tr><th>Supervisor</th><th>QR</th><th>Manual</th><th>Prom.</th><th>Último</th></tr></thead><tbody>
      ${[...sups.values()].sort((a,b)=>b.ult-a.ult).map(g=>`<tr><td>${esc(g.sup)}</td><td>${g.qr}</td><td>${g.man}</td>
        <td><b style="color:${g.s/g.n>=0.7?'var(--green,#007A3D)':'var(--red,#C8102E)'}">${pc(g.s/g.n)}</b></td><td>${hora(g.ult).slice(0,5)}</td></tr>`).join('')}
      </tbody></table></div>`:'<div class="m-empty">—</div>'}
    </section>
  </div>`;
  T.vistos=new Set(F.map(r=>r.mod+r.id));
}
async function sincronizar(manual){
  if(T.sync||!esAdm()) return;
  const AZ=window.etiAzure; if(!AZ){if(manual)toast('Módulo de Azure no disponible','e');return;}
  const lim=Date.now()-(manual?0:120000);   /* en automático, se da 2 min al celular para confirmar solo */
  const pend=filas().filter(r=>!r.az&&r.ts<lim);
  if(!pend.length){if(manual)toast('✅ Todo está confirmado en Azure','s');return;}
  T.sync=true; render();
  let ok=0,ins=0,ex=0,fallo='';
  try{
    for(let i=0;i<pend.length;i+=50){
      const lote=pend.slice(i,i+50);
      const regs=lote.flatMap(r=>r.mod==='QR'?[AZ.regQR(r.raw,r.id)]:AZ.regsManual(r.raw,r.id));
      if(regs.length){const j=await AZ.post(regs);ins+=j.insertados||0;ex+=j.existentes||0;}
      const en=new Date().toISOString();
      await Promise.all(lote.map(r=>r.ref.update({azOk:true,azEn:en}).then(()=>{ok++;},e=>console.warn('marcar azOk',e))));
    }
  }catch(e){fallo=e.message;console.error('Tráfico → Azure:',e);}
  T.sync=false; T.ultSync=Date.now();
  T.ultMsg=fallo?`falló: ${fallo} (se reintenta)`:`${ok} confirmados · ${ins} nuevos en Azure · ${ex} ya estaban`;
  if(manual) toast(fallo?'⚠ Azure: '+fallo:`✅ ${ok} registros confirmados en Azure`,fallo?'e':'s');
  render();
}
function abrir(){
  if(!esAdm()) return;
  css();
  if(!T.unsub.length) escuchar(); else render();
  SAL.t=0; chequeo();
  if(!T.timer) T.timer=setInterval(()=>{if(T.auto&&esAdm())sincronizar(false);render();const b=$('admin-trafico');if(b&&b.style.display!=='none')chequeo();},60000);
}
/* _EXPORTAR_V1 (03-oct-2026): Excel de evaluaciones por rango de fechas
   Hojas: Evaluaciones (1 fila por trabajador QR / por ruta manual, con % por tema) · Por supervisor · Por pregunta (QR) */
async function exportar(desde,hasta){
  const f=db(); if(!f){toast('Sin conexión a Firebase','e');return;}
  if(typeof XLSX==='undefined'){toast('No cargó la librería de Excel; recarga la página','e');return;}
  if(!desde||!hasta||hasta<desde){toast('Revisa el rango de fechas','e');return;}
  toast('⏳ Preparando Excel…','i');
  try{
    const t0=new Date(desde+'T00:00:00').getTime(), t1=new Date(hasta+'T00:00:00').getTime()+864e5;
    /* _EXCEL_TOTAL_V1 (19-oct): se filtra por FECHA DE EVALUACIÓN (antes por fecha de registro: se perdían las registradas otro día) */
    const [qs,ms]=await Promise.all([f.collection('respuestas_qr').where('fecha','>=',desde).where('fecha','<=',hasta).get(),
      f.collection('evaluaciones_conocimiento').where('fecha','>=',desde).where('fecha','<=',hasta).get()]);
    const qr=qs.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0));
    const man=ms.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.modalidad!=='QR').sort((a,b)=>(a.ts||0)-(b.ts||0));
    if(!qr.length&&!man.length){toast('No hay evaluaciones en ese rango','i');return;}
    const temas=[]; const addT=n=>{if(n&&!temas.includes(n))temas.push(n);};
    qr.forEach(r=>(r.secs||[]).forEach(x=>addT(x.nom))); man.forEach(m=>(m.rutas||[]).forEach(r=>(r.secs||[]).forEach(x=>addT(x.nom))));
    const P=v=>Math.round((+v||0)*1000)/10, fch=ts=>ts?new Date(ts):null;
    const filas=[];
    const fReg=ts=>ts?new Date(ts).toLocaleString('es-PE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'';
    const progTxt=p=>!p?'':p.programada?('Programada '+(p.sesion||'')+' de '+(p.total||'')):'No programada';
    qr.forEach(r=>{const o={'Fecha evaluación':r.fecha||'','Fecha registro':fReg(r.ts),'Fecha original':r.fechaOriginal||'','Modalidad':'QR','Usuario':r.usuarioSup||'','Aplicado con QR de':r.supQR||'',
      'Empresa':r.emp||'','Supervisor':r.sup||'','Sector / zona':r.sector||'','Tipo':r.tipo==='empleado'?'Empleado':'Obrero','Ruta / Área':r.ruta||'','Código':r.cod||'',
      'Evaluados':1,'Resultado %':P(r.resultado),'Estado':(+r.resultado||0)>=0.7?'APROBADO':'REFUERZO','En Azure':r.azOk?'Sí':'Pendiente','Código QR':r.sesion||'','Banco v':r.bancoVersion||'','Id registro':r.id,'Sexo':r.sexo==='H'?'Hombre':r.sexo==='M'?'Mujer':'','Hombres':r.sexo==='H'?1:0,'Mujeres':r.sexo==='M'?1:0};
      temas.forEach(t=>{const x=(r.secs||[]).find(y=>y.nom===t);o[t+' %']=x?P(x.pct):'';}); filas.push(o);});
    man.forEach(m=>(m.rutas||[]).forEach((r,ri)=>{const o={'Fecha evaluación':m.fecha||'','Fecha registro':fReg(m.ts),'Fecha original':m.fechaOriginal||'','Modalidad':'Manual','Usuario':m.usuario||'','Aplicado con QR de':'',
      'Empresa':m.emp||'','Supervisor':m.sup||'','Sector / zona':m.sector||'','Tipo':m.tipo==='empleado'?'Empleado':'Obrero','Ruta / Área':r.nom||'','Código':r.cod||'',
      'Evaluados':+r.ne||1,'Resultado %':P(r.resGrupo),'Estado':(+r.resGrupo||0)>=0.7?'APROBADO':'REFUERZO','En Azure':m.azOk?'Sí':'Pendiente','Código QR':'','Banco v':'','Id registro':m.id+'_'+ri,'Registrado por':m.nomUsuario||m.usuario||'',
      'Programación':progTxt(m.prog),'Destiempo':m.destiempo?m.destiempo.tipo||'':'','Motivo destiempo':m.destiempo?m.destiempo.motivo||'':'','Reportó a coordinador':m.destiempo?m.destiempo.reportado||'':'','Sexo':'','Hombres':r.hom!=null?+r.hom:'','Mujeres':r.muj!=null?+r.muj:''};
      temas.forEach(t=>{const x=(r.secs||[]).find(y=>y.nom===t);o[t+' %']=x?P(x.pct!=null?x.pct:x.cum):'';}); filas.push(o);}));
    /* por supervisor */
    const sm=new Map(); filas.forEach(o=>{const g=sm.get(o.Supervisor)||{Supervisor:o.Supervisor,'Evaluados QR':0,'Evaluados manual':0,s:0,n:0,apr:0};
      if(o.Modalidad==='QR')g['Evaluados QR']+=o.Evaluados;else g['Evaluados manual']+=o.Evaluados; g.s+=o['Resultado %']*o.Evaluados; g.n+=o.Evaluados; if(o.Estado==='APROBADO')g.apr+=o.Evaluados; sm.set(o.Supervisor,g);});
    const sups=[...sm.values()].map(g=>({Supervisor:g.Supervisor,'Evaluados QR':g['Evaluados QR'],'Evaluados manual':g['Evaluados manual'],'Total':g.n,'Promedio %':Math.round(g.s/g.n*10)/10,'Aprobados ≥70%':g.apr})).sort((a,b)=>b.Total-a.Total);
    /* por pregunta (QR): % de logro de cada pregunta */
    /* cada respuesta se mide con la versión del banco con la que se respondió (sesión o historial del banco) */
    const ses={}; for(const id of [...new Set(qr.map(r=>r.sesion).filter(Boolean))]){try{const d=await f.collection('sesiones_qr').doc(id).get();if(d.exists)ses[id]=d.data();}catch(e){}}
    const hist={}; for(const v of [...new Set(qr.map(r=>r.bancoVersion||0))].filter(v=>v>0)){try{const h=await f.collection('banco_historial').where('version','==',v).limit(1).get();
      if(!h.empty){const x=h.docs[0].data();hist[v]=(x.secs||[]).map(sec=>({nom:sec.nom,pregs:(sec.pregs||[]).filter(p=>p.vb!==false).map(p=>({n:p.n,t:p.tq||p.t,max:+p.pct||0}))})).filter(sec=>sec.pregs.length);}}catch(e){}}
    const bancoDe=r=>{const S=ses[r.sesion];if(S&&(S.bancoVersion||0)===(r.bancoVersion||0))return S.banco||[];return hist[r.bancoVersion||0]||null;};
    const pq=new Map(); let sinDet=0;
    qr.forEach(r=>{const B=bancoDe(r); if(!B){sinDet++;return;}
      B.forEach(sec=>(sec.pregs||[]).forEach(p=>{const k=sec.nom+'|'+p.t;const g=pq.get(k)||{Tema:sec.nom,Pregunta:p.t,Respondieron:0,'Respuesta completa':0,lo:0,mx:0};
        const v=+((r.pts||{})[p.n])||0; g.Respondieron++; if(v>=(+p.max||0)-1e-6)g['Respuesta completa']++; g.lo+=v; g.mx+=(+p.max||0); pq.set(k,g);}));});
    if(sinDet) console.warn('Exportar: '+sinDet+' respuesta(s) sin detalle por pregunta (versión de banco no encontrada)');
    const preg=[...pq.values()].map(g=>({Tema:g.Tema,Pregunta:g.Pregunta,Respondieron:g.Respondieron,'Respuesta completa':g['Respuesta completa'],'% de logro':g.mx?Math.round(g.lo/g.mx*1000)/10:0})).sort((a,b)=>a['% de logro']-b['% de logro']);
    const wb=XLSX.utils.book_new();
    const hdr=[...new Set(filas.flatMap(o=>Object.keys(o)))];   /* todas las columnas, aunque la primera fila no las tenga */
    const ws1=XLSX.utils.json_to_sheet(filas,{header:hdr}); ws1['!cols']=hdr.map(k=>({wch:Math.max(10,Math.min(40,k.length+4))}));
    XLSX.utils.book_append_sheet(wb,ws1,'Evaluaciones');
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(sups),'Por supervisor');
    if(preg.length){const ws3=XLSX.utils.json_to_sheet(preg);ws3['!cols']=[{wch:28},{wch:70},{wch:12},{wch:18},{wch:12}];XLSX.utils.book_append_sheet(wb,ws3,'Por pregunta (QR)');}
    XLSX.writeFile(wb,desde<='2000-01-01'?`ETI-Base-completa-al-${hasta}.xlsx`:`ETI-Evaluaciones-${desde}${hasta!==desde?'_a_'+hasta:''}.xlsx`);
    toast(`✅ Excel listo: ${qr.length} evaluaciones QR · ${man.length} registros manuales`,'s');
    if(desde<='2000-01-01'){try{await f.collection('config_eti').doc('respaldo').set({ultimo:hoy(),en:new Date().toISOString(),por:(SESSION&&SESSION.user)||'',qr:qr.length,manual:man.length},{merge:true});}catch(e){}
      const b=$('tf-respaldo'); if(b) b.remove();}
    return true;
  }catch(e){console.error(e);toast('No se pudo exportar: '+e.message,'e');return false;}
}
/* _RESPALDO_MENSUAL_V1 (03-oct-2026): si pasaron 30 días desde el último respaldo "Toda la base", el admin ve un aviso con un botón */
async function avisoRespaldo(){
  try{
    if(!esAdm()||$('tf-respaldo')||window._respChk) return; const f=db(); if(!f) return; window._respChk=true;
    const d=await f.collection('config_eti').doc('respaldo').get(); const x=d.exists?d.data():{};
    const dias=x.ultimo?Math.floor((new Date(hoy()+'T00:00:00')-new Date(x.ultimo+'T00:00:00'))/864e5):null;
    if(dias!==null&&dias<30) return;
    const st=$('admin-stats')||$('admin-trafico'); if(!st) return;
    const b=document.createElement('div'); b.id='tf-respaldo';
    b.style.cssText='display:flex;gap:.8rem;align-items:center;justify-content:space-between;flex-wrap:wrap;background:#FFF4E5;border:1px solid #F3C27A;color:#7A4A00;border-radius:12px;padding:.75rem 1rem;margin:0 0 1rem';
    b.innerHTML=`<div>📦 <b>Respaldo mensual pendiente.</b> ${x.ultimo?'El último fue el '+x.ultimo.split('-').reverse().join('/')+' ('+dias+' días).':'Aún no se ha hecho ninguno.'} Descarga la base completa y guárdala en tu Drive o PC.</div>
      <div style="display:flex;gap:.5rem"><button class="btn bpri bsm" id="tf-resp-ok">📥 Descargar respaldo</button><button class="btn bout bsm" id="tf-resp-no">Luego</button></div>`;
    st.parentNode.insertBefore(b,st);
    $('tf-resp-no').onclick=()=>b.remove();
    $('tf-resp-ok').onclick=async()=>{const k=$('tf-resp-ok');k.disabled=true;k.textContent='⏳ Preparando…';if(!(await exportar('2000-01-01',hoy()))){k.disabled=false;k.textContent='📥 Descargar respaldo';}};
  }catch(e){console.warn('aviso respaldo',e);}
}
window.ETITF={
  dia(v){if(!v)return;T.dia=v;escuchar();},
  exportarDlg(){
    let m=$('ix-modal');if(!m){m=document.createElement('div');m.id='ix-modal';m.className='ix-modal';document.body.appendChild(m);}
    m.innerHTML=`<div class="ix-mbox"><h3>📥 Exportar evaluaciones a Excel</h3><p>Incluye QR (cada trabajador) y manuales, con su % por tema, más un resumen por supervisor y el % de logro de cada pregunta.</p>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin:.2rem 0 .4rem">
        <button class="btn bout bsm" onclick="document.getElementById('ex-d').value='${esc(T.dia)}';document.getElementById('ex-h').value='${esc(T.dia)}'">Día elegido</button>
        <button class="btn bout bsm" onclick="document.getElementById('ex-d').value='${esc(T.dia.slice(0,8))}01';document.getElementById('ex-h').value='${esc(T.dia)}'">Este mes</button>
        <button class="btn bpri bsm" onclick="document.getElementById('ex-d').value='2000-01-01';document.getElementById('ex-h').value='${esc(hoy())}'" title="Todas las evaluaciones registradas desde el inicio (para auditoría)">🗄 Toda la base</button>
      </div>
      <label class="fl">Desde</label><input class="fc" type="date" id="ex-d" value="${esc(T.dia)}">
      <label class="fl">Hasta</label><input class="fc" type="date" id="ex-h" value="${esc(T.dia)}">
      <div class="ix-macts"><button class="btn bout" id="ex-no">Cancelar</button><button class="btn bpri" id="ex-ok">📥 Descargar Excel</button></div></div>`;
    m.classList.add('on'); $('ex-no').onclick=()=>m.classList.remove('on');
    $('ex-ok').onclick=()=>{const d=$('ex-d').value,h=$('ex-h').value;m.classList.remove('on');exportar(d,h);};
  },
  exportar,
  auto(v){T.auto=!!v;},
  sincronizar(m){return sincronizar(!!m);}
};
function inyectar(){
  if(!esAdm()) return;
  if(!$('admin-trafico')){const st=$('admin-stats');if(st){const p=document.createElement('div');p.id='admin-trafico';p.style.display='none';st.parentNode.insertBefore(p,st);}}
  if(!$('atab13')){
    const ref=$('atab12')||$('atab1'); if(!ref) return;
    const b=document.createElement('button');b.className='btn bout bsm';b.id='atab13';b.innerHTML='📡 Tráfico en vivo';
    b.onclick=()=>{document.body.classList.remove('side-open');const a=document.querySelector('.screen.active');if(a&&a.id!=='sadmin')go('sadmin');adminTab('trafico');};
    ref.parentNode.insertBefore(b,ref.nextSibling);
  }
}
const _at=window.adminTab;
window.adminTab=function(t){
  const p=$('admin-trafico'); if(p) p.style.display='none';
  const r=_at.apply(this,arguments);
  const b=$('atab13'); if(b) b.className=t==='trafico'?'btn bpri bsm':'btn bout bsm';
  if(t==='trafico'){inyectar();const q=$('admin-trafico');if(q)q.style.display='block';abrir();}
  return r;
};
/* _BARRIDO_AZURE_V1 (07-oct-2026): al entrar el admin, se revisan los últimos 3 días y se reenvía a Azure lo que no tenga confirmación */
async function barridoAzure(){
  try{
    if(!esAdm()||window._barrido) return; const f=db(), AZ=window.etiAzure; if(!f||!AZ) return; window._barrido=true;
    const t0=Date.now()-3*864e5, lim=Date.now()-120000;
    const [qs,ms]=await Promise.all([f.collection('respuestas_qr').where('ts','>=',t0).get(),f.collection('evaluaciones_conocimiento').where('ts','>=',t0).get()]);
    const pend=[...qs.docs.filter(d=>{const x=d.data();return !x.azOk&&(x.ts||0)<lim&&x.resultado!=null;}).map(d=>({d,qr:true})),
      ...ms.docs.filter(d=>{const x=d.data();return x.modalidad!=='QR'&&!x.azOk&&(x.ts||0)<lim;}).map(d=>({d,qr:false}))];
    if(!pend.length) return;
    let ok=0;
    for(let i=0;i<pend.length;i+=50){const lote=pend.slice(i,i+50);
      const regs=lote.flatMap(x=>x.qr?[AZ.regQR(x.d.data(),x.d.id)]:AZ.regsManual(x.d.data(),x.d.id));
      if(regs.length) await AZ.post(regs);
      const en=new Date().toISOString(); await Promise.all(lote.map(x=>x.d.ref.update({azOk:true,azEn:en}).then(()=>ok++,()=>{})));}
    console.log('[Barrido Azure] '+ok+' registro(s) confirmados en Azure');
  }catch(e){console.warn('[Barrido Azure] se reintenta en la próxima entrada:',e.message);window._barrido=false;}
}
const _go=window.go;
window.go=function(id){const r=_go.apply(this,arguments);if(id==='sadmin'){inyectar();setTimeout(avisoRespaldo,1500);setTimeout(barridoAzure,6000);}return r;};
setTimeout(()=>{const a=document.querySelector('.screen.active');if(a&&a.id==='sadmin'){inyectar();setTimeout(avisoRespaldo,1500);setTimeout(barridoAzure,6000);}},900);
})();
