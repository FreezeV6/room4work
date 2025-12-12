import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaBuilding, FaCalendar, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaTimes, FaHistory } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import '../../styles/UserProfile.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const UserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [bookingsTab, setBookingsTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/bookings/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Błąd pobierania rezerwacji');
        return res.json();
      })
      .then(data => setBookings(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate, isAuthenticated]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Czy na pewno chcesz anulować tę rezerwację?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMsg = 'Nie udało się anulować rezerwacji';
        try {
          const data = await response.json();
          errorMsg = data.detail || data.message || errorMsg;
        } catch (e) {
          // Response might not be JSON
        }
        throw new Error(errorMsg);
      }

      // Aktualizuj stan po udanym anulowaniu
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      setError(null);
    } catch (err) {
      setError('Wystąpił błąd podczas anulowania rezerwacji. Spróbuj ponownie później.');
    }
  };

  // Funkcja filtrująca aktywne rezerwacje
  const getActiveBookings = () => {
    const currentDate = new Date();
    return bookings.filter(booking =>
      booking.status !== 'cancelled' &&
      new Date(booking.end_date) >= currentDate
    );
  };

  // Funkcja filtrująca historyczne rezerwacje
  const getHistoryBookings = () => {
    const currentDate = new Date();
    return bookings.filter(booking =>
      booking.status === 'cancelled' ||
      new Date(booking.end_date) < currentDate
    );
  };

  const renderBookingsList = (bookingsToShow) => (
    <div className="bookings-list">
      {bookingsToShow.map(booking => (
        <div key={booking.id} className={`booking-card ${booking.status}`}>
          <div className="booking-header">
            <h3>{booking.title}</h3>
            <span className={`status-badge ${booking.status}`}>
              {booking.status === 'pending' ? 'Oczekująca' :
               booking.status === 'confirmed' ? 'Potwierdzona' :
               booking.status === 'cancelled' ? 'Anulowana' : booking.status}
            </span>
          </div>
          <div className="booking-details">
            <p>
              <FaMapMarkerAlt className="icon" />
              <span>{booking.address}, {booking.city}</span>
            </p>
            <p>
              <FaCalendar className="icon" />
              <span>Od: {new Date(booking.start_date).toLocaleDateString()}</span>
            </p>
            <p>
              <FaClock className="icon" />
              <span>Do: {new Date(booking.end_date).toLocaleDateString()}</span>
            </p>
            <p>
              <FaMoneyBillWave className="icon" />
              <span>Całkowity koszt: {booking.total_price} PLN</span>
            </p>
          </div>
          {booking.status !== 'cancelled' && new Date(booking.end_date) >= new Date() && (
            <button
              className="cancel-button"
              onClick={() => handleCancelBooking(booking.id)}
            >
              <FaTimes /> Anuluj rezerwację
            </button>
          )}
        </div>
      ))}
    </div>
  );

  if (!isAuthenticated) return null;
  if (loading) return <div className="loading">Ładowanie...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const activeBookings = getActiveBookings();
  const historyBookings = getHistoryBookings();

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Panel użytkownika</h1>
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profil
          </button>
          <button
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <FaCalendar /> Rezerwacje
          </button>
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' ? (
          <div className="profile-info">
            <div className="info-item">
              <FaUser className="icon" />
              <span>Imię i nazwisko: {user?.first_name} {user?.last_name}</span>
            </div>
            <div className="info-item">
              <FaEnvelope className="icon" />
              <span>Email: {user?.email}</span>
            </div>
            {user?.company_name && (
              <div className="info-item">
                <FaBuilding className="icon" />
                <span>Firma: {user?.company_name}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bookings-section">
            <div className="bookings-tabs">
              <button
                className={`tab-button ${bookingsTab === 'active' ? 'active' : ''}`}
                onClick={() => setBookingsTab('active')}
              >
                <FaCalendar /> Aktywne ({activeBookings.length})
              </button>
              <button
                className={`tab-button ${bookingsTab === 'history' ? 'active' : ''}`}
                onClick={() => setBookingsTab('history')}
              >
                <FaHistory /> Historia ({historyBookings.length})
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {bookingsTab === 'active' && (
              <>
                <h2>Aktywne rezerwacje</h2>
                {activeBookings.length === 0 ? (
                  <p className="no-bookings">Nie masz aktywnych rezerwacji.</p>
                ) : (
                  renderBookingsList(activeBookings)
                )}
              </>
            )}

            {bookingsTab === 'history' && (
              <>
                <h2>Historia rezerwacji</h2>
                {historyBookings.length === 0 ? (
                  <p className="no-bookings">Brak historycznych rezerwacji.</p>
                ) : (
                  renderBookingsList(historyBookings)
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
