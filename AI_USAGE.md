# AI Assistance & Verification Log — Wayfarer

This document provides transparent disclosure of AI assistance utilized during the development of **Wayfarer — Honest Ratings, Fair Bookings**, following the assessment transparency guidelines.

---

## 1. AI Tools Utilized

- **Antigravity / Gemini 3.8 Flash & Reasoning Engine:** Utilized as an interactive pair programmer for monorepo scaffolding, mathematical formula formulation, PostgreSQL transaction design, test harness generation, and Next.js / Tailwind UI development.
- **TypeScript Compiler (`tsc`) & Vitest:** Utilized as the primary deterministic verification gates for code correctness, type-safety, and runtime behavior.

---

## 2. Development Tasks Assisted

1. **Mathematical Modeling:** Reviewing the Empirical Bayesian formula $\left(\frac{v}{v+m}\right) R + \left(\frac{m}{v+m}\right) C$ and verifying asymptotic properties, boundary limits, and division-by-zero guards.
2. **PostgreSQL Concurrency Architecture:** Crafting the row-level locking pattern with `SELECT ... FOR UPDATE` inside Prisma's interactive transaction pipeline.
3. **Seed Data Construction:** Generating deterministic seed data for Addis Ababa destinations with realistic Ethiopian cultural landmarks and calculated review counts.
4. **Automated Concurrency Testing:** Scaffolding the 20-request parallel execution harness using `Promise.all` and Supertest.
5. **Modern Travel UI:** Creating accessible, desktop-first Tailwind CSS components with clean typography, restrained shadows, visual occupancy meters, and user switching.

---

## 3. Example Prompts

### Example Prompt 1 (Concurrency Control):
> *"Design a concurrency-safe booking service in TypeScript with Prisma and PostgreSQL that prevents overbooking when 20 simultaneous HTTP requests attempt to reserve the last 2 seats on a tour slot. Explain why sequential checks fail and how row-level locking (`SELECT ... FOR UPDATE`) guarantees serializability without deadlocks."*

### Example Prompt 2 (Bayesian Place Ranking):
> *"Implement a pure TypeScript `RankingService` that computes the Bayesian weighted rating $(v/(v+m)) \times R + (m/(v+m)) \times C$. Write unit tests demonstrating that an established museum with 312 reviews and a 4.7 average outranks a brand new cafe with one 5-star review, and verify that zero-review edge cases never yield NaN."*

---

## 4. Verification & Validation Process

All AI-suggested code was rigorously verified using:
1. **Automated Unit & Integration Test Suites:** 23 automated tests covering ranking mathematics, edge cases, review uniqueness, and concurrent reservations.
2. **Execution Against Live PostgreSQL 17:** Tests were executed against a real local PostgreSQL database instance rather than in-memory mocks, verifying that actual database row locks were acquired and honored under concurrent load.
3. **TypeScript Strict Type Checking:** `tsc --noEmit` and production builds (`next build`) were verified for strict mode compliance.

---

## 5. Identification and Correction of an AI Suggestion

### The Issue Identified:
During early drafting of the error middleware for Zod validation errors, the initial code used a standard `err instanceof ZodError` check:

```ts
if (err instanceof ZodError) {
  return res.status(400).json({ error: "Validation error" });
}
```

### Why it Failed:
In an npm monorepo with multiple workspaces (`@wayfarer/shared` and `@wayfarer/api`), Zod classes were instantiated across workspace boundaries. Even though the thrown error was functionally a Zod validation error, `instanceof ZodError` evaluated to `false` due to differing prototype references between module instances. This caused Zod validation errors (e.g. invalid rating or blank review body) to fall through to the catch-all internal server error handler (returning `HTTP 500` instead of `HTTP 400`).

### The Correction:
The error middleware was refactored to inspect error signatures duck-typed across workspaces:

```ts
if (err instanceof ZodError || err?.name === "ZodError" || Array.isArray(err?.issues)) {
  const issues = err.issues || err.errors || [];
  return res.status(400).json({
    error: issues.length > 0 ? issues[0].message : "Validation error",
    code: "VALIDATION_ERROR",
    details: issues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join(".") : String(e.path),
      message: e.message,
    })),
  });
}
```
This ensured 100% reliable 400 validation responses across all endpoints regardless of package boundary resolution.
