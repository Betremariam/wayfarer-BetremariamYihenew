# Architecture & Engineering Decisions

**Wayfarer — Honest Ratings, Fair Bookings**

This document outlines the key engineering decisions behind Wayfarer, focusing on two problems at the heart of the application: trustworthy place rankings and reliable tour reservations under concurrent requests.

The goal was not to introduce unnecessary complexity, but to choose approaches that are understandable, testable, and appropriate for the application's requirements.

---

## 1. Place Ranking: Empirical Bayesian Rating

### The Problem with Simple Averages

Sorting places by their arithmetic average can produce misleading results.

Consider two destinations:

| Destination | Average Rating | Reviews |
|---|---:|---:|
| National Museum | 4.70 | 312 |
| New Café | 5.00 | 1 |

A simple average places the new café first, despite having only one review. This treats a single opinion with the same confidence as hundreds of reviews.

For a travel discovery application, ranking should consider both rating quality and the amount of feedback supporting it.

### The Approach

Wayfarer uses an Empirical Bayesian weighted rating formula:

\[
WR = \frac{v}{v+m}R + \frac{m}{v+m}C
\]

Where:

- **R** — The place's average rating.
- **v** — Number of reviews for the place.
- **m** — Confidence threshold, set to 10.
- **C** — Global average rating across all reviews in the catalog.

When the catalog has no reviews, the prior defaults to 3.50.

The formula combines the observed rating with the global average. Places with fewer reviews receive more influence from the global average, while places with substantial review history are ranked increasingly according to their own ratings.

### Why Choose m = 10?

The value of `m` controls how quickly a place's own rating gains influence.

For example:

| Review Count | Weight of Own Rating | Weight of Global Average |
|---:|---:|---:|
| 1 | 9.09% | 90.91% |
| 5 | 33.33% | 66.67% |
| 10 | 50.00% | 50.00% |
| 50 | 83.33% | 16.67% |
| 312 | 96.89% | 3.11% |

With a global average of 4.65, a new café with one 5-star review receives:

\[
WR = \frac{1}{11}(5.0)+\frac{10}{11}(4.65)
\]

\[
WR \approx 4.68
\]

Its score is therefore lower than the established museum's 4.70 rating.

I chose 10 as a practical balance: new destinations are not permanently disadvantaged, but a small number of positive reviews cannot immediately dominate the rankings.

### Trade-off

Bayesian ranking introduces a dependency on the global average. If the overall review distribution changes, the prior changes too.

For the current application, calculating the global average from the database is sufficiently straightforward. If the catalog grows significantly, this value could be cached or maintained through an aggregated review statistic.

---

## 2. Booking Integrity: PostgreSQL Row-Level Locking

### The Problem: Concurrent Reservations

A naive booking implementation might follow this sequence:

1. Read the remaining seats.
2. Check whether enough seats are available.
3. Insert a booking