import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import logoImg from '../assets/pose-hai.png';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [sections, setSections] = useState([]);
  const [searchSection, setSearchSection] = useState('');
  const [sortOrder, setSortOrder] = useState('oldest');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sections`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSections(data.payload?.datas || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSections();
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSections = sections
    .filter(s => s.nama.toLowerCase().includes(searchSection.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'name-asc') {
        return a.nama.localeCompare(b.nama);
      } else if (sortOrder === 'name-desc') {
        return b.nama.localeCompare(a.nama);
      } else if (sortOrder === 'oldest') {
        return a.id - b.id;
      } else {
        // default: newest
        return b.id - a.id;
      }
    });

  const displayedSections = filteredSections;

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar Aplikasi?',
      text: 'Apakah Anda yakin ingin keluar dari akun admin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2977ff',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      customClass: {
        confirmButton: 'rounded-pill px-4',
        cancelButton: 'rounded-pill px-4 text-white'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        navigate('/login', { state: { logoutMessage: 'Anda telah berhasil keluar dari akun.' } });
      }
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-wrapper">
        <div className="navbar-container">
          <div className="nav-brand">
            <button
              className="brand-link"
              onClick={() => navigate('/homepage')}
            >
              <span className="brand-text">LogiLearn</span>
              <img src={logoImg} alt="LogiLearn Logo" className="brand-logo" />
            </button>
            <span className="brand-separator">|</span>
            <span
              className="brand-subtitle"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/homepage')}
            >
              Dashboard Admin
            </span>
          </div>

          <div className="nav-right">
            <div className="nav-links" ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                className="nav-link"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                Seksi <i className="bi bi-chevron-down" style={{ fontSize: '12px', marginLeft: '2px' }}></i>
              </button>
              {showDropdown && (
                <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', left: '0', minWidth: '250px', marginTop: '0.5rem', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <div className="dropdown-header p-0 mb-2">
                    <div className="d-flex gap-2 align-items-center">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Cari seksi..."
                        value={searchSection}
                        onChange={(e) => setSearchSection(e.target.value)}
                      />
                      <select
                        className="form-select form-select-sm border bg-light text-secondary fw-semibold"
                        style={{ width: '100px', fontSize: '11px', cursor: 'pointer', borderRadius: '4px' }}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        title="Urutkan"
                      >
                        <option value="oldest">Terlama</option>
                        <option value="newest">Terbaru</option>
                        <option value="name-asc">A - Z</option>
                        <option value="name-desc">Z - A</option>
                      </select>
                    </div>
                  </div>
                  <div className="dropdown-list" style={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {displayedSections.length > 0 ? (
                      displayedSections.map(s => (
                        <button
                          key={s.id}
                          className="dropdown-item rounded"
                          style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                          onClick={() => {
                            setShowDropdown(false);
                            navigate(`/${s.slug}/levels`);
                          }}
                        >
                          {s.nama}
                        </button>
                      ))
                    ) : (
                      <div className="text-center text-muted small p-2">Tidak ditemukan</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="nav-links">
              <button
                className="nav-link"
                onClick={() => navigate('/leaderboard')}
              >
                Papan Peringkat
              </button>
            </div>
            <div className="nav-links">
              <button
                className="nav-link"
                onClick={() => navigate('/review-attempt')}
              >
                Ulas Pengerjaan
              </button>
            </div>
            <div className="nav-logout">
              <button
                onClick={handleLogout}
                className="btn-logout"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;