/* Evaluaciones ETI · index.html · bloque 03-guia (antes en la linea 5552) · extraido el 26-oct-2026 sin cambios (_EVAL_MODULAR_V1) */
/* ══════ _GUIA_V1 (20-set-2026) — Evaluaciones ETI
   Capa ADITIVA: no toca go(), p1next(), calcular() ni el DOM de las pantallas.
   Lee el estado (S, SESSION, la pantalla .screen.active y los campos) y muestra:
     · Tarjeta "¿Que hago ahora?" con checklist y progreso, segun la pantalla.
     · Asistente guionado (sin IA) con preguntas frecuentes y saltos a pantalla.
     · Tour de bienvenida la primera vez (localStorage eti_tour_v1).
   Si algo falla, se ignora en silencio: el sistema sigue igual. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function activa(){var a=document.querySelector('.screen.active');return a?a.id:'';}
function val(id){var e=$(id);return e?String(e.value||'').trim():'';}
function nombre(){try{return (SESSION&&SESSION.nom||'').split(' ')[0];}catch(e){return '';}}
function saludo(){var h=new Date().getHours();return h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches';}
function tipoTxt(){try{return S.tipo==='obrero'?'ruta':'área';}catch(e){return 'ruta';}}

/* ── contenido por pantalla ── */
function guia(){
  var id=activa(), n=nombre(), t=tipoTxt();
  if(id==='sm'){
    return {h:'Registra la evaluación de la semana',p:(n?saludo()+', '+n+'. ':'')+'El sistema te lleva paso a paso; solo necesitas los cuestionarios llenados por el personal.',
      items:[['now','Iniciar una nueva evaluación'],['','Indicar sector y '+t+'s'],['','Cargar las respuestas'],['','Revisar el reporte y enviarlo']],
      tip:'Si evaluaste varias '+t+'s el mismo día, regístralas en una sola evaluación (paso 2).',btn:['Comenzar ahora',function(){try{go('sp1');}catch(e){}}]};
  }
  if(id==='sp1'){
    var c=[['Empresa',!!val('p1e')],['Fecha de evaluación',!!val('p1f')],['Supervisor responsable',!!val('p1s')],['Sector evaluado',!!val('p1sector')]];
    return lista('Completa los 4 datos generales','Con esto el reporte sabrá a qué sector y semana pertenece la evaluación.',c,'La fecha define la <b>semana</b> del reporte de cumplimiento. Usa la fecha real de la evaluación, no la de hoy.');
  }
  if(id==='sp2'){
    var nn=parseInt(val('p2n'),10)||0, ar=val('p2areas');
    var c2=[['Tipo de personal y cantidad de '+t+'s',nn>0],['Área a evaluar',!!ar||nn>0]];
    return lista('¿A quiénes evaluaste?','Indica cuántas '+t+'s evaluaste; en el paso 3 pondrás el nombre y las personas de cada una.',c2,'<b>¿Qué es una '+t+'?</b> '+(t==='ruta'?'El grupo que viaja en el mismo bus y trabaja en la misma cuadrilla.':'El grupo de empleados de una misma área (Packing, Administración…).'));
  }
  if(id==='sp3'){
    var rutas=[];try{rutas=S.rutas||[];}catch(e){}
    var sel=document.querySelectorAll('#p3list select'), tot=sel.length, ok=0;
    sel.forEach(function(s){if(String(s.value||'')!=='')ok++;});
    var items=rutas.map(function(r,i){var nom=val('rn'+i)||(r&&r.nom)||(t.charAt(0).toUpperCase()+t.slice(1)+' '+(i+1));var tt=val('rt'+i)||(r&&r.tot)||'';return [tt?'ok':'', esc(nom)+(tt?' · '+tt+' personas':' · falta cantidad')];});
    var first=-1;items.forEach(function(x,i){if(first<0&&x[0]!=='ok')first=i;});if(first>=0)items[first][0]='now';
    return {h:'Carga las respuestas por '+t,p:'Selecciona el puntaje de cada pregunta por evaluado. Las '+(window.etiNPregs?etiNPregs():36)+' preguntas están en '+(typeof SECS!=='undefined'?SECS.length:6)+' temas; lo que dejes en blanco cuenta como 0.',
      items:items.length?items:[['now','Completa los datos de cada '+t]],prog:tot?Math.round(100*ok/tot):0,nota:tot?ok+' de '+tot+' respuestas · faltan '+(tot-ok):'',
      tip:'<b>Atajo:</b> usa <b>Tab</b> para saltar a la siguiente pregunta. Al terminar pulsa <b>Calcular Resultados</b>.'};
  }
  if(id==='sres'){
    return {h:'Envía el reporte',p:'La evaluación quedó registrada y sincronizada. Revisa los temas con menor puntaje: son los que conviene reforzar en una capacitación.',
      items:[['ok','Evaluación registrada'],['now','Enviar el reporte a coordinación'],['','Programar refuerzo en Capacitaciones ETI']],tip:'<b>Cumplimiento:</b> con este registro tu semana queda al día en el Sistema RR.LL.'};
  }
  if(id==='sdash'){return {h:'Tu dashboard',p:'Aquí ves el ranking y el cumplimiento por grupo. Usa los filtros para comparar sectores o fechas.',items:[['now','Elige sector o periodo'],['','Revisa los temas más bajos'],['','Vuelve a Inicio para registrar']],tip:'Los datos se actualizan solos cuando alguien registra una evaluación.'};}
  if(id==='sadmin'){return {h:'Panel de administración',p:'Programa evaluaciones, revisa el avance de cada supervisor y gestiona usuarios.',items:[['now','Revisa programaciones vencidas'],['','Verifica evaluaciones de la semana'],['','Exporta o envía el consolidado']],tip:'Cada supervisor ve en su Inicio la programación que le asignes aquí.'};}
  return null;
}
function lista(h,p,c,tip){var items=[],ok=0,first=-1;c.forEach(function(x,i){if(x[1])ok++;else if(first<0)first=i;items.push([x[1]?'ok':(first===i?'now':''),x[0]]);});return {h:h,p:p,items:items,prog:Math.round(100*ok/c.length),nota:ok+' de '+c.length+' completados',tip:tip};}

/* ── Mi cumplimiento (supervisor) ── */
function miCumplimiento(){
  try{
    if(!SESSION||SESSION.rol==='admin')return;
    var sm=$('sm'); if(!sm||!sm.classList.contains('active'))return;
    var grid=sm.querySelector('.mgrid'); if(!grid)return;
    var card=$('gMiCumpl');
    if(!card){card=document.createElement('div');card.id='gMiCumpl';card.style.cssText='margin:14px auto 0;max-width:1100px;background:#fff;border:1px solid #D9E0EC;border-left:6px solid #003DA5;border-radius:14px;padding:14px 16px;font-family:Barlow,sans-serif;color:#14213D;box-shadow:0 6px 20px rgba(11,30,69,.08)';grid.parentNode.insertBefore(card,grid.nextSibling);}
    var progs=(typeof getProgs==='function'?getProgs():[]).filter(function(p){return p.sup&&_cumCoincide(p.sup,SESSION.nom)&&Array.isArray(p.fechas)&&p.fechas.length;});
    var evals=(_evalsNube||[]).filter(function(ev){return ev&&ev.fecha&&_cumCoincide(ev.sup||ev.nomUsuario||ev.usuario||'',SESSION.nom);});
    var h=hoy(), fechas=[];
    progs.forEach(function(p){p.fechas.forEach(function(f){fechas.push({f:f,hecha:(p.fechasEjecutadas||[]).indexOf(f)>=0||evals.some(function(ev){return ev.fecha===f;})});});});
    fechas.sort(function(a,b){return a.f.localeCompare(b.f);});
    var ejec=0,venc=0,prox=0;fechas.forEach(function(x){if(x.hecha)ejec++;else if(x.f<h)venc++;else prox++;});
    var pas=ejec+venc, pct=pas?Math.round(100*ejec/pas):(fechas.length?100:0);
    var col=venc>0?'#C8102E':(fechas.length?'#007A3D':'#64748b');
    var etiqueta=venc>0?'🔴 Tienes '+venc+' fecha(s) vencida(s)':(fechas.length?'🟢 Al día con lo programado':'⚪ Sin programación asignada');
    var chips=fechas.slice(-8).map(function(x){var c=x.hecha?['#16a34a','#dcfce7','✓']:(x.f<h?['#dc2626','#fee2e2','✗']:['#64748b','#f1f5f9','•']);return '<span style="background:'+c[1]+';color:'+c[0]+';font-size:11px;font-weight:800;padding:2px 8px;border-radius:999px">'+c[2]+' '+x.f.slice(8,10)+'/'+x.f.slice(5,7)+'</span>';}).join(' ');
    var prox1=fechas.filter(function(x){return !x.hecha&&x.f>=h;})[0];
    card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#C8102E;font-weight:700">Mi cumplimiento</div><div style="font:800 20px \'Barlow Condensed\',Barlow;color:#0B1E45">'+etiqueta+'</div></div><div style="font:800 30px \'Barlow Condensed\';color:'+col+'">'+pct+'%</div></div>'+
      '<div style="height:8px;background:#EAEFF6;border-radius:6px;overflow:hidden;margin:8px 0"><div style="height:100%;width:'+pct+'%;background:'+col+'"></div></div>'+
      '<div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:#5B6B85"><span>✅ Ejecutadas: <b style="color:#14213D">'+ejec+'</b></span><span>❌ Vencidas: <b style="color:#dc2626">'+venc+'</b></span><span>📅 Próximas: <b style="color:#14213D">'+prox+'</b></span><span>📝 Evaluaciones registradas: <b style="color:#14213D">'+evals.length+'</b></span>'+(prox1?'<span>⏰ Siguiente fecha: <b style="color:#003DA5">'+prox1.f.slice(8,10)+'/'+prox1.f.slice(5,7)+'</b></span>':'')+'</div>'+
      (chips?'<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">'+chips+'</div>':'')+
      (venc>0?'<div style="margin-top:8px;font-size:12px;color:#7f1d1d;background:#fee2e2;border-radius:8px;padding:7px 10px">Registra la evaluación pendiente hoy: al guardarla con la fecha programada, la fecha se marca como ejecutada y tu cumplimiento se actualiza solo.</div>':'');
  }catch(e){}
}
/* ── tarjeta ── */
function crear(){
  if($('gDock'))return;
  var d=document.createElement('div');d.id='gDock';
  d.innerHTML='<div class="gh" id="gDockH"><b>¿Qué hago ahora?</b><span id="gDockT">▾</span></div><div class="gb" id="gDockB"></div>';
  document.body.appendChild(d);
  $('gDockH').onclick=function(){d.classList.toggle('min');$('gDockT').textContent=d.classList.contains('min')?'▴':'▾';try{localStorage.setItem('eti_guia_min',d.classList.contains('min')?'1':'0');}catch(e){}};
  try{if(localStorage.getItem('eti_guia_min')==='1'){d.classList.add('min');$('gDockT').textContent='▴';}}catch(e){}
  var f=document.createElement('button');f.id='gFab';f.innerHTML='💬 ¿Necesitas ayuda?';f.onclick=toggleChat;document.body.appendChild(f);
  var c=document.createElement('div');c.id='gChat';c.setAttribute('role','dialog');c.setAttribute('aria-label','Asistente ETI');
  c.innerHTML='<div class="ch"><div class="av">🤖</div><div><b>Asistente ETI</b><small>Guía paso a paso · respuestas del área</small></div><button onclick="window._etiChatMenu()" title="Volver al menú" style="font-size:12px;font-weight:700;margin-left:auto;background:rgba(255,255,255,.15);border-radius:8px;padding:4px 8px">🏠 Menú</button><button onclick="document.getElementById(\'gChat\').classList.remove(\'on\')" aria-label="Cerrar" style="margin-left:6px">✕</button></div><div class="cl" id="gLog"></div><div class="cf">Elige una opción. Si tu duda no está aquí, escribe a Joel Timoteo (960 853 224).</div>';
  document.body.appendChild(c);
  var tr=document.createElement('div');tr.id='gTour';tr.innerHTML='<div class="tb"><div class="te">Bienvenido a la nueva versión</div><h3 id="gTourT"></h3><p id="gTourP"></p><div class="td" id="gTourD"></div><div class="tc"><button class="ts" id="gTourS">Saltar</button><button class="tn" id="gTourN">Siguiente →</button></div></div>';
  document.body.appendChild(tr);$('gTourS').onclick=tourEnd;$('gTourN').onclick=tourNext;
}
function pintar(){
  var d=$('gDock'),f=$('gFab');if(!d)return;
  var id=activa(), logueado=false;try{logueado=!!SESSION;}catch(e){}
  if(!logueado||id==='slogin'||!id){d.classList.remove('on');if(f)f.classList.remove('on');return;}
  if(f)f.classList.add('on');
  try{miCumplimiento();}catch(e){}
  var g=guia();if(!g){d.classList.remove('on');return;}
  d.classList.add('on');
  var h='<h4>'+g.h+'</h4><p>'+g.p+'</p><ul>'+g.items.map(function(x){return '<li class="'+x[0]+'"><i>'+(x[0]==='ok'?'✓':'')+'</i><span>'+x[1]+'</span></li>';}).join('')+'</ul>';
  if(typeof g.prog==='number')h+='<div class="gp"><i style="width:'+g.prog+'%"></i></div><div class="gn">'+(g.nota||'')+'</div>';
  if(g.tip)h+='<div class="gt">'+g.tip+'</div>';
  if(g.btn)h+='<button class="ga" id="gDockA">'+g.btn[0]+'</button>';
  $('gDockB').innerHTML=h;
  if(g.btn){var b=$('gDockA');if(b)b.onclick=g.btn[1];}
}
/* ── asistente guionado ── */
var FLOW={
  inicio:{t:'Hola 👋 Soy el asistente de Evaluaciones ETI. ¿En qué te ayudo?',o:[['¿Cómo inicio una evaluación?','iniciar'],['¿Qué es una ruta o área?','ruta'],['¿Cómo cargo las respuestas?','cargar'],['No me deja entrar','login'],['¿Cómo envío el reporte?','enviar']]},
  iniciar:{t:'En Inicio pulsa <b>Nueva Evaluación</b>. Son 3 pasos: (1) datos generales, (2) cantidad de rutas o áreas, (3) cuestionarios. Tu avance se guarda solo.',o:[['Llévame ahí','go:sp1'],['¿Qué necesito a la mano?','material'],['Volver','inicio']]},
  material:{t:'Los cuestionarios llenados por el personal (o el puntaje por pregunta), la fecha real de la evaluación y el nombre de cada ruta o área.',o:[['Entendido, iniciar','go:sp1'],['Volver','inicio']]},
  ruta:{t:'Una <b>ruta</b> es el grupo de obreros que viaja en el mismo bus y trabaja en la misma cuadrilla. Para empleados se usa el <b>área</b> (Packing, Administración…). Cada una lleva su cantidad de personas evaluadas.',o:[['¿Puedo poner varias?','varias'],['Volver','inicio']]},
  varias:{t:'Sí. En el paso 2 indica cuántas evaluaste el mismo día; en el paso 3 completas cada una. El reporte las compara entre sí.',o:[['Ir al paso 2','go:sp2'],['Volver','inicio']]},
  cargar:{t:'En el paso 3 hay una columna por evaluado y una fila por pregunta: selecciona el puntaje obtenido. Lo que quede en blanco cuenta como 0. Los 6 temas se completan en orden.',o:[['Ir al paso 3','go:sp3'],['¿Y si me equivoco?','error'],['Volver','inicio']]},
  error:{t:'Puedes corregir cualquier puntaje antes de <b>Calcular Resultados</b>. Después de calcular, el administrador puede reabrir la evaluación desde su panel.',o:[['Volver','inicio']]},
  login:{t:'El ingreso es desde el <b>Sistema RR.LL</b>: entra ahí con tu usuario y contraseña, y haz clic en la tarjeta <b>Evaluaciones ETI</b>. Entrarás directo, sin escribir tu clave otra vez.',o:[['Sigue sin entrar','login2'],['Volver','inicio']]},
  login2:{t:'Abre la tarjeta desde el RR.LL en la <b>misma pestaña</b> y entra dentro de 90 segundos. Si persiste, avisa a Joel Timoteo (960 853 224) con tu usuario.',o:[['Volver','inicio']]},
  enviar:{t:'Al terminar el paso 3 pulsa <b>Calcular Resultados</b>. En la pantalla de resultado tienes <b>Enviar Correo</b>, <b>Ver Reporte</b> y <b>Copiar</b>.',o:[['Volver','inicio']]}
};
function toggleChat(){var c=$('gChat');if(!c)return;c.classList.toggle('on');if(c.classList.contains('on')){var log=$('gLog');var libres=log.querySelectorAll('.o button:not(:disabled)').length;if(!log.children.length||!libres)bot('inicio');}}
window._etiChatMenu=function(){var log=$('gLog');if(log){log.innerHTML='';}bot('inicio');};
function bot(k){var f=FLOW[k],log=$('gLog');if(!f||!log)return;var m=document.createElement('div');m.className='m b';m.innerHTML=f.t;log.appendChild(m);var o=document.createElement('div');o.className='o';
  f.o.forEach(function(p){var b=document.createElement('button');b.textContent=p[0];b.onclick=function(){o.querySelectorAll('button').forEach(function(x){x.disabled=true;});b.classList.add('a');var me=document.createElement('div');me.className='m u';me.textContent=p[0];log.appendChild(me);
    if(p[1].indexOf('go:')===0){try{go(p[1].slice(3));}catch(e){}setTimeout(pintar,50);var ok=document.createElement('div');ok.className='m b';ok.innerHTML='Listo, ya estás en esa pantalla ✅ ¿Algo más?';log.appendChild(ok);bot('inicio');}else bot(p[1]);log.scrollTop=log.scrollHeight;};o.appendChild(b);});
  log.appendChild(o);log.scrollTop=log.scrollHeight;
  /* si la respuesta no ofrece volver al menu, se agrega siempre una salida */
  if(k!=='inicio'&&!f.o.some(function(p){return p[1]==='inicio';})){var v=document.createElement('div');v.className='o';var vb=document.createElement('button');vb.textContent='Volver al menú';vb.onclick=function(){bot('inicio');};v.appendChild(vb);log.appendChild(v);}}
/* ── tour ── */
var T=[['Así funciona Evaluaciones ETI','Registrar una evaluación toma 3 pasos guiados. En cada pantalla, la tarjeta “¿Qué hago ahora?” te dice exactamente qué sigue.'],['Tu avance siempre visible','La barra de pasos y el checklist muestran qué completaste y qué falta. Puedes salir y retomar donde quedaste.'],['Ayuda en cualquier momento','El botón 💬 abre el asistente con preguntas frecuentes y te lleva a la pantalla correcta.']],ti=0;
function tourStart(){try{if(!SESSION||activa()==='slogin')return;}catch(e){return;}ti=0;tourPaint();$('gTour').classList.add('on');}
function tourPaint(){$('gTourT').textContent=T[ti][0];$('gTourP').textContent=T[ti][1];$('gTourD').innerHTML=T.map(function(_,i){return '<i class="'+(i===ti?'on':'')+'"></i>';}).join('');$('gTourN').textContent=ti===T.length-1?'Empezar ✓':'Siguiente →';}
function tourNext(){if(ti<T.length-1){ti++;tourPaint();}else tourEnd();}
function tourEnd(){$('gTour').classList.remove('on');try{localStorage.setItem('eti_tour_v1','1');}catch(e){}}
window._etiTour=tourStart;
/* ── enganches ── */
var _goPrev=window.go;
if(typeof _goPrev==='function'){window.go=function(){var r=_goPrev.apply(this,arguments);setTimeout(pintar,30);setTimeout(pintar,400);
  try{if(SESSION&&activa()!=='slogin'&&!localStorage.getItem('eti_tour_v1')){setTimeout(tourStart,900);}}catch(e){}return r;};}
['input','change','click'].forEach(function(ev){document.addEventListener(ev,function(){clearTimeout(window._gT);window._gT=setTimeout(pintar,120);},true);});
function arrancar(){crear();pintar();try{if(SESSION&&activa()!=='slogin'&&!localStorage.getItem('eti_tour_v1'))setTimeout(tourStart,900);}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arrancar);else arrancar();
setInterval(pintar,4000);
console.log('[_GUIA_V1] listo');
})();
