# Traslados · Hoteles de Petén

Tablero ligero para coordinar los traslados aeropuerto–hotel–aeropuerto de las seis
propiedades de Hoteles de Petén (Casona de la Isla, Casona del Lago, Hotel Petén,
Casa Turquesa, Casazul y Villa de Lago).

Es una sola página HTML, sin servidor propio: usa una hoja de **Google Sheets** como
base de datos a través de un **Apps Script** publicado como aplicación web.

## Qué hace

- Mini dashboard del día: cuántas personas entran, cuántas salen, total de traslados y la próxima recogida.
- Línea del día (5:00–23:00) con cada traslado: verde = llegada, coral = salida.
- Alta, edición y borrado manual de traslados.
- Datos compartidos: lo que agrega una recepción lo ven las demás (botón Actualizar).
- Exportar el día a CSV.

## Puesta en marcha

### 1. Backend (Google Sheets + Apps Script)
1. Creá una hoja de Google Sheets en blanco.
2. Extensiones → Apps Script. Pegá el contenido de `apps-script/Code.gs` y guardá.
3. Implementar → Nueva implementación → Aplicación web.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
4. Autorizá los permisos y copiá la URL (termina en `/exec`).

> La pestaña `Traslados` y sus encabezados se crean solos en la primera llamada.

### 2. Frontend
1. Copiá `config.example.js` como `config.js`.
2. Pegá tu URL de Apps Script en `config.js`.
3. Abrí `index.html` en el navegador.

Si el pie de página dice "Conectado a tu hoja de Google Sheets", ya está listo.

## Nota de seguridad

`config.js` **no se versiona** (está en `.gitignore`) porque contiene la URL del backend,
que con el acceso "Cualquier persona" funciona como llave de lectura/escritura.
No la compartas públicamente.
