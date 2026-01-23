import React, { useState } from 'react';
import { FaEnvelope, FaUser, FaPaperPlane, FaCheckCircle, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import '../../styles/Contact.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Wystąpił błąd podczas wysyłania wiadomości');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1><FaEnvelope /> Kontakt</h1>
        <p>Masz pytania? Chętnie pomożemy! Wypełnij formularz, a odpowiemy najszybciej jak to możliwe.</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h3>Dane kontaktowe</h3>
          <div className="info-item">
            <FaEnvelope />
            <div>
              <strong>Email</strong>
              <p>kontakt@room4work.pl</p>
            </div>
          </div>
          <div className="info-item">
            <FaPhone />
            <div>
              <strong>Telefon</strong>
              <p>+48 123 456 789</p>
            </div>
          </div>
          <div className="info-item">
            <FaMapMarkerAlt />
            <div>
              <strong>Adres</strong>
              <p>ul. Przykładowa 123<br />00-001 Warszawa</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {success && (
            <div className="success-message">
              <FaCheckCircle /> Wiadomość została wysłana pomyślnie!
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">
              <FaUser /> Imię i nazwisko
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Wpisz swoje imię i nazwisko"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Wpisz swój adres email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">
              Temat
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Wpisz temat wiadomości"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">
              Wiadomość
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Wpisz swoją wiadomość..."
              rows="6"
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              'Wysyłanie...'
            ) : (
              <>
                <FaPaperPlane /> Wyślij wiadomość
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
