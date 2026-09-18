import React, { useState, useEffect } from 'react';
import initialSiteData from '../data/siteData.json';
import { fetchSiteData } from '../lib/supabase';
import { FaPlay, FaTimes, FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';

const Galeri = () => {
  const [activeTab, setActiveTab] = useState('foto');
  const [filter, setFilter] = useState('semua');
  const [data, setData] = useState(initialSiteData);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    fetchSiteData().then((res) => {
      if (res) setData(res);
    });
  }, []);

  const fotos = data.galeri && data.galeri.length > 0 ? data.galeri : initialSiteData.galeri;
  const categories = ['semua', ...Array.from(new Set(fotos.map((f) => f.kategori)))];
  const filtered = filter === 'semua' ? fotos : fotos.filter((f) => f.kategori === filter);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      }
    };

    // Lock scroll on background
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, filtered.length]);

  const activePhoto = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % filtered.length);
  };

  const videos = [
    { title: "Profil Yayasan Al-Alawiyah" },
    { title: "Kegiatan Pesantren" },
    { title: "Wisuda Tahfidz 2025" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-primary via-primary to-green-900 text-white py-16 px-4 text-center shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Galeri</h1>
          <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto">
            Dokumentasi kegiatan dan fasilitas Yayasan Modern Al-Alawiyah
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6">
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-full shadow-md border border-gray-100 inline-flex">
            <button
              onClick={() => setActiveTab('foto')}
              className={`px-8 py-2.5 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'foto' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:text-primary'
              }`}
            >
              Foto
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-8 py-2.5 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'video' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:text-primary'
              }`}
            >
              Video
            </button>
          </div>
        </div>

        {activeTab === 'foto' && (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setFilter(c);
                    setLightboxIndex(null);
                  }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-300 cursor-pointer ${
                    filter === c
                      ? 'bg-primary text-white shadow-md scale-105'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary shadow-sm'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((foto, index) => (
                <div
                  key={foto.id || index}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 bg-white cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="w-full h-72 bg-gray-100 overflow-hidden relative">
                    <img
                      src={foto.gambar}
                      alt={foto.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Hover Icon indicator */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                    <FaExpand className="text-sm" />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="text-white transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-block bg-accent text-gray-900 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                          {foto.kategori}
                        </span>
                        <span className="text-[11px] text-white/70 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">
                          Klik untuk full screen
                        </span>
                      </div>
                      <h3 className="text-xl font-bold leading-tight">{foto.judul}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-gray-400 py-16 font-medium">
                Belum ada foto di kategori ini. Tambah via Admin → Galeri.
              </p>
            )}
          </>
        )}

        {activeTab === 'video' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
              >
                <div className="relative h-56 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 text-white/70 flex items-center justify-center text-xl pl-1">
                    <FaPlay />
                  </div>
                  <span className="absolute top-3 right-3 bg-accent text-slate-900 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Segera Hadir
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-800">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Video dokumentasi akan segera tersedia.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal Fullscreen */}
      {lightboxIndex !== null && activePhoto && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between z-10 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="bg-accent text-slate-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                {activePhoto.kategori}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Foto {lightboxIndex + 1} dari {filtered.length}
              </span>
            </div>

            <button
              onClick={() => setLightboxIndex(null)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer text-lg"
              title="Tutup (Esc)"
            >
              <FaTimes />
            </button>
          </div>

          {/* Main Photo Area with Prev/Next Controls */}
          <div className="flex-1 flex items-center justify-between my-2 relative" onClick={(e) => e.stopPropagation()}>
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition cursor-pointer text-xl sm:text-2xl z-20 flex-shrink-0"
              title="Foto Sebelumnya (Panah Kiri)"
            >
              <FaChevronLeft />
            </button>

            {/* Centered Image View */}
            <div className="flex-1 flex items-center justify-center px-4 max-h-[75vh] md:max-h-[80vh]">
              <img
                key={activePhoto.id || lightboxIndex}
                src={activePhoto.gambar}
                alt={activePhoto.judul}
                className="max-h-[75vh] md:max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300 select-none animate-fadeIn"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition cursor-pointer text-xl sm:text-2xl z-20 flex-shrink-0"
              title="Foto Berikutnya (Panah Kanan)"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Footer Caption */}
          <div className="text-center z-10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1">
              {activePhoto.judul}
            </h2>
            <p className="text-xs text-slate-400">
              Gunakan tombol panah ⬅️ ➡️ di keyboard untuk berpindah foto • Tekan Esc untuk keluar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Galeri;
