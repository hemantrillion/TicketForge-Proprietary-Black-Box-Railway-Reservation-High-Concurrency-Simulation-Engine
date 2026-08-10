# 02 — Requirements: Scope Freeze (V1 / V2 / V3)

This is the single most important document in this set. Every other document assumes the boundaries drawn here. If it isn't listed under V1, it does not get built until V1 is complete, tested, and demoable — no exceptions, no "just this one small thing."

## The Scope-Lock Rule

> **While V1 is being built, no new feature, mechanism, attack, defense, or idea enters the build — regardless of how good it sounds.**

Any new idea that comes up during V1 development gets written into the **Parking Lot** (Section 4 of this document) and nothing else. It is not discussed for implementation, not prototyped "just to see," and not added to any phase's task list until V1 is fully complete and this document is revisited on purpose to plan V2. This rule exists because the single biggest risk to this project is not technical difficulty — it's scope creep from an idea-generation process that has already shown (across this whole conversation) it can produce more good ideas than any one version can hold.

---

## 1. V1 — What Gets Built First

V1's single goal: **prove the #1 → #5 → #3 request pipeline end-to-end, correctly, under simulated attack, with the ability to show a defended vs. undefended outcome live.** Nothing in V1 exists unless it serves that goal directly.

### 1.1 Core Booking Platform
- User registration and login (email + password only — no OAuth, no social login, no password reset flow)
- One seeded venue, one seeded event, with a fixed seat map (no multi-event catalog browsing UI beyond a simple list)
- Seat map view → seat selection → seat hold (TTL-based) → mock payment → booking confirmation
- Booking cancellation (basic — releases the seat)
- Idempotency key on booking and payment submission (prevents duplicate bookings from double-click/retry)
- Seat-level locking with an explicit, documented tie-break rule for two simultaneous claims on the same seat

### 1.2 #1 — Flash Sale / Traffic Spike Survival (V1 scope)
- Nginx as load balancer in front of 2–3 backend replicas
- Load balancing algorithm: round-robin and least-connections, selectable via config
- Fixed-size replica pool that can be manually scaled (`docker compose up --scale backend=N`) — **not** automated metric-driven autoscaling (that is V2)
- k6 load-test scenarios (ramp, spike, sustained) that can be triggered from the admin dashboard

### 1.3 #5 — API Rate Limiter & Gateway (V1 scope)
- Gateway middleware implementing both token bucket and sliding window algorithms, selectable
- Per-user and per-IP volumetric limiting only — counting requests, not analyzing behavior
- 429 response on limit breach
- **Behavioral detection (timing analysis, step-sequence checks, device fingerprinting, CAPTCHA) is explicitly V2** — V1 only counts requests, it does not judge how human they look

### 1.4 #3 — Zero-Downtime Deployment (V1 scope)
- Two environments (blue/green) with an Nginx-based traffic switch
- Canary deployment with a fixed, admin-defined list of test user IDs routed to the new version
- **Rollback in V1 is admin-triggered manually** from the dashboard, based on the admin watching the error rate — **automatic threshold-triggered rollback is V2**

### 1.5 Proving Ground (V1 scope)
Admin dashboard with:
- Attack buttons: bombard-with-clicks (volumetric, via k6), seat-race attack, replay attack, hold-abuse attack, broken-canary-deploy, forced blue-green switch
- Defense toggles: rate-limit on/off, blue-green/canary routing on/off
- Canary user list view + "log in as this user" to inspect what a canary user sees
- A simple before/after run log stored in the `audit_logs` table (see `05-database-design.md`), viewable as a plain list — **not** an auto-generated comparative visual report (V2 polish)

**Explicitly excluded from V1's Proving Ground:** kill-database / infra-failure simulators, bot-swarm / behavioral simulators, cache-flush simulators. These require mechanisms (#6 backup/failover, behavioral detection) that are not in V1.

### 1.6 Observability (V1 scope)
- Prometheus scraping all V1 services (gateway, backend replicas, rate limiter)
- Grafana with three dashboards: traffic/latency, rate-limiter rejections, canary vs. stable traffic split
- **No Alertmanager, no distributed tracing (OpenTelemetry) in V1** — both are V2

### 1.7 V1 Acceptance Definition
V1 is complete when a single grader/demo session can: load the seat map, book a seat normally; trigger a bombard-with-clicks attack and watch the rate limiter/load balancer hold; trigger a seat-race attack and see only one of two simultaneous claims succeed; trigger a broken canary deploy and watch the admin manually roll it back; and view all of this reflected live in Grafana. See `08-phase-plan.md` and `09-testing-plan.md` for the phase-by-phase and test-level breakdown of this same bar.

---

## 2. V2 — Explicitly Postponed

Nothing below is built until V1 (all of Section 1) is complete and demoed.

- **#2 — CDN & Caching System** (mini CDN, edge nodes, geographic latency demo) — postponed in full, including in the original six-project list, due to its structurally higher always-on resource cost (see prior cost analysis).
- **#4 — Self-Healing Website Monitor** (health checks, auto-restart, auto-replace, alerting)
- **#6 — Automatic Backup & Disaster Recovery** (standby database, failover promotion, scheduled backups, restore verification)
- The **kill-database / infra-failure simulator buttons** in the Proving Ground (depend on #6 existing first)
- **Behavioral / bot-detection layer**: timing analysis, step-sequence enforcement, device fingerprinting, CAPTCHA/proof-of-work, and the bot-swarm simulator that would test it
- **True metric-driven autoscaling** with cooldown control (V1 uses fixed, manually-scaled replicas)
- **Automatic canary rollback** triggered by live error-rate/latency thresholds (V1 rollback is manual)
- Alertmanager and distributed tracing (OpenTelemetry)
- Multi-event, multi-venue catalog browsing UI
- Payment/fraud-signal checks beyond the mock payment provider
- Auto-generated before/after simulation comparison reports (V1 has a plain log only)

V2's theme, per the earlier project-numbering decision: **merge #2, #4, #6 into a second major project** built on top of a completed V1, since together they form a coherent "resilience/recovery" layer distinct from the "live traffic pipeline" that V1 proves.

---

## 3. V3 — Stretch / Later

Not scoped in detail yet — listed only so these ideas have a home other than V1 or V2, and are not lost:

- ML/analytics anomaly detection and baseline "normal behavior" modeling (rule-based heuristics may arrive in V2; the ML version is V3)
- Virtual waiting room / admission queue for extreme on-sale moments
- Dynamic/surge pricing
- Multi-region CDN with real geographically distributed edge nodes
- Deeper payment fraud detection
- Full UI design polish, mobile responsiveness beyond basic usability
- Migration from Docker Compose to Kubernetes/k3s (only justified once V2's self-healing/autoscaling primitives make it worthwhile)

---

## 4. Parking Lot

Use this section during V1 development to capture any new idea the moment it appears, so it stops competing for attention with the current phase. Nothing here is scheduled — it's simply not lost. Revisit this list only when planning V2 or V3.

| Date added | Idea | Notes |
|---|---|---|
| — | — | — |
