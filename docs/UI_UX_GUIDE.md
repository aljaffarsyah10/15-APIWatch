# UI/UX DESIGN GUIDE & DESIGN SYSTEM — APIWatch

> **Document Version**: 1.0  
> **Status**: Final (Phase 3 Deliverable)  
> **Date**: November 2026  
> **Author**: Senior UI/UX Designer & Frontend Architect  
> **Target Project**: APIWatch — Continuous API Monitoring Platform

---

## 1. Design Direction & Brand Identity

APIWatch dirancang khusus untuk kalangan software engineer, DevOps, and tech founders dengan filosofi **"Developer-First, High-Density, Zero-Fluff"**. 

### Karakteristik Visual Utama:
- **Clean & Minimalist**: Menghilangkan ornamen visual yang tidak fungsional. Mengutamakan hierarki data dan kecepatan membaca informasi.
- **Data-Oriented & Technical**: Menampilkan URL, HTTP status code, response time (ms), dan timestamp ISO secara presisi dengan tipografi monospace.
- **High Information Density**: Menampilkan metrik kesehatan sistem secara padat namun nyaman dibaca melalui kontras tinggi dan whitespace yang proporsional.
- **Accessible & Consistent**: Mematuhi standar kontras WCAG AA, mendukung dark mode secara native dengan palet warna Slate/Neutral, serta menyediakan indikator visual ganda (warna + ikon + label teks) untuk aksesibilitas pengguna color-blind.

---

## 2. Design Tokens

### 2.1 Color Palette & Semantic Roles

Design tokens APIWatch diintegrasikan dengan CSS variables Tailwind v4 dan shadcn/ui.

| Token | Light Mode (OKLCH / Hex) | Dark Mode (OKLCH / Hex) | Deskripsi Penggunaan |
| :--- | :--- | :--- | :--- |
| **`--background`** | `oklch(1 0 0)` / `#FFFFFF` | `oklch(0.145 0 0)` / `#09090B` | Latar belakang kanvas aplikasi |
| **`--foreground`** | `oklch(0.145 0 0)` / `#09090B` | `oklch(0.985 0 0)` / `#F4F4F5` | Teks utama / heading |
| **`--card`** | `oklch(1 0 0)` / `#FFFFFF` | `oklch(0.205 0 0)` / `#18181B` | Permukaan kartu metrik dan kontainer panel |
| **`--card-foreground`**| `oklch(0.145 0 0)` / `#09090B` | `oklch(0.985 0 0)` / `#F4F4F5` | Teks di dalam kartu |
| **`--primary`** | `oklch(0.205 0 0)` / `#18181B` | `oklch(0.985 0 0)` / `#FAFAFA` | Aksi utama, CTA, dan seleksi aktif |
| **`--primary-foreground`**| `oklch(0.985 0 0)` / `#FAFAFA` | `oklch(0.205 0 0)` / `#18181B` | Teks pada elemen primary |
| **`--muted`** | `oklch(0.97 0 0)` / `#F4F4F5` | `oklch(0.269 0 0)` / `#27272A` | Background sekunder, border pembagi |
| **`--muted-foreground`**| `oklch(0.556 0 0)` / `#71717A` | `oklch(0.708 0 0)` / `#A1A1AA` | Subtitle, metadata, label non-aktif |
| **`--border`** | `oklch(0.922 0 0)` / `#E4E4E7` | `oklch(0.269 0 0)` / `#27272A` | Garis tepi tabel, divider, kartu |

### 2.2 Status Color Tokens

| Monitor Status | Hex (Light) | Hex (Dark) | Badge Style | Semantik |
| :--- | :--- | :--- | :--- | :--- |
| **`UP`** | `#16A34A` (Green 600) | `#22C55E` (Green 500) | `bg-emerald-500/10 text-emerald-600 border-emerald-500/20` | Endpoint sehat, assertions lolos |
| **`DOWN`** | `#DC2626` (Red 600) | `#EF4444` (Red 500) | `bg-rose-500/10 text-rose-600 border-rose-500/20` | Endpoint gagal, timeout, atau assertion mismatch |
| **`PAUSED`** | `#4B5563` (Gray 600) | `#9CA3AF` (Gray 400) | `bg-zinc-500/10 text-zinc-600 border-zinc-500/20` | Pemeriksaan dihentikan sementara oleh user |
| **`UNKNOWN`** | `#6B7280` (Neutral 500) | `#A3A3A3` (Neutral 400)| `bg-slate-500/10 text-slate-600 border-slate-500/20` | Baru dibuat, belum ada eksekusi check |

### 2.3 Typography Scale

- **Font Sans**: `Geist Sans`, `-apple-system`, `BlinkMacSystemFont`, `Inter`, `Segoe UI`, `sans-serif`
- **Font Mono**: `Geist Mono`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `monospace`

| Style Token | Ukuran / Line-Height | Weight | Tracking | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| `text-3xl font-bold` | `30px / 36px` | 700 | `-0.025em` | Page Title (Dashboard, Monitor Detail) |
| `text-2xl font-semibold` | `24px / 32px` | 600 | `-0.02em` | Section Title, Card Headers |
| `text-xl font-semibold` | `20px / 28px` | 600 | `-0.015em` | Modal Dialog Title, Subsections |
| `text-base` | `16px / 24px` | 400 / 500 | Normal | Body text, Form inputs, Standard text |
| `text-sm` | `14px / 20px` | 400 / 500 | Normal | Sidebar links, Table cells, Button labels |
| `text-xs` | `12px / 16px` | 500 | `+0.01em` | Badges, Timestamps, Helper text, Meta labels |
| `font-mono text-xs/sm` | `12px - 14px` | 400 / 500 | Normal | URLs, HTTP Methods, JSON body, Status codes |

### 2.4 Spacing & Sizing Scale

Mengikuti basis kelipatan **4px**:
- `space-1`: 4px (Jarak mikro antara icon dan label)
- `space-2`: 8px (Padding badge, gap flexbox kecil)
- `space-3`: 12px (Padding button kompak, gap input field)
- `space-4`: 16px (Padding standar kartu, margin vertikal dasar)
- `space-6`: 24px (Padding kartu besar, grid gap antar kartu metrik)
- `space-8`: 32px (Margin section halaman)
- `space-12`: 48px (Jarak vertikal header ke konten)

### 2.5 Border Radius & Shadows
- **`rounded-md`**: 6px (Input fields, table headers, filter badges)
- **`rounded-lg`**: 8px (Buttons, modal action triggers, small cards)
- **`rounded-xl`**: 12px (Dashboard metric cards, summary panels)
- **`shadow-sm`**: Border tipis (`border border-border`) dengan bayangan halus `0 1px 2px 0 rgb(0 0 0 / 0.05)` untuk seluruh kartu dashboard.

---

## 3. Application Layout & Navigation System

Sistem navigasi dibagi ke dalam dua shell utama: **Public Marketing Shell** dan **Authenticated Dashboard Shell**.

### 3.1 Public Marketing Shell
- **Header**: Logo APIWatch dengan icon `Activity`, link ke `#features`, `#architecture`, tombol `Sign In`, dan CTA `Get Started`.
- **Content Area**: Container lebar maksimal `1200px` dengan padding horizontal responsif.
- **Footer**: Link dokumentasi, status sistem, copyright.

### 3.2 Dashboard Shell Architecture

```
+-------------------------------------------------------------------------------+
| AppSidebar (240px) | AppHeader (h-14, border-b)                               |
| [APIWatch Logo]    | Breadcrumbs | Status Pill | [Theme Toggle] [User Menu]   |
|                    +----------------------------------------------------------+
| Nav Links:         | Content Area (max-w-7xl, p-6 / p-8)                      |
| - Dashboard        |                                                          |
| - Monitors         | [Page Title & Action Buttons]                            |
| - Add Monitor      |                                                          |
| - Alert Channels   | [Grid Summary Cards]                                     |
| - Settings         |                                                          |
|                    | [Main Content Tabs / Data Table / Recharts Area]         |
| Bottom:            |                                                          |
| [User Profile /    |                                                          |
|  Logout Button]    |                                                          |
+--------------------+----------------------------------------------------------+
```

### 3.3 Sidebar Specification (`AppSidebar`)
- **Lebar Desktop**: `240px` fixed, sticky kiri `h-screen`, `border-r border-border`.
- **Navigasi Items**:
  - `Dashboard`: Icon `LayoutDashboard`, rute `/dashboard`.
  - `Monitors`: Icon `Activity`, rute `/monitors`.
  - `Add Monitor`: Icon `PlusCircle`, rute `/monitors/new`.
  - `Alert Channels`: Icon `Bell`, rute `/settings/alerts`.
  - `Settings`: Icon `Settings`, rute `/settings`.
- **Active State**: Background `bg-secondary` atau `bg-primary/10`, teks `text-primary font-medium`.
- **User Footer**: Menampilkan inisial avatar pengguna, nama, email, dan tombol dropdown Logout.

### 3.4 Header Specification (`AppHeader`)
- **Tinggi**: `56px` (`h-14`), sticky atas dengan efek `backdrop-blur-md bg-background/80`.
- **Elemen Kiri**: Tombol hamburger drawer (khusus mobile/tablet), breadcrumb rute (contoh: `Dashboard > Monitors > Payment Gateway`).
- **Elemen Kanan**:
  - Live system status badge: `● Engine Operational` (hijau).
  - User quick menu: Dropdown profil dan tombol Logout.

---

## 4. Page Specifications (P0 Pages)

### 4.1 Dashboard Overview (`/dashboard`)
Tujuan: Memberikan visibilitas menyeluruh kondisi kesehatan semua API yang dipantau dalam satu layar.

1. **Top Metric Cards (Grid 4 Kolom)**:
   - **Total Monitors**: Jumlah total monitor yang terdaftar.
   - **Operational (UP)**: Jumlah monitor aktif berstatus sehat (hijau).
   - **Degraded / DOWN**: Jumlah monitor yang saat ini mengalami error (merah dengan indikator alert jika > 0).
   - **Average Latency**: Rata-rata response time 24 jam terakhir (dalam ms) dengan badge performa.
2. **Main Section (2 Kolom 70:30)**:
   - **Kolom Kiri (70%)**:
     - *Response Time Trend*: Grafik Recharts AreaChart (24 jam terakhir) dengan tooltip interaktif.
     - *Quick Monitor Status*: Tabel 5 monitor terakhir dengan status badge, response time, dan tombol cepat ke halaman detail.
   - **Kolom Kanan (30%)**:
     - *Recent Incidents Card*: Daftar kejadian transisi error (kapan terjadi, endpoint mana, alasan kegagalan).
     - *Empty Incident State*: Menampilkan ikon `CheckCircle2` hijau: *"All monitored systems are operational. No active incidents."*

---

### 4.2 Monitor List (`/monitors`)
Tujuan: Mengelola, memfilter, dan mencari seluruh endpoint pemantauan.

1. **Toolbar Header**:
   - Judul halaman: `Monitors` dengan counter total `(12)`.
   - Tombol aksi utama: `+ Add Monitor` (Primary button).
2. **Filter & Search Bar**:
   - Kolom pencarian teks (`Input`): Mencari berdasarkan nama monitor atau URL.
   - Filter Status (`Tabs` / `Select`): `All`, `UP`, `DOWN`, `PAUSED`.
   - Filter HTTP Method (`Select`): `All Methods`, `GET`, `POST`, `PUT`, `DELETE`.
3. **Data Table (`Table` Component)**:
   - **Kolom 1 - Status**: `MonitorStatusBadge` (UP / DOWN / PAUSED / UNKNOWN).
   - **Kolom 2 - Name & Target**: Nama tebal, URL monospace abu-abu di bawahnya.
   - **Kolom 3 - Method**: Method badge monospace (misal: `GET` outline, `POST` secondary).
   - **Kolom 4 - Interval**: Format teks singkat (`1m`, `5m`, `15m`).
   - **Kolom 5 - Response Time**: Nilai ms terakhir dengan indikator warna latency (`< 300ms` hijau, `300-1000ms` kuning, `> 1000ms` merah).
   - **Kolom 6 - Last Check**: Format waktu relatif (`2 mins ago`).
   - **Kolom 7 - Actions**: Dropdown menu (`...`):
     - `View Details`
     - `Pause` / `Resume`
     - `Edit Configuration`
     - `Delete` (Warna merah dengan dialog konfirmasi)
4. **Pagination Controls**: Navigasi halaman sebelumnya/berikutnya dengan indikator baris per halaman.

---

### 4.3 Create & Edit Monitor Form (`/monitors/new` & `/monitors/[id]/edit`)
Tujuan: Konfigurasi komprehensif endpoint monitoring dengan validasi instan.

Formulir dirancang dalam layout kartu terstruktur (*card sections*):

#### Section 1: Basic Information
- **Name**: Text input (Contoh: `User Authentication Service`).
- **Endpoint URL**: Input URL dengan prefix validasi (Hanya mengizinkan `http://` dan `https://`). Teks panduan: *"Private network and localhost addresses are strictly forbidden."*
- **HTTP Method**: Dropdown select (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`).

#### Section 2: Request Configuration (Muncul dinamis jika method POST/PUT/PATCH)
- **Custom Headers**: Dynamic Key-Value list dengan tombol `+ Add Header`.
  - Header otomatis terenkripsi saat disimpan di backend jika mengandung authorization.
- **Request Body**: Textarea code editor monospace (JSON formatted) dengan validasi syntax client-side.

#### Section 3: Expected Response & Assertions
- **Expected Status Codes**: Tag input multi-value (Default: `200`, opsi penambahan: `201`, `204`).
- **Header Assertions**: Key-Value assertion (Contoh: `content-type` equals `application/json`).
- **Body Assertion**:
  - Dropdown operator: `None`, `Contains Substring`, `Exact Text Match`, `JSON Path Value`.
  - Field target path & value jika JSON Path dipilih (Contoh: Path `data.status`, Value `healthy`).

#### Section 4: Schedule & Timeout Configuration
- **Check Interval**: Dropdown pilihan terstandarisasi (`1 minute`, `5 minutes`, `15 minutes`, `30 minutes`, `60 minutes`).
- **Request Timeout**: Number input dalam milidetik (Default: `10000 ms` / 10s; Min: `1000 ms`, Max: `30000 ms`).

#### Actions Bar:
- Tombol `Cancel` (Kembali ke daftar monitor).
- Tombol `Save Monitor` (Menjalankan Zod schema validation dan menampilkan spinner saat submit).

---

### 4.4 Monitor Detail (`/monitors/[id]`)
Tujuan: Menyajikan riwayat mendalam, metrik performa historis, dan status kontrol endpoint tertentu.

1. **Header Panel**:
   - Status badge besar dengan indikator denyut (*pulse animation*).
   - Nama monitor, URL target, method, dan interval aktif.
   - Button Group: `Check Now` (Manual check), `Pause`/`Resume`, `Edit`, `Delete`.
2. **Aggregated Stats (3 Kartu Metrik)**:
   - **Uptime (24h / 7d / 30d)**: Persentase uptime dihitung dengan formula PRD.
   - **Avg Response Time**: Rata-rata durasi (ms).
   - **Last Status Change**: Kapan status terakhir berubah (*Contoh: UP since 3 days ago*).
3. **Response Time Analytics (Recharts)**:
   - Visualisasi line/area chart interaktif dengan sumbu X waktu dan sumbu Y latensi (ms).
   - Garis ambang batas timeout (merah putus-putus) untuk perbandingan visual.
4. **Monitoring Checks History Table**:
   - Kolom: Checked At, Check Status, HTTP Status, Response Time, Validation Details, Failure Reason.
   - Baris yang gagal menampilkan badge merah dengan tombol expandable accordion untuk membaca rincian *failure reason* (misalnya: *Header 'content-type' expected 'application/json' but received 'text/html'*).

---

### 4.5 Alert Settings (`/settings/alerts`)
Tujuan: Mengonfigurasi kanal tujuan notifikasi jika monitor mengalami downtime atau recovery.

1. **Header**: Penjelasan sistem alert: *"Alerts are dispatched when an endpoint transitions from UP to DOWN, and when it recovers back to UP."*
2. **Configured Channels List**:
   - Kartu kanal aktif dengan toggle switch `Active / Inactive`.
   - **Email Channel**: Menampilkan alamat email penerima.
   - **Webhook Channel**: Menampilkan target URL webhook dengan badge status `Encrypted Secret`.
3. **Add Channel Modal (`Dialog`)**:
   - Pilihan Tipe: `Email` atau `Webhook`.
   - Field Email: Email input dengan validasi format.
   - Field Webhook: URL target webhook, secret signing string opsional.
   - Tombol `Save Channel`.

---

## 5. UI Component Inventory (shadcn/ui Foundation)

| Komponen | Kegunaan Spesifik | Status di Proyek |
| :--- | :--- | :--- |
| **`Button`** | Aksi primer, sekunder, ghost pada toolbar dan form submit | Terpasang (`src/components/ui/button.tsx`) |
| **`Card`** | Kontainer metrik, formulir konfigurasi, dan preview status | Terpasang (`src/components/ui/card.tsx`) |
| **`Badge`** | Status indicator (`UP`, `DOWN`, `PAUSED`), HTTP method | Terpasang (`src/components/ui/badge.tsx`) |
| **`Input`** | Form input URL, nama, search bar, timeout | Terpasang (`src/components/ui/input.tsx`) |
| **`Label`** | Form field label yang aksesibel | Terpasang (`src/components/ui/label.tsx`) |
| **`Table`** | Daftar monitor dan tabel riwayat pemeriksaan | Direncanakan Phase 4 |
| **`Dialog`** | Modal popup tambah alert channel | Direncanakan Phase 4 |
| **`AlertDialog`** | Konfirmasi destruktif (penghapusan monitor) | Direncanakan Phase 4 |
| **`Tabs`** | Filter status monitor dan navigasi tab detail | Direncanakan Phase 4 |
| **`Skeleton`** | Placeholder loading state kartu dan tabel | Direncanakan Phase 4 |
| **`Select`** | Dropdown pilihan HTTP Method dan interval penjadwalan | Direncanakan Phase 4 |
| **`Toast` (Sonner)** | Notifikasi feedback instan hasil aksi mutasi | Direncanakan Phase 4 |

---

## 6. Shared Custom Components Specification

### 6.1 `MonitorStatusBadge`
Menampilkan status kesehatan monitor secara konsisten di seluruh antarmuka:
- `UP`: Background `bg-emerald-500/10`, teks `text-emerald-600 dark:text-emerald-400`, border `border-emerald-500/20`, icon `CheckCircle2` (14px).
- `DOWN`: Background `bg-rose-500/10`, teks `text-rose-600 dark:text-rose-400`, border `border-rose-500/20`, icon `AlertTriangle` (14px).
- `PAUSED`: Background `bg-zinc-500/10`, teks `text-zinc-600 dark:text-zinc-400`, border `border-zinc-500/20`, icon `PauseCircle` (14px).
- `UNKNOWN`: Background `bg-slate-500/10`, teks `text-slate-600 dark:text-slate-400`, border `border-slate-500/20`, icon `HelpCircle` (14px).

### 6.2 `ResponseTimeBadge`
Menampilkan nilai waktu tanggap dengan indikator efisiensi performa:
- `< 300 ms`: `text-emerald-600 dark:text-emerald-400` (Fast / Optimal)
- `300 - 1000 ms`: `text-amber-600 dark:text-amber-400` (Acceptable)
- `> 1000 ms`: `text-rose-600 dark:text-rose-400 font-semibold` (Degraded / Slow)

### 6.3 `ConfirmDialog`
Komponen dialog berbasis `AlertDialog` shadcn/ui untuk konfirmasi aksi berbahaya:
- Judul: *"Are you absolutely sure?"*
- Pesan: Menjelaskan dampak permanen (misal: riwayat pemeriksaan akan terhapus dan background worker akan membatalkan pemeriksaan).
- Aksi Pembatalan: Tombol `Cancel` (Outline).
- Aksi Konfirmasi: Tombol `Delete` dengan varian `destructive` (Merah).

---

## 7. UI States Specifications

Setiap tampilan yang melakukan konsumsi data wajib mengimplementasikan 5 status antarmuka:

### 7.1 Loading State
- Dilarang menggunakan fullscreen blocking spinner yang mengganggu navigasi.
- Menggunakan **Skeleton Layout** yang memiliki dimensi sama dengan elemen asli:
  - Kartu metrik menampilkan 4 kotak skeleton abu-abu berpulsasi.
  - Tabel menampilkan 5 baris skeleton dengan kolom status, URL, dan response time.

### 7.2 Empty State
- Ditampilkan saat koleksi data bernilai kosong (misal pengguna baru belum membuat monitor).
- Komponen memuat:
  - Icon ilustratif bertema teknis (misal: icon `Activity` atau `ServerOff` abu-abu lembut).
  - Judul ramah: *"No monitors configured yet"*.
  - Deskripsi panduan: *"Add your first HTTP endpoint to track availability, latency, and uptime automatically."*
  - Tombol aksi utama: `+ Add Your First Monitor`.

### 7.3 Error State
- Ditampilkan jika request gagal (misal koneksi jaringan putus atau server mengembalikan HTTP 500).
- Komponen memuat:
  - Alert panel dengan border merah lembut.
  - Pesan error human-readable: *"Failed to load monitoring history. Please check your network connection."*
  - Tombol aksi pemulihan: `Try Again` (Menjalankan re-fetch data).

### 7.4 Success State
- Memberikan kepastian visual setelah aksi user (Create, Update, Pause, Delete).
- Menggunakan **Sonner Toast**:
  - Toast mengambang di sudut kanan bawah dengan icon checklist hijau.
  - Teks deskriptif ringkas: *"Monitor created successfully"*. Durasi tampil: 3 detik.

---

## 8. Responsive Breakpoint Behavior

| Breakpoint | Target Layar | Perilaku Antarmuka |
| :--- | :--- | :--- |
| **Desktop (`≥ 1024px`)** | Monitor Laptop & Desktop | Full sidebar tetap di kiri (lebar 240px); grid metrik 4 kolom; tabel data menampilkan seluruh kolom; grafik chart lebar penuh. |
| **Tablet (`768px - 1023px`)** | iPad & Tablet Vertikal | Sidebar menciut (*collapsed icon-only mode*) atau berubah menjadi overlay drawer; grid metrik menjadi 2 kolom x 2 baris; tabel menyembunyikan kolom interval untuk menghemat ruang horizontal. |
| **Mobile (`< 768px`)** | Smartphone | Sidebar tersembunyi sepenuhnya, diakses via hamburger menu di header; grid metrik ditumpuk menjadi 1 kolom vertikal; tabel monitor bertransformasi menjadi kartu ringkas (*card list layout*); chart menyesuaikan tinggi menjadi 200px. |

---

## 9. Accessibility & Visual Review Checklist

- [x] Kontras teks terhadap latar belakang memenuhi standar WCAG AA (Rasio kontras minimum 4.5:1).
- [x] Semua status monitor memiliki ikon unik pendamping warna (tidak hanya mengandalkan persepsi warna).
- [x] Elemen interaktif (Button, Input, Dropdown) memiliki `focus-visible:ring-2` yang jelas untuk navigasi keyboard.
- [x] Seluruh form field terhubung dengan `<Label htmlFor="...">` yang valid.
- [x] Komponen konfirmasi destruktif melindungi pengguna dari ketidaksengajaan penghapusan data.

---

*Dokumen panduan UI/UX ini mengikat seluruh pengerjaan antarmuka pada Phase 4 (Frontend Foundation & Shell) dan Phase 5 (Core Frontend Features).*
