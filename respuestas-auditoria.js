/* ═══════════════════════════════════════════════════════════════════════════
   _RESPUESTAS_AUDITORIA_V1 (18-oct-2026) · v3 — Evidencia de respuestas por evaluación (auditoría)
   ---------------------------------------------------------------------------
   En "Evaluaciones por supervisor" (solo administrador) agrega el botón 🧾 Respuestas (auditoría).
   Con el rango, empresa y tipo elegidos en pantalla:
     · Muestra QUÉ SUPERVISORES tienen evaluaciones en esas fechas, separados por SECTOR
       (si en pantalla hay un supervisor elegido, solo ese).
     · Por cada supervisor / sector (o todo junto) descarga:
         📥 Excel con formato (ExcelJS): Resumen · Respuestas (agrupado supervisor → sector → evaluación,
            con colores ✓ ½ ✗) · Matriz · Manuales · Nota
         🖨 Hojas de respuesta (imprimir / PDF): portada, separador por supervisor y sector,
            una hoja por evaluación, y resumen de los registros manuales.
   SOLO LEE Firestore (respuestas_qr, sesiones_qr, banco_historial, evaluaciones_conocimiento).
   No escribe nada ni cambia otra función. Para quitarlo: borrar su <script>.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window._RESP_AUD_V1) return; window._RESP_AUD_V1 = true;
  var SAL = 'ETI-QR';
  var EXCELJS = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, ''); }
  function ses() { try { return JSON.parse(sessionStorage.getItem('eti_session') || 'null'); } catch (e) { return null; } }
  function esAdm() { var s = ses(); return !!(s && s.rol === 'admin'); }
  function fs() { try { return firebase.firestore(); } catch (e) { return null; } }
  function fF(iso) { return iso ? String(iso).split('-').reverse().join('/') : ''; }
  function hora(ts) { return ts ? new Date(ts).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''; }
  function pc(v) { return Math.round((+v || 0) * 1000) / 10; }
  function aviso(m, t) { try { if (typeof toast === 'function') return toast(m, t || 'i'); } catch (e) {} console.log(m); }
  function sha(t) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)).then(function (b) { return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('').slice(0, 16); }); }
  function coincide(a, b) { var x = norm(a), y = norm(b); return !!x && !!y && (x === y || x.indexOf(y) >= 0 || y.indexOf(x) >= 0); }
  function secTxt(s) { return String(s || '').trim() || 'Sin sector'; }
  function supTxt(s) { return String(s || '').trim() || 'Sin supervisor'; }
  function tituloSup(s) { return supTxt(s).toLowerCase().replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); }); }
  function cmp(a, b) { return String(a).localeCompare(String(b), 'es', { sensitivity: 'base', numeric: true }); }

  /* ── filtros que el administrador tiene elegidos en pantalla ── */
  function filtrosPantalla() {
    var box = $('mis-box'); var f = { desde: '', hasta: '', sup: '', emp: '', tipo: '', mod: '' };
    if (!box) return f;
    var fechas = box.querySelectorAll('input[type=date]'); if (fechas[0]) f.desde = fechas[0].value; if (fechas[1]) f.hasta = fechas[1].value;
    box.querySelectorAll('select').forEach(function (s) {
      var oc = s.getAttribute('onchange') || '', v = s.value;
      if (/ETIMIS\.sup/.test(oc)) f.sup = (v === '*' ? '' : v);
      else if (/'emp'/.test(oc)) f.emp = v; else if (/'tipo'/.test(oc)) f.tipo = v; else if (/'mod'/.test(oc)) f.mod = v;
    });
    return f;
  }

  /* ── datos del rango (todos los supervisores; luego se separa en memoria) ── */
  async function cargar(F) {
    var db = fs(); if (!db) throw new Error('Sin conexión a Firebase');
    var qr = [], man = [];
    if (F.mod !== 'MANUAL') {
      var qs = await db.collection('respuestas_qr').where('fecha', '>=', F.desde).where('fecha', '<=', F.hasta).get();
      qr = qs.docs.map(function (d) { var x = d.data(); x.id = d.id; return x; });
    }
    if (F.mod !== 'QR') {
      try { var ms = await db.collection('evaluaciones_conocimiento').where('fecha', '>=', F.desde).where('fecha', '<=', F.hasta).get();
        man = ms.docs.map(function (d) { var x = d.data(); x.id = d.id; return x; }).filter(function (m) { return m.modalidad !== 'QR'; }); } catch (e) { man = []; }
    }
    function pasa(r) { return (!F.sup || coincide(r.sup, F.sup)) && (!F.emp || r.emp === F.emp) && (!F.tipo || (r.tipo || 'obrero') === F.tipo); }
    qr = qr.filter(pasa); man = man.filter(pasa);
    function orden(a, b) { return cmp(supTxt(a.sup), supTxt(b.sup)) || cmp(secTxt(a.sector), secTxt(b.sector)) || (a.fecha || '').localeCompare(b.fecha || '') || (a.ts || 0) - (b.ts || 0); }
    qr.sort(orden); man.sort(orden);
    /* banco con el que se respondió cada evaluación */
    var S = {}, H = {};
    for (var id of new Set(qr.map(function (r) { return r.sesion; }).filter(Boolean))) { try { var d = await db.collection('sesiones_qr').doc(id).get(); if (d.exists) S[id] = d.data(); } catch (e) {} }
    for (var v of new Set(qr.map(function (r) { return r.bancoVersion || 0; }).filter(function (v) { return v > 0; }))) {
      try { var h = await db.collection('banco_historial').where('version', '==', v).limit(1).get(); if (!h.empty) H[v] = h.docs[0].data(); } catch (e) {} }
    var claves = {};
    async function correctasSesion(sid, p) {
      var k = sid + '|' + p.n; if (claves[k]) return claves[k];
      var hs = await Promise.all((p.ops || []).map(function (_, i) { return sha(sid + '|' + p.n + '|' + i + '|' + SAL); }));
      var c = []; hs.forEach(function (x, i) { if ((p.k || []).indexOf(x) >= 0) c.push(i); }); claves[k] = c; return c;
    }
    var evals = [];
    for (var i = 0; i < qr.length; i++) {
      var r = qr[i], s = S[r.sesion], banco = null, nota = '';
      if (s && (s.bancoVersion || 0) === (r.bancoVersion || 0)) {
        banco = [];
        for (var sec of (s.banco || [])) { var ps = []; for (var p of (sec.pregs || [])) ps.push({ n: p.n, t: p.t, tipo: p.tipo, max: +p.max || 0, ops: p.ops || [], ok: await correctasSesion(r.sesion, p) }); banco.push({ nom: sec.nom, pregs: ps }); }
      } else if (H[r.bancoVersion || 0]) {
        banco = (H[r.bancoVersion].secs || []).map(function (sec) { return { nom: sec.nom, pregs: (sec.pregs || []).filter(function (p) { return p.vb !== false; }).map(function (p) {
          var ops = (p.ops || []).map(function (o) { return Array.isArray(o) ? o[0] : (o && (o.t || o.texto)) || String(o); });
          var ok = []; (p.ops || []).forEach(function (o, j) { if ((Array.isArray(o) && +o[1] === 1) || (o && (o.ok || o.c))) ok.push(j); });
          return { n: p.n, t: p.tq || p.t, tipo: p.tipo, max: +p.max || +p.pct || 0, ops: ops, ok: ok }; }) }; }).filter(function (sec) { return sec.pregs.length; });
      } else { nota = 'Versión del banco de preguntas no disponible: se muestra solo el puntaje por pregunta.'; }
      var filas = [], ok = 0, tot = 0;
      (banco || []).forEach(function (sec) { sec.pregs.forEach(function (p) {
        var sel = ((r.resp || {})[p.n]) || [], pts = +((r.pts || {})[p.n]) || 0, mx = p.max || 0;
        var est = mx && pts >= mx - 1e-6 ? 'Correcta' : (pts > 0 ? 'Parcial' : 'Incorrecta'); if (est === 'Correcta') ok++; tot++;
        filas.push({ tema: sec.nom, n: p.n, t: p.t, multi: p.tipo === 'multiple', marcada: sel.map(function (j) { return p.ops[j]; }).filter(Boolean), correcta: (p.ok || []).map(function (j) { return p.ops[j]; }).filter(Boolean), est: est, pts: pts, max: mx });
      }); });
      if (!banco) Object.keys(r.pts || {}).sort(function (a, b) { return a - b; }).forEach(function (n) { var pts = +r.pts[n] || 0; tot++; filas.push({ tema: '', n: +n, t: '(texto no disponible)', marcada: [], correcta: [], est: pts > 0 ? 'Con puntaje' : 'Sin puntaje', pts: pts, max: '' }); });
      evals.push({ r: r, filas: filas, ok: ok, tot: tot, nota: nota, sup: supTxt(r.sup), sector: secTxt(r.sector) });
    }
    man.forEach(function (m) { m._sup = supTxt(m.sup); m._sector = secTxt(m.sector); });
    /* _DETALLE_MANUAL_V1: evaluaciones manuales que ya guardan el puntaje de cada evaluado → una hoja por evaluado */
    var restoMan = [];
    man.forEach(function (m) {
      var B = m.detBanco, sinDet = [];
      (m.rutas || []).forEach(function (rt, ri) {
        if (!B || !rt.det || !(rt.det.ev || []).length) { sinDet.push(rt); return; }
        var secMap = {}; (B.secs || []).forEach(function (s) { secMap[s.id] = s; });
        rt.det.ev.forEach(function (ev) {
          var vals = String(ev.p || '').split(','), filas = [], ok = 0, tot = 0, sums = {};
          (B.pregs || []).forEach(function (p, k) {
            var raw = vals[k], blanco = raw === undefined || raw === '', v = blanco ? 0 : (+raw || 0), mx = +p.max || 0;
            sums[p.s] = (sums[p.s] || 0) + v * (+p.f || 1);
            var est = blanco ? 'Incorrecta' : (mx && v >= mx - 1e-6 ? 'Correcta' : (v > 0 ? 'Parcial' : 'Incorrecta')); if (est === 'Correcta') ok++; tot++;
            filas.push({ tema: (secMap[p.s] || {}).nom || '', n: p.n, t: p.t, multi: false, manual: true,
              marcada: [blanco ? 'En blanco (no respondió)' : 'Puntaje anotado: ' + v + ' de ' + mx], correcta: ['Puntaje máximo: ' + mx], est: est, pts: v, max: mx });
          });
          var secs = (B.secs || []).map(function (s) { var pct = s.maxSec ? (sums[s.id] || 0) / s.maxSec : 0; return { nom: s.nom, pct: pct, peso: s.peso }; });
          var res = secs.reduce(function (a, s) { return a + s.pct * (+s.peso || 0); }, 0);
          evals.push({ manualDet: true, r: { id: (m.id || '') + '·' + (ri + 1) + '·' + ev.i, sup: m.sup, sector: m.sector, fecha: m.fecha, ts: m.ts, ruta: rt.nom, cod: rt.cod, tipo: m.tipo, emp: m.emp,
              resultado: Math.round(res * 10000) / 10000, estado: res >= 0.7 ? 'APROBADO' : 'REFUERZO', secs: secs, sesion: '', evaluado: ev.i, registradoPor: m.nomUsuario || m.usuario || '', usuarioSup: m.usuario || '', cobertura: m.cobertura || null },
            filas: filas, ok: ok, tot: tot, nota: '', sup: m._sup, sector: m._sector });
        });
      });
      if (sinDet.length) { if (sinDet.length === (m.rutas || []).length) restoMan.push(m); else { var c = Object.assign({}, m); c.rutas = sinDet; restoMan.push(c); } }
    });
    man = restoMan;
    /* _COBERTURAS_ETI_V1: ¿la evaluación se hizo cubriendo a otro supervisor? (dato guardado o reemplazo registrado en el RR.LL.) */
    evals.forEach(function (e) { try { e.cob = e.r.cobertura || (window.ETICob && (ETICob.deReemplazo(e.r.usuarioSup || '', e.r.fecha) || ETICob.deReemplazo(e.sup, e.r.fecha))) || null; } catch (x) { e.cob = null; } });
    evals.sort(function (a, b) { return cmp(a.sup, b.sup) || cmp(a.sector, b.sector) || (a.r.fecha || '').localeCompare(b.r.fecha || '') || (a.r.ts || 0) - (b.r.ts || 0) || cmp(a.r.ruta || '', b.r.ruta || '') || (a.r.evaluado || 0) - (b.r.evaluado || 0); });
    return { evals: evals, man: man };
  }
  function modTxt(e) { return e.manualDet ? 'Manual · evaluado N° ' + e.r.evaluado : 'QR'; }

  /* ── separar por supervisor y sector ── */
  function grupos(D) {
    var G = new Map();
    function g(sup) { var k = norm(sup); if (!G.has(k)) G.set(k, { sup: sup, qr: 0, md: 0, man: 0, prom: 0, n: 0, sectores: new Map() }); return G.get(k); }
    function gs(x, sector) { var k = norm(sector) || 'sinsector'; if (!x.sectores.has(k)) x.sectores.set(k, { sector: sector, qr: 0, md: 0, man: 0 }); return x.sectores.get(k); }
    /* qr = evaluaciones CON DETALLE (QR + manual con detalle); md = de ellas, las manuales */
    D.evals.forEach(function (e) { var x = g(e.sup), s = gs(x, e.sector); x.qr++; s.qr++; if (e.manualDet) { x.md++; s.md++; } x.prom += (+e.r.resultado || 0); x.n++; });
    D.man.forEach(function (m) { var x = g(m._sup), ne = (m.rutas || []).reduce(function (a, r) { return a + (+r.ne || 1); }, 0); x.man += ne; (m.rutas || []).forEach(function (r) { x.prom += (+r.resGrupo || 0) * (+r.ne || 1); x.n += (+r.ne || 1); }); gs(x, m._sector).man += ne; });
    return [...G.values()].map(function (x) { x.sectores = [...x.sectores.values()].sort(function (a, b) { return cmp(a.sector, b.sector); }); x.prom = x.n ? x.prom / x.n : 0; return x; }).sort(function (a, b) { return cmp(a.sup, b.sup); });
  }
  function subconjunto(D, sup, sector) {
    function ok(s, sc) { return (!sup || norm(s) === norm(sup)) && (!sector || norm(sc) === norm(sector)); }
    var ev = D.evals.filter(function (e) { return ok(e.sup, e.sector); }), mn = D.man.filter(function (m) { return ok(m._sup, m._sector); });
    ev.forEach(function (e, i) { e.num = i + 1; });
    return { evals: ev, man: mn };
  }
  function nombreArchivo(F, sup, sector, ext) {
    return 'ETI-Respuestas-' + F.desde + (F.hasta !== F.desde ? '_a_' + F.hasta : '') + (sup ? '-' + tituloSup(sup).replace(/[^\wÁÉÍÓÚÑáéíóúñ]+/g, '_').slice(0, 30) : '-Todos') + (sector ? '-' + String(sector).replace(/[^\wÁÉÍÓÚÑáéíóúñ]+/g, '_').slice(0, 20) : '') + '.' + ext;
  }

  /* ── Excel con formato (ExcelJS; si no carga, Excel simple con SheetJS) ── */
  function cargarExcelJS() {
    if (window.ExcelJS) return Promise.resolve(true);
    return new Promise(function (ok) { var s = document.createElement('script'); s.src = EXCELJS; s.onload = function () { ok(!!window.ExcelJS); }; s.onerror = function () { ok(false); }; document.head.appendChild(s); setTimeout(function () { ok(!!window.ExcelJS); }, 15000); });
  }
  var C = { navy: 'FF0B2A6F', navy2: 'FF1E3A8A', cab: 'FFE8EEF8', band: 'FFDCE6F7', okF: 'FFE6F7EE', okT: 'FF0B6B36', paF: 'FFFFF1DB', paT: 'FF9A5B00', noF: 'FFFDE4E7', noT: 'FFB00020', gris: 'FF5B6B85', borde: 'FFD0D8E6' };
  function fill(c) { return { type: 'pattern', pattern: 'solid', fgColor: { argb: c } }; }
  var BORDE = { top: { style: 'thin', color: { argb: C.borde } }, left: { style: 'thin', color: { argb: C.borde } }, bottom: { style: 'thin', color: { argb: C.borde } }, right: { style: 'thin', color: { argb: C.borde } } };
  function estilo(est) { return est === 'Correcta' ? [C.okF, C.okT, '✓ Correcta'] : est === 'Parcial' ? [C.paF, C.paT, '½ Parcial'] : est === 'Incorrecta' ? [C.noF, C.noT, '✗ Incorrecta'] : ['FFF1F5FB', C.gris, est]; }

  async function excel(F, D, sup, sector) {
    var hay = await cargarExcelJS();
    if (!hay) return excelSimple(F, D, sup, sector);
    var S = ses() || {}, wb = new ExcelJS.Workbook(); wb.creator = 'Sistema ETI'; wb.created = new Date();
    var titulo = 'Evidencia de respuestas por evaluación — ' + (sup ? tituloSup(sup) : 'Todos los supervisores') + (sector ? ' · ' + sector : '');
    var sub = 'Rango: ' + fF(F.desde) + ' al ' + fF(F.hasta) + (F.emp ? ' · ' + F.emp : '') + (F.tipo ? ' · ' + (F.tipo === 'empleado' ? 'Empleados' : 'Obreros') : '') + ' · Generado por ' + (S.nom || S.user || '') + ' el ' + new Date().toLocaleString('es-PE');
    function cabecera(ws, ncol) {
      ws.mergeCells(1, 1, 1, ncol); ws.mergeCells(2, 1, 2, ncol);
      var a = ws.getCell(1, 1); a.value = titulo; a.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }; a.fill = fill(C.navy); a.alignment = { vertical: 'middle' }; ws.getRow(1).height = 26;
      var b = ws.getCell(2, 1); b.value = sub; b.font = { italic: true, size: 9, color: { argb: C.gris } };
    }
    function encabezados(ws, fila, cols) { var r = ws.getRow(fila); cols.forEach(function (t, i) { var c = r.getCell(i + 1); c.value = t; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = fill(C.navy2); c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; c.border = BORDE; }); r.height = 30; }
    function pctCelda(c, v) { c.value = v / 100; c.numFmt = '0.0%'; var okv = v >= 70; c.font = { bold: true, color: { argb: okv ? C.okT : C.noT } }; c.fill = fill(okv ? C.okF : C.noF); c.alignment = { horizontal: 'center' }; }

    /* 1) Resumen por supervisor y sector */
    var G = grupos(D), wsR = wb.addWorksheet('Resumen', { views: [{ state: 'frozen', ySplit: 4 }] });
    wsR.columns = [{ width: 34 }, { width: 24 }, { width: 14 }, { width: 16 }, { width: 13 }, { width: 13 }, { width: 13 }];
    cabecera(wsR, 7); encabezados(wsR, 4, ['Supervisor', 'Sector / zona', 'Evaluaciones con detalle (QR + manual)', 'Manual sin detalle (evaluados por grupo)', 'Promedio', 'Aprobados', 'Refuerzo']);
    var fr = 5;
    G.forEach(function (g) {
      var r0 = wsR.getRow(fr++); r0.getCell(1).value = tituloSup(g.sup); r0.getCell(3).value = g.qr; r0.getCell(4).value = g.man;
      var evg = D.evals.filter(function (e) { return norm(e.sup) === norm(g.sup); });
      if (evg.length) { pctCelda(r0.getCell(5), pc(evg.reduce(function (a, e) { return a + (+e.r.resultado || 0); }, 0) / evg.length)); r0.getCell(6).value = evg.filter(function (e) { return (+e.r.resultado || 0) >= 0.7; }).length; r0.getCell(7).value = evg.filter(function (e) { return (+e.r.resultado || 0) < 0.7; }).length; }
      for (var i = 1; i <= 7; i++) { var c = r0.getCell(i); c.border = BORDE; if (!c.fill || i < 5) c.fill = fill(C.band); c.font = Object.assign({ bold: true }, c.font || {}); }
      g.sectores.forEach(function (s) {
        var r = wsR.getRow(fr++), evs = evg.filter(function (e) { return norm(e.sector) === norm(s.sector); });
        r.getCell(2).value = s.sector; r.getCell(3).value = s.qr; r.getCell(4).value = s.man;
        if (evs.length) { pctCelda(r.getCell(5), pc(evs.reduce(function (a, e) { return a + (+e.r.resultado || 0); }, 0) / evs.length)); r.getCell(6).value = evs.filter(function (e) { return (+e.r.resultado || 0) >= 0.7; }).length; r.getCell(7).value = evs.filter(function (e) { return (+e.r.resultado || 0) < 0.7; }).length; }
        for (var j = 1; j <= 7; j++) r.getCell(j).border = BORDE;
      });
    });
    var rt = wsR.getRow(fr); rt.getCell(1).value = 'TOTAL'; rt.getCell(3).value = D.evals.length; rt.getCell(4).value = G.reduce(function (a, g) { return a + g.man; }, 0);
    for (var t = 1; t <= 7; t++) { rt.getCell(t).font = { bold: true }; rt.getCell(t).border = BORDE; rt.getCell(t).fill = fill(C.cab); }

    /* 2) Respuestas: supervisor → sector → evaluación → preguntas */
    var ws = wb.addWorksheet('Respuestas', { views: [{ state: 'frozen', ySplit: 4 }], pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
    ws.columns = [{ width: 7 }, { width: 22 }, { width: 58 }, { width: 42 }, { width: 42 }, { width: 14 }, { width: 10 }];
    cabecera(ws, 7); encabezados(ws, 4, ['N°', 'Tema', 'Pregunta', 'Respuesta marcada (QR) / puntaje anotado (manual)', 'Respuesta correcta / puntaje máximo', 'Resultado', 'Puntaje']);
    var fl = 5, supAnt = null, secAnt = null;
    D.evals.forEach(function (e) {
      var r = e.r;
      if (norm(e.sup) !== supAnt) {
        supAnt = norm(e.sup); secAnt = null; ws.mergeCells(fl, 1, fl, 7);
        var cs = ws.getCell(fl, 1); var ng = D.evals.filter(function (x) { return norm(x.sup) === supAnt; }).length;
        cs.value = '👤 SUPERVISOR: ' + tituloSup(e.sup).toUpperCase() + '   ·   ' + ng + ' evaluación(es) con detalle'; cs.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }; cs.fill = fill(C.navy); ws.getRow(fl).height = 22; fl++;
      }
      if (norm(e.sector) !== secAnt) {
        secAnt = norm(e.sector); ws.mergeCells(fl, 1, fl, 7);
        var cz = ws.getCell(fl, 1); var nz = D.evals.filter(function (x) { return norm(x.sup) === supAnt && norm(x.sector) === secAnt; }).length;
        cz.value = '📍 Sector / zona: ' + e.sector + '   ·   ' + nz + ' evaluación(es)'; cz.font = { bold: true, color: { argb: C.navy } }; cz.fill = fill(C.band); fl++;
      }
      ws.mergeCells(fl, 1, fl, 5);
      var ce = ws.getCell(fl, 1), aprob = (+r.resultado || 0) >= 0.7;
      ce.value = 'Evaluación N° ' + e.num + '  ·  ' + modTxt(e) + (e.cob && window.ETICob ? '  ·  🔄 ' + ETICob.texto(e.cob) : '') + '  ·  ' + fF(r.fecha) + ' ' + hora(r.ts) + '  ·  Ruta / área: ' + (r.ruta || '—') + '  ·  Código: ' + (r.cod || '—') + '  ·  ' + (r.tipo === 'empleado' ? 'Empleado' : 'Obrero') + '  ·  Correctas: ' + e.ok + ' de ' + e.tot + '  ·  ID: ' + r.id;
      ce.font = { bold: true, size: 10 }; ce.fill = fill(C.cab);
      var cr = ws.getCell(fl, 6); pctCelda(cr, pc(r.resultado)); var cst = ws.getCell(fl, 7); cst.value = aprob ? 'APROBADO' : 'REFUERZO'; cst.font = { bold: true, color: { argb: aprob ? C.okT : C.noT } }; cst.fill = fill(aprob ? C.okF : C.noF); cst.alignment = { horizontal: 'center' };
      fl++;
      if (e.nota) { ws.mergeCells(fl, 1, fl, 7); var cn = ws.getCell(fl, 1); cn.value = '⚠ ' + e.nota; cn.font = { italic: true, color: { argb: C.paT } }; fl++; }
      e.filas.forEach(function (f) {
        var row = ws.getRow(fl++), st = estilo(f.est);
        row.values = [f.n, f.tema, f.t + (f.multi ? '  (varias respuestas)' : ''), f.marcada.join('\n') || '—', f.correcta.join('\n') || '—', st[2], (f.max !== '' ? f.pts + ' / ' + f.max : f.pts)];
        for (var k = 1; k <= 7; k++) { var c = row.getCell(k); c.border = BORDE; c.alignment = { vertical: 'top', wrapText: true, horizontal: (k === 1 || k >= 6) ? 'center' : 'left' }; }
        var c6 = row.getCell(6); c6.fill = fill(st[0]); c6.font = { bold: true, color: { argb: st[1] } };
        if (f.est !== 'Correcta') row.getCell(4).font = { color: { argb: st[1] } };
      });
      fl++;
    });
    if (!D.evals.length) { ws.mergeCells(5, 1, 5, 7); ws.getCell(5, 1).value = 'No hay evaluaciones por QR en este filtro (las manuales se registran por grupo: ver hoja Manuales).'; ws.getCell(5, 1).font = { italic: true, color: { argb: C.gris } }; }

    /* 3) Matriz ✓ ½ ✗ */
    var nums = []; D.evals.forEach(function (e) { e.filas.forEach(function (f) { if (nums.indexOf(f.n) < 0) nums.push(f.n); }); }); nums.sort(function (a, b) { return a - b; });
    var wsM = wb.addWorksheet('Matriz', { views: [{ state: 'frozen', xSplit: 5, ySplit: 4 }] });
    var colsM = ['N°', 'Supervisor', 'Sector', 'Ruta / área', 'Fecha'].concat(nums.map(function (n) { return 'P' + n; })).concat(['Correctas', 'Resultado']);
    wsM.columns = colsM.map(function (_, i) { return { width: i === 1 ? 26 : i === 2 || i === 3 ? 16 : i < 5 ? 10 : i >= 5 + nums.length ? 12 : 5 }; });
    cabecera(wsM, colsM.length); encabezados(wsM, 4, colsM);
    D.evals.forEach(function (e, i) {
      var row = wsM.getRow(5 + i), vals = [e.num, tituloSup(e.sup), e.sector, e.r.ruta || '', fF(e.r.fecha)];
      nums.forEach(function (n) { var f = e.filas.find(function (x) { return x.n === n; }); vals.push(f ? (f.est === 'Correcta' ? '✓' : f.est === 'Parcial' ? '½' : f.est === 'Incorrecta' ? '✗' : f.pts) : ''); });
      vals.push(e.ok + '/' + e.tot); vals.push(null); row.values = vals;
      for (var k = 1; k <= colsM.length; k++) { var c = row.getCell(k); c.border = BORDE; if (k > 5) c.alignment = { horizontal: 'center' }; }
      nums.forEach(function (n, j) { var c = row.getCell(6 + j), f = e.filas.find(function (x) { return x.n === n; }); if (f) { var st = estilo(f.est); c.fill = fill(st[0]); c.font = { bold: true, color: { argb: st[1] } }; } });
      pctCelda(row.getCell(colsM.length), pc(e.r.resultado));
    });
    if (D.evals.length) wsM.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4 + D.evals.length, column: colsM.length } };

    /* 4) Manuales */
    if (D.man.length) {
      var temas = []; D.man.forEach(function (m) { (m.rutas || []).forEach(function (r) { (r.secs || []).forEach(function (s) { if (s.nom && temas.indexOf(s.nom) < 0) temas.push(s.nom); }); }); });
      var wsN = wb.addWorksheet('Manuales', { views: [{ state: 'frozen', ySplit: 4 }] });
      var colsN = ['Supervisor', 'Sector / zona', 'Fecha', 'Ruta / área', 'Código', 'Evaluados'].concat(temas).concat(['Resultado del grupo', 'Registrado por']);
      wsN.columns = colsN.map(function (_, i) { return { width: i === 0 ? 28 : i === 1 || i === 3 ? 18 : i === colsN.length - 1 ? 22 : 12 }; });
      cabecera(wsN, colsN.length); encabezados(wsN, 4, colsN);
      var fn = 5;
      D.man.forEach(function (m) { (m.rutas || [{}]).forEach(function (r) {
        var row = wsN.getRow(fn++); var vals = [tituloSup(m._sup), m._sector, fF(m.fecha), r.nom || '', r.cod || '', +r.ne || 1];
        temas.forEach(function (t) { var s = (r.secs || []).find(function (y) { return y.nom === t; }); vals.push(s ? pc(s.pct != null ? s.pct : s.cum) / 100 : null); });
        vals.push(null); vals.push(m.nomUsuario || m.usuario || ''); row.values = vals;
        for (var k = 1; k <= colsN.length; k++) row.getCell(k).border = BORDE;
        temas.forEach(function (_, j) { row.getCell(7 + j).numFmt = '0.0%'; row.getCell(7 + j).alignment = { horizontal: 'center' }; });
        pctCelda(row.getCell(colsN.length - 1), pc(r.resGrupo));
      }); });
      wsN.mergeCells(fn + 1, 1, fn + 1, colsN.length);
      wsN.getCell(fn + 1, 1).value = 'Las evaluaciones manuales se registran por grupo (ruta / área): el sistema guarda el resultado del grupo y el % por tema. La respuesta de cada trabajador consta en el formato físico firmado.';
      wsN.getCell(fn + 1, 1).font = { italic: true, color: { argb: C.gris } };
    }

    /* 5) Nota metodológica */
    var wsT = wb.addWorksheet('Nota'); wsT.columns = [{ width: 34 }, { width: 110 }];
    cabecera(wsT, 2);
    [['Filtro', (sup ? tituloSup(sup) : 'Todos los supervisores') + (sector ? ' · sector ' + sector : '') + ' · ' + fF(F.desde) + ' al ' + fF(F.hasta)],
     ['Evaluaciones con detalle', D.evals.filter(function (e) { return !e.manualDet; }).length + ' por QR · ' + D.evals.filter(function (e) { return e.manualDet; }).length + ' manuales (evaluado por evaluado)'], ['Registros manuales sin detalle', D.man.length + ' (registrados antes del 18/10/2026: solo resultado del grupo)'],
     ['Evaluación manual', 'Desde el 18/10/2026 la evaluación manual guarda el puntaje que el supervisor anotó para cada evaluado en cada pregunta (transcrito del formato físico). El resultado de cada evaluado se calcula con la misma fórmula del sistema.'],
     ['Anonimato', 'La evaluación por QR es anónima: se identifica por fecha, hora, sector, ruta/área, código e ID del registro, no por el nombre del trabajador.'],
     ['Calificación', 'Automática. Pregunta de una respuesta: correcta = puntaje completo. Varias respuestas: (aciertos − errores) / correctas, mínimo 0 (Parcial). Aprobado ≥ 70 %.'],
     ['Banco de preguntas', 'Cada respuesta se muestra con la versión del banco con la que fue respondida.'],
     ['Fuente', 'Sistema ETI · Evaluación de Conocimiento de Buenas Prácticas Sociales y Laborales (registros en la nube).']
    ].forEach(function (x, i) { var r = wsT.getRow(4 + i); r.values = x; r.getCell(1).font = { bold: true }; r.getCell(1).fill = fill(C.cab); r.getCell(2).alignment = { wrapText: true }; r.getCell(1).border = BORDE; r.getCell(2).border = BORDE; });

    var buf = await wb.xlsx.writeBuffer();
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    a.download = nombreArchivo(F, sup, sector, 'xlsx'); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    aviso('✅ Excel listo: ' + D.evals.length + ' evaluaciones con sus respuestas' + (D.man.length ? ' · ' + D.man.length + ' manuales' : ''), 's');
  }
  function excelSimple(F, D, sup, sector) {
    if (typeof XLSX === 'undefined') { aviso('No cargó la librería de Excel; recarga la página', 'e'); return; }
    var resp = []; D.evals.forEach(function (e) { e.filas.forEach(function (f) { resp.push({ 'Supervisor': tituloSup(e.sup), 'Sector': e.sector, 'N° evaluación': e.num, 'Fecha': fF(e.r.fecha), 'Hora': hora(e.r.ts), 'Ruta / Área': e.r.ruta || '', 'Código': e.r.cod || '',
      'Tema': f.tema, 'N° pregunta': f.n, 'Pregunta': f.t, 'Respuesta marcada': f.marcada.join(' | '), 'Respuesta correcta': f.correcta.join(' | '), 'Resultado': f.est, 'Puntaje': f.pts, 'Máximo': f.max, 'Resultado evaluación %': pc(e.r.resultado), 'ID': e.r.id }); }); });
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resp.length ? resp : [{ 'Sin datos': '' }]), 'Respuestas');
    XLSX.writeFile(wb, nombreArchivo(F, sup, sector, 'xlsx')); aviso('✅ Excel listo (formato simple)', 's');
  }

  /* ── hojas de respuesta (imprimir / guardar como PDF), ordenadas supervisor → sector ── */
  function hojas(F, D, w, sup, sector) {
    var S = ses() || {}, gen = new Date().toLocaleString('es-PE'), G = grupos(D);
    var css = '@page{size:A4;margin:11mm}*{box-sizing:border-box}body{font:11px/1.35 "Segoe UI",Arial,sans-serif;color:#14213D;margin:0;background:#EEF2F8;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      '.bar{position:sticky;top:0;background:#0B2A6F;color:#fff;padding:10px 16px;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;z-index:2}.bar button{background:#fff;color:#0B2A6F;border:0;border-radius:8px;padding:8px 14px;font-weight:800;cursor:pointer}' +
      '.hoja{background:#fff;max-width:200mm;margin:12px auto;padding:9mm;box-shadow:0 2px 10px rgba(0,0,0,.08);page-break-after:always}.hoja:last-child{page-break-after:auto}' +
      'h1{font-size:17px;margin:0 0 3px;color:#0B2A6F}h2{font-size:13px;margin:0}.mut{color:#5B6B85}.franja{background:#0B2A6F;color:#fff;border-radius:8px;padding:8px 12px;margin-bottom:8px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.franja b{font-size:12.5px}.franja span{font-size:10.5px;opacity:.9}' +
      '.cab{display:grid;grid-template-columns:repeat(4,1fr);gap:4px 12px;border:1px solid #D9E0EC;border-radius:8px;padding:7px 9px;margin:7px 0;background:#F8FAFD}.cab b{display:block;font-size:10.5px}.cab span{font-size:8.5px;color:#5B6B85;text-transform:uppercase;letter-spacing:.3px}' +
      'table{width:100%;border-collapse:collapse;margin-top:5px}th,td{border:1px solid #D9E0EC;padding:3px 5px;vertical-align:top;text-align:left}th{background:#1E3A8A;color:#fff;font-size:9.5px}tr:nth-child(even) td{background:#FAFBFE}td.c{text-align:center;white-space:nowrap}' +
      '.ok{color:#0B6B36;font-weight:800;background:#E6F7EE!important}.pa{color:#9A5B00;font-weight:800;background:#FFF1DB!important}.no{color:#B00020;font-weight:800;background:#FDE4E7!important}.mal{color:#B00020}' +
      '.res{display:flex;justify-content:space-between;align-items:center;gap:8px}.badge{border-radius:99px;padding:3px 10px;font-weight:800}.pie{margin-top:7px;font-size:8.5px;color:#5B6B85;border-top:1px solid #D9E0EC;padding-top:4px}' +
      '.sep{display:flex;flex-direction:column;justify-content:center;min-height:120mm}.sep .grande{font-size:22px;font-weight:800;color:#0B2A6F}.temas span{display:inline-block;margin:2px 8px 0 0}' +
      '@media print{body{background:#fff}.bar{display:none}.hoja{box-shadow:none;margin:0;max-width:none;padding:0}}';
    function tablaGrupos() {
      return '<table><thead><tr><th>Supervisor</th><th>Sector / zona</th><th>Con detalle (QR + manual)</th><th>Manual sin detalle</th></tr></thead><tbody>' +
        G.map(function (g) { return g.sectores.map(function (s, i) { return '<tr><td>' + (i ? '' : '<b>' + esc(tituloSup(g.sup)) + '</b>') + '</td><td>' + esc(s.sector) + '</td><td class="c">' + s.qr + '</td><td class="c">' + s.man + '</td></tr>'; }).join(''); }).join('') +
        '<tr><td><b>TOTAL</b></td><td></td><td class="c"><b>' + D.evals.length + '</b></td><td class="c"><b>' + G.reduce(function (a, g) { return a + g.man; }, 0) + '</b></td></tr></tbody></table>';
    }
    var portada = '<section class="hoja"><h1>Evidencia de respuestas por evaluación</h1><div class="mut">Sistema ETI · Evaluación de Conocimiento de Buenas Prácticas Sociales y Laborales</div>' +
      '<div class="cab"><div><span>Rango</span><b>' + esc(fF(F.desde) + ' al ' + fF(F.hasta)) + '</b></div><div><span>Supervisor</span><b>' + esc(sup ? tituloSup(sup) : 'Todos') + '</b></div><div><span>Sector</span><b>' + esc(sector || 'Todos') + '</b></div><div><span>Generado</span><b>' + esc(gen) + '</b></div>' +
      '<div><span>Evaluaciones con detalle</span><b>' + D.evals.length + '</b></div><div><span>Aprobados ≥70%</span><b>' + D.evals.filter(function (e) { return (+e.r.resultado || 0) >= 0.7; }).length + '</b></div><div><span>Refuerzo</span><b>' + D.evals.filter(function (e) { return (+e.r.resultado || 0) < 0.7; }).length + '</b></div><div><span>Registros manuales</span><b>' + D.man.length + '</b></div></div>' +
      '<h2 style="margin-top:8px">Contenido por supervisor y sector</h2>' + tablaGrupos() +
      '<div class="pie">La evaluación por QR es anónima: cada hoja se identifica por fecha, hora, sector, ruta/área, código e ID del registro. Calificación automática; aprobado ≥ 70 %. Las preguntas de varias respuestas se califican de forma proporcional (½ Parcial). Generado por ' + esc(S.nom || S.user || '') + '.</div></section>';
    var html = '', supAnt = null, secAnt = null;
    D.evals.forEach(function (e) {
      var r = e.r, a = (+r.resultado || 0) >= 0.7;
      if (norm(e.sup) !== supAnt || norm(e.sector) !== secAnt) {
        supAnt = norm(e.sup); secAnt = norm(e.sector);
        var ev = D.evals.filter(function (x) { return norm(x.sup) === supAnt && norm(x.sector) === secAnt; });
        var pr = ev.reduce(function (s, x) { return s + (+x.r.resultado || 0); }, 0) / (ev.length || 1);
        html += '<section class="hoja"><div class="sep"><div class="mut">Supervisor</div><div class="grande">' + esc(tituloSup(e.sup)) + '</div><div class="mut" style="margin-top:10px">Sector / zona</div><div class="grande" style="font-size:18px">' + esc(e.sector) + '</div>' + (function () { var cc = ev.find(function (x) { return x.cob; }); return cc && window.ETICob ? '<div style="margin-top:10px;background:#EEF2FF;color:#3730A3;border-radius:8px;padding:8px 10px;font-weight:700">🔄 ' + esc(tituloSup(e.sup)) + ' ' + esc(ETICob.texto(cc.cob)) + ' — registrado en el Sistema RR.LL.</div>' : ''; })() +
          '<div class="cab" style="margin-top:14px"><div><span>Evaluaciones</span><b>' + ev.length + '</b></div><div><span>Promedio</span><b>' + pc(pr) + '%</b></div><div><span>Aprobados</span><b>' + ev.filter(function (x) { return (+x.r.resultado || 0) >= 0.7; }).length + '</b></div><div><span>Refuerzo</span><b>' + ev.filter(function (x) { return (+x.r.resultado || 0) < 0.7; }).length + '</b></div></div>' +
          '<table><thead><tr><th>N°</th><th>Fecha</th><th>Hora</th><th>Ruta / área</th><th>Código</th><th>Correctas</th><th>Resultado</th></tr></thead><tbody>' +
          ev.map(function (x) { var ap = (+x.r.resultado || 0) >= 0.7; return '<tr><td class="c">' + x.num + '</td><td>' + esc(fF(x.r.fecha)) + '</td><td>' + esc(hora(x.r.ts)) + '</td><td>' + esc(x.r.ruta || '') + '</td><td>' + esc(x.r.cod || '') + '</td><td class="c">' + x.ok + '/' + x.tot + '</td><td class="c ' + (ap ? 'ok' : 'no') + '">' + pc(x.r.resultado) + '%</td></tr>'; }).join('') +
          '</tbody></table></div></section>';
      }
      html += '<section class="hoja"><div class="franja"><b>' + esc(tituloSup(e.sup)) + ' · ' + esc(e.sector) + '</b><span>' + esc(modTxt(e)) + (e.cob && window.ETICob ? ' · 🔄 ' + esc(ETICob.texto(e.cob)) : '') + ' · Hoja N° ' + e.num + ' de ' + D.evals.length + '</span></div>' +
        '<div class="res"><h2>Ruta / área: ' + esc(r.ruta || '—') + '</h2><span class="badge" style="background:' + (a ? '#E6F7EE;color:#0B6B36' : '#FDE4E7;color:#B00020') + '">' + pc(r.resultado) + '% · ' + (a ? 'APROBADO' : 'REFUERZO') + '</span></div>' +
        '<div class="cab"><div><span>Fecha / hora</span><b>' + esc(fF(r.fecha) + ' ' + hora(r.ts)) + '</b></div><div><span>Empresa</span><b>' + esc(r.emp || '') + '</b></div><div><span>Tipo</span><b>' + (r.tipo === 'empleado' ? 'Empleado' : 'Obrero') + '</b></div><div><span>Código</span><b>' + esc(r.cod || '—') + '</b></div>' +
        '<div><span>Correctas</span><b>' + e.ok + ' de ' + e.tot + '</b></div><div style="grid-column:span 3"><span>Resultado por tema</span><b class="temas">' + (r.secs || []).map(function (s) { return '<span>' + esc(s.nom) + ': ' + pc(s.pct) + '%</span>'; }).join('') + '</b></div></div>' +
        (e.nota ? '<div class="mut" style="margin:4px 0">⚠ ' + esc(e.nota) + '</div>' : '') +
        '<table><thead><tr><th style="width:4%">N°</th><th style="width:35%">Pregunta</th><th style="width:25%">' + (e.manualDet ? 'Puntaje anotado' : 'Respuesta marcada') + '</th><th style="width:25%">' + (e.manualDet ? 'Puntaje máximo' : 'Respuesta correcta') + '</th><th style="width:11%">Resultado</th></tr></thead><tbody>' +
        e.filas.map(function (f) { var cl = f.est === 'Correcta' ? 'ok' : f.est === 'Parcial' ? 'pa' : 'no';
          return '<tr><td class="c">' + f.n + '</td><td>' + esc(f.t) + (f.multi ? ' <span class="mut">(varias)</span>' : '') + '</td><td' + (f.est !== 'Correcta' ? ' class="mal"' : '') + '>' + esc(f.marcada.join(' · ') || '—') + '</td><td>' + esc(f.correcta.join(' · ') || '—') + '</td><td class="c ' + cl + '">' + (f.est === 'Correcta' ? '✓ ' : f.est === 'Parcial' ? '½ ' : '✗ ') + esc(f.est) + '<br><span style="font-weight:400">' + f.pts + (f.max !== '' ? ' / ' + f.max : '') + ' pts</span></td></tr>'; }).join('') +
        '</tbody></table>' +
        '<div class="pie">ID del registro: ' + esc(r.id) + ' · Código QR: ' + esc(r.sesion || '') + ' · ' + (e.manualDet ? 'Evaluación manual registrada por ' + esc(r.registradoPor || 'el supervisor') + ' (puntajes transcritos del formato físico)' : 'Evaluación anónima respondida por el trabajador desde su celular') + ' · Generado el ' + esc(gen) + '</div></section>';
    });
    var temasM = []; D.man.forEach(function (m) { (m.rutas || []).forEach(function (r) { (r.secs || []).forEach(function (s) { if (s.nom && temasM.indexOf(s.nom) < 0) temasM.push(s.nom); }); }); });
    var manual = !D.man.length ? '' : '<section class="hoja"><div class="franja"><b>Evaluaciones manuales — resumen por grupo</b><span>' + D.man.length + ' registro(s)</span></div><div class="mut" style="margin:4px 0 6px">Registradas por el supervisor por ruta / área. El sistema guarda el resultado del grupo y el % por tema; la respuesta de cada trabajador consta en el formato físico firmado.</div>' +
      '<table><thead><tr><th>Supervisor</th><th>Sector</th><th>Fecha</th><th>Ruta / área</th><th>Cód.</th><th>Evaluados</th>' + temasM.map(function (t) { return '<th>' + esc(t) + '</th>'; }).join('') + '<th>Resultado</th></tr></thead><tbody>' +
      D.man.map(function (m) { return (m.rutas || []).map(function (r) { var a = (+r.resGrupo || 0) >= 0.7; return '<tr><td>' + esc(tituloSup(m._sup)) + '</td><td>' + esc(m._sector) + '</td><td>' + esc(fF(m.fecha)) + '</td><td>' + esc(r.nom || '') + '</td><td>' + esc(r.cod || '') + '</td><td class="c">' + (+r.ne || 1) + '</td>' +
        temasM.map(function (t) { var s = (r.secs || []).find(function (y) { return y.nom === t; }); return '<td class="c">' + (s ? pc(s.pct != null ? s.pct : s.cum) + '%' : '—') + '</td>'; }).join('') + '<td class="c ' + (a ? 'ok' : 'no') + '">' + pc(r.resGrupo) + '%</td></tr>'; }).join(''); }).join('') +
      '</tbody></table><div class="pie">Generado el ' + esc(gen) + '</div></section>';
    var doc = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(nombreArchivo(F, sup, sector, 'pdf').replace(/\.pdf$/, '')) + '</title><style>' + css + '</style></head><body>' +
      '<div class="bar"><b>🧾 ' + esc(sup ? tituloSup(sup) : 'Todos los supervisores') + (sector ? ' · ' + esc(sector) : '') + ' · ' + D.evals.length + ' hojas de respuesta' + (D.man.length ? ' · ' + D.man.length + ' registro(s) manual(es)' : '') + ' · ' + esc(fF(F.desde) + ' al ' + fF(F.hasta)) + '</b><button onclick="window.print()">🖨 Imprimir / Guardar como PDF</button></div>' + portada + html + manual + '</body></html>';
    w.document.open(); w.document.write(doc); w.document.close();
  }

  /* ── ventana: supervisores con evaluaciones en el rango, por sector ── */
  function abrir() {
    if (!esAdm()) return;
    var F = filtrosPantalla();
    if (!F.desde || !F.hasta) { aviso('Elige un rango de fechas', 'e'); return; }
    var m = $('ra-modal'); if (!m) { m = document.createElement('div'); m.id = 'ra-modal'; document.body.appendChild(m); }
    m.style.cssText = 'position:fixed;inset:0;background:rgba(10,20,40,.55);z-index:99990;display:flex;align-items:center;justify-content:center;padding:14px';
    m.innerHTML = '<style>#ra-modal .ra-box{background:#fff;border-radius:16px;max-width:760px;width:100%;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
      '#ra-modal .ra-h{padding:16px 20px 10px;border-bottom:1px solid #E3E9F3}#ra-modal .ra-b{padding:12px 20px;overflow:auto}#ra-modal .ra-f{padding:10px 20px;border-top:1px solid #E3E9F3;display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap;align-items:center}' +
      '#ra-modal .ra-sup{border:1px solid #D9E0EC;border-radius:12px;margin-bottom:10px;overflow:hidden}#ra-modal .ra-sh{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;background:#F1F5FB;padding:9px 12px}' +
      '#ra-modal .ra-sh b{color:#0B2A6F;font-size:14px}#ra-modal .ra-row{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:7px 12px;border-top:1px solid #EEF2F8;font-size:13px}' +
      '#ra-modal .ra-chip{font-size:11.5px;font-weight:800;border-radius:99px;padding:2px 8px;margin-left:4px}#ra-modal .ra-q{background:#E6EEFF;color:#0B2A6F}#ra-modal .ra-m{background:#F1EAFE;color:#6A3FC0}#ra-modal .ra-btns{display:flex;gap:6px}' +
      '#ra-modal .ra-btns button{border:1px solid #CBD5E1;background:#fff;border-radius:8px;padding:5px 10px;font-weight:700;font-size:12px;cursor:pointer}#ra-modal .ra-btns button:hover{background:#F1F5FB}#ra-modal .ra-btns .x{color:#0B6B36;border-color:#9BD3B4}#ra-modal .ra-btns .p{color:#6A3FC0;border-color:#C9B5F2}' +
      '#ra-modal .ra-btns button:disabled{opacity:.45;cursor:not-allowed}</style>' +
      '<div class="ra-box"><div class="ra-h"><div style="font-size:17px;font-weight:800;color:#0B2A6F">🧾 Respuestas para auditoría</div>' +
      '<div style="font-size:13px;color:#475569;margin-top:4px">Del <b>' + esc(fF(F.desde)) + '</b> al <b>' + esc(fF(F.hasta)) + '</b>' + (F.sup ? ' · supervisor <b>' + esc(F.sup) + '</b>' : '') + (F.emp ? ' · ' + esc(F.emp) : '') + (F.tipo ? ' · ' + esc(F.tipo === 'empleado' ? 'empleados' : 'obreros') : '') + '. Elige de qué supervisor y sector descargar el Excel o las hojas de respuesta.</div></div>' +
      '<div class="ra-b" id="ra-lista"><div style="color:#5B6B85;padding:18px 0;text-align:center">⏳ Buscando evaluaciones del rango…</div></div>' +
      '<div class="ra-f"><span style="font-size:11.5px;color:#5B6B85;max-width:430px"><span class="ra-chip ra-q">QR</span> y <span class="ra-chip ra-q" style="background:#E6F7EE;color:#0B6B36">manual con detalle</span>: hoja por trabajador · <span class="ra-chip ra-m">manual por grupo</span>: registros antiguos, solo resultado del grupo</span><div class="ra-btns" id="ra-todo"></div><button class="btn bout" id="ra-no">Cerrar</button></div></div>';
    $('ra-no').onclick = function () { m.remove(); };
    m.onclick = function (e) { if (e.target === m) m.remove(); };
    cargar(F).then(function (D) {
      var L = $('ra-lista'); if (!L) return;
      var G = grupos(D);
      if (!G.length) { L.innerHTML = '<div style="color:#8A5A00;padding:18px 0;text-align:center">No hay evaluaciones con este filtro. Prueba con otro rango de fechas.</div>'; return; }
      var chips = function (q, md, mn) { return (q - md ? '<span class="ra-chip ra-q">' + (q - md) + ' QR</span>' : '') + (md ? '<span class="ra-chip ra-q" style="background:#E6F7EE;color:#0B6B36">' + md + ' manual con detalle</span>' : '') + (mn ? '<span class="ra-chip ra-m">' + mn + ' manual por grupo</span>' : ''); };
      var btns = function (i, j) { return '<div class="ra-btns"><button class="x" data-a="x" data-g="' + i + '" data-s="' + j + '">📥 Excel</button><button class="p" data-a="p" data-g="' + i + '" data-s="' + j + '">🖨 Hojas PDF</button></div>'; };
      L.innerHTML = '<div style="font-size:12.5px;color:#475569;margin-bottom:8px">En estas fechas tienen evaluaciones <b>' + G.length + '</b> supervisor(es):</div>' +
        G.map(function (g, i) {
          return '<div class="ra-sup"><div class="ra-sh"><div><b>👤 ' + esc(tituloSup(g.sup)) + '</b> ' + chips(g.qr, g.md, g.man) + (g.n ? ' <span style="font-size:12px;color:#5B6B85">· promedio ' + pc(g.prom) + '%</span>' : '') + '</div>' + btns(i, -1) + '</div>' +
            g.sectores.map(function (s, j) { return '<div class="ra-row"><div>📍 ' + esc(s.sector) + ' ' + chips(s.qr, s.md, s.man) + '</div>' + btns(i, j) + '</div>'; }).join('') + '</div>';
        }).join('');
      if (G.length > 1) $('ra-todo').innerHTML = '<button class="x" data-a="x" data-g="-1" data-s="-1" title="Todos los supervisores en un solo archivo, ordenado por supervisor y sector">📥 Excel de todos</button><button class="p" data-a="p" data-g="-1" data-s="-1">🖨 PDF de todos</button>';
      m.querySelectorAll('.ra-btns button[data-a]').forEach(function (b) {
        b.onclick = async function () {
          var gi = +b.getAttribute('data-g'), si = +b.getAttribute('data-s'), g = gi >= 0 ? G[gi] : null, s = g && si >= 0 ? g.sectores[si] : null;
          var sup = g ? g.sup : '', sector = s ? s.sector : '', sub = subconjunto(D, sup, sector);
          if (b.getAttribute('data-a') === 'p') {
            var w = window.open('', '_blank'); if (!w) { aviso('Permite las ventanas emergentes para ver las hojas de respuesta', 'e'); return; }
            w.document.write('<p style="font-family:sans-serif;padding:20px">Preparando hojas de respuesta…</p>'); hojas(F, sub, w, sup, sector);
          } else {
            var t = b.textContent; b.disabled = true; b.textContent = '⏳ Preparando…';
            try { await excel(F, sub, sup, sector); } catch (e) { console.error(e); aviso('No se pudo generar el Excel: ' + e.message, 'e'); }
            b.disabled = false; b.textContent = t;
          }
        };
      });
    }).catch(function (e) { var L = $('ra-lista'); if (L) L.innerHTML = '<div style="color:#C8102E;padding:18px 0;text-align:center">No se pudo leer: ' + esc(e.message) + '</div>'; });
  }

  /* ── botón en "Evaluaciones por supervisor" (junto a 📥 Excel de este rango) ── */
  function poner() {
    if (!esAdm()) return; var box = $('mis-box'); if (!box || $('ra-btn')) return;
    var ref = Array.prototype.find.call(box.querySelectorAll('button'), function (b) { return /ETITF\.exportar/.test(b.getAttribute('onclick') || ''); });
    if (!ref) return;
    var b = document.createElement('button'); b.id = 'ra-btn'; b.type = 'button'; b.className = 'btn bout bsm';
    b.style.cssText = 'border-color:#6A3FC0;color:#6A3FC0;font-weight:800'; b.title = 'Respuesta de cada trabajador, pregunta por pregunta, por supervisor y sector (evidencia para auditoría)';
    b.textContent = '🧾 Respuestas (auditoría)'; b.onclick = abrir;
    ref.parentNode.insertBefore(b, ref.nextSibling);
  }
  var obs = null;
  setInterval(function () {
    var box = $('mis-box'); if (!box) return;
    if (!obs) { obs = new MutationObserver(poner); obs.observe(box, { childList: true }); }
    poner();
  }, 1000);
  window.ETIRespuestas = { abrir: abrir, cargar: cargar, grupos: grupos, subconjunto: subconjunto, excel: excel, hojas: hojas };
})();
