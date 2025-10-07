import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import pl from 'date-fns/locale/pl';
import { differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import "react-datepicker/dist/react-datepicker.css";
import '../../styles/BookingForm.css';

registerLocale('pl', pl);

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const BookingForm = ({ officeId, officeName, pricePerMonth }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingBookings, setExistingBookings] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExistingBookings = async () => {
      if (!officeId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/office/${officeId}`);
        if (!response.ok) {
          throw new Error('Nie udało się pobrać rezerwacji');
        }
        const data = await response.json();
        setExistingBookings(data);
      } catch (err) {
        console.error('Błąd podczas pobierania rezerwacji:', err);
        setError('Nie udało się załadować istniejących rezerwacji');
      }
    };

    fetchExistingBookings();
  }, [officeId]);

  useEffect(() => {
    // Obliczanie ceny
    if (startDate && endDate && pricePerMonth) {
      const days = differenceInDays(endDate, startDate) + 1;
      const pricePerDay = (pricePerMonth * 12) / 365; // Dzienna stawka
      const calculatedPrice = Math.round(pricePerDay * days);
      setTotalPrice(calculatedPrice);
    }
  }, [startDate, endDate, pricePerMonth]);

  const isDateBooked = (date) => {
    return existingBookings.some(booking => {
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      return date >= bookingStart && date <= bookingEnd;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!officeId) {
      setError('Brak identyfikatora biura');
      return;
    }

    if (startDate > endDate) {
      setError('Data rozpoczęcia nie może być późniejsza niż data zakończenia');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Brak tokenu autoryzacji');
      }

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          office_id: officeId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          total_price: totalPrice
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Wystąpił błąd podczas rezerwacji');
      }

      setSuccess('Rezerwacja została utworzona pomyślnie!');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wyszarzanie dat w kalendarzu
  const filterDates = (date) => {
    return !existingBookings.some(booking => {
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      return date >= bookingStart && date <= bookingEnd;
    });
  };

  return (
    <div className="booking-form-container">
      <h3>Zarezerwuj: {officeName}</h3>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="booking-summary">
        <h4>Podsumowanie rezerwacji:</h4>
        {startDate && endDate && (
          <>
            <p>Okres rezerwacji: {differenceInDays(endDate, startDate) + 1} dni</p>
            <p className="total-price">Całkowita cena: {totalPrice} PLN</p>
          </>
        )}
      </div>

      <div className="existing-bookings">
        <h4>Dostępność biura:</h4>
        <div className="calendar-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Wybierz okres:</label>
              <div className="date-pickers">
                <div className="date-picker-wrapper">
                  <label>Od:</label>
                  <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    filterDate={filterDates}
                    dateFormat="dd/MM/yyyy"
                    locale="pl"
                    className="date-picker"
                    inline
                    calendarClassName="custom-calendar"
                  />
                </div>
                <div className="date-picker-wrapper">
                  <label>Do:</label>
                  <DatePicker
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    filterDate={filterDates}
                    dateFormat="dd/MM/yyyy"
                    locale="pl"
                    className="date-picker"
                    inline
                    calendarClassName="custom-calendar"
                  />
                </div>
              </div>
            </div>

            <div className="booking-info">
              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="legend-color available"></span>
                  <span>Dostępne</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color booked"></span>
                  <span>Zarezerwowane</span>
                </div>
              </div>

              <div className="existing-bookings-list">
                <h5>Aktualne rezerwacje:</h5>
                {existingBookings.length > 0 ? (
                  <ul>
                    {existingBookings.map((booking, index) => (
                      <li key={index}>
                        {new Date(booking.start_date).toLocaleDateString('pl-PL')} - {new Date(booking.end_date).toLocaleDateString('pl-PL')}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Brak aktualnych rezerwacji</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting || !officeId || !isAuthenticated || isDateBooked(startDate) || isDateBooked(endDate)}
            >
              {isSubmitting ? 'Przetwarzanie...' : `Zarezerwuj za ${totalPrice} PLN`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
