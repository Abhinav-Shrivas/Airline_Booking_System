import { AIRLINE_PREFIXES } from './constants';

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function getAirlineName(flightNo) {
  if (!flightNo) return '';
  const prefix = flightNo.split('-')[0];
  return AIRLINE_PREFIXES[prefix] || prefix;
}

export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function getMinSearchDate() {
  return '2026-10-01';
}

export function getDefaultSearchDate() {
  return '2026-10-15';
}

export function extractApiError(error) {
  const data = error.response?.data;
  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;
  if (typeof data?.error === 'string') return data.error;
  return error.message || 'Something went wrong';
}

export function canRefundBooking(flightDepartureTime) {
  if (!flightDepartureTime) return false;
  const timeUntilDeparture = new Date(flightDepartureTime) - new Date();
  return timeUntilDeparture >= 24 * 60 * 60 * 1000;
}

export function getCityName(flight, type) {
  const airport = type === 'departure' ? flight?.departureAirport : flight?.arrivalAirport;
  return airport?.City?.name || airport?.name || '—';
}
