# TicketForge Simulation Platform

**TicketForge** is a full-scale ticket booking system built to simulate, attack, defend, and prove resilience under adversarial flash-sale conditions.

---

## 🏛️ System Architecture Overview

TicketForge consists of two tightly integrated yet cleanly isolated systems:
1. **The Platform**: High-concurrency ticket booking application (Events, Seats, Bookings, Payments, Users).
2. **The Proving Ground**: Admin-only control panel and attack simulator suite that tests defenses live under load.

---

## 📚 Documentation Index (`/docs`)

All architectural specifications, database models, API contracts, and phase plans are frozen in the `/docs` directory prior to code implementation:

1. [01 — Problem Statement](docs/01-problem-statement.md): Real-world inspiration (Ticketmaster, BookMyShow, Tatkal) and problem definitions.
2. [02 — Requirements & Scope Freeze](docs/02-requirements.md): Strict V1 vs. V2 vs. V3 scope boundaries and Parking Lot governance.
3. [03 — System Architecture](docs/03-system-architecture.md): Service boundaries, ownership models, API and event contracts.
4. [04 — Request Flow](docs/04-request-flow.md): Step-by-step request journeys through Rate Limiter (#5) -> Load Balancer (#1) -> Version Router (#3) -> Backend -> Redis/Postgres.
5. [05 — Database Design](docs/05-database-design.md): Complete PostgreSQL schema, Redis TTL caching strategy, and ER diagrams.
6. [06 — API Specification](docs/06-api-spec.md): Complete HTTP REST contracts for all Platform & Proving Ground endpoints.
7. [07 — Folder Structure](docs/07-folder-structure.md): Deep, granular directory layout mapping every service, simulator, and toggle.
8. [08 — Micro-Phase Development Plan](docs/08-phase-plan.md): Independent step-by-step phase delivery roadmap (Phases 0 through 7).
9. [09 — Testing Plan](docs/09-testing-plan.md): Acceptance test criteria, unit test suites, and k6 load profiles.
10. [10 — Demo Scenarios](docs/10-demo-scenarios.md): Step-by-step live demo scripts contrasting Defenses OFF vs. Defenses ON.

---

## 🛡️ Governance & Architectural Contracts

- [ARCHITECTURE_CONTRACT.md](ARCHITECTURE_CONTRACT.md): Non-negotiable architectural rules and AI permissions.
- [PROJECT_VISION.md](PROJECT_VISION.md): Project goals and technical scope.
- [PHASE_REQUIREMENTS.md](PHASE_REQUIREMENTS.md): Micro-phase completion criteria and scope locks.
- [CHANGE_LOG.md](CHANGE_LOG.md): Architectural audit trail.

---

## 🚀 Getting Started

```bash
# 1. Clone or navigate to the workspace
cd C:\Users\jai18\Desktop\TicketForge

# 2. Review system architecture
cat docs/03-system-architecture.md

# 3. Check phase status
cat PHASE_REQUIREMENTS.md
```
