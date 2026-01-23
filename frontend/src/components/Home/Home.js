import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBuilding,
  FaUsers,
  FaParking,
  FaUtensils,
  FaWifi,
  FaArrowRight,
  FaStar,
  FaChevronDown
} from 'react-icons/fa';
import '../../styles/Home.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const Home = () => {
  const navigate = useNavigate();
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    hasParking: false,
    hasKitchen: false
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const fetchFeaturedOffers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/offices/`);
        if (response.ok) {
          const data = await response.json();
          setFeaturedOffers(data.slice(0, 6));
        }
      } catch (err) {
        console.error('Błąd pobierania ofert:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedOffers();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    navigate(`/offers?${params.toString()}`);
  };

  const handleOfferClick = (offerId) => {
    navigate(`/offers/${offerId}`);
  };

  const noImageDataUrl = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D"http://www.w3.org/2000/svg" viewBox%3D"0 0 400 300"%3E%3Crect width%3D"100%25" height%3D"100%25" fill%3D"%23f0f0f0"/%3E%3Ctext x%3D"50%25" y%3D"50%25" dominant-baseline%3D"middle" text-anchor%3D"middle" font-size%3D"24" fill%3D"%23999"%3ENo Image%3C/text%3E%3C/svg%3E';

  // Funkcja do pobierania URL zdjęcia
  const getImageUrl = (offer) => {
    if (offer.images && offer.images.length > 0) {
      const imageUrl = offer.images[0].image_url;
      if (imageUrl && imageUrl.startsWith('http')) {
        return imageUrl;
      }
      return imageUrl ? `${API_BASE_URL}${imageUrl}` : noImageDataUrl;
    }
    return noImageDataUrl;
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Znajdź idealne biuro dla siebie</h1>
          <p>Przeglądaj setki przestrzeni biurowych i coworkingowych w całej Polsce</p>

          {/* Search Box */}
          <div className="search-box">
            <div className="search-main">
              <div className="search-input-group">
                <FaMapMarkerAlt className="search-icon" />
                <input
                  type="text"
                  name="city"
                  placeholder="Wpisz miasto..."
                  value={searchFilters.city}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="search-input-group">
                <FaBuilding className="search-icon" />
                <input
                  type="number"
                  name="minArea"
                  placeholder="Min. powierzchnia m²"
                  value={searchFilters.minArea}
                  onChange={handleFilterChange}
                />
              </div>
              <button className="search-button" onClick={handleSearch}>
                <FaSearch /> Szukaj
              </button>
            </div>

            <button
              className="advanced-filters-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <FaChevronDown className={showAdvancedFilters ? 'rotated' : ''} />
              {showAdvancedFilters ? 'Ukryj filtry' : 'Więcej filtrów'}
            </button>

            {showAdvancedFilters && (
              <div className="advanced-filters">
                <div className="filter-row">
                  <div className="filter-group">
                    <label>Cena od (PLN)</label>
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={searchFilters.minPrice}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Cena do (PLN)</label>
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={searchFilters.maxPrice}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="filter-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasParking"
                      checked={searchFilters.hasParking}
                      onChange={handleFilterChange}
                    />
                    <FaParking /> Parking
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasKitchen"
                      checked={searchFilters.hasKitchen}
                      onChange={handleFilterChange}
                    />
                    <FaUtensils /> Kuchnia
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaBuilding />
            </div>
            <h3>Szeroki wybór</h3>
            <p>Setki biur i przestrzeni coworkingowych w całej Polsce</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaUsers />
            </div>
            <h3>Elastyczne warunki</h3>
            <p>Wynajmij na dzień, tydzień lub miesiąc</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaWifi />
            </div>
            <h3>Nowoczesne udogodnienia</h3>
            <p>Szybki internet, sale konferencyjne i wiele więcej</p>
          </div>
        </div>
      </section>

      {/* Featured Offers Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Wyróżnione oferty</h2>
          <button className="view-all-button" onClick={() => navigate('/offers')}>
            Zobacz wszystkie <FaArrowRight />
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Ładowanie...</div>
        ) : (
          <div className="featured-grid">
            {featuredOffers.map(offer => (
              <div
                key={offer.id}
                className="featured-card"
                onClick={() => handleOfferClick(offer.id)}
              >
                <div className="featured-image">
                  <img
                    src={getImageUrl(offer)}
                    alt={offer.name}
                    onError={(e) => {
                      if (e.target.src !== noImageDataUrl) {
                        e.target.src = noImageDataUrl;
                      }
                    }}
                  />
                  <div className="featured-badge">
                    <FaStar /> Wyróżnione
                  </div>
                </div>
                <div className="featured-content">
                  <h3>{offer.name}</h3>
                  <p className="featured-location">
                    <FaMapMarkerAlt /> {offer.city || ''}{offer.address ? (offer.city ? `, ${offer.address}` : offer.address) : ''}
                  </p>
                  <div className="featured-details">
                    <span><FaBuilding /> {offer.area_sqm ? `${offer.area_sqm} m²` : '-'}</span>
                    <span><FaUsers /> {offer.max_people ? `do ${offer.max_people} osób` : '-'}</span>
                  </div>
                  <div className="featured-price">
                    {offer.price ? parseFloat(offer.price).toLocaleString('pl-PL') : '0'} PLN<span>/miesiąc</span>
                  </div>
                  <div className="featured-amenities">
                    {offer.has_parking && <span className="amenity"><FaParking /></span>}
                    {offer.has_kitchen && <span className="amenity"><FaUtensils /></span>}
                    {offer.has_conference_room && <span className="amenity"><FaUsers /></span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Chcesz wynająć biuro?</h2>
          <p>Zaloguj się już teraz, i przeglądaj najlepsze oferty!</p>
          <button className="cta-button" onClick={() => navigate('/auth')}>
            Logowanie
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
