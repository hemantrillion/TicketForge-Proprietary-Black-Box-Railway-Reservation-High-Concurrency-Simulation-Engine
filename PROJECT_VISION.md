# PROJECT_VISION.md - TicketForge Vision & Core Objectives

## Inspired By
Real-world ticket booking platforms operating at extreme scale under adversarial and time-critical conditions: **Ticketmaster**, **BookMyShow**, and **IRCTC Tatkal booking**.

These platforms share one defining trait: they must survive a synchronized, adversarial, time-critical surge on a fixed schedule, while remaining fair to real users and resistant to automated abuse.

---

## The Problem
A ticket booking platform stacks three independent hard problems on top of each other:
1. **Extreme synchronized traffic spikes** — thousands to millions of users act within the exact same second.
2. **Adversarial demand** — automated bots attempting to unfairly acquire limited inventory (scalping).
3. **Zero tolerance for downtime** — failures during a live on-sale window are maximally costly and cannot be fixed later.

---

## What TicketForge Is
TicketForge is two systems in one:
1. **The Platform** — a fully working ticket booking application: browse events, select seats, hold seats with TTLs, pay, confirm, and cancel.
2. **The Proving Ground** — an admin-only control layer that can deliberately attack, degrade, and stress the Platform on demand, toggle defenses on/off individually, and visibly show the difference in outcome.

The core value of TicketForge is demonstrating **depth and correctness of technical understanding** across the full pipeline—from raw incoming request down to database writes.
