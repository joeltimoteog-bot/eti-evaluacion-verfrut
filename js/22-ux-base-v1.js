/* ════════════════════════════════════════════════════════════════════════════
   _UX_BASE_V1 (10-nov-2026) — Evaluaciones ETI · ventanas que no se cortan (solo CSS, no cambia logica)
   · Las ventanas de Encuesta, Alertas, Cierre de ciclo, Centro de informes e Informes ETI miden su alto con la
     pantalla REAL del celular (dvh): con la barra de direcciones visible, los botones de abajo quedaban fuera.
   · En celular (menos de 700 px) esas ventanas ocupan toda la pantalla y sus columnas fijas pasan al ancho completo.
   Apagar: localStorage.eti_ux_base = 'off' (y recargar).
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window._ETI_UX_BASE_V1) return; window._ETI_UX_BASE_V1 = true;
  try { if (localStorage.getItem('eti_ux_base') === 'off') return; } catch (e) {}
  var CAJAS = '.enc-box,.alr-box,.icc-box,.ci-box,.inf-box';
  var css = [
    '@supports (height:1dvh){.enc-box,.alr-box,.icc-box{height:92dvh!important;max-height:92dvh!important}.ci-box{height:94dvh!important;max-height:94dvh!important}.inf-box{max-height:92dvh!important}}',
    '@media (max-width:700px){',
    '  :has(> .enc-box),:has(> .alr-box),:has(> .icc-box),:has(> .ci-box),:has(> .inf-box){padding:0!important}',
    '  ' + CAJAS + '{max-width:100%!important;width:100%!important;border-radius:0!important}',
    '  .enc-box,.alr-box,.icc-box,.ci-box{height:100vh!important;max-height:100vh!important}',
    '  .inf-box{max-height:100vh!important}',
    '  .ci-hd{flex-wrap:wrap}.ci-f{gap:.5rem}.ci-f > div{flex:1 1 140px}.ci-f select{width:100%}.ci-grid{grid-template-columns:1fr!important}',
    '}',
    '@supports (height:1dvh){@media (max-width:700px){.enc-box,.alr-box,.icc-box,.ci-box{height:100dvh!important;max-height:100dvh!important}.inf-box{max-height:100dvh!important}}}'
  ].join('\n');
  var st = document.createElement('style'); st.id = 'eti-ux-base-v1'; st.textContent = css; document.head.appendChild(st);
})();
