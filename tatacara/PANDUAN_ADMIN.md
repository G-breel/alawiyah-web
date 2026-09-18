# PANDUAN ADMIN — YAYASAN MODERN AL-ALAWIYAH

**TIDAK BOLEH DIUBAH TANPA SEPENGETAHUAN PENGELOLA**

## 1. Ringkasan
Admin panel ada di route `/admin`. Tidak pakai backend/DB — semua data disimpan di file `src/data/siteData.json` (pola **JSON-data-driven**). Kelebihan: super ringan (ram aman), tanpa server DB. Kekurangan: setiap perubahan butuh rebuild/deploy. Upgrade ke CMS/DB (Strapi, Supabase, Firebase Storage) ketika butuh multi-user atau upload besar.

## 2. Cara buka admin
- Jalankan project: `npm start` (wajib di port 7000).
- Buka `http://localhost:7000/admin`.
- Login default: `admin` / `admin123`.

## 3. UX tambah/ganti gambar (pikirkan seperti editor biasa)
- **Mau ganti foto kepala sekolah / staff?** → Tab `Staff` → ubah `Nama` / `Jabatan` → ganti `Path gambar` atau klik `Choose File` → preview langsung.
- **Mau tambah foto galeri?** → Tab `Galeri` → `+ Tambah Foto` → isi judul + kategori → upload/paste path.
- **Mau ganti banner hero (atas homepage)?** → Tab `Hero Images` → tambah/edit slide.
- **Gambar muncul di mana?**
  - Staff → Beranda (section Pimpinan & Staff) + halaman Tentang.
  - Galeri → Halaman Galeri (filter kategori: fasilitas/kegiatan/acara).
  - Hero Images → Slider hero Beranda (auto-rotate 4 detik).
  - Programs → Card Program Pendidikan di Beranda + halaman Program.
  - Site Info → Nama/slogan/alamat di navbar/footer/hero.

## 4. Cara simpan (penting)
1. Edit sampai puas di admin.
2. Klik `Download JSON`.
3. Replace file `src/data/siteData.json` dengan file hasil download.
4. Commit/publish ulang jika dihosting (Vercel/Netlify auto-build dari JSON baru).

### Gambar — dua opsi
- **Kecil/quick:** Upload via `Choose File` → jadi base64 ikut ter-export ke JSON. Praktis tapi bikin JSON membengkak; hindari untuk foto >1 MB.
- **Rekomendasi:** Taruh file fisik di `public/images/` (mis. `public/images/hero-1.jpg`) → isi field path jadi `/images/hero-1.jpg`. Lebih ringan & cacheable.

## 5. Keamanan
- Login admin sekarang hanya **client-side** (disimpan di `localStorage`). Aman untuk internal/privat, **belum** untuk produksi publik. ponytail: ganti ke auth backend (JWT / Supabase Auth / Basic Auth di nginx) ketika site publik.
- Jangan commit credential asli ke repo publik.

## 6. Folder penting
- `src/data/siteData.json` — single source of truth.
- `public/images/` — semua asset gambar yang dirujuk path `/images/...`.
- `src/pages/admin/AdminDashboard.js` — UI admin.
- `tatacara/` — dokumen baku yang tidak boleh diubah sembarangan.

## 7. Kalau RAM tipis
- Jangan jalankan `npm start` bareng banyak service. Sudah di-config port 7000 agar tidak nabrak 9router/antigravity/opencode. Matikan service lain jika perlu: hentikan dev server via `Ctrl+C`.

