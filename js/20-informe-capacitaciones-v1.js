/* ════════════════════════════════════════════════════════════════════════════
   _INFORME_CAP_V1 (10-nov-2026) — Informe de Capacitaciones ETI (modelo de informes gerenciales)
   · Periodo: MES · CICLO (I a IV) · AÑO (cierre de año).   Alcance: General (ambas / RAPEL / VERFRUT) o un SECTOR.
   · Todo de Supabase (eti/consultar): eti.capacitaciones (sesiones ejecutadas), eti.programaciones_eti
     (programado vs ejecutado y reprogramaciones con su motivo) y eti.encuestas_sat (satisfaccion).
   · El cumplimiento usa la MISMA regla del Informe de cierre de ciclo (etiInformeCicloUI.cumplimiento):
     una fecha esta ejecutada si figura en fechasEjecutadas o la programacion esta "ejecutada";
     cumplimiento = ejecutadas / (ejecutadas + vencidas).
   · Vista en pantalla, Imprimir / PDF (A4) y Excel. Solo lee: no cambia nada. Joel, Lucia y administradores.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.etiInformeCap) return;
  var API = 'https://exdjzbfinppzatjyimxn.supabase.co/functions/v1/api/', REG = '?forceFunctionRegion=sa-east-1';
  var EDITORES = ['jtimoteo', 'lcastillo'];
  var MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  var SECTORES = ['El Papayo', 'Limones', 'Los Olivares', 'Aproa', 'Algarrobos', 'San Vicente', 'Planta Rapel', 'Olivares Bajo', 'Santa Rosa', 'Punta Arenas'];
  var ALIAS = { 'PAPAYO': 'EL PAPAYO', 'OLIVARES APROA': 'APROA', 'PLANTA': 'PLANTA RAPEL', 'SANTA ROSA I': 'SANTA ROSA', 'SANTA ROSA II': 'SANTA ROSA', 'SANTA ROSA 1': 'SANTA ROSA', 'SANTA ROSA 2': 'SANTA ROSA' };
  var COORD = { nom: 'Joel Angel Timoteo Gonza', cargo: 'Coordinador de Relaciones Laborales' };

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var ses = function () { try { return typeof SESSION !== 'undefined' ? SESSION : null; } catch (e) { return null; } };
  var aviso = function (m, t) { try { if (typeof toast === 'function') toast(m, t || 'i'); } catch (e) {} };
  var p2 = function (n) { return String(n).padStart(2, '0'); };
  var hoy = function () { var d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };
  var fF = function (f) { return f ? String(f).slice(0, 10).split('-').reverse().join('/') : '—'; };
  var pc = function (x) { return x == null || isNaN(x) ? '—' : (Math.round(x * 1000) / 10).toFixed(1) + '%'; };
  var U = function (s) { return String(s || '').trim().toUpperCase().replace(/\s+/g, ' '); };
  var secKey = function (s) { var x = U(s).replace(/^SECTOR\s+/, ''); return ALIAS[x] || x; };
  var secTit = function (s) { var x = secKey(s); return x ? x.toLowerCase().replace(/(^|\s)\S/g, function (m) { return m.toUpperCase(); }) : '—'; };
  var empDe = function (s) { try { return window.etiAlertasRef.empDe(s, '') || ''; } catch (e) { return ''; } };
  function esEditor() { var s = ses(); return !!s && (s.rol === 'admin' || EDITORES.indexOf(String(s.user || '').toLowerCase()) >= 0); }
  function token() { try { return sessionStorage.getItem('eti_token') || ''; } catch (e) { return ''; } }
  function post(ruta, cuerpo) {
    var h = { 'Content-Type': 'application/json' }, t = token(); if (t) h.Authorization = 'Bearer ' + t;
    return fetch(API + ruta + REG, { method: 'POST', headers: h, body: JSON.stringify(cuerpo) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.success) throw new Error((j && j.error) || ('HTTP ' + r.status)); return j; });
    });
  }
  function consultar(col, f) { return post('eti/consultar', { col: col, filtros: f || [], limite: 20000 }).then(function (j) { return (j.docs || []).map(function (d) { return Object.assign({ _id: d.id }, d.datos); }); }); }

  /* ── periodos ── */
  function periodoMes(anio, mes) { var u = new Date(anio, mes, 0).getDate(); return { tipo: 'mes', id: anio + '-' + p2(mes), nom: MESES[mes - 1] + ' ' + anio, desde: anio + '-' + p2(mes) + '-01', hasta: anio + '-' + p2(mes) + '-' + p2(u) }; }
  function periodoAnio(anio) { return { tipo: 'anio', id: String(anio), nom: 'Año ' + anio + ' (cierre de año)', desde: anio + '-01-01', hasta: anio + '-12-31' }; }
  function periodoCiclo(c) { return { tipo: 'ciclo', id: c.id, nom: c.nom, desde: c.desde, hasta: c.hasta }; }
  function mesesDe(P) { var L = [], a = +P.desde.slice(0, 4), m = +P.desde.slice(5, 7), A = +P.hasta.slice(0, 4), M = +P.hasta.slice(5, 7); while (a < A || (a === A && m <= M)) { L.push(a + '-' + p2(m)); m++; if (m > 12) { m = 1; a++; } } return L; }

  /* ── 1) datos (Supabase) ── */
  async function datos(P, alc) {
    var Q = await Promise.all([
      consultar('capacitaciones', [['fechaEjecucion', '>=', P.desde], ['fechaEjecucion', '<=', P.hasta]]),
      consultar('programaciones_eti', []),
      consultar('encuestas_sat', [['fecha', '>=', P.desde], ['fecha', '<=', P.hasta]]).catch(function () { return []; })]);
    var enAlc = function (sector, emp) { if (alc.sector) return secKey(sector) === secKey(alc.sector); var e = empDe(sector) || U(emp).replace(/\s*S\.?\s*A\.?\s*C\.?$/, ''); return !alc.emp || e === alc.emp; };
    var CAP = Q[0].filter(function (x) { return !(x.eliminado || x.anulado || x.eliminada) && enAlc(x.sector, x.empresa); });
    var PRG = Q[1].filter(function (x) { return /CAPACITACI/i.test(x.tema || '') && enAlc(x.sector, x.empresa); })
      .map(function (x) { x.fechas = (Array.isArray(x.fechas) && x.fechas.length ? x.fechas.slice() : [x.fechaProgramada, x.fechaFin || x.fechaProgramada].filter(Boolean)).sort(); return x; });
    var SAT = Q[2].filter(function (x) { return enAlc(x.sector, x.emp); });
    return { CAP: CAP, PRG: PRG, SAT: SAT };
  }
  /* ── 2) calculos ── */
  function armar(P, alc, X) {
    var h = hoy(), cumpl = function (L, desde, hasta) {
      var r = { prog: 0, ejec: 0, venc: 0, fut: 0 };
      L.forEach(function (p) { p.fechas.filter(function (f) { return f >= desde && f <= hasta; }).forEach(function (f) {
        var ok = p.estado === 'ejecutada' || (p.fechasEjecutadas || []).indexOf(f) >= 0; r.prog++; r[ok ? 'ejec' : f < h ? 'venc' : 'fut']++; }); });
      r.pct = r.ejec + r.venc ? r.ejec / (r.ejec + r.venc) : null; return r;
    };
    var tot = { sesiones: X.CAP.length, total: 0, h: 0, m: 0, plazo: 0, fuera: 0, sinActa: 0 };
    var porSec = {}, porTema = {}, porMes = {};
    X.CAP.forEach(function (x) {
      var t = +x.total || ((+x.varones || 0) + (+x.mujeres || 0)), f = String(x.fechaEjecucion || '').slice(0, 10), sk = secTit(x.sector), mes = f.slice(0, 7), tema = String(x.tema || '—').trim();
      tot.total += t; tot.h += +x.varones || 0; tot.m += +x.mujeres || 0;
      var acta = x.fechaEnvio ? (x.fechaLimite && String(x.fechaEnvio).slice(0, 10) > String(x.fechaLimite).slice(0, 10) ? 'fuera' : 'plazo') : 'sinActa'; tot[acta]++;
      var s = porSec[sk] || (porSec[sk] = { sector: sk, sups: {}, sesiones: 0, total: 0, h: 0, m: 0, plazo: 0, fuera: 0, sinActa: 0 }); s.sesiones++; s.total += t; s.h += +x.varones || 0; s.m += +x.mujeres || 0; s[acta]++; if (x.supervisor) s.sups[x.supervisor] = 1;
      var tm = porTema[tema] || (porTema[tema] = { tema: tema, sesiones: 0, total: 0 }); tm.sesiones++; tm.total += t;
      var ms = porMes[mes] || (porMes[mes] = { mes: mes, sesiones: 0, total: 0 }); ms.sesiones++; ms.total += t;
    });
    var cGen = cumpl(X.PRG, P.desde, P.hasta);
    var secs = {}; X.PRG.forEach(function (p) { (secs[secTit(p.sector)] = secs[secTit(p.sector)] || []).push(p); });
    var nombres = {}; Object.keys(porSec).forEach(function (k) { nombres[k] = 1; }); Object.keys(secs).forEach(function (k) { if (cumpl(secs[k], P.desde, P.hasta).prog) nombres[k] = 1; });
    var sectores = Object.keys(nombres).sort().map(function (k) { var s = porSec[k] || { sector: k, sups: {}, sesiones: 0, total: 0, h: 0, m: 0, plazo: 0, fuera: 0, sinActa: 0 };
      var sup = {}; Object.keys(s.sups).forEach(function (n) { sup[n] = 1; }); (secs[k] || []).forEach(function (p) { if (p.supervisor) sup[p.supervisor] = 1; });
      return Object.assign({}, s, { emp: empDe(k), sups: Object.keys(sup), c: cumpl(secs[k] || [], P.desde, P.hasta) }); });
    var meses = P.tipo === 'mes' ? [] : mesesDe(P).map(function (m) { var u = new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate(), z = porMes[m] || { sesiones: 0, total: 0 };
      return { mes: m, nom: MESES[+m.slice(5, 7) - 1] + ' ' + m.slice(0, 4), sesiones: z.sesiones, total: z.total, c: cumpl(X.PRG, m + '-01', m + '-' + p2(u)) }; });
    var reprog = []; X.PRG.forEach(function (p) { (p.reprogramaciones || []).forEach(function (r) {
      var ant = r.fechaAnteriorIni || (r.fechasAnterior || [])[0] || ''; if (!(ant >= P.desde && ant <= P.hasta)) return;
      var nueva = r.nuevaIni || (r.fechasNueva || [])[0] || '';
      reprog.push({ sector: secTit(p.sector), sup: p.supervisor || '', ant: ant, nueva: nueva, motivo: r.motivo || '—', detalle: r.detalle || '', estado: (p.fechasEjecutadas || []).indexOf(nueva) >= 0 || p.estado === 'ejecutada' ? 'Ejecutada' : nueva && nueva < h ? 'Vencida' : 'Pendiente' }); }); });
    reprog.sort(function (a, b) { return a.ant.localeCompare(b.ant); });
    var sat = null;   /* _SIN_SATISFACCION_V1 (10-nov): la encuesta de satisfaccion no va en este informe */
    var sesiones = X.CAP.slice().sort(function (a, b) { return String(a.fechaEjecucion).localeCompare(String(b.fechaEjecucion)); }).map(function (x) {
      return { fecha: fF(x.fechaEjecucion), sector: secTit(x.sector), sup: x.supervisor || '', tema: x.tema || '', h: +x.varones || 0, m: +x.mujeres || 0, total: +x.total || ((+x.varones || 0) + (+x.mujeres || 0)),
        acta: x.fechaEnvio ? fF(x.fechaEnvio) : '—', plazo: x.fechaEnvio ? (x.fechaLimite && String(x.fechaEnvio).slice(0, 10) > String(x.fechaLimite).slice(0, 10) ? 'Fuera de plazo' : 'En plazo') : 'Sin acta' }; });
    var temas = Object.keys(porTema).map(function (k) { return porTema[k]; }).sort(function (a, b) { return b.total - a.total; });
    return { tot: tot, cumpl: cGen, sectores: sectores, temas: temas, meses: meses, reprog: reprog, sat: sat, sesiones: sesiones };
  }
  function conclusiones(P, alc, R) {
    var L = [], c = R.cumpl, enMeta = R.sectores.filter(function (s) { return s.c.pct != null && s.c.pct >= 0.95; }), bajo = R.sectores.filter(function (s) { return s.c.pct != null && s.c.pct < 0.95; });
    L.push('En ' + P.nom + ' se ejecutaron ' + c.ejec + ' de ' + (c.ejec + c.venc) + ' capacitaciones con fecha vencida (' + pc(c.pct) + ', meta 95 % del KPI K3)' + (c.fut ? '; ' + c.fut + ' fechas siguen por venir' : '') + '.');
    L.push('Se capacitó a ' + R.tot.total + ' trabajadores (' + R.tot.h + ' hombres y ' + R.tot.m + ' mujeres) en ' + R.tot.sesiones + ' sesiones registradas.');
    if (!alc.sector && R.sectores.length) L.push(bajo.length ? 'Sectores bajo la meta: ' + bajo.map(function (s) { return s.sector + ' (' + pc(s.c.pct) + ')'; }).join(', ') + '.' : 'Todos los sectores con fechas vencidas cumplen la meta.');
    var actas = R.tot.plazo + R.tot.fuera; if (R.tot.sesiones) L.push('Actas: ' + R.tot.plazo + ' en plazo, ' + R.tot.fuera + ' fuera de plazo y ' + R.tot.sinActa + ' sin fecha de envío' + (actas ? ' (' + pc(R.tot.plazo / actas) + ' en plazo de las enviadas).' : '.'));
    if (R.reprog.length) { var mot = {}; R.reprog.forEach(function (r) { mot[r.motivo] = (mot[r.motivo] || 0) + 1; }); var top = Object.keys(mot).sort(function (a, b) { return mot[b] - mot[a]; })[0];
      L.push(R.reprog.length + ' reprogramaciones; el motivo más frecuente fue "' + top + '" (' + mot[top] + ').'); }
    if (R.sat && R.sat.n) L.push('Satisfacción del personal: ' + Math.round(R.sat.gen) + '/100 (' + R.sat.n + ' respuestas por QR).');
    var A = [];
    if (c.venc) A.push('Ejecutar o reprogramar las ' + c.venc + ' capacitaciones vencidas sin registro y verificar su acta.');
    if (R.tot.fuera || R.tot.sinActa) A.push('Regularizar las actas fuera de plazo o sin fecha de envío.');
    if (R.reprog.length) A.push('Coordinar con Producción las fechas de los sectores con reprogramaciones antes de cargar la programación del siguiente periodo.');
    if (!A.length) A.push('Mantener la programación y el registro oportuno de actas.');
    return { lista: L, acciones: A };
  }

  /* ── 3) documento (mismo modelo y estilos que el Expediente de auditoria) ── */
  var colP = function (p) { return p == null ? ['#F1F5F9', '#64748B'] : p < 0.8 ? ['#FEE2E2', '#B91C1C'] : p < 0.95 ? ['#FEF3C7', '#92400E'] : ['#DCFCE7', '#15803D']; };
  var chip = function (p) { var c = colP(p); return '<span class="x-chip" style="background:' + c[0] + ';color:' + c[1] + '">' + pc(p) + '</span>'; };
  var est = function (t, k) { var c = { ok: ['#DCFCE7', '#166534'], med: ['#FEF3C7', '#92400E'], bad: ['#FEE2E2', '#991B1B'], info: ['#E0E7FF', '#1E3A8A'] }[k]; return '<span class="x-chip" style="background:' + c[0] + ';color:' + c[1] + '">' + esc(t) + '</span>'; };
  function documento(P, alc, R, K) {
    var CI = window.etiCentroInformes || {}, s = ses() || {}, n = 0, emp = alc.sector ? empDe(alc.sector) : alc.emp;
    var razon = emp === 'RAPEL' ? 'Sociedad Agrícola Rapel S.A.C.' : emp === 'VERFRUT' ? 'Sociedad Exportadora Verfrut S.A.C.' : 'Sociedad Agrícola Rapel S.A.C. · Sociedad Exportadora Verfrut S.A.C.';
    var h2 = function (t) { n++; return '<h2 class="x-h2">' + ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI'][n - 1] + '.&nbsp;&nbsp;' + t + ':</h2>'; };
    var tabla = function (heads, filas, al, total) { return '<table class="x-t"><thead><tr>' + heads.map(function (x, i) { return '<th style="text-align:' + ((al || [])[i] || 'left') + '">' + x + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (filas.length ? filas.map(function (f) { return '<tr>' + f.map(function (x, i) { return '<td style="text-align:' + ((al || [])[i] || 'left') + '">' + x + '</td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="' + heads.length + '" style="text-align:center;color:#64748B">Sin registros en el periodo</td></tr>') +
      (total && filas.length ? '<tr>' + total.map(function (x, i) { return '<td style="text-align:' + ((al || [])[i] || 'left') + ';background:#e2e8f0;font-weight:800">' + x + '</td>'; }).join('') + '</tr>' : '') + '</tbody></table>'; };
    var titulo = (P.tipo === 'anio' ? 'INFORME ANUAL DE CAPACITACIONES ETI · CIERRE DE AÑO' : P.tipo === 'ciclo' ? 'INFORME DE CAPACITACIONES ETI POR CICLO' : 'INFORME MENSUAL DE CAPACITACIONES ETI') + (alc.sector ? ' · SECTOR ' + U(alc.sector) : '');
    var actas = R.tot.plazo + R.tot.fuera, c = R.cumpl, enMeta = R.sectores.filter(function (x) { return x.c.pct != null && x.c.pct >= 0.95; }).length, conPct = R.sectores.filter(function (x) { return x.c.pct != null; }).length;
    var cards = [['Cumplimiento del programa', pc(c.pct), c.ejec + ' de ' + (c.ejec + c.venc) + ' vencidas · meta 95 % (K3)', colP(c.pct)[1]],
      ['Personal capacitado', String(R.tot.total), 'Hombres ' + R.tot.h + ' · Mujeres ' + R.tot.m, '#0b2a6f'],
      ['Actas en plazo', actas ? pc(R.tot.plazo / actas) : '—', R.tot.plazo + ' en plazo · ' + R.tot.fuera + ' fuera · ' + R.tot.sinActa + ' sin envío', actas ? colP(R.tot.plazo / actas)[1] : '#64748b'],
      ['Reprogramaciones', String(R.reprog.length), R.reprog.filter(function (r) { return r.estado === 'Ejecutada'; }).length + ' ejecutadas · ' + R.reprog.filter(function (r) { return r.estado !== 'Ejecutada'; }).length + ' por ejecutar', R.reprog.length ? '#b45309' : '#15803d'],
      ['Sesiones registradas', String(R.tot.sesiones), 'en Capacitaciones ETI', '#0b2a6f'],
      [alc.sector ? 'Fechas por venir' : 'Sectores en meta', alc.sector ? String(c.fut) : enMeta + ' de ' + conPct, alc.sector ? 'programadas dentro del periodo' : 'cumplimiento ≥ 95 %', '#0b2a6f']];
    var logo = CI._logo ? CI._logo() : '';
    var x = (CI._cabecera ? CI._cabecera(razon, titulo, P.nom + ' · emitido el ' + fF(hoy())) : '');
    x += h2('Generalidades') + '<table class="x-kv"><tbody>' + [['Periodo', esc(P.nom) + ' · ' + fF(P.desde) + ' al ' + fF(P.hasta)], ['Empresa', esc(razon)],
      ['Alcance', alc.sector ? 'Sector ' + esc(alc.sector) + (R.sectores[0] && R.sectores[0].sups.length ? ' · ' + esc(R.sectores[0].sups.join(' · ')) : '') : R.sectores.length + ' sectores'],
      ['Tema', 'Capacitaciones ETI · CAP-SC-10 Ética social e ingresos masivos'],
      ['Fuente de datos', 'Programación ETI del Sistema RR.LL. + registros de Capacitaciones ETI · Supabase'],
      ['Emitido por', esc((s.nom || s.user || '') + ' (' + (s.user || '') + ')')]].map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>';
    x += h2('Resumen ejecutivo') + '<div class="x-cards">' + cards.map(function (k) { return '<div style="border-top-color:' + k[3] + '"><span>' + k[0] + '</span><b style="color:' + k[3] + '">' + k[1] + '</b><small>' + esc(k[2]) + '</small></div>'; }).join('') + '</div>';
    x += h2(alc.sector ? 'Cumplimiento del sector' : 'Cumplimiento por sector') + tabla(['Sector', 'Empresa', 'Prog.', 'Ejec.', 'Vencidas', 'Por venir', 'Cumplimiento', 'Capacitados', 'Actas en plazo', 'Estado'],
      R.sectores.map(function (z) { var a = z.plazo + z.fuera; return ['<b>' + esc(z.sector) + '</b>', esc(z.emp || '—'), z.c.prog, z.c.ejec, z.c.venc, z.c.fut, chip(z.c.pct), z.total, a ? z.plazo + ' / ' + a : '—',
        z.c.pct == null ? est('Sin vencidas', 'info') : z.c.pct >= 0.95 ? est('Cumple', 'ok') : est('Bajo meta', z.c.pct >= 0.8 ? 'med' : 'bad')]; }),
      ['left', 'left', 'right', 'right', 'right', 'right', 'left', 'right', 'right', 'left'],
      ['Total', '', c.prog, c.ejec, c.venc, c.fut, chip(c.pct), R.tot.total, actas ? R.tot.plazo + ' / ' + actas : '—', '']);
    if (R.meses.length) x += h2('Evolución por mes') + tabla(['Mes', 'Fechas prog.', 'Ejecutadas', 'Vencidas', 'Cumplimiento', 'Sesiones registradas', 'Capacitados'],
      R.meses.map(function (m) { return ['<b>' + m.nom + '</b>', m.c.prog, m.c.ejec, m.c.venc, chip(m.c.pct), m.sesiones, m.total]; }), ['left', 'right', 'right', 'right', 'left', 'right', 'right'],
      ['Total', c.prog, c.ejec, c.venc, chip(c.pct), R.tot.sesiones, R.tot.total]);
    x += h2('Capacitaciones por tema') + tabla(['Tema', 'Sesiones', 'Capacitados', '% del personal'], R.temas.map(function (t) { return ['<b>' + esc(t.tema) + '</b>', t.sesiones, t.total, R.tot.total ? pc(t.total / R.tot.total) : '—']; }),
      ['left', 'right', 'right', 'right'], ['Total', R.tot.sesiones, R.tot.total, '100%']);
    x += h2('Reprogramaciones') + '<p class="x-p">Cada fecha no ejecutada lleva el motivo que registró el supervisor; la nueva fecha la asigna la Coordinación de Relaciones Laborales y desde ella se recalcula el plazo del KPI K3.</p>' +
      tabla(['Sector', 'Supervisor', 'Fecha prog.', 'Motivo', 'Nueva fecha', 'Estado'], R.reprog.map(function (r) { return ['<b>' + esc(r.sector) + '</b>', esc(r.sup), fF(r.ant), esc(r.motivo) + (r.detalle ? '<br><small style="color:#64748b">' + esc(r.detalle) + '</small>' : ''), fF(r.nueva),
        est(r.estado, r.estado === 'Ejecutada' ? 'ok' : r.estado === 'Vencida' ? 'bad' : 'med')]; }), ['left', 'left', 'left', 'left', 'left', 'left']);
    if (R.sat && R.sat.n) x += h2('Satisfacción del personal capacitado') + tabla(['Aspecto', 'Puntaje (0–100)'],
      [['Capacitador', R.sat.cap], ['Material', R.sat.mat], ['Contenido', R.sat.cont], ['Logística', R.sat.log], ['<b>General</b>', R.sat.gen]].filter(function (r) { return r[1] != null; }).map(function (r) { return [r[0], '<b>' + Math.round(r[1]) + '</b>']; }), ['left', 'right']) +
      '<p class="x-p">' + R.sat.n + ' respuestas anónimas por QR.</p>';
    x += h2('Detalle de sesiones registradas') + tabla(['Fecha', 'Sector', 'Supervisor', 'Tema', 'H', 'M', 'Total', 'Acta enviada', 'Plazo'],
      R.sesiones.map(function (z) { return [z.fecha, esc(z.sector), esc(z.sup), esc(z.tema), z.h, z.m, '<b>' + z.total + '</b>', z.acta, est(z.plazo, z.plazo === 'En plazo' ? 'ok' : z.plazo === 'Sin acta' ? 'info' : 'bad')]; }),
      ['left', 'left', 'left', 'left', 'right', 'right', 'right', 'left', 'left']);
    x += h2('Conclusiones') + '<ul class="x-ul">' + K.lista.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' +
      h2('Acciones de mejora') + '<ul class="x-ul">' + K.acciones.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>';
    var firmas = alc.sector ? [{ nom: (R.sectores[0] && R.sectores[0].sups[0]) || 'Supervisor(a) de Gestión Humana', cargo: 'Supervisor(a) de Gestión Humana · ' + alc.sector }, COORD]
      : [COORD, { nom: 'Luis Eduardo Coveñas Chero', cargo: 'Subgerente de Personas' }];
    x += '<p class="x-p">Es todo en cuanto tengo que informar.</p>' + (CI._firma ? CI._firma() : '');
    x += '<div class="x-pie"><span>Gestión Humana · Relaciones Laborales · Unifrutti Perú</span><span>Generado por el sistema desde Supabase · ' + new Date().toLocaleString('es-PE') + '</span></div>';
    return '<div class="x-doc">' + (CI._estilosDoc ? CI._estilosDoc() : '') + x + '</div>';
  }

  /* ── 4) pantalla ── */
  var ULT = null;
  function abrir() {
    var CI = window.etiCentroInformes;
    if (!esEditor()) { aviso('El informe de Capacitaciones ETI es para la administración (Joel, Lucía)', 'e'); return; }
    if (!CI || !CI._modal || !window.etiAlertasRef) { aviso('Recarga la página (Ctrl+F5)', 'e'); return; }
    var d = new Date(), y = d.getFullYear(), cs = window.etiAlertasRef.ciclos(), h = hoy(), act = cs.find(function (c) { return h >= c.desde && h <= c.hasta; }) || cs[0];
    var anios = []; for (var a = y; a >= 2026; a--) anios.push(a);
    var opt = function (L, sel) { return L.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(sel) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join(''); };
    CI._modal('📘 Informe de Capacitaciones ETI', 'Programado vs. ejecutado, capacitados, actas y reprogramaciones · por mes, ciclo o año, general o por sector. Datos de Supabase.',
      '<div class="ci-f">' +
      '<div><label>Periodo</label><select id="ic-tipo">' + opt([['mes', 'Mensual'], ['ciclo', 'Por ciclo'], ['anio', 'Cierre de año']], 'mes') + '</select></div>' +
      '<div id="ic-w-mes"><label>Mes</label><select id="ic-mes">' + opt(MESES.map(function (m, i) { return [i + 1, m]; }), d.getMonth() + 1) + '</select></div>' +
      '<div id="ic-w-ciclo" style="display:none"><label>Ciclo</label><select id="ic-ciclo">' + opt(cs.map(function (c) { return [c.id, c.nom]; }), act && act.id) + '</select></div>' +
      '<div id="ic-w-anio"><label>Año</label><select id="ic-anio">' + opt(anios.map(function (a) { return [a, a]; }), y) + '</select></div>' +
      '<div><label>Alcance</label><select id="ic-alc">' + opt([['', 'General · ambas empresas'], ['E:RAPEL', 'General · RAPEL'], ['E:VERFRUT', 'General · VERFRUT']].concat(SECTORES.map(function (s) { return ['S:' + s, 'Sector ' + s]; })), '') + '</select></div>' +
      '<div><button class="ci-b p" id="ic-ver">👁 Ver informe</button></div></div><div id="ic-out"><div class="ci-vacio">Elige el periodo y el alcance, y pulsa <b>👁 Ver informe</b>.</div></div>');
    var sync = function () { var t = $('ic-tipo').value; $('ic-w-mes').style.display = t === 'mes' ? '' : 'none'; $('ic-w-ciclo').style.display = t === 'ciclo' ? '' : 'none'; $('ic-w-anio').style.display = t === 'ciclo' ? 'none' : ''; };
    $('ic-tipo').onchange = sync; sync();
    $('ic-ver').onclick = ver;
  }
  async function ver() {
    var out = $('ic-out'), b = $('ic-ver'), t = $('ic-tipo').value, a = +$('ic-anio').value, v = $('ic-alc').value;
    var P = t === 'mes' ? periodoMes(a, +$('ic-mes').value) : t === 'anio' ? periodoAnio(a) : periodoCiclo(window.etiAlertasRef.ciclos().find(function (c) { return c.id === $('ic-ciclo').value; }));
    var alc = { emp: v.indexOf('E:') === 0 ? v.slice(2) : '', sector: v.indexOf('S:') === 0 ? v.slice(2) : '' };
    b.disabled = true; out.innerHTML = '<p>⏳ Leyendo de Supabase la programación y las capacitaciones de ' + esc(P.nom) + '…</p>';
    try {
      var X = await datos(P, alc), R = armar(P, alc, X), K = conclusiones(P, alc, R);
      if (!R.tot.sesiones && !R.cumpl.prog) { out.innerHTML = '<div class="ci-vacio">No hay capacitaciones programadas ni registradas en ' + esc(P.nom) + (alc.sector ? ' para ' + esc(alc.sector) : '') + '.</div>'; return; }
      ULT = { P: P, alc: alc, R: R, K: K, html: documento(P, alc, R, K) };
      out.innerHTML = '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem"><button class="ci-b r" id="ic-pdf">🖨 Imprimir / PDF</button><button class="ci-b p" id="ic-xls">📊 Excel</button></div>' +
        '<div class="ci-doc"><div id="ci-docm" style="max-width:794px;margin:0 auto"></div></div>'; window.etiCentroInformes._montar(document.getElementById('ci-docm'), ULT.html);
      $('ic-pdf').onclick = function () { window.etiCentroInformes._imprimir(ULT.html, nombre()); };
      $('ic-xls').onclick = excel;
    } catch (e) { console.error('[_INFORME_CAP_V1]', e); out.innerHTML = '<div class="ci-vacio">No se pudo preparar el informe: ' + esc(e.message) + '</div>'; }
    finally { b.disabled = false; }
  }
  function nombre() { return ('Informe_Capacitaciones_ETI_' + (ULT.alc.sector || ULT.alc.emp || 'General') + '_' + ULT.P.nom).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_'); }
  function excel() {
    if (!ULT || !window.XLSX) { aviso('No se pudo cargar el Excel', 'e'); return; }
    var R = ULT.R, wb = XLSX.utils.book_new(), hoja = function (n, f) { XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(f), n); }, p = function (x) { return x == null ? '' : Math.round(x * 1000) / 10; };
    hoja('Resumen', [['Informe de Capacitaciones ETI'], ['Periodo', ULT.P.nom], ['Desde', fF(ULT.P.desde)], ['Hasta', fF(ULT.P.hasta)], ['Alcance', ULT.alc.sector || ULT.alc.emp || 'General'],
      ['Fechas programadas', R.cumpl.prog], ['Ejecutadas', R.cumpl.ejec], ['Vencidas', R.cumpl.venc], ['Por venir', R.cumpl.fut], ['Cumplimiento %', p(R.cumpl.pct)],
      ['Sesiones registradas', R.tot.sesiones], ['Capacitados', R.tot.total], ['Hombres', R.tot.h], ['Mujeres', R.tot.m], ['Actas en plazo', R.tot.plazo], ['Actas fuera de plazo', R.tot.fuera], ['Sin acta', R.tot.sinActa], ['Emitido', fF(hoy())]]);
    hoja('Sectores', [['Sector', 'Empresa', 'Supervisor(es)', 'Prog.', 'Ejec.', 'Vencidas', 'Por venir', 'Cumplimiento %', 'Sesiones', 'Capacitados', 'Actas en plazo', 'Fuera de plazo', 'Sin acta']]
      .concat(R.sectores.map(function (z) { return [z.sector, z.emp, z.sups.join(' · '), z.c.prog, z.c.ejec, z.c.venc, z.c.fut, p(z.c.pct), z.sesiones, z.total, z.plazo, z.fuera, z.sinActa]; })));
    if (R.meses.length) hoja('Meses', [['Mes', 'Prog.', 'Ejec.', 'Vencidas', 'Cumplimiento %', 'Sesiones', 'Capacitados']].concat(R.meses.map(function (m) { return [m.nom, m.c.prog, m.c.ejec, m.c.venc, p(m.c.pct), m.sesiones, m.total]; })));
    hoja('Temas', [['Tema', 'Sesiones', 'Capacitados']].concat(R.temas.map(function (t) { return [t.tema, t.sesiones, t.total]; })));
    hoja('Reprogramaciones', [['Sector', 'Supervisor', 'Fecha prog.', 'Motivo', 'Detalle', 'Nueva fecha', 'Estado']].concat(R.reprog.map(function (r) { return [r.sector, r.sup, fF(r.ant), r.motivo, r.detalle, fF(r.nueva), r.estado]; })));
    hoja('Sesiones', [['Fecha', 'Sector', 'Supervisor', 'Tema', 'Hombres', 'Mujeres', 'Total', 'Acta enviada', 'Plazo']].concat(R.sesiones.map(function (z) { return [z.fecha, z.sector, z.sup, z.tema, z.h, z.m, z.total, z.acta, z.plazo]; })));
    XLSX.writeFile(wb, nombre() + '.xlsx');
  }

  window.etiInformeCap = { abrir: abrir, _armar: armar, _documento: documento, _conclusiones: conclusiones, _periodos: { mes: periodoMes, anio: periodoAnio }, version: 1 };
})();
