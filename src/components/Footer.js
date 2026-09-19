import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import initialSiteData from '../data/siteData.json';
import { fetchSiteData } from '../lib/supabase';

const Footer = () => {
  const [siteInfo, setSiteInfo] = useState(initialSiteData.siteInfo);

  useEffect(() => {
    fetchSiteData().then((res) => {
      if (res && res.siteInfo) setSiteInfo(res.siteInfo);
    });
  }, []);

  return (
    <footer className="bg-gradient-to-br from-primary via-green-900 to-primary text-white border-t border-green-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-white">{siteInfo.schoolName}</h3>
            <p className="text-green-100/80 text-sm leading-relaxed">
              {siteInfo.slogan || 'Lembaga pendidikan Islam terpadu yang menggabungkan pendidikan agama dan umum untuk mencetak generasi berakhlak mulia.'}
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-gray-900 transition duration-300"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-gray-900 transition duration-300"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-gray-900 transition duration-300"
              >
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold uppercase tracking-wider mb-6 text-accent">Link Cepat</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/tentang" className="text-green-100/80 hover:text-accent transition duration-200">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/visi-misi" className="text-green-100/80 hover:text-accent transition duration-200">
                  Visi & Misi
                </Link>
              </li>
              <li>
                <Link to="/program" className="text-green-100/80 hover:text-accent transition duration-200">
                  Program Kami
                </Link>
              </li>
              <li>
                <Link to="/galeri" className="text-green-100/80 hover:text-accent transition duration-200">
                  Galeri Foto & Video
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-bold uppercase tracking-wider mb-6 text-accent">Pendidikan</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/smp" className="text-green-100/80 hover:text-accent transition duration-200">
                  SMP / MTs
                </Link>
              </li>
              <li>
                <Link to="/smk" className="text-green-100/80 hover:text-accent transition duration-200">
                  SMK (Kompetensi Keahlian)
                </Link>
              </li>
              <li>
                <Link to="/pesantren" className="text-green-100/80 hover:text-accent transition duration-200">
                  Pesantren Modern
                </Link>
              </li>
              <li>
                <Link to="/ppdb" className="text-green-100/80 hover:text-accent transition duration-200">
                  PPDB Online
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-bold uppercase tracking-wider mb-6 text-accent">Kontak</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-accent flex-shrink-0" />
                <p className="text-green-100/80 leading-relaxed">{siteInfo.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-accent flex-shrink-0" />
                <a href={`tel:${siteInfo.phone}`} className="text-green-100/80 hover:text-accent transition">
                  {siteInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-accent flex-shrink-0" />
                <a href={`mailto:${siteInfo.email}`} className="text-green-100/80 hover:text-accent transition">
                  {siteInfo.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-green-800/80 bg-black/20 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-green-100/60">
          <p>&copy; {new Date().getFullYear()} {siteInfo.schoolName}. All Rights Reserved.</p>
        </div>
      </div>

      {/* Developer Credit */}
      <div className="bg-black/40 border-t border-green-900/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <img
              src="/favicon.ico"
              alt="JIB Tech"
              title="Developed by JIB Tech"
              className="w-5 h-5 object-contain opacity-50 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
