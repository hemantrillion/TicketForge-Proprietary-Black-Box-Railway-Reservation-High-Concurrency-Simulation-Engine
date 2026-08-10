# 04 — Request Flow

## 4.1 The Booking Request — Browser to Response

![Request Flow](../diagrams/02_request_flow.png)

Step by step, for a single "Book Now" click:

1. **Browser** — the user clicks "Book Now"; the React app sends an HTTPS request to the gateway.
2. **Gateway (Nginx)** — receives the request; this is the single public entry point for all traffic.
3. **Rate Limiter (#5)** — checks: has this user/IP exceeded its allowed request rate? If yes, the request is rejected immediately with a `429 Too Many Requests` and goes no further. If no, it passes through.
4. **Load Balancer (#1)** — Nginx picks the least-busy backend replica from the current pool to receive this request.
5. **Version Router (#3)** — if a blue-green switch or canary rollout is active, the request is routed to either the stable version or the canary version, depending on whether this user is in the canary group.
6. **Backend Service (Booking Service)** — processes the request: validates the idempotency key, checks seat-hold ownership.
7. **Redis** — the Booking Service checks/updates the seat hold (TTL-based) and records the idempotency key to prevent duplicate processing.
8. **PostgreSQL** — the booking is written as a transaction (booking row + booking_seats row), so partial writes cannot occur.
9. **Response** — success ("booking confirmed") or a specific failure (seat no longer available, hold expired, payment pending) is returned.
10. **Browser** — the confirmation page renders based on the response.

This is the same fixed order established conceptually earlier: **filter (#5) → distribute (#1) → route to version (#3) → process → persist → respond.**

## 4.2 Admin, Simulator, and Monitoring Connections

![Admin, Simulator, Monitoring Flow](../diagrams/03_admin_simulator_monitoring.png)

This is a separate flow from the booking request above — it never touches the booking path directly except by injecting synthetic traffic or toggling a mechanism.

1. **Admin Browser** — the admin clicks an attack button or a defense toggle in the dashboard.
2. **Admin API** — receives the click as a real HTTPS request (this is a genuine network call, not a shortcut — see the clarification in `07-folder-structure.md` on the browser-to-backend vs. backend-to-backend distinction).
3. **Internal Event Bus** — the Admin API publishes an event (`attack.trigger.<type>` or `toggle.set.<mechanism>`); this is where "internal" routing actually begins, entirely on the server side.
4. **Attack Simulators** — the relevant simulator picks up its trigger event and generates synthetic traffic or a synthetic failure condition against the Platform, exactly as an external actor would experience it (the simulator does not get a shortcut into the Platform's internals either).
5. **Defense Orchestrator** — picks up toggle events and flips the relevant mechanism on/off in its state store; the gateway and Nginx read this state to decide whether rate limiting / blue-green routing is currently active.
6. **Simulation Reporter** — collects outcome metrics from both the simulators and the Platform, and writes a run record to `audit_logs`.
7. **Prometheus** — scrapes metrics from the Platform and the Simulation Reporter continuously, attack or no attack.
8. **Grafana** — queries Prometheus and renders dashboards, which the admin can view alongside the dashboard's own run log.
9. **Alertmanager** (V2) — would receive threshold-breach notifications from Prometheus; not wired in V1.

## 4.3 Why Two Separate Flows
The booking flow (4.1) and the admin/simulator flow (4.2) intentionally never call each other's internals directly. The only way the Proving Ground affects the Platform is the same way any external client would: real requests hitting real endpoints, or a toggle flag the gateway itself checks. This is what makes the "attack it live" demo meaningful — nothing is faked or short-circuited between the two.
