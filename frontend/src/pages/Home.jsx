import { useState, useRef } from 'react';
import CityAutocomplete from '../components/CityAutocomplete';
import FlightCard from '../components/FlightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useColdStartLoading } from '../hooks/useColdStartLoading';
import { useFlightSearch } from '../hooks/useFlightSearch';
import { getDefaultSearchDate, getMinSearchDate } from '../utils/formatters';

export default function Home() {
  const [fromCity, setFromCity] = useState(null);
  const [toCity, setToCity] = useState(null);
  const [date, setDate] = useState(getDefaultSearchDate());
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState('one-way');
  const [sortBy, setSortBy] = useState('price');
  const [moreFlights, setMoreFlights] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { flights, loading, error, searched, searchFlights } = useFlightSearch();
  const isColdStart = useColdStartLoading();
  const lastSearchRef = useRef(null);

  const buildSearchParams = (overrides = {}) => ({
    from: fromCity?.id,
    to: toCity?.id,
    departureDate: date,
    noOfSeats: passengers,
    trip: tripType,
    returnDate: tripType === 'round' ? returnDate : undefined,
    sort: sortBy,
    moreFlights: moreFlights ? 'yes' : 'no',
    ...overrides,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!fromCity) {
      setValidationError('Please select a departure city');
      return;
    }
    if (!toCity) {
      setValidationError('Please select an arrival city');
      return;
    }
    if (fromCity.id === toCity.id) {
      setValidationError('Departure and arrival cities must be different');
      return;
    }
    if (tripType === 'round' && !returnDate) {
      setValidationError('Please select a return date');
      return;
    }
    if (tripType === 'round' && returnDate <= date) {
      setValidationError('Return date must be after departure date');
      return;
    }

    const params = buildSearchParams();
    lastSearchRef.current = params;
    searchFlights(params);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    if (lastSearchRef.current) {
      const params = { ...lastSearchRef.current, sort: newSort };
      lastSearchRef.current = params;
      searchFlights(params);
    }
  };

  const handleShowMore = () => {
    setMoreFlights(true);
    if (lastSearchRef.current) {
      const params = { ...lastSearchRef.current, moreFlights: 'yes' };
      lastSearchRef.current = params;
      searchFlights(params);
    }
  };

  // For round trip, backend returns { outboundFlights, returnFlights }
  // For one-way, it returns an array
  const isRoundTrip = tripType === 'round' && flights && !Array.isArray(flights);
  const outboundFlights = isRoundTrip ? (flights.outboundFlights || []) : (Array.isArray(flights) ? flights : []);
  const returnFlightsList = isRoundTrip ? (flights.returnFlights || []) : [];

  const hasResults = isRoundTrip
    ? (outboundFlights.length > 0 || returnFlightsList.length > 0)
    : outboundFlights.length > 0;

  // Show "Show more" only when we got exactly 5 results (the default limit) and haven't expanded yet
  const showMoreButton = !moreFlights && hasResults && !isRoundTrip && outboundFlights.length === 5;

  return (
    <div className="page home-page">
      <section className="hero">
        <h1>Find your next flight</h1>
        <p>Search flights across major Indian cities — simple, fast, and reliable.</p>
      </section>

      <form className="search-form card" onSubmit={handleSearch}>
        <div className="trip-toggle">
          <button
            type="button"
            className={`trip-btn ${tripType === 'one-way' ? 'active' : ''}`}
            onClick={() => { setTripType('one-way'); setReturnDate(''); }}
          >
            One Way
          </button>
          <button
            type="button"
            className={`trip-btn ${tripType === 'round' ? 'active' : ''}`}
            onClick={() => setTripType('round')}
          >
            Round Trip
          </button>
        </div>

        <div className="search-grid">
          <CityAutocomplete
            label="From"
            value={fromCity}
            onChange={setFromCity}
            placeholder="Departure city"
          />
          <CityAutocomplete
            label="To"
            value={toCity}
            onChange={setToCity}
            placeholder="Arrival city"
          />
          <div className="form-group">
            <label htmlFor="date">Departure</label>
            <input
              id="date"
              type="date"
              value={date}
              min={getMinSearchDate()}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {tripType === 'round' && (
            <div className="form-group">
              <label htmlFor="returnDate">Return</label>
              <input
                id="returnDate"
                type="date"
                value={returnDate}
                min={date || getMinSearchDate()}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="passengers">Passengers</label>
            <input
              id="passengers"
              type="number"
              min={1}
              max={6}
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
            />
          </div>
        </div>

        {validationError && <p className="form-error">{validationError}</p>}

        <button type="submit" className="btn btn-primary btn-search" disabled={loading}>
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </form>

      <section className="results-section">
        {loading && (
          <LoadingSpinner message="Searching flights..." coldStart={isColdStart} />
        )}

        {!loading && error && <div className="empty-state error-state">{error}</div>}

        {!loading && !error && searched && !hasResults && (
          <div className="empty-state">
            <h3>No flights found</h3>
            <p>Try different cities or dates. Sample data covers Oct–Nov 2026.</p>
          </div>
        )}

        {!loading && hasResults && (
          <div className="results-list">
            {/* Sort controls */}
            <div className="results-header">
              <h2>
                {isRoundTrip
                  ? `${outboundFlights.length} outbound · ${returnFlightsList.length} return`
                  : `${outboundFlights.length} flight${outboundFlights.length !== 1 ? 's' : ''} found`}
              </h2>
              <div className="sort-controls">
                <span className="sort-label">Sort by:</span>
                <button
                  type="button"
                  className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
                  onClick={() => handleSortChange('price')}
                  disabled={loading}
                >
                  Price
                </button>
                <button
                  type="button"
                  className={`sort-btn ${sortBy === 'duration' ? 'active' : ''}`}
                  onClick={() => handleSortChange('duration')}
                  disabled={loading}
                >
                  Duration
                </button>
              </div>
            </div>

            {isRoundTrip ? (
              <>
                <h3 className="section-subtitle">Outbound</h3>
                {outboundFlights.length > 0 ? (
                  outboundFlights.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} passengers={passengers} />
                  ))
                ) : (
                  <p className="muted">No outbound flights found for this date.</p>
                )}

                <h3 className="section-subtitle" style={{ marginTop: '2rem' }}>Return</h3>
                {returnFlightsList.length > 0 ? (
                  returnFlightsList.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} passengers={passengers} />
                  ))
                ) : (
                  <p className="muted">No return flights found for this date.</p>
                )}
              </>
            ) : (
              <>
                {outboundFlights.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} passengers={passengers} />
                ))}
              </>
            )}

            {/* Show more button */}
            {showMoreButton && (
              <button
                type="button"
                className="btn btn-outline btn-show-more"
                onClick={handleShowMore}
                disabled={loading}
              >
                Show all flights
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
