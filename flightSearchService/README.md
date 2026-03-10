# ✈️ Airline Booking Backend — Flight Search Service

A RESTful backend service for searching and managing flights, airports, airplanes, and cities. Built with **Express.js**, **Sequelize ORM**, and **MySQL**.

---

## 📐 Architecture

The project follows a **layered architecture** pattern, ensuring clean separation of concerns:

```
Request → Routes → Middleware → Controllers → Services → Repositories → Models → Database
```

```
flightSearchService/
├── src/
│   ├── index.js                 # Express app entry point
│   ├── config/
│   │   ├── config.json          # Sequelize DB config (dev/test/prod)
│   │   └── serverConfig.js      # Loads PORT from .env
│   ├── models/                  # Sequelize model definitions
│   │   ├── index.js             # Auto-loads all models & associations
│   │   ├── city.js
│   │   ├── airport.js
│   │   ├── airplane.js
│   │   └── flight.js
│   ├── repositories/            # Data access layer (DB queries)
│   │   ├── crud.repository.js   # Generic CRUD base class
│   │   ├── city.repository.js
│   │   ├── airport.repository.js
│   │   ├── airplane.repository.js
│   │   └── flight.repository.js
│   ├── services/                # Business logic layer
│   │   ├── crud.service.js      # Generic CRUD base class
│   │   ├── city.service.js
│   │   ├── airport.service.js
│   │   ├── airplane.service.js
│   │   └── flight.service.js
│   ├── controllers/             # Request/response handling
│   │   ├── city.controller.js
│   │   ├── airport.controller.js
│   │   ├── airplane.controller.js
│   │   └── flight.controller.js
│   ├── middlewares/
│   │   └── flight.middleware.js  # Validates flight search query params
│   ├── routes/
│   │   ├── index.js             # Mounts all v1 routes under /api
│   │   └── v1/                  # Versioned API routes
│   │       ├── v1CityRoutes.js
│   │       ├── v1AirportRoutes.js
│   │       ├── v1AirplaneRoutes.js
│   │       └── v1FlightRoutes.js
│   ├── migrations/              # Sequelize DB migrations
│   └── seeders/                 # Sample data seeders
└── package.json
```

### Layer Responsibilities

| Layer            | Responsibility                                                                 |
| ---------------- | ------------------------------------------------------------------------------ |
| **Routes**       | Maps HTTP endpoints to controller functions. Applies middleware where needed.  |
| **Middleware**   | Validates and sanitizes incoming request data before it reaches controllers.   |
| **Controllers**  | Handles request/response cycle. Delegates business logic to the service layer. |
| **Services**     | Contains business logic. Orchestrates calls between multiple repositories.     |
| **Repositories** | Data access layer — executes Sequelize queries against the database.           |
| **Models**       | Defines database schema, associations, validations, virtual fields, and hooks. |

### Inheritance Pattern

Both the **Repository** and **Service** layers use a **base class** for generic CRUD operations:

- `CrudRepository` → provides `create`, `fetch`, `update`, `destroy`
- `CrudService` → wraps `CrudRepository` methods with error handling

Specialized classes (e.g., `FlightRepository`, `CityService`) extend these base classes and add domain-specific methods.

---

## 🗃️ Data Models & Relationships

```
City (1) ──── (N) Airport (1) ──── (N) Flight (N) ──── (1) Airplane
```

| Model        | Fields                                                                                                                                                                            | Notes                                                                                                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **City**     | `name`                                                                                                                                                                            | Has many Airports                                                                                                                                                                    |
| **Airport**  | `name`, `city_id`, `address`                                                                                                                                                      | Belongs to City; has many arriving & departing Flights                                                                                                                               |
| **Airplane** | `modelNo`, `capacity`                                                                                                                                                             | Has many Flights                                                                                                                                                                     |
| **Flight**   | `flightNo`, `price`, `airplane_id`, `departure_airport_id`, `arrival_airport_id`, `departureTime`, `arrivalTime`, `totalSeatsLeft`, `boardingGate`, `status`, `durationInMinutes` | Belongs to departure & arrival Airports. Includes virtual fields: `duration`, `departureTimeFormatted`, `arrivalTimeFormatted`. Duration is auto-calculated via a `beforeSave` hook. |

---

## 🔌 API Endpoints

Base URL: `/api/v1`

### Cities — `/api/v1/cities`

| Method   | Endpoint | Description                               |
| -------- | -------- | ----------------------------------------- |
| `POST`   | `/`      | Create a new city                         |
| `GET`    | `/`      | Search cities by name prefix (`?search=`) |
| `GET`    | `/:id`   | Get a city by ID                          |
| `PATCH`  | `/:id`   | Update a city                             |
| `DELETE` | `/:id`   | Delete a city                             |

### Airports — `/api/v1/airports`

| Method   | Endpoint | Description          |
| -------- | -------- | -------------------- |
| `POST`   | `/`      | Create a new airport |
| `GET`    | `/:id`   | Get an airport by ID |
| `PATCH`  | `/:id`   | Update an airport    |
| `DELETE` | `/:id`   | Delete an airport    |

### Airplanes — `/api/v1/airplanes`

| Method   | Endpoint | Description           |
| -------- | -------- | --------------------- |
| `POST`   | `/`      | Create a new airplane |
| `GET`    | `/:id`   | Get an airplane by ID |
| `PATCH`  | `/:id`   | Update an airplane    |
| `DELETE` | `/:id`   | Delete an airplane    |

### Flights — `/api/v1/flights`

| Method   | Endpoint | Description                                 |
| -------- | -------- | ------------------------------------------- |
| `POST`   | `/`      | Create a new flight                         |
| `GET`    | `/`      | **Search flights** (see query params below) |
| `GET`    | `/:id`   | Get a flight by ID                          |
| `PATCH`  | `/:id`   | Update a flight                             |
| `DELETE` | `/:id`   | Delete a flight                             |

#### Flight Search Query Parameters

| Param           | Required           | Description                                            |
| --------------- | ------------------ | ------------------------------------------------------ |
| `from`          | ✅                 | Departure city ID                                      |
| `to`            | ✅                 | Arrival city ID                                        |
| `departureDate` | ✅                 | Date of departure (e.g., `2026-06-15`)                 |
| `noOfSeats`     | ✅                 | Minimum seats available (positive integer)             |
| `trip`          | ❌                 | `round` for round-trip; omit for one-way               |
| `returnDate`    | ✅ (if round-trip) | Return date (must be after `departureDate`)            |
| `sort`          | ❌                 | `price` to sort by price; defaults to sort by duration |
| `moreFlights`   | ❌                 | `yes` to remove the default limit of 5 results         |

**Example:**

```
GET /api/v1/flights?from=2&to=1&departureDate=2026-06-15&noOfSeats=1&sort=price
```

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** server running locally
- **npm**

### 1. Clone the repository

```bash
git clone <repository-url>
cd airline-booking-backend/flightSearchService
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `flightSearchService/` directory:

```env
PORT=3000
```

### 4. Configure the database

Edit `src/config/config.json` with your MySQL credentials:

```json
{
  "development": {
    "username": "root",
    "password": "YOUR_PASSWORD",
    "database": "flight_search_db_project",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

### 5. Create the database

```bash
npx sequelize-cli db:create
```

### 6. Run migrations

```bash
npx sequelize-cli db:migrate
```

### 7. Seed the database (optional)

```bash
npx sequelize-cli db:seed:all
```

This populates the database with sample cities, airports, airplanes, and flights.

### 8. Start the server

```bash
npm start
```

The server will start at `http://localhost:3000` (or whichever port is set in `.env`).

---

## 🛠️ Tech Stack

| Technology     | Purpose                         |
| -------------- | ------------------------------- |
| **Express.js** | Web framework                   |
| **Sequelize**  | ORM for MySQL                   |
| **MySQL**      | Relational database             |
| **dotenv**     | Environment variable management |
| **Nodemon**    | Auto-restart during development |

---

## 📝 Response Format

All API responses follow a consistent JSON structure:

```json
{
  "data": {},
  "success": true,
  "message": "Description of the result",
  "error": {}
}
```
