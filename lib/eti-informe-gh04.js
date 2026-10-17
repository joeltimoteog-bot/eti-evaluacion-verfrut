/* ══════════════════════════════════════════════════════════════════════
   eti-informe-gh04.js — _INFORME_WORD_V2 (16-oct-2026)
   Genera el "INFORME DE CAPACITACIONES DE ACTUALIZACIÓN Y DESARROLLO"
   (INF-SC-GH-04, Sustentabilidad y Certificaciones) en Word (.docx real)
   a partir de los datos de una Evaluación ETI. Estructura y textos fijos
   del modelo oficial: NO alterar. Requiere lib/docx.iife.js (global docx).
   Uso: etiInformeGH04(datos) → Promise<Blob> (navegador) / Buffer (Node)
   ══════════════════════════════════════════════════════════════════════ */
(function(root){
'use strict';
function build(D, datos){
  const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle,ShadingType,VerticalAlign,Header,Footer,ImageRun,PageBreak,HeightRule}=D;
  const d=datos, r1=x=>Math.round(x*10)/10, r2=x=>Math.round(x*100)/100, pct0=x=>Math.round(x*100);
  const FONT='Arial', SZ=22; /* 11pt */
  const noB={style:BorderStyle.NONE,size:0,color:'FFFFFF'}, NB={top:noB,bottom:noB,left:noB,right:noB};
  const B1=s=>({style:BorderStyle.SINGLE,size:s||6,color:'000000'}), BB=s=>({top:B1(s),bottom:B1(s),left:B1(s),right:B1(s)});
  const BG=s=>({style:BorderStyle.SINGLE,size:6,color:'8A8A8A'}), BBG={top:BG(),bottom:BG(),left:BG(),right:BG()};
  const run=(t,o)=>new TextRun(Object.assign({text:String(t==null?'':t),font:FONT,size:SZ},o||{}));
  const P=(t,o)=>new Paragraph(Object.assign({children:Array.isArray(t)?t:[run(t)],spacing:{after:100}},o||{}));
  const H=t=>new Paragraph({children:[run(t,{bold:true})],spacing:{before:220,after:80}});
  const J=(t,o)=>P(t,Object.assign({alignment:AlignmentType.JUSTIFIED},o||{}));
  const li=t=>new Paragraph({children:[run(t)],bullet:{level:0},spacing:{after:40}});
  const num=(t,ref)=>new Paragraph({children:[run(t)],numbering:{reference:ref,level:0},spacing:{after:40}});
  const pb=()=>new Paragraph({children:[new PageBreak()]});
  const cell=(children,o)=>new TableCell(Object.assign({children:Array.isArray(children)?children:[children],verticalAlign:VerticalAlign.CENTER,margins:{top:40,bottom:40,left:90,right:90}},o||{}));
  const tc=(t,o,po)=>cell(P(Array.isArray(t)?t:[run(t,o&&o.r)],Object.assign({spacing:{after:0}},po||{})),o);
  const tcc=(t,o)=>tc(t,o,{alignment:AlignmentType.CENTER});
  const shade=f=>({fill:f,type:ShadingType.CLEAR,color:'auto'});

  /* ── Encabezado (idéntico al modelo) ── */
  const logo=d.logoBytes?new ImageRun({type:'png',data:d.logoBytes,transformation:{width:64,height:80}}):run('');
  const hdr=new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[
    new TableRow({children:[
      cell(new Paragraph({children:[logo],alignment:AlignmentType.CENTER}),{rowSpan:3,width:{size:1900,type:WidthType.DXA},borders:BB()}),
      tcc('Sociedad Exportadora Verfrut S.A.C.',{r:{bold:true,size:21},borders:BB()}),
      tcc('INF-SC-GH-04',{r:{bold:true,size:21},width:{size:2300,type:WidthType.DXA},borders:BB()})]}),
    new TableRow({children:[
      tcc('INFORME DE CAPACITACIONES DE ACTUALIZACIÓN Y DESARROLLO',{r:{bold:true,size:25},rowSpan:2,borders:BB()}),
      tcc('Versión N.º 0.0',{r:{bold:true,size:21},borders:BB()})]}),
    new TableRow({children:[
      cell([P([run('Última revisión:',{bold:true,size:20})],{alignment:AlignmentType.CENTER,spacing:{after:0}}),P([run('24/03/2026',{size:20})],{alignment:AlignmentType.CENTER,spacing:{after:0}})],{borders:BB()})]})
  ]});
  const foot=new Paragraph({children:[run('El contenido de este documento es propiedad exclusiva de Unifrutti. Su reproducción o copia total y/o parcial requiere una solicitud escrita y expresa al departamento de Sustentabilidad y Certificaciones, en cumplimiento con el sistema de gestión de la empresa y su control de documentos.',{size:15,color:'333333'})],alignment:AlignmentType.JUSTIFIED,border:{top:{style:BorderStyle.SINGLE,size:4,color:'999999',space:4}}});

  /* ── Datos derivados ── */
  const T=d.temas, G=d.grupos, R=d.R;
  const tipoObr=G.some(g=>g.tipo!=='empleado'), tipoEmp=G.some(g=>g.tipo==='empleado');
  const pgF=pct0(R.prom), aprP=R.n?Math.round(R.apr/R.n*100):0, cumple=aprP>=80;
  const v=d.v||{}, prog=+v.prog||R.n, asis=R.n, asisP=prog?r1(asis/prog*100):100;
  const h=+v.h||0, m=+v.m||0, hp=asis?Math.round(h/asis*100):0, mp=asis?Math.round(m/asis*100):0;
  const ini=(v.ini!==''&&v.ini!=null&&!isNaN(+v.ini))?Math.round(+v.ini):null, inc=ini!=null?pgF-ini:null;
  const Ts=T.slice().sort((a,b)=>a.prom-b.prom), bajos=Ts.filter(t=>t.prom<0.9).slice(0,2).map(t=>t.nom+' ('+pct0(t.prom)+' %)');
  const refTxt=bajos.length?bajos.join(' y '):(Ts[0]?Ts[0].nom+' ('+pct0(Ts[0].prom)+' %)':'—');
  const fechaCap=d.fechas.join(' y '), temasTxt=T.map(t=>t.nom.toLowerCase()).join(', ');
  const palRuta=tipoEmp&&!tipoObr?'área':'ruta';

  /* ── Tablas auxiliares ── */
  const kv=rows=>new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:NB,rows:rows.map(([k,val])=>new TableRow({children:[
    tc(k,{r:{bold:true},width:{size:3400,type:WidthType.DXA},borders:NB}), tc(val,{borders:NB})]}))});
  const t2=(head,rows)=>new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[
    new TableRow({tableHeader:true,children:head.map((x,i)=>i?tcc(x,{r:{bold:true},borders:BB()}):tc(x,{r:{bold:true},borders:BB()}))}),
    ...rows.map(r=>new TableRow({cantSplit:true,children:r.map((x,i)=>i?tcc(x,{borders:BB()}):tc(x,{borders:BB()}))}))]});
  const VF='1F9D44',VC='D6F5DF',RF='E00000',RC='FFD9D9',GH='D9D9D9',GF='F2F2F2',GG='C9C9C9',AM='FFFF00';
  const proms=T.map(s=>({nom:'DE '+s.nom.toUpperCase(),peso:r2(s.peso*100),val:r2(s.prom*s.peso*100)}));
  const sTh=(t,fill,col,o)=>tcc(t,Object.assign({r:{bold:true,size:17,color:col||'000000'},shading:shade(fill),borders:BBG},o||{}));
  const sTd=(t,fill,col,bold,left)=>(left?tc:tcc)(t,{r:{size:17,bold:!!bold,color:col||'000000'},shading:fill?shade(fill):undefined,borders:BBG});
  const sem1=new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[
    new TableRow({tableHeader:true,children:[sTh('SECCIÓN',GH),sTh('RESULTADO',GH),sTh('ROJO',RF,'FFFFFF'),sTh('VERDE',VF,'FFFFFF'),sTh('%R',AM)]}),
    ...proms.map(s=>{const lim=r2(s.peso*0.7),ok=s.val>=lim;return new TableRow({children:[sTd(s.nom,GF,null,true,true),sTd(s.val,ok?VF:RF,'FFFFFF',true),sTd('0 - '+r2(lim-0.01)+'%'),sTd(lim+' - '+s.peso+'%'),sTd(s.peso+'%',null,null,true)]});}),
    new TableRow({children:[sTd('GENERAL DEL GRUPO',GG,null,true,true),sTd(r1(R.prom*100)+'%',R.prom>=0.7?VF:RF,'FFFFFF',true),sTd('0 - 69.9%',GG,null,true),sTd('70 - 100%',GG,null,true),sTd('100%',GG,null,true)]})]});
  const wR=[2300,650,650,...T.map(()=>Math.floor(4700/Math.max(1,T.length))),1100];
  const sem2=new Table({width:{size:100,type:WidthType.PERCENTAGE},columnWidths:wR,rows:[
    new TableRow({tableHeader:true,children:[sTh(tipoObr&&!tipoEmp?'RUTA':tipoEmp&&!tipoObr?'ÁREA':'RUTA / ÁREA',GH),sTh('COD',GH),sTh('EVAL.',GH),...proms.map(s=>sTh(s.nom,GH,null,{r:{bold:true,size:13}})),sTh('RESULTADO',GH)]}),
    ...G.map(g=>new TableRow({children:[sTd(g.ruta,null,null,true,true),sTd(g.cod||'—'),sTd(g.n),...T.map(s=>{const x=(g.temas||[]).find(y=>y.nom===s.nom);const val=x?r1(x.prom*s.peso*100):0,ok=val>=r2(s.peso*100*0.7);return sTd(x?val:'—',ok?VC:RC,ok?'1A8040':'CC0000',true);}),sTd(r1(g.prom*100)+'%',g.prom>=0.7?VC:RC,g.prom>=0.7?'1A8040':'CC0000',true)]})),
    new TableRow({children:[sTd('GENERAL DEL GRUPO',GG,null,true),sTd('',GG),sTd(R.n,GG,null,true),...proms.map(s=>sTd(r1(s.val),s.val>=r2(s.peso*0.7)?VF:RF,'FFFFFF',true)),sTd(r1(R.prom*100)+'%',R.prom>=0.7?VF:RF,'FFFFFF',true)]})]});
  const foto=(txt,alto)=>new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[new TableRow({height:{value:alto||2400,rule:HeightRule.ATLEAST},children:[cell(P([run(txt,{color:'777777',size:19})],{alignment:AlignmentType.CENTER}),{borders:{top:{style:BorderStyle.DASHED,size:6,color:'999999'},bottom:{style:BorderStyle.DASHED,size:6,color:'999999'},left:{style:BorderStyle.DASHED,size:6,color:'999999'},right:{style:BorderStyle.DASHED,size:6,color:'999999'}}})]})]});

  /* ── Cuerpo (textos fijos del modelo) ── */
  const body=[
    H('1. GENERALIDADES:'),
    kv([['Tema:','Capacitación y Evaluación de Conocimiento ETI – Buenas Prácticas Sociales y Laborales'],['Fecha de informe:',d.fechaInforme],['Área de alcance:','Producción – Sector '+d.sector]]),
    P(''),
    kv([['Entidad formadora:','Gestión Humana – Relaciones Laborales'],['Expositor:',d.nom],['Fecha de capacitación:',fechaCap],['Duración:',v.dur||''],['Modalidad:','Presencial'],['Lugar:',v.lugar||'']]),
    H('2. OBJETIVO:'),
    J('Fortalecer los conocimientos y competencias de los trabajadores involucrados en las actividades de campo del sector '+d.sector+' respecto de las Buenas Prácticas Sociales y Laborales de la Iniciativa de Comercio Ético (ETI): '+temasTxt+', promoviendo prácticas seguras que permitan prevenir accidentes, conflictos laborales, contaminación ambiental y riesgos para la inocuidad de los productos agrícolas. Asimismo, se busca asegurar que los trabajadores conozcan y apliquen los procedimientos internos establecidos para el cumplimiento de las Buenas Prácticas Sociales y Laborales.'),
    H('3. ALCANCE:'),
    J('La capacitación estuvo dirigida al personal que participa directa o indirectamente en las actividades relacionadas con la producción agrícola del sector '+d.sector+', incluyendo:'),
    ...G.map(g=>li((g.tipo==='empleado'?'Empleado':'Obrero de campo')+' – '+(g.tipo==='empleado'?'Área':'Ruta')+' '+g.ruta+(g.cod?' (cód. '+g.cod+')':''))),
    P('La capacitación se realizó en '+(G.length===1?'un solo grupo':G.length+' grupos (uno por '+palRuta+')')+'.'),
    t2(['Asistencia','Total'],[[[run('Participantes programados',{bold:true})],String(prog)],[[run('Participantes asistentes',{bold:true})],String(asis)],[[run('Porcentaje de asistencia',{bold:true})],asisP+'%']]),
    P(''),
    t2(['Total de asistentes','Hombres','Mujeres'],[[String(asis),h?String(h):'',m?String(m):''],[[run('Porcentaje',{bold:true})],[run((h||m)?hp+'%':'',{bold:true})],[run((h||m)?mp+'%':'',{bold:true})]]]),
    P('El registro de asistencia se anexa a este informe.'),
    H('4. CONTENIDO DESARROLLADO:'),
    P('Durante la capacitación se desarrollaron los siguientes temas:'),
    ...T.map(t=>li(t.nom)),
    P('Se anexa a este informe el material que se proyecta y/o entrega a los participantes.'),
    P('Se anexa, además, las competencias del expositor.'),
    H('5. METODOLOGÍA:'),
    P('La capacitación se desarrolló mediante una metodología teórico-práctica, utilizando:'),
    ...['Prueba de conocimiento inicial (verbal)','Exposición del contenido.','Presentación audiovisual.','Explicación de casos prácticos.','Demostración de los canales de atención y buenas prácticas.','Identificación de situaciones de riesgo social y laboral en el trabajo.','Preguntas y respuestas.','Evaluación de conocimientos (se adjunta a este informe).'].map(li),
    J('Para reforzar el aprendizaje, se utilizaron ejemplos relacionados con las actividades que realizan los trabajadores durante la realización de sus funciones.'),
    H('6. EVALUACIÓN DE LA CAPACITACIÓN:'),
    J('La evaluación se realizó mediante una prueba de conocimientos aplicada al finalizar la capacitación. Con los trabajadores que tienen complicaciones para la lectura, se da soporte en la pruebas de conocimientos.'),
    t2(['Indicador','Resultado'],[['Trabajadores capacitados',String(asis)],['Trabajadores evaluados',String(R.n)],['Porcentaje de trabajadores evaluados','100 %'],['Promedio evaluación inicial',ini!=null?ini+' %':'—'],['Promedio evaluación final',pgF+' %'],['Trabajadores que alcanzaron ≥70 %',String(R.apr)],[[run('Porcentaje de aprobación',{bold:true})],[run(aprP+' %',{bold:true})]]]),
    P([run('*',{bold:true}),run('Fórmula: (trabajadores que alcanzaron ≥70 % / trabajadores evaluados) * 100 = %')]),
    J([run('Criterio de eficacia: ',{bold:true}),run('Se establece como criterio de eficacia que al menos el 80 % de los participantes obtenga una calificación igual o superior al 70 % en la evaluación final. En esta capacitación, el '+aprP+' % de los trabajadores aprobaron. '),run('Resultado: ',{bold:true}),run(cumple?'Cumplido.':'No cumplido.')]),
    H('7. MEDICIÓN DE LA EFICACIA:'),
    P('Se compara el conocimiento antes y después de la capacitación.'),
    P([run('Resultado:',{bold:true})]),
    li('Evaluación inicial: '+(ini!=null?ini+' %':'—')), li('Evaluación final: '+pgF+' %'), li('Incremento promedio: '+(inc!=null?inc+' puntos porcentuales.':'—')),
    H('8. RESULTADOS:'),
    P('Como resultado de la capacitación se identificó lo siguiente:'),
    num('El '+asisP+' % del personal convocado participó en la capacitación.','res'),
    num('El 100 % de los participantes realizó la evaluación de conocimientos.','res'),
    num(ini!=null?'Se evidenció un incremento del nivel de conocimiento entre la evaluación inicial y final.':'La evaluación final evidenció el nivel de conocimiento alcanzado por los participantes.','res'),
    num('El '+aprP+' % de los participantes alcanzó el criterio mínimo de aprobación.','res'),
    num('Se identificaron oportunidades de refuerzo relacionadas principalmente con '+refTxt+'.','res'),
    num('La verificación posterior permitió evidenciar una adecuada aplicación de los conocimientos adquiridos en las actividades habituales.','res'),
    H('9. CONCLUSIONES:'),
    li('La capacitación sobre Buenas Prácticas Sociales y Laborales ETI permitió fortalecer los conocimientos del personal respecto de '+temasTxt+' y las medidas preventivas aplicables durante el desarrollo de sus labores en campo.'),
    li('Los resultados de la evaluación de conocimientos evidenciaron un nivel '+(pgF>=70?'satisfactorio':'por debajo de lo esperado')+' de aprendizaje y aplicación de las prácticas impartidas.'),
    li('No obstante, se identificaron oportunidades de mejora relacionadas principalmente con '+refTxt+', por lo que se enseñaron acciones de refuerzo y seguimiento.'),
    li('En función de los resultados obtenidos, se considera que la capacitación '+(cumple?'cumplió':'no cumplió')+' con el criterio de eficacia establecido.'),
    H('10. ANEXOS:'),
    P('Se anexa a este informe:'),
    ...['Evaluaciones: inicial y/o final.','Infografía de resultados.','Registro de asistencia.','Material utilizado en la capacitación.','Certificados.','Competencias del expositor.'].map(t=>num(t,'anx')),
    H('11. EVIDENCIA FOTOGRÁFICA:'),
    P('Ejemplo de evaluación que se anexa:'),
    foto('[ Inserte aquí la foto de la hoja de evaluación / hoja de respuestas QR ]',2600),
    P(''),
    P('Grupo participante:'),
    foto('[ Inserte aquí la foto del grupo participante ]',3600),
    P(''),
    P('Es todo en cuanto tengo que informar.'),
    P(''),P(''),P(''),
    P([run(v.firma||d.nom,{bold:true})],{spacing:{after:0}}),
    P(v.cargo||'Supervisor de Gestión Humana'),
    pb(),
    new Paragraph({children:[run('ANEXO 2 – INFOGRAFÍA DE RESULTADOS',{bold:true})],alignment:AlignmentType.CENTER,spacing:{after:160}}),
    new Paragraph({children:[run('Resultado por tema (puntos ponderados)',{bold:true})],alignment:AlignmentType.CENTER,spacing:{after:80}}),
    sem1, P(''),
    new Paragraph({children:[run('Resultado por '+palRuta+' (puntos ponderados sobre 100)',{bold:true})],alignment:AlignmentType.CENTER,spacing:{after:80}}),
    sem2,
    P([run('Criterio: VERDE = resultado ≥ 70 % del peso de la sección (%R) · ROJO = menor al 70 % · Valores en puntos ponderados sobre 100.',{size:17,color:'444444'})])
  ];

  return new Document({
    creator:'Sistema ETI – Evaluaciones', title:'INF-SC-GH-04 · '+d.sector+' · '+(d.fechas[0]||''),
    styles:{default:{document:{run:{font:FONT,size:SZ}}}},
    numbering:{config:[{reference:'res',levels:[{level:0,format:'decimal',text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]},{reference:'anx',levels:[{level:0,format:'decimal',text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]}]},
    sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1700,right:1134,bottom:1250,left:1134,header:400,footer:420}}},
      headers:{default:new Header({children:[hdr,new Paragraph({children:[run('',{size:8})],spacing:{after:0}})]})},
      footers:{default:new Footer({children:[foot]})},
      children:body}]
  });
}
function b64bytes(b64){if(!b64)return null;try{if(typeof Buffer!=='undefined')return Buffer.from(b64,'base64');const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}catch(e){return null;}}
async function etiInformeGH04(datos){
  const D=(typeof docx!=='undefined')?docx:(typeof require==='function'?require('docx'):null);
  if(!D) throw new Error('Librería docx no cargada');
  const doc=build(D,Object.assign({},datos,{logoBytes:datos.logoBytes||b64bytes(datos.logoBase64)}));
  if(typeof Blob!=='undefined'&&typeof window!=='undefined') return D.Packer.toBlob(doc);
  return D.Packer.toBuffer(doc);
}
if(typeof module!=='undefined'&&module.exports) module.exports=etiInformeGH04; else root.etiInformeGH04=etiInformeGH04;
})(typeof window!=='undefined'?window:globalThis);
