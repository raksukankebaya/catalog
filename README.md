# Raksukan Kebaya

Website katalog responsif untuk GitHub Pages dengan database Google Sheets.

## Menghubungkan website ke spreadsheet

1. Buka [Google Apps Script](https://script.google.com/) dan buat project baru.
2. Salin isi `apps-script/Code.gs` ke editor Apps Script, lalu simpan.
3. Pilih **Deploy → New deployment → Web app**.
4. Atur **Execute as: Me** dan **Who has access: Anyone**, lalu deploy.
5. Salin URL Web App dan tempel ke `public/config.js` menggantikan teks `PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`.

Spreadsheet yang digunakan: `18ngYwWiNd96B5pVxFhj55XyiDuS408hIoO1qzAJf1W8`.
Password admin awal: `230808`.

## Publikasi GitHub Pages

1. Unggah seluruh isi project ke repository GitHub pada branch `main`.
2. Di GitHub, buka **Settings → Pages** dan pilih **Source: GitHub Actions**.
3. Workflow akan membangun dan menerbitkan website otomatis.

Panel admin tersedia melalui ikon roda gigi di kanan bawah website.

## Memperbarui versi lama

Jika website versi sebelumnya sudah terpasang, ganti seluruh file repository dengan versi ini. Salin kembali `apps-script/Code.gs` ke project Apps Script lama, lalu pilih **Deploy → Manage deployments → Edit → New version → Deploy**. URL Web App tetap dapat digunakan.

Versi ini mencakup pencarian global dan per kategori, subkategori wajib, beberapa gambar per item, atribut opsional tipe/motif/warna/size, wishlist browser selama tiga jam yang dapat dikirim ke WhatsApp admin, serta halaman Galeri foto/video. Media Galeri dapat memakai tautan atau unggahan langsung; thumbnail YouTube dibuat otomatis dan video lain dapat memakai URL thumbnail tersendiri.

Setelah mengganti `apps-script/Code.gs`, selalu buat **New version** pada deployment Apps Script. Jika URL deployment tetap sama, `public/config.js` tidak perlu diubah.
