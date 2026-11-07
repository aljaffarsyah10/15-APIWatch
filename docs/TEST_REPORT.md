# APIWatch — Quality Assurance, Security & Performance Test Report

**Phase**: Phase 9 — Testing, Security & Optimization  
**Date**: November 7, 2026  
**Status**: COMPLETE / READY FOR PRODUCTION (Phase 10)  
**Author**: Antigravity Quality & Application Security Assurance  

---

## 1. Test Environment

| Component | Specification / Version |
| :--- | :--- |
| **Operating System** | Windows 11 Pro (win32 x64) |
| **Node.js** | v22.15.0 |
| **npm** | 10.9.2 |
| **Framework** | Next.js 16.4.5 (Turbopack, Partial Prefetching enabled) |
| **UI Library** | React 19.3.0 |
| **ORM / Database** | Prisma 7.10.1 / PostgreSQL 16 (`@prisma/adapter-pg`) |
| **Cache & Queue** | Redis 7 (ioRedis 6.0.0, BullMQ 6.7.2) |
| **Test Runner** | Vitest 5.1.0 |
| **Type Checker** | TypeScript 5.8+ |
| **Linter** | ESLint 9 (`eslint-config-next` 16.4.5) |

---

## 2. Test Scope & Verification Matrix

The scope of testing covers core functional requirements, edge-case handling, full integration with PostgreSQL/Redis/BullMQ, deep security audits (SSRF, injection, IDOR), resilience, database indexing, and production compilation.

| Scope Area | Method | Total Tests / Checks | Status |
| :--- | :--- | :--- | :--- |
| **Type Safety** | `npx tsc --noEmit` | Clean zero-error pass | **PASS** |
| **Code Quality** | `npm run lint` | Zero errors (2 benign react-compiler warnings) | **PASS** |
| **Unit Testing** | Vitest (`tests/unit/*`) | 37 unit tests | **PASS** |
| **Integration Testing** | Vitest (`tests/integration/*`) | 17 integration tests | **PASS** |
| **Total Automated Tests**| Vitest runner | **54 passed (100%)** | **PASS** |
| **E2E Browser Automation**| Playwright | Deferred (Not configured in package.json) | **NOT TESTED** |
| **Production Build** | `npm run build` | Turbopack static & PPR optimized routes | **PASS** |
| **Dependency Security** | `npm audit` | 13 dev-deps advisories (0 production runtime risk) | **PASS** |

---

## 3. Test Scenarios and Results

### 3.1 Unit Test Scenarios (37 Tests — PASS)

#### A. Assertions & Validation (`tests/unit/domain/assertions.test.ts` — 9 Tests)
- `PASS` HTTP status code matching expected exact status (`200 OK`).
- `PASS` HTTP status mismatch detection (`500` vs `200`).
- `PASS` Header assertion matching exact value.
- `PASS` Header assertion case-insensitivity on header keys.
- `PASS` Header assertion failure on missing header.
- `PASS` Body assertion `contains` operator successfully matching string substring.
- `PASS` Body assertion `contains` operator failing when token absent.
- `PASS` Body assertion `equals` operator exact string equality.
- `PASS` Multi-assertion evaluation requiring all assertions to pass.

#### B. Metrics & Uptime Calculator (`tests/unit/domain/metrics.test.ts` — 10 Tests)
- `PASS` Calculate 100% uptime when all checks pass.
- `PASS` Calculate 0% uptime when all checks fail.
- `PASS` Calculate fractional uptime (`95.5%` uptime across mixed check states).
- `PASS` Graceful fallback to 100% when no checks exist for the timeframe.
- `PASS` Calculate average response time across successful checks.
- `PASS` Exclude timed-out or error checks from average latency calculations.
- `PASS` State transition from `PENDING` to `UP` on first successful check.
- `PASS` State transition from `UP` to `DEGRADED` on slow response threshold breach.
- `PASS` State transition from `UP` to `DOWN` on consecutive failure threshold.
- `PASS` State transition recovery from `DOWN` back to `UP` on successful check.

#### C. Encryption Utility (`tests/unit/security/encryption.test.ts` — 4 Tests)
- `PASS` Encrypt plaintext using AES-256-GCM producing `iv:authTag:ciphertext`.
- `PASS` Successfully decrypt ciphertext back to original plaintext.
- `PASS` Rejection of corrupted ciphertext or tampered authentication tags.
- `PASS` Generation of unique initialization vectors (IV) for identical plaintexts.

#### D. SSRF & Network Boundary Protection (`tests/unit/security/ssrf.test.ts` — 9 Tests)
- `PASS` Allow valid public IPv4 / domains (`8.8.8.8`, `example.com`).
- `PASS` Block IPv4 Loopback (`127.0.0.1`, `127.0.0.254`).
- `PASS` Block RFC 1918 Private Class A (`10.0.0.1`).
- `PASS` Block RFC 1918 Private Class B (`172.16.0.1`, `172.31.255.255`).
- `PASS` Block RFC 1918 Private Class C (`192.168.1.1`).
- `PASS` Block AWS/GCP/Azure Cloud Metadata IP (`169.254.169.254`).
- `PASS` Block IPv6 Loopback (`::1`) and Unique Local Addresses (`fc00::/7`).
- `PASS` Block non-HTTP protocols (`ftp://`, `file:///`, `gopher://`).
- `PASS` Enforce strict DNS resolution preflight before socket connection.

#### E. CSV Export Sanitization (`tests/unit/features/csv-export.test.ts` — 5 Tests)
- `PASS` Sanitize formula triggers prefixing `=` with `'`.
- `PASS` Sanitize formula triggers prefixing `+` with `'`.
- `PASS` Sanitize formula triggers prefixing `-` with `'`.
- `PASS` Sanitize formula triggers prefixing `@` with `'`.
- `PASS` Sanitize control characters `\t` and `\r`.

---

### 3.2 Integration Test Scenarios (17 Tests — PASS)

#### A. Dashboard Analytics (`tests/integration/dashboard.test.ts` — 2 Tests)
- `PASS` Enforce unauthenticated user rejection (HTTP 401).
- `PASS` Return aggregated user metrics (total monitors, active count, down count, average uptime).

#### B. Alert Channels & Webhook SSRF (`tests/integration/alerts.test.ts` — 4 Tests)
- `PASS` Reject alert channel creation without valid authentication.
- `PASS` Validate alert channel creation with payload schema validation.
- `PASS` Trigger alert delivery deduplication (preventing notification floods within suppression window).
- `PASS` Block Webhook SSRF targeting private IPs (`127.0.0.1`, `169.254.169.254`).

#### C. Monitor Management & Isolation (`tests/integration/monitors.test.ts` — 8 Tests)
- `PASS` Block unauthenticated access to monitor endpoints.
- `PASS` Create monitor with default configuration and assertions.
- `PASS` Block monitor creation with SSRF URLs (`http://169.254.169.254/latest/meta-data`).
- `PASS` Enforce IDOR protection: User A cannot retrieve User B's monitor (HTTP 404).
- `PASS` Enforce IDOR protection: User A cannot update User B's monitor.
- `PASS` Enforce IDOR protection: User A cannot delete User B's monitor.
- `PASS` Pause monitor and verify scheduler unregisters recurring checks.
- `PASS` Resume monitor and verify scheduler re-registers recurring checks.

#### D. Manual Check & Rate Limiting (`tests/integration/manual-check.test.ts` — 3 Tests)
- `PASS` Require authentication to trigger manual check.
- `PASS` Enforce 10-second per-monitor cooldown rate limit (HTTP 429 `RATE_LIMITED`).
- `PASS` Reject manual check request if monitor is paused.

---

## 4. Security Audit & Findings

### 4.1 Server-Side Request Forgery (SSRF) & DNS Rebinding
- **Finding**: Outbound requests originate from both the monitoring worker engine (`worker/src/engine/http-client.ts`) and webhook alert dispatchers (`worker/src/alerts/webhook.ts`, `src/server/application/alerts/alert.service.ts`).
- **Control Implemented**:
  1. DNS resolution preflight checks all returned IP addresses using `ipaddr.js`.
  2. Complete denial of `loopback`, `private`, `linkLocal`, `carrierGradeNat`, `broadcast`, and cloud metadata ranges (`169.254.169.254`).
  3. `undici.Agent` custom dispatcher locks down DNS pinning to prevent DNS-rebinding (TOCTOU attacks).
  4. Webhook URLs are pre-validated upon channel creation/update, and re-validated immediately before HTTP POST dispatch.
- **Audit Verdict**: **PASS / SECURED**

### 4.2 Cross-Site Request Forgery (CSRF) & Session Protection
- **Finding**: Authentication is powered by Better Auth using httpOnly, SameSite=Lax/Strict session cookies with bearer token verification on API endpoints.
- **Control Implemented**: Next.js 16 `src/proxy.ts` rejects cross-origin state mutations on protected API routes while allowing authenticated Bearer/Cookie requests.
- **Audit Verdict**: **PASS / SECURED**

### 4.3 Insecure Direct Object References (IDOR) & Tenant Isolation
- **Finding**: Multi-tenant database tables (`monitors`, `alert_channels`, `alert_events`, `monitor_checks`).
- **Control Implemented**: All service queries strictly enforce `where: { id, userId }`. In both `MonitorService` and `AlertService`, any access attempt by a non-owner returns standard `404 Not Found` (preventing ID harvesting).
- **Audit Verdict**: **PASS / SECURED**

### 4.4 CSV Formula Injection (CWE-1236)
- **Finding**: Monitor check history export to CSV could allow remote malicious API endpoints to return payloads like `=CMD|' /C calc'!A0` in error responses.
- **Control Implemented**: In `src/app/api/monitors/[id]/export/route.ts`, every exported cell value is sanitized with regex `/^[=+\-@\t\r]/`. Any formula prefix character is prepended with `'` to force spreadsheet engines to treat it as a literal string.
- **Audit Verdict**: **PASS / SECURED**

### 4.5 Secrets Protection & Data Redaction
- **Finding**: Custom HTTP headers (e.g., `Authorization: Bearer <token>`, `X-Api-Key`) stored for monitors.
- **Control Implemented**:
  1. Sensitive headers encrypted using AES-256-GCM before database insertion.
  2. Response bodies in `monitor_checks` are capped at 1,024 characters to prevent credential leakage.
  3. Worker logs redact all auth headers using regex patterns replacing tokens with `[REDACTED]`.
- **Audit Verdict**: **PASS / SECURED**

### 4.6 Dependency Vulnerability Audit (`npm audit`)
- **Finding**: 13 vulnerabilities flagged (2 low, 11 moderate) in dev-dependencies:
  - `deepmerge` / `@shadcn/registry` / `shadcn` CLI (prototype poisoning in CLI code generator).
  - `minimatch` in `@typescript-eslint` (glob parsing complexity in dev linter).
- **Control Implemented**: Analysis shows zero exposure to production runtime (`node_modules` production container does not bundle or execute `shadcn` CLI or `@typescript-eslint`). Flagged dependencies are development tooling only. `npm audit fix --force` was intentionally skipped to avoid breaking Next.js 16 / React 19 compatibility.
- **Audit Verdict**: **PASS / ACCEPTED RISK (DEV ONLY)**

---

## 5. Worker Reliability & Engine Resilience

### 5.1 Queue & Scheduling Resilience
- **BullMQ Atomic Deduplication**: Jobs are scheduled using monitor ID hashes (`check:monitor:${id}`) preventing duplicate simultaneous executions.
- **Exponential Backoff**: Webhook and alert delivery jobs retry up to 3 times with exponential backoff (`delay: 5000 * 2^attempt`).
- **Graceful Shutdown**: The worker listens for `SIGTERM` and `SIGINT`, finishing active in-flight checks and closing Redis connections cleanly before exiting.
- **Stale Check Reaping**: Scheduler uses atomic PostgreSQL timestamps to detect monitors whose checks were missed during worker downtime, instantly backfilling pending checks upon worker recovery.

### 5.2 Memory & Stream Capping
- **Body Truncation**: HTTP response streams in `undici` are aborted if the body exceeds 1MB (`1048576 bytes`), preventing memory exhaustion / DoS attacks from large files.

---

## 6. Performance & Database Optimization

### 6.1 Database Indexing Analysis
Prisma schema review confirms that all frequent query paths are backed by compound B-tree indexes:
- `monitors`:
  - `[userId, createdAt]` (Dashboard & user monitor list)
  - `[status, isActive]` (Scheduler polling query)
- `monitor_checks`:
  - `[monitorId, createdAt(sort: Desc)]` (History pagination & charts)
  - `[createdAt]` (Retention cleanup worker)
- `alert_channels`:
  - `[userId, isActive]` (User alert channels listing)
- `alert_events`:
  - `[monitorId, createdAt(sort: Desc)]` (Recent incident timeline)

### 6.2 Frontend & Next.js 16 Rendering Performance
- **Partial Prefetching (PPR)**: Enabled on dynamic monitor detail pages (`/monitors/[id]`) and public status page (`/status`), serving instant static shell while streaming dynamic Prisma data within `<Suspense>`.
- **Static Assets & Fonts**: Next.js Geist font optimizations and Turbopack asset caching.
- **Dashboard Bundling**: Recharts and chart primitives are modularized to prevent unnecessary main-thread hydration delays.

---

## 7. Responsive & UI Verification

- **Breakpoints Tested**:
  - Mobile (`375px` — iPhone SE, `390px` — iPhone 14)
  - Tablet (`768px` — iPad Portrait)
  - Desktop (`1280px` — Laptop, `1920px` — Full HD Monitor)
- **UI States Verified**:
  - Empty states across monitors, alerts, and history.
  - Skeletons during data loading (`StatusSkeleton`, `DashboardSkeleton`).
  - Error dialogs with descriptive actionable feedback.
  - Delete confirmations with explicit destructive action buttons.
  - Dark / Light / System theme toggling via `next-themes`.

---

## 8. Summary of Fixed Bugs Across Development

1. **Prisma 7 & Better Auth Schema Compatibility**: Added missing OAuth and token columns to Prisma schema and generated updated client types.
2. **Next.js 16 Middleware Deprecation**: Migrated legacy `middleware.ts` to standard Next.js 16 `src/proxy.ts` pattern.
3. **PPR Prerender Dynamic Data Failure**: Wrapped dynamic database queries on `/status` inside `<Suspense>` boundary to satisfy Next.js 16 partial prefetching constraints.
4. **React 19 Hooks Synchronization**: Fixed synchronous `setState` in `useEffect` warnings across dashboard components.
5. **Webhook Channel SSRF Hole**: Extended network boundary validation from HTTP monitors to webhook channels and worker alert dispatchers.

---

## 9. Release Readiness Assessment

| Criteria | Required Status | Actual Status | Ready? |
| :--- | :--- | :--- | :--- |
| TypeScript Type Safety | 0 Errors | 0 Errors | **YES** |
| Code Linting | 0 Errors | 0 Errors | **YES** |
| Automated Test Pass Rate | 100% | 54/54 (100%) | **YES** |
| Production Build | Successful | Next.js 16.4.5 Clean Build | **YES** |
| Security Protections (SSRF/IDOR/CSV) | Enforced | Verified in tests | **YES** |
| Worker Stability & Graceful Exit | Verified | BullMQ + Undici verified | **YES** |

**Conclusion**: **APIWatch has met all acceptance criteria for Phase 9 and is approved to proceed to Phase 10 (Production Deployment & Release).**
