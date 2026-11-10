/* ════════════════════════════════════════════════════════════════════════════
   _CENTRO_INFORMES_V1 (10-nov-2026) — Menu ordenado + Centro de informes + Expediente de auditoria
   · MENU (solo presentacion): agrupa el menu lateral en Inicio · Evaluar · Seguimiento · Informes ·
     Configuracion. No crea ni borra pantallas: solo cambia el ORDEN (CSS order) y oculta las entradas
     de informes sueltas, que ahora se abren desde el Centro de informes con sus mismas funciones.
   · CENTRO DE INFORMES: una tarjeta por informe (que es, quien, cuando) que llama a las funciones de
     siempre: ETIMIS (GH-03 / GH-04), Informes ETI emitidos, Cierre de ciclo, Informe historico, Excel.
   · EXPEDIENTE DE AUDITORIA POR SECTOR (Joel, Lucia, administradores): usa EXACTAMENTE los datos y
     calculos del Informe de cierre de ciclo (etiInformeCicloUI.datos/armar/conclusiones), todo leido
     de Supabase (eti/consultar). Vista en pantalla, Imprimir / PDF (A4) y Excel. Solo lee: no cambia nada.
   INTERRUPTOR (vuelve al menu anterior): localStorage.setItem('eti_menu_clasico','on') y recargar.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.etiCentroInformes) return;
  var CLASICO = false; try { CLASICO = localStorage.getItem('eti_menu_clasico') === 'on'; } catch (e) {}
  var EDITORES = ['jtimoteo', 'lcastillo'], MIN = 0.70;
  var SECTORES = ['El Papayo', 'Limones', 'Los Olivares', 'Aproa', 'Algarrobos', 'San Vicente', 'Planta Rapel', 'Olivares Bajo', 'Santa Rosa', 'Punta Arenas'];
  var COORD = { nom: 'Joel Angel Timoteo Gonza', cargo: 'Coordinador de Relaciones Laborales' };

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var ses = function () { try { return typeof SESSION !== 'undefined' ? SESSION : null; } catch (e) { return null; } };
  var aviso = function (m, t) { try { if (typeof toast === 'function') toast(m, t || 'i'); } catch (e) {} };
  var hoy = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var fF = function (f) { return f ? String(f).slice(0, 10).split('-').reverse().join('/') : '—'; };
  var pc = function (x) { return x == null || isNaN(x) ? '—' : (Math.round(x * 1000) / 10).toFixed(1) + '%'; };
  function esEditor() { var s = ses(); return !!s && (s.rol === 'admin' || EDITORES.indexOf(String(s.user || '').toLowerCase()) >= 0); }
  function esAdmin() { var s = ses(); return !!s && s.rol === 'admin'; }
  function empDe(sec) { try { return window.etiAlertasRef.empDe(sec, '') || ''; } catch (e) { return ''; } }
  function cerrarLateral() { document.body.classList.remove('side-open'); }

  /* ══ 1) MENU ORDENADO (solo CSS order: los botones son los mismos) ══ */
  var ORDEN_ADM = [
    ['Inicio', ['#atab1']],
    ['Evaluar', ['#atab4', '#atab9', '#enc-menu']],
    ['Seguimiento', ['#atab12', '.es-it[data-k="mis"]', '#atab8', '#alr-menu', '#atab7', '#atab13']],
    ['Informes', ['#ci-menu']],
    ['Configuración 🔒', ['#atab2', '#atab10', '#atab11']]];
  var ORDEN_SUP = [
    ['Inicio', ['.es-it[data-k="sm"]']],
    ['Evaluar', ['.es-it[data-k="eval"]', '.es-it[data-k="qr"]', '#enc-menu']],
    ['Seguimiento', ['.es-it[data-k="mis"]', '#alr-menu', '.es-it[data-k="ind"]']],
    ['Informes', ['#ci-menu']]];
  var OCULTAR = ['#inf-menu', '#icc-menu'];   /* se abren desde el Centro de informes */
  function cssMenu() {
    if ($('ci-css-menu')) return;
    var L = ['body.eti-ci #es-nav{display:flex;flex-direction:column}',
      'body.eti-ci #es-nav > *{order:90}',
      'body.eti-ci #es-nav > .es-sec:not(.ci-sec){display:none!important}',
      OCULTAR.map(function (s) { return 'body.eti-ci #es-nav ' + s; }).join(',') + '{display:none!important}'];
    [['adm', ORDEN_ADM], ['sup', ORDEN_SUP]].forEach(function (g) {
      var n = 0;
      g[1].forEach(function (grupo, gi) {
        L.push('body.eti-ci.ci-' + g[0] + ' #es-nav > .ci-sec[data-g="' + gi + '"]{order:' + (n++) + '}');
        grupo[1].forEach(function (sel) { L.push('body.eti-ci.ci-' + g[0] + ' #es-nav > ' + sel + '{order:' + (n++) + '}'); });
      });
      L.push('body.eti-ci.ci-' + g[0] + ' #es-nav > .ci-sec[data-r="' + (g[0] === 'adm' ? 'sup' : 'adm') + '"]{display:none!important}');
    });
    var st = document.createElement('style'); st.id = 'ci-css-menu'; st.textContent = L.join('\n'); document.head.appendChild(st);
  }
  function menu() {
    var nav = $('es-nav'), s = ses(); if (!nav || !s) return;
    var rol = s.rol === 'admin' ? 'adm' : 'sup', grupos = rol === 'adm' ? ORDEN_ADM : ORDEN_SUP;
    if (!$('ci-menu')) {
      var b = document.createElement('button'); b.id = 'ci-menu'; b.className = 'es-it'; b.type = 'button';
      b.innerHTML = '<span>📑</span><span>Centro de informes</span>';
      b.onclick = function () { cerrarLateral(); abrirCentro(); };
      nav.appendChild(b);
    }
    if (CLASICO) return;
    cssMenu();
    document.body.classList.add('eti-ci'); document.body.classList.toggle('ci-adm', rol === 'adm'); document.body.classList.toggle('ci-sup', rol === 'sup');
    grupos.forEach(function (g, gi) {
      if (nav.querySelector('.ci-sec[data-r="' + rol + '"][data-g="' + gi + '"]')) return;
      var d = document.createElement('div'); d.className = 'es-sec ci-sec'; d.setAttribute('data-r', rol); d.setAttribute('data-g', gi); d.textContent = g[0];
      nav.appendChild(d);
    });
  }

  /* ══ 2) CENTRO DE INFORMES ══ */
  function css() {
    if ($('ci-css')) return;
    var st = document.createElement('style'); st.id = 'ci-css';
    st.textContent = [
      '.ci-ov{position:fixed;inset:0;background:rgba(10,20,40,.55);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:1rem}',
      '.ci-box{background:#F1F5F9;border-radius:16px;max-width:1180px;width:100%;height:94vh;max-height:94vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:Barlow,Inter,"Segoe UI",sans-serif;color:#0F172A}',
      '.ci-hd{padding:.9rem 1.2rem .7rem;display:flex;justify-content:space-between;align-items:flex-start;gap:.8rem;border-bottom:1px solid #E2E8F0;background:#fff}.ci-hd b{font-size:1.2rem;color:#0E2A5C}.ci-hd small{display:block;color:#5B6B82;font-size:.84rem;margin-top:.15rem}',
      '.ci-bd{padding:1rem 1.2rem 1.4rem;overflow:auto;flex:1;-webkit-overflow-scrolling:touch}',
      '.ci-b{min-height:38px;padding:0 13px;border-radius:9px;border:1.5px solid #0E2A5C;background:#fff;font:800 .88rem Barlow,sans-serif;color:#0E2A5C;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem;white-space:nowrap}',
      '.ci-b.p{background:#0E2A5C;color:#fff}.ci-b.r{background:#C8102E;border-color:#C8102E;color:#fff}.ci-b:disabled{opacity:.45;cursor:not-allowed}',
      '.ci-pasos{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:.6rem .9rem;margin-bottom:.9rem;font-size:.84rem}',
      '.ci-pasos i{font-style:normal;width:22px;height:22px;border-radius:50%;background:#0E2A5C;color:#fff;font-weight:800;font-size:.75rem;display:inline-flex;align-items:center;justify-content:center;margin-right:.3rem}',
      '.ci-pasos span.f{color:#94A3B8;margin:0 .2rem}',
      '.ci-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:.8rem}',
      '.ci-card{background:#fff;border:1px solid #E2E8F0;border-top:4px solid #0E2A5C;border-radius:12px;padding:.85rem .95rem;display:flex;flex-direction:column;gap:.45rem}',
      '.ci-card h4{margin:0;font-size:1rem;color:#0F172A;display:flex;align-items:center;gap:.45rem}.ci-card h4 i{font-style:normal;width:24px;height:24px;border-radius:50%;color:#fff;font-size:.78rem;display:inline-flex;align-items:center;justify-content:center}',
      '.ci-card p{margin:0;font-size:.86rem;color:#334155;line-height:1.4}',
      '.ci-card dl{display:grid;grid-template-columns:62px 1fr;gap:.1rem .5rem;margin:0;font-size:.82rem}.ci-card dt{color:#64748B}.ci-card dd{margin:0}',
      '.ci-card .bt{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:auto;padding-top:.3rem}',
      '.ci-f{display:flex;gap:.6rem;flex-wrap:wrap;align-items:flex-end;background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:.7rem .9rem}',
      '.ci-f label{display:block;font-size:.76rem;font-weight:700;color:#475569;margin:0 0 .25rem}',
      '.ci-f select{min-height:38px;padding:0 10px;border:1.5px solid #C7D2E6;border-radius:9px;font:600 .92rem Barlow,sans-serif;background:#fff}',
      '.ci-t{width:100%;border-collapse:collapse;font-size:.85rem;background:#fff}.ci-t th{background:#F8FAFC;color:#475569;text-align:left;padding:.45rem;border-bottom:1px solid #E2E8F0;font-size:.76rem;white-space:nowrap}',
      '.ci-t td{padding:.45rem;border-bottom:1px solid #EEF2F6}.ci-t tr.sel td{background:#EFF6FF}',
      '.ci-p{display:inline-block;min-width:54px;text-align:center;font-weight:800;border-radius:999px;padding:.1rem .45rem;font-size:.8rem}',
      '.ci-vacio{padding:1.3rem;text-align:center;color:#64748B;background:#fff;border:1px dashed #CBD5E1;border-radius:12px;margin-top:.8rem}',
      '.ci-doc{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:1rem;margin-top:.8rem;overflow-x:auto}'
    ].join('\n');
    document.head.appendChild(st);
  }
  var M = null;
  function modal(titulo, sub, cuerpo) {
    css(); if (M) M.remove();
    M = document.createElement('div'); M.className = 'ci-ov';
    M.innerHTML = '<div class="ci-box" role="dialog" aria-modal="true"><div class="ci-hd"><div><b>' + titulo + '</b><small>' + sub + '</small></div>' +
      '<div style="display:flex;gap:.4rem">' + (titulo.indexOf('Centro') < 0 ? '<button class="ci-b" id="ci-volver">← Centro de informes</button>' : '') + '<button class="ci-b" id="ci-x">✕ Cerrar</button></div></div><div class="ci-bd" id="ci-bd">' + cuerpo + '</div></div>';
    document.body.appendChild(M);
    $('ci-x').onclick = cerrar;
    if ($('ci-volver')) $('ci-volver').onclick = abrirCentro;
    M.addEventListener('click', function (e) { if (e.target === M) cerrar(); });
    return M;
  }
  function cerrar() { if (M) { M.remove(); M = null; } }
  function tarjeta(n, color, t, que, quien, cuando, botones) {
    return '<div class="ci-card" style="border-top-color:' + color + '"><h4><i style="background:' + color + '">' + n + '</i>' + t + '</h4><p>' + que + '</p>' +
      '<dl><dt>Quién</dt><dd>' + quien + '</dd><dt>Cuándo</dt><dd>' + cuando + '</dd></dl><div class="bt">' +
      botones.map(function (b) { return '<button class="ci-b' + (b[2] ? ' ' + b[2] : '') + '" data-ci="' + b[0] + '">' + b[1] + '</button>'; }).join('') + '</div></div>';
  }
  var ACC = {
    mis: function () { cerrar(); if (window.ETIMIS && ETIMIS.abrir) ETIMIS.abrir(); else aviso('Recarga la página (Ctrl+F5)', 'e'); },
    emitidos: function () { cerrar(); var b = $('inf-menu'); if (b) b.click(); else aviso('Informes ETI aún cargando, intenta en unos segundos', 'i'); },
    expediente: function () { abrirExpediente(); },
    ciclo: function () { cerrar(); if (window.etiInformeCicloUI && etiInformeCicloUI.abrir) etiInformeCicloUI.abrir(); else aviso('Recarga la página (Ctrl+F5)', 'e'); },
    historico: function () { cerrar(); if (typeof window.etiInformeAuditoria === 'function') window.etiInformeAuditoria(); else aviso('Solo el administrador', 'e'); },
    excel: function () { if (typeof exportAdminExcel === 'function') exportAdminExcel(); else aviso('Solo el administrador', 'e'); },
    alertas: function () { cerrar(); var b = $('alr-menu'); if (b) b.click(); }
  };
  function pasos() {
    var L = [['Capacitar', 'Capacitaciones ETI'], ['Evaluar', 'QR o manual'], ['Informe GH-03', 'por sesión'], ['Reforzar', 'rutas < 70 %'], ['Expediente', 'por sector'], ['Cierre de ciclo', 'cada trimestre']];
    return '<div class="ci-pasos"><b style="color:#475569;margin-right:.3rem">Así se trabaja:</b>' + L.map(function (x, i) { return '<span><i>' + (i + 1) + '</i><b>' + x[0] + '</b> <small style="color:#64748B">' + x[1] + '</small></span>'; }).join('<span class="f">→</span>') + '</div>';
  }
  function abrirCentro() {
    var ed = esEditor(), adm = esAdmin(), c = [];
    c.push(tarjeta(1, '#0E2A5C', 'Informe Check List · GH-03', 'Informe oficial de cada sesión de evaluación, con fotos. El sistema llena los cuadros.', ed ? 'Supervisor lo emite · administración lo revisa' : 'Tú', 'Al terminar cada evaluación',
      [['mis', ed ? 'Emitir / ver por evaluación' : 'Emitir desde mis evaluaciones', 'p'], ['emitidos', 'Informes emitidos']]));
    c.push(tarjeta(2, '#0E2A5C', 'Informe de capacitación · GH-04', 'Capacitación de actualización y desarrollo o reforzamiento. Sale en Word para insertar las fotos.', ed ? 'Supervisor' : 'Tú', 'Después de capacitar o reforzar',
      [['mis', 'Emitir desde ' + (ed ? 'evaluaciones' : 'mis evaluaciones'), 'p']]));
    if (ed) c.push(tarjeta(3, '#15803D', 'Expediente de auditoría', 'Todo un sector ordenado: programación, capacitaciones, temas, rutas y códigos, reforzamientos, satisfacción y conclusiones.', 'Certificaciones · auditoría', 'Cuando lo pidan o al cerrar el mes',
      [['expediente', 'Abrir expediente', 'r']]));
    c.push(tarjeta(ed ? 4 : 3, '#15803D', 'Informe de cierre de ciclo', 'Resultado del trimestre ' + (ed ? 'por sector y general' : 'de tu sector') + ', con la decisión de reforzamiento. Word.', ed ? 'Coordinación y Certificaciones' : 'Tú y la Coordinación', 'Al cerrar cada ciclo (I a IV)',
      [['ciclo', 'Abrir', 'p']]));
    c.push(tarjeta(ed ? 5 : 4, '#B45309', 'Alertas de reforzamiento', 'Rutas con algún tema bajo 70 % y su seguimiento (pendiente · reforzado · superada).', ed ? 'Supervisores y Coordinación' : 'Tú', 'Después de cada evaluación',
      [['alertas', 'Ver alertas', 'p']]));
    if (adm) c.push(tarjeta(6, '#475569', 'Datos y respaldos', 'Excel con todas las evaluaciones e informe de auditoría del histórico 2026 (Reporte y GH-04 oficiales).', 'Administración', 'Cuando se necesite el dato fuente',
      [['excel', 'Excel global', 'p'], ['historico', 'Histórico para auditoría']]));
    modal('📑 Centro de informes', 'Todos los informes ETI en un solo lugar, en el orden en que se trabajan.', pasos() + '<div class="ci-grid">' + c.join('') + '</div>' +
      '<p style="font-size:.82rem;color:#64748B;margin:.9rem 0 0">Cada informe se abre desde aquí con el mismo botón de siempre. Los datos se leen de Supabase.</p>');
    Array.prototype.forEach.call(M.querySelectorAll('[data-ci]'), function (b) { b.onclick = function () { var f = ACC[b.getAttribute('data-ci')]; if (f) f(); }; });
  }

  /* ══ 3) EXPEDIENTE DE AUDITORIA POR SECTOR ══ */
  var colP = function (p) { return p == null ? ['#F1F5F9', '#64748B'] : p < MIN ? ['#FEE2E2', '#B91C1C'] : p < 0.8 ? ['#FEF3C7', '#92400E'] : ['#DCFCE7', '#15803D']; };
  var chip = function (p) { var c = colP(p); return '<span class="x-chip" style="background:' + c[0] + ';color:' + c[1] + '">' + pc(p) + '</span>'; };
  var est = function (t, k) { var c = { ok: ['#DCFCE7', '#166534'], med: ['#FEF3C7', '#92400E'], bad: ['#FEE2E2', '#991B1B'], info: ['#E0E7FF', '#1E3A8A'] }[k]; return '<span class="x-chip" style="background:' + c[0] + ';color:' + c[1] + '">' + esc(t) + '</span>'; };
  var ciclos = function () { try { return window.etiAlertasRef.ciclos(); } catch (e) { return []; } };
  var ULT = null;
  function listo() { return !!(window.etiAlertasRef && window.etiInformeCicloUI && etiInformeCicloUI.datos && etiInformeCicloUI.armar && etiInformeCicloUI.conclusiones); }
  function abrirExpediente() {
    if (!esEditor()) { aviso('El expediente de auditoría es para la administración (Joel, Lucía)', 'e'); return; }
    if (!listo()) { aviso('Recarga la página (Ctrl+F5) para cargar el expediente', 'e'); return; }
    var cs = ciclos(), h = hoy(), act = cs.find(function (c) { return h >= c.desde && h <= c.hasta; }) || cs[0];
    modal('🗂 Expediente de auditoría', 'Toda la evidencia ETI de un sector, ordenada para Certificaciones o el auditor. Solo lectura.',
      '<div class="ci-f"><div><label>Ciclo</label><select id="xp-ci">' + cs.map(function (c) { return '<option value="' + c.id + '"' + (act && c.id === act.id ? ' selected' : '') + '>' + esc(c.nom) + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Empresa</label><select id="xp-emp"><option value="">Todas</option><option>RAPEL</option><option>VERFRUT</option></select></div>' +
      '<div><button class="ci-b p" id="xp-res">📋 Ver sectores</button></div></div><div id="xp-out"><div class="ci-vacio">Elige el ciclo y pulsa <b>📋 Ver sectores</b>.</div></div>');
    $('xp-res').onclick = resumen;
    resumen();
  }
  function cicloSel() { var id = $('xp-ci').value; return ciclos().find(function (c) { return c.id === id; }); }
  async function resumen() {
    var out = $('xp-out'), b = $('xp-res'), c = cicloSel(), emp = $('xp-emp').value; if (!c) return;
    b.disabled = true; out.innerHTML = '<p>⏳ Leyendo de Supabase capacitaciones, evaluaciones, reforzamientos y encuestas de ' + esc(c.nom) + '…</p>';
    try {
      var o = { modo: 'general', ciclo: c, emp: emp, sector: '' }, X = await etiInformeCicloUI.datos(o), R = etiInformeCicloUI.armar(o, X);
      var cap = {}; R.cap.porSector.forEach(function (s) { cap[norm(s.sector)] = s; });
      var ev = {}; R.ev.sectores.forEach(function (s) { ev[norm(s.sector)] = s; });
      var rut = {}; R.ev.rutas.forEach(function (r) { var k = norm(r.sector); rut[k] = (rut[k] || 0) + 1; });
      var obs = {}; R.alertas.forEach(function (a) { var k = norm(a.sector); obs[k] = obs[k] || {}; obs[k][a.ruta + '|' + a.cod] = 1; });
      var pend = {}; R.alertas.forEach(function (a) { if (a.estado !== 'superada') { var k = norm(a.sector); pend[k] = (pend[k] || 0) + 1; } });
      var nEv = {}; R.anexo.forEach(function (a) { var k = norm(a.sector); nEv[k] = (nEv[k] || 0) + a.n; });
      var lista = SECTORES.filter(function (s) { return !emp || empDe(s) === emp; });
      var filas = lista.map(function (s) {
        var k = norm(s), cp = cap[k], e = ev[k], hay = !!(cp || e), no = Object.keys(obs[k] || {}).length, pd = pend[k] || 0;
        var estado = !hay ? est('Sin datos', 'info') : pd ? est(pd + ' reforz. por cerrar', 'med') : est('Completo', 'ok');
        return '<tr><td><b>' + esc(s) + '</b></td><td>' + esc(empDe(s)) + '</td><td style="text-align:right">' + (cp ? cp.sesiones : 0) + '</td><td style="text-align:right">' + (cp ? cp.total : 0) + '</td>' +
          '<td style="text-align:right">' + (rut[k] || 0) + '</td><td style="text-align:right">' + (nEv[k] || 0) + '</td><td>' + (e ? chip(e.prom) : '—') + '</td>' +
          '<td style="text-align:right;color:' + (no ? '#B91C1C' : '#15803D') + ';font-weight:800">' + no + '</td><td>' + estado + '</td>' +
          '<td style="white-space:nowrap"><button class="ci-b p" data-xs="' + esc(s) + '"' + (hay ? '' : ' disabled') + '>👁 Ver expediente</button></td></tr>';
      }).join('');
      out.innerHTML = '<div class="ci-doc" style="padding:0"><table class="ci-t"><thead><tr><th>Sector</th><th>Empresa</th><th>Capacit.</th><th>Capacitados</th><th>Rutas</th><th>Evaluados</th><th>Resultado</th><th>Rutas &lt; 70 %</th><th>Estado</th><th></th></tr></thead><tbody>' + filas + '</tbody></table></div>' +
        '<p style="font-size:.8rem;color:#64748B;margin:.5rem 0 0">Mismos cálculos que el Informe de cierre de ciclo y las Alertas de reforzamiento. Una ruta cuenta como "&lt; 70 %" si tiene algún tema bajo 70 %.</p>';
      Array.prototype.forEach.call(out.querySelectorAll('[data-xs]'), function (x) { x.onclick = function () { verSector(x.getAttribute('data-xs')); }; });
    } catch (e) { console.error('[_CENTRO_INFORMES_V1]', e); out.innerHTML = '<div class="ci-vacio">No se pudo leer: ' + esc(e.message) + '</div>'; }
    finally { b.disabled = false; }
  }
  function norm(s) { return String(s || '').trim().toUpperCase().replace(/\s+/g, ' '); }   /* misma comparacion que el Informe de cierre de ciclo (U(x.sector) === U(sector)) */
  async function verSector(sector) {
    var out = $('xp-out'), c = cicloSel(); if (!c) return;
    out.innerHTML = '<p>⏳ Armando el expediente de ' + esc(sector) + '…</p>';
    try {
      var o = { modo: 'sector', ciclo: c, emp: empDe(sector), sector: sector }, X = await etiInformeCicloUI.datos(o), R = etiInformeCicloUI.armar(o, X), K = etiInformeCicloUI.conclusiones(o, R);
      ULT = { o: o, R: R, K: K, html: documento(o, R, K) };
      out.innerHTML = '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem"><button class="ci-b" id="xp-atras">← Sectores</button><button class="ci-b r" id="xp-pdf">🖨 Imprimir / PDF</button><button class="ci-b p" id="xp-xls">📊 Excel del sector</button></div>' +
        '<div class="ci-doc"><div style="max-width:794px;margin:0 auto">' + ULT.html + '</div></div>';
      $('xp-atras').onclick = resumen; $('xp-pdf').onclick = imprimir; $('xp-xls').onclick = excel;
    } catch (e) { console.error('[_CENTRO_INFORMES_V1]', e); out.innerHTML = '<div class="ci-vacio">No se pudo armar el expediente: ' + esc(e.message) + '</div>'; }
  }
  function logo() { try { var m = getComputedStyle(document.documentElement).getPropertyValue('--logo').match(/url\(["']?(data:[^"')]+)/); return m ? m[1] : ''; } catch (e) { return ''; } }
  /* Documento con el MODELO de los informes gerenciales (cabecera, secciones numeradas, tarjetas, tablas) */
  function documento(o, R, K) {
    var ev = R.ev, s = ses() || {}, emp = o.emp === 'RAPEL' ? 'Sociedad Agrícola Rapel S.A.C.' : 'Sociedad Exportadora Verfrut S.A.C.';
    var T = ev.temas, n = 0;
    var h2 = function (t) { n++; return '<h2 class="x-h2">' + n + '. ' + t + '</h2>'; };
    var tabla = function (heads, filas, alinea) { return '<table class="x-t"><thead><tr>' + heads.map(function (x, i) { return '<th style="text-align:' + ((alinea || [])[i] || 'left') + '">' + x + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (filas.length ? filas.map(function (f) { return '<tr>' + f.map(function (x, i) { return '<td style="text-align:' + ((alinea || [])[i] || 'left') + '">' + x + '</td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="' + heads.length + '" style="text-align:center;color:#64748B">Sin registros en el periodo</td></tr>') + '</tbody></table>'; };
    var obs = {}; R.alertas.forEach(function (a) { obs[a.ruta + '|' + a.cod] = 1; });
    var abiertas = R.alertas.filter(function (a) { return a.estado !== 'superada'; }).length;
    var apr = {}; R.anexo.forEach(function (a) { var k = (a.cod || a.ruta); var z = apr[k] || (apr[k] = { n: 0, ap: 0, conAp: false }); z.n += a.n; if (a.apr != null) { z.ap += a.apr; z.conAp = true; } });
    var cards = [['Capacitaciones', String(R.cap.sesiones), R.cap.total + ' capacitados (H ' + R.cap.h + ' · M ' + R.cap.m + ')', '#0b2a6f'],
      ['Resultado de la evaluación', pc(ev.prom), ev.n + ' evaluados · aprobación ≥ 70 %', colP(ev.prom)[1]],
      ['Rutas evaluadas', String(ev.rutas.length), Object.keys(obs).length + ' con algún tema < 70 %', Object.keys(obs).length ? '#b45309' : '#15803d'],
      ['Alertas de reforzamiento', String(R.alertas.length), abiertas + ' por cerrar · ' + (R.alertas.length - abiertas) + ' superadas', abiertas ? '#b91c1c' : '#15803d'],
      ['Checklist aplicados', String(R.anexo.length), 'QR y manual', '#0b2a6f'],
      ['Satisfacción del personal', R.sat && R.sat.n ? Math.round(R.sat.gen) + '/100' : '—', R.sat ? R.sat.n + ' respuestas (QR)' : 'sin encuesta', '#0b2a6f']];
    var firmas = [{ nom: R.supervisores[0] || 'Supervisor(a) de Gestión Humana', cargo: 'Supervisor(a) de Gestión Humana · ' + o.sector }, COORD];
    var x = '';
    x += '<div class="x-hd"><div class="x-logo">' + (logo() ? '<img src="' + logo() + '" alt="Unifrutti">' : '') + '</div><div class="x-tit"><b>EXPEDIENTE DE AUDITORÍA ETI · SECTOR ' + esc(String(o.sector).toUpperCase()) + '</b><small>' + esc(emp) + ' · ' + esc(o.ciclo.nom) + '</small></div>' +
      '<div class="x-cod"><div>Código: <b>Por asignar</b></div><div>Versión N.º 0.0</div><div>Emitido: <b>' + fF(hoy()) + '</b></div></div></div>';
    x += h2('Generalidades') + '<table class="x-kv"><tbody>' + [['Empresa', emp], ['Sector', o.sector], ['Responsable(s)', R.supervisores.join(' · ') || '—'], ['Periodo', esc(o.ciclo.nom) + ' · ' + fF(o.ciclo.desde) + ' al ' + fF(o.ciclo.hasta)],
      ['Tema', 'CAP-SC-10 · Legislación laboral, mecanismo de quejas y sugerencias, hostigamiento sexual, código de conducta, medioambiente, ética empresarial'],
      ['Fuente de datos', 'Programación ETI, Capacitaciones ETI, Evaluaciones ETI (QR y manual), alertas de reforzamiento y encuesta de satisfacción · Supabase'],
      ['Emitido por', esc((s.nom || s.user || '') + ' (' + (s.user || '') + ')')]].map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + (r[0] === 'Responsable(s)' || r[0] === 'Sector' || r[0] === 'Empresa' ? esc(r[1]) : r[1]) + '</td></tr>'; }).join('') + '</tbody></table>';
    x += h2('Resumen ejecutivo') + '<div class="x-cards">' + cards.map(function (c) { return '<div style="border-top-color:' + c[3] + '"><span>' + c[0] + '</span><b style="color:' + c[3] + '">' + c[1] + '</b><small>' + esc(c[2]) + '</small></div>'; }).join('') + '</div>';
    var PG = (R.prog && R.prog.tipos) || [];
    x += h2('Cumplimiento de la programación') + tabla(['Tipo', 'Fechas programadas', 'Ejecutadas', 'Vencidas sin ejecutar', 'Por venir', 'Cumplimiento'],
      PG.filter(function (t) { return t.prog; }).map(function (t) { return ['<b>' + esc(t.nom) + '</b>', t.prog, t.ejec, t.venc, t.fut, chip(t.pct)]; }), ['left', 'right', 'right', 'right', 'right', 'left']);
    x += h2('Capacitaciones del sector') + tabla(['Fecha', 'Sesiones', 'Temas', 'Hombres', 'Mujeres', 'Capacitados'],
      R.cap.porDia.map(function (d) { return [d.fechaTxt, d.sesiones, esc(d.temas.join('; ')), d.h, d.m, '<b>' + d.total + '</b>']; }).concat(R.cap.porDia.length ? [['<b>Total</b>', '<b>' + R.cap.sesiones + '</b>', '', '<b>' + R.cap.h + '</b>', '<b>' + R.cap.m + '</b>', '<b>' + R.cap.total + '</b>']] : []),
      ['left', 'right', 'left', 'right', 'right', 'right']);
    x += h2('Resultado por tema') + tabla(['Tema', 'Evaluados', 'Resultado', 'Situación'],
      T.map(function (t) { return ['<b>' + esc(t.nom) + '</b>', t.n, chip(t.pct), t.pct == null ? '—' : t.pct >= MIN ? est('Aprobado', 'ok') : est('Reforzar', 'bad')]; })
        .concat(T.length ? [['<b>Resultado general</b>', '<b>' + ev.n + '</b>', chip(ev.prom), ev.aprueba ? est('Aprueba', 'ok') : est('No aprueba', 'bad')]] : []), ['left', 'right', 'left', 'left']);
    x += h2('Resultado por ruta y código') + '<p class="x-p">Porcentaje de cada ruta en cada tema. Una ruta queda observada si algún tema está bajo 70 %. "Bajo 70 %" cuenta a los evaluados por QR con resultado general menor a 70 %.</p>' +
      tabla(['Ruta', 'Código', 'Eval.'].concat(T.map(function (t) { return esc(t.nom); })).concat(['General', 'Bajo 70 %', 'Estado']),
        ev.rutas.map(function (r) { var z = apr[r.cod || r.ruta]; var bajo = z && z.conAp ? (z.n - z.ap) : '—';
          return [esc(r.ruta || '—'), esc(r.cod || '—'), r.n].concat(T.map(function (t) { return chip(r.temas[t.id]); })).concat(['<b>' + pc(r.prom) + '</b>', bajo, obs[r.ruta + '|' + r.cod] ? est('Observada', 'med') : est('Aprobada', 'ok')]); }),
        ['left', 'left', 'right'].concat(T.map(function () { return 'center'; })).concat(['right', 'right', 'left']));
    x += h2('Rutas que requieren reforzamiento') + tabla(['Ruta', 'Código', 'Tema', 'Resultado', 'Evaluados', 'Reforzamiento', 'Resultado post', 'Estado'],
      R.alertas.map(function (a) { var k = a.estado === 'superada' ? 'ok' : a.estado === 'reforzado' ? 'info' : a.estado === 'reevaluar' ? 'bad' : 'med';
        return [esc(a.ruta || '—'), esc(a.cod || '—'), esc(a.tema), chip(a.pct), a.n, a.seg ? a.seg.fechaTxt : '—', a.post ? chip(a.post.pct) : '—', est(a.estadoTxt || a.estado, k)]; }),
      ['left', 'left', 'left', 'left', 'right', 'left', 'left', 'left']);
    x += h2('Evaluaciones aplicadas (detalle)') + tabla(['Fecha', 'Ruta', 'Código', 'Modo', 'Responsable', 'Evaluados', 'Aprobados', 'Resultado'],
      R.anexo.map(function (a) { return [a.fechaTxt, esc(a.ruta || '—'), esc(a.cod || '—'), a.mod, esc(a.sup || '—'), a.n, a.apr == null ? '—' : a.apr, chip(a.prom)]; }),
      ['left', 'left', 'left', 'left', 'left', 'right', 'right', 'left']);
    if (R.sat && R.sat.n) x += h2('Satisfacción del personal capacitado') + tabla(['Aspecto', 'Puntaje (0–100)'],
      [['Capacitador', R.sat.cap], ['Material', R.sat.mat], ['Contenido', R.sat.cont], ['Logística', R.sat.log], ['<b>General</b>', R.sat.gen]].filter(function (r) { return r[1] != null; }).map(function (r) { return [r[0], '<b>' + Math.round(r[1]) + '</b>']; }), ['left', 'right']) +
      '<p class="x-p">' + R.sat.n + ' respuestas anónimas por QR.</p>';
    x += h2('Conclusiones') + '<ul class="x-ul">' + K.lista.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' +
      h2('Decisión de reforzamiento') + '<ul class="x-ul">' + String(K.decision || '').split('\n').filter(Boolean).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' +
      '<p class="x-p"><b>Documentos del expediente:</b> Informes INF-SC-GH-03 de cada sesión (modelo oficial), registro de asistencia y base de datos en Excel del sector.</p>';
    x += '<div class="x-firmas">' + firmas.map(function (f) { return '<div><div class="x-l">' + esc(f.nom) + '</div><small>' + esc(f.cargo) + '</small></div>'; }).join('') + '</div>';
    x += '<div class="x-pie"><span>Gestión Humana · Relaciones Laborales · Unifrutti Perú</span><span>Generado por el sistema desde Supabase · ' + new Date().toLocaleString('es-PE') + '</span></div>';
    return '<div class="x-doc">' + estilosDoc() + x + '</div>';
  }
  function estilosDoc() {
    return '<style>.x-doc{font-family:Inter,Arial,sans-serif;color:#0f172a;font-size:12px;line-height:1.45}.x-doc *{box-sizing:border-box}' +
      '.x-hd{display:grid;grid-template-columns:96px 1fr 170px;border:1px solid #0f172a}.x-logo{display:flex;align-items:center;justify-content:center;border-right:1px solid #0f172a;padding:6px}.x-logo img{height:56px;width:auto}' +
      '.x-tit{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:8px 10px;border-right:1px solid #0f172a}.x-tit b{font-size:14px}.x-tit small{color:#475569;font-size:12px;margin-top:2px}' +
      '.x-cod div{padding:4px 8px;border-bottom:1px solid #0f172a;font-size:12px}.x-cod div:last-child{border-bottom:0}' +
      '.x-h2{margin:14px 0 6px;font-size:13px;font-weight:800;color:#0b2a6f;text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #0b2a6f;padding-bottom:3px;break-after:avoid}' +
      '.x-kv{width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12px}.x-kv th{width:150px;background:#f1f5f9;text-align:left;padding:4px 8px;border-top:1px solid #cbd5e1}.x-kv td{padding:4px 8px;border-top:1px solid #cbd5e1}' +
      '.x-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.x-cards>div{border:1px solid #cbd5e1;border-top:4px solid #0b2a6f;border-radius:6px;padding:7px 9px;break-inside:avoid}.x-cards span{display:block;font-size:12px;color:#475569;font-weight:600}.x-cards b{display:block;font-size:20px;line-height:1.2}.x-cards small{font-size:12px;color:#475569}' +
      '.x-t{width:100%;border-collapse:collapse;border:1px solid #0f172a;font-size:12px}.x-t th{background:#0b2a6f;color:#fff;font-weight:700;padding:4px 6px}.x-t td{padding:4px 6px;border-top:1px solid #cbd5e1}.x-t tbody tr:nth-child(even) td{background:#f8fafc}.x-t tr{break-inside:avoid}' +
      '.x-chip{display:inline-block;padding:1px 7px;border-radius:999px;font-weight:700;font-size:12px;white-space:nowrap}.x-p{margin:4px 0 6px}.x-ul{margin:0;padding-left:18px}.x-ul li{margin-bottom:3px}' +
      '.x-firmas{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:40px;text-align:center;break-inside:avoid}.x-l{border-top:1px solid #0f172a;padding-top:4px;font-weight:700}.x-firmas small{color:#475569}' +
      '.x-pie{display:flex;justify-content:space-between;gap:10px;margin-top:18px;border-top:1px solid #cbd5e1;padding-top:6px;color:#475569;font-size:12px}</style>';
  }
  function imprimir() {
    if (!ULT) return;
    var w = window.open('', '_blank'); if (!w) { aviso('Permite las ventanas emergentes para imprimir', 'e'); return; }
    var t = 'Expediente_auditoria_' + String(ULT.o.sector).replace(/\s+/g, '_') + '_' + String(ULT.o.ciclo.nom).replace(/[^\w]+/g, '_');
    w.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>' + esc(t) + '</title><style>@page{size:A4;margin:14mm 12mm}body{margin:0}</style></head><body>' + ULT.html + '<script>setTimeout(function(){window.print()},400)<\/script></body></html>');
    w.document.close();
  }
  function excel() {
    if (!ULT || !window.XLSX) { aviso('No se pudo cargar el Excel', 'e'); return; }
    var R = ULT.R, T = R.ev.temas, wb = XLSX.utils.book_new(), hoja = function (nom, filas) { XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(filas), nom); };
    var p = function (x) { return x == null ? '' : Math.round(x * 1000) / 10; };
    hoja('Resumen', [['Expediente de auditoría ETI'], ['Sector', ULT.o.sector], ['Empresa', ULT.o.emp], ['Ciclo', ULT.o.ciclo.nom], ['Capacitaciones', R.cap.sesiones], ['Capacitados', R.cap.total],
      ['Evaluados', R.ev.n], ['Resultado general %', p(R.ev.prom)], ['Alertas de reforzamiento', R.alertas.length], ['Emitido', fF(hoy())]]);
    hoja('Capacitaciones', [['Fecha', 'Sesiones', 'Temas', 'Hombres', 'Mujeres', 'Capacitados']].concat(R.cap.porDia.map(function (d) { return [d.fechaTxt, d.sesiones, d.temas.join('; '), d.h, d.m, d.total]; })));
    hoja('Temas', [['Tema', 'Evaluados', 'Resultado %']].concat(T.map(function (t) { return [t.nom, t.n, p(t.pct)]; })));
    hoja('Rutas', [['Ruta', 'Código', 'Evaluados'].concat(T.map(function (t) { return t.nom + ' %'; })).concat(['General %'])].concat(R.ev.rutas.map(function (r) { return [r.ruta, r.cod, r.n].concat(T.map(function (t) { return p(r.temas[t.id]); })).concat([p(r.prom)]); })));
    hoja('Reforzamiento', [['Ruta', 'Código', 'Tema', 'Resultado %', 'Evaluados', 'Fecha reforzamiento', 'Resultado post %', 'Estado']].concat(R.alertas.map(function (a) { return [a.ruta, a.cod, a.tema, p(a.pct), a.n, a.seg ? a.seg.fechaTxt : '', a.post ? p(a.post.pct) : '', a.estadoTxt || a.estado]; })));
    hoja('Evaluaciones', [['Fecha', 'Ruta', 'Código', 'Modo', 'Responsable', 'Evaluados', 'Aprobados', 'Resultado %']].concat(R.anexo.map(function (a) { return [a.fechaTxt, a.ruta, a.cod, a.mod, a.sup, a.n, a.apr == null ? '' : a.apr, p(a.prom)]; })));
    XLSX.writeFile(wb, ('Expediente_auditoria_' + ULT.o.sector + '_' + ULT.o.ciclo.nom).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_') + '.xlsx');
  }

  /* ══ 4) LLEGADA DESDE PROGRAMACION ETI (Sistema RR.LL.): ?abrir=centro | expediente | ciclo ══ */
  var PEDIDO = (function () { try { return (new URLSearchParams(location.search).get('abrir') || '').toLowerCase(); } catch (e) { return ''; } })(), intentos = 0;
  function autoAbrir() {
    if (!PEDIDO || intentos++ > 40) { PEDIDO = ''; return; }
    if (!ses() || !$('es-nav')) return;   /* espera a que la sesion (pase SSO) y el menu esten listos */
    if (PEDIDO !== 'centro' && !listo()) return;
    var p = PEDIDO; PEDIDO = '';
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    if (p === 'expediente' && esEditor()) abrirExpediente();
    else if (p === 'ciclo' && window.etiInformeCicloUI) etiInformeCicloUI.abrir();
    else abrirCentro();
  }

  window.etiCentroInformes = { abrir: abrirCentro, expediente: abrirExpediente, _documento: documento, version: 1 };
  setInterval(function () { menu(); autoAbrir(); }, 1500); setTimeout(menu, 700);
  console.log('[_CENTRO_INFORMES_V1] activo' + (CLASICO ? ' (menú clásico)' : ''));
})();
