/**
 * Utilitas Tahun Ajaran Otomatis (Academic Year Helper)
 * Otomatis menghitung tahun ajaran PPDB berdasarkan kalender berjalan,
 * tanpa perlu mengubah kode sumber di masa mendatang.
 */

export function getAcademicYear(override = null) {
  if (override && typeof override === 'string' && override.trim().length > 0) {
    return override.trim();
  }
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Januari, 9 = Oktober, 11 = Desember

  // PPDB gelombang 1 umumnya dibuka mulai Oktober/November untuk tahun ajaran berikutnya
  if (month >= 9) {
    return `${year + 1}/${year + 2}`;
  }
  return `${year}/${year + 1}`;
}

export function getTimelineYears(overrideYear = null) {
  const acadYear = getAcademicYear(overrideYear);
  const startYear = parseInt(acadYear.split('/')[0], 10) || new Date().getFullYear();
  
  return [
    { phase: "Gelombang 1", period: `Januari - Maret ${startYear}`, status: "Aktif", badge: "Diskon Biaya Masuk 15%" },
    { phase: "Gelombang 2", period: `April - Mei ${startYear}`, status: "Segera", badge: "Reguler" },
    { phase: "Gelombang 3", period: `Juni - Juli ${startYear}`, status: "Akan Datang", badge: "Sisa Kuota" },
  ];
}
