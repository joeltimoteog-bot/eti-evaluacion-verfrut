# Subir a producción — Evaluaciones ETI (03-oct-2026, v2 con QR permanente)

Archivos que cambian: **index.html** y **evaluar.html**.

## 1. Publicar (PowerShell) — pega SOLO este bloque

```powershell
cd "C:\Sistema - Evaluacion Eti"
Remove-Item .git\index.lock -Force -ErrorAction SilentlyContinue
git add index.html evaluar.html PASOS_PRODUCCION_03oct.md
git commit -m "ETI: QR permanente por supervisor, % por pregunta, banco 2026, envio seguro Firebase+Azure, Trafico en vivo"
git push
```

Espera 1–2 minutos y recarga el sistema con **Ctrl + F5**.

## 2. Configurar (una sola vez, como jtimoteo)

1. **🧩 Banco de Preguntas** → **📥 Cargar banco 2026** → pon el % de cada pregunta (total 100%) → **💾 Guardar cambios**.
2. **📱 Evaluación QR** → botón **📌 Generar QR permanente para TODOS los supervisores**.
3. Cada supervisor entra a **Evaluación por QR**, ve su QR y lo imprime con **🖨 Imprimir afiche**.

Cuando vuelvas a actualizar el banco y guardes, todos los QR permanentes se actualizan solos (mismo código impreso).

## 3. Prueba antes de usarlo con el personal

| # | Qué hacer | Qué debe pasar |
|---|-----------|----------------|
| 1 | Abre **📡 Tráfico en vivo** en la PC | Panel "Tiempo real" |
| 2 | Escanea un QR permanente: elige empresa, **Obrero**, sector, ruta, código; responde | Sin % ni nota; al final "Evaluación enviada" |
| 3 | Mira Tráfico en vivo | Aparece la fila 📱 QR y pasa a **☁ ✓** |
| 4 | Repite como **Empleado** (área + sector/zona) | Igual, 💼 Empleado, sin código |
| 5 | En el QR del supervisor → **👁 Ver la evaluación** | Vista previa; no se guarda nada |
| 6 | **📊 Consolidar el día** | Aparece en Registros |
| 7 | **📈 Indicadores** | Se ven las respuestas (Azure SQL) |

Luego borra tus respuestas de prueba (✏️/🗑 en el QR) para no ensuciar los indicadores.

## 4. Solo si algo falla: volver atrás (NO pegarlo junto con el paso 1)

```powershell
cd "C:\Sistema - Evaluacion Eti"
git revert HEAD --no-edit
git push
```
