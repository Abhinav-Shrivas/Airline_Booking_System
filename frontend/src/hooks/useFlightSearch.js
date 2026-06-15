import { useCallback, useState } from 'react';
import { searchFlights as searchFlightsApi } from '../api/flights';
import { extractApiError } from '../utils/formatters';

export function useFlightSearch() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const searchFlights = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const results = await searchFlightsApi(params);
      // For one-way: results is an array
      // For round trip: results is { outboundFlights: [], returnFlights: [] }
      setFlights(results || []);
    } catch (err) {
      setError(extractApiError(err));
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { flights, loading, error, searched, searchFlights };
}
