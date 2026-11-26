/* ═══════════════════════════════════════════════════════════════════════════
   23-pantallas-rrll-v1.js — _EV_PANTALLAS_V1 (25-nov-2026, decision de Joel)
   "Todo modulo se designa desde Acceso a Modulos del Sistema RR.LL."
   Cada pantalla de Evaluaciones ETI tiene su casilla (claves ev_p_<pantalla>). El servidor
   (auth/sso, accion sesion) dice cuales estan APAGADAS para el usuario y aqui se ocultan del
   menu; si alguien esta en una pantalla apagada se le lleva a la primera que si tiene.
   - Las casillas solo QUITAN: lo que el rol (o los Accesos internos del creador) no muestra sigue sin mostrarse.
   - Sin casilla guardada la pantalla sigue como siempre (nadie pierde nada).
   - El creador (jtimoteo) nunca se restringe. Banco de Preguntas y Accesos (solo creador) no tienen casilla.
   - Si el servidor no responde, o la sesion no trae token del RR.LL., no se oculta nada.
   Apagar en un navegador: localStorage.ev_pantallas = 'off'
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window._EV_PANTALLAS_V1) return; window._EV_PANTALLAS_V1 = true;
  var API = 'https://exdjzbfinppzatjyimxn.supabase.co/functions/v1/api/auth/sso?forceFunctionRegion=sa-east-1';
  /* pantalla -> entradas del menu (administrador: botones #atabN; supervisor: .es-it[data-k]) */
  var SEL = {
    estadisticas: ['#atab1'],
    indicadores:  ['#atab12', '.es-it[data-k="ind"]', '.es-it[data-k="dash"]'],
    trafico:      ['#atab13'],
    evaluar:      ['#atab4', '.es-it[data-k="eval"]'],
    qr:           ['#atab9', '.es-it[data-k="qr"]'],
    encuesta:     ['#enc-menu'],
    mis:          ['.es-it[data-k="mis"]', '.es-it[data-k="ult"]'],
    cumplimiento: ['#atab8'],
    alertas:      ['#alr-menu'],
    conectados:   ['#atab7'],
    informes:     ['#ci-menu'],
    usuarios:     ['#atab2']
  };
  /* claves de los Accesos internos (etiTieneAcceso) que dependen de una casilla */
  var INTERNO = { eval: 'evaluar', qr: 'qr', dash: 'indicadores', ind: 'indicadores', ult: 'mis' };
  var cerradas = {}, tkVisto = '', pidiendo = false;
  function off() { try { return localStorage.getItem('ev_pantallas') === 'off'; } catch (e) { return false; } }
  function token() { try { return sessionStorage.getItem('eti_token') || ''; } catch (e) { return ''; } }
  function selectores() { var r = []; Object.keys(cerradas).forEach(function (k) { (SEL[k] || []).forEach(function (s) { r.push('#es-nav ' + s); }); }); return r; }
  function pintarCss() {
    var st = document.getElementById('evPantCss');
    if (!st) { st = document.createElement('style'); st.id = 'evPantCss'; (document.head || document.documentElement).appendChild(st); }
    var s = selectores(), t = s.length ? s.join(',') + '{display:none!important}' : '';
    if (st.textContent !== t) st.textContent = t;
  }
  function visible(b) { try { return !!b && b.offsetParent !== null && getComputedStyle(b).display !== 'none'; } catch (e) { return false; } }
  function vigilar() {
    if (off() || !Object.keys(cerradas).length) return;
    var nav = document.getElementById('es-nav'); if (!nav) return;
    var s = selectores(), activo = null;
    s.forEach(function (q) { Array.prototype.forEach.call(document.querySelectorAll(q), function (b) { if (b.classList.contains('on') || /\bbpri\b/.test(b.className)) activo = b; }); });
    if (!activo) return;
    var otra = Array.prototype.filter.call(nav.querySelectorAll('button'), function (b) { return visible(b) && !b.classList.contains('es-sec') && s.every(function (q) { return !b.matches(q.replace('#es-nav ', '')); }); })[0];
    if (otra) { try { otra.click(); } catch (e) {} }
  }
  /* los Accesos internos tambien respetan las casillas (botones que se arman despues) */
  function envolver() {
    var f = window.etiTieneAcceso;
    if (typeof f !== 'function' || f._evPant) return;
    var g = function (k) { if (!off() && INTERNO[k] && cerradas[INTERNO[k]]) return false; return f.apply(this, arguments); };
    g._evPant = true; window.etiTieneAcceso = g;
  }
  function consultar() {
    envolver();
    if (off()) { if (Object.keys(cerradas).length) { cerradas = {}; pintarCss(); } return; }
    var tk = token();
    if (!tk) { if (tkVisto) { tkVisto = ''; cerradas = {}; pintarCss(); } return; }
    if (tk === tkVisto || pidiendo) return;
    pidiendo = true;
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'sesion', token: tk }) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        pidiendo = false; tkVisto = tk;
        var u = j && j.success && j.user ? j.user : null;
        var p = u && u.accesos && u.accesos.ev && u.accesos.ev.pantallas;
        var c = {};
        if (p && String(u.usuario || '').toLowerCase() !== 'jtimoteo') Object.keys(SEL).forEach(function (k) { if (p[k] === false) c[k] = true; });
        cerradas = c; pintarCss(); vigilar();
        if (Object.keys(c).length) console.log('[_EV_PANTALLAS_V1] pantallas apagadas en Acceso a Modulos: ' + Object.keys(c).join(', '));
      })
      .catch(function () { pidiendo = false; });   /* sin respuesta: no se oculta nada y se reintenta */
  }
  setInterval(function () { consultar(); vigilar(); }, 1200);
  consultar();
  window._evPantallas = { cerradas: function () { return Object.keys(cerradas); } };
})();
