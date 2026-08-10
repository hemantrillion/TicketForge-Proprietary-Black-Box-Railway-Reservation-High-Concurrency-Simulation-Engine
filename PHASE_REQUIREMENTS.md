# PHASE_REQUIREMENTS.md - Phase Objectives & Boundaries

This document defines the strict phase requirements for building TicketForge step-by-step. Each completed phase is frozen before moving to the next.

---

## Scope Freeze Rule
While V1 is being built, **no new feature, mechanism, attack, defense, or idea enters the build**—regardless of how good it sounds.

Any new idea during V1 development must be recorded in the Parking Lot in `docs/02-requirements.md` and postponed to V2/V3.

---

## Phase Summary Table

| Phase | Focus Area | Core Features | Freezing Status |
|---|---|---|---|
| **Phase 0** | Foundation Block | Postgres schema, Express microservices structure, single user browse -> hold -> pay -> confirm flow | **FROZEN & COMPLETE** ✅ |
| **Phase 1** | Traffic Control (#1) | Nginx Load Balancer, 3 backend replicas, round-robin / least-connections, k6 load scenarios | **NEXT IN QUEUE** ⏳ |
| **Phase 2** | Rate Limiter (#5) | Gateway Rate Limiter middleware (Token Bucket & Sliding Window), HTTP 429 responses | *Pending Phase 1* |
| **Phase 3** | Concurrency Block | Redis TTL seat locking, tie-break rules, idempotency key database constraints | *Pending Phase 2* |
| **Phase 4** | Deployment Safety (#3)| Nginx Blue-Green switch, Canary routing by user ID, manual dashboard rollback | *Pending Phase 3* |
| **Phase 5** | Data Resilience | Standby Postgres DB, scheduled backup scripts, container health checks | *Pending Phase 4* |
| **Phase 6** | Proving Ground | React Admin Dashboard, attack buttons, defense toggles, audit logs | *Pending Phase 5* |
| **Phase 7** | Observability | Prometheus scraping, Grafana dashboards for traffic, rejections, and canary splits | *Pending Phase 6* |
