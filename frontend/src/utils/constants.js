export const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL;
export const FLIGHT_SERVICE_URL = import.meta.env.VITE_FLIGHT_SERVICE_URL;
export const BOOKING_SERVICE_URL = import.meta.env.VITE_BOOKING_SERVICE_URL;
export const NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL;

export const AIRLINE_PREFIXES = {
  AI: 'Air India',
  '6E': 'IndiGo',
  SG: 'SpiceJet',
};

export const BOOKING_STATUS = {
  INITIATED: { label: 'Pending payment', className: 'status-initiated' },
  PENDING: { label: 'Payment processing', className: 'status-pending' },
  CONFIRMED: { label: 'Confirmed ✓', className: 'status-confirmed' },
  CANCELLED: { label: 'Cancelled', className: 'status-cancelled' },
  EXPIRED: { label: 'Expired', className: 'status-expired' },
};

export const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'NET_BANKING', label: 'Net Banking' },
];

export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];
