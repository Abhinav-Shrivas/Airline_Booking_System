import { Link } from 'react-router-dom';
import { BOOKING_STATUS } from '../utils/constants';
import {
  canRefundBooking,
  formatDate,
  formatPrice,
  formatTime,
  getAirlineName,
} from '../utils/formatters';

export default function BookingCard({
  booking,
  flight,
  onCancel,
  onRefund,
  actionLoading,
}) {
  const statusInfo = BOOKING_STATUS[booking.status] || {
    label: booking.status,
    className: 'status-default',
  };

  const showPayNow = booking.status === 'INITIATED';
  const showCancel = booking.status === 'INITIATED';
  const showRefund =
    booking.status === 'CONFIRMED' &&
    flight &&
    canRefundBooking(flight.departureTime);

  return (
    <article className="booking-card">
      <div className="booking-card-header">
        <div>
          <h3>Booking #{booking.id}</h3>
          {flight && (
            <p className="booking-flight-meta">
              {flight.flightNo} · {getAirlineName(flight.flightNo)}
            </p>
          )}
        </div>
        <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>
      </div>

      {flight ? (
        <div className="booking-details">
          <p>
            {formatDate(flight.departureTime)} · {formatTime(flight.departureTime)} →{' '}
            {formatTime(flight.arrivalTime)}
          </p>
          <p>
            {booking.noOfSeats} seat{booking.noOfSeats > 1 ? 's' : ''} ·{' '}
            {formatPrice(booking.totalCost)}
          </p>
        </div>
      ) : (
        <p className="muted">Flight ID: {booking.flightId}</p>
      )}

      {booking.passengers?.length > 0 && (
        <div className="booking-passengers">
          <strong>Passengers:</strong>{' '}
          {booking.passengers.map((p) => p.fullName || p.name).join(', ')}
        </div>
      )}

      <div className="booking-actions">
        {showPayNow && (
          <Link to={`/bookings/${booking.id}/pay`} className="btn btn-primary btn-sm">
            Pay Now
          </Link>
        )}
        {showCancel && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={actionLoading}
            onClick={() => onCancel(booking.id)}
          >
            Cancel
          </button>
        )}
        {showRefund && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={actionLoading}
            onClick={() => onRefund(booking.id)}
          >
            Cancel & Refund
          </button>
        )}
        {booking.status === 'CONFIRMED' && flight && !canRefundBooking(flight.departureTime) && (
          <span className="muted small">Cancellation not available within 24h of departure</span>
        )}
      </div>
    </article>
  );
}
