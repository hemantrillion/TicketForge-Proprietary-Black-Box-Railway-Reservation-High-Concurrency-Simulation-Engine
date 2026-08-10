-- ConfirmTkt Replica Schema Initializer (V1)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- STATIONS
CREATE TABLE IF NOT EXISTS stations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(10) UNIQUE NOT NULL,
    name        VARCHAR(255) NOT NULL,
    city        VARCHAR(100) NOT NULL
);

-- TRAINS
CREATE TABLE IF NOT EXISTS trains (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_number    VARCHAR(20) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    source_code     VARCHAR(10) NOT NULL REFERENCES stations(code),
    dest_code       VARCHAR(10) NOT NULL REFERENCES stations(code),
    departure_time  TIME NOT NULL,
    arrival_time    TIME NOT NULL,
    duration        VARCHAR(50) NOT NULL,
    runs_on         VARCHAR(50) NOT NULL DEFAULT 'DAILY'
);

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    irctc_username  VARCHAR(100) DEFAULT 'confirmtkt_user',
    mobile          VARCHAR(20) DEFAULT '9876543210',
    role            VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- VENUES
CREATE TABLE IF NOT EXISTS venues (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    address         TEXT,
    total_capacity  INTEGER NOT NULL CHECK (total_capacity > 0)
);

-- EVENTS (Train Trips)
CREATE TABLE IF NOT EXISTS events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id        UUID REFERENCES venues(id),
    train_id        UUID REFERENCES trains(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    starts_at       TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'on_sale',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SEATS (Coach Berths)
CREATE TABLE IF NOT EXISTS seats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id),
    coach           VARCHAR(10) NOT NULL DEFAULT 'B1',
    seat_label      VARCHAR(30) NOT NULL,
    berth_type      VARCHAR(20) NOT NULL CHECK (berth_type IN ('LB', 'MB', 'UB', 'SL', 'SU')),
    section         VARCHAR(50) NOT NULL DEFAULT '3A',
    quota           VARCHAR(20) NOT NULL DEFAULT 'TATKAL',
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    cnf_probability VARCHAR(20) DEFAULT 'CNF 98%',
    status          VARCHAR(20) NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available', 'held', 'booked')),
    UNIQUE (event_id, coach, seat_label)
);
CREATE INDEX IF NOT EXISTS idx_seats_event ON seats(event_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(event_id, status);

-- SEAT HOLDS
CREATE TABLE IF NOT EXISTS seat_holds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_id         UUID NOT NULL REFERENCES seats(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    session_id      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BOOKINGS (ConfirmTkt ERS Ticket)
CREATE TABLE IF NOT EXISTS bookings (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pnr_number        VARCHAR(20) UNIQUE NOT NULL,
    user_id           UUID NOT NULL REFERENCES users(id),
    event_id          UUID NOT NULL REFERENCES events(id),
    passenger_name    VARCHAR(255),
    passenger_age     INTEGER,
    passenger_gender  VARCHAR(10),
    berth_pref        VARCHAR(30) DEFAULT 'Lower Berth (LB)',
    irctc_username    VARCHAR(100) DEFAULT 'confirmtkt_user',
    free_cancellation BOOLEAN DEFAULT true,
    status            VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    idempotency_key   VARCHAR(255) UNIQUE NOT NULL,
    total_amount      NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BOOKING_SEATS
CREATE TABLE IF NOT EXISTS booking_seats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL REFERENCES bookings(id),
    seat_id         UUID NOT NULL REFERENCES seats(id),
    UNIQUE (seat_id)
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL REFERENCES bookings(id),
    amount              NUMERIC(10,2) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    provider_reference  VARCHAR(255),
    payment_mode        VARCHAR(50) DEFAULT 'CONFIRMTKT_UPI',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RATE LIMIT RECORDS
CREATE TABLE IF NOT EXISTS rate_limit_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier      VARCHAR(255) NOT NULL,
    window_start    TIMESTAMPTZ NOT NULL,
    request_count   INTEGER NOT NULL DEFAULT 0,
    limit_type      VARCHAR(20) NOT NULL CHECK (limit_type IN ('token_bucket', 'sliding_window'))
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id         VARCHAR(255),
    actor_type       VARCHAR(20) NOT NULL CHECK (actor_type IN ('user', 'admin', 'system')),
    action           VARCHAR(100) NOT NULL,
    target_type      VARCHAR(50),
    target_id        VARCHAR(255),
    metadata         JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SEED DATA FOR CONFIRMTKT REPLICA
DO $$
DECLARE
    v_id UUID;
    t1_id UUID; t2_id UUID; t3_id UUID; t4_id UUID;
    e1_id UUID; e2_id UUID; e3_id UUID; e4_id UUID;
    i INT;
    b_types TEXT[] := ARRAY['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'];
    b_type TEXT;
BEGIN
    -- Seed Stations
    INSERT INTO stations (code, name, city) VALUES
    ('NDLS', 'New Delhi (NDLS)', 'New Delhi'),
    ('MMCT', 'Mumbai Central (MMCT)', 'Mumbai'),
    ('HWH', 'Howrah Jn (HWH)', 'Kolkata'),
    ('SBC', 'KSR Bengaluru (SBC)', 'Bengaluru'),
    ('MAS', 'Chennai Central (MAS)', 'Chennai')
    ON CONFLICT DO NOTHING;

    -- Seed Venue
    INSERT INTO venues (name, address, total_capacity)
    VALUES ('ConfirmTkt Partner Hub', 'Outer Ring Road, Bengaluru', 10000)
    RETURNING id INTO v_id;

    -- Seed Trains
    INSERT INTO trains (train_number, name, source_code, dest_code, departure_time, arrival_time, duration, runs_on)
    VALUES ('12951', 'RAJDHANI EXP', 'NDLS', 'MMCT', '16:55:00', '08:35:00', '15h 40m', 'M T W T F S S')
    RETURNING id INTO t1_id;

    INSERT INTO trains (train_number, name, source_code, dest_code, departure_time, arrival_time, duration, runs_on)
    VALUES ('22436', 'VANDE BHARAT EXP', 'NDLS', 'HWH', '06:00:00', '14:30:00', '08h 30m', 'M T - T F S S')
    RETURNING id INTO t2_id;

    INSERT INTO trains (train_number, name, source_code, dest_code, departure_time, arrival_time, duration, runs_on)
    VALUES ('12002', 'SHATABDI EXP', 'NDLS', 'SBC', '06:15:00', '14:00:00', '07h 45m', 'M T W T F S S')
    RETURNING id INTO t3_id;

    INSERT INTO trains (train_number, name, source_code, dest_code, departure_time, arrival_time, duration, runs_on)
    VALUES ('12626', 'KERALA EXP', 'NDLS', 'MAS', '20:10:00', '04:35:00', '32h 25m', 'M T W T F S S')
    RETURNING id INTO t4_id;

    -- Seed Events/Trips
    INSERT INTO events (venue_id, train_id, title, description, starts_at, status)
    VALUES (v_id, t1_id, '12951 | RAJDHANI EXP', 'New Delhi -> Mumbai Central', '2026-09-01 16:55:00+00', 'on_sale')
    RETURNING id INTO e1_id;

    INSERT INTO events (venue_id, train_id, title, description, starts_at, status)
    VALUES (v_id, t2_id, '22436 | VANDE BHARAT EXP', 'New Delhi -> Howrah Jn', '2026-09-01 06:00:00+00', 'on_sale')
    RETURNING id INTO e2_id;

    -- Seed 72 Coach Berths (Coach B1)
    FOR i IN 1..72 LOOP
        b_type := b_types[((i - 1) % 8) + 1];
        INSERT INTO seats (event_id, coach, seat_label, berth_type, section, quota, price, cnf_probability, status)
        VALUES (e1_id, 'B1', 'Berth ' || LPAD(i::text, 2, '0'), b_type, '3A', 'TATKAL', 2150.00, 'CNF 98%', 'available');
    END LOOP;

    -- Seed Default Passenger User
    INSERT INTO users (email, password_hash, name, irctc_username, mobile, role)
    VALUES ('passenger@confirmtkt.com', '$2a$10$wK1L8zJ3C.11sXv1G3pDk.vYg4O7J1tT2rM8nQ9sR0uV1wX2yZ3a', 'Rahul Sharma', 'rahul_confirmtkt', '9876543210', 'user')
    ON CONFLICT (email) DO NOTHING;
END $$;
