# Subir a producción — Evaluaciones ETI (03-oct-2026)

Archivos que cambian: **index.html** y **evaluar.html** (nada más).
Copias de respaldo en la carpeta: `*.bak-03oct-antes-pctpreg` y `*.bak-03oct-antes-trafico`.

## 1. Publicar (PowerShell)

```powershell
cd "C:\Sistema - Evaluacion Eti"
Remove-Item .git\index.lock -ErrorAction SilentlyContinue   # quedó un candado de git de la revisión
git add index.html evaluar.html
git commit -m "ETI: % por pregunta, banco 2026, QR unico obrero/empleado, envio seguro a Firebase+Azure, Trafico en vivo"
git push
```

Espera 1–2 minutos a que GitHub Pages publique y recarga con **Ctrl + F5**.

## 2. Configurar (una sola vez, como jtimoteo)

1. Menú → **🧩 Banco de Preguntas** → **📥 Cargar banco 2026**.
2. Pon el **% de cada pregunta** (el total debe dar 100%) → **💾 Guardar cambios**.
3. **📱 Evaluación QR** → crea un QR nuevo con "👥 Todo el personal". (Los QR antiguos siguen con el banco viejo.)

## 3. Prueba antes de usarlo con el personal (5 minutos)

| # | Qué hacer | Qué debe pasar |
|---|-----------|----------------|
| 1 | Abre **📡 Tráfico en vivo** en la PC | Panel con "Tiempo real" |
| 2 | Escanea el QR con tu celular como **Obrero** (sector, ruta, código) y responde | No aparece ningún % ni nota; al final "Evaluación enviada" |
| 3 | Mira el panel de tráfico | Aparece la fila 📱 QR al instante y en segundos pasa a **☁ ✓** |
| 4 | Repite como **Empleado** (área + sector/zona) | Igual, con tipo 💼 Empleado y sin código |
| 5 | Registra una evaluación **manual** | Aparece 📋 Manual y pasa a **☁ ✓** |
| 6 | **📈 Indicadores** | Las pruebas aparecen (fuente: Azure SQL) |
| 7 | Cierra la sesión QR de prueba y elimínala (🗑) | Se borra en Firebase y Azure |

Si en el paso 2 el celular se queda en "Reintentar envío", las **reglas de Firebase** están bloqueando la escritura: avísame.
Si en el paso 3 se queda en ⏳ más de 2 minutos, Azure no está respondiendo: el panel lo reintenta solo cada 60 s (o usa "☁ Enviar pendientes a Azure").

## 4. Volver atrás (si algo falla)

```powershell
cd "C:\Sistema - Evaluacion Eti"
git revert HEAD --no-edit
git push
```
