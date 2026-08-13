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
    rows.push(rowFromArray_(r));
  }
  return rows;
}

function normalizeDate_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const s = String(value).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return s;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return m[3] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0');
  const d = new Date(s);
  if (!isNaN(d.getTime())) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return s;
}

function rowFromArray_(r) {
  return {
    id: String(r[0]), fecha: normalizeDate_(r[1]), huesped: String(r[2]), hotel: String(r[3]),
    tipo: String(r[4]), hora: String(r[5]), pax: Number(r[6]) || 1,
    estado: String(r[7]), notas: String(r[8] || '')
  };
}

function readByDate_(fecha) {
  const target = normalizeDate_(fecha);
  if (!target) return readAll_();
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  const dates = sh.getRange(2, 2, last - 1, 1).getValues();
  const rows = [];
  for (let i = 0; i < dates.length; i++) {
    if (normalizeDate_(dates[i][0]) !== target) continue;
    const r = sh.getRange(i + 2, 1, 1, HEADERS.length).getValues()[0];
    if (r[0]) rows.push(rowFromArray_(r));
  }
  return rows;
}

function output_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function response_(e, obj) {
  const callback = e && e.parameter && e.parameter.callback;
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return output_(obj);
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
      return { ok: true, row: body.row };
    }
    if (body.action === 'update') {
      const idx = findRowIndex_(sh, body.row.id);
      if (idx === -1) return { ok: false, error: 'No encontré ese traslado' };
      sh.getRange(idx, 1, 1, HEADERS.length).setValues([rowToArray_(body.row)]);
      return { ok: true, row: body.row };
    }
    if (body.action === 'delete') {
      const idx = findRowIndex_(sh, body.id);
      if (idx === -1) return { ok: false, error: 'No encontré ese traslado' };
      sh.deleteRow(idx);
      return { ok: true };
    }
    return { ok: false, error: 'Acción desconocida' };
  } catch (err) {
    return { ok: false, error: String(err) };
  } finally {
    lock.releaseLock();
  }
}

// Lectura, y también escritura cuando llega ?payload= (camino confiable para el navegador)
function doGet(e) {
  if (!authed_(e, null)) return response_(e, { ok: false, error: 'No autorizado' });
  if (e && e.parameter && e.parameter.payload) {
    return response_(e, handleWrite_(JSON.parse(e.parameter.payload)));
  }
  const fecha = e && e.parameter && e.parameter.fecha;
  return response_(e, { ok: true, data: fecha ? readByDate_(fecha) : readAll_() });
}

// Se mantiene por compatibilidad si el POST sí llega
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (!authed_(e, body)) return response_(e, { ok: false, error: 'No autorizado' });
    return response_(e, handleWrite_(body));
  } catch (err) {
    return response_(e, { ok: false, error: String(err) });
  }
}
