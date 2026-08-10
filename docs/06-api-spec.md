# 06 — API Specification (V1)

This document defines the exact HTTP REST API contracts for all services in **TicketForge V1**. All endpoints must adhere strictly to these schemas.

---

## 1. Gateway & Global Headers

All client requests flow through Nginx Gateway.

### Global Request Headers
| Header | Type | Required | Description |
|---|---|---|---|
| `Content-Type` | String | Yes (POST/PUT) | Must be `application/json` |
| `Authorization` | String | Optional | Bearer Token: `Bearer <jwt_token>` |
| `X-Idempotency-Key` | String (UUID) | Required for `/book` & `/pay` | Unique key preventing duplicate processing |

### Rate Limiter Response Headers
Every response passing through the Gateway includes:
- `X-RateLimit-Limit`: Maximum requests allowed in current window
- `X-RateLimit-Remaining`: Remaining request quota
- `X-RateLimit-Reset`: UTC Unix timestamp when quota resets

### Error Responses
#### Rate Limit Exceeded (`429 Too Many Requests`)
```json
{
  "error": "TOO_MANY_REQUESTS",
  "message": "Rate limit exceeded. Please try again later.",
  "retry_after_seconds": 15
}
```

---

## 2. User & Auth Service (`/api/auth`)

### 2.1 Register User
- **POST** `/api/auth/register`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "Jane Doe"
}
```
- **Response (`201 Created`)**:
```json
{
  "user": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.2 Login User
- **POST** `/api/auth/login`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (`200 OK`)**:
```json
{
  "user": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.3 Get Current Profile
- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response (`200 OK`)**:
```json
{
  "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "email": "user@example.com",
  "name": "Jane Doe",
  "role": "user"
}
```

---

## 3. Events Service (`/api/events`)

### 3.1 List Events
- **GET** `/api/events`
- **Response (`200 OK`)**:
```json
[
  {
    "id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "venue_id": "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    "title": "Grand Stadium On-Sale Concert 2026",
    "description": "Live flash-sale event",
    "starts_at": "2026-09-01T20:00:00Z",
    "status": "on_sale"
  }
]
```

### 3.2 Get Event Details
- **GET** `/api/events/:id`
- **Response (`200 OK`)**:
```json
{
  "id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  "venue": {
    "id": "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    "name": "Metropolis Arena",
    "total_capacity": 50000
  },
  "title": "Grand Stadium On-Sale Concert 2026",
  "status": "on_sale"
}
```

---

## 4. Seat Service (`/api/seats`)

### 4.1 Get Seat Map for Event
- **GET** `/api/events/:event_id/seats`
- **Response (`200 OK`)**:
```json
[
  {
    "id": "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    "seat_label": "A1",
    "section": "VIP",
    "price": 150.00,
    "status": "available"
  },
  {
    "id": "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a45",
    "seat_label": "A2",
    "section": "VIP",
    "price": 150.00,
    "status": "held"
  }
]
```

### 4.2 Claim Seat Hold (TTL 5 Minutes)
- **POST** `/api/seats/:id/hold`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Request Body**:
```json
{
  "session_id": "sess_892347234"
}
```
- **Response (`201 Created`)**:
```json
{
  "hold_id": "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
  "seat_id": "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
  "expires_at": "2026-08-07T20:30:00Z",
  "status": "held"
}
```
- **Error Response (`409 Conflict - Seat Race Loss`)**:
```json
{
  "error": "SEAT_ALREADY_HELD",
  "message": "Seat A1 is currently held by another user."
}
```

### 4.3 Release Seat Hold
- **DELETE** `/api/seats/:id/hold`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response (`200 OK`)**:
```json
{
  "seat_id": "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
  "status": "available"
}
```

---

## 5. Booking Service (`/api/bookings`)

### 5.1 Create Booking
- **POST** `/api/bookings`
- **Headers**: 
  - `Authorization: Bearer <jwt_token>`
  - `X-Idempotency-Key: e6f6e80b-9689-4971-a477-94d3e89a5dfa`
- **Request Body**:
```json
{
  "event_id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  "seat_ids": ["d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44"]
}
```
- **Response (`201 Created`)**:
```json
{
  "booking_id": "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "event_id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  "status": "pending",
  "total_amount": 150.00,
  "idempotency_key": "e6f6e80b-9689-4971-a477-94d3e89a5dfa"
}
```

### 5.2 Get Booking Details
- **GET** `/api/bookings/:id`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response (`200 OK`)**:
```json
{
  "id": "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
  "status": "confirmed",
  "total_amount": 150.00,
  "seats": [
    { "seat_id": "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44", "seat_label": "A1" }
  ]
}
```

### 5.3 Cancel Booking
- **POST** `/api/bookings/:id/cancel`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response (`200 OK`)**:
```json
{
  "id": "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
  "status": "cancelled"
}
```

---

## 6. Payment Service (`/api/payments`)

### 6.1 Submit Mock Payment
- **POST** `/api/payments`
- **Headers**:
  - `Authorization: Bearer <jwt_token>`
  - `X-Idempotency-Key: p7f6e80b-9689-4971-a477-94d3e89a5dfb`
- **Request Body**:
```json
{
  "booking_id": "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
  "amount": 150.00,
  "payment_method": "mock_card",
  "card_token": "tok_visa_success"
}
```
- **Response (`200 OK`)**:
```json
{
  "payment_id": "g6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77",
  "booking_id": "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
  "status": "success",
  "provider_reference": "MOCK_TXN_987654"
}
```

---

## 7. Admin & Proving Ground API (`/api/admin`)

Requires `role == 'admin'` JWT token.

### 7.1 Fetch Proving Ground Metrics
- **GET** `/api/admin/metrics`
- **Response (`200 OK`)**:
```json
{
  "active_replicas": 3,
  "requests_per_sec": 1250,
  "rejections_429": 450,
  "active_holds": 120,
  "active_version": "blue",
  "canary_active": false
}
```

### 7.2 Trigger Attack Scenario
- **POST** `/api/admin/attack/:type`
- **Params**: `type` in `['bombard', 'seat_race', 'replay', 'hold_abuse', 'broken_canary']`
- **Request Body**:
```json
{
  "duration_seconds": 30,
  "intensity_rps": 500
}
```
- **Response (`202 Accepted`)**:
```json
{
  "simulation_id": "sim_12345678",
  "status": "triggered",
  "attack_type": "bombard"
}
```

### 7.3 Toggle Defense Mechanism
- **POST** `/api/admin/toggle/:mechanism`
- **Params**: `mechanism` in `['rate_limiter', 'blue_green', 'seat_lock', 'idempotency']`
- **Request Body**:
```json
{
  "enabled": true
}
```
- **Response (`200 OK`)**:
```json
{
  "mechanism": "rate_limiter",
  "enabled": true
}
```

### 7.4 List Canary Users
- **GET** `/api/admin/canary-users`
- **Response (`200 OK`)**:
```json
[
  { "user_id": "usr_canary_01", "email": "canary1@test.com", "group": "canary" },
  { "user_id": "usr_canary_02", "email": "canary2@test.com", "group": "canary" }
]
```
