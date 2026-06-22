/**
 * Backend de Traslados Hoteles de Petén sobre Google Sheets.
 * Pegá este código en Extensiones > Apps Script de tu hoja, guardá,
 * y redeployá: Implementar > Administrar implementaciones >
 * editar (lápiz) > Versión: Nueva versión > Implementar.
 *
 * IMPORTANTE: el TOKEN debe ser idéntico al de tu config.js.
 */

const TOKEN = 'hdp_53267e0e5bd29126aa70e5ee32354616';

const SHEET_NAME = 'Traslados';
const HEADERS = ['id', 'fecha', 'huesped', 'hotel', 'tipo', 'hora', 'pax', 'estado', 'notas'];

function authed_(e, body) {
  const t = (body && body.token) || (e && e.parameter && e.parameter.token) || '';
  return t === TOKEN;
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function readAll_() {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    if (!r[0]) continue;
    rows.push({
      id: String(r[0]), fecha: String(r[1]), huesped: String(r[2]), hotel: String(r[3]),
      tipo: String(r[4]), hora: String(r[5]), pax: Number(r[6]) || 1,
      estado: String(r[7]), notas: String(r[8] || '')
    });
  }
  return rows;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function rowToArray_(row) {
  return [row.id, row.fecha, row.huesped, row.hotel, row.tipo, row.hora, row.pax, row.estado, row.notas || ''];
}

function findRowIndex_(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) return -1;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

// Ejecuta una escritura (add / update / delete) con bloqueo para evitar choques
function handleWrite_(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = getSheet_();
    if (body.action === 'add') {
      sh.appendRow(rowToArray_(body.row));
      return json_({ ok: true, row: body.row });
    }
    if (body.action === 'update') {
      const idx = findRowIndex_(sh, body.row.id);
      if (idx === -1) return json_({ ok: false, error: 'No encontré ese traslado' });
      sh.getRange(idx, 1, 1, HEADERS.length).setValues([rowToArray_(body.row)]);
      return json_({ ok: true, row: body.row });
    }
    if (body.action === 'delete') {
      const idx = findRowIndex_(sh, body.id);
      if (idx === -1) return json_({ ok: false, error: 'No encontré ese traslado' });
      sh.deleteRow(idx);
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'Acción desconocida' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lectura, y también escritura cuando llega ?payload= (camino confiable para el navegador)
function doGet(e) {
  if (!authed_(e, null)) return json_({ ok: false, error: 'No autorizado' });
  if (e && e.parameter && e.parameter.payload) {
    return handleWrite_(JSON.parse(e.parameter.payload));
  }
  return json_({ ok: true, data: readAll_() });
}

// Se mantiene por compatibilidad si el POST sí llega
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (!authed_(e, body)) return json_({ ok: false, error: 'No autorizado' });
    return handleWrite_(body);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
