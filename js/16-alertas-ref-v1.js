/* ════════════════════════════════════════════════════════════════════════════
   _ALERTAS_REF_V1 (06-nov-2026) — Alertas de reforzamiento por ruta y tema
   · Menu lateral "🚨 Alertas de reforzamiento" (con contador de pendientes).
   · Por ciclo (trimestre I-IV o rango): junta las evaluaciones QR (respuestas_qr, por persona) y
     las manuales (evaluaciones_conocimiento, por ruta), igual que Indicadores, y calcula el %
     de cada RUTA en cada TEMA. Menos de 70 % = alerta de reforzamiento.
   · Seguimiento (eti.alertas_ref): el supervisor registra el reforzamiento (fecha, modalidad, nota).
     Las evaluaciones de esa ruta y tema POSTERIORES al reforzamiento dicen si se superó (70 % o más).
   · Admin (Joel, Lucia, administradores): matriz sector × tema en semaforo, todas las alertas, Excel.
     Supervisor: solo las suyas, y un aviso al entrar si tiene pendientes.
   No cambia las evaluaciones ni la alerta que ya sale al cerrar la sesion QR (_ETI_ALERTA_RUTA_V1).
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.etiAlertasRef) return;
  var API = 'https://exdjzbfinppzatjyimxn.supabase.co/functions/v1/api/', REG = '?forceFunctionRegion=sa-east-1';
  var EDITORES = ['jtimoteo', 'lcastillo'], MIN = 0.70, VIGILAR = 0.80, MUESTRA = 5;

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var ses = function () { try { return typeof SESSION !== 'undefined' ? SESSION : null; } catch (e) { return null; } };
  var aviso = function (m, t) { try { if (typeof toast === 'function') toast(m, t || 'i'); } catch (e) {} };
  var fF = function (f) { return f ? String(f).slice(0, 10).split('-').reverse().join('/') : '—'; };
  var hoy = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var U = function (s) { return String(s || '').trim().toUpperCase().replace(/\s+/g, ' '); };
  var EMP = function (s) { return U(s).replace(/\s*S\.?\s*A\.?\s*C\.?$/, ''); };   /* "VERFRUT S.A.C." = "VERFRUT" */
  var P = function (v) { return v == null ? '—' : Math.round(v * 1000) / 10 + '%'; };
  function token() { try { return sessionStorage.getItem('eti_token') || ''; } catch (e) { return ''; } }
  function esEditor() { var s = ses(); return !!s && (s.rol === 'admin' || EDITORES.indexOf(String(s.user || '').toLowerCase()) >= 0); }
  function post(ruta, cuerpo) {
    var h = { 'Content-Type': 'application/json' }, t = token(); if (t) h.Authorization = 'Bearer ' + t;
    return fetch(API + ruta + REG, { method: 'POST', headers: h, body: JSON.stringify(cuerpo) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.success) throw new Error((j && j.error) || ('HTTP ' + r.status)); return j; });
    });
  }
  function consultar(col, filtros) { return post('eti/consultar', { col: col, filtros: filtros || [], limite: 20000 }).then(function (j) { return (j.docs || []).map(function (d) { return Object.assign({ _id: d.id }, d.datos); }); }); }

  /* ── ciclos: trimestres del año (I ene-mar · II abr-jun · III jul-set · IV oct-dic) ── */
  function ciclos() {
    var y = new Date().getFullYear(), L = [];
    [y, y - 1].forEach(function (a) { for (var q = 4; q >= 1; q--) { var m1 = (q - 1) * 3 + 1, m3 = m1 + 2, fin = new Date(a, m3, 0).getDate();
      L.push({ id: a + '-C' + q, nom: 'Ciclo ' + ['I', 'II', 'III', 'IV'][q - 1] + ' ' + a, desde: a + '-' + String(m1).padStart(2, '0') + '-01', hasta: a + '-' + String(m3).padStart(2, '0') + '-' + fin }); } });
    return L;
  }
  function cicloActual() { var h = hoy(); return ciclos().find(function (c) { return h >= c.desde && h <= c.hasta; }) || ciclos()[0]; }

  /* ── 1) datos: filas por ruta (QR = 1 persona, manual = ne personas) ── */
  async function filas(desde, hasta, user) {
    var f = [['fecha', '>=', desde], ['fecha', '<=', hasta]], w = function (c) { return user ? f.concat([[c, '==', user]]) : f; };   /* supervisor: solo lo suyo (filtra el servidor) */
    var R = await Promise.all([consultar('respuestas_qr', w('usuarioSup')), consultar('evaluaciones_conocimiento', w('usuario'))]), out = [];
    R[0].forEach(function (x) {
      out.push({ fecha: x.fecha, emp: EMP(x.emp), sup: x.sup || '', user: x.usuarioSup || '', sector: x.sector || '', ruta: U(x.ruta), cod: U(x.cod), n: 1, mod: 'QR',
        secs: (x.secs || []).map(function (s) { return { id: s.id || U(s.nom), nom: s.nom, pct: +s.pct || 0 }; }) });
    });
    R[1].forEach(function (x) {
      if (x.modalidad === 'QR') return;   /* el consolidado QR ya esta por persona en respuestas_qr */
      (x.rutas || []).forEach(function (r) {
        out.push({ fecha: x.fecha, emp: EMP(x.emp), sup: x.sup || '', user: x.usuario || '', sector: x.sector || '', ruta: U(r.nom), cod: U(r.cod), n: +r.ne || 1, mod: 'Manual',
          secs: (r.secs || []).map(function (s) { return { id: s.id || U(s.nom), nom: s.nom, pct: s.pct != null ? +s.pct : (+s.cum || 0) }; }) });
      });
    });
    return out.filter(function (x) { return x.ruta || x.cod; });
  }
  var claveRuta = function (x) { return x.emp + '|' + U(x.sector) + '|' + (x.cod || x.ruta); };
  var idAlerta = function (ciclo, k, tema) { return (ciclo + '|' + k + '|' + U(tema)).replace(/[^A-Z0-9|_-]/gi, '_').slice(0, 190); };

  /* agrupa por ruta y tema; si hay reforzamiento registrado, separa antes / despues */
  function analizar(F, ciclo, segs) {
    var g = {};
    F.forEach(function (x) {
      var k = claveRuta(x), r = g[k] || (g[k] = { k: k, emp: x.emp, sector: x.sector, ruta: x.ruta, cod: x.cod, sups: {}, n: 0, temas: {} });
      r.n += x.n; var sk = x.sup + '\u0001' + x.user; r.sups[sk] = (r.sups[sk] || 0) + x.n; if (!r.ruta && x.ruta) r.ruta = x.ruta;
      x.secs.forEach(function (s) { var t = r.temas[s.id] || (r.temas[s.id] = { id: s.id, nom: s.nom, ev: [] }); t.ev.push({ fecha: x.fecha, n: x.n, pct: s.pct }); });
    });
    var A = [], rutas = Object.keys(g).map(function (k) { return g[k]; });
    rutas.forEach(function (r) {
      var top = Object.keys(r.sups).sort(function (a, b) { return r.sups[b] - r.sups[a]; })[0] || '\u0001'; r.sup = top.split('\u0001')[0]; r.user = top.split('\u0001')[1];
      r.res = {};
      Object.keys(r.temas).forEach(function (id) {
        var t = r.temas[id], seg = segs[idAlerta(ciclo, r.k, id)] || null, corte = seg && seg.fechaRef;
        var antes = t.ev.filter(function (e) { return !corte || e.fecha <= corte; }), desp = corte ? t.ev.filter(function (e) { return e.fecha > corte; }) : [];
        var avg = function (L) { var n = 0, s = 0; L.forEach(function (e) { n += e.n; s += e.pct * e.n; }); return n ? { pct: s / n, n: n } : null; };
        var a = avg(antes) || avg(t.ev), d = avg(desp); r.res[id] = a;
        if (a && a.pct < MIN) {
          var estado = !seg ? 'pendiente' : d ? (d.pct >= MIN ? 'superada' : 'reevaluar') : 'reforzado';
          A.push({ id: idAlerta(ciclo, r.k, id), ciclo: ciclo, emp: r.emp, sector: r.sector, ruta: r.ruta, cod: r.cod, tema: t.nom, temaId: id, pct: a.pct, n: a.n, sup: r.sup, user: r.user,
            seg: seg, post: d, estado: estado, chica: a.n < MUESTRA });
        }
      });
    });
    A.sort(function (a, b) { var o = { pendiente: 0, reevaluar: 1, reforzado: 2, superada: 3 }; return (o[a.estado] - o[b.estado]) || (a.pct - b.pct); });
    return { rutas: rutas, alertas: A };
  }

  /* ── estilos y ventana ── */
  function css() {
    if ($('alr-css')) return;
    var st = document.createElement('style'); st.id = 'alr-css';
    st.textContent = [
      '.alr-ov{position:fixed;inset:0;background:rgba(10,20,40,.55);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:1rem}',
      '.alr-box{background:#fff;border-radius:16px;max-width:1180px;width:100%;height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:Barlow,Inter,"Segoe UI",sans-serif;color:#0F172A}',
      '.alr-hd{padding:1rem 1.2rem .6rem;display:flex;justify-content:space-between;align-items:flex-start;gap:.8rem;border-bottom:1px solid #E2E8F0}',
      '.alr-hd b{font-size:1.15rem;color:#0E2A5C}.alr-hd small{display:block;color:#5B6B82;font-size:.82rem;margin-top:.2rem}',
      '.alr-bd{padding:1rem 1.2rem;overflow:auto;flex:1}',
      '.alr-b{min-height:38px;padding:0 13px;border-radius:10px;border:1.5px solid #C7D2E6;background:#fff;font:800 .88rem Barlow,sans-serif;color:#0E2A5C;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem;white-space:nowrap}',
      '.alr-b.p{background:#0E2A5C;border-color:#0E2A5C;color:#fff}',
      '.alr-f{display:flex;gap:.6rem;flex-wrap:wrap;align-items:flex-end}',
      '.alr-f label{display:block;font-size:.76rem;font-weight:700;color:#475569;margin:0 0 .25rem}',
      '.alr-f select,.alr-f input{min-height:38px;padding:0 10px;border:1.5px solid #C7D2E6;border-radius:9px;font:600 .92rem Barlow,sans-serif;background:#fff}',
      '.alr-kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem;margin:.9rem 0}',
      '.alr-kpi div{border-radius:12px;padding:.65rem .8rem;border:1px solid #E2E8F0;background:#F8FAFC}',
      '.alr-kpi span{display:block;font-size:.72rem;font-weight:700;color:#475569;text-transform:uppercase}',
      '.alr-kpi b{display:block;font-size:1.65rem;line-height:1.15}',
      '.alr-h3{font-size:1rem;color:#0E2A5C;margin:1.1rem 0 .4rem;font-weight:800}',
      '.alr-t{width:100%;border-collapse:collapse;font-size:.85rem}',
      '.alr-t th{background:#F8FAFC;color:#475569;text-align:left;padding:.5rem .5rem;border-bottom:1px solid #E2E8F0;font-size:.74rem;white-space:nowrap}',
      '.alr-t td{padding:.48rem .5rem;border-bottom:1px solid #EEF2F6;vertical-align:middle}',
      '.alr-m td.c{text-align:center;font-weight:800;cursor:pointer;border-radius:6px}',
      '.alr-pill{display:inline-block;font-size:.74rem;font-weight:800;border-radius:999px;padding:.15rem .55rem;white-space:nowrap}',
      '.alr-vacio{padding:1.4rem;text-align:center;color:#64748B;background:#F8FAFC;border-radius:12px}',
      '.alr-form{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:.8rem;margin:.3rem 0}'
    ].join('\n');
    document.head.appendChild(st);
  }
  var col = function (p) { return p == null ? ['#F1F5F9', '#94A3B8'] : p < MIN ? ['#FEE2E2', '#B91C1C'] : p < VIGILAR ? ['#FEF3C7', '#B45309'] : ['#DCFCE7', '#15803D']; };
  var EST = { pendiente: ['🔴 Pendiente', '#FEE2E2', '#B91C1C'], reforzado: ['🟡 Reforzado · falta re-evaluar', '#FEF3C7', '#92400E'], reevaluar: ['🟠 Re-evaluada: sigue bajo', '#FFEDD5', '#C2410C'], superada: ['✅ Superada', '#DCFCE7', '#15803D'] };
  var M = null, EST_DATOS = null;
  function abrir() {
    css(); if (M) M.remove();
    var c = cicloActual();
    M = document.createElement('div'); M.className = 'alr-ov';
    M.innerHTML = '<div class="alr-box" role="dialog" aria-modal="true"><div class="alr-hd"><div><b>🚨 Alertas de reforzamiento por ruta y tema</b><small>Rutas con menos de 70 % en un tema de la evaluación ETI · ' + (esEditor() ? 'todas las rutas' : 'tus rutas') + ' · el reforzamiento se registra aquí y la siguiente evaluación dice si se superó</small></div><button class="alr-b" id="alr-x">✕</button></div>' +
      '<div class="alr-bd"><div class="alr-f"><div><label>Ciclo</label><select id="alr-ci">' + ciclos().map(function (x) { return '<option value="' + x.id + '"' + (x.id === c.id ? ' selected' : '') + '>' + x.nom + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Empresa</label><select id="alr-emp"><option value="">Todas</option><option>VERFRUT</option><option>RAPEL</option></select></div>' +
      (esEditor() ? '<div><label>Supervisor</label><select id="alr-sup"><option value="">Todos</option></select></div>' : '') +
      '<div><label>Estado</label><select id="alr-est"><option value="">Todos</option><option value="abiertas" selected>Por atender</option><option value="pendiente">Pendientes</option><option value="reforzado">Reforzadas</option><option value="superada">Superadas</option></select></div>' +
      '<div style="margin-left:auto;display:flex;gap:.4rem"><button class="alr-b" id="alr-act">↻ Actualizar</button>' + (window.XLSX ? '<button class="alr-b" id="alr-xls">⬇️ Excel</button>' : '') + '</div></div><div id="alr-out"><p>⏳ Calculando…</p></div></div></div>';
    document.body.appendChild(M);
    $('alr-x').onclick = function () { M.remove(); M = null; };
    $('alr-ci').onchange = cargar; $('alr-act').onclick = cargar;
    ['alr-emp', 'alr-sup', 'alr-est'].forEach(function (id) { if ($(id)) $(id).onchange = pintar; });
    if ($('alr-xls')) $('alr-xls').onclick = excel;
    cargar();
  }
  async function datosCiclo(c) {
    var s = ses() || {}, F = await filas(c.desde, c.hasta, esEditor() ? '' : s.user), S = await consultar('alertas_ref', [['ciclo', '==', c.id]]), segs = {};
    S.forEach(function (x) { segs[x._id] = x; });
    if (!esEditor()) F = F.filter(function (x) { return x.user === s.user || (s.nom && x.sup === s.nom); });
    return analizar(F, c.id, segs);
  }
  async function cargar() {
    var c = ciclos().find(function (x) { return x.id === $('alr-ci').value; }); $('alr-out').innerHTML = '<p>⏳ Calculando ' + esc(c.nom) + '…</p>';
    try { EST_DATOS = await datosCiclo(c); EST_DATOS.ciclo = c; }
    catch (e) { $('alr-out').innerHTML = '<div class="alr-vacio">No se pudo calcular: ' + esc(e.message) + '</div>'; return; }
    if ($('alr-sup')) { var v = $('alr-sup').value, o = {}; EST_DATOS.alertas.forEach(function (a) { o[a.sup] = 1; });
      $('alr-sup').innerHTML = '<option value="">Todos</option>' + Object.keys(o).sort().map(function (x) { return '<option' + (x === v ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join(''); }
    pintar(); contador(EST_DATOS);
  }
  function filtradas() {
    var e = ($('alr-emp') || {}).value, su = ($('alr-sup') || {}).value, es = ($('alr-est') || {}).value;
    return EST_DATOS.alertas.filter(function (a) { return (!e || a.emp.indexOf(e) === 0) && (!su || a.sup === su) && (!es || (es === 'abiertas' ? a.estado !== 'superada' : a.estado === es)); });
  }
  function pintar() {
    var D = EST_DATOS, out = $('alr-out'); if (!D || !out) return;
    var e = ($('alr-emp') || {}).value, R = D.rutas.filter(function (r) { return !e || r.emp.indexOf(e) === 0; }), A = filtradas();
    var tot = D.alertas.filter(function (a) { return !e || a.emp.indexOf(e) === 0; }), cnt = function (s) { return tot.filter(function (a) { return a.estado === s; }).length; };
    var rutasAl = {}; tot.forEach(function (a) { rutasAl[a.emp + a.sector + a.cod + a.ruta] = 1; });
    var h = '<div class="alr-kpi"><div><span>Rutas evaluadas</span><b>' + R.length + '</b></div><div><span>Rutas con alerta</span><b style="color:#B91C1C">' + Object.keys(rutasAl).length + '</b></div>' +
      '<div><span>🔴 Pendientes</span><b style="color:#B91C1C">' + cnt('pendiente') + '</b></div><div><span>🟡 Reforzadas</span><b style="color:#B45309">' + (cnt('reforzado') + cnt('reevaluar')) + '</b></div><div><span>✅ Superadas</span><b style="color:#15803D">' + cnt('superada') + '</b></div></div>';
    if (esEditor() && R.length) h += matriz(R);
    h += '<div class="alr-h3">📋 Alertas (' + A.length + ')</div>';
    h += !A.length ? '<div class="alr-vacio">' + (tot.length ? 'No hay alertas con estos filtros.' : '🎉 Ninguna ruta por debajo del 70 % en este ciclo.') + '</div>' :
      '<div style="overflow-x:auto"><table class="alr-t"><thead><tr><th>Sector</th><th>Ruta</th><th>Tema</th><th>%</th><th>Evaluados</th>' + (esEditor() ? '<th>Supervisor</th>' : '') + '<th>Estado</th><th></th></tr></thead><tbody>' +
      A.map(function (a, i) {
        var c = col(a.pct), es = EST[a.estado];
        return '<tr><td>' + esc(a.sector) + '<br><small style="color:#64748B">' + esc(a.emp) + '</small></td><td><b>' + esc(a.ruta || '—') + '</b>' + (a.cod ? '<br><small style="color:#64748B">Cód. ' + esc(a.cod) + '</small>' : '') + '</td><td>' + esc(a.tema) + '</td>' +
          '<td><span class="alr-pill" style="background:' + c[0] + ';color:' + c[1] + '">' + P(a.pct) + '</span></td><td>' + a.n + (a.chica ? ' <span title="Menos de ' + MUESTRA + ' evaluados: tómalo con cuidado" style="color:#B45309">⚠️ muestra pequeña</span>' : '') + '</td>' +
          (esEditor() ? '<td>' + esc(a.sup) + '</td>' : '') +
          '<td><span class="alr-pill" style="background:' + es[1] + ';color:' + es[2] + '">' + es[0] + '</span>' + (a.seg ? '<br><small style="color:#64748B">Reforzado ' + esc(fF(a.seg.fechaRef)) + ' · ' + esc(a.seg.modalidad || '') + '</small>' : '') + (a.post ? '<br><small style="color:#64748B">Re-evaluación: ' + P(a.post.pct) + ' (' + a.post.n + ')</small>' : '') + '</td>' +
          '<td>' + (a.estado === 'superada' ? '' : '<button class="alr-b' + (a.estado === 'pendiente' ? ' p' : '') + '" data-i="' + i + '">' + (a.seg ? '✏️ Editar' : '✍️ Registrar reforzamiento') + '</button>') + '</td></tr><tr id="alr-f' + i + '" style="display:none"><td colspan="8"></td></tr>';
      }).join('') + '</tbody></table></div>';
    h += '<p style="font-size:.78rem;color:#64748B;margin-top:.8rem">Cómo se calcula: % promedio de la ruta en el tema (QR por persona + manual por ruta, ponderado por evaluados). 🔴 menos de 70 % · 🟡 70–79 % · 🟢 80 % o más. Una alerta queda <b>superada</b> cuando las evaluaciones de esa ruta y tema posteriores al reforzamiento llegan a 70 %.</p>';
    out.innerHTML = h;
    Array.prototype.forEach.call(out.querySelectorAll('[data-i]'), function (b) { b.onclick = function () { formulario(A[+b.getAttribute('data-i')], +b.getAttribute('data-i')); }; });
    Array.prototype.forEach.call(out.querySelectorAll('[data-sec]'), function (td) { td.onclick = function () { if ($('alr-est')) $('alr-est').value = ''; pintarFiltroSector(td.getAttribute('data-sec'), td.getAttribute('data-tema')); }; });
  }
  function matriz(R) {
    var temas = {}, sects = {};
    R.forEach(function (r) { sects[r.sector || '—'] = sects[r.sector || '—'] || {}; Object.keys(r.temas).forEach(function (id) { temas[id] = r.temas[id].nom; var a = r.res[id]; if (!a) return;
      var x = sects[r.sector || '—'][id] || (sects[r.sector || '—'][id] = { s: 0, n: 0, al: 0 }); x.s += a.pct * a.n; x.n += a.n; if (a.pct < MIN) x.al++; }); });
    var T = Object.keys(temas);
    return '<div class="alr-h3">🗺️ Sector × tema (promedio del sector · 🔴 n = rutas en alerta)</div><div style="overflow-x:auto"><table class="alr-t alr-m"><thead><tr><th>Sector</th>' + T.map(function (id) { return '<th title="' + esc(temas[id]) + '">' + esc(String(temas[id]).slice(0, 22)) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      Object.keys(sects).sort().map(function (s) { return '<tr><td><b>' + esc(s) + '</b></td>' + T.map(function (id) { var x = sects[s][id]; if (!x) return '<td class="c" style="color:#CBD5E1">—</td>'; var p = x.s / x.n, c = col(p);
        return '<td class="c" data-sec="' + esc(s) + '" data-tema="' + esc(temas[id]) + '" style="background:' + c[0] + ';color:' + c[1] + '">' + P(p) + (x.al ? '<br><small>🔴 ' + x.al + '</small>' : '') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function pintarFiltroSector(sec, tema) {
    pintar();
    Array.prototype.forEach.call($('alr-out').querySelectorAll('.alr-t:not(.alr-m) tbody tr'), function (tr) { if (!tr.id && (tr.children[0].textContent.indexOf(sec) !== 0 || tr.children[2].textContent !== tema)) tr.style.display = 'none'; });
    aviso('Mostrando ' + sec + ' · ' + tema, 'i');
  }
  function formulario(a, i) {
    var tr = $('alr-f' + i); if (!tr) return; if (tr.style.display !== 'none') { tr.style.display = 'none'; return; }
    var s = a.seg || {};
    tr.children[0].innerHTML = '<div class="alr-form alr-f"><div><label>Fecha del reforzamiento</label><input type="date" id="alr-fr' + i + '" value="' + esc(s.fechaRef || hoy()) + '" max="' + hoy() + '"></div>' +
      '<div><label>Modalidad</label><select id="alr-mo' + i + '">' + ['Charla de reforzamiento', 'Visita a la ruta', 'Charla de 5 minutos', 'Entrega de material'].map(function (m) { return '<option' + (m === s.modalidad ? ' selected' : '') + '>' + m + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Personas reforzadas</label><input type="number" min="1" id="alr-np' + i + '" value="' + esc(s.personas || a.n) + '" style="width:110px"></div>' +
      '<div style="flex:1;min-width:220px"><label>Qué se reforzó / observación</label><input id="alr-no' + i + '" value="' + esc(s.nota || '') + '" placeholder="Ej. Se explicó de nuevo el canal de quejas con casos" style="width:100%"></div>' +
      '<div><button class="alr-b p" id="alr-ok' + i + '">💾 Guardar</button></div></div><small style="color:#64748B">Después del reforzamiento vuelve a evaluar a la ruta: si llega a 70 % la alerta pasa a ✅ superada.</small>';
    tr.style.display = '';
    $('alr-ok' + i).onclick = async function () {
      var b = this, S = ses() || {}, f = $('alr-fr' + i).value;
      if (!f) { aviso('Elige la fecha', 'e'); return; }
      b.disabled = true; b.textContent = '⏳';
      var datos = { ciclo: a.ciclo, emp: a.emp, sector: a.sector, ruta: a.ruta, cod: a.cod, tema: a.tema, temaId: a.temaId, pctAntes: a.pct, nAntes: a.n, sup: a.sup, usuarioSup: a.user,
        fechaRef: f, modalidad: $('alr-mo' + i).value, personas: +$('alr-np' + i).value || 0, nota: $('alr-no' + i).value.trim(), por: S.user, nomPor: S.nom, en: new Date().toISOString(), ts: Date.now() };
      try { await post('eti/escribir', { ops: [{ col: 'alertas_ref', id: a.id, op: 'set', datos: datos, origen: 'alertas' }] }); aviso('✅ Reforzamiento registrado', 's'); cargar(); }
      catch (e) { aviso('No se pudo guardar: ' + e.message, 'e'); b.disabled = false; b.textContent = '💾 Guardar'; }
    };
  }
  function excel() {
    if (!EST_DATOS || !window.XLSX) return;
    var F = filtradas().map(function (a) { return { Ciclo: EST_DATOS.ciclo.nom, Empresa: a.emp, Sector: a.sector, Ruta: a.ruta, Codigo: a.cod, Tema: a.tema, 'Porcentaje': Math.round(a.pct * 1000) / 10, Evaluados: a.n, 'Muestra pequeña': a.chica ? 'Sí' : '',
      Supervisor: a.sup, Estado: EST[a.estado][0].replace(/^\S+\s/, ''), 'Fecha reforzamiento': a.seg ? a.seg.fechaRef : '', Modalidad: a.seg ? a.seg.modalidad : '', Nota: a.seg ? a.seg.nota : '', 'Re-evaluación %': a.post ? Math.round(a.post.pct * 1000) / 10 : '' }; });
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(F), 'Alertas'); XLSX.writeFile(wb, 'Alertas_reforzamiento_' + EST_DATOS.ciclo.id + '.xlsx');
  }

  /* ── 2) menu + contador de pendientes + aviso al entrar ── */
  function contador(D) {
    var n = D.alertas.filter(function (a) { return a.estado === 'pendiente' || a.estado === 'reevaluar'; }).length, b = $('alr-menu');
    if (b) { var c = b.querySelector('.alr-n'); if (!c) { c = document.createElement('span'); c.className = 'alr-n'; c.style.cssText = 'margin-left:auto;background:#DC2626;color:#fff;border-radius:999px;font-size:.72rem;font-weight:800;padding:.05rem .45rem'; b.appendChild(c); }
      c.textContent = n; c.style.display = n ? '' : 'none'; }
    return n;
  }
  var avisado = false;
  async function avisoInicial() {
    if (avisado || !ses() || !token()) return; avisado = true;
    try {
      var c = cicloActual(), D = await datosCiclo(c), n = contador(D);
      if (n && !esEditor()) aviso('🚨 Tienes ' + n + ' alerta' + (n === 1 ? '' : 's') + ' de reforzamiento en tus rutas (' + c.nom + '). Revisa el menú "Alertas de reforzamiento".', 'e');
    } catch (e) { avisado = false; }
  }
  function menu() {
    var nav = $('es-nav'); if (!nav || !ses()) return;
    if (!$('alr-menu')) {
      var b = document.createElement('button'); b.id = 'alr-menu'; b.className = 'es-it'; b.type = 'button';
      b.innerHTML = '<span>🚨</span><span>Alertas de reforzamiento</span>';
      b.onclick = function () { document.body.classList.remove('side-open'); abrir(); };
      var ref = $('enc-menu') || $('inf-menu');
      if (ref && ref.parentNode === nav) nav.insertBefore(b, ref.nextSibling); else nav.appendChild(b);
    }
    avisoInicial();
  }
  window.etiAlertasRef = { abrir: abrir, analizar: analizar, filas: filas, ciclos: ciclos, version: 1 };
  setInterval(menu, 1500); setTimeout(menu, 500);
  try { console.log('[_ALERTAS_REF_V1] listo'); } catch (e) {}
})();
