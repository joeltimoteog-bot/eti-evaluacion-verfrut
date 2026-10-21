/* ═══════════════════════════════════════════════════════════════════════════
   _ETI_ALERTA_RUTA_V1 (20-oct-2026) — Alerta por ruta y tema al cerrar la sesión QR
   ---------------------------------------------------------------------------
   Al cerrar la sesión QR (qrCerrar), con el resultado que ya calculó el sistema:
     1) Avisa al usuario en pantalla qué rutas salieron observadas en qué tema
        (promedio de la ruta en el tema < 70 %) y que requieren reforzamiento.
     2) Pide al Apps Script del RR.LL. (acción etiAlertaRuta) que envíe UN correo automático
        a la jefatura y a Certificaciones (destinatarios fijos en el servidor).
   No guarda ni cambia datos. Si algo falla, el cierre de la sesión sigue igual.
   Para desactivar: quitar su <script> en index.html.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.etiAlertaRutas) return;
  var GAS = 'https://script.google.com/macros/s/AKfycbxZP3UGad-XwRl7sCYmTxeex57b1hEfmqslhe5x0IOzzvpbEbM4VYFR2d52b_YMB1lyyA/exec';
  var MIN = 0.70;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pct(v) { return Math.round((+v || 0) * 1000) / 10 + '%'; }
  function usuario() { try { return (typeof SESSION !== 'undefined' && SESSION && SESSION.user) || ''; } catch (e) { return ''; } }

  function mostrar(rutas, envio) {
    try {
      var obs = rutas.filter(function (r) { return r.malos.length || r.res < MIN; });
      var ok = rutas.filter(function (r) { return !(r.malos.length || r.res < MIN); });
      var old = document.getElementById('etiAlRuta'); if (old) old.remove();
      var ov = document.createElement('div'); ov.id = 'etiAlRuta';
      ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(5,12,30,.55);display:flex;align-items:center;justify-content:center;padding:16px';
      var color = obs.length ? '#b00020' : '#0b6b36';
      ov.innerHTML = '<div style="background:#fff;border-radius:14px;max-width:560px;width:100%;max-height:85vh;overflow:auto;box-shadow:0 24px 60px rgba(0,0,0,.35);font:14px/1.45 \'Segoe UI\',Arial,sans-serif;color:#14213d">' +
        '<div style="background:' + color + ';color:#fff;padding:14px 18px;border-radius:14px 14px 0 0;font-weight:800;font-size:16px">' +
        (obs.length ? '⚠️ Rutas en observación — se requiere reforzamiento' : '✅ Todas las rutas aprobaron') + '</div><div style="padding:14px 18px">' +
        (obs.length ? '<p style="margin:0 0 8px">Estas rutas no alcanzaron el <b>70 %</b> en los temas indicados:</p><ul style="margin:0 0 10px;padding-left:18px">' +
          obs.map(function (r) { return '<li><b>' + esc(r.nom) + (r.cod ? ' · Cód. ' + esc(r.cod) : '') + '</b>: ' + (r.malos.length ? r.malos.map(function (t) { return esc(t.nom) + ' (' + pct(t.pct) + ')'; }).join(', ') : 'resultado general ' + pct(r.res)) + '</li>'; }).join('') + '</ul>' : '<p style="margin:0 0 8px">Todas las rutas alcanzaron el 70 % en todos los temas.</p>') +
        (obs.length && ok.length ? '<p style="margin:0 0 6px;color:#0b6b36"><b>Aprobaron con éxito:</b> ' + ok.map(function (r) { return esc(r.nom); }).join(', ') + '</p>' : '') +
        '<p id="etiAlRutaEnv" style="margin:10px 0 0;font-size:12.5px;color:#5b6b85">' + esc(envio) + '</p>' +
        '<div style="text-align:right;margin-top:12px"><button type="button" style="background:#0b2a6f;color:#fff;border:0;border-radius:9px;padding:9px 18px;font-weight:700;cursor:pointer">Entendido</button></div></div></div>';
      ov.querySelector('button').onclick = function () { ov.remove(); };
      document.body.appendChild(ov);
    } catch (e) { console.warn('[_ETI_ALERTA_RUTA_V1] pantalla:', e); }
  }

  window.etiAlertaRutas = function (lista) {
    try {
      if (!Array.isArray(lista) || !lista.length) return;
      var rutas = [];
      lista.forEach(function (res) {
        (res.rutas || []).forEach(function (r) {
          var temas = (r.secs || []).map(function (x) { return { nom: x.nom, pct: +x.cum || 0 }; });
          rutas.push({ sector: res.sector, emp: res.emp, nom: r.nom, cod: r.cod, ne: r.ne || r.tot || 0, res: +r.resGrupo || 0, temas: temas,
            malos: temas.filter(function (t) { return t.pct < MIN; }) });
        });
      });
      if (!rutas.length) return;
      var cuerpo = { action: 'etiAlertaRuta', sesionQR: String(lista[0].sesionQR || ''), sup: String(lista[0].sup || ''), fecha: String(lista[0].fecha || ''), usuario: usuario(),
        rutas: rutas.map(function (r) { return { sector: r.sector, emp: r.emp, nom: r.nom, cod: r.cod, ne: r.ne, res: r.res, temas: r.temas }; }) };
      setTimeout(function () { mostrar(rutas, '📧 Enviando el aviso automático a la jefatura y a Certificaciones…'); }, 700);
      fetch(GAS, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(cuerpo) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var t = j && j.success ? '📧 Se notificó automáticamente a la jefatura y al área de Certificaciones.' : '⚠️ No se pudo enviar el aviso automático' + (j && j.error ? ': ' + j.error : '') + '. Informa al administrador.';
          setTimeout(function () { var el = document.getElementById('etiAlRutaEnv'); if (el) el.textContent = t; }, 800);
          console.log('[_ETI_ALERTA_RUTA_V1]', j);
        })
        .catch(function (e) {
          setTimeout(function () { var el = document.getElementById('etiAlRutaEnv'); if (el) el.textContent = '⚠️ No se pudo enviar el aviso automático (sin conexión). Informa al administrador.'; }, 800);
          console.warn('[_ETI_ALERTA_RUTA_V1]', e);
        });
    } catch (e) { console.warn('[_ETI_ALERTA_RUTA_V1]', e); }
  };
})();
