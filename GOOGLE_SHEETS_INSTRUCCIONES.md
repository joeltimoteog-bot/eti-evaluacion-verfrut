# 📊 Conectar el Sistema con Google Sheets

Cada evaluación registrada se enviará automáticamente a una hoja de Google Sheets (una fila por ruta/área evaluada). Sigue estos 5 pasos una sola vez:

## Paso 1 — Crear la hoja
1. Entra a [sheets.google.com](https://sheets.google.com) con tu cuenta de Google.
2. Crea una hoja nueva y nómbrala: **Registros Evaluaciones ETI**.

## Paso 2 — Abrir el editor de Apps Script
1. En la hoja, ve al menú **Extensiones → Apps Script**.
2. Borra todo el código que aparece y pega el código de abajo (sección "Código Apps Script").
3. Guarda con el ícono 💾 (nómbralo "Webhook ETI").

## Paso 3 — Publicar como aplicación web
1. Clic en **Implementar → Nueva implementación**.
2. En el engranaje ⚙ elige **Aplicación web**.
3. Configura: **Ejecutar como: Yo** · **Quién tiene acceso: Cualquier usuario**.
4. Clic en **Implementar** y autoriza los permisos con tu cuenta.
5. **Copia la URL** que termina en `/exec`.

## Paso 4 — Pegar la URL en el sistema
1. Abre `index.html` y busca la línea:
   ```js
   const SHEETS_WEBHOOK_URL='';
   ```
2. Pega tu URL entre las comillas:
   ```js
   const SHEETS_WEBHOOK_URL='https://script.google.com/macros/s/XXXXX/exec';
   ```

## Paso 5 — Publicar
```powershell
cd "C:\Sistema - Evaluacion Eti"
git add index.html
git commit -m "Conectar Google Sheets"
git push
```

Listo ✅ — cada evaluación calculada agregará filas a la pestaña **Evaluaciones** de tu hoja.

---

## Código Apps Script (copiar completo)

```javascript
function doPost(e){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Evaluaciones') || ss.insertSheet('Evaluaciones');

  // Encabezados (solo la primera vez)
  if(sh.getLastRow() === 0){
    sh.appendRow([
      'Fecha de Registro','Fecha Evaluación','Empresa','Supervisor','Sector','Tipo Personal',
      'Ruta / Área','Código','N° Evaluados',
      'Legislación Laboral %','Bienestar Social %','Sustentabilidad %',
      'Ética Empresarial %','Seguridad y Salud %','Compromiso Medioambiental %',
      'Resultado Grupo %','Estado',
      'Destiempo','Motivo Destiempo','Reportado a Coordinador','Registrado Por'
    ]);
    sh.getRange(1,1,1,21).setFontWeight('bold').setBackground('#003DA5').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }

  const p = JSON.parse(e.postData.contents);
  const pct = v => Math.round(v * 1000) / 10; // 0.918 → 91.8

  (p.rutas || []).forEach(function(r){
    sh.appendRow([
      new Date(), p.fecha, p.emp, p.sup, p.sector, p.tipo,
      r.nom, r.cod, r.ne,
      pct(r.secs[0].pct), pct(r.secs[1].pct), pct(r.secs[2].pct),
      pct(r.secs[3].pct), pct(r.secs[4].pct), pct(r.secs[5].pct),
      pct(r.resGrupo), r.resGrupo >= 0.7 ? 'APROBADO' : 'REFUERZO',
      p.destiempo ? p.destiempo.tipo : '',
      p.destiempo ? p.destiempo.motivo : '',
      p.destiempo ? p.destiempo.reportado : '',
      p.nomUsuario
    ]);
  });

  return ContentService.createTextOutput('OK');
}
```

## Notas
- El orden de las columnas de secciones corresponde al orden interno del sistema: Legislación, Bienestar, Sustentabilidad, Ética, Seguridad y Salud, Medioambiente.
- Si cambias el código del script, debes crear una **nueva implementación** (Implementar → Administrar implementaciones → editar → Nueva versión).
- Los datos también se guardan en Firebase (Firestore), que es lo que usa el panel del administrador para ver todas las evaluaciones en tiempo real. Google Sheets es la copia para reportes/análisis.
