import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  formatDuration,
  formatPrice,
  formatTime,
  getAirlineName,
  getCityName,
} from '../utils/formatters';

export default function FlightCard({ flight, passengers = 1 }) {
  const { isAuthenticated } = useAuth();
  const displayPrice = flight.totalPrice ?? flight.price * passengers;
  const urgentSeats = flight.totalSeatsLeft < 10;

  return (
    <article className="flight-card">
      <div className="flight-card-header">
        <div>
          <span className="flight-number">{flight.flightNo}</span>
          <span className="flight-airline">{getAirlineName(flight.flightNo)}</span>
        </div>
        <div className="flight-price">{formatPrice(displayPrice)}</div>
      </div>

      <div className="flight-route">
        <div className="flight-time-block">
          <span className="flight-time">
            {flight.departureTimeFormatted || formatTime(flight.departureTime)}
          </span>
          <span className="flight-city">{getCityName(flight, 'departure')}</span>
        </div>

        <div className="flight-duration-line">
          <span className="flight-duration">
            {flight.duration || formatDuration(flight.durationInMinutes)}
          </span>
        </div>

        <div className="flight-time-block text-right">
          <span className="flight-time">
            {flight.arrivalTimeFormatted || formatTime(flight.arrivalTime)}
          </span>
          <span className="flight-city">{getCityName(flight, 'arrival')}</span>
        </div>
      </div>

      <div className="flight-card-footer">
        <div>
          {urgentSeats && (
            <span className="seats-urgent">
              Only {flight.totalSeatsLeft} seats left!
            </span>
          )}
          {!urgentSeats && (
            <span className="seats-normal">{flight.totalSeatsLeft} seats left</span>
          )}
        </div>

        {isAuthenticated ? (
          <Link
            to={`/book/${flight.id}`}
            state={{ passengers }}
            className="btn btn-primary btn-sm"
          >
            Book
          </Link>
        ) : (
          <span className="tooltip-wrapper">
            <button type="button" className="btn btn-primary btn-sm" disabled>
              Book
            </button>
            <span className="tooltip">Login to book</span>
          </span>
        )}
      </div>
    </article>
  );
}
