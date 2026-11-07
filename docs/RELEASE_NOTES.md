# APIWatch — Release Notes (v1.0.0 MVP)

**Product**: APIWatch — Robust API Monitoring & Alerting SaaS  
**Version**: `1.0.0` (Production MVP)  
**Release Date**: November 7, 2026  
**License**: Proprietary / MIT  

---

## 1. Executive Summary

APIWatch v1.0.0 is the foundational release of a modern, production-grade API monitoring platform designed to provide developers and engineering teams with continuous visibility into their HTTP APIs, microservices, and external third-party endpoints.

Built on Next.js 16 (Turbopack, Partial Prefetching) and a decoupled BullMQ background worker engine, APIWatch delivers millisecond-precision uptime tracking, multi-channel alerting, and enterprise-grade security mitigations (SSRF, IDOR, CSV injection, and encrypted secrets).

---

## 2. Key Features Included in v1.0.0

### 2.1 Authentication & User Management
- **Better Auth Integration**: Email/password registration, secure login, persistent session cookies, and bearer token support.
- **Tenant Isolation**: Multi-tenant database design where all monitor definitions, checks, and alert channels are strictly isolated by `userId`.

### 2.2 Core Monitoring Engine
- **HTTP Methods**: Support for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `HEAD`.
- **Configurable Intervals**: Monitoring cadence from 30 seconds to 1 hour.
- **Precision Timing**: Response time measurements powered by monotonic `performance.now()`.
- **Custom Payloads & Headers**: Secure custom request headers (encrypted with AES-256-GCM) and JSON request bodies.
- **Response Validation Assertions**:
  - Exact HTTP status code matching.
  - Header key/value assertions with case-insensitive matching.
  - Response body assertions (supports `contains` and `equals` string operators).
- **Manual "Check Now"**: Immediate on-demand check execution with a 10-second cooldown rate limit.
- **Pause & Resume**: Temporary suspension of active monitor polling with automatic scheduler unregistration.

### 2.3 Analytics & Reporting
- **Interactive Dashboard**: Real-time aggregated operational metrics (total monitors, active count, down monitors, and overall 24-hour uptime percentage).
- **Historical Latency & Uptime**: Interactive Recharts time-series charts visualizing latency trends and status checks over time.
- **CSV Data Export**: One-click historical audit export with built-in CSV formula injection protection (CWE-1236).
- **Public Status Page**: High-performance status page (`/status`) with Partial Prerendering and zero data leakage.

### 2.4 Alerting & Notifications
- **Multi-Channel Dispatch**:
  - **Email**: Automated rich transactional alert emails via SMTP (Resend, SendGrid, Mailgun, AWS SES).
  - **Custom Webhooks**: HTTP POST dispatch with standardized JSON incident payloads.
- **Intelligent Deduplication & Suppression**: Prevents alert fatigue and email storming with configurable suppression windows.
- **Automated Incident Recovery**: Notifies operators immediately when a failing service returns to healthy status.

---

## 3. Security Highlights & Hardening

1. **SSRF & DNS Rebinding Elimination**:
   - Outbound HTTP engine and webhook dispatchers strictly block loopback, RFC 1918 private ranges, carrier-grade NAT, and cloud metadata IPs (`169.254.169.254`).
   - Undici custom agent enforces DNS resolution preflight and socket-level pinning.
2. **Encrypted Headers at Rest**: Custom HTTP headers containing sensitive API keys or bearer tokens are encrypted in PostgreSQL using AES-256-GCM.
3. **Data Redaction in Logs**: Logging utilities automatically redact credentials and authorization tokens from stdout.
4. **Formula Injection Sanitization**: All exported CSV cells starting with `=, +, -, @, \t, \r` are escaped with `'`.
5. **Private Infrastructure Network**: PostgreSQL and Redis containers do not expose ports to the public internet; reverse proxying and automated HTTPS are enforced by Caddy.

---

## 4. Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Web App** | Next.js 16.4.5, React 19.3.0, Tailwind CSS v4, Lucide Icons, Recharts |
| **Backend API** | Next.js App Router API Routes, Next.js 16 `src/proxy.ts` |
| **Background Engine** | Node.js 22, BullMQ 6.7.2, Redis 7, Undici HTTP Client |
| **Database & ORM** | PostgreSQL 16, Prisma 7.10.1 (`@prisma/adapter-pg`) |
| **Container & Ops** | Docker Multi-Stage, Docker Compose, Caddy 2.8 Reverse Proxy |
| **Quality & Tests** | Vitest 5.1.0 (54/54 automated tests pass) |

---

## 5. Known Limitations & Roadmap for v1.1+

| Feature / Area | Status in v1.0.0 | Planned in v1.1+ |
| :--- | :--- | :--- |
| **Check Locations** | Single region (hosting server location) | Multi-region probe network (US, EU, AP) |
| **Alert Channels** | Email & Webhook | Native Slack, Discord, PagerDuty, SMS |
| **Assertion Rules** | Status, Header, Body string match | JSONPath assertion & regex patterns |
| **Team Collaboration** | Individual user accounts | Organizations, Teams, and RBAC |
| **Public Status Customization** | Global status page | Custom domains & incident note posting |
