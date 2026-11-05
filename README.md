# Wayfarer — Honest Ratings, Fair Bookings

Wayfarer is a full-stack travel discovery and guided-tour booking platform built for Addis Ababa, Ethiopia. It addresses two critical software engineering challenges:

1. **Honest Place Ranking:** An **Empirical Bayesian Weighted Rating algorithm** that prevents low-sample-size anomalies (e.g., a newly opened café with a single 5-star review outranking an established museum with 312 reviews and a 4.70 average).
2. **Guaranteed Prevention of Overbooking:** High-concurrency seat reservations backed by **PostgreSQL interactive transactions and row-level locking (`SELECT ... FOR UPDATE`)**, mathematically preventing overbooking under simultaneous requests.

---

## 🚀 Quick Start (Fresh Clone in 3 Commands)

Wayfarer is configured so that a fresh clone can be fully setup and run with three commands:

```bash
# 1. Install all monorepo dependencies
npm install

# 2. Push database schema, seed realistic Addis Ababa destinations/reviews, and compile all packages
npm run setup

# 3. Start both Backend API (:5000) and Next.js Web Frontend (:3000) concurrently
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/health](http://localhost:5000/health)

---

## 🏛️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, TanStack Query patterns |
| **Backend** | Node.js, Express.js, TypeScript, REST API Architecture, Zod schema validation |
| **ORM & Database** | Prisma ORM, PostgreSQL (with row-level locking & ACID transactions) |
| **Testing** | Vitest, Supertest, Concurrency Integration Test Harness (20 simultaneous HTTP requests) |
| **Monorepo** | npm Workspaces (`@wayfarer/web`, `@wayfarer/api`, `@wayfarer/shared`) |

---

## 📐 Architecture Overview

```
wayfarer/
├── apps/
│   ├── web/               # Next.js 14 App Router desktop-first interface
│   │   ├── src/app/       # Pages, layout, globals
│   │   ├── src/components/# PlaceCard, TourBookingCard, ReviewSection, UserSwitcher, etc.
│   │   ├── src/context/   # UserContext for "Acting As" demo persona switching
│   │   └── src/lib/       # API client with X-User-Id injection
│   └── api/               # Express REST API
│       ├── src/controllers# Thin controllers delegating to services
│       ├── src/services/  # RankingService, BookingService, ReviewService, PlaceService
│       ├── src/middlewares# Centralized error handler & Zod validation
│       └── src/tests/     # Vitest & Supertest suites (concurrency, ranking, reviews, places)
├── packages/
│   └── shared/            # Shared TypeScript interfaces, DTOs, and Zod schemas
├── prisma/
│   ├── schema.prisma      # Relational PostgreSQL models with constraints & indexes
│   └── seed.ts            # Deterministic Addis Ababa seed dataset (1,093 reviews)
├── DECISIONS.md           # Deep-dive justification of Bayesian ranking & row locking
├── AI_USAGE.md            # Transparent disclosure of AI tooling and verification
├── .env.example           # Environment template with safe default configuration
└── package.json           # Root workspace configuration
```

---

## 🧮 1. Honest Ranking Algorithm (Bayesian Weighted Score)

Discovery platforms using standard arithmetic mean ($\sum r_i / n$) suffer from severe cold-start distortions: a place with one 5-star review receives `5.00` and tops the search results ahead of a world-famous museum with 312 reviews and a `4.70` average.

Wayfarer implements an **Empirical Bayesian Weighted Rating** formula:

$$\text{Weighted Rating} = \left(\frac{v}{v + m}\right) \times R + \left(\frac{m}{v + m}\right) \times C$$

Where:
- **$R$:** Observed average rating of the destination.
- **$v$:** Total number of reviews for the destination.
- **$m = 10$:** Minimum review confidence threshold.
- **$C \approx 4.65$:** Dynamically computed global mean across all reviews in the system.

### Verified Behavior:
| Destination | Reviews ($v$) | Raw Average ($R$) | Bayesian Score | Rank |
|---|---|---|---|---|
| **National Museum of Ethiopia** | **312** | **4.70** | **4.70** | **#1** |
| **Buna Heritage Coffee House** | **1** | **5.00** | **4.68** | **#2 (Pulled to mean)** |

*For complete mathematical proofs and parameter justification, see [DECISIONS.md](DECISIONS.md).*

---

## 🔒 2. Tour Booking Concurrency Protection (Zero Overbooking)

Wayfarer guarantees that no tour slot can ever exceed its capacity, even under intense concurrent traffic.

### Transaction Serialization Pattern:
1. Begins an ACID database transaction.
2. Acquires an **exclusive PostgreSQL row lock** on the tour slot row using parameterized raw SQL:
   ```sql
   SELECT id, capacity, "placeId", "startsAt"
   FROM "tour_slots"
   WHERE id = $1
   FOR UPDATE;
   ```
3. Calculates current booked seats while holding the lock.
4. Validates requested seat count against remaining capacity.
5. If seats are available, inserts the booking and commits.
6. If the slot is full, aborts and rolls back, returning a friendly `409 Conflict` response without exposing raw database errors.

### Parallel Integration Concurrency Test:
An automated test in `apps/api/src/tests/concurrency.test.ts`:
1. Creates a tour slot with capacity `10`.
2. Seeds initial bookings totaling `8` seats (leaving `2` remaining).
3. Fires `20` concurrent HTTP booking requests simultaneously (`Promise.all`).
4. **Result:** Exactly `2` requests succeed (`201 Created`), `18` requests are rejected (`409 Conflict`), and final booked seats in PostgreSQL equals exactly `10`.

---

## 👥 3. "Acting-As" User Persona Switcher

No passwords or authentication are required:
- Exactly three demo personas are seeded:
  - **Sara Tadesse**
  - **Dawit Kebede**
  - **Bethlehem Tilahun**
- The top header provides an interactive switcher that updates frontend state and persists the active user in `localStorage`.
- All API requests attach the selected user's ID via the `X-User-Id` header.
- The backend validates the user ID against the database (rejecting forged or non-existent IDs).
- Reviews and tour reservations are recorded under the active persona.
- If a user previously reviewed a place, submitting another review automatically updates their existing review rather than duplicating it (enforced by `@@unique([placeId, userId])`).

---

## 🏙️ Demonstration Dataset (Addis Ababa, Ethiopia)

The database seed command generates 10 realistic destinations:
1. **National Museum of Ethiopia** (History — Home of Lucy / Dinkinesh, 312 reviews, 4.70 avg)
2. **Holy Trinity Cathedral** (History — Imperial tombs and stained glass, 120 reviews, 4.80 avg)
3. **Unity Park** (History — Grand Palace compound and botanical gardens, 180 reviews, 4.75 avg)
4. **Entoto Park** (Nature — High-altitude eucalyptus eco-park, 95 reviews, 4.60 avg)
5. **Red Terror Martyrs Memorial Museum** (History — Memorial at Meskel Square, 88 reviews, 4.85 avg)
6. **Ethnological Museum** (History — Haile Selassie's former palace, 75 reviews, 4.60 avg)
7. **Mount Entoto** (Nature — 3,200m peak with panoramic vistas, 60 reviews, 4.50 avg)
8. **Meskel Square** (History — Historic public amphitheater, 110 reviews, 4.40 avg)
9. **Friendship Park** (Nature — Musical fountains and urban gardens, 52 reviews, 4.30 avg)
10. **Buna Heritage Coffee House** (Food — Traditional jebena ceremony café, exactly 1 review, 5.00 avg)

---

## 🧪 Automated Testing

All tests run via a single command from the monorepo root:

```bash
npm test
```

### Test Suites (23 Total Tests):
- **Ranking Tests (`ranking.test.ts`):** Verifies Bayesian formula, 1-review cafe vs 312-review museum, asymptotic convergence, and zero-review non-NaN guards.
- **Places API Tests (`places.test.ts`):** Verifies backend category filtering (`category=History`), top-rated Bayesian sorting, and place detail retrieval.
- **Review Tests (`reviews.test.ts`):** Verifies review creation, review updates for existing users, `@@unique([placeId, userId])` constraint enforcement, and input validations.
- **Concurrency Tests (`concurrency.test.ts`):** Executes 20 simultaneous HTTP requests against PostgreSQL, verifying zero overbooking and friendly rejection responses.

Run dedicated concurrency test:
```bash
npm run test:concurrency
```

---

## 📡 API Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | API service health check |
| `GET` | `/api/users` | List demo actors for user switcher |
| `GET` | `/api/places` | Filter by `category`, sort by `top-rated`, `most-reviews`, `newest` |
| `GET` | `/api/places/:id` | Place details with tour slots, reviews, and rating stats |
| `GET` | `/api/places/:id/tour-slots` | Tour slots for a place with live remaining seats |
| `POST` | `/api/tour-slots/:id/bookings` | Concurrency-safe seat reservation (`X-User-Id` header required) |
| `GET` | `/api/places/:id/reviews` | Reviews for a destination |
| `POST` | `/api/places/:id/reviews` | Upsert review (`X-User-Id` header required) |
| `PUT` | `/api/places/:id/reviews` | Update review (`X-User-Id` header required) |

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/wayfarer?schema=public"
TEST_DATABASE_URL="postgresql://postgres:1234@localhost:5432/wayfarer_test?schema=public"
PORT=5000
NODE_ENV=development
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

---

## ⚠️ Known Limitations & Future Work
- **High-Contention Locks:** For extreme ticket drops (>5,000 requests/sec), an in-memory Redis atomic counter (`DECRBY`) can reserve seats ahead of database serialization.
- **Idempotency Keys:** Adding an `Idempotency-Key` header prevents duplicate client-side double clicks.
- **Materialized Views:** For datasets exceeding 100,000 destinations, caching the global prior $C$ or computing Bayesian scores asynchronously via background workers will optimize read throughput.
