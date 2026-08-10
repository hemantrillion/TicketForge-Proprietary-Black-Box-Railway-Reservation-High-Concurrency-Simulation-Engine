# 05 — Database Design (PostgreSQL)

## 5.1 Entity-Relationship Diagram

![Database ERD](../diagrams/04_database_erd.png)

## 5.2 Schema

```sql
-- USERS
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- VENUES
CREATE TABLE venues (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    address         TEXT,
    total_capacity  INTEGER NOT NULL CHECK (total_capacity > 0)
);

-- EVENTS
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id        UUID NOT NULL REFERENCES venues(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    starts_at       TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                    CHECK (status IN ('upcoming', 'on_sale', 'sold_out', 'completed', 'cancelled')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_events_status ON events(status);

-- SEATS
CREATE TABLE seats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id),
    seat_label      VARCHAR(20) NOT NULL,        -- e.g. "A1"
    section         VARCHAR(50),
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    status          VARCHAR(20) NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available', 'held', 'booked')),
    UNIQUE (event_id, seat_label)
);
CREATE INDEX idx_seats_event ON seats(event_id);
CREATE INDEX idx_seats_status ON seats(event_id, status);

-- SEAT HOLDS
CREATE TABLE seat_holds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_id         UUID NOT NULL REFERENCES seats(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    session_id      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_seat_holds_seat ON seat_holds(seat_id);
CREATE INDEX idx_seat_holds_expiry ON seat_holds(expires_at);
-- Note: the authoritative, low-latency copy of an active hold lives in Redis with a native TTL.
-- This table is the durable record used for audit and for recovering state after a Redis restart.

-- BOOKINGS
CREATE TABLE bookings (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id),
    event_id          UUID NOT NULL REFERENCES events(id),
    status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    idempotency_key   VARCHAR(255) UNIQUE NOT NULL,
    total_amount      NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_event ON bookings(event_id);
-- idempotency_key uniqueness is what makes a duplicate booking submission a no-op, not a second booking.

-- BOOKING_SEATS (join table)
CREATE TABLE booking_seats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL REFERENCES bookings(id),
    seat_id         UUID NOT NULL REFERENCES seats(id),
    UNIQUE (seat_id)   -- a seat can belong to at most one active booking
);
CREATE INDEX idx_booking_seats_booking ON booking_seats(booking_id);

-- PAYMENTS
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL REFERENCES bookings(id),
    amount              NUMERIC(10,2) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    provider_reference  VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_booking ON payments(booking_id);

-- RATE LIMIT RECORDS (persisted audit copy; live counters are in Redis)
CREATE TABLE rate_limit_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier      VARCHAR(255) NOT NULL,   -- user_id or IP
    window_start    TIMESTAMPTZ NOT NULL,
    request_count   INTEGER NOT NULL DEFAULT 0,
    limit_type      VARCHAR(20) NOT NULL CHECK (limit_type IN ('token_bucket', 'sliding_window'))
);
CREATE INDEX idx_rate_limit_identifier ON rate_limit_records(identifier, window_start);

-- AUDIT LOGS
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id         VARCHAR(255),            -- user id, admin id, or 'system'
    actor_type       VARCHAR(20) NOT NULL CHECK (actor_type IN ('user', 'admin', 'system')),
    action           VARCHAR(100) NOT NULL,   -- e.g. 'attack.seat_race.triggered', 'toggle.ratelimit.disabled'
    target_type      VARCHAR(50),
    target_id        VARCHAR(255),
    metadata         JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

## 5.3 Design Notes

- **Redis vs. PostgreSQL for seat holds:** the *decision* of whether a seat is currently held happens in Redis, using its native TTL, because that decision needs to be fast and needs automatic expiry without a background job. The `seat_holds` table in PostgreSQL is the durable audit trail, written alongside the Redis operation, not the source of truth for "is this held right now."
- **Idempotency keys** are enforced with a real unique constraint (`bookings.idempotency_key`), not just application-level checking — so even a race between two identical duplicate requests can't slip through.
- **`booking_seats.seat_id` is unique**, which is the database-level backstop against double-booking a seat — even if application logic has a bug, the database itself refuses a second booking row for the same seat.
- **`rate_limit_records`** is explicitly an audit/analysis table, not the live rate-limiting mechanism — V1's actual limiter reads and writes Redis directly for latency reasons; this table exists so the Simulation Reporter has something durable to query when building a before/after comparison.
