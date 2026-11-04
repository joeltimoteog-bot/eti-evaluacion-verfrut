/* ═════════════════════════════════════════════════════════════════════════
   _INFORME_AUDITORIA_V1 (03-nov-2026) · v2 — Acceso al Reporte e Informe GH-04 para auditoría
   Botón "Informe para auditoría" (solo administrador) en Evaluaciones por supervisor.
   NO genera formatos propios: lista, para la empresa y el periodo elegidos, los supervisores y sectores
   con evaluaciones y abre el MISMO Reporte del sistema (_REPORTE_MIS_V1) en ese sector, desde donde se
   emiten con sus botones de siempre el Informe INF-SC-GH-04 (Word), el Excel, la impresión y el Check List.
   Así el informe y el reporte de auditoría tienen exactamente la misma estructura que los de hoy.
   Además, por cada supervisor y sector: Respuestas para auditoría (Excel y hojas PDF del módulo oficial
   ETIRespuestas, mismo formato) y Hojas por ruta (mismo estilo, con el % por tema de los registros manuales).
   Histórico semanal: matriz sector × semana con lo realizado (evaluados y %) y lo programado sin registro.
   Solo lee Firebase. No guarda nada.
   ═════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window._INFORME_AUDITORIA_V1) return; window._INFORME_AUDITORIA_V1 = true;
  var $ = function (id) { return document.getElementById(id); };
  var esAdmin = function () { try { return typeof SESSION !== 'undefined' && SESSION && SESSION.rol === 'admin'; } catch (e) { return false; } };
  var hoyI = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var fF = function (f) { f = String(f || ''); return f.length >= 10 ? f.slice(8, 10) + '/' + f.slice(5, 7) + '/' + f.slice(0, 4) : f; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var aviso = function (m, t) { try { if (typeof toast === 'function') return toast(m, t || 'i'); } catch (e) {} console.log(m); };

  var RAZON = { 'RAPEL S.A.C.': 'Sociedad Agricola Rapel S.A.C.', 'VERFRUT S.A.C.': 'Sociedad Exportadora Verfrut S.A.C.' };
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
  /* supervisores × sectores con evaluaciones (manual y QR) en el periodo y empresa */
  async function grupos(o) {
    var f = fbdb, G = new Map();
    var add = function (x, n) { if (o.emp && x.emp !== o.emp) return; var k = (x.sup || '—') + '|' + (x.sector || '—'); var g = G.get(k) || { sup: x.sup || '—', sector: x.sector || '—', rutas: 0, n: 0, fechas: new Set() }; g.rutas++; g.n += n; g.fechas.add(x.fecha); G.set(k, g); };
    var qm = await f.collection(COL_EVAL).where('fecha', '>=', o.desde).where('fecha', '<=', o.hasta).get();
    qm.docs.forEach(function (d) { var x = d.data(); if (x.modalidad === 'QR') return; (x.rutas || []).forEach(function (r) { add(x, +r.ne || 1); }); });
    if (o.qr) { var qq = await f.collection('respuestas_qr').where('fecha', '>=', o.desde).where('fecha', '<=', o.hasta).get(); qq.docs.forEach(function (d) { add(d.data(), 1); }); }
    return [...G.values()].sort(function (a, b) { return a.sup.localeCompare(b.sup, 'es') || a.sector.localeCompare(b.sector, 'es'); });
  }

  /* abre el Reporte oficial del sistema para ese supervisor y sector, con el periodo y la empresa elegidos */
  async function abrirReporte(o, sup, sector) {
    var M = window.ETIMIS; if (!M) throw new Error('Módulo de evaluaciones no disponible');
    M.abrir(); await espera(150);
    M.filtro('emp', o.emp || ''); M.filtro('mod', o.qr ? '' : 'MANUAL'); M.filtro('tipo', '');
    M.rango(o.desde, o.hasta);
    M.sup('*');   /* vista de todos los supervisores en el rango (carga de Firebase) */
    var t0 = Date.now(); await espera(400);
    while (Date.now() - t0 < 20000) { var b = $('mis-box'); if (b && !/Cargando…/.test(b.textContent)) break; await espera(250); }
    M.reporteDe(sup); await espera(300);
    if (sector) M.rptSector(sector);
  }


  /* ── Histórico semanal de Check List: sector × semana (realizado / programado) ── */
  function semISO(iso) { var d = new Date(iso + 'T12:00:00'); var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); var n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); var y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y) / 864e5 + 1) / 7); }
  function lunesDe(anio, sem) { var s = new Date(Date.UTC(anio, 0, 4)); var d = s.getUTCDay() || 7; s.setUTCDate(s.getUTCDate() - d + 1 + (sem - 1) * 7); return s; }
  var isoD = function (d) { return d.toISOString().slice(0, 10); };
  var normSec = function (s) { return String(s || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^SECTOR\s+/, '').replace(/\s+/g, ' ').trim(); };
  async function historico(o) {
    var f = fbdb, M = new Map(), anio = +o.desde.slice(0, 4);
    var bonito = function (s) { return normSec(s).toLowerCase().replace(/(^|\s)\S/g, function (m) { return m.toUpperCase(); }); };
    var celda = function (sec, prog) { var k = normSec(sec); if (!M.has(k)) M.set(k, { sector: prog ? bonito(sec) : String(sec).replace(/^SECTOR\s+/i, ''), w: {} }); return M.get(k); };
    var w0 = function (c, w) { return c.w[w] || (c.w[w] = { n: 0, sr: 0, sups: {}, prog: false, mods: {} }); };
    var qm = await f.collection(COL_EVAL).where('fecha', '>=', o.desde).where('fecha', '<=', o.hasta).get();
    qm.docs.forEach(function (d) { var x = d.data(); if (x.modalidad === 'QR' || (o.emp && x.emp !== o.emp)) return; var c = celda(x.sector || '—'), z = w0(c, semISO(x.fecha));
      (x.rutas || []).forEach(function (r) { var ne = +r.ne || 1; z.n += ne; z.sr += (+r.resGrupo || 0) * ne; }); z.sups[x.sup || '—'] = 1; z.mods.Manual = 1; });
    var qq = await f.collection('respuestas_qr').where('fecha', '>=', o.desde).where('fecha', '<=', o.hasta).get();
    qq.docs.forEach(function (d) { var x = d.data(); if (o.emp && x.emp !== o.emp) return; if (/GESTI[OÓ]N HUMANA/i.test(x.ruta || '')) return;   /* respuestas de prueba del área */
      var c = celda(x.sector || '—'), z = w0(c, semISO(x.fecha)); z.n++; z.sr += (+x.resultado || 0); z.sups[x.sup || '—'] = 1; z.mods.QR = 1; });
    try {
      var pq = await f.collection('programaciones_eti').get();
      pq.docs.forEach(function (d) { var x = d.data(); if (!/CHECK/i.test(x.tema || '')) return; if (o.emp && x.empresa && o.emp.indexOf(String(x.empresa).toUpperCase()) < 0) return;
        var ws = (x.semanas && x.semanas.length) ? x.semanas : (x.fechas || []).filter(function (fe) { return fe >= o.desde && fe <= o.hasta; }).map(semISO);
        if (x.anio && +x.anio !== anio) return;
        var c = celda(x.sector || '—', true); ws.forEach(function (w) { var z = w0(c, +w); z.prog = true; z.progSup = x.supervisor || ''; z.progEst = x.estado || ''; }); });
    } catch (e) { console.warn('[_HISTORICO_SEMANAL] programación:', e.message); }
    return { filas: [...M.values()].sort(function (a, b) { return a.sector.localeCompare(b.sector, 'es'); }), anio: anio, w1: semISO(o.desde), w2: semISO(o.hasta) };
  }
  function pintarHistorico(L, o, H) {
    var ws = []; for (var w = H.w1; w <= H.w2; w++) ws.push(w);
    var th = 'background:#E6EBF2;color:#3D4C63;font-size:10px;padding:5px 3px;border:1px solid #D6DEE9;text-align:center;min-width:30px';
    var head = '<tr><th style="' + th + ';text-align:left;min-width:150px;position:sticky;left:0;z-index:2">Sector</th>' + ws.map(function (w) { var l = lunesDe(H.anio, w); return '<th style="' + th + '" title="' + fF(isoD(l)) + ' al ' + fF(isoD(new Date(l.getTime() + 6 * 864e5))) + '">S' + w + '</th>'; }).join('') + '</tr>';
    var nOk = 0, nPend = 0;
    var body = H.filas.map(function (c, ci) { return '<tr><td style="padding:5px 8px;border:1px solid #D6DEE9;font-size:12px;font-weight:600;background:#fff;position:sticky;left:0;z-index:1">' + esc(c.sector) + '</td>' + ws.map(function (w) { var z = c.w[w];
      if (!z) return '<td style="border:1px solid #EEF1F5"></td>';
      if (z.n) { nOk++; var p = z.sr / z.n * 100, sups = Object.keys(z.sups).join(', ');
        return '<td data-c="' + ci + '" data-w="' + w + '" style="border:1px solid #D6DEE9;background:' + (p >= 70 ? '#E4F4EA' : '#FEE2E2') + ';text-align:center;font-size:10.5px;font-weight:700;color:' + (p >= 70 ? '#0F6B3A' : '#991B1B') + ';cursor:pointer" title="Semana ' + w + ' · ' + esc(sups) + ' · ' + z.n + ' evaluados · ' + p.toFixed(1) + ' % · ' + Object.keys(z.mods).join(' + ') + (z.prog ? ' · programado' : '') + ' — clic: abrir reporte">' + z.n + '</td>'; }
      nPend++; return '<td style="border:1px solid #D6DEE9;background:#FFF1DE;text-align:center;font-size:10px;color:#9A4A00" title="Semana ' + w + ' · programado (' + esc(z.progSup) + ') · sin evaluaciones registradas">P</td>'; }).join('') + '</tr>'; }).join('');
    L.innerHTML = '<div style="font-size:12.5px;color:#1F2A3C;margin:4px 0 8px"><b>Histórico semanal de Check List</b> · ' + esc(o.emp || 'Todas las empresas') + ' · semanas ' + H.w1 + ' a ' + H.w2 + ' · ' + nOk + ' semana(s) realizadas · ' + nPend + ' programada(s) sin registro</div>' +
      '<div style="font-size:11.5px;color:#5B6B82;margin-bottom:6px"><span style="background:#E4F4EA;color:#0F6B3A;padding:1px 6px;border-radius:3px;font-weight:700">N</span> realizado (N evaluados, ≥ 70 %) · <span style="background:#FEE2E2;color:#991B1B;padding:1px 6px;border-radius:3px;font-weight:700">N</span> realizado con resultado &lt; 70 % · <span style="background:#FFF1DE;color:#9A4A00;padding:1px 6px;border-radius:3px">P</span> programado sin registro · vacío: sin actividad. Clic en una semana realizada: abre el reporte.</div>' +
      '<div style="overflow:auto;max-height:52vh;border:1px solid #D6DEE9;border-radius:6px"><table style="border-collapse:collapse;width:max-content">' + head + body + '</table></div>';
    L.querySelectorAll('td[data-c]').forEach(function (td) { td.onclick = async function () {
      var c = H.filas[+td.getAttribute('data-c')], w = +td.getAttribute('data-w'), z = c.w[w], l = lunesDe(H.anio, w);
      var oo = { emp: o.emp, desde: isoD(l), hasta: isoD(new Date(l.getTime() + 6 * 864e5)), qr: true }, sup = Object.keys(z.sups)[0];
      var ov = $('iaOv'); if (ov) ov.remove(); aviso('Abriendo el reporte de ' + c.sector + ' · semana ' + w + '…', 'i');
      try { await abrirReporte(oo, sup, c.sector); } catch (e) { aviso('No se pudo abrir el reporte: ' + e.message, 'e'); } }; });
  }
  function abrir() {
    if (!esAdmin()) { aviso('Solo el administrador emite el informe para auditoría', 'e'); return; }
    var ov = $('iaOv'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'iaOv';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(15,39,72,.55);z-index:99990;display:flex;align-items:center;justify-content:center;padding:16px';
    var fl = 'display:block;font-size:11px;font-weight:700;color:#5B6B82;text-transform:uppercase;letter-spacing:.4px;margin:10px 0 5px';
    ov.innerHTML = '<div style="background:#fff;border-radius:8px;max-width:980px;width:100%;max-height:90vh;display:flex;flex-direction:column;font-family:Inter,Segoe UI,Arial,sans-serif;box-shadow:0 20px 50px rgba(15,39,72,.25)">' +
      '<div style="padding:14px 20px;background:#EDF1F6;border-bottom:1px solid #D6DEE9;border-radius:8px 8px 0 0;font-weight:700;color:#0F2748">Informe para auditoría</div>' +
      '<div style="padding:4px 20px 10px"><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">' +
      '<div style="flex:2;min-width:200px"><label style="' + fl + '">Empresa</label><select id="iaEmp" class="fc" style="width:100%"><option value="RAPEL S.A.C.">RAPEL S.A.C.</option><option value="VERFRUT S.A.C.">VERFRUT S.A.C.</option></select></div>' +
      '<div style="flex:1;min-width:130px"><label style="' + fl + '">Desde</label><input id="iaDes" type="date" class="fc" style="width:100%" value="2026-06-19"></div>' +
      '<div style="flex:1;min-width:130px"><label style="' + fl + '">Hasta</label><input id="iaHas" type="date" class="fc" style="width:100%" value="' + hoyI() + '"></div>' +
      '<button class="btn bpri" id="iaBus" style="height:38px">Buscar</button><button class="btn bout" id="iaHis" style="height:38px" title="Sector × semana: qué semanas tienen Check List realizado o programado">Histórico semanal</button></div>' +
      '<label style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:13px;color:#1F2A3C"><input id="iaQr" type="checkbox"> Incluir evaluaciones por QR</label>' +
      '<div style="font-size:12px;color:#5B6B82;margin-top:8px">Se abre el Reporte del sistema del supervisor y sector elegidos. Desde él se emiten, con sus botones de siempre, el Informe INF-SC-GH-04 (Word), el Excel y la impresión, con la misma estructura de hoy.</div></div>' +
      '<div id="iaLista" style="overflow:auto;padding:0 20px 12px;flex:1"></div>' +
      '<div style="display:flex;justify-content:flex-end;padding:12px 20px;border-top:1px solid #D6DEE9;background:#F8FAFC;border-radius:0 0 8px 8px"><button class="btn bout" id="iaCan">Cerrar</button></div></div>';
    document.body.appendChild(ov);
    $('iaCan').onclick = function () { ov.remove(); };
    var opc = function () { return { emp: $('iaEmp').value, desde: $('iaDes').value, hasta: $('iaHas').value, qr: $('iaQr').checked }; };
    $('iaHis').onclick = async function () {
      var o = opc(), L = $('iaLista'); if (o.desde.slice(0, 4) !== o.hasta.slice(0, 4)) { L.innerHTML = '<p style="color:#B42318">El histórico se muestra por año: elige fechas del mismo año.</p>'; return; }
      L.innerHTML = '<p style="color:#5B6B82">Armando el histórico semanal…</p>';
      try { pintarHistorico(L, o, await historico(o)); } catch (e) { console.error(e); L.innerHTML = '<p style="color:#B42318">No se pudo leer: ' + esc(e.message) + '</p>'; }
    };
    $('iaBus').onclick = async function () {
      var o = opc(), L = $('iaLista');
      if (!o.desde || !o.hasta || o.desde > o.hasta) { L.innerHTML = '<p style="color:#B42318">Revisa el periodo.</p>'; return; }
      L.innerHTML = '<p style="color:#5B6B82">Leyendo evaluaciones del sistema…</p>';
      try {
        var G = await grupos(o);
        if (!G.length) { L.innerHTML = '<p style="color:#5B6B82">No hay evaluaciones de ' + esc(o.emp) + ' en ese periodo.</p>'; return; }
        var th = 'background:#E6EBF2;color:#3D4C63;font-size:10.5px;text-transform:uppercase;letter-spacing:.4px;padding:8px;text-align:left;border-bottom:1px solid #D6DEE9';
        var td = 'padding:8px;border-bottom:1px solid #EEF1F5;font-size:13px';
        var nT = G.reduce(function (a, g) { return a + g.n; }, 0), rT = G.reduce(function (a, g) { return a + g.rutas; }, 0);
        L.innerHTML = '<div style="font-size:12.5px;color:#1F2A3C;margin:4px 0 8px"><b>' + esc(o.emp) + '</b> · ' + fF(o.desde) + ' al ' + fF(o.hasta) + ' · ' + G.length + ' supervisor(es)/sector(es) · ' + rT + ' rutas · ' + nT + ' evaluados</div>' +
          '<table style="width:100%;border-collapse:collapse"><thead><tr><th style="' + th + '">Supervisor</th><th style="' + th + '">Sector</th><th style="' + th + ';text-align:center">Fechas</th><th style="' + th + ';text-align:center">Rutas</th><th style="' + th + ';text-align:center">Evaluados</th><th style="' + th + '"></th></tr></thead><tbody>' +
          G.map(function (g, i) { return '<tr><td style="' + td + '">' + esc(g.sup) + '</td><td style="' + td + '">' + esc(g.sector) + '</td><td style="' + td + ';text-align:center">' + g.fechas.size + '</td><td style="' + td + ';text-align:center">' + g.rutas + '</td><td style="' + td + ';text-align:center">' + g.n + '</td><td style="' + td + ';text-align:right;white-space:nowrap"><button class="btn bpri bsm" data-a="rep" data-i="' + i + '">Abrir reporte</button> <button class="btn bout bsm" data-a="rx" data-i="' + i + '" title="Respuestas para auditoría · Excel (formato oficial)">Respuestas Excel</button> <button class="btn bout bsm" data-a="rp" data-i="' + i + '" title="Respuestas para auditoría · hojas PDF (formato oficial)">Respuestas PDF</button> <button class="btn bout bsm" data-a="hr" data-i="' + i + '" title="Una hoja por ruta con el % de cada tema (registros manuales)">Hojas por ruta</button></td></tr>'; }).join('') + '</tbody></table>';
        L.querySelectorAll('button[data-i]').forEach(function (b) { b.onclick = async function () {
          var g = G[+b.getAttribute('data-i')], a = b.getAttribute('data-a');
          if (a === 'rep') { ov.remove(); aviso('Abriendo el reporte de ' + g.sup + ' · ' + g.sector + '…', 'i');
            try { await abrirReporte(o, g.sup, g.sector); } catch (e) { aviso('No se pudo abrir el reporte: ' + e.message, 'e'); } return; }
          var w = (a === 'rp' || a === 'hr') ? window.open('', '_blank') : null;
          if ((a === 'rp' || a === 'hr') && !w) { aviso('Permite las ventanas emergentes para ver las hojas', 'e'); return; }
          if (w) w.document.write('<p style="font-family:sans-serif;padding:20px">Preparando hojas…</p>');
          var t = b.textContent; b.disabled = true; b.textContent = 'Preparando…';
          try {
            if (a === 'hr') { var D = await datos({ emp: o.emp, desde: o.desde, hasta: o.hasta, qr: o.qr }); D.rutas = D.rutas.filter(function (r) { return r.sup === g.sup && r.sector === g.sector; });
              if (!D.rutas.length) throw new Error('Sin rutas para ese supervisor y sector'); w.document.open(); hojas({ emp: o.emp, desde: o.desde, hasta: o.hasta, qr: o.qr }, D, w); }
            else { var R = window.ETIRespuestas; if (!R) throw new Error('Respuestas para auditoría no disponible');
              var F = { desde: o.desde, hasta: o.hasta, sup: '', emp: o.emp || '', tipo: '', mod: o.qr ? '' : 'MANUAL' };
              var DD = await R.cargar(F), sub = R.subconjunto(DD, g.sup, g.sector);
              if (a === 'rp') R.hojas(F, sub, w, g.sup, g.sector); else await R.excel(F, sub, g.sup, g.sector); }
          } catch (e) { console.error(e); aviso('No se pudo generar: ' + e.message, 'e'); if (w && !w.closed) try { w.close(); } catch (x) {} }
          b.disabled = false; b.textContent = t;
        }; });
      } catch (e) { console.error(e); L.innerHTML = '<p style="color:#B42318">No se pudo leer: ' + esc(e.message) + '</p>'; }
    };
  }
  window.etiInformeAuditoria = abrir;
  function ponerBoton() {
    if (!esAdmin()) return; var box = $('mis-box'); if (!box || $('iaBtn')) return;
    var fila = box.querySelector('input[type=date]'); fila = fila && fila.parentNode; if (!fila) return;
    var b = document.createElement('button'); b.id = 'iaBtn'; b.className = 'btn bpri bsm'; b.type = 'button'; b.textContent = 'Informe para auditoría'; b.title = 'Reporte e Informe GH-04 del sistema, por empresa, supervisor y sector'; b.onclick = abrir;
    fila.appendChild(b);
  }
  try { new MutationObserver(function () { ponerBoton(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  setTimeout(ponerBoton, 1500);
})();
