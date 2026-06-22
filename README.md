# Traslados · Hoteles de Petén

Tablero ligero para coordinar los traslados aeropuerto–hotel–aeropuerto de las seis
propiedades de Hoteles de Petén (Casona de la Isla, Casona del Lago, Hotel Petén,
Casa Turquesa, Casazul y Villa de Lago).

Una sola página HTML, sin servidor propio: usa una hoja de **Google Sheets** como
base de datos a través de un **Apps Script** publicado como aplicación web.

## Qué hace

- Mini dashboard del día: cuántas personas entran, cuántas salen, total de traslados y la próxima recogida.
- Línea del día (5:00–23:00): verde = llegada, coral = salida.
- Alta, edición y borrado manual de traslados.
- Datos compartidos entre todas las recepciones (botón Actualizar).
- Exportar el día a CSV.

## Puesta en marcha

### 1. Backend (Google Sheets + Apps Script)
1. Creá una hoja de Google Sheets en blanco.
2. Extensiones → Apps Script. Pegá `apps-script/Code.gs` y guardá.
3. Implementar → Nueva implementación → Aplicación web (Ejecutar como: Yo · Acceso: Cualquier persona).
4. Copiá la URL (termina en `/exec`).

### 2. Frontend
1. Poné tu URL y tu token en `config.js`.
2. El `TOKEN` de `config.js` y el de `apps-script/Code.gs` deben ser idénticos.
3. Abrí `index.html` (o publicá el repo con GitHub Pages).

## Seguridad

Como esto se sirve en una página pública, `config.js` viaja al navegador del cliente:
la URL y el token quedan visibles para quien lea el código. El token solo frena
accesos casuales y bots, no a alguien decidido. Para los datos de traslados
(sin pagos ni info sensible) es un trade-off aceptable. Si se necesita privacidad
real: repo privado con Pages de pago, o correr la app en un equipo interno.
Ante abuso, redesplegar el Apps Script genera una URL nueva.
