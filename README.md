# 🧭 Wayfarer — Honest Ratings, Fair Bookings

**Discover places worth visiting. Book tours with confidence.**

Wayfarer is a full-stack travel discovery and guided-tour booking application built around Addis Ababa, Ethiopia.

It helps travellers discover interesting destinations, explore community reviews, and reserve guided tours without worrying about misleading ratings or overbooked experiences.

The idea behind Wayfarer is simple: **ratings should be trustworthy, and a confirmed booking should mean an available seat.**

## ✨ What You Can Do

- 🏛️ **Explore Places:** Discover destinations across Addis Ababa, organized into History, Nature, and Food categories.
- ⭐ **Find the Best Places:** Browse destinations ranked using an Empirical Bayesian rating algorithm that considers both average ratings and review counts.
- 📝 **Share Your Experience:** Leave a 1–5 star rating with a short review. Updating your review replaces your previous one.
- 🎟️ **Book Guided Tours:** Browse available tour times, check remaining seats, and reserve your preferred experience.
- 👤 **Switch Between Users:** Try the application using three demo profiles without creating an account.

## 🚀 Getting Started

Want to run Wayfarer locally? Follow these steps.

### Prerequisites

Make sure you have the following installed:

- Node.js (npm included)
- PostgreSQL 17
- Git

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd wayfarer
```

### 2. Install and configure

Install the dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and configure your PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/wayfarer?schema=public"
TEST_DATABASE_URL="postgresql://postgres:1234@localhost:5432/wayfarer_test?schema=public"
PORT=5000
NODE_ENV=development
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

Make sure the PostgreSQL databases exist before proceeding.

### 3. Set up and run

Prepare the database, generate the seed data, and build the packages:

```bash
npm run setup
```

Start the application:

```bash
npm run dev
```

That's it! You're ready to explore Wayfarer.

| Service | Address |
|---|---|
| Web application | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| API health check | http://localhost:5000/health |

---

## 🖥️ Application Overview

### Discover destinations

Explore Addis Ababa through a collection of destinations. Filter by category or sort places by their weighted ratings.

### Explore a destination

View detailed information, ratings, community reviews, and available guided tours.

### Book a guided tour

Check the remaining seats for each tour slot and reserve your preferred time. Fully booked slots are clearly indicated.

### Share your experience

Rate destinations and leave short reviews. Each user has one review per destination, which can be updated whenever their experience changes.

### Switch between demo users

Use the user switcher to explore the application as Sara Tadesse, Dawit Kebede, or Bethlehem Tilahun.

---

## 🏗️ Technology Stack

Wayfarer uses a TypeScript-based monorepo architecture.

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL 17, Prisma ORM |
| Validation | Zod |
| Testing | Vitest, Supertest |
| Monorepo | npm Workspaces |

## 📁 Project Structure

```text
wayfarer/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   └── src/
│   │       ├── app/         # Pages and layouts
│   │       ├── components/  # Reusable UI components
│   │       ├── context/     # User context
│   │       └── lib/         # API client
│   │
│   └── api/                 # Express backend
│       └── src/
│           ├── controllers/ # HTTP request handlers
│           ├── services/    # Business logic
│           ├── middlewares/ # Validation and error handling
│           └── tests/       # Automated tests
│
├── packages/
│   └── shared/              # Shared types and schemas
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data
│
├── DECISIONS.md              # Architecture and engineering decisions
├── AI_USAGE.md               # AI assistance and verification log
├── .env.example              # Environment configuration template
├── package.json
└── README.md
```

---

## 🧠 Engineering Highlights

Wayfarer was designed around two important engineering challenges.

### 1. Fairer Ratings with Bayesian Ranking

A simple average can make a destination with one 5-star review rank above a popular destination with hundreds of positive reviews.

Wayfarer addresses this using an Empirical Bayesian Weighted Rating:

\[
WR = \frac{v}{v+m}R + \frac{m}{v+m}C
\]

Where:

- `R` — Average rating of the destination.
- `v` — Number of reviews.
- `m` — Confidence threshold (10).
- `C` — Global average rating across the catalog.

This balances a destination's own rating against the overall rating distribution.

**Example:**

| Destination | Reviews | Average | Weighted Rating |
|---|---:|---:|---:|
| National Museum of Ethiopia | 312 | 4.70 | 4.70 |
| Buna Heritage Coffee House | 1 | 5.00 | 4.68 |

A single positive review does not automatically make a new destination the highest-ranked place.

For the mathematical explanation and design rationale, see [DECISIONS.md](DECISIONS.md).

### 2. Reliable Bookings Without Overbooking

What happens when 20 people try to book the last two seats simultaneously?

A simple availability check is not enough. Multiple requests could read the same remaining capacity and all attempt to reserve it.

Wayfarer uses PostgreSQL transactions and row-level locking through `SELECT ... FOR UPDATE`.

The booking process:

1. Starts a database transaction.
2. Locks the requested tour slot.
3. Calculates the currently booked seats.
4. Checks the remaining capacity.
5. Creates the booking if enough seats are available.
6. Commits the transaction or rolls it back if the request cannot be fulfilled.

This ensures that concurrent booking requests for the same slot cannot exceed its capacity.

---

## 🏙️ Explore Addis Ababa

The application includes 10 seeded destinations across three categories.

| Destination | Category |
|---|---|
| National Museum of Ethiopia | History |
| Holy Trinity Cathedral | History |
| Unity Park | History |
| Entoto Park | Nature |
| Red Terror Martyrs Memorial Museum | History |
| Ethnological Museum | History |
| Mount Entoto | Nature |
| Meskel Square | History |
| Friendship Park | Nature |
| Buna Heritage Coffee House | Food |

The seed dataset includes demo users, reviews, and tour information to make the application ready to explore.

---

## 🧪 Running Tests

Testing focuses on the application's most important business rules.

Run the complete test suite:

```bash
npm test
```

The project currently includes 23 automated tests covering:

| Test Suite | What It Covers |
|---|---|
| Ranking | Bayesian calculations, review counts, and edge cases |
| Places | Category filtering, sorting, and place details |
| Reviews | Review creation, updates, and uniqueness |
| Bookings | Concurrent reservations and capacity protection |

To run the dedicated booking concurrency test:

```bash
npm run test:concurrency
```

The concurrency scenario starts with a tour slot containing 8 booked seats out of 10, then sends 20 simultaneous booking requests.

Expected result:

- 2 successful bookings.
- 18 rejected requests.
- 10 total booked seats.
- No overbooking.

The integration tests use PostgreSQL rather than relying solely on mocked database behavior.

---

## 📡 API Overview

The backend exposes the following REST endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API status |
| GET | `/api/users` | Retrieve demo users |
| GET | `/api/places` | List, filter, and sort places |
| GET | `/api/places/:id` | Get place details |
| GET | `/api/places/:id/tour-slots` | Get tour availability |
| POST | `/api/tour-slots/:id/bookings` | Reserve tour seats |
| GET | `/api/places/:id/reviews` | Retrieve place reviews |
| POST | `/api/places/:id/reviews` | Create or update a review |
| PUT | `/api/places/:id/reviews` | Update an existing review |

Booking and review requests require the `X-User-Id` header to identify the active demo user.

---

## 🔮 Future Improvements

Some areas I'd like to explore beyond the current implementation:

- **Booking Idempotency:** Prevent duplicate reservations caused by repeated requests or double-clicks.
- **Improved Scalability:** Introduce caching for frequently accessed ranking data.
- **Reservation Queues:** Explore queue-based booking workflows for high-demand tour slots.
- **Mobile Experience:** Extend the desktop-first interface into a fully responsive mobile experience.

---

## 📚 Additional Documentation

Interested in the implementation details?

- [Architecture & Engineering Decisions](DECISIONS.md) — Ranking mathematics, transaction design, and engineering trade-offs.
- [AI Usage & Development Contributions](AI_USAGE.md) — AI assistance, development contributions, and verification process.

---

## 👨‍💻 About This Project

Wayfarer was developed as part of the **Rago Software Solutions Intern Full-Stack Engineer Take-Home Assessment**.

The project focuses on building practical software solutions to real-world problems while maintaining clear architecture, reliable database operations, and testable business logic.

**Built with care in Addis Ababa, Ethiopia. 🇪🇹**