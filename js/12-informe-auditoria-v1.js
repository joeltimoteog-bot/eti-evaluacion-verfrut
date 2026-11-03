/* ═════════════════════════════════════════════════════════════════════════
   _INFORME_AUDITORIA_V1 (03-nov-2026) · v2 — Acceso al Reporte e Informe GH-04 para auditoría
   Botón "Informe para auditoría" (solo administrador) en Evaluaciones por supervisor.
   NO genera formatos propios: lista, para la empresa y el periodo elegidos, los supervisores y sectores
   con evaluaciones y abre el MISMO Reporte del sistema (_REPORTE_MIS_V1) en ese sector, desde donde se
   emiten con sus botones de siempre el Informe INF-SC-GH-04 (Word), el Excel, la impresión y el Check List.
   Así el informe y el reporte de auditoría tienen exactamente la misma estructura que los de hoy.
   Solo lee Firebase. No guarda nada.
   ═════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window._INFORME_AUDITORIA_V1) return; window._INFORME_AUDITORIA_V1 = true;
  var $ = function (id) { return document.getElementById(id); };
  var esAdmin = function () { try { return typeof SESSION !== 'undefined' && SESSION && SESSION.rol === 'admin'; } catch (e) { return false; } };
  var hoyI = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var fF = function (f) { f = String(f || ''); return f.length >= 10 ? f.slice(8, 10) + '/' + f.slice(5, 7) + '/' + f.slice(0, 4) : f; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var aviso = function (m, t) { try { if (typeof toast === 'function') return toast(m, t || 'i'); } catch (e) {} console.log(m); };

  /* supervisores × sectores con evaluaciones (manual y QR) en el periodo y empresa */
  async function grupos(o) {
    var f = fbdb, G = new Map();
    var add = function (x, n) { if (o.emp && x.emp !== o.emp) return; var k = (x.sup || '—') + '|' + (x.sector || '—'); var g = G.get(k) || { sup: x.sup || '—', sector: x.sector || '—', rutas: 0, n: 0, fechas: new Set() }; g.rutas++; g.n += n; g.fechas.add(x.fecha); G.set(k, g); };
    var qm = await f.collection(COL_EVAL).where('fecha', '>=', o.desde).where('fecha', '<=', o.hasta).get();
    qm.docs.forEach(function (d) { var x = d.data(); if (x.modalidad === 'QR') return; (x.rutas || []).forEach(function (r) { add(x, +r.ne || 1); }); });
    if (o.qr) { var qq = await f.collection('respuestas_qr').where('fecha', '>=', o.desde).where('fecha', '<=', o.hasta).get(); qq.docs.forEach(function (d) { add(d.data(), 1); }); }
    return [...G.values()].sort(function (a, b) { return a.sup.localeCompare(b.sup, 'es') || a.sector.localeCompare(b.sector, 'es'); });
  }

  /* abre el Reporte oficial del sistema para ese supervisor y sector, con el periodo y la empresa elegidos */
  async function abrirReporte(o, sup, sector) {
    var M = window.ETIMIS; if (!M) throw new Error('Módulo de evaluaciones no disponible');
    M.abrir(); await espera(150);
    M.filtro('emp', o.emp || ''); M.filtro('mod', o.qr ? '' : 'MANUAL'); M.filtro('tipo', '');
    M.rango(o.desde, o.hasta);
    M.sup('*');   /* vista de todos los supervisores en el rango (carga de Firebase) */
    var t0 = Date.now(); await espera(400);
    while (Date.now() - t0 < 20000) { var b = $('mis-box'); if (b && !/Cargando…/.test(b.textContent)) break; await espera(250); }
    M.reporteDe(sup); await espera(300);
    if (sector) M.rptSector(sector);
  }

  function abrir() {
    if (!esAdmin()) { aviso('Solo el administrador emite el informe para auditoría', 'e'); return; }
    var ov = $('iaOv'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'iaOv';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(15,39,72,.55);z-index:99990;display:flex;align-items:center;justify-content:center;padding:16px';
    var fl = 'display:block;font-size:11px;font-weight:700;color:#5B6B82;text-transform:uppercase;letter-spacing:.4px;margin:10px 0 5px';
    ov.innerHTML = '<div style="background:#fff;border-radius:8px;max-width:720px;width:100%;max-height:90vh;display:flex;flex-direction:column;font-family:Inter,Segoe UI,Arial,sans-serif;box-shadow:0 20px 50px rgba(15,39,72,.25)">' +
      '<div style="padding:14px 20px;background:#EDF1F6;border-bottom:1px solid #D6DEE9;border-radius:8px 8px 0 0;font-weight:700;color:#0F2748">Informe para auditoría</div>' +
      '<div style="padding:4px 20px 10px"><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">' +
      '<div style="flex:2;min-width:200px"><label style="' + fl + '">Empresa</label><select id="iaEmp" class="fc" style="width:100%"><option value="RAPEL S.A.C.">RAPEL S.A.C.</option><option value="VERFRUT S.A.C.">VERFRUT S.A.C.</option></select></div>' +
      '<div style="flex:1;min-width:130px"><label style="' + fl + '">Desde</label><input id="iaDes" type="date" class="fc" style="width:100%" value="2026-06-19"></div>' +
      '<div style="flex:1;min-width:130px"><label style="' + fl + '">Hasta</label><input id="iaHas" type="date" class="fc" style="width:100%" value="' + hoyI() + '"></div>' +
      '<button class="btn bpri" id="iaBus" style="height:38px">Buscar</button></div>' +
      '<label style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:13px;color:#1F2A3C"><input id="iaQr" type="checkbox"> Incluir evaluaciones por QR</label>' +
      '<div style="font-size:12px;color:#5B6B82;margin-top:8px">Se abre el Reporte del sistema del supervisor y sector elegidos. Desde él se emiten, con sus botones de siempre, el Informe INF-SC-GH-04 (Word), el Excel y la impresión, con la misma estructura de hoy.</div></div>' +
      '<div id="iaLista" style="overflow:auto;padding:0 20px 12px;flex:1"></div>' +
      '<div style="display:flex;justify-content:flex-end;padding:12px 20px;border-top:1px solid #D6DEE9;background:#F8FAFC;border-radius:0 0 8px 8px"><button class="btn bout" id="iaCan">Cerrar</button></div></div>';
    document.body.appendChild(ov);
    $('iaCan').onclick = function () { ov.remove(); };
    var opc = function () { return { emp: $('iaEmp').value, desde: $('iaDes').value, hasta: $('iaHas').value, qr: $('iaQr').checked }; };
    $('iaBus').onclick = async function () {
      var o = opc(), L = $('iaLista');
      if (!o.desde || !o.hasta || o.desde > o.hasta) { L.innerHTML = '<p style="color:#B42318">Revisa el periodo.</p>'; return; }
      L.innerHTML = '<p style="color:#5B6B82">Leyendo evaluaciones del sistema…</p>';
      try {
        var G = await grupos(o);
        if (!G.length) { L.innerHTML = '<p style="color:#5B6B82">No hay evaluaciones de ' + esc(o.emp) + ' en ese periodo.</p>'; return; }
        var th = 'background:#E6EBF2;color:#3D4C63;font-size:10.5px;text-transform:uppercase;letter-spacing:.4px;padding:8px;text-align:left;border-bottom:1px solid #D6DEE9';
        var td = 'padding:8px;border-bottom:1px solid #EEF1F5;font-size:13px';
        var nT = G.reduce(function (a, g) { return a + g.n; }, 0), rT = G.reduce(function (a, g) { return a + g.rutas; }, 0);
        L.innerHTML = '<div style="font-size:12.5px;color:#1F2A3C;margin:4px 0 8px"><b>' + esc(o.emp) + '</b> · ' + fF(o.desde) + ' al ' + fF(o.hasta) + ' · ' + G.length + ' supervisor(es)/sector(es) · ' + rT + ' rutas · ' + nT + ' evaluados</div>' +
          '<table style="width:100%;border-collapse:collapse"><thead><tr><th style="' + th + '">Supervisor</th><th style="' + th + '">Sector</th><th style="' + th + ';text-align:center">Fechas</th><th style="' + th + ';text-align:center">Rutas</th><th style="' + th + ';text-align:center">Evaluados</th><th style="' + th + '"></th></tr></thead><tbody>' +
          G.map(function (g, i) { return '<tr><td style="' + td + '">' + esc(g.sup) + '</td><td style="' + td + '">' + esc(g.sector) + '</td><td style="' + td + ';text-align:center">' + g.fechas.size + '</td><td style="' + td + ';text-align:center">' + g.rutas + '</td><td style="' + td + ';text-align:center">' + g.n + '</td><td style="' + td + ';text-align:right"><button class="btn bpri bsm" data-i="' + i + '">Abrir reporte</button></td></tr>'; }).join('') + '</tbody></table>';
        L.querySelectorAll('button[data-i]').forEach(function (b) { b.onclick = async function () { var g = G[+b.getAttribute('data-i')]; ov.remove(); aviso('Abriendo el reporte de ' + g.sup + ' · ' + g.sector + '…', 'i');
          try { await abrirReporte(o, g.sup, g.sector); } catch (e) { aviso('No se pudo abrir el reporte: ' + e.message, 'e'); } }; });
      } catch (e) { console.error(e); L.innerHTML = '<p style="color:#B42318">No se pudo leer: ' + esc(e.message) + '</p>'; }
    };
  }
  window.etiInformeAuditoria = abrir;
  function ponerBoton() {
    if (!esAdmin()) return; var box = $('mis-box'); if (!box || $('iaBtn')) return;
    var fila = box.querySelector('input[type=date]'); fila = fila && fila.parentNode; if (!fila) return;
    var b = document.createElement('button'); b.id = 'iaBtn'; b.className = 'btn bpri bsm'; b.type = 'button'; b.textContent = 'Informe para auditoría'; b.title = 'Reporte e Informe GH-04 del sistema, por empresa, supervisor y sector'; b.onclick = abrir;
    fila.appendChild(b);
  }
  try { new MutationObserver(function () { ponerBoton(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  setTimeout(ponerBoton, 1500);
})();
