<div align="center">

<img src="docs/assets/banner.png" alt="APIWatch Hero Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />

# APIWatch — API Monitoring & Incident Alerting SaaS

**Modern, production-grade uptime verification, latency analysis, and multi-channel alerting for mission-critical APIs.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-6.7.2-orange?style=for-the-badge)](https://bullmq.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-54%2F54%20PASS-10b981?style=for-the-badge)](tests/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Overview

**APIWatch** is an enterprise-grade API monitoring platform designed to provide developers, DevOps, and site reliability engineers with real-time visibility into their HTTP APIs, microservices, and external webhook endpoints.

Built on **Next.js 16 (Turbopack, Partial Prefetching)**, **PostgreSQL 16**, **Redis 7**, and a decoupled **BullMQ worker engine**, APIWatch delivers millisecond-precision uptime tracking, customizable multi-assertion validation, instant alert delivery (Email & Webhook), and military-grade network boundary security (SSRF, DNS rebinding, and IDOR protection).

---

## 📸 Dashboard & UI Preview

<div align="center">
  <img src="docs/assets/dashboard-preview.svg" alt="APIWatch Dashboard Mockup" width="100%" style="border-radius: 10px; border: 1px solid #1e293b;" />
</div>

---

## ✨ Key Features

| Category | Capability | Description |
| :--- | :--- | :--- |
| **Probing Engine** | **Multi-Method HTTP** | Probes `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `HEAD` endpoints with cadence from **30s to 1h**. |
| **Precision** | **Monotonic Clock** | Measures latency using `performance.now()` across DNS, handshake, and byte streaming. |
| **Assertions** | **Multi-Rule Evaluation** | Enforces exact HTTP status codes, case-insensitive headers, and body strings (`contains`, `equals`). |
| **Security** | **SSRF Shield** | Preflight DNS checks and socket pinning strictly block RFC 1918, loopbacks, and cloud metadata (`169.254.169.254`). |
| **Encryption** | **Encrypted Secrets** | Custom authorization headers (`Bearer`, `ApiKey`) are encrypted at rest with **AES-256-GCM**. |
| **Alerting** | **Multi-Channel** | Sends rich transactional alerts via **SMTP Email** and **Custom Webhooks** with auto-recovery notices. |
| **Suppression** | **Deduplication** | Prevents notification storms with configurable suppression windows and incident backoff. |
| **Reporting** | **CSV Audit Export** | One-click history export with automated CSV formula injection protection (CWE-1236). |
| **Public Status** | **Status Page** | Blazing-fast public status page (`/status`) powered by Next.js 16 Partial Prerendering. |

---

## 🏗️ System Architecture

<div align="center">
  <img src="docs/assets/architecture.svg" alt="APIWatch System Architecture" width="100%" style="border-radius: 10px; border: 1px solid #1e293b;" />
</div>

- **Edge / Reverse Proxy**: Caddy 2.8 terminates HTTPS with automated Let's Encrypt certificates, HTTP/3 QUIC, and strict security headers.
- **Web Layer**: Next.js 16 standalone application serving the responsive UI, Better Auth authentication, and REST APIs.
- **Worker Layer**: Independent Node.js 22 background engine consuming BullMQ distributed queues.
- **Private Data Layer**: PostgreSQL 16 (Prisma ORM) and Redis 7 (Append-Only) run in an isolated internal Docker bridge network without public port exposure.

---

## 🚀 Quickstart: How to Run the Project

### Option A: Run with Docker Compose (Recommended for Production / Staging)

The fastest and most reliable way to spin up the entire APIWatch stack (Web, Worker, PostgreSQL, Redis, and Reverse Proxy):

```bash
# 1. Clone repository
git clone https://github.com/your-org/apiwatch.git
cd apiwatch

# 2. Configure production environment
cp .env.production.example .env
# (Optionally edit .env to set your APP_DOMAIN, database password, and SMTP credentials)

# 3. Build and launch all 5 containers
docker compose build
docker compose up -d postgres redis
docker compose run --rm web npx prisma migrate deploy
docker compose up -d

# 4. Check running containers
docker compose ps
```

Visit **`https://localhost`** (or your configured `APP_DOMAIN`) in your browser!

---

### Option B: Run for Local Development

Follow these steps to run the Next.js web application and background worker on your local machine:

#### 1. Prerequisites
- **Node.js**: v20.x or v22.x (`node -v`)
- **npm**: 10.x or pnpm 9.x
- **PostgreSQL**: v16 running locally (or via Docker)
- **Redis**: v7 running locally (or via Docker)

#### 2. Start PostgreSQL & Redis locally (using Docker if needed)
```bash
# Spin up local DB and Redis containers:
docker run -d --name apiwatch-pg -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=apiwatch postgres:16-alpine
docker run -d --name apiwatch-redis -p 6379:6379 redis:7-alpine
```

#### 3. Install Dependencies
```bash
npm install
```

#### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `.env` contains:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/apiwatch?schema=public"
REDIS_URL="redis://localhost:6379"
BETTER_AUTH_SECRET="dev_secret_replace_with_32_byte_secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

#### 5. Push Database Schema
```bash
npx prisma generate
npx prisma db push
```

#### 6. Start the Next.js Web App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 7. Start the Background Monitoring Worker
In a **second terminal window**, start the monitoring engine:
```bash
npm run worker:dev
```
The worker will automatically connect to Redis and PostgreSQL, poll active monitors according to their schedule, execute HTTP probes, record metrics, and dispatch alerts.

---

## 🧪 Testing & Verification

APIWatch includes a comprehensive suite of unit and integration tests covering domain logic, encryption, SSRF protection, IDOR isolation, and API route security:

```bash
# 1. Run all 54 Vitest unit and integration tests
npm test

# 2. Run TypeScript strict type checker
npx tsc --noEmit

# 3. Run ESLint code quality inspection
npm run lint

# 4. Verify Next.js production compilation (Turbopack standalone build)
npm run build
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/dashboard/summary` | Aggregated user metrics & active monitor counts | Yes (Bearer/Cookie) |
| `GET` | `/api/monitors` | List all monitors owned by authenticated user | Yes |
| `POST` | `/api/monitors` | Create a new monitor with assertions & intervals | Yes |
| `GET` | `/api/monitors/:id` | Retrieve monitor configuration and latency metrics | Yes |
| `PUT` | `/api/monitors/:id` | Update target endpoint, headers, and intervals | Yes |
| `DELETE` | `/api/monitors/:id` | Delete monitor and cancel scheduled background jobs | Yes |
| `POST` | `/api/monitors/:id/check-now` | Trigger on-demand manual check (10s cooldown) | Yes |
| `POST` | `/api/monitors/:id/pause` | Pause monitor checks | Yes |
| `POST` | `/api/monitors/:id/resume` | Resume monitor checks | Yes |
| `GET` | `/api/monitors/:id/checks` | Paginated check history with latency & status | Yes |
| `GET` | `/api/monitors/:id/export` | Export check history to CSV (formula sanitized) | Yes |
| `GET` | `/api/alerts` | List configured alert notification channels | Yes |
| `POST` | `/api/alerts` | Create email or webhook alert channel (SSRF safe) | Yes |
| `DELETE` | `/api/alerts/:id` | Remove alert channel | Yes |
| `GET` | `/status` | Public status page (Partial Prerendered) | No (Public) |

---

## 🔒 Security & Protection Safeguards

- **SSRF & DNS Rebinding Protection**: Outbound requests are vetted with `ipaddr.js` before opening sockets. Requests targeting RFC 1918 private subnets, loopbacks, broadcast, carrier-grade NAT, or cloud metadata endpoints (`169.254.169.254`) are immediately aborted.
- **Insecure Direct Object Reference (IDOR)**: Every database operation enforces strict ownership (`userId`). Unowned resource IDs yield standard `404 Not Found` responses to prevent ID harvesting.
- **CSV Injection (CWE-1236)**: All exported historical values starting with `=, +, -, @, \t, \r` are escaped with `'` to neutralize formula injection in Microsoft Excel and Google Sheets.
- **Zero Secrets in Logs**: Sensitive authorization headers and passwords are encrypted in the database via AES-256-GCM and redacted from application stdout logs.

---

## 📚 Documentation Index

For in-depth operational and architectural details, refer to:
- [Technical Architecture Plan](docs/TECHNICAL_PLAN.md)
- [UI/UX Design Specification](docs/UI_UX_GUIDE.md)
- [Quality Assurance & Security Test Report](docs/TEST_REPORT.md)
- [Production Deployment & Operations Guide](docs/DEPLOYMENT_GUIDE.md)
- [Release Notes v1.0.0 (MVP)](docs/RELEASE_NOTES.md)

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
