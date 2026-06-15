import { bookingAPI } from './axios';

export async function createBooking(payload) {
  const { data } = await bookingAPI.post('/api/v1/bookings', payload);
  return data.data;
}

export async function getUserBookings() {
  const { data } = await bookingAPI.get('/api/v1/bookings');
  return data.data;
}

export async function getBookingById(bookingId) {
  const { data } = await bookingAPI.get(`/api/v1/bookings/${bookingId}`);
  return data.data;
}

export async function cancelBooking(bookingId) {
  const { data } = await bookingAPI.patch(`/api/v1/bookings/${bookingId}/cancel`);
  return data.data;
}

export async function refundBooking(bookingId) {
  const { data } = await bookingAPI.post(`/api/v1/bookings/${bookingId}/refund`);
  return data.data;
}

export async function initiatePayment(bookingId) {
  const { data } = await bookingAPI.post('/api/v1/payments', { bookingId });
  return data.data;
}

export async function getPaymentByBooking(bookingId) {
  const { data } = await bookingAPI.get(`/api/v1/payments/booking/${bookingId}`);
  return data.data;
}
