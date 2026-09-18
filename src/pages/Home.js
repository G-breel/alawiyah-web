import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaGraduationCap,
  FaMosque,
  FaBook,
  FaUsers,
  FaGlobe,
  FaFlask,
  FaPalette,
  FaFutbol,
  FaMusic,
  FaArrowRight,
  FaUserTie,
  FaSitemap,
  FaCrown,
  FaUserShield,
  FaUserCheck
} from 'react-icons/fa';
import initialSiteData from '../data/siteData.json';
import { fetchSiteData } from '../lib/supabase';
import { getAcademicYear } from '../lib/academicYear';

const AnimatedStatCard = ({ icon, target, suffix = '', label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const stepTime = 20;
          const steps = duration / stepTime;
          const increment = target / steps;
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, stepTime);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <div
      ref={ref}
      className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center transform hover:-translate-y-1 transition duration-300 shadow-lg"
    >
      <div className="mb-4 flex justify-center text-accent text-4xl">{icon}</div>
      <div className="text-4xl md:text-5xl font-extrabold mb-2 text-white">
        {count}
        {suffix}
      </div>
      <div className="text-gray-200 text-sm font-medium tracking-wide">{label}</div>
    </div>
  );
};

const StaffImageCard = ({ staff, isFeatured = false }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [staff.gambar]);

  return (
    <div className="relative h-56 sm:h-64 bg-slate-100 overflow-hidden">
      {!imageError && staff.gambar ? (
        <img
          src={staff.gambar}
          alt={staff.nama}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/90 to-green-900 flex flex-col items-center justify-center text-white p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-accent text-3xl mb-2 border border-white/20">
            {isFeatured ? <FaCrown /> : <FaUserTie />}
          </div>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">{staff.jabatan}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
    </div>
  );
};

const HeroSlider = ({ data }) => {
  const slides = data.heroImages && data.heroImages.length > 0 ? data.heroImages : initialSiteData.heroImages;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
    const id = setInterval(() => setIndex((p) => (p + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length, index]);

  const active = slides[index] || slides[0];

  return (
    <div className="relative bg-primary text-white overflow-hidden min-h-[500px] flex items-center">
      <div className="absolute inset-0 z-0">
        {active && active.gambar && (
          <img
            key={active.id || index}
            src={active.gambar}
            alt={active.judul || 'Hero Banner'}
            className="w-full h-full object-cover transition-all duration-1000 scale-105 opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-black/70" />
      </div>

      <div className="relative container mx-auto px-4 py-28 md:py-36 z-10">
        <div className="max-w-3xl animate-fade-in">
          <span className="inline-block bg-accent/20 text-accent border border-accent/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
            Selamat Datang di Yayasan
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-white drop-shadow-md">
            {data.siteInfo?.schoolName || initialSiteData.siteInfo.schoolName}
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-accent font-medium drop-shadow">
            {data.siteInfo?.slogan || initialSiteData.siteInfo.slogan}
          </p>
          <p className="text-base md:text-lg mb-10 text-gray-100 leading-relaxed max-w-2xl font-light">
            {active ? active.judul : ''}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/ppdb"
              className="bg-accent hover:bg-amber-400 text-slate-900 px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              Daftar Sekarang <FaArrowRight className="text-xs" />
            </Link>
            <Link
              to="/tentang"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-3.5 rounded-full font-semibold transition transform hover:-translate-y-0.5"
            >
              Tentang Kami
            </Link>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="flex gap-3 mt-12">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                  i === index ? 'w-10 bg-accent' : 'w-2.5 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 leading-none z-10">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 md:h-20 text-gray-50 preserve-3d">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};

const StaffSection = ({ staffList }) => {
  const list = staffList && staffList.length > 0 ? staffList : initialSiteData.staff;

  const categorizeStaff = (item) => {
    const role = (item.jabatan || '').toLowerCase();
    if (role.includes('ketua') || role.includes('yayasan') || role.includes('pembina') || role.includes('pendiri')) {
      return 1; // Top level
    }
    if (role.includes('kepala') || role.includes('principal') || role.includes('pimpinan')) {
      return 2; // School Principals (SMP, SMK, Pesantren)
    }
    if (role.includes('wakil') || role.includes('sekretaris') || role.includes('bendahara') || role.includes('kabid')) {
      return 3; // Vice principals & managers
    }
    return 4; // Teachers & staff
  };

  const level1 = list.filter(s => categorizeStaff(s) === 1);
  const level2 = list.filter(s => categorizeStaff(s) === 2);
  const level3 = list.filter(s => categorizeStaff(s) === 3);
  const level4 = list.filter(s => categorizeStaff(s) === 4);

  const topTier = level1.length > 0 ? level1 : [list[0]];
  const usedIds = new Set(topTier.map(s => s.id));

  const secondTier = level2.filter(s => !usedIds.has(s.id));
  secondTier.forEach(s => usedIds.add(s.id));

  const thirdTier = level3.filter(s => !usedIds.has(s.id));
  thirdTier.forEach(s => usedIds.add(s.id));

  const fourthTier = [...level4.filter(s => !usedIds.has(s.id)), ...list.filter(s => !usedIds.has(s.id))];

  return (
    <div className="py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <FaSitemap className="text-accent" /> Struktur Organisasi
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary mt-3">Bagan Pimpinan & Staff</h2>
          <p className="text-gray-600 mt-3 text-base">Bagan hierarki pimpinan & tenaga pendidik Yayasan Modern Al-Alawiyah</p>
        </div>

        <div className="flex flex-col items-center relative space-y-0">
          {/* Level 1: Top Management (Ketua / Pembina Yayasan) */}
          <div className={`grid gap-6 w-full ${topTier.length === 1 ? 'max-w-md' : 'max-w-3xl grid-cols-1 md:grid-cols-2'} z-10`}>
            {topTier.map((chairman) => (
              <div key={chairman.id} className="bg-white rounded-3xl shadow-xl border-2 border-accent/60 overflow-hidden group hover:shadow-2xl transition duration-500 w-full transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-primary to-green-900 text-white text-center py-2 px-4 flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase">
                  <FaCrown className="text-accent text-sm" /> Yayasan / Top Executive
                </div>
                <StaffImageCard staff={chairman} isFeatured={true} />
                <div className="p-6 text-center">
                  <span className="inline-block px-4 py-1 bg-accent text-gray-900 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 shadow-sm">
                    {chairman.jabatan}
                  </span>
                  <h3 className="font-extrabold text-xl text-gray-800 group-hover:text-primary transition">{chairman.nama}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{chairman.deskripsi}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Line connecting Level 1 to Level 2 */}
          {secondTier.length > 0 && (
            <>
              <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-green-600 my-0"></div>

              <div className="w-full max-w-4xl flex items-center justify-center relative">
                <div className="w-full border-t-2 border-green-600 h-0"></div>
                <div className="absolute w-3 h-3 bg-primary rounded-full -top-1.5"></div>
              </div>

              {/* Level 2: Kepala Sekolah / Pimpinan Unit */}
              <div className={`grid gap-8 w-full ${secondTier.length === 1 ? 'max-w-md' : secondTier.length === 2 ? 'max-w-4xl grid-cols-1 md:grid-cols-2' : 'max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} pt-8 z-10`}>
                {secondTier.map((p) => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="w-0.5 h-8 bg-green-600 -mt-8 mb-0"></div>
                    <div className="bg-white rounded-3xl shadow-lg border border-primary/30 overflow-hidden group hover:shadow-2xl transition duration-500 w-full transform hover:-translate-y-1">
                      <div className="bg-primary/10 text-primary text-center py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase border-b border-primary/10">
                        <FaUserShield className="text-primary" /> Kepala Sekolah / Unit
                      </div>
                      <StaffImageCard staff={p} />
                      <div className="p-6 text-center">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                          {p.jabatan}
                        </span>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition">{p.nama}</h3>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">{p.deskripsi}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Level 3: Wakil Kepala & Manajemen */}
          {thirdTier.length > 0 && (
            <>
              <div className="w-0.5 h-12 bg-gradient-to-b from-green-600 to-emerald-500 my-0"></div>

              <div className="w-full max-w-5xl flex items-center justify-center relative">
                <div className="w-full border-t-2 border-emerald-500 h-0"></div>
                <div className="absolute w-3 h-3 bg-green-600 rounded-full -top-1.5"></div>
              </div>

              <div className={`grid gap-6 w-full ${thirdTier.length === 1 ? 'max-w-md' : thirdTier.length === 2 ? 'max-w-3xl grid-cols-1 md:grid-cols-2' : 'max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} pt-8 z-10`}>
                {thirdTier.map((w) => (
                  <div key={w.id} className="flex flex-col items-center">
                    <div className="w-0.5 h-8 bg-emerald-500 -mt-8 mb-0"></div>
                    <div className="bg-white rounded-3xl shadow-md border border-emerald-100 overflow-hidden group hover:shadow-xl transition duration-500 w-full transform hover:-translate-y-1">
                      <div className="bg-emerald-50 text-emerald-800 text-center py-1.5 px-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase border-b border-emerald-100">
                        <FaUserCheck className="text-emerald-600" /> Wakil Kepala & Manajemen
                      </div>
                      <StaffImageCard staff={w} />
                      <div className="p-5 text-center">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                          {w.jabatan}
                        </span>
                        <h3 className="font-bold text-base text-gray-800 group-hover:text-primary transition">{w.nama}</h3>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{w.deskripsi}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Level 4: Tenaga Pendidik & Staff Pengajar */}
          {fourthTier.length > 0 && (
            <>
              <div className="w-0.5 h-12 bg-gradient-to-b from-emerald-500 to-gray-300 my-0"></div>

              <div className="w-full max-w-5xl flex items-center justify-center relative">
                <div className="w-full border-t-2 border-gray-300 h-0"></div>
                <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -top-1.5"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl pt-8 z-10">
                {fourthTier.map((s) => (
                  <div key={s.id} className="flex flex-col items-center">
                    <div className="w-0.5 h-8 bg-gray-300 -mt-8 mb-0"></div>
                    <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden group hover:shadow-xl transition duration-500 w-full transform hover:-translate-y-1">
                      <div className="bg-gray-50 text-gray-500 text-center py-1.5 px-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase border-b border-gray-100">
                        <FaUserCheck className="text-accent" /> Staff / Pengajar
                      </div>
                      <StaffImageCard staff={s} />
                      <div className="p-5 text-center">
                        <span className="inline-block px-3 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                          {s.jabatan}
                        </span>
                        <h3 className="font-bold text-base text-gray-800 group-hover:text-primary transition">{s.nama}</h3>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{s.deskripsi}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ProgramCards = ({ programsList }) => {
  const list = programsList && programsList.length > 0 ? programsList : initialSiteData.programs;
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-accent text-sm font-bold uppercase tracking-wider">Jenjang Pendidikan</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary mt-2">Program Pendidikan</h2>
          <p className="text-gray-600 mt-3 text-base">
            Kami menyediakan berbagai jenjang pendidikan dengan sistem yang terintegrasi
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {list.map((p) => {
            const targetPath = p.nama.toLowerCase().includes('smp')
              ? '/smp'
              : p.nama.toLowerCase().includes('smk')
              ? '/smk'
              : '/pesantren';
            return (
              <Link
                key={p.id}
                to={targetPath}
                className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition duration-500 transform hover:-translate-y-2 group flex flex-col"
              >
                <div className="h-56 bg-gray-100 overflow-hidden relative">
                  <img
                    src={p.gambar}
                    alt={p.nama}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary transition">
                      {p.nama}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">{p.deskripsi}</p>
                  </div>
                  <div className="flex items-center text-primary font-bold text-sm group-hover:text-accent transition gap-2 mt-auto">
                    <span>Lihat Detail</span>
                    <FaArrowRight className="text-xs transform group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [data, setData] = useState(initialSiteData);

  useEffect(() => {
    fetchSiteData().then((res) => {
      if (res) setData(res);
    });
  }, []);

  const stats = [
    { icon: <FaGraduationCap />, target: 500, suffix: '+', label: 'Siswa Aktif' },
    { icon: <FaUsers />, target: 30, suffix: '+', label: 'Ustadz / Ustadzah' },
    { icon: <FaBook />, target: 100, suffix: '+', label: 'Tahfizh Jenjang' },
    { icon: <FaMosque />, target: 13, suffix: '', label: 'Tahun Pengalaman' }
  ];

  const features = [
    {
      icon: <FaGraduationCap className="text-3xl" />,
      title: 'Pendidikan Berkualitas',
      description: 'Kurikulum nasional dan pendidikan agama yang terintegrasi'
    },
    {
      icon: <FaMosque className="text-3xl" />,
      title: 'Pendidikan Islami',
      description: 'Pembinaan akhlak dan pemahaman agama yang mendalam'
    },
    {
      icon: <FaBook className="text-3xl" />,
      title: 'Pesantren Modern',
      description: 'Sistem boarding school dengan fasilitas lengkap'
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: 'Tenaga Pengajar Profesional',
      description: 'Guru dan ustadz yang kompeten dan berpengalaman'
    }
  ];

  const highlightedPrograms = [
    {
      icon: <FaBook className="text-2xl" />,
      title: 'Tahfidz Al-Quran',
      description: 'Program menghafal Al-Quran dengan metode yang efektif dan bimbingan ustadz berpengalaman.'
    },
    {
      icon: <FaGlobe className="text-2xl" />,
      title: 'Bahasa Arab & Inggris',
      description: 'Pembelajaran bahasa internasional untuk membekali siswa kemampuan komunikasi global.'
    },
    {
      icon: <FaFlask className="text-2xl" />,
      title: 'Sains & Teknologi',
      description: 'Pembelajaran sains dengan praktikum dan laboratorium yang lengkap.'
    },
    {
      icon: <FaPalette className="text-2xl" />,
      title: 'Seni & Budaya',
      description: 'Pengembangan bakat seni musik, seni rupa, dan budaya Islami.'
    },
    {
      icon: <FaFutbol className="text-2xl" />,
      title: 'Olahraga',
      description: 'Berbagai kegiatan olahraga untuk kesehatan fisik dan team building.'
    },
    {
      icon: <FaMusic className="text-2xl" />,
      title: 'Nasyid & Hadroh',
      description: 'Kesenian islami untuk mengembangkan bakat vokal dan musik religi.'
    }
  ];

  return (
    <div className="bg-gray-50">
      <HeroSlider data={data} />

      <div className="bg-gradient-to-r from-primary via-green-800 to-primary py-14 border-y border-green-700/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <AnimatedStatCard
                key={idx}
                icon={stat.icon}
                target={stat.target}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </div>

      <div id="tentang" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-primary via-green-800 to-green-900 rounded-3xl p-10 shadow-2xl text-white relative overflow-hidden flex flex-col justify-center items-center min-h-[380px] border border-green-700/50">
                <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-accent/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -left-10 -top-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative text-center z-10">
                  <div className="w-24 h-24 mx-auto mb-6 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                    <FaMosque className="text-5xl text-accent" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {data.siteInfo?.schoolName || initialSiteData.siteInfo.schoolName}
                  </h3>
                  <p className="mt-3 text-white/80 max-w-sm text-sm">
                    {data.siteInfo?.slogan || initialSiteData.siteInfo.slogan}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <span className="text-accent text-sm font-bold uppercase tracking-wider">
                Profil Lembaga
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary mt-2 mb-6">
                Tentang Kami
              </h2>
              <p className="text-gray-600 mb-5 leading-relaxed text-base">
                Yayasan Modern Al-Alawiyah adalah lembaga pendidikan Islam yang berkomitmen untuk membina generasi muda yang berakhlak mulia, cerdas, dan berprestasi. Berlokasi di Kota Bogor, Jawa Barat, kami menyelenggarakan pendidikan dari tingkat SMP/MTs hingga SMK dengan sistem boarding school (pesantren).
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed text-base">
                Kami menggabungkan kurikulum nasional dengan pendidikan agama Islam yang mendalam, menciptakan keseimbangan antara ilmu dunia dan akhirat. Dengan fasilitas lengkap dan tenaga pengajar profesional, kami siap mencetak generasi pemimpin masa depan yang berintegritas.
              </p>
              <Link
                to="/tentang"
                className="inline-flex items-center gap-2 bg-primary hover:bg-green-800 text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
              >
                Selengkapnya <FaArrowRight className="text-xs" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-accent text-sm font-bold uppercase tracking-wider">Alasan Memilih Kami</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary mt-2">Keunggulan Kami</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition duration-300">
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-primary transition">
                    {feat.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProgramCards programsList={data.programs} />

      <StaffSection staffList={data.staff} />

      <div id="ppdb" className="py-20 bg-gradient-to-r from-primary via-green-800 to-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
          <span className="inline-block bg-accent/20 text-accent border border-accent/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Pendaftaran Dibuka
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            Penerimaan Peserta Didik Baru (PPDB)
          </h2>
          <p className="text-lg md:text-xl text-gray-100 mb-10 leading-relaxed">
            Pendaftaran tahun ajaran {getAcademicYear()} sudah dibuka! Bergabunglah bersama kami untuk meraih masa depan yang cerah dan berakhlak mulia.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/ppdb"
              className="bg-accent hover:bg-amber-400 text-slate-900 px-8 py-3.5 rounded-full font-bold shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              Daftar Online <FaArrowRight className="text-xs" />
            </Link>
            <Link
              to="/ppdb"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-3.5 rounded-full font-semibold transition transform hover:-translate-y-0.5"
            >
              Info Pendaftaran
            </Link>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-accent text-sm font-bold uppercase tracking-wider">Ekstrakurikuler & Program</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary mt-2 mb-3">Program Unggulan</h2>
            <p className="text-gray-600 text-base">
              Berbagai program untuk mengembangkan potensi siswa secara menyeluruh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlightedPrograms.map((prog, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-slate-900 transition duration-300">
                  {prog.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition">
                  {prog.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{prog.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
