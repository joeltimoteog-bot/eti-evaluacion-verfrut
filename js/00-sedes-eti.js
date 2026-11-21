/* ═══════════════════════════════════════════════════════════════════════════
   00-sedes-eti.js — _ETI_SEDES_V1 (21-nov-2026, decision de Joel)
   Fuente UNICA de sedes, sectores y razones sociales de Evaluaciones ETI (antes repetidos a mano en varios archivos).
   · Sede Piura: los 10 sectores de siempre (RAPEL / VERFRUT).  · Sede Olmos: sus 5 empresas, cada una es un sector.
   · Cada usuario trabaja con los sectores de su sede; jtimoteo y lcastillo (programan las dos sedes) ven ambas.
   · La sede del usuario la entrega el Sistema RR.LL. en el pase de ingreso (empresa del usuario).
   · Mismo cuestionario y mismos temas para las dos sedes: el banco de preguntas no cambia.
   · Lefkada: razon social PENDIENTE de confirmar -> razonDe() devuelve '' y los informes no deben emitirse a su nombre.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var PIURA = ['San Vicente', 'Algarrobos', 'Punta Arenas', 'Planta Rapel', 'El Papayo', 'Limones', 'Olivares Bajo', 'Los Olivares', 'Aproa', 'Santa Rosa'];
  var OLMOS = ['Bomarea', 'Pirona', 'Mosqueta', 'Hefei', 'Lefkada'];
  var RAZON = {
    RAPEL: 'Sociedad Agrícola Rapel S.A.C.', VERFRUT: 'Sociedad Exportadora Verfrut S.A.C.',
    BOMAREA: 'Bomarea S.R.L.', PIRONA: 'Inversiones Pirona S.A.C.', MOSQUETA: 'Inversiones Mosqueta S.A.C.', HEFEI: 'Inversiones Hefei S.A.C.'
    /* LEFKADA: pendiente de confirmar por Joel */
  };
  var VEN_AMBAS = ['jtimoteo', 'lcastillo'];
  function N(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase(); }
  function usuario() { try { return String((JSON.parse(sessionStorage.getItem('eti_session') || '{}') || {}).user || '').toLowerCase().trim(); } catch (e) { return ''; } }
  /* 'PIURA' | 'OLMOS' | 'AMBAS' */
  function sede() {
    try { if (VEN_AMBAS.indexOf(usuario()) >= 0) return 'AMBAS'; return sessionStorage.getItem('eti_sede') === 'OLMOS' ? 'OLMOS' : 'PIURA'; } catch (e) { return 'PIURA'; }
  }
  function sedeDeEmpresa(emp) { var e = N(emp); return (e.indexOf('OLMOS') >= 0 || OLMOS.some(function (x) { return e.indexOf(N(x)) >= 0; })) ? 'OLMOS' : 'PIURA'; }
  function guardarSedeDeEmpresa(emp) { try { sessionStorage.setItem('eti_sede', sedeDeEmpresa(emp)); } catch (e) {} }
  function sectores(s) { s = s || sede(); return s === 'OLMOS' ? OLMOS.slice() : (s === 'AMBAS' ? PIURA.concat(OLMOS) : PIURA.slice()); }
  function esOlmos(sector) { var k = N(sector); return OLMOS.some(function (x) { return N(x) === k; }); }
  /* cambia el CONTENIDO de una lista ya existente (p. ej. SECTORES_TODOS), sin reemplazar la variable */
  function aplicar(lista) { if (!Array.isArray(lista)) return lista; var n = sectores(); lista.length = 0; n.forEach(function (x) { lista.push(x); }); return lista; }
  /* razon social por empresa (RAPEL, VERFRUT, BOMAREA...) o por sector de Olmos; '' si no se conoce */
  function razonDe(empresaOSector) {
    var k = N(empresaOSector); if (!k) return '';
    var claves = Object.keys(RAZON);
    for (var i = 0; i < claves.length; i++) if (k.indexOf(claves[i]) >= 0) return RAZON[claves[i]];
    return '';
  }
  /* _ETI_EMP_OLMOS_V1 (21-nov-2026): en Olmos cada empresa es un sector -> la empresa de la evaluacion sale del sector.
     Se usa la razon social; Lefkada va con su nombre hasta que Joel confirme la razon social. */
  var EMP_PIURA = ['VERFRUT S.A.C.', 'RAPEL S.A.C.'];
  function empresaDeSector(sector) { var k = N(sector), x = OLMOS.filter(function (o) { return N(o) === k; })[0]; return x ? (RAZON[N(x)] || x) : ''; }
  function empresas(s) { s = s || sede(); var o = OLMOS.map(empresaDeSector); return s === 'OLMOS' ? o : (s === 'AMBAS' ? EMP_PIURA.concat(o) : EMP_PIURA.slice()); }
  function esEmpresaOlmos(emp) { var k = N(emp); return !!k && OLMOS.some(function (x) { return k.indexOf(N(x)) >= 0; }); }
  /* _ETI_SEDE_TODO_V1 (21-nov-2026): lo que necesitan informes, filtros e indicadores para separar Piura / Olmos.
     claveDe: 'MOSQUETA' para un sector o empresa de Olmos ('' si es de Piura) · clavesEmp: claves cortas de empresa por sede
     razonInforme: razon social para la cabecera de un informe (la de Olmos si corresponde; si no, la que ya calculaba el informe)
     sectoresInforme: lista de sectores de un informe segun la sede del usuario · visible: si un registro es de la sede del usuario */
  function claveDe(x) { var k = N(x); if (!k) return ''; for (var i = 0; i < OLMOS.length; i++) if (k.indexOf(N(OLMOS[i])) >= 0) return N(OLMOS[i]); return ''; }
  function clavesEmp(s) { s = s || sede(); var o = OLMOS.map(N), p = ['VERFRUT', 'RAPEL']; return s === 'OLMOS' ? o : (s === 'AMBAS' ? p.concat(o) : p); }
  function razonInforme(x, porDefecto) { var c = claveDe(x); if (!c) return porDefecto; return RAZON[c] || (OLMOS.filter(function (o) { return N(o) === c; })[0] + ' (razón social por confirmar)'); }
  function sectoresInforme(base) { var s = sede(); base = (base || PIURA).slice(); return s === 'OLMOS' ? OLMOS.slice() : (s === 'AMBAS' ? base.concat(OLMOS) : base); }
  function visible(sector, emp) { var s = sede(); if (s === 'AMBAS') return true; var ol = !!(claveDe(sector) || claveDe(emp)); return s === 'OLMOS' ? ol : !ol; }
  window.ETI_SEDES = { PIURA: PIURA.slice(), OLMOS: OLMOS.slice(), sede: sede, sectores: sectores, esOlmos: esOlmos, aplicar: aplicar, razonDe: razonDe, sedeDeEmpresa: sedeDeEmpresa, guardarSedeDeEmpresa: guardarSedeDeEmpresa, empresaDeSector: empresaDeSector, empresas: empresas, esEmpresaOlmos: esEmpresaOlmos, claveDe: claveDe, clavesEmp: clavesEmp, razonInforme: razonInforme, sectoresInforme: sectoresInforme, visible: visible };
  /* al cargar (sesion ya iniciada o recarga): la lista general toma los sectores de la sede del usuario */
  try { if (typeof SECTORES_TODOS !== 'undefined') aplicar(SECTORES_TODOS); } catch (e) {}
  try { console.log('[_ETI_SEDES_V1] sede: ' + sede() + ' · sectores: ' + sectores().length); } catch (e) {}
})();
