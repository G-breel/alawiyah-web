# Yayasan Modern Al-Alawiyah — Project Reference

## Overview
Website sekolah/yayasan Islam (SMP, SMA, Pesantren) di Bogor.
Single-page React app (CRA) dengan Tailwind CSS & Supabase Integration.

## Tech Stack
- **Framework:** React 19 (Create React App / `react-scripts 5.0.1`)
- **Database / Backend:** Supabase Client (`@supabase/supabase-js`) with fallback to local `siteData.json`
- **Routing:** `react-router-dom` ^7.18.3
- **Styling:** Tailwind CSS + `tailwindcss-animate`
- **Icons:** `react-icons` (FontAwesome subset)
- **Port:** 7000 (hardcoded di `package.json` scripts)

## Supabase Integration
- Config file: `src/lib/supabase.js`
- Functions: `fetchSiteData()`, `sendContactMessage()`, `sendPPDBForm()`
- MCP Server Config: `.config/opencode/opencode.json` (remote Supabase MCP server `https://mcp.supabase.com/mcp?project_ref=rqvecsfaqmxfnivaomjf`)
- Agent Skills: `supabase/agent-skills` installed

## Tailwind Theme
```
primary:   #2C5F2D  (hijau tua — warna utama)
secondary: #97BC62  (hijau muda)
accent:    #FFB800  (kuning/emas)
```
Custom animations: fadeIn, slideIn, slideUp, bounce.

## Project Structure
```
C:\apk\laragon\www\yayasan-al-alawiyah\
├── public/
│   └── images/              ← 20 SVG/JPG placeholder files (hero, staff, galeri, program)
├── src/
│   ├── App.js               ← Router + Layout wrapper + ScrollToTop
│   ├── index.js              ← Entry (ReactDOM.createRoot)
│   ├── index.css             ← Tailwind directives
│   ├── data/
│   │   └── siteData.json     ← Single source of truth / fallback data
│   ├── lib/
│   │   └── supabase.js       ← Supabase client & API wrappers
│   ├── components/
│   │   ├── Navbar.js         ← Top bar + sticky nav + mobile hamburger
│   │   └── Footer.js         ← 4-column footer
│   └── pages/
│       ├── Home.js           ← Hero slider, stats, about, features, programs, staff, PPDB CTA
│       ├── Tentang.js        ← Sejarah, kenapa pilih kami
│       ├── VisiMisi.js       ← Visi, misi, nilai
│       ├── Program.js        ← 6 program cards + ekstrakurikuler
│       ├── SMP.js            ← Info SMP/MTs
│       ├── SMA.js            ← Info SMA/MA (IPA/IPS)
│       ├── Pesantren.js      ← Boarding school + jadwal harian
│       ├── Galeri.js         ← Galeri foto + filter kategori + tab video
│       ├── Kontak.js         ← Form kontak + real message submit (Supabase) + iframe map
│       ├── PPDB.js           ← Pendaftaran siswa baru
│       ├── NotFound.js       ← 404 error page
│       └── admin/
│           └── AdminDashboard.js ← Admin panel (CRUD siteData.json)
└── tatacara/
    ├── PANDUAN_WAJIB.md      ← Aturan port 7000, startup/shutdown
    └── PANDUAN_ADMIN.md      ← Cara pakai admin panel
```

## Commands
```bash
npm start          # Dev server di port 7000
npm run build      # Build production
npm test           # Run tests (CRA default)
```

## Rules
- Port WAJIB 7000 (lihat tatacara/PANDUAN_WAJIB.md)
- Pakai Tailwind untuk styling, JANGAN inline CSS manual
- Semua navigasi pakai `<Link>` dari react-router-dom, BUKAN `<a href>`
