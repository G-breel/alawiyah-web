import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaSignOutAlt, FaDownload, FaPlus, FaTrash, FaEdit, 
  FaUserTie, FaImages, FaSlidersH, FaGraduationCap, FaInfoCircle,
  FaSearch, FaCheck, FaLock, FaUser, FaInbox, FaUserGraduate, FaSync,
  FaTable, FaThLarge, FaTimes, FaUpload, FaEye, FaLayerGroup,
  FaExpand, FaFileExcel, FaCopy, FaWhatsapp, FaFilter
} from 'react-icons/fa';

import { 
  fetchSiteData,
  saveCollectionItem, deleteCollectionItem, deleteCollectionItems, saveSiteInfo,
  fetchContactMessages, deleteContactMessage,
  fetchPPDBList, deletePPDBItem, updatePPDBItem,
  fetchJalurList, saveJalurItem, deleteJalurItem
} from '../../lib/supabase';
import { getAcademicYear } from '../../lib/academicYear';

function getFrameDimensions(ratio) {
  if (ratio === '1/1') return { frameW: 220, frameH: 220 };
  if (ratio === '16/9') return { frameW: 336, frameH: 189 };
  return { frameW: 292, frameH: 219 };
}

// Bounding constraint: ensures the image NEVER reveals black borders inside the crop frame
function clampPan(panX, panY, zoom, frameW, frameH, nw, nh) {
  const w = nw > 0 ? nw : 1200;
  const h = nh > 0 ? nh : 900;
  const z = Math.max(1, zoom || 1);

  const imgAspect = w / h;
  const frameAspect = frameW / frameH;
  let baseW, baseH;
  if (imgAspect > frameAspect) {
    baseH = frameH;
    baseW = Math.round(baseH * imgAspect);
  } else {
    baseW = frameW;
    baseH = Math.round(baseW / imgAspect);
  }

  const dispW = baseW * z;
  const dispH = baseH * z;

  const maxPanX = Math.max(0, (dispW - frameW) / 2);
  const maxPanY = Math.max(0, (dispH - frameH) / 2);

  const clampedX = Math.max(-maxPanX, Math.min(maxPanX, panX));
  const clampedY = Math.max(-maxPanY, Math.min(maxPanY, panY));

  return { panX: clampedX, panY: clampedY };
}

function cropImageCanvas(imageSrc, frameW, frameH, panX = 0, panY = 0, zoom = 1) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const nw = img.naturalWidth || 1200;
        const nh = img.naturalHeight || 900;

        const imgAspect = nw / nh;
        const frameAspect = frameW / frameH;
        let baseW, baseH;
        if (imgAspect > frameAspect) {
          baseH = frameH;
          baseW = Math.round(baseH * imgAspect);
        } else {
          baseW = frameW;
          baseH = Math.round(baseW / imgAspect);
        }

        const dispW = baseW * zoom;
        const dispH = baseH * zoom;

        // Apply same strict boundary clamp before rendering onto canvas
        const { panX: safePanX, panY: safePanY } = clampPan(panX, panY, zoom, frameW, frameH, nw, nh);

        const imgLeft = (frameW / 2 + safePanX) - (dispW / 2);
        const imgTop = (frameH / 2 + safePanY) - (dispH / 2);

        const scale = dispW / nw;
        const srcX = Math.max(0, (0 - imgLeft) / scale);
        const srcY = Math.max(0, (0 - imgTop) / scale);
        const srcW = Math.min(nw - srcX, frameW / scale);
        const srcH = Math.min(nh - srcY, frameH / scale);

        let targetWidth = 1200;
        let targetHeight = Math.round(targetWidth / frameAspect);
        if (frameAspect < 1) {
          targetHeight = 1200;
          targetWidth = Math.round(targetHeight * frameAspect);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch (err) {
        console.error('Error in canvas crop:', err);
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

const TABS = [
  { id: 'Overview', label: 'Overview', icon: <FaSlidersH /> },
  { id: 'Staff', label: 'Staff & Pengajar', icon: <FaUserTie /> },
  { id: 'Galeri', label: 'Galeri Foto', icon: <FaImages /> },
  { id: 'Hero Images', label: 'Hero Banner', icon: <FaSlidersH /> },
  { id: 'Programs', label: 'Program Utama', icon: <FaGraduationCap /> },
  { id: 'Jurusan', label: 'Jurusan SMK', icon: <FaLayerGroup /> },
  { id: 'Jalur PPDB', label: 'Jalur Pendaftaran', icon: <FaFilter /> },
  { id: 'Site Info', label: 'Informasi Situs', icon: <FaInfoCircle /> },
  { id: 'Pesan Masuk', label: 'Pesan Masuk', icon: <FaInbox /> },
  { id: 'Data PPDB', label: 'Pendaftaran PPDB', icon: <FaUserGraduate /> },
];

const FIELD_LABELS = {
  schoolName: 'Nama Sekolah',
  slogan: 'Slogan',
  address: 'Alamat',
  phone: 'Telepon',
  email: 'Email',
  whatsapp: 'WhatsApp',
  ppdbTahunAjaran: 'Tahun Ajaran PPDB Aktif',
  ppdbPhase: 'Fase PPDB Saat Ini'
};

const PPDB_PHASES = ['Pendaftaran Buka', 'Tahap Seleksi', 'Pengumuman', 'Pendaftaran Tutup'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'Overview';
  });

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ppdbList, setPpdbList] = useState([]);
  const [jalurList, setJalurList] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');

  const [modalState, setModalState] = useState({ isOpen: false, type: '', collection: '', item: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [imgAdjustment, setImgAdjustment] = useState({
    aspectRatio: '4/3',
    panX: 0,
    panY: 0,
    zoom: 1,
    rawImage: null,
    isModified: false
  });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [ppdbFilterJenjang, setPpdbFilterJenjang] = useState('Semua');
  const [ppdbFilterStatus, setPpdbFilterStatus] = useState('Semua');
  const [ppdbFilterTahunAjaran, setPpdbFilterTahunAjaran] = useState('Semua');
  const [ppdbSearch, setPpdbSearch] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNote, setTempNote] = useState('');
  const [waModalData, setWaModalData] = useState(null);
  const cropViewportRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('adminLoggedIn');
    if (saved === 'true') setIsLoggedIn(true);

    loadAllData();
  }, []);

  const getLiveImageDimensions = useCallback(() => {
    if (imgDimensions.width > 0 && imgDimensions.height > 0) {
      return imgDimensions;
    }
    if (imageRef.current) {
      const nw = imageRef.current.naturalWidth || imageRef.current.width;
      const nh = imageRef.current.naturalHeight || imageRef.current.height;
      if (nw > 0 && nh > 0) {
        return { width: nw, height: nh };
      }
    }
    return { width: 1200, height: 900 };
  }, [imgDimensions]);

  // Measure natural dimensions of image for precise aspect-ratio cover
  useEffect(() => {
    const src = imgAdjustment.rawImage || modalState.item?.gambar;
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = src;
  }, [imgAdjustment.rawImage, modalState.item?.gambar]);

  // Global mouse tracking for smooth WhatsApp-style photo dragging with strict boundary clamping
  useEffect(() => {
    if (!isDraggingCrop) return;

    const onMouseMove = (e) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      const dims = getLiveImageDimensions();
      setImgAdjustment((prev) => {
        const { frameW, frameH } = getFrameDimensions(prev.aspectRatio);
        const { panX, panY } = clampPan(
          prev.panX + deltaX,
          prev.panY + deltaY,
          prev.zoom,
          frameW,
          frameH,
          dims.width,
          dims.height
        );
        return {
          ...prev,
          panX,
          panY,
          isModified: true
        };
      });
    };

    const onMouseUp = () => {
      setIsDraggingCrop(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingCrop, getLiveImageDimensions]);

  // Wheel listener with preventDefault:
  // - Regular scroll = Zoom In / Zoom Out
  // - Shift + scroll or trackpad horizontal swipe = Pan Left / Right
  useEffect(() => {
    const el = cropViewportRef.current;
    if (!el) return;

    const handleWheelNative = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const { frameW, frameH } = getFrameDimensions(imgAdjustment.aspectRatio);
      const dims = getLiveImageDimensions();

      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // Shift + Scroll or Horizontal Swipe -> Pan Left / Right
        const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        setImgAdjustment((prev) => {
          const { panX, panY } = clampPan(
            prev.panX - delta * 0.75,
            prev.panY,
            prev.zoom,
            frameW,
            frameH,
            dims.width,
            dims.height
          );
          return { ...prev, panX, panY, isModified: true };
        });
      } else {
        // Regular Mouse Wheel Scroll -> Zoom In / Zoom Out
        const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
        setImgAdjustment((prev) => {
          const nextZoom = Math.max(1, Math.min(2.8, +(prev.zoom + zoomDelta).toFixed(2)));
          const { panX, panY } = clampPan(
            prev.panX,
            prev.panY,
            nextZoom,
            frameW,
            frameH,
            dims.width,
            dims.height
          );
          return { ...prev, zoom: nextZoom, panX, panY, isModified: true };
        });
      }
    };

    el.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelNative);
    };
  }, [imgAdjustment.aspectRatio, getLiveImageDimensions]);

  // Escape key listener for full-screen image preview
  useEffect(() => {
    if (!previewImage) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setPreviewImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  const handleZoomSliderChange = (newVal) => {
    const nextZoom = parseFloat(newVal);
    const { frameW, frameH } = getFrameDimensions(imgAdjustment.aspectRatio);
    const dims = getLiveImageDimensions();
    const { panX, panY } = clampPan(
      imgAdjustment.panX,
      imgAdjustment.panY,
      nextZoom,
      frameW,
      frameH,
      dims.width,
      dims.height
    );
    setImgAdjustment(prev => ({
      ...prev,
      zoom: nextZoom,
      panX,
      panY,
      isModified: true
    }));
  };

  const handleAspectRatioChange = (newRatio) => {
    const { frameW, frameH } = getFrameDimensions(newRatio);
    const dims = getLiveImageDimensions();
    const { panX, panY } = clampPan(
      imgAdjustment.panX,
      imgAdjustment.panY,
      imgAdjustment.zoom,
      frameW,
      frameH,
      dims.width,
      dims.height
    );
    setImgAdjustment(prev => ({
      ...prev,
      aspectRatio: newRatio,
      panX,
      panY,
      isModified: true
    }));
  };

  const loadAllData = async () => {
    setLoading(true);
    const [site, msgs, ppdbs, jalurs] = await Promise.all([
      fetchSiteData(),
      fetchContactMessages(),
      fetchPPDBList(),
      fetchJalurList()
    ]);

    setData(site);
    setMessages(msgs);
    setPpdbList(ppdbs);
    setJalurList(jalurs);
    setLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true');
      setIsLoggedIn(true);
    } else {
      alert('Username atau password salah! (default: admin / admin123)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
  };

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'siteData.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('File siteData.json ter-export');
  };

  const openModal = (collection, item = null) => {
    const defaultRatio = collection === 'heroImages' ? '16/9' : (collection === 'staff' ? '1/1' : '4/3');
    const existing = item ? { ...item } : getEmptyItem(collection);
    setModalState({
      isOpen: true,
      collection,
      item: existing
    });
    setImgDimensions({ width: 0, height: 0 });
    setImgAdjustment({
      aspectRatio: defaultRatio,
      panX: 0,
      panY: 0,
      zoom: 1,
      rawImage: existing.gambar || null,
      isModified: false
    });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, collection: '', item: null });
    setIsDraggingCrop(false);
  };

  const getEmptyItem = (col) => {
    if (col === 'staff') return { id: Date.now(), nama: '', jabatan: 'Staff Pengajar', gambar: '', deskripsi: '' };
    if (col === 'galeri') return { id: Date.now(), judul: '', kategori: 'kegiatan', gambar: '' };
    if (col === 'heroImages') return { id: Date.now(), judul: '', gambar: '' };
    if (col === 'programs') return { id: Date.now(), nama: '', deskripsi: '', gambar: '' };
    if (col === 'jurusan') return { id: Date.now(), kode: '', nama: '', deskripsi: '', karir: '', gambar: '' };
    return {};
  };

  const COLLECTION_LABELS = {
    staff: 'Staff',
    galeri: 'Galeri',
    heroImages: 'Hero Banner',
    programs: 'Program',
    jurusan: 'Jurusan'
  };

  const handleSaveModalItem = async (e) => {
    e.preventDefault();
    const { collection, item } = modalState;
    try {
      let finalItem = { ...item };

      // Auto-crop if image was adjusted or if new upload exists
      if (imgAdjustment.isModified && (imgAdjustment.rawImage || finalItem.gambar)) {
        const { frameW, frameH } = getFrameDimensions(imgAdjustment.aspectRatio);

        try {
          const croppedBase64 = await cropImageCanvas(
            imgAdjustment.rawImage || finalItem.gambar,
            frameW,
            frameH,
            imgAdjustment.panX,
            imgAdjustment.panY,
            imgAdjustment.zoom
          );
          finalItem.gambar = croppedBase64;
        } catch (cropErr) {
          console.warn('Canvas crop fallback:', cropErr);
        }
      }

      const updatedData = await saveCollectionItem(collection, finalItem);
      setData(updatedData);
      showToast('Data berhasil disimpan ke database!');
      closeModal();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data ke database');
    }
  };

  const handleSingleDelete = async (collection, id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      try {
        const updatedData = await deleteCollectionItem(collection, id);
        setData(updatedData);
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        showToast('Item berhasil dihapus dari database!');
      } catch (err) {
        showToast('Gagal menghapus data dari database');
      }
    }
  };

  const handleBulkDelete = async (collection) => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Hapus ${selectedIds.length} item terpilih sekaligus?`)) {
      try {
        const updatedData = await deleteCollectionItems(collection, selectedIds);
        setData(updatedData);
        setSelectedIds([]);
        showToast(`${selectedIds.length} item berhasil dihapus dari database!`);
      } catch (err) {
        showToast('Gagal hapus massal dari database');
      }
    }
  };

  const handleSaveSiteInfo = async (e) => {
    e.preventDefault();
    try {
      const updatedData = await saveSiteInfo(data.siteInfo);
      setData(updatedData);
      showToast('Informasi sekolah berhasil disimpan ke database!');
    } catch (err) {
      showToast('Gagal menyimpan informasi sekolah');
    }
  };

  const toggleSelectAll = (collection) => {
    const allIds = data[collection].map(i => i.id);
    if (selectedIds.length === allIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const toggleSelectId = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleModalImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Ukuran file maksimal 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setModalState(prev => ({
        ...prev,
        item: { ...prev.item, gambar: result }
      }));
      setImgDimensions({ width: 0, height: 0 });
      setImgAdjustment(prev => ({
        ...prev,
        rawImage: result,
        panX: 0,
        panY: 0,
        zoom: 1,
        isModified: true
      }));
    };
    reader.readAsDataURL(file);
  };



  const handleDeleteMessage = async (id) => {
    if (window.confirm('Hapus pesan kontak ini?')) {
      await deleteContactMessage(id);
      setMessages(messages.filter(m => m.id !== id));
      showToast('Pesan terhapus');
    }
  };

  const handleDeletePPDB = async (id) => {
    if (window.confirm('Hapus pendaftaran ini?')) {
      await deletePPDBItem(id);
      setPpdbList(ppdbList.filter(p => p.id !== id));
      showToast('Data PPDB terhapus');
    }
  };

  const [jalurModal, setJalurModal] = useState({ isOpen: false, item: { nama: '', deskripsi: '', urutan: 1, aktif: true } });

  const handleSaveJalur = async (e) => {
    e.preventDefault();
    if (!jalurModal.item.nama.trim()) return;
    const res = await saveJalurItem(jalurModal.item);
    if (res.success) {
      showToast('Jalur Pendaftaran tersimpan!');
      setJalurModal({ isOpen: false, item: { nama: '', deskripsi: '', urutan: 1, aktif: true } });
      fetchJalurList().then(setJalurList);
    } else {
      showToast('Gagal menyimpan jalur');
    }
  };

  const handleDeleteJalur = async (id) => {
    if (window.confirm('Hapus jalur pendaftaran ini?')) {
      const res = await deleteJalurItem(id);
      if (res.success) {
        showToast('Jalur terhapus');
        setJalurList(prev => prev.filter(j => j.id !== id));
      }
    }
  };

  const handleUpdatePPDBStatus = async (id, newStatus) => {
    await updatePPDBItem(id, { status: newStatus });
    setPpdbList(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    showToast(`Status PPDB diubah: ${newStatus}`);
  };

  const handleSavePPDBNote = async (id) => {
    await updatePPDBItem(id, { catatanAdmin: tempNote });
    setPpdbList(prev => prev.map(p => p.id === id ? { ...p, catatanAdmin: tempNote } : p));
    setEditingNoteId(null);
    showToast('Catatan panitia tersimpan');
  };

  const handleExportPPDBToCSV = (list = ppdbList) => {
    if (!list || list.length === 0) {
      alert('Belum ada data pendaftaran untuk diekspor.');
      return;
    }
    const headers = [
      'No. Registrasi',
      'Tanggal Daftar',
      'Tahun Ajaran',
      'Nama Siswa',
      'Jenis Kelamin',
      'Jenjang',
      'Asrama',
      'Jalur',
      'Asal Sekolah',
      'Nama Orang Tua',
      'WhatsApp',
      'Email',
      'Alamat',
      'Status',
      'Catatan Panitia'
    ];
    const rows = list.map(p => [
      `"${p.nomorRegistrasi || ('PPDB-' + p.id)}"`,
      `"${new Date(p.created_at || p.id).toLocaleDateString('id-ID')}"`,
      `"${p.tahun_ajaran || '-'}"`,
      `"${(p.namaCalonSiswa || '').replace(/"/g, '""')}"`,
      `"${p.jenisKelamin || '-'}"`,
      `"${p.jenjang || '-'}"`,
      `"${p.pilihanAsrama || '-'}"`,
      `"${p.jalurPendaftaran || '-'}"`,
      `"${(p.asalSekolah || '-').replace(/"/g, '""')}"`,
      `"${(p.namaOrangTua || '').replace(/"/g, '""')}"`,
      `"${p.telepon || ''}"`,
      `"${p.email || ''}"`,
      `"${(p.alamat || '').replace(/"/g, '""')}"`,
      `"${p.status || 'Menunggu Verifikasi'}"`,
      `"${(p.catatanAdmin || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PPDB_AlAlawiyah_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ File CSV/Excel PPDB berhasil diunduh!');
  };

  const handleCopyToGoogleSheets = (list = ppdbList) => {
    if (!list || list.length === 0) {
      alert('Belum ada data pendaftaran untuk disalin.');
      return;
    }
    const headers = [
      'No. Registrasi', 'Tanggal', 'Tahun Ajaran', 'Nama Siswa', 'L/P', 'Jenjang',
      'Asrama', 'Jalur', 'Asal Sekolah', 'Nama Orang Tua', 'WhatsApp',
      'Email', 'Alamat', 'Status', 'Catatan Panitia'
    ];
    const rows = list.map(p => [
      p.nomorRegistrasi || ('PPDB-' + p.id),
      new Date(p.created_at || p.id).toLocaleDateString('id-ID'),
      p.tahun_ajaran || '-',
      p.namaCalonSiswa || '',
      p.jenisKelamin || '-',
      p.jenjang || '-',
      p.pilihanAsrama || '-',
      p.jalurPendaftaran || '-',
      p.asalSekolah || '-',
      p.namaOrangTua || '',
      p.telepon || '',
      p.email || '',
      p.alamat || '',
      p.status || 'Menunggu Verifikasi',
      p.catatanAdmin || ''
    ]);
    const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsv).then(() => {
      showToast('✓ Data disalin! Buka Google Sheets lalu tekan Ctrl+V.');
    }).catch(() => {
      showToast('Gagal menyalin ke clipboard.');
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              A
            </div>
            <h1 className="text-xl font-bold text-slate-900">Admin Portal</h1>
            <p className="text-xs text-slate-500 mt-1">Yayasan Modern Al-Alawiyah</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-slate-400 text-xs" />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <FaSync className="animate-spin text-slate-700 text-2xl mx-auto" />
          <p className="text-xs font-medium text-slate-600">Loading Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs">
          <FaCheck className="text-emerald-400" />
          {toast}
        </div>
      )}

      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex min-h-screen border-r border-slate-800">
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Al-Alawiyah</h1>
              <p className="text-[10px] text-slate-400">Admin Control Panel</p>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setSelectedIds([]); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{tab.icon}</span>
                  {tab.label}
                </div>
                {tab.id === 'Pesan Masuk' && messages.length > 0 && (
                  <span className="bg-amber-500 text-slate-900 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {messages.length}
                  </span>
                )}
                {tab.id === 'Data PPDB' && ppdbList.length > 0 && (
                  <span className="bg-emerald-500 text-slate-900 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {ppdbList.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <FaDownload /> Export Backup JSON
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-rose-400 py-1.5 text-xs font-medium transition cursor-pointer"
          >
            <FaSignOutAlt /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-7 h-7 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-xs">A</div>
            <span className="font-bold text-slate-900 text-sm">Admin Panel</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Navigasi:</span>
            <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">{activeTab}</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ml-2" title="Terhubung ke Database Cloud Supabase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase Connected
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              title="Refresh Data"
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs cursor-pointer"
            >
              <FaSync />
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <FaEye /> Lihat Web
            </a>
          </div>
        </header>

        <div className="md:hidden flex gap-1 overflow-x-auto p-2 bg-slate-100 border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setSelectedIds([]); }}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap cursor-pointer ${
                activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main className="p-6 flex-1 space-y-6">
          {activeTab === 'Overview' && (
            <div className="space-y-6 max-w-6xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Total Staff</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{data.staff.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg"><FaUserTie /></div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Galeri Foto</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{data.galeri.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-lg"><FaImages /></div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Jurusan SMK</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{(data.jurusan || []).length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-lg"><FaLayerGroup /></div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Pesan Masuk</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{messages.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-lg"><FaInbox /></div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Pendaftaran PPDB</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{ppdbList.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-lg"><FaUserGraduate /></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                    <FaInbox className="text-amber-500" /> Pesan Terbaru
                  </h3>
                  {messages.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Belum ada pesan masuk.</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.slice(0, 3).map(m => (
                        <div key={m.id} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between font-semibold text-slate-900">
                            <span>{m.nama}</span>
                            <span className="text-[10px] text-slate-400">{new Date(m.created_at || m.id).toLocaleDateString('id-ID')}</span>
                          </div>
                          <p className="text-slate-600 line-clamp-2">{m.pesan}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                    <FaUserGraduate className="text-purple-600" /> Pendaftaran PPDB Terbaru
                  </h3>
                  {ppdbList.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Belum ada pendaftaran PPDB.</p>
                  ) : (
                    <div className="space-y-3">
                      {ppdbList.slice(0, 3).map(p => (
                        <div key={p.id} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between font-semibold text-slate-900">
                            <span>{p.namaCalonSiswa}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">{p.jenjang}</span>
                          </div>
                          <p className="text-slate-500">Orang Tua: {p.namaOrangTua} ({p.telepon})</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Site Info' && (
            <form onSubmit={handleSaveSiteInfo} className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FaInfoCircle className="text-emerald-600" /> Informasi Umum Sekolah
                </h2>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm"
                >
                  Simpan ke Database
                </button>
              </div>
              <div className="space-y-4">
                {Object.entries(data.siteInfo).map(([key, val]) => {
                  const label = FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                  if (key === 'ppdbPhase') {
                    return (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Fase PPDB Saat Ini</label>
                        <select
                          value={PPDB_PHASES.includes(val) ? val : 'Pendaftaran Buka'}
                          onChange={(e) => {
                            const updated = { ...data, siteInfo: { ...data.siteInfo, [key]: e.target.value } };
                            setData(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                        >
                          {PPDB_PHASES.map(ph => (
                            <option key={ph} value={ph}>{ph}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">{label}</label>
                      <input
                        type="text"
                        value={val || ''}
                        onChange={(e) => {
                          const updated = { ...data, siteInfo: { ...data.siteInfo, [key]: e.target.value } };
                          setData(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm"
                >
                  Simpan ke Database
                </button>
              </div>
            </form>
          )}

          {activeTab === 'Jalur PPDB' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Manajemen Jalur Pendaftaran PPDB</h2>
                  <p className="text-xs text-slate-500">Kelola opsi jalur yang tampil di formulir pendaftaran calon siswa.</p>
                </div>
                <button
                  onClick={() => setJalurModal({ isOpen: true, item: { nama: '', deskripsi: '', urutan: jalurList.length + 1, aktif: true } })}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  <FaPlus className="text-[10px]" /> Tambah Jalur
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                      <th className="p-3 w-12 text-center">Urutan</th>
                      <th className="p-3">Nama Jalur</th>
                      <th className="p-3">Deskripsi</th>
                      <th className="p-3 w-20 text-center">Status</th>
                      <th className="p-3 text-right w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jalurList.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50">
                        <td className="p-3 text-center font-bold text-slate-500">{j.urutan}</td>
                        <td className="p-3 font-semibold text-slate-900">{j.nama}</td>
                        <td className="p-3 text-slate-500">{j.deskripsi || '-'}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${j.aktif !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                            {j.aktif !== false ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => setJalurModal({ isOpen: true, item: { ...j } })}
                            className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-2.5 py-1 rounded text-xs font-medium cursor-pointer"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteJalur(j.id)}
                            className="bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 px-2.5 py-1 rounded text-xs font-medium cursor-pointer"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {['Staff', 'Galeri', 'Hero Images', 'Programs', 'Jurusan'].includes(activeTab) && (
            <div className="space-y-4 max-w-6xl">
              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 sm:w-64">
                    <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
                    <input
                      type="text"
                      placeholder={`Cari ${activeTab.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 text-xs cursor-pointer ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
                    >
                      <FaTable />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 text-xs cursor-pointer ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
                    >
                      <FaThLarge />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {selectedIds.length > 0 && (
                    <button
                      onClick={() => handleBulkDelete(activeTab === 'Hero Images' ? 'heroImages' : activeTab.toLowerCase())}
                      className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition"
                    >
                      <FaTrash className="text-[10px]" /> Hapus ({selectedIds.length})
                    </button>
                  )}

                  <button
                    onClick={() => openModal(activeTab === 'Hero Images' ? 'heroImages' : activeTab.toLowerCase())}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm"
                  >
                    <FaPlus className="text-[10px]" /> Tambah {activeTab}
                  </button>
                </div>
              </div>

              {/* Collection Data Display */}
              {(() => {
                const colKey = activeTab === 'Hero Images' ? 'heroImages' : activeTab.toLowerCase();
                const list = data[colKey] || [];
                const filtered = list.filter(item => {
                  const q = searchQuery.toLowerCase();
                  return (
                    (item.nama && item.nama.toLowerCase().includes(q)) ||
                    (item.judul && item.judul.toLowerCase().includes(q)) ||
                    (item.kode && item.kode.toLowerCase().includes(q)) ||
                    (item.karir && item.karir.toLowerCase().includes(q)) ||
                    (item.jabatan && item.jabatan.toLowerCase().includes(q)) ||
                    (item.kategori && item.kategori.toLowerCase().includes(q)) ||
                    (item.deskripsi && item.deskripsi.toLowerCase().includes(q))
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                      Tidak ada data {activeTab.toLowerCase()} yang ditemukan.
                    </div>
                  );
                }

                if (viewMode === 'table') {
                  const renderFileCell = (path) => {
                    if (!path) return <span className="text-slate-400">—</span>;
                    if (path.startsWith('data:image')) {
                      return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200" title="File hasil upload langsung (Base64)">
                          Base64 Upload
                        </span>
                      );
                    }
                    return (
                      <span className="font-mono text-[11px] text-slate-500 max-w-[180px] block truncate" title={path}>
                        {path}
                      </span>
                    );
                  };

                  const colMeta = {
                    staff: [
                      { label: 'Nama', render: (i) => <span className="font-semibold text-slate-900">{i.nama}</span> },
                      { label: 'Jabatan', render: (i) => <span className="inline-block bg-slate-100 px-2 py-0.5 rounded font-medium text-[11px]">{i.jabatan || '—'}</span> },
                      { label: 'Deskripsi', render: (i) => <span className="max-w-[220px] block truncate text-slate-500">{i.deskripsi || '—'}</span> }
                    ],
                    galeri: [
                      { label: 'Judul', render: (i) => <span className="font-semibold text-slate-900 max-w-[180px] block truncate">{i.judul}</span> },
                      { label: 'Kategori', render: (i) => <span className="inline-block bg-slate-100 px-2 py-0.5 rounded font-medium text-[11px]">{i.kategori || '—'}</span> },
                      { label: 'File', render: (i) => renderFileCell(i.gambar) }
                    ],
                    heroImages: [
                      { label: 'Judul', render: (i) => <span className="font-semibold text-slate-900 max-w-[220px] block truncate">{i.judul}</span> },
                      { label: 'File', render: (i) => renderFileCell(i.gambar) }
                    ],
                    programs: [
                      { label: 'Nama Program', render: (i) => <span className="font-semibold text-slate-900">{i.nama}</span> },
                      { label: 'Deskripsi', render: (i) => <span className="max-w-[260px] block truncate text-slate-500">{i.deskripsi || '—'}</span> }
                    ],
                    jurusan: [
                      { label: 'Jurusan', render: (i) => (
                        <span className="flex flex-col items-start gap-1">
                          <span className="font-semibold text-slate-900">{i.nama}</span>
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">{i.kode || '—'}</span>
                        </span>
                      ) },
                      { label: 'Deskripsi', render: (i) => <span className="max-w-[220px] block truncate text-slate-500">{i.deskripsi || '—'}</span> },
                      { label: 'Prospek Karir', render: (i) => <span className="max-w-[180px] block truncate text-slate-500">{i.karir || '—'}</span> }
                    ]
                  };
                  const meta = colMeta[colKey] || [{ label: 'Judul', render: (i) => <span>{i.judul || i.nama}</span> }];
                  return (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                              <th className="p-3 w-10 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.length === filtered.length && filtered.length > 0}
                                  onChange={() => toggleSelectAll(colKey)}
                                />
                              </th>
                              <th className="p-3 w-16">Foto</th>
                              {meta.map((c) => <th key={c.label} className="p-3">{c.label}</th>)}
                              <th className="p-3 text-right w-28 whitespace-nowrap">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filtered.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50/80 transition">
                                <td className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item.id)}
                                    onChange={() => toggleSelectId(item.id)}
                                  />
                                </td>
                                <td className="p-3">
                                  <div 
                                    onClick={() => item.gambar && setPreviewImage(item.gambar)}
                                    className={`w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 relative group ${
                                      item.gambar ? 'cursor-pointer hover:ring-2 hover:ring-emerald-500 transition' : ''
                                    }`}
                                    title={item.gambar ? 'Klik untuk lihat full screen' : ''}
                                  >
                                    <img
                                      src={item.gambar}
                                      alt={item.nama || item.judul}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                      onError={(e) => (e.target.style.display = 'none')}
                                    />
                                    {item.gambar && (
                                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px]">
                                        <FaExpand />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                {meta.map((c) => (
                                  <td key={c.label} className="p-3 text-slate-600">
                                    {c.render(item)}
                                  </td>
                                ))}
                                <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                                  <button
                                    onClick={() => openModal(colKey, item)}
                                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg cursor-pointer font-medium transition text-xs"
                                    title="Edit"
                                  >
                                    <FaEdit className="text-[11px]" /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleSingleDelete(colKey, item.id)}
                                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 px-2.5 py-1.5 rounded-lg cursor-pointer font-medium transition text-xs"
                                    title="Hapus"
                                  >
                                    <FaTrash className="text-[11px]" /> Hapus
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(item => (
                      <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 hover:border-slate-300 transition">
                        <div 
                          onClick={() => item.gambar && setPreviewImage(item.gambar)}
                          className={`h-40 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group ${
                            item.gambar ? 'cursor-pointer hover:border-emerald-500 transition' : ''
                          }`}
                          title={item.gambar ? 'Klik untuk lihat full screen' : ''}
                        >
                          <img
                            src={item.gambar}
                            alt={item.nama || item.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => (e.target.style.display = 'none')}
                          />
                          {item.gambar && (
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs">
                              <span className="bg-black/70 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 shadow-md">
                                <FaExpand className="text-[10px]" /> Full Screen
                              </span>
                            </div>
                          )}
                          {item.kode && (
                            <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                              {item.kode}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            {item.jabatan || item.kategori || (item.karir ? 'Jurusan SMK' : activeTab) || activeTab}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{item.nama || item.judul}</h4>
                          {item.deskripsi && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.deskripsi}</p>}
                          {item.karir && <p className="text-xs text-slate-400 mt-1 line-clamp-2">Karir: {item.karir}</p>}
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            onClick={() => openModal(colKey, item)}
                            className="flex items-center gap-1 text-slate-700 hover:text-emerald-700 font-semibold cursor-pointer"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleSingleDelete(colKey, item.id)}
                            className="flex items-center gap-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <FaTrash /> Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'Pesan Masuk' && (
            <div className="space-y-4 max-w-4xl">
              <h2 className="text-sm font-bold text-slate-900">Pesan dari Pengunjung ({messages.length})</h2>
              {messages.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200 text-xs">
                  Belum ada pesan yang masuk.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{m.nama}</span>
                          <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">{m.email}</span>
                          {m.telepon && <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium">{m.telepon}</span>}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{m.pesan}</p>
                        <p className="text-[10px] text-slate-400">{new Date(m.created_at || m.id).toLocaleString('id-ID')}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(m.id)}
                        className="text-xs text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 font-semibold cursor-pointer transition whitespace-nowrap self-end md:self-center"
                      >
                        <FaTrash className="inline mr-1 text-[10px]" /> Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Data PPDB' && (() => {
            const currentAcademicYear = getAcademicYear(data?.siteInfo?.ppdbTahunAjaran);
            
            const normalizedPPDB = ppdbList.map(p => ({
              id: p.id,
              nomorRegistrasi: p.nomor_registrasi || p.nomorRegistrasi,
              namaCalonSiswa: p.nama_calon_siswa || p.namaCalonSiswa,
              jenisKelamin: p.jenis_kelamin || p.jenisKelamin,
              nisn: p.nisn,
              asalSekolah: p.asal_sekolah || p.asalSekolah,
              jenjang: p.jenjang,
              jurusan: p.jurusan,
              pilihanAsrama: p.pilihan_asrama || p.pilihanAsrama,
              jalurPendaftaran: p.jalur_pendaftaran || p.jalurPendaftaran,
              namaOrangTua: p.nama_orang_tua || p.namaOrangTua,
              telepon: p.telepon,
              email: p.email,
              alamat: p.alamat,
              status: p.status || 'Menunggu Verifikasi',
              catatanAdmin: p.catatan_admin || p.catatanAdmin,
              tahun_ajaran: p.tahun_ajaran || p.tahunAjaran || '',
              created_at: p.created_at
            }));

            const tahunAjaranOptions = [...new Set(
              normalizedPPDB.map(p => p.tahun_ajaran).filter(Boolean)
            )].sort((a, b) => String(b).localeCompare(String(a)));

            const filteredPPDB = normalizedPPDB.filter(p => {
              const matchJenjang = ppdbFilterJenjang === 'Semua' || p.jenjang === ppdbFilterJenjang;
              const matchStatus = ppdbFilterStatus === 'Semua' || (p.status || 'Menunggu Verifikasi') === ppdbFilterStatus;
              const matchTahun = ppdbFilterTahunAjaran === 'Semua' || (p.tahun_ajaran || '') === ppdbFilterTahunAjaran;
              const query = ppdbSearch.trim().toLowerCase();
              const matchQuery = !query || 
                (p.namaCalonSiswa && p.namaCalonSiswa.toLowerCase().includes(query)) ||
                (p.nomorRegistrasi && p.nomorRegistrasi.toLowerCase().includes(query)) ||
                (p.telepon && p.telepon.includes(query)) ||
                (p.namaOrangTua && p.namaOrangTua.toLowerCase().includes(query));
              return matchJenjang && matchStatus && matchTahun && matchQuery;
            });

            return (
              <div className="space-y-5 max-w-6xl">
                {/* Header & Quick Actions */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        PPDB Aktif: Tahun Ajaran {currentAcademicYear}
                      </span>
                      <span className="text-xs text-slate-400">• {data?.siteInfo?.ppdbPhase || 'Pendaftaran Buka'}</span>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Pusat Manajemen Pendaftaran PPDB ({ppdbList.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Kelola verifikasi berkas, ubah status kelulusan, dan kirim pengumuman via WhatsApp
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleExportPPDBToCSV(filteredPPDB)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
                      title="Unduh file Excel / CSV data pendaftar sesuai filter layar"
                    >
                      <FaFileExcel className="text-sm" /> Export Excel / CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyToGoogleSheets(filteredPPDB)}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
                      title="Salin data sesuai filter layar untuk langsung di-paste ke Google Sheets"
                    >
                      <FaCopy className="text-sm" /> Salin ke Google Sheets
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full md:w-80">
                    <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                    <input
                      type="text"
                      value={ppdbSearch}
                      onChange={(e) => setPpdbSearch(e.target.value)}
                      placeholder="Cari nama, no. registrasi, HP..."
                      className="w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <FaFilter className="text-[10px] text-slate-400" />
                      <span>Tahun Ajaran:</span>
                    </div>
                    <select
                      value={ppdbFilterTahunAjaran}
                      onChange={(e) => setPpdbFilterTahunAjaran(e.target.value)}
                      className="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-primary font-medium"
                    >
                      <option value="Semua">Semua Tahun Ajaran</option>
                      {tahunAjaranOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 ml-2">
                      <span>Jenjang:</span>
                    </div>
                    <select
                      value={ppdbFilterJenjang}
                      onChange={(e) => setPpdbFilterJenjang(e.target.value)}
                      className="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-primary font-medium"
                    >
                      <option value="Semua">Semua Jenjang</option>
                      <option value="SMP/MTs">SMP / MTs</option>
                      <option value="SMA/MA">SMA / MA</option>
                      <option value="SMK">SMK</option>
                      <option value="Pesantren">Pesantren</option>
                    </select>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 ml-2">
                      <span>Status:</span>
                    </div>
                    <select
                      value={ppdbFilterStatus}
                      onChange={(e) => setPpdbFilterStatus(e.target.value)}
                      className="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-primary font-medium"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                      <option value="Jadwal Tes">Jadwal Tes</option>
                      <option value="Lulus Seleksi">Lulus Seleksi</option>
                      <option value="Cadangan">Cadangan</option>
                      <option value="Daftar Ulang (Lunas)">Daftar Ulang (Lunas)</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>
                </div>

                {/* List Content */}
                {filteredPPDB.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 text-xs">
                    Tidak ada pendaftar yang cocok dengan filter.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredPPDB.map((p) => {
                      const noReg = p.nomorRegistrasi || `PPDB-REG-${p.id}`;
                      const isEditingNote = editingNoteId === p.id;

                      return (
                        <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 shadow-sm hover:shadow-md transition">
                          {/* Header card: Jenjang, NoReg, Delete */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
                                  {p.jenjang || 'SMP/MTs'}
                                </span>
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                                  {noReg}
                                </span>
                                {p.tahun_ajaran && (
                                  <span className="text-[10px] font-semibold text-slate-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                    TA {p.tahun_ajaran}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-slate-900 text-base mt-1.5 flex items-center gap-2">
                                {p.namaCalonSiswa}
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {p.jenisKelamin === 'Perempuan' ? 'Akhwat (P)' : 'Ikhwan (L)'}
                                </span>
                              </h3>
                            </div>

                            <button
                              onClick={() => handleDeletePPDB(p.id)}
                              className="text-xs text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus Data Pendaftar"
                            >
                              <FaTrash />
                            </button>
                          </div>

                          {/* Data Rincian Siswa & Orang Tua */}
                          <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <p><strong>Asal Sekolah:</strong> {p.asalSekolah || '-'}</p>
                            <p><strong>Pilihan:</strong> {p.pilihanAsrama || 'Boarding (Asrama)'} • {p.jalurPendaftaran || 'Reguler'}</p>
                            {p.jurusan && <p><strong>Jurusan SMK:</strong> {p.jurusan}</p>}
                            <p><strong>Wali / Ortu:</strong> {p.namaOrangTua}</p>
                            <p className="flex items-center gap-1.5">
                              <strong>WhatsApp:</strong> 
                              <a href={`https://wa.me/${p.telepon}`} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline">
                                {p.telepon}
                              </a>
                            </p>
                            {p.alamat && <p><strong>Alamat:</strong> {p.alamat}</p>}
                          </div>

                          {/* Status Selector */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-slate-700">Status:</span>
                              <select
                                value={p.status || 'Menunggu Verifikasi'}
                                onChange={(e) => handleUpdatePPDBStatus(p.id, e.target.value)}
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                                  p.status === 'Lulus Seleksi' || p.status === 'Lulus'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : p.status === 'Cadangan'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : p.status === 'Daftar Ulang (Lunas)'
                                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                                    : p.status === 'Jadwal Tes'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : p.status === 'Ditolak'
                                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                                    : 'bg-yellow-50 text-yellow-800 border-yellow-300'
                                }`}
                              >
                                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                                <option value="Jadwal Tes">Jadwal Tes</option>
                                <option value="Lulus Seleksi">Lulus Seleksi</option>
                                <option value="Cadangan">Cadangan</option>
                                <option value="Daftar Ulang (Lunas)">Daftar Ulang (Lunas)</option>
                                <option value="Ditolak">Ditolak</option>
                              </select>
                            </div>

                            {/* Tombol WhatsApp Resmi */}
                            <button
                              type="button"
                              onClick={() => setWaModalData(p)}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
                            >
                              <FaWhatsapp /> Chat Template WA
                            </button>
                          </div>

                          {/* Catatan Panitia Seleksi */}
                          <div className="pt-2 border-t border-slate-100">
                            {isEditingNote ? (
                              <div className="space-y-2">
                                <textarea
                                  rows={2}
                                  value={tempNote}
                                  onChange={(e) => setTempNote(e.target.value)}
                                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-primary"
                                  placeholder="Tulis catatan seleksi (misal: Tes BTQ lancar, siap asrama...)"
                                />
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingNoteId(null)}
                                    className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSavePPDBNote(p.id)}
                                    className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded cursor-pointer"
                                  >
                                    Simpan Catatan
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[11px] text-slate-500 italic">
                                  {p.catatanAdmin ? `Catatan: "${p.catatanAdmin}"` : 'Belum ada catatan tes/wawancara.'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNoteId(p.id);
                                    setTempNote(p.catatanAdmin || '');
                                  }}
                                  className="text-[11px] text-primary hover:underline font-semibold whitespace-nowrap cursor-pointer"
                                >
                                  {p.catatanAdmin ? 'Edit Catatan' : '+ Catatan'}
                                </button>
                              </div>
                            )}
                          </div>

                          <p className="text-[10px] text-slate-400 text-right">
                            Terdaftar: {new Date(p.created_at || p.id).toLocaleString('id-ID')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </main>
      </div>

      {/* Modal Template Pesan WhatsApp PPDB */}
      {waModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn border border-slate-200 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-emerald-700">
                  <FaWhatsapp className="text-base" /> Template Pesan WhatsApp Resmi
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kirim ke: <strong>{waModalData.namaOrangTua}</strong> ({waModalData.telepon})
                </p>
              </div>
              <button
                onClick={() => setWaModalData(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <p className="text-slate-600 mb-3 font-semibold">Pilih template pesan untuk dikirim langsung:</p>

            <div className="space-y-3">
              {[
                {
                  title: '1. Konfirmasi Formulir Diterima',
                  text: `Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu ${waModalData.namaOrangTua}, kami dari Panitia PPDB Yayasan Modern Al-Alawiyah menginformasikan bahwa formulir pendaftaran ananda ${waModalData.namaCalonSiswa} telah kami terima dengan Nomor Registrasi: ${waModalData.nomorRegistrasi || ('PPDB-' + waModalData.id)}. Mohon mempersiapkan berkas persyaratan untuk verifikasi.`
                },
                {
                  title: '2. Undangan Tes Seleksi & Al-Qur\'an',
                  text: `Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu ${waModalData.namaOrangTua}, mengundang ananda ${waModalData.namaCalonSiswa} (No. Reg: ${waModalData.nomorRegistrasi || ('PPDB-' + waModalData.id)}) untuk mengikuti Tes Observasi Kemampuan Dasar, Baca Al-Qur'an, dan Wawancara di Kampus Yayasan Al-Alawiyah. Silakan konfirmasi kesiapan kehadiran.`
                },
                {
                  title: '3. Pengumuman LULUS & Info Daftar Ulang',
                  text: `Assalamu'alaikum Wr. Wb. Alhamdulillah, ananda ${waModalData.namaCalonSiswa} (No. Reg: ${waModalData.nomorRegistrasi || ('PPDB-' + waModalData.id)}) dinyatakan LULUS SELEKSI PPDB Yayasan Modern Al-Alawiyah! Silakan melakukan proses daftar ulang dalam waktu 7-14 hari untuk mengunci kuota kursi/ranjang asrama ananda.`
                },
                {
                  title: '4. Pemberitahuan Status CADANGAN',
                  text: `Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu ${waModalData.namaOrangTua}, pendaftaran ananda ${waModalData.namaCalonSiswa} saat ini berstatus CADANGAN (Waiting List) dikarenakan kuota kelas/asrama gelombang ini telah terpenuhi. Kami akan segera menghubungi kembali jika terdapat kursi yang tersedia.`
                }
              ].map((tmpl, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-emerald-400 transition">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-slate-800 text-[11px]">{tmpl.title}</span>
                    <a
                      href={`https://wa.me/${waModalData.telepon}?text=${encodeURIComponent(tmpl.text)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 transition shadow-sm"
                    >
                      <FaWhatsapp /> Kirim WA
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-100">
                    "{tmpl.text}"
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setWaModalData(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editor Form */}
      {modalState.isOpen && modalState.item && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative animate-fadeIn border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {data[modalState.collection]?.some(i => i.id === modalState.item.id) ? 'Edit' : 'Tambah'} {COLLECTION_LABELS[modalState.collection] || modalState.collection}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveModalItem} className="space-y-4 text-xs">
              {(modalState.item.nama !== undefined || modalState.item.judul !== undefined) && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {modalState.collection === 'jurusan'
                      ? 'Nama Jurusan'
                      : modalState.item.nama !== undefined
                      ? 'Nama Staff / Program'
                      : 'Judul Foto / Banner'}
                  </label>
                  <input
                    type="text"
                    required
                    value={modalState.item.nama !== undefined ? modalState.item.nama : modalState.item.judul}
                    onChange={(e) => setModalState({
                      ...modalState,
                      item: { ...modalState.item, [modalState.item.nama !== undefined ? 'nama' : 'judul']: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              )}

              {modalState.item.kode !== undefined && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Jurusan (mis. TKJ, RPL, MM)</label>
                  <input
                    type="text"
                    required
                    value={modalState.item.kode}
                    onChange={(e) => setModalState({
                      ...modalState,
                      item: { ...modalState.item, kode: e.target.value }
                    })}
                    placeholder="TKJ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              )}

              {modalState.item.karir !== undefined && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prospek Karir</label>
                  <textarea
                    rows={2}
                    value={modalState.item.karir}
                    onChange={(e) => setModalState({
                      ...modalState,
                      item: { ...modalState.item, karir: e.target.value }
                    })}
                    placeholder="Contoh: Web Developer, System Administrator, Digital Marketer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              )}

              {modalState.item.jabatan !== undefined && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan / Posisi</label>
                  <select
                    value={
                      ['Ketua Yayasan', 'Pembina Yayasan', 'Kepala Sekolah SMP/MTs', 'Kepala Sekolah SMK', 'Kepala Pesantren Modern', 'Wakil Kepala Kurikulum', 'Wakil Kepala Kesiswaan', 'Sekretaris & Administrasi', 'Bendahara Yayasan', 'Guru / Staff Pengajar'].includes(modalState.item.jabatan)
                        ? modalState.item.jabatan
                        : 'custom'
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== 'custom') {
                        setModalState({
                          ...modalState,
                          item: { ...modalState.item, jabatan: val }
                        });
                      } else {
                        setModalState({
                          ...modalState,
                          item: { ...modalState.item, jabatan: '' }
                        });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 mb-1.5"
                  >
                    <option value="Ketua Yayasan">Ketua Yayasan (Top Level)</option>
                    <option value="Pembina Yayasan">Pembina Yayasan (Top Level)</option>
                    <option value="Kepala Sekolah SMP/MTs">Kepala Sekolah SMP/MTs (Level 2)</option>
                    <option value="Kepala Sekolah SMK">Kepala Sekolah SMK (Level 2)</option>
                    <option value="Kepala Pesantren Modern">Kepala Pesantren Modern (Level 2)</option>
                    <option value="Wakil Kepala Kurikulum">Wakil Kepala Kurikulum (Level 3)</option>
                    <option value="Wakil Kepala Kesiswaan">Wakil Kepala Kesiswaan (Level 3)</option>
                    <option value="Sekretaris & Administrasi">Sekretaris & Administrasi (Level 3)</option>
                    <option value="Bendahara Yayasan">Bendahara Yayasan (Level 3)</option>
                    <option value="Guru / Staff Pengajar">Guru / Staff Pengajar (Level 4)</option>
                    <option value="custom">-- Ketik Jabatan Custom --</option>
                  </select>

                  {(!['Ketua Yayasan', 'Pembina Yayasan', 'Kepala Sekolah SMP/MTs', 'Kepala Sekolah SMK', 'Kepala Pesantren Modern', 'Wakil Kepala Kurikulum', 'Wakil Kepala Kesiswaan', 'Sekretaris & Administrasi', 'Bendahara Yayasan', 'Guru / Staff Pengajar'].includes(modalState.item.jabatan)) && (
                    <input
                      type="text"
                      required
                      value={modalState.item.jabatan}
                      onChange={(e) => setModalState({
                        ...modalState,
                        item: { ...modalState.item, jabatan: e.target.value }
                      })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      placeholder="Masukkan nama jabatan custom..."
                    />
                  )}
                </div>
              )}

              {modalState.item.kategori !== undefined && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Galeri</label>
                  <select
                    value={modalState.item.kategori}
                    onChange={(e) => setModalState({
                      ...modalState,
                      item: { ...modalState.item, kategori: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="fasilitas">Fasilitas</option>
                    <option value="kegiatan">Kegiatan</option>
                    <option value="acara">Acara</option>
                  </select>
                </div>
              )}

              {modalState.item.deskripsi !== undefined && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={3}
                    value={modalState.item.deskripsi}
                    onChange={(e) => setModalState({
                      ...modalState,
                      item: { ...modalState.item, deskripsi: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 text-xs">Foto / Gambar</label>
                  {modalState.item.gambar && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-medium mr-0.5">Format:</span>
                      {[
                        { id: '4/3', label: 'Landscape' },
                        { id: '1/1', label: 'Persegi' },
                        { id: '16/9', label: 'Banner' },
                      ].map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleAspectRatioChange(r.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                            imgAdjustment.aspectRatio === r.id
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {modalState.item.gambar ? (() => {
                  const { frameW, frameH } = getFrameDimensions(imgAdjustment.aspectRatio);
                  const dims = getLiveImageDimensions();
                  const imgAspect = dims.width / dims.height;
                  const frameAspect = frameW / frameH;
                  let baseW, baseH;
                  if (imgAspect > frameAspect) {
                    baseH = frameH;
                    baseW = Math.round(baseH * imgAspect);
                  } else {
                    baseW = frameW;
                    baseH = Math.round(baseW / imgAspect);
                  }

                  return (
                    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 shadow-md">
                      {/* WhatsApp-style Crop Viewport: Drag directly with mouse/finger, Wheel to zoom, Shift+Wheel to pan */}
                      <div
                        ref={cropViewportRef}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setIsDraggingCrop(true);
                          dragStartRef.current = { x: e.clientX, y: e.clientY };
                        }}
                        onTouchStart={(e) => {
                          if (e.touches.length === 1) {
                            setIsDraggingCrop(true);
                            dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                          }
                        }}
                        onTouchMove={(e) => {
                          if (!isDraggingCrop || e.touches.length !== 1) return;
                          const clientX = e.touches[0].clientX;
                          const clientY = e.touches[0].clientY;
                          const deltaX = clientX - dragStartRef.current.x;
                          const deltaY = clientY - dragStartRef.current.y;
                          dragStartRef.current = { x: clientX, y: clientY };
                          const liveDims = getLiveImageDimensions();
                          setImgAdjustment(prev => {
                            const { panX, panY } = clampPan(
                              prev.panX + deltaX,
                              prev.panY + deltaY,
                              prev.zoom,
                              frameW,
                              frameH,
                              liveDims.width,
                              liveDims.height
                            );
                            return { ...prev, panX, panY, isModified: true };
                          });
                        }}
                        onTouchEnd={() => setIsDraggingCrop(false)}
                        className="relative w-full h-64 sm:h-72 flex items-center justify-center select-none overflow-hidden cursor-grab active:cursor-grabbing bg-[#1e2330]"
                      >
                        {/* WhatsApp-style: Dimmed outside area showing the full photo in translucent gray */}
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                          <img
                            src={imgAdjustment.rawImage || modalState.item.gambar}
                            alt="Preview Context"
                            draggable={false}
                            style={{
                              width: `${baseW}px`,
                              height: `${baseH}px`,
                              minWidth: `${baseW}px`,
                              minHeight: `${baseH}px`,
                              maxWidth: 'none',
                              maxHeight: 'none',
                              transform: `translate(${imgAdjustment.panX}px, ${imgAdjustment.panY}px) scale(${imgAdjustment.zoom})`,
                              transformOrigin: 'center center',
                              opacity: 0.38,
                              filter: 'brightness(0.75)',
                            }}
                            className="select-none transition-none object-cover"
                          />
                          {/* Translucent gray overlay over surrounding area */}
                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[0.5px]"></div>
                        </div>

                        {/* WhatsApp Crop Frame Viewport */}
                        <div
                          style={{
                            width: `${frameW}px`,
                            height: `${frameH}px`,
                          }}
                          className="relative z-10 overflow-hidden rounded-lg flex items-center justify-center border-2 border-white/95 shadow-[0_0_0_9999px_rgba(30,41,59,0.72)]"
                        >
                          {/* The Image inside the viewport (bounded strictly within frame) */}
                          <img
                            ref={imageRef}
                            src={imgAdjustment.rawImage || modalState.item.gambar}
                            alt="Preview"
                            draggable={false}
                            onLoad={(e) => {
                              const w = e.currentTarget.naturalWidth || e.currentTarget.width;
                              const h = e.currentTarget.naturalHeight || e.currentTarget.height;
                              if (w && h) {
                                setImgDimensions({ width: w, height: h });
                                setImgAdjustment(prev => {
                                  const fDims = getFrameDimensions(prev.aspectRatio);
                                  const clamped = clampPan(prev.panX, prev.panY, prev.zoom, fDims.frameW, fDims.frameH, w, h);
                                  return { ...prev, panX: clamped.panX, panY: clamped.panY };
                                });
                              }
                            }}
                            style={{
                              width: `${baseW}px`,
                              height: `${baseH}px`,
                              minWidth: `${baseW}px`,
                              minHeight: `${baseH}px`,
                              maxWidth: 'none',
                              maxHeight: 'none',
                              transform: `translate(${imgAdjustment.panX}px, ${imgAdjustment.panY}px) scale(${imgAdjustment.zoom})`,
                              transformOrigin: 'center center',
                            }}
                            className="select-none transition-none pointer-events-none object-cover"
                          />

                          {/* Rule of thirds grid lines */}
                          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none">
                            <div className="border-r border-b border-white"></div>
                            <div className="border-r border-b border-white"></div>
                            <div className="border-b border-white"></div>
                            <div className="border-r border-b border-white"></div>
                            <div className="border-r border-b border-white"></div>
                            <div className="border-b border-white"></div>
                            <div className="border-r border-b border-white"></div>
                            <div className="border-r border-b border-white"></div>
                            <div></div>
                          </div>

                          {/* WhatsApp-style corner grips */}
                          <div className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400 pointer-events-none"></div>
                          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400 pointer-events-none"></div>
                          <div className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400 pointer-events-none"></div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400 pointer-events-none"></div>
                        </div>

                        {/* Hint Badge with UI/UX instructions */}
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white/95 text-[10px] px-3.5 py-1 rounded-full pointer-events-none flex items-center gap-1.5 font-medium shadow-lg border border-white/15 whitespace-nowrap z-20">
                          <span>🖐️ Drag foto • 🖱️ Scroll zoom • ⌨️ Shift+Scroll geser kiri-kanan</span>
                        </div>

                        {/* Fullscreen Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(imgAdjustment.rawImage || modalState.item.gambar);
                          }}
                          className="absolute top-2.5 right-2.5 bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 transition cursor-pointer shadow-md z-20 border border-white/15"
                          title="Buka ukuran penuh"
                        >
                          <FaExpand className="text-[10px]" /> Full Screen
                        </button>
                      </div>

                      {/* Simple Bottom Controls Bar */}
                      <div className="p-3 bg-slate-800 text-slate-200 border-t border-slate-700/80 flex items-center justify-between gap-4">
                        {/* Simple Zoom Bar */}
                        <div className="flex items-center gap-2 flex-1 max-w-sm">
                          <span className="text-[11px] text-slate-300 font-semibold whitespace-nowrap">Zoom</span>
                          <button
                            type="button"
                            onClick={() => handleZoomSliderChange(Math.max(1, +(imgAdjustment.zoom - 0.1).toFixed(2)))}
                            className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min="1"
                            max="2.8"
                            step="0.05"
                            value={imgAdjustment.zoom}
                            onChange={(e) => handleZoomSliderChange(e.target.value)}
                            className="flex-1 accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => handleZoomSliderChange(Math.min(2.8, +(imgAdjustment.zoom + 0.1).toFixed(2)))}
                            className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Reset Position Button */}
                        {imgAdjustment.isModified && (
                          <button
                            type="button"
                            onClick={() => setImgAdjustment(prev => ({ ...prev, panX: 0, panY: 0, zoom: 1, isModified: false }))}
                            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            Reset Posisi
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
                    <p className="text-xs text-slate-500 mb-2">Belum ada foto yang dipilih.</p>
                  </div>
                )}

                {/* Upload & Info Bar */}
                <div className="mt-2.5 flex gap-2 items-center">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate max-w-[260px]">
                      {modalState.item.gambar ? (
                        modalState.item.gambar.startsWith('data:image') ? '📷 Foto Komputer (Terunggah)' : modalState.item.gambar
                      ) : (
                        'Pilih foto dari komputer'
                      )}
                    </span>
                    {modalState.item.gambar && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(imgAdjustment.rawImage || modalState.item.gambar)}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px] ml-2 cursor-pointer whitespace-nowrap"
                      >
                        <FaExpand className="text-[10px]" /> Lihat Full
                      </button>
                    )}
                  </div>

                  <label className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg font-semibold cursor-pointer transition flex items-center gap-1.5 text-xs whitespace-nowrap shadow-sm">
                    <FaUpload className="text-[11px]" /> {modalState.item.gambar ? 'Ganti Foto' : 'Upload Foto'}
                    <input type="file" accept="image/*" onChange={handleModalImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition cursor-pointer shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Edit / Tambah Jalur Pendaftaran */}
      {jalurModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setJalurModal({ isOpen: false, item: { nama: '', deskripsi: '', urutan: 1, aktif: true } })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <FaTimes />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {jalurModal.item.id ? 'Edit Jalur Pendaftaran' : 'Tambah Jalur Pendaftaran Baru'}
            </h3>
            <form onSubmit={handleSaveJalur} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Jalur *</label>
                <input
                  type="text"
                  required
                  value={jalurModal.item.nama || ''}
                  onChange={(e) => setJalurModal({ ...jalurModal, item: { ...jalurModal.item, nama: e.target.value } })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none focus:border-slate-900"
                  placeholder="Contoh: Beasiswa Tahfidz 10 Juz"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi / Syarat</label>
                <textarea
                  rows={2}
                  value={jalurModal.item.deskripsi || ''}
                  onChange={(e) => setJalurModal({ ...jalurModal, item: { ...jalurModal.item, deskripsi: e.target.value } })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-none focus:border-slate-900"
                  placeholder="Penjelasan singkat syarat jalur..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Urutan Tampil</label>
                  <input
                    type="number"
                    value={jalurModal.item.urutan || 1}
                    onChange={(e) => setJalurModal({ ...jalurModal, item: { ...jalurModal.item, urutan: parseInt(e.target.value, 10) || 1 } })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={jalurModal.item.aktif !== false ? 'true' : 'false'}
                    onChange={(e) => setJalurModal({ ...jalurModal, item: { ...jalurModal.item, aktif: e.target.value === 'true' } })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-900"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Non-Aktif</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJalurModal({ isOpen: false, item: { nama: '', deskripsi: '', urutan: 1, aktif: true } })}
                  className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 cursor-pointer"
                >
                  Simpan Jalur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal for Photo Inspection */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn select-none"
          onClick={() => setPreviewImage(null)}
        >
          <div className="flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-slate-300 font-medium">
              Pratinjau Foto (Ukuran Penuh)
            </span>
            <button
              onClick={() => setPreviewImage(null)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer text-lg"
              title="Tutup (Esc)"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 max-h-[82vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Foto Penuh"
              className="max-h-[82vh] max-w-full object-contain rounded-xl shadow-2xl transition animate-fadeIn"
            />
          </div>

          <div className="text-center text-xs text-slate-400 z-10" onClick={(e) => e.stopPropagation()}>
            Tekan <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-white">Esc</kbd> atau klik di luar foto untuk menutup
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
