/* ═════════════════════════════════════════════════════════════════════════
   _INFORME_AUDITORIA_V1 (03-nov-2026) — Informe consolidado de Evaluaciones ETI para auditoría
   Botón "Informe para auditoría" (solo administrador) en Evaluaciones por supervisor.
   Elige empresa (RAPEL / VERFRUT / ambas), periodo e inclusión de QR, y descarga:
     · Word con la cabecera corporativa INF-SC-GH-04 (razón social de la empresa), metodología,
       resumen, detalle por supervisor y sector, rutas observadas, trazabilidad, conclusiones y firmas.
     · Excel anexo: Parámetros, Resumen, Detalle por ruta (resultado y estado con fórmulas), Por supervisor, Trazabilidad.
     · Hojas por ruta (imprimir / PDF): una hoja por ruta con el % logrado, peso, puntaje ponderado y estado de cada tema,
       en el mismo formato de la Hoja de respuestas para auditoría (razón social completa, sin ID, solo N.º de hoja).
   Lee los datos del sistema (Firebase, mismo origen que Azure) en el momento de emitir. No guarda nada.
   ═════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window._INFORME_AUDITORIA_V1) return; window._INFORME_AUDITORIA_V1 = true;
  var $ = function (id) { return document.getElementById(id); };
  var RAZON = { 'RAPEL S.A.C.': 'Sociedad Agricola Rapel S.A.C.', 'VERFRUT S.A.C.': 'Sociedad Exportadora Verfrut S.A.C.' };
  var esAdmin = function () { try { return typeof SESSION !== 'undefined' && SESSION && SESSION.rol === 'admin'; } catch (e) { return false; } };
  var hoyI = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var fF = function (f) { f = String(f || ''); return f.length >= 10 ? f.slice(8, 10) + '/' + f.slice(5, 7) + '/' + f.slice(0, 4) : f; };
  function cargar(src) { return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = function () { no(new Error('No se pudo cargar ' + src)); }; document.head.appendChild(s); }); }
  async function libs() { if (typeof window.docx === 'undefined') await cargar('lib/docx.iife.js?v=951'); if (typeof window.XLSX === 'undefined') await cargar('lib/xlsx.full.min.js'); }
  function bajar(blob, nombre) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
  function logoBytes() { try { var b = (getComputedStyle(document.documentElement).getPropertyValue('--logo').match(/base64,([^)'"]+)/) || [])[1]; if (!b) return null; var s = atob(b), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; } catch (e) { return null; } }

  /* ── Datos ── */
  var TEMAS = function () { return (typeof SECS !== 'undefined' ? SECS : []).map(function (s) { return { id: s.id, nom: s.nom, peso: s.peso }; }); };
  function idxTema(T, s) { var i = T.findIndex(function (t) { return t.id === s.id || t.nom === s.nom; }); return i; }
  async function datos(o) {
    var f = fbdb, T = TEMAS();
    var qm = await f.collection(COL_EVAL).where('fecha', '>=', o.desde).where('fecha', '<=', o.hasta).get();
    var man = qm.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }).filter(function (x) { return x.modalidad !== 'QR' && (!o.emp || x.emp === o.emp); });
    var rutas = [];
    man.forEach(function (m) {
      var dt = m.destiempo && (m.destiempo.tipo || m.destiempo.motivo) ? m.destiempo : null;
      var nota = [];
      if (m.fechaOriginal) nota.push('Fecha de evaluación corregida en el sistema (registrada originalmente el ' + fF(m.fechaOriginal) + ').');
      if (m.restauradoDesde) nota.push('Restaurado desde ' + m.restauradoDesde + '.');
      if (m.motivoEdicion) nota.push(m.motivoEdicion + '.');
      (m.rutas || []).forEach(function (r) {
        var t = T.map(function () { return null; });
        (r.secs || []).forEach(function (s) { var i = idxTema(T, s); if (i >= 0) t[i] = (s.pct != null ? +s.pct : (+s.cum || 0)) * 100; });
        rutas.push({ mod: 'Manual', fecha: m.fecha, emp: m.emp || '', sup: m.sup || '', sector: m.sector || '—', tipo: m.tipo === 'empleado' ? 'empleado' : 'obrero', nom: String(r.nom || '—').replace(/\|/g, '').trim().toUpperCase(), cod: r.cod || '', n: +r.ne || 1,
          t: t.map(function (x) { return x == null ? 0 : x; }), res: (+r.resGrupo || 0) * 100, reg: m.nomUsuario || m.usuario || '', dest: dt ? (dt.tipo || 'Sí') : '', mot: dt ? (dt.motivo || '') : '', nota: nota.join(' '), doc: m.id });
      });
    });
    if (o.qr) {
      var qq = await f.collection('respuestas_qr').where('fecha', '>=', o.desde).where('fecha', '<=', o.hasta).get();
      var G = new Map();
      qq.docs.forEach(function (d) { var x = d.data(); if (o.emp && x.emp !== o.emp) return;
        var k = [x.fecha, x.emp, x.sup, x.sector, x.tipo === 'empleado' ? 'empleado' : 'obrero', String(x.ruta || '').toUpperCase().trim(), String(x.cod || '').toUpperCase().trim()].join('|');
        var g = G.get(k); if (!g) { g = { mod: 'QR', fecha: x.fecha, emp: x.emp || '', sup: x.sup || '', sector: x.sector || '—', tipo: x.tipo === 'empleado' ? 'empleado' : 'obrero', nom: String(x.ruta || '—').toUpperCase().trim(), cod: String(x.cod || '').toUpperCase().trim(), n: 0, sr: 0, st: T.map(function () { return 0; }), reg: x.supQR || x.sup || '', dest: '', mot: '', nota: '' }; G.set(k, g); }
        g.n++; g.sr += (+x.resultado || 0) * 100; (x.secs || []).forEach(function (s) { var i = idxTema(T, s); if (i >= 0) g.st[i] += (+s.pct || 0) * 100; });
      });
      G.forEach(function (g) { g.res = g.n ? g.sr / g.n : 0; g.t = g.st.map(function (v) { return g.n ? v / g.n : 0; }); rutas.push(g); });
    }
    rutas.sort(function (a, b) { return a.fecha.localeCompare(b.fecha) || a.mod.localeCompare(b.mod) || a.tipo.localeCompare(b.tipo); });
    /* trazabilidad: registros depurados y restaurados del periodo */
    var traz = [], ids = new Set(man.map(function (m) { return m.id; }));
    try {
      var dq = await f.collection('evaluaciones_depuradas').get();
      dq.docs.forEach(function (d) { var x = d.data();
        if (x.ruta && x.evalId) { var p = man.find(function (m) { return m.id === x.evalId; }); if (!p) return; traz.push(['Ruta duplicada retirada', fF(p.fecha), (p.sup || '') + ' · ' + (p.sector || ''), '«' + (x.ruta.nom || '') + '» (' + (x.ruta.ne || 1) + ' evaluados). ' + (x.motivoDepuracion || '')]); return; }
        if (!x.fecha || x.fecha < o.desde || x.fecha > o.hasta || (o.emp && x.emp !== o.emp)) return;
        var ne = (x.rutas || []).reduce(function (a, r) { return a + (+r.ne || 1); }, 0);
        traz.push([/prueba/i.test(x.motivoDepuracion || '') ? 'Registro de prueba retirado' : 'Envío duplicado retirado', fF(x.fecha), (x.sup || '') + ' · ' + (x.sector || ''), (x.rutas || []).length + ' ruta(s), ' + ne + ' evaluado(s). ' + (x.motivoDepuracion || '')]); });
    } catch (e) { console.warn('[_INFORME_AUDITORIA_V1] depuradas:', e.message); }
    man.forEach(function (m) {
      if (m.restauradoDesde) traz.push(['Registro restaurado', fF(m.fecha), (m.sup || '') + ' · ' + (m.sector || ''), 'Restaurado desde ' + m.restauradoDesde + (m.supOriginalHoja ? '; figuraba a nombre de «' + m.supOriginalHoja + '».' : '.')]);
      if (m.fechaOriginal) traz.push(['Fecha corregida', fF(m.fecha), (m.sup || '') + ' · ' + (m.sector || ''), 'Registrada originalmente con fecha ' + fF(m.fechaOriginal) + '; se informa con la fecha corregida.']);
    });
    return { T: T, rutas: rutas, traz: traz };
  }
  function agg(L, T) { var n = L.reduce(function (a, r) { return a + r.n; }, 0); var ap = L.filter(function (r) { return r.res >= 70; });
    return { rutas: L.length, n: n, res: n ? L.reduce(function (a, r) { return a + r.res * r.n; }, 0) / n : 0, t: T.map(function (_, i) { return n ? L.reduce(function (a, r) { return a + r.t[i] * r.n; }, 0) / n : 0; }),
      apR: ap.length, apN: ap.reduce(function (a, r) { return a + r.n; }, 0), ses: new Set(L.map(function (r) { return r.fecha + r.sup + r.sector + r.tipo + r.mod; })).size }; }

  /* ── Word ── */
  async function word(o, D) {
    var X = window.docx, T = D.T, rutas = D.rutas, traz = D.traz;
    var Document = X.Document, Packer = X.Packer, Paragraph = X.Paragraph, TextRun = X.TextRun, Table = X.Table, TableRow = X.TableRow, TableCell = X.TableCell, WidthType = X.WidthType, AlignmentType = X.AlignmentType, BorderStyle = X.BorderStyle, ShadingType = X.ShadingType, VerticalAlign = X.VerticalAlign, Header = X.Header, Footer = X.Footer, ImageRun = X.ImageRun, PageOrientation = X.PageOrientation, PageNumber = X.PageNumber, LevelFormat = X.LevelFormat;
    var FONT = 'Arial', C = AlignmentType.CENTER, CW = 13958, AZ = '0F2748', HD = 'E6EBF2', VERDE = 'E4F4EA', VTX = '0F6B3A', ROJO = 'FEE2E2', RTX = '991B1B';
    var run = function (t, op) { return new TextRun(Object.assign({ text: String(t == null ? '' : t), font: FONT, size: 20 }, op || {})); };
    var P_ = function (t, op) { return new Paragraph(Object.assign({ children: Array.isArray(t) ? t : [run(t)], spacing: { after: 100 } }, op || {})); };
    var J = function (t) { return P_(String(t).replace(/\.\.(?=\s|$)/g, '.'), { alignment: AlignmentType.JUSTIFIED }); };
    var H = function (t) { return new Paragraph({ children: [run(t, { bold: true, size: 22, color: AZ })], spacing: { before: 240, after: 100 }, keepNext: true }); };
    var H3 = function (t) { return new Paragraph({ children: [run(t, { bold: true, size: 20, color: AZ })], spacing: { before: 180, after: 60 }, keepNext: true }); };
    var li = function (t) { return new Paragraph({ children: [run(t)], numbering: { reference: 'vi', level: 0 }, spacing: { after: 40 } }); };
    var B1 = { style: BorderStyle.SINGLE, size: 6, color: '000000' }, BB = { top: B1, bottom: B1, left: B1, right: B1 };
    var G1 = { style: BorderStyle.SINGLE, size: 4, color: 'B8C4D6' }, BG = { top: G1, bottom: G1, left: G1, right: G1 };
    var cell = function (t, op) { op = op || {}; return new TableCell({ children: [new Paragraph({ alignment: op.al || AlignmentType.LEFT, children: [run(t, Object.assign({ size: op.sz || 17 }, op.r || {}))], spacing: { after: 0 } })], width: { size: op.w, type: WidthType.DXA }, borders: op.b || BG, shading: op.f ? { fill: op.f, type: ShadingType.CLEAR, color: 'auto' } : undefined, verticalAlign: VerticalAlign.CENTER, margins: { top: 40, bottom: 40, left: 70, right: 70 }, rowSpan: op.rs }); };
    var pct = function (x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ',') + ' %'; };
    var ALL = agg(rutas, T), EMPS = (o.emp ? [o.emp] : ['RAPEL S.A.C.', 'VERFRUT S.A.C.']).filter(function (e) { return rutas.some(function (r) { return r.emp === e; }); });
    var EA = EMPS.map(function (e) { return [e, agg(rutas.filter(function (r) { return r.emp === e; }), T)]; });
    var obs = rutas.filter(function (r) { return r.res < 70 || r.t.some(function (x) { return x < 70; }); });
    var razon = o.emp ? RAZON[o.emp] : 'Sociedad Agricola Rapel S.A.C. · Sociedad Exportadora Verfrut S.A.C.';
    var empTxt = o.emp ? RAZON[o.emp] + ' (' + o.emp + ')' : 'Sociedad Agricola Rapel S.A.C. (RAPEL S.A.C.) y Sociedad Exportadora Verfrut S.A.C. (VERFRUT S.A.C.)';
    var lb = logoBytes();
    var hdr = new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [1900, CW - 4500, 2600], rows: [
      new TableRow({ children: [new TableCell({ rowSpan: 3, width: { size: 1900, type: WidthType.DXA }, borders: BB, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: C, children: [lb ? new ImageRun({ type: 'png', data: lb, transformation: { width: 52, height: 65 } }) : run('')] })] }),
        cell(razon, { w: CW - 4500, b: BB, al: C, r: { bold: true }, sz: 19 }), cell('INF-SC-GH-04', { w: 2600, b: BB, al: C, r: { bold: true }, sz: 19 })] }),
      new TableRow({ children: [cell('INFORME CONSOLIDADO DE EVALUACIONES ETI', { w: CW - 4500, b: BB, al: C, r: { bold: true }, sz: 23, rs: 2 }), cell('Versión N.º 0.0', { w: 2600, b: BB, al: C, r: { bold: true }, sz: 19 })] }),
      new TableRow({ children: [new TableCell({ width: { size: 2600, type: WidthType.DXA }, borders: BB, children: [new Paragraph({ alignment: C, spacing: { after: 0 }, children: [run('Última revisión:', { bold: true, size: 18 })] }), new Paragraph({ alignment: C, spacing: { after: 0 }, children: [run('24/03/2026', { size: 18 })] })] })] })] });
    var foot = [new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 40 }, children: [run('El contenido de este documento es propiedad exclusiva de Unifrutti. Su reproducción o copia total y/o parcial requiere una solicitud escrita y expresa al departamento de Sustentabilidad y Certificaciones, en cumplimiento con el sistema de gestión de la empresa y su control de documentos.', { size: 14, color: '333333' })] }),
      new Paragraph({ alignment: AlignmentType.RIGHT, children: [run('Página ', { size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 }), run(' de ', { size: 16 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16 })] })];
    var kv = function (rows) { return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [3600, CW - 3600], rows: rows.map(function (x) { return new TableRow({ children: [cell(x[0], { w: 3600, f: HD, r: { bold: true }, sz: 18 }), cell(x[1], { w: CW - 3600, sz: 18 })] }); }) }); };
    var tabla = function (w, head, filas, alC) { return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: w, rows: [new TableRow({ tableHeader: true, children: head.map(function (x, i) { return cell(x, { w: w[i], f: HD, r: { bold: true }, al: alC && alC(i) ? C : undefined, sz: 16 }); }) })].concat(filas) }); };
    var tabMet = (function () { var w = [5200, 2400, 3200, CW - 10800]; return tabla(w, ['TEMA', 'PESO', 'UMBRAL DE LOGRO', 'CRITERIO'],
      T.map(function (t) { return new TableRow({ children: [cell(t.nom, { w: w[0] }), cell(Math.round(t.peso * 100) + ' %', { w: w[1], al: C }), cell('≥ 70 %', { w: w[2], al: C }), cell('< 70 %: tema observado (reforzamiento)', { w: w[3] })] }); })
      .concat([new TableRow({ children: [cell('RESULTADO DE LA RUTA (promedio ponderado)', { w: w[0], r: { bold: true }, f: 'F3F5F8' }), cell('100 %', { w: w[1], al: C, r: { bold: true }, f: 'F3F5F8' }), cell('≥ 70 %', { w: w[2], al: C, r: { bold: true }, f: 'F3F5F8' }), cell('≥ 70 %: APROBADO · < 70 %: REFUERZO', { w: w[3], r: { bold: true }, f: 'F3F5F8' })] })]), function (i) { return i > 0; }); })();
    var tabRes = (function () { var w = [2700, 1300, 1200, 1500, 2000, 1900, CW - 10600];
      var fila = function (e, a, b) { return new TableRow({ children: [cell(e, { w: w[0], r: b ? { bold: true } : {}, f: b ? 'F3F5F8' : undefined })].concat([a.ses, a.rutas, a.n, a.apR + ' de ' + a.rutas, pct(a.n ? a.apN / a.n * 100 : 0), pct(a.res)].map(function (x, i) { return cell(x, { w: w[i + 1], al: C, r: b ? { bold: true } : {}, f: i === 5 ? (a.res >= 70 ? VERDE : ROJO) : (b ? 'F3F5F8' : undefined) }); })) }); };
      return tabla(w, ['EMPRESA', 'SESIONES', 'RUTAS', 'EVALUADOS', 'RUTAS APROBADAS', '% EVALUADOS EN RUTAS APROBADAS', 'RESULTADO PROMEDIO PONDERADO'], EA.map(function (x) { return fila(x[0], x[1]); }).concat(EA.length > 1 ? [fila('TOTAL', ALL, true)] : []), function (i) { return i > 0; }); })();
    var tabTem = (function () { var cols = EA.length > 1 ? EA.map(function (x) { return x[0]; }).concat(['TOTAL']) : [EA.length ? EA[0][0] : 'TOTAL']; var cw = 2600, w = [4600].concat(cols.map(function () { return cw; })).concat([CW - 4600 - cw * cols.length]);
      var col = function (i) { return EA.length > 1 ? EA.map(function (x) { return x[1].t[i]; }).concat([ALL.t[i]]) : [ALL.t[i]]; };
      return tabla(w, ['TEMA'].concat(cols).concat(['ESTADO']), T.map(function (t, i) { var vs = col(i); return new TableRow({ children: [cell(t.nom, { w: w[0] })].concat(vs.map(function (v, k) { return cell(pct(v), { w: w[k + 1], al: C, f: v >= 70 ? VERDE : ROJO, r: { color: v >= 70 ? VTX : RTX, bold: true } }); })).concat([cell(ALL.t[i] >= 70 ? 'LOGRADO' : 'OBSERVADO', { w: w[w.length - 1], al: C, r: { bold: true, color: ALL.t[i] >= 70 ? VTX : RTX } })]) }); }), function (i) { return i > 0; }); })();
    var SH = ['LEG.', 'BIEN.', 'SUST.', 'ÉTICA', 'SST', 'MEDIO.'];
    var tabDet = function (L) { var w = [1050, 900, 2600, 700, 650].concat(T.map(function () { return 950; })).concat([1050, CW - 1050 - 900 - 2600 - 700 - 650 - 950 * T.length - 1050]);
      return tabla(w, ['FECHA', o.qr ? 'TIPO / MOD.' : 'TIPO', 'RUTA / ÁREA', 'CÓD.', 'EVAL.'].concat(T.map(function (t, i) { return SH[i] || t.nom.slice(0, 6).toUpperCase(); })).concat(['RESULT.', 'ESTADO']), L.map(function (r) { return new TableRow({ cantSplit: true, children: [cell(fF(r.fecha), { w: w[0], al: C, sz: 16 }), cell((r.tipo === 'empleado' ? 'Empleado' : 'Obrero') + (o.qr ? ' · ' + r.mod : ''), { w: w[1], al: C, sz: 15 }), cell(r.nom, { w: w[2], sz: 16 }), cell(r.cod || '—', { w: w[3], al: C, sz: 16 }), cell(r.n, { w: w[4], al: C, sz: 16 })]
        .concat(r.t.map(function (x, i) { return cell(pct(x), { w: w[5 + i], al: C, sz: 16, f: x >= 70 ? undefined : ROJO, r: x >= 70 ? {} : { color: RTX, bold: true } }); }))
        .concat([cell(pct(r.res), { w: w[5 + T.length], al: C, sz: 16, r: { bold: true } }), cell(r.res >= 70 ? 'APROBADO' : 'REFUERZO', { w: w[6 + T.length], al: C, sz: 15, f: r.res >= 70 ? VERDE : ROJO, r: { bold: true, color: r.res >= 70 ? VTX : RTX } })]) }); }), function () { return true; }); };
    var tabObs = (function () { var w = [1100, 3400, 3600, 1000, 1100, CW - 10200]; return tabla(w, ['FECHA', 'SUPERVISOR · SECTOR', 'RUTA / ÁREA', 'EVAL.', 'RESULT.', 'TEMAS < 70 % (REQUIEREN REFORZAMIENTO)'], obs.map(function (r) { return new TableRow({ cantSplit: true, children: [cell(fF(r.fecha), { w: w[0], al: C, sz: 16 }), cell(r.sup + ' · ' + r.sector, { w: w[1], sz: 16 }), cell(r.nom + (r.cod ? ' (' + r.cod + ')' : ''), { w: w[2], sz: 16 }), cell(r.n, { w: w[3], al: C, sz: 16 }), cell(pct(r.res), { w: w[4], al: C, sz: 16, f: r.res >= 70 ? undefined : ROJO, r: { bold: true } }), cell(T.map(function (t, i) { return r.t[i] < 70 ? t.nom + ' (' + pct(r.t[i]) + ')' : null; }).filter(Boolean).join('; ') || '—', { w: w[5], sz: 16 })] }); }), function (i) { return i < 5; }); })();
    var tabTraz = (function () { var w = [2600, 1300, 3800, CW - 7700]; return tabla(w, ['ACCIÓN', 'FECHA EVAL.', 'SUPERVISOR · SECTOR', 'DETALLE'], traz.map(function (t) { return new TableRow({ cantSplit: true, children: [cell(t[0], { w: w[0], sz: 16, r: { bold: true } }), cell(t[1], { w: w[1], al: C, sz: 16 }), cell(t[2], { w: w[2], sz: 16 }), cell(t[3], { w: w[3], sz: 16 })] }); }), function (i) { return i === 1; }); })();
    var firmas = (function () { var w = [4653, 4653, 4652], nb = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, NB = { top: nb, bottom: nb, left: nb, right: nb };
      var c = function (a, b) { return new TableCell({ width: { size: 4653, type: WidthType.DXA }, borders: NB, children: [new Paragraph({ spacing: { before: 900, after: 0 }, alignment: C, children: [run('_______________________________', { size: 18 })] }), new Paragraph({ alignment: C, spacing: { after: 0 }, children: [run(a, { bold: true, size: 18 })] }), new Paragraph({ alignment: C, children: [run(b, { size: 17, color: '5B6B82' })] })] }); };
      return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: w, rows: [new TableRow({ children: [c('Elaborado por', 'Coordinación de Relaciones Laborales'), c('Revisado por', 'Jefatura de Gestión Humana'), c('Recibido por', 'Sustentabilidad y Certificaciones')] })] }); })();
    var peor = T.map(function (t, i) { return [t.nom, ALL.t[i]]; }).sort(function (a, b) { return a[1] - b[1]; });
    var periodo = fF(o.desde) + ' al ' + fF(o.hasta), modTxt = o.qr ? 'Evaluaciones manuales por ruta y por código QR (individuales, agrupadas por ruta)' : 'Evaluaciones manuales por ruta';
    var body = [
      new Paragraph({ alignment: C, spacing: { before: 120, after: 60 }, children: [run('INFORME CONSOLIDADO DE EVALUACIONES DE CONOCIMIENTO ETI', { bold: true, size: 26, color: AZ })] }),
      new Paragraph({ alignment: C, spacing: { after: 200 }, children: [run((o.emp || 'RAPEL S.A.C. y VERFRUT S.A.C.') + ' · Periodo del ' + periodo + ' · Documento de sustento para auditoría', { size: 19, color: '5B6B82' })] }),
      H('1. GENERALIDADES'),
      kv([['Empresa', empTxt], ['Periodo evaluado', periodo], ['Modalidad', modTxt + ' (cuestionario de 35 preguntas en ' + T.length + ' temas)'], ['Cobertura', ALL.ses + ' sesiones · ' + ALL.rutas + ' rutas / áreas · ' + ALL.n + ' trabajadores evaluados'],
        ['Supervisores responsables', new Set(rutas.map(function (r) { return r.sup; })).size + ' supervisores de Gestión Humana en ' + new Set(rutas.map(function (r) { return r.sector; })).size + ' sectores'], ['Fuente de los datos', 'Sistema de Evaluaciones ETI (Firebase y Azure SQL), con la depuración indicada en la sección 8'], ['Fecha de emisión', fF(hoyI())], ['Emitido por', (SESSION && (SESSION.nom || SESSION.user)) || '']]),
      H('2. OBJETIVO'), J('Consolidar, con los mismos parámetros con que actualmente se validan las evaluaciones ETI, los resultados de las evaluaciones de conocimiento aplicadas por los supervisores de Gestión Humana de ' + (o.emp || 'RAPEL S.A.C. y VERFRUT S.A.C.') + ' durante el periodo indicado, para su presentación como evidencia ante la auditoría.'),
      H('3. ALCANCE'), J('Comprende las evaluaciones ' + (o.qr ? 'manuales por ruta o área y las evaluaciones por código QR' : 'manuales por ruta o área') + ' registradas en el sistema con fecha de evaluación entre el ' + periodo + ', de personal obrero y empleado' + (o.emp ? ' de ' + o.emp : '') + '.' + (o.desde < '2026-06-19' ? ' Antes del 19/06/2026 no existen registros digitales de evaluaciones en el sistema.' : '') + (!o.qr ? ' Las evaluaciones por código QR (modalidad individual y anónima, vigente desde el 15/10/2026) no se incluyen en este informe.' : '')),
      H('4. METODOLOGÍA Y CRITERIOS DE EVALUACIÓN'), J('Cada supervisor aplica el cuestionario a los trabajadores de la ruta o área y registra el porcentaje logrado por el grupo en cada tema' + (o.qr ? '; en la modalidad QR cada trabajador responde individualmente y los resultados se agrupan por ruta y código' : '') + '. El resultado de la ruta es el promedio ponderado de los temas según los pesos siguientes. Los promedios de empresa y totales se ponderan por el número de evaluados.'), tabMet,
      H('5. RESUMEN GENERAL'), tabRes, P_(''), H3('5.1 Promedio logrado por tema'), tabTem,
      H('6. RESULTADOS POR SUPERVISOR Y SECTOR'), J('Detalle por ruta o área con el porcentaje logrado en cada tema. En rojo, los temas con logro inferior al 70 %.'),
      P_([run('Leyenda: ', { bold: true, size: 17 }), run(T.map(function (t, i) { return (SH[i] || '') + ' ' + t.nom + ' (' + Math.round(t.peso * 100) + ' %)'; }).join(' · ') + '.', { size: 17 })])];
    var SUPS = []; rutas.forEach(function (r) { var k = r.sup + '|' + r.sector + '|' + r.emp; if (SUPS.indexOf(k) < 0) SUPS.push(k); }); SUPS.sort(function (a, b) { return a.localeCompare(b, 'es'); });
    SUPS.forEach(function (k) { var p = k.split('|'), L = rutas.filter(function (r) { return r.sup === p[0] && r.sector === p[1] && r.emp === p[2]; }), a = agg(L, T);
      body.push(H3(p[0] + ' · Sector ' + p[1] + ' · ' + p[2]));
      body.push(P_([run('Sesiones: ', { bold: true, size: 18 }), run(a.ses + '   ', { size: 18 }), run('Rutas: ', { bold: true, size: 18 }), run(a.rutas + '   ', { size: 18 }), run('Evaluados: ', { bold: true, size: 18 }), run(a.n + '   ', { size: 18 }), run('Rutas aprobadas: ', { bold: true, size: 18 }), run(a.apR + ' de ' + a.rutas + '   ', { size: 18 }), run('Resultado promedio: ', { bold: true, size: 18 }), run(pct(a.res), { size: 18, bold: true, color: a.res >= 70 ? VTX : RTX })], { spacing: { after: 60 } }));
      body.push(tabDet(L));
      var vistos = {}; L.forEach(function (r) { var kk = r.fecha + r.tipo + r.mod; if (vistos[kk]) return; vistos[kk] = 1;
        if (r.dest) body.push(P_([run(fF(r.fecha) + ' · Registro a destiempo (' + r.dest + '): ', { bold: true, size: 16 }), run(r.mot, { size: 16 })], { spacing: { before: 40, after: 20 } }));
        if (r.nota) body.push(P_([run(fF(r.fecha) + ' · Nota: ', { bold: true, size: 16 }), run(r.nota, { size: 16 })], { spacing: { before: 20, after: 20 } })); });
    });
    body.push(H('7. RUTAS CON TEMAS OBSERVADOS'), J(obs.length + ' de ' + ALL.rutas + ' rutas tienen al menos un tema con logro inferior al 70 %, de las cuales ' + obs.filter(function (r) { return r.res < 70; }).length + ' no alcanzaron el resultado aprobatorio. Estas rutas y temas son los que requieren reforzamiento.'));
    if (obs.length) body.push(tabObs);
    body.push(H('8. TRAZABILIDAD DE LA DEPURACIÓN DE DATOS'));
    if (traz.length) body.push(J('Se contrastaron los registros del sistema con la hoja de respaldo «Registros Evaluaciones ETI.». Se aplicaron las siguientes acciones, aprobadas por la Coordinación de Relaciones Laborales. Los registros retirados se conservan en la colección de respaldo «evaluaciones_depuradas» con su motivo, usuario y fecha; ninguna respuesta ni porcentaje fue modificado.'), tabTraz);
    else body.push(J('En el periodo no se registraron depuraciones, restauraciones ni correcciones de fecha sobre los registros del sistema.'));
    body.push(H('9. CONCLUSIONES'),
      li('En el periodo se evaluó a ' + ALL.n + ' trabajadores en ' + ALL.rutas + ' rutas o áreas' + (o.emp ? ' de ' + o.emp : ' de RAPEL S.A.C. y VERFRUT S.A.C.') + ', con un resultado promedio ponderado de ' + pct(ALL.res) + '.'),
      li(ALL.apR + ' de ' + ALL.rutas + ' rutas (' + pct(ALL.rutas ? ALL.apR / ALL.rutas * 100 : 0) + ') alcanzaron el resultado aprobatorio (≥ 70 %), que abarca al ' + pct(ALL.n ? ALL.apN / ALL.n * 100 : 0) + ' de los evaluados.'),
      li('Los temas con menor logro promedio son ' + peor[0][0] + ' (' + pct(peor[0][1]) + ') y ' + peor[1][0] + ' (' + pct(peor[1][1]) + '); el de mayor logro es ' + peor[peor.length - 1][0] + ' (' + pct(peor[peor.length - 1][1]) + ').'),
      li(obs.length ? 'Las rutas listadas en la sección 7 requieren reforzamiento en los temas indicados.' : 'Ninguna ruta presenta temas con logro inferior al 70 %.'),
      P_(''), H('10. APROBACIÓN'), firmas);
    var doc = new Document({ numbering: { config: [{ reference: 'vi', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 500, hanging: 260 } } } }] }] },
      styles: { default: { document: { run: { font: FONT, size: 20 } } } },
      sections: [{ properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 1300, bottom: 1100, left: 1440, right: 1440, header: 500, footer: 400 } } },
        headers: { default: new Header({ children: [hdr, new Paragraph({ spacing: { after: 80 }, children: [] })] }) }, footers: { default: new Footer({ children: foot }) }, children: body }] });
    return Packer.toBlob(doc);
  }

  /* ── Excel ── */
  function excel(o, D) {
    var X = window.XLSX, T = D.T, rutas = D.rutas, wb = X.utils.book_new();
    var pa = [['Parámetros de evaluación ETI'], ['Pesos por tema y umbral de aprobación usados en todo el libro (banco de preguntas vigente del sistema)'], [], ['Tema', 'Peso', 'Umbral de logro']];
    T.forEach(function (t) { pa.push([t.nom, t.peso, { f: '$B$' + (5 + T.length + 1) }]); });
    pa.push(['Suma de pesos', { f: 'SUM(B5:B' + (4 + T.length) + ')' }]); pa.push(['Umbral de aprobación (ruta y tema)', 0.7]);
    var wsP = X.utils.aoa_to_sheet(pa); wsP['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 16 }];
    var cab = ['Fecha evaluación', 'Empresa', 'Supervisor responsable', 'Sector', 'Tipo de personal', 'Modalidad', 'Ruta / Área', 'Código', 'N.º evaluados'].concat(T.map(function (t) { return t.nom; })).concat(['Resultado ponderado', 'Resultado registrado', 'Estado', 'Registro a destiempo', 'Motivo', 'Registrado por', 'Nota']);
    var de = [['Detalle de evaluaciones ETI por ruta · ' + (o.emp || 'RAPEL S.A.C. y VERFRUT S.A.C.') + ' · ' + fF(o.desde) + ' al ' + fF(o.hasta)], ['% logrado por tema tal como se registró; resultado ponderado y estado calculados con la hoja Parámetros.'], [], cab];
    var c0 = 10, colL = function (i) { return X.utils.encode_col(i); }, U = 'Parámetros!$B$' + (6 + T.length);
    rutas.forEach(function (r, k) { var row = 5 + k, f = T.map(function (_, i) { return colL(c0 - 1 + i) + row + '*Parámetros!$B$' + (5 + i); }).join('+');
      de.push([r.fecha, r.emp, r.sup, r.sector, r.tipo === 'empleado' ? 'Empleado' : 'Obrero', r.mod, r.nom, r.cod || '—', r.n].concat(r.t.map(function (x) { return Math.round(x * 10) / 1000; }))
        .concat([{ f: f }, Math.round(r.res * 10) / 1000, { f: 'IF(' + colL(c0 + T.length) + row + '>=' + U + ',"APROBADO","REFUERZO")' }, r.dest, r.mot, r.reg, r.nota])); });
    var last = 4 + rutas.length, cn = colL(8);
    de.push(['', '', '', '', '', '', 'TOTAL', '', { f: 'SUM(' + cn + '5:' + cn + last + ')' }].concat(T.concat([0, 0]).map(function (_, i) { var c = colL(c0 - 1 + i); return { f: 'IFERROR(SUMPRODUCT(' + c + '5:' + c + last + ',$' + cn + '$5:$' + cn + '$' + last + ')/$' + cn + '$' + (last + 1) + ',0)' }; })));
    var wsD = X.utils.aoa_to_sheet(de); wsD['!cols'] = [12, 15, 26, 15, 11, 9, 30, 8, 9].concat(T.map(function () { return 11; })).concat([12, 12, 11, 20, 45, 26, 45]).map(function (w) { return { wch: w }; });
    for (var rr = 5; rr <= last + 1; rr++) for (var cc = c0 - 1; cc <= c0 + T.length; cc++) { var a = colL(cc) + rr; if (wsD[a]) wsD[a].z = '0.0%'; }
    wsD['!autofilter'] = { ref: 'A4:' + colL(cab.length - 1) + last };
    var DR = "'Detalle por ruta'!", rg = function (c) { return DR + '$' + c + '$5:$' + c + '$' + last; }, cEmp = 'B', cSup = 'C', cSec = 'D', cN = cn, cRes = colL(c0 + T.length), cReg = colL(c0 + T.length + 1), cEst = colL(c0 + T.length + 2);
    var EMPS = (o.emp ? [o.emp] : ['RAPEL S.A.C.', 'VERFRUT S.A.C.']);
    var rs = [['Resumen consolidado de evaluaciones ETI · ' + (o.emp || 'RAPEL S.A.C. y VERFRUT S.A.C.')], ['Periodo ' + fF(o.desde) + ' al ' + fF(o.hasta) + ' · cifras calculadas desde «Detalle por ruta»'], [], ['Empresa', 'Rutas', 'Evaluados', 'Rutas aprobadas', 'Evaluados en rutas aprobadas', '% evaluados en rutas aprobadas', 'Resultado promedio ponderado'].concat(T.map(function (t) { return t.nom; }))];
    EMPS.forEach(function (e, i) { var r = 5 + i; rs.push([e, { f: 'COUNTIFS(' + rg(cEmp) + ',A' + r + ')' }, { f: 'SUMIFS(' + rg(cN) + ',' + rg(cEmp) + ',A' + r + ')' }, { f: 'COUNTIFS(' + rg(cEmp) + ',A' + r + ',' + rg(cEst) + ',"APROBADO")' }, { f: 'SUMIFS(' + rg(cN) + ',' + rg(cEmp) + ',A' + r + ',' + rg(cEst) + ',"APROBADO")' }, { f: 'IFERROR(E' + r + '/C' + r + ',0)' }, { f: 'IFERROR(SUMPRODUCT((' + rg(cEmp) + '=A' + r + ')*' + rg(cReg) + '*' + rg(cN) + ')/C' + r + ',0)' }]
      .concat(T.map(function (_, k) { var c = colL(c0 - 1 + k); return { f: 'IFERROR(SUMPRODUCT((' + rg(cEmp) + '=$A' + r + ')*' + rg(c) + '*' + rg(cN) + ')/$C' + r + ',0)' }; }))); });
    var wsR = X.utils.aoa_to_sheet(rs); wsR['!cols'] = [18, 8, 11, 11, 14, 14, 14].concat(T.map(function () { return 14; })).map(function (w) { return { wch: w }; });
    for (var r1 = 5; r1 < 5 + EMPS.length; r1++) for (var c1 = 5; c1 < 7 + T.length; c1++) { var a1 = colL(c1) + r1; if (wsR[a1]) wsR[a1].z = '0.0%'; }
    var keys = []; rutas.forEach(function (r) { var k = r.sup + '|' + r.sector + '|' + r.emp; if (keys.indexOf(k) < 0) keys.push(k); }); keys.sort(function (a, b) { return a.localeCompare(b, 'es'); });
    var ps = [['Resultados por supervisor y sector'], ['Cada supervisor y sector por separado'], [], ['Supervisor responsable', 'Sector', 'Empresa', 'Rutas', 'Evaluados', 'Rutas aprobadas', 'Resultado promedio ponderado'].concat(T.map(function (t) { return t.nom; }))];
    keys.forEach(function (k, i) { var p = k.split('|'), r = 5 + i, cond = '(' + rg(cSup) + '=$A' + r + ')*(' + rg(cSec) + '=$B' + r + ')*(' + rg(cEmp) + '=$C' + r + ')';
      ps.push([p[0], p[1], p[2], { f: 'COUNTIFS(' + rg(cSup) + ',A' + r + ',' + rg(cSec) + ',B' + r + ',' + rg(cEmp) + ',C' + r + ')' }, { f: 'SUMIFS(' + rg(cN) + ',' + rg(cSup) + ',A' + r + ',' + rg(cSec) + ',B' + r + ',' + rg(cEmp) + ',C' + r + ')' }, { f: 'COUNTIFS(' + rg(cSup) + ',A' + r + ',' + rg(cSec) + ',B' + r + ',' + rg(cEmp) + ',C' + r + ',' + rg(cEst) + ',"APROBADO")' }, { f: 'IFERROR(SUMPRODUCT(' + cond + '*' + rg(cReg) + '*' + rg(cN) + ')/E' + r + ',0)' }]
        .concat(T.map(function (_, q) { var c = colL(c0 - 1 + q); return { f: 'IFERROR(SUMPRODUCT(' + cond + '*' + rg(c) + '*' + rg(cN) + ')/$E' + r + ',0)' }; }))); });
    var wsS = X.utils.aoa_to_sheet(ps); wsS['!cols'] = [28, 16, 15, 8, 11, 11, 14].concat(T.map(function () { return 14; })).map(function (w) { return { wch: w }; });
    for (var r2 = 5; r2 < 5 + keys.length; r2++) for (var c2 = 6; c2 < 7 + T.length; c2++) { var a2 = colL(c2) + r2; if (wsS[a2]) wsS[a2].z = '0.0%'; }
    var wsT = X.utils.aoa_to_sheet([['Trazabilidad de la depuración de datos'], ['Lo retirado se conserva en «evaluaciones_depuradas» con motivo, usuario y fecha.'], [], ['Acción', 'Fecha de evaluación', 'Supervisor · Sector', 'Detalle']].concat(D.traz.length ? D.traz : [['Sin depuraciones en el periodo', '', '', '']]));
    wsT['!cols'] = [{ wch: 26 }, { wch: 16 }, { wch: 40 }, { wch: 90 }];
    X.utils.book_append_sheet(wb, wsR, 'Resumen'); X.utils.book_append_sheet(wb, wsD, 'Detalle por ruta'); X.utils.book_append_sheet(wb, wsS, 'Por supervisor'); X.utils.book_append_sheet(wb, wsT, 'Trazabilidad'); X.utils.book_append_sheet(wb, wsP, 'Parámetros');
    var out = X.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }


  /* ── Hojas por ruta (imprimir / PDF), mismo formato que la Hoja de respuestas para auditoría ── */
  function hojas(o, D, w) {
    var T = D.T, R = D.rutas, e = function (x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    var p1 = function (x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ',') + '%'; };
    var css = '@page{size:A4;margin:11mm}*{box-sizing:border-box}body{font:11px/1.35 "Segoe UI",Arial,sans-serif;color:#14213D;margin:0;background:#EEF2F8;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      '.bar{position:sticky;top:0;background:#0F2748;color:#fff;padding:10px 16px;display:flex;gap:10px;align-items:center;justify-content:space-between;z-index:5}.bar button{background:#fff;color:#0F2748;border:0;border-radius:6px;padding:8px 14px;font-weight:700;cursor:pointer}' +
      '.hoja{background:#fff;max-width:200mm;margin:12px auto;padding:9mm;box-shadow:0 2px 10px rgba(0,0,0,.08);page-break-after:always}.hoja:last-child{page-break-after:auto}' +
      'h1{font-size:17px;margin:0 0 3px;color:#0B2A6F}h2{font-size:13px;margin:0}.mut{color:#5B6B85}.franja{background:#0B2A6F;color:#fff;border-radius:8px;padding:8px 12px;margin-bottom:8px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.franja b{font-size:12.5px}.franja span{font-size:10.5px;opacity:.9}' +
      '.cab{display:grid;grid-template-columns:repeat(4,1fr);gap:4px 12px;border:1px solid #D9E0EC;border-radius:8px;padding:7px 9px;margin:7px 0;background:#F8FAFD}.cab b{display:block;font-size:10.5px}.cab span{font-size:8.5px;color:#5B6B85;text-transform:uppercase;letter-spacing:.3px}' +
      'table{width:100%;border-collapse:collapse;margin-top:6px}th{background:#E6EBF2;color:#3D4C63;font-size:9px;text-transform:uppercase;letter-spacing:.3px;padding:6px;border:1px solid #D9E0EC;text-align:left}td{padding:6px;border:1px solid #D9E0EC;font-size:10.5px}.c{text-align:center}.ok{color:#0B6B36;font-weight:700;background:#E6F7EE}.no{color:#B00020;font-weight:700;background:#FDE4E7}tfoot td{font-weight:800;background:#F3F5F8}' +
      '.res{display:flex;justify-content:space-between;align-items:center;gap:8px}.badge{border-radius:99px;padding:3px 10px;font-weight:800}' +
      '@media print{body{background:#fff}.bar{display:none}.hoja{box-shadow:none;margin:0;max-width:none;padding:0}}';
    var empTxt = o.emp ? RAZON[o.emp] : 'Sociedad Agricola Rapel S.A.C. · Sociedad Exportadora Verfrut S.A.C.';
    var n = R.reduce(function (a, r) { return a + r.n; }, 0);
    var html = '<section class="hoja"><h1>Hoja de resultados por ruta · Evaluaciones ETI</h1><div class="mut">Evaluación de Conocimiento de Buenas Prácticas Sociales y Laborales · evidencia para auditoría</div>' +
      '<div class="cab"><div><span>Empresa</span><b>' + e(empTxt) + '</b></div><div><span>Periodo</span><b>' + e(fF(o.desde) + ' al ' + fF(o.hasta)) + '</b></div><div><span>Hojas</span><b>' + R.length + ' rutas / áreas</b></div><div><span>Evaluados</span><b>' + n + '</b></div></div>' +
      '<p class="mut">Las evaluaciones manuales se registran por grupo (ruta o área): el sistema guarda el porcentaje logrado por el grupo en cada tema y el resultado ponderado. Cada hoja muestra esos porcentajes con su peso y el puntaje que aportan al resultado; la respuesta individual de cada trabajador no forma parte del registro manual.' + (o.qr ? ' Las rutas evaluadas por QR muestran el promedio de las respuestas individuales.' : '') + '</p>' +
      '<table><thead><tr><th>Tema</th><th class="c">Peso</th><th class="c">Umbral</th></tr></thead><tbody>' + T.map(function (t) { return '<tr><td>' + e(t.nom) + '</td><td class="c">' + Math.round(t.peso * 100) + '%</td><td class="c">≥ 70%</td></tr>'; }).join('') + '</tbody></table></section>';
    var num = 0, grupos = [];
    R.forEach(function (r) { var k = r.sup + '|' + r.sector; if (grupos.indexOf(k) < 0) grupos.push(k); });
    grupos.sort(function (a, b) { return a.localeCompare(b, 'es'); }).forEach(function (k) {
      R.filter(function (r) { return r.sup + '|' + r.sector === k; }).forEach(function (r) {
        num++; var a = r.res >= 70, tot = 0;
        var filas = T.map(function (t, i) { var pts = r.t[i] * t.peso; tot += pts; var ok = r.t[i] >= 70;
          return '<tr><td class="c">' + (i + 1) + '</td><td>' + e(t.nom) + '</td><td class="c">' + Math.round(t.peso * 100) + '%</td><td class="c">' + p1(r.t[i]) + '</td><td class="c">' + p1(pts) + '</td><td class="c ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓ Logrado' : '✗ Observado') + '</td></tr>'; }).join('');
        html += '<section class="hoja"><div class="franja"><b>' + e(r.sup) + ' · ' + e(r.sector) + '</b><span>Hoja N° ' + num + '</span></div>' +
          '<div class="res"><h2>Ruta / área: ' + e(r.nom || '—') + '</h2><span class="badge" style="background:' + (a ? '#E6F7EE;color:#0B6B36' : '#FDE4E7;color:#B00020') + '">' + p1(r.res) + ' · ' + (a ? 'APROBADO' : 'REFUERZO') + '</span></div>' +
          '<div class="cab"><div><span>Fecha de evaluación</span><b>' + e(fF(r.fecha)) + '</b></div><div><span>Empresa</span><b>' + e(RAZON[r.emp] || r.emp) + '</b></div><div><span>Tipo</span><b>' + (r.tipo === 'empleado' ? 'Empleado' : 'Obrero') + '</b></div><div><span>Código</span><b>' + e(r.cod || '—') + '</b></div>' +
          '<div><span>N.º de evaluados</span><b>' + r.n + '</b></div><div><span>Modalidad</span><b>' + (r.mod === 'QR' ? 'QR (individual)' : 'Manual (por grupo)') + '</b></div><div><span>Responsable</span><b>' + e(r.sup) + '</b></div><div><span>Registrado por</span><b>' + e(r.reg || '—') + '</b></div></div>' +
          (r.dest ? '<div class="mut" style="margin:4px 0">Registro a destiempo (' + e(r.dest) + '): ' + e(r.mot) + '</div>' : '') +
          '<table><thead><tr><th class="c" style="width:5%">N°</th><th style="width:37%">Tema evaluado</th><th class="c" style="width:10%">Peso</th><th class="c" style="width:14%">% logrado</th><th class="c" style="width:16%">Puntaje ponderado</th><th class="c" style="width:18%">Estado (≥ 70%)</th></tr></thead><tbody>' + filas + '</tbody>' +
          '<tfoot><tr><td></td><td>RESULTADO DEL GRUPO</td><td class="c">100%</td><td></td><td class="c">' + p1(r.res) + '</td><td class="c ' + (a ? 'ok' : 'no') + '">' + (a ? 'APROBADO' : 'REFUERZO') + '</td></tr></tfoot></table></section>';
      });
    });
    if (!w || w.closed) throw new Error('El navegador bloqueó la ventana: permite ventanas emergentes para este sitio');
    w.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Hojas por ruta ETI ' + e((o.emp || 'RAPEL-VERFRUT') + ' ' + o.desde + ' al ' + o.hasta) + '</title><style>' + css + '</style></head><body><div class="bar"><b>Hojas de resultados por ruta · ' + R.length + ' hojas</b><button onclick="window.print()">Imprimir / Guardar PDF</button></div>' + html + '</body></html>');
    w.document.close();
  }
  /* ── Ventana y botón ── */
  function abrir() {
    if (!esAdmin()) { if (typeof toast === 'function') toast('Solo el administrador emite el informe para auditoría', 'e'); return; }
    var ov = $('iaOv'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'iaOv';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(15,39,72,.55);z-index:99990;display:flex;align-items:center;justify-content:center;padding:16px';
    var fl = 'display:block;font-size:11px;font-weight:700;color:#5B6B82;text-transform:uppercase;letter-spacing:.4px;margin:12px 0 5px';
    ov.innerHTML = '<div style="background:#fff;border-radius:8px;max-width:520px;width:100%;font-family:Inter,Segoe UI,Arial,sans-serif;box-shadow:0 20px 50px rgba(15,39,72,.25)">' +
      '<div style="padding:14px 20px;background:#EDF1F6;border-bottom:1px solid #D6DEE9;border-radius:8px 8px 0 0;font-weight:700;color:#0F2748">Informe consolidado para auditoría</div>' +
      '<div style="padding:6px 20px 16px">' +
      '<label style="' + fl + '">Empresa</label><select id="iaEmp" class="fc" style="width:100%"><option value="RAPEL S.A.C.">RAPEL S.A.C. · Sociedad Agricola Rapel S.A.C.</option><option value="VERFRUT S.A.C.">VERFRUT S.A.C. · Sociedad Exportadora Verfrut S.A.C.</option><option value="">Ambas empresas</option></select>' +
      '<div style="display:flex;gap:10px"><div style="flex:1"><label style="' + fl + '">Desde</label><input id="iaDes" type="date" class="fc" style="width:100%" value="2026-06-19"></div><div style="flex:1"><label style="' + fl + '">Hasta</label><input id="iaHas" type="date" class="fc" style="width:100%" value="' + hoyI() + '"></div></div>' +
      '<label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:13px;color:#1F2A3C"><input id="iaQr" type="checkbox"> Incluir evaluaciones por QR (agrupadas por ruta y código)</label>' +
      '<div id="iaMsg" style="font-size:12px;color:#5B6B82;margin-top:10px;min-height:16px"></div></div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 20px;border-top:1px solid #D6DEE9;background:#F8FAFC;border-radius:0 0 8px 8px">' +
      '<button class="btn bout" id="iaCan">Cancelar</button><button class="btn bout" id="iaHoj">Hojas por ruta (PDF)</button><button class="btn bout" id="iaXls">Descargar Excel</button><button class="btn bpri" id="iaDoc">Descargar Word</button></div></div>';
    document.body.appendChild(ov);
    $('iaCan').onclick = function () { ov.remove(); };
    var go = async function (tipo) {
      var win = tipo === 'hoj' ? window.open('', '_blank') : null;
      if (win) { try { win.document.write('<p style="font:14px Arial;padding:20px">Preparando hojas por ruta…</p>'); } catch (e) {} }
      var o = { emp: $('iaEmp').value, desde: $('iaDes').value, hasta: $('iaHas').value, qr: $('iaQr').checked }, msg = $('iaMsg');
      if (!o.desde || !o.hasta || o.desde > o.hasta) { msg.textContent = 'Revisa el periodo.'; return; }
      msg.textContent = 'Leyendo evaluaciones del sistema…';
      try {
        await libs(); var D = await datos(o);
        if (!D.rutas.length) { msg.textContent = 'No hay evaluaciones registradas para ese filtro.'; if (win) win.close(); return; }
        var base = 'Informe-Auditoria-ETI-' + (o.emp ? o.emp.split(' ')[0] : 'RAPEL-VERFRUT') + '-' + o.desde + '_' + o.hasta;
        msg.textContent = 'Generando ' + (tipo === 'doc' ? 'Word' : tipo === 'hoj' ? 'hojas por ruta' : 'Excel') + '…';
        if (tipo === 'doc') bajar(await word(o, D), base + '.docx'); else if (tipo === 'hoj') { try { win.document.open(); } catch (e) {} hojas(o, D, win); } else bajar(excel(o, D), base + '-anexo.xlsx');
        var n = D.rutas.reduce(function (a, r) { return a + r.n; }, 0);
        msg.textContent = 'Listo: ' + D.rutas.length + ' rutas · ' + n + ' evaluados.';
      } catch (e) { console.error(e); msg.textContent = 'No se pudo generar: ' + e.message; if (win && !win.closed && tipo === 'hoj') try { win.close(); } catch (x) {} }
    };
    $('iaDoc').onclick = function () { go('doc'); }; $('iaXls').onclick = function () { go('xls'); }; $('iaHoj').onclick = function () { go('hoj'); };
  }
  window.etiInformeAuditoria = abrir;
  function ponerBoton() {
    if (!esAdmin()) return; var box = $('mis-box'); if (!box || $('iaBtn')) return;
    var fila = box.querySelector('input[type=date]'); fila = fila && fila.parentNode; if (!fila) return;
    var b = document.createElement('button'); b.id = 'iaBtn'; b.className = 'btn bpri bsm'; b.type = 'button'; b.textContent = 'Informe para auditoría'; b.title = 'Word (cabecera GH-04) y Excel anexo, por empresa y periodo'; b.onclick = abrir;
    fila.appendChild(b);
  }
  try { new MutationObserver(function () { ponerBoton(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  setTimeout(ponerBoton, 1500);
})();
