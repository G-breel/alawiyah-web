import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tentang from './pages/Tentang';
import VisiMisi from './pages/VisiMisi';
import Program from './pages/Program';
import SMP from './pages/SMP';
import SMK from './pages/SMK';
import Pesantren from './pages/Pesantren';
import Galeri from './pages/Galeri';
import Kontak from './pages/Kontak';
import PPDB from './pages/PPDB';
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/admin/AdminDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App min-h-screen flex flex-col justify-between">
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/tentang" element={<Layout><Tentang /></Layout>} />
          <Route path="/visi-misi" element={<Layout><VisiMisi /></Layout>} />
          <Route path="/program" element={<Layout><Program /></Layout>} />
          <Route path="/smp" element={<Layout><SMP /></Layout>} />
          <Route path="/smk" element={<Layout><SMK /></Layout>} />
          <Route path="/pesantren" element={<Layout><Pesantren /></Layout>} />
          <Route path="/galeri" element={<Layout><Galeri /></Layout>} />
          <Route path="/kontak" element={<Layout><Kontak /></Layout>} />
          <Route path="/ppdb" element={<Layout><PPDB /></Layout>} />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
