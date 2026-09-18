import React from 'react';
import { FaBook, FaHeart, FaHandshake, FaStar, FaCheckCircle } from 'react-icons/fa';

const VisiMisi = () => {
  const misiItems = [
    "Menyelenggarakan pendidikan Islam yang berkualitas dan berkarakter.",
    "Mengembangkan potensi siswa dalam bidang akademik, spiritual, dan keterampilan.",
    "Membentuk pribadi yang berintegritas, disiplin, dan bertanggung jawab.",
    "Membekali siswa dengan ilmu agama dan pengetahuan umum yang seimbang.",
    "Menyiapkan siswa untuk melanjutkan ke jenjang pendidikan yang lebih tinggi."
  ];

  return (
    <div>
      <div className="bg-gradient-to-r from-primary via-green-800 to-primary text-white py-16 px-4 mb-12 shadow-md text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Visi & Misi</h1>
        <p className="text-gray-100 text-lg max-w-2xl mx-auto">
          Arah dan tujuan Yayasan Modern Al-Alawiyah dalam mendidik generasi muda
        </p>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-primary text-white rounded-2xl p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between border-b-8 border-accent">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <div className="inline-block bg-accent/20 text-accent px-4 py-1 rounded-full text-sm font-semibold mb-4 uppercase tracking-wider">
                Landasan Utama
              </div>
              <h2 className="text-3xl font-bold mb-6 border-b border-white/20 pb-4">Visi</h2>
              <p className="text-xl leading-relaxed font-light text-gray-100 italic">
                "Menjadi lembaga pendidikan Islam terkemuka yang melahirkan generasi berakhlak mulia, cerdas, terampil, dan berwawasan global yang berlandaskan Al-Quran dan As-Sunnah."
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-xl relative overflow-hidden border-t-8 border-primary">
            <div className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold mb-4 uppercase tracking-wider">
              Komitmen Kami
            </div>
            <h2 className="text-3xl font-bold mb-6 text-primary border-b border-gray-100 pb-4">Misi</h2>
            <ul className="space-y-4 text-gray-700">
              {misiItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <FaCheckCircle className="text-accent text-lg flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 shadow-inner">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Nilai-Nilai Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-accent text-2xl shadow-md">
                <FaBook />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Ta'lim</h3>
              <p className="text-gray-600 text-sm">Semangat menuntut ilmu</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-accent text-2xl shadow-md">
                <FaHeart />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Ibadah</h3>
              <p className="text-gray-600 text-sm">Ketaatan kepada Allah SWT</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-accent text-2xl shadow-md">
                <FaHandshake />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Ukhuwah</h3>
              <p className="text-gray-600 text-sm">Persaudaraan yang kuat</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-accent text-2xl shadow-md">
                <FaStar />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Ihsan</h3>
              <p className="text-gray-600 text-sm">Berbuat yang terbaik</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisiMisi;
