import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaBuilding, FaMoneyBillWave, FaCalendarPlus, FaParking, FaUtensils, FaUsers } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import BookingForm from '../BookingForm/BookingForm';
import noImage from '../../assets/no-image.svg';
import '../../styles/OfferDetails.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const OfferDetails = () => {
  const [office, setOffice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchOfficeDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/offices/${id}/`);
        if (!response.ok) {
          throw new Error('Nie udało się pobrać szczegółów oferty');
        }
        const data = await response.json();
        setOffice(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOfficeDetails();
    }
  }, [id]);

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setShowBookingForm(true);
    setTimeout(() => {
      const formElement = document.getElementById('booking-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const renderImages = () => {
    if (!office) return null;

    if (Array.isArray(office.images) && office.images.length > 0) {
      return (
        <div className="office-images">
          {office.images.map((image, index) => (
            <img
              key={index}
              src={`${API_BASE_URL}${image.image_url}`}
              alt={`${office.title} - zdjęcie ${index + 1}`}
              className={image.is_main ? 'main-image' : 'secondary-image'}
              onError={(e) => {
                if (e.target.src !== noImage) {
                  e.target.src = noImage;
                }
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="no-image">
        <img
          src={noImage}
          alt="Brak zdjęcia"
          className="main-image"
        />
      </div>
    );
  };

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!office) return <div className="error-message">Nie znaleziono oferty</div>;

  return (
    <div className="offer-details-container">
      <button onClick={() => navigate('/offers')} className="back-button">
        <FaArrowLeft /> Wróć do listy
      </button>

      <div className="offer-details">
        <div className="offer-header">
          <h1>{office.title}</h1>
          <div className="offer-main-info">
            <p className="price">
              <FaMoneyBillWave /> {office.price_per_month} PLN/miesiąc
            </p>
            <p className="location">
              <FaMapMarkerAlt /> {office.address}, {office.city}
            </p>
          </div>
        </div>

        {renderImages()}

        <div className="offer-details-content">
          <div className="offer-features">
            <h2>Szczegóły biura</h2>
            <div className="features-grid">
              <div className="feature">
                <FaMapMarkerAlt />
                <span>Lokalizacja: {office.address}, {office.city}</span>
              </div>
              <div className="feature">
                <FaBuilding />
                <span>Powierzchnia: {office.area_sqm} m²</span>
              </div>
              <div className="feature">
                <FaUsers />
                <span>Max. liczba osób: {office.max_people}</span>
              </div>
              {office.has_parking && (
                <div className="feature">
                  <FaParking />
                  <span>Parking dostępny</span>
                </div>
              )}
              {office.has_kitchen && (
                <div className="feature">
                  <FaUtensils />
                  <span>Dostęp do kuchni</span>
                </div>
              )}
            </div>
          </div>

          {office.description && (
            <div className="offer-description">
              <h2>Opis</h2>
              <p>{office.description}</p>
            </div>
          )}

          {!showBookingForm && (
            <div className="booking-section">
              <button
                className="booking-button"
                onClick={handleBookingClick}
                disabled={!isAuthenticated}
              >
                <FaCalendarPlus />
                {isAuthenticated ? 'Zarezerwuj teraz' : 'Zaloguj się, aby zarezerwować'}
              </button>
              {!isAuthenticated && (
                <p className="login-prompt">
                  Musisz być zalogowany, aby dokonać rezerwacji.
                  <button onClick={() => navigate('/auth')} className="login-link">
                    Zaloguj się
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {showBookingForm && (
        <div id="booking-form" className="booking-form-section">
          <BookingForm
            officeId={id}
            officeName={office.name}
            pricePerMonth={office.price_per_month}
          />
        </div>
      )}
    </div>
  );
};

export default OfferDetails;
