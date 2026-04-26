import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/pose-hai.png';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const isConfirmed = confirm('Apakah Anda yakin ingin keluar?');
    if (isConfirmed) {
      localStorage.removeItem('token');
      navigate('/login');
    }
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
            <span className="brand-subtitle">Dashboard Admin</span>
          </div>

          <div className="nav-right">
            <div className="nav-links">
            </div>
            <div className="nav-links">
              <button
                className="nav-link"
                onClick={() => navigate('/review-attempt')}
              >
                Review Attempt
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