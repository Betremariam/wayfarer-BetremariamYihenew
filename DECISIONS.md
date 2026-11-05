# Architecture & Engineering Decisions — Wayfarer

This document explains the core software architecture and mathematical/database decisions implemented in **Wayfarer — Honest Ratings, Fair Bookings**.

---

## 1. Honest Place Ranking: Bayesian Weighted Rating Algorithm

### Why Plain Arithmetic Average is Insufficient
In naive discovery systems, places are ranked strictly by the arithmetic mean of user ratings:
$$\bar{R} = \frac{1}{n} \sum_{i=1}^{n} r_i$$

This creates severe real-world vulnerabilities:
1. **The Small Sample Anomaly (Cold-Start Gaming):** A newly opened cafe with exactly one 5-star review has an arithmetic average of `5.0`. Under naive sorting, this spot artificially outranks the National Museum of Ethiopia, which carries a stellar `4.70` average across `312` verified community reviews.
2. **Fragility to Review Bombing or Astroturfing:** A destination with 2 reviews can experience wild volatility with a single vote, whereas an established destination with hundreds of reviews represents hardened community consensus.
3. **Misleading Traveller Expectations:** Travellers sorting by "Top-Rated" expect battle-tested excellence, not unverified single-reviewer anomalies.

---

### The Bayesian Formula & Justification
Wayfarer implements an **Empirical Bayesian Weighted Rating** formula (analogous to the IMDB weighted formula and true posterior mean calculation):

$$\text{Weighted Rating} = \left(\frac{v}{v + m}\right) \times R + \left(\frac{m}{v + m}\right) \times C$$

Where:
- **$R$ (Observed Average):** The arithmetic mean rating of the specific destination ($\sum r_i / v$).
- **$v$ (Review Count):** The number of verified community reviews for the destination.
- **$m$ (Confidence Threshold / Prior Weight):** The minimum review count required before a destination's observed rating dominates its score. Set to **$m = 10$**.
- **$C$ (Prior Mean / Global Average):** The global average rating across all reviews in the entire destination catalog (dynamically computed from the database; defaults to `3.50` prior if zero reviews exist).

### Justification of $m = 10$
The parameter $m$ governs how quickly confidence transfers from the global prior $C$ to the observed average $R$:
- When $v = 1$, the place receives $\frac{1}{11} (\approx 9\%)$ weight on its own review and $\frac{10}{11} (\approx 91\%)$ weight on the global prior $C$. For a new cafe with 1 review of 5.0 and $C = 4.65$, its Bayesian score is pulled to `4.68`, preventing it from eclipsing established landmarks with hundreds of positive reviews.
- When $v = m = 10$, the score is the exact midpoint between the place's actual average and the global average (50% / 50%).
- When $v \gg m$ (e.g., National Museum with $v = 312$), $\frac{v}{v + m} = \frac{312}{322} \approx 96.9\%$, so the score reflects its true average ($4.70$) with near total confidence.
- $m = 10$ strikes the right balance for a citywide travel discovery platform: it avoids punishing genuinely great new places with unreachable thresholds (like $m=100$), while completely eliminating the 1-review anomaly.

---

## 2. Guaranteed Prevention of Overbooking: PostgreSQL Row-Level Locking

### The Vulnerability of Naive Booking Checks
In standard web applications, developers frequently perform:
1. `SELECT remainingSeats FROM slots WHERE id = $1`
2. `if (remainingSeats >= requested) { INSERT INTO bookings ... }`

Under concurrent load (e.g., 20 simultaneous requests arriving within a 10ms window for the last 2 seats), multiple application threads read the same stale capacity before any single insert completes. All 20 requests pass the condition, creating 20 bookings and overbooking the slot by 18 seats. This is a classic Time-of-Check to Time-of-Use (TOCTOU) race condition.

---

### The PostgreSQL Solution: Transaction Serialization with `SELECT ... FOR UPDATE`
Wayfarer guarantees zero overbooking using PostgreSQL interactive database transactions with exclusive row-level locking:

```ts
await prisma.$transaction(async (tx) => {
  // 1. Acquire exclusive lock on the target TourSlot row
  const [slot] = await tx.$queryRaw<TourSlot[]>`
    SELECT id, capacity, "placeId", "startsAt"
    FROM "tour_slots"
    WHERE id = ${slotId}
    FOR UPDATE
  `;

  if (!slot) throw new NotFoundError("Tour slot not found");

  // 2. Sum existing booked seats while holding the lock
  const aggregate = await tx.booking.aggregate({
    where: { slotId },
    _sum: { seats: true },
  });
  const bookedSeats = aggregate._sum.seats ?? 0;
  const remainingSeats = slot.capacity - bookedSeats;

  // 3. Strict capacity validation
  if (remainingSeats <= 0) {
    throw new SlotFullyBookedError("This tour slot is fully booked.");
  }
  if (requestedSeats > remainingSeats) {
    throw new InsufficientCapacityError(
      `Only ${remainingSeats} seat(s) remaining for this tour slot.`
    );
  }

  // 4. Insert booking and commit
  return await tx.booking.create({
    data: { slotId, userId, seats: requestedSeats },
  });
}, {
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  timeout: 10000,
});
```

### Why this Guarantees Correctness:
1. **Serialization at the Row Level:** The first transaction to execute `SELECT ... FOR UPDATE` acquires an exclusive row lock on the `tour_slots` row. Subsequent concurrent transactions trying to lock or update the same slot enter a wait queue in PostgreSQL until the holding transaction commits or rolls back.
2. **Zero Stale Reads:** Because the lock is acquired before aggregating existing bookings, each subsequent transaction reads the freshly committed sum from the preceding transaction.
3. **Automatic Rollback:** If remaining seats are insufficient, the service throws an application error (`SlotFullyBookedError` or `InsufficientCapacityError`), rolling back the transaction immediately without creating partial records.
4. **Friendly Client Responses:** Errors are translated to clean HTTP `409 Conflict` responses without leaking raw SQL errors or internal database state.

---

## 3. Concurrency Verification Test

The architecture was verified with an automated integration test against real PostgreSQL:
- Created a slot with capacity `10`.
- Seeded existing bookings of `8` seats (leaving exactly `2` seats remaining).
- Executed `20` concurrent HTTP booking requests simultaneously using `Promise.all`.
- **Result:** Exactly `2` requests succeeded (HTTP `201`), `18` were rejected with friendly `409` conflict responses, and total booked seats in the database never exceeded `10`.

---

## 4. Limitations & Future Improvements

1. **High-Contention Hotspots:** Row-level locking serializes bookings for a single slot. Under massive concurrent ticket drops (e.g. 5,000 requests/sec for a single concert), database lock queues can increase transaction latency.
   - *Future improvement:* Introduce a high-performance Redis atomic counter / token bucket reservation queue (`DECRBY`) that reserves seats before issuing the database write, or partition capacity across sub-pools.
2. **Idempotency Keys:** While `(placeId, userId)` is unique for reviews, repeated identical booking requests from a double-clicking client could result in two bookings if seats are available.
   - *Future improvement:* Add an `Idempotency-Key` header with a Redis/DB-backed cache of recent submission tokens.
3. **Read Replicas & Caching:** Calculating global mean $C$ and Bayesian scores on every request scales well for catalog sizes under 100,000 destinations, but for millions of destinations, $C$ should be cached in Redis with a 5-minute TTL, or Bayesian scores updated asynchronously via materialized views or event-driven review worker queues.

