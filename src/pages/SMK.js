import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaBriefcase, FaCircleCheck, FaLaptopCode, FaNetworkWired } from 'react-icons/fa6';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import initialSiteData from '../data/siteData.json';
import { fetchSiteData } from '../lib/supabase';

const SMK = () => {
  const [jurusan, setJurusan] = useState(initialSiteData.jurusan || []);

  useEffect(() => {
    fetchSiteData().then((res) => {
      if (res && res.jurusan) setJurusan(res.jurusan);
    });
  }, []);

  const programUnggulan = [
    {
      icon: <FaLaptopCode />,
      title: "Kelas Industri",
      desc: "Kurikulum kolaboratif dengan dunia industri & DU/DI (Dunia Usaha dan Dunia Industri)."
    },
    {
      icon: <FaNetworkWired />,
      title: "PKL Terstruktur",
      desc: "Praktik Kerja Lapangan langsung di perusahaan-perusahaan IT, perkantoran, dan UMKM ternama."
    },
    {
      icon: <FaGraduationCap />,
      title: "Sertifikasi & Uji Kompetensi",
      desc: "Persiapan sertifikasi kompetensi dan pendampingan melanjutkan ke perguruan tinggi / dunia kerja."
    }
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen">

      {/* Hero / Header */}
      <div className="bg-gradient-to-r from-primary via-emerald-800 to-green-900 text-white py-16 px-4 shadow-md mb-12">
        <div className="container mx-auto text-center max-w-4xl">
          <span className="inline-block bg-accent text-slate-900 font-semibold px-4 py-1 rounded-full text-sm mb-4 shadow-sm">
            Jenjang Pendidikan Menengah Kejuruan
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">SMK Al-Alawiyah</h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Siap Bekerja, Siap Wirausaha, Siap Kuliah — dengan kompetensi keahlian industri modern
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl space-y-16">

        {/* Jurusan / Kompetensi Keahlian */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-3">Kompetensi Keahlian (Jurusan)</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Pilih jurusan yang sesuai dengan minat & bakat untuk masa depan yang cemerlang.
            </p>
          </div>
          {jurusan.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400">
              Belum ada data jurusan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jurusan.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition duration-300 flex flex-col"
                >
                  <div className="h-44 bg-slate-100 overflow-hidden relative">
                    {item.gambar ? (
                      <img
                        src={item.gambar}
                        alt={item.nama}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    ) : null}
                    <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {item.kode || 'Jurusan'}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{item.nama}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed flex-1">{item.deskripsi}</p>
                    {item.karir && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                          <FaBriefcase /> Prospek Karir:
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.karir}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Program Unggulan */}
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-slate-100">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Program Unggulan SMK</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programUnggulan.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50/80 hover:bg-emerald-50/60 transition duration-300 border border-slate-100"
              >
                <div className="text-primary text-3xl mb-4 p-3 bg-white rounded-full shadow-sm">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kenapa Pilih SMK Al-Alawiyah */}
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-slate-100">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Kenapa Memilih SMK Al-Alawiyah?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Fasilitas laboratorium komputer & jaringan modern",
              "Guru & instruktur ahli dengan pengalaman industri",
              "Pembinaan tahfidz & karakter Islami terpadu",
              "Jaringan kerjasama dengan industri & perguruan tinggi",
              "Sistem boarding school (pesantren) 24 jam",
              "Bimbingan kewirausahaan berbasis digital",
            ].map((poin, index) => (
              <div key={index} className="flex items-start gap-3">
                <FaCircleCheck className="text-emerald-600 mt-0.5" />
                <p className="text-slate-600">{poin}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/ppdb"
              className="inline-flex items-center gap-2 bg-accent hover:bg-amber-400 text-slate-900 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
            >
              Daftar PPDB Sekarang <FaArrowRight />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SMK;