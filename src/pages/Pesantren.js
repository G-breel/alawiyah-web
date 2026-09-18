import React from 'react';
import { FaBed, FaUtensils, FaClinicMedical, FaBookReader, FaShieldAlt, FaWifi } from 'react-icons/fa';

const Pesantren = () => {
  const facilities = [
    { icon: <FaBed />, title: "Asrama Nyaman", desc: "Kamar ber-AC dengan fasilitas lengkap dan kapasitas teratur." },
    { icon: <FaUtensils />, title: "Kantin & Dapur", desc: "Menu makanan halal, higienis, dan bergizi seimbang 3x sehari." },
    { icon: <FaClinicMedical />, title: "Klinik Kesehatan", desc: "Layanan kesehatan 24 jam dengan tenaga medis siaga." },
    { icon: <FaBookReader />, title: "Ruang Belajar", desc: "Fasilitas belajar mengajar terpadu yang modern dan kondusif." },
    { icon: <FaShieldAlt />, title: "Keamanan 24 Jam", desc: "Sistem pengawasan CCTV terintegrasi dan petugas keamanan." },
    { icon: <FaWifi />, title: "Akses Internet", desc: "Jaringan internet terpantau khusus untuk kebutuhan studi santri." }
  ];

  const schedule = [
    { time: "03.30 - 04.30", activity: "Qiyamul Lail & Shalat Subuh Berjamaah" },
    { time: "05.00 - 06.00", activity: "Setoran Tahfidz Al-Quran & Shalat Dhuha" },
    { time: "07.00 - 12.00", activity: "Kegiatan Belajar Mengajar (KBM) Formal" },
    { time: "12.00 - 13.00", activity: "Shalat Dzuhur, Makan Siang & Istirahat" },
    { time: "14.00 - 15.30", activity: "Kegiatan Belajar Formal & Pendalaman" },
    { time: "15.30 - 17.00", activity: "Shalat Ashar & Ekstrakurikuler / Olahraga" },
    { time: "18.30 - 20.00", activity: "Shalat Maghrib, Kajian Kitab & Shalat Isya" },
    { time: "20.00 - 21.30", activity: "Belajar Mandiri Terbimbing / Mudzakarah" }
  ];

  return (
    <div className="pb-16 bg-gray-50/50 min-h-screen">
      <div className="bg-gradient-to-r from-primary via-emerald-800 to-green-900 text-white py-16 px-4 shadow-md mb-12">
        <div className="container mx-auto text-center max-w-4xl">
          <span className="inline-block bg-accent text-gray-900 font-semibold px-4 py-1 rounded-full text-sm mb-4 shadow-sm">
            Boarding School & Pembinaan 24 Jam
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Pesantren Modern Al-Alawiyah</h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Menyelaraskan Ilmu Religius dan Sains Modern dalam Lingkungan Islami
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-primary mb-3">Fasilitas Asrama</h2>
            <p className="text-gray-600">Sarana pendukung kenyamanan dan keamanan santri selama menuntut ilmu.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((item, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-100 rounded-2xl p-6 flex items-start gap-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-primary group-hover:bg-primary group-hover:text-accent flex-shrink-0 flex items-center justify-center text-2xl transition duration-300 shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-primary text-white p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center">Jadwal Harian Santri</h2>
            <p className="text-center text-emerald-100 text-sm mt-1">Rutinitas kedisiplinan dan pembiasaan ibadah 24 jam</p>
          </div>
          <div className="p-6 md:p-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-primary">
                    <th className="py-3 px-4 font-bold text-sm uppercase tracking-wider w-1/3">Waktu</th>
                    <th className="py-3 px-4 font-bold text-sm uppercase tracking-wider">Kegiatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schedule.map((item, index) => (
                    <tr key={index} className="hover:bg-emerald-50/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-gray-700">{item.time}</td>
                      <td className="py-3.5 px-4 text-gray-600">{item.activity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pesantren;
