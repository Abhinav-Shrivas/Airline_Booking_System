import { useCallback, useEffect, useState } from 'react';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  cancelBooking,
  getUserBookings,
  refundBooking,
} from '../api/bookings';
import { getFlightById } from '../api/flights';
import { useColdStartLoading } from '../hooks/useColdStartLoading';
import { useToast } from '../context/ToastContext';
import { extractApiError } from '../utils/formatters';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [flights, setFlights] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();
  const isColdStart = useColdStartLoading();

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserBookings();
      setBookings(data);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    setActionLoading(true);
    try {
      await cancelBooking(bookingId);
      showToast('Booking cancelled', 'success');
      await loadBookings();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async (bookingId) => {
    if (!window.confirm('Cancel and request a refund for this booking?')) return;
    setActionLoading(true);
    try {
      await refundBooking(bookingId);
      showToast('Booking cancelled and refund processed', 'success');
      await loadBookings();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner message="Loading your bookings..." coldStart={isColdStart} />
      </div>
    );
  }

  return (
    <div className="page bookings-page">
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>View and manage your flight reservations.</p>
      </div>

      {error && <div className="empty-state error-state">{error}</div>}

      {!error && bookings.length === 0 && (
        <div className="empty-state">
          <h3>No bookings yet</h3>
          <p>Search for flights and book your first trip!</p>
        </div>
      )}

      <div className="bookings-list">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onCancel={handleCancel}
            onRefund={handleRefund}
            actionLoading={actionLoading}
          />
        ))}
      </div>
    </div>
  );
}
