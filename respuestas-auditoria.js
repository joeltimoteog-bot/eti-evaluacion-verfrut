/* ═══════════════════════════════════════════════════════════════════════════
   _RESPUESTAS_AUDITORIA_V1 (18-oct-2026) — Evidencia de respuestas por evaluación (auditoría)
   ---------------------------------------------------------------------------
   En "Evaluaciones por supervisor" (solo administrador) agrega el botón 🧾 Respuestas (auditoría).
   Con el mismo rango, supervisor, empresa y tipo que estén elegidos en pantalla descarga:
     📥 Excel  → Índice (1 fila por evaluación) · Respuestas (1 fila por pregunta respondida)
                 · Matriz (✓ / ½ / ✗ por pregunta) · Manuales (sin detalle individual) · Nota
     🖨 PDF    → una hoja por evaluación: cada pregunta, la respuesta marcada, la correcta y el resultado.
   SOLO LEE Firestore (respuestas_qr, sesiones_qr, banco_historial, evaluaciones_conocimiento).
   No escribe nada ni cambia ninguna otra función. Para quitarlo: borrar su <script>.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window._RESP_AUD_V1) return; window._RESP_AUD_V1 = true;
  var SAL = 'ETI-QR';
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
  function coincide(a, b) { var x = norm(a), y = norm(b); return !!x && !!y && (x === y || x.indexOf(y) >= 0 || y.indexOf(x) >= 0); }

  /* ── datos ── */
  async function cargar(F) {
    var db = fs(); if (!db) throw new Error('Sin conexión a Firebase');
    var qs = await db.collection('respuestas_qr').where('fecha', '>=', F.desde).where('fecha', '<=', F.hasta).get();
    var qr = qs.docs.map(function (d) { var x = d.data(); x.id = d.id; return x; });
    var man = [];
    if (F.mod !== 'QR') {
      try { var ms = await db.collection('evaluaciones_conocimiento').where('fecha', '>=', F.desde).where('fecha', '<=', F.hasta).get();
        man = ms.docs.map(function (d) { var x = d.data(); x.id = d.id; return x; }).filter(function (m) { return m.modalidad !== 'QR'; }); } catch (e) { man = []; }
    }
    function pasa(r) { return (!F.sup || coincide(r.sup, F.sup)) && (!F.emp || r.emp === F.emp) && (!F.tipo || (r.tipo || 'obrero') === F.tipo); }
    qr = F.mod === 'MANUAL' ? [] : qr.filter(pasa); man = man.filter(pasa);
    qr.sort(function (a, b) { return (a.fecha || '').localeCompare(b.fecha || '') || (a.ts || 0) - (b.ts || 0); });
    man.sort(function (a, b) { return (a.fecha || '').localeCompare(b.fecha || '') || (a.ts || 0) - (b.ts || 0); });
    /* banco con el que se respondió cada evaluación */
    var S = {}, H = {};
    for (var id of new Set(qr.map(function (r) { return r.sesion; }).filter(Boolean))) { try { var d = await db.collection('sesiones_qr').doc(id).get(); if (d.exists) S[id] = d.data(); } catch (e) {} }
    for (var v of new Set(qr.map(function (r) { return r.bancoVersion || 0; }).filter(function (v) { return v > 0; }))) {
      try { var h = await db.collection('banco_historial').where('version', '==', v).limit(1).get(); if (!h.empty) H[v] = h.docs[0].data(); } catch (e) {} }
    var claves = {};   /* sesion|n -> [indices correctos] (sesión vigente) */
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
      evals.push({ num: i + 1, r: r, filas: filas, ok: ok, tot: tot, nota: nota });
    }
    return { evals: evals, man: man };
  }

  /* ── Excel ── */
  function excel(F, D) {
    if (typeof XLSX === 'undefined') { aviso('No cargó la librería de Excel; recarga la página', 'e'); return; }
    var temas = []; D.evals.forEach(function (e) { (e.r.secs || []).forEach(function (s) { if (s.nom && temas.indexOf(s.nom) < 0) temas.push(s.nom); }); });
    var indice = D.evals.map(function (e) { var r = e.r, o = { 'N°': e.num, 'Fecha': fF(r.fecha), 'Hora': hora(r.ts), 'Supervisor': r.sup || '', 'Empresa': r.emp || '', 'Sector / zona': r.sector || '', 'Tipo': r.tipo === 'empleado' ? 'Empleado' : 'Obrero',
      'Ruta / Área': r.ruta || '', 'Código': r.cod || '', 'Preguntas correctas': e.ok + ' de ' + e.tot, 'Resultado %': pc(r.resultado), 'Estado': r.estado || ((+r.resultado || 0) >= 0.7 ? 'APROBADO' : 'REFUERZO'), 'ID del registro': r.id };
      temas.forEach(function (t) { var x = (r.secs || []).find(function (y) { return y.nom === t; }); o[t + ' %'] = x ? pc(x.pct) : ''; }); if (e.nota) o['Observación'] = e.nota; return o; });
    var resp = []; D.evals.forEach(function (e) { e.filas.forEach(function (f) { resp.push({ 'N° evaluación': e.num, 'Fecha': fF(e.r.fecha), 'Supervisor': e.r.sup || '', 'Sector / zona': e.r.sector || '', 'Ruta / Área': e.r.ruta || '', 'Código': e.r.cod || '',
      'Tema': f.tema, 'N° pregunta': f.n, 'Pregunta': f.t, 'Respuesta marcada': f.marcada.join(' | '), 'Respuesta correcta': f.correcta.join(' | '), 'Resultado': f.est, 'Puntaje': f.pts, 'Máximo': f.max, 'ID del registro': e.r.id }); }); });
    var nums = []; D.evals.forEach(function (e) { e.filas.forEach(function (f) { if (nums.indexOf(f.n) < 0) nums.push(f.n); }); }); nums.sort(function (a, b) { return a - b; });
    var matriz = D.evals.map(function (e) { var o = { 'N°': e.num, 'Fecha': fF(e.r.fecha), 'Supervisor': e.r.sup || '', 'Ruta / Área': e.r.ruta || '', 'Código': e.r.cod || '' };
      nums.forEach(function (n) { var f = e.filas.find(function (x) { return x.n === n; }); o['P' + n] = f ? (f.est === 'Correcta' ? '✓' : f.est === 'Parcial' ? '½' : f.est === 'Incorrecta' ? '✗' : f.pts) : ''; });
      o['Resultado %'] = pc(e.r.resultado); return o; });
    var manuales = D.man.reduce(function (a, m) { (m.rutas || [{}]).forEach(function (r) { a.push({ 'Fecha': fF(m.fecha), 'Supervisor': m.sup || '', 'Empresa': m.emp || '', 'Sector / zona': m.sector || '', 'Ruta / Área': r.nom || '', 'Código': r.cod || '',
      'Evaluados': +r.ne || 1, 'Resultado del grupo %': pc(r.resGrupo), 'Registrado por': m.nomUsuario || m.usuario || '', 'Detalle individual': 'No aplica: registro manual por grupo (la evidencia es el formato físico firmado)' }); }); return a; }, []);
    var S = ses() || {};
    var nota = [
      { 'Detalle': 'Reporte', 'Valor': 'Evidencia de respuestas por evaluación — Sistema ETI Evaluaciones' },
      { 'Detalle': 'Rango (fecha de evaluación)', 'Valor': fF(F.desde) + ' al ' + fF(F.hasta) },
      { 'Detalle': 'Supervisor', 'Valor': F.sup || 'Todos' }, { 'Detalle': 'Empresa', 'Valor': F.emp || 'Todas' }, { 'Detalle': 'Tipo', 'Valor': F.tipo || 'Obreros y empleados' },
      { 'Detalle': 'Evaluaciones por QR (con respuestas)', 'Valor': D.evals.length },
      { 'Detalle': 'Registros manuales (sin detalle individual)', 'Valor': manuales.length },
      { 'Detalle': 'Anonimato', 'Valor': 'La evaluación por QR es anónima: se identifica por fecha, hora, sector, ruta/área y código, no por nombre del trabajador.' },
      { 'Detalle': 'Calificación', 'Valor': 'Automática. Pregunta única: correcta = puntaje completo. Varias respuestas: (aciertos − errores) / correctas, mínimo 0 (Parcial). Aprobado ≥ 70 %.' },
      { 'Detalle': 'Banco de preguntas', 'Valor': 'Cada respuesta se muestra con la versión del banco con la que fue respondida.' },
      { 'Detalle': 'Generado por', 'Valor': (S.nom || S.user || '') + ' · ' + new Date().toLocaleString('es-PE') }
    ];
    var wb = XLSX.utils.book_new();
    function hoja(rows, nom, cols) { if (!rows.length) rows = [{ 'Sin datos': '' }]; var ws = XLSX.utils.json_to_sheet(rows); if (cols) ws['!cols'] = cols; XLSX.utils.book_append_sheet(wb, ws, nom); }
    hoja(indice, 'Índice', Object.keys(indice[0] || {}).map(function (k) { return { wch: Math.max(9, Math.min(34, k.length + 3)) }; }));
    hoja(resp, 'Respuestas', [{ wch: 8 }, { wch: 11 }, { wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 8 }, { wch: 22 }, { wch: 8 }, { wch: 60 }, { wch: 45 }, { wch: 45 }, { wch: 11 }, { wch: 8 }, { wch: 8 }, { wch: 22 }]);
    hoja(matriz, 'Matriz');
    if (manuales.length) hoja(manuales, 'Manuales');
    hoja(nota, 'Nota', [{ wch: 38 }, { wch: 110 }]);
    var nom = 'ETI-Respuestas-Auditoria-' + F.desde + (F.hasta !== F.desde ? '_a_' + F.hasta : '') + (F.sup ? '-' + norm(F.sup).slice(0, 20) : '') + '.xlsx';
    XLSX.writeFile(wb, nom);
    aviso('✅ Excel listo: ' + D.evals.length + ' evaluaciones con sus respuestas', 's');
  }

  /* ── hojas de respuesta (imprimir / guardar como PDF) ── */
  function hojas(F, D, w) {
    var S = ses() || {}, gen = new Date().toLocaleString('es-PE');
    var css = '@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font:11px/1.35 "Segoe UI",Arial,sans-serif;color:#14213D;margin:0;background:#EEF2F8}' +
      '.bar{position:sticky;top:0;background:#0B2A6F;color:#fff;padding:10px 16px;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;z-index:2}.bar button{background:#fff;color:#0B2A6F;border:0;border-radius:8px;padding:8px 14px;font-weight:800;cursor:pointer}' +
      '.hoja{background:#fff;max-width:200mm;margin:12px auto;padding:10mm;box-shadow:0 2px 10px rgba(0,0,0,.08);page-break-after:always}.hoja:last-child{page-break-after:auto}' +
      'h1{font-size:16px;margin:0 0 4px}h2{font-size:13px;margin:0}.mut{color:#5B6B85}.cab{display:grid;grid-template-columns:repeat(4,1fr);gap:4px 12px;border:1px solid #D9E0EC;border-radius:8px;padding:8px;margin:8px 0}.cab b{display:block;font-size:10.5px}.cab span{font-size:9px;color:#5B6B85;text-transform:uppercase}' +
      'table{width:100%;border-collapse:collapse;margin-top:6px}th,td{border:1px solid #D9E0EC;padding:3px 5px;vertical-align:top;text-align:left}th{background:#F1F5FB;font-size:9.5px}td.c{text-align:center;white-space:nowrap}.ok{color:#007A3D;font-weight:800}.pa{color:#B45309;font-weight:800}.no{color:#C8102E;font-weight:800}' +
      '.res{display:flex;justify-content:space-between;align-items:center;margin-top:4px}.badge{border-radius:99px;padding:3px 10px;font-weight:800}.pie{margin-top:8px;font-size:9px;color:#5B6B85;border-top:1px solid #D9E0EC;padding-top:4px}' +
      '@media print{body{background:#fff}.bar{display:none}.hoja{box-shadow:none;margin:0;max-width:none;padding:0}}';
    var portada = '<section class="hoja"><h1>Evidencia de respuestas por evaluación</h1><div class="mut">Sistema ETI · Evaluación de Conocimiento de Buenas Prácticas Sociales y Laborales</div>' +
      '<div class="cab"><div><span>Rango</span><b>' + esc(fF(F.desde) + ' al ' + fF(F.hasta)) + '</b></div><div><span>Supervisor</span><b>' + esc(F.sup || 'Todos') + '</b></div><div><span>Empresa</span><b>' + esc(F.emp || 'Todas') + '</b></div><div><span>Tipo</span><b>' + esc(F.tipo || 'Obreros y empleados') + '</b></div>' +
      '<div><span>Evaluaciones QR</span><b>' + D.evals.length + '</b></div><div><span>Aprobados ≥70%</span><b>' + D.evals.filter(function (e) { return (+e.r.resultado || 0) >= 0.7; }).length + '</b></div><div><span>Registros manuales</span><b>' + D.man.length + ' (sin detalle individual)</b></div><div><span>Generado</span><b>' + esc(gen) + '</b></div></div>' +
      '<table><thead><tr><th>N°</th><th>Fecha</th><th>Hora</th><th>Supervisor</th><th>Sector</th><th>Ruta / Área</th><th>Código</th><th>Correctas</th><th>Resultado</th></tr></thead><tbody>' +
      D.evals.map(function (e) { var r = e.r, a = (+r.resultado || 0) >= 0.7; return '<tr><td class="c">' + e.num + '</td><td>' + esc(fF(r.fecha)) + '</td><td>' + esc(hora(r.ts)) + '</td><td>' + esc(r.sup || '') + '</td><td>' + esc(r.sector || '') + '</td><td>' + esc(r.ruta || '') + '</td><td>' + esc(r.cod || '') + '</td><td class="c">' + e.ok + '/' + e.tot + '</td><td class="c ' + (a ? 'ok' : 'no') + '">' + pc(r.resultado) + '%</td></tr>'; }).join('') +
      '</tbody></table><div class="pie">La evaluación por QR es anónima: cada hoja se identifica por fecha, hora, sector, ruta/área, código e ID del registro. Calificación automática; aprobado ≥ 70 %. Las preguntas de varias respuestas se califican de forma proporcional (Parcial). Generado por ' + esc(S.nom || S.user || '') + '.</div></section>';
    var paginas = D.evals.map(function (e) {
      var r = e.r, a = (+r.resultado || 0) >= 0.7;
      return '<section class="hoja"><div class="res"><h2>Hoja de respuestas N° ' + e.num + ' de ' + D.evals.length + '</h2><span class="badge" style="background:' + (a ? '#E6F7EE;color:#007A3D' : '#FDECEE;color:#C8102E') + '">' + pc(r.resultado) + '% · ' + (a ? 'APROBADO' : 'REFUERZO') + '</span></div>' +
        '<div class="cab"><div><span>Fecha / hora</span><b>' + esc(fF(r.fecha) + ' ' + hora(r.ts)) + '</b></div><div><span>Supervisor</span><b>' + esc(r.sup || '') + '</b></div><div><span>Empresa</span><b>' + esc(r.emp || '') + '</b></div><div><span>Tipo</span><b>' + (r.tipo === 'empleado' ? 'Empleado' : 'Obrero') + '</b></div>' +
        '<div><span>Sector / zona</span><b>' + esc(r.sector || '') + '</b></div><div><span>Ruta / Área</span><b>' + esc(r.ruta || '') + '</b></div><div><span>Código</span><b>' + esc(r.cod || '—') + '</b></div><div><span>Correctas</span><b>' + e.ok + ' de ' + e.tot + '</b></div></div>' +
        (e.nota ? '<div class="mut" style="margin:4px 0">⚠ ' + esc(e.nota) + '</div>' : '') +
        '<table><thead><tr><th style="width:4%">N°</th><th style="width:34%">Pregunta</th><th style="width:25%">Respuesta marcada</th><th style="width:25%">Respuesta correcta</th><th style="width:12%">Resultado</th></tr></thead><tbody>' +
        e.filas.map(function (f) { var cl = f.est === 'Correcta' ? 'ok' : f.est === 'Parcial' ? 'pa' : 'no';
          return '<tr><td class="c">' + f.n + '</td><td>' + esc(f.t) + (f.multi ? ' <span class="mut">(varias)</span>' : '') + '</td><td>' + esc(f.marcada.join(' · ') || '—') + '</td><td>' + esc(f.correcta.join(' · ') || '—') + '</td><td class="c ' + cl + '">' + (f.est === 'Correcta' ? '✓ ' : f.est === 'Parcial' ? '½ ' : '✗ ') + esc(f.est) + '<br><span class="mut">' + f.pts + (f.max !== '' ? ' / ' + f.max : '') + ' pts</span></td></tr>'; }).join('') +
        '</tbody></table>' +
        '<div class="res" style="margin-top:6px">' + (r.secs || []).map(function (s) { return '<span class="mut">' + esc(s.nom) + ': <b>' + pc(s.pct) + '%</b></span>'; }).join(' ') + '</div>' +
        '<div class="pie">ID del registro: ' + esc(r.id) + ' · Código QR: ' + esc(r.sesion || '') + ' · Evaluación anónima respondida por el trabajador desde su celular · Generado el ' + esc(gen) + '</div></section>';
    }).join('');
    var html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Respuestas ETI ' + esc(F.desde) + (F.hasta !== F.desde ? ' a ' + esc(F.hasta) : '') + '</title><style>' + css + '</style></head><body>' +
      '<div class="bar"><b>🧾 ' + D.evals.length + ' hojas de respuesta · ' + esc(fF(F.desde) + ' al ' + fF(F.hasta)) + '</b><button onclick="window.print()">🖨 Imprimir / Guardar como PDF</button></div>' + portada + paginas + '</body></html>';
    w.document.open(); w.document.write(html); w.document.close();
  }

  /* ── ventana de opciones ── */
  function abrir() {
    if (!esAdm()) return;
    var F = filtrosPantalla();
    if (!F.desde || !F.hasta) { aviso('Elige un rango de fechas', 'e'); return; }
    var m = $('ra-modal'); if (!m) { m = document.createElement('div'); m.id = 'ra-modal'; document.body.appendChild(m); }
    m.style.cssText = 'position:fixed;inset:0;background:rgba(10,20,40,.55);z-index:99990;display:flex;align-items:center;justify-content:center;padding:16px';
    m.innerHTML = '<div style="background:#fff;border-radius:16px;max-width:480px;width:100%;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,.35);font-family:inherit">' +
      '<div style="font-size:17px;font-weight:800;color:#0B2A6F">🧾 Respuestas para auditoría</div>' +
      '<div style="font-size:13px;color:#475569;margin:6px 0 12px;line-height:1.5">Descarga lo que respondió cada trabajador en su evaluación por QR: pregunta por pregunta, la respuesta marcada, la correcta y el resultado. Se usa el filtro que tienes en pantalla:</div>' +
      '<div style="background:#F1F5FB;border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.7"><b>Rango:</b> ' + esc(fF(F.desde) + ' al ' + fF(F.hasta)) + '<br><b>Supervisor:</b> ' + esc(F.sup || 'Todos') + (F.emp ? '<br><b>Empresa:</b> ' + esc(F.emp) : '') + (F.tipo ? '<br><b>Tipo:</b> ' + esc(F.tipo) : '') + '<br><span id="ra-cuenta" style="color:#5B6B85">Contando evaluaciones…</span></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn bpri" id="ra-xls" disabled>📥 Excel de respuestas</button><button class="btn bpri" id="ra-pdf" disabled style="background:#6A3FC0;border-color:#6A3FC0">🖨 Hojas de respuesta (PDF)</button><button class="btn bout" id="ra-no">Cerrar</button></div>' +
      '<div style="font-size:11.5px;color:#5B6B85;margin-top:10px">Las evaluaciones <b>manuales</b> se registran por grupo (sin respuesta individual): en el Excel van en una hoja aparte; su evidencia es el formato físico.</div></div>';
    $('ra-no').onclick = function () { m.remove(); };
    m.onclick = function (e) { if (e.target === m) m.remove(); };
    var datos = null;
    cargar(F).then(function (D) {
      datos = D; var c = $('ra-cuenta'); if (!c) return;
      c.innerHTML = '<b style="color:#0B2A6F">' + D.evals.length + '</b> evaluaciones por QR con sus respuestas' + (D.man.length ? ' · ' + D.man.length + ' registros manuales' : '');
      $('ra-xls').disabled = !(D.evals.length || D.man.length); $('ra-pdf').disabled = !D.evals.length;
    }).catch(function (e) { var c = $('ra-cuenta'); if (c) c.innerHTML = '<b style="color:#C8102E">No se pudo leer: ' + esc(e.message) + '</b>'; });
    $('ra-xls').onclick = function () { if (datos) excel(F, datos); };
    $('ra-pdf').onclick = function () {
      if (!datos) return; var w = window.open('', '_blank');
      if (!w) { aviso('Permite las ventanas emergentes para ver las hojas de respuesta', 'e'); return; }
      w.document.write('<p style="font-family:sans-serif;padding:20px">Preparando hojas de respuesta…</p>'); hojas(F, datos, w);
    };
  }

  /* ── botón en "Evaluaciones por supervisor" (junto a 📥 Excel de este rango) ── */
  function poner() {
    if (!esAdm()) return; var box = $('mis-box'); if (!box || $('ra-btn')) return;
    var ref = Array.prototype.find.call(box.querySelectorAll('button'), function (b) { return /ETITF\.exportar/.test(b.getAttribute('onclick') || ''); });
    if (!ref) return;
    var b = document.createElement('button'); b.id = 'ra-btn'; b.type = 'button'; b.className = 'btn bout bsm';
    b.style.cssText = 'border-color:#6A3FC0;color:#6A3FC0;font-weight:800'; b.title = 'Respuesta de cada trabajador, pregunta por pregunta (evidencia para auditoría)';
    b.textContent = '🧾 Respuestas (auditoría)'; b.onclick = abrir;
    ref.parentNode.insertBefore(b, ref.nextSibling);
  }
  var obs = null;
  setInterval(function () {
    var box = $('mis-box'); if (!box) return;
    if (!obs) { obs = new MutationObserver(poner); obs.observe(box, { childList: true }); }
    poner();
  }, 1000);
  window.ETIRespuestas = { abrir: abrir, cargar: cargar };
})();
