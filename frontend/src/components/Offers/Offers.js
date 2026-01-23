import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaFilter,
  FaMapMarkerAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaParking,
  FaUtensils,
  FaUsers,
  FaChevronDown,
  FaTimes,
  FaSearch
} from 'react-icons/fa';
import '../../styles/Offers.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    hasParking: searchParams.get('hasParking') === 'true',
    hasKitchen: searchParams.get('hasKitchen') === 'true',
    minPeople: searchParams.get('minPeople') || '',
    maxPeople: searchParams.get('maxPeople') || ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/offices/`);
        if (!response.ok) {
          setError('Nie udało się pobrać ofert');
          return;
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

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (typeof value === 'boolean') return value;
    return value !== '';
  }).length;

  useEffect(() => {
    if (offers.length > 0) {
      const filtered = offers.filter(offer => {
        const price = parseFloat(offer.price) || 0;
        const cityMatch = !filters.city ||
          (offer.city && offer.city.toLowerCase().includes(filters.city.toLowerCase())) ||
          (offer.address && offer.address.toLowerCase().includes(filters.city.toLowerCase()));

        return (
          cityMatch &&
          (!filters.minPrice || price >= parseFloat(filters.minPrice)) &&
          (!filters.maxPrice || price <= parseFloat(filters.maxPrice)) &&
          (!filters.minArea || (offer.area_sqm && offer.area_sqm >= parseFloat(filters.minArea))) &&
          (!filters.maxArea || (offer.area_sqm && offer.area_sqm <= parseFloat(filters.maxArea))) &&
          (!filters.hasParking || offer.has_parking) &&
          (!filters.hasKitchen || offer.has_kitchen) &&
          (!filters.minPeople || (offer.max_people && offer.max_people >= parseFloat(filters.minPeople))) &&
          (!filters.maxPeople || (offer.max_people && offer.max_people <= parseFloat(filters.maxPeople)))
        );
      });
      setFilteredOffers(filtered);
    }
  }, [offers, filters]);

  const handleDetailsClick = (offerId) => {
    navigate(`/offers/${offerId}`);
  };

  const noImageDataUrl = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D"http://www.w3.org/2000/svg" viewBox%3D"0 0 400 300"%3E%3Crect width%3D"100%25" height%3D"100%25" fill%3D"%23f0f0f0"/%3E%3Ctext x%3D"50%25" y%3D"50%25" dominant-baseline%3D"middle" text-anchor%3D"middle" font-size%3D"24" fill%3D"%23999"%3EBrak zdjęcia%3C/text%3E%3C/svg%3E';

  // Funkcja do pobierania URL zdjęcia
  const getImageUrl = (offer) => {
    // Sprawdź czy są zdjęcia w tablicy images
    if (offer.images && offer.images.length > 0) {
      const imageUrl = offer.images[0].image_url;
      // Jeśli URL zaczyna się od http, użyj go bezpośrednio
      if (imageUrl && imageUrl.startsWith('http')) {
        return imageUrl;
      }
      // W przeciwnym razie dodaj prefix API
      return imageUrl ? `${API_BASE_URL}${imageUrl}` : noImageDataUrl;
    }
    return noImageDataUrl;
  };

  if (loading) {
    return (
      <div className="offers-loading">
        <div className="spinner"></div>
        <p>Ładowanie ofert...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="offers-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Spróbuj ponownie</button>
      </div>
    );
  }

  return (
    <div className="offers-page">
      {/* Hero Section */}
      <section className="offers-hero">
        <div className="offers-hero-content">
          <h1>Znajdź idealne biuro</h1>
          <p>Przeglądaj spośród {offers.length} dostępnych przestrzeni biurowych</p>
        </div>
      </section>

      <div className="offers-container">
        {/* Sidebar Filters */}
        <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="filters-header">
            <h3><FaFilter /> Filtry {activeFiltersCount > 0 && <span className="filter-count">{activeFiltersCount}</span>}</h3>
            <button onClick={clearFilters} className="clear-filters">
              <FaTimes /> Wyczyść
            </button>
          </div>

          <div className="filter-section">
            <label className="filter-label">
              <FaMapMarkerAlt /> Lokalizacja
            </label>
            <div className="search-input-wrapper">
              <FaSearch className="input-icon" />
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Wpisz miasto lub adres..."
              />
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">
              <FaMoneyBillWave /> Cena (PLN/miesiąc)
            </label>
            <div className="range-inputs">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Od"
              />
              <span className="range-separator">-</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Do"
              />
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">
              <FaBuilding /> Powierzchnia (m²)
            </label>
            <div className="range-inputs">
              <input
                type="number"
                name="minArea"
                value={filters.minArea}
                onChange={handleFilterChange}
                placeholder="Od"
              />
              <span className="range-separator">-</span>
              <input
                type="number"
                name="maxArea"
                value={filters.maxArea}
                onChange={handleFilterChange}
                placeholder="Do"
              />
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">
              <FaUsers /> Liczba osób
            </label>
            <div className="range-inputs">
              <input
                type="number"
                name="minPeople"
                value={filters.minPeople}
                onChange={handleFilterChange}
                placeholder="Od"
              />
              <span className="range-separator">-</span>
              <input
                type="number"
                name="maxPeople"
                value={filters.maxPeople}
                onChange={handleFilterChange}
                placeholder="Do"
              />
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">Udogodnienia</label>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="hasParking"
                  checked={filters.hasParking}
                  onChange={handleFilterChange}
                />
                <span className="checkbox-custom"></span>
                <FaParking /> Parking
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="hasKitchen"
                  checked={filters.hasKitchen}
                  onChange={handleFilterChange}
                />
                <span className="checkbox-custom"></span>
                <FaUtensils /> Kuchnia
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="offers-main">
          <div className="offers-toolbar">
            <div className="results-count">
              Znaleziono <strong>{filteredOffers.length}</strong> {filteredOffers.length === 1 ? 'ofertę' : 'ofert'}
            </div>
            <button
              className="mobile-filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filtry {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              <FaChevronDown className={showFilters ? 'rotated' : ''} />
            </button>
          </div>

          {filteredOffers.length > 0 ? (
            <div className="offers-grid">
              {filteredOffers.map(offer => (
                <div
                  key={offer.id}
                  className="offer-card"
                  onClick={() => handleDetailsClick(offer.id)}
                >
                  <div className="offer-image">
                    <img
                      src={getImageUrl(offer)}
                      alt={offer.name}
                      onError={(e) => {
                        if (e.target.src !== noImageDataUrl) {
                          e.target.src = noImageDataUrl;
                        }
                      }}
                    />
                    {offer.is_available && <span className="availability-badge">Dostępne</span>}
                  </div>
                  <div className="offer-content">
                    <h3>{offer.name}</h3>
                    <p className="offer-location">
                      <FaMapMarkerAlt /> {offer.city || ''}{offer.address ? (offer.city ? `, ${offer.address}` : offer.address) : ''}
                    </p>
                    <div className="offer-details">
                      <span><FaBuilding /> {offer.area_sqm ? `${offer.area_sqm} m²` : '-'}</span>
                      <span><FaUsers /> {offer.max_people ? `do ${offer.max_people} osób` : '-'}</span>
                    </div>
                    <div className="offer-amenities">
                      {offer.has_parking && <span className="amenity"><FaParking /></span>}
                      {offer.has_kitchen && <span className="amenity"><FaUtensils /></span>}
                    </div>
                    <div className="offer-footer">
                      <div className="offer-price">
                        {offer.price ? parseFloat(offer.price).toLocaleString('pl-PL') : '0'} PLN
                        <span>/miesiąc</span>
                      </div>
                      <button className="details-button">
                        Szczegóły
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <FaSearch />
              <h3>Brak wyników</h3>
              <p>Nie znaleziono ofert spełniających kryteria wyszukiwania.</p>
              <button onClick={clearFilters}>Wyczyść filtry</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Offers;
