/* ════════════════════════════════════════════════════════════════════════════
   _INFORME_CICLO_V1 (06-nov-2026) — Informes de cierre de ciclo ETI (Word)
   · Menu lateral "📑 Informes de cierre de ciclo".
   · Por sector (cada supervisor, para enviar con el detalle de sus checklist) o General (Joel, Lucia,
     administradores) con la decision final de sectores, rutas y areas a reforzar.
   · Junta: capacitaciones ETI (eti.capacitaciones), evaluaciones QR + manuales (como Indicadores),
     alertas y reforzamientos (eti.alertas_ref, mismo calculo que 🚨 Alertas) y la encuesta de
     satisfaccion (eti.encuestas_sat). Vista previa en pantalla, conclusiones editables y Word.
   Solo lee datos: no cambia nada. Requiere 16-alertas-ref-v1.js y 15-encuesta-sat-v1.js.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.etiInformeCicloUI) return;
  var API = 'https://exdjzbfinppzatjyimxn.supabase.co/functions/v1/api/', REG = '?forceFunctionRegion=sa-east-1';
  var EDITORES = ['jtimoteo', 'lcastillo'], MIN = 0.70;
  var FIRMA_LUCIA = { nom: 'Lucia Gabriela Castillo Celi', cargo: 'Responsable de capacitaciones de ética social' };
  var FIRMAS_GEN = [{ nom: 'Joel Angel Timoteo Gonza', cargo: 'Coordinador de Relaciones Laborales' }, FIRMA_LUCIA, { nom: 'Luis Eduardo Coveñas Chero', cargo: 'Subgerente de personas' }];
  var EST_TXT = { pendiente: 'PENDIENTE', reforzado: 'REFORZADO', reevaluar: 'SIGUE BAJO', superada: 'SUPERADA' };

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var ses = function () { try { return typeof SESSION !== 'undefined' ? SESSION : null; } catch (e) { return null; } };
  var aviso = function (m, t) { try { if (typeof toast === 'function') toast(m, t || 'i'); } catch (e) {} };
  var fF = function (f) { return f ? String(f).slice(0, 10).split('-').reverse().join('/') : '—'; };
  var hoy = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var U = function (s) { return String(s || '').trim().toUpperCase().replace(/\s+/g, ' '); };
  var EMP = function (s) { return U(s).replace(/\s*S\.?\s*A\.?\s*C\.?$/, ''); };
  /* empresa OFICIAL de cada sector (misma tabla que Programacion ETI del Sistema RR.LL.); si no esta, la del registro */
  var EMP_SECTOR = { 'EL PAPAYO': 'RAPEL', 'PAPAYO': 'RAPEL', 'LIMONES': 'RAPEL', 'LOS OLIVARES': 'RAPEL', 'APROA': 'RAPEL', 'OLIVARES APROA': 'RAPEL', 'ALGARROBOS': 'RAPEL', 'SAN VICENTE': 'RAPEL', 'PLANTA RAPEL': 'RAPEL', 'PLANTA': 'RAPEL',
    'OLIVARES BAJO': 'VERFRUT', 'SANTA ROSA': 'VERFRUT', 'SANTA ROSA I': 'VERFRUT', 'SANTA ROSA II': 'VERFRUT', 'SANTA ROSA 1': 'VERFRUT', 'SANTA ROSA 2': 'VERFRUT', 'PUNTA ARENAS': 'VERFRUT', 'SAN RAFAEL': 'VERFRUT' };
  var empDe = function (sector, emp) { var s = U(sector).replace(/^SECTOR\s+/, ''); return EMP_SECTOR[s] || EMP(emp); };
  var pc = function (x) { return x == null ? '—' : Math.round(x * 1000) / 10 + '%'; };
  function token() { try { return sessionStorage.getItem('eti_token') || ''; } catch (e) { return ''; } }
  function esEditor() { var s = ses(); return !!s && (s.rol === 'admin' || EDITORES.indexOf(String(s.user || '').toLowerCase()) >= 0); }
  function post(ruta, cuerpo) {
    var h = { 'Content-Type': 'application/json' }, t = token(); if (t) h.Authorization = 'Bearer ' + t;
    return fetch(API + ruta + REG, { method: 'POST', headers: h, body: JSON.stringify(cuerpo) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.success) throw new Error((j && j.error) || ('HTTP ' + r.status)); return j; });
    });
  }
  function consultar(col, f) { return post('eti/consultar', { col: col, filtros: f || [], limite: 20000 }).then(function (j) { return (j.docs || []).map(function (d) { return Object.assign({ _id: d.id }, d.datos); }); }); }
  function cargarJS(src) { return new Promise(function (ok, no) { var e = document.createElement('script'); e.src = src; e.onload = ok; e.onerror = function () { no(new Error('No se pudo cargar ' + src)); }; document.head.appendChild(e); }); }
  function wavg(L, v, w) { var s = 0, n = 0; L.forEach(function (x) { var a = v(x), b = w ? w(x) : 1; if (a != null && !isNaN(a)) { s += a * b; n += b; } }); return n ? s / n : null; }
  function verif(t) { var h = 2166136261 >>> 0; for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } var x = ('00000000' + h.toString(16).toUpperCase()).slice(-8); return x.slice(0, 4) + '-' + x.slice(4); }

  /* ── 1) carga de datos del ciclo ── */
  async function evaluaciones(c, user) {
    var f = [['fecha', '>=', c.desde], ['fecha', '<=', c.hasta]], w = function (k) { return user ? f.concat([[k, '==', user]]) : f; };
    var R = await Promise.all([consultar('respuestas_qr', w('usuarioSup')), consultar('evaluaciones_conocimiento', w('usuario'))]), out = [];
    R[0].forEach(function (x) { var r = +x.resultado || 0;
      out.push({ fecha: x.fecha, emp: empDe(x.sector, x.emp), sup: x.sup || '', user: x.usuarioSup || '', sector: x.sector || '', ruta: U(x.ruta), cod: U(x.cod), n: 1, res: r, apr: r >= MIN ? 1 : 0, mod: 'QR',
        secs: (x.secs || []).map(function (s) { return { id: s.id || U(s.nom), nom: s.nom, pct: +s.pct || 0 }; }) }); });
    R[1].forEach(function (x) { if (x.modalidad === 'QR') return;
      (x.rutas || []).forEach(function (r) { var n = +r.ne || 1, res = +r.resGrupo || 0, d = r.det && r.det.ev;
        var apr = Array.isArray(d) ? d.filter(function (e) { return (+e.res || +e.resultado || 0) >= MIN; }).length : null;
        out.push({ fecha: x.fecha, emp: empDe(x.sector, x.emp), sup: x.sup || '', user: x.usuario || '', sector: x.sector || '', ruta: U(r.nom), cod: U(r.cod), n: n, res: res, apr: apr, mod: 'Manual',
          secs: (r.secs || []).map(function (s) { return { id: s.id || U(s.nom), nom: s.nom, pct: s.pct != null ? +s.pct : (+s.cum || 0) }; }) }); }); });
    return out.filter(function (x) { return x.ruta || x.cod; });
  }
  /* _CICLO_PROG_V1 (06-nov): cumplimiento de la Programacion ETI (programaciones_eti): programado vs ejecutado por tipo
     (Capacitacion · Check List · Reforzamiento). Una fecha esta ejecutada si figura en fechasEjecutadas o si la
     programacion completa esta "ejecutada". Cumplimiento = ejecutadas / (ejecutadas + vencidas). */
  var TIPOS_P = [['cap', 'Capacitación ETI', /CAPACITACI/i], ['chk', 'Check List', /CHECKLIST/i], ['ref', 'Reforzamiento', /REFORZ/i]];
  async function progsCiclo(c) {
    var L = [];
    try { if (typeof fbdb !== 'undefined' && fbdb) { var q = await fbdb.collection('programaciones_eti').get(); L = q.docs.map(function (d) { var x = d.data(); x.id = d.id; return x; }); } } catch (e) { L = []; }
    if (!L.length) { try { L = await consultar('programaciones_eti', []); } catch (e) { L = []; } }
    return L.map(function (x) { x.fechas = (Array.isArray(x.fechas) && x.fechas.length ? x.fechas.slice() : [x.fechaProgramada, x.fechaFin || x.fechaProgramada].filter(Boolean)).sort(); return x; })
      .filter(function (x) { return x.fechas.some(function (f) { return f >= c.desde && f <= c.hasta; }); });
  }
  var ALIAS_S = { 'PAPAYO': 'EL PAPAYO', 'OLIVARES APROA': 'APROA', 'PLANTA': 'PLANTA RAPEL', 'SANTA ROSA I': 'SANTA ROSA', 'SANTA ROSA II': 'SANTA ROSA', 'SANTA ROSA 1': 'SANTA ROSA', 'SANTA ROSA 2': 'SANTA ROSA' };
  function secTitulo(s) { var x = U(s).replace(/^SECTOR\s+/, ''); x = ALIAS_S[x] || x; return x ? x.toLowerCase().replace(/(^|\s)\S/g, function (m) { return m.toUpperCase(); }) : '—'; }   /* "ALGARROBOS" = "Algarrobos" */
  /* _SECTOR_UNICO_V1 (10-nov): mismo sector aunque se escriba distinto ("Olivares Aproa" = "Aproa", "Santa Rosa I" = "Santa Rosa", "Sector X" = "X") */
  function mismoSec(a, b) { return secTitulo(a) === secTitulo(b); }
  function cumplimiento(P, c) {
    var h = hoy(), fila = function () { return { prog: 0, ejec: 0, venc: 0, fut: 0 }; }, tot = {}, sec = {};
    TIPOS_P.forEach(function (t) { tot[t[0]] = fila(); });
    P.forEach(function (p) { var t = TIPOS_P.find(function (x) { return x[2].test(p.tema || ''); }); if (!t) return; var se = secTitulo(p.sector);
      sec[se] = sec[se] || {}; TIPOS_P.forEach(function (z) { sec[se][z[0]] = sec[se][z[0]] || fila(); });
      p.fechas.filter(function (f) { return f >= c.desde && f <= c.hasta; }).forEach(function (f) {
        var ok = p.estado === 'ejecutada' || (p.fechasEjecutadas || []).indexOf(f) >= 0, k = ok ? 'ejec' : f < h ? 'venc' : 'fut';
        [tot[t[0]], sec[se][t[0]]].forEach(function (r) { r.prog++; r[k]++; }); }); });
    var pct = function (r) { return r.ejec + r.venc ? r.ejec / (r.ejec + r.venc) : null; };
    return { tipos: TIPOS_P.map(function (t) { var r = tot[t[0]]; return { k: t[0], nom: t[1], prog: r.prog, ejec: r.ejec, venc: r.venc, fut: r.fut, pct: pct(r) }; }),
      sectores: Object.keys(sec).sort().map(function (se) { var o = { sector: se }; TIPOS_P.forEach(function (t) { o[t[0]] = Object.assign({ pct: pct(sec[se][t[0]]) }, sec[se][t[0]]); }); return o; }) };
  }
  async function datos(o) {
    var c = o.ciclo, s = ses() || {}, user = esEditor() ? '' : s.user;
    var Q = await Promise.all([evaluaciones(c, user), consultar('capacitaciones', [['fechaEjecucion', '>=', c.desde], ['fechaEjecucion', '<=', c.hasta]]),
      consultar('alertas_ref', [['ciclo', '==', c.id]]), consultar('encuestas_sat', [['fecha', '>=', c.desde], ['fecha', '<=', c.hasta]]).catch(function () { return []; }), progsCiclo(c)]);
    var F = Q[0].filter(function (x) { return o.sector ? mismoSec(x.sector, o.sector) : (!o.emp || x.emp === o.emp); });
    var sectEmp = {}; Q[0].forEach(function (x) { if (x.sector) sectEmp[U(x.sector)] = x.emp; });
    var CAP = Q[1].filter(function (x) { if (x.eliminado || x.anulado || x.eliminada) return false; var se = U(x.sector);
      if (o.sector) return mismoSec(x.sector, o.sector); var e = EMP_SECTOR[se.replace(/^SECTOR\s+/, '')] || sectEmp[se]; return !o.emp || !e || e === o.emp; });
    var segs = {}; Q[2].forEach(function (x) { segs[x._id] = x; });
    var A = window.etiAlertasRef.analizar(F, c.id, segs);
    var SAT = Q[3].filter(function (x) { return o.sector ? mismoSec(x.sector, o.sector) : (!o.emp || empDe(x.sector, x.emp) === o.emp); });
    var PRG = Q[4].filter(function (x) { var se = U(x.sector).replace(/^SECTOR\s+/, ''); if (o.sector) return mismoSec(x.sector, o.sector); var e = x.empresa || EMP_SECTOR[se] || sectEmp[U(x.sector)]; return !o.emp || !e || EMP(e) === o.emp; });
    return { F: F, CAP: CAP, A: A, SAT: SAT, PRG: PRG };
  }
  /* ── 2) calculos del informe ── */
  function armar(o, X) {
    var F = X.F, gen = o.modo === 'general';
    /* capacitaciones */
    var cap = { sesiones: X.CAP.length, total: 0, h: 0, m: 0, rutas: [], porDia: [], porSector: [], temas: [], sinDetalle: 0 }, rg = {}, dg = {}, sg = {}, tg = {};
    X.CAP.forEach(function (x) {
      var t = +x.total || ((+x.varones || 0) + (+x.mujeres || 0)), f = String(x.fechaEjecucion || '').slice(0, 10); cap.total += t; cap.h += +x.varones || 0; cap.m += +x.mujeres || 0; tg[String(x.tema || '').trim()] = 1;
      var d = dg[f] || (dg[f] = { fecha: f, fechaTxt: fF(f), sesiones: 0, h: 0, m: 0, total: 0, temas: {} }); d.sesiones++; d.h += +x.varones || 0; d.m += +x.mujeres || 0; d.total += t; d.temas[x.tema] = 1;
      var se = x.sector || '—', sx = sg[se] || (sg[se] = { sector: se, sups: {}, sesiones: 0, rutas: {}, total: 0, h: 0, m: 0, dias: {} }); sx.sesiones++; sx.total += t; sx.h += +x.varones || 0; sx.m += +x.mujeres || 0; sx.dias[f] = 1; sx.sups[x.supervisor] = 1;
      var L = (x.rutas || []).concat((x.areas || []).map(function (a) { return typeof a === 'string' ? { nombre: a } : a; }));
      if (!L.length) cap.sinDetalle++;
      L.forEach(function (r) { var k = U(se) + '|' + U(r.codigo || r.nombre || r.nom); sx.rutas[k] = 1;
        var z = rg[k] || (rg[k] = { cod: U(r.codigo), nom: r.nombre || r.nom || '', sector: se, total: 0, sesiones: 0, sups: {}, fechas: {} }); z.sesiones++; z.sups[x.supervisor] = 1; z.fechas[fF(f)] = 1;
        if (L.length === 1) z.total += t; else z.comp = (z.comp || 0) + 1; });   /* sesion con varias rutas: no se reparte el total */
    });
    cap.rutas = Object.keys(rg).map(function (k) { var z = rg[k]; z.sups = Object.keys(z.sups); z.fechas = Object.keys(z.fechas); return z; }).sort(function (a, b) { return (a.sector + a.cod).localeCompare(b.sector + b.cod); });
    cap.porDia = Object.keys(dg).sort().map(function (k) { var d = dg[k]; d.temas = Object.keys(d.temas); return d; });
    cap.porSector = Object.keys(sg).sort().map(function (k) { var s = sg[k]; return { sector: s.sector, sups: Object.keys(s.sups), sesiones: s.sesiones, rutas: Object.keys(s.rutas).length, total: s.total, h: s.h, m: s.m, dias: Object.keys(s.dias).length }; });
    cap.temas = Object.keys(tg).filter(Boolean).sort();
    /* evaluacion */
    var temas = {}; F.forEach(function (x) { x.secs.forEach(function (s) { temas[s.id] = temas[s.id] || s.nom; }); });
    var T = Object.keys(temas).map(function (id) { return { id: id, nom: temas[id] }; });
    var tpct = function (L, id) { return wavg(L.filter(function (x) { return x.secs.some(function (s) { return s.id === id; }); }), function (x) { return (x.secs.find(function (s) { return s.id === id; }) || {}).pct; }, function (x) { return x.n; }); };
    var n = F.reduce(function (s, x) { return s + x.n; }, 0), AP = F.filter(function (x) { return x.apr != null; });
    var ev = { n: n, prom: wavg(F, function (x) { return x.res; }, function (x) { return x.n; }), aprPct: AP.length ? AP.reduce(function (s, x) { return s + x.apr; }, 0) / AP.reduce(function (s, x) { return s + x.n; }, 0) : null,
      temas: T.map(function (t) { var L = F.filter(function (x) { return x.secs.some(function (s) { return s.id === t.id; }); }); return { id: t.id, nom: t.nom, pct: tpct(F, t.id), n: L.reduce(function (s, x) { return s + x.n; }, 0) }; }), rutas: [], sectores: [] };
    ev.aprueba = ev.prom != null && ev.prom >= MIN;
    var rk = {}; F.forEach(function (x) { var k = U(x.sector) + '|' + (x.cod || x.ruta); (rk[k] = rk[k] || []).push(x); });
    ev.rutas = Object.keys(rk).sort().map(function (k) { var L = rk[k], o2 = { sector: L[0].sector, ruta: L[0].ruta, cod: L[0].cod, n: L.reduce(function (s, x) { return s + x.n; }, 0), prom: wavg(L, function (x) { return x.res; }, function (x) { return x.n; }), temas: {} };
      T.forEach(function (t) { o2.temas[t.id] = tpct(L, t.id); }); return o2; });
    var sk = {}; F.forEach(function (x) { (sk[x.sector || '—'] = sk[x.sector || '—'] || []).push(x); });
    ev.sectores = Object.keys(sk).sort().map(function (k) { var L = sk[k], p = wavg(L, function (x) { return x.res; }, function (x) { return x.n; }), o3 = { sector: k, prom: p, aprueba: p != null && p >= MIN, temas: {} };
      T.forEach(function (t) { o3.temas[t.id] = tpct(L, t.id); }); return o3; });
    /* alertas */
    var al = X.A.alertas.map(function (a) { return Object.assign({}, a, { estadoTxt: EST_TXT[a.estado], seg: a.seg ? Object.assign({}, a.seg, { fechaTxt: fF(a.seg.fechaRef) }) : null }); });
    /* satisfaccion */
    var sat = null;
    if (X.SAT.length && window.etiEncuesta) { sat = window.etiEncuesta.resumen(X.SAT); sat.coment = X.SAT.filter(function (r) { return r.coment; }).map(function (r) { return r.coment; });
      var gs = {}; X.SAT.forEach(function (r) { (gs[r.sup] = gs[r.sup] || []).push(r); }); sat.porSup = Object.keys(gs).sort().map(function (k) { return Object.assign({ sup: k }, window.etiEncuesta.resumen(gs[k])); }); }
    /* anexo */
    var ag = {}; F.forEach(function (x) { var k = x.mod === 'QR' ? 'Q|' + x.fecha + '|' + U(x.sector) + '|' + (x.cod || x.ruta) : 'M|' + Math.random();
      var z = ag[k] || (ag[k] = { fecha: x.fecha, fechaTxt: fF(x.fecha), sector: x.sector, ruta: x.ruta, cod: x.cod, mod: x.mod === 'QR' ? 'QR' : 'Manual', sup: x.sup, n: 0, s: 0, apr: x.apr == null ? null : 0 });
      z.n += x.n; z.s += x.res * x.n; if (z.apr != null && x.apr != null) z.apr += x.apr; });
    var anexo = Object.keys(ag).map(function (k) { var z = ag[k]; z.prom = z.n ? z.s / z.n : null; return z; }).sort(function (a, b) { return (a.fecha + a.sector + a.cod).localeCompare(b.fecha + b.sector + b.cod); });
    /* supervisores */
    var sups = {}; F.forEach(function (x) { if (x.sup) sups[x.sup] = (sups[x.sup] || 0) + x.n; }); X.CAP.forEach(function (x) { if (x.supervisor) sups[x.supervisor] = (sups[x.supervisor] || 0) + 1; });
    var supL = Object.keys(sups).sort(function (a, b) { return sups[b] - sups[a]; });
    return { cap: cap, ev: ev, alertas: al, sat: sat, anexo: anexo, supervisores: supL, sectores: ev.sectores.map(function (s) { return s.sector; }), prog: cumplimiento(X.PRG || [], o.ciclo) };
  }
  function conclusiones(o, R) {
    var gen = o.modo === 'general', ev = R.ev, L = [], abiertas = R.alertas.filter(function (a) { return a.estado !== 'superada'; });
    if (ev.prom != null) L.push((gen ? 'El ciclo' : 'El sector ' + o.sector) + ' alcanzó ' + pc(ev.prom) + ' en la evaluación de conocimiento (' + ev.n + ' evaluados): ' + (ev.aprueba ? 'APRUEBA' : 'NO APRUEBA') + ' (meta 70 %).');
    var Ts = ev.temas.filter(function (t) { return t.pct != null; }).sort(function (a, b) { return a.pct - b.pct; });
    if (Ts.length) { L.push('Tema con mejor resultado: ' + Ts[Ts.length - 1].nom + ' (' + pc(Ts[Ts.length - 1].pct) + '). Tema con menor resultado: ' + Ts[0].nom + ' (' + pc(Ts[0].pct) + ').'); }
    if (gen) { var no = ev.sectores.filter(function (s) { return !s.aprueba; }); L.push(no.length ? 'Sectores que no aprueban: ' + no.map(function (s) { return s.sector + ' (' + pc(s.prom) + ')'; }).join(', ') + '.' : 'Todos los sectores evaluados aprueban el ciclo.'); }
    L.push(R.alertas.length ? R.alertas.length + ' alertas de reforzamiento: ' + R.alertas.filter(function (a) { return a.estado === 'superada'; }).length + ' superadas y ' + abiertas.length + ' por cerrar.' : 'No hubo rutas con temas por debajo del 70 %.');
    if (R.sat && R.sat.n) { var k = [['capacitador', R.sat.cap], ['material', R.sat.mat], ['contenido', R.sat.cont], ['logística', R.sat.log]].filter(function (x) { return x[1] != null; }).sort(function (a, b) { return a[1] - b[1]; });
      L.push('Satisfacción del personal: ' + Math.round(R.sat.gen) + '/100 (' + R.sat.n + ' respuestas)' + (k.length ? '; el aspecto a mejorar es ' + k[0][0] + ' (' + Math.round(k[0][1]) + '/100).' : '.')); }
    var pv = (R.prog && R.prog.tipos || []).filter(function (t) { return t.prog; });
    if (pv.length) L.push('Cumplimiento de la programación: ' + pv.map(function (t) { return t.nom + ' ' + (t.pct == null ? 'sin fechas vencidas' : pc(t.pct)) + ' (' + t.ejec + '/' + (t.ejec + t.venc) + (t.fut ? ', ' + t.fut + ' por venir' : '') + ')'; }).join(' · ') + '.');
    if (R.cap.sesiones) L.push('Se capacitó a ' + R.cap.total + ' trabajadores en ' + R.cap.sesiones + ' sesiones' + (R.cap.temas.length ? ' sobre: ' + R.cap.temas.slice(0, 6).join('; ') + (R.cap.temas.length > 6 ? '…' : '') : '') + '.');
    var dec;
    if (!abiertas.length) dec = gen ? 'No se requieren reforzamientos adicionales en este ciclo.' : 'No hay rutas pendientes de reforzamiento.';
    else if (gen) { var g = {}; abiertas.forEach(function (a) { (g[a.sector] = g[a.sector] || []).push(a); });
      dec = Object.keys(g).sort().map(function (s) { return 'Sector ' + s + ' (' + g[s][0].sup + '): ' + g[s].map(function (a) { return (a.ruta || a.cod) + (a.cod ? ' (' + a.cod + ')' : '') + ' en ' + a.tema + ' ' + pc(a.pct); }).join('; ') + '.'; }).join('\n'); }
    else dec = abiertas.map(function (a) { return 'Ruta ' + (a.ruta || a.cod) + (a.cod ? ' (' + a.cod + ')' : '') + ': reforzar ' + a.tema + ' (' + pc(a.pct) + ')' + (a.estado === 'reforzado' ? ' — reforzada el ' + fF(a.seg.fechaRef) + ', falta re-evaluar' : '') + '.'; }).join('\n');
    return { lista: L, decision: dec };
  }

  /* ── 3) pantalla ── */
  function css() {
    if ($('icc-css')) return;
    var st = document.createElement('style'); st.id = 'icc-css';
    st.textContent = [
      '.icc-ov{position:fixed;inset:0;background:rgba(10,20,40,.55);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:1rem}',
      '.icc-box{background:#fff;border-radius:16px;max-width:1100px;width:100%;height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:Barlow,Inter,"Segoe UI",sans-serif;color:#0F172A}',
      '.icc-hd{padding:1rem 1.2rem .7rem;display:flex;justify-content:space-between;gap:.8rem;border-bottom:1px solid #E2E8F0}.icc-hd b{font-size:1.15rem;color:#0E2A5C}.icc-hd small{display:block;color:#5B6B82;font-size:.82rem;margin-top:.2rem}',
      '.icc-bd{padding:1rem 1.2rem;overflow:auto;flex:1}',
      '.icc-b{min-height:40px;padding:0 14px;border-radius:10px;border:1.5px solid #C7D2E6;background:#fff;font:800 .9rem Barlow,sans-serif;color:#0E2A5C;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem}.icc-b.p{background:#0E2A5C;border-color:#0E2A5C;color:#fff}.icc-b:disabled{opacity:.5}',
      '.icc-f{display:flex;gap:.6rem;flex-wrap:wrap;align-items:flex-end}.icc-f label{display:block;font-size:.76rem;font-weight:700;color:#475569;margin:0 0 .25rem}',
      '.icc-f select{min-height:40px;padding:0 10px;border:1.5px solid #C7D2E6;border-radius:9px;font:600 .95rem Barlow,sans-serif;background:#fff}',
      '.icc-seg{display:inline-flex;border:1.5px solid #C7D2E6;border-radius:10px;overflow:hidden}.icc-seg button{border:0;background:#fff;padding:0 14px;min-height:37px;font:800 .88rem Barlow,sans-serif;color:#475569;cursor:pointer}.icc-seg button.on{background:#0E2A5C;color:#fff}',
      '.icc-kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem;margin:1rem 0}.icc-kpi div{border-radius:12px;padding:.65rem .8rem;border:1px solid #E2E8F0;background:#F8FAFC}',
      '.icc-kpi span{display:block;font-size:.72rem;font-weight:700;color:#475569;text-transform:uppercase}.icc-kpi b{display:block;font-size:1.55rem;line-height:1.15}.icc-kpi small{color:#64748B;font-size:.76rem}',
      '.icc-h3{font-size:1rem;color:#0E2A5C;margin:1rem 0 .35rem;font-weight:800}',
      '.icc-t{width:100%;border-collapse:collapse;font-size:.84rem}.icc-t th{background:#F8FAFC;color:#475569;text-align:left;padding:.45rem;border-bottom:1px solid #E2E8F0;font-size:.74rem}.icc-t td{padding:.45rem;border-bottom:1px solid #EEF2F6}',
      '.icc-p{display:inline-block;min-width:54px;text-align:center;font-weight:800;border-radius:999px;padding:.1rem .45rem;font-size:.8rem}',
      '.icc-ta{width:100%;min-height:110px;border:1.5px solid #C7D2E6;border-radius:10px;padding:.6rem;font:500 .92rem/1.45 Barlow,sans-serif;box-sizing:border-box}',
      '.icc-vacio{padding:1.4rem;text-align:center;color:#64748B;background:#F8FAFC;border-radius:12px}'
    ].join('\n');
    document.head.appendChild(st);
  }
  var colP = function (p) { return p == null ? ['#F1F5F9', '#64748B'] : p < MIN ? ['#FEE2E2', '#B91C1C'] : p < 0.8 ? ['#FEF3C7', '#92400E'] : ['#DCFCE7', '#15803D']; };
  var chip = function (p) { var c = colP(p); return '<span class="icc-p" style="background:' + c[0] + ';color:' + c[1] + '">' + pc(p) + '</span>'; };
  var M = null, ULT = null;
  function sectoresDe() { var s = ses() || {}, L = []; try { var d = (typeof SUPERVISORES !== 'undefined' ? SUPERVISORES : []).find(function (x) { return x.nom === s.nom; }); if (d) L = d.multiSector ? d.sectores : d.sector ? [d.sector] : []; } catch (e) {} return L; }
  function abrir() {
    css(); if (M) M.remove(); var ed = esEditor(), cs = window.etiAlertasRef.ciclos(), h = hoy(), act = cs.find(function (c) { return h >= c.desde && h <= c.hasta; }) || cs[0];
    var todos = ['San Vicente', 'Algarrobos', 'Punta Arenas', 'Planta Rapel', 'El Papayo', 'Limones', 'Olivares Bajo', 'Los Olivares', 'Aproa', 'Santa Rosa'], mios = sectoresDe();
    var sects = ed || !mios.length ? todos : mios;
    M = document.createElement('div'); M.className = 'icc-ov';
    M.innerHTML = '<div class="icc-box" role="dialog" aria-modal="true"><div class="icc-hd"><div><b>📑 Informes de cierre de ciclo ETI</b><small>Capacitaciones + evaluación checklist + reforzamientos + encuesta de satisfacción · vista previa y Word</small></div><button class="icc-b" id="icc-x">✕</button></div>' +
      '<div class="icc-bd"><div class="icc-f"><div><label>Informe</label><div class="icc-seg"><button data-m="sector" class="on">📍 Por sector</button>' + (ed ? '<button data-m="general">🏢 General</button>' : '') + '</div></div>' +
      '<div><label>Ciclo</label><select id="icc-ci">' + cs.map(function (c) { return '<option value="' + c.id + '"' + (c.id === act.id ? ' selected' : '') + '>' + c.nom + '</option>'; }).join('') + '</select></div>' +
      '<div id="icc-empw" style="display:none"><label>Empresa</label><select id="icc-emp"><option>VERFRUT</option><option>RAPEL</option></select></div>' +
      '<div id="icc-secw"><label>Sector</label><select id="icc-sec">' + sects.map(function (x) { return '<option value="' + esc(x) + '">' + esc(x) + ' · ' + (empDe(x, '') || '?') + '</option>'; }).join('') + '</select></div>' +
      '<div><button class="icc-b p" id="icc-ver">👁 Ver resultados</button></div></div><div id="icc-out"><div class="icc-vacio" style="margin-top:1rem">Elige el ciclo' + (ed ? ', el tipo de informe' : '') + ' y el sector, y pulsa <b>👁 Ver resultados</b>.</div></div></div></div>';
    document.body.appendChild(M);
    $('icc-x').onclick = function () { M.remove(); M = null; };
    var modo = 'sector';
    Array.prototype.forEach.call(M.querySelectorAll('[data-m]'), function (b) { b.onclick = function () { modo = b.getAttribute('data-m'); Array.prototype.forEach.call(M.querySelectorAll('[data-m]'), function (x) { x.classList.toggle('on', x === b); }); $('icc-secw').style.display = modo === 'general' ? 'none' : ''; $('icc-empw').style.display = modo === 'general' ? '' : 'none'; }; });
    $('icc-ver').onclick = function () { var c = cs.find(function (x) { return x.id === $('icc-ci').value; }), sec = modo === 'general' ? '' : $('icc-sec').value; ver({ modo: modo, ciclo: c, emp: sec ? empDe(sec, $('icc-emp').value) : $('icc-emp').value, sector: sec }); };
  }
  async function ver(o) {
    var out = $('icc-out'), b = $('icc-ver'); b.disabled = true; out.innerHTML = '<p>⏳ Reuniendo capacitaciones, evaluaciones, reforzamientos y encuestas de ' + esc(o.ciclo.nom) + '…</p>';
    try { var X = await datos(o), R = armar(o, X), K = conclusiones(o, R); ULT = { o: o, R: R, K: K }; }
    catch (e) { out.innerHTML = '<div class="icc-vacio">No se pudo preparar: ' + esc(e.message) + '</div>'; b.disabled = false; return; }
    b.disabled = false;
    var ev = R.ev, gen = o.modo === 'general';
    if (!ev.n && !R.cap.sesiones) { out.innerHTML = '<div class="icc-vacio" style="margin-top:1rem">No hay capacitaciones ni evaluaciones de ' + esc(gen ? o.emp : o.sector) + ' en ' + esc(o.ciclo.nom) + '.</div>'; return; }
    var ab = R.alertas.filter(function (a) { return a.estado !== 'superada'; }).length;
    var h = '<div class="icc-kpi"><div><span>Capacitados</span><b>' + R.cap.total + '</b><small>' + R.cap.sesiones + ' sesiones · ' + R.cap.rutas.length + ' rutas/áreas</small></div>' +
      '<div><span>Evaluados</span><b>' + ev.n + '</b><small>' + R.anexo.length + ' checklist aplicados</small></div>' +
      '<div style="background:' + colP(ev.prom)[0] + '"><span>Resultado</span><b style="color:' + colP(ev.prom)[1] + '">' + pc(ev.prom) + '</b><small>' + (gen ? ev.sectores.filter(function (s) { return s.aprueba; }).length + '/' + ev.sectores.length + ' sectores aprueban' : ev.aprueba ? '✅ El sector aprueba' : '❌ El sector no aprueba') + '</small></div>' +
      '<div><span>Alertas</span><b style="color:' + (ab ? '#B91C1C' : '#15803D') + '">' + R.alertas.length + '</b><small>' + ab + ' por cerrar</small></div>' +
      '<div><span>Satisfacción</span><b>' + (R.sat && R.sat.n ? Math.round(R.sat.gen) + '<small>/100</small>' : '—') + '</b><small>' + (R.sat ? R.sat.n + ' respuestas' : 'sin encuesta') + '</small></div></div>';
    var PG = R.prog || { tipos: [] };
    h += '<div class="icc-h3">📅 Cumplimiento de la programación</div>' + (PG.tipos.some(function (t) { return t.prog; }) ? '<table class="icc-t"><thead><tr><th>Tipo</th><th>Fechas programadas</th><th>Ejecutadas</th><th>Vencidas sin ejecutar</th><th>Por venir</th><th>Cumplimiento</th></tr></thead><tbody>' +
      PG.tipos.map(function (t) { return '<tr><td><b>' + t.nom + '</b></td><td>' + t.prog + '</td><td>' + t.ejec + '</td><td style="color:' + (t.venc ? '#B91C1C' : 'inherit') + '">' + t.venc + '</td><td>' + t.fut + '</td><td>' + chip(t.pct) + '</td></tr>'; }).join('') + '</tbody></table>'
      : '<div class="icc-vacio">No hay fechas programadas en la Programación ETI para este ' + (gen ? 'ciclo' : 'sector y ciclo') + '.</div>');
    h += '<div class="icc-h3">📊 ' + (gen ? 'Sector × tema' : '% por tema') + '</div><div style="overflow-x:auto"><table class="icc-t">' +
      (gen ? '<thead><tr><th>Sector</th>' + ev.temas.map(function (t) { return '<th>' + esc(t.nom) + '</th>'; }).join('') + '<th>General</th><th>Aprueba</th></tr></thead><tbody>' + ev.sectores.map(function (s) { return '<tr><td><b>' + esc(s.sector) + '</b></td>' + ev.temas.map(function (t) { return '<td>' + chip(s.temas[t.id]) + '</td>'; }).join('') + '<td>' + chip(s.prom) + '</td><td>' + (s.aprueba ? '✅' : '❌') + '</td></tr>'; }).join('')
        : '<thead><tr><th>Tema</th><th>Evaluados</th><th>%</th><th>Resultado</th></tr></thead><tbody>' + ev.temas.map(function (t) { return '<tr><td>' + esc(t.nom) + '</td><td>' + t.n + '</td><td>' + chip(t.pct) + '</td><td>' + (t.pct >= MIN ? '✅ Aprueba' : '🔴 Reforzar') + '</td></tr>'; }).join('')) + '</tbody></table></div>';
    h += '<div class="icc-h3">🧭 Por ruta</div><div style="overflow-x:auto;max-height:260px"><table class="icc-t"><thead><tr><th>' + (gen ? 'Sector · ruta' : 'Ruta') + '</th><th>Eval.</th>' + ev.temas.map(function (t) { return '<th>' + esc(t.nom) + '</th>'; }).join('') + '<th>General</th></tr></thead><tbody>' +
      ev.rutas.map(function (r) { return '<tr><td>' + esc((gen ? r.sector + ' · ' : '') + (r.ruta || '—')) + (r.cod ? ' <small style="color:#64748B">' + esc(r.cod) + '</small>' : '') + '</td><td>' + r.n + '</td>' + ev.temas.map(function (t) { return '<td>' + chip(r.temas[t.id]) + '</td>'; }).join('') + '<td>' + chip(r.prom) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    h += '<div class="icc-h3">📝 Conclusiones (automáticas, puedes editarlas)</div><textarea class="icc-ta" id="icc-con">' + esc(K.lista.join('\n')) + '</textarea>' +
      '<div class="icc-h3">🎯 ' + (gen ? 'Decisión final: sectores, rutas y áreas a reforzar' : 'Rutas y temas a reforzar') + '</div><textarea class="icc-ta" id="icc-dec">' + esc(K.decision) + '</textarea>' +
      '<div class="icc-h3">✍️ Firmas</div><p style="margin:.2rem 0;font-size:.88rem;color:#334155">' + (gen ? FIRMAS_GEN : firmasSector(R)).map(function (f) { return '<b>' + esc(f.nom) + '</b> — ' + esc(f.cargo); }).join('<br>') + '</p>' +
      '<div style="margin-top:1rem;display:flex;gap:.5rem;flex-wrap:wrap"><button class="icc-b p" id="icc-word">📄 Generar Word</button></div>';
    out.innerHTML = h;
    $('icc-word').onclick = word;
  }
  function firmasSector(R) { return [{ nom: R.supervisores[0] || (ses() || {}).nom || '', cargo: 'Supervisor(a) de Gestión Humana – Sector ' + ULT.o.sector }, FIRMA_LUCIA]; }
  async function word() {
    var b = $('icc-word'), o = ULT.o, R = ULT.R, gen = o.modo === 'general', s = ses() || {};
    b.disabled = true; b.textContent = '⏳ Generando…';
    try {
      if (typeof window.docx === 'undefined') await cargarJS('lib/docx.iife.js?v=951');
      if (typeof window.etiInformeCiclo !== 'function' || (window.etiInformeCiclo.version || 0) < 2) await cargarJS('lib/eti-informe-ciclo.js?v=2');
      var logo = ''; try { logo = (getComputedStyle(document.documentElement).getPropertyValue('--logo').match(/base64,([^)'"]+)/) || [])[1] || ''; } catch (e) {}
      var p1 = o.ciclo.desde, p2 = o.ciclo.hasta, em = fF(hoy());
      var D = Object.assign({}, R, { modo: o.modo, razon: o.emp === 'RAPEL' ? 'Sociedad Agricola Rapel S.A.C.' : 'Sociedad Exportadora Verfrut S.A.C.', sector: o.sector, alcance: 'Todos los sectores de ' + o.emp,
        ciclo: { nom: o.ciclo.nom, desdeTxt: fF(p1), hastaTxt: fF(p2) }, fechaEmision: em, emisor: (s.nom || s.user || '') + ' (' + (s.user || '') + ')',
        conclusiones: $('icc-con').value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean), decision: $('icc-dec').value.trim(),
        firmas: gen ? FIRMAS_GEN : firmasSector(R), logoBase64: logo });
      D.verif = verif(JSON.stringify([o.ciclo.id, o.emp, o.sector, R.ev.n, R.cap.total, em, s.user]));
      var blob = await window.etiInformeCiclo(D);
      var nombre = ('Informe_cierre_' + (gen ? 'general_' + o.emp : o.sector) + '_' + o.ciclo.nom).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_') + '.docx';
      var a = document.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = nombre; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 1000);
      aviso('✅ Informe generado: ' + nombre, 's');
    } catch (e) { console.error('[_INFORME_CICLO_V1]', e); aviso('No se pudo generar el Word: ' + e.message, 'e'); }
    finally { b.disabled = false; b.textContent = '📄 Generar Word'; }
  }
  function menu() {
    var nav = $('es-nav'); if (!nav || $('icc-menu') || !ses()) return;
    var b = document.createElement('button'); b.id = 'icc-menu'; b.className = 'es-it'; b.type = 'button';
    b.innerHTML = '<span>📑</span><span>Informes de cierre de ciclo</span>';
    b.onclick = function () { document.body.classList.remove('side-open'); if (!window.etiAlertasRef) { aviso('Recarga la página (Ctrl+F5)', 'e'); return; } abrir(); };
    var ref = $('alr-menu') || $('enc-menu') || $('inf-menu');
    if (ref && ref.parentNode === nav) nav.insertBefore(b, ref.nextSibling); else nav.appendChild(b);
  }
  window.etiInformeCicloUI = { abrir: abrir, armar: armar, cumplimiento: cumplimiento, datos: datos, conclusiones: conclusiones, version: 3 };   /* _CENTRO_INFORMES_V1 (10-nov): el Expediente de auditoria usa estos mismos datos y calculos */
  setInterval(menu, 1500); setTimeout(menu, 600);
})();
