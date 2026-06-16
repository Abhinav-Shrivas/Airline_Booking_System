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
  onCancel,
  onRefund,
  actionLoading,
}) {
  const statusInfo = BOOKING_STATUS[booking.status] || {
    label: booking.status,
    className: 'status-default',
  };

  const outboundFlight = booking.flightSnapshot?.outbound;
  const returnFlight = booking.flightSnapshot?.return;

  const showPayNow = booking.status === 'INITIATED';
  const showCancel = booking.status === 'INITIATED';
  
  // A booking can be refunded if the FIRST flight (outbound) is > 24h away
  const showRefund =
    booking.status === 'CONFIRMED' &&
    outboundFlight &&
    canRefundBooking(outboundFlight.departureTime);

  return (
    <article className="booking-card">
      <div className="booking-card-header">
        <div>
          <h3>Booking #{booking.id}</h3>
          {outboundFlight && (
            <p className="booking-flight-meta">
              {outboundFlight.flightNo} · {getAirlineName(outboundFlight.flightNo)}
              {returnFlight && ` | ${returnFlight.flightNo} · ${getAirlineName(returnFlight.flightNo)}`}
            </p>
          )}
        </div>
        <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>
      </div>

      {outboundFlight ? (
        <div className="booking-details">
          <p>
            <strong>Outbound:</strong> {formatDate(outboundFlight.departureTime)} · {formatTime(outboundFlight.departureTime)} →{' '}
            {formatTime(outboundFlight.arrivalTime)}
          </p>
          {returnFlight && (
            <p>
              <strong>Return:</strong> {formatDate(returnFlight.departureTime)} · {formatTime(returnFlight.departureTime)} →{' '}
              {formatTime(returnFlight.arrivalTime)}
            </p>
          )}
          <p style={{ marginTop: '0.75rem' }}>
            {booking.noOfSeats} seat{booking.noOfSeats > 1 ? 's' : ''} ·{' '}
            <strong style={{ color: 'var(--color-primary)' }}>{formatPrice(booking.totalCost)}</strong>
          </p>
        </div>
      ) : (
        <p className="muted">Flight ID: {booking.outboundFlightId || booking.flightId}</p>
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
        {booking.status === 'CONFIRMED' && outboundFlight && !canRefundBooking(outboundFlight.departureTime) && (
          <span className="muted small">Cancellation not available within 24h of departure</span>
        )}
      </div>
    </article>
  );
}
