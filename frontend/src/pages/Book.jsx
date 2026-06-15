import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { createBooking } from '../api/bookings';
import { getFlightById } from '../api/flights';
import { useColdStartLoading } from '../hooks/useColdStartLoading';
import { useToast } from '../context/ToastContext';
import { GENDER_OPTIONS } from '../utils/constants';
import {
  extractApiError,
  formatDate,
  formatDuration,
  formatPrice,
  formatTime,
  getAirlineName,
} from '../utils/formatters';

function createEmptyPassenger() {
  return { fullName: '', age: '', gender: 'MALE' };
}

export default function Book() {
  const { flightId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isColdStart = useColdStartLoading();

  const noOfSeats = location.state?.passengers || 1;

  const [flight, setFlight] = useState(null);
  const [passengers, setPassengers] = useState(
    Array.from({ length: noOfSeats }, createEmptyPassenger)
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    async function loadFlight() {
      setLoading(true);
      try {
        const data = await getFlightById(flightId);
        setFlight(data);
      } catch (err) {
        setError(extractApiError(err));
      } finally {
        setLoading(false);
      }
    }
    loadFlight();
  }, [flightId]);

  const updatePassenger = (index, field, value) => {
    setPassengers((prev) =>
      prev.map((passenger, i) =>
        i === index ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        flightId: Number(flightId),
        noOfSeats,
        passengers: passengers.map((p) => ({
          fullName: p.fullName.trim(),
          age: Number(p.age),
        })),
      };

      const result = await createBooking(payload);
      setBooking(result);
      showToast('Booking created! Proceed to payment.', 'success');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner message="Loading flight details..." coldStart={isColdStart} />
      </div>
    );
  }

  if (error && !flight) {
    return (
      <div className="page">
        <div className="empty-state error-state">{error}</div>
        <Link to="/" className="btn btn-primary">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="page book-page">
      <div className="book-header card">
        <h1>Complete your booking</h1>
        {flight && (
          <div className="flight-summary">
            <p>
              <strong>{flight.flightNo}</strong> · {getAirlineName(flight.flightNo)}
            </p>
            <p>
              {formatDate(flight.departureTime)} ·{' '}
              {formatTime(flight.departureTime)} → {formatTime(flight.arrivalTime)} ·{' '}
              {flight.duration || formatDuration(flight.durationInMinutes)}
            </p>
            <p className="flight-summary-price">
              {formatPrice(flight.price * noOfSeats)} for {noOfSeats} passenger
              {noOfSeats > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {!booking ? (
        <form className="card passenger-form" onSubmit={handleSubmit}>
          <h2>Passenger details</h2>
          {passengers.map((passenger, index) => (
            <fieldset key={index} className="passenger-fieldset">
              <legend>Passenger {index + 1}</legend>
              <div className="passenger-grid">
                <div className="form-group">
                  <label htmlFor={`name-${index}`}>Full name</label>
                  <input
                    id={`name-${index}`}
                    type="text"
                    value={passenger.fullName}
                    onChange={(e) => updatePassenger(index, 'fullName', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`age-${index}`}>Age</label>
                  <input
                    id={`age-${index}`}
                    type="number"
                    min={0}
                    max={150}
                    value={passenger.age}
                    onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`gender-${index}`}>Gender</label>
                  <select
                    id={`gender-${index}`}
                    value={passenger.gender}
                    onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>
          ))}

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating booking...' : 'Confirm Booking'}
          </button>
        </form>
      ) : (
        <div className="card payment-prompt">
          <div className="success-icon">✓</div>
          <h2>Booking created</h2>
          <p>
            Booking #{booking.id} is ready. Total: {formatPrice(booking.totalCost)}
          </p>
          <p className="muted">Status: {booking.status}</p>
          <Link
            to={`/bookings/${booking.id}/pay`}
            className="btn btn-primary"
          >
            Proceed to Payment
          </Link>
        </div>
      )}
    </div>
  );
}
