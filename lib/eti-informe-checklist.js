/* ══════════════════════════════════════════════════════════════════════
   eti-informe-checklist.js — _INFORME_CHECKLIST_V1 (19-oct-2026)
   "INFORME DE CAPACITACIONES DE BUENAS PRÁCTICAS SOCIALES" (INF-SC-GH-03)
   Usa el MODELO OFICIAL como plantilla (lib/plantilla-informe-checklist-eti.docx):
   estructura, estilos, encabezado y pie quedan idénticos; solo se reemplazan
   los datos variables. Requiere JSZip (lib/jszip.min.js).
   ══════════════════════════════════════════════════════════════════════ */
(function(root){
'use strict';
const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const xe=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const r2=x=>Math.round(x*100)/100, fmt=x=>String(r2(x));
function semanaISO(iso){const d=new Date(iso+'T12:00:00');const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-y)/864e5+1)/7);}
function fLarga(iso){const p=iso.split('-');return (+p[2]<10?'0':'')+(+p[2])+' de '+MESES[+p[1]-1].toLowerCase()+' del '+p[0];}
function dmy(iso){const p=iso.split('-');return p[2]+'/'+p[1]+'/'+p[0];}
function razon(emp){const e=String(emp||'').toUpperCase();
  if(e.indexOf('RAPEL')>=0) return {head:'SOCIEDAD AGRICOLA RAPEL S.A.C',body:'Sociedad Agricola Rapel S.A.C.'};
  return {head:'SOCIEDAD EXPORTADORA VERFRUT S.A.C',body:'Sociedad Exportadora Verfrut S.A.C.'};}
function rep(xml,map){return xml.replace(/\{\{([A-Z0-9]+)\}\}/g,(m,k)=>k in map?xe(map[k]):m);}
function clonar(xml,tagRe,token,items,fill){   /* repite el bloque (fila/párrafo) que contiene el token */
  const re=new RegExp(tagRe,'g'); let m, blk=null;
  while((m=re.exec(xml))){ if(m[0].indexOf(token)>=0){blk=m;break;} }
  if(!blk) throw new Error('Plantilla: no se encontró '+token);
  return xml.slice(0,blk.index)+items.map(it=>fill(blk[0],it)).join('')+xml.slice(blk.index+blk[0].length);
}
async function etiInformeChecklist(d){
  const JZ=(typeof JSZip!=='undefined')?JSZip:(typeof require==='function'?require('jszip'):null);
  if(!JZ) throw new Error('Librería JSZip no cargada');
  const zip=await JZ.loadAsync(d.plantilla);
  let doc=await zip.file('word/document.xml').async('string'), hdr=await zip.file('word/header1.xml').async('string');
  const R=d.R, T=d.temas, rz=razon(d.emp), v=d.v||{};
  const prom=R.prom*100, ok=prom>=70, fe=d.fechaEval, sem=v.sem||String(semanaISO(fe));
  const tipos=d.tipos||[]; const tipoTxt=tipos.length>1?'OBREROS Y EMPLEADOS':(tipos[0]==='empleado'?'EMPLEADOS':'OBREROS');
  const pad2=x=>x===''||x==null?'':String(x).padStart(2,'0');
  /* filas del semáforo (una por tema, mismo formato de la plantilla) */
  doc=clonar(doc,'<w:tr[ >][\\s\\S]*?</w:tr>','{{SN}}',T,(row,s)=>{const peso=r2(s.peso*100), val=r2(s.prom*s.peso*100), lim=r2(peso*0.7);
    return rep(row,{SN:'DE '+s.nom.toUpperCase(),SV:fmt(val),SR:'0 - '+r2(lim-0.01)+'%',SG:lim+' - '+peso+'%',SP:peso+'%',SFILL:val>=lim?'1F9D44':'E00000'});});
  /* viñetas de conclusiones */
  doc=clonar(doc,'<w:p[ >][\\s\\S]*?</w:p>','{{BN}}',T,(p,s)=>rep(p,{BN:s.nom,BV:fmt(s.prom*s.peso*100)}));
  const map={
    EMPRESA:rz.body, REPORTADO:v.reportado||'Luis Eduardo Coveñas Chero – Subgerente de personas', MES:MESES[+fe.slice(5,7)-1],
    FINF:dmy(d.fechaInforme), SEMINF:sem, FLARGA:fLarga(fe), SEM:sem, DUR:v.dur||'',
    SECTORTIPO:(String(d.sector||'').toUpperCase()+' - '+tipoTxt), RESP:v.resp||d.nom, N:String(R.n), H:pad2(v.h), M:pad2(v.m),
    GV:prom.toFixed(2)+'%', GFILL:ok?'1F9D44':'E00000', PROM:prom.toFixed(2),
    CONC1:ok?' alcanzando un resultado favorable dentro de los parámetros establecidos. Asimismo, se evidenció una buena participación y disposición por parte de los colaboradores durante el desarrollo de la evaluación.'
            :' sin alcanzar el resultado mínimo establecido (70 %), por lo que se requiere reforzamiento. Asimismo, se evidenció la participación de los colaboradores durante el desarrollo de la evaluación.',
    CONC2:ok?'En conclusión, la evaluación refleja un nivel satisfactorio de comprensión de los temas desarrollados durante la capacitación, identificándose una adecuada asimilación de los conocimientos impartidos por parte de los colaboradores evaluados.'
            :'En conclusión, la evaluación refleja la necesidad de reforzar los temas desarrollados durante la capacitación, por lo que se programarán acciones de reforzamiento y seguimiento con los colaboradores evaluados.',
    FIRMA:v.firma||d.nom, SECTORFIRMA:d.sector||''
  };
  doc=rep(doc,map); hdr=rep(hdr,{RAZON:rz.head});
  if(/\{\{[A-Z0-9]+\}\}/.test(doc+hdr)) throw new Error('Plantilla: quedaron campos sin llenar');
  zip.file('word/document.xml',doc); zip.file('word/header1.xml',hdr);
  const opt={type:(typeof window!=='undefined'&&typeof Blob!=='undefined')?'blob':'nodebuffer',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',compression:'DEFLATE'};
  return zip.generateAsync(opt);
}
etiInformeChecklist.semanaISO=semanaISO;
if(typeof module!=='undefined'&&module.exports) module.exports=etiInformeChecklist; else root.etiInformeChecklist=etiInformeChecklist;
})(typeof window!=='undefined'?window:globalThis);
