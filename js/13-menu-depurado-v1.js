/* ═════════════════════════════════════════════════════════════════════════
   _MENU_DEPURADO_V1 (03-nov-2026) — Menú de Evaluaciones ETI sin entradas repetidas
   SOLO PRESENTACIÓN: oculta en el menú lateral las entradas que muestran lo mismo que otra.
   No borra pantallas, funciones ni datos; todo sigue funcionando por dentro.
     Administrador: Mi Dashboard (mismo panel que Indicadores) · Registros (misma lista que
       Evaluaciones por supervisor; su botón "Excel Global" se agrega ahí) · Programación (ETI)
       (el cronograma oficial es Programación ETI del Sistema RR.LL.).
     Supervisor: Dashboard (mismo panel que Indicadores) · Último Reporte (está en Mis evaluaciones).
   Se mantienen: Estadísticas (pantalla de inicio), Indicadores, Tráfico en vivo, Nueva Evaluación,
   Evaluaciones por supervisor, Cumplimiento, Conectados, Usuarios, Evaluación QR, Banco y Accesos.
   INTERRUPTOR (vuelve al menú completo): localStorage.setItem('eti_menu_completo','on') y recargar.
   ═════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window._MENU_DEPURADO_V1) return; window._MENU_DEPURADO_V1 = true;
  try { if (localStorage.getItem('eti_menu_completo') === 'on') { console.log('[_MENU_DEPURADO_V1] menú completo (interruptor eti_menu_completo=on)'); return; } } catch (e) {}
  var css = 'body.eti-md #es-nav #atab5,body.eti-md #es-nav #atab3,body.eti-md #es-nav #atab6{display:none!important}' +
    'body.eti-md #es-nav .es-it[data-k="dash"],body.eti-md #es-nav .es-it[data-k="ult"]{display:none!important}';
  function iniciar() {
    var st = document.createElement('style'); st.id = 'etiMenuDepCss'; st.textContent = css; document.head.appendChild(st);
    document.body.classList.add('eti-md');
    try { new MutationObserver(excelGlobal).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    console.log('[_MENU_DEPURADO_V1] menú depurado activo (menú completo: localStorage eti_menu_completo=on)');
  }
  /* "Excel Global" (antes en Registros) dentro de Evaluaciones por supervisor, solo administrador */
  function excelGlobal() {
    try {
      if (typeof SESSION === 'undefined' || !SESSION || SESSION.rol !== 'admin' || typeof exportAdminExcel !== 'function') return;
      var box = document.getElementById('mis-box'); if (!box || document.getElementById('mdExcelG')) return;
      var fila = box.querySelector('input[type=date]'); fila = fila && fila.parentNode; if (!fila) return;
      var b = document.createElement('button'); b.id = 'mdExcelG'; b.type = 'button'; b.className = 'btn bout bsm'; b.textContent = 'Excel Global';
      b.title = 'Excel de todas las evaluaciones (el mismo de la antigua pestaña Registros)'; b.onclick = function () { exportAdminExcel(); };
      fila.appendChild(b);
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
