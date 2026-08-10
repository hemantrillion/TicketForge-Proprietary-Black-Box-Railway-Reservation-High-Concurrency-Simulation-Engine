# 10 — Demo Scenarios & Proof Scripts

This document defines the live demonstration walkthroughs for graders, interviewers, or system evaluation sessions. Each scenario contrasts **Defenses OFF** vs **Defenses ON** live.

---

## Scenario 1: Volumetric Flash Sale Flood (#1 + #5)

### Objective
Demonstrate that an uncontrolled traffic spike crashes unthrottled servers, but with Rate Limiter (#5) + Load Balancer (#1) active, the platform remains fast and responsive for legitimate users.

### Step-by-Step Walkthrough
1. **Defense OFF**: Open Admin Dashboard -> Toggle Rate Limiter to `OFF`.
2. Click **Bombard Clicks** attack button (spikes 1,500 RPS).
3. Observe single backend replica CPU spike to 100%, latency degrade to >3,000ms, and HTTP 504 errors appear.
4. **Defense ON**: Toggle Rate Limiter to `ON` and set replica pool scaling to 3.
5. Click **Bombard Clicks** attack button.
6. Observe Nginx distributing allowed traffic cleanly across 3 replicas, rate limiter returning HTTP `429` for excess requests, and legitimate booking page loading in <50ms.
7. Grafana Dashboard shows live spike in `429` metric and stable HTTP `200` latency curve.

---

## Scenario 2: Seat Selection Contention & Double-Booking Guard

### Objective
Prove that under milliseconds-apart contention for the exact same high-demand seat, optimistic locking + Redis TTL + PostgreSQL unique key guarantees **zero double-bookings**.

### Step-by-Step Walkthrough
1. Open Seat Map UI showing Seat `A1` as `Available`.
2. Open Admin Dashboard -> Click **Trigger Seat Race Attack**.
3. Simulator fires 100 simultaneous POST `/api/seats/A1/hold` requests in the same millisecond.
4. Observe exact outcome:
   - Request 1: `201 Created` (Seat held for User 1, 5-minute countdown starts).
   - Requests 2–100: `409 Conflict` ("Seat A1 is currently held by another user").
5. User 1 submits booking with `X-Idempotency-Key: key-999` twice in rapid succession (double-click simulation).
6. Observe system returns `201 Created` for first request and existing booking reference for duplicate request, maintaining exactly 1 booking record in PostgreSQL `booking_seats`.

---

## Scenario 3: Zero-Downtime Canary Rollback (#3)

### Objective
Demonstrate shipping a code update to a live on-sale event using Canary routing, detecting a broken build, and performing an instant manual rollback without affecting stable users.

### Step-by-Step Walkthrough
1. Admin Dashboard -> Click **Deploy Canary Version (v2-broken)** to 10% traffic slice.
2. In Admin Dashboard -> Click **Canary User List** -> Click **Login as Canary User**.
3. As Canary User: Browse to event -> observe simulated error / bug on checkout page.
4. Switch to regular user tab -> observe regular user operates on `v1-stable` with zero errors.
5. Admin Dashboard -> Click **Trigger Manual Rollback**.
6. Traffic routing instantly reverts 100% traffic to `v1-stable`. Canary user refreshes and sees standard working checkout page.
