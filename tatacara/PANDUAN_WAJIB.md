# TATACARA PENGGUNAAN PROJECT INI

---
**PERINGATAN PENTING: DOKUMEN INI TIDAK BOLEH DIUBAH!**
---

Dokumen ini berisi panduan baku dan tata cara wajib saat membuka, menjalankan, atau memodifikasi project `yayasan-al-alawiyah` agar tidak terjadi tabrakan port, service konflik, atau error lainnya (terutama dengan 9router, antigravity, atau opencode).

## 1. PENGATURAN PORT WAJIB
- Project ini **WAJIB** berjalan di `PORT=7000`.
- **DILARANG** menjalankan di `PORT=3000` atau port default React lainnya karena akan bertabrakan dengan service yang sudah berjalan (9router, antigravity, opencode).
- Konfigurasi port sudah dikunci di `package.json` (`"start": "set PORT=7000 && react-scripts start"`).

## 2. CARA MENJALANKAN PROJECT
Selalu gunakan perintah berikut di terminal:
```bash
cd C:\Users\breel\yayasan-al-alawiyah
npm start
```
Tunggu hingga proses compile selesai, lalu buka browser di `http://localhost:7000`.

## 3. CARA MENGHENTIKAN PROJECT
Untuk menghentikan server dengan aman:
- Pada terminal yang sedang menjalankan `npm start`, tekan `Ctrl + C` lalu ketik `Y` dan tekan Enter.
- Jika server masih berjalan di latar belakang (port 7000 nyangkut), jalankan perintah PowerShell ini:
  ```powershell
  $processIds = @(Get-NetTCPConnection -LocalPort 7000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique); foreach ($processId in $processIds) { Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue }
  ```

## 4. ATURAN MODIFIKASI CODE
1. **DILARANG** mengubah struktur package utama (`package.json`) terutama pada bagian script `start` tanpa koordinasi.
2. Saat menambah library icon (seperti `react-icons`), pastikan icon tersebut benar-benar tersedia di sub-module yang dipanggil (misal: `react-icons/fa`).
3. Selalu periksa peringatan/error compile di terminal. Jika ada *SyntaxError* atau *Module not found*, hentikan server, perbaiki error, lalu jalankan kembali.

## 5. LOKASI PENYIMPANAN
Project ini secara permanen disimpan di:
`C:\Users\breel\yayasan-al-alawiyah`

---
*Dokumen ini dibuat untuk menjaga stabilitas environment development di perangkat ini.*
