import { flightAPI, bookingAPI, authAPI } from './axios';

// Cities
export async function createCity(data) {
  const response = await flightAPI.post('/api/v1/cities', data);
  return response.data.data;
}

export async function deleteCity(id) {
  const response = await flightAPI.delete(`/api/v1/cities/${id}`);
  return response.data.data;
}

export async function getAllCities() {
  const response = await flightAPI.get('/api/v1/cities');
  return response.data.data;
}

export async function updateCity(id, data) {
  const response = await flightAPI.patch(`/api/v1/cities/${id}`, data);
  return response.data.data;
}

// Airports
export async function createAirport(data) {
  const response = await flightAPI.post('/api/v1/airports', data);
  return response.data.data;
}

export async function deleteAirport(id) {
  const response = await flightAPI.delete(`/api/v1/airports/${id}`);
  return response.data.data;
}

export async function getAllAirports() {
  const response = await flightAPI.get('/api/v1/airports');
  return response.data.data;
}

export async function updateAirport(id, data) {
  const response = await flightAPI.patch(`/api/v1/airports/${id}`, data);
  return response.data.data;
}

// Airplanes
export async function createAirplane(data) {
  const response = await flightAPI.post('/api/v1/airplanes', data);
  return response.data.data;
}

export async function deleteAirplane(id) {
  const response = await flightAPI.delete(`/api/v1/airplanes/${id}`);
  return response.data.data;
}

export async function getAllAirplanes() {
  const response = await flightAPI.get('/api/v1/airplanes');
  return response.data.data;
}

export async function updateAirplane(id, data) {
  const response = await flightAPI.patch(`/api/v1/airplanes/${id}`, data);
  return response.data.data;
}

// Flights
export async function createFlight(data) {
  const response = await flightAPI.post('/api/v1/flights', data);
  return response.data.data;
}

export async function deleteFlight(id) {
  const response = await flightAPI.delete(`/api/v1/flights/${id}`);
  return response.data.data;
}

export async function getAllFlights() {
  const response = await flightAPI.get('/api/v1/flights/all');
  return response.data.data;
}

export async function updateFlight(id, data) {
  const response = await flightAPI.patch(`/api/v1/flights/${id}`, data);
  return response.data.data;
}

// Bookings
export async function adminCancelBooking(id) {
  const response = await bookingAPI.patch(`/api/v1/admin/bookings/${id}/cancel`);
  return response.data.data;
}

export async function adminRefundBooking(id) {
  const response = await bookingAPI.post(`/api/v1/admin/bookings/${id}/refund`);
  return response.data.data;
}

// Users
export async function getAllUsers() {
  const response = await authAPI.get('/api/v1/admin/users');
  return response.data.data;
}

export async function deleteUser(id) {
  const response = await authAPI.delete(`/api/v1/users/${id}`);
  return response.data.data;
}

export async function updateUserRole(email, roleName) {
  const response = await authAPI.patch('/api/v1/admin/updateRole', { email, roleName });
  return response.data.data;
}
