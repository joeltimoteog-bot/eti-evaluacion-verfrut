# Graph Report - Sistema - Evaluacion Eti  (2026-11-10)

## Corpus Check
- 33 files · ~177,307 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .diff 1)

## Summary
- 746 nodes · 1733 edges · 41 communities (33 shown, 8 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 98 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8bad903d`
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
- iniciarSesionCon
- 03-guia.js
- 09-trafico-vivo.js
- actualizar
- getProgs
- go
- renderCumplimiento
- 07-shell-rl.js
- 📊 Conectar el Sistema con Google Sheets
- 14-informe-eti-v1.js
- 15-encuesta-sat-v1.js
- Subir a producción — Evaluaciones ETI (03-oct-2026, v2 con QR permanente)
- 04-trafico-emisor.js
- README.md
- 16-alertas-ref-v1.js
- 19-centro-informes-v1.js
- 17-informe-ciclo-v1.js
- 20-informe-capacitaciones-v1.js
- 12-informe-auditoria-v1.js
- 11-historico-2026-v1.js
- eti-informe-ciclo.js
- ETI-Base-completa-al-2026-11-05_b5ed297b.md
- 13-menu-depurado-v1.js

## God Nodes (most connected - your core abstractions)
1. `toast()` - 39 edges
2. `fmtF()` - 19 edges
3. `iniciarSesionCon()` - 19 edges
4. `excel()` - 19 edges
5. `renderBanco()` - 19 edges
6. `bkMarcar()` - 17 edges
7. `hoy()` - 16 edges
8. `fF()` - 16 edges
9. `enviarInforme()` - 15 edges
10. `render()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `etiBandeja` --indirect_call--> `poner()`  [INFERRED]
  js/01-nucleo-evaluaciones.js → respuestas-auditoria.js
- `ok()` --indirect_call--> `sup()`  [INFERRED]
  respuestas-auditoria.js → js/10-mis-evaluaciones.js
- `render()` --indirect_call--> `fF()`  [INFERRED]
  js/10-mis-evaluaciones.js → respuestas-auditoria.js
- `rptChecklist()` --indirect_call--> `fF()`  [INFERRED]
  js/10-mis-evaluaciones.js → respuestas-auditoria.js
- `rptInforme()` --indirect_call--> `fF()`  [INFERRED]
  js/10-mis-evaluaciones.js → respuestas-auditoria.js

## Import Cycles
- None detected.

## Communities (41 total, 8 thin omitted)

### Community 0 - "solreprog.js"
Cohesion: 0.29
Nodes (13): cargar(), css(), dm(), enc(), enviar(), esc(), hoy(), norm() (+5 more)

### Community 1 - "lib/eti-informe-checklist.js"
Cohesion: 0.35
Nodes (10): clonar(), conclusionAuto(), dibujo(), dmy(), etiInformeChecklist(), fLarga(), ponerFotos(), razon() (+2 more)

### Community 2 - "respuestas-auditoria.js"
Cohesion: 0.13
Nodes (39): abrir(), aviso(), cargar(), correctasSesion(), orden(), pasa(), cargarExcelJS(), cmp() (+31 more)

### Community 4 - "05-banco-respuestas.js"
Cohesion: 0.05
Nodes (80): abierta(), abrirQR(), accSet(), accTodos(), actualizarPermanentes(), aplicarAccesosMenu(), aplicarBanco(), arranque() (+72 more)

### Community 5 - "10-mis-evaluaciones.js"
Cohesion: 0.11
Nodes (47): abrir(), banner(), cargarInformes(), cargarScript(), cargarTodos(), checklistDe(), crearPantalla(), cuadrosHTML() (+39 more)

### Community 6 - "01-nucleo-evaluaciones.js"
Cohesion: 0.06
Nodes (38): acCerrar(), acEsc(), acFuera(), acMostrar(), acQuitar(), acUkey(), acUser(), acVerificar() (+30 more)

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
Nodes (21): addUser(), confMod(), delUser(), etiHash(), etiUsrActivo(), etiUsrRestaurar(), _evCargarElimRL(), exportAdminExcel() (+13 more)

### Community 13 - "maxEv"
Cohesion: 0.19
Nodes (22): avisoPts(), buildEvOpts(), calcPct(), calcular(), evPresente(), maxEv(), mkAc(), mkCuest() (+14 more)

### Community 14 - "toast"
Cohesion: 0.17
Nodes (22): buildCuadrosSemaforo(), buildDestiempoHTML(), copiar(), copiarDirecto(), descargar(), enviarCorreo(), enviarCorreoDirecto(), exportar() (+14 more)

### Community 15 - "iniciarSesionCon"
Cohesion: 0.16
Nodes (19): actualizarAlertaProgP1(), _detBanco(), _detManual(), enviarASheets(), fechasPendientes(), getSectorActual(), guardarEvalNube(), hoy() (+11 more)

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
Cohesion: 0.21
Nodes (13): agregarArea(), go(), iniciar(), iniciarComoAdmin(), mdestCerrar(), mdestConfirmar(), p1continue(), p2next() (+5 more)

### Community 21 - "renderCumplimiento"
Cohesion: 0.18
Nodes (15): adminTab(), _alRecibirEvals(), _cumCoincide(), _cumRefrescarSiVisible(), detenerEvalsNube(), escCob(), escucharEvalsNube(), escucharNube() (+7 more)

### Community 22 - "07-shell-rl.js"
Cohesion: 0.35
Nodes (10): actualizar(), armarNav(), arranque(), crear(), heroAdmin(), heroSup(), it(), mover() (+2 more)

### Community 23 - "📊 Conectar el Sistema con Google Sheets"
Cohesion: 0.22
Nodes (8): 📊 Conectar el Sistema con Google Sheets, Código Apps Script (copiar completo), Notas, Paso 1 — Crear la hoja, Paso 2 — Abrir el editor de Apps Script, Paso 3 — Publicar como aplicación web, Paso 4 — Pegar la URL en el sistema, Paso 5 — Publicar

### Community 24 - "14-informe-eti-v1.js"
Cohesion: 0.12
Nodes (35): etiBandeja, aBase64(), aIso(), avisoCulminado(), cargar(), completar(), corregir(), correoHref() (+27 more)

### Community 25 - "15-encuesta-sat-v1.js"
Cohesion: 0.17
Nodes (29): abrir(), cerrar(), consultar(), crearQR(), css(), esEditor(), estado(), excel() (+21 more)

### Community 26 - "Subir a producción — Evaluaciones ETI (03-oct-2026, v2 con QR permanente)"
Cohesion: 0.33
Nodes (5): 1. Publicar (PowerShell) — pega SOLO este bloque, 2. Configurar (una sola vez, como jtimoteo), 3. Prueba antes de usarlo con el personal, 4. Solo si algo falla: volver atrás (NO pegarlo junto con el paso 1), Subir a producción — Evaluaciones ETI (03-oct-2026, v2 con QR permanente)

### Community 31 - "16-alertas-ref-v1.js"
Cohesion: 0.19
Nodes (26): abrir(), analizar(), avisoInicial(), cargar(), cargarProgsRef(), cicloActual(), ciclos(), consultar() (+18 more)

### Community 32 - "19-centro-informes-v1.js"
Cohesion: 0.17
Nodes (25): abrirCentro(), abrirCentroRL(), abrirExpediente(), autoAbrir(), cerrar(), cerrarLateral(), cicloSel(), css() (+17 more)

### Community 33 - "17-informe-ciclo-v1.js"
Cohesion: 0.19
Nodes (21): abrir(), armar(), cargarJS(), conclusiones(), consultar(), css(), cumplimiento(), datos() (+13 more)

### Community 34 - "20-informe-capacitaciones-v1.js"
Cohesion: 0.22
Nodes (16): abrir(), armar(), conclusiones(), consultar(), datos(), documento(), esEditor(), excel() (+8 more)

### Community 35 - "12-informe-auditoria-v1.js"
Cohesion: 0.32
Nodes (10): abrir(), abrirReporte(), datos(), grupos(), historico(), hojas(), idxTema(), lunesDe() (+2 more)

### Community 36 - "11-historico-2026-v1.js"
Cohesion: 0.32
Nodes (4): azAdmin(), azEliminarDoc(), ruta(), secsDe()

### Community 37 - "eti-informe-ciclo.js"
Cohesion: 0.60
Nodes (3): b64bytes(), build(), etiInformeCiclo()

### Community 38 - "ETI-Base-completa-al-2026-11-05_b5ed297b.md"
Cohesion: 0.50
Nodes (3): Sheet: Evaluaciones, Sheet: Por pregunta (QR), Sheet: Por supervisor

## Knowledge Gaps
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `etiBandeja` connect `14-informe-eti-v1.js` to `respuestas-auditoria.js`, `01-nucleo-evaluaciones.js`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `fmtF()` (e.g. with `actualizarAlertaProgP1()` and `buildDestiempoHTML()`) actually correct?**
  _`fmtF()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `respuestas-auditoria.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1294871794871795 - nodes in this community are weakly interconnected._
- **Why does `poner()` connect `respuestas-auditoria.js` to `14-informe-eti-v1.js`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Should `05-banco-respuestas.js` be split into smaller, more focused modules?**
  _Cohesion score 0.054075235109717866 - nodes in this community are weakly interconnected._
- **Why does `fF()` connect `14-informe-eti-v1.js` to `respuestas-auditoria.js`, `10-mis-evaluaciones.js`, `16-alertas-ref-v1.js`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Should `10-mis-evaluaciones.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11020408163265306 - nodes in this community are weakly interconnected._