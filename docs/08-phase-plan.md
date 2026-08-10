# 08 — Micro-Phase Development Plan

Guiding Principle: **Each phase is a self-contained, independently testable block.** A block must be fully functional and demonstrable on its own before the next block is allowed to depend on it. No later phase is permitted to require changes to an earlier phase's internal implementation — only additive integration through defined interfaces (event bus, API contracts, config toggles).

---

## Phase 0 — Foundation Block
- **Goal**: A bookable event exists, end-to-end, with no resilience or attack features at all.
- **Components**:
  - Event, seat, user, booking data models (PostgreSQL schema).
  - Basic booking flow: browse → select seat → pay (mocked) → confirm.
  - Single backend instance, no load balancer yet.
- **Independence Proof**: The app works fully for one user, unattacked, on its own.

---

## Phase 1 — Traffic Control Block (#1 Flash Sale)
*(Builds on Phase 0, does not modify it)*
- **Goal**: The booking flow can survive concurrent load.
- **Components**:
  - Nginx load balancer in front of multiple backend replicas.
  - Load balancing algorithms (round-robin, least-connections) — selectable via config.
  - Basic replica scaling (`docker compose up --scale backend=N`).
  - k6 load-testing scenarios wired up.
- **Independence Proof**: Phase 0's booking flow runs unmodified behind the load balancer; only the entry point changed, not the booking logic.

---

## Phase 2 — Rate & Behavior Control Block (#5 Rate Limiter)
- **Goal**: The system can distinguish and throttle volumetric abuse.
- **Components**:
  - Gateway rate-limiter middleware (token bucket + sliding window, both implemented).
  - Per-user and per-IP volumetric rate limiting.
  - Bot-simulation service to generate test traffic against Phase 1's infrastructure.
- **Independence Proof**: Rate limiting can be toggled off entirely and Phase 1's load-balanced flow still functions exactly as before.

---

## Phase 3 — Concurrency & Integrity Block
- **Goal**: The booking logic itself is correct under simultaneous contention.
- **Components**:
  - Seat locking with Redis TTL hold and automatic expiry release.
  - Idempotency keys on booking/payment submission endpoints (`X-Idempotency-Key`).
  - Seat-race simulator to prove correctness under contention.
- **Independence Proof**: Touches only booking-service internals behind its existing interface; gateway, load balancer, and rate limiter are untouched.

---

## Phase 4 — Deployment Safety Block (#3 Blue-Green/Canary)
- **Goal**: New versions can be shipped without risking the live system.
- **Components**:
  - Blue-green environment setup and traffic switch via Nginx.
  - Canary deployment with defined test-user routing (`X-Canary-User`) and manual/admin rollback.
  - Admin dashboard's canary user list + "login as" feature.
- **Independence Proof**: Deploy mechanism operates on infrastructure, not on booking logic — Phases 0–3 remain deployable as-is through this new mechanism without modification.

---

## Phase 5 — Data Resilience Block (V2 Scoped Primitives)
- **Goal**: System infrastructure resilience (standby DB, backups, health checks).
- **Components**:
  - Standby database + failover promotion.
  - Scheduled backups + restore verification.
  - Health checks + auto-restart/replace.
- **Independence Proof**: Operates underneath the data layer's existing interface (same queries, same schema); nothing above it needs to know a failover happened.

---

## Phase 6 — Proving Ground Block
- **Goal**: Every attack from Sections 4–5 can be triggered on demand, and every defense from Section 6 can be toggled on/off, visibly.
- **Components**:
  - Admin dashboard: attack buttons row, defense toggle row, feature kill-switch.
  - Admin dashboard button clicks reach backend via real HTTPS calls; event bus wires requests internally to simulators.
  - Simulation run logging and plain before/after audit log output.
- **Independence Proof**: Only calls into interfaces exposed by Phases 1–5; adds no new booking logic and cannot break the underlying platform by design.

---

## Phase 7 — Observability Block
- **Goal**: Every phase's behavior, especially during simulated attacks, is visible and measurable.
- **Components**:
  - Prometheus scraping metrics across all V1 services (gateway, backend replicas, rate limiter).
  - Grafana dashboards: traffic/latency, rate-limiter rejections, canary vs. stable traffic split.
- **Independence Proof**: Purely observational — instrumentation is additive (metrics emitted alongside existing logic) and can be disabled entirely with zero effect on booking or defense functionality.
