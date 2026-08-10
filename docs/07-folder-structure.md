# 07 — Folder Structure

Deep, granular, one-responsibility-per-file layout. Every simulated attack, every defense toggle, and every admin action is its own file.

Two distinct layers:
1. **External Network Requests**: Admin dashboard button clicks reach the server as standard HTTPS calls.
2. **Internal Server Orchestration**: The Admin API routes actions through Redis Pub/Sub event bus to specific simulators and toggle state handlers (invisible outside the server).

```
TicketForge/
├── README.md
├── ARCHITECTURE_CONTRACT.md
├── PROJECT_VISION.md
├── PHASE_REQUIREMENTS.md
├── CHANGE_LOG.md
├── docker-compose.yml
├── .env.example
|
├── platform/                          # The actual booking application
│   ├── frontend/                      # React Booking UI
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── EventListPage/
│   │   │   │   ├── EventDetailPage/
│   │   │   │   ├── SeatMapPage/
│   │   │   │   ├── CheckoutPage/
│   │   │   │   └── ConfirmationPage/
│   │   │   ├── components/
│   │   │   │   ├── SeatMap/
│   │   │   │   ├── CountdownHoldTimer/
│   │   │   │   ├── PaymentForm/
│   │   │   │   └── shared/
│   │   │   ├── hooks/
│   │   │   ├── services/api/
│   │   │   └── state/
│   │   └── package.json
│   │
│   └── backend/                       # Entry point & microservice APIs
│       ├── gateway/                   # Entry point for all external requests
│       │   ├── middleware/
│       │   │   ├── rate-limit/
│       │   │   │   ├── token-bucket.js
│       │   │   │   ├── sliding-window.js
│       │   │   │   └── limiter-config.js
│       │   │   ├── auth/
│       │   │   ├── behavioral-flagging/
│       │   │   │   ├── timing-analysis.js
│       │   │   │   ├── step-sequence-check.js
│       │   │   │   └── fingerprinting.js
│       │   │   └── idempotency/
│       │   │       └── idempotency-key-check.js
│       │   └── router.js
│       │
│       └── services/
│           ├── events-service/
│           ├── seat-service/
│           │   ├── seat-lock.js
│           │   ├── seat-release-on-expiry.js
│           │   ├── seat-race-lock-strategy.js
│           │   └── seat-state-store.js
│           ├── booking-service/
│           │   ├── create-booking.js
│           │   ├── duplicate-submission-guard.js
│           │   └── booking-state-machine.js
│           ├── payment-service/
│           │   ├── payment-provider-adapter.js
│           │   ├── payment-booking-reconciliation.js
│           │   └── fraud-signal-check.js
│           └── user-service/
│
├── proving-ground/                    # Admin-only attack + defense control layer
│   ├── admin-dashboard/               # React Admin Dashboard UI
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   └── AttackControlPanel/
│   │   │   │       ├── buttons/
│   │   │   │       │   ├── BombardClicksButton/
│   │   │   │       │   ├── BotSwarmButton/
│   │   │   │       │   ├── SeatRaceAttackButton/
│   │   │   │       │   ├── ReplayAttackButton/
│   │   │   │       │   ├── HoldAbuseAttackButton/
│   │   │   │       │   ├── KillDatabaseButton/
│   │   │   │       │   ├── FlushCacheButton/
│   │   │   │       │   ├── BrokenCanaryDeployButton/
│   │   │   │       │   └── BlueGreenSwitchButton/
│   │   │   │       ├── DefenseTogglePanel/
│   │   │   │       │   └── toggles/
│   │   │   │       │       ├── VolumetricRateLimitToggle/
│   │   │   │       │       ├── BehavioralDetectionToggle/
│   │   │   │       │       ├── WaitingRoomToggle/
│   │   │   │       │       ├── SeatLockingToggle/
│   │   │   │       │       ├── IdempotencyToggle/
│   │   │   │       │       ├── AutoScalingToggle/
│   │   │   │       │       ├── BlueGreenToggle/
│   │   │   │       │       ├── CanaryRollbackToggle/
│   │   │   │       │       ├── BackupFailoverToggle/
│   │   │   │       │       └── FeatureKillSwitch/
│   │   │   │       ├── CanaryUserViewPanel/
│   │   │   │       │   ├── CanaryUserList.jsx
│   │   │   │       │   └── LoginAsCanaryUser.jsx
│   │   │   │       ├── SimulationReportPanel/
│   │   │   │       └── LiveMetricsPanel/
│   │   │   └── services/adminApi/
│   │   └── package.json
│   │
│   └── backend/                       # Server-side orchestration
│       ├── event-bus/                 # Redis Pub/Sub events
│       │   ├── publishers/
│       │   │   ├── attack-event-publisher.js
│       │   │   └── toggle-event-publisher.js
│       │   ├── subscribers/
│       │   │   ├── attack-event-subscriber.js
│       │   │   └── toggle-event-subscriber.js
│       │   └── event-bus-config.js
│       │
│       ├── attack-simulators/
│       │   ├── volumetric/
│       │   │   ├── click-bombard-simulator.js
│       │   │   └── k6-scenario-runner.js
│       │   ├── behavioral/
│       │   │   ├── bot-swarm-simulator.js
│       │   │   └── timing-profile-configs/
│       │   │       ├── inhuman-fixed-interval.json
│       │   │       ├── human-like-random.json
│       │   │       └── fake-account-seeder.js
│       │   ├── logic/
│       │   │   ├── seat-race-simulator.js
│       │   │   ├── replay-attack-simulator.js
│       │   │   └── hold-abuse-simulator.js
│       │   ├── infra/
│       │   │   ├── kill-primary-db-simulator.js
│       │   │   ├── cache-flush-simulator.js
│       │   │   └── network-partition-simulator.js
│       │   └── deployment/
│       │       ├── broken-canary-deploy-simulator.js
│       │       └── forced-blue-green-switch.js
│       │
│       ├── defense-orchestrator/
│       │   ├── toggle-state-store.js    # Single source of truth for defense states
│       │   └── toggle-handlers/
│       │       ├── rate-limit-toggle-handler.js
│       │       ├── behavioral-toggle-handler.js
│       │       ├── waiting-room-toggle-handler.js
│       │       ├── seat-lock-toggle-handler.js
│       │       ├── autoscaling-toggle-handler.js
│       │       ├── bluegreen-toggle-handler.js
│       │       ├── canary-toggle-handler.js
│       │       └── backup-toggle-handler.js
│       │
│       └── simulation-reporting/
│           ├── run-logger.js
│           ├── before-after-comparator.js
│           └── report-generator.js
│
├── resilience/                        # Infrastructure-facing resilience mechanisms
│   ├── load-balancing/
│   │   ├── round-robin.js
│   │   └── least-connections.js
│   ├── autoscaling/
│   │   ├── scale-policy.js
│   │   └── cooldown-controller.js
│   ├── waiting-room/
│   │   ├── queue-admission-controller.js
│   │   └── queue-position-tracker.js
│   ├── deployment/
│   │   ├── blue-green/
│   │   │   ├── traffic-switch.js
│   │   │   └── rollback-controller.js
│   │   └── canary/
│   │       ├── traffic-split-controller.js
│   │       └── canary-rollback-trigger.js
│   ├── self-healing/
│   │   ├── health-check-service.js
│   │   ├── auto-restart-handler.js
│   │   └── instance-replace-handler.js
│   └── backup-dr/
│       ├── scheduled-backup-job.js
│       ├── restore-verification-job.js
│       └── failover-promotion.js
│
├── observability/
│   ├── monitoring/
│   │   ├── prometheus-config/
│   │   └── grafana-dashboards/
│   │       ├── traffic-dashboard.json
│   │       ├── attack-outcome-dashboard.json
│   │       └── canary-rollback-dashboard.json
│   ├── alerting/
│   │   └── alertmanager-config/
│   ├── tracing/
│   │   └── otel-config/
│   └── analytics/
│       ├── data-collector/
│       ├── baseline-behavior-model.py
│       ├── anomaly-detector.py
│       └── notebooks/
│
├── load-testing/
│   └── k6/
│       └── scenarios/
│           ├── ramp-spike.js
│           ├── sustained-flood.js
│           └── on-sale-simultaneous.js
│
├── infrastructure/
│   ├── nginx/
│   ├── docker/
│   │   └── per-service-Dockerfiles/
│   └── ci-cd/
│       └── github-actions/
│           ├── build-test.yml
│           ├── canary-deploy.yml
│           └── bluegreen-deploy.yml
│
└── docs/
    ├── 01-problem-statement.md
    ├── 02-requirements.md
    ├── 03-system-architecture.md
    ├── 04-request-flow.md
    ├── 05-database-design.md
    ├── 06-api-spec.md
    ├── 07-folder-structure.md
    ├── 08-phase-plan.md
    ├── 09-testing-plan.md
    └── 10-demo-scenarios.md
```
