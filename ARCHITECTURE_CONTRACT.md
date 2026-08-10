# ARCHITECTURE_CONTRACT.md - Immutable Rules

This contract defines the non-negotiable architectural boundaries and governance rules for **TicketForge**. Neither AI coding assistants nor human engineers may alter decisions marked as Immutable without explicit approval.

---

## 1. Immutable Architectural Decisions (DO NOT CHANGE)

### 1.1 Architecture & Services
- **Microservices Boundary**: System must maintain clear boundary separation between Events, Seats, Bookings, Payments, and User microservices.
- **Data Access Isolation**: Services MUST NOT perform direct cross-service SQL database reads or writes. All cross-service communication occurs via defined REST APIs or the Redis Pub/Sub Event Bus.
- **Gateway & Load Balancer**: Nginx is mandatory as the public reverse proxy, load balancer, and rate-limiting checkpoint.
- **Database & Cache**: PostgreSQL is mandatory as the primary relational persistence store. Redis is mandatory for low-latency TTL seat holds, rate-limit counters, and internal Pub/Sub events.

### 1.2 Proving Ground & Control Panel
- **Independent Systems**: The Platform (booking application) and Proving Ground (admin attack/defense control) must remain separate.
- **No Backdoor Short-Circuits**: Attacks triggered from the Admin Dashboard MUST hit real public/internal API endpoints or publish real bus events—no faking or short-circuiting underlying logic.
- **Independent Defense Toggles**: Every defense mechanism (Rate Limiting, Seat Locking, Idempotency, Blue-Green Deployment) must be independently switchable on/off.

### 1.3 DevOps & Safety
- **Blue-Green & Canary Deployment**: Nginx traffic switching is mandatory.
- **Idempotency Keys**: Unique database-level constraints on idempotency keys (`bookings.idempotency_key`) are mandatory for duplicate payment and booking prevention.

---

## 2. Implementation Permissions & Constraints

### You MAY:
- Add new internal helper files within a service.
- Refactor internal service code without changing external REST API contracts or database schema definitions.
- Enhance logging, Prometheus metrics, or unit test coverage.

### You MAY NOT:
- Change folder structure or move microservices.
- Remove services or combine microservices into a monolithic shortcut.
- Replace PostgreSQL, Redis, or Nginx with alternative software.
- Bypass database constraints, unique indexes, or transactional safety.
- Modify completed/frozen phase logic without explicit permission.

---

## 3. Architecture Guardian Persona

> **System Prompt Requirement for AI Assistants**:
> "You are not the architect. I am. Your responsibility is implementation. If implementation conflicts with architecture, implementation loses. Never simplify the architecture for convenience. Never replace a component because it is easier. Always ask before modifying architectural decisions."
