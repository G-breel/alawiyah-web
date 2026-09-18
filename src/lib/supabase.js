import { createClient } from '@supabase/supabase-js';
import fallbackData from '../data/siteData.json';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || 'https://rqvecsfaqmxfnivaomjf.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_rA1SrOUgnd2YyYvvuwTJ5g_arul1xJD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOCAL_STORAGE_KEY = 'al_alawiyah_site_data';

export function getLocalSiteData() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.jurusan) parsed.jurusan = fallbackData.jurusan || [];
      if (!parsed.programs) parsed.programs = fallbackData.programs || [];
      if (parsed.siteInfo) {
        parsed.siteInfo.ppdbTahunAjaran = parsed.siteInfo.ppdbTahunAjaran || fallbackData.siteInfo.ppdbTahunAjaran || '';
        parsed.siteInfo.ppdbPhase = parsed.siteInfo.ppdbPhase || fallbackData.siteInfo.ppdbPhase || 'Pendaftaran Buka';
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse local site data:', e);
  }
  return fallbackData;
}

export function saveLocalSiteData(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save local site data:', e);
  }
}

const TABLE_MAP = {
  staff: 'staff',
  galeri: 'galeri',
  heroImages: 'hero_images',
  hero_images: 'hero_images',
  programs: 'programs',
  jurusan: 'jurusan',
  siteInfo: 'site_info',
  site_info: 'site_info'
};

export async function fetchSiteData() {
  const localData = getLocalSiteData();
  try {
    const [
      { data: staff, error: e1 },
      { data: galeri, error: e2 },
      { data: heroImages, error: e3 },
      { data: programs, error: e4 },
      { data: jurusan, error: e5 },
      { data: siteInfo, error: e6 }
    ] = await Promise.all([
      supabase.from('staff').select('*').order('id', { ascending: true }),
      supabase.from('galeri').select('*').order('id', { ascending: true }),
      supabase.from('hero_images').select('*').order('id', { ascending: true }),
      supabase.from('programs').select('*').order('id', { ascending: true }),
      supabase.from('jurusan').select('*').order('id', { ascending: true }),
      supabase.from('site_info').select('*').single()
    ]);

    const cleanSiteInfo = (siteInfo && !e6) ? {
      schoolName: siteInfo.schoolName || localData.siteInfo.schoolName,
      slogan: siteInfo.slogan || localData.siteInfo.slogan,
      address: siteInfo.address || localData.siteInfo.address,
      phone: siteInfo.phone || localData.siteInfo.phone,
      email: siteInfo.email || localData.siteInfo.email,
      whatsapp: siteInfo.whatsapp || localData.siteInfo.whatsapp,
      ppdbTahunAjaran: siteInfo.ppdbTahunAjaran || localData.siteInfo.ppdbTahunAjaran || '',
      ppdbPhase: siteInfo.ppdbPhase || localData.siteInfo.ppdbPhase || 'Pendaftaran Buka'
    } : localData.siteInfo;

    const merged = {
      siteInfo: cleanSiteInfo,
      staff: (Array.isArray(staff) && !e1) ? staff : localData.staff,
      galeri: (Array.isArray(galeri) && !e2) ? galeri : localData.galeri,
      heroImages: (Array.isArray(heroImages) && !e3) ? heroImages : localData.heroImages,
      programs: (Array.isArray(programs) && !e4) ? programs : localData.programs,
      jurusan: (Array.isArray(jurusan) && !e5) ? jurusan : localData.jurusan
    };

    saveLocalSiteData(merged);
    return merged;
  } catch (err) {
    console.warn('Menggunakan data lokal:', err.message);
    return localData;
  }
}

export async function saveCollectionItem(collectionKey, item) {
  const tableName = TABLE_MAP[collectionKey] || collectionKey;
  
  try {
    const { error } = await supabase.from(tableName).upsert(item);
    if (error) {
      console.error(`Gagal menyimpan ke Supabase (${tableName}):`, error.message);
      throw error;
    }
  } catch (err) {
    console.warn(`Simpan Supabase gagal (${tableName}), menggunakan lokal:`, err.message);
  }

  // Update localStorage as cache/fallback
  const current = getLocalSiteData();
  const list = current[collectionKey] || [];
  const index = list.findIndex(i => i.id === item.id);
  const updatedList = index >= 0 ? list.map(i => i.id === item.id ? item : i) : [...list, item];
  const updatedData = { ...current, [collectionKey]: updatedList };
  saveLocalSiteData(updatedData);
  return updatedData;
}

export async function deleteCollectionItem(collectionKey, id) {
  const tableName = TABLE_MAP[collectionKey] || collectionKey;
  
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      console.error(`Gagal menghapus dari Supabase (${tableName}):`, error.message);
      throw error;
    }
  } catch (err) {
    console.warn(`Hapus Supabase gagal (${tableName}), menggunakan lokal:`, err.message);
  }

  const current = getLocalSiteData();
  const list = current[collectionKey] || [];
  const updatedList = list.filter(i => i.id !== id);
  const updatedData = { ...current, [collectionKey]: updatedList };
  saveLocalSiteData(updatedData);
  return updatedData;
}

export async function deleteCollectionItems(collectionKey, ids) {
  const tableName = TABLE_MAP[collectionKey] || collectionKey;
  
  try {
    const { error } = await supabase.from(tableName).delete().in('id', ids);
    if (error) {
      console.error(`Gagal hapus massal dari Supabase (${tableName}):`, error.message);
      throw error;
    }
  } catch (err) {
    console.warn(`Hapus massal Supabase gagal (${tableName}), menggunakan lokal:`, err.message);
  }

  const current = getLocalSiteData();
  const list = current[collectionKey] || [];
  const updatedList = list.filter(i => !ids.includes(i.id));
  const updatedData = { ...current, [collectionKey]: updatedList };
  saveLocalSiteData(updatedData);
  return updatedData;
}

export async function saveSiteInfo(siteInfo) {
  const payload = {
    id: 1,
    schoolName: siteInfo.schoolName,
    slogan: siteInfo.slogan,
    address: siteInfo.address,
    phone: siteInfo.phone,
    email: siteInfo.email,
    whatsapp: siteInfo.whatsapp,
    ppdbTahunAjaran: siteInfo.ppdbTahunAjaran || '',
    ppdbPhase: siteInfo.ppdbPhase || 'Pendaftaran Buka',
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase.from('site_info').upsert(payload);
    if (error) {
      console.error('Gagal update site_info ke Supabase:', error.message);
      throw error;
    }
  } catch (err) {
    console.warn('Update site_info Supabase gagal, menggunakan lokal:', err.message);
  }

  const current = getLocalSiteData();
  const updatedData = { ...current, siteInfo };
  saveLocalSiteData(updatedData);
  return updatedData;
}

// Anti-Spam & Bot Protection Engine
function isBotSpam(payload = {}) {
  // 1. Honeypot check: If the hidden honeypot field is filled, it's definitely a bot
  if (payload._hp_trap && String(payload._hp_trap).trim().length > 0) {
    console.warn('🛡️ Bot spam caught via Honeypot trap');
    return true;
  }

  // 2. Link / Promo check in name fields (spambots usually inject URLs)
  const linkRegex = /(https?:\/\/|www\.|\.ru|\.xyz|\.top|\.click|\.online|t\.me|wa\.me)/i;
  const nameFields = [payload.nama, payload.namaCalonSiswa, payload.namaOrangTua];
  for (const f of nameFields) {
    if (f && linkRegex.test(String(f))) {
      console.warn('🛡️ Bot spam caught via Link injection in name');
      return true;
    }
  }

  // 3. Phone number validation (must contain valid numbers, not random alphabetic strings)
  if (payload.telepon) {
    const cleanPhone = String(payload.telepon).replace(/[-+\s]/g, '');
    if (!/^\d{8,15}$/.test(cleanPhone)) {
      console.warn('🛡️ Bot spam caught via Invalid phone number format');
      return true;
    }
  }

  return false;
}

export async function sendContactMessage({ nama, email, telepon, pesan, _hp_trap }) {
  // Discard silently if bot detected
  if (isBotSpam({ nama, email, telepon, pesan, _hp_trap })) {
    return { success: true };
  }

  const newMsg = { id: Date.now(), nama, email, telepon, pesan, created_at: new Date().toISOString() };

  try {
    const { error } = await supabase.from('pesan_kontak').insert([newMsg]);
    if (error) throw error;
  } catch (err) {
    console.warn('Simpan pesan lokal:', err.message);
  }

  try {
    const localMsgs = JSON.parse(localStorage.getItem('pesan_kontak') || '[]');
    localStorage.setItem('pesan_kontak', JSON.stringify([newMsg, ...localMsgs]));
  } catch (e) {}

  return { success: true };
}

export async function fetchContactMessages() {
  try {
    const { data, error } = await supabase.from('pesan_kontak').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (e) {}

  try {
    return JSON.parse(localStorage.getItem('pesan_kontak') || '[]');
  } catch (e) {
    return [];
  }
}

export async function deleteContactMessage(id) {
  try {
    await supabase.from('pesan_kontak').delete().eq('id', id);
  } catch (e) {}

  try {
    const msgs = JSON.parse(localStorage.getItem('pesan_kontak') || '[]');
    const updated = msgs.filter(m => m.id !== id);
    localStorage.setItem('pesan_kontak', JSON.stringify(updated));
  } catch (e) {}
}

export async function sendPPDBForm(formData) {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const nomorRegistrasi = `PPDB-${year}-${randomSuffix}`;

  // Clean honeypot trap before saving
  const { _hp_trap, ...cleanFormData } = formData;

  // Tahun ajaran aktif mengikuti pengaturan situs (misal "2026/2027")
  const tahunAjaran = cleanFormData.tahunAjaran || cleanFormData.tahun_ajaran || String(year);

  // If detected as bot, silently return fake success without cluttering database
  if (isBotSpam(formData)) {
    return { 
      success: true, 
      data: { 
        id: crypto.randomUUID(), 
        nomor_registrasi: nomorRegistrasi, 
        status: 'Menunggu Verifikasi', 
        ...cleanFormData,
        created_at: new Date().toISOString()
      } 
    };
  }

  const newReg = {
    nomor_registrasi: nomorRegistrasi,
    tahun_ajaran: tahunAjaran,
    nama_calon_siswa: cleanFormData.namaCalonSiswa,
    jenis_kelamin: cleanFormData.jenisKelamin,
    nisn: cleanFormData.nisn,
    asal_sekolah: cleanFormData.asalSekolah,
    jenjang: cleanFormData.jenjang,
    jurusan: cleanFormData.jurusan || null,
    pilihan_asrama: cleanFormData.pilihanAsrama,
    jalur_pendaftaran: cleanFormData.jalurPendaftaran,
    nama_orang_tua: cleanFormData.namaOrangTua,
    telepon: cleanFormData.telepon,
    email: cleanFormData.email || null,
    alamat: cleanFormData.alamat || null,
    status: 'Menunggu Verifikasi'
  };

  try {
    const { data, error } = await supabase.from('ppdb_pendaftaran').insert([newReg]).select().single();
    if (error) {
      console.warn('Supabase PPDB insert warning:', error.message);
      throw error;
    }
    return { success: true, data };
  } catch (err) {
    console.warn('Simpan PPDB lokal:', err.message);
    return { success: true, data: { ...newReg, id: crypto.randomUUID(), created_at: new Date().toISOString() } };
  }
}

export async function fetchPPDBList() {
  try {
    const { data, error } = await supabase.from('ppdb_pendaftaran').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (e) {}
  return [];
}

export async function updatePPDBItem(id, updates) {
  const mapped = {
    nomor_registrasi: updates.nomorRegistrasi,
    nama_calon_siswa: updates.namaCalonSiswa,
    nama_orang_tua: updates.namaOrangTua,
    jenis_kelamin: updates.jenisKelamin,
    nisn: updates.nisn,
    asal_sekolah: updates.asalSekolah,
    jenjang: updates.jenjang,
    jurusan: updates.jurusan,
    pilihan_asrama: updates.pilihanAsrama,
    jalur_pendaftaran: updates.jalurPendaftaran,
    telepon: updates.telepon,
    email: updates.email,
    alamat: updates.alamat,
    status: updates.status,
    catatan_admin: updates.catatanAdmin
  };
  
  Object.keys(mapped).forEach(k => mapped[k] === undefined && delete mapped[k]);

  try {
    const { error } = await supabase.from('ppdb_pendaftaran').update(mapped).eq('id', id);
    if (error) console.warn('Supabase update PPDB error:', error.message);
    return { success: !error };
  } catch (e) {
    console.warn('Update PPDB error:', e.message);
    return { success: false };
  }
}

export async function deletePPDBItem(id) {
  try {
    await supabase.from('ppdb_pendaftaran').delete().eq('id', id);
    return { success: true };
  } catch (e) {
    console.warn('Delete PPDB error:', e.message);
    return { success: false };
  }
}

export async function checkPPDBStatus(keyword) {
  if (!keyword || !keyword.trim()) return [];
  const clean = keyword.trim();

  try {
    const { data, error } = await supabase
      .from('ppdb_pendaftaran')
      .select('*')
      .or(`nomor_registrasi.ilike.%${clean}%,telepon.ilike.%${clean}%,nama_calon_siswa.ilike.%${clean}%`);
    if (!error && data && data.length > 0) return data;
  } catch (e) {
    console.warn('Check status error:', e.message);
  }
  return [];
}

export async function fetchJalurList() {
  try {
    const { data, error } = await supabase.from('ppdb_jalur').select('*').order('urutan', { ascending: true });
    if (!error && data && data.length > 0) return data;
  } catch (e) {}

  return [
    { id: '1', nama: 'Reguler (Tes Umum)', deskripsi: 'Tes potensi akademik, tes baca Al-Qur\'an & wawancara', aktif: true, urutan: 1 },
    { id: '2', nama: 'Prestasi Akademik (Rapor / OSN)', deskripsi: 'Bebas tes tulis dengan melampirkan sertifikat lomba atau nilai rapor min. 85', aktif: true, urutan: 2 },
    { id: '3', nama: 'Beasiswa Tahfidz Al-Qur\'an', deskripsi: 'Khusus calon santri penghafal Al-Qur\'an minimal 3 Juz', aktif: true, urutan: 3 },
    { id: '4', nama: 'Jalur Alumni / Internal', deskripsi: 'Potongan khusus untuk lulusan internal Yayasan Al-Alawiyah', aktif: true, urutan: 4 },
    { id: '5', nama: 'Beasiswa Afirmasi (Yatim / Dhuafa)', deskripsi: 'Bantuan beasiswa penuh untuk anak yatim atau keluarga kurang mampu', aktif: true, urutan: 5 }
  ];
}

export async function saveJalurItem(item) {
  try {
    const { data, error } = await supabase.from('ppdb_jalur').upsert(item).select().single();
    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.warn('Save Jalur error:', e.message);
    return { success: false };
  }
}

export async function deleteJalurItem(id) {
  try {
    const { error } = await supabase.from('ppdb_jalur').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.warn('Delete Jalur error:', e.message);
    return { success: false };
  }
}
