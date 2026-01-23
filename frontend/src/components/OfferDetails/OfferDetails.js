import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaCalendarPlus,
  FaParking,
  FaUtensils,
  FaUsers,
  FaRulerCombined,
  FaWifi,
  FaSnowflake,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import BookingForm from '../BookingForm/BookingForm';
import '../../styles/OfferDetails.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const OfferDetails = () => {
  const [office, setOffice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const noImageDataUrl = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D"http://www.w3.org/2000/svg" viewBox%3D"0 0 400 300"%3E%3Crect width%3D"100%25" height%3D"100%25" fill%3D"%23f0f0f0"/%3E%3Ctext x%3D"50%25" y%3D"50%25" dominant-baseline%3D"middle" text-anchor%3D"middle" font-size%3D"24" fill%3D"%23999"%3EBrak zdjęcia%3C/text%3E%3C/svg%3E';

  // Funkcja do pobierania URL zdjęcia
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return noImageDataUrl;
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `${API_BASE_URL}${imageUrl}`;
  };

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

  const images = office?.images?.length > 0
    ? office.images.map(img => getImageUrl(img.image_url))
    : [noImageDataUrl];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="offer-details-loading">
        <div className="spinner"></div>
        <p>Ładowanie szczegółów...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="offer-details-error">
        <p>{error}</p>
        <button onClick={() => navigate('/offers')}>Wróć do ofert</button>
      </div>
    );
  }

  if (!office) {
    return (
      <div className="offer-details-error">
        <p>Nie znaleziono oferty</p>
        <button onClick={() => navigate('/offers')}>Wróć do ofert</button>
      </div>
    );
  }

  return (
    <div className="offer-details-page">
      {/* Breadcrumb */}
      <div className="offer-breadcrumb">
        <div className="breadcrumb-content">
          <button onClick={() => navigate('/offers')} className="back-button">
            <FaArrowLeft /> Wróć do listy ofert
          </button>
        </div>
      </div>

      <div className="offer-details-container">
        <div className="offer-details-main">
          {/* Image Gallery */}
          <div className="offer-gallery">
            <div className="gallery-main">
              <img
                src={images[currentImageIndex]}
                alt={`${office.name} - zdjęcie ${currentImageIndex + 1}`}
                onError={(e) => {
                  if (e.target.src !== noImageDataUrl) {
                    e.target.src = noImageDataUrl;
                  }
                }}
              />
              {images.length > 1 && (
                <>
                  <button className="gallery-nav prev" onClick={prevImage}>
                    <FaChevronLeft />
                  </button>
                  <button className="gallery-nav next" onClick={nextImage}>
                    <FaChevronRight />
                  </button>
                  <div className="gallery-indicators">
                    {images.map((_, index) => (
                      <span
                        key={index}
                        className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="gallery-thumbnails">
                {images.slice(0, 4).map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${index + 1}`}
                      onError={(e) => {
                        if (e.target.src !== noImageDataUrl) {
                          e.target.src = noImageDataUrl;
                        }
                      }}
                    />
                    {index === 3 && images.length > 4 && (
                      <div className="thumbnail-overlay">+{images.length - 4}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Office Info */}
          <div className="offer-info-section">
            <div className="offer-header">
              <div className="offer-title-row">
                <h1>{office.name}</h1>
                {office.is_available && (
                  <span className="availability-badge">
                    <FaCheckCircle /> Dostępne
                  </span>
                )}
              </div>
              <p className="offer-location">
                <FaMapMarkerAlt /> {office.address}
              </p>
              <p className="offer-type">
                <FaBuilding /> {office.office_type?.name || 'Biuro'}
              </p>
            </div>

            {/* Features Grid */}
            <div className="offer-features">
              <h2>Szczegóły</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon"><FaRulerCombined /></div>
                  <div className="feature-info">
                    <span className="feature-value">{office.area_sqm || '-'} m²</span>
                    <span className="feature-label">Powierzchnia</span>
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon"><FaUsers /></div>
                  <div className="feature-info">
                    <span className="feature-value">do {office.max_people || '-'}</span>
                    <span className="feature-label">Osób</span>
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon"><FaMoneyBillWave /></div>
                  <div className="feature-info">
                    <span className="feature-value">{parseFloat(office.price).toLocaleString('pl-PL')} PLN</span>
                    <span className="feature-label">Miesięcznie</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="offer-amenities">
              <h2>Udogodnienia</h2>
              <div className="amenities-grid">
                <div className={`amenity-item ${office.has_parking ? 'available' : 'unavailable'}`}>
                  <FaParking />
                  <span>Parking</span>
                </div>
                <div className={`amenity-item ${office.has_kitchen ? 'available' : 'unavailable'}`}>
                  <FaUtensils />
                  <span>Kuchnia</span>
                </div>
                <div className={`amenity-item ${office.has_conference_room ? 'available' : 'unavailable'}`}>
                  <FaUsers />
                  <span>Sala konferencyjna</span>
                </div>
                <div className="amenity-item available">
                  <FaWifi />
                  <span>WiFi</span>
                </div>
                <div className="amenity-item available">
                  <FaSnowflake />
                  <span>Klimatyzacja</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {office.description && (
              <div className="offer-description">
                <h2>Opis</h2>
                <p>{office.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="offer-details-sidebar">
          <div className="booking-card">
            <div className="booking-price">
              <span className="price-amount">{parseFloat(office.price).toLocaleString('pl-PL')} PLN</span>
              <span className="price-period">/miesiąc</span>
            </div>

            {!showBookingForm ? (
              <>
                <button
                  className="booking-button"
                  onClick={handleBookingClick}
                >
                  <FaCalendarPlus />
                  {isAuthenticated ? 'Zarezerwuj teraz' : 'Zaloguj się, aby zarezerwować'}
                </button>
                {!isAuthenticated && (
                  <p className="login-prompt">
                    Musisz być zalogowany, aby dokonać rezerwacji.
                  </p>
                )}
              </>
            ) : (
              <div id="booking-form">
                <BookingForm
                  officeId={id}
                  officeName={office.name}
                  pricePerMonth={office.price}
                />
              </div>
            )}

            <div className="contact-info">
              <h4>Kontakt z właścicielem</h4>
              {office.owner && (
                <div className="owner-info">
                  <div className="owner-avatar">
                    {office.owner.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="owner-details">
                    <span className="owner-name">{office.owner.username}</span>
                    <span className="owner-role">Właściciel</span>
                  </div>
                </div>
              )}
              <div className="contact-buttons">
                <button className="contact-btn">
                  <FaPhone /> Zadzwoń
                </button>
                <button className="contact-btn">
                  <FaEnvelope /> Napisz
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OfferDetails;
