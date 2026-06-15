# Cursor Prompt — SkyBooker React Frontend

Copy everything below and paste it into Cursor as your initial prompt.

---

## Prompt Start

Build a minimal, clean React frontend (Vite + React 18) for an existing airline booking backend. The design should feel like a simplified Google Flights — clean, functional, and focused on the core booking flow. Use React Router for navigation, Axios for API calls, and vanilla CSS (or CSS modules) for styling. No UI library (no MUI, no Ant Design). Dark/light mode is not needed — keep it clean and light.

### Backend API Base URLs

The backend is a microservices architecture with 4 separate services. All APIs return JSON in the format `{ success: true, data: ..., message: "..." }` or `{ success: false, error: { ... } }`.

```
AUTH_SERVICE_URL    = https://airline-auth-service.onrender.com
FLIGHT_SERVICE_URL  = https://flight-service-ndxd.onrender.com
BOOKING_SERVICE_URL = https://airline-booking-service-3iug.onrender.com
```

> **IMPORTANT:** These are deployed on Render free tier. First request takes ~30-50 seconds (cold start). Show a loading state that says "Waking up server... this may take 30 seconds on first load" when the first API call is pending.

---

### Authentication Flow

The backend uses JWT access tokens (short-lived, 15 min) + refresh tokens (HttpOnly cookie, 7 days). The refresh token is set as an HttpOnly cookie by the backend — you never see or store it in JS.

**Endpoints:**

```
POST /api/v1/auth/register
Body: { name, email, password }
Response: { success: true, data: { id, name, email } }

POST /api/v1/auth/login
Body: { email, password }
Response: { success: true, data: { accessToken, user: { id, name, email, roles: ["USER"] } } }
Set-Cookie: refreshToken=... (HttpOnly, sent automatically)

POST /api/v1/auth/refresh
No body needed — browser sends the HttpOnly cookie automatically
Response: { success: true, data: { accessToken } }

POST /api/v1/auth/logout
No body — uses the cookie
Response: { success: true }

GET /api/v1/auth/google
Redirects to Google OAuth — just link to this URL. After OAuth, backend redirects back with tokens.
```

**How to handle auth in React:**
- Store `accessToken` in memory (React state/context), NOT localStorage
- On every API call, send `Authorization: Bearer <accessToken>` header
- Set `withCredentials: true` on Axios so the browser sends the HttpOnly refresh cookie
- When a request returns 401, call `/api/v1/auth/refresh` to get a new access token, then retry the original request
- Create an Axios interceptor for this automatic refresh logic

**Auth context should expose:** `user`, `accessToken`, `login()`, `register()`, `logout()`, `isAuthenticated`, `isLoading`

---

### Pages & Features

#### 1. Landing / Flight Search Page (Home — `/`)

Google Flights-style search bar with:
- **From city** — autocomplete dropdown. Call `GET /api/v1/cities?search=<query>` on the Flight Service. Returns `{ data: [{ id, name }] }`. The search is case-insensitive (typing "d" returns "Delhi").
- **To city** — same autocomplete
- **Date** — date picker
- **Passengers** — number input (1-6)
- **Search button**

After the user selects cities, you need the airport IDs for those cities. Call:
```
GET /api/v1/airports?city_id=<cityId>
Response: { data: [{ id, name, address, city_id }] }
```

Then search flights:
```
GET /api/v1/flights?departure_airport_id=<id>&arrival_airport_id=<id>&departureTime=<YYYY-MM-DD>&totalSeatsLeft=<passengers>
Response: { data: [{ id, flightNo, price, departureTime, arrivalTime, durationInMinutes, totalSeatsLeft, boardingGate, status, departureAirport: { name, City: { name } }, arrivalAirport: { name, City: { name } } }] }
```

**Search results** — show as cards/list:
- Flight number, airline prefix (AI = Air India, 6E = IndiGo, SG = SpiceJet)
- Departure → Arrival times
- Duration
- Price (₹)
- Seats left (show urgency if < 10: "Only 3 seats left!")
- "Book" button (disabled if not logged in — show tooltip "Login to book")

#### 2. Auth Pages (`/login`, `/register`)

Simple forms. After login/register, redirect to the page the user came from (or home).

- Login: email + password fields + "Login with Google" button (links to `AUTH_SERVICE_URL/api/v1/auth/google`)
- Register: name + email + password fields
- Show validation errors from API response

#### 3. Booking Page (`/book/:flightId`)

Protected route (redirect to /login if not authenticated).

Show flight details at the top (re-fetch from `GET /api/v1/flights/<flightId>` on Flight Service).

Passenger form:
- For each passenger (based on noOfSeats), show: name, age, gender (MALE/FEMALE/OTHER) fields
- "Confirm Booking" button

```
POST /api/v1/bookings  (Booking Service)
Headers: Authorization: Bearer <accessToken>
Body: {
  flightId: <number>,
  noOfSeats: <number>,
  passengers: [{ name, age, gender }, ...]
}
Response: { data: { id, flightId, userId, noOfSeats, totalCost, status: "INITIATED", passengers: [...] } }
```

After booking creation, immediately show a "Proceed to Payment" section.

#### 4. Payment Page (`/bookings/:bookingId/pay`)

Show booking summary (flight, passengers, total cost). 

Since this is a mock payment gateway, show a simple form:
- Payment method dropdown: CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING
- A "Pay ₹{amount}" button

```
POST /api/v1/payments  (Booking Service)
Headers: Authorization: Bearer <accessToken>
Body: {
  bookingId: <number>,
  amount: <number>,
  paymentMethod: "CREDIT_CARD",
  gateway: "MOCK_GATEWAY"
}
Response: { data: { id, bookingId, amount, status: "SUCCESS"|"FAILED", transactionId, paidAt } }
```

If payment succeeds → show success animation + booking confirmed screen. The backend also sends a confirmation email via RabbitMQ (mention this to the user: "A confirmation email will arrive shortly").

If payment fails → show error + option to retry.

#### 5. My Bookings Page (`/bookings`)

Protected route.

```
GET /api/v1/bookings  (Booking Service)
Headers: Authorization: Bearer <accessToken>
Response: { data: [{ id, flightId, noOfSeats, totalCost, status, bookedAt, passengers: [...] }] }
```

Show bookings as cards with status badges:
- INITIATED (yellow) — "Pending payment"
- PENDING (orange) — "Payment processing"
- CONFIRMED (green) — "Confirmed ✓"
- CANCELLED (red) — "Cancelled"
- EXPIRED (gray) — "Expired"

Each booking card should show:
- Flight details (you'll need to fetch flight info: `GET /api/v1/flights/<flightId>` from Flight Service)
- Booking status
- Passenger names
- Total cost
- Action buttons based on status:
  - INITIATED → "Pay Now" + "Cancel"
  - CONFIRMED → "Cancel & Refund" (if > 24h before departure)
  - CANCELLED/EXPIRED → no actions

**Cancel booking (pre-payment):**
```
PATCH /api/v1/bookings/<id>/cancel  (Booking Service)
Headers: Authorization: Bearer <accessToken>
```

**Cancel with refund (post-payment, confirmed bookings):**
```
POST /api/v1/bookings/<id>/refund  (Booking Service)
Headers: Authorization: Bearer <accessToken>
```

#### 6. Navbar

- Logo/brand "SkyBooker" (links to home)
- If logged in: "My Bookings" link + user name + "Logout" button
- If not logged in: "Login" + "Register" buttons

---

### Important Implementation Details

1. **CORS:** All API calls must use `withCredentials: true` because the refresh token is in an HttpOnly cookie. The backend allows credentials from the frontend origin.

2. **Axios instance:** Create one Axios instance per service:
```javascript
const authAPI = axios.create({ baseURL: AUTH_SERVICE_URL, withCredentials: true });
const flightAPI = axios.create({ baseURL: FLIGHT_SERVICE_URL, withCredentials: true });
const bookingAPI = axios.create({ baseURL: BOOKING_SERVICE_URL, withCredentials: true });
```

3. **Token refresh interceptor:** Add a response interceptor on all Axios instances. If response is 401, call `authAPI.post('/api/v1/auth/refresh')` to get a new access token, update it in context, and retry the failed request.

4. **Environment variables:** Use `.env` file:
```
VITE_AUTH_SERVICE_URL=https://airline-auth-service.onrender.com
VITE_FLIGHT_SERVICE_URL=https://flight-service-ndxd.onrender.com
VITE_BOOKING_SERVICE_URL=https://airline-booking-service-3iug.onrender.com
```

5. **No admin panel needed.** This is a user-facing frontend only. Admin operations stay in Swagger.

6. **Pre-seeded data:** The database has 28 flights (Oct–Nov 2026), 6 major Indian cities (Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata), and more. The flight search will return real data.

7. **Responsive design:** Should work on desktop and mobile. Use CSS Grid/Flexbox.

---

### Design Guidelines

- **Color palette:** Use a clean airline-inspired palette — white background, navy/dark blue primary (#1a365d), accent sky blue (#3182ce), success green, warning amber, error red
- **Typography:** Use Inter or system fonts
- **Cards:** Rounded corners, subtle shadows, clean spacing
- **Loading states:** Skeleton loaders or spinners for every API call
- **Empty states:** Show helpful messages when no flights found or no bookings yet
- **Toast notifications:** For success/error feedback (booking confirmed, payment failed, etc.)
- Keep it minimal — no unnecessary animations, no heavy graphics. Think Google Flights simplicity.

---

### Project Structure

```
src/
├── api/             # Axios instances and API functions
├── components/      # Reusable components (Navbar, FlightCard, BookingCard, etc.)
├── context/         # AuthContext
├── hooks/           # useAuth, useFlightSearch, etc.
├── pages/           # Home, Login, Register, Book, Payment, MyBookings
├── styles/          # CSS files
├── utils/           # Helpers (format date, format price, etc.)
└── App.jsx          # Router setup
```

Build this step by step: Auth context first → Login/Register → Flight search → Booking → Payment → My Bookings.
