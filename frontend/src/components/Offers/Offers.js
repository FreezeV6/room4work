import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaMapMarkerAlt, FaBuilding, FaMoneyBillWave, FaCalendarPlus, FaParking, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import '../../styles/Offers.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

console.log('🔧 REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
console.log('🔧 API_BASE_URL:', API_BASE_URL);

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    hasParking: false,
    hasKitchen: false,
    minPeople: '',
    maxPeople: ''
  });

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/offices`);
        if (!response.ok) {
          throw new Error('Nie udało się pobrać ofert');
        }
        const data = await response.json();
        setOffers(data);
        setFilteredOffers(data);
      } catch (err) {
        console.error('Błąd:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      hasParking: false,
      hasKitchen: false,
      minPeople: '',
      maxPeople: ''
    });
  };

  useEffect(() => {
    if (offers.length > 0) {
      const filtered = offers.filter(offer => {
        return (
          (!filters.city || offer.location?.toLowerCase().includes(filters.city.toLowerCase())) &&
          (!filters.minPrice || offer.price_per_month >= parseFloat(filters.minPrice)) &&
          (!filters.maxPrice || offer.price_per_month <= parseFloat(filters.maxPrice)) &&
          (!filters.minArea || offer.area_sqm >= parseFloat(filters.minArea)) &&
          (!filters.maxArea || offer.area_sqm <= parseFloat(filters.maxArea)) &&
          (!filters.hasParking || offer.has_parking) &&
          (!filters.hasKitchen || offer.has_kitchen) &&
          (!filters.minPeople || offer.max_people >= parseFloat(filters.minPeople)) &&
          (!filters.maxPeople || offer.max_people <= parseFloat(filters.maxPeople))
        );
      });
      setFilteredOffers(filtered);
    }
  }, [offers, filters]);

  const handleDetailsClick = (offerId) => {
    navigate(`/offers/${offerId}`);
  };

  const noImageDataUrl = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D"http://www.w3.org/2000/svg" viewBox%3D"0 0 400 300"%3E%3Crect width%3D"100%25" height%3D"100%25" fill%3D"%23f0f0f0"/%3E%3Ctext x%3D"50%25" y%3D"50%25" dominant-baseline%3D"middle" text-anchor%3D"middle" font-size%3D"24" fill%3D"%23999"%3ENo Image Available%3C/text%3E%3C/svg%3E';

  const renderOfferCard = (offer) => (
    <div key={offer.id} className="offer-card">
      <div className="offer-image">
        <img
          src={offer.image_url ? `${API_BASE_URL}${offer.image_url}` : noImageDataUrl}
          alt={offer.title}
          onError={(e) => {
            if (e.target.src !== noImageDataUrl) {
              e.target.src = noImageDataUrl;
            }
          }}
        />
      </div>
      <div className="offer-content">
        <h3>{offer.name}</h3>
        <p className="offer-location">
          <FaMapMarkerAlt /> {offer.location || 'Lokalizacja niedostępna'}
        </p>
        <p className="offer-area">
          <FaBuilding /> {offer.area_sqm} m²
        </p>
        <p className="offer-price">
          <FaMoneyBillWave /> {offer.price_per_month} PLN/miesiąc
        </p>
        <div className="offer-features">
          {offer.has_parking && (
            <span className="feature">
              <FaParking /> Parking
            </span>
          )}
          {offer.has_kitchen && (
            <span className="feature">
              <FaUtensils /> Kuchnia
            </span>
          )}
        </div>
        <div className="offer-actions">
          <button
            className="details-button"
            onClick={() => handleDetailsClick(offer.id)}
          >
            Szczegóły
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="offers-container">
      <div className="offers-header">
        <h2>Dostępne biura</h2>
        <button
          className="filter-toggle-button"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3><FaFilter /> Filtry</h3>
            <button onClick={clearFilters} className="clear-filters">Wyczyść filtry</button>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Miasto:</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Wpisz miasto"
              />
            </div>

            <div className="filter-group">
              <label>Cena (PLN/miesiąc):</label>
              <div className="range-inputs">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Od"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Do"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Powierzchnia (m²):</label>
              <div className="range-inputs">
                <input
                  type="number"
                  name="minArea"
                  value={filters.minArea}
                  onChange={handleFilterChange}
                  placeholder="Od"
                />
                <input
                  type="number"
                  name="maxArea"
                  value={filters.maxArea}
                  onChange={handleFilterChange}
                  placeholder="Do"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Liczba osób:</label>
              <div className="range-inputs">
                <input
                  type="number"
                  name="minPeople"
                  value={filters.minPeople}
                  onChange={handleFilterChange}
                  placeholder="Od"
                />
                <input
                  type="number"
                  name="maxPeople"
                  value={filters.maxPeople}
                  onChange={handleFilterChange}
                  placeholder="Do"
                />
              </div>
            </div>

            <div className="filter-group checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="hasParking"
                  checked={filters.hasParking}
                  onChange={handleFilterChange}
                />
                Parking
              </label>
              <label>
                <input
                  type="checkbox"
                  name="hasKitchen"
                  checked={filters.hasKitchen}
                  onChange={handleFilterChange}
                />
                Kuchnia
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="offers-grid">
        {filteredOffers.length > 0 ? (
          filteredOffers.map(offer => renderOfferCard(offer))
        ) : (
          <p className="no-offers">Brak dostępnych ofert spełniających kryteria</p>
        )}
      </div>
    </div>
  );
};

export default Offers;
