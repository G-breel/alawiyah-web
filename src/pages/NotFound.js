import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="py-24 bg-gray-50 flex items-center justify-center min-h-[60vh]">
      <div className="container mx-auto px-4 text-center max-w-lg">
        <div className="w-20 h-20 bg-green-100 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          <FaExclamationTriangle />
        </div>
        <h1 className="text-6xl font-extrabold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-8">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md hover:shadow-lg"
        >
          <FaHome /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
