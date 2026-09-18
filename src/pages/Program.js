import React from 'react';
import { FaBook, FaMicroscope, FaLanguage, FaMusic, FaFutbol, FaPalette } from 'react-icons/fa';

const Program = () => {
  const programs = [
    {
      title: "Tahfidz Al-Quran",
      description: "Program menghafal Al-Quran dengan metode yang efektif dan bimbingan ustadz/ustadzah berpengalaman.",
      icon: <FaBook />
    },
    {
      title: "Bahasa Arab & Inggris",
      description: "Pembelajaran bahasa internasional untuk membekali siswa kemampuan komunikasi global.",
      icon: <FaLanguage />
    },
    {
      title: "Sains & Teknologi",
      description: "Pembelajaran sains dengan praktikum dan laboratorium yang lengkap.",
      icon: <FaMicroscope />
    },
    {
      title: "Seni & Budaya",
      description: "Pengembangan bakat seni musik, seni rupa, dan budaya Islami.",
      icon: <FaPalette />
    },
    {
      title: "Olahraga",
      description: "Berbagai kegiatan olahraga untuk kesehatan fisik dan team building.",
      icon: <FaFutbol />
    },
    {
      title: "Nasyid & Hadroh",
      description: "Kesenian islami untuk mengembangkan bakat vokal dan musik religi.",
      icon: <FaMusic />
    }
  ];

  const ekskulList = [
    "Pramuka", "PMR", "Paskibra", "Futsal", "Basket", "Badminton", "Marawis", "Hadroh", "Tari"
  ];

  return (
    <div>
      <div className="bg-gradient-to-r from-primary via-green-800 to-primary text-white py-16 px-4 mb-12 shadow-md text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Program Kami</h1>
        <p className="text-gray-100 text-lg max-w-2xl mx-auto">
          Berbagai program unggulan untuk mengembangkan potensi siswa secara menyeluruh
        </p>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {programs.map((program, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-accent flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl mb-6">
                  {program.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{program.title}</h3>
                <p className="text-gray-600 leading-relaxed">{program.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary to-green-800 rounded-2xl p-8 md:p-12 text-white text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-accent/10 rounded-full blur-2xl pointer-events-none"></div>
          <h2 className="text-3xl font-bold mb-4">Ekstrakurikuler</h2>
          <p className="text-gray-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Berbagai kegiatan ekstrakurikuler untuk mengembangkan minat dan bakat siswa:
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {ekskulList.map((item, idx) => (
              <span 
                key={idx} 
                className="bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-full text-sm font-medium hover:bg-accent hover:text-primary transition-all duration-200 shadow-sm cursor-default"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Program;
