/* ════════════════════════════════════════════════════════════════════════════
   _AVISO_REPROG_V1 (06-nov-2026) — Aviso "🔄 Fechas cambiadas" del Check List
   Si a un supervisor le reprogramaron una evaluación de CHECKLIST (desde la Programación ETI del
   Sistema RR.LL. o desde Capacitaciones ETI), al entrar a Evaluación ETI le sale una tarjeta con
   antes → después y el motivo, hasta que pulsa "Entendido" (reprogVistoEn en la programación;
   es el mismo campo que usa Capacitaciones ETI, asi lo ve una sola vez en los dos sistemas).
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.etiAvisoReprog) return;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var fF = function (f) { return f ? String(f).slice(0, 10).split('-').reverse().join('/') : ''; };
  var ses = function () { try { return typeof SESSION !== 'undefined' ? SESSION : null; } catch (e) { return null; } };
  var db = function () { try { return typeof fbdb !== 'undefined' && fbdb ? fbdb : null; } catch (e) { return null; } };
  function mio(p, s) {
    try { if (typeof _cumCoincide === 'function') return _cumCoincide(p.supervisor || '', s.nom || ''); } catch (e) {}
    return String(p.supervisor || '').trim().toUpperCase() === String(s.nom || '').trim().toUpperCase();
  }
  function sinVer(p) {
    var L = p.reprogramaciones || [], u = L[L.length - 1];
    if (!u || !u.fecha || p.estado === 'ejecutada') return null;
    if (p.reprogVistoEn && p.reprogVistoEn >= u.fecha) return null;
    if (Date.now() - new Date(u.fecha).getTime() > 30 * 86400000) return null;
    return u;
  }
  var hecho = false, unsub = null;
  function iniciar() {
    var s = ses(), d = db(); if (hecho || !s || !d || s.rol === 'admin') return; hecho = true;
    try {
      unsub = d.collection('programaciones_eti').where('tema', '==', 'EVALUACIONES DE CHECKLIST').onSnapshot(function (snap) {
        var L = []; snap.docs.forEach(function (x) { var p = x.data(); p.id = x.id; var u = sinVer(p); if (u && mio(p, s)) L.push({ p: p, u: u }); });
        pintar(L);
      }, function () {});
    } catch (e) { hecho = false; }
  }
  function pintar(L) {
    var box = $('avr-box'); if (!L.length) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement('div'); box.id = 'avr-box'; box.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147482000;max-width:420px;width:calc(100% - 32px);background:#FFF7ED;border:1.5px solid #FDBA74;border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,.25);padding:12px 14px;font-family:Barlow,Inter,"Segoe UI",sans-serif;color:#431407'; document.body.appendChild(box); }
    box.innerHTML = '<div style="font-weight:800;color:#9A3412;margin-bottom:6px">🔄 Te cambiaron las fechas de tu evaluación de Check List</div>' +
      L.map(function (x) { var p = x.p, u = x.u;
        return '<div style="padding:6px 0;border-top:1px dashed #FED7AA;font-size:13px"><b>' + esc(p.sector || '') + '</b><br>Antes: <s>' + (u.fechasAnterior || []).map(fF).join(', ') + '</s> → <b>Ahora: ' + (u.fechasNueva || p.fechas || []).map(fF).join(', ') + '</b>' +
          '<br><span style="color:#7C2D12">Motivo: ' + esc(u.motivo || '—') + (u.detalle ? ' — ' + esc(u.detalle) : '') + '</span>' +
          '<div style="text-align:right;margin-top:4px"><button data-id="' + esc(p.id) + '" data-f="' + esc(u.fecha) + '" style="border:0;background:#0E2A5C;color:#fff;border-radius:9px;padding:7px 12px;font-weight:800;cursor:pointer">✔ Entendido</button></div></div>'; }).join('');
    Array.prototype.forEach.call(box.querySelectorAll('button[data-id]'), function (b) {
      b.onclick = function () { b.disabled = true; db().collection('programaciones_eti').doc(b.getAttribute('data-id')).update({ reprogVistoEn: b.getAttribute('data-f') }).catch(function () { b.disabled = false; }); };
    });
  }
  window.etiAvisoReprog = { sinVer: sinVer, version: 1 };
  setInterval(iniciar, 2000); setTimeout(iniciar, 800);
})();
