# 09 — Testing Plan

This document outlines the acceptance criteria, automated test suites, and simulation scenarios used to verify **TicketForge V1**.

---

## 1. Unit & Integration Testing Strategy

Every service includes unit and API integration tests that execute before any container build.

### 1.1 Key Unit Test Suites
- **Rate Limiter Test Suite**: Tests Token Bucket refill math, Sliding Window timestamp eviction, and Redis key TTL correctness under boundary cases.
- **Seat Locking Test Suite**: Verifies Redis TTL expiry, tie-break resolution for parallel lock requests, and lock release logic.
- **Idempotency Guard Suite**: Verifies duplicate request detection with identical `X-Idempotency-Key` headers across concurrent threads.

---

## 2. Phase-by-Phase Acceptance Criteria

| Phase | Completion Criteria | Automated Command / Script |
|---|---|---|
| **Phase 0 (Foundation)** | 1 user can register, log in, browse event, hold seat, pay mock, confirm, and receive confirmation. | `npm run test:phase0` |
| **Phase 1 (Traffic Control)** | 3 backend replicas sit behind Nginx; k6 500 RPS load test distributes across all replicas without booking logic errors. | `k6 run load-testing/k6/scenarios/ramp-spike.js` |
| **Phase 2 (Rate Limiter)** | Request burst > quota returns HTTP `429 Too Many Requests`; rate-limiter toggle cleanly disables/enables filtering. | `npm run test:rate-limiter` |
| **Phase 3 (Concurrency)** | 100 simultaneous requests for Seat A1 result in exactly 1 hold granted (`201`) and 99 rejected (`409`). | `node proving-ground/backend/attack-simulators/logic/seat-race-simulator.js` |
| **Phase 4 (Deployment)** | Broken canary build deployed to 10% traffic slice affects only canary users; manual admin rollback restores 100% stable traffic seamlessly. | `npm run test:canary-rollback` |
| **Phase 6 (Proving Ground)** | Every attack button triggers simulation event; audit log records before/after state; defense toggles react dynamically. | `npm run test:proving-ground` |
| **Phase 7 (Observability)** | Prometheus scrapes gateway and backend metrics; Grafana renders live traffic, 429 rejection rate, and canary split. | `curl -f http://localhost:9090/-/healthy` |

---

## 3. k6 Load Testing Profiles

### 3.1 Ramp & Spike Profile (`ramp-spike.js`)
Simulates on-sale countdown release:
- 0–10s: Ramp from 0 to 500 virtual users (VUs).
- 10s–30s: Spike to 2,000 VUs firing `/api/seats/:id/hold`.
- 30s–40s: Ramp down to 0.

### 3.2 Sustained Flood Profile (`sustained-flood.js`)
Simulates distributed volumetric DDoS attack:
- Sustained 1,500 RPS for 60 seconds against public endpoints.
- Verifies Gateway Nginx + Rate Limiter CPU utilization stays bounded and 429 responses are returned within 5ms.
