# Traslados - Hoteles de Peten

Tablero ligero para coordinar los traslados Aeropuerto-Flores y Flores-Aeropuerto
de las propiedades de Hoteles de Peten.

La app es una sola pagina HTML, sin servidor propio. El backend recomendado es
Supabase; Apps Script queda solo como fallback temporal.

## Que hace

- Mini dashboard del dia: pax Aeropuerto-Flores, pax Flores-Aeropuerto, total de traslados y proxima recogida.
- Linea del dia (5:00-23:00).
- Alta, edicion y borrado manual de traslados.
- Datos compartidos entre recepciones.
- Reporte diario en Excel y PDF.

## Supabase

1. Crea un proyecto en Supabase.
2. Abre `SQL Editor`.
3. Ejecuta el contenido completo de `supabase-schema.sql`.
4. En Supabase, busca:
   - `Project URL`
   - `Publishable key` o `anon public key`
5. Pega esos valores en `config.js`:

```js
window.HDP_CONFIG = {
  SUPABASE_URL: "https://tu-proyecto.supabase.co",
  SUPABASE_KEY: "tu-publishable-o-anon-key"
};
```

No pegues `secret key` ni `service_role key` en `config.js`; ese archivo es publico
cuando se publica con GitHub Pages.

## Importar datos de Google Sheets

1. En Google Sheets, exporta la pestana `Traslados` como CSV.
2. En Supabase > Table Editor > `traslados`, usa import CSV.
3. Revisa que las columnas coincidan:
   `id`, `fecha`, `huesped`, `hotel`, `tipo`, `hora`, `pax`, `estado`, `notas`.

## Apps Script fallback

Mientras se termina la migracion, `config.js` puede conservar `API_URL` y `TOKEN`.
La app usa Supabase si `SUPABASE_URL` y `SUPABASE_KEY` estan configurados; si no,
usa Apps Script.

## Seguridad

Esta app esta pensada para un flujo operativo simple y publico. Las politicas de
Supabase en `supabase-schema.sql` permiten leer, crear, editar y borrar usando el
rol `anon`, porque no hay login. Es equivalente al modelo anterior de GitHub Pages
+ token publico de Apps Script.

Si despues se necesita mayor privacidad, el siguiente paso seria agregar login con
Supabase Auth y restringir las politicas RLS a usuarios autenticados.
