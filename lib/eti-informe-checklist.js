/* ══════════════════════════════════════════════════════════════════════
   eti-informe-checklist.js — _INFORME_CHECKLIST_V2 (19-oct-2026) · V3 (05-nov): fotos en la seccion IV
   "INFORME DE CAPACITACIONES DE BUENAS PRÁCTICAS SOCIALES" (INF-SC-GH-03)
   Formato actualizado (CAP-SC-10). Usa el MODELO OFICIAL como plantilla
   (lib/plantilla-informe-checklist-eti.docx): estructura, estilos, encabezado
   y pie idénticos; solo se reemplazan los datos variables. Requiere JSZip.
   ══════════════════════════════════════════════════════════════════════ */
(function(root){
'use strict';
const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const xe=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const r2=x=>Math.round(x*100)/100, fmt=x=>String(r2(x)), p2=n=>String(n).padStart(2,'0');
const VERDE='00B050', ROJO='FF0000';
function semanaISO(iso){const d=new Date(iso+'T12:00:00');const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-y)/864e5+1)/7);}
const P=iso=>{const p=iso.split('-');return {d:p2(+p[2]),m:+p[1],y:p[0]};};
function fLarga(fechas){   /* "07 de octubre del 2026" · "03 al 06 de enero del 2026" · "28 de octubre al 02 de noviembre del 2026" */
  const f=fechas.slice().sort(), a=P(f[0]), b=P(f[f.length-1]), mes=x=>MESES[x.m-1].toLowerCase();
  if(f.length===1||f[0]===f[f.length-1]) return a.d+' de '+mes(a)+' del '+a.y;
  if(a.m===b.m&&a.y===b.y) return a.d+' al '+b.d+' de '+mes(b)+' del '+b.y;
  if(a.y===b.y) return a.d+' de '+mes(a)+' al '+b.d+' de '+mes(b)+' del '+b.y;
  return a.d+' de '+mes(a)+' del '+a.y+' al '+b.d+' de '+mes(b)+' del '+b.y;
}
function dmy(iso){const p=iso.split('-');return p[2]+'/'+p[1]+'/'+p[0];}
function razon(emp){const e=String(emp||'').toUpperCase();
  if(e.indexOf('RAPEL')>=0) return {head:'SOCIEDAD AGRICOLA RAPEL S.A.C',body:'Sociedad Agricola Rapel S.A.C.'};
  return {head:'SOCIEDAD EXPORTADORA VERFRUT S.A.C',body:'Sociedad Exportadora Verfrut S.A.C.'};}
function rep(xml,map){return xml.replace(/\{\{([A-Z0-9]+)\}\}/g,(m,k)=>k in map?xe(map[k]):m);}
function clonar(xml,tagRe,token,items,fill){
  const re=new RegExp(tagRe,'g'); let m, blk=null;
  while((m=re.exec(xml))){ if(m[0].indexOf(token)>=0){blk=m;break;} }
  if(!blk) throw new Error('Plantilla: no se encontró '+token);
  return xml.slice(0,blk.index)+items.map(it=>fill(blk[0],it)).join('')+xml.slice(blk.index+blk[0].length);
}
function conclusionAuto(R,T){
  const prom=(R.prom*100).toFixed(2), ok=R.prom>=0.7, bajos=T.filter(s=>s.prom<0.7).map(s=>s.nom);
  return 'Como resultado de la evaluación, el grupo obtuvo un promedio general de '+prom+' %, '+(ok?'alcanzando un resultado favorable dentro de los parámetros establecidos':'sin alcanzar el resultado mínimo establecido (70 %), por lo que se requiere reforzamiento')+'.'+
    (bajos.length?' Se recomienda reforzar: '+bajos.join(', ')+'.':' Todas las secciones alcanzaron el nivel esperado.');
}
/* _INFORME_FOTOS_V1 (05-nov-2026): IV. EVIDENCIA FOTOGRAFICA con las fotos ya colocadas.
   d.fotos = [{bytes:Uint8Array|ArrayBuffer, w, h}] (JPEG, 0 a 6). Con 5 o 6 fotos se agrega una fila
   igual a las de la plantilla (Foto 5, Foto 6). Sin fotos el informe sale igual que antes. */
const EMU=360000, FMAXW=7.3*EMU, FMAXH=7.6*EMU;
function dibujo(rid,k,w,h){
  let cx=FMAXW, cy=Math.round(FMAXW*h/w); if(cy>FMAXH){cy=FMAXH;cx=Math.round(FMAXH*w/h);} cx=Math.round(cx);
  return '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="'+cx+'" cy="'+cy+'"/><wp:effectExtent l="0" t="0" r="0" b="0"/>'+
    '<wp:docPr id="'+(9100+k)+'" name="Foto '+k+'"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>'+
    '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'+
    '<pic:nvPicPr><pic:cNvPr id="'+(9100+k)+'" name="foto_'+k+'.jpeg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="'+rid+'"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'+
    '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx+'" cy="'+cy+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
}
async function ponerFotos(zip,doc,fotos){
  fotos=(fotos||[]).filter(f=>f&&f.bytes).slice(0,6); if(!fotos.length) return doc;
  const i0=doc.indexOf('>Foto 1<'); if(i0<0) throw new Error('Plantilla: no se encontró la tabla de fotos');
  const t0=doc.lastIndexOf('<w:tbl>',i0), t1=doc.indexOf('</w:tbl>',i0)+8; let tbl=doc.slice(t0,t1);
  if(fotos.length>4){   /* fila extra (Foto 5 / Foto 6) copiada de la ultima fila de la plantilla */
    const r0=tbl.lastIndexOf('<w:tr '), r1=tbl.lastIndexOf('</w:tr>')+7; const fila=tbl.slice(r0,r1).replace('>Foto 3<','>Foto 5<').replace('>Foto 4<','>Foto 6<').replace(/w14:paraId="[0-9A-F]+"/g,'');
    tbl=tbl.slice(0,r1)+fila+tbl.slice(r1);
  }
  let rels=await zip.file('word/_rels/document.xml.rels').async('string'), ct=await zip.file('[Content_Types].xml').async('string');
  if(ct.indexOf('Extension="jpeg"')<0) ct=ct.replace('<Default Extension="rels"','<Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="rels"');
  fotos.forEach((f,i)=>{const k=i+1, rid='rIdFotoEti'+k, nom='media/foto_eti_'+k+'.jpeg';
    zip.file('word/'+nom,f.bytes);
    rels=rels.replace('</Relationships>','<Relationship Id="'+rid+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="'+nom+'"/></Relationships>');
    const marca='>Foto '+k+'<', p=tbl.indexOf(marca); if(p<0) throw new Error('Plantilla: no se encontró Foto '+k);
    const fin=tbl.indexOf('</w:p>',p)+6; tbl=tbl.slice(0,fin)+dibujo(rid,k,f.w||4,f.h||3)+tbl.slice(fin);
  });
  zip.file('word/_rels/document.xml.rels',rels); zip.file('[Content_Types].xml',ct);
  doc=doc.slice(0,t0)+tbl+doc.slice(t1);
  if(fotos.length>4){   /* con la fila extra, los renglones vacios del final del modelo pasaban a una hoja en blanco */
    const s0=doc.lastIndexOf('<w:sectPr'), f0=doc.lastIndexOf('Supervisor de Gesti');
    if(s0>0&&f0>0&&f0<s0){ const a0=doc.indexOf('</w:p>',f0)+6; const vacios=doc.slice(a0,s0).match(/<w:p[ >][\s\S]*?<\/w:p>/g)||[];
      if(vacios.length&&vacios.every(p=>!/<w:r[ >]/.test(p))) doc=doc.slice(0,a0)+vacios[vacios.length-1]+doc.slice(s0); }
  }
  return doc;
}
async function etiInformeChecklist(d){
  const JZ=(typeof JSZip!=='undefined')?JSZip:(typeof require==='function'?require('jszip'):null);
  if(!JZ) throw new Error('Librería JSZip no cargada');
  const zip=await JZ.loadAsync(d.plantilla);
  let doc=await zip.file('word/document.xml').async('string'), hdr=await zip.file('word/header1.xml').async('string');
  const R=d.R, T=d.temas, rz=razon(d.emp), v=d.v||{};
  const fechas=(Array.isArray(d.fechasEval)?d.fechasEval:[d.fechaEval]).filter(Boolean).sort();
  const prom=R.prom*100, ok=prom>=70, sem=v.sem?p2(v.sem):p2(semanaISO(fechas[fechas.length-1]));
  const tipos=d.tipos||[]; const tipoTxt=tipos.length>1?'OBREROS / EMPLEADOS':(tipos[0]==='empleado'?'EMPLEADOS':'OBREROS');
  const pad2=x=>x===''||x==null?'':p2(x);
  doc=clonar(doc,'<w:tr[ >][\\s\\S]*?</w:tr>','{{SN}}',T,(row,s)=>{const peso=r2(s.peso*100), val=r2(s.prom*s.peso*100), lim=r2(peso*0.7);
    return rep(row,{SN:'DE '+s.nom.toUpperCase(),SV:fmt(val),SR:'0 - '+r2(lim-0.01)+'%',SG:lim+' - '+peso+'%',SP:peso+'%',SFILL:val>=lim?VERDE:ROJO});});
  const map={
    EMPRESA:rz.body, REPORTADO:v.reportado||'Luis Eduardo Coveñas Chero – Subgerente de personas', MES:MESES[+fechas[fechas.length-1].slice(5,7)-1].toUpperCase(),
    FINF:dmy(d.fechaInforme), SEMINF:sem, FLARGA:fLarga(fechas), SEM:sem, DUR:v.dur||'',
    SECT:String(d.sector||'').toUpperCase(), TIPOTXT:tipoTxt, RESP:v.resp||d.nom, N:String(R.n), H:pad2(v.h), M:pad2(v.m),
    GV:prom.toFixed(2)+'%', GFILL:ok?VERDE:ROJO, CONC:(v.conc&&String(v.conc).trim())||conclusionAuto(R,T),
    FIRMA:v.firma||d.nom, SECTORFIRMA:d.sector||''
  };
  doc=rep(doc,map); hdr=rep(hdr,{RAZON:rz.head});
  doc=await ponerFotos(zip,doc,d.fotos);   /* _INFORME_FOTOS_V1 */
  if(/\{\{[A-Z0-9]+\}\}/.test(doc+hdr)) throw new Error('Plantilla: quedaron campos sin llenar');
  zip.file('word/document.xml',doc); zip.file('word/header1.xml',hdr);
  const opt={type:(typeof window!=='undefined'&&typeof Blob!=='undefined')?'blob':'nodebuffer',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',compression:'DEFLATE'};
  return zip.generateAsync(opt);
}
etiInformeChecklist.semanaISO=semanaISO; etiInformeChecklist.conclusionAuto=conclusionAuto; etiInformeChecklist.version=3;
if(typeof module!=='undefined'&&module.exports) module.exports=etiInformeChecklist; else root.etiInformeChecklist=etiInformeChecklist;
})(typeof window!=='undefined'?window:globalThis);
