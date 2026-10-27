import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

// Run during deployment so the first HTML already contains the real catalog.
const context = { window: {} };
vm.runInNewContext(await readFile(new URL('../public/config.js', import.meta.url), 'utf8'), context);
const endpoint = context.window.RAKSUKAN_CONFIG?.apiUrl;
if (!endpoint || !/^https:\/\//.test(endpoint)) throw new Error('URL katalog belum dikonfigurasi.');
const url = new URL(endpoint);
url.searchParams.set('action', 'catalog');
const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Katalog tidak dapat dibaca: HTTP ${response.status}`);
const result = await response.json();
if (!result.ok || !result.data) throw new Error(result.error || 'Data katalog tidak tersedia.');
for (const key of ['categories', 'items', 'carousel']) {
  if (!Array.isArray(result.data[key])) throw new Error(`Data ${key} tidak valid.`);
}
await writeFile(new URL('../app/data/catalog.json', import.meta.url), JSON.stringify({
  fetchedAt: Date.now(), endpoint, data: result.data,
}));
console.log('Snapshot katalog berhasil disiapkan.');
