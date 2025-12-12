import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import '../../styles/Auth.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Debug: sprawdź wartość zmiennej środowiskowej
console.log('🔧 Auth API_BASE_URL:', API_BASE_URL);

const Auth = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    company_name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const endpoint = isLogin ? '/api/auth/login/' : '/api/users/';

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(isLogin
          ? { email: formData.email, password: formData.password }
          : formData)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.detail || data.message || data.email?.[0] || data.non_field_errors?.[0] || 'Wystąpił błąd';
        throw new Error(errorMsg);
      }

      if (isLogin) {
        // Login successful - use data.access as the token
        login(data.user, data.access);
        navigate('/profile');
      } else {
        // Registration successful
        setSuccess('Konto zostało utworzone! Zaloguj się.');
        setFormData({ email: '', password: '', first_name: '', last_name: '', company_name: '' });
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-switch-buttons">
          <button
            className={`switch-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Logowanie
          </button>
          <button
            className={`switch-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Rejestracja
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Hasło"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  name="first_name"
                  placeholder="Imię"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Nazwisko"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <FaBuilding className="input-icon" />
                <input
                  type="text"
                  name="company_name"
                  placeholder="Nazwa firmy (opcjonalnie)"
                  value={formData.company_name}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <button type="submit" className="auth-button">
            {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
