import React, { useState, useRef, useEffect } from 'react';
import { 
  FaCalendarAlt, FaWhatsapp, FaCheckCircle, FaUser, FaPhone, 
  FaPaperPlane, FaTimes, FaSpinner, FaSearch, 
  FaPrint, FaIdCard, FaSchool, 
  FaGraduationCap, FaCheck, FaInfoCircle, FaShieldAlt
} from 'react-icons/fa';
import { sendPPDBForm, checkPPDBStatus, fetchJalurList, fetchSiteData } from '../lib/supabase';
import initialSiteData from '../data/siteData.json';
import { getAcademicYear, getTimelineYears } from '../lib/academicYear';

const PPDB = () => {
  const [siteInfo, setSiteInfo] = useState(initialSiteData.siteInfo);

  // Tahun ajaran diambil dari pengaturan situs (tidak dihitung otomatis)
  const academicYear = siteInfo.ppdbTahunAjaran && siteInfo.ppdbTahunAjaran.trim()
    ? siteInfo.ppdbTahunAjaran.trim()
    : getAcademicYear();
  const timeline = getTimelineYears(academicYear);
  const ppdbPhase = siteInfo.ppdbPhase || 'Pendaftaran Buka';
  const isRegistrationOpen = ppdbPhase === 'Pendaftaran Buka';
  const waNumber = siteInfo.whatsapp || '6281234567890';

  const [jalurList, setJalurList] = useState([]);

  useEffect(() => {
    fetchSiteData().then((res) => {
      if (res && res.siteInfo) setSiteInfo(res.siteInfo);
    });
    fetchJalurList().then(data => {
      const activeOnly = data.filter(j => j.aktif !== false);
      setJalurList(activeOnly);
      if (activeOnly.length > 0) {
        setFormData(prev => ({ ...prev, jalurPendaftaran: activeOnly[0].nama }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active view: 'info' or 'cek-status'
  const [activeTab, setActiveTab] = useState('info');

  // Modal Registration Form state
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const formOpenTimeRef = useRef(Date.now());
  const [errorMessage, setErrorMessage] = useState(null);

  const [formData, setFormData] = useState({
    namaCalonSiswa: '',
    jenisKelamin: 'Laki-laki',
    asalSekolah: '',
    nisn: '',
    jenjang: 'SMP/MTs',
    pilihanAsrama: 'Boarding (Asrama)',
    jalurPendaftaran: 'Reguler',
    jurusan: '',
    namaOrangTua: '',
    telepon: '',
    email: '',
    alamat: '',
    _hp_trap: ''
  });
  const [loading, setLoading] = useState(false);
  const [registeredCard, setRegisteredCard] = useState(null);

  // Self-Service Status Checker state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const openRegistrationModal = () => {
    formOpenTimeRef.current = Date.now();
    setErrorMessage(null);
    setShowPreview(false);
    setShowModal(true);
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Honeypot check (hidden bot trap)
    if (formData._hp_trap && formData._hp_trap.trim().length > 0) {
      console.warn('🛡️ Bot detected via Honeypot');
      return;
    }

    // 2. NISN required
    if (!formData.nisn || !formData.nisn.trim()) {
      setErrorMessage('NISN wajib diisi. Hubungi sekolah asal jika tidak punya.');
      return;
    }

    // 3. Minimal 1 dari email atau telepon
    if (!formData.telepon.trim() && !formData.email.trim()) {
      setErrorMessage('Minimal isi salah satu: No. WhatsApp atau Email untuk kami hubungi.');
      return;
    }

    // 4. Minimum Time Check (humans take at least 2.5 seconds to fill)
    const timeElapsed = Date.now() - formOpenTimeRef.current;
    if (timeElapsed < 2500) {
      setErrorMessage('Pengisian formulir terlalu cepat. Mohon periksa kembali data Anda.');
      return;
    }

    // 5. Device Rate Limiting (1 submission per 30 seconds per session)
    const lastSubmit = sessionStorage.getItem('last_ppdb_submit_time');
    if (lastSubmit && Date.now() - parseInt(lastSubmit, 10) < 30000) {
      const waitSec = Math.ceil((30000 - (Date.now() - parseInt(lastSubmit, 10))) / 1000);
      setErrorMessage(`Mohon tunggu ${waitSec} detik sebelum mengirim pendaftaran lagi.`);
      return;
    }

    // 6. Strict Indonesian Phone Validation (if provided)
    if (formData.telepon.trim()) {
      const cleanPhone = formData.telepon.replace(/[\s-]/g, '');
      if (!/^(08|628|\+628)[0-9]{8,12}$/.test(cleanPhone)) {
        setErrorMessage('Nomor WhatsApp tidak valid. Masukkan nomor HP aktif diawali 08 (10–13 digit).');
        return;
      }
    }

    // 7. Email validation (if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrorMessage('Email tidak valid. Contoh: nama@domain.com');
        return;
      }
    }

    // 8. Link / URL Injection Prevention in Name fields
    const linkRegex = /(https?:\/\/|www\.|\.ru|\.xyz|\.top|\.click|\.online|t\.me|wa\.me)/i;
    if (linkRegex.test(formData.namaCalonSiswa) || linkRegex.test(formData.namaOrangTua)) {
      setErrorMessage('Nama tidak boleh mengandung tautan website atau karakter mencurigakan.');
      return;
    }

    // 9. Show preview screen before final submit
    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    const result = await sendPPDBForm({ ...formData, tahunAjaran: academicYear });
    setLoading(false);

    sessionStorage.setItem('last_ppdb_submit_time', Date.now().toString());

    if (result && result.data) {
      const mapped = {
        id: result.data.id,
        nomorRegistrasi: result.data.nomor_registrasi || result.data.nomorRegistrasi,
        namaCalonSiswa: result.data.nama_calon_siswa || result.data.namaCalonSiswa,
        namaOrangTua: result.data.nama_orang_tua || result.data.namaOrangTua,
        jenjang: result.data.jenjang,
        pilihanAsrama: result.data.pilihan_asrama || result.data.pilihanAsrama,
        status: result.data.status,
        created_at: result.data.created_at
      };
      setRegisteredCard(mapped);
    } else {
      setRegisteredCard({
        nomorRegistrasi: `PPDB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Menunggu Verifikasi',
        ...formData,
        created_at: new Date().toISOString()
      });
    }

    setShowPreview(false);

    // Reset form fields
    setFormData({
      namaCalonSiswa: '',
      jenisKelamin: 'Laki-laki',
      asalSekolah: '',
      nisn: '',
      jenjang: 'SMP/MTs',
      pilihanAsrama: 'Boarding (Asrama)',
      jalurPendaftaran: 'Reguler',
      jurusan: '',
      namaOrangTua: '',
      telepon: '',
      email: '',
      alamat: '',
      _hp_trap: ''
    });
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    setSearchLoading(true);
    const results = await checkPPDBStatus(searchKeyword);
    const mapped = results.map(r => ({
      id: r.id,
      nomorRegistrasi: r.nomor_registrasi,
      namaCalonSiswa: r.nama_calon_siswa,
      namaOrangTua: r.nama_orang_tua,
      jenjang: r.jenjang,
      pilihanAsrama: r.pilihan_asrama,
      jalurPendaftaran: r.jalur_pendaftaran,
      status: r.status,
      catatanAdmin: r.catatan_admin,
      created_at: r.created_at
    }));
    setSearchResults(mapped);
    setSearchLoading(false);
  };

  const handlePrintCard = () => {
    window.print();
  };

  const requirements = [
    "Fotokopi Akta Kelahiran (2 Lembar)",
    "Fotokopi Kartu Keluarga (KK) terbaru",
    "Fotokopi Rapor Sekolah Asal (Semester 1–5)",
    "Pas Foto Berwarna 3x4 (4 Lembar)",
    "Surat Keterangan Sehat dari Dokter / Puskesmas",
    "Surat Keterangan Kelakuan Baik dari Sekolah Asal",
  ];

  const procedures = [
    {
      step: 1,
      title: "Pengisian Formulir Online",
      desc: "Isi data calon siswa dan orang tua secara lengkap melalui formulir online untuk mendapatkan Nomor Registrasi resmi.",
    },
    {
      step: 2,
      title: "Verifikasi Berkas & Pembayaran Pendaftaran",
      desc: "Panitia memverifikasi data dan konfirmasi biaya formulir pendaftaran Rp 350.000 via WhatsApp panitia.",
    },
    {
      step: 3,
      title: "Tes Observasi & Seleksi",
      desc: "Mengikuti tes kemampuan dasar akademik, tes baca Al-Qur'an (Tahsin/Hafalan), serta wawancara kesiapan santri dan orang tua.",
    },
    {
      step: 4,
      title: "Pengumuman & Daftar Ulang (Kunci Kursi)",
      desc: "Melihat hasil kelulusan di web ini. Calon siswa yang dinyatakan Lulus melakukan daftar ulang untuk mengunci kuota asrama dan kelas.",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Lulus Seleksi':
      case 'Lulus':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-full text-xs">🟢 Lulus Seleksi</span>;
      case 'Cadangan':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-3 py-1 rounded-full text-xs">🟠 Cadangan (Waiting List)</span>;
      case 'Daftar Ulang (Lunas)':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 font-bold px-3 py-1 rounded-full text-xs">🟣 Resmi Diterima (Lunas)</span>;
      case 'Jadwal Tes':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 font-bold px-3 py-1 rounded-full text-xs">🔵 Jadwal Tes Seleksi</span>;
      case 'Ditolak':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-3 py-1 rounded-full text-xs">🔴 Belum Memenuhi Syarat</span>;
      default:
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-3 py-1 rounded-full text-xs">🟡 Menunggu Verifikasi Berkas</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header with Dynamic Academic Year */}
      <div className="bg-gradient-to-r from-primary via-primary to-green-900 text-white py-14 md:py-20 px-4 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 border border-yellow-300/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <FaCalendarAlt className="text-[11px]" /> Tahun Ajaran {academicYear}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isRegistrationOpen
                ? 'bg-emerald-400/20 text-emerald-300 border-emerald-300/30'
                : ppdbPhase === 'Pengumuman'
                ? 'bg-blue-400/20 text-blue-300 border-blue-300/30'
                : 'bg-amber-400/20 text-amber-300 border-amber-300/30'
            }`}>
              <FaShieldAlt className="text-[11px]" /> {ppdbPhase}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Penerimaan Peserta Didik Baru (PPDB)
          </h1>
          <p className="text-green-100 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            Membentuk generasi Qur'ani, berakhlak mulia, cerdas, dan mandiri di Yayasan Modern Al-Alawiyah Bogor.
          </p>

          {/* Navigation Tabs (Informasi vs Cek Status) */}
          <div className="mt-8 inline-flex p-1.5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'info'
                  ? 'bg-white text-emerald-900 shadow-lg'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <FaInfoCircle /> Info & Pendaftaran Baru
            </button>
            <button
              onClick={() => setActiveTab('cek-status')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'cek-status'
                  ? 'bg-yellow-400 text-slate-900 shadow-lg font-extrabold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <FaSearch /> Cek Status Pendaftaran
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-6xl">
        {activeTab === 'info' ? (
          <>
            {/* CTA Box */}
            <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 rounded-3xl p-6 sm:p-8 text-center mb-12 shadow-xl text-gray-900 flex flex-col md:flex-row items-center justify-between gap-6 border border-yellow-300/60">
              <div className="text-left">
                <span className="inline-block bg-white/40 backdrop-blur-sm text-slate-900 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                  Kuota Terbatas Per Kelas & Asrama
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-1.5 text-slate-900">
                  {isRegistrationOpen
                    ? `PPDB Tahun Ajaran ${academicYear} Dibuka!`
                    : 'PPDB Tahun Ajaran ' + academicYear}
                </h2>
                <p className="font-semibold text-slate-800 text-sm md:text-base">
                  {isRegistrationOpen
                    ? 'Daftarkan putra/putri Anda sekarang untuk mendapatkan fasilitas gelombang terbaik.'
                    : 'Pendaftaran online saat ini ditutup. Silakan hubungi panitia PPDB untuk informasi lebih lanjut.'}
                </p>
              </div>
              {isRegistrationOpen ? (
                <button
                  onClick={openRegistrationModal}
                  className="bg-primary hover:bg-green-900 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 whitespace-nowrap cursor-pointer text-base flex items-center gap-2.5 group"
                >
                  <FaPaperPlane className="group-hover:translate-x-0.5 transition-transform" /> Formulir Pendaftaran Online
                </button>
              ) : (
                <div className="w-full md:max-w-md bg-white/80 backdrop-blur-sm border-2 border-rose-200 rounded-2xl p-4 text-left animate-fadeIn">
                  <p className="text-sm font-bold text-rose-700 flex items-center gap-2">
                    <FaInfoCircle /> Pendaftaran Online Sementara Ditutup
                  </p>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                    Mohon maaf, PPDB sedang dalam fase <strong className="text-slate-900">{ppdbPhase}</strong>. Pendaftaran online sementara ditutup.
                  </p>
                </div>
              )}
            </div>

            {/* Timeline Gelombang Dinamis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl p-7 text-center shadow-md hover:shadow-xl transition duration-300 border ${
                    item.status === 'Aktif' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 ${
                    item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <FaCalendarAlt />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{item.phase}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-3">{item.period}</p>
                  <div className="space-y-2">
                    <span
                      className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        item.status === 'Aktif'
                          ? 'bg-emerald-600 text-white'
                          : item.status === 'Segera'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.badge && (
                      <p className="text-[11px] text-emerald-700 font-semibold">{item.badge}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Persyaratan & Alur Prosedur */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-200">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Persyaratan Berkas Pendaftaran</h2>
                    <p className="text-xs text-slate-500">Diserahkan saat jadwal verifikasi fisik / tes seleksi</p>
                  </div>
                </div>
                <ul className="space-y-3.5">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3.5">
                      <FaCheck className="text-emerald-600 text-sm flex-shrink-0 mt-1 bg-emerald-50 p-1 w-5 h-5 rounded-full" />
                      <span className="text-slate-700 text-sm font-medium">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-200">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
                    <FaSchool />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Alur Standar Seleksi Swasta</h2>
                    <p className="text-xs text-slate-500">Tahapan seleksi hingga masuk asrama/kelas</p>
                  </div>
                </div>
                <div className="relative space-y-6 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {procedures.map((proc, index) => (
                    <div key={index} className="relative flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-md z-10">
                        {proc.step}
                      </div>
                      <div className="pt-0.5">
                        <h3 className="font-bold text-slate-800 text-sm mb-1">{proc.title}</h3>
                        <p className="text-slate-600 text-xs leading-relaxed">{proc.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hubungi Panitia via WhatsApp */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 text-center shadow-md border border-slate-200 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Konsultasi & Layanan Panitia PPDB
              </h2>
              <p className="text-slate-600 text-sm mb-6 max-w-lg mx-auto">
                Punya pertanyaan mengenai rincian biaya uang pangkal, kuota kamar asrama, atau program tahfidz? Tim panitia kami siap membantu via WhatsApp.
              </p>
              <a
                href={`https://wa.me/${waNumber}?text=Assalamu'alaikum%20Panitia%20PPDB%20Al-Alawiyah,%20saya%20ingin%20konsultasi%20pendaftaran%20tahun%20ajaran%20${academicYear}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition duration-300 text-sm cursor-pointer"
              >
                <FaWhatsapp className="text-xl" /> Hubungi Panitia via WhatsApp
              </a>
            </div>
          </>
        ) : (
          /* Tab 2: Cek Status Pendaftaran Mandiri */
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200 mb-8">
              <div className="text-center mb-8">
                <span className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center text-xl mx-auto mb-3">
                  <FaIdCard />
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Portal Cek Status Pendaftaran Siswa
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Pantau status verifikasi berkas, jadwal tes seleksi, dan pengumuman kelulusan putra/putri Anda secara mandiri.
                </p>
              </div>

              <form onSubmit={handleCheckStatus} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-3.5 text-slate-400 text-sm" />
                  <input
                    type="text"
                    required
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Masukkan No. Registrasi (contoh: PPDB-2026-XXXX) atau No. WhatsApp"
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="bg-primary hover:bg-green-900 text-white font-bold px-6 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm whitespace-nowrap disabled:opacity-60"
                >
                  {searchLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                  Cek Status
                </button>
              </form>

              {searchResults !== null && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <FaInfoCircle className="text-slate-400 text-3xl mx-auto mb-2" />
                      <p className="font-bold text-slate-700 text-sm">Data Tidak Ditemukan</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        Pastikan Nomor Registrasi atau Nomor WhatsApp yang Anda ketik sesuai saat mengisi formulir pendaftaran.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-600">Ditemukan {searchResults.length} Data Pendaftaran:</p>
                      {searchResults.map((item) => (
                        <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                                {item.jenjang} • {item.pilihanAsrama || 'Boarding'}
                              </span>
                              <h3 className="text-lg font-bold text-slate-900 mt-1">
                                {item.namaCalonSiswa}
                              </h3>
                              <p className="text-xs text-slate-500">No. Registrasi: <strong className="text-slate-800">{item.nomorRegistrasi || `PPDB-REG-${item.id}`}</strong></p>
                            </div>
                            <div>
                              {getStatusBadge(item.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Orang Tua / Wali</span>
                              <span className="font-semibold text-slate-800">{item.namaOrangTua}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Jalur Pendaftaran</span>
                              <span className="font-semibold text-slate-800">{item.jalurPendaftaran || 'Reguler'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tanggal Daftar</span>
                              <span className="font-semibold text-slate-800">{new Date(item.created_at || item.id).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>

                          {item.catatanAdmin && (
                            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900">
                              <p className="font-bold flex items-center gap-1.5 mb-1">
                                <FaInfoCircle /> Catatan Panitia Seleksi:
                              </p>
                              <p className="text-blue-800">{item.catatanAdmin}</p>
                            </div>
                          )}

                          <div className="flex justify-end pt-2">
                            <a
                              href={`https://wa.me/${waNumber}?text=Halo%20Panitia%20PPDB,%20saya%20ingin%20konfirmasi%20pendaftaran%20No.%20Reg:%20${item.nomorRegistrasi}%20atas%20nama%20${item.namaCalonSiswa}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl inline-flex items-center gap-2 transition"
                            >
                              <FaWhatsapp /> Hubungi Panitia
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulir Pendaftaran PPDB */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative animate-fadeIn max-h-[92vh] overflow-y-auto border border-slate-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer text-sm"
              title="Tutup"
            >
              <FaTimes />
            </button>

            <div className="mb-6">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
                Tahun Ajaran {academicYear}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Formulir Pendaftaran Online</h2>
              <p className="text-xs text-slate-500">Lengkapi data di bawah ini dengan benar untuk mendapatkan Nomor Registrasi resmi.</p>
            </div>

            {errorMessage && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
                <FaShieldAlt className="text-rose-600 text-base flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRegistration} className="space-y-4 text-sm">
              {/* Anti-Bot Honeypot Field (Hidden completely from human visitors) */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input
                  type="text"
                  name="_hp_trap"
                  tabIndex="-1"
                  autoComplete="off"
                  value={formData._hp_trap || ''}
                  onChange={(e) => setFormData({ ...formData, _hp_trap: e.target.value })}
                />
              </div>

              {/* Bagian 1: Identitas Calon Siswa */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <FaUser className="text-primary text-xs" /> 1. Data Calon Siswa
                </h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.namaCalonSiswa}
                    onChange={(e) => setFormData({ ...formData, namaCalonSiswa: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary"
                    placeholder="Nama calon siswa sesuai Akta Kelahiran"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                    <select
                      value={formData.jenisKelamin}
                      onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"
                    >
                      <option value="Laki-laki">Laki-laki (Ikhwan)</option>
                      <option value="Perempuan">Perempuan (Akhwat)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NISN *</label>
                    <input
                      type="text"
                      required
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-primary"
                      placeholder="Nomor Induk Siswa Nasional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asal Sekolah Sebelumnya</label>
                  <input
                    type="text"
                    value={formData.asalSekolah}
                    onChange={(e) => setFormData({ ...formData, asalSekolah: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary"
                    placeholder="Contoh: SD Negeri 1 Bogor / MI Al-Hidayah"
                  />
                </div>
              </div>

              {/* Bagian 2: Pilihan Jenjang & Asrama */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <FaGraduationCap className="text-primary text-xs" /> 2. Pilihan Jenjang & Asrama
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenjang Pendidikan *</label>
                    <select
                      value={formData.jenjang}
                      onChange={(e) => {
                        const newJenjang = e.target.value;
                        setFormData({
                          ...formData,
                          jenjang: newJenjang,
                          pilihanAsrama: newJenjang === 'Pesantren' ? 'Boarding (Asrama)' : formData.pilihanAsrama,
                          jurusan: newJenjang !== 'SMK' ? '' : formData.jurusan
                        });
                      }}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary font-semibold"
                    >
                      <option value="SMP/MTs">SMP / MTs Al-Alawiyah</option>
                      <option value="SMA/MA">SMA / MA Al-Alawiyah</option>
                      <option value="SMK">SMK Al-Alawiyah</option>
                      <option value="Pesantren">Pesantren Modern (Boarding Full)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilihan Asrama *</label>
                    <select
                      value={formData.jenjang === 'Pesantren' ? 'Boarding (Asrama)' : formData.pilihanAsrama}
                      disabled={formData.jenjang === 'Pesantren'}
                      onChange={(e) => setFormData({ ...formData, pilihanAsrama: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="Boarding (Asrama)">Boarding School (Tinggal di Asrama)</option>
                      <option value="Fullday (Non-Asrama)">Fullday School (Pulang-Pergi)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jalur Pendaftaran *</label>
                  <select
                    value={formData.jalurPendaftaran}
                    onChange={(e) => setFormData({ ...formData, jalurPendaftaran: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary font-medium"
                  >
                    {jalurList.length > 0 ? (
                      jalurList.map(j => (
                        <option key={j.id} value={j.nama}>{j.nama}</option>
                      ))
                    ) : (
                      <>
                        <option value="Reguler (Tes Umum)">Reguler (Tes Umum)</option>
                        <option value="Prestasi Akademik (Rapor / OSN)">Prestasi Akademik (Rapor / OSN)</option>
                        <option value="Beasiswa Tahfidz Al-Qur'an">Beasiswa Tahfidz Al-Qur'an</option>
                      </>
                    )}
                  </select>
                </div>

                {formData.jenjang === 'SMK' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kompetensi Keahlian SMK *</label>
                    <select
                      value={formData.jurusan}
                      required
                      onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary font-medium"
                    >
                      <option value="">-- Pilih Jurusan SMK --</option>
                      <option value="Teknik Komputer dan Jaringan (TKJ)">Teknik Komputer dan Jaringan (TKJ)</option>
                      <option value="Rekayasa Perangkat Lunak (RPL)">Rekayasa Perangkat Lunak (RPL)</option>
                      <option value="Multimedia (MM)">Multimedia (MM)</option>
                      <option value="Akuntansi dan Keuangan Lembaga (AKL)">Akuntansi dan Keuangan Lembaga (AKL)</option>
                      <option value="Otomatisasi dan Tata Kelola Perkantoran (OTP)">Otomatisasi dan Tata Kelola Perkantoran (OTP)</option>
                      <option value="Bisnis Daring dan Pemasaran (BDP)">Bisnis Daring dan Pemasaran (BDP)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Bagian 3: Data Orang Tua & Kontak */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <FaPhone className="text-primary text-xs" /> 3. Data Orang Tua / Wali
                </h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali *</label>
                  <input
                    type="text"
                    required
                    value={formData.namaOrangTua}
                    onChange={(e) => setFormData({ ...formData, namaOrangTua: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary"
                    placeholder="Nama Ayah / Ibu / Wali Siswa"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp Aktif</label>
                    <input
                      type="tel"
                      value={formData.telepon}
                      onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-primary"
                      placeholder="08xxxxxxxxxx (untuk info seleksi)"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Kontak</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-primary"
                      placeholder="email@domain.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Domisili Lengkap</label>
                  <textarea
                    rows={2}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-primary"
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-green-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <FaPaperPlane /> Cek Data & Lanjut Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Data Sebelum Kirim */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative animate-fadeIn border border-slate-200">
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Konfirmasi Data Pendaftaran</h3>
            <p className="text-xs text-slate-500 mb-4">Mohon periksa kembali data di bawah ini sebelum dikirim:</p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs mb-6">
              <p><strong>Nama Siswa:</strong> {formData.namaCalonSiswa}</p>
              <p><strong>Jenis Kelamin:</strong> {formData.jenisKelamin}</p>
              <p><strong>NISN:</strong> {formData.nisn}</p>
              <p><strong>Asal Sekolah:</strong> {formData.asalSekolah || '-'}</p>
              <hr className="my-2 border-slate-200" />
              <p><strong>Jenjang:</strong> {formData.jenjang} {formData.jurusan ? `(${formData.jurusan})` : ''}</p>
              <p><strong>Asrama:</strong> {formData.pilihanAsrama}</p>
              <p><strong>Jalur:</strong> {formData.jalurPendaftaran}</p>
              <hr className="my-2 border-slate-200" />
              <p><strong>Orang Tua/Wali:</strong> {formData.namaOrangTua}</p>
              <p><strong>No. WhatsApp:</strong> {formData.telepon || '-'}</p>
              <p><strong>Email:</strong> {formData.email || '-'}</p>
              <p><strong>Alamat:</strong> {formData.alamat || '-'}</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-xs cursor-pointer"
              >
                Ubah Data
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmSubmit}
                className="flex-1 bg-primary hover:bg-green-800 text-white font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                {loading ? 'Mengirim...' : 'Ya, Kirim Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kartu Bukti Pendaftaran Resmi (Setelah Berhasil Mendaftar) */}
      {registeredCard && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn border border-slate-200">
            <div className="text-center pb-4 border-b border-slate-200">
              <span className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xl mx-auto mb-2">
                <FaCheckCircle />
              </span>
              <h3 className="font-extrabold text-slate-900 text-lg">Pendaftaran Berhasil Terdaftar!</h3>
              <p className="text-xs text-slate-500">Simpan kartu bukti pendaftaran Anda di bawah ini:</p>
            </div>

            {/* Visual Registration Card */}
            <div className="my-5 p-5 bg-gradient-to-br from-emerald-900 to-primary text-white rounded-2xl shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[10px] text-yellow-300 font-bold uppercase tracking-wider">Yayasan Modern Al-Alawiyah</p>
                  <h4 className="text-sm font-extrabold text-white">Kartu Bukti Pendaftaran PPDB</h4>
                </div>
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white">
                  {academicYear}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 mb-3 text-center">
                <span className="text-[10px] text-green-100 uppercase tracking-wider block font-medium">Nomor Registrasi Resmi</span>
                <span className="text-xl font-black text-yellow-300 tracking-widest">{registeredCard.nomorRegistrasi}</span>
              </div>

              <div className="space-y-1.5 text-xs text-green-50">
                <p><strong>Nama:</strong> {registeredCard.namaCalonSiswa}</p>
                <p><strong>Jenjang:</strong> {registeredCard.jenjang} ({registeredCard.pilihanAsrama || 'Boarding'})</p>
                <p><strong>Orang Tua:</strong> {registeredCard.namaOrangTua}</p>
                <p><strong>Status:</strong> <span className="bg-yellow-400 text-slate-900 font-bold px-2 py-0.5 rounded text-[10px]">Menunggu Verifikasi</span></p>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 space-y-1">
              <p className="font-bold text-slate-800">📌 Langkah Selanjutnya:</p>
              <p>1. Simpan nomor registrasi di atas untuk cek status mandiri.</p>
              <p>2. Konfirmasi formulir ke panitia via WhatsApp untuk petunjuk jadwal tes seleksi.</p>
            </div>

            <div className="space-y-2">
              <a
                href={`https://wa.me/${waNumber}?text=Assalamu'alaikum%20Panitia%20PPDB,%20saya%20telah%20mendaftarkan%20calon%20siswa%20${encodeURIComponent(registeredCard.namaCalonSiswa)}%20dengan%20Nomor%20Registrasi:%20${registeredCard.nomorRegistrasi}.%20Mohon%20petunjuk%20selanjutnya.`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow cursor-pointer"
              >
                <FaWhatsapp className="text-base" /> Konfirmasi ke WhatsApp Panitia
              </a>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrintCard}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FaPrint /> Cetak / Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegisteredCard(null);
                    setShowModal(false);
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition text-xs cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PPDB;
