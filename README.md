# SkyBooker — Airline Booking Full-Stack Application

An airline booking backend built with Node.js microservices, featuring RabbitMQ-based event-driven communication, Saga-driven distributed transactions, Redis caching with graceful degradation, Google OAuth, RBAC, and Dockerized deployment on Render.

---

## Table of Contents

1. [Overview](#overview)
2. [Live Demo](#live-demo)
3. [Features](#features)
4. [Architecture Diagram](#architecture-diagram)
5. [Tech Stack](#tech-stack)
6. [Database Schema](#database-schema)
7. [Key Design Decisions](#key-design-decisions)
8. [Booking Lifecycle](#booking-lifecycle)
9. [Transaction Management](#transaction-management)
10. [Authorization & RBAC](#authorization--rbac)
11. [OTP & Password Reset Flow](#otp--password-reset-flow)
12. [Internal Service Communication](#internal-service-communication)
13. [Caching Strategy](#caching-strategy)
14. [API Documentation](#api-documentation)
15. [Testing](#testing)
16. [Local Setup](#local-setup)
17. [Project Structure](#project-structure)
18. [Deployment](#deployment)

---

## Overview

SkyBooker is a microservices-based airline booking system that implements a complete booking lifecycle—from flight search and reservation to payment processing and email notifications—across four independent services:

- **Flight search** returns results in under 50ms on cache hits. The cache-aside pattern with Redis reduces database load by serving repeated queries from memory with a 5-minute TTL. If Redis goes down, the service continues working by falling back to direct database queries — no outage, just slower responses.
- **Booking** follows a stateful lifecycle (`INITIATED → PENDING → CONFIRMED → CANCELLED`). Seat counts are locked on booking creation and automatically released on cancellation or expiry. A cron job runs every 5 minutes to expire unpaid bookings.
- **Authentication** supports both email/password and Google OAuth 2.0. Sessions use rolling refresh tokens stored in the database (not localStorage). OTP-based password reset stores codes in Redis with a 2-minute TTL and a maximum of 5 attempts.
- **Notifications** are fully event-driven via RabbitMQ. Booking confirmations, cancellations, registration emails, and departure reminders (24h before flight) are published as events and consumed asynchronously — the user never waits for an email to be sent.

---

## Live Demo

> Services are hosted on Render's free tier — first request on homepage or api-docs may take ~30-50s to wake up (cold start).

> Refer [API DOCUMENTATION](#api-documentation) for sample flight and user(admin) data.
### Frontend Links
> [!NOTE]
> **Desktop Experience:** The frontend UI, particularly the admin dashboard and flight booking flow, is designed to showcase complex data. For the best viewing experience, please use a desktop or laptop screen rather than a mobile device.

- **Primary Domain:** [https://www.skybooker.xyz](https://www.skybooker.xyz)
- **Redirect Domain:** [https://skybooker.xyz](https://skybooker.xyz)
- **Vercel Backup:** [https://airline-booking-system-orcin.vercel.app](https://airline-booking-system-orcin.vercel.app)

### Backend API Docs
> [!NOTE]
> **Email delivery:** The Auth Service automatically pings the Notification Service on startup. However, if emails don't arrive immediately after your first action, wait ~30 seconds and retry — the Notification Service may still be waking up from a cold start.

| Service | Swagger Docs |
|---|---|
| Auth Service | [API Docs](https://airline-auth-service.onrender.com/api-docs) |
| Flight Service | [API Docs](https://flight-service-ndxd.onrender.com/api-docs) |
| Booking Service | [API Docs](https://airline-booking-service-3iug.onrender.com/api-docs) |
| Notification Service | [API Docs](https://airline-notification-service-k2pv.onrender.com/api-docs) |

**Admin test credentials** (for testing admin-only routes like flight management, user role assignment, and force-cancel bookings):
```
Email:     admin@airline.com
Password:  Admin@123
```

---

## Features

- **Microservices architecture** — 4 independent services, each with its own database and Swagger docs
- **Event-driven notifications** — RabbitMQ pub/sub for async email delivery (booking, cancellation, reminders)
- **Saga pattern** — Compensating transactions for cross-service seat reservation rollbacks
- **Redis caching** — Cache-aside with graceful degradation; sub-50ms flight search on cache hits
- **Persistent sessions with expiry extension** — HttpOnly secure cookies with sliding expiration and multi-device session limits
- **Google OAuth 2.0** — One-click login alongside email/password with OTP-based password reset
- **Role-based access control** — USER, ADMIN, AIRLINE_STAFF roles with middleware-enforced route guards
- **Internal API security** — Service-to-service calls authenticated via shared `x-internal-api-key` header
- **Booking lifecycle** — Full state machine (INITIATED → PENDING → CONFIRMED → CANCELLED/EXPIRED)
- **Auto-expiry cron** — Unpaid bookings expire after 10 minutes; seats auto-restored
- **Dual email provider** — Auto-switches between Nodemailer (local) and Resend (cloud) based on environment
- **React SPA integration** — Admin dashboard, flight search with round-trip support, and seamless responsive UI
- **Dockerized deployment** — Docker Compose for local dev; Render for production with CI/CD on push

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Client (Swagger UI)                                │
└────────┬──────────────┬───────────────────┬──────────────────┬──────────────────┘
         │              │                   │                  │
         ▼              ▼                   ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    Auth     │  │   Flight    │  │     Booking      │  │  Notification    │
│   Service   │  │   Service   │  │     Service      │  │    Service       │
│   :5001     │  │   :5000     │  │     :5003        │  │    :5004         │
│             │  │             │  │                  │  │                  │
│ • Register  │  │ • Search    │  │ • Create booking │  │ • RabbitMQ       │
│ • Login     │  │   flights   │  │ • Process payment│  │   consumers      │
│ • OAuth 2.0 │  │ • CRUD      │  │ • Cancel/Refund  │  │ • Email dispatch │
│ • OTP reset │  │   airports  │  │ • Auto-expire    │  │ • Departure      │
│ • Sessions  │  │ • Redis     │  │   cron job       │  │   reminder cron  │
│ • RBAC      │  │   caching   │  │                  │  │                  │
└──────┬──────┘  └──────┬──────┘  └────────┬─────────┘  └────────┬─────────┘
       │                │                  │                     │
       │                │          REST ───┘                     │
       │                │    (seat check,                        │
       │                │     price verify)                      │
       │                │                                        │
       ▼                ▼                                        ▼
┌─────────────────────────────────┐    ┌──────────────────────────────────┐
│        PostgreSQL 16            │    │          RabbitMQ 3              │
│  ┌──────────┐  ┌──────────┐     │    │                                  │
│  │ Auth DB  │  │Flight DB │     │    │  Exchanges:                      │
│  │ Users    │  │ Flights  │     │    │  • booking_exchange (direct)     │
│  │ Roles    │  │ Airports │     │    │  • auth_exchange (direct)        │
│  │ Sessions │  │ Airplanes│     │    │                                  │
│  │ user_roles│ │ Cities   │     │    │  Events published:               │
│  └──────────┘  └──────────┘     │    │  • booking.confirmed             │
│  ┌──────────┐  ┌──────────┐     │    │  • booking.cancelled             │
│  │Booking DB│  │Notif DB  │     │    │  • booking.expired               │
│  │ Bookings │  │Notifica- │     │    │  • booking.refunded              │
│  │ Payments │  │  tions   │     │    │  • register.successful           │
│  │Passengers│  │          │     │    │                                  │
│  └──────────┘  └──────────┘     │    │  Notification service consumes   │
└─────────────────────────────────┘    │  all events → sends emails       │
                                       └──────────────────────────────────┘
┌─────────────────────────────────┐
│            Redis 7              │
│                                 │
│  Used by Auth Service:          │
│  • otp:{email}    2 min TTL     │
│    Stores OTP code + attempt    │
│    count for password reset     │
│                                 │
│  Used by Flight Service:        │
│  • flight:from=1&to=2&...       │
│    5 min TTL — cache-aside      │
│    pattern with graceful        │
│    degradation (if Redis is     │
│    down, falls back to DB)      │
└─────────────────────────────────┘
```

**Communication patterns:**
- **Synchronous (REST):** Booking Service → Flight Service for seat availability check and price verification before confirming a booking
- **Asynchronous (RabbitMQ):** Auth Service publishes `register.successful` events; Booking Service publishes `booking.confirmed`, `booking.cancelled`, `booking.expired`, `booking.refunded` events. Notification Service consumes all events and dispatches emails.
- **Internal API Key:** Service-to-service REST calls are authenticated with a shared `x-internal-api-key` header to prevent external access to internal endpoints.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 (Alpine) |
| Frontend | React, Vite, React Router, CSS |
| Framework | Express.js |
| ORM | Sequelize 6 + Sequelize CLI |
| Database | PostgreSQL 16 |
| Cache & OTP Store | Redis 7 (ioredis client) |
| Message Broker | RabbitMQ 3 (amqplib client) |
| Auth | JWT (Access + Refresh tokens), Google OAuth 2.0, bcrypt |
| Email | Nodemailer/Gmail (local SMTP) + Resend (cloud HTTPS) |
| API Docs | Swagger UI via swagger-jsdoc + swagger-ui-express (OpenAPI 3.0) |
| Testing | Jest (unit tests with mocks) |
| Containerization | Docker + Docker Compose |
| Deployment | Render (services), Upstash (Redis), CloudAMQP (RabbitMQ) |

---

## Database Schema

Four PostgreSQL databases, one per service. Each service owns its data and communicates with others only through REST or RabbitMQ — no cross-database joins.

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                        authentication_service_db                               │
│                                                                                │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                    │
│  │    Users     │     │  user_roles  │     │    Roles     │                    │
│  ├──────────────┤     ├──────────────┤     ├──────────────┤                    │
│  │ id       PK  │◄────│ user_id  FK  │     │ id       PK  │                    │
│  │ name         │     │ role_id  FK  │────►│ name         │                    │
│  │ email   UQ   │     └──────────────┘     │ (USER,ADMIN, │                    │
│  │ password     │          M:N             │  AIRLINE_    │                    │
│  │ provider     │                          │  STAFF)      │                    │
│  │ googleId UQ  │     ┌──────────────┐     └──────────────┘                    │
│  └──────┬───────┘     │   Sessions   │                                         │
│         │             ├──────────────┤                                         │
│         │  1:N        │ id       PK  │                                         │
│         └────────────►│ userId   FK  │                                         │
│                       │ tokenHash UQ │                                         │
│                       │ expiresAt    │                                         │
│                       │ absoluteExpiry│                                        │
│                       └──────────────┘                                         │
└────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│                          flight_search_db                                      │
│                                                                                │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                    │
│  │   Cities     │     │   Airports   │     │   Flights    │                    │
│  ├──────────────┤     ├──────────────┤     ├──────────────┤                    │
│  │ id       PK  │◄────│ city_id  FK  │     │ id       PK  │                    │
│  │ name         │     │ id       PK  │◄────│ departure_   │                    │
│  └──────────────┘     │ name    UQ   │     │  airport_id  │                    │
│        1:N            │ address UQ   │◄────│ arrival_     │                    │
│                       └──────────────┘     │  airport_id  │                    │
│                            1:N             │ airplane_id  │                    │
│                                            │ flightNo     │                    │
│  ┌──────────────┐                          │ price        │                    │
│  │  Airplanes   │         1:N              │ totalSeatsLeft│                   │
│  ├──────────────┤◄─────────────────────────│ status       │                    │
│  │ id       PK  │  (airplane_id FK)        │ departureTime│                    │
│  │ modelNo      │                          │ arrivalTime  │                    │
│  │ capacity     │                          │ durationIn   │                    │
│  └──────────────┘                          │   Minutes    │                    │
│   (Each airplane can                       │ boardingGate │                    │
│    have many flights)                      └──────────────┘                    │
└────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│                          booking_service_db                                    │
│                                                                                │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                    │
│  │   Bookings   │     │  Passengers  │     │   Payments   │                    │
│  ├──────────────┤     ├──────────────┤     ├──────────────┤                    │
│  │ id       PK  │◄────│ bookingId FK │     │ id       PK  │                    │
│  │ userId       │     │ name         │     │ bookingId FK │                    │
│  │ outboundFlightId│  │ age          │     │   (unique)   │                    │
│  │ noOfSeats    │     │ gender       │     │ amount       │                    │
│  │ totalCost    │     └──────────────┘     │ status       │                    │
│  │ tripType     │          1:N             │  (PENDING,   │                    │
│  │  (ONE_WAY,   │                          │   SUCCESS,   │                    │
│  │   ROUND_TRIP)│               1:1        │   FAILED,    │                    │
│  │ returnFlightId(nullable)───────────────►│   REFUNDED)  │                    │
│  │ status       │                          │ paymentMethod│                    │
│  │  (INITIATED, │                          │ gateway      │                    │
│  │   PENDING,   │                          │ transactionId│                    │
│  │   CONFIRMED, │                          │ paidAt       │                    │
│  │   CANCELLED, │                          └──────────────┘                    │
│  │   EXPIRED)   │                                                              │
│  │ bookedAt     │                                                              │
│  | flightSnapShot                                                              |
|  └──────────────┘                                                              │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────┐
│                               notification_service_db                              │
│                                                                                    |
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │          Notifications                                                      │   │
│  ├─────────────────────────────────────────────────────────────────────────────┤   │
│  │ id              PK                                                          │   │
│  │ userId                                                                      │   │
│  │ bookingId       (nullable)                                                  │   │
│  │ type            (BOOKING_CONFIRMED, BOOKING_CANCELLED, REGISTER_SUCCESFUL,  │   |   
│  │                  DEPARTURE_REMINDER, PAYMENT_FAILED, BOOKING_EXPIRED, ...)  │   |
│  │                                                                             |   |
|  | channel         (EMAIL, SMS, PUSH)                                          │   │
│  │ recipientEmail                                                              │   │
│  │ subject                                                                     │   │
│  │ status          (PENDING, SENT, FAILED)                                     │   │
│  │ sentAt                                                                      │   │
│  │ failReason      (nullable)                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────┘
```

**Key relationships:**
- `Users ↔ Roles` — Many-to-many via `user_roles` junction table. A user can have multiple roles (USER, ADMIN, AIRLINE_STAFF).
- `Users → Sessions` — One-to-many. Each login creates a session. Configurable session limit (default: 2 active sessions per user).
- `Cities → Airports → Flights` — Hierarchical. A city has many airports, each airport has many departing and arriving flights.
- `Airplanes → Flights` — One-to-many. Each airplane (model + capacity) can be assigned to many flights via `airplane_id` FK.
- `Bookings → Passengers` — One-to-many. Each booking contains passenger details.
- `Bookings → Payments` — One-to-one. Each booking has exactly one payment record.

---

## Key Design Decisions

### Why microservices instead of a monolith?

Each service maps to a distinct business domain (auth, flights, bookings, notifications) with its own database. This enforces data ownership — the booking service can't accidentally query the users table. Services communicate through well-defined REST APIs and RabbitMQ events. In a real airline system, the flight search service would need to scale horizontally for high-traffic search queries while the notification service could run on a single instance. Microservices allow this independent scaling.

### Why event-driven notifications instead of synchronous emails?

When a user books a flight, the API should respond immediately — not wait 2-3 seconds for an SMTP connection. RabbitMQ decouples the booking flow from email delivery:

1. Booking Service publishes a `booking.confirmed` event to RabbitMQ (< 5ms)
2. API responds to the user immediately
3. Notification Service consumes the event asynchronously and sends the email

If the notification service is down, messages queue up in RabbitMQ and are processed when it recovers. No emails are lost. The user experience is never degraded by email infrastructure issues.

### Why Redis for OTP instead of database?

OTPs have three properties that make Redis ideal: they're short-lived (2 min), they're write-once-read-few, and they need auto-cleanup. Redis's `SETEX` command handles all three natively. Storing OTPs in PostgreSQL would require a background job to clean expired records and would add unnecessary write load to the database for data that's inherently temporary.

### Why cache-aside with graceful degradation instead of write-through?

Cache-aside gives the application full control over what gets cached and when. The flight search service only caches read-heavy search queries — not individual flight lookups. The graceful degradation pattern (wrapping Redis operations in try/catch) means a Redis outage doesn't take down the entire service. This is critical for a booking system where availability matters more than cache performance.

### Why dual email provider (Nodemailer + Resend)?

Render's free tier blocks outbound SMTP (port 465/587). Instead of choosing one provider, the system auto-detects the environment at startup:
- `RESEND_API_KEY` is set → use Resend's HTTPS API (port 443, works on any cloud platform)
- `RESEND_API_KEY` is not set → use Nodemailer/Gmail SMTP (works locally and in Docker)

Same code, zero manual switching. The decision is made once at service startup.

### Why Sequelize managed transactions instead of raw SQL?

Sequelize's `sequelize.transaction()` provides automatic commit/rollback with async/await syntax. It passes the transaction object `t` to every query inside the callback — if any query throws, the entire transaction is rolled back automatically. This eliminates manual `BEGIN`/`COMMIT`/`ROLLBACK` handling and prevents partial writes in multi-table operations (booking + passengers, booking + payment, cancellation + refund).

### Why idempotent seeders?

`sequelize-cli db:seed:all` stops at the first error. If a seeder tries to insert a row that already exists (e.g., the "USER" role), it throws a unique constraint error and prevents all subsequent seeders from running. Each seeder checks for existing data before inserting (`SELECT ... LIMIT 1`), making container restarts with persistent volumes reliable.

### Why persistent sessions in HttpOnly cookies?

Access tokens are short-lived (15 min) and sent via `Authorization` header. Session tokens are long-lived and stored in an **HttpOnly, Secure, SameSite=None** cookie (in production) — never accessible to JavaScript, which eliminates XSS-based token theft. Instead of rotating tokens, sessions use a sliding window expiration: on each `/auth/refresh` call, the session's `expiresAt` time is extended in the database, allowing users to stay logged in seamlessly up to an `absoluteExpiry` hard limit (e.g., 30 days). Each user is limited to 2 active sessions — a third login evicts the oldest session automatically.

---

## Booking Lifecycle

The booking system has two distinct cancellation flows depending on whether payment has been completed:

```
                          User creates booking
                                  │
                                  ▼
                           ┌──────────┐     Seat count decremented on Flight table
                           │ INITIATED│     (via REST call to Flight Service)
                           └────┬─────┘
                                │
              ┌─────────────────┼───────────────────┐
              │                 │                   │
              ▼                 ▼                   ▼
       User cancels      User submits        Auto-expiry cron
       (pre-payment)      payment            (every 5 min, >10 min old)
              │                 │                   │
              ▼                 ▼                   ▼
       ┌──────────┐      ┌──────────┐           ┌──────────┐
       │CANCELLED │      │ PENDING  │           │ EXPIRED  │
       │          │      └────┬─────┘           │          │
       │ Seats    │           │                 │ Seats    │
       │ restored │      ┌────┴──────┐          │ restored │
       │ Email    │      │           │          │ Email    │
       │ sent     │      ▼           ▼          │ sent     │
       └──────────┘ ┌──────────┐ ┌────────┐     └──────────┘
                    │ Payment  │ │Payment │
                    │ SUCCESS  │ │FAILED  │
                    │          │ │        │
                    │ Booking→ │ │Booking │
                    │ CONFIRMED│ │→CANCEL │
                    │ Email    │ │Seats   │
                    │ sent     │ │restored│
                    └────┬─────┘ └────────┘
                         │
                         │
       ┌─────────────────┼──────────────────────┐
       │                 │                      │
       ▼                 ▼                      ▼
  User requests    Admin cancels          Admin cancels
  refund           with refund            without refund
  (>24h before     (skipTimeCheck)        (no-show, fraud)
   departure)           │                      │
       │                 │                      │
       ▼                 ▼                      ▼
  ┌──────────┐    ┌──────────┐           ┌──────────┐
  │CANCELLED │    │CANCELLED │           │CANCELLED │
  │          │    │          │           │          │
  │ Gateway  │    │ Gateway  │           │ NO refund│
  │ refund   │    │ refund   │           │ Seats    │
  │ Payment→ │    │ Payment→ │           │ restored │
  │ REFUNDED │    │ REFUNDED │           │ Email    │
  │ Seats    │    │ Seats    │           │ sent     │
  │ restored │    │ restored │           └──────────┘
  │ Email    │    │ Email    │
  │ sent     │    │ sent     │
  └──────────┘    └──────────┘
```

**Key rules:**
- **Pre-payment cancel** (`cancelBooking`): Only INITIATED or PENDING bookings. No refund needed — just restore seats.
- **Post-payment refund** (`cancelAndRefundBooking`): Only CONFIRMED bookings. Processes gateway refund first, then atomically marks booking as CANCELLED + payment as REFUNDED inside a transaction.
- **24-hour rule**: Users cannot cancel within 24 hours of departure. Admins can override this.
- **Admin no-refund cancel** (`adminCancelBooking`): For no-shows, fraud, policy violations. Cancels without processing a refund.

---

## Transaction Management

Database transactions (Sequelize managed transactions) are used in the booking and payment services to ensure data consistency across multi-step operations.

### Where transactions are used

**1. Booking creation with passengers** (`booking.repository.js`)
```javascript
await sequelize.transaction(async (t) => {
  const booking = await Booking.create(bookingData, { transaction: t });
  await Passenger.bulkCreate(passengersWithBookingId, { transaction: t });
  return booking;
});
```
Why: A booking without passengers is invalid. If `bulkCreate` fails after the booking row is inserted, the transaction rolls back both — no orphaned bookings.

**2. Payment processing** (`payment.service.js`)
```javascript
await sequelize.transaction(async (t) => {
  booking.status = "PENDING";
  await booking.save({ transaction: t });

  const payment = await Payment.create({
    bookingId, amount, status: "PENDING", ...
  }, { transaction: t });

  const result = await mockGateway.processPayment(paymentDetails);
  // Update payment + booking status based on gateway response
});
```
Why: The booking status and payment record must update atomically. If the payment record creation fails after the booking status has changed to PENDING, the transaction rolls back both to their original state.

**3. Refund with cancellation** (`booking.service.js`)
```javascript
await sequelize.transaction(async (t) => {
  booking.status = "CANCELLED";
  await booking.save({ transaction: t });
  await paymentService.markPaymentRefunded(payment, { transaction: t });
});
```
Why: A cancellation with refund involves two table updates (Bookings + Payments). If marking the payment as REFUNDED fails, the booking should not be marked as CANCELLED — both must succeed or neither.

### What is NOT in a transaction — Saga Pattern

Seat count changes happen on the **Flight Service** (a separate service with its own database). You cannot wrap a REST call inside a PostgreSQL transaction. Instead, the system uses **compensating actions** (the saga pattern):

**Booking creation — compensating rollback if DB write fails:**
```javascript
// booking.service.js — createBooking()

// Step 1: Reserve seats on Flight Service (REST call — outside any transaction)
await flightClient.decrementSeats(flightId, noOfSeats);

try {
  // Step 2: Create booking + passengers in local DB (inside transaction)
  const booking = await bookingRepository.createBookingWithPassengers(
    { userId, flightId, noOfSeats, totalCost, status: "INITIATED" },
    passengers,
  );
  return booking;
} catch (error) {
  // COMPENSATING ACTION: If DB write fails, undo the seat reservation
  await flightClient.incrementSeats(flightId, noOfSeats);
  throw error;
}
```

**Why not a distributed transaction?** Distributed transactions (2PC) require all participating databases to support the same protocol. Our Flight Service and Booking Service have separate PostgreSQL databases accessed via REST — 2PC is not possible. The saga pattern achieves eventual consistency: if step 2 fails, the compensating action in the `catch` block restores the system to its previous state.

---

## Authorization & RBAC

The system uses three layers of access control, applied as Express middleware chains:

```
Request → authMiddleware (JWT verify) → authorize(...roles) → Controller
```

1. **`authMiddleware`** — Verifies the JWT access token from the `Authorization: Bearer <token>` header. Extracts `userId`, `sessionId`, and `roles` into `req.jwtPayload`.
2. **`authorize(...roles)`** — Checks if the user has at least one of the allowed roles. Returns 403 if not.
3. **Public routes** — No middleware. Anyone can access.

### Roles

| Role | Assigned to | Purpose |
|---|---|---|
| `USER` | Every registered user (default) | Book flights, manage own bookings, request refunds |
| `ADMIN` | Manually assigned via admin route | Full system access — manage flights, airports, cities, users, force-cancel bookings |
| `AIRLINE_STAFF` | Manually assigned via admin route | Create/update flights and airplanes (no user management) |

### Route Access Matrix

```
+----------------------------------------------------------------------------------+
|                               ROLE-BASED ACCESS CONTROL MATRIX                   |       
+--------------------------------------+--------+--------+--------------+----------+
| Route                                | PUBLIC | USER   | AIRLINE_STAFF| ADMIN    |
+--------------------------------------+--------+--------+--------------+----------+
| AUTH SERVICE                                                                     |
+--------------------------------------+--------+--------+--------------+----------+
| POST  /auth/register                 |   ✓    |        |              |          |
| POST  /auth/login                    |   ✓    |        |              |          |
| POST  /auth/sendOtp                  |   ✓    |        |              |          |
| POST  /auth/verifyOtp                |   ✓    |        |              |          |
| POST  /auth/loginWithOtp             |   ✓    |        |              |          |
| GET   /auth/google                   |   ✓    |        |              |          |
| POST  /auth/refresh                  |   🍪   |        |              |          |
| POST  /auth/logout                   |   🍪   |        |              |          |
| PATCH /auth/change-password-token    |   🔑   |        |              |          |
| POST  /auth/logoutFromOtherDevices   |        |   ✓    |      ✓       |    ✓     |
| POST  /auth/change-password          |        |   ✓    |      ✓       |    ✓     |
| GET   /users/:id                     |        |   ✓    |      ✓       |    ✓     |
| PATCH /users/:id                     |        |   ✓    |      ✓       |    ✓     |
| DELETE /users/:id                    |        |        |              |    ✓     |
| POST  /admin/assignRole              |        |        |              |    ✓     |
| PATCH /admin/updateRole              |        |        |              |    ✓     |
+--------------------------------------+--------+--------+--------------+----------+
| FLIGHT SERVICE                                                                   |
+--------------------------------------+--------+--------+--------------+----------+
| GET   /flights                       |   ✓    |        |              |          |
| GET   /flights/:id                   |   ✓    |        |              |          |
| POST  /flights                       |        |        |      ✓       |    ✓     |
| PATCH /flights/:id                   |        |        |      ✓       |    ✓     |
| DELETE /flights/:id                  |        |        |              |    ✓     |
| POST  /airplanes                     |        |        |      ✓       |    ✓     |
| PATCH /airplanes/:id                 |        |        |      ✓       |    ✓     |
| GET   /airplanes/:id                 |        |        |      ✓       |    ✓     |
| DELETE /airplanes/:id                |        |        |              |    ✓     |
| POST  /airports                      |        |        |              |    ✓     |
| PATCH /airports/:id                  |        |        |              |    ✓     |
| DELETE /airports/:id                 |        |        |              |    ✓     |
| POST  /cities                        |        |        |              |    ✓     |
| PATCH /cities/:id                    |        |        |              |    ✓     |
| DELETE /cities/:id                   |        |        |              |    ✓     |
+--------------------------------------+--------+--------+--------------+----------+
| BOOKING SERVICE                                                                  |
+--------------------------------------+--------+--------+--------------+----------+
| POST  /bookings                      |        |   ✓    |      ✓       |    ✓     |
| POST  /bookings/round                |        |   ✓    |      ✓       |    ✓     |
| GET   /bookings                      |        |   ✓    |      ✓       |    ✓     |
| GET   /bookings/:id                  |        |   ✓    |      ✓       |    ✓     |
| PATCH /bookings/:id/cancel           |        |   ✓    |      ✓       |    ✓     |
| POST  /bookings/:id/refund           |        |   ✓    |              |          |
| POST  /payments                      |        |   ✓    |      ✓       |    ✓     |
| GET   /payments/booking/:id          |        |   ✓    |      ✓       |    ✓     |
| POST  /admin/bookings/:id/refund     |        |        |              |    ✓     |
| PATCH /admin/bookings/:id/cancel     |        |        |      ✓       |    ✓     |
+--------------------------------------+--------+--------+--------------+----------+

Legend:
✓  = Access Allowed
🍪 = Requires Refresh Token Cookie
🔑 = Requires Password Reset Token

```

**How middleware chains work in code:**
```javascript
// Public — no middleware
router.get("/flights", flightController.searchFlights);

// Authenticated — any logged-in user
router.post("/bookings", authMiddleware, bookingController.createBooking);

// Role-restricted — only ADMIN
router.delete("/users/:id", authMiddleware, authorize("ADMIN"), userController.deleteUser);

// Multi-role — AIRLINE_STAFF or ADMIN
router.post("/flights", authMiddleware, authorize("AIRLINE_STAFF", "ADMIN"), flightController.createFlight);
```

---

## OTP & Password Reset Flow

```
User requests password reset
        │
        ▼
POST /api/v1/auth/forgot-password
        │
        ├── Generate 6-digit OTP
        ├── Store in Redis: otp:{email} → { code, attempts: 0 }  (TTL: 2 min)
        └── Send OTP email (via Nodemailer/Resend)
        │
        ▼
User submits OTP + new password
        │
        ▼
POST /api/v1/auth/reset-password
        │
        ├── Read otp:{email} from Redis
        ├── Check attempts < 5 (increment on each try)
        ├── Verify OTP matches
        ├── If valid:
        │     ├── Update password in database (bcrypt hashed)
        │     ├── Delete otp:{email} from Redis
        │     └── Return success
        └── If invalid:
              └── Return error (OTP expired / wrong code / max attempts exceeded)
```

---

## Internal Service Communication

Services call each other's **internal-only endpoints** using a shared `INTERNAL_API_KEY` passed in the `x-internal-api-key` HTTP header. These endpoints are not accessible to end users — they exist only for service-to-service data fetching.

### How it works

```
┌──────────────┐     x-internal-api-key         ┌──────────────┐
│  Notification│  ──── GET /internal/users/5 ──►│    Auth      │
│  Service     │      header in request         │    Service   │
└──────────────┘                                └──────────────┘
       │                                             │
       │         The receiving service               │
       │         checks the header:                  │
       │                                             ▼
       │                                    ┌────────────────┐
       │                                    │ if (apiKey !== │
       │                                    │  INTERNAL_API_ │
       │                                    │  KEY) → 401    │
       │                                    └────────────────┘
       │
       ├──── GET /internal/flights/3 ──────►  Flight Service
       │
       └──── GET /internal/bookings/upcoming ► Booking Service
```

### Internal endpoints

| Caller | Endpoint called | Purpose |
|---|---|---|
| Booking Service → Flight Service | `GET /api/v1/flights/:id` | Fetch flight price and seat count before booking |
| Booking Service → Flight Service | `PATCH /api/v1/flights/:id/seats` | Decrement/increment seats on booking/cancellation |
| Notification Service → Auth Service | `GET /api/v1/internal/users/:id` | Fetch user email and name for email templates |
| Notification Service → Flight Service | `GET /api/v1/internal/flights/:id` | Fetch flight details for departure reminder emails |
| Notification Service → Booking Service | `GET /api/v1/internal/bookings/upcoming` | Fetch bookings departing within 24h (cron job) |

### Caller side — Axios client with API key

```javascript
// notificationService/src/utils/authClient.js
const authAPI = axios.create({
  baseURL: `${AUTH_SERVICE_URL}/api/v1/internal`,
  headers: { "x-internal-api-key": INTERNAL_API_KEY },  // ← shared secret
  timeout: 5000,
});

const getUserById = async (userId) => {
  const response = await authAPI.get(`/users/${userId}`);
  return response.data.data;
};
```

### Receiver side — Middleware guard

```javascript
// shared/src/middlewares/internalAuthMiddleware.js
function internalAuthMiddleware(req, res, next) {
  const apiKey = req.headers["x-internal-api-key"];
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    throw new AppError("Unauthorized: invalid or missing internal API key", 401);
  }
  next();
}

// authService/src/routes/v1/v1InternalRoutes.js
router.get("/users/:id", internalAuthMiddleware, userController.fetchUserInternal);
```

**Why not JWT for internal calls?** Internal services don't have user sessions — they are backend processes (cron jobs, event consumers). A shared API key is simpler, doesn't expire, and doesn't require token refresh logic. The key is set as an environment variable and never exposed to the client.

---

## Caching Strategy

Cache-aside pattern with **graceful degradation**. Redis (Upstash in production, local container in Docker).

### Flight Search Cache

| Cache key format | TTL | Contents |
|---|---|---|
| `flight:from={id}&to={id}&date={date}&...` | 5 min | Full search results (JSON array of flights with airport and city data) |

**How it works:**

```javascript
// Flight Service — cache-aside with graceful degradation
const cacheKey = buildCacheKey(filters); // deterministic key from sorted filters

try {
  const cached = await redis.get(cacheKey);
  if (cached) {
    logger.info(`Cache HIT — ${cacheKey}`);  // ← served in <50ms
    return JSON.parse(cached);
  }
  logger.info(`Cache MISS — ${cacheKey}`);
} catch (err) {
  // Redis is down — continue without cache (graceful degradation)
}

const data = await queryDatabase(filters);       // ← full DB query with joins
await redis.setex(cacheKey, 300, JSON.stringify(data));  // ← store for 5 min
return data;
```

**Cache invalidation:** When an admin creates, updates, or deletes a flight, all cached search results are cleared. This prevents stale data from being served.

**Graceful degradation:** If Redis goes down, the `try/catch` block around cache operations ensures the service continues working by falling back to direct database queries. No outage — just slower responses until Redis recovers.

### OTP Store (Auth Service)

| Cache key format | TTL | Contents |
|---|---|---|
| `otp:{email}` | 2 min | `{ code: "123456", attempts: 0 }` |

Redis is used instead of the database for OTPs because:
- OTPs are ephemeral — Redis's built-in `SETEX` auto-expires them without cleanup cron jobs
- Prevents database bloat from millions of short-lived records
- Sub-millisecond reads for OTP verification during password reset

**Flow:** User requests OTP → stored in Redis with 2-min TTL → user submits OTP → verified against Redis → max 5 attempts before lockout → on success, Redis key is deleted and password is updated.

---

## Frontend React SPA Integration

While the primary focus of this architecture is the backend microservices, a **React SPA (Single Page Application)** powered by Vite is implemented to prove the end-to-end capabilities of the entire flow.

**Frontend Features:**
- **Admin Dashboard:** A dedicated control panel allowing admins to manage flights, airplanes, users, assign roles, and force-cancel bookings.
- **Flight Search & Round-Trip:** Dynamic searching with support for both `ONE_WAY` and `ROUND_TRIP` journey types, automatically grouping departure and return flights.
- **Session Management:** Seamless handling of `HttpOnly` cookie-based sessions, background token refreshing using Axios interceptors, and gracefully redirecting unauthenticated users.
- **Real-time User Experience:** Dynamic loading states, interactive toast notifications for actions, and seamless client-side routing for an app-like feel.

> [!NOTE]
> **Cold Start Wakeup:** Render free-tier services sleep after 15 minutes. The frontend uses a custom hook to listen to the first Axios request to show a loading screen while the services wake up (which takes ~30 seconds).

The frontend is minimal, highly responsive, and tightly coupled to the backend's distributed API architecture, deployed globally on Vercel.

---

## API Documentation

All 4 services expose interactive **Swagger UI** at `/api-docs`. Open the URL in your browser, click on any endpoint, fill in the parameters, and hit "Execute" to test it live.

### Testing flow with Swagger

**Step 1: Register and Login**
1. Open Auth Service Swagger (`/api-docs`)
2. `POST /api/v1/auth/register` — create a new user
3. `POST /api/v1/auth/login` — get an access token
4. Click "Authorize" button (top right) → paste the access token → now all protected routes work

**Step 2: Search Flights**
1. Open Flight Service Swagger (`/api-docs`)
2. `GET /api/v1/flights` — search with filters

**Sample flight data** (pre-seeded, ready to use):

| Flight No | Route | Date | Price | Seats |
|---|---|---|---|---|
| AI-101 | Delhi → Mumbai | 2026-10-15 | ₹3,900 | 150 |
| AI-102 | Delhi → Mumbai | 2026-10-15 | ₹4,200 | 150 |
| 6E-103 | Delhi → Mumbai | 2026-10-15 | ₹3,600 | 185 |
| SG-107 | Delhi → Mumbai | 2026-10-15 | ₹5,800 | 215 |
| AI-201 | Mumbai → Delhi | 2026-10-18 | ₹4,100 | 295 |
| 6E-202 | Mumbai → Delhi | 2026-10-18 | ₹4,600 | 250 |
| 6E-301 | Bengaluru → Chennai | 2026-10-18 | ₹2,800 | 70 |
| SG-302 | Hyderabad → Delhi | 2026-10-20 | ₹5,200 | 78 |
| AI-305 | Mumbai → Bengaluru | 2026-10-28 | ₹3,800 | 416 |
| SG-401 | Delhi → Chennai | 2026-11-01 | ₹5,300 | 44 |

> **10 Delhi → Mumbai flights** are seeded on **Oct 15, 2026** with 4 round-trip Mumbai → Delhi flights on **Oct 18, 2026**. Total 28 flights across Oct–Nov 2026.

**Seeded city/airport IDs for search filters:**

| City | city_id | Airport | airport_id |
|---|---|---|---|
| Delhi | 1 | Indira Gandhi International | 1 |
| Mumbai | 2 | Chhatrapati Shivaji Maharaj International | 2 |
| Bengaluru | 3 | Kempegowda International | 3 |
| Chennai | 4 | Chennai International | 4 |
| Hyderabad | 5 | Rajiv Gandhi International | 5 |
| Kolkata | 6 | Netaji Subhas Chandra Bose International | 6 |

> **Try this search:** `GET /api/v1/flights?departure_airport_id=1&arrival_airport_id=2` — returns all 10 Delhi → Mumbai flights on Oct 15.

**Step 3: Book a Flight**
1. Open Booking Service Swagger (`/api-docs`)
2. Authorize with the access token from step 1
3. `POST /api/v1/bookings` — create a booking with a `flightId` from step 2
4. `POST /api/v1/payments` — complete the payment
5. Check your email — a booking confirmation email should arrive

**Step 4: Admin Routes**
1. Login as admin: `POST /api/v1/auth/login` with `admin@airline.com` / `Admin@123`
2. Use the admin access token to test admin-only routes:
   - `POST /api/v1/admin/flights` — create a new flight
   - `GET /api/v1/admin/bookings` — view all bookings
   - `PATCH /api/v1/admin/users/role` — assign roles to users

---

## Testing

### Unit Tests

Unit tests are written with **Jest** using mock-based isolation — no real database or Redis connections. All external dependencies (repositories, Redis, email, JWT) are mocked with `jest.spyOn` and `jest.mock`.

#### Auth Service — `authService.test.js` (12 tests)

| Test group | What's tested |
|---|---|
| `login()` — happy path | Returns access + session tokens, evicts oldest sessions when session limit exceeded |
| `login()` — user not found | Throws "Invalid email or password" |
| `login()` — Google-only user | Throws "This account uses Google login" when a Google OAuth user tries password login |
| `login()` — wrong password | Throws after `comparePassword` returns false |
| `_createSessionForUser()` | Generates session token, hashes it, creates DB session, returns JWT access token |
| `sendOtp()` — happy path | Generates OTP, stores hashed OTP in Redis with TTL, sends email, returns `otpId` |
| `sendOtp()` — user not found | Returns fake `otpId` (prevents email enumeration attacks) |
| `sendOtp()` — email fails | Cleans up Redis keys if email sending throws, then re-throws |
| `sendOtp()` — Redis down | Throws 503 "OTP service temporarily unavailable" |

#### Booking Service — `booking.test.js` (7 tests)

| Test group | What's tested |
|---|---|
| `createBooking()` — happy path | Calls Flight Service for price, decrements seats, creates booking + passengers, returns status INITIATED |
| `createBooking()` — passenger mismatch | Throws if `passengers.length !== noOfSeats` |
| `createBooking()` — insufficient seats | Throws if `flight.totalSeatsLeft < noOfSeats`, does NOT decrement |
| `createBooking()` — DB failure | Rolls back seat decrement (calls `incrementSeats`) if booking creation fails |
| `cancelBooking()` — happy path | Sets status to CANCELLED, restores seats, publishes `booking.cancelled` event |
| `cancelBooking()` — not found | Throws "Booking not found" |
| `cancelBooking()` — wrong user | Throws 403 "You are not authorized" |
| `cancelBooking()` — invalid status | Throws if booking is already CONFIRMED (must use refund flow instead) |

### Running Tests

```bash
# Auth service tests
cd authService && npx jest --verbose

# Booking service tests
cd bookingAndPaymentService && npx jest --verbose

# Run all tests from root (if npm scripts are configured)
npm test --prefix authService
npm test --prefix bookingAndPaymentService
```

### Manual Testing

All 4 services expose interactive Swagger UI at `/api-docs`. See the [API Documentation](#api-documentation) section for a step-by-step testing flow.

---

## Local Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js 22](https://nodejs.org/) (only for manual setup without Docker)
- A Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled (for email features)
- A [Google Cloud Console](https://console.cloud.google.com/) project with OAuth 2.0 credentials (for Google login)

### Option A: Docker Compose (Recommended)

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

**2. Create the root `.env` file**
```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:
```env
DB_USERNAME=postgres
DB_PASSWORD=your_db_password

# Any random string — used to sign JWT tokens
JWT_SECRET_KEY=your_jwt_secret_here

# Bcrypt salt rounds (9 is fine for development)
SALT=9

# Gmail App Password (not your regular Gmail password)
# 1. Go to https://myaccount.google.com/apppasswords
# 2. Select "Mail" and your device
# 3. Google generates a 16-character password — paste it here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Google OAuth 2.0 (for "Login with Google" feature)
# 1. Go to https://console.cloud.google.com/apis/credentials
# 2. Create an OAuth 2.0 Client ID (Web application type)
# 3. Add http://localhost:5001/api/v1/auth/google/callback as Authorized Redirect URI
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Any random string — used for service-to-service auth
INTERNAL_API_KEY=your_internal_api_key
```

**3. Start everything**
```bash
docker compose up --build
```

This starts all 4 services + PostgreSQL + Redis + RabbitMQ. Migrations and seed data (cities, airports, airplanes, flights, roles, admin user) run automatically on first startup.

**4. Access the services**

| Service | URL |
|---|---|
| Auth Service | http://localhost:5001/api-docs |
| Flight Service | http://localhost:5000/api-docs |
| Booking Service | http://localhost:5003/api-docs |
| Notification Service | http://localhost:5004/api-docs |
| RabbitMQ Dashboard | http://localhost:15672 (guest/guest) |
| Frontend | http://localhost:3000 |

**5. Stop and clean up**
```bash
docker compose down       # Stop containers (keeps data)
docker compose down -v    # Stop containers + wipe all database data
```

### Option B: Manual Setup (Without Docker)

**1. Install infrastructure locally**

Install PostgreSQL, Redis, and RabbitMQ on your machine:

```bash
# macOS (Homebrew)
brew install postgresql redis rabbitmq
brew services start postgresql
brew services start redis
brew services start rabbitmq

# Ubuntu / Debian
sudo apt install postgresql redis-server rabbitmq-server
sudo systemctl start postgresql redis-server rabbitmq-server

# Windows
# PostgreSQL: Download from https://www.postgresql.org/download/windows/
# Redis:      Download from https://github.com/tporadowski/redis/releases
# RabbitMQ:   Download from https://www.rabbitmq.com/install-windows.html
#             (requires Erlang: https://www.erlang.org/downloads)
```

**2. Create databases**
```bash
psql -U postgres -f init-db.sql
```
This creates the 4 databases: `authentication_service_db_project`, `flight_search_db_project`, `booking_service_db_project`, `notification_service_db`.

**3. Install dependencies for each service**
```bash
# Shared library (must be done first — other services depend on it except frontend)
cd shared && npm install && cd ..

# Each backend service
cd authService && npm install && cd ..
cd flightSearchService && npm install && cd ..
cd bookingAndPaymentService && npm install && cd ..
cd notificationService && npm install && cd ..

# Frontend
 cd frontend && npm install && cd ..
```

**4. Create and configure `.env` files**

Copy the example files:
```bash
cp authService/.env.example authService/.env
cp flightSearchService/.env.example flightSearchService/.env
cp bookingAndPaymentService/.env.example bookingAndPaymentService/.env
cp notificationService/.env.example notificationService/.env
cp frontend/.env.example frontend/.env
```

Edit each `.env` file. Here is what each variable means:

**`authService/.env`**
```env
PORT=5001
SALT=9                                          # bcrypt salt rounds
JWT_SECRET_KEY=any-random-string-here            # used to sign JWT tokens
INTERNAL_API_KEY=any-random-string-here          # must be same across all services
RABBITMQ_URL=amqp://localhost:5672
REDIS_URL=redis://127.0.0.1:6379
DB_USERNAME=postgres
DB_PASSWORD=your-local-postgres-password
DB_NAME=authentication_service_db_project
DB_HOST=127.0.0.1
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Gmail App Password (not your regular Gmail password)
# 1. Enable 2-Step Verification on your Google Account
# 2. Go to https://myaccount.google.com/apppasswords
# 3. Generate a 16-character app password
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Google OAuth 2.0
# 1. Go to https://console.cloud.google.com/apis/credentials
# 2. Create OAuth 2.0 Client ID (Web application)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**`flightSearchService/.env`**
```env
PORT=5000
JWT_SECRET_KEY=same-as-auth-service              # must match auth service
INTERNAL_API_KEY=same-as-auth-service
REDIS_URL=redis://127.0.0.1:6379
DB_USERNAME=postgres
DB_PASSWORD=your-local-postgres-password
DB_NAME=flight_search_db_project
DB_HOST=127.0.0.1
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**`bookingAndPaymentService/.env`**
```env
PORT=5003
JWT_SECRET_KEY=same-as-auth-service
INTERNAL_API_KEY=same-as-auth-service
FLIGHT_SERVICE_URL=http://localhost:5000          # booking calls flight service
RABBITMQ_URL=amqp://localhost:5672
DB_USERNAME=postgres
DB_PASSWORD=your-local-postgres-password
DB_NAME=booking_service_db_project
DB_HOST=127.0.0.1
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**`notificationService/.env`**
```env
PORT=5004
JWT_SECRET_KEY=same-as-auth-service
INTERNAL_API_KEY=same-as-auth-service
RABBITMQ_URL=amqp://localhost:5672
AUTH_SERVICE_URL=http://localhost:5001
FLIGHT_SERVICE_URL=http://localhost:5000
BOOKING_SERVICE_URL=http://localhost:5003
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
DB_USERNAME=postgres
DB_PASSWORD=your-local-postgres-password
DB_NAME=notification_service_db
DB_HOST=127.0.0.1
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**`frontend/.env`**
```env
VITE_FLIGHT_SERVICE_URL=http://localhost:5000
VITE_AUTH_SERVICE_URL=http://localhost:5001
VITE_BOOKING_SERVICE_URL=http://localhost:5003
VITE_NOTIFICATION_SERVICE_URL=http://localhost:5004
```

**5. Run migrations and seeders**
```bash
cd authService && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all && cd ..
cd flightSearchService && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all && cd ..
cd bookingAndPaymentService && npx sequelize-cli db:migrate && cd ..
cd notificationService && npx sequelize-cli db:migrate && cd ..
```

**6. Start each service** (open 4 separate terminals)
```bash
# Terminal 1
cd authService && node src/index.js

# Terminal 2
cd flightSearchService && node src/index.js

# Terminal 3
cd bookingAndPaymentService && node src/index.js

# Terminal 4
cd notificationService && node src/index.js

# Terminal 5
cd frontend && npm run dev
```

**7. Verify**
```bash
curl http://localhost:5001/health   # {"status":"ok"}
curl http://localhost:5000/health   # {"status":"ok"}
curl http://localhost:5003/health   # {"status":"ok"}
curl http://localhost:5004/health   # {"status":"ok"}
```

---

## Project Structure

```
├── frontend/
│   ├── public/                   # Static assets (SVG favicon)
│   ├── src/
│   │   ├── api/                  # Axios instances and token refresh logic
│   │   ├── components/           # Reusable React components (Navbar, ProtectedRoute)
│   │   ├── context/              # React Context (AuthContext, ToastContext)
│   │   ├── hooks/                # Custom hooks (useColdStartLoading)
│   │   ├── pages/                # Home, Book, Payment, MyBookings, AdminDashboard
│   │   └── styles/               # Global CSS and utility classes
│   ├── vercel.json               # Vercel deployment config (rewrites, rewrites, headers)
│   └── vite.config.js            # Vite build configuration
│
├── authService/
│   ├── Dockerfile
│   ├── start.sh                  # Migration + seed + start
│   ├── .env.example
│   └── src/
│       ├── config/               # DB, Redis, Swagger, server config
│       ├── controllers/          # Request handlers
│       ├── jobs/                 # Cron: clean expired sessions
│       ├── middlewares/          # Rate limiting, validation
│       ├── migrations/           # Sequelize migrations
│       ├── models/               # User, Role, Session
│       ├── repositories/         # Data access layer
│       ├── routes/               # v1 API routes with Swagger docs
│       ├── seeders/              # Roles + Admin user (idempotent)
│       ├── services/             # Business logic
│       ├── tests/                # Jest unit tests
│       └── utils/                # JWT, email, OTP, event publisher
│
├── flightSearchService/
│   ├── Dockerfile
│   ├── start.sh
│   └── src/
│       ├── config/               # DB, Redis, Swagger config
│       ├── models/               # Flight, Airport, Airplane, City
│       ├── seeders/              # Cities, airports, airplanes, flights (idempotent)
│       ├── services/             # Flight search with Redis caching
│       └── ...                   # (same layered structure)
│
├── bookingAndPaymentService/
│   ├── Dockerfile
│   ├── start.sh
│   └── src/
│       ├── jobs/                 # Cron: auto-expire unpaid bookings
│       ├── models/               # Booking, Payment, Passenger
│       ├── services/             # Booking lifecycle, payment processing
│       └── ...
│
├── notificationService/
│   ├── Dockerfile
│   ├── start.sh
│   └── src/
│       ├── consumers/            # RabbitMQ message consumers
│       ├── jobs/                 # Cron: departure reminder emails (24h before)
│       ├── services/             # Email service (Nodemailer/Resend dual provider)
│       └── ...
│
├── shared/                       # Shared library (npm linked into all services)
│   └── src/
│       ├── errors/               # AppError class (centralized error handling)
│       ├── middlewares/          # Request logging, error handling, auth middleware
│       └── utils/                # Async handler, RabbitMQ connector, JWT verify
│
├── docker-compose.yml            # Full local orchestration (7 containers)
├── init-db.sql                   # Creates 4 databases on first Postgres startup
├── .env.example                  # Template for root secrets
├── .gitattributes                # Force LF line endings for shell scripts (Windows fix)
└── .dockerignore
```

---

## Deployment

### Production Infrastructure

| Component | Provider | Plan | Purpose |
|---|---|---|---|
| Auth Service | Render | Free Web Service (Docker) | Authentication, sessions, RBAC |
| Flight Service | Render | Free Web Service (Docker) | Flight search, Redis caching |
| Booking Service | Render | Free Web Service (Docker) | Booking lifecycle, payments |
| Notification Service | Render | Free Web Service (Docker) | Email dispatch via RabbitMQ consumers |
| Frontend SPA | Vercel | Free Hosting | Global CDN delivery of React static assets |
| PostgreSQL | Supabase | Free Managed Database | High-performance DB connection pooler (all 4 services share one database) |
| Redis | Upstash | Free Serverless Redis | OTP store + flight search cache |
| RabbitMQ | CloudAMQP | Free (Little Lemur) | Event bus for notifications |
| Email (cloud) | Resend | Free (100 emails/day) | HTTPS email delivery (bypasses SMTP block) |

### How deployment works

The entire full-stack application deploys from the **same GitHub monorepo**:

```text
                               GitHub push to master
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
       Vercel (Frontend SPA)                            Render (Backend Microservices)
       Detects push to `frontend/`                      Detects push to root
                 │                                             │
      Runs `npm install`                                Builds Docker images
      Runs `npm run build` (Vite)                              │
                 │                                             ├── Auth:         Dockerfile at authService/Dockerfile
                 ▼                                             ├── Flight:       Dockerfile at flightSearchService/Dockerfile
  Deploys static assets to Global CDN                          ├── Booking:      Dockerfile at bookingAndPaymentService/Dockerfile
                 │                                             └── Notification: Dockerfile at notificationService/Dockerfile
                 ▼                                             │
   Assigns URL (skybooker.xyz)                                 ▼
                                                       Container starts → start.sh runs:
                                                               1. npx sequelize-cli db:migrate
                                                               2. npx sequelize-cli db:seed:all
                                                               3. node src/index.js
                                                               │
                                                               ▼
                                                       Assigns HTTPS URLs (onrender.com)
                                                       Pings /health every 30s
```

### Environment variables on Render

Environment variables are set in the Render dashboard (not in code). Each service gets its own set. Database credentials, Redis URL, RabbitMQ URL, and API keys are configured per-service. The `RENDER_EXTERNAL_URL` variable is automatically injected by Render — the Swagger UI uses it to set the correct server URL.

### Known limitations

- **Cold starts (~30-50s):** Render free tier spins down services after 15 min of inactivity. The first request wakes it up.
- **Supabase Database Limits:** Supabase free tier provides a limit of 2 active databases. To fit within this limit, all 4 services share one single database in production (tables don't overlap). Locally, Docker Compose creates 4 separate databases via `init-db.sql`.
- **Notification service wakeup:** RabbitMQ messages do not wake a sleeping Render service. The auth service auto-pings the notification service on startup, but there may be a ~30s delay before emails are processed after a cold start.
