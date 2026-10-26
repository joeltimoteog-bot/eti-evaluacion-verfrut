# Graph Report - Sistema - Evaluacion Eti  (2026-10-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 82 nodes · 175 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8755df5f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- solreprog.js
- lib/eti-informe-checklist.js
- grupos
- .mod
- cargar
- hojas
- excel
- eti-alerta-ruta.js
- respuestas-auditoria.js
- abrir
- eti-informe-gh04.js

## God Nodes (most connected - your core abstractions)
1. `excel()` - 19 edges
2. `hojas()` - 13 edges
3. `abrir()` - 13 edges
4. `cargar()` - 9 edges
5. `etiInformeChecklist()` - 8 edges
6. `tituloSup()` - 8 edges
7. `excelSimple()` - 8 edges
8. `grupos()` - 7 edges
9. `norm()` - 7 edges
10. `cargar()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `cargar()` --indirect_call--> `pasa()`  [INFERRED]
  respuestas-auditoria.js → respuestas-auditoria.js  _Bridges community 2 → community 4_
- `excel()` --calls--> `cargarExcelJS()`  [EXTRACTED]
  respuestas-auditoria.js → respuestas-auditoria.js  _Bridges community 2 → community 6_
- `abrir()` --calls--> `grupos()`  [EXTRACTED]
  respuestas-auditoria.js → respuestas-auditoria.js  _Bridges community 2 → community 9_
- `hojas()` --calls--> `grupos()`  [EXTRACTED]
  respuestas-auditoria.js → respuestas-auditoria.js  _Bridges community 2 → community 5_
- `abrir()` --calls--> `cargar()`  [EXTRACTED]
  respuestas-auditoria.js → respuestas-auditoria.js  _Bridges community 4 → community 9_

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - "solreprog.js"
Cohesion: 0.29
Nodes (13): cargar(), css(), dm(), enc(), enviar(), esc(), hoy(), norm() (+5 more)

### Community 1 - "lib/eti-informe-checklist.js"
Cohesion: 0.42
Nodes (8): clonar(), conclusionAuto(), dmy(), etiInformeChecklist(), fLarga(), razon(), rep(), semanaISO()

### Community 2 - "grupos"
Cohesion: 0.25
Nodes (9): pasa(), cargarExcelJS(), coincide(), grupos(), g(), gs(), norm(), subconjunto() (+1 more)

### Community 4 - "cargar"
Cohesion: 0.36
Nodes (8): cargar(), correctasSesion(), orden(), cmp(), fs(), secTxt(), sha(), supTxt()

### Community 5 - "hojas"
Cohesion: 0.43
Nodes (7): esc(), hojas(), tablaGrupos(), hora(), nombreArchivo(), razonSocial(), tituloSup()

### Community 6 - "excel"
Cohesion: 0.43
Nodes (7): estilo(), excel(), cabecera(), encabezados(), pctCelda(), fill(), modTxt()

### Community 7 - "eti-alerta-ruta.js"
Cohesion: 0.60
Nodes (3): esc(), mostrar(), pct()

### Community 8 - "respuestas-auditoria.js"
Cohesion: 0.60
Nodes (4): esAdm(), filtrosPantalla(), poner(), ses()

### Community 9 - "abrir"
Cohesion: 0.60
Nodes (5): abrir(), aviso(), excelSimple(), fF(), pc()

### Community 10 - "eti-informe-gh04.js"
Cohesion: 0.83
Nodes (3): b64bytes(), build(), etiInformeGH04()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `excel()` connect `excel` to `respuestas-auditoria.js`, `abrir`, `grupos`, `hojas`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `cargar()` (e.g. with `respuestas-auditoria.js` and `orden()`) actually correct?**
  _`cargar()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Why does `cargar()` connect `cargar` to `respuestas-auditoria.js`, `abrir`, `grupos`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `norm()` connect `grupos` to `respuestas-auditoria.js`, `hojas`, `excel`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._