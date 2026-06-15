import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { getBookingById, initiatePayment } from '../api/bookings';
import { getFlightById } from '../api/flights';
import { useColdStartLoading } from '../hooks/useColdStartLoading';
import { useToast } from '../context/ToastContext';
import { PAYMENT_METHODS } from '../utils/constants';
import {
  extractApiError,
  formatDate,
  formatPrice,
  formatTime,
  getAirlineName,
} from '../utils/formatters';

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isColdStart = useColdStartLoading();

  const [booking, setBooking] = useState(null);
  const [flight, setFlight] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const bookingData = await getBookingById(bookingId);
        setBooking(bookingData);

        if (bookingData.flightId) {
          const flightData = await getFlightById(bookingData.flightId);
          setFlight(flightData);
        }
      } catch (err) {
        setError(extractApiError(err));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bookingId]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    setError('');

    try {
      const result = await initiatePayment(Number(bookingId));
      setPaymentResult(result);

      if (result.status === 'SUCCESS') {
        showToast('Payment successful!', 'success');
      } else {
        showToast('Payment failed. Please try again.', 'error');
      }
    } catch (err) {
      setError(extractApiError(err));
      showToast(extractApiError(err), 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner message="Loading booking..." coldStart={isColdStart} />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="page">
        <div className="empty-state error-state">{error}</div>
        <Link to="/bookings" className="btn btn-primary">
          My Bookings
        </Link>
      </div>
    );
  }

  if (paymentResult?.status === 'SUCCESS') {
    return (
      <div className="page payment-page">
        <div className="card payment-success">
          <div className="success-animation">✓</div>
          <h1>Booking Confirmed!</h1>
          <p>Transaction ID: {paymentResult.transactionId}</p>
          <p>Amount paid: {formatPrice(paymentResult.amount)}</p>
          <p className="email-note">
            A confirmation email will arrive shortly.
          </p>
          <div className="payment-success-actions">
            <Link to="/bookings" className="btn btn-primary">
              View My Bookings
            </Link>
            <Link to="/" className="btn btn-outline">
              Book another flight
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentResult?.status === 'FAILED') {
    return (
      <div className="page payment-page">
        <div className="card payment-failed">
          <h1>Payment Failed</h1>
          <p>Your payment could not be processed. Please try again.</p>
          <div className="payment-success-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPaymentResult(null)}
            >
              Retry Payment
            </button>
            <Link to="/bookings" className="btn btn-outline">
              My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (booking?.status !== 'INITIATED') {
    return (
      <div className="page payment-page">
        <div className="card">
          <h1>Payment not available</h1>
          <p>This booking is in &quot;{booking?.status}&quot; status.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/bookings')}>
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page payment-page">
      <div className="payment-grid">
        <div className="card">
          <h1>Payment</h1>
          <p className="muted">Mock payment gateway — no real charges.</p>

          <form onSubmit={handlePayment} className="payment-form">
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment method</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-full" disabled={paying}>
              {paying ? 'Processing...' : `Pay ${formatPrice(booking.totalCost)}`}
            </button>
          </form>
        </div>

        <div className="card booking-summary">
          <h2>Booking summary</h2>
          <p>Booking #{booking.id}</p>
          {flight && (
            <>
              <p>
                {flight.flightNo} · {getAirlineName(flight.flightNo)}
              </p>
              <p>
                {formatDate(flight.departureTime)} · {formatTime(flight.departureTime)}
              </p>
            </>
          )}
          <p>
            {booking.noOfSeats} seat{booking.noOfSeats > 1 ? 's' : ''}
          </p>
          {booking.passengers?.length > 0 && (
            <ul className="summary-passengers">
              {booking.passengers.map((p) => (
                <li key={p.id || p.fullName}>{p.fullName}</li>
              ))}
            </ul>
          )}
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(booking.totalCost)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
