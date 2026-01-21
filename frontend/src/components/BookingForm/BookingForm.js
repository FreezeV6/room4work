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
        const response = await fetch(`${API_BASE_URL}/api/bookings/office/${officeId}/`);
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
      const days = differenceInDays(endDate, startDate);
      const actualDays = days < 1 ? 1 : days;
      const pricePerDay = pricePerMonth / 30; // Dzienna stawka
      const calculatedPrice = Math.round(pricePerDay * actualDays);
      setTotalPrice(calculatedPrice);
    }
  }, [startDate, endDate, pricePerMonth]);

  // Normalizuje datę do początku dnia (bez czasu)
  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const isDateBooked = (date) => {
    if (!date) return false;
    const normalizedDate = normalizeDate(date);
    return existingBookings.some(booking => {
      if (booking.status === 'cancelled') return false;
      const bookingStart = normalizeDate(new Date(booking.start_date));
      const bookingEnd = normalizeDate(new Date(booking.end_date));
      return normalizedDate >= bookingStart && normalizedDate <= bookingEnd;
    });
  };

  // Sprawdza czy zakres dat koliduje z istniejącymi rezerwacjami
  const hasDateConflict = (start, end) => {
    if (!start || !end) return false;
    const normalizedStart = normalizeDate(start);
    const normalizedEnd = normalizeDate(end);
    return existingBookings.some(booking => {
      if (booking.status === 'cancelled') return false;
      const bookingStart = normalizeDate(new Date(booking.start_date));
      const bookingEnd = normalizeDate(new Date(booking.end_date));
      // Sprawdź czy zakresy się nakładają
      return normalizedStart <= bookingEnd && normalizedEnd >= bookingStart;
    });
  };

  // Sprawdza czy między dwiema datami jest jakaś zarezerwowana data
  const hasBookedDateInRange = (start, end) => {
    if (!start || !end) return false;
    const normalizedStart = normalizeDate(start);
    const normalizedEnd = normalizeDate(end);
    
    // Iteruj przez każdy dzień w zakresie
    const currentDate = new Date(normalizedStart);
    while (currentDate <= normalizedEnd) {
      if (isDateBooked(currentDate)) {
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return false;
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

    if (!startDate || !endDate) {
      setError('Proszę wybrać datę rozpoczęcia i zakończenia');
      return;
    }

    if (startDate > endDate) {
      setError('Data rozpoczęcia nie może być późniejsza niż data zakończenia');
      return;
    }

    // Sprawdź kolizję z istniejącymi rezerwacjami
    if (hasDateConflict(startDate, endDate) || hasBookedDateInRange(startDate, endDate)) {
      setError('Wybrany termin koliduje z istniejącą rezerwacją. Proszę wybrać inny termin.');
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

      const response = await fetch(`${API_BASE_URL}/api/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          office_id: officeId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.detail || data.message || data.non_field_errors?.[0] || 'Nie udało się utworzyć rezerwacji';
        throw new Error(errorMsg);
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

  // Znajduje najbliższą rezerwację po podanej dacie
  const getNextBookingStart = (fromDate) => {
    if (!fromDate) return null;
    const normalizedFrom = normalizeDate(fromDate);
    
    const futureBookings = existingBookings
      .filter(booking => {
        if (booking.status === 'cancelled') return false;
        const bookingStart = normalizeDate(new Date(booking.start_date));
        return bookingStart > normalizedFrom;
      })
      .map(booking => normalizeDate(new Date(booking.start_date)))
      .sort((a, b) => a - b);
    
    return futureBookings.length > 0 ? futureBookings[0] : null;
  };

  // Wyszarzanie dat w kalendarzu
  const filterDates = (date) => {
    const normalizedDate = normalizeDate(date);
    
    // Sprawdź czy data jest w istniejącej rezerwacji
    const isInExistingBooking = existingBookings.some(booking => {
      if (booking.status === 'cancelled') return false;
      const bookingStart = normalizeDate(new Date(booking.start_date));
      const bookingEnd = normalizeDate(new Date(booking.end_date));
      return normalizedDate >= bookingStart && normalizedDate <= bookingEnd;
    });
    
    if (isInExistingBooking) return false;
    
    // Jeśli startDate jest wybrana (ale nie endDate), zablokuj daty po najbliższej rezerwacji
    if (startDate && !endDate) {
      const nextBookingStart = getNextBookingStart(startDate);
      if (nextBookingStart && normalizedDate >= nextBookingStart) {
        return false;
      }
    }
    
    return true;
  };

  // Obsługa wyboru zakresu dat z walidacją
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setError('');
    
    // Jeśli wybieramy końcową datę, sprawdź czy w zakresie nie ma zarezerwowanych dat
    if (start && end) {
      if (hasBookedDateInRange(start, end)) {
        setError('Wybrany zakres zawiera już zarezerwowane dni. Proszę wybrać inny termin.');
        // Resetuj wybór
        setStartDate(start);
        setEndDate(null);
        return;
      }
    }
    
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="booking-form-container">
      <h3>Zarezerwuj: {officeName}</h3>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="existing-bookings">
        <h4>Wybierz termin rezerwacji:</h4>
        <div className="calendar-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="booking-layout">
              <div className="form-group">
                <div className="date-pickers">
                  <div className="date-picker-wrapper single-calendar">
                    <DatePicker
                      selected={startDate}
                      onChange={handleDateChange}
                      startDate={startDate}
                      endDate={endDate}
                      selectsRange
                      minDate={new Date()}
                      filterDate={filterDates}
                      dateFormat="dd.MM.yyyy"
                      locale="pl"
                      className="date-picker"
                      inline
                      calendarClassName="custom-calendar"
                      monthsShown={2}
                    />
                  </div>
                </div>
              </div>

              <div className="booking-summary">
                <h4>Podsumowanie rezerwacji</h4>
                <div className="summary-row">
                  <span className="summary-label">Data rozpoczęcia:</span>
                  <span className="summary-value">{startDate ? startDate.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.') : '—'}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Data zakończenia:</span>
                  <span className="summary-value">{endDate ? endDate.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.') : '—'}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Okres rezerwacji:</span>
                  <span className="summary-value">{startDate && endDate ? `${differenceInDays(endDate, startDate) < 1 ? 1 : differenceInDays(endDate, startDate)} dni` : '—'}</span>
                </div>
                <div className="summary-row total">
                  <span className="summary-label">Szacowana cena:</span>
                  <span className="summary-value">{startDate && endDate ? `${totalPrice} PLN` : '—'}</span>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting || !officeId || !isAuthenticated || !startDate || !endDate || isDateBooked(startDate) || isDateBooked(endDate)}
                >
                  {isSubmitting ? 'Przetwarzanie...' : startDate && endDate ? `Zarezerwuj za ${totalPrice} PLN` : 'Wybierz daty'}
                </button>
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
                <h5>Nadchodzące rezerwacje:</h5>
                {existingBookings.filter(booking => 
                  booking.status !== 'cancelled' && 
                  new Date(booking.end_date) >= new Date()
                ).length > 0 ? (
                  <ul>
                    {existingBookings
                      .filter(booking => 
                        booking.status !== 'cancelled' && 
                        new Date(booking.end_date) >= new Date()
                      )
                      .map((booking, index) => (
                      <li key={index}>
                        {new Date(booking.start_date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')} - {new Date(booking.end_date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Brak nadchodzących rezerwacji</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
