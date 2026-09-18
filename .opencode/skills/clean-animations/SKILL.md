---
name: clean-animations
description: Build smooth, production-grade animations using Framer Motion and Tailwind CSS. Use when adding entrance animations, hover effects, scroll triggers, page transitions, or interactive UI elements to avoid janky or generic animation patterns.
---

# Clean Animations & Interactive UI

## 1. Framer Motion Basics

Framer Motion sudah terinstall. Import di component:

```jsx
import { motion } from 'framer-motion';
```

## 2. Common Animation Patterns

### Entrance Animation (fade + slide)
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
  Content here
</motion.div>
```

### Hover Scale Effect
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
>
  Click me
</motion.button>
```

### Staggered List Animation
```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

## 3. Tailwind Animation Classes

Sudah tersedia di config:
- `animate-fadeIn` – fade in smooth
- `animate-slideIn` – slide dari kiri
- `animate-slideUp` – slide dari bawah

Gunakan:
```jsx
<div className="animate-fadeIn">Fades in smoothly</div>
```

## 4. Best Practices

- **Hindari:** Animasi terlalu cepat (<100ms) atau terlalu lambat (>1s default).
- **Gunakan:** `ease: 'easeOut'` untuk entrance, `type: 'spring'` untuk interaksi user.
- **Stagger:** Untuk list, gunakan staggerChildren agar elemen muncul satu per satu, bukan serentak.
- **Accessibility:** Tambahkan `prefers-reduced-motion` check untuk user yang sensitif motion.

```jsx
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={shouldReduceMotion ? {} : { opacity: 1 }}
  transition={shouldReduceMotion ? {} : { duration: 0.5 }}
>
  Content
</motion.div>
```

## 5. Hindari "AI Slop" — Buat Web yang Terasa Manusiawi

Tujuan: Web ini harus terasa dibuat dengan tangan, bukan di-generate dari template AI.

---

### 🚫 Animasi yang Dilarang
- Rotate 360° tanpa tujuan jelas
- Opacity flash berulang-ulang (blink effect)
- Spring physics dengan overshoot berlebihan (stiffness > 500)
- **Setiap** elemen di-animate — pilih titik fokus yang benar-benar perlu
- Bounce pada setiap klik button

### ✅ Animasi yang Baik
- Entrance halus hanya pada hero/section pertama yang terlihat
- Hover feedback smooth (`scale: 1.02`, bukan `1.1+`)
- Scroll-triggered animation untuk konten di bawah fold
- Spring pada elemen drag/interactive saja

---

### 🚫 Desain Visual yang Harus Dihindari
- **Gradient overload:** Lebih dari 2 warna gradient di satu section
- **Card grid identik:** Semua card sama persis — ukuran, padding, warna. Variasikan.
- **Rounded corners ekstrem:** `rounded-full` di mana-mana terlihat generik
- **Shadow seragam:** Jangan pakai shadow yang sama di semua elemen
- **Hero stock photo + overlay gelap + teks putih tengah:** Pola paling AI slop
- **"Transform Your Business"** atau tagline kosong tanpa substansi — tulis sesuatu spesifik tentang sekolah ini

### ✅ Desain yang Terasa Custom
- Gunakan warna brand (`primary: #2C5F2D`, `secondary: #97BC62`, `accent: #FFB800`) secara konsisten
- Variasikan layout antar section: full-width, grid, sidebar, asymmetric
- Tambahkan detail tekstur halus atau pattern SVG sebagai background
- Gunakan foto asli dari `/public/images/` — bukan ilustrasi placeholder generik

---

### 🚫 Copy/Teks yang Terasa AI-Generated
- "Kami berkomitmen untuk memberikan pelayanan terbaik" — terlalu generik
- "Solusi terdepan untuk masa depan cerah" — klise tanpa makna
- Bullet point 3 item dengan kata-kata sama panjangnya (classic AI pattern)
- Setiap section diakhiri dengan satu tombol CTA besar bertuliskan "Pelajari Lebih Lanjut"

### ✅ Copy yang Terasa Manusiawi
- Tulis dengan konteks spesifik: nama yayasan, lokasi (Bogor), jenjang (SMP/SMA/Pesantren)
- Gunakan angka nyata: "450+ alumni sejak 1995", "Akreditasi A dari BAN-S/M"
- Variasikan CTA: "Daftar Sekarang", "Lihat Program Kami", "Hubungi Kami" — sesuai konteks

---

### 🚫 Pola Komponen yang Klise
- Features section: icon + judul + deskripsi 3 kata × 6 buah
- Testimonial carousel autoplay dengan quote klise
- Footer dengan 4 kolom identik

### ✅ Komponen yang Berasa Custom
- Tunjukkan data nyata (statistik sekolah, jumlah siswa, prestasi)
- Testimonial dari wali murid/alumni dengan nama dan angkatan
- Variasi layout yang tidak simetris sempurna

