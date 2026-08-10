import React from 'react';

export default function PrivacyPolicyPage({ onBackToHome }) {
  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', padding: '2.5rem 1rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: '#ffffff', borderRadius: '14px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        
        {onBackToHome && (
          <button onClick={onBackToHome} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            ← Back to Home
          </button>
        )}

        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          TicketForge Platform Privacy Policy & System Architecture Disclosure
        </h1>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.75rem' }}>
          Effective Date: August 10, 2026 · Platform Version: 2.4.0 (Black-Box Isolation Model)
        </div>

        <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.75', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <section>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              1. Standalone "Black-Box" Platform Architecture
            </h2>
            <p>
              TicketForge is engineered as a self-contained, independent, private simulation platform and black-box reservation engine. The underlying application source code, backend algorithms, PostgreSQL data models, and spatiotemporal timeline matrices are strictly private and unmodifiable by third-party users or external integration teams.
            </p>
            <p>
              External consumers and integrating services interact with TicketForge exclusively through its rendered presentation user interface and authorized REST API endpoints. No user or external team is granted permission or access to inspect, copy, extract, or modify the underlying frontend or backend codebase.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              2. Content Protection & Anti-Scraping Guards
            </h2>
            <p>
              To protect platform intellectual property and maintain black-box integrity, TicketForge enforces strict digital asset protection guards across all client sessions:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><strong>Text Selection Disable (`user-select: none`)</strong>: Text selection and highlight copying are disabled globally across the platform.</li>
              <li><strong>Context Menu & Inspection Guards</strong>: Right-click context menus, Developer Tool inspection key combinations (F12, Ctrl+Shift+I), and source view shortcuts (Ctrl+U) are intercepted and restricted.</li>
              <li><strong>Asset Security</strong>: Media assets, layout algorithms, and operational data sheets are protected from automated extraction or scraping.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              3. Data Collection, User Registration & Audit Logging
            </h2>
            <p>
              During user registration and active session interaction, TicketForge collects necessary telemetry and authentication metadata:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><strong>Account Credentials</strong>: Name, registered email address, and encrypted password hashes.</li>
              <li><strong>Booking Records</strong>: PNR allocations, passenger details, seat assignments, and simulated payment transaction receipts.</li>
              <li><strong>System Audit Logs</strong>: Administrative actions, API request origins, and simulation control parameters are recorded in immutable audit tables for system security.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              4. Role-Based API Gating & The OPS Control Plane
            </h2>
            <p>
              TicketForge enforces strict Role-Based Access Control (RBAC):
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><strong>Standard Users</strong>: Access public endpoints for train search, seat availability checking, live running status, timetable inspection, and booking execution.</li>
              <li><strong>Administrative Personnel (`OPS`)</strong>: Authenticated Admin users (`.in` domain credentials) are provided access to the <strong>OPS Control Plane</strong> (accessible via the `OPS ↗` link in a separate tab). The OPS gateway provides isolated API control, benchmark triggers, Tatkal concurrency stress-testing, and system metrics without exposing source code.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              5. Governing Contact & Compliance
            </h2>
            <p>
              For administrative inquiries regarding API integration contracts or platform operation policies, contact the TicketForge Operations Desk at <strong>90827XXXXX</strong>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
