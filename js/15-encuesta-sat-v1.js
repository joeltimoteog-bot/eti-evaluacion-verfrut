/* ════════════════════════════════════════════════════════════════════════════
   _ENCUESTA_SAT_V1 (05-nov-2026) — Encuesta de satisfaccion de la capacitacion
   · Menu lateral "😊 Encuesta de satisfacción".
   · 📱 Generar QR: el supervisor crea el QR de su capacitacion (tema, fecha, sector) y lo muestra
     al personal; el trabajador responde en encuesta.html (anonima, 1 minuto, caras 😞…😄).
   · 🗂 Mis QR: abiertos/cerrados con el numero de respuestas; cerrar o reabrir.
   · 📊 Resultados: indices Capacitador · Material · Contenido · Logistica (0-100) por supervisor,
     tema y sector, distribucion por pregunta y comentarios. Cada supervisor ve los suyos;
     Joel Timoteo, Lucia Castillo y los administradores ven todos.
   Datos: Supabase eti.encuestas_qr / eti.encuestas_sat (las respuestas no se pueden editar).
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.etiEncuesta) return;
  var API = 'https://exdjzbfinppzatjyimxn.supabase.co/functions/v1/api/', REG = '?forceFunctionRegion=sa-east-1';
  var EDITORES = ['jtimoteo', 'lcastillo'];
  var SECT = ['San Vicente', 'Algarrobos', 'Punta Arenas', 'Planta Rapel', 'El Papayo', 'Limones', 'Olivares Bajo', 'Los Olivares', 'Aproa', 'Santa Rosa'];
  var TEMAS = ['Reforzamiento ETI', 'Código de ética y conducta', 'Canales de quejas y sugerencias', 'Libertad de asociación', 'No discriminación', 'Hostigamiento sexual',
    'Trabajo infantil y trabajo forzoso', 'Jornada y horas extra', 'Remuneraciones y beneficios', 'Salud y seguridad en el trabajo', 'Bienestar social', 'Legislación laboral'];
  var PREG = [
    ['p1', '¿Entendiste lo que explicó el capacitador?', 'Capacitador'], ['p2', '¿Explicó con palabras sencillas y ejemplos?', 'Capacitador'],
    ['p3', '¿Respondió las preguntas con respeto y paciencia?', 'Interacción'], ['p4b', '¿El material ayudó a entender?', 'Material'],
    ['p5', '¿El tema es útil para su trabajo?', 'Contenido'], ['p8', '¿Lugar y hora cómodos?', 'Logística'], ['p9', '¿Recomendaría la charla?', 'General']];
  var CARAS = ['😞', '🙁', '😐', '🙂', '😄'];

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var ses = function () { try { return typeof SESSION !== 'undefined' ? SESSION : null; } catch (e) { return null; } };
  var aviso = function (m, t) { try { if (typeof toast === 'function') toast(m, t || 'i'); } catch (e) {} };
  var fF = function (f) { return f ? String(f).slice(0, 10).split('-').reverse().join('/') : '—'; };
  var hoy = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var masDias = function (f, n) { var p = f.split('-').map(Number), d = new Date(p[0], p[1] - 1, p[2] + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  function token() { try { return sessionStorage.getItem('eti_token') || ''; } catch (e) { return ''; } }
  function esEditor() { var s = ses(); return !!s && (s.rol === 'admin' || EDITORES.indexOf(String(s.user || '').toLowerCase()) >= 0); }
  /* _ENCUESTA_SOLO_EDITORES_V1 (13-nov-2026): el QR de la encuesta lo generan solo Joel y Lucia Castillo (eligen al capacitador);
     el supervisor lo recibe en "Mis QR" y ve sus Resultados. */
  function puedeGenerar() { var s = ses(); return !!s && EDITORES.indexOf(String(s.user || '').toLowerCase()) >= 0; }
  function post(ruta, cuerpo) {
    var h = { 'Content-Type': 'application/json' }, t = token(); if (t) h.Authorization = 'Bearer ' + t;
    return fetch(API + ruta + REG, { method: 'POST', headers: h, body: JSON.stringify(cuerpo) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.success) throw new Error((j && j.error) || ('HTTP ' + r.status)); return j; });
    });
  }
  function consultar(col, filtros) { return post('eti/consultar', { col: col, filtros: filtros || [], limite: 20000 }).then(function (j) { return (j.docs || []).map(function (d) { return Object.assign({ _id: d.id }, d.datos); }); }); }
  function sups() { try { return (typeof SUPERVISORES !== 'undefined' ? SUPERVISORES : []).filter(function (s) { return !/admin/i.test(s.rol); }); } catch (e) { return []; } }
  function supDe(nom) { return sups().find(function (s) { return s.nom === nom; }); }
  function userDe(nom) { try { if (typeof userDeSup === 'function') return userDeSup(nom) || ''; } catch (e) {} return ''; }
  function urlEnc(id, previa) { var u = new URL('encuesta.html', location.href); u.hash = ''; u.search = '?s=' + id + (previa ? '&vista=1' : ''); return u.href; }
  function idNuevo() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = 'E'; for (var i = 0; i < 7; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }

  /* ── indices 0-100 ── */
  var e100 = function (n) { return n >= 1 && n <= 5 ? (n - 1) * 25 : null; };
  var prom = function (a) { a = a.filter(function (x) { return x !== null && x !== undefined && !isNaN(x); }); return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : null; };
  function indices(r) {
    var cap = prom([e100(r.p1), e100(r.p2), e100(r.p3)]), mat = r.p4 === 'si' ? e100(r.p4b) : (r.p4 === 'no' ? 0 : null);
    var cont = prom([e100(r.p5), r.p6 === 'si' ? 100 : r.p6 === 'nose' ? 50 : r.p6 === 'no' ? 0 : null]);
    var log = prom([r.p7 ? (r.p7 === 'adecuado' ? 100 : 50) : null, e100(r.p8)]);
    return { cap: cap, mat: mat, cont: cont, log: log, gen: prom([cap, mat, cont, log, e100(r.p9)]) };
  }
  function resumen(L) {
    var I = L.map(indices), k = function (c) { return prom(I.map(function (x) { return x[c]; })); };
    var pct = function (f) { var v = L.filter(function (r) { return f(r) !== null; }); return v.length ? v.filter(function (r) { return f(r); }).length / v.length * 100 : null; };
    return { n: L.length, gen: k('gen'), cap: k('cap'), mat: k('mat'), cont: k('cont'), log: k('log'),
      usoMat: pct(function (r) { return r.p4 ? r.p4 === 'si' : null; }), canal: pct(function (r) { return r.p6 ? r.p6 === 'si' : null; }), tiempo: pct(function (r) { return r.p7 ? r.p7 === 'adecuado' : null; }) };
  }
  var color = function (v) { return v === null ? '#94A3B8' : v >= 80 ? '#15803D' : v >= 60 ? '#B45309' : '#B91C1C'; };
  var fondo = function (v) { return v === null ? '#F1F5F9' : v >= 80 ? '#DCFCE7' : v >= 60 ? '#FEF3C7' : '#FEE2E2'; };
  var num = function (v) { return v === null ? '—' : Math.round(v); };
  var chip = function (v) { return '<span style="display:inline-block;min-width:44px;text-align:center;font-weight:800;border-radius:999px;padding:.12rem .5rem;background:' + fondo(v) + ';color:' + color(v) + '">' + num(v) + '</span>'; };

  /* ── estilos y ventana ── */
  function css() {
    if ($('enc-css')) return;
    var st = document.createElement('style'); st.id = 'enc-css';
    st.textContent = [
      '.enc-ov{position:fixed;inset:0;background:rgba(10,20,40,.55);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:1rem}',
      '.enc-box{background:#fff;border-radius:16px;max-width:1120px;width:100%;height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:Barlow,Inter,"Segoe UI",sans-serif;color:#0F172A}',
      '.enc-hd{padding:1rem 1.2rem .2rem;display:flex;justify-content:space-between;align-items:flex-start;gap:.8rem}',
      '.enc-hd b{font-size:1.15rem;color:#0E2A5C}.enc-hd small{display:block;color:#5B6B82;font-size:.82rem;margin-top:.2rem}',
      '.enc-tabs{display:flex;gap:.3rem;padding:.4rem 1.2rem 0;border-bottom:1px solid #E2E8F0;overflow-x:auto}',
      '.enc-tab{border:0;background:none;padding:.65rem .9rem;font:700 .92rem Barlow,sans-serif;color:#64748B;border-bottom:3px solid transparent;cursor:pointer;white-space:nowrap}',
      '.enc-tab.on{color:#0E2A5C;border-bottom-color:#C8102E}',
      '.enc-bd{padding:1rem 1.2rem;overflow:auto;flex:1}',
      '.enc-b{min-height:40px;padding:0 14px;border-radius:10px;border:1.5px solid #C7D2E6;background:#fff;font:800 .9rem Barlow,sans-serif;color:#0E2A5C;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem;text-decoration:none}',
      '.enc-b.p{background:#0E2A5C;border-color:#0E2A5C;color:#fff}.enc-b.r{color:#B91C1C;border-color:#FECACA}',
      '.enc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.7rem}',
      '.enc-f label{display:block;font-size:.78rem;font-weight:700;color:#475569;margin:0 0 .25rem}',
      '.enc-f input,.enc-f select{width:100%;min-height:40px;padding:0 10px;border:1.5px solid #C7D2E6;border-radius:9px;font:600 .95rem Barlow,sans-serif;background:#fff;box-sizing:border-box}',
      '.enc-kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.6rem;margin:.8rem 0}',
      '.enc-kpi div{border-radius:12px;padding:.7rem .8rem;border:1px solid #E2E8F0}',
      '.enc-kpi span{display:block;font-size:.74rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.03em}',
      '.enc-kpi b{display:block;font-size:1.7rem;line-height:1.15;margin-top:.15rem}',
      '.enc-kpi small{font-size:.74rem;color:#64748B}',
      '.enc-tab2{width:100%;border-collapse:collapse;font-size:.86rem;margin:.4rem 0 1rem}',
      '.enc-tab2 th{background:#F8FAFC;color:#475569;text-align:left;padding:.5rem .55rem;border-bottom:1px solid #E2E8F0;font-size:.75rem;white-space:nowrap}',
      '.enc-tab2 td{padding:.5rem .55rem;border-bottom:1px solid #EEF2F6;vertical-align:middle}',
      '.enc-h3{font-size:1rem;color:#0E2A5C;margin:1.1rem 0 .3rem;font-weight:800}',
      '.enc-dist{display:flex;height:22px;border-radius:7px;overflow:hidden;min-width:180px;background:#F1F5F9}',
      '.enc-dist i{display:block;height:100%}',
      '.enc-qr{display:flex;gap:1.2rem;flex-wrap:wrap;align-items:flex-start;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:1rem;margin-top:1rem}',
      '.enc-qr .q{background:#fff;padding:10px;border-radius:12px;border:1px solid #E2E8F0}',
      '.enc-qr .q img{display:block;width:250px;height:250px;image-rendering:pixelated}',
      '.enc-com{border:1px solid #E2E8F0;border-radius:10px;padding:.6rem .8rem;margin-bottom:.5rem;font-size:.9rem}',
      '.enc-com small{display:block;color:#64748B;font-size:.75rem;margin-bottom:.2rem}',
      '.enc-vacio{padding:1.5rem;text-align:center;color:#64748B;background:#F8FAFC;border-radius:12px}',
      '@media print{body *{visibility:hidden}#enc-print,#enc-print *{visibility:visible}#enc-print{position:fixed;inset:0;background:#fff;display:flex!important;flex-direction:column;align-items:center;justify-content:center;font-family:Barlow,sans-serif}}'
    ].join('\n');
    document.head.appendChild(st);
  }
  var M = null, timer = null;
  function abrir(tab) {
    css(); cerrar();
    M = document.createElement('div'); M.className = 'enc-ov';
    M.innerHTML = '<div class="enc-box" role="dialog" aria-modal="true"><div class="enc-hd"><div><b>😊 Encuesta de satisfacción de la capacitación</b><small>El personal capacitado califica la charla escaneando un QR · anónima · 1 minuto</small></div><button class="enc-b" id="enc-x" aria-label="Cerrar">✕</button></div>' +
      '<div class="enc-tabs">' + (puedeGenerar() ? '<button class="enc-tab" data-t="qr">📱 Generar QR</button>' : '') + '<button class="enc-tab" data-t="mis">🗂 ' + (esEditor() ? 'QR emitidos' : 'Mis QR') + '</button><button class="enc-tab" data-t="res">📊 Resultados</button></div><div class="enc-bd" id="enc-bd"></div></div>';
    document.body.appendChild(M);
    $('enc-x').onclick = cerrar;
    Array.prototype.forEach.call(M.querySelectorAll('.enc-tab'), function (b) { b.onclick = function () { ir(b.getAttribute('data-t')); }; });
    if (!puedeGenerar() && (!tab || tab === 'qr')) tab = 'mis';   /* _ENCUESTA_SOLO_EDITORES_V1 */
    ir(tab || 'qr');
  }
  function cerrar() { if (timer) { clearInterval(timer); timer = null; } if (M) { M.remove(); M = null; } }
  function ir(t) {
    if (timer) { clearInterval(timer); timer = null; }
    Array.prototype.forEach.call(M.querySelectorAll('.enc-tab'), function (b) { b.classList.toggle('on', b.getAttribute('data-t') === t); });
    if (t === 'qr') formQR(); else if (t === 'mis') misQR(); else resultados();
  }

  /* ── 1) Generar QR ── */
  function formQR() {
    if (!puedeGenerar()) { ir('mis'); return; }   /* _ENCUESTA_SOLO_EDITORES_V1 */
    var s = ses() || {}, adm = esEditor(), yo = supDe(s.nom);
    var supOps = adm ? sups() : [];
    $('enc-bd').innerHTML = '<div class="enc-grid enc-f">' +
      '<div><label>Empresa</label><select id="enc-emp"><option>VERFRUT</option><option>RAPEL</option></select></div>' +
      '<div><label>Capacitador (supervisor)</label>' + (adm ? '<select id="enc-sup"><option value="' + esc(s.nom || '') + '">' + esc(s.nom || '') + ' (yo)</option>' + supOps.map(function (x) { return '<option>' + esc(x.nom) + '</option>'; }).join('') + '</select>' : '<input id="enc-sup" value="' + esc(s.nom || '') + '" readonly>') + '</div>' +
      '<div style="grid-column:1/-1"><label>Tema de la capacitación</label><input id="enc-tema" list="enc-temas" placeholder="Ej. Reforzamiento ETI: canales de quejas" autocomplete="off"><datalist id="enc-temas">' + TEMAS.map(function (t) { return '<option value="' + esc(t) + '">'; }).join('') + '</datalist></div>' +
      '<div><label>Fecha de la capacitación</label><input id="enc-fecha" type="date" value="' + hoy() + '"></div>' +
      '<div><label>Sector</label><select id="enc-sec"></select></div>' +
      '<div><label>El QR recibe respuestas</label><select id="enc-vig"><option value="0">Solo hoy (hasta las 23:59)</option><option value="2">3 días</option><option value="6">1 semana</option></select></div>' +
      '</div><div style="margin-top:1rem;display:flex;gap:.5rem;flex-wrap:wrap"><button class="enc-b p" id="enc-crear">📱 Generar QR de la encuesta</button><a class="enc-b" href="' + esc(urlEnc('DEMO', true)) + '" target="_blank" rel="noopener" id="enc-demo">👁 Ver cómo la ve el trabajador</a></div><div id="enc-qrout"></div>';
    function sectores() {
      var d = supDe($('enc-sup').value), ops = SECT;
      if (d && d.multiSector && d.sectores) ops = d.sectores; else if (d && d.sector && !d.reemplazante) ops = [d.sector];
      $('enc-sec').innerHTML = (ops.length > 1 ? '<option value="">— Varios (el trabajador elige) —</option>' : '') + ops.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
    }
    sectores(); $('enc-sup').onchange = sectores;
    $('enc-demo').style.display = 'none';
    $('enc-crear').onclick = crearQR;
  }
  async function crearQR() {
    if (!puedeGenerar()) { aviso('Solo la Coordinación y la Analista de Gestión Humana generan el QR de la encuesta', 'e'); return; }   /* _ENCUESTA_SOLO_EDITORES_V1 */
    var s = ses() || {}, v = function (id) { return String(($(id) || {}).value || '').trim(); };
    var d = { emp: v('enc-emp'), sup: v('enc-sup'), tema: v('enc-tema'), fecha: v('enc-fecha'), sector: v('enc-sec') };
    if (d.tema.length < 4) { aviso('Escribe el tema de la capacitación', 'e'); $('enc-tema').focus(); return; }
    if (!d.fecha) { aviso('Elige la fecha', 'e'); return; }
    var fin = masDias(hoy() > d.fecha ? hoy() : d.fecha, +v('enc-vig') || 0).split('-').map(Number);
    var id = idNuevo(), b = $('enc-crear'); b.disabled = true; b.textContent = '⏳ Generando…';
    var doc = Object.assign(d, { id: id, usuario: d.sup === s.nom ? s.user : (userDe(d.sup) || ''), creadoPor: s.user, nomCreador: s.nom, estado: 'abierta',
      expira: new Date(fin[0], fin[1] - 1, fin[2], 23, 59, 59).getTime(), ts: Date.now(), creadoEn: new Date().toISOString() });
    try { await post('eti/escribir', { ops: [{ col: 'encuestas_qr', id: id, op: 'set', datos: doc, origen: 'encuesta' }] }); mostrarQR(doc); aviso('✅ QR de la encuesta generado', 's'); }
    catch (e) { aviso('No se pudo generar: ' + e.message, 'e'); }
    finally { b.disabled = false; b.textContent = '📱 Generar QR de la encuesta'; }
  }
  function imgQR(txt) {
    if (typeof qrcode !== 'function') return '<div class="enc-vacio">No se pudo cargar el generador de QR.<br><small>' + esc(txt) + '</small></div>';
    var q = qrcode(0, 'M'); q.addData(txt); q.make(); return q.createImgTag(8, 8);
  }
  function mostrarQR(doc) {
    var u = urlEnc(doc.id), out = $('enc-qrout') || $('enc-bd');
    out.innerHTML = '<div class="enc-qr"><div class="q">' + imgQR(u) + '</div><div style="flex:1;min-width:240px">' +
      '<div style="font-size:.78rem;font-weight:700;color:#475569">QR ' + esc(doc.id) + ' · ' + esc(doc.emp) + '</div><div style="font-size:1.25rem;font-weight:800;color:#0E2A5C;margin:.2rem 0">' + esc(doc.tema) + '</div>' +
      '<div style="color:#475569;font-size:.9rem">👤 ' + esc(doc.sup) + ' · 📅 ' + esc(fF(doc.fecha)) + (doc.sector ? ' · 📍 ' + esc(doc.sector) : '') + '<br>⏱ Recibe respuestas hasta el ' + esc(new Date(doc.expira).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })) + '</div>' +
      '<div id="enc-cont" style="margin:.8rem 0;font-size:1.05rem;font-weight:800;color:#15803D">✅ 0 respuestas</div>' +
      '<div style="display:flex;gap:.45rem;flex-wrap:wrap"><button class="enc-b p" id="enc-imp">🖨 Imprimir / pantalla completa</button><a class="enc-b" href="' + esc(urlEnc(doc.id, true)) + '" target="_blank" rel="noopener">👁 Vista previa</a>' +
      '<button class="enc-b" id="enc-cop">🔗 Copiar enlace</button><button class="enc-b r" id="enc-cer">⏹ Cerrar encuesta</button></div>' +
      '<p style="font-size:.82rem;color:#64748B;margin:.8rem 0 0">💡 Al terminar la charla, muestra este QR. Si alguien no tiene celular, puede responder en el tuyo: al final toca <b>"Va a responder otra persona"</b>.</p></div></div>';
    $('enc-imp').onclick = function () { imprimir(doc, u); };
    $('enc-cop').onclick = function () { try { navigator.clipboard.writeText(u); aviso('🔗 Enlace copiado', 's'); } catch (e) { prompt('Copia el enlace:', u); } };
    $('enc-cer').onclick = function () { estado(doc, 'cerrada').then(function () { aviso('⏹ Encuesta cerrada', 's'); ir('mis'); }); };
    var cuenta = function () { consultar('encuestas_sat', [['ses', '==', doc.id]]).then(function (L) { var c = $('enc-cont'); if (c) c.textContent = '✅ ' + L.length + ' respuesta' + (L.length === 1 ? '' : 's'); }).catch(function () {}); };
    cuenta(); if (timer) clearInterval(timer); timer = setInterval(cuenta, 10000);
  }
  function imprimir(doc, u) {
    var p = $('enc-print'); if (p) p.remove();
    p = document.createElement('div'); p.id = 'enc-print'; p.style.display = 'none';
    p.innerHTML = '<div style="font-size:30px;font-weight:800;color:#0E2A5C">😊 ¿Qué te pareció la capacitación?</div><div style="font-size:20px;margin:6px 0 18px;color:#334155">Escanea con la cámara de tu celular · es anónima · 1 minuto</div>' +
      '<div style="transform:scale(1.4);margin:60px">' + imgQR(u) + '</div><div style="font-size:22px;font-weight:800">' + esc(doc.tema) + '</div><div style="font-size:16px;color:#475569">' + esc(doc.sup) + ' · ' + esc(fF(doc.fecha)) + '</div>';
    document.body.appendChild(p); setTimeout(function () { window.print(); setTimeout(function () { p.remove(); }, 800); }, 200);
  }
  function estado(doc, e) { return post('eti/escribir', { ops: [{ col: 'encuestas_qr', id: doc.id || doc._id, op: 'update', datos: { estado: e, cambioEstado: new Date().toISOString() }, origen: 'encuesta' }] }).catch(function (x) { aviso('No se pudo: ' + x.message, 'e'); throw x; }); }

  /* ── 2) Mis QR ── */
  async function misQR() {
    var s = ses() || {}, bd = $('enc-bd'); bd.innerHTML = '<p>⏳ Cargando…</p>';
    try {
      var Q = await consultar('encuestas_qr', esEditor() ? [] : [['usuario', '==', s.user]]);
      var R = await consultar('encuestas_sat', esEditor() ? [] : [['usuario', '==', s.user]]);
    } catch (e) { bd.innerHTML = '<div class="enc-vacio">No se pudo cargar: ' + esc(e.message) + '</div>'; return; }
    var n = {}; R.forEach(function (r) { n[r.ses] = (n[r.ses] || 0) + 1; });
    Q.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    if (!Q.length) { bd.innerHTML = '<div class="enc-vacio">' + (puedeGenerar() ? 'Aún no hay QR de encuesta. Créalo en <b>📱 Generar QR</b>.' : 'Aún no tienes QR de encuesta asignados. Los genera la Coordinación o la Analista de Gestión Humana y aparecen aquí.') + '</div>'; return; }
    bd.innerHTML = '<div style="overflow-x:auto"><table class="enc-tab2"><thead><tr><th>Fecha</th><th>Tema</th><th>Capacitador</th><th>Sector</th><th>Respuestas</th><th>Estado</th><th></th></tr></thead><tbody>' +
      Q.map(function (q, i) {
        var ab = q.estado === 'abierta' && !(q.expira && Date.now() > q.expira);
        return '<tr><td>' + esc(fF(q.fecha)) + '</td><td>' + esc(q.tema) + '</td><td>' + esc(q.sup) + '</td><td>' + esc(q.sector || 'Varios') + '</td><td><b>' + (n[q.id || q._id] || 0) + '</b></td>' +
          '<td>' + (ab ? '<span style="color:#15803D;font-weight:800">● Abierta</span>' : '<span style="color:#64748B;font-weight:700">● Cerrada</span>') + '</td><td style="white-space:nowrap">' +
          (ab ? '<button class="enc-b" data-v="' + i + '">📱 QR</button> <button class="enc-b r" data-c="' + i + '">⏹</button>' : '<button class="enc-b" data-a="' + i + '">↻ Reabrir hoy</button>') +
          ' <button class="enc-b" data-r="' + i + '">📊</button></td></tr>';
      }).join('') + '</tbody></table></div>';
    var on = function (a, f) { Array.prototype.forEach.call(bd.querySelectorAll('[' + a + ']'), function (b) { b.onclick = function () { f(Q[+b.getAttribute(a)]); }; }); };
    on('data-v', function (q) { q.id = q.id || q._id; bd.innerHTML = '<button class="enc-b" id="enc-vol">← Volver</button><div id="enc-qrout"></div>'; $('enc-vol').onclick = function () { ir('mis'); }; mostrarQR(q); });
    on('data-c', function (q) { estado(q, 'cerrada').then(misQR); });
    on('data-a', function (q) { var p = hoy().split('-').map(Number);
      post('eti/escribir', { ops: [{ col: 'encuestas_qr', id: q.id || q._id, op: 'update', datos: { estado: 'abierta', expira: new Date(p[0], p[1] - 1, p[2], 23, 59, 59).getTime() }, origen: 'encuesta' }] }).then(misQR).catch(function (e) { aviso(e.message, 'e'); }); });
    on('data-r', function (q) { ir('res'); setTimeout(function () { var t = $('enc-ftema'); if (t) { t.value = q.tema || ''; pintarRes(); } }, 900); });
  }

  /* ── 3) Resultados ── */
  var DATOS = [];
  async function resultados() {
    var s = ses() || {}, bd = $('enc-bd'), adm = esEditor();
    var d0 = new Date(); d0.setDate(d0.getDate() - 90);
    bd.innerHTML = '<div class="enc-grid enc-f"><div><label>Desde</label><input type="date" id="enc-fd" value="' + d0.toISOString().slice(0, 10) + '"></div><div><label>Hasta</label><input type="date" id="enc-fh" value="' + hoy() + '"></div>' +
      (adm ? '<div><label>Capacitador</label><select id="enc-fsup"><option value="">Todos</option></select></div>' : '') +
      '<div><label>Sector</label><select id="enc-fsec"><option value="">Todos</option></select></div><div><label>Tema contiene</label><input id="enc-ftema" placeholder="Ej. ETI"></div></div><div id="enc-res"><p>⏳ Cargando…</p></div>';
    try { DATOS = await consultar('encuestas_sat', adm ? [] : [['usuario', '==', s.user]]); }
    catch (e) { $('enc-res').innerHTML = '<div class="enc-vacio">No se pudo cargar: ' + esc(e.message) + '</div>'; return; }
    var uniq = function (k) { var o = {}; DATOS.forEach(function (r) { if (r[k]) o[r[k]] = 1; }); return Object.keys(o).sort(); };
    if (adm) $('enc-fsup').innerHTML += uniq('sup').map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
    $('enc-fsec').innerHTML += uniq('sector').map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
    ['enc-fd', 'enc-fh', 'enc-fsup', 'enc-fsec'].forEach(function (id) { if ($(id)) $(id).onchange = pintarRes; });
    $('enc-ftema').oninput = pintarRes;
    pintarRes();
  }
  function tabla(L, k, tit) {
    var g = {}; L.forEach(function (r) { var c = r[k] || '—'; (g[c] = g[c] || []).push(r); });
    var F = Object.keys(g).map(function (c) { return [c, resumen(g[c])]; }).sort(function (a, b) { return (b[1].gen || 0) - (a[1].gen || 0); });
    return '<div class="enc-h3">' + tit + '</div><div style="overflow-x:auto"><table class="enc-tab2"><thead><tr><th>' + (k === 'sup' ? 'Capacitador' : k === 'tema' ? 'Tema' : 'Sector') + '</th><th>Resp.</th><th>General</th><th>Capacitador</th><th>Material</th><th>Contenido</th><th>Logística</th><th>Sabe canal de quejas</th></tr></thead><tbody>' +
      F.map(function (f) { var x = f[1]; return '<tr><td><b>' + esc(f[0]) + '</b></td><td>' + x.n + '</td><td>' + chip(x.gen) + '</td><td>' + chip(x.cap) + '</td><td>' + chip(x.mat) + '</td><td>' + chip(x.cont) + '</td><td>' + chip(x.log) + '</td><td>' + chip(x.canal) + '%</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function filtrados() {
    var v = function (id) { return String(($(id) || {}).value || '').trim(); }, fd = v('enc-fd'), fh = v('enc-fh'), su = v('enc-fsup'), se = v('enc-fsec'), te = v('enc-ftema').toLowerCase();
    return DATOS.filter(function (r) { var f = String(r.fecha || '').slice(0, 10); return (!fd || f >= fd) && (!fh || f <= fh) && (!su || r.sup === su) && (!se || r.sector === se) && (!te || String(r.tema || '').toLowerCase().indexOf(te) >= 0); });
  }
  function pintarRes() {
    var L = filtrados(), out = $('enc-res'); if (!out) return;
    if (!L.length) { out.innerHTML = '<div class="enc-vacio" style="margin-top:1rem">Aún no hay respuestas con estos filtros.</div>'; return; }
    var x = resumen(L), k = function (t, v, sub) { return '<div style="background:' + fondo(v) + '"><span>' + t + '</span><b style="color:' + color(v) + '">' + num(v) + (v === null ? '' : '<small style="font-size:.9rem;color:inherit">/100</small>') + '</b><small>' + sub + '</small></div>'; };
    var h = '<div class="enc-kpi"><div><span>Respuestas</span><b>' + x.n + '</b><small>personal capacitado</small></div>' +
      k('Índice general', x.gen, 'satisfacción global') + k('Capacitador', x.cap, 'claridad · ejemplos · trato') + k('Material', x.mat, 'usó material ' + num(x.usoMat) + '%') +
      k('Contenido', x.cont, 'utilidad · sabe a quién acudir') + k('Logística', x.log, 'tiempo adecuado ' + num(x.tiempo) + '%') + '</div>' +
      '<div style="font-size:.8rem;color:#64748B">Escala 0–100 · 🟢 80 o más · 🟡 60–79 · 🔴 menos de 60</div>';
    var adm = esEditor(), qd = function (id) { return ($(id) || {}).value; };
    if (adm && !qd('enc-fsup')) h += tabla(L, 'sup', '👤 Por capacitador');
    h += tabla(L, 'tema', '📚 Por tema');
    if (!qd('enc-fsec')) h += tabla(L, 'sector', '📍 Por sector');
    var cols = ['#DC2626', '#F97316', '#EAB308', '#84CC16', '#16A34A'];
    h += '<div class="enc-h3">📋 Respuestas por pregunta</div><table class="enc-tab2"><thead><tr><th>Pregunta</th><th>Mide</th><th>Promedio</th><th>Distribución ' + CARAS.join(' ') + '</th></tr></thead><tbody>' +
      PREG.map(function (p) {
        var V = L.map(function (r) { return r[p[0]]; }).filter(function (n) { return n >= 1 && n <= 5; }), c = [0, 0, 0, 0, 0]; V.forEach(function (n) { c[n - 1]++; });
        var pr = prom(V.map(e100));
        return '<tr><td>' + esc(p[1]) + '</td><td>' + esc(p[2]) + '</td><td>' + chip(pr) + '</td><td><div class="enc-dist" title="' + c.map(function (n, i) { return CARAS[i] + ' ' + n; }).join('  ') + '">' +
          c.map(function (n, i) { return n ? '<i style="width:' + (n / V.length * 100) + '%;background:' + cols[i] + '"></i>' : ''; }).join('') + '</div></td></tr>';
      }).join('') +
      '<tr><td>¿Usó material de apoyo?</td><td>Material</td><td>' + chip(x.usoMat) + '%</td><td>Sí</td></tr><tr><td>¿Sabe a quién acudir con una queja?</td><td>Contenido</td><td>' + chip(x.canal) + '%</td><td>Sí, lo sabe</td></tr>' +
      '<tr><td>¿El tiempo fue adecuado?</td><td>Logística</td><td>' + chip(x.tiempo) + '%</td><td>' + (function () { var c = { corto: 0, adecuado: 0, largo: 0 }; L.forEach(function (r) { if (c[r.p7] !== undefined) c[r.p7]++; }); return 'Corto ' + c.corto + ' · Adecuado ' + c.adecuado + ' · Largo ' + c.largo; })() + '</td></tr></tbody></table>';
    var C = L.filter(function (r) { return r.coment; }).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    h += '<div class="enc-h3">💬 Opiniones del personal (' + C.length + ')</div>' + (C.length ? C.slice(0, 80).map(function (r) {
      return '<div class="enc-com"><small>' + esc(fF(r.fecha)) + ' · ' + esc(r.tema) + (adm ? ' · ' + esc(r.sup) : '') + ' · ' + esc(r.sector || '') + ' · ' + CARAS[Math.max(0, Math.min(4, Math.round((indices(r).gen || 0) / 25)))] + '</small>' + esc(r.coment) + '</div>';
    }).join('') : '<div class="enc-vacio">Sin comentarios en este periodo.</div>');
    if (window.XLSX) h += '<div style="margin-top:1rem"><button class="enc-b" id="enc-xls">⬇️ Descargar Excel</button></div>';
    out.innerHTML = h;
    var xb = $('enc-xls'); if (xb) xb.onclick = function () { excel(L); };
  }
  function excel(L) {
    var T = { si: 'Sí', no: 'No', nose: 'No está seguro', corto: 'Corto', adecuado: 'Adecuado', largo: 'Largo' };
    var F = L.map(function (r) { var I = indices(r); return { Fecha: r.fecha, Empresa: r.emp, Tema: r.tema, Capacitador: r.sup, Sector: r.sector, Ruta: r.ruta, Tipo: r.tipo, Sexo: r.sexo,
      'P1 Entendió': r.p1, 'P2 Palabras sencillas': r.p2, 'P3 Respeto/paciencia': r.p3, 'P4 Usó material': T[r.p4] || '', 'P4b Material ayudó': r.p4b || '', 'P5 Utilidad': r.p5,
      'P6 Sabe canal de quejas': T[r.p6] || '', 'P7 Tiempo': T[r.p7] || '', 'P8 Comodidad': r.p8, 'P9 Recomienda': r.p9, 'Índice general': num(I.gen), Capacitador_idx: num(I.cap), Material_idx: num(I.mat), Contenido_idx: num(I.cont), Logistica_idx: num(I.log), Comentario: r.coment || '', QR: r.ses }; });
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(F), 'Respuestas'); XLSX.writeFile(wb, 'Encuesta_satisfaccion_' + hoy() + '.xlsx');
  }

  /* ── 4) entrada en el menu lateral ── */
  function menu() {
    var nav = $('es-nav'); if (!nav || $('enc-menu') || !ses()) return;
    var b = document.createElement('button'); b.id = 'enc-menu'; b.className = 'es-it'; b.type = 'button';
    b.innerHTML = '<span>😊</span><span>Encuesta de satisfacción</span>';
    b.onclick = function () { document.body.classList.remove('side-open'); abrir('qr'); };
    var ref = $('inf-menu');
    if (ref && ref.parentNode === nav) nav.insertBefore(b, ref.nextSibling); else nav.appendChild(b);
  }
  window.etiEncuesta = { abrir: abrir, resumen: resumen, indices: indices, version: 1 };
  setInterval(menu, 1500); setTimeout(menu, 400);
  try { console.log('[_ENCUESTA_SAT_V1] listo'); } catch (e) {}
})();
