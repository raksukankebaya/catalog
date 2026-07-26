const SPREADSHEET_ID = '18ngYwWiNd96B5pVxFhj55XyiDuS408hIoO1qzAJf1W8';
const IMAGE_FOLDER = 'Raksukan Kebaya Images';

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'catalog';
    if (action !== 'catalog') throw new Error('Aksi tidak dikenal.');
    return json_({ ok: true, data: readCatalog_() });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    verifyPassword_(body.password);
    if (body.action === 'adminCheck') return json_({ ok: true });
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      if (body.action === 'upsertCategory') upsert_('Categories', ['id','name','description','imageUrl','active','sortOrder'], body.record);
      else if (body.action === 'deleteCategory') { remove_('Categories', body.id); removeWhere_('Subcategories', 1, body.id); removeWhere_('Items', 1, body.id); }
      else if (body.action === 'upsertSubcategory') upsert_('Subcategories', ['id','categoryId','name','active','sortOrder'], body.record);
      else if (body.action === 'deleteSubcategory') { remove_('Subcategories', body.id); clearWhere_('Items', 2, body.id); }
      else if (body.action === 'upsertItem') {
        if (!body.record || !String(body.record.subcategoryId || '').trim()) throw new Error('Subkategori wajib dipilih.');
        upsert_('Items', ['id','categoryId','subcategoryId','name','description','imageUrl','imageUrls','type','motif','color','size','active','sortOrder'], body.record);
      }
      else if (body.action === 'deleteItem') remove_('Items', body.id);
      else if (body.action === 'upsertCarousel') upsert_('Carousel', ['id','title','subtitle','imageUrl','active','sortOrder'], body.record);
      else if (body.action === 'deleteCarousel') remove_('Carousel', body.id);
      else if (body.action === 'upsertGallery') {
        if (!body.record || !String(body.record.mediaUrl || '').trim()) throw new Error('URL media wajib diisi.');
        upsert_('Gallery', ['id','mediaType','mediaUrl','thumbnailUrl','title','location','date','active','sortOrder'], body.record);
      }
      else if (body.action === 'deleteGallery') remove_('Gallery', body.id);
      else if (body.action === 'updateContact') updateContact_(body.record || {});
      else if (body.action === 'uploadImage') return json_({ ok: true, url: uploadImage_(body) });
      else if (body.action === 'uploadMedia') return json_(Object.assign({ ok: true }, uploadMedia_(body)));
      else throw new Error('Aksi tidak dikenal.');
    } finally { lock.releaseLock(); }
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function readCatalog_() {
  const book = SpreadsheetApp.openById(SPREADSHEET_ID);
  return {
    categories: rows_(book.getSheetByName('Categories')),
    subcategories: rows_(book.getSheetByName('Subcategories')),
    items: rows_(book.getSheetByName('Items')),
    carousel: rows_(book.getSheetByName('Carousel')),
    gallery: rows_(book.getSheetByName('Gallery')),
    contact: contact_(book.getSheetByName('Contact'))
  };
}

function rows_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  const headers = values.shift();
  return values.filter(row => row[0] !== '').map(row => headers.reduce((out, key, index) => {
    out[key] = row[index]; return out;
  }, {}));
}

function contact_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return {};
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues().reduce((out, row) => {
    if (row[0]) out[row[0]] = String(row[1] || ''); return out;
  }, {});
}

function upsert_(sheetName, headers, record) {
  if (!record || !String(record.id || '').trim()) throw new Error('ID wajib diisi.');
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const values = headers.map(key => key === 'active' ? record[key] !== false : key === 'sortOrder' ? Number(record[key] || 0) : String(record[key] || '').trim());
  const row = findRow_(sheet, record.id);
  sheet.getRange(row || sheet.getLastRow() + 1, 1, 1, headers.length).setValues([values]);
}

function remove_(sheetName, id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const row = findRow_(sheet, id);
  if (!row) throw new Error('Data tidak ditemukan.');
  sheet.deleteRow(row);
}

function removeWhere_(sheetName, columnIndex, value) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (sheet.getLastRow() < 2) return;
  const values = sheet.getRange(2, columnIndex + 1, sheet.getLastRow() - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) if (String(values[i][0]) === String(value)) sheet.deleteRow(i + 2);
}

function clearWhere_(sheetName, columnIndex, value) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return;
  const values = sheet.getRange(2, columnIndex + 1, sheet.getLastRow() - 1, 1).getValues();
  values.forEach((row, index) => { if (String(row[0]) === String(value)) sheet.getRange(index + 2, columnIndex + 1).clearContent(); });
}

function findRow_(sheet, id) {
  if (sheet.getLastRow() < 2) return 0;
  const match = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(String(id)).matchEntireCell(true).findNext();
  return match ? match.getRow() : 0;
}

function updateContact_(record) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Contact');
  Object.keys(record).forEach(key => {
    const match = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).createTextFinder(key).matchEntireCell(true).findNext();
    const row = match ? match.getRow() : sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, 2).setValues([[key, String(record[key] || '')]]);
  });
}

function uploadImage_(body) {
  if (!body.data || !body.mimeType) throw new Error('Data gambar tidak lengkap.');
  const bytes = Utilities.base64Decode(body.data);
  if (bytes.length > 4000000) throw new Error('Ukuran gambar maksimal 4 MB.');
  const folders = DriveApp.getFoldersByName(IMAGE_FOLDER);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(IMAGE_FOLDER);
  const file = folder.createFile(Utilities.newBlob(bytes, body.mimeType, body.fileName || ('gambar-' + Date.now())));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1600';
}

function uploadMedia_(body) {
  if (!body.data || !body.mimeType) throw new Error('Data media tidak lengkap.');
  const bytes = Utilities.base64Decode(body.data);
  const isVideo = String(body.mimeType).indexOf('video/') === 0;
  const maxSize = isVideo ? 20000000 : 4000000;
  if (bytes.length > maxSize) throw new Error(isVideo ? 'Ukuran video maksimal 20 MB.' : 'Ukuran foto maksimal 4 MB.');
  const folders = DriveApp.getFoldersByName(IMAGE_FOLDER);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(IMAGE_FOLDER);
  const file = folder.createFile(Utilities.newBlob(bytes, body.mimeType, body.fileName || ('media-' + Date.now())));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const id = file.getId();
  return {
    mediaType: isVideo ? 'video' : 'photo',
    url: 'https://drive.google.com/uc?export=download&id=' + id,
    thumbnailUrl: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1600'
  };
}

function verifyPassword_(password) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD') || '230808';
  if (String(password || '') !== expected) throw new Error('Password admin salah.');
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
