# 03 — System Architecture (V1)

This document turns the conceptual pipeline from `01-problem-statement.md` into concrete architecture: every component as a box, every connection labeled.

## 3.1 Full System Diagram

![System Architecture](../diagrams/01_system_architecture.png)

Layers, top to bottom / left to right:

- **Client Layer** — the user's browser (booking UI) and the admin's browser (dashboard), each a separate React application.
- **Gateway Layer** — Nginx (reverse proxy, load balancer, blue-green switch point) and the Rate Limiter middleware sitting in front of it; the Admin API as a separate, auth-gated entry point.
- **Backend Services** — five independently deployable services: Events, Seats, Bookings, Payments, Users. Each runs as multiple replicas behind Nginx.
- **Data Layer** — Redis (seat holds, rate-limit counters, cache, and the internal event bus) and PostgreSQL (primary; standby is V2).
- **Proving Ground** — the admin-only layer: the internal event bus, attack simulators, and the defense orchestrator (toggle state store).
- **Observability** — Prometheus, Grafana, Alertmanager (V2), OpenTelemetry (V2). V1 wires Prometheus and Grafana only, but the diagram shows the full intended shape.

## 3.2 Service Boundaries

Before any code is written, every service must have an unambiguous answer to five questions: what it owns, what it can read, what it exposes, what it publishes, what it consumes. No service is allowed to reach into another service's database tables directly — all cross-service data access goes through that service's API or an event.

### Events Service
- **Owns:** `events`, `venues` tables (writes)
- **Can read:** `events`, `venues` only
- **Exposes:** `GET /events`, `GET /events/:id`
- **Publishes:** none in V1
- **Consumes:** none in V1

### Seat Service
- **Owns:** `seats`, `seat_holds` tables (writes)
- **Can read:** `seats`, `seat_holds`; reads `events` via the Events Service API (not direct table access)
- **Exposes:** `GET /events/:id/seats`, `POST /seats/:id/hold`, `DELETE /seats/:id/hold`
- **Publishes:** `seat.held`, `seat.released`, `seat.hold.expired` (to the event bus)
- **Consumes:** none in V1

### Booking Service
- **Owns:** `bookings`, `booking_seats` tables (writes)
- **Can read:** `bookings`, `booking_seats`; reads seat state via the Seat Service API; reads user identity via the Auth/User Service API
- **Exposes:** `POST /book`, `GET /bookings/:id`, `POST /bookings/:id/cancel`
- **Publishes:** `booking.created`, `booking.cancelled` (to the event bus)
- **Consumes:** `seat.hold.expired` (to invalidate a pending booking attempt if the hold expired mid-flow)

### Payment Service
- **Owns:** `payments` table (writes)
- **Can read:** `payments`; reads booking state via the Booking Service API
- **Exposes:** `POST /pay`
- **Publishes:** `payment.succeeded`, `payment.failed` (to the event bus)
- **Consumes:** `booking.created` (to know a payment is expected)

### User Service
- **Owns:** `users` table (writes)
- **Can read:** `users` only
- **Exposes:** `POST /login`, `POST /register`, `GET /users/me`
- **Publishes:** none in V1
- **Consumes:** none in V1

### Gateway (Nginx + Rate Limiter middleware)
- **Owns:** no application data; owns rate-limit counters in Redis (namespaced, not shared with any service)
- **Can read:** Redis rate-limit keys only
- **Exposes:** the public-facing surface for all of the above (reverse-proxied)
- **Publishes:** `ratelimit.rejected` (to the event bus, for the Proving Ground's simulation reporter)
- **Consumes:** `defense.toggle.ratelimit` (enable/disable from the Defense Orchestrator)

### Admin API
- **Owns:** no application data directly; writes to `audit_logs`
- **Can read:** `audit_logs`; reads aggregate metrics via Prometheus's API
- **Exposes:** `GET /admin/metrics`, `POST /admin/attack/:type`, `POST /admin/toggle/:mechanism`, `GET /admin/canary-users`
- **Publishes:** `attack.trigger.*`, `toggle.set.*` (to the event bus)
- **Consumes:** none directly — simulators and the defense orchestrator report back via `audit_logs` writes, not direct responses

### Attack Simulators (five, one per category — see `01-problem-statement.md` §4)
- **Own:** no persistent data of their own; write run results to `audit_logs`
- **Can read:** nothing beyond their own run configuration
- **Expose:** nothing publicly — triggered only via the event bus
- **Publish:** `simulation.started`, `simulation.completed` (with outcome metrics)
- **Consume:** `attack.trigger.<type>`

### Defense Orchestrator
- **Owns:** the toggle state store (a small Redis-backed key/value set — one boolean per defense mechanism)
- **Can read:** its own toggle state store only
- **Exposes:** nothing publicly — triggered only via the event bus
- **Publishes:** `defense.toggle.<mechanism>` (consumed by the gateway and by Nginx's blue-green controller)
- **Consumes:** `toggle.set.<mechanism>`

## 3.3 Why These Boundaries Matter
Every service above can be built, tested, and demoed in isolation without any other service existing yet, because none of them reach into another's storage directly — they only call defined APIs or react to defined events. This is what makes the phase independence claimed in `08-phase-plan.md` actually true rather than aspirational.
