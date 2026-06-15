import { flightAPI } from './axios';

export async function searchCities(query) {
  const { data } = await flightAPI.get('/api/v1/cities', {
    params: query ? { search: query } : {},
  });
  return data.data;
}

export async function searchFlights({ from, to, departureDate, noOfSeats, trip, returnDate, sort, moreFlights }) {
  const params = {
    from,
    to,
    departureDate,
    noOfSeats,
    trip: trip || 'one-way',
    sort: sort || 'price',
    moreFlights: moreFlights || 'no',
  };
  if (trip === 'round' && returnDate) {
    params.returnDate = returnDate;
  }
  const { data } = await flightAPI.get('/api/v1/flights', { params });
  return data.data;
}

export async function getFlightById(flightId) {
  const { data } = await flightAPI.get(`/api/v1/flights/${flightId}`);
  return data.data;
}
