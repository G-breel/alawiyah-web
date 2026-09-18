import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaPhone, FaEnvelope, FaChevronDown } from 'react-icons/fa';
import initialSiteData from '../data/siteData.json';
import { fetchSiteData } from '../lib/supabase';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [siteInfo, setSiteInfo] = useState(initialSiteData.siteInfo);
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchSiteData().then((res) => {
      if (res && res.siteInfo) setSiteInfo(res.siteInfo);
    });
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setOpenDropdown(null);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;
  const isGroupActive = (paths) => paths.some(p => location.pathname === p);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const navLinks = [
    { to: '/', label: 'Beranda' },
    {
      label: 'Tentang Kami',
      children: [
        { to: '/tentang', label: 'Profil' },
        { to: '/visi-misi', label: 'Visi & Misi' },
        { to: '/program', label: 'Program Kami' },
      ]
    },
    {
      label: 'Pendidikan',
      children: [
        { to: '/smp', label: 'SMP/MTs' },
        { to: '/smk', label: 'SMK' },
        { to: '/pesantren', label: 'Pesantren' },
      ]
    },
    { to: '/galeri', label: 'Galeri' },
    { to: '/kontak', label: 'Kontak' },
  ];

  return (
    <>
      <div className="bg-primary text-white py-2 hidden lg:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href={`tel:${siteInfo.phone}`} className="flex items-center gap-2 hover:text-accent transition">
              <FaPhone className="text-xs" /> {siteInfo.phone}
            </a>
            <a href={`mailto:${siteInfo.email}`} className="flex items-center gap-2 hover:text-accent transition">
              <FaEnvelope className="text-xs" /> {siteInfo.email}
            </a>
          </div>
          <div className="text-white/80 max-w-lg truncate" title={siteInfo.address}>
            {siteInfo.address}
          </div>
        </div>
      </div>

      <nav className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-green-700 transition shadow-sm">
                {siteInfo.schoolName ? siteInfo.schoolName.charAt(0) : 'A'}
              </div>
              <div>
                <div className="text-lg font-bold text-primary leading-tight">{siteInfo.schoolName}</div>
                <div className="text-[10px] text-gray-400 leading-tight hidden sm:block">Bogor, Jawa Barat</div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
              {navLinks.map((item, i) => (
                item.children ? (
                  <div key={i} className="relative">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                        isGroupActive(item.children.map(c => c.to))
                          ? 'text-primary bg-green-50'
                          : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                      <FaChevronDown className={`text-[10px] transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-48 animate-fadeIn">
                        {item.children.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={`block px-4 py-2.5 text-sm transition ${
                              isActive(child.to)
                                ? 'text-primary bg-green-50 font-medium'
                                : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isActive(item.to)
                        ? 'text-primary bg-green-50'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              <Link
                to="/ppdb"
                className="ml-2 bg-accent text-slate-900 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-amber-400 transition shadow-sm hover:shadow"
              >
                PPDB
              </Link>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={isOpen}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>

          <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] pb-4' : 'max-h-0'}`}>
            <div className="border-t border-gray-100 pt-2 space-y-1">
              {navLinks.map((item, i) => (
                item.children ? (
                  <div key={i}>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                        isGroupActive(item.children.map(c => c.to))
                          ? 'text-primary bg-green-50'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                      <FaChevronDown className={`text-[10px] transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === item.label && (
                      <div className="ml-4 border-l-2 border-green-200 pl-4 space-y-1 mt-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={`block py-2 text-sm transition ${
                              isActive(child.to)
                                ? 'text-primary font-medium'
                                : 'text-gray-500 hover:text-primary'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive(item.to)
                        ? 'text-primary bg-green-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              <Link
                to="/ppdb"
                className="block mx-4 mt-2 bg-accent text-slate-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-400 transition text-center"
              >
                PPDB - Daftar Sekarang
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
