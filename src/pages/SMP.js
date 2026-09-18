import React from 'react';
import { FaGraduationCap, FaBook, FaFlask, FaUsers, FaCheckCircle } from 'react-icons/fa';

const SMP = () => {
  const features = [
    { icon: <FaBook />, title: "Kurikulum Nasional", desc: "Mengacu pada kurikulum terbaru Kementerian Pendidikan terintegrasi nilai Islam." },
    { icon: <FaFlask />, title: "Laboratorium", desc: "Praktikum sains dan komputer modern pendukung sains digital." },
    { icon: <FaUsers />, title: "Pembinaan Karakter", desc: "Program pembentukan akhlak, kedisiplinan, dan kepemimpinan." },
    { icon: <FaGraduationCap />, title: "Persiapan Lanjut Studi", desc: "Pembekalan komprehensif untuk melanjutkan ke jenjang SMK/MA unggulan." }
  ];

  const keunggulan = [
    "Program tahfidz Al-Quran dengan target minimal 5 juz",
    "Pembelajaran bahasa Arab dan Inggris intensif",
    "Kegiatan ekstrakurikuler yang beragam dan aktif",
    "Bimbingan belajar persiapan ke jenjang SMK/MA",
    "Lingkungan yang kondusif untuk belajar dan beribadah"
  ];

  return (
    <div className="pb-16 bg-gray-50/50 min-h-screen">
      <div className="bg-gradient-to-r from-primary via-emerald-800 to-green-900 text-white py-16 px-4 shadow-md mb-12">
        <div className="container mx-auto text-center max-w-4xl">
          <span className="inline-block bg-accent text-gray-900 font-semibold px-4 py-1 rounded-full text-sm mb-4 shadow-sm">
            Jenjang Pendidikan Menengah Pertama
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">SMP / MTs Al-Alawiyah</h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Membentuk Generasi Cerdas, Berakhlak Mulia, dan Berwawasan Global
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 group flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center text-2xl mb-5 transition-colors duration-300 shadow-inner">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-gray-100">
          <div className="max-w-3xl mb-8">
            <h2 className="text-3xl font-bold text-primary mb-3">Keunggulan SMP/MTs Al-Alawiyah</h2>
            <p className="text-gray-600">Komitmen kami dalam menyajikan pendidikan berkualitas tinggi untuk putra-putri Anda.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keunggulan.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-50/50 transition">
                <FaCheckCircle className="text-accent text-xl flex-shrink-0 mt-1" />
                <span className="text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMP;
