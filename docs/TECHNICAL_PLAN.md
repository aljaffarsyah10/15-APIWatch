# TECHNICAL PLAN — APIWatch

> **Document Version**: 1.0  
> **Status**: Final (Phase 2 Deliverable)  
> **Date**: November 2026  
> **Author**: Senior Software Architect & Technical Lead  
> **Target Project**: APIWatch — Continuous API Monitoring Platform

---

## 1. Architecture Overview

APIWatch dirancang menggunakan pola **Modular Monolith dengan Dedicated Background Worker**. Sistem ini secara fundamental memisahkan antara runtime antarmuka pengguna/API aplikasi (*Application Web Process*) dan mesin eksekusi pemantauan berkala (*Monitoring Worker Process*).

### Prinsip Desain Utama:
1. **Pemisahan Runtime (Separation of Concerns)**:
   - **Next.js App Router (Node.js)** bertanggung jawab atas rendering antarmuka pengguna (React Server/Client Components), penyediaan Route Handlers (REST API), autentikasi pengguna, otorisasi, dan validasi input.
   - **Dedicated Worker (Node.js Standalone)** bertanggung jawab atas penjadwalan pemantauan (*scheduler*), eksekusi HTTP check dengan perlindungan SSRF tingkat rendah, validasi respons, kalkulasi durasi, penyimpanan metrik, deteksi transisi status, dan pendelegasian pengiriman notifikasi (*alert dispatch*).
2. **Database sebagai Source of Truth**:
   - PostgreSQL menyimpan seluruh entitas persisten: pengguna, sesi autentikasi, konfigurasi monitor, riwayat pemeriksaan (*monitoring checks*), kanal notifikasi, dan log kejadian alert.
   - Jadwal pemantauan berbasis kolom `nextCheckAt` di database, bukan hanya bertumpu pada memori Redis.
3. **Asynchronous Job Processing**:
   - Redis dan BullMQ digunakan sebagai mesin antrean tugas (*message broker & job queue*) untuk decoupling antara scheduler, worker eksekusi HTTP, dan worker pengiriman notifikasi (Email/Webhook).
4. **Security-First Execution**:
   - Endpoint pemantauan mengeksekusi request ke server eksternal milik pengguna, sehingga perlindungan terhadap **Server-Side Request Forgery (SSRF)** dan **DNS Rebinding** diimplementasikan langsung pada level soket dan resolver DNS, bukan sekadar validasi string URL.
5. **No Microservices Overhead**:
   - Seluruh logika aplikasi berada dalam satu repository modular (*monolith*) dengan worker internal yang berbagi pustaka domain dan database schema via Prisma.

---

## 2. Architecture Diagram

```mermaid
flowchart TD
    subgraph Client ["Client Layer"]
        Browser["User Browser / SPA Client"]
    end

    subgraph AppServer ["Next.js Application (Web & API)"]
        UI["React Server / Client Components (shadcn/ui + Tailwind)"]
        AuthModule["Better Auth Engine (Session & Password Hash)"]
        RouteHandlers["Next.js Route Handlers (/api/*)"]
        AppServices["Application Services & Zod Validators"]
    end

    subgraph Storage ["Data & Messaging Layer"]
        Postgres[("PostgreSQL\n(Users, Monitors, Checks, Alerts)")]
        RedisQueue[("Redis + BullMQ\n(Queues: monitor-check, alert-email, alert-webhook)")]
    end

    subgraph WorkerProcess ["Dedicated Node.js Worker Process"]
        Scheduler["Monitor Scheduler (DB Polling + Row Lock)"]
        JobConsumer["BullMQ Check Consumer"]
        SSRFEngine["SSRF Guard & DNS Resolver / Pinning"]
        HttpEngine["HTTP Execution Engine (Undici / Fetch)"]
        ValidatorEngine["Response Validator (Status, Headers, Body)"]
        AlertDispatcher["Alert Transition Detector & Queue Producer"]
        AlertConsumer["Alert Worker (Email / Webhook)"]
    end

    subgraph External ["External Services & Targets"]
        UserTargets["External User API Endpoints"]
        SMTPProvider["SMTP Email Server"]
        Webhooks["User Webhook Endpoints"]
    end

    Browser <-->|HTTPS| UI
    Browser <-->|REST API JSON| RouteHandlers
    UI --> AppServices
    RouteHandlers --> AuthModule
    RouteHandlers --> AppServices
    AppServices -->|Prisma Client| Postgres
    AppServices -->|Manual Check Job| RedisQueue

    Scheduler -->|Poll due nextCheckAt / SKIP LOCKED| Postgres
    Scheduler -->|Enqueue monitor-check| RedisQueue
    RedisQueue -->|Pop job| JobConsumer

    JobConsumer --> SSRFEngine
    SSRFEngine -->|Validated & Pinned IP| HttpEngine
    HttpEngine -->|HTTP / HTTPS Request| UserTargets
    UserTargets -->|HTTP Response| HttpEngine
    HttpEngine --> ValidatorEngine
    ValidatorEngine -->|Save Check Result & Update Status| Postgres
    ValidatorEngine --> AlertDispatcher
    AlertDispatcher -->|State Transition? Enqueue Alert| RedisQueue

    RedisQueue -->|Pop alert job| AlertConsumer
    AlertConsumer -->|Send Email| SMTPProvider
    AlertConsumer -->|POST Payload| Webhooks
    AlertConsumer -->|Update Delivery Log| Postgres
```

---

## 3. Folder Structure

Berikut adalah struktur target proyek APIWatch yang modular dan pragmatis:

```
apiwatch/
├── docs/
│   ├── TECHNICAL_PLAN.md        # Technical plan & architecture specs
│   └── UI_UX_GUIDE.md           # UI/UX design tokens & interface guide
│
├── prisma/
│   ├── schema.prisma            # Prisma schema models & indexes
│   └── migrations/              # Database migration files
│
├── public/                      # Static assets (favicons, logos)
│
├── scripts/                     # Operational scripts (seed, maintenance)
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (marketing)/         # Public landing page & marketing routes
│   │   ├── (auth)/              # Login, register, forgot-password routes
│   │   ├── (dashboard)/         # Protected user workspace routes
│   │   │   ├── dashboard/
│   │   │   ├── monitors/
│   │   │   │   ├── [id]/
│   │   │   │   └── new/
│   │   │   └── alerts/
│   │   ├── api/                 # Next.js Route Handlers
│   │   │   ├── auth/            # Better Auth handlers [...all]
│   │   │   ├── monitors/        # CRUD, pause, resume, checks history
│   │   │   ├── dashboard/       # Aggregated summary & incident stats
│   │   │   └── alerts/          # Alert channel management
│   │   ├── globals.css          # Tailwind CSS v4 & theme variables
│   │   └── layout.tsx           # Root application layout
│   │
│   ├── components/
│   │   ├── ui/                  # Reusable shadcn/ui primitives
│   │   ├── layout/              # Shell, Sidebar, Header, UserNav
│   │   └── shared/              # StatusBadge, MetricCard, ConfirmDialog
│   │
│   ├── features/                # Domain-driven feature UI modules
│   │   ├── auth/                # LoginForm, RegisterForm, AuthGuard
│   │   ├── dashboard/           # SummaryOverview, RecentChecksList
│   │   ├── monitors/            # MonitorForm, MonitorList, LatencyChart
│   │   └── alerts/              # ChannelCard, ChannelConfigModal
│   │
│   ├── hooks/                   # Custom client hooks (useDebounce, useAutoRefresh)
│   │
│   ├── lib/                     # Shared cross-cutting libraries
│   │   ├── auth/                # Better Auth server configuration
│   │   ├── db/                  # Prisma client singleton
│   │   ├── redis/               # IORedis client singleton
│   │   ├── queue/               # BullMQ queue definitions
│   │   ├── security/            # Encryption (AES-256-GCM), SSRF validator
│   │   ├── validation/          # Shared Zod schemas
│   │   └── utils.ts             # Tailwind class merging (cn)
│   │
│   ├── server/                  # Server-side domain & application logic
│   │   ├── application/         # Use-cases (CreateMonitor, ProcessAlert)
│   │   ├── domain/              # Business types & calculation pure functions
│   │   └── services/            # Database query orchestration
│   │
│   └── types/                   # Shared TypeScript definitions
│
├── worker/                      # Dedicated Background Worker (Node.js)
│   ├── src/
│   │   ├── index.ts             # Worker entry point & lifecycle manager
│   │   ├── scheduler/           # Due-monitor polling & reconciliation
│   │   ├── jobs/                # BullMQ worker consumers (Check, Alert)
│   │   ├── engine/              # HTTP execution engine with timeout & bounds
│   │   ├── validators/          # Status, Header, and Body assertion logic
│   │   ├── alerts/              # Email (SMTP) & Webhook senders
│   │   └── lib/                 # Worker-specific logger, DNS & SSRF protection
│   └── tsconfig.json            # Worker TypeScript configuration
│
├── tests/
│   ├── unit/                    # Unit tests for validators, calculators, SSRF
│   └── integration/             # API routes & worker flow tests
│
├── docker-compose.yml           # PostgreSQL, Redis, Web, & Worker containers
├── Dockerfile                   # Multi-stage container build
├── package.json                 # Project dependencies & scripts
└── PRD and Playbook.md          # Master Product Requirements Document
```

---

## 4. Frontend Architecture

### 4.1 Component Hierarchy & Boundaries
- **Server Components (RSC)**: Digunakan secara default untuk *initial page rendering*, verifikasi otentikasi sesi di tingkat route, dan injeksi data awal tanpa efek *waterfall*.
- **Client Components (`"use client"`)**: Dibatasi hanya pada bagian antarmuka yang memerlukan reaktivitas:
  - Form input dinamis (misalnya konfigurasi custom header dan assertions pada Monitor Form).
  - Interaksi visual seperti modal dialog, dropdown, tabs, dan konfirmasi penghapusan.
  - Komponen charting metrik performa (*Recharts*).
- **Design System**: Memanfaatkan **Tailwind CSS v4** dan **shadcn/ui** untuk menjamin aksesibilitas (WAI-ARIA), konsistensi tipografi, dan keseragaman palet warna (*Slate/Neutral theme*).

### 4.2 State Management Strategy
- **Local State (`useState`, `useReducer`)**: Untuk state formulir dan UI internal komponen.
- **URL Query Parameters (`useSearchParams`)**: Untuk filter daftar monitor (status, pencarian kata kunci, pagination), memastikan status filter dapat di-bookmark dan dibagikan.
- **Zustand Store (Selektif)**: Digunakan khusus untuk state global yang dibagi antar-komponen tanpa *prop drilling* (misalnya state sidebar collapse atau notifikasi toast antrean instan).
- **Server Cache & Revalidation**: Memanfaatkan revalidasi rute Next.js (`router.refresh()`) setelah mutasi data.

---

## 5. Backend Architecture

### 5.1 Route Handlers & Application Orchestration
- Backend aplikasi diimplementasikan di atas **Next.js Route Handlers** (`src/app/api/*`).
- Setiap handler menerapkan pola pipeline terstandarisasi:
  1. **Authentication Check**: Verifikasi session via Better Auth server helper.
  2. **Input Validation**: Parsing dan sanitasi payload request menggunakan schema Zod.
  3. **Authorization Check**: Memastikan entitas yang diminta dimiliki oleh `userId` dari session.
  4. **Domain/Application Execution**: Memanggil use-case service.
  5. **Standardized Response**: Mengembalikan format JSON terpadu dengan HTTP status code yang tepat.

### 5.2 Decoupling Business Rules
- Logika kalkulasi bisnis (seperti rumus *Uptime Percentage* dan kalkulasi *Average Latency*) diisolasi ke dalam fungsi murni (*pure functions*) di `src/server/domain/` agar dapat diuji secara independen tanpa ketergantungan pada runtime Next.js atau Prisma.

---

## 6. Dedicated Worker Architecture

Worker adalah proses Node.js jangka panjang (*long-running daemon*) yang dijalankan terpisah dari Next.js.

### 6.1 Worker Components
1. **Scheduler Loop**:
   - Berjalan dengan interval terkonfigurasi (default: `SCHEDULER_POLL_INTERVAL_MS = 5000`).
   - Melakukan kueri atomik ke PostgreSQL untuk mencari monitor yang aktif (`isActive = true`), status bukan `PAUSED`, dan `nextCheckAt <= NOW()`.
   - Menggunakan klausa `FOR UPDATE SKIP LOCKED` pada transaksi batch database untuk mencegah *race condition* jika worker dijalankan dalam mode multi-instance.
   - Mengubah `nextCheckAt = NOW() + intervalSeconds` dan membuat entri `MonitorCheck` baru dengan status `QUEUED`.
   - Mengirim (*enqueue*) tugas ke BullMQ queue `monitor-check` dengan job ID yang konsisten (`checkId`).
2. **Reconciliation Loop**:
   - Berjalan berkala (misalnya setiap 60 detik) untuk memindai entri `MonitorCheck` yang berstatus `QUEUED` lebih dari 2 menit (kemungkinan akibat kegagalan koneksi Redis atau restart tak terduga) dan mengantrekannya kembali.
3. **Execution Consumer (BullMQ Worker)**:
   - Mengambil tugas dari antrean `monitor-check`.
   - Menginisialisasi eksekusi pemeriksaan HTTP melalui engine anti-SSRF.
   - Mengukur durasi (ms) secara akurat menggunakan `performance.now()`.
   - Memvalidasi status code, headers, dan body.
   - Memperbarui record `MonitorCheck` menjadi `SUCCESS` / `FAILURE` / `TIMEOUT` / `NETWORK_ERROR` / `VALIDATION_ERROR`.
   - Memperbarui agregat status monitor (`lastCheckedAt`, `status`, `lastSuccessfulAt`).
4. **Alert Trigger & Consumer**:
   - Jika terjadi transisi status monitor (`UP -> DOWN` atau `DOWN -> UP` / recovery), worker memicu pembuatan job notifikasi di queue `alert-email` dan `alert-webhook`.
   - Consumer alert memproses pengiriman secara terisolasi tanpa membebani thread pemantauan.

---

## 7. Database Schema Design (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ----------------------------------------------------
// Authentication Models (Better Auth Standard)
// ----------------------------------------------------

model User {
  id            String         @id @default(uuid())
  name          String
  email         String         @unique
  emailVerified Boolean        @default(false)
  image         String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  sessions      Session[]
  accounts      Account[]
  monitors      Monitor[]
  alertChannels AlertChannel[]

  @@map("users")
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Account {
  id           String    @id @default(uuid())
  userId       String
  accountId    String
  providerId   String
  accessToken  String?
  refreshToken String?
  passwordHash String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("accounts")
}

model Verification {
  id         String   @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("verifications")
}

// ----------------------------------------------------
// Core Monitoring Models
// ----------------------------------------------------

enum HttpMethod {
  GET
  POST
  PUT
  PATCH
  DELETE
  HEAD
}

enum MonitorStatus {
  UP
  DOWN
  PAUSED
  UNKNOWN
}

enum CheckStatus {
  QUEUED
  RUNNING
  SUCCESS
  FAILURE
  TIMEOUT
  NETWORK_ERROR
  VALIDATION_ERROR
}

model Monitor {
  id                      String         @id @default(uuid())
  userId                  String
  name                    String
  url                     String
  method                  HttpMethod     @default(GET)
  intervalSeconds         Int            @default(60)
  timeoutMs               Int            @default(10000)
  expectedStatusCodes     Json           @default("[200]")
  
  // Encrypted secrets
  requestHeadersEncrypted String?        @db.Text
  requestBodyEncrypted    String?        @db.Text
  
  // Validation rules
  expectedHeaders         Json?
  bodyValidation          Json?
  
  // State tracking
  status                  MonitorStatus  @default(UNKNOWN)
  isActive                Boolean        @default(true)
  lastCheckedAt           DateTime?
  lastSuccessfulAt        DateTime?
  nextCheckAt             DateTime?

  createdAt               DateTime       @default(now())
  updatedAt               DateTime       @updatedAt

  user                    User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  checks                  MonitorCheck[]
  alertEvents             AlertEvent[]

  @@index([userId])
  @@index([isActive, status, nextCheckAt])
  @@map("monitors")
}

model MonitorCheck {
  id                String       @id @default(uuid())
  monitorId         String
  status            CheckStatus  @default(QUEUED)
  httpStatus        Int?
  responseTimeMs    Int?
  failureReason     String?      @db.Text
  validationResults Json?
  checkedAt         DateTime?
  createdAt         DateTime     @default(now())

  monitor           Monitor      @relation(fields: [monitorId], references: [id], onDelete: Cascade)

  @@index([monitorId, checkedAt(sort: Desc)])
  @@index([status, createdAt])
  @@map("monitor_checks")
}

// ----------------------------------------------------
// Alerting Models
// ----------------------------------------------------

enum AlertChannelType {
  EMAIL
  WEBHOOK
}

enum AlertEventType {
  DOWN
  RECOVERY
}

enum DeliveryStatus {
  PENDING
  SENT
  FAILED
}

model AlertChannel {
  id              String           @id @default(uuid())
  userId          String
  type            AlertChannelType
  destination     String
  secretEncrypted String?          @db.Text
  isEnabled       Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  alertEvents     AlertEvent[]

  @@index([userId])
  @@map("alert_channels")
}

model AlertEvent {
  id             String         @id @default(uuid())
  monitorId      String
  channelId      String
  eventType      AlertEventType
  deliveryStatus DeliveryStatus @default(PENDING)
  attemptCount   Int            @default(0)
  lastError      String?        @db.Text
  createdAt      DateTime       @default(now())
  deliveredAt    DateTime?

  monitor        Monitor        @relation(fields: [monitorId], references: [id], onDelete: Cascade)
  channel        AlertChannel   @relation(fields: [channelId], references: [id], onDelete: Cascade)

  @@index([monitorId])
  @@index([channelId])
  @@map("alert_events")
}
```

---

## 8. API Endpoint Contracts

Seluruh response API dibungkus dalam format konsisten:
- Sukses: `{ "success": true, "data": ... }`
- Gagal: `{ "success": false, "error": { "code": string, "message": string, "details"?: any } }`

| Method | Endpoint | Auth | Deskripsi | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Pendaftaran pengguna | `{ name, email, password }` | 201 Created |
| **POST** | `/api/auth/login` | Public | Login pengguna | `{ email, password }` | 200 OK |
| **POST** | `/api/auth/logout` | Session | Logout & revoke session | - | 200 OK |
| **GET** | `/api/dashboard/summary` | Session | Agregat dashboard | Query: `?period=24h` | 200 OK |
| **GET** | `/api/monitors` | Session | List monitor milik user | Query: `?page=1&limit=10&status=UP&search=api` | 200 OK |
| **POST** | `/api/monitors` | Session | Buat konfigurasi monitor | `{ name, url, method, intervalSeconds, timeoutMs, expectedStatusCodes, headers?, body?, bodyValidation? }` | 201 Created |
| **GET** | `/api/monitors/[id]` | Session | Detail satu monitor | Params: `id` | 200 OK |
| **PATCH** | `/api/monitors/[id]` | Session | Update konfigurasi | Parsial field monitor | 200 OK |
| **DELETE** | `/api/monitors/[id]` | Session | Hapus monitor & histori | Params: `id` | 200 OK |
| **POST** | `/api/monitors/[id]/pause` | Session | Jeda pemantauan | Params: `id` | 200 OK |
| **POST** | `/api/monitors/[id]/resume` | Session | Lanjutkan pemantauan | Params: `id` | 200 OK |
| **POST** | `/api/monitors/[id]/check-now` | Session | Trigger manual check (P1) | Params: `id` (Rate limited) | 202 Accepted |
| **GET** | `/api/monitors/[id]/checks` | Session | Riwayat pemeriksaan | Query: `?page=1&limit=50&status=FAILURE` | 200 OK |
| **GET** | `/api/alerts` | Session | List kanal alert user | - | 200 OK |
| **POST** | `/api/alerts` | Session | Tambah kanal alert | `{ type: "EMAIL"|"WEBHOOK", destination, secret? }` | 201 Created |
| **PATCH** | `/api/alerts/[id]` | Session | Update status kanal | `{ isEnabled, destination? }` | 200 OK |
| **DELETE** | `/api/alerts/[id]` | Session | Hapus kanal alert | Params: `id` | 200 OK |

---

## 9. Authentication Design

- **Provider**: **Better Auth** digunakan sebagai mesin otentikasi mandiri.
- **Session Management**: Session disimpan di PostgreSQL dan dihubungkan via HTTP-only, secure, SameSite cookies.
- **Password Hashing**: Menggunakan algoritma modern (Argon2id atau Scrypt) yang disediakan secara default oleh Better Auth.
- **Isolation Rule**: Setiap query data wajib memfilter menggunakan parameter `userId` yang diekstrak langsung dari verified session, menolak nilai `userId` yang dikirimkan oleh payload client.

---

## 10. Queue & Scheduler Design

Sistem menggunakan **BullMQ** di atas Redis untuk mengelola *job lifecycle*:

### 10.1 Queue Definitions
1. `queue:monitor-check`:
   - Concurrency: `WORKER_CONCURRENCY` (default: 10 worker concurrency).
   - Retry: 0 (monitoring check yang gagal tidak di-retry di level BullMQ, melainkan dicatat sebagai failed check dan dijadwalkan ulang oleh scheduler normal).
   - Deduplication: `jobId = checkId` (idempotency key).
2. `queue:alert-email`:
   - Concurrency: 5.
   - Retry: 3 kali dengan *exponential backoff* (delay 5s, 15s, 45s).
3. `queue:alert-webhook`:
   - Concurrency: 5.
   - Retry: 2 kali dengan timeout ketat (5 detik) untuk mencegah penumpukan worker.

### 10.2 Database-Backed Scheduling Flow
```
[Database Poller (every 5s)]
       │
       ├─► SELECT id, intervalSeconds FROM monitors 
       │   WHERE isActive = true AND status != 'PAUSED' AND nextCheckAt <= NOW()
       │   FOR UPDATE SKIP LOCKED LIMIT 50;
       │
       ├─► UPDATE monitors SET nextCheckAt = NOW() + intervalSeconds;
       │
       ├─► INSERT INTO monitor_checks (id, monitorId, status = 'QUEUED', createdAt = NOW());
       │
       └─► BullMQ.add('check', { checkId, monitorId }, { jobId: checkId });
```

---

## 11. Monitoring Execution Flow & Assertions

Eksekusi HTTP check pada worker berlangsung melalui urutan evaluasi ketat:

1. **Persiapan Request**:
   - Dekripsi custom header dan request body (menggunakan AES-256-GCM).
   - Validasi batas ukuran payload request (maksimum 1 MB).
2. **Evaluasi Keamanan SSRF & DNS Pinning**:
   - Resolve hostname ke alamat IP target.
   - Periksa IP terhadap daftar blokir (RFC-1918, Loopback, Cloud Metadata).
   - Jika terindikasi berbahaya, batalkan eksekusi seketika dengan status `VALIDATION_ERROR` dan alasan `SSRF_BLOCKED`.
3. **Eksekusi HTTP**:
   - Kirim HTTP request ke IP yang telah dipin menggunakan custom dispatcher.
   - Set timeout pembatalan (`AbortController`) sesuai nilai `timeoutMs`.
   - Hitung durasi awal menggunakan `t0 = performance.now()`.
   - Tangkap respons dan hitung `responseTimeMs = Math.round(performance.now() - t0)`.
   - Baca response body dengan batas maksimal `MONITOR_MAX_RESPONSE_BYTES = 1048576` (1 MB) untuk mencegah *memory exhaustion*.
4. **Eksekusi Evaluasi Respons**:
   - **Status Code Assertion**: Apakah `httpStatus` berada dalam daftar `expectedStatusCodes`?
   - **Header Assertion**: Apakah expected headers (misal `content-type`, `authorization`) cocok secara case-insensitive?
   - **Body Assertion**:
     - *Contains*: Memastikan substring ada dalam response body.
     - *Exact Match*: Memastikan kesesuaian string persis.
     - *JSON Path Equality*: Melakukan evaluasi dot-notation path (contoh: `data.status == "healthy"`).
5. **Klasifikasi Hasil**:
   - Jika semua validator lolos: `status = SUCCESS`.
   - Jika validator gagal: `status = FAILURE` atau `VALIDATION_ERROR` beserta rincian kegagalan.
   - Jika terjadi network/socket error: `status = NETWORK_ERROR`.
   - Jika waktu habis: `status = TIMEOUT`.
6. **Persistensi & Transisi Status**:
   - Simpan hasil ke `MonitorCheck`.
   - Periksa apakah terjadi transisi status (`UP -> DOWN` atau `DOWN -> UP`). Jika ya, delegasikan ke alert queue.

---

## 12. SSRF Security Design (In-Depth)

Pemantauan endpoint eksternal rentan terhadap eksploitasi internal network jika tidak diamankan secara fundamental.

### 12.1 Blacklist IP & Subnet
Semua request yang mengarah ke rentang alamat berikut ditolak secara absolut:
- `127.0.0.0/8` (IPv4 Loopback)
- `::1/128` (IPv6 Loopback)
- `10.0.0.0/8` (RFC 1918 Private Network)
- `172.16.0.0/12` (RFC 1918 Private Network)
- `192.168.0.0/16` (RFC 1918 Private Network)
- `169.254.0.0/16` (IPv4 Link-Local / AWS/GCP/Azure Metadata Service)
- `fe80::/10` (IPv6 Link-Local)
- `0.0.0.0/8` (Current network)
- `100.64.0.0/10` (Carrier-grade NAT)

### 12.2 DNS Rebinding Protection
- Worker mengimplementasikan *custom DNS lookup* pada HTTP Client (**Node.js Undici / Custom Agent**).
- Hostname di-resolve sebelum koneksi TCP dibuat.
- Seluruh alamat IP hasil resolving diverifikasi terhadap daftar blokir.
- Koneksi TCP dipaksa menghubungkan langsung ke IP yang sudah diverifikasi (*DNS pinning*), bukan membiarkan OS me-resolve ulang hostname saat proses transmisi soket berlangsung.

### 12.3 Redirect Control
- Default: `redirect = "manual"` (redirect tidak diikuti secara otomatis).
- Jika pengguna mengaktifkan *follow redirect* (maksimal 3 hop), setiap target URL pada header `Location` wajib melalui pipeline validasi SSRF dan DNS pinning ulang dari awal sebelum request berikutnya dikirim.

---

## 13. Encryption Strategy

Untuk melindungi data sensitif pengguna (seperti `Authorization: Bearer <token>` atau Webhook Signing Secret):
- **Algoritma**: **AES-256-GCM** (*Authenticated Encryption with Associated Data*).
- **Format Penyimpanan**: `iv:authTag:encryptedCiphertext` dalam bentuk string hex atau base64.
- **Kunci Enkripsi**: Dibaca dari environment variable `ENCRYPTION_KEY` (32-byte hexadecimal / 256 bits).
- **Prinsip**:
  - Kunci enkripsi tidak pernah disimpan dalam database atau ditransfer ke antarmuka client.
  - Nilai rahasia didekripsi hanya di dalam lingkungan memori worker saat request HTTP akan dieksekusi.

---

## 14. Error Handling Strategy

### 14.1 Standardized API Error Envelope
Setiap respons error dari Route Handler mengikuti struktur berikut:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The provided monitor configuration is invalid.",
    "details": [
      {
        "field": "url",
        "message": "URL must use http or https protocol and cannot point to private IP."
      }
    ]
  }
}
```

### 14.2 HTTP Check Failure Reasons
Kategori error pada `MonitorCheck.failureReason` terstandarisasi:
- `HTTP_STATUS_MISMATCH`: Status code yang diterima tidak cocok dengan expected status.
- `HEADER_MISMATCH`: Header wajib tidak ditemukan atau nilainya tidak sesuai.
- `BODY_MISMATCH`: Evaluasi body tidak memenuhi kriteria.
- `REQUEST_TIMEOUT`: Permintaan melebihi batas milidetik yang ditentukan.
- `DNS_LOOKUP_FAILED`: Hostname tidak dapat ditemukan.
- `SSRF_BLOCKED`: Alamat IP teridentifikasi sebagai jaringan privat atau terlarang.
- `CONNECTION_REFUSED`: Server target menolak koneksi soket.

---

## 15. Logging Strategy

- **Format**: JSON Structured Logging (Level, Timestamp, Event, Context).
- **Log Levels**: `debug`, `info`, `warn`, `error`.
- **Sensitivitas Data (Data Redaction)**:
  - Header yang mengandung nama `authorization`, `cookie`, `api-key`, `x-api-key`, `token`, atau `secret` otomatis disamarkan (*redacted*) menjadi `[REDACTED]` sebelum log ditulis ke stdout.
  - Isi response body berukuran besar tidak dicatat ke log sistem.

Contoh log transaksi worker:
```json
{
  "timestamp": "2026-11-07T12:00:00.123Z",
  "level": "info",
  "event": "CHECK_COMPLETED",
  "monitorId": "c4b3f12a-3e21-4f22-9214-722a4d95b5c1",
  "checkId": "d8e20f11-9a73-45c1-8451-b021d743a1a9",
  "status": "SUCCESS",
  "httpStatus": 200,
  "responseTimeMs": 134
}
```

---

## 16. Testing Strategy

1. **Unit Testing (Vitest)**:
   - Pengujian fungsi murni validasi URL & SSRF blocker (`isPrivateIp`, `validateTargetUrl`).
   - Pengujian Assertion Engine (Header matching, JSON path parser, substring search).
   - Pengujian kalkulator domain (*Uptime percentage*, *Average latency*).
2. **Integration Testing**:
   - Pengujian Route Handlers (Auth session guard, Monitor CRUD, isolation antar pengguna).
   - Pengujian BullMQ Job flow menggunakan mock Redis dan test container PostgreSQL.
3. **End-to-End Testing (Playwright)**:
   - User flow: Register -> Login -> Buat Monitor -> Lihat status di Dashboard -> Konfigurasi Alert.

---

## 17. Deployment Architecture (Docker & VPS)

Topologi deployment dirancang untuk dijalankan di VPS tunggal (DigitalOcean, Hetzner, AWS EC2) menggunakan Docker Compose:

```mermaid
flowchart LR
    Internet((Public Internet)) -->|Port 80/443| Nginx["Nginx Reverse Proxy / Caddy (SSL Term)"]
    Nginx -->|Port 3000| WebContainer["Next.js Web Container (App & API)"]
    
    subgraph InternalNetwork ["Docker Bridge Network (Internal)"]
        WebContainer
        WorkerContainer["APIWatch Worker Container"]
        PostgresContainer[("PostgreSQL 16")]
        RedisContainer[("Redis 7 (Alpine)")]
    end

    WebContainer -->|TCP 5432| PostgresContainer
    WebContainer -->|TCP 6379| RedisContainer
    WorkerContainer -->|TCP 5432| PostgresContainer
    WorkerContainer -->|TCP 6379| RedisContainer
    WorkerContainer -->|Egress HTTP/S| Internet
```

---

## 18. Dependency List & Rationales

| Package | Tipe | Rationale / Kegunaan |
| :--- | :--- | :--- |
| **next** (16.4.x) | Production | Framework fullstack utama untuk UI (App Router) dan Route Handlers. |
| **react**, **react-dom** (19.x) | Production | Library UI fundamental. |
| **@prisma/client** | Production | Type-safe ORM untuk interaksi dengan PostgreSQL. |
| **prisma** | DevDependency | CLI untuk manajemen schema dan database migrations. |
| **better-auth** | Production | Solusi autentikasi session, password hashing, dan integrasi Next.js/Prisma. |
| **bullmq** | Production | Queue broker berbasis Redis untuk background processing yang tangguh. |
| **ioredis** | Production | Redis client berkinerja tinggi untuk BullMQ dan caching. |
| **zod** | Production | Schema validation untuk request API, form frontend, dan environment variables. |
| **zustand** | Production | State management ringan untuk shared client UI state selektif. |
| **lucide-react** | Production | Icon set standar untuk dashboard dan navigasi. |
| **recharts** | Production | Visualisasi metrik response time dan grafik uptime. |
| **undici** | Production | HTTP client tingkat rendah untuk worker dengan dukungan custom dispatcher dan DNS pinning. |
| **ipaddr.js** | Production | Parsing dan validasi range alamat IPv4 & IPv6 untuk perlindungan SSRF. |
| **nodemailer** | Production | Pengiriman email alert via SMTP. |
| **tsx** | DevDependency | TypeScript runtime executor untuk menjalankan worker tanpa build step saat development. |
| **prettier** | DevDependency | Code formatting konsisten. |
| **typescript**, **eslint** | DevDependency | Type safety strict mode dan static analysis. |

---

## 19. Environment Variables Specification

| Variable Name | Required | Default / Example | Deskripsi |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Ya | `development` / `production` | Mode runtime aplikasi. |
| `NEXT_PUBLIC_APP_URL` | Ya | `http://localhost:3000` | URL publik aplikasi web. |
| `DATABASE_URL` | Ya | `postgresql://user:pass@localhost:5432/apiwatch` | Connection string PostgreSQL. |
| `REDIS_URL` | Ya | `redis://localhost:6379` | Connection string Redis. |
| `BETTER_AUTH_SECRET` | Ya | `replace_with_secure_secret` | Secret key untuk signing session cookie Better Auth. |
| `BETTER_AUTH_URL` | Ya | `http://localhost:3000` | Root URL untuk auth callback. |
| `ENCRYPTION_KEY` | Ya | `64_hex_character_key` | Kunci 32-byte (256-bit) untuk enkripsi AES-256-GCM. |
| `SMTP_HOST` | Opsional | `smtp.resend.com` | Host server SMTP untuk email alert. |
| `SMTP_PORT` | Opsional | `587` | Port SMTP. |
| `SMTP_USER` | Opsional | `resend` | Username SMTP. |
| `SMTP_PASSWORD` | Opsional | `re_xxx` | Password / API token SMTP. |
| `SMTP_FROM` | Opsional | `alerts@apiwatch.dev` | Alamat pengirim email notifikasi. |
| `MONITOR_DEFAULT_TIMEOUT_MS` | Ya | `10000` | Timeout default HTTP check (10 detik). |
| `MONITOR_MAX_RESPONSE_BYTES` | Ya | `1048576` | Batas maksimum pembacaan response body (1 MB). |
| `MONITOR_DEFAULT_RETENTION_DAYS`| Ya | `30` | Masa simpan riwayat pemeriksaan (hari). |
| `WORKER_CONCURRENCY` | Ya | `10` | Jumlah job concurrent pada worker engine. |
| `SCHEDULER_POLL_INTERVAL_MS` | Ya | `5000` | Interval polling database scheduler (5 detik). |

---

## 20. Technical Risks & Mitigation

| Risiko Teknis | Dampak | Probabilitas | Rencana Mitigasi |
| :--- | :--- | :--- | :--- |
| **SSRF / Internal Network Access** | Kritis | Tinggi | Mengimplementasikan validasi DNS resolving dan DNS pinning pada level soket undici sebelum koneksi TCP dibuat; menolak seluruh rentang IP privat dan link-local. |
| **Worker Crash saat Eksekusi Job Berat** | Tinggi | Sedang | Membatasi pembacaan response body maksimal 1 MB per request; menerapkan timeout wajib (`AbortController`) pada setiap koneksi. |
| **Penjadwalan Ganda (*Race Condition*)** | Sedang | Sedang | Memanfaatkan transaksi database PostgreSQL dengan `FOR UPDATE SKIP LOCKED` dan menetapkan `jobId` BullMQ identik dengan ID check (idempotent). |
| **Alert Storming / Spam Notifikasi** | Sedang | Tinggi | Mengimplementasikan mekanisme deteksi transisi status (`UP -> DOWN` dan `DOWN -> UP`) sehingga notifikasi hanya dikirim sekali per kejadian perubahan status, bukan setiap interval pemeriksaan. |
| **Pertumbuhan Eksponensial Tabel `monitor_checks`**| Tinggi | Tinggi | Menerapkan composite index `(monitorId, checkedAt DESC)` dan menyiapkan routine cron database untuk membersihkan riwayat pemeriksaan yang lebih tua dari batas retensi (30 hari). |

---

*Dokumen ini merupakan spesifikasi teknis resmi untuk pengembangan APIWatch. Seluruh implementasi pada Phase 3 hingga Phase 10 wajib mengacu dan patuh terhadap pedoman arsitektur di atas.*
