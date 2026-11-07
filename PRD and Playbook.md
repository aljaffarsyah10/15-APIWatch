# APIWatch — Product Requirements Document & Sequential Development Playbook

Dokumen utama pengembangan · Version 1.0 · November 2026

MVP First

Web Application

10 Development Phases

Solo Developer

Nama file: `PROJECT_PRD_AND_PLAYBOOK.md`

Project: APIWatch – API Monitoring

Kategori: Developer Tools / Micro SaaS

Tingkat kompleksitas: Medium

Target pengguna: Publik, khususnya developer, software engineer, freelancer, startup, dan tim pengembang aplikasi.

Tujuan dokumen: Menjadi pedoman utama mulai dari project initialization, perencanaan arsitektur, implementasi frontend dan backend, integrasi, testing, hingga production deployment.

# PART A — PRODUCT REQUIREMENTS DOCUMENT (PRD)

# 1. Product Information

## 1.1 Product Identity

| Informasi            | Detail                                                   |
| -------------------- | -------------------------------------------------------- |
| Product Name         | APIWatch                                                 |
| Product Type         | API Monitoring SaaS                                      |
| Product Category     | Developer Tools                                          |
| Platform             | Web Application                                          |
| Target Market        | Publik / Global, dengan pendekatan awal Indonesia        |
| Development Model    | Solo Developer + AI Coding Assistant                     |
| Development Strategy | MVP First                                                |
| Complexity           | Medium                                                   |
| Business Model       | Freemium / Subscription                                  |
| Primary Language     | English untuk interface awal, dengan kesiapan lokalisasi |
| Initial Release      | MVP                                                      |

## 1.2 Product Description

APIWatch adalah platform API monitoring yang memungkinkan developer memantau ketersediaan, performa, dan validitas respons endpoint API secara otomatis.

Pengguna dapat mendaftarkan endpoint API, menentukan interval pemeriksaan, mengatur ekspektasi HTTP status, memvalidasi response header dan body, serta menerima notifikasi ketika endpoint mengalami masalah.

APIWatch menjalankan pemeriksaan secara berkala melalui background worker sehingga pengguna tidak perlu melakukan pengecekan endpoint secara manual.

## 1.3 Development Approach

Pengembangan menggunakan pendekatan:

- MVP First: implementasikan fitur paling penting terlebih dahulu.
- Modular Monolith: satu aplikasi utama dengan worker terpisah, bukan microservices.
- Clean Architecture Pragmatic: pemisahan tanggung jawab tanpa abstraksi berlebihan.
- Type Safety: TypeScript untuk frontend dan backend.
- Database-Driven: PostgreSQL sebagai sumber data utama.
- Asynchronous Processing: Redis dan BullMQ untuk pemrosesan background.
- Component Reusability: reusable UI dan business components.
- Incremental Development: implementasi melalui tepat 10 phase.

## 1.4 Technology Stack

Arsitektur teknologi yang direkomendasikan:

Frontend

Next.js App Router + TypeScript

Tailwind CSS · shadcn/ui · Zustand (selektif)

Application Backend

Next.js Route Handlers

Authentication · API · Validation · Business Logic

PostgreSQL

Persistent storage

Redis + BullMQ

Job processing

Dedicated Worker

Node.js + TypeScript

Scheduler · HTTP Check Engine · Validation · Alert Processing

External API Endpoints

Endpoint milik pengguna yang dipantau

| Layer             | Technology             | Alasan                                          |
| ----------------- | ---------------------- | ----------------------------------------------- |
| Frontend          | Next.js                | Fullstack React framework                       |
| Language          | TypeScript             | Type safety                                     |
| Styling           | Tailwind CSS           | Utility-first styling                           |
| UI Components     | shadcn/ui              | Reusable components                             |
| Client State      | Zustand                | Hanya untuk shared client state yang diperlukan |
| Backend API       | Next.js Route Handlers | CRUD dan application API                        |
| Background Worker | Node.js                | Proses monitoring berkelanjutan                 |
| Job Queue         | BullMQ                 | Scheduling dan background jobs                  |
| Queue Storage     | Redis                  | Job queue dan retry management                  |
| Database          | PostgreSQL             | Relational data dan monitoring history          |
| ORM               | Prisma                 | Database access dan migrations                  |
| Validation        | Zod                    | Validasi request dan configuration              |
| HTTP Client       | Native fetch / Undici  | Pemeriksaan endpoint                            |
| Authentication    | Better Auth            | User authentication                             |
| Charts            | Recharts               | Monitoring visualization                        |
| Icons             | Lucide React           | Interface icons                                 |
| Testing           | Vitest + Playwright    | Unit dan end-to-end testing                     |
| Deployment        | Docker + VPS           | Menjalankan web, worker, Redis, dan PostgreSQL  |

Keputusan penting: Next.js tidak digunakan sebagai mesin monitoring yang menjalankan pemeriksaan endpoint secara terus-menerus.

Next.js bertanggung jawab atas UI dan application API. Worker merupakan proses Node.js terpisah yang berjalan terus-menerus.

Alasannya adalah proses monitoring memerlukan scheduling, retry, concurrency control, dan eksekusi background yang tidak ideal jika bergantung pada lifecycle serverless function.

## 1.5 Project Constraints

1. Development dilakukan oleh satu developer dengan bantuan AI.
2. MVP harus dapat diselesaikan tanpa arsitektur microservices.
3. Worker harus dipisahkan dari Next.js runtime.
4. PostgreSQL menjadi sumber data utama.
5. Redis digunakan untuk job processing, bukan penyimpanan permanen hasil monitoring.
6. Semua endpoint monitoring harus melalui validasi keamanan SSRF.
7. Tidak menggunakan scraping browser atau browser automation untuk memeriksa API.
8. Tidak menggunakan dependency yang tidak memiliki manfaat jelas.
9. Tidak mengimplementasikan fitur enterprise pada MVP.
10. Seluruh fitur inti harus dapat dijalankan melalui deployment web application.

# 2. Product Overview

## 2.1 Problem Statement

Developer sering kali harus mengecek endpoint API secara manual ketika terjadi error atau menerima laporan bahwa aplikasi tidak dapat digunakan.

Masalah yang umum terjadi:

- API mengalami downtime tanpa diketahui.
- Endpoint memberikan HTTP status yang tidak sesuai ekspektasi.
- Response time meningkat secara signifikan.
- API mengembalikan response body yang tidak valid.
- Response header tidak sesuai spesifikasi.
- Developer terlambat mengetahui masalah API.
- Tidak tersedia riwayat pemeriksaan endpoint.
- Sulit mengetahui kapan masalah mulai terjadi dan kapan endpoint kembali normal.

Tool seperti Uptime Kuma telah menyediakan solusi monitoring. APIWatch mengambil inspirasi dari konsep tersebut, tetapi berfokus pada kebutuhan monitoring API yang lebih spesifik.

## 2.2 Proposed Solution

APIWatch menyediakan dashboard monitoring API dengan kemampuan:

1. Mendaftarkan endpoint.
2. Memeriksa endpoint secara otomatis.
3. Memvalidasi HTTP status.
4. Mengukur response time.
5. Memvalidasi response headers.
6. Memvalidasi response body.
7. Menampilkan monitoring history.
8. Mengirim alert ketika terjadi masalah.
9. Menampilkan ringkasan performa API.

## 2.3 How the Product Works

1. User registers an API endpoint

   Pengguna memasukkan nama monitor, URL, HTTP method, interval, dan expected response.

2. APIWatch saves monitor configuration

   Konfigurasi disimpan ke PostgreSQL.

3. Scheduler detects due monitors

   Worker mengambil monitor yang sudah waktunya diperiksa.

4. Monitoring job is executed

   Worker melakukan HTTP request ke endpoint pengguna.

5. Response is evaluated

   Sistem mengevaluasi HTTP status, response time, header, dan body.

6. Monitoring result is stored

   Hasil pemeriksaan disimpan ke PostgreSQL.

7. Alert is triggered when necessary

   Sistem mengirim notifikasi ketika status berubah menjadi DOWN dan ketika kembali UP.

8. Dashboard is updated

   Pengguna dapat melihat status, riwayat, dan performa endpoint.

## 2.4 Core Value Proposition

APIWatch membantu developer mengetahui masalah API lebih cepat melalui automated endpoint monitoring, response validation, dan alert notification dalam satu dashboard sederhana.

Diferensiasi produk:

- Fokus pada API monitoring, bukan sekadar website uptime.
- Response header validation.
- Response body validation.
- Dokumentasi konfigurasi endpoint.
- Riwayat pemeriksaan yang mudah dipahami.
- Laporan performa API sederhana.
- Pendekatan produk yang ramah developer Indonesia.

## 2.5 MVP Product Boundary

MVP hanya memantau endpoint HTTP/HTTPS secara berkala.

APIWatch bukan:

- API gateway.
- API management platform.
- API testing automation suite.
- Load testing platform.
- Distributed tracing platform.
- Full observability platform.
- Infrastructure monitoring platform.

# 3. Product Goals

## 3.1 Primary Goals

| ID    | Goal                                      | Measurement                         |
| ----- | ----------------------------------------- | ----------------------------------- |
| PG-01 | Pengguna dapat membuat monitor API        | Endpoint berhasil disimpan          |
| PG-02 | Pemeriksaan berjalan otomatis             | Worker menjalankan scheduled checks |
| PG-03 | Pengguna dapat mengetahui status endpoint | UP / DOWN / PAUSED                  |
| PG-04 | Response time dapat diukur                | Hasil pengukuran tersedia           |
| PG-05 | Response dapat divalidasi                 | Status, header, body                |
| PG-06 | Pengguna dapat menerima alert             | Notifikasi berhasil dikirim         |
| PG-07 | Monitoring history tersedia               | Data tersimpan dan dapat dilihat    |
| PG-08 | Aplikasi siap digunakan secara publik     | Production deployment berhasil      |

## 3.2 MVP Success Metrics

Target awal setelah MVP tersedia:

| Metric                            | Target                                   |
| --------------------------------- | ---------------------------------------- |
| Monitor creation success          | ≥ 99%                                    |
| Scheduled check execution success | ≥ 99% dalam kondisi infrastruktur normal |
| Dashboard initial load            | ≤ 3 detik                                |
| Monitoring result persistence     | ≥ 99%                                    |
| Alert processing success          | ≥ 95% untuk percobaan pengiriman pertama |
| Core API response                 | p95 ≤ 500 ms pada beban MVP              |
| Build success                     | 100%                                     |
| Critical security vulnerabilities | 0 known critical issues                  |

Catatan: target ini merupakan sasaran produk, bukan jaminan SLA. Pengukuran harus dilakukan berdasarkan observasi production.

## 3.3 Product Completion Goals

MVP dinyatakan berhasil apabila:

- Pengguna dapat membuat akun.
- Pengguna dapat login.
- Pengguna dapat menambahkan endpoint.
- Endpoint diperiksa secara otomatis.
- Hasil pemeriksaan dapat disimpan.
- Status endpoint dapat ditampilkan.
- History dapat ditampilkan.
- Header dan body validation berjalan.
- Alert dapat dikirim.
- Pengguna dapat mengelola monitor.
- Sistem dapat di-deploy pada production environment.

# 4. Target Users

## 4.1 Primary Users

### A. Backend Developer

Kebutuhan:

- Memastikan API selalu tersedia.
- Mengetahui HTTP status yang tidak sesuai.
- Mengetahui perubahan response time.
- Memastikan response body sesuai ekspektasi.
- Mendapatkan notifikasi saat API bermasalah.

### B. Fullstack Developer

Kebutuhan:

- Memantau API frontend dan backend.
- Mengelola beberapa endpoint.
- Melihat monitoring history.
- Mengetahui endpoint yang mengalami gangguan.

### C. Freelancer / Independent Developer

Kebutuhan:

- Memantau API dari proyek klien.
- Mengelola endpoint dari beberapa aplikasi.
- Memastikan aplikasi klien berjalan dengan baik.
- Mengetahui masalah sebelum klien melaporkannya.

### D. Startup / Small Development Team

Kebutuhan:

- Monitoring API tanpa infrastruktur observability kompleks.
- Dashboard sederhana.
- Alert ketika API bermasalah.
- Monitoring beberapa service.

## 4.2 User Personas

| Persona             | Karakteristik                  | Kebutuhan Utama                 |
| ------------------- | ------------------------------ | ------------------------------- |
| Backend Engineer    | Mengembangkan REST API         | HTTP status dan body validation |
| Fullstack Developer | Mengelola frontend dan backend | Endpoint overview               |
| Freelancer          | Mengelola proyek klien         | Multiple monitors               |
| Startup Developer   | Mengelola beberapa service     | Monitoring dan alerts           |

## 4.3 User Assumptions

Asumsi MVP:

- Pengguna memiliki pengetahuan dasar HTTP.
- Pengguna memiliki URL endpoint yang dapat diakses secara publik oleh worker.
- Pengguna memahami HTTP method dan status code.
- Pengguna menggunakan APIWatch melalui browser.
- Pengguna membutuhkan monitoring sederhana, bukan observability enterprise.

# 5. Scope & Feature Priorities

## 5.1 P0 — Core MVP

Wajib tersedia sebelum release

| ID    | Feature               | Deskripsi                                             |
| ----- | --------------------- | ----------------------------------------------------- |
| P0-01 | Authentication        | Register, login, logout                               |
| P0-02 | Dashboard             | Ringkasan seluruh monitor                             |
| P0-03 | Monitor CRUD          | Create, read, update, delete                          |
| P0-04 | HTTP Monitoring       | Pemeriksaan HTTP/HTTPS                                |
| P0-05 | Status Detection      | UP / DOWN / PAUSED                                    |
| P0-06 | Response Time         | Pengukuran latency                                    |
| P0-07 | Status Validation     | Expected HTTP status                                  |
| P0-08 | Header Validation     | Memvalidasi expected response headers                 |
| P0-09 | Body Validation       | Memvalidasi expected response body                    |
| P0-10 | Monitoring History    | Riwayat hasil pemeriksaan                             |
| P0-11 | Alert System          | Email notification dan webhook                        |
| P0-12 | Worker Scheduler      | Pemeriksaan berkala                                   |
| P0-13 | Monitor Configuration | Interval, method, timeout                             |
| P0-14 | Basic Reports         | Uptime dan average response time                      |
| P0-15 | Account Isolation     | Setiap pengguna hanya dapat mengakses datanya sendiri |

## 5.2 P1 — Supporting Features

| ID    | Feature                 | Deskripsi                     |
| ----- | ----------------------- | ----------------------------- |
| P1-01 | Advanced Dashboard      | Grafik response time          |
| P1-02 | Monitor Tags            | Pengelompokan monitor         |
| P1-03 | Manual Check            | Memicu pemeriksaan manual     |
| P1-04 | Maintenance Mode        | Menonaktifkan alert sementara |
| P1-05 | Public Status Page      | Halaman status publik         |
| P1-06 | CSV Export              | Export monitoring history     |
| P1-07 | Advanced Filters        | Filter status dan tanggal     |
| P1-08 | Telegram Alert          | Integrasi Telegram            |
| P1-09 | Localization            | Bahasa Indonesia dan Inggris  |
| P1-10 | Threshold Configuration | Threshold response time       |

P1 dikerjakan pada Phase 8 setelah semua fitur P0 berjalan end-to-end.

## 5.3 P2 — Future Development

| ID    | Feature                      | Deskripsi                          |
| ----- | ---------------------------- | ---------------------------------- |
| P2-01 | Multi-region Monitoring      | Pemeriksaan dari beberapa lokasi   |
| P2-02 | SSL Certificate Monitoring   | Monitoring masa berlaku SSL        |
| P2-03 | DNS Monitoring               | Monitoring DNS resolution          |
| P2-04 | Advanced JSONPath Validation | Validasi JSON menggunakan JSONPath |
| P2-05 | Team Collaboration           | Multi-user workspace               |
| P2-06 | Incident Management          | Incident lifecycle management      |
| P2-07 | Slack Integration            | Alert melalui Slack                |
| P2-08 | Discord Integration          | Alert melalui Discord              |
| P2-09 | API Monitoring Analytics     | Analisis performa lanjutan         |
| P2-10 | Public API                   | API untuk mengelola monitor        |
| P2-11 | AI Insights                  | Analisis anomali dan rekomendasi   |
| P2-12 | Custom Monitoring Regions    | Lokasi worker yang dapat dipilih   |

## 5.4 Out of Scope MVP

Tidak termasuk dalam MVP:

- Load testing.
- Stress testing.
- Browser-based monitoring.
- GraphQL schema testing.
- WebSocket monitoring.
- TCP/UDP monitoring.
- Distributed tracing.
- Log aggregation.
- Advanced alert escalation.
- Multi-region monitoring.
- Team collaboration.
- Native mobile application.
- Custom monitoring agent.
- AI-based anomaly detection.

Scope control: Jika suatu fitur tidak termasuk P0, jangan implementasikan sebelum seluruh fitur P0 memenuhi acceptance criteria.

# 6. Functional Requirements

Setiap requirement berikut menjadi dasar implementasi dan pengujian.

## 6.1 Authentication

### FR-01 — User Registration

Deskripsi:

Pengguna dapat membuat akun APIWatch.

Perilaku sistem:

- Menerima nama, email, dan password.
- Memvalidasi email.
- Memvalidasi password.
- Menolak email yang sudah terdaftar.
- Menyimpan password menggunakan secure password hashing melalui authentication provider.
- Membuat user account.

Acceptance Criteria:

- User dapat mendaftar dengan data valid.
- Email duplikat ditolak.
- Password tidak disimpan dalam plaintext.
- User dapat diarahkan ke dashboard setelah proses autentikasi berhasil.

### FR-02 — User Login

Deskripsi:

Pengguna dapat login menggunakan email dan password.

Acceptance Criteria:

- Kredensial valid menghasilkan session.
- Kredensial salah ditolak.
- Session tersimpan secara aman.
- User dapat logout.

### FR-03 — User Data Isolation

Deskripsi:

Setiap pengguna hanya dapat mengakses data monitor miliknya.

Acceptance Criteria:

- User A tidak dapat melihat monitor User B.
- User A tidak dapat mengubah monitor User B.
- User A tidak dapat menghapus monitor User B.
- Authorization diperiksa di backend, bukan hanya frontend.

## 6.2 Monitor Management

### FR-04 — Create Monitor

Deskripsi:

Pengguna dapat membuat monitoring configuration.

Field:

| Field            | Type           | Required |
| ---------------- | -------------- | -------- |
| Name             | String         | Yes      |
| URL              | URL            | Yes      |
| HTTP Method      | Enum           | Yes      |
| Interval         | Integer        | Yes      |
| Timeout          | Integer        | Yes      |
| Expected Status  | Integer / list | Yes      |
| Custom Headers   | JSON           | No       |
| Request Body     | String         | No       |
| Expected Headers | JSON           | No       |
| Expected Body    | String         | No       |
| Body Match Type  | Enum           | No       |

Acceptance Criteria:

- Data valid berhasil disimpan.
- URL harus valid.
- Interval harus sesuai plan.
- Timeout memiliki batas minimum dan maksimum.
- Monitor menjadi eligible untuk dijalankan scheduler.

### FR-05 — View Monitor

Deskripsi:

Pengguna dapat melihat daftar endpoint.

Acceptance Criteria:

- Monitor ditampilkan berdasarkan kepemilikan user.
- Status terakhir ditampilkan.
- Response time terakhir ditampilkan.
- Monitor yang belum diperiksa memiliki status UNKNOWN.
- Data dapat di-pagination.

### FR-06 — Update Monitor

Deskripsi:

Pengguna dapat mengubah konfigurasi endpoint.

Acceptance Criteria:

- Perubahan konfigurasi tersimpan.
- Scheduler menggunakan konfigurasi terbaru.
- Perubahan tidak mengubah riwayat pemeriksaan lama.
- Hanya pemilik monitor yang dapat mengubahnya.

### FR-07 — Delete Monitor

Deskripsi:

Pengguna dapat menghapus monitor.

Acceptance Criteria:

- Sistem meminta konfirmasi.
- Monitor tidak dijalankan kembali setelah dihapus.
- Job yang belum dieksekusi dibatalkan atau diabaikan dengan aman.
- Monitoring history mengikuti kebijakan penghapusan data yang ditetapkan.

### FR-08 — Pause / Resume Monitor

Deskripsi:

Pengguna dapat menghentikan sementara pemeriksaan endpoint.

Acceptance Criteria:

- Monitor berstatus PAUSED.
- Scheduler tidak membuat check baru untuk monitor yang paused.
- User dapat mengaktifkan kembali monitor.
- Pemeriksaan kembali berjalan setelah resume.

## 6.3 Monitoring Engine

### FR-09 — Scheduled HTTP Check

Deskripsi:

Worker memeriksa endpoint berdasarkan interval yang ditentukan.

Acceptance Criteria:

- Pemeriksaan berjalan otomatis.
- Interval mengikuti konfigurasi monitor.
- Tidak terjadi penjadwalan ganda yang tidak terkendali.
- Worker dapat melanjutkan proses setelah restart.
- Pemeriksaan tidak berjalan untuk monitor yang sudah dihapus atau paused.

### FR-10 — HTTP Status Validation

Deskripsi:

Sistem membandingkan HTTP status aktual dengan expected status.

Acceptance Criteria:

- Expected status terpenuhi menghasilkan successful status validation.
- Status yang tidak sesuai menghasilkan failed validation.
- Hasil validasi disimpan.

### FR-11 — Response Time Measurement

Deskripsi:

Sistem mengukur durasi HTTP request.

Metodologi:

- Menggunakan monotonic clock seperti `performance.now()`.
- Dimulai ketika request akan dikirim.
- Berakhir ketika response headers dan body yang dibatasi sudah dibaca.
- Timeout menghasilkan failed check.
- Nilai dicatat dalam milidetik.

Acceptance Criteria:

- Response time dicatat dalam millisecond.
- Timeout menghasilkan hasil yang jelas.
- Hasil tidak mencampur nilai timeout dengan response time sukses.
- Pengukuran memiliki definisi konsisten.

Catatan: MVP mengukur end-to-end HTTP check duration, termasuk membaca response body yang dibatasi, bukan hanya server time-to-first-byte.

### FR-12 — Header Validation

Deskripsi:

Sistem memvalidasi response headers berdasarkan konfigurasi pengguna.

Contoh:

```
{
  "content-type": "application/json",
  "cache-control": "no-cache"
}
```

Acceptance Criteria:

- Header yang diharapkan ditemukan.
- Perbandingan nama header bersifat case-insensitive.
- Nilai header divalidasi sesuai aturan yang ditetapkan.
- Header yang tidak sesuai menyebabkan validation failure.
- Hasil validasi disimpan.

### FR-13 — Body Validation

Deskripsi:

Sistem memeriksa response body berdasarkan ekspektasi pengguna.

MVP mendukung:

- Contains.
- Exact text match.
- JSON field equality untuk path sederhana.

Contoh:

```
{
  "path": "data.status",
  "operator": "equals",
  "value": "success"
}
```

Acceptance Criteria:

- Response body dibaca dengan batas ukuran.
- Contains validation berfungsi.
- Exact match berfungsi.
- JSON path sederhana dapat dievaluasi.
- Invalid JSON menghasilkan validation error.
- Body yang melebihi batas tidak menyebabkan penggunaan memori berlebihan.

### FR-14 — Check Timeout

Deskripsi:

Setiap monitoring request memiliki batas waktu.

Acceptance Criteria:

- Request dibatalkan ketika melewati timeout.
- Timeout disimpan sebagai failure reason.
- Worker tetap dapat memproses job lainnya.

### FR-15 — Failure Classification

Deskripsi:

Sistem mengklasifikasikan hasil pemeriksaan.

Status:

- SUCCESS.
- FAILURE.
- TIMEOUT.
- NETWORK_ERROR.
- VALIDATION_ERROR.

Acceptance Criteria:

- Setiap check memiliki status yang jelas.
- Failure reason tersimpan.
- Hasil dapat ditampilkan di dashboard.

## 6.4 Monitoring History & Reports

### FR-16 — Monitoring History

Deskripsi:

Pengguna dapat melihat riwayat pemeriksaan endpoint.

Acceptance Criteria:

- History menampilkan waktu pemeriksaan.
- History menampilkan status.
- History menampilkan HTTP status.
- History menampilkan response time.
- History menampilkan failure reason.
- History tidak dapat diakses user lain.

### FR-17 — Uptime Calculation

Deskripsi:

Sistem menghitung uptime percentage.

Formula:

\\[ Uptime = \frac{Successful\ Checks}{Eligible\ Checks} \times 100\\% \\]

Pemeriksaan yang belum dieksekusi atau dibatalkan tidak dihitung sebagai successful maupun failed check.

Acceptance Criteria:

- Uptime dihitung dari periode yang dipilih.
- Pemeriksaan yang eligible menjadi denominator.
- Tidak ada pembagian dengan nol.
- Hasil ditampilkan sebagai persentase.

### FR-18 — Response Time Summary

Deskripsi:

Sistem menampilkan rata-rata response time.

Formula:

\\[ Average = \frac{\sum ResponseTime}{Successful\ Checks} \\]

Acceptance Criteria:

- Perhitungan hanya menggunakan successful checks yang memiliki response time.
- Hasil ditampilkan dalam millisecond.
- Periode laporan dapat ditentukan.

## 6.5 Alerts

### FR-19 — Email Alert

Deskripsi:

Sistem dapat mengirimkan email ketika monitor mengalami gangguan.

Acceptance Criteria:

- Email dikirim melalui configured email provider.
- Alert dikirim ketika status berubah UP menjadi DOWN.
- Email berisi nama monitor, URL, waktu, dan failure reason.
- Pengiriman email tidak memblokir monitoring worker.

### FR-20 — Webhook Alert

Deskripsi:

Pengguna dapat menambahkan webhook destination.

Acceptance Criteria:

- Webhook URL divalidasi.
- Webhook dikirim melalui background job.
- HTTP delivery status dicatat.
- Retry dilakukan secara terbatas.
- Secret webhook disimpan dengan aman.

### FR-21 — Recovery Alert

Deskripsi:

Sistem mengirimkan pemberitahuan ketika endpoint kembali normal.

Acceptance Criteria:

- Recovery alert dikirim ketika status berubah DOWN menjadi UP.
- Tidak mengirim recovery alert berulang ketika endpoint tetap UP.

### FR-22 — Alert Deduplication

Deskripsi:

Sistem mencegah alert duplikat untuk setiap status yang sama.

Acceptance Criteria:

- Tidak mengirim alert DOWN setiap interval ketika endpoint terus DOWN.
- Alert recovery hanya dikirim sekali per recovery transition.
- Kegagalan pengiriman alert tidak mengubah hasil monitoring.

## 6.6 Dashboard

### FR-23 — Dashboard Summary

Deskripsi:

Dashboard menampilkan ringkasan kondisi API.

Informasi:

- Total monitors.
- Active monitors.
- UP monitors.
- DOWN monitors.
- Paused monitors.
- Average response time.
- Recent incidents.

Acceptance Criteria:

- Data berasal dari backend.
- Dashboard dapat diperbarui tanpa reload penuh.
- Empty state tersedia ketika belum ada monitor.

### FR-24 — Monitor Detail

Deskripsi:

Pengguna dapat melihat informasi lengkap suatu endpoint.

Acceptance Criteria:

- Configuration ditampilkan.
- Current status ditampilkan.
- Monitoring history ditampilkan.
- Uptime summary ditampilkan.
- Response time summary ditampilkan.

### FR-25 — Manual Check

Deskripsi:

Pengguna dapat meminta pemeriksaan endpoint secara manual.

Prioritas: P1.

Acceptance Criteria:

- Manual check dibuat sebagai background job.
- Pengguna menerima feedback bahwa pemeriksaan sedang diproses.
- Request dibatasi agar tidak menjadi sarana abuse.

# 7. Non-Functional Requirements

## 7.1 Performance

| Requirement           | Target                           |
| --------------------- | -------------------------------- |
| Dashboard loading     | ≤ 3 seconds pada kondisi MVP     |
| API CRUD response     | p95 ≤ 500 ms                     |
| Monitor history query | Pagination wajib                 |
| Worker concurrency    | Configurable                     |
| HTTP timeout          | Configurable, default 10 seconds |
| Response body limit   | Default 1 MB                     |
| Queue processing      | Asynchronous                     |

## 7.2 Security

- Authentication menggunakan secure session.
- Authorization dilakukan pada backend.
- Input divalidasi menggunakan Zod.
- Monitoring engine harus terlindungi dari SSRF.
- Secret tidak boleh disimpan dalam plaintext.
- Password tidak boleh disimpan sendiri tanpa password hashing yang sesuai.
- API memiliki rate limiting.
- Request timeout diterapkan.
- Redirect harus divalidasi sebelum diikuti.
- Private network dan cloud metadata endpoints diblokir.
- User input tidak boleh langsung dieksekusi sebagai shell command atau SQL.

## 7.3 Reliability

- Worker harus dapat restart tanpa kehilangan jadwal monitoring.
- Queue mendukung retry.
- Job gagal tidak menghentikan worker.
- Database menjadi sumber kebenaran status monitor dan riwayat.
- Scheduler dapat merekonsiliasi pekerjaan yang tertinggal.
- Alert processing tidak boleh mengganggu monitoring.

## 7.4 Scalability

MVP menggunakan satu worker instance terlebih dahulu.

Arsitektur harus memungkinkan:

- Menambah worker instances.
- Meningkatkan concurrency.
- Memisahkan alert processing.
- Menambahkan monitoring regions.
- Melakukan data retention.

Tidak perlu menerapkan Kubernetes atau microservices pada MVP.

## 7.5 Maintainability

- TypeScript strict mode.
- Modul dipisahkan berdasarkan domain.
- Tidak membuat service abstraction tanpa kebutuhan.
- Business logic tidak ditempatkan di React components.
- Database query tidak tersebar di seluruh UI.
- Shared validation schemas digunakan bila relevan.

## 7.6 Accessibility

- Semantic HTML.
- Keyboard navigation.
- Form labels.
- Accessible dialogs.
- Color contrast.
- Status tidak hanya dibedakan menggunakan warna.

## 7.7 Compatibility

Target:

- Chrome.
- Edge.
- Firefox.
- Safari.

Responsive:

- Desktop.
- Tablet.
- Mobile.

## 7.8 Privacy

- Data monitor bersifat private secara default.
- Credential endpoint tidak boleh ditampilkan kembali secara terbuka.
- Monitoring history memiliki retention policy.
- Pengguna dapat menghapus monitor.
- Alert destination bersifat private.

# 8. Application Structure & Navigation

## 8.1 Public Routes

| Route       | Page         | Description                |
| ----------- | ------------ | -------------------------- |
| `/`         | Landing Page | Product introduction       |
| `/pricing`  | Pricing      | Paket dan batas penggunaan |
| `/login`    | Login        | User authentication        |
| `/register` | Register     | Create account             |

## 8.2 Protected Routes

| Route                 | Page           | Description         |
| --------------------- | -------------- | ------------------- |
| `/dashboard`          | Dashboard      | Monitoring overview |
| `/monitors`           | Monitor List   | Daftar endpoint     |
| `/monitors/new`       | Create Monitor | Tambah endpoint     |
| `/monitors/[id]`      | Monitor Detail | Detail monitoring   |
| `/monitors/[id]/edit` | Edit Monitor   | Edit konfigurasi    |
| `/settings`           | Settings       | Account settings    |
| `/settings/alerts`    | Alert Settings | Alert configuration |

## 8.3 Navigation Structure

APIWatch

&#x20;Dashboard

&#x20;Monitors

&#x20;Add Monitor

&#x20;Settings

&#x20;Alert Settings

&#x20;Account

## 8.4 Application Layout

Public layout:

- Public navbar.
- Main content.
- Footer.
- Authentication CTA.

Dashboard layout:

- Sidebar.
- Top navigation.
- User menu.
- Main content.
- Responsive sidebar drawer.

## 8.5 Reusable Components

| Component            | Purpose                         |
| -------------------- | ------------------------------- |
| AppSidebar           | Dashboard navigation            |
| AppHeader            | Header dan user menu            |
| MonitorCard          | Monitor summary                 |
| MonitorStatusBadge   | Status indicator                |
| ResponseTimeBadge    | Response time display           |
| UptimeCard           | Uptime summary                  |
| MonitorForm          | Monitor configuration           |
| HeaderValidationForm | Header validation configuration |
| BodyValidationForm   | Body validation configuration   |
| HistoryTable         | Monitoring history              |
| ResponseTimeChart    | Response time visualization     |
| EmptyState           | Empty data display              |
| ErrorState           | Error display                   |
| ConfirmDialog        | Destructive action confirmation |
| LoadingSkeleton      | Loading state                   |
| AlertChannelForm     | Alert configuration             |

# 9. User Flow

## 9.1 Registration Flow

\#chatgpt-mermaid-\_r_bmc\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_bmc\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bmc\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bmc\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_bmc\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmc\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_bmc\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_bmc\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_bmc\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_bmc\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_bmc\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_bmc\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmc\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmc\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_bmc\_ p{margin:0;}#chatgpt-mermaid-\_r_bmc\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmc\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmc\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmc\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_bmc\_ .label text,#chatgpt-mermaid-\_r_bmc\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmc\_ .node rect,#chatgpt-mermaid-\_r_bmc\_ .node circle,#chatgpt-mermaid-\_r_bmc\_ .node ellipse,#chatgpt-mermaid-\_r_bmc\_ .node polygon,#chatgpt-mermaid-\_r_bmc\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_bmc\_ .rough-node .label text,#chatgpt-mermaid-\_r_bmc\_ .node .label text,#chatgpt-mermaid-\_r_bmc\_ .image-shape .label,#chatgpt-mermaid-\_r_bmc\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_bmc\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_bmc\_ .rough-node .label,#chatgpt-mermaid-\_r_bmc\_ .node .label,#chatgpt-mermaid-\_r_bmc\_ .image-shape .label,#chatgpt-mermaid-\_r_bmc\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_bmc\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_bmc\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmc\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmc\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_bmc\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_bmc\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_bmc\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bmc\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bmc\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_bmc\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_bmc\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmc\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmc\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_bmc\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmc\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_bmc\_ .icon-shape,#chatgpt-mermaid-\_r_bmc\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_bmc\_ .icon-shape p,#chatgpt-mermaid-\_r_bmc\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_bmc\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_bmc\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bmc\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_bmc\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_bmc\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_bmc\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_bmc\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_bmc\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_bmc\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmc\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_bmc\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_bmc\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_bmc\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmc\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_bmc\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_bmc\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmc\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_bmc\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_bmc\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmc\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_bmc\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmc\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_bmc\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_bmc\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_bmc\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_bmc\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_bmc\_ .node rect,#chatgpt-mermaid-\_r_bmc\_ .node circle,#chatgpt-mermaid-\_r_bmc\_ .node ellipse,#chatgpt-mermaid-\_r_bmc\_ .node polygon,#chatgpt-mermaid-\_r_bmc\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_bmc\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_bmc\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_bmc\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_bmc\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmc\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}Open APIWatchLanding PageRegisterFill Registration FormValid Data?Show Validation ErrorCreate AccountCreate SessionDashboardNoYes

## 9.2 Main Monitoring Flow

\#chatgpt-mermaid-\_r_bmj\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_bmj\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bmj\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bmj\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_bmj\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmj\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_bmj\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_bmj\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_bmj\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_bmj\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_bmj\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_bmj\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmj\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmj\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_bmj\_ p{margin:0;}#chatgpt-mermaid-\_r_bmj\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmj\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmj\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmj\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_bmj\_ .label text,#chatgpt-mermaid-\_r_bmj\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmj\_ .node rect,#chatgpt-mermaid-\_r_bmj\_ .node circle,#chatgpt-mermaid-\_r_bmj\_ .node ellipse,#chatgpt-mermaid-\_r_bmj\_ .node polygon,#chatgpt-mermaid-\_r_bmj\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_bmj\_ .rough-node .label text,#chatgpt-mermaid-\_r_bmj\_ .node .label text,#chatgpt-mermaid-\_r_bmj\_ .image-shape .label,#chatgpt-mermaid-\_r_bmj\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_bmj\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_bmj\_ .rough-node .label,#chatgpt-mermaid-\_r_bmj\_ .node .label,#chatgpt-mermaid-\_r_bmj\_ .image-shape .label,#chatgpt-mermaid-\_r_bmj\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_bmj\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_bmj\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmj\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmj\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_bmj\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_bmj\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_bmj\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bmj\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bmj\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_bmj\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_bmj\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmj\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmj\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_bmj\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmj\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_bmj\_ .icon-shape,#chatgpt-mermaid-\_r_bmj\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_bmj\_ .icon-shape p,#chatgpt-mermaid-\_r_bmj\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_bmj\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_bmj\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bmj\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_bmj\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_bmj\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_bmj\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_bmj\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_bmj\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_bmj\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmj\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_bmj\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_bmj\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_bmj\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmj\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_bmj\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_bmj\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmj\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_bmj\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_bmj\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmj\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_bmj\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmj\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_bmj\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_bmj\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_bmj\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_bmj\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_bmj\_ .node rect,#chatgpt-mermaid-\_r_bmj\_ .node circle,#chatgpt-mermaid-\_r_bmj\_ .node ellipse,#chatgpt-mermaid-\_r_bmj\_ .node polygon,#chatgpt-mermaid-\_r_bmj\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_bmj\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_bmj\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_bmj\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_bmj\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmj\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}DashboardAdd MonitorFill Monitor ConfigurationValidate InputValid?Show ErrorSave MonitorSchedulerCreate Monitoring JobWorker Executes HTTP RequestValidate ResponseSave ResultUpdate Monitor StatusStatus Changed?Send AlertDashboard UpdateNoYesYesNo

## 9.3 Failure and Recovery Flow

\#chatgpt-mermaid-\_r_bmq\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_bmq\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bmq\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bmq\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_bmq\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmq\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_bmq\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_bmq\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_bmq\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_bmq\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_bmq\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_bmq\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmq\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmq\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_bmq\_ p{margin:0;}#chatgpt-mermaid-\_r_bmq\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmq\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmq\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmq\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_bmq\_ .label text,#chatgpt-mermaid-\_r_bmq\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmq\_ .node rect,#chatgpt-mermaid-\_r_bmq\_ .node circle,#chatgpt-mermaid-\_r_bmq\_ .node ellipse,#chatgpt-mermaid-\_r_bmq\_ .node polygon,#chatgpt-mermaid-\_r_bmq\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_bmq\_ .rough-node .label text,#chatgpt-mermaid-\_r_bmq\_ .node .label text,#chatgpt-mermaid-\_r_bmq\_ .image-shape .label,#chatgpt-mermaid-\_r_bmq\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_bmq\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_bmq\_ .rough-node .label,#chatgpt-mermaid-\_r_bmq\_ .node .label,#chatgpt-mermaid-\_r_bmq\_ .image-shape .label,#chatgpt-mermaid-\_r_bmq\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_bmq\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_bmq\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmq\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmq\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_bmq\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_bmq\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_bmq\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bmq\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bmq\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_bmq\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_bmq\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmq\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmq\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_bmq\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bmq\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_bmq\_ .icon-shape,#chatgpt-mermaid-\_r_bmq\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_bmq\_ .icon-shape p,#chatgpt-mermaid-\_r_bmq\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_bmq\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_bmq\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bmq\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_bmq\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_bmq\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_bmq\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_bmq\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_bmq\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_bmq\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmq\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_bmq\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_bmq\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_bmq\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmq\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_bmq\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_bmq\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmq\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_bmq\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_bmq\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmq\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_bmq\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bmq\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_bmq\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_bmq\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_bmq\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_bmq\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_bmq\_ .node rect,#chatgpt-mermaid-\_r_bmq\_ .node circle,#chatgpt-mermaid-\_r_bmq\_ .node ellipse,#chatgpt-mermaid-\_r_bmq\_ .node polygon,#chatgpt-mermaid-\_r_bmq\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_bmq\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_bmq\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_bmq\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_bmq\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bmq\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}Monitoring CheckResponse Valid?Status UPStatus DOWNPrevious Status DOWN?Send Recovery AlertSave ResultPrevious Status UP?Send Down AlertNo Duplicate AlertYesNoYesNoYesNo

## 9.4 Monitor Management Flow

1. Pengguna membuka halaman Monitors.
2. Sistem menampilkan semua monitor milik pengguna.
3. Pengguna memilih salah satu monitor.
4. Sistem membuka halaman detail.
5. Pengguna dapat mengedit, pause, resume, atau delete.
6. Perubahan disimpan melalui backend.
7. Scheduler menyesuaikan jadwal berdasarkan konfigurasi terbaru.

# 10. UI/UX Requirements

## 10.1 Design Direction

APIWatch menggunakan visual design yang terinspirasi oleh modern developer dashboard.

Karakteristik:

- Clean.
- Minimalist.
- Professional.
- Technical.
- Data-oriented.
- Tidak terlalu banyak dekorasi.

Referensi arah visual:

[Website monitoring SaaS and API monitoring for DevOps | Status Inspector](https://images.openai.com/static-rsc-4/z5xKvlMftlEQaRSkg6oi0m2-ve83OmLK9Vq1cJyVhgZvF4Knb6gF-0xMNg4Ed2lMrdwx-kgOg1_8XB8gANjd2JXCoiscFZVsePTAFM_C8APvb_hNztLTqNizL9Rz0Ee1ZoKZjzoQkIaVT1FRfJ17LaWHslnXxS2bDuKu-vnYyMk?purpose=inline)

Dashboard layout

[MonoPi — Complete API Monitoring & Management Platform by Nurul Amin for Zendeeps on Dribbble](https://images.openai.com/static-rsc-4/B2L6h2QzmDcR-RG_nrjxgKVD-RFP21WbvqShhezOdY2fd5VXdV8_n6Gmyb4iyuyqPDO2XcqVPPLanXu5M4ZwiDqRZzg58C6049aZmukZb-3WS7u5dNOnEkUTD1-fR5dpve-pAkgs4a6-kJpIQFKcxDoTXzak5wPg0VDTIW9n620?purpose=inline)

Monitoring analytics

## 10.2 Color Direction

| Element    | Color                |
| ---------- | -------------------- |
| Primary    | Blue / Indigo        |
| Success    | Green                |
| Warning    | Amber                |
| Danger     | Red                  |
| Background | Neutral              |
| Surface    | White / Dark neutral |
| Text       | Slate / Neutral      |

Status colors:

- UP: Green.
- DOWN: Red.
- PAUSED: Gray.
- UNKNOWN: Neutral.

## 10.3 Typography

Gunakan:

- Inter atau Geist Sans.
- Monospace untuk URL, HTTP method, response status, dan technical metadata.

## 10.4 Layout

Dashboard:

- Sidebar kiri.
- Header atas.
- Content area.
- Grid summary cards.
- Monitor table.
- Recent incidents.

## 10.5 Component Requirements

Gunakan shadcn/ui untuk:

- Button.
- Input.
- Select.
- Dropdown.
- Dialog.
- Alert Dialog.
- Card.
- Table.
- Tabs.
- Tooltip.
- Badge.
- Form.
- Skeleton.
- Toast / Sonner.

## 10.6 Responsive Behavior

| Device       | Behavior            |
| ------------ | ------------------- |
| Desktop      | Full sidebar        |
| Tablet       | Collapsible sidebar |
| Mobile       | Drawer navigation   |
| Small Mobile | Single-column cards |

## 10.7 UI States

Setiap halaman data harus memiliki:

Loading State

- Skeleton cards.
- Table skeleton.
- Loading indicator.

Empty State

Contoh:

> No monitors yet. Add your first API endpoint to start monitoring.

Error State

- Error message yang mudah dipahami.
- Retry action jika memungkinkan.

Success State

- Toast confirmation.
- Updated data.

Destructive State

\- Confirmation dialog untuk delete.

## 10.8 Monitor Status Display

UP

Endpoint merespons dan memenuhi seluruh validasi.

DOWN

Endpoint gagal atau tidak memenuhi ekspektasi.

PAUSED

Pemeriksaan sementara dihentikan.

UNKNOWN

Belum memiliki hasil pemeriksaan.

# 11. Error Handling

| Error Condition      | Cause                   | System Response                          |
| -------------------- | ----------------------- | ---------------------------------------- |
| Invalid URL          | URL tidak valid         | Validation error                         |
| Unsupported protocol | Bukan HTTP/HTTPS        | Reject request                           |
| DNS failure          | Host tidak ditemukan    | NETWORK_ERROR                            |
| Connection refused   | Server menolak koneksi  | NETWORK_ERROR                            |
| Timeout              | Endpoint terlalu lambat | TIMEOUT                                  |
| HTTP 500             | Server error            | FAILURE                                  |
| Unexpected status    | Status tidak sesuai     | VALIDATION_ERROR                         |
| Header mismatch      | Header berbeda          | VALIDATION_ERROR                         |
| Body mismatch        | Body berbeda            | VALIDATION_ERROR                         |
| Invalid JSON         | JSON parsing gagal      | VALIDATION_ERROR                         |
| Response too large   | Body melewati limit     | FAILURE                                  |
| SSRF attempt         | Target private/internal | Reject request                           |
| Database failure     | PostgreSQL unavailable  | Log dan retry sesuai operasi             |
| Redis failure        | Redis unavailable       | Scheduler mempertahankan job di database |
| Alert failure        | Provider unavailable    | Retry alert secara terpisah              |
| Unauthorized         | Session tidak valid     | HTTP 401                                 |
| Forbidden            | Bukan pemilik resource  | HTTP 404 atau 403 sesuai kebijakan       |
| Rate limit exceeded  | Request berlebihan      | HTTP 429                                 |

## 11.1 Error Response Format

Gunakan format konsisten:

```
{
  "success": false,
  "error": {
    "code": "MONITOR_NOT_FOUND",
    "message": "Monitor not found"
  }
}
```

Untuk successful response:

```
{
  "success": true,
  "data": {
    "id": "monitor-id",
    "name": "Production API"
  }
}
```

Jangan mengirim stack trace atau internal infrastructure details ke frontend.

# 12. Technical Architecture

Core architectural decision

## 12.1 Architecture Overview

APIWatch menggunakan arsitektur Modular Monolith + Dedicated Background Worker.

Terdapat dua runtime utama:

1. Next.js Application.
2. Node.js Monitoring Worker.

Keduanya menggunakan PostgreSQL dan Redis.

## 12.2 High-Level Architecture

\#chatgpt-mermaid-\_r_bnn\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_bnn\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bnn\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bnn\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_bnn\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bnn\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_bnn\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_bnn\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_bnn\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_bnn\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_bnn\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_bnn\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bnn\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bnn\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_bnn\_ p{margin:0;}#chatgpt-mermaid-\_r_bnn\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bnn\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bnn\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bnn\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_bnn\_ .label text,#chatgpt-mermaid-\_r_bnn\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bnn\_ .node rect,#chatgpt-mermaid-\_r_bnn\_ .node circle,#chatgpt-mermaid-\_r_bnn\_ .node ellipse,#chatgpt-mermaid-\_r_bnn\_ .node polygon,#chatgpt-mermaid-\_r_bnn\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_bnn\_ .rough-node .label text,#chatgpt-mermaid-\_r_bnn\_ .node .label text,#chatgpt-mermaid-\_r_bnn\_ .image-shape .label,#chatgpt-mermaid-\_r_bnn\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_bnn\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_bnn\_ .rough-node .label,#chatgpt-mermaid-\_r_bnn\_ .node .label,#chatgpt-mermaid-\_r_bnn\_ .image-shape .label,#chatgpt-mermaid-\_r_bnn\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_bnn\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_bnn\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bnn\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bnn\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_bnn\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_bnn\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_bnn\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bnn\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bnn\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_bnn\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_bnn\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bnn\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bnn\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_bnn\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bnn\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_bnn\_ .icon-shape,#chatgpt-mermaid-\_r_bnn\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_bnn\_ .icon-shape p,#chatgpt-mermaid-\_r_bnn\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_bnn\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_bnn\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bnn\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_bnn\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_bnn\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_bnn\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_bnn\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_bnn\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_bnn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bnn\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_bnn\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_bnn\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_bnn\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bnn\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_bnn\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_bnn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bnn\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_bnn\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_bnn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bnn\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_bnn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bnn\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_bnn\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_bnn\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_bnn\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_bnn\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_bnn\_ .node rect,#chatgpt-mermaid-\_r_bnn\_ .node circle,#chatgpt-mermaid-\_r_bnn\_ .node ellipse,#chatgpt-mermaid-\_r_bnn\_ .node polygon,#chatgpt-mermaid-\_r_bnn\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_bnn\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_bnn\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_bnn\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_bnn\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bnn\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}Dedicated Node.js WorkerInfrastructureNext.js ApplicationMonitor SchedulerBullMQHTTP Check EngineResponse ValidatorAlert ProcessorPostgreSQLRedisApp Router / React UIRoute HandlersAuthenticationApplication ServicesUser BrowserExternal API EndpointsEmail ProviderWebhook Destinations

## 12.3 Presentation Layer

Tanggung jawab:

- Render halaman.
- Menampilkan data.
- Menangani interaksi.
- Form submission.
- Navigation.
- UI state.

Implementasi:

- Next.js App Router.
- React Server Components untuk data awal jika sesuai.
- Client Components hanya untuk interaksi.
- shadcn/ui.
- Tailwind CSS.

Tidak boleh:

- Menjalankan HTTP monitoring secara langsung dari browser.
- Menyimpan database credentials di client.
- Menempatkan business logic kompleks di React components.

## 12.4 Application Layer

Tanggung jawab:

- Mengelola application use cases.
- Authentication.
- Authorization.
- Request orchestration.
- Input validation.
- Memanggil domain services.
- Mengembalikan API response.

Contoh use cases:

```
CreateMonitor
GetMonitor
ListMonitors
UpdateMonitor
DeleteMonitor
PauseMonitor
ResumeMonitor
GetMonitorHistory
GetDashboardSummary
CreateAlertChannel
```

## 12.5 Business Logic Layer

Domain utama:

```
Monitor
MonitoringCheck
MonitorStatus
ResponseValidator
AlertTransition
UptimeCalculator
MonitoringScheduler
```

Business rules harus independen dari React components.

Contoh:

```
type MonitorStatus =
  | "UP"
  | "DOWN"
  | "PAUSED"
  | "UNKNOWN";

type CheckStatus =
  | "SUCCESS"
  | "FAILURE"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR";
```

## 12.6 Data Access Layer

Tanggung jawab:

- PostgreSQL queries.
- Prisma operations.
- Database transactions.
- Filtering.
- Pagination.
- Data mapping.

Gunakan Prisma Client.

Hindari membuat repository interface untuk setiap tabel jika tidak ada manfaat nyata.

## 12.7 Infrastructure Layer

Terdiri atas:

- PostgreSQL.
- Redis.
- BullMQ.
- Email provider.
- HTTP client.
- Encryption utilities.
- Logging.
- Monitoring worker.

Infrastructure details tidak boleh tersebar ke seluruh domain.

## 12.8 Next.js Application Responsibilities

Next.js menangani:

- Landing page.
- Authentication.
- Dashboard.
- Monitor management.
- Monitor detail.
- Alert settings.
- REST API.
- Authorization.
- Data queries.
- Application business orchestration.

Next.js tidak menangani:

- Scheduled checks yang berjalan terus-menerus.
- Monitoring request dalam jumlah besar.
- Background retry loops.
- Queue consumption.

## 12.9 Dedicated Worker Responsibilities

Worker merupakan Node.js process terpisah.

Tanggung jawab:

1. Menjalankan scheduler.
2. Mendeteksi monitor yang due.
3. Membuat monitoring jobs.
4. Menjalankan HTTP request.
5. Memvalidasi response.
6. Menyimpan monitoring result.
7. Mengubah status monitor.
8. Mendeteksi status transition.
9. Membuat alert jobs.
10. Mengirim alert.

Worker harus dapat berjalan sebagai proses terpisah:

```
npm run worker:dev
```

## 12.10 Scheduling Architecture

Gunakan pendekatan database-backed scheduling dengan BullMQ.

Alur:

1. Scheduler membaca monitor yang `nextCheckAt` sudah jatuh tempo.
2. Scheduler mengambil data menggunakan transaksi dan row locking (`FOR UPDATE SKIP LOCKED`).
3. Scheduler membuat record check dengan status QUEUED.
4. Scheduler memperbarui `nextCheckAt`.
5. Scheduler melakukan enqueue job ke BullMQ.
6. Worker memproses job.
7. Reconciliation process memeriksa record QUEUED yang belum memiliki job aktif.
8. Job yang tertinggal dapat dimasukkan kembali ke queue.

Alasan pendekatan ini:

- Jadwal tetap tersimpan di PostgreSQL.
- Redis tidak menjadi satu-satunya sumber jadwal.
- Scheduler mendukung lebih dari satu instance.
- Sistem dapat melakukan recovery setelah restart.
- Job yang gagal enqueue dapat direkonsiliasi.

Penting: gunakan unique identifier untuk setiap check dan idempotent processing agar enqueue ulang tidak menghasilkan pemeriksaan ganda.

## 12.11 Monitoring Check Engine

Check engine memiliki tanggung jawab:

```
Validate URL
    ↓
Resolve and validate DNS
    ↓
Block private/internal IP
    ↓
Build HTTP request
    ↓
Execute with timeout
    ↓
Read bounded response body
    ↓
Validate HTTP status
    ↓
Validate headers
    ↓
Validate body
    ↓
Calculate duration
    ↓
Persist check result
```

### SSRF Protection — Critical Requirement

Karena pengguna dapat memasukkan URL sendiri, monitoring worker berpotensi dijadikan alat untuk mengakses jaringan internal.

Implementasi wajib:

- Hanya izinkan HTTP dan HTTPS.
- Tolak `localhost`.
- Tolak loopback IPv4 dan IPv6.
- Tolak private IPv4 ranges.
- Tolak link-local addresses.
- Tolak cloud metadata IP dan hostname.
- Tolak reserved dan non-public IP ranges.
- Resolve DNS sebelum request.
- Validasi seluruh hasil DNS resolution.
- Gunakan DNS pinning agar koneksi menggunakan IP yang telah divalidasi.
- Jangan mengikuti redirect secara otomatis.
- Jika redirect didukung, validasi ulang setiap target redirect.
- Batasi jumlah redirect, maksimal tiga.
- Batasi response body, default 1 MB.
- Terapkan timeout.
- Batasi ukuran request body.
- Batasi header yang dapat dikonfigurasi pengguna.
- Jangan mengizinkan manipulasi `Host`, `Connection`, `Content-Length`, dan hop-by-hop headers.
- Gunakan egress firewall bila memungkinkan.
- Jangan membocorkan response body yang berpotensi mengandung credential ke log.

Untuk implementasi HTTP, gunakan mekanisme DNS lookup/pinning yang dapat diuji pada Node.js Undici. Jangan hanya memvalidasi string URL lalu menggunakan `fetch()` biasa karena hal itu tidak cukup melindungi dari DNS rebinding.

Acceptance requirement: Monitoring engine tidak boleh dapat mengakses internal network hanya karena pengguna mendaftarkan URL berbahaya.

## 12.12 HTTP Check Methodology

MVP mendukung:

- GET.
- POST.
- PUT.
- PATCH.
- DELETE.
- HEAD.

Default:

- Method: GET.
- Timeout: 10 seconds.
- Expected status: 200.
- Redirect: Disabled by default.
- Response body maximum: 1 MB.

Untuk POST/PUT/PATCH:

- Request body dapat dikonfigurasi.
- Content-Type dapat ditentukan.
- Request body memiliki batas ukuran.
- Header sensitif dienkripsi jika disimpan.

## 12.13 Response Validation Strategy

Validasi dilakukan secara berurutan:

1. HTTP request berhasil diselesaikan.
2. HTTP status sesuai.
3. Expected headers terpenuhi.
4. Expected body terpenuhi.

Jika satu validasi wajib gagal, keseluruhan check dikategorikan gagal.

Simpan hasil setiap validator agar pengguna dapat mengetahui penyebab kegagalan secara spesifik.

## 12.14 Alert Processing

Alert harus menggunakan queue terpisah atau job type terpisah.

Contoh:

```
monitor-check
alert-email
alert-webhook
```

Jangan mengirim email secara langsung di dalam proses HTTP check karena provider email dapat lambat atau mengalami gangguan.

## 12.15 State Management

Gunakan:

- React state untuk state lokal.
- URL search params untuk filter yang perlu dibagikan.
- Server-side fetching untuk data utama.
- Zustand hanya jika terdapat shared client state lintas komponen.

Zustand bukan dependency wajib untuk seluruh halaman.

## 12.16 API Architecture

Gunakan Next.js Route Handlers.

Endpoint:

| Method | Endpoint                    | Description          |
| ------ | --------------------------- | -------------------- |
| POST   | `/api/monitors`             | Create monitor       |
| GET    | `/api/monitors`             | List monitors        |
| GET    | `/api/monitors/[id]`        | Get monitor          |
| PATCH  | `/api/monitors/[id]`        | Update monitor       |
| DELETE | `/api/monitors/[id]`        | Delete monitor       |
| POST   | `/api/monitors/[id]/pause`  | Pause monitor        |
| POST   | `/api/monitors/[id]/resume` | Resume monitor       |
| GET    | `/api/monitors/[id]/checks` | Get check history    |
| GET    | `/api/dashboard/summary`    | Dashboard summary    |
| GET    | `/api/alerts`               | List alert channels  |
| POST   | `/api/alerts`               | Create alert channel |
| PATCH  | `/api/alerts/[id]`          | Update alert channel |
| DELETE | `/api/alerts/[id]`          | Delete alert channel |

Semua protected endpoints harus memeriksa session dan ownership.

## 12.17 Logging Strategy

Gunakan structured logging.

Contoh:

```
{
  "level": "info",
  "event": "monitor_check_completed",
  "monitorId": "monitor_123",
  "checkId": "check_123",
  "status": "SUCCESS",
  "durationMs": 145
}
```

Jangan log:

- Password.
- API tokens.
- Authorization headers.
- Webhook secrets.
- Full sensitive response body.

# 13. Data Model

## 13.1 Database Overview

Database utama: PostgreSQL.

ORM: Prisma.

Entity utama:

1. User.
2. Monitor.
3. MonitorCheck.
4. AlertChannel.
5. AlertEvent.

## 13.2 Entity Relationship

\#chatgpt-mermaid-\_r_bot\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_bot\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bot\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bot\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_bot\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bot\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_bot\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_bot\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_bot\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_bot\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_bot\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_bot\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bot\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_bot\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_bot\_ p{margin:0;}#chatgpt-mermaid-\_r_bot\_ .entityBox{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_bot\_ .relationshipLabelBox{fill:rgb(243, 243, 243);opacity:0.7;background-color:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_bot\_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-\_r_bot\_ .labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_bot\_ .edgeLabel{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bot\_ .edgeLabel .label rect{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_bot\_ .edgeLabel .label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bot\_ .edgeLabel .label{fill:rgb(83, 154, 248);font-size:14px;}#chatgpt-mermaid-\_r_bot\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_bot\_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-\_r_bot\_ .node rect,#chatgpt-mermaid-\_r_bot\_ .node circle,#chatgpt-mermaid-\_r_bot\_ .node ellipse,#chatgpt-mermaid-\_r_bot\_ .node polygon{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_bot\_ .relationshipLine{stroke:rgb(143, 143, 143);stroke-width:1px;fill:none;}#chatgpt-mermaid-\_r_bot\_ .marker{fill:none!important;stroke:rgb(143, 143, 143)!important;stroke-width:1;}#chatgpt-mermaid-\_r_bot\_ [data-look=neo].labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_bot\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_bot\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_bot\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_bot\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_bot\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bot\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_bot\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_bot\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_bot\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bot\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_bot\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_bot\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bot\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_bot\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_bot\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bot\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_bot\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bot\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}USERstringidPKstringemailstringnamedatetimecreatedAtMONITORstringidPKstringuserIdFKstringnamestringurlstringmethodintintervalSecondsinttimeoutMsstringstatusdatetimenextCheckAtALERT_CHANNELstringidPKstringuserIdFKstringtypestringdestinationstringsecretEncryptedbooleanenabledMONITOR_CHECKstringidPKstringmonitorIdFKstringstatusinthttpStatusintresponseTimeMsstringfailureReasondatetimecheckedAtALERT_EVENTstringidPKstringmonitorIdFKstringchannelIdFKstringeventTypestringdeliveryStatusdatetimecreatedAtownsconfigureshasgeneratesreceives

## 13.3 User

Field:

| Field     | Type          |
| --------- | ------------- |
| id        | String UUID   |
| name      | String        |
| email     | String Unique |
| createdAt | DateTime      |
| updatedAt | DateTime      |

Better Auth mengelola session dan tabel authentication terkait.

## 13.4 Monitor

Field:

| Field                   | Type              |
| ----------------------- | ----------------- |
| id                      | String UUID       |
| userId                  | String FK         |
| name                    | String            |
| url                     | String            |
| method                  | Enum              |
| intervalSeconds         | Integer           |
| timeoutMs               | Integer           |
| expectedStatusCodes     | JSON              |
| requestHeadersEncrypted | Text nullable     |
| requestBodyEncrypted    | Text nullable     |
| expectedHeaders         | JSON nullable     |
| bodyValidation          | JSON nullable     |
| status                  | Enum              |
| isActive                | Boolean           |
| lastCheckedAt           | DateTime nullable |
| lastSuccessfulAt        | DateTime nullable |
| nextCheckAt             | DateTime nullable |
| createdAt               | DateTime          |
| updatedAt               | DateTime          |

## 13.5 MonitorCheck

Field:

| Field             | Type             |
| ----------------- | ---------------- |
| id                | String UUID      |
| monitorId         | String FK        |
| status            | Enum             |
| httpStatus        | Integer nullable |
| responseTimeMs    | Integer nullable |
| failureReason     | Text nullable    |
| validationResults | JSON nullable    |
| checkedAt         | DateTime         |
| createdAt         | DateTime         |

Index:

- `monitorId`
- `checkedAt`
- `status`
- Composite `(monitorId, checkedAt)`

## 13.6 AlertChannel

Field:

| Field           | Type          |
| --------------- | ------------- |
| id              | String UUID   |
| userId          | String FK     |
| type            | Enum          |
| destination     | String        |
| secretEncrypted | Text nullable |
| isEnabled       | Boolean       |
| createdAt       | DateTime      |
| updatedAt       | DateTime      |

Jenis:

```
type AlertChannelType =
  | "EMAIL"
  | "WEBHOOK";
```

## 13.7 AlertEvent

Field:

| Field          | Type              |
| -------------- | ----------------- |
| id             | String UUID       |
| monitorId      | String FK         |
| channelId      | String FK         |
| eventType      | Enum              |
| deliveryStatus | Enum              |
| attemptCount   | Integer           |
| lastError      | String nullable   |
| createdAt      | DateTime          |
| deliveredAt    | DateTime nullable |

## 13.8 Additional Internal Queue Metadata

Gunakan status QUEUED pada `MonitorCheck` sebagai sumber rekonsiliasi job yang belum selesai.

Jangan menganggap Redis sebagai satu-satunya tempat menyimpan status pekerjaan.

## 13.9 Storage Strategy

| Data               | Storage                     |
| ------------------ | --------------------------- |
| Users              | PostgreSQL                  |
| Monitors           | PostgreSQL                  |
| Monitoring History | PostgreSQL                  |
| Alert Channels     | PostgreSQL                  |
| Alert Events       | PostgreSQL                  |
| Queue Jobs         | Redis                       |
| Secrets            | Encrypted PostgreSQL fields |
| Application Logs   | stdout / log platform       |

## 13.10 Retention Policy

Default MVP:

- Monitoring history: 30 hari.
- Alert event: 90 hari.
- Deleted monitor history: dihapus sesuai kebijakan penghapusan akun/resource.
- Operational logs: mengikuti kebijakan hosting.

Retention harus dapat dikonfigurasi melalui environment variable.

# 14. Security & Privacy

## 14.1 Authentication

Gunakan Better Auth.

Fitur:

- Email/password authentication.
- Secure session cookies.
- Session expiration.
- Logout.
- Password hashing melalui provider.

Jangan implementasikan authentication sendiri menggunakan JWT manual jika tidak ada kebutuhan.

## 14.2 Authorization

Setiap operasi monitor wajib memeriksa:

```
Authenticated User
        ↓
Requested Resource
        ↓
Resource Ownership Check
        ↓
Allow / Reject
```

Jangan mempercayai `userId` yang dikirim dari browser.

Ambil identitas user dari session yang telah diverifikasi.

## 14.3 Input Validation

Gunakan Zod untuk:

- URL.
- HTTP method.
- Interval.
- Timeout.
- Headers.
- Request body.
- Expected status.
- Body validation configuration.
- Alert destination.

## 14.4 SSRF Protection

Critical security requirement

SSRF merupakan risiko paling penting pada APIWatch.

Contoh URL yang harus ditolak:

```
http://localhost
http://127.0.0.1
http://192.168.1.1
http://10.0.0.1
http://169.254.169.254
http://[::1]
```

Selain validasi URL, lakukan:

- DNS resolution validation.
- DNS pinning.
- Redirect validation.
- Private IP blocking.
- Link-local blocking.
- Cloud metadata blocking.
- Egress network restrictions.

## 14.5 Secret Encryption

Gunakan authenticated encryption seperti AES-256-GCM untuk menyimpan:

- API authorization headers.
- Webhook secrets.
- Sensitive request headers.
- Sensitive request body jika diperlukan.

Encryption key berasal dari environment variable.

Jangan menyimpan encryption key di database.

## 14.6 Rate Limiting

Terapkan batas:

- Authentication requests.
- Monitor creation.
- Monitor updates.
- Manual check.
- Alert channel creation.
- API requests.

Rate limiting dapat menggunakan Redis.

## 14.7 Environment Variables

Contoh:

```
NODE_ENV=development

NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:password@localhost:5432/apiwatch

REDIS_URL=redis://localhost:6379

BETTER_AUTH_SECRET=replace_with_secure_secret
BETTER_AUTH_URL=http://localhost:3000

ENCRYPTION_KEY=replace_with_32_byte_key

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

MONITOR_DEFAULT_TIMEOUT_MS=10000
MONITOR_MAX_RESPONSE_BYTES=1048576
MONITOR_DEFAULT_RETENTION_DAYS=30

WORKER_CONCURRENCY=10
SCHEDULER_POLL_INTERVAL_MS=5000
```

Semua environment variable wajib divalidasi saat startup.

Jangan pernah meng-commit `.env`.

## 14.8 Privacy

- Monitor bersifat private.
- Alert destination bersifat private.
- Secret tidak boleh dikembalikan secara plaintext.
- Monitoring response body tidak perlu disimpan secara lengkap.
- Log harus menghindari sensitive payload.
- User dapat menghapus resource miliknya.

# 15. Success Criteria

MVP dapat dinyatakan selesai apabila:

| ID    | Criteria                            | Status Requirement |
| ----- | ----------------------------------- | ------------------ |
| SC-01 | User dapat register                 | Required           |
| SC-02 | User dapat login/logout             | Required           |
| SC-03 | User dapat membuat monitor          | Required           |
| SC-04 | User dapat melihat daftar monitor   | Required           |
| SC-05 | Worker menjalankan scheduled checks | Required           |
| SC-06 | HTTP status tervalidasi             | Required           |
| SC-07 | Response time terukur               | Required           |
| SC-08 | Header validation berjalan          | Required           |
| SC-09 | Body validation berjalan            | Required           |
| SC-10 | Monitoring history tersimpan        | Required           |
| SC-11 | Dashboard menampilkan status        | Required           |
| SC-12 | Email alert berfungsi               | Required           |
| SC-13 | Webhook alert berfungsi             | Required           |
| SC-14 | Status recovery terdeteksi          | Required           |
| SC-15 | Ownership authorization berfungsi   | Required           |
| SC-16 | SSRF protection teruji              | Required           |
| SC-17 | Docker deployment berhasil          | Required           |
| SC-18 | Production smoke test berhasil      | Required           |

## Definition of Done

Suatu fitur dianggap selesai apabila:

1. Implementasi tersedia.
2. TypeScript tidak memiliki error.
3. Validasi input tersedia.
4. Error handling tersedia.
5. Testing yang relevan berhasil.
6. UI memiliki loading, error, dan empty state bila diperlukan.
7. Tidak ada mock production data.
8. Dokumentasi diperbarui jika diperlukan.
9. Git checkpoint dibuat setelah review.

# 16. Risks & Technical Constraints

| Risk                              | Impact   | Mitigation                                     |
| --------------------------------- | -------- | ---------------------------------------------- |
| SSRF attack                       | Critical | DNS pinning, IP validation, egress restriction |
| Worker downtime                   | High     | Restart policy, scheduler recovery             |
| Redis downtime                    | High     | DB-backed scheduling dan reconciliation        |
| Database overload                 | High     | Indexing, retention, pagination                |
| Too many monitoring jobs          | High     | Plan limits, concurrency limits                |
| Slow endpoint                     | Medium   | Request timeout                                |
| Large response body               | High     | Response size limit                            |
| Email provider failure            | Medium   | Retry queue                                    |
| Duplicate alerts                  | Medium   | State transition deduplication                 |
| DNS rebinding                     | Critical | Validated DNS pinning                          |
| Insecure secrets                  | High     | Encryption at rest                             |
| High hosting bandwidth            | Medium   | Request limits dan response size limits        |
| Misconfigured monitoring interval | Medium   | Minimum interval validation                    |
| Worker resource exhaustion        | High     | Concurrency control dan bounded memory         |

## 16.1 Infrastructure Constraints

Monitoring membutuhkan resource jaringan yang berkelanjutan.

Pertimbangkan:

- CPU.
- RAM.
- Network bandwidth.
- DNS resolution.
- Number of concurrent checks.
- Average response body size.
- Queue backlog.
- PostgreSQL writes.

## 16.2 Initial MVP Limits

Rekomendasi initial free-tier policy:

| Resource            | Initial Limit               |
| ------------------- | --------------------------- |
| Monitors per user   | 5                           |
| Minimum interval    | 5 minutes                   |
| Maximum timeout     | 30 seconds                  |
| Response body limit | 1 MB                        |
| Monitoring history  | 30 days                     |
| Alert channels      | 2                           |
| Concurrent checks   | Global worker configuration |

Angka di atas merupakan asumsi awal dan harus dapat diubah melalui konfigurasi plan.

Jangan hardcode limit pada banyak file.

## 16.3 Monetization Strategy

Model bisnis yang direkomendasikan:

Free Plan

- Maksimal 5 endpoint.
- Interval 5 menit.
- History 30 hari.
- Basic email alert.

Pro Plan

- Lebih banyak endpoint.
- Interval lebih pendek.
- History lebih panjang.
- Multiple alert channels.
- Advanced reports.

Team Plan — Future

- Shared workspace.
- Team members.
- Multiple projects.
- Role management.

Monetization dan payment gateway tidak termasuk P0 MVP.

# PART B — SEQUENTIAL DEVELOPMENT PLAYBOOK

Development dibagi menjadi tepat 10 phase.

Setiap phase wajib diselesaikan, diuji, direview, dan mendapatkan Git checkpoint sebelum melanjutkan ke phase berikutnya.

Development roadmap

1. Phase 1 — Environment & Project Bootstrap

   Persiapan environment dan project initialization

2. Phase 2 — Technical Planning & Architecture

   Technical plan dan keputusan arsitektur

3. Phase 3 — UI/UX Planning & Design System

   Design direction dan UI specification

4. Phase 4 — Frontend Foundation & Application Shell

   Layout, routing, navigation, dan reusable UI

5. Phase 5 — Core Frontend Feature Development

   Implementasi seluruh core interface

6. Phase 6 — Backend & Core Business Logic

   Database, API, worker, monitoring engine, dan alerts

7. Phase 7 — Frontend & Backend Integration

   End-to-end integration dan penghapusan mock

8. Phase 8 — Additional Features & Product Completion

   P1 features dan product polish

9. Phase 9 — Testing, Security & Optimization

   Quality assurance dan security verification

10. Phase 10 — Production Deployment & Release

    Docker, VPS, HTTPS, monitoring, dan release

## Aturan pelaksanaan phase

Sebelum menjalankan setiap prompt:

1. Buka repository APIWatch di VS Code.
2. Pastikan branch Git benar.
3. Pastikan phase sebelumnya sudah selesai.
4. Jalankan prompt phase yang bersangkutan.
5. Periksa perubahan file.
6. Jalankan seluruh testing yang diwajibkan.
7. Review hasil pekerjaan AI.
8. Buat Git checkpoint.
9. Jangan melanjutkan phase selanjutnya tanpa persetujuan.

# PHASE 1 — Environment & Project Bootstrap

Foundation

&#x20;Dependency: None

## 1. Phase Objective

Menyiapkan environment pengembangan dan membuat project APIWatch dengan Next.js, TypeScript, Tailwind CSS, dan shadcn/ui.

Pada tahap ini belum ada implementasi business logic monitoring.

Hasil akhir: project dapat dijalankan secara lokal dan siap digunakan untuk pengembangan berikutnya.

## 2. Scope of Work

- Memeriksa Node.js dan npm.
- Membuat repository Git.
- Membuat Next.js application.
- Mengaktifkan TypeScript strict mode.
- Mengonfigurasi Tailwind CSS.
- Menginisialisasi shadcn/ui.
- Memasang dependency dasar.
- Membuat `.env.example`.
- Menyiapkan struktur folder awal.
- Membuat basic landing page.
- Memverifikasi development server.

## 3. Detailed Implementation Steps

### Step 1 — Environment Verification

Rekomendasi:

- Node.js 22 LTS atau versi LTS yang kompatibel.
- npm.
- Git.
- VS Code.
- Docker Desktop (opsional pada tahap ini).

Periksa:

```
node -v
npm -v
git --version
docker --version
```

Docker tidak wajib diinstal untuk menjalankan frontend awal.

### Step 2 — Create Next.js Project

```
npx create-next-app@latest apiwatch
```

Konfigurasi:

| Option         | Selection |
| -------------- | --------- |
| TypeScript     | Yes       |
| ESLint         | Yes       |
| Tailwind CSS   | Yes       |
| App Router     | Yes       |
| src directory  | Yes       |
| Import alias   | `@/*`     |
| React Compiler | Optional  |

Masuk project:

```
cd apiwatch
```

### Step 3 — Install Base Dependencies

```
npm install zustand zod lucide-react recharts
```

Development dependencies:

```
npm install -D prettier prettier-plugin-tailwindcss
```

Dependency ini digunakan untuk:

- Zustand: shared client state jika diperlukan.
- Zod: validation.
- Lucide: icons.
- Recharts: monitoring charts.
- Prettier: formatting.

Dependency backend akan dipasang pada Phase 6.

### Step 4 — Initialize shadcn/ui

```
npx shadcn@latest init
```

Pilih konfigurasi visual yang sesuai dengan design direction APIWatch.

### Step 5 — Install Initial Components

```
npx shadcn@latest add button card input label badge
```

### Step 6 — Initialize Git

```
git init
git branch -M main
```

Pastikan `.gitignore` sudah mengecualikan:

```
node_modules
.next
.env
.env.local
.env.production
dist
coverage
```

### Step 7 — Environment Template

Buat:

```
.env.example
```

Isi dengan placeholder environment variable yang telah ditentukan pada PRD.

Jangan masukkan credential asli.

### Step 8 — Run Application

```
npm run dev
```

Buka:

```
http://localhost:3000
```

### Step 9 — Verify Build

```
npx tsc --noEmit
npm run lint
npm run build
```

## 4. Required Commands

Ringkasan:

```
npx create-next-app@latest apiwatch
cd apiwatch

npm install zustand zod lucide-react recharts

npm install -D prettier prettier-plugin-tailwindcss

npx shadcn@latest init

npx shadcn@latest add button card input label badge

git init
git branch -M main

npm run dev
```

Catatan: jika versi Next.js terbaru mengubah command lint bawaan, sesuaikan script `package.json` menggunakan konfigurasi ESLint yang tersedia. Jangan mengasumsikan `next lint` masih didukung.

## 5. AI Coding Assistant Prompt

```

Kamu bertindak sebagai Senior Fullstack Developer.

PROJECT: APIWatch – API Monitoring

Dokumen utama:
PROJECT_PRD_AND_PLAYBOOK.md

Tech stack:
Next.js App Router, TypeScript, Tailwind CSS,
shadcn/ui, Zustand.

Development approach:
Solo developer, MVP first, clean architecture
pragmatis, maintainable, reusable components.

PHASE: 1 — Environment & Project Bootstrap

TUJUAN:
Menyiapkan project APIWatch agar siap digunakan
untuk development.

INSTRUKSI:

1. Baca bagian PRD dan Phase 1 dari dokumen utama.
2. Periksa environment dan struktur repository.
3. Jangan menghapus file existing tanpa alasan.
4. Jika project belum ada, buat Next.js App Router.
5. Gunakan TypeScript strict mode.
6. Pastikan Tailwind CSS berfungsi.
7. Setup shadcn/ui.
8. Install dependency yang dibutuhkan Phase 1.
9. Setup Git.
10. Buat .env.example.
11. Buat landing page sederhana dengan identitas APIWatch.
12. Jangan implementasikan authentication.
13. Jangan implementasikan database.
14. Jangan implementasikan monitoring engine.
15. Jangan membuat mock backend.
16. Jangan melanjutkan Phase 2.

FILE YANG DIHARAPKAN:

- package.json
- tsconfig.json
- next.config.ts
- src/app/layout.tsx
- src/app/page.tsx
- src/app/globals.css
- components.json
- .env.example
- .gitignore
- konfigurasi Prettier jika diperlukan

ACCEPTANCE CRITERIA:

- Next.js berjalan.
- TypeScript strict mode aktif.
- Tailwind berfungsi.
- shadcn/ui dapat digunakan.
- Landing page tampil.
- Tidak ada TypeScript error.
- Lint berhasil.
- Production build berhasil.

TESTING:

Jalankan:
npm run dev
npx tsc --noEmit
npm run lint
npm run build

LAPORAN:

Berikan:
1. Environment yang digunakan.
2. File yang dibuat/diubah.
3. Dependency yang ditambahkan.
4. Command yang dijalankan.
5. Hasil testing aktual.
6. Masalah yang ditemukan.
7. Status acceptance criteria.

Jangan membuat Git commit otomatis.
Tunggu persetujuan developer.

```

## 6. Expected Deliverables

- Next.js application.
- TypeScript configuration.
- Tailwind configuration.
- shadcn/ui configuration.
- Base dependencies.
- Basic landing page.
- `.env.example`.
- Git repository.

## 7. Acceptance Criteria

- Next.js berjalan di localhost.
- TypeScript strict mode aktif.
- Tailwind CSS berfungsi.
- shadcn/ui berfungsi.
- Basic landing page tersedia.
- Dependency terpasang.
- `.env.example` tersedia.
- Git repository tersedia.
- TypeScript check berhasil.
- Lint berhasil.
- Production build berhasil.

## 8. Testing Requirements

```
npm run dev
npx tsc --noEmit
npm run lint
npm run build
```

Periksa halaman melalui browser.

## 9. Git Checkpoint

Jika semua acceptance criteria terpenuhi:

```
git add .
git commit -m "phase 1: project bootstrap"
```

# PHASE 2 — Technical Planning & Architecture

Architecture

&#x20;Dependency: Phase 1

## 1. Phase Objective

Menyusun perencanaan teknis final sebelum implementasi fitur utama.

Phase ini tidak boleh digunakan untuk membangun business features.

Hasil utama adalah:

`TECHNICAL_PLAN.md`

## 2. Scope of Work

- Menganalisis PRD.
- Memvalidasi technology stack.
- Menentukan folder structure.
- Menentukan application architecture.
- Menentukan worker architecture.
- Menentukan database schema.
- Menentukan API contracts.
- Menentukan scheduling mechanism.
- Menentukan monitoring engine.
- Menentukan security architecture.
- Menentukan external dependencies.
- Menentukan deployment topology.
- Mengidentifikasi technical risks.

## 3. Detailed Implementation Steps

### Step 1 — Review Existing Project

Periksa:

- `package.json`.
- `src/`.
- `tsconfig.json`.
- `next.config.ts`.
- Tailwind configuration.
- Existing Git commits.

### Step 2 — Finalize Architecture

Dokumentasikan:

- Next.js application.
- PostgreSQL.
- Prisma.
- Redis.
- BullMQ.
- Dedicated Node.js worker.
- Better Auth.
- Email provider.

### Step 3 — Determine Final Folder Structure

Struktur target:

```
apiwatch/
│
├── docs/
│   ├── TECHNICAL_PLAN.md
│   └── UI_UX_GUIDE.md
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│
├── scripts/
│
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   └── api/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── monitors/
│   │   └── alerts/
│   │
│   ├── hooks/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── redis/
│   │   ├── queue/
│   │   ├── security/
│   │   └── validation/
│   │
│   ├── server/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── services/
│   │
│   └── types/
│
├── worker/
│   └── src/
│       ├── scheduler/
│       ├── jobs/
│       ├── engine/
│       ├── validators/
│       ├── alerts/
│       └── lib/
│
├── tests/
│
├── docker-compose.yml
├── Dockerfile
├── package.json
└── PROJECT_PRD_AND_PLAYBOOK.md
```

Struktur ini merupakan target, bukan instruksi untuk membuat seluruh file sekarang.

### Step 4 — Define Database Schema

Tentukan:

- User.
- Session.
- Account.
- Verification.
- Monitor.
- MonitorCheck.
- AlertChannel.
- AlertEvent.

Pastikan relasi dan indexes terdokumentasi.

### Step 5 — Define API Contracts

Dokumentasikan seluruh endpoint, request body, response body, authorization, dan error format.

### Step 6 — Define Worker Flow

Tentukan:

- Scheduler polling.
- Database job claiming.
- BullMQ enqueue.
- Monitoring execution.
- Result persistence.
- Reconciliation.
- Alert delivery.

### Step 7 — Security Planning

Prioritaskan:

- SSRF.
- DNS rebinding.
- Authorization.
- Secret encryption.
- Rate limiting.
- Response size limit.
- Timeout.
- Sensitive logging.

### Step 8 — Dependency Review

Setiap dependency harus memiliki alasan.

Hindari dependency duplikat untuk fungsi yang sudah disediakan platform.

## 4. Required Commands

```
npm list --depth=0

find src -maxdepth 3 -type f

git status
git log --oneline -5
```

Windows PowerShell alternatif:

```
Get-ChildItem src -Recurse -File
git status
git log --oneline -5
```

## 5. AI Coding Assistant Prompt

```

Kamu bertindak sebagai Senior Software Architect
dan Technical Lead.

PROJECT: APIWatch – API Monitoring

Dokumen utama:
PROJECT_PRD_AND_PLAYBOOK.md

Tech stack:
Next.js, TypeScript, PostgreSQL, Prisma,
Redis, BullMQ, Better Auth, Node.js Worker.

PHASE: 2 — Technical Planning & Architecture

TUJUAN:
Menyusun technical architecture final.

ATURAN:

1. Baca seluruh PRD.
2. Periksa kondisi repository.
3. Analisis seluruh functional requirements.
4. Tentukan arsitektur Modular Monolith
   dengan dedicated background worker.
5. Next.js menangani application API.
6. Node.js worker menangani scheduled monitoring.
7. PostgreSQL menjadi source of truth.
8. Redis + BullMQ menangani asynchronous jobs.
9. Gunakan Prisma.
10. Gunakan Better Auth.
11. Dokumentasikan scheduling dan recovery strategy.
12. Dokumentasikan SSRF protection secara detail.
13. Tentukan API contracts.
14. Tentukan database relationships.
15. Tentukan folder structure.
16. Tentukan dependency dan alasannya.
17. Identifikasi risiko teknis.
18. Jangan implementasikan fitur utama.
19. Jangan membuat database migration.
20. Jangan membuat monitoring engine.
21. Jangan melanjutkan Phase 3.

OUTPUT WAJIB:

Buat TECHNICAL_PLAN.md yang berisi:

- Architecture overview.
- Architecture diagram.
- Folder structure.
- Frontend architecture.
- Backend architecture.
- Worker architecture.
- Database schema design.
- API endpoint contracts.
- Authentication design.
- Queue and scheduler design.
- Monitoring execution flow.
- SSRF security design.
- Encryption strategy.
- Error handling.
- Logging.
- Testing strategy.
- Deployment architecture.
- Dependency list.
- Environment variables.
- Technical risks.

FILE:
docs/TECHNICAL_PLAN.md

ACCEPTANCE CRITERIA:

- Seluruh P0 requirements terpetakan.
- Architecture tidak menggunakan microservices.
- Worker terpisah dari Next.js.
- Database design jelas.
- API contracts jelas.
- Security strategy tersedia.
- Tidak ada keputusan arsitektur yang bertentangan dengan PRD.

Jangan mengimplementasikan fitur.
Jangan membuat commit otomatis.

Laporkan hasil dan tunggu persetujuan.

```

## 6. Expected Deliverables

- `docs/TECHNICAL_PLAN.md`.
- Architecture diagram.
- Database design.
- API contracts.
- Worker flow.
- Security plan.
- Dependency list.

## 7. Acceptance Criteria

- Technical plan tersedia.
- Arsitektur sesuai PRD.
- Folder structure ditentukan.
- API contracts terdokumentasi.
- Database schema direncanakan.
- Worker architecture ditentukan.
- Scheduling recovery dijelaskan.
- SSRF protection direncanakan.
- Environment variables terdokumentasi.
- Technical risks diidentifikasi.
- Tidak ada fitur utama yang diimplementasikan.

## 8. Testing Requirements

Tidak membutuhkan feature testing.

Verifikasi dokumen:

- Konsistensi antara PRD dan technical plan.
- Tidak ada dependency yang tidak memiliki alasan.
- Tidak ada kontradiksi pada data flow.

## 9. Git Checkpoint

```
git add .
git commit -m "phase 2: technical architecture"
```

# PHASE 3 — UI/UX Planning & Design System

Design

&#x20;Dependency: Phase 2

## 1. Phase Objective

Membuat panduan desain dan spesifikasi interface APIWatch sebelum mengimplementasikan seluruh halaman.

Output:

`docs/UI_UX_GUIDE.md`

## 2. Scope of Work

- Design direction.
- Color palette.
- Typography.
- Spacing.
- Border radius.
- Shadows.
- Navigation.
- Sidebar.
- Dashboard layout.
- Monitor list.
- Monitor detail.
- Create monitor form.
- Alert configuration.
- Responsive behavior.
- Component specifications.
- UI states.

## 3. Detailed Implementation Steps

### Step 1 — Define Visual Identity

Tentukan:

- Brand name: APIWatch.
- Primary color: Indigo / Blue.
- Success: Green.
- Danger: Red.
- Neutral: Slate.
- Font: Geist Sans atau Inter.

### Step 2 — Define Design Tokens

Contoh:

```
Primary:
  Blue / Indigo

Success:
  Green

Danger:
  Red

Warning:
  Amber

Spacing:
  4px base scale

Border Radius:
  8px / 12px / 16px

Typography:
  Geist Sans
  Geist Mono
```

### Step 3 — Design Dashboard

Komponen:

- Sidebar.
- Header.
- Summary cards.
- Monitoring table.
- Recent incidents.
- Response time chart.

### Step 4 — Design Monitor Management

Halaman:

- Monitor list.
- Create monitor.
- Edit monitor.
- Monitor detail.

Form create monitor harus memiliki beberapa section:

1. Basic Information.
2. Request Configuration.
3. Expected Response.
4. Schedule Configuration.

### Step 5 — Design Alert Settings

Form:

- Email destination.
- Webhook URL.
- Enable/disable channel.
- Test destination (P1 jika belum siap).

### Step 6 — Define Responsive Behavior

Tentukan behavior setiap halaman pada desktop, tablet, dan mobile.

### Step 7 — Document UI States

Setiap halaman harus memiliki:

- Loading.
- Empty.
- Error.
- Success.
- Disabled.

## 4. Required Commands

```
npm list lucide-react recharts
```

Tidak ada kebutuhan memasang dependency tambahan jika komponen sudah tersedia.

## 5. AI Coding Assistant Prompt

```

Kamu bertindak sebagai Senior UI/UX Designer
dan Frontend Architect.

PROJECT: APIWatch – API Monitoring

Dokumen utama:
PROJECT_PRD_AND_PLAYBOOK.md

Technical reference:
docs/TECHNICAL_PLAN.md

Tech stack:
Next.js, TypeScript, Tailwind CSS,
shadcn/ui, Lucide React, Recharts.

PHASE: 3 — UI/UX Planning & Design System

TUJUAN:
Membuat design system dan UI/UX specification.

ATURAN:

1. Baca PRD.
2. Baca TECHNICAL_PLAN.md.
3. Gunakan developer-focused SaaS dashboard.
4. Design harus clean, modern, minimalis.
5. Hindari visual yang terlalu ramai.
6. Gunakan konsistensi spacing dan typography.
7. Gunakan shadcn/ui sebagai component foundation.
8. Gunakan Lucide icons.
9. Buat desktop, tablet, mobile behavior.
10. Tentukan loading, empty, error, success states.
11. Tentukan desain seluruh P0 pages.
12. Jangan implementasikan backend.
13. Jangan implementasikan monitoring logic.
14. Jangan mengubah architecture.
15. Jangan melanjutkan Phase 4.

OUTPUT:
docs/UI_UX_GUIDE.md

DOKUMEN HARUS MEMUAT:

- Design direction.
- Brand identity.
- Color tokens.
- Typography.
- Spacing.
- Border radius.
- Shadow.
- Sidebar specification.
- Header specification.
- Dashboard layout.
- Monitor list specification.
- Monitor detail specification.
- Create monitor form.
- Edit monitor form.
- Alert settings.
- Status badge.
- History table.
- Chart specification.
- Responsive specification.
- Component inventory.
- UI state specification.

ACCEPTANCE CRITERIA:

- Semua P0 pages memiliki spesifikasi.
- Navigation konsisten.
- Responsive behavior jelas.
- Design tokens tersedia.
- Component inventory tersedia.
- Tidak ada desain yang bertentangan dengan PRD.

FILE:
docs/UI_UX_GUIDE.md

Jangan implementasikan UI.
Jangan membuat commit otomatis.
Laporkan hasil dan tunggu persetujuan.

```

## 6. Expected Deliverables

- `docs/UI_UX_GUIDE.md`.
- Design tokens.
- Component inventory.
- Navigation specification.
- Page layouts.
- Responsive specification.

## 7. Acceptance Criteria

- Design direction ditentukan.
- Color palette tersedia.
- Typography ditentukan.
- Spacing ditentukan.
- Dashboard dirancang.
- Monitor list dirancang.
- Monitor detail dirancang.
- Monitor form dirancang.
- Alert settings dirancang.
- Responsive behavior tersedia.
- UI states terdokumentasi.

## 8. Testing Requirements

Lakukan design review:

- Konsistensi visual.
- Konsistensi navigation.
- Kelengkapan halaman.
- Mobile layout.
- Accessibility requirements.

## 9. Git Checkpoint

```
git add .
git commit -m "phase 3: ui ux planning"
```

# PHASE 4 — Frontend Foundation & Application Shell

Frontend Foundation

&#x20;Dependency: Phase 3

## 1. Phase Objective

Mengimplementasikan application shell berdasarkan UI/UX guide.

Fokus pada layout, routing, navigation, design system, dan reusable components.

Tidak ada implementasi business logic monitoring.

## 2. Scope of Work

- Final folder structure.
- Global layout.
- Global CSS.
- Theme configuration.
- Public navbar.
- Dashboard sidebar.
- Dashboard header.
- Footer.
- Protected page layout placeholder.
- Reusable components.
- Basic route implementation.
- Responsive navigation.

## 3. Detailed Implementation Steps

### Step 1 — Setup Final Folder Structure

Buat struktur berdasarkan `TECHNICAL_PLAN.md`.

Jangan membuat file kosong yang tidak digunakan.

### Step 2 — Implement Global Design System

Implementasikan:

- Color tokens.
- Typography.
- Spacing.
- Background.
- Surface.
- Borders.
- Status colors.

### Step 3 — Implement Public Layout

Routes:

```
/
/pricing
/login
/register
```

Pada tahap ini halaman authentication hanya berupa UI placeholder, belum memiliki proses autentikasi nyata.

### Step 4 — Implement Dashboard Layout

Routes:

```
/dashboard
/monitors
/monitors/new
/monitors/[id]
/settings
/settings/alerts
```

Halaman dapat menggunakan placeholder.

### Step 5 — Implement Navigation

Buat:

- Sidebar.
- Header.
- User menu placeholder.
- Mobile navigation drawer.
- Active route indication.

### Step 6 — Implement Shared Components

Contoh:

```
src/components/shared/
  PageHeader.tsx
  EmptyState.tsx
  ErrorState.tsx
  LoadingSkeleton.tsx
  StatusBadge.tsx
  ConfirmDialog.tsx
```

### Step 7 — Implement Responsive Behavior

Pastikan sidebar dapat menjadi drawer pada mobile.

### Step 8 — Verify Layout

Jalankan aplikasi dan periksa seluruh route.

## 4. Required Commands

```
npx shadcn@latest add
  separator
  dropdown-menu
  avatar
  dialog
  alert-dialog
  table
  skeleton
  tooltip
  sheet
  sonner
```

Jika shell tidak mendukung pemisahan baris seperti di atas, jalankan sebagai satu command atau satu per satu.

Testing:

```
npm run dev
npx tsc --noEmit
npm run lint
npm run build
```

## 5. AI Coding Assistant Prompt

```

Kamu bertindak sebagai Senior Frontend Developer.

PROJECT: APIWatch – API Monitoring

Dokumen utama:
PROJECT_PRD_AND_PLAYBOOK.md

Technical reference:
docs/TECHNICAL_PLAN.md

UI reference:
docs/UI_UX_GUIDE.md

Tech stack:
Next.js App Router, TypeScript, Tailwind CSS,
shadcn/ui, Lucide React.

PHASE: 4 — Frontend Foundation & Application Shell

TUJUAN:
Implementasikan frontend foundation dan application shell.

ATURAN:

1. Baca PRD.
2. Baca TECHNICAL_PLAN.md.
3. Baca UI_UX_GUIDE.md.
4. Periksa kondisi repository.
5. Ikuti folder structure final.
6. Implementasikan global layout.
7. Implementasikan public layout.
8. Implementasikan dashboard layout.
9. Implementasikan sidebar.
10. Implementasikan header.
11. Implementasikan footer.
12. Implementasikan responsive navigation.
13. Implementasikan reusable components.
14. Implementasikan route placeholders.
15. Gunakan shadcn/ui.
16. Jangan membuat backend.
17. Jangan membuat database.
18. Jangan implementasikan authentication logic.
19. Jangan implementasikan monitoring business logic.
20. Jangan membuat mock API service.
21. Jangan melanjutkan Phase 5.

FILE YANG DIHARAPKAN:

- src/app/layout.tsx
- src/app/globals.css
- src/app/(marketing)/
- src/app/(auth)/
- src/app/(dashboard)/
- src/components/layout/
- src/components/shared/
- src/components/ui/

Sesuaikan dengan routing architecture yang
telah ditentukan.

ACCEPTANCE CRITERIA:

- Semua route placeholder dapat dibuka.
- Public layout berfungsi.
- Dashboard layout berfungsi.
- Sidebar responsive.
- Navigation aktif sesuai route.
- Reusable components tersedia.
- Tidak ada TypeScript error.
- Tidak ada layout overflow yang signifikan.

TESTING:

npm run dev
npx tsc --noEmit
npm run lint
npm run build

Lakukan browser review untuk desktop dan mobile.

Jangan membuat commit otomatis.
Berikan laporan dan tunggu persetujuan.

```

## 6. Expected Deliverables

- Application shell.
- Public layout.
- Dashboard layout.
- Sidebar.
- Header.
- Footer.
- Navigation.
- Shared UI components.
- Basic route pages.

## 7. Acceptance Criteria

- Semua route utama tersedia.
- Public layout berfungsi.
- Dashboard layout berfungsi.
- Sidebar desktop berfungsi.
- Mobile drawer berfungsi.
- Navigation aktif sesuai route.
- Global design tokens tersedia.
- Reusable components tersedia.
- Tidak ada business logic monitoring.

## 8. Testing Requirements

- Route testing.
- Responsive testing.
- Navigation testing.
- Type checking.
- Linting.
- Build verification.

## 9. Git Checkpoint

```
git add .
git commit -m "phase 4: frontend foundation"
```

# PHASE 5 — Core Frontend Feature Development

Core UI

&#x20;Dependency: Phase 4

## 1. Phase Objective

Mengimplementasikan seluruh halaman dan interface fitur P0 APIWatch menggunakan mock data yang terisolasi.

Phase ini berfokus pada pengalaman pengguna, bukan backend.

## 2. Scope of Work

- Dashboard.
- Monitor list.
- Create monitor form.
- Edit monitor form.
- Monitor detail.
- Monitoring history.
- Response time chart.
- Alert settings.
- Authentication UI.
- Form validation.
- Loading states.
- Empty states.
- Error states.
- Zustand jika memang dibutuhkan.

## 3. Detailed Implementation Steps

### Step 1 — Dashboard Interface

Implementasikan:

- Total monitors.
- UP monitors.
- DOWN monitors.
- Paused monitors.
- Average response time.
- Recent incidents.
- Monitoring overview.

### Step 2 — Monitor List

Kolom:

| Column        | Description                  |
| ------------- | ---------------------------- |
| Name          | Monitor name                 |
| URL           | Endpoint URL                 |
| Method        | HTTP method                  |
| Status        | UP / DOWN / PAUSED           |
| Response Time | Milliseconds                 |
| Last Checked  | Last check time              |
| Actions       | View / Edit / Pause / Delete |

Tambahkan:

- Search.
- Status filter.
- Pagination UI.

### Step 3 — Create Monitor Form

Buat form bertahap atau menggunakan tabs.

Section:

Basic Information

- Monitor name.
- Endpoint URL.
- HTTP method.

Request Configuration

- Headers.
- Request body.
- Timeout.

Expected Response

- Expected HTTP status.
- Expected headers.
- Body validation type.
- Expected body.

Schedule

\- Monitoring interval.

Gunakan React Hook Form jika form sudah cukup kompleks, dengan Zod resolver.

### Step 4 — Monitor Detail

Implementasikan:

- Current status.
- Endpoint information.
- Uptime.
- Average response time.
- History table.
- Response time chart.
- Failure reason.
- Configuration summary.

### Step 5 — Alert Settings

Implementasikan:

- Email channel form.
- Webhook channel form.
- Channel list.
- Enable/disable UI.
- Delete confirmation.

### Step 6 — Authentication Pages

Implementasikan:

- Login.
- Register.
- Password visibility toggle.
- Validation.
- Error message.

Belum melakukan authentication ke backend.

### Step 7 — Mock Data Isolation

Gunakan struktur:

```
src/features/
  dashboard/
    mocks/
    components/
    types/
  monitors/
    mocks/
    components/
    schemas/
  alerts/
    mocks/
    components/
    schemas/
```

Semua mock data harus diberi label dan tidak boleh dipakai sebagai production service.

### Step 8 — Implement UI States

Pastikan seluruh fitur mempunyai:

- Loading.
- Empty.
- Error.
- Success.
- Validation error.

## 4. Required Commands

Jika diperlukan:

```
npm install react-hook-form @hookform/resolvers
```

Testing:

```
npx tsc --noEmit
npm run lint
npm run build
```

## 5. AI Coding Assistant Prompt

```

Kamu bertindak sebagai Senior Frontend Developer.

PROJECT: APIWatch – API Monitoring

Dokumen utama:
PROJECT_PRD_AND_PLAYBOOK.md

Technical reference:
docs/TECHNICAL_PLAN.md

UI reference:
docs/UI_UX_GUIDE.md

Tech stack:
Next.js, TypeScript, Tailwind CSS,
shadcn/ui, React Hook Form, Zod,
Recharts, Zustand jika diperlukan.

PHASE: 5 — Core Frontend Feature Development

TUJUAN:
Implementasikan seluruh core frontend features.

ATURAN:

1. Baca seluruh dokumen referensi.
2. Pertahankan application shell Phase 4.
3. Implementasikan dashboard.
4. Implementasikan monitor list.
5. Implementasikan create monitor form.
6. Implementasikan edit monitor form.
7. Implementasikan monitor detail.
8. Implementasikan monitoring history table.
9. Implementasikan response time chart.
10. Implementasikan alert settings.
11. Implementasikan login dan register UI.
12. Implementasikan form validation.
13. Implementasikan loading, empty, error,
    dan success states.
14. Gunakan reusable components.
15. Gunakan mock data hanya untuk frontend.
16. Pisahkan mock data dari production service.
17. Jangan membuat backend API.
18. Jangan membuat database integration.
19. Jangan implementasikan monitoring worker.
20. Jangan menganggap mock data sebagai production.
21. Jangan melanjutkan Phase 6.

EXPECTED FILES:

src/features/dashboard/
src/features/monitors/
src/features/alerts/
src/features/auth/

Buat schemas, components, types,
dan mocks sesuai kebutuhan.

ACCEPTANCE CRITERIA:

- Seluruh P0 UI tersedia.
- Form validation berfungsi.
- Monitor UI berfungsi menggunakan mock.
- Chart dapat menampilkan data.
- History table dapat ditampilkan.
- Alert UI tersedia.
- Responsive layout berfungsi.
- Semua mock terisolasi.
- Tidak ada TypeScript error.

TESTING:

npx tsc --noEmit
npm run lint
npm run build

Lakukan browser testing pada seluruh halaman.

LAPORAN:

- Halaman yang diimplementasikan.
- Komponen yang dibuat.
- Dependency baru.
- Mock data yang digunakan.
- Hasil testing.
- Acceptance criteria.

Jangan membuat commit otomatis.
Jangan melanjutkan Phase 6.

```

## 6. Expected Deliverables

- Dashboard UI.
- Monitor management UI.
- Monitor detail UI.
- Monitoring history UI.
- Response time chart.
- Alert settings UI.
- Authentication UI.
- Form validation.
- Mock data.

## 7. Acceptance Criteria

- Dashboard selesai.
- Monitor list selesai.
- Create monitor form selesai.
- Edit monitor form selesai.
- Monitor detail selesai.
- History table selesai.
- Chart selesai.
- Alert settings selesai.
- Authentication UI selesai.
- Form validation berjalan.
- Loading state tersedia.
- Empty state tersedia.
- Error state tersedia.
- Mock data terisolasi.
- Responsive testing berhasil.

## 8. Testing Requirements

- Form validation.
- Button interactions.
- Dialog interactions.
- Filter interactions.
- Chart rendering.
- Responsive behavior.
- Type checking.
- Build verification.

## 9. Git Checkpoint

```
git add .
git commit -m "phase 5: core frontend features"
```

# PHASE 6 — Backend & Core Business Logic

Critical implementation

&#x20;Dependency: Phase 5

## 1. Phase Objective

Membangun seluruh backend dan monitoring engine APIWatch.

Phase ini merupakan implementasi teknis paling penting.

Hasil akhir:

- Authentication.
- PostgreSQL integration.
- Prisma schema.
- API endpoints.
- Monitor CRUD.
- Scheduler.
- BullMQ.
- Monitoring engine.
- Response validation.
- History persistence.
- Alert processing.
- Security implementation.

## 2. Scope of Work

### Backend Application

- Database connection.
- Prisma.
- Better Auth.
- Route Handlers.
- Validation.
- Authorization.
- Error handling.

### Worker

- Worker bootstrap.
- Redis connection.
- BullMQ.
- Scheduler.
- Check execution.
- Response validation.
- Result persistence.
- Recovery logic.

### Alert System

- Email provider.
- Webhook delivery.
- Alert transitions.
- Deduplication.
- Retry handling.

### Security

- SSRF protection.
- DNS pinning.
- Secret encryption.
- Rate limiting.
- Response size limits.
- Timeout.

## 3. Detailed Implementation Steps

### Step 1 — Install Backend Dependencies

```
npm install prisma @prisma/client
npm install better-auth
npm install bullmq ioredis
npm install @prisma/adapter-pg pg
npm install nodemailer
```

Untuk development:

```
npm install -D tsx vitest @types/pg @types/nodemailer
```

Catatan:

- Gunakan versi package yang kompatibel.
- Periksa panduan instalasi Prisma untuk versi yang dipilih.
- Konfigurasi adapter PostgreSQL sesuai versi Prisma.
- Jangan memasang Axios hanya untuk HTTP monitoring.
- Gunakan native fetch atau Undici.

### Step 2 — Setup PostgreSQL

Buat database:

```
CREATE DATABASE apiwatch;
```

Tambahkan `DATABASE_URL`.

### Step 3 — Setup Prisma

```
npx prisma init
```

Buat schema berdasarkan data model pada PRD.

Tambahkan:

- User dan authentication models.
- Monitor.
- MonitorCheck.
- AlertChannel.
- AlertEvent.

Gunakan migration:

```
npx prisma migrate dev --name init
npx prisma generate
```

Pastikan schema dan adapter mengikuti versi Prisma yang digunakan.

### Step 4 — Implement Better Auth

Implementasikan:

- Authentication configuration.
- Database integration.
- Register.
- Login.
- Logout.
- Session verification.

Pastikan user session dapat diakses dengan aman dari server.

### Step 5 — Implement Validation Schemas

Buat:

```
src/features/monitors/schemas/
  create-monitor.schema.ts
  update-monitor.schema.ts
  monitor-query.schema.ts
```

Buat validation untuk:

- URL.
- HTTP methods.
- Headers.
- Request body.
- Expected status.
- Interval.
- Timeout.
- Body validation.

### Step 6 — Implement Monitor Services

Buat application services:

```
src/server/application/monitors/
  create-monitor.ts
  list-monitors.ts
  get-monitor.ts
  update-monitor.ts
  delete-monitor.ts
  pause-monitor.ts
  resume-monitor.ts
```

Semua operasi harus memeriksa ownership.

### Step 7 — Implement API Route Handlers

Implementasikan seluruh endpoint yang telah ditentukan.

Pastikan:

- Request validation.
- Session validation.
- Ownership verification.
- Consistent response format.
- Error handling.

### Step 8 — Setup Redis and BullMQ

Implementasikan:

```
worker/src/lib/
  redis.ts
  queues.ts
  worker.ts
```

Pisahkan job types:

```
monitor-check
alert-email
alert-webhook
```

### Step 9 — Implement Scheduler

Scheduler harus:

1. Mengambil due monitors.
2. Menggunakan database row locking.
3. Membuat queued check records.
4. Memperbarui jadwal.
5. Memasukkan job ke Redis.
6. Memastikan proses dapat direkonsiliasi.

Scheduler harus mendukung graceful shutdown.

### Step 10 — Implement Monitoring Engine

Buat modul:

```
worker/src/engine/
  url-security.ts
  dns-resolver.ts
  http-client.ts
  check-executor.ts
  response-limiter.ts
```

Urutan eksekusi:

1. Validasi URL.
2. Resolve DNS.
3. Validasi IP.
4. Pin DNS resolution.
5. Build HTTP request.
6. Eksekusi request.
7. Terapkan timeout.
8. Batasi response body.
9. Ukur duration.
10. Evaluasi HTTP status.
11. Evaluasi headers.
12. Evaluasi body.
13. Persist result.

Jangan menggunakan automatic redirect tanpa validasi ulang.

### Step 11 — Implement Response Validators

Buat:

```
worker/src/validators/
  status-validator.ts
  header-validator.ts
  body-validator.ts
  json-field-validator.ts
```

Semua validator harus dapat diuji secara independen.

### Step 12 — Implement Monitor State Transitions

Buat aturan:

```
UNKNOWN -> UP
UNKNOWN -> DOWN
UP -> DOWN
DOWN -> UP
PAUSED -> UNKNOWN
```

Status PAUSED tidak boleh dihitung sebagai DOWN.

### Step 13 — Implement Alert Processing

Buat:

```
worker/src/alerts/
  alert-transition.ts
  email-sender.ts
  webhook-sender.ts
  alert-dispatcher.ts
```

Implementasikan:

- Down alert.
- Recovery alert.
- Deduplication.
- Retry.
- Delivery status.

Untuk webhook, validasi destination dan cegah webhook SSRF. Jangan mengizinkan webhook mengakses private/internal IP.

### Step 14 — Implement Data Retention

Buat scheduled cleanup job untuk menghapus history yang melewati retention policy.

### Step 15 — Implement Worker Bootstrap

Tambahkan scripts:

```
{
  "scripts": {
    "worker:dev": "tsx watch worker/src/index.ts",
    "worker:start": "tsx worker/src/index.ts"
  }
}
```

Untuk production, gunakan build output JavaScript dan jalankan dengan Node.js. Jangan mengandalkan `tsx` sebagai production runtime.

### Step 16 — Implement Logging

Gunakan structured logs.

Setiap job harus memiliki:

- Job ID.
- Monitor ID.
- Check ID.
- Execution duration.
- Result status.

### Step 17 — Implement Tests

Minimal:

- Monitor validation.
- SSRF protection.
- DNS validation.
- HTTP status validation.
- Header validation.
- Body validation.
- Timeout handling.
- Scheduler behavior.
- Alert transition.

## 4. Required Commands

```
npm install prisma @prisma/client
npm install better-auth
npm install bullmq ioredis
npm install @prisma/adapter-pg pg
npm install nodemailer

npm install -D tsx vitest @types/pg @types/nodemailer

npx prisma init
npx prisma migrate dev --name init
npx prisma generate
```

Menjalankan services:

```
npm run dev
npm run worker:dev
```

Database verification:

```
npx prisma studio
```

## 5. AI Coding Assistant Prompt

```

Kamu bertindak sebagai Senior Backend Developer,
Software Architect, dan Security Engineer.

PROJECT: APIWatch – API Monitoring

Dokumen utama:
PROJECT_PRD_AND_PLAYBOOK.md

Technical reference:
docs/TECHNICAL_PLAN.md

Tech stack:
Next.js Route Handlers, TypeScript, PostgreSQL,
Prisma, Redis, BullMQ, Better Auth,
Node.js Dedicated Worker, Zod.

PHASE: 6 — Backend & Core Business Logic

TUJUAN:
Implementasikan backend dan monitoring engine.

ATURAN UMUM:

1. Baca seluruh PRD dan TECHNICAL_PLAN.md.
2. Periksa implementasi Phase 1–5.
3. Jangan menimpa frontend.
4. Ikuti architecture yang telah disetujui.
5. Gunakan PostgreSQL dan Prisma.
6. Gunakan Better Auth.
7. Gunakan Redis dan BullMQ.
8. Pisahkan worker dari Next.js.
9. Gunakan Zod untuk input validation.
10. Jangan menambahkan microservices.

IMPLEMENTASI WAJIB:

A. DATABASE
- Prisma schema.
- User/auth models.
- Monitor.
- MonitorCheck.
- AlertChannel.
- AlertEvent.
- Relations dan indexes.
- Database migrations.

B. AUTHENTICATION
- Register.
- Login.
- Logout.
- Session.
- Authorization.

C. MONITOR API
- Create.
- List.
- Detail.
- Update.
- Delete.
- Pause.
- Resume.
- History.

D. WORKER
- Redis connection.
- BullMQ queues.
- Scheduler.
- Database job claiming.
- Job reconciliation.
- Graceful shutdown.

E. MONITORING ENGINE
- URL validation.
- DNS resolution.
- DNS pinning.
- Private IP blocking.
- SSRF protection.
- HTTP execution.
- Timeout.
- Response body limit.
- Status validation.
- Header validation.
- Body validation.
- Response time measurement.

F. ALERTS
- Email alert.
- Webhook alert.
- Recovery alert.
- Deduplication.
- Retry.

G. SECURITY
- Authorization.
- Secret encryption.
- Rate limiting.
- Webhook SSRF protection.
- Sensitive log filtering.

BATASAN:

- Jangan implementasikan fitur P2.
- Jangan membuat payment gateway.
- Jangan membuat public status page.
- Jangan mengimplementasikan multi-region.
- Jangan menggunakan mock backend.
- Jangan mengirim alert secara blocking.
- Jangan melewatkan DNS rebinding protection.
- Jangan mempercayai userId dari request body.
- Jangan menganggap automatic fetch redirect aman.
- Jangan menyimpan plaintext credentials.

FILE YANG DIHARAPKAN:

prisma/
src/server/
src/lib/
src/app/api/
worker/
tests/

ACCEPTANCE CRITERIA:

- Authentication berfungsi.
- Database migration berhasil.
- Monitor CRUD berfungsi.
- Ownership validation berfungsi.
- Scheduler berjalan.
- BullMQ memproses jobs.
- HTTP monitoring berjalan.
- Status validation berjalan.
- Header validation berjalan.
- Body validation berjalan.
- Response time tersimpan.
- Monitoring history tersimpan.
- Alert processing berjalan.
- SSRF protection teruji.
- Worker dapat restart.
- Tidak ada critical security issue yang diketahui.

TESTING:

- Unit tests.
- Database integration tests.
- Worker tests.
- HTTP engine tests.
- SSRF security tests.
- Alert tests.
- TypeScript check.
- Lint.
- Build.

Jalankan test aktual.
Jangan mengarang hasil testing.

Jangan membuat commit otomatis.
Jangan melanjutkan Phase 7.

Laporkan seluruh file, dependency, test results,
security issues, dan acceptance criteria.

```

## 6. Expected Deliverables

- Prisma schema.
- Database migrations.
- Authentication implementation.
- Monitor API.
- Worker scheduler.
- BullMQ configuration.
- HTTP monitoring engine.
- Response validators.
- Alert system.
- Security utilities.
- Unit tests.
- Integration tests.

## 7. Acceptance Criteria

- PostgreSQL terhubung.
- Prisma migration berhasil.
- Authentication berfungsi.
- User ownership berfungsi.
- Monitor CRUD berfungsi.
- Scheduler berjalan.
- BullMQ berjalan.
- Job reconciliation tersedia.
- HTTP check berjalan.
- Status validation berjalan.
- Header validation berjalan.
- Body validation berjalan.
- Timeout berfungsi.
- Response limit berfungsi.
- SSRF protection teruji.
- DNS pinning tersedia.
- History tersimpan.
- Alert email tersedia.
- Alert webhook tersedia.
- Recovery alert berfungsi.
- Duplicate alert dicegah.
- Worker graceful shutdown tersedia.

## 8. Testing Requirements

Testing harus mencakup:

| Test                        | Expected Result               |
| --------------------------- | ----------------------------- |
| Valid public URL            | Request executed              |
| Invalid URL                 | Rejected                      |
| localhost URL               | Blocked                       |
| Private IPv4                | Blocked                       |
| Private IPv6                | Blocked                       |
| DNS resolving to private IP | Blocked                       |
| Redirect to private IP      | Blocked                       |
| Correct HTTP status         | Success                       |
| Incorrect HTTP status       | Validation failure            |
| Incorrect header            | Validation failure            |
| Incorrect body              | Validation failure            |
| Invalid JSON                | Validation failure            |
| Slow endpoint               | Timeout                       |
| Large response              | Size limit enforced           |
| Redis restart               | Job recovery possible         |
| Worker restart              | Scheduler resumes             |
| Repeated DOWN               | No duplicate transition alert |
| DOWN to UP                  | Recovery alert                |

## 9. Git Checkpoint

```
git add .
git commit -m "phase 6: backend implementation"
```

# PHASE 7 — Frontend & Backend Integration

End-to-End

&#x20;Dependency: Phase 6

## 1. Phase Objective

Menghubungkan seluruh frontend dengan backend yang telah diimplementasikan.

Semua mock service production harus diganti dengan real API integration.

## 2. Scope of Work

- Authentication integration.
- Session management.
- Dashboard API integration.
- Monitor CRUD integration.
- Monitor detail integration.
- History integration.
- Alert settings integration.
- Loading states.
- Error mapping.
- Retry behavior.
- Data synchronization.
- Mock removal.

## 3. Detailed Implementation Steps

### Step 1 — Implement API Client

Gunakan native `fetch`.

Buat:

```
src/lib/api/
  client.ts
  error.ts
```

API client harus:

- Menangani JSON.
- Menangani HTTP errors.
- Menangani unauthorized.
- Menangani validation errors.
- Menggunakan cookie/session yang sesuai.

### Step 2 — Authentication Integration

Hubungkan:

- Register form.
- Login form.
- Logout.
- Protected dashboard routes.
- Session handling.

Pastikan tidak hanya mengandalkan client-side route protection.

### Step 3 — Dashboard Integration

Ganti mock dashboard data dengan:

```
GET /api/dashboard/summary
```

### Step 4 — Monitor List Integration

Hubungkan:

```
GET /api/monitors
```

Implementasikan:

- Search.
- Filter.
- Pagination.
- Status display.

### Step 5 — Monitor Form Integration

Hubungkan:

```
POST /api/monitors
PATCH /api/monitors/[id]
```

Implementasikan:

- Submission.
- Server validation mapping.
- Success notification.
- Error notification.
- Redirect setelah berhasil.

### Step 6 — Monitor Detail Integration

Hubungkan:

```
GET /api/monitors/[id]
GET /api/monitors/[id]/checks
```

### Step 7 — Pause / Resume / Delete

Hubungkan seluruh action dengan backend.

### Step 8 — Alert Integration

Hubungkan:

```
GET /api/alerts
POST /api/alerts
PATCH /api/alerts/[id]
DELETE /api/alerts/[id]
```

### Step 9 — Data Synchronization

Gunakan server data fetching dan mekanisme refresh yang sesuai.

Untuk MVP, polling dashboard setiap 30–60 detik sudah cukup.

Tidak perlu WebSocket.

### Step 10 — Remove Mock Production Services

Hapus mock services yang tidak lagi digunakan.

Pertahankan fixture untuk automated testing jika diperlukan.

### Step 11 — End-to-End Flow

Uji:

1. Register.
2. Login.
3. Create monitor.
4. Worker executes check.
5. Result persisted.
6. Dashboard updated.
7. History displayed.
8. Alert delivered.
9. Edit monitor.
10. Pause monitor.
11. Resume monitor.
12. Delete monitor.

## 4. Required Commands

```
npm run dev
npm run worker:dev
```

Testing:

```
npx tsc --noEmit
npm run lint
npm run build
```

## 5. AI Coding Assistant Prompt

```

Kamu bertindak sebagai Senior Fullstack Developer.

PROJECT: APIWatch – API Monitoring

Dokumen utama:
PROJECT_PRD_AND_PLAYBOOK.md

Technical reference:
docs/TECHNICAL_PLAN.md

UI reference:
docs/UI_UX_GUIDE.md

Tech stack:
Next.js, TypeScript, PostgreSQL, Prisma,
Redis, BullMQ, Better Auth.

PHASE: 7 — Frontend & Backend Integration

TUJUAN:
Menghubungkan frontend Phase 5 dengan backend
Phase 6 sehingga seluruh core user flows
dapat berjalan end-to-end.

ATURAN:

1. Periksa seluruh implementasi frontend.
2. Periksa seluruh API contracts.
3. Gunakan API backend yang sebenarnya.
4. Ganti mock services dengan real services.
5. Jangan membuat backend duplikat.
6. Jangan mengubah database schema tanpa alasan.
7. Gunakan native fetch.
8. Implementasikan consistent API error handling.
9. Integrasikan authentication.
10. Integrasikan dashboard.
11. Integrasikan monitor CRUD.
12. Integrasikan monitor detail.
13. Integrasikan history.
14. Integrasikan pause/resume/delete.
15. Integrasikan alert settings.
16. Implementasikan loading states.
17. Implementasikan error mapping.
18. Implementasikan refresh behavior.
19. Jangan menggunakan mock sebagai production.
20. Jangan menambahkan fitur P1/P2.
21. Jangan melanjutkan Phase 8.

END-TO-END FLOW:

Register
-> Login
-> Dashboard
-> Create Monitor
-> Worker Check
-> Persist Result
-> Dashboard Update
-> Monitor Detail
-> History
-> Alert Delivery
-> Edit
-> Pause
-> Resume
-> Delete

ACCEPTANCE CRITERIA:

- Seluruh P0 flows bekerja.
- Data berasal dari PostgreSQL.
- Tidak ada mock production data.
- Session berjalan dengan benar.
- Ownership tetap terjaga.
- UI menampilkan hasil backend.
- Error backend ditampilkan dengan benar.
- Loading state berfungsi.
- Worker integration berfungsi.

TESTING:

Jalankan frontend dan worker.
Uji seluruh end-to-end flow.
Verifikasi database secara langsung.
Jalankan TypeScript check, lint, dan build.

Laporkan test aktual.
Jangan membuat commit otomatis.
Jangan melanjutkan Phase 8.

```

## 6. Expected Deliverables

- API client.
- Authentication integration.
- Dashboard integration.
- Monitor CRUD integration.
- History integration.
- Alert integration.
- Error mapping.
- Mock removal.
- End-to-end flow.

## 7. Acceptance Criteria

- Register berhasil.
- Login berhasil.
- Dashboard menampilkan real data.
- Create monitor berhasil.
- Monitor list menampilkan database data.
- Monitor detail berhasil.
- History tampil.
- Edit monitor berhasil.
- Pause berhasil.
- Resume berhasil.
- Delete berhasil.
- Alert settings terhubung.
- Worker dan frontend terintegrasi.
- Tidak ada mock production service.
- Error mapping berjalan.

## 8. Testing Requirements

Minimal skenario:

| Scenario                      | Expected                 |
| ----------------------------- | ------------------------ |
| Register user                 | Account created          |
| Duplicate email               | Rejected                 |
| Login invalid                 | Rejected                 |
| Create valid monitor          | Created                  |
| Create invalid monitor        | Validation error         |
| User accesses another monitor | Rejected                 |
| Worker completes check        | History updated          |
| Monitor DOWN                  | Dashboard updated        |
| Monitor recovery              | Recovery state updated   |
| Delete monitor                | Removed from active list |

## 9. Git Checkpoint

```
git add .
git commit -m "phase 7: frontend backend integration"
```

# PHASE 8 — Additional Features & Product Completion

Product Polish

&#x20;Dependency: Phase 7

## 1. Phase Objective

Menyelesaikan fitur pendukung P1 yang memberikan peningkatan signifikan terhadap usability produk.

Semua P0 harus sudah berfungsi sebelum phase ini.

## 2. Scope of Work

Prioritas implementasi:

1. Advanced dashboard.
2. Response time charts.
3. Monitor tags.
4. Advanced filters.
5. Manual check.
6. Maintenance mode.
7. CSV export.
8. Public status page.
9. Telegram alerts.
10. SEO dan accessibility improvements.

Fitur dapat dipilih sesuai waktu dan kapasitas MVP.

## 3. Detailed Implementation Steps

### Step 1 — Advanced Dashboard

Tambahkan:

- Response time trend.
- Uptime trend.
- Recent incidents.
- Period selector.

### Step 2 — Monitor Tags

Pengguna dapat mengelompokkan endpoint berdasarkan:

- Production.
- Staging.
- Development.
- Payment.
- Authentication.

### Step 3 — Advanced Filters

Tambahkan filter:

- Status.
- HTTP method.
- Tags.
- Date range.

### Step 4 — Manual Check

Pengguna dapat memicu pemeriksaan secara manual.

Pastikan menggunakan BullMQ dan rate limiting.

### Step 5 — Maintenance Mode

Pengguna dapat menonaktifkan alert untuk periode tertentu.

Monitoring tetap berjalan kecuali pengguna secara eksplisit memilih pause monitor.

### Step 6 — CSV Export

Export:

- Checked at.
- HTTP status.
- Response time.
- Result status.
- Failure reason.

Pastikan CSV escaping dilakukan dengan aman.

### Step 7 — Public Status Page

Jika waktu memungkinkan:

- Generate public slug.
- Display public monitor status.
- Jangan menampilkan URL sensitif atau konfigurasi internal.
- Sediakan opsi publish/unpublish.

### Step 8 — Telegram Alert

Gunakan Telegram Bot API.

Simpan bot configuration dan destination secara aman.

### Step 9 — Accessibility

Perbaiki:

- Keyboard navigation.
- Screen reader labels.
- Color contrast.
- Dialog focus management.
- Table accessibility.

### Step 10 — SEO

Optimalkan halaman publik:

- Title.
- Description.
- Open Graph.
- Sitemap.
- Robots.
- Landing page metadata.

Jangan mengindeks dashboard private.

## 4. Required Commands

Dependency tambahan hanya jika fitur dipilih:

```
npm install papaparse
```

Jika implementasi CSV sederhana, gunakan native JavaScript dan tidak perlu dependency tambahan.

Testing:

```
npx tsc --noEmit
npm run lint
npm run build
```

## 5. AI Coding Assistant Prompt

```

Kamu bertindak sebagai Senior Fullstack Developer
dan Product Engineer.

PROJECT: APIWatch – API Monitoring

Dokumen utama:
PROJECT_PRD_AND_PLAYBOOK.md

Technical reference:
docs/TECHNICAL_PLAN.md

UI reference:
docs/UI_UX_GUIDE.md

Tech stack:
Next.js, TypeScript, PostgreSQL, Prisma,
Redis, BullMQ, Better Auth.

PHASE: 8 — Additional Features & Product Completion

TUJUAN:
Mengimplementasikan fitur P1 terpilih dan
meningkatkan kualitas produk.

PRIORITAS:

1. Advanced dashboard.
2. Response time charts.
3. Monitor tags.
4. Advanced filters.
5. Manual check.
6. Maintenance mode.
7. CSV export.
8. Public status page.
9. Telegram alert.
10. Accessibility dan SEO.

ATURAN:

1. Pastikan seluruh P0 sudah selesai.
2. Baca PRD dan technical plan.
3. Implementasikan P1 secara bertahap.
4. Jangan implementasikan seluruh fitur sekaligus
   jika tidak dibutuhkan.
5. Pertahankan arsitektur yang sudah ada.
6. Gunakan komponen reusable.
7. Validasi seluruh input.
8. Terapkan authorization.
9. Terapkan rate limiting untuk manual checks.
10. Jangan membocorkan data private melalui
    public status page.
11. Jangan implementasikan fitur P2.
12. Jangan mengubah core monitoring engine
    tanpa alasan.
13. Jangan melanjutkan Phase 9.

OUTPUT:

- Fitur P1 yang berhasil diimplementasikan.
- Updated UI.
- Updated API jika diperlukan.
- Updated database migration jika diperlukan.
- Tests.
- Documentation.

ACCEPTANCE CRITERIA:

- Fitur P1 yang dipilih berfungsi.
- Tidak merusak fitur P0.
- Authorization tetap berjalan.
- Responsive design terjaga.
- No mock production data.
- Testing berhasil.

Jangan membuat commit otomatis.
Laporkan fitur yang dibuat dan tunggu persetujuan.

```

## 6. Expected Deliverables

- P1 features terpilih.
- Dashboard improvements.
- Advanced filters.
- Manual check jika dipilih.
- CSV export jika dipilih.
- Additional alert channel jika dipilih.
- Accessibility improvements.
- SEO improvements.

## 7. Acceptance Criteria

- Semua P0 tetap berfungsi.
- Fitur P1 terpilih berfungsi.
- Tidak ada regression.
- UI tetap responsive.
- Security tidak menurun.
- Database migration valid jika ada.
- API contracts diperbarui jika ada.
- Testing berhasil.

## 8. Testing Requirements

- Regression testing.
- Manual check testing.
- Filter testing.
- CSV export testing.
- Public page privacy testing.
- Alert testing.
- Accessibility review.
- Responsive review.

## 9. Git Checkpoint

```
git add .
git commit -m "phase 8: additional features"
```

# PHASE 9 — Testing, Security & Optimization

Quality Assurance

&#x20;Dependency: Phase 8

## 1. Phase Objective

Memastikan APIWatch aman, stabil, konsisten, dan siap untuk production.

Tidak boleh menambahkan fitur baru pada phase ini.

Output:

`docs/TEST_REPORT.md`

## 2. Scope of Work

- Unit testing.
- Integration testing.
- End-to-end testing.
- Functional testing.
- Security audit.
- SSRF audit.
- Authorization audit.
- Performance testing.
- Responsive testing.
- Browser testing.
- Database optimization.
- Worker optimization.
- Build verification.
- Bug fixing.

## 3. Detailed Implementation Steps

### Step 1 — Type Checking

```
npx tsc --noEmit
```

Perbaiki seluruh error.

### Step 2 — Linting

```
npm run lint
```

### Step 3 — Unit Testing

Gunakan Vitest.

Test:

- URL validator.
- HTTP status validator.
- Header validator.
- Body validator.
- Uptime calculator.
- Monitor state transition.
- Alert deduplication.
- Encryption utility.

### Step 4 — Integration Testing

Test:

- PostgreSQL.
- Prisma.
- Authentication.
- Monitor CRUD.
- Scheduler.
- BullMQ.
- Worker.
- Alert delivery.

### Step 5 — End-to-End Testing

Gunakan Playwright.

Test:

```
Register
Login
Create Monitor
View Monitor
Update Monitor
Pause Monitor
Resume Monitor
View History
Delete Monitor
Logout
```

### Step 6 — Security Audit

Wajib memeriksa:

- SSRF.
- DNS rebinding.
- Private IP blocking.
- Redirect validation.
- Webhook SSRF.
- Authentication.
- Authorization.
- IDOR.
- Session security.
- Rate limiting.
- Secret exposure.
- SQL injection.
- XSS.
- CSRF sesuai mekanisme authentication.
- Sensitive logs.

### Step 7 — Worker Reliability

Simulasikan:

- Worker restart.
- Redis restart.
- Database restart.
- Queue backlog.
- Failed jobs.
- Duplicate job delivery.
- Stale queued checks.

Pastikan reconciliation bekerja.

### Step 8 — Performance Testing

Periksa:

- Dashboard loading.
- Monitor list query.
- History query.
- Worker concurrency.
- Queue throughput.
- PostgreSQL write load.
- Response body memory consumption.

Jangan melakukan load test agresif ke endpoint milik pihak lain.

Gunakan local test server yang dikontrol sendiri.

### Step 9 — Browser Testing

Test:

- Chrome.
- Firefox.
- Edge.
- Safari jika tersedia.

### Step 10 — Fix Critical Bugs

Prioritas:

1. Critical security.
2. Data corruption.
3. Authentication failure.
4. Monitoring engine failure.
5. Alert failure.
6. UI bugs.
7. Performance.

### Step 11 — Build Verification

```
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Gunakan script test yang benar-benar sudah dikonfigurasi pada repository.

### Step 12 — Generate Test Report

Buat:

`docs/TEST_REPORT.md`

Isi:

- Test environment.
- Test scope.
- Test scenarios.
- Test results.
- Security audit.
- Known issues.
- Performance findings.
- Fixed bugs.
- Remaining limitations.
- Release readiness.

## 4. Required Commands

```
npm test
npm run lint
npx tsc --noEmit
npm run build

npm audit
```

Jika menggunakan Playwright:

```
npx playwright test
```

Jika diperlukan:

```
npx playwright show-report
```

Catatan: `npm audit` harus dianalisis. Jangan melakukan `npm audit fix --force` secara otomatis karena dapat menyebabkan breaking changes.

## 5. AI Coding Assistant Prompt

```

Kamu bertindak sebagai Senior QA Engineer,
Application Security Engineer, dan Performance Engineer.

PROJECT: APIWatch – API Monitoring

Dokumen utama:
PROJECT_PRD_AND_PLAYBOOK.md

Technical reference:
docs/TECHNICAL_PLAN.md

PHASE: 9 — Testing, Security & Optimization

TUJUAN:
Melakukan comprehensive testing dan audit
sebelum production deployment.

ATURAN:

1. Baca PRD.
2. Baca technical plan.
3. Review seluruh implementasi.
4. Jangan menambahkan fitur baru.
5. Jangan mengubah scope produk.
6. Jangan menghapus behavior tanpa alasan.
7. Jalankan test aktual.
8. Jangan mengarang hasil test.
9. Prioritaskan security.
10. Dokumentasikan seluruh temuan.

TESTING WAJIB:

A. QUALITY
- TypeScript.
- Lint.
- Unit tests.
- Integration tests.
- Build.

B. FUNCTIONAL
- Authentication.
- Monitor CRUD.
- Monitoring execution.
- Header validation.
- Body validation.
- History.
- Alerts.
- Recovery.

C. SECURITY
- SSRF.
- DNS rebinding.
- Private IP blocking.
- Redirect validation.
- Webhook SSRF.
- Authorization.
- IDOR.
- Session.
- Rate limiting.
- Encryption.
- Sensitive log exposure.

D. RELIABILITY
- Worker restart.
- Redis restart.
- Database failure.
- Job reconciliation.
- Duplicate jobs.
- Retry handling.

E. PERFORMANCE
- Dashboard.
- History query.
- Database indexes.
- Worker concurrency.
- Memory usage.
- Queue processing.

F. UI
- Responsive.
- Browser compatibility.
- Accessibility.
- Loading and error states.

OUTPUT WAJIB:

Buat docs/TEST_REPORT.md.

Laporan harus membedakan:
- PASS
- FAIL
- NOT TESTED
- BLOCKED

Jangan menandai test sebagai PASS
jika tidak benar-benar dijalankan.

Jika menemukan critical security issue,
perbaiki terlebih dahulu dan jalankan ulang test.

Jangan membuat commit otomatis.
Jangan melanjutkan Phase 10 sebelum
seluruh release-blocking issues diselesaikan.

Laporkan hasil dan tunggu persetujuan.

```

## 6. Expected Deliverables

- Unit tests.
- Integration tests.
- E2E tests.
- Security audit.
- Performance review.
- Bug fixes.
- `docs/TEST_REPORT.md`.

## 7. Acceptance Criteria

- TypeScript check berhasil.
- Lint berhasil.
- Unit tests berhasil.
- Integration tests berhasil.
- E2E tests berhasil.
- Build berhasil.
- Authentication teruji.
- Authorization teruji.
- SSRF protection teruji.
- DNS rebinding protection teruji.
- Webhook SSRF teruji.
- Worker recovery teruji.
- Database indexes direview.
- Responsive testing berhasil.
- Critical issues terselesaikan.
- TEST_REPORT.md tersedia.

## 8. Testing Requirements

Semua hasil testing harus memiliki bukti berupa:

- Command.
- Test scenario.
- Actual result.
- Pass/fail status.
- Issue reference jika gagal.

## 9. Git Checkpoint

```
git add .
git commit -m "phase 9: testing and optimization"
```

# PHASE 10 — Production Deployment & Release

Production Release

&#x20;Dependency: Phase 9

## 1. Phase Objective

Melakukan deployment APIWatch ke production environment.

Target arsitektur: VPS menggunakan Docker dan Docker Compose.

Hasil akhir:

- Production web application.
- Production worker.
- PostgreSQL.
- Redis.
- HTTPS.
- Domain.
- Monitoring.
- Backup.
- Release documentation.

## 2. Scope of Work

- Production environment.
- Environment variables.
- Dockerfile.
- Docker Compose.
- PostgreSQL deployment.
- Redis deployment.
- Web deployment.
- Worker deployment.
- Reverse proxy.
- Domain.
- DNS.
- HTTPS.
- Database migration.
- Monitoring.
- Backup.
- Production smoke test.
- Deployment documentation.
- Release notes.

## 3. Detailed Implementation Steps

### Step 1 — Choose Deployment Infrastructure

Rekomendasi MVP:

- VPS Linux.
- Ubuntu LTS.
- Docker.
- Docker Compose.
- Reverse proxy.
- Domain.
- SSL certificate.

Untuk MVP, satu VPS dapat menjalankan:

1. Next.js web.
2. Node.js worker.
3. PostgreSQL.
4. Redis.
5. Reverse proxy.

Namun database production sebaiknya menggunakan managed PostgreSQL jika budget memungkinkan.

### Step 2 — Prepare Production Environment

Buat:

```
.env.production
```

Isi seluruh production credentials.

Jangan menyimpan file tersebut dalam Git.

### Step 3 — Create Dockerfile

Gunakan multi-stage Docker build.

Pisahkan:

- Web image.
- Worker image.

Keduanya dapat menggunakan satu Dockerfile dengan target berbeda atau build configuration terpisah.

Pastikan:

- Non-root user.
- Production dependencies.
- Proper signal handling.
- Health checks.
- Graceful shutdown.

### Step 4 — Create Docker Compose

Service:

```
web
worker
postgres
redis
reverse-proxy
```

Gunakan persistent volumes untuk database.

Redis persistence dapat diaktifkan sesuai kebutuhan recovery queue.

Jangan mengekspos PostgreSQL dan Redis secara langsung ke public internet.

### Step 5 — Configure Reverse Proxy

Gunakan Nginx atau Caddy.

Tanggung jawab:

- HTTP routing.
- HTTPS termination.
- Reverse proxy ke Next.js.
- Security headers.
- Request size limits.

### Step 6 — Configure DNS

Contoh:

```
A Record:
apiwatch.example.com -> VPS_IP
```

Pastikan domain mengarah ke VPS yang benar.

### Step 7 — Configure HTTPS

Gunakan Let's Encrypt melalui Caddy atau Certbot.

Semua public traffic harus menggunakan HTTPS.

### Step 8 — Database Deployment

Jalankan migration:

```
npx prisma migrate deploy
```

Jangan menggunakan `prisma migrate dev` di production.

Pastikan database backup tersedia sebelum migration yang berisiko.

### Step 9 — Deploy Web and Worker

Build:

```
docker compose build
```

Start:

```
docker compose up -d
```

Periksa:

```
docker compose ps
docker compose logs -f web
docker compose logs -f worker
```

### Step 10 — Configure Monitoring

Monitor:

- Web availability.
- Worker health.
- PostgreSQL availability.
- Redis availability.
- Queue backlog.
- Worker failures.
- Disk usage.
- RAM.
- CPU.
- Network.

Jangan hanya mengandalkan APIWatch untuk memonitor dirinya sendiri.

Gunakan external uptime monitoring untuk production website.

### Step 11 — Configure Backup

Minimal:

- Daily PostgreSQL backup.
- Retention 7–30 hari.
- Backup disimpan di luar VPS.
- Backup encryption.
- Restore procedure.

### Step 12 — Production Smoke Test

Test:

1. Landing page.
2. Register.
3. Login.
4. Create monitor.
5. Worker execution.
6. Monitoring history.
7. Email alert.
8. Webhook alert.
9. Pause/resume.
10. Delete monitor.
11. Logout.

### Step 13 — Generate Deployment Guide

Buat:

`docs/DEPLOYMENT_GUIDE.md`

### Step 14 — Generate Release Notes

Buat:

`docs/RELEASE_NOTES.md`

## 4. Required Commands

### Server Preparation

```
sudo apt update
sudo apt upgrade -y

sudo apt install -y git curl
```

Install Docker Engine dan Docker Compose Plugin mengikuti dokumentasi resmi Docker untuk Ubuntu.

Verifikasi:

```
docker --version
docker compose version
```

### Deployment

```
git clone <YOUR_REPOSITORY_URL>
cd apiwatch
```

Build:

```
docker compose build
```

Database migration:

```
docker compose run --rm web npx prisma migrate deploy
```

Start:

```
docker compose up -d
```

Inspect:

```
docker compose ps
docker compose logs -f
```

Restart:

```
docker compose restart web worker
```

Stop:

```
docker compose down
```

Jangan gunakan `docker compose down -v` pada production karena dapat menghapus persistent volumes.

## 5. AI Coding Assistant Prompt

```

Kamu bertindak sebagai Senior DevOps Engineer,
Production Engineer, dan Technical Lead.

PROJECT: APIWatch – API Monitoring

Dokumen utama:
PROJECT_PRD_AND_PLAYBOOK.md

Technical reference:
docs/TECHNICAL_PLAN.md

Test reference:
docs/TEST_REPORT.md

PHASE: 10 — Production Deployment & Release

TUJUAN:
Mempersiapkan APIWatch untuk production deployment.

ATURAN:

1. Baca PRD.
2. Baca TECHNICAL_PLAN.md.
3. Baca TEST_REPORT.md.
4. Pastikan seluruh release blockers selesai.
5. Gunakan deployment web application.
6. Gunakan Docker dan Docker Compose.
7. Pisahkan web dan worker services.
8. PostgreSQL harus memiliki persistent storage.
9. Redis tidak boleh public exposed.
10. Database tidak boleh public exposed.
11. Gunakan environment variables.
12. Jangan commit production secrets.
13. Gunakan HTTPS.
14. Gunakan reverse proxy.
15. Terapkan health checks.
16. Gunakan non-root containers.
17. Implementasikan graceful shutdown.
18. Siapkan backup strategy.
19. Siapkan rollback procedure.
20. Jangan menambahkan fitur baru.

IMPLEMENTASI:

A. PRODUCTION
- Production configuration.
- Environment validation.
- Dockerfile.
- Docker Compose.
- Web service.
- Worker service.
- PostgreSQL.
- Redis.
- Reverse proxy.

B. SECURITY
- Secret management.
- HTTPS.
- Firewall.
- Non-root container.
- Private database network.
- Private Redis network.
- Security headers.

C. DATABASE
- Production migration.
- Persistent volume.
- Backup.
- Restore instructions.

D. OPERATIONS
- Health checks.
- Logging.
- Restart policy.
- Worker health.
- Queue health.
- Resource monitoring.

E. RELEASE
- Smoke tests.
- Rollback procedure.
- Release notes.
- Deployment guide.

FILE WAJIB:

- Dockerfile
- docker-compose.yml
- .dockerignore
- docs/DEPLOYMENT_GUIDE.md
- docs/RELEASE_NOTES.md

ACCEPTANCE CRITERIA:

- Docker build berhasil.
- Web container berjalan.
- Worker container berjalan.
- PostgreSQL berjalan.
- Redis berjalan.
- Database migration berhasil.
- HTTPS tersedia.
- Health checks berfungsi.
- Backup procedure terdokumentasi.
- Rollback procedure terdokumentasi.
- Production smoke test berhasil.

Jangan mengklaim deployment berhasil
jika hanya melakukan local Docker testing.

Pisahkan:
- Local verification.
- Staging verification.
- Production verification.

Jangan membuat commit otomatis.
Jangan melanjutkan ke phase lain.

Berikan laporan release lengkap.

```

## 6. Expected Deliverables

- `Dockerfile`.
- `docker-compose.yml`.
- `.dockerignore`.
- Production environment template.
- Reverse proxy configuration.
- `docs/DEPLOYMENT_GUIDE.md`.
- `docs/RELEASE_NOTES.md`.
- Production smoke test report.

## 7. Acceptance Criteria

- Production configuration tersedia.
- Environment variables terdokumentasi.
- Dockerfile tersedia.
- Docker Compose berjalan.
- Web service berjalan.
- Worker service berjalan.
- PostgreSQL persistent.
- Redis berjalan.
- Database migration berhasil.
- Reverse proxy berjalan.
- Domain terhubung.
- HTTPS tersedia.
- Database tidak public exposed.
- Redis tidak public exposed.
- Health checks tersedia.
- Backup tersedia.
- Restore procedure terdokumentasi.
- Rollback procedure tersedia.
- Production smoke test berhasil.
- Deployment guide tersedia.
- Release notes tersedia.

## 8. Testing Requirements

Production smoke test:

| Test             | Expected Result    |
| ---------------- | ------------------ |
| Landing page     | HTTP 200           |
| Register         | Success            |
| Login            | Success            |
| Dashboard        | Accessible         |
| Create monitor   | Success            |
| Scheduled check  | Executed           |
| History          | Available          |
| Email alert      | Delivered          |
| Webhook alert    | Delivered          |
| Worker restart   | Recovers           |
| Database restart | Recovers           |
| HTTPS            | Valid certificate  |
| Backup           | Generated          |
| Restore          | Procedure verified |

## 9. Git Checkpoint

Setelah deployment configuration direview dan smoke test berhasil:

```
git add .
git commit -m "phase 10: production deployment"
```

Kemudian buat release tag:

```
git tag -a v1.0.0 -m "APIWatch MVP release"
git push origin main --tags
```

Catatan: Git commit dan release tag tidak membuktikan bahwa production deployment berhasil. Status deployment harus dilaporkan berdasarkan hasil aktual.

# PART C — GLOBAL AI CODING RULES

Bagian ini berlaku untuk seluruh 10 phase.

## C.1 General Development Context

Setiap AI Coding Assistant harus memahami:

```
Project:
APIWatch – API Monitoring

Main Document:
PROJECT_PRD_AND_PLAYBOOK.md

Technical Reference:
docs/TECHNICAL_PLAN.md

UI Reference:
docs/UI_UX_GUIDE.md

Testing Reference:
docs/TEST_REPORT.md

Tech Stack:
Next.js App Router
TypeScript
Tailwind CSS
shadcn/ui
PostgreSQL
Prisma
Redis
BullMQ
Better Auth
Node.js Worker

Development Approach:
Solo Developer
MVP First
Clean Architecture Pragmatic
Maintainable Code
Reusable Components
No Over-engineering
```

## C.2 Mandatory Rules

1. Baca PRD sebelum melakukan perubahan.
2. Baca technical plan jika sudah tersedia.
3. Baca UI guide untuk pekerjaan frontend.
4. Kerjakan hanya phase yang diminta.
5. Periksa kondisi project sebelum mengubah file.
6. Jangan menimpa pekerjaan sebelumnya tanpa alasan.
7. Jangan mengubah technology stack tanpa persetujuan.
8. Jangan menambahkan dependency tanpa kebutuhan.
9. Jangan membuat fitur di luar scope phase.
10. Jangan menggunakan mock data untuk production.
11. Jangan mengarang hasil testing.
12. Jalankan testing yang relevan.
13. Laporkan seluruh file yang dibuat dan diubah.
14. Laporkan dependency yang ditambahkan.
15. Jangan melanjutkan phase otomatis.
16. Jangan membuat Git commit otomatis.
17. Tunggu persetujuan developer.

## C.3 Architecture Rules

- Next.js menangani web application.
- Route Handlers menangani application API.
- PostgreSQL menjadi source of truth.
- Redis digunakan untuk background queue.
- BullMQ digunakan untuk asynchronous processing.
- Worker menjalankan monitoring engine.
- Business logic dipisahkan dari React components.
- Database access tidak dilakukan langsung dari client.
- Authentication dan authorization wajib dilakukan server-side.
- Jangan membuat microservices tanpa kebutuhan.

## C.4 Monitoring Engine Rules

- Semua monitoring request harus divalidasi.
- SSRF protection wajib.
- DNS rebinding protection wajib.
- Timeout wajib.
- Response body size limit wajib.
- Redirect harus divalidasi.
- Job harus idempotent.
- Alert harus asynchronous.
- Monitoring history harus persistent.
- Worker harus memiliki recovery mechanism.

## C.5 Code Quality Rules

Gunakan:

- TypeScript strict mode.
- Meaningful variable names.
- Small reusable functions.
- Explicit types.
- Consistent error handling.
- Input validation.
- Structured logging.
- Database indexing.
- Pagination.

Hindari:

- `any` tanpa alasan.
- Duplicate business logic.
- Giant components.
- Giant service files.
- Circular dependencies.
- Unnecessary abstractions.
- Hardcoded configuration.
- Silent error handling.

## C.6 AI Phase Report Format

Setiap phase wajib menghasilkan laporan:

```
PHASE REPORT

Phase:
Phase Name:

1. Summary
   - What was implemented.

2. Files Created
   - List of new files.

3. Files Modified
   - List of modified files.

4. Dependencies
   - Added dependencies.
   - Reason for each dependency.

5. Commands Executed
   - Actual commands.

6. Testing Results
   - PASS.
   - FAIL.
   - NOT TESTED.
   - BLOCKED.

7. Acceptance Criteria
   - Completed.
   - Not completed.

8. Known Issues
   - Remaining issues.

9. Git Status
   - Current branch.
   - Uncommitted changes.

10. Phase Status
    - COMPLETED.
    - NEEDS FIXES.
    - BLOCKED.

11. Next Step
    - Wait for developer approval.
```

# PART D — GIT & EXECUTION RULES

## D.1 Branch Strategy

Untuk solo developer, gunakan strategi sederhana.

```
main
 │
 ├── phase-1-bootstrap
 ├── phase-2-architecture
 ├── phase-3-ui-ux
 ├── phase-4-frontend-foundation
 ├── phase-5-core-frontend
 ├── phase-6-backend
 ├── phase-7-integration
 ├── phase-8-additional-features
 ├── phase-9-testing
 └── phase-10-production
```

Alternatif yang lebih sederhana: tetap menggunakan branch `main` dan commit setiap phase setelah review.

Untuk MVP solo developer, opsi kedua lebih praktis.

## D.2 Git Initialization

```
git init
git branch -M main
```

## D.3 Git Checkpoint Commands

Phase 1

```
git add .
git commit -m "phase 1: project bootstrap"
```

Phase 2

```
git add .
git commit -m "phase 2: technical architecture"
```

Phase 3

```
git add .
git commit -m "phase 3: ui ux planning"
```

Phase 4

```
git add .
git commit -m "phase 4: frontend foundation"
```

Phase 5

```
git add .
git commit -m "phase 5: core frontend features"
```

Phase 6

```
git add .
git commit -m "phase 6: backend implementation"
```

Phase 7

```
git add .
git commit -m "phase 7: frontend backend integration"
```

Phase 8

```
git add .
git commit -m "phase 8: additional features"
```

Phase 9

```
git add .
git commit -m "phase 9: testing and optimization"
```

Phase 10

```
git add .
git commit -m "phase 10: production deployment"
```

## D.4 Commit Rules

Jangan melakukan commit apabila:

- TypeScript error masih ada.
- Build gagal.
- Test wajib belum dijalankan.
- Acceptance criteria belum terpenuhi.
- Ada perubahan yang belum direview.
- Ada `.env` atau secret yang ikut ter-stage.

Periksa:

```
git status
git diff
git diff --cached
```

## D.5 Rollback Strategy

Jika suatu phase menyebabkan masalah:

```
git log --oneline
```

Untuk membatalkan commit yang sudah dipublikasikan:

```
git revert <commit-hash>
```

Untuk membuang perubahan lokal yang belum di-commit, lakukan hanya setelah memastikan tidak ada pekerjaan penting yang akan hilang.

# PART E — COMMAND CHEAT SHEET

Bagian ini merupakan referensi command yang digunakan selama pengembangan APIWatch.

## E.1 Development Environment

```
node -v
npm -v
git --version
docker --version
docker compose version
```

## E.2 Frontend Development

```
npm install
npm run dev
npm run build
npm run start
npm run lint
npx tsc --noEmit
```

## E.3 shadcn/ui

```
npx shadcn@latest init

npx shadcn@latest add button card input
npx shadcn@latest add dialog alert-dialog
npx shadcn@latest add table tabs badge
npx shadcn@latest add skeleton tooltip sheet
```

## E.4 Database & Prisma

```
npx prisma init

npx prisma generate

npx prisma migrate dev --name init

npx prisma migrate deploy

npx prisma studio

npx prisma validate
```

Untuk production, gunakan `migrate deploy`, bukan `migrate dev`.

## E.5 Worker Development

```
npm run worker:dev
```

Production:

```
npm run worker:start
```

Pastikan script production menjalankan hasil build JavaScript, bukan development watcher.

## E.6 Testing

```
npm test

npm run lint

npx tsc --noEmit

npm run build

npx playwright test

npm audit
```

## E.7 Docker

```
docker compose build

docker compose up -d

docker compose ps

docker compose logs -f

docker compose logs -f web

docker compose logs -f worker

docker compose restart web worker

docker compose down
```

## E.8 Git

```
git status

git add .

git commit -m "your commit message"

git log --oneline

git diff

git branch

git tag
```

## E.9 Useful Database Commands

Masuk PostgreSQL container:

```
docker compose exec postgres psql -U postgres -d apiwatch
```

Periksa tabel:

```
\dt
```

Periksa monitor:

```
SELECT id, name, url, status
FROM "Monitor";
```

Periksa monitoring history:

```
SELECT *
FROM "MonitorCheck"
ORDER BY "checkedAt" DESC
LIMIT 20;
```

Nama tabel dan kolom harus disesuaikan dengan hasil Prisma migration.

# PART F — FINAL CHECKLIST & DOCUMENTATION

## F.1 Project Documentation Structure

Pada akhir pengembangan, repository APIWatch diharapkan memiliki struktur dokumentasi berikut:

```
apiwatch/
│
├── PROJECT_PRD_AND_PLAYBOOK.md
│
├── docs/
│   ├── TECHNICAL_PLAN.md
│   ├── UI_UX_GUIDE.md
│   ├── TEST_REPORT.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── RELEASE_NOTES.md
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│
├── worker/
│
├── tests/
│
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## F.2 Documentation Requirements

| File                        | Description                        | Created In                 |
| --------------------------- | ---------------------------------- | -------------------------- |
| PROJECT_PRD_AND_PLAYBOOK.md | Main project specification         | Initial                    |
| TECHNICAL_PLAN.md           | Technical architecture             | Phase 2                    |
| UI_UX_GUIDE.md              | Design specification               | Phase 3                    |
| TEST_REPORT.md              | Testing and security report        | Phase 9                    |
| DEPLOYMENT_GUIDE.md         | Production deployment instructions | Phase 10                   |
| RELEASE_NOTES.md            | MVP release notes                  | Phase 10                   |
| README.md                   | Project introduction and setup     | Phase 1 / updated Phase 10 |

## F.3 README.md Requirements

README harus menjelaskan:

1. Project overview.
2. Main features.
3. Technology stack.
4. Prerequisites.
5. Local installation.
6. Environment variables.
7. Database setup.
8. Development commands.
9. Worker commands.
10. Testing commands.
11. Docker deployment.
12. Security considerations.
13. License.

Contoh struktur:

```
# APIWatch

API monitoring platform for developers.

## Features

- HTTP endpoint monitoring
- Response time tracking
- HTTP status validation
- Header validation
- Body validation
- Email alerts
- Webhook alerts
- Monitoring history

## Tech Stack

- Next.js
- TypeScript
- PostgreSQL
- Prisma
- Redis
- BullMQ

## Getting Started

Installation instructions...

## Development

Frontend:
npm run dev

Worker:
npm run worker:dev

## Testing

npm test

## Deployment

See docs/DEPLOYMENT_GUIDE.md
```

## F.4 Final MVP Checklist

Gunakan checklist berikut untuk memastikan APIWatch benar-benar siap digunakan.

APIWatch MVP Readiness

# 0%

0 dari 58 checklist selesai

Project Foundation

0/5

Next.js berjalan dengan baik

TypeScript strict mode aktif

Tailwind CSS dan shadcn/ui berfungsi

Git repository tersedia

Environment configuration tersedia

Authentication

0/5

Register berfungsi

Login berfungsi

Logout berfungsi

Session management aman

User data isolation berjalan

Monitor Management

0/6

Create monitor berfungsi

Monitor list berfungsi

Monitor detail berfungsi

Update monitor berfungsi

Delete monitor berfungsi

Pause dan resume berfungsi

Monitoring Engine

0/11

Scheduler berjalan

BullMQ berjalan

HTTP checks berjalan

HTTP status validation berfungsi

Response time terukur

Header validation berfungsi

Body validation berfungsi

Timeout berjalan

Response size limit berjalan

SSRF protection teruji

DNS rebinding protection teruji

History & Alerts

0/7

Monitoring history tersimpan

Uptime calculation benar

Response time summary tersedia

Email alert berjalan

Webhook alert berjalan

Recovery alert berjalan

Alert deduplication berjalan

Frontend Integration

0/6

Dashboard menggunakan real data

Monitor CRUD terintegrasi

History terintegrasi

Alert settings terintegrasi

Tidak ada mock production data

Loading dan error states tersedia

Quality Assurance

0/8

Unit tests berhasil

Integration tests berhasil

E2E tests berhasil

TypeScript check berhasil

Lint berhasil

Production build berhasil

Security audit selesai

Responsive testing selesai

Production

0/10

Docker build berhasil

Web dan worker berjalan

PostgreSQL persistent

Redis berjalan

Domain dan HTTPS tersedia

Database backup tersedia

Restore procedure tersedia

Monitoring infrastruktur tersedia

Production smoke test berhasil

Deployment documentation tersedia

Checklist interaktif untuk tracking progress.

Reset

## F.5 Final Release Criteria

APIWatch MVP baru dapat dinyatakan siap release apabila:

1. Semua P0 features telah diimplementasikan.
2. Semua critical acceptance criteria terpenuhi.
3. Tidak ada known critical security vulnerability.
4. SSRF protection telah diuji.
5. Worker berjalan secara stabil.
6. Monitoring history tersimpan dengan benar.
7. Alert notification berjalan.
8. User isolation terjamin.
9. Production deployment berhasil.
10. Backup dan recovery procedure tersedia.

## F.6 Recommended MVP Release Scope

Untuk menghindari development yang terlalu lama, prioritaskan release pertama sebagai berikut:

APIWatch v1.0.0

MVP Release

Core features

- User authentication.
- Dashboard monitoring.
- Endpoint CRUD.
- Scheduled HTTP monitoring.
- HTTP status validation.
- Response time measurement.
- Header validation.
- Body validation.
- Monitoring history.
- Email notification.
- Webhook notification.
- Uptime summary.

  Technical foundation

- Next.js application.
- PostgreSQL database.
- Redis + BullMQ.
- Dedicated Node.js worker.
- Docker deployment.
- SSRF protection.
- Basic logging and backup.

  Deferred

- Multi-region monitoring.
- Team collaboration.
- Advanced analytics.
- AI insights.
- Payment gateway.
- Advanced incident management.

# PROJECT EXECUTION STRATEGY

## Recommended development order

Meskipun dokumen memiliki 10 phase, implementasi sebaiknya dilakukan secara bertahap berdasarkan dependency.

| Phase | Fokus              | Output utama           |
| ----- | ------------------ | ---------------------- |
| 1     | Bootstrap          | Running Next.js        |
| 2     | Architecture       | Technical plan         |
| 3     | Design             | UI/UX guide            |
| 4     | Foundation         | Application shell      |
| 5     | Frontend           | Core UI                |
| 6     | Backend            | Monitoring engine      |
| 7     | Integration        | End-to-end application |
| 8     | Product completion | P1 features            |
| 9     | QA                 | Test report            |
| 10    | Release            | Production application |

## Important technical decisions

Ada lima keputusan teknis yang paling penting dalam project APIWatch:

1\. Jangan menjalankan monitoring engine di Next.js Route Handlers.

Gunakan dedicated Node.js worker. Pemeriksaan endpoint adalah pekerjaan background yang membutuhkan scheduling, concurrency, retry, dan recovery.

2\. PostgreSQL menjadi sumber kebenaran jadwal monitoring.

Redis/BullMQ menangani eksekusi job, sedangkan PostgreSQL mempertahankan data monitor, jadwal, dan status pekerjaan agar dapat direkonsiliasi ketika terjadi restart.

3\. SSRF protection harus menjadi prioritas sejak Phase 6.

APIWatch menerima URL dari pengguna dan melakukan request ke URL tersebut. Ini berpotensi membahayakan server jika tidak dibatasi dengan benar. DNS pinning, private IP blocking, redirect validation, dan egress restrictions bukan fitur opsional.

4\. Jangan terlalu cepat mengembangkan fitur P1 dan P2.

Pastikan monitoring engine, history, dan alert bekerja terlebih dahulu. Ketiganya merupakan inti nilai produk.

5\. Gunakan Docker Compose untuk deployment awal.

Tidak perlu Kubernetes, microservices, atau distributed infrastructure pada MVP. Satu VPS dengan web, worker, PostgreSQL, dan Redis sudah cukup untuk memulai, selama kapasitas dan keamanan dikonfigurasi dengan benar.

## APIWatch — Development Ready

Documentation Complete

Dokumen ini menjadi single source of truth untuk pengembangan APIWatch.

Aturan terakhir:

- Selesaikan satu phase dalam satu waktu.
- Jalankan prompt phase secara terpisah.
- Verifikasi hasil aktual.
- Review kode sebelum commit.
- Jangan melanjutkan phase tanpa persetujuan.
- Perbarui technical documentation jika terdapat perubahan arsitektur yang disetujui.

Target akhir: APIWatch v1.0.0 — A production-ready API monitoring SaaS MVP.

Dokumen ini siap disimpan sebagai `PROJECT_PRD_AND_PLAYBOOK.md` di root repository APIWatch.
