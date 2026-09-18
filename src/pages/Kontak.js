import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaPaperPlane, FaMapMarkerAlt, FaCheckCircle, FaSpinner, FaShieldAlt, FaWhatsapp } from 'react-icons/fa';
import { sendContactMessage, fetchSiteData } from '../lib/supabase';
import initialSiteData from '../data/siteData.json';

const Kontak = () => {
  const formOpenTimeRef = useRef(Date.now());
  const [siteInfo, setSiteInfo] = useState(initialSiteData.siteInfo);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    pesan: '',
    _hp_trap: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchSiteData().then((res) => {
      if (res && res.siteInfo) setSiteInfo(res.siteInfo);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Honeypot check (hidden bot trap)
    if (formData._hp_trap && formData._hp_trap.trim().length > 0) {
      console.warn('🛡️ Bot detected via Honeypot');
      return;
    }

    // 2. Minimum Time Check (humans take at least 2 seconds to type message)
    const timeElapsed = Date.now() - formOpenTimeRef.current;
    if (timeElapsed < 2000) {
      setErrorMessage('Pengiriman pesan terlalu cepat. Mohon periksa kembali pesan Anda.');
      return;
    }

    // 3. Rate limiting (cooldown 30 seconds per submission)
    const lastSubmit = sessionStorage.getItem('last_contact_submit_time');
    if (lastSubmit && Date.now() - parseInt(lastSubmit, 10) < 30000) {
      const waitSec = Math.ceil((30000 - (Date.now() - parseInt(lastSubmit, 10))) / 1000);
      setErrorMessage(`Mohon tunggu ${waitSec} detik sebelum mengirim pesan lagi.`);
      return;
    }

    // 4. Link/Spam injection check in name
    const linkRegex = /(https?:\/\/|www\.|\.ru|\.xyz|\.top|\.click|\.online|t\.me|wa\.me)/i;
    if (linkRegex.test(formData.nama)) {
      setErrorMessage('Nama tidak boleh mengandung tautan web atau karakter promosi.');
      return;
    }

    setLoading(true);
    await sendContactMessage(formData);
    setLoading(false);

    sessionStorage.setItem('last_contact_submit_time', Date.now().toString());
    setSubmitted(true);
    setFormData({ nama: '', email: '', telepon: '', pesan: '', _hp_trap: '' });

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-primary via-primary to-green-900 text-white py-16 px-4 text-center shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Hubungi Kami</h1>
          <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto">
            Kami siap menjawab pertanyaan Anda tentang Yayasan Modern Al-Alawiyah
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-primary mb-6 pb-3 border-b border-gray-100">
                Informasi Kontak
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Alamat</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {siteInfo.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <FaPhone />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Telepon</h3>
                    <p className="text-gray-600 font-medium">{siteInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Email</h3>
                    <p className="text-gray-600 font-medium">{siteInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">WhatsApp</h3>
                    <a
                      href={`https://wa.me/${siteInfo.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 font-medium hover:text-primary transition"
                    >
                      +{siteInfo.whatsapp}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 h-80">
              <iframe
                title="Lokasi Yayasan Modern Al-Alawiyah"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.689625624131!2d106.7725459!3d-6.5607519!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c4f1c9c45b77%3A0x2ff2bc4eb2d9a3b9!2sTanah%20Sareal%2C%20Bogor%20City%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1680000000000!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-primary mb-6 pb-3 border-b border-gray-100">
              Kirim Pesan
            </h2>

            {submitted && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 animate-fadeIn text-sm">
                <FaCheckCircle className="text-green-600 text-xl flex-shrink-0" />
                <span>Pesan Anda berhasil dikirim! Tim kami akan merespons segera.</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 animate-fadeIn text-sm font-semibold">
                <FaShieldAlt className="text-rose-600 text-xl flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Anti-Bot Honeypot Field */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input
                  type="text"
                  name="_hp_trap"
                  tabIndex="-1"
                  autoComplete="off"
                  value={formData._hp_trap || ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Nama Lengkap</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="Masukkan email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Nomor Telepon</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Pesan</label>
                <textarea
                  name="pesan"
                  value={formData.pesan}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="Tulis pesan Anda"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-green-800 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <FaSpinner className="animate-spin text-lg" /> : <FaPaperPlane />}
                {loading ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kontak;
