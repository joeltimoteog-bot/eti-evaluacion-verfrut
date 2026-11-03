/* ═════════════════════════════════════════════════════════════════════════
   _HISTORICO_2026_V1 (03-nov-2026) — Depuración del histórico de Evaluaciones ETI (19-jun → 14-oct-2026)
   Aprobado por el administrador (Joel Timoteo) para sustento de auditoría. Inerte hasta que el
   administrador lo ejecuta desde la consola:   await etiHistorico2026()        → simulación (no cambia nada)
                                                await etiHistorico2026(true)    → aplica los cambios
   Qué hace (Firebase + Azure, mismo flujo del sistema, con respaldo previo descargado en JSON):
     1) 19-jun Aproa (Alex Zapata): se enviaron 2 veces; queda el 2.º envío (corrige Santa Ana).
     2) 14-jul y 21-jul "PEDREGAL" con 1 evaluado: pruebas → se retiran.
     3) 14-oct Limones (Pool Tamayo): enviado 2 veces; queda el último.
     4) 25-ago Los Olivares (Flor Pulache): ruta "PAPAYO TAMBOGRANDE 255" repetida → se quita la 2.ª.
     5) 07-oct Aproa: 4 rutas obreras (a nombre de "Joel Timoteo Gonza", sin sector) y la ruta de empleados
        "LOMA NEGRA / ANGOSTURA / PROGRESO BAJO" solo existían en la hoja de respaldo de Google
        ("Registros Evaluaciones ETI.") → se restauran a nombre de Alex Zapata Suarez · Aproa.
   Los registros retirados NO se pierden: se copian a la colección "evaluaciones_depuradas" con motivo,
   usuario y fecha, antes de quitarlos de la colección principal y de Azure.
   ═════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.etiHistorico2026) return;
  var RETIRAR = {
    'OgLjtDHNTscAddcAkUUa': '19-jun Aproa: 1.er envío duplicado (el 2.º envío corrige Santa Ana)',
    'PeMLNdsZ09GceMXyWCBr': '14-jul PEDREGAL (1 evaluado): registro de prueba',
    'iNo334htLCd2iVLk9Gml': '21-jul PEDREGAL (1 evaluado): registro de prueba'
  };
  var LIMONES = ['FPX7t0ZKRFlH3bkXSl5L', 'LOEgNqWJ8ZydqyXdcrnm'];   /* 14-oct obrero: se conserva el más reciente */
  var FLOR = 'wOKMdexFvt5SYeAT0kxg';                                /* 25-ago: quitar la 2.ª "PAPAYO TAMBOGRANDE 255" */
  var EMPL_0710 = 'h49CGesY7tLIfc5AsrHQ';                            /* 07-oct empleados: falta LOMA NEGRA */
  /* % por tema tal cual la hoja de respaldo (Legislación, Bienestar, Sustentabilidad, Ética, SST, Medioambiente) */
  var OBRERO_0710 = [
    ['ANGOSTURA', '22', 5, [87.8, 87.5, 73.8, 53.3, 78.3, 71.3], 79.6],
    ['PAMPA CHICA', '23', 5, [84.4, 70.6, 42.5, 36.7, 51.7, 48.8], 60.8],
    ['RITA', '21', 5, [91.1, 90.6, 83.8, 96.7, 91.7, 75], 87.6],
    ['TABLAZO NORTE', '306', 5, [95.6, 87.5, 63.8, 60, 75, 66.3], 78.6]
  ];
  var LOMA = ['LOMA NEGRA / ANGOSTURA / PROGRESO BAJO', '22', 5, [88.9, 76.3, 81.3, 80, 93.3, 82.5], 82.6];

  var AZ = 'https://rl-fn-verfrut.azurewebsites.net/api/etieval';
  async function azAdmin(accion, filtro) {   /* misma llamada que usa 06-indicadores (token de admin ETI) */
    var r = await fetch(AZ + '/admin/' + accion, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (sessionStorage.getItem('eti_token') || '') }, body: JSON.stringify({ filtro: filtro }) });
    var j = await r.json().catch(function () { return {}; });
    if (r.status === 401) throw new Error('Tu sesión de administrador venció: vuelve a iniciar sesión');
    if (!r.ok || !j.success) throw new Error(j.error || ('Azure ' + r.status));
    return j;
  }
  function secsDe(p) {
    return SECS.map(function (s, i) { var pct = Math.round(p[i] * 10) / 1000; var pond = Math.round(pct * s.peso * 10000) / 10000; return { id: s.id, nom: s.nom, peso: s.peso, pct: pct, pond: pond, promSec: Math.round(pond * 1000) / 10 }; });
  }
  function ruta(x) { return { nom: x[0], cod: x[1], ne: x[2], resGrupo: Math.round(x[4] * 10) / 1000, hom: null, muj: null, secs: secsDe(x[3]) }; }
  function resGen(rutas) { var n = 0, s = 0; rutas.forEach(function (r) { n += +r.ne || 1; s += (+r.resGrupo || 0) * (+r.ne || 1); }); return n ? Math.round(s / n * 10000) / 10000 : 0; }
  function descargar(nombre, obj) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' })); a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); }
  async function azEliminarDoc(d, id) { var regs = etiAzure.regsManual(d, id); if (!regs.length) return 0; await azAdmin('eliminar', { ids: regs.map(function (r) { return r.id; }), desde: d.fecha, hasta: d.fecha }); return regs.length; }
  async function azInsertarDoc(d, id, ref) { var regs = etiAzure.regsManual(d, id); if (!regs.length) return 0; await etiAzure.post(regs); if (ref) await ref.update({ azOk: true, azEn: new Date().toISOString() }); return regs.length; }

  window.etiHistorico2026 = async function (aplicar) {
    if (typeof fbdb === 'undefined' || !fbdb || !window.etiAzure) throw new Error('Abre esta consola dentro de Evaluaciones ETI (sin conexión a Firebase/Azure)');
    if (!sessionStorage.getItem('eti_token')) throw new Error('Inicia sesión como administrador en Evaluaciones ETI');
    var quien = (window.SESSION && SESSION.user) || '';
    if (quien !== 'jtimoteo') throw new Error('Solo el administrador (jtimoteo) puede ejecutar esta depuración');
    var C = fbdb.collection(COL_EVAL), plan = [], log = [];
    var snap = await C.where('fecha', '>=', '2026-06-01').where('fecha', '<', '2026-10-15').get();
    var docs = {}; snap.forEach(function (s) { docs[s.id] = s.data(); });
    var az = await (await fetch(AZ + '/stats?desde=2026-06-01&hasta=2026-10-14', { cache: 'no-store' })).json();
    /* 1-2) retirar */
    Object.keys(RETIRAR).forEach(function (id) { if (docs[id]) plan.push({ op: 'retirar', id: id, motivo: RETIRAR[id] }); else log.push('ya no existe ' + id); });
    /* 3) Limones: retirar el más antiguo */
    var L = LIMONES.filter(function (id) { return docs[id]; });
    if (L.length === 2) { L.sort(function (a, b) { return (docs[a].ts || 0) - (docs[b].ts || 0); }); plan.push({ op: 'retirar', id: L[0], motivo: '14-oct Limones: envío duplicado (se conserva el último)' }); }
    /* 4) Flor: quitar la 2.ª ruta 255 */
    if (docs[FLOR]) { var rs = docs[FLOR].rutas || [], vis = {}, dup = -1; rs.forEach(function (r, i) { var k = String(r.nom).toUpperCase().trim() + '#' + r.cod + '#' + r.resGrupo; if (vis[k] != null && dup < 0) dup = i; vis[k] = i; }); if (dup >= 0) plan.push({ op: 'quitarRuta', id: FLOR, idx: dup, ruta: rs[dup].nom, motivo: '25-ago: ruta repetida en el mismo registro' }); }
    /* 5) restaurar 07-oct */
    var yaObr = Object.keys(docs).some(function (id) { var d = docs[id]; return d.fecha === '2026-10-07' && d.tipo === 'obrero' && (d.rutas || []).some(function (r) { return /TABLAZO/i.test(r.nom); }); });
    if (!yaObr) plan.push({ op: 'crear', motivo: '07-oct Aproa obreros: restaurado desde la hoja de respaldo (4 rutas)' });
    if (docs[EMPL_0710] && !(docs[EMPL_0710].rutas || []).some(function (r) { return /LOMA NEGRA/i.test(r.nom); })) plan.push({ op: 'agregarRuta', id: EMPL_0710, motivo: '07-oct Aproa empleados: ruta LOMA NEGRA restaurada desde la hoja de respaldo' });
    console.table(plan.map(function (p) { return { operacion: p.op, registro: p.id || '(nuevo)', detalle: p.motivo }; }));
    if (!aplicar) { console.log('Simulación: no se cambió nada. Para aplicar: await etiHistorico2026(true)'); return { simulacion: true, plan: plan, notas: log }; }
    if (!confirm('Se aplicarán ' + plan.length + ' cambios en Firebase y Azure (con respaldo). ¿Continuar?')) return { cancelado: true };
    descargar('respaldo-eti-historico-' + new Date().toISOString().slice(0, 19).replace(/:/g, '') + '.json', { generado: new Date().toISOString(), por: quien, firebase: docs, azure: az.filas || [] });
    var D = fbdb.collection('evaluaciones_depuradas'), hecho = [];
    for (var i = 0; i < plan.length; i++) {
      var p = plan[i];
      try {
        if (p.op === 'retirar') {
          var d = docs[p.id];
          await D.doc(p.id).set(Object.assign({}, d, { depuradoEn: new Date().toISOString(), depuradoPor: quien, motivoDepuracion: p.motivo, coleccionOrigen: COL_EVAL }));
          var n = await azEliminarDoc(d, p.id);
          await C.doc(p.id).delete();
          hecho.push(p.motivo + ' · Azure −' + n);
        } else if (p.op === 'quitarRuta') {
          var d2 = docs[p.id], ref2 = C.doc(p.id);
          await D.doc(p.id + '_ruta' + p.idx).set({ evalId: p.id, ruta: d2.rutas[p.idx], depuradoEn: new Date().toISOString(), depuradoPor: quien, motivoDepuracion: p.motivo });
          var n2 = await azEliminarDoc(d2, p.id);
          var nuevas = d2.rutas.filter(function (_, k) { return k !== p.idx; });
          var d2b = Object.assign({}, d2, { rutas: nuevas, resGen: resGen(nuevas) });
          await ref2.update({ rutas: nuevas, resGen: d2b.resGen, rutasOriginal: d2.rutas, editadoPor: quien, editadoEn: new Date().toISOString(), motivoEdicion: p.motivo, azOk: false });
          var m2 = await azInsertarDoc(d2b, p.id, ref2);
          hecho.push(p.motivo + ' · Azure −' + n2 + ' +' + m2);
        } else if (p.op === 'agregarRuta') {
          var d3 = docs[p.id], ref3 = C.doc(p.id);
          var n3 = await azEliminarDoc(d3, p.id);
          var r3 = (d3.rutas || []).concat([ruta(LOMA)]);
          var d3b = Object.assign({}, d3, { rutas: r3, resGen: resGen(r3) });
          await ref3.update({ rutas: r3, resGen: d3b.resGen, rutasOriginal: d3.rutas, restauradoDesde: 'Registros Evaluaciones ETI. (hoja de respaldo)', restauradoPor: quien, restauradoEn: new Date().toISOString(), azOk: false });
          var m3 = await azInsertarDoc(d3b, p.id, ref3);
          hecho.push(p.motivo + ' · Azure −' + n3 + ' +' + m3);
        } else if (p.op === 'crear') {
          var rutas = OBRERO_0710.map(ruta), ref4 = C.doc();
          var payload = { emp: 'RAPEL S.A.C.', sup: 'Alex Zapata Suarez', sector: 'Aproa', tipo: 'obrero', fecha: '2026-10-07', resGen: resGen(rutas),
            usuario: 'fzapata', nomUsuario: 'Alex Zapata Suarez', destiempo: null, modalidad: 'Manual', sesionQR: null, rutas: rutas,
            creadoEn: '2026-10-13T17:18:02.000Z', ts: Date.parse('2026-10-13T17:18:02.000Z'),
            restauradoDesde: 'Registros Evaluaciones ETI. (hoja de respaldo, registrado 13/10/2026 12:18 por Alex Zapata Suarez)', supOriginalHoja: 'Joel Timoteo Gonza',
            restauradoPor: quien, restauradoEn: new Date().toISOString(), azOk: false };
          await ref4.set(payload);
          var m4 = await azInsertarDoc(payload, ref4.id, ref4);
          hecho.push(p.motivo + ' · Azure +' + m4 + ' (id ' + ref4.id + ')');
        }
      } catch (e) { hecho.push('ERROR en "' + p.motivo + '": ' + e.message); console.error(e); }
    }
    console.log('Resultado:\n· ' + hecho.join('\n· '));
    return { aplicado: true, resultado: hecho };
  };
})();
