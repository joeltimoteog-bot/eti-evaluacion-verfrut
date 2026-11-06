/* ═══════════════════════════════════════════════════════════════════════════
   14-informe-eti-v1.js — _INFORME_ETI_V1 (05-nov-2026)
   Informe Check List ETI (INF-SC-GH-03) con EVIDENCIA FOTOGRAFICA y guardado en Supabase.
     1) Al terminar una evaluacion (cierre de la sesion QR o evaluacion manual) aparece un aviso:
        "Evaluaciones culminadas · Genera tu informe".
     2) El informe se arma sobre el MODELO OFICIAL (lib/plantilla-informe-checklist-eti.docx) con
        las 4 a 6 fotos ya colocadas en la seccion IV; el Word se descarga y, ademas, el Word y las
        fotos se guardan en Supabase (bucket "documentos") con su registro (tabla eti.informes_eti).
     3) "Informes ETI" (menu lateral): cada supervisor ve los suyos; Joel Timoteo y Lucia Castillo
        (y los administradores) ven todos y pueden CORREGIR la fecha o cualquier dato y las fotos:
        se vuelve a emitir el Word y queda el historial de cambios.
   No cambia el calculo de resultados ni el formulario de datos del informe (10-mis-evaluaciones.js).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.etiInformeFotos) return;

  var API = 'https://exdjzbfinppzatjyimxn.supabase.co/functions/v1/api/';
  var REG = '?forceFunctionRegion=sa-east-1';
  var EDITORES = ['jtimoteo', 'lcastillo'];
  /* destinatarios del informe (se pueden completar sin tocar nada mas) */
  var DESTINOS = [
    { nom: 'Joel Angel Timoteo Gonza', cargo: 'Responsable de capacitaciones de ética social · desarrollador del Sistema RR.LL.', correo: 'joel.timoteo@unifrutti.com' },
    { nom: 'Lucia Gabriela Castillo Celi', cargo: 'Responsable de capacitaciones de ética social', correo: 'lucia.castillo@unifrutti.com' },
    { nom: 'Luis Eduardo Coveñas Chero', cargo: 'Subgerente de personas', correo: 'eduardo.covenas@unifrutti.com' }
  ];
  var MIN_FOTOS = 4, MAX_FOTOS = 6, LADO = 1600, CALIDAD = 0.82;

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var ses = function () { try { return typeof SESSION !== 'undefined' ? SESSION : null; } catch (e) { return null; } };
  var aviso = function (m, t) { try { if (typeof toast === 'function') toast(m, t || 'i'); } catch (e) {} };
  var fF = function (f) { return f ? String(f).split('-').reverse().join('/') : '—'; };
  var hoy = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  function token() { try { return sessionStorage.getItem('eti_token') || ''; } catch (e) { return ''; } }
  function esEditor() { var s = ses(); return !!s && (EDITORES.indexOf(String(s.user || '').toLowerCase()) >= 0); }

  function post(ruta, cuerpo) {
    var h = { 'Content-Type': 'application/json' }, t = token(); if (t) h.Authorization = 'Bearer ' + t;
    return fetch(API + ruta + REG, { method: 'POST', headers: h, body: JSON.stringify(cuerpo) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.success) throw new Error((j && j.error) || ('HTTP ' + r.status)); return j; });
    });
  }
  function cargar(src) { return new Promise(function (ok, no) { var e = document.createElement('script'); e.src = src; e.onload = function () { ok(); }; e.onerror = function () { no(new Error('No se pudo cargar ' + src)); }; document.head.appendChild(e); }); }
  async function libs() {
    if (typeof window.JSZip === 'undefined') await cargar('lib/jszip.min.js?v=3101');
    if (typeof window.etiInformeChecklist !== 'function' || (window.etiInformeChecklist.version || 0) < 3) await cargar('lib/eti-informe-checklist.js?v=3');
  }
  function aBase64(bytes) { var s = '', b = new Uint8Array(bytes), n = 0x8000; for (var i = 0; i < b.length; i += n) s += String.fromCharCode.apply(null, b.subarray(i, i + n)); return btoa(s); }

  /* ── estilos (una sola vez) ── */
  function css() {
    if ($('inf-css')) return;
    var st = document.createElement('style'); st.id = 'inf-css';
    st.textContent = [
      '.inf-ov{position:fixed;inset:0;background:rgba(10,20,40,.55);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:1rem}',
      '.inf-box{background:#fff;border-radius:16px;max-width:760px;width:100%;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:Barlow,Inter,"Segoe UI",sans-serif;color:#0F172A}',
      '.inf-box.ancho{max-width:1100px}',
      '.inf-hd{padding:1rem 1.2rem;border-bottom:1px solid #E2E8F0;display:flex;justify-content:space-between;align-items:flex-start;gap:.8rem}',
      '.inf-hd b{font-size:1.1rem;color:#0E2A5C}.inf-hd small{display:block;color:#5B6B82;font-size:.82rem;margin-top:.2rem}',
      '.inf-bd{padding:1rem 1.2rem;overflow:auto}',
      '.inf-ft{padding:.8rem 1.2rem;border-top:1px solid #E2E8F0;display:flex;justify-content:flex-end;gap:.5rem;flex-wrap:wrap}',
      '.inf-res{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.6rem;margin-bottom:1rem}',
      '.inf-res div{background:#F4F6FA;border:1px solid #E2E8F0;border-radius:10px;padding:.55rem .7rem;font-size:.78rem;color:#5B6B82}',
      '.inf-res div b{display:block;font-size:1rem;color:#0F172A;margin-top:.1rem}',
      '.inf-fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.7rem}',
      '.inf-foto{position:relative;border:1px solid #CBD5E1;border-radius:10px;overflow:hidden;aspect-ratio:4/3;background:#F4F6FA}',
      '.inf-foto img{width:100%;height:100%;object-fit:cover;display:block}',
      '.inf-foto span{position:absolute;left:6px;top:6px;background:#0E2A5C;color:#fff;font-size:.72rem;font-weight:700;border-radius:6px;padding:.1rem .45rem}',
      '.inf-foto button{position:absolute;right:6px;top:6px;width:30px;height:30px;border-radius:50%;border:0;background:rgba(15,23,42,.75);color:#fff;font-size:15px;cursor:pointer}',
      '.inf-add{border:2px dashed #94A3B8;border-radius:10px;aspect-ratio:4/3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3rem;color:#18428A;font-weight:700;cursor:pointer;background:#F8FAFC;font-size:.9rem;text-align:center;padding:.5rem}',
      '.inf-add:hover{background:#EEF2F8}',
      '.inf-cnt{margin:.8rem 0 0;font-size:.85rem}',
      '.inf-tab{width:100%;border-collapse:collapse;font-size:.84rem}',
      '.inf-tab th{background:#F8FAFC;color:#475569;text-align:left;padding:.55rem .6rem;border-bottom:1px solid #E2E8F0;white-space:nowrap;font-size:.76rem}',
      '.inf-tab td{padding:.55rem .6rem;border-bottom:1px solid #EEF2F6;vertical-align:middle}',
      '.inf-pill{display:inline-block;font-size:.72rem;font-weight:700;border-radius:999px;padding:.12rem .55rem;background:#E8EFFB;color:#18428A}',
      '.inf-ok{display:flex;gap:.8rem;align-items:flex-start;background:#ECFDF3;border:1px solid #A7E3BF;border-radius:12px;padding:.9rem 1rem;color:#14532D;margin-bottom:.9rem}',
      '.inf-err{background:#FFF1F3;border:1px solid #F5C2C9;color:#9F1239;border-radius:12px;padding:.8rem 1rem;margin-bottom:.9rem}',
      '.inf-dest{font-size:.84rem;color:#334155;line-height:1.55}'
    ].join('\n');
    document.head.appendChild(st);
  }
  function modal(html, ancho) {
    css(); var m = document.createElement('div'); m.className = 'inf-ov';
    m.innerHTML = '<div class="inf-box' + (ancho ? ' ancho' : '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(m); return m;
  }

  /* ── fotos: comprimir en el navegador (JPEG, lado mayor 1600 px) ── */
  function leerImagen(file) {
    return new Promise(function (ok, no) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var w = im.naturalWidth, h = im.naturalHeight, k = Math.min(1, LADO / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k);
        var c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { if (!b) { no(new Error('No se pudo leer la foto')); return; }
          b.arrayBuffer().then(function (ab) { ok({ bytes: new Uint8Array(ab), w: w, h: h, prev: URL.createObjectURL(b) }); }, no); }, 'image/jpeg', CALIDAD);
      };
      im.onerror = function () { URL.revokeObjectURL(url); no(new Error('El archivo ' + file.name + ' no es una imagen válida')); };
      im.src = url;
    });
  }
  async function fotoDesdeUrl(u) {
    var r = await fetch(u, { cache: 'no-store' }); if (!r.ok) throw new Error('No se pudo leer una foto guardada (HTTP ' + r.status + ')');
    var b = await r.blob(); var f = new File([b], 'foto.jpg', { type: b.type || 'image/jpeg' }); var x = await leerImagen(f); x.url = u; return x;
  }

  /* ── 1) pedir las fotos antes de emitir ── */
  function pedirFotos(info, iniciales) {
    return new Promise(function (resolver) {
      var fotos = (iniciales || []).slice();
      var m = modal(
        '<div class="inf-hd"><div><b>📷 Evidencia fotográfica · Informe INF-SC-GH-03</b><small>Agrega de ' + MIN_FOTOS + ' a ' + MAX_FOTOS + ' fotos de la evaluación. Se colocan solas en la sección IV del informe y quedan guardadas.</small></div></div>' +
        '<div class="inf-bd"><div class="inf-res">' +
          '<div>Sector<b>' + esc(info.sector || '—') + '</b></div><div>Fecha(s)<b>' + esc(info.fechasTxt || '—') + '</b></div>' +
          '<div>Total evaluados<b>' + esc(info.n) + '</b></div><div>Hombres / Mujeres<b>' + esc(info.h) + ' / ' + esc(info.m) + '</b></div></div>' +
          '<div class="inf-fotos" id="inf-grid"></div><p class="inf-cnt" id="inf-cnt"></p>' +
          '<input type="file" id="inf-file" accept="image/*" multiple style="display:none"></div>' +
        '<div class="inf-ft"><button class="btn bout" id="inf-no">Cancelar</button><button class="btn bpri" id="inf-ok">Generar informe</button></div>');
      var fin = function (v) { m.remove(); resolver(v); };
      function pintar() {
        var g = $('inf-grid'); g.innerHTML = '';
        fotos.forEach(function (f, i) {
          var d = document.createElement('div'); d.className = 'inf-foto';
          d.innerHTML = '<img alt="Foto ' + (i + 1) + '" src="' + f.prev + '"><span>Foto ' + (i + 1) + '</span><button type="button" aria-label="Quitar foto ' + (i + 1) + '">✕</button>';
          d.querySelector('button').onclick = function () { fotos.splice(i, 1); pintar(); };
          g.appendChild(d);
        });
        if (fotos.length < MAX_FOTOS) {
          var a = document.createElement('button'); a.type = 'button'; a.className = 'inf-add';
          a.innerHTML = '<span style="font-size:1.6rem">＋</span>Agregar foto' + (fotos.length ? '' : 's') + '<small style="font-weight:500;color:#5B6B82">cámara o galería</small>';
          a.onclick = function () { $('inf-file').click(); }; g.appendChild(a);
        }
        var n = fotos.length, ok = n >= MIN_FOTOS && n <= MAX_FOTOS;
        $('inf-cnt').innerHTML = ok ? '✅ <b>' + n + ' fotos</b> listas.' : '📷 <b>' + n + ' de ' + MIN_FOTOS + '</b> fotos como mínimo (máximo ' + MAX_FOTOS + ').';
        $('inf-ok').disabled = !ok;
      }
      $('inf-file').onchange = async function () {
        var lista = Array.prototype.slice.call(this.files || []); this.value = '';
        var libres = MAX_FOTOS - fotos.length; if (lista.length > libres) aviso('Solo se agregan ' + libres + ' foto(s): el máximo es ' + MAX_FOTOS, 'i');
        $('inf-cnt').textContent = '⏳ Preparando fotos…';
        for (var f of lista.slice(0, libres)) { try { fotos.push(await leerImagen(f)); } catch (e) { aviso(e.message, 'e'); } }
        pintar();
      };
      $('inf-no').onclick = function () { fin(null); };
      $('inf-ok').onclick = function () { fin(fotos); };
      pintar();
    });
  }

  /* ── 2) completar: lo llama el boton "Informe Check List" antes de armar el Word ── */
  async function completar(datos) {
    var fs = (datos.fechasEval || [datos.fechaEval]).filter(Boolean);
    var v = datos.v || {};
    var fotos = await pedirFotos({ sector: datos.sector, fechasTxt: fs.map(fF).join(', '), n: datos.R && datos.R.n, h: v.h, m: v.m }, datos.fotos || []);
    if (!fotos) return false;
    try { await libs(); } catch (e) { aviso(e.message, 'e'); return false; }
    datos.fotos = fotos; return true;
  }

  /* ── 3) guardar en Supabase (Word + fotos + registro) y avisar ── */
  function nuevoId(datos) {
    var s = ses() || {}, f = (datos.fechasEval || [datos.fechaEval])[0] || hoy();
    return 'INF-' + f.replace(/-/g, '') + '-' + String(s.user || 'usuario').replace(/[^a-z0-9]/gi, '') + '-' + Date.now().toString(36);
  }
  async function subir(nombre, bytes, tipo) {
    var j = await post('archivos/subir', { contenedor: 'documentos', nombre: nombre, base64: aBase64(bytes), tipo: tipo });
    return j.url || j.enlace;
  }
  function registro(datos, id, urls, docxUrl, nombre, previo) {
    var s = ses() || {};
    return {
      tipo: 'INF-SC-GH-03', id: id, nombre: nombre, docx: docxUrl,
      fotos: urls.map(function (u, i) { return { url: u, w: datos.fotos[i].w, h: datos.fotos[i].h }; }),
      sup: datos.nom, usuario: previo ? previo.usuario : (s.user || ''), nomUsuario: previo ? previo.nomUsuario : (s.nom || ''),
      emp: datos.emp, sector: datos.sector, fechasEval: datos.fechasEval || [datos.fechaEval], fechaEval: datos.fechaEval, fechaInforme: datos.fechaInforme,
      tipos: datos.tipos || [], temas: datos.temas, R: datos.R, v: datos.v,
      n: datos.R && datos.R.n, prom: datos.R && datos.R.prom,
      creado: previo ? previo.creado : new Date().toISOString(), ts: previo ? previo.ts : Date.now(),
      version: previo ? (previo.version || 1) + 1 : 1, historial: previo ? (previo.historial || []) : [],
      actualizado: new Date().toISOString()
    };
  }
  async function guardarTodo(datos, blob, nombre, previo) {
    var id = previo ? previo.id : nuevoId(datos), ver = previo ? (previo.version || 1) + 1 : 1;
    var urls = [];
    for (var i = 0; i < datos.fotos.length; i++) {
      var f = datos.fotos[i];
      urls.push(f.url && previo ? f.url : await subir(id + '_foto' + (i + 1) + (ver > 1 ? '_v' + ver : '') + '.jpg', f.bytes, 'image/jpeg'));
    }
    var nomArch = id + (ver > 1 ? '_v' + ver : '') + '.docx';
    var docxUrl = await subir(nomArch, new Uint8Array(await blob.arrayBuffer()), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    var reg = registro(datos, id, urls, docxUrl, nombre, previo);
    if (previo) reg.historial = (previo.historial || []).concat([{ en: new Date().toISOString(), por: (ses() || {}).user || '', version: ver, docxAnterior: previo.docx || '', cambios: previo._cambios || [] }]).slice(-30);
    await post('eti/escribir', { ops: [{ col: 'informes_eti', id: id, op: 'set', datos: reg, merge: false, origen: previo ? 'informe-correccion' : 'informe' }] });
    return reg;
  }
  function correoHref(reg) {
    var para = DESTINOS.map(function (d) { return d.correo; }).filter(Boolean).join(',');
    var fs = (reg.fechasEval || []).map(fF).join(', ');
    var asunto = 'Informe Check List ETI (INF-SC-GH-03) · ' + reg.sector + ' · ' + fs;
    var cuerpo = 'Buenos días,\n\nAdjunto el Informe Check List ETI (INF-SC-GH-03) de la evaluación de ética social:\n\n' +
      '• Supervisor: ' + reg.sup + '\n• Sector: ' + reg.sector + '\n• Fecha(s): ' + fs + '\n• Total evaluados: ' + reg.n +
      ' (hombres ' + ((reg.v || {}).h || '—') + ', mujeres ' + ((reg.v || {}).m || '—') + ')\n• Promedio del grupo: ' + (((reg.prom || 0) * 100).toFixed(2)) + ' %\n• Evidencia fotográfica: ' + (reg.fotos || []).length + ' fotos\n\n' +
      'Informe en Word (guardado en el sistema): ' + reg.docx + '\n\n' +
      'Para: ' + DESTINOS.map(function (d) { return d.nom + ' (' + d.cargo + ')'; }).join('; ') + '\n\nAtentamente,\n' + (ses() || {}).nom;
    return 'mailto:' + encodeURIComponent(para).replace(/%2C/g, ',') + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
  }
  function listo(reg, corregido) {
    var m = modal(
      '<div class="inf-hd"><div><b>' + (corregido ? '✏️ Informe corregido y guardado' : '✅ Informe emitido y guardado') + '</b><small>' + esc(reg.sector) + ' · ' + esc((reg.fechasEval || []).map(fF).join(', ')) + ' · versión ' + reg.version + '</small></div></div>' +
      '<div class="inf-bd"><div class="inf-ok"><span style="font-size:1.4rem">📁</span><div>El Word ya se descargó en tu equipo y quedó <b>guardado en el sistema</b> junto con sus ' + (reg.fotos || []).length + ' fotos. Puedes volver a descargarlo cuando quieras desde <b>📚 Informes ETI</b> en el menú.</div></div>' +
      '<div class="inf-dest"><b>Envíalo por correo a los responsables de las capacitaciones de ética social:</b><br>' +
      DESTINOS.map(function (d) { return '• ' + esc(d.nom) + ' — ' + esc(d.cargo); }).join('<br>') +
      '<br><span style="color:#5B6B82">Antes de enviarlo revisa las conclusiones, coloca tu firma digital y adjunta el registro de asistencia.</span></div></div>' +
      '<div class="inf-ft"><a class="btn bout" href="' + esc(reg.docx) + '" target="_blank" rel="noopener">⬇️ Descargar Word</a>' +
      '<a class="btn bpri" href="' + esc(correoHref(reg)) + '">✉️ Preparar correo</a><button class="btn bout" id="inf-cerrar">Cerrar</button></div>');
    m.querySelector('#inf-cerrar').onclick = function () { m.remove(); };
  }
  function fallo(e, reintentar) {
    var m = modal('<div class="inf-hd"><div><b>⚠️ El Word se descargó, pero no se pudo guardar en el sistema</b><small>' + esc(e && e.message) + '</small></div></div>' +
      '<div class="inf-bd"><div class="inf-err">Tu informe <b>no se perdió</b>: está en tu carpeta de descargas. Revisa tu conexión y pulsa <b>Reintentar</b> para guardarlo.</div></div>' +
      '<div class="inf-ft"><button class="btn bout" id="inf-c">Cerrar</button><button class="btn bpri" id="inf-r">Reintentar</button></div>');
    m.querySelector('#inf-c').onclick = function () { m.remove(); };
    m.querySelector('#inf-r').onclick = function () { m.remove(); reintentar(); };
  }
  function guardar(datos, blob, nombre) {
    var intento = function () {
      aviso('⏳ Guardando el informe y las fotos en el sistema…', 'i');
      guardarTodo(datos, blob, nombre, null).then(function (reg) { listo(reg, false); }, function (e) { console.error('[_INFORME_ETI_V1]', e); fallo(e, intento); });
    };
    intento();
  }

  /* ── 4) panel "Informes ETI" ── */
  async function listar() {
    var s = ses(); if (!s) return [];
    var c = { col: 'informes_eti', limite: 2000 };
    if (!esEditor()) c.filtros = [['usuario', '==', s.user]];
    var j = await post('eti/consultar', c);
    return (j.docs || []).map(function (d) { return d.datos; }).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  }
  async function panel() {
    var m = modal('<div class="inf-hd"><div><b>📚 Informes ETI emitidos (INF-SC-GH-03)</b><small>' + (esEditor() ? 'Todos los informes · como administradora/or puedes corregir fecha, datos y fotos' : 'Tus informes emitidos') + '</small></div><button class="btn bout bsm" id="inf-x" aria-label="Cerrar">✕</button></div>' +
      '<div class="inf-bd" id="inf-lista"><p>⏳ Cargando…</p></div>', true);
    m.querySelector('#inf-x').onclick = function () { m.remove(); };
    var L;
    try { L = await listar(); } catch (e) { $('inf-lista').innerHTML = '<div class="inf-err">No se pudo cargar: ' + esc(e.message) + '</div>'; return; }
    if (!L.length) { $('inf-lista').innerHTML = '<p>Aún no hay informes emitidos. Se generan desde <b>📝 Informe Check List</b> en el reporte del supervisor.</p>'; return; }
    window._infLista = L;
    $('inf-lista').innerHTML = '<div style="overflow-x:auto"><table class="inf-tab"><thead><tr><th>Emitido</th><th>Supervisor</th><th>Sector</th><th>Fecha(s) evaluación</th><th>Evaluados (H/M)</th><th>Promedio</th><th>Fotos</th><th>Versión</th><th></th></tr></thead><tbody>' +
      L.map(function (r, i) {
        return '<tr><td>' + esc(fF(String(r.creado || '').slice(0, 10))) + '</td><td>' + esc(r.sup) + '</td><td>' + esc(r.sector) + '</td><td>' + esc((r.fechasEval || []).map(fF).join(', ')) + '</td>' +
          '<td>' + esc(r.n) + ' (' + esc((r.v || {}).h || '—') + '/' + esc((r.v || {}).m || '—') + ')</td><td>' + (((r.prom || 0) * 100).toFixed(1)) + ' %</td><td>' + (r.fotos || []).length + '</td>' +
          '<td><span class="inf-pill">v' + (r.version || 1) + '</span></td><td style="white-space:nowrap">' +
          '<a class="btn bout bsm" href="' + esc(r.docx) + '" target="_blank" rel="noopener">⬇️ Word</a> <a class="btn bout bsm" href="' + esc(correoHref(r)) + '">✉️</a>' +
          (esEditor() ? ' <button class="btn bpri bsm" data-i="' + i + '">✏️ Corregir</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    Array.prototype.forEach.call(m.querySelectorAll('button[data-i]'), function (b) { b.onclick = function () { m.remove(); corregir(L[+b.getAttribute('data-i')]); }; });
  }

  /* ── 5) corregir un informe (Joel Timoteo · Lucia Castillo · administradores) ── */
  function aIso(t) { var p = String(t || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (!p) return null; var d = p[3] + '-' + String(p[2]).padStart(2, '0') + '-' + String(p[1]).padStart(2, '0'); return isNaN(new Date(d + 'T12:00:00')) ? null : d; }
  function corregir(r) {
    if (!esEditor()) { aviso('Solo Joel Timoteo y Lucía Castillo pueden corregir informes emitidos', 'e'); return; }
    if (!window.etiMiniForm) { aviso('Formulario no disponible', 'e'); return; }
    var v = r.v || {};
    var campos = [
      { k: 'fechas', lbl: 'Fecha(s) de la evaluación (dd/mm/aaaa, separadas por coma)', v: (r.fechasEval || []).map(fF).join(', ') },
      { k: 'finf', lbl: 'Fecha del informe (dd/mm/aaaa)', v: fF(r.fechaInforme) },
      { k: 'h', lbl: 'Hombres (N°)', v: v.h }, { k: 'm', lbl: 'Mujeres (N°)', v: v.m },
      { k: 'dur', lbl: 'Duración', v: v.dur }, { k: 'resp', lbl: 'Responsable', v: v.resp }, { k: 'firma', lbl: 'Firma (nombre)', v: v.firma },
      { k: 'reportado', lbl: 'Reportado a', v: v.reportado }, { k: 'sem', lbl: 'Semana (vacío = automática)', v: v.sem },
      { k: 'conc', lbl: 'V. Conclusiones (vacío = texto automático)', v: v.conc }
    ];
    window.etiMiniForm('✏️ Corregir informe · ' + esc(r.sup) + ' · ' + esc(r.sector), 'Corrige lo que esté mal. Al guardar se vuelve a emitir el Word (versión ' + ((r.version || 1) + 1) + ') y queda el historial del cambio. En el siguiente paso puedes cambiar las fotos.', campos, async function (n) {
      var fechas = String(n.fechas || '').split(',').map(aIso), finf = aIso(n.finf);
      if (!fechas.length || fechas.some(function (x) { return !x; }) || !finf) { aviso('Revisa las fechas: formato dd/mm/aaaa', 'e'); return; }
      var cambios = [];
      ['h', 'm', 'dur', 'resp', 'firma', 'reportado', 'sem', 'conc'].forEach(function (k) { if (String(n[k] || '') !== String(v[k] || '')) cambios.push(k); });
      if (fechas.join(',') !== (r.fechasEval || []).join(',')) cambios.push('fechas');
      if (finf !== r.fechaInforme) cambios.push('fechaInforme');
      aviso('⏳ Recuperando las fotos guardadas…', 'i');
      var ini = [];
      for (var f of (r.fotos || [])) { try { ini.push(await fotoDesdeUrl(f.url)); } catch (e) { aviso(e.message, 'e'); } }
      var fotos = await pedirFotos({ sector: r.sector, fechasTxt: fechas.map(fF).join(', '), n: r.n, h: n.h, m: n.m }, ini);
      if (!fotos) return;
      var urlsAntes = (r.fotos || []).map(function (x) { return x.url; }), urlsDesp = fotos.map(function (x) { return x.url || ''; });
      if (urlsAntes.join('|') !== urlsDesp.join('|')) cambios.push('fotos');
      try {
        await libs();
        var pr = await fetch('lib/plantilla-informe-checklist-eti.docx?v=2', { cache: 'no-store' }); if (!pr.ok) throw new Error('No se pudo leer la plantilla (HTTP ' + pr.status + ')');
        var fs = fechas.slice().sort();
        var datos = { plantilla: await pr.arrayBuffer(), emp: r.emp, sector: r.sector, nom: r.sup, fechaEval: fs[0], fechasEval: fs, fechaInforme: finf, tipos: r.tipos, temas: r.temas, R: r.R,
          v: Object.assign({}, v, { h: n.h, m: n.m, dur: n.dur, resp: n.resp, firma: n.firma, reportado: n.reportado, sem: n.sem, conc: n.conc }), fotos: fotos };
        var blob = await window.etiInformeChecklist(datos);
        var nombre = String(r.nombre || 'Informe_CheckList_ETI.docx').replace(/(_v\d+)?\.docx$/i, '') + '_v' + ((r.version || 1) + 1) + '.docx';
        var a = document.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = nombre; a.style.display = 'none'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 800);
        aviso('⏳ Guardando la corrección…', 'i');
        var reg = await guardarTodo(datos, blob, nombre, Object.assign({}, r, { _cambios: cambios }));
        listo(reg, true);
      } catch (e) { console.error('[_INFORME_ETI_V1] corregir', e); aviso('No se pudo corregir: ' + e.message, 'e'); }
    });
  }

  /* ── 6) aviso "evaluaciones culminadas" (cierre de sesion QR o evaluacion manual guardada) ── */
  var ultimoGuardado = 0;
  function engancharAviso() {
    if (typeof window.guardarEvalNube === 'function' && !window.guardarEvalNube._inf) {
      var g0 = window.guardarEvalNube;
      window.guardarEvalNube = function () { ultimoGuardado = Date.now(); return g0.apply(this, arguments); };
      window.guardarEvalNube._inf = true;
    }
    if (typeof window.renderRes === 'function' && !window.renderRes._inf) {
      var r0 = window.renderRes;
      window.renderRes = function (res) {
        var out = r0.apply(this, arguments);
        try { if (Date.now() - ultimoGuardado < 20000) { ultimoGuardado = 0; setTimeout(function () { avisoCulminado(res); }, 700); } } catch (e) {}
        return out;
      };
      window.renderRes._inf = true;
    }
  }
  function avisoCulminado(res) {
    if (!res) return;
    var n = 0; try { (res.rutas || []).forEach(function (r) { n += +r.ne || 0; }); } catch (e) {}
    var sup = res.sup || (ses() || {}).nom || '';
    var m = modal('<div class="inf-hd"><div><b>✅ Evaluaciones culminadas</b><small>' + esc(res.sector || '') + (res.fecha ? ' · ' + esc(fF(res.fecha)) : '') + '</small></div></div>' +
      '<div class="inf-bd"><div class="inf-ok"><span style="font-size:1.4rem">🎉</span><div>Se registraron <b>' + (n || 'las') + ' evaluaciones</b> del personal' + (sup ? ' de <b>' + esc(sup) + '</b>' : '') + '. ' +
      'Ya puedes generar tu <b>Informe Check List ETI (INF-SC-GH-03)</b>: completa hombres/mujeres y los datos que falten, agrega de ' + MIN_FOTOS + ' a ' + MAX_FOTOS + ' fotos y el informe se guarda solo en el sistema.</div></div></div>' +
      '<div class="inf-ft"><button class="btn bout" id="inf-luego">Más tarde</button><button class="btn bpri" id="inf-gen">📝 Generar informe ahora</button></div>');
    m.querySelector('#inf-luego').onclick = function () { m.remove(); };
    m.querySelector('#inf-gen').onclick = function () {
      m.remove();
      try {
        var S = ses(); if (!window.ETIMIS) { aviso('Abre "Mis evaluaciones" y pulsa 📝 Informe Check List', 'i'); return; }
        window.ETIMIS.abrir();
        var esAdm = S && S.rol === 'admin';
        if (esAdm && sup) window.ETIMIS.sup(sup);
        aviso('⏳ Preparando el informe…', 'i');
        setTimeout(function () { window.ETIMIS.checklistDe(esAdm ? sup : undefined); }, 1800);
      } catch (e) { aviso('Abre "Mis evaluaciones" y pulsa 📝 Informe Check List', 'i'); }
    };
  }

  /* ── 7) entrada en el menu lateral ── */
  function menu() {
    var nav = $('es-nav'); if (!nav || $('inf-menu') || !ses()) return;
    var b = document.createElement('button'); b.id = 'inf-menu'; b.className = 'es-it'; b.type = 'button';
    b.innerHTML = '<span>📚</span><span>Informes ETI</span>';
    b.onclick = function () { document.body.classList.remove('side-open'); panel(); };
    var ref = Array.prototype.find.call(nav.querySelectorAll('.es-it'), function (x) { return /evaluaciones/i.test(x.textContent) && x.dataset.k === 'mis'; });
    if (ref && ref.nextSibling) nav.insertBefore(b, ref.nextSibling); else nav.appendChild(b);
  }

  window.etiInformeFotos = { completar: completar, guardar: guardar, panel: panel, corregir: corregir, version: 1 };
  function iniciar() { engancharAviso(); menu(); }
  setInterval(iniciar, 1500); setTimeout(iniciar, 300);
  try { console.log('[_INFORME_ETI_V1] listo'); } catch (e) {}
})();
