/* ══════════════════════════════════════════════════════════════════════
   eti-informe-ciclo.js — _INFORME_CICLO_V1 (06-nov-2026)
   Informe de CIERRE DE CICLO ETI en Word (.docx), con lib/docx.iife.js (global docx).
     modo 'sector'  : informe del sector que envia cada supervisor (con el detalle de los checklist)
     modo 'general' : informe general del ciclo (todas las empresas/sectores) con la decision final
   Contenido: capacitaciones (alcance por ruta, por dia, temas), evaluacion checklist (% por tema y
   por ruta, aprueba o no), reforzamientos, encuesta de satisfaccion, conclusiones, firmas y anexo.
   Uso: etiInformeCiclo(datos) -> Promise<Blob>
   ══════════════════════════════════════════════════════════════════════ */
(function (root) {
'use strict';
function build(D, d) {
  const { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ShadingType, VerticalAlign, Header, Footer, ImageRun, PageNumber } = D;
  const FONT = 'Arial', SZ = 20, MIN = 0.70, VIG = 0.80;
  const pc = x => x == null ? '—' : (Math.round(x * 1000) / 10) + ' %';
  const run = (t, o) => new TextRun(Object.assign({ text: String(t == null ? '' : t), font: FONT, size: SZ }, o || {}));
  const P = (t, o) => new Paragraph(Object.assign({ children: Array.isArray(t) ? t : [run(t)], spacing: { after: 90 } }, o || {}));
  const J = (t, o) => P(t, Object.assign({ alignment: AlignmentType.JUSTIFIED }, o || {}));
  const H1 = t => new Paragraph({ children: [run(t, { bold: true, size: 23, color: '0E2A5C' })], spacing: { before: 260, after: 100 }, keepNext: true });
  const H2 = t => new Paragraph({ children: [run(t, { bold: true, size: 21 })], spacing: { before: 160, after: 70 }, keepNext: true });
  const li = t => new Paragraph({ children: Array.isArray(t) ? t : [run(t)], bullet: { level: 0 }, spacing: { after: 40 } });
  const B1 = { style: BorderStyle.SINGLE, size: 6, color: '7F8EA3' }, BB = { top: B1, bottom: B1, left: B1, right: B1 };
  const noB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, NB = { top: noB, bottom: noB, left: noB, right: noB };
  const shade = f => ({ fill: f, type: ShadingType.CLEAR, color: 'auto' });
  const cell = (t, o) => new TableCell(Object.assign({ children: [new Paragraph({ children: Array.isArray(t) ? t : [run(t, (o && o.r) || {})], alignment: (o && o.al) || AlignmentType.LEFT, spacing: { after: 0 } })],
    verticalAlign: VerticalAlign.CENTER, margins: { top: 35, bottom: 35, left: 70, right: 70 }, borders: BB }, o && o.c || {}));
  const semF = p => p == null ? 'F1F5F9' : p < MIN ? 'FDE2E2' : p < VIG ? 'FEF3C7' : 'DCFCE7';
  const semC = p => p == null ? '64748B' : p < MIN ? 'B91C1C' : p < VIG ? '92400E' : '166534';
  const pcCell = p => cell([run(pc(p), { bold: true, color: semC(p), size: 19 })], { al: AlignmentType.CENTER, c: { shading: shade(semF(p)) } });
  /* tabla: cab = [[texto, ancho%]], filas = [[celda|texto]] */
  const tabla = (cab, filas, o) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ tableHeader: true, children: cab.map(c => cell([run(c[0], { bold: true, size: 18, color: 'FFFFFF' })], { al: AlignmentType.CENTER, c: { shading: shade('0E2A5C'), width: { size: c[1], type: WidthType.PERCENTAGE } } })) })]
      .concat(filas.length ? filas.map(f => new TableRow({ cantSplit: true, children: f.map((x, i) => x instanceof TableCell ? x : cell([run(x, { size: 18 })], { al: i === 0 || (o && o.izq && o.izq.indexOf(i) >= 0) ? AlignmentType.LEFT : AlignmentType.CENTER })) }))
        : [new TableRow({ children: [cell([run('Sin registros en el periodo', { italics: true, size: 18, color: '64748B' })], { c: { columnSpan: cab.length } })] })]) });
  const kv = rows => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rows.map(([k, v]) => new TableRow({ children: [
    cell([run(k, { bold: true, size: 19 })], { c: { width: { size: 32, type: WidthType.PERCENTAGE }, shading: shade('EEF3FB') } }), cell([run(v, { size: 19 })])] })) });
  const gen = d.modo === 'general';

  /* ── encabezado ── */
  const logo = d.logoBytes ? new ImageRun({ type: d.logoTipo || 'jpg', data: d.logoBytes, transformation: { width: 56, height: 70 } }) : run('');
  const hc = (t, o) => cell([run(t, Object.assign({ bold: true, size: 19 }, o || {}))], { al: AlignmentType.CENTER, c: { borders: { top: { style: BorderStyle.SINGLE, size: 6, color: '000000' }, bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' }, left: { style: BorderStyle.SINGLE, size: 6, color: '000000' }, right: { style: BorderStyle.SINGLE, size: 6, color: '000000' } } } });
  const hdr = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    new TableRow({ children: [new TableCell({ rowSpan: 2, width: { size: 16, type: WidthType.PERCENTAGE }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ children: [logo], alignment: AlignmentType.CENTER })] }),
      hc(d.razon), hc(d.ciclo.nom, { size: 18 })] }),
    new TableRow({ children: [hc(gen ? 'INFORME GENERAL DE CIERRE DE CICLO ETI' : 'INFORME DE CIERRE DE CICLO ETI POR SECTOR', { size: 22 }), hc('Emitido: ' + d.fechaEmision, { bold: false, size: 17 })] })] });
  const foot = new Paragraph({ alignment: AlignmentType.CENTER, children: [run('Gestión Humana · Unifrutti Perú · ' + (d.verif ? 'Verif. ' + d.verif + ' · ' : '') + 'Página ', { size: 15, color: '64748B' }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 15, color: '64748B' })] });

  const C = d.cap, E = d.ev, A = d.alertas || [], S = d.sat;
  const body = [];
  /* 1. datos generales */
  body.push(H1('1. DATOS GENERALES'));
  body.push(kv([['Razón social', d.razon], gen ? ['Alcance', d.alcance] : ['Sector', d.sector], ['Supervisor(es) a cargo', d.supervisores.join(', ') || '—'],
    ['Ciclo', d.ciclo.nom + ' (' + d.ciclo.desdeTxt + ' al ' + d.ciclo.hastaTxt + ')'], ['Fecha de emisión', d.fechaEmision], ['Emitido por', d.emisor]]));
  /* 2. resumen */
  body.push(H1('2. RESUMEN DEL CICLO'));
  body.push(J('Durante el ' + d.ciclo.nom + ' se realizaron ' + C.sesiones + ' sesiones de capacitación ETI, con ' + C.total + ' participantes (' + C.h + ' hombres y ' + C.m + ' mujeres) de ' + C.rutas.length + ' rutas o áreas' +
    (gen ? ' en ' + d.sectores.length + ' sectores' : ' del sector ' + d.sector) + '. En la evaluación de conocimiento (checklist) se evaluó a ' + E.n + ' trabajadores, con un resultado general de ' + pc(E.prom) + ' y ' + pc(E.aprPct) + ' de aprobados (meta: 70 %). ' +
    (gen ? E.sectores.filter(s => s.aprueba).length + ' de ' + E.sectores.length + ' sectores aprueban el ciclo.' : 'El sector ' + (E.aprueba ? 'APRUEBA' : 'NO APRUEBA') + ' el ciclo.') +
    (A.length ? ' Se identificaron ' + A.length + ' alertas de reforzamiento (ruta y tema con menos de 70 %): ' + A.filter(a => a.estado === 'superada').length + ' superadas, ' + A.filter(a => a.estado === 'reforzado').length + ' reforzadas pendientes de re-evaluación y ' + A.filter(a => a.estado === 'pendiente' || a.estado === 'reevaluar').length + ' por atender.' : ' No se registraron rutas con temas por debajo del 70 %.') +
    (S && S.n ? ' La encuesta de satisfacción (' + S.n + ' respuestas) dio un índice general de ' + Math.round(S.gen) + '/100.' : '')));
  /* 3. capacitaciones */
  body.push(H1('3. CAPACITACIONES REALIZADAS'));
  body.push(H2('3.1 Alcance por ' + (gen ? 'sector' : 'ruta o área')));
  if (gen) body.push(tabla([['Sector', 20], ['Supervisor(es)', 28], ['Sesiones', 10], ['Rutas/áreas', 12], ['Capacitados', 12], ['H / M', 10], ['Días', 8]],
    C.porSector.map(s => [s.sector, s.sups.join(', '), s.sesiones, s.rutas, s.total, s.h + ' / ' + s.m, s.dias]), { izq: [1] }));
  else body.push(tabla([['Código', 13], ['Ruta / área', 27], ['Capacitados', 12], ['Sesiones', 10], ['Supervisor', 23], ['Fecha(s)', 15]],
    C.rutas.map(r => [r.cod || '—', r.nom || '—', (r.total || (r.comp ? '' : '—')) + (r.comp ? (r.total ? ' + ' : '') + r.comp + ' sesión(es) compartida(s)' : ''), r.sesiones, r.sups.join(', '), r.fechas.join(', ')]), { izq: [1, 4] }));
  if (!gen && C.sinDetalle) body.push(P([run('Nota: ' + C.sinDetalle + ' sesión(es) se registraron con "varias rutas" sin detalle de códigos; sus participantes se cuentan en el total por día.', { size: 17, italics: true, color: '64748B' })]));
  body.push(H2('3.2 Alcance por día'));
  body.push(tabla([['Fecha', 18], ['Sesiones', 12], ['Hombres', 14], ['Mujeres', 14], ['Total', 14], ['Temas', 28]], C.porDia.map(x => [x.fechaTxt, x.sesiones, x.h, x.m, x.total, x.temas.join('; ')]), { izq: [5] }));
  body.push(H2('3.3 Temas abordados'));
  (C.temas.length ? C.temas : ['—']).forEach(t => body.push(li(t)));
  /* 4. evaluacion */
  body.push(H1('4. EVALUACIÓN DE CONOCIMIENTO (CHECKLIST)'));
  body.push(H2('4.1 Resultado por tema' + (gen ? ' y sector' : '')));
  if (gen) {
    body.push(tabla([['Sector', 22]].concat(E.temas.map(t => [t.nom, Math.floor(58 / Math.max(1, E.temas.length))])).concat([['General', 10], ['Aprueba', 10]]),
      E.sectores.map(s => [s.sector].concat(E.temas.map(t => pcCell(s.temas[t.id]))).concat([pcCell(s.prom), cell([run(s.aprueba ? 'SÍ' : 'NO', { bold: true, color: s.aprueba ? '166534' : 'B91C1C', size: 18 })], { al: AlignmentType.CENTER })]))));
  } else {
    body.push(tabla([['Tema', 46], ['Evaluados', 14], ['% alcanzado', 20], ['Resultado', 20]],
      E.temas.map(t => [t.nom, t.n, pcCell(t.pct), cell([run(t.pct >= MIN ? 'APRUEBA' : 'REFORZAR', { bold: true, size: 18, color: t.pct >= MIN ? '166534' : 'B91C1C' })], { al: AlignmentType.CENTER })]), { izq: [0] }));
    body.push(P([run('Resultado general del sector: ', { bold: true }), run(pc(E.prom) + ' · ' + E.n + ' evaluados · ' + pc(E.aprPct) + ' aprobados → '), run(E.aprueba ? 'EL SECTOR APRUEBA' : 'EL SECTOR NO APRUEBA', { bold: true, color: E.aprueba ? '166534' : 'B91C1C' })]));
  }
  body.push(H2('4.2 Resultado por ruta y tema'));
  body.push(tabla([[gen ? 'Sector · ruta' : 'Ruta (código)', 26], ['Eval.', 8]].concat(E.temas.map(t => [t.nom, Math.floor(56 / Math.max(1, E.temas.length))])).concat([['General', 10]]),
    E.rutas.map(r => [(gen ? r.sector + ' · ' : '') + (r.ruta || '—') + (r.cod ? ' (' + r.cod + ')' : ''), r.n].concat(E.temas.map(t => pcCell(r.temas[t.id]))).concat([pcCell(r.prom)]))));
  body.push(P([run('Criterio: verde ≥ 80 % · ámbar 70–79 % · rojo < 70 % (requiere reforzamiento). Promedios ponderados por número de evaluados.', { size: 16, color: '64748B' })]));
  /* 5. reforzamiento */
  body.push(H1('5. REFORZAMIENTOS'));
  body.push(tabla([[gen ? 'Sector · ruta' : 'Ruta', 22], ['Tema', 20], ['% inicial', 10], ['Eval.', 7], ['Reforzamiento', 21], ['Re-evaluación', 10], ['Estado', 10]],
    A.map(a => [(gen ? a.sector + ' · ' : '') + (a.ruta || '—') + (a.cod ? ' (' + a.cod + ')' : ''), a.tema, pcCell(a.pct), a.n, a.seg ? a.seg.fechaTxt + ' · ' + (a.seg.modalidad || '') + (a.seg.nota ? ' — ' + a.seg.nota : '') : 'Sin registrar',
      a.post ? pc(a.post.pct) : '—', cell([run(a.estadoTxt, { bold: true, size: 17, color: a.estado === 'superada' ? '166534' : a.estado === 'reforzado' ? '92400E' : 'B91C1C' })], { al: AlignmentType.CENTER })]), { izq: [1, 4] }));
  /* 6. satisfaccion */
  body.push(H1('6. ENCUESTA DE SATISFACCIÓN DEL PERSONAL'));
  if (S && S.n) {
    body.push(tabla([['Índice (0–100)', 40], ['Resultado', 20], ['Qué mide', 40]], [['General', pcIdx(S.gen), 'Satisfacción global'], ['Capacitador', pcIdx(S.cap), 'Claridad, ejemplos y trato'], ['Material', pcIdx(S.mat), 'Uso y utilidad del material (usó material: ' + Math.round(S.usoMat || 0) + ' %)'],
      ['Contenido', pcIdx(S.cont), 'Utilidad del tema y si sabe a quién acudir (' + Math.round(S.canal || 0) + ' % sí)'], ['Logística', pcIdx(S.log), 'Tiempo y comodidad (tiempo adecuado: ' + Math.round(S.tiempo || 0) + ' %)']], { izq: [0, 2] }));
    if (gen && S.porSup && S.porSup.length) { body.push(H2('Por capacitador')); body.push(tabla([['Capacitador', 40], ['Resp.', 10], ['General', 12], ['Capacitador', 12], ['Material', 13], ['Contenido', 13]], S.porSup.map(x => [x.sup, x.n, pcIdx(x.gen), pcIdx(x.cap), pcIdx(x.mat), pcIdx(x.cont)]), { izq: [0] })); }
    body.push(P([run(S.n + ' respuestas anónimas. ' + (S.coment.length ? 'Opiniones del personal:' : ''), { size: 18 })]));
    S.coment.slice(0, 12).forEach(c => body.push(li([run('“' + c + '”', { italics: true, size: 18 })])));
  } else body.push(P([run('No se aplicó la encuesta de satisfacción en este periodo.', { italics: true, color: '64748B' })]));
  function pcIdx(v) { return cell([run(v == null ? '—' : String(Math.round(v)), { bold: true, size: 18, color: semC(v == null ? null : v / 100) })], { al: AlignmentType.CENTER, c: { shading: shade(semF(v == null ? null : v / 100)) } }); }
  /* 7. conclusiones */
  body.push(H1(gen ? '7. CONCLUSIONES Y DECISIÓN FINAL' : '7. CONCLUSIONES'));
  (d.conclusiones || []).forEach(t => body.push(li(t)));
  if (d.decision) { body.push(H2(gen ? 'Decisión final: sectores, rutas y áreas a reforzar' : 'Rutas y temas a reforzar')); d.decision.split('\n').filter(Boolean).forEach(t => body.push(li(t.replace(/^[-•]\s*/, '')))); }
  /* 8. firmas */
  body.push(new Paragraph({ children: [run('8. FIRMAS', { bold: true, size: 23, color: '0E2A5C' })], spacing: { before: 260, after: 100 }, keepNext: true, keepLines: true }));
  const firmas = d.firmas || [];
  body.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: NB, rows: [new TableRow({ cantSplit: true, children: firmas.map(f => new TableCell({ borders: NB, width: { size: Math.floor(100 / firmas.length), type: WidthType.PERCENTAGE }, children: [
    new Paragraph({ keepNext: true, keepLines: true, spacing: { before: 700, after: 0 }, alignment: AlignmentType.CENTER, children: [run('_______________________________', { color: '475569' })] }),
    new Paragraph({ keepNext: true, alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [run(f.nom, { bold: true, size: 18 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [run(f.cargo, { size: 16, color: '475569' })] })] })) })] }));
  /* anexo */
  body.push(new Paragraph({ pageBreakBefore: true, children: [run('ANEXO – DETALLE DE LOS CHECKLIST APLICADOS (EVIDENCIA)', { bold: true, size: 22, color: '0E2A5C' })], spacing: { after: 120 } }));
  body.push(P([run('Cada fila es una aplicación de la evaluación de conocimiento (QR: agrupada por día y ruta; manual: registro del supervisor). Los resultados individuales quedan en el sistema de Evaluación ETI.', { size: 17, color: '475569' })]));
  body.push(tabla([['Fecha', 12], [gen ? 'Sector · ruta' : 'Ruta (código)', 30], ['Modalidad', 11], ['Supervisor', 21], ['Evaluados', 9], ['Resultado', 9], ['Aprob.', 8]],
    d.anexo.map(x => [x.fechaTxt, (gen ? x.sector + ' · ' : '') + (x.ruta || '—') + (x.cod ? ' (' + x.cod + ')' : ''), x.mod, x.sup, x.n, pcCell(x.prom), x.apr == null ? '—' : x.apr]), { izq: [1, 3] }));

  return new Document({ creator: 'Sistema ETI – Evaluaciones', title: (gen ? 'Informe general ' : 'Informe sector ' + d.sector + ' ') + d.ciclo.nom,
    styles: { default: { document: { run: { font: FONT, size: SZ } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1500, right: 1000, bottom: 1100, left: 1000, header: 380, footer: 400 } } },
      headers: { default: new Header({ children: [hdr, new Paragraph({ children: [run('', { size: 6 })], spacing: { after: 0 } })] }) },
      footers: { default: new Footer({ children: [foot] }) }, children: body }] });
}
function b64bytes(b64) { if (!b64) return null; try { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; } catch (e) { return null; } }
async function etiInformeCiclo(datos) {
  const D = (typeof docx !== 'undefined') ? docx : null; if (!D) throw new Error('Librería docx no cargada');
  const b = datos.logoBytes || b64bytes(datos.logoBase64);
  const doc = build(D, Object.assign({}, datos, { logoBytes: b, logoTipo: datos.logoBase64 && /^iVBOR/.test(datos.logoBase64) ? 'png' : 'jpg' }));
  return D.Packer.toBlob(doc);
}
etiInformeCiclo.version = 1;
root.etiInformeCiclo = etiInformeCiclo;
})(typeof window !== 'undefined' ? window : globalThis);
