import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import '../../styles/NavBar.css';

const NavBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Room4Work</Link>
      </div>

      <div className="nav-links">
        <Link to="/offers">Oferty</Link>
        <Link to="/about">O nas</Link>
        <Link to="/contact">Kontakt</Link>
      </div>

      <div className="nav-auth">
        {isAuthenticated ? (
          <div className="user-menu">
            <button
              className="profile-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <FaUser />
              <span>{user?.first_name || 'Profil'}</span>
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUser /> Mój profil
                </Link>
                <button onClick={handleLogout} className="dropdown-item">
                  <FaSignOutAlt /> Wyloguj się
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="auth-button">
            Zaloguj się
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
