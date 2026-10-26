# Graph Report - Sistema - Evaluacion Eti  (2026-10-26)

## Corpus Check
- 19 files · ~108,310 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 549 nodes · 1317 edges · 31 communities (25 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b9a0c958`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- solreprog.js
- lib/eti-informe-checklist.js
- respuestas-auditoria.js
- .mod
- 05-banco-respuestas.js
- 10-mis-evaluaciones.js
- 01-nucleo-evaluaciones.js
- eti-alerta-ruta.js
- 06-indicadores.js
- renderChat
- eti-informe-gh04.js
- iniciarSesionCon
- maxEv
- toast
- fmtF
- 03-guia.js
- 09-trafico-vivo.js
- actualizar
- getProgs
- go
- renderCumplimiento
- 07-shell-rl.js
- 📊 Conectar el Sistema con Google Sheets
- acCerrar
- calcular
- Subir a producción — Evaluaciones ETI (03-oct-2026, v2 con QR permanente)
- 04-trafico-emisor.js
- README.md

## God Nodes (most connected - your core abstractions)
1. `toast()` - 39 edges
2. `iniciarSesionCon()` - 19 edges
3. `fmtF()` - 19 edges
4. `renderBanco()` - 19 edges
5. `excel()` - 19 edges
6. `bkMarcar()` - 17 edges
7. `hoy()` - 16 edges
8. `render()` - 15 edges
9. `enviarInforme()` - 15 edges
10. `go()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `render()` --indirect_call--> `fF()`  [INFERRED]
  js/10-mis-evaluaciones.js → respuestas-auditoria.js
- `rptInforme()` --indirect_call--> `fF()`  [INFERRED]
  js/10-mis-evaluaciones.js → respuestas-auditoria.js
- `rptChecklist()` --indirect_call--> `fF()`  [INFERRED]
  js/10-mis-evaluaciones.js → respuestas-auditoria.js
- `ok()` --indirect_call--> `sup()`  [INFERRED]
  respuestas-auditoria.js → js/10-mis-evaluaciones.js
- `etiBandeja` --indirect_call--> `poner()`  [INFERRED]
  js/01-nucleo-evaluaciones.js → respuestas-auditoria.js

## Import Cycles
- None detected.

## Communities (31 total, 6 thin omitted)

### Community 0 - "solreprog.js"
Cohesion: 0.29
Nodes (13): cargar(), css(), dm(), enc(), enviar(), esc(), hoy(), norm() (+5 more)

### Community 1 - "lib/eti-informe-checklist.js"
Cohesion: 0.42
Nodes (8): clonar(), conclusionAuto(), dmy(), etiInformeChecklist(), fLarga(), razon(), rep(), semanaISO()

### Community 2 - "respuestas-auditoria.js"
Cohesion: 0.12
Nodes (41): etiBandeja, abrir(), aviso(), cargar(), correctasSesion(), orden(), pasa(), cargarExcelJS() (+33 more)

### Community 4 - "05-banco-respuestas.js"
Cohesion: 0.05
Nodes (80): abierta(), abrirQR(), accSet(), accTodos(), actualizarPermanentes(), aplicarAccesosMenu(), aplicarBanco(), arranque() (+72 more)

### Community 5 - "10-mis-evaluaciones.js"
Cohesion: 0.11
Nodes (47): abrir(), banner(), cargarInformes(), cargarScript(), cargarTodos(), checklistDe(), crearPantalla(), cuadrosHTML() (+39 more)

### Community 6 - "01-nucleo-evaluaciones.js"
Cohesion: 0.06
Nodes (29): AREAS, _chatMsgs, _chatNotif, detenerChat(), detenerPresencia(), doLogout(), _etiRevalidarAdmin(), _evalsUnsub (+21 more)

### Community 7 - "eti-alerta-ruta.js"
Cohesion: 0.60
Nodes (3): esc(), mostrar(), pct()

### Community 8 - "06-indicadores.js"
Cohesion: 0.10
Nodes (36): agregar(), aplicar(), aplicarCambio(), arr(), azAdmin(), azPost(), buscar(), cargar() (+28 more)

### Community 9 - "renderChat"
Cohesion: 0.13
Nodes (29): abrirChatCon(), actualizarBadgeConectados(), actualizarChatBadge(), chatVolverLista(), crearChatUI(), enviarChatMsg(), escHtml(), escucharPresenciaAdmin() (+21 more)

### Community 10 - "eti-informe-gh04.js"
Cohesion: 0.83
Nodes (3): b64bytes(), build(), etiInformeGH04()

### Community 12 - "iniciarSesionCon"
Cohesion: 0.14
Nodes (22): actualizarAlertaProgP1(), doLogin(), _etiError(), exportAdminExcel(), exportarExcelCompleto(), getAllHist(), getUsuarios(), hoy() (+14 more)

### Community 13 - "maxEv"
Cohesion: 0.21
Nodes (20): avisoPts(), buildEvOpts(), calcPct(), maxEv(), mkAc(), mkCuest(), onPts(), onSel() (+12 more)

### Community 14 - "toast"
Cohesion: 0.19
Nodes (19): addUser(), confMod(), copiar(), copiarDirecto(), delUser(), descargar(), enviarCorreo(), enviarCorreoDirecto() (+11 more)

### Community 15 - "fmtF"
Cohesion: 0.15
Nodes (19): adminTab(), buildCuadrosSemaforo(), buildDestiempoHTML(), exportarPDF(), fechasPendientes(), fmtF(), getSectorActual(), mdestAbrir() (+11 more)

### Community 16 - "03-guia.js"
Cohesion: 0.22
Nodes (18): activa(), arrancar(), bot(), crear(), esc(), guia(), lista(), miCumplimiento() (+10 more)

### Community 17 - "09-trafico-vivo.js"
Cohesion: 0.21
Nodes (15): abrir(), avisoRespaldo(), chequeo(), css(), dia(), escuchar(), exportar(), exportarDlg() (+7 more)

### Community 18 - "actualizar"
Cohesion: 0.19
Nodes (17): actualizar(), cargarCaps(), cargarEvals(), cargarRRLL(), coincide(), escA(), fmtD(), fsDocs() (+9 more)

### Community 19 - "getProgs"
Cohesion: 0.25
Nodes (14): getProgs(), marcarProgEjecutada(), mreprCerrar(), mreprGuardar(), pgAddFecha(), pgDelFecha(), pgEliminar(), pgGuardar() (+6 more)

### Community 20 - "go"
Cohesion: 0.24
Nodes (11): agregarArea(), go(), iniciar(), iniciarComoAdmin(), mdestCerrar(), mdestConfirmar(), p1continue(), p2next() (+3 more)

### Community 21 - "renderCumplimiento"
Cohesion: 0.25
Nodes (11): _alRecibirEvals(), _cumCoincide(), _cumRefrescarSiVisible(), detenerEvalsNube(), escCob(), escucharEvalsNube(), escucharNube(), guardarAtribucion() (+3 more)

### Community 22 - "07-shell-rl.js"
Cohesion: 0.35
Nodes (10): actualizar(), armarNav(), arranque(), crear(), heroAdmin(), heroSup(), it(), mover() (+2 more)

### Community 23 - "📊 Conectar el Sistema con Google Sheets"
Cohesion: 0.22
Nodes (8): 📊 Conectar el Sistema con Google Sheets, Código Apps Script (copiar completo), Notas, Paso 1 — Crear la hoja, Paso 2 — Abrir el editor de Apps Script, Paso 3 — Publicar como aplicación web, Paso 4 — Pegar la URL en el sistema, Paso 5 — Publicar

### Community 24 - "acCerrar"
Cohesion: 0.32
Nodes (8): acCerrar(), acEsc(), acFuera(), acMostrar(), acQuitar(), acUkey(), acUser(), acVerificar()

### Community 25 - "calcular"
Cohesion: 0.33
Nodes (7): calcular(), _detBanco(), _detManual(), enviarASheets(), evPresente(), guardarEvalNube(), pgTestSheets()

### Community 26 - "Subir a producción — Evaluaciones ETI (03-oct-2026, v2 con QR permanente)"
Cohesion: 0.33
Nodes (5): 1. Publicar (PowerShell) — pega SOLO este bloque, 2. Configurar (una sola vez, como jtimoteo), 3. Prueba antes de usarlo con el personal, 4. Solo si algo falla: volver atrás (NO pegarlo junto con el paso 1), Subir a producción — Evaluaciones ETI (03-oct-2026, v2 con QR permanente)

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `etiBandeja` connect `respuestas-auditoria.js` to `01-nucleo-evaluaciones.js`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `fmtF()` (e.g. with `actualizarAlertaProgP1()` and `buildDestiempoHTML()`) actually correct?**
  _`fmtF()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `respuestas-auditoria.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12427409988385599 - nodes in this community are weakly interconnected._
- **Why does `fF()` connect `respuestas-auditoria.js` to `10-mis-evaluaciones.js`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `05-banco-respuestas.js` be split into smaller, more focused modules?**
  _Cohesion score 0.054075235109717866 - nodes in this community are weakly interconnected._
- **Should `10-mis-evaluaciones.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1110204081632653 - nodes in this community are weakly interconnected._
- **Should `01-nucleo-evaluaciones.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06153846153846154 - nodes in this community are weakly interconnected._