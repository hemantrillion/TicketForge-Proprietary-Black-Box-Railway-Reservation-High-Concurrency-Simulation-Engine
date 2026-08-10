# OPS Control Plane (External Gateway & Simulation Center)

> **Decoupled Architecture Notice**
> This directory (`/ops`) is completely **isolated and standalone** outside the consumer `platform/` codebase.
> It serves as the private administrative control plane for TicketForge, allowing system administrators to inspect public REST API specifications, run Tatkal concurrency benchmarks, and manage black-box integration without granting third parties access to platform source code.

## Directory Features
- **Zero Dependencies**: Pure HTML/CSS/JS standalone control dashboard.
- **External Integration Gateway**: Documents public REST endpoints exposed by the platform.
- **Simulation Harness**: Provides stress testing tools for 5,000+ concurrent Tatkal request spikes and 168-hour spatiotemporal matrix verification.
