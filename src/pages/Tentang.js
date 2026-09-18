import React from 'react';
import { FaMosque, FaGraduationCap, FaBuilding, FaUserCheck } from 'react-icons/fa';

const Tentang = () => {
  return (
    <div>
      <div className="bg-gradient-to-r from-primary via-green-800 to-primary text-white py-16 px-4 mb-12 shadow-md text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Tentang Kami</h1>
        <p className="text-gray-100 text-lg max-w-2xl mx-auto">
          Mengenal lebih dekat Yayasan Modern Al-Alawiyah
        </p>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div className="bg-gradient-to-br from-primary to-green-700 rounded-2xl h-80 flex items-center justify-center text-white shadow-xl transform transition hover:scale-[1.02]">
              <div className="text-center p-6">
                <FaMosque className="text-7xl mx-auto text-accent mb-4" />
                <p className="text-2xl font-bold tracking-wide">Yayasan Modern Al-Alawiyah</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-primary mb-4">Sejarah Singkat</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Yayasan Modern Al-Alawiyah berdiri dengan semangat untuk menyediakan pendidikan Islam berkualitas di Kota Bogor. Berawal dari keinginan luhur untuk mencetak generasi muda yang tidak hanya cerdas secara akademis, tetapi juga memiliki akhlak mulia dan kematangan spiritual.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Seiring berjalannya waktu, yayasan kami terus berkembang dan kini telah menjadi salah satu lembaga pendidikan Islam terkemuka di wilayah Bogor dan sekitarnya.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16 shadow-inner">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Mengapa Memilih Kami?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-accent">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary text-2xl">
                <FaGraduationCap />
              </div>
              <h3 className="font-bold text-xl text-primary mb-3">Kurikulum Terintegrasi</h3>
              <p className="text-gray-600 leading-relaxed">Menggabungkan kurikulum nasional dengan pendidikan agama yang komprehensif.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-accent">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary text-2xl">
                <FaBuilding />
              </div>
              <h3 className="font-bold text-xl text-primary mb-3">Fasilitas Lengkap</h3>
              <p className="text-gray-600 leading-relaxed">Asrama nyaman, laboratorium, perpustakaan, dan fasilitas olahraga modern.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-accent">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary text-2xl">
                <FaUserCheck />
              </div>
              <h3 className="font-bold text-xl text-primary mb-3">Tenaga Profesional</h3>
              <p className="text-gray-600 leading-relaxed">Guru dan ustadz yang kompeten, berpengalaman, dan berdedikasi tinggi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tentang;
