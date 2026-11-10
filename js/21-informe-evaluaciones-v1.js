/* ════════════════════════════════════════════════════════════════════════════
   _INFORME_EVAL_V1 (10-nov-2026) — Informe de Evaluaciones ETI (Check List) · modelo de informes gerenciales
   · Periodo: MES · CICLO (I a IV) · AÑO (cierre de año).   Alcance: General (ambas / RAPEL / VERFRUT) o un SECTOR.
   · NO calcula nada por su cuenta: usa los datos y calculos del Informe de cierre de ciclo
     (etiInformeCicloUI.datos / armar) y de las Alertas de reforzamiento, todo leido de Supabase.
     Mes: evaluaciones del mes con el seguimiento de reforzamientos de su ciclo.
     Año: resultados del año completo; las alertas se calculan ciclo por ciclo (como en el sistema) y se juntan.
   · Vista en pantalla, Imprimir / PDF (A4) y Excel. Solo lee: no cambia nada. Joel, Lucia y administradores.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.etiInformeEval) return;
  var EDITORES = ['jtimoteo', 'lcastillo'], MIN = 0.70;
  var MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  var SECTORES = ['El Papayo', 'Limones', 'Los Olivares', 'Aproa', 'Algarrobos', 'San Vicente', 'Planta Rapel', 'Olivares Bajo', 'Santa Rosa', 'Punta Arenas'];
  var COORD = { nom: 'Joel Angel Timoteo Gonza', cargo: 'Coordinador de Relaciones Laborales' };

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var ses = function () { try { return typeof SESSION !== 'undefined' ? SESSION : null; } catch (e) { return null; } };
  var aviso = function (m, t) { try { if (typeof toast === 'function') toast(m, t || 'i'); } catch (e) {} };
  var p2 = function (n) { return String(n).padStart(2, '0'); };
  var hoy = function () { var d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };
  var fF = function (f) { return f ? String(f).slice(0, 10).split('-').reverse().join('/') : '—'; };
  var pc = function (x) { return x == null || isNaN(x) ? '—' : (Math.round(x * 1000) / 10).toFixed(1) + '%'; };
  var empDe = function (s) { try { return window.etiAlertasRef.empDe(s, '') || ''; } catch (e) { return ''; } };
  function esEditor() { var s = ses(); return !!s && (s.rol === 'admin' || EDITORES.indexOf(String(s.user || '').toLowerCase()) >= 0); }
  var ciclos = function () { return window.etiAlertasRef.ciclos(); };

  /* ── 1) datos: siempre por etiInformeCicloUI (Supabase) ── */
  async function reunir(P, alc) {
    var UI = window.etiInformeCicloUI, modo = alc.sector ? 'sector' : 'general', emp = alc.sector ? empDe(alc.sector) : alc.emp;
    var correr = async function (c) { var o = { modo: modo, ciclo: c, emp: emp, sector: alc.sector || '' }; return UI.armar(o, await UI.datos(o)); };
    var cs = ciclos().filter(function (c) { return c.hasta >= P.desde && c.desde <= P.hasta; }).sort(function (a, b) { return a.desde.localeCompare(b.desde); });
    if (P.tipo === 'ciclo') { var R = await correr(cs[0]); return { R: R, alertas: marcar(R.alertas, cs[0]), porCiclo: [] }; }
    if (P.tipo === 'mes') { var c = cs[0], Rm = await correr({ id: c.id, nom: P.nom, desde: P.desde, hasta: P.hasta }); return { R: Rm, alertas: marcar(Rm.alertas, c), porCiclo: [] }; }
    /* año: resultados del año completo + alertas ciclo por ciclo */
    var h = hoy(), usados = cs.filter(function (c) { return c.desde <= h; });
    var Q = await Promise.all([correr({ id: 'ANIO-' + P.id, nom: P.nom, desde: P.desde, hasta: P.hasta })].concat(usados.map(correr)));
    var al = [], porCiclo = [];
    usados.forEach(function (c, i) { var r = Q[i + 1]; al = al.concat(marcar(r.alertas, c));
      porCiclo.push({ nom: c.nom, n: r.ev.n, prom: r.ev.prom, chk: r.anexo.length, alertas: r.alertas.length, abiertas: r.alertas.filter(function (a) { return a.estado !== 'superada'; }).length }); });
    return { R: Q[0], alertas: al, porCiclo: porCiclo };
  }
  function marcar(L, c) { return L.map(function (a) { return Object.assign({}, a, { cicloNom: c.nom }); }); }
  function armar(P, alc, D) {
    var R = D.R, ev = R.ev, A = D.alertas, an = R.anexo;
    var qr = 0, man = 0, apr = 0, conApr = 0, porMes = {}, nSec = {};
    an.forEach(function (a) { if (a.mod === 'QR') qr += a.n; else man += a.n; if (a.apr != null) { apr += a.apr; conApr += a.n; }
      var m = String(a.fecha || '').slice(0, 7), z = porMes[m] || (porMes[m] = { n: 0, s: 0, chk: 0 }); z.n += a.n; z.s += (a.prom || 0) * a.n; z.chk++;
      nSec[a.sector] = (nSec[a.sector] || 0) + a.n; });
    var obs = {}; A.forEach(function (a) { obs[a.sector + '|' + a.ruta + '|' + a.cod] = 1; });
    var meses = P.tipo === 'mes' ? [] : Object.keys(porMes).sort().map(function (m) { var z = porMes[m]; return { nom: MESES[+m.slice(5, 7) - 1] + ' ' + m.slice(0, 4), n: z.n, prom: z.n ? z.s / z.n : null, chk: z.chk }; });
    var abiertas = A.filter(function (a) { return a.estado !== 'superada'; });
    var L = [];
    L.push(ev.prom == null ? 'No hay evaluaciones registradas en ' + P.nom + '.' : 'En ' + P.nom + ' se evaluó a ' + ev.n + ' trabajadores (' + qr + ' por QR y ' + man + ' manual) en ' + an.length + ' check list aplicados; el resultado general es ' + pc(ev.prom) + ': ' + (ev.aprueba ? 'APRUEBA' : 'NO APRUEBA') + ' (meta 70 %).');
    var Ts = ev.temas.filter(function (t) { return t.pct != null; }).sort(function (a, b) { return a.pct - b.pct; });
    if (Ts.length) L.push('Tema con mejor resultado: ' + Ts[Ts.length - 1].nom + ' (' + pc(Ts[Ts.length - 1].pct) + '). Tema con menor resultado: ' + Ts[0].nom + ' (' + pc(Ts[0].pct) + ').');
    if (!alc.sector && ev.sectores.length) { var no = ev.sectores.filter(function (s) { return !s.aprueba; }); L.push(no.length ? 'Sectores que no aprueban: ' + no.map(function (s) { return s.sector + ' (' + pc(s.prom) + ')'; }).join(', ') + '.' : 'Todos los sectores evaluados aprueban.'); }
    L.push(A.length ? A.length + ' alertas de reforzamiento (ruta y tema bajo 70 %): ' + (A.length - abiertas.length) + ' superadas y ' + abiertas.length + ' por cerrar.' : 'No hubo rutas con temas por debajo del 70 %.');
    var acc = [];
    if (abiertas.length) acc.push('Ejecutar y volver a evaluar los ' + abiertas.length + ' reforzamientos por cerrar antes del cierre del ciclo.');
    Ts.filter(function (t) { return t.pct < 0.8; }).slice(0, 2).forEach(function (t) { acc.push('Reforzar el tema "' + t.nom + '" (' + pc(t.pct) + ') con casos prácticos de campo.'); });
    if (!acc.length) acc.push('Mantener la programación de evaluaciones y el seguimiento de rutas.');
    return { ev: ev, anexo: an, alertas: A, abiertas: abiertas.length, qr: qr, man: man, aprPct: conApr ? apr / conApr : null, rutasObs: Object.keys(obs).length, meses: meses, porCiclo: D.porCiclo, nSec: nSec, lista: L, acciones: acc, sups: R.supervisores || [] };
  }

  /* ── 2) documento ── */
  var colP = function (p) { return p == null ? ['#F1F5F9', '#64748B'] : p < MIN ? ['#FEE2E2', '#B91C1C'] : p < 0.8 ? ['#FEF3C7', '#92400E'] : ['#DCFCE7', '#15803D']; };
  var chip = function (p) { var c = colP(p); return '<span class="x-chip" style="background:' + c[0] + ';color:' + c[1] + '">' + pc(p) + '</span>'; };
  var est = function (t, k) { var c = { ok: ['#DCFCE7', '#166534'], med: ['#FEF3C7', '#92400E'], bad: ['#FEE2E2', '#991B1B'], info: ['#E0E7FF', '#1E3A8A'] }[k]; return '<span class="x-chip" style="background:' + c[0] + ';color:' + c[1] + '">' + esc(t) + '</span>'; };
  function documento(P, alc, R) {
    var CI = window.etiCentroInformes || {}, s = ses() || {}, n = 0, ev = R.ev, T = ev.temas, emp = alc.sector ? empDe(alc.sector) : alc.emp;
    var razon = emp === 'RAPEL' ? 'Sociedad Agrícola Rapel S.A.C.' : emp === 'VERFRUT' ? 'Sociedad Exportadora Verfrut S.A.C.' : 'Sociedad Agrícola Rapel S.A.C. · Sociedad Exportadora Verfrut S.A.C.';
    var h2 = function (t) { n++; return '<h2 class="x-h2">' + n + '. ' + t + '</h2>'; };
    var ab = CI._ab || function (z) { return esc(z); }, ley = CI._leyenda ? CI._leyenda(T) : '';
    var tabla = function (heads, filas, al, total) { return '<table class="x-t"><thead><tr>' + heads.map(function (x, i) { return '<th style="text-align:' + ((al || [])[i] || 'left') + '">' + x + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (filas.length ? filas.map(function (f) { return '<tr>' + f.map(function (x, i) { return '<td style="text-align:' + ((al || [])[i] || 'left') + '">' + x + '</td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="' + heads.length + '" style="text-align:center;color:#64748B">Sin registros en el periodo</td></tr>') +
      (total && filas.length ? '<tr>' + total.map(function (x, i) { return '<td style="text-align:' + ((al || [])[i] || 'left') + ';background:#e2e8f0;font-weight:800">' + x + '</td>'; }).join('') + '</tr>' : '') + '</tbody></table>'; };
    var titulo = (P.tipo === 'anio' ? 'INFORME ANUAL DE EVALUACIONES ETI · CIERRE DE AÑO' : P.tipo === 'ciclo' ? 'INFORME DE EVALUACIONES ETI POR CICLO' : 'INFORME MENSUAL DE EVALUACIONES ETI') + ' (CHECK LIST)' + (alc.sector ? ' · SECTOR ' + String(alc.sector).toUpperCase() : '');
    var aprS = ev.sectores.filter(function (z) { return z.aprueba; }).length;
    var cards = [['Resultado general', pc(ev.prom), ev.prom == null ? 'sin evaluaciones' : (ev.aprueba ? 'Aprueba' : 'No aprueba') + ' · meta 70 %', colP(ev.prom)[1]],
      ['Trabajadores evaluados', String(ev.n), 'QR ' + R.qr + ' · manual ' + R.man, '#0b2a6f'],
      ['Check list aplicados', String(R.anexo.length), ev.rutas.length + ' rutas evaluadas', '#0b2a6f'],
      ['Rutas observadas', String(R.rutasObs), 'con algún tema bajo 70 %', R.rutasObs ? '#b45309' : '#15803d'],
      ['Alertas de reforzamiento', String(R.alertas.length), R.abiertas + ' por cerrar · ' + (R.alertas.length - R.abiertas) + ' superadas', R.abiertas ? '#b91c1c' : '#15803d'],
      alc.sector ? ['Evaluados aprobados', pc(R.aprPct), 'resultado individual ≥ 70 % (donde hay detalle)', R.aprPct == null ? '#64748b' : colP(R.aprPct)[1]] : ['Sectores que aprueban', aprS + ' de ' + ev.sectores.length, 'resultado del sector ≥ 70 %', '#0b2a6f']];
    var logo = CI._logo ? CI._logo() : '';
    var x = '<div class="x-hd"><div class="x-logo">' + (logo ? '<img src="' + logo + '" alt="Unifrutti">' : '') + '</div><div class="x-tit"><b>' + esc(titulo) + '</b><small>' + esc(razon) + ' · ' + esc(P.nom) + '</small></div>' +
      '<div class="x-cod"><div>Código: <b>Por asignar</b></div><div>Versión N.º 0.0</div><div>Emitido: <b>' + fF(hoy()) + '</b></div></div></div>';
    x += h2('Generalidades') + '<table class="x-kv"><tbody>' + [['Periodo', esc(P.nom) + ' · ' + fF(P.desde) + ' al ' + fF(P.hasta)], ['Empresa', esc(razon)],
      ['Alcance', alc.sector ? 'Sector ' + esc(alc.sector) + (R.sups.length ? ' · ' + esc(R.sups.join(' · ')) : '') : ev.sectores.length + ' sectores evaluados'],
      ['Instrumento', 'Check list de conocimiento por temas ponderados · aprobación ≥ 70 % · una ruta queda observada si algún tema está bajo 70 %'],
      ['Fuente de datos', 'Evaluaciones ETI (QR y manual) y seguimiento de reforzamientos · Supabase'],
      ['Emitido por', esc((s.nom || s.user || '') + ' (' + (s.user || '') + ')')]].map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>';
    x += h2('Resumen ejecutivo') + '<div class="x-cards">' + cards.map(function (k) { return '<div style="border-top-color:' + k[3] + '"><span>' + k[0] + '</span><b style="color:' + k[3] + '">' + k[1] + '</b><small>' + esc(k[2]) + '</small></div>'; }).join('') + '</div>';
    x += h2('Resultado por tema') + tabla(['Tema', 'Evaluados', 'Resultado', 'Situación'], T.map(function (t) { return ['<b>' + esc(t.nom) + '</b>', t.n, chip(t.pct), t.pct == null ? '—' : t.pct >= MIN ? est('Aprobado', 'ok') : est('Reforzar', 'bad')]; }),
      ['left', 'right', 'left', 'left'], ['Resultado general', ev.n, chip(ev.prom), ev.aprueba ? est('Aprueba', 'ok') : est('No aprueba', 'bad')]);
    if (!alc.sector) x += h2('Resultado por sector y tema') + tabla(['Sector', 'Eval.'].concat(T.map(function (t) { return ab(t.nom); })).concat(['General', 'Estado']),
      ev.sectores.map(function (z) { return ['<b>' + esc(z.sector) + '</b>', R.nSec[z.sector] || '—'].concat(T.map(function (t) { return chip(z.temas[t.id]); })).concat(['<b>' + pc(z.prom) + '</b>', z.aprueba ? est('Aprueba', 'ok') : est('No aprueba', 'bad')]); }),
      ['left', 'right'].concat(T.map(function () { return 'center'; })).concat(['right', 'left']));
    else x += h2('Resultado por ruta y código') + tabla(['Ruta', 'Código', 'Eval.'].concat(T.map(function (t) { return ab(t.nom); })).concat(['General']),
      ev.rutas.map(function (r) { return [esc(r.ruta || '—'), esc(r.cod || '—'), r.n].concat(T.map(function (t) { return chip(r.temas[t.id]); })).concat(['<b>' + pc(r.prom) + '</b>']); }),
      ['left', 'left', 'right'].concat(T.map(function () { return 'center'; })).concat(['right']));
    x += ley;
    if (R.porCiclo.length) x += h2('Evolución por ciclo') + tabla(['Ciclo', 'Check list', 'Evaluados', 'Resultado', 'Alertas', 'Por cerrar'], R.porCiclo.map(function (c) { return ['<b>' + esc(c.nom) + '</b>', c.chk, c.n, chip(c.prom), c.alertas, c.abiertas]; }), ['left', 'right', 'right', 'left', 'right', 'right']);
    if (R.meses.length) x += h2('Evolución por mes') + tabla(['Mes', 'Check list', 'Evaluados', 'Resultado'], R.meses.map(function (m) { return ['<b>' + m.nom + '</b>', m.chk, m.n, chip(m.prom)]; }), ['left', 'right', 'right', 'left'], ['Total', R.anexo.length, ev.n, chip(ev.prom)]);
    x += h2('Rutas observadas y reforzamiento') + tabla((P.tipo === 'anio' ? ['Ciclo'] : []).concat(['Sector', 'Ruta', 'Código', 'Tema', 'Resultado', 'Eval.', 'Reforzamiento', 'Resultado post', 'Estado']),
      R.alertas.map(function (a) { var k = a.estado === 'superada' ? 'ok' : a.estado === 'reforzado' ? 'info' : a.estado === 'reevaluar' ? 'bad' : 'med';
        return (P.tipo === 'anio' ? [esc(a.cicloNom)] : []).concat(['<b>' + esc(a.sector) + '</b>', esc(a.ruta || '—'), esc(a.cod || '—'), esc(a.tema), chip(a.pct), a.n, a.seg ? a.seg.fechaTxt : '—', a.post ? chip(a.post.pct) : '—', est(a.estadoTxt || a.estado, k)]); }));
    x += h2('Evaluaciones aplicadas (detalle)') + tabla(['Fecha', 'Sector', 'Ruta', 'Código', 'Modo', 'Responsable', 'Eval.', 'Aprob.', 'Resultado'],
      R.anexo.map(function (a) { return [a.fechaTxt, esc(a.sector), esc(a.ruta || '—'), esc(a.cod || '—'), a.mod, esc(a.sup || '—'), a.n, a.apr == null ? '—' : a.apr, chip(a.prom)]; }),
      ['left', 'left', 'left', 'left', 'left', 'left', 'right', 'right', 'left']);
    x += h2('Conclusiones') + '<ul class="x-ul">' + R.lista.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' +
      h2('Acciones de mejora') + '<ul class="x-ul">' + R.acciones.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>';
    var firmas = alc.sector ? [{ nom: R.sups[0] || 'Supervisor(a) de Gestión Humana', cargo: 'Supervisor(a) de Gestión Humana · ' + alc.sector }, COORD]
      : [COORD, { nom: 'Lucia Gabriela Castillo Celi', cargo: 'Responsable de capacitaciones de ética social' }];
    x += '<div class="x-firmas">' + firmas.map(function (f) { return '<div><div class="x-l">' + esc(f.nom) + '</div><small>' + esc(f.cargo) + '</small></div>'; }).join('') + '</div>';
    x += '<div class="x-pie"><span>Gestión Humana · Relaciones Laborales · Unifrutti Perú</span><span>Generado por el sistema desde Supabase · ' + new Date().toLocaleString('es-PE') + '</span></div>';
    return '<div class="x-doc">' + (CI._estilosDoc ? CI._estilosDoc() : '') + x + '</div>';
  }

  /* ── 3) pantalla ── */
  var ULT = null;
  function abrir() {
    var CI = window.etiCentroInformes;
    if (!esEditor()) { aviso('El informe de Evaluaciones ETI es para la administración (Joel, Lucía)', 'e'); return; }
    if (!CI || !CI._modal || !window.etiAlertasRef || !window.etiInformeCicloUI || !etiInformeCicloUI.datos) { aviso('Recarga la página (Ctrl+F5)', 'e'); return; }
    var d = new Date(), y = d.getFullYear(), cs = ciclos(), h = hoy(), act = cs.find(function (c) { return h >= c.desde && h <= c.hasta; }) || cs[0];
    var anios = []; for (var a = y; a >= y - 1; a--) anios.push(a);
    var opt = function (L, sel) { return L.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(sel) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join(''); };
    CI._modal('📗 Informe de Evaluaciones ETI', 'Resultado del Check List por tema, sector, ruta y código, con rutas observadas y reforzamientos · por mes, ciclo o año. Datos de Supabase.',
      '<div class="ci-f">' +
      '<div><label>Periodo</label><select id="ie-tipo">' + opt([['mes', 'Mensual'], ['ciclo', 'Por ciclo'], ['anio', 'Cierre de año']], 'mes') + '</select></div>' +
      '<div id="ie-w-mes"><label>Mes</label><select id="ie-mes">' + opt(MESES.map(function (m, i) { return [i + 1, m]; }), d.getMonth() + 1) + '</select></div>' +
      '<div id="ie-w-ciclo" style="display:none"><label>Ciclo</label><select id="ie-ciclo">' + opt(cs.map(function (c) { return [c.id, c.nom]; }), act && act.id) + '</select></div>' +
      '<div id="ie-w-anio"><label>Año</label><select id="ie-anio">' + opt(anios.map(function (a) { return [a, a]; }), y) + '</select></div>' +
      '<div><label>Alcance</label><select id="ie-alc">' + opt([['', 'General · ambas empresas'], ['E:RAPEL', 'General · RAPEL'], ['E:VERFRUT', 'General · VERFRUT']].concat(SECTORES.map(function (s) { return ['S:' + s, 'Sector ' + s]; })), '') + '</select></div>' +
      '<div><button class="ci-b p" id="ie-ver">👁 Ver informe</button></div></div><div id="ie-out"><div class="ci-vacio">Elige el periodo y el alcance, y pulsa <b>👁 Ver informe</b>.</div></div>');
    var sync = function () { var t = $('ie-tipo').value; $('ie-w-mes').style.display = t === 'mes' ? '' : 'none'; $('ie-w-ciclo').style.display = t === 'ciclo' ? '' : 'none'; $('ie-w-anio').style.display = t === 'ciclo' ? 'none' : ''; };
    $('ie-tipo').onchange = sync; sync();
    $('ie-ver').onclick = ver;
  }
  function periodo() {
    var t = $('ie-tipo').value, a = +$('ie-anio').value;
    if (t === 'ciclo') { var c = ciclos().find(function (z) { return z.id === $('ie-ciclo').value; }); return { tipo: 'ciclo', id: c.id, nom: c.nom, desde: c.desde, hasta: c.hasta }; }
    if (t === 'anio') return { tipo: 'anio', id: String(a), nom: 'Año ' + a + ' (cierre de año)', desde: a + '-01-01', hasta: a + '-12-31' };
    var m = +$('ie-mes').value, u = new Date(a, m, 0).getDate();
    return { tipo: 'mes', id: a + '-' + p2(m), nom: MESES[m - 1] + ' ' + a, desde: a + '-' + p2(m) + '-01', hasta: a + '-' + p2(m) + '-' + p2(u) };
  }
  async function ver() {
    var out = $('ie-out'), b = $('ie-ver'), v = $('ie-alc').value, P = periodo();
    var alc = { emp: v.indexOf('E:') === 0 ? v.slice(2) : '', sector: v.indexOf('S:') === 0 ? v.slice(2) : '' };
    b.disabled = true; out.innerHTML = '<p>⏳ Leyendo de Supabase las evaluaciones y los reforzamientos de ' + esc(P.nom) + '…</p>';
    try {
      var R = armar(P, alc, await reunir(P, alc));
      if (!R.ev.n) { out.innerHTML = '<div class="ci-vacio">No hay evaluaciones registradas en ' + esc(P.nom) + (alc.sector ? ' para ' + esc(alc.sector) : '') + '.</div>'; return; }
      ULT = { P: P, alc: alc, R: R, html: documento(P, alc, R) };
      out.innerHTML = '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem"><button class="ci-b r" id="ie-pdf">🖨 Imprimir / PDF</button><button class="ci-b p" id="ie-xls">📊 Excel</button></div>' +
        '<div class="ci-doc"><div style="max-width:794px;margin:0 auto">' + ULT.html + '</div></div>';
      $('ie-pdf').onclick = function () { window.etiCentroInformes._imprimir(ULT.html, nombre()); };
      $('ie-xls').onclick = excel;
    } catch (e) { console.error('[_INFORME_EVAL_V1]', e); out.innerHTML = '<div class="ci-vacio">No se pudo preparar el informe: ' + esc(e.message) + '</div>'; }
    finally { b.disabled = false; }
  }
  function nombre() { return ('Informe_Evaluaciones_ETI_' + (ULT.alc.sector || ULT.alc.emp || 'General') + '_' + ULT.P.nom).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_'); }
  function excel() {
    if (!ULT || !window.XLSX) { aviso('No se pudo cargar el Excel', 'e'); return; }
    var R = ULT.R, T = R.ev.temas, wb = XLSX.utils.book_new(), hoja = function (n, f) { XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(f), n); }, p = function (x) { return x == null ? '' : Math.round(x * 1000) / 10; };
    hoja('Resumen', [['Informe de Evaluaciones ETI'], ['Periodo', ULT.P.nom], ['Desde', fF(ULT.P.desde)], ['Hasta', fF(ULT.P.hasta)], ['Alcance', ULT.alc.sector || ULT.alc.emp || 'General'],
      ['Evaluados', R.ev.n], ['Por QR', R.qr], ['Manual', R.man], ['Check list aplicados', R.anexo.length], ['Resultado general %', p(R.ev.prom)], ['Rutas observadas', R.rutasObs], ['Alertas', R.alertas.length], ['Por cerrar', R.abiertas], ['Emitido', fF(hoy())]]);
    hoja('Temas', [['Tema', 'Evaluados', 'Resultado %']].concat(T.map(function (t) { return [t.nom, t.n, p(t.pct)]; })));
    hoja('Sectores', [['Sector', 'Evaluados'].concat(T.map(function (t) { return t.nom + ' %'; })).concat(['General %', 'Aprueba'])].concat(R.ev.sectores.map(function (z) { return [z.sector, R.nSec[z.sector] || ''].concat(T.map(function (t) { return p(z.temas[t.id]); })).concat([p(z.prom), z.aprueba ? 'Sí' : 'No']); })));
    hoja('Rutas', [['Sector', 'Ruta', 'Código', 'Evaluados'].concat(T.map(function (t) { return t.nom + ' %'; })).concat(['General %'])].concat(R.ev.rutas.map(function (r) { return [r.sector, r.ruta, r.cod, r.n].concat(T.map(function (t) { return p(r.temas[t.id]); })).concat([p(r.prom)]); })));
    hoja('Reforzamiento', [['Ciclo', 'Sector', 'Ruta', 'Código', 'Tema', 'Resultado %', 'Evaluados', 'Fecha reforzamiento', 'Resultado post %', 'Estado']].concat(R.alertas.map(function (a) { return [a.cicloNom, a.sector, a.ruta, a.cod, a.tema, p(a.pct), a.n, a.seg ? a.seg.fechaTxt : '', a.post ? p(a.post.pct) : '', a.estadoTxt || a.estado]; })));
    if (R.meses.length) hoja('Meses', [['Mes', 'Check list', 'Evaluados', 'Resultado %']].concat(R.meses.map(function (m) { return [m.nom, m.chk, m.n, p(m.prom)]; })));
    hoja('Evaluaciones', [['Fecha', 'Sector', 'Ruta', 'Código', 'Modo', 'Responsable', 'Evaluados', 'Aprobados', 'Resultado %']].concat(R.anexo.map(function (a) { return [a.fechaTxt, a.sector, a.ruta, a.cod, a.mod, a.sup, a.n, a.apr == null ? '' : a.apr, p(a.prom)]; })));
    XLSX.writeFile(wb, nombre() + '.xlsx');
  }

  window.etiInformeEval = { abrir: abrir, _armar: armar, _documento: documento, version: 1 };
})();
