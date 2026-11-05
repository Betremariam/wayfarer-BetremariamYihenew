# AI Usage & Development Contributions — Wayfarer

This document explains how AI tools supported the development of **Wayfarer — Honest Ratings, Fair Bookings**, and highlights the technical decisions, implementation, and verification work I personally contributed.

## 1. AI Tools Used

- **ChatGPT:** Used for technical guidance, exploring alternative solutions, reviewing implementation approaches, and understanding complex concepts.
- **Claude Code:** Used as a coding assistant for selected implementation tasks, code generation, debugging, and improving existing components.
- **TypeScript Compiler & Vitest:** Used to verify type safety and test application behavior.

AI tools were used as development assistants. Technical decisions and final implementation choices were reviewed and validated throughout development.

## 2. My Development Contributions

I actively participated in the development process, particularly in the following areas:

1. **Architecture & Technology Decisions:** Established the monorepo structure separating the Next.js frontend, Express API, shared package, and Prisma database layer. Selected the technology stack based on the assignment requirements.

2. **Database Design:** Worked on the data model and relationships between places, users, reviews, tour slots, and bookings. Ensured that database constraints support the application's business rules.

3. **Ranking Logic:** Reviewed and implemented the Empirical Bayesian ranking approach. I focused on understanding how review count influences ratings and why a place with one 5-star review should not automatically outrank an established place.

4. **Booking Logic:** Worked on the booking workflow and its concurrency requirements. Reviewed the PostgreSQL row-locking approach to ensure that simultaneous booking requests cannot reserve more seats than are available.

5. **Seed Data & Application Features:** Prepared and reviewed the Addis Ababa destination data, user records, categories, and sample reviews. Also worked on connecting the frontend features with the backend API.

6. **Testing & Debugging:** Ran the application, investigated unexpected behavior, reviewed test failures, and made corrections to ensure the implementation met the assignment requirements.

## 3. Examples of AI Assistance

**Example 1 — Booking Concurrency**

Prompt:
> Help me implement a concurrency-safe booking service using Prisma and PostgreSQL. Explain how SELECT FOR UPDATE works and how to prevent overbooking when multiple requests attempt to reserve the remaining seats.

My contribution: Reviewed the proposed transaction approach, examined the database locking behavior, and verified the booking logic through concurrent requests.

**Example 2 — Bayesian Ranking**

Prompt:
> Help me implement an Empirical Bayesian ranking algorithm that considers both the average rating and number of reviews. Include edge cases and unit tests.

My contribution: Evaluated the formula, checked its behavior with different review counts, and verified that established places rank appropriately against newly reviewed places.

## 4. Verification & Testing

AI-generated suggestions were not accepted without verification.

The application was checked using:

- **Automated tests:** 23 tests covering ranking, edge cases, review uniqueness, and booking behavior.
- **PostgreSQL 17:** Tested against a real PostgreSQL database to verify database-level transaction behavior.
- **TypeScript:** Used `tsc --noEmit` to identify type errors.
- **Production build:** Checked the Next.js application using `next build`.

I reviewed the test results and addressed issues discovered during development.

## 5. Example of an AI Suggestion I Corrected

During development, an initial suggestion for handling Zod validation errors used:

```ts
if (err instanceof ZodError) {
  return res.status(400).json({ error: "Validation error" });
}
```

During testing, I identified that some validation errors were not being recognized by the error middleware across workspace boundaries. As a result, certain invalid requests returned HTTP 500 instead of HTTP 400.

I investigated the issue and updated the middleware to recognize Zod validation errors using additional error-signature checks.

This ensured that validation failures were handled consistently and returned appropriate client error responses.

## 6. Final Note

AI tools helped accelerate development and explore technical solutions, but they did not replace my responsibility as the developer.

I made the architectural decisions, reviewed the generated implementations, investigated problems, and verified the final application against the assignment requirements.

I take responsibility for the code and technical decisions included in this submission.