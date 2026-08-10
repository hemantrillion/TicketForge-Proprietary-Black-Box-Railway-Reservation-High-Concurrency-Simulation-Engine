# 01 — Problem Statement

## Inspired By
Real-world ticket booking platforms operating at extreme scale under adversarial and time-critical conditions: Ticketmaster (global concert/event ticket drops), BookMyShow (India's largest event/movie ticketing platform), IRCTC Tatkal booking (India's railway booking surge), and major stadium/festival on-sale events where demand exceeds supply by orders of magnitude within seconds.

These platforms share one defining trait: they are not simply "busy websites." They must survive a synchronized, adversarial, time-critical surge, all at once, on a fixed and predictable schedule, while remaining fair to real users and resistant to automated abuse.

## The Problem
A ticket booking platform stacks three independent hard problems on top of each other, all activated at the same moment:

1. **Extreme synchronized traffic spikes** — thousands to millions of users act within the same second, not gradually.
2. **Adversarial demand** — a meaningful share of traffic is automated bots trying to unfairly acquire limited inventory (scalping).
3. **Zero tolerance for downtime during the event window** — any deployment, bug, or failure during a live on-sale is maximally costly and cannot be fixed later.

## What This Project Is
This project is a self-contained ticket booking platform with a built-in adversarial simulation and defense-proving layer — not just a booking app with security features bolted on. It is two systems in one:

- **The Platform** — a working ticket booking application: browse events, select seats, hold, pay, confirm, cancel.
- **The Proving Ground** — an admin-only control layer that can deliberately attack, degrade, and stress the Platform on demand, toggle defenses on/off individually, and visibly show the difference in outcome.

This project recreates known, well-understood problems and known, well-understood defenses, faithfully and completely, to demonstrate technical command of the full pipeline — from raw request to database write, and every checkpoint in between. The value demonstrated is depth and correctness of understanding, not novelty.

## Project Numbering Reference
This build merges three of six originally scoped minor-project ideas:

- **#1 — Flash Sale / Traffic Spike Survival System.** Load balancing + autoscaling so no single server is overwhelmed when synchronized demand spikes.
- **#3 — Zero Downtime App Updater (Blue-Green / Canary Deployment).** Shipping new code without downtime or risk.
- **#5 — API Rate Limiter & Gateway.** A gateway that counts and throttles requests per user/IP before they reach the backend.

Projects #2 (CDN/Caching), #4 (Self-Healing Monitor), and #6 (Backup & Disaster Recovery) are referenced only where their concepts are reused inside this build (health checks, backups) — they are not separately scoped as full projects in V1.

## Why Recreate a Known Problem Instead of Inventing a New One
Sometimes the goal isn't to solve a problem nobody has solved — it's to recreate a well-understood, industry-validated problem faithfully enough to prove command of the concepts involved. A ticket booking platform is chosen specifically because it requires #1, #3, and #5 to all be genuinely necessary, not optional additions — see `04-request-flow.md` for how a single request depends on all three in sequence.
