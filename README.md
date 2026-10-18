# Wire & Wagon — 1900s Logistics & Expedition Management System

Selamat datang di repositori resmi **Wire & Wagon**, sebuah sistem manajemen logistik, ekspedisi, dan pengiriman kargo full-stack yang mengusung tema **Revolusi Industri Era 1900-an (Telegraph & Steam-Powered Freight)**.

Proyek ini dibangun menggunakan arsitektur monorepo modular yang memisahkan antara backend API service dan client interface secara bersih dan terstruktur.

---

## 📑 Daftar Isi
1. [Tentang Sistem & Latar Belakang](#tentang-sistem--latar-belakang)
2. [Arsitektur Monorepo](#arsitektur-monorepo)
3. [Teknologi Utama (Tech Stack)](#teknologi-utama-tech-stack)
4. [Prasyarat Sistem](#prasyarat-sistem)
5. [Panduan Instalasi & Menjalankan Aplikasi](#panduan-instalasi--menjalankan-aplikasi)
6. [Daftar Kredensial Akun Percobaan (Demo Accounts)](#daftar-kredensial-akun-percobaan-demo-accounts)
7. [Alur Operasional Ekspedisi (The "ACC" Journey)](#alur-operasional-ekspedisi-the-acc-journey)
8. [Struktur Dokumentasi Terkait](#struktur-dokumentasi-terkait)

---

## 🚂 Tentang Sistem & Latar Belakang

Pada permulaan abad ke-20 (era 1900-an), ekspedisi barang bertransformasi drastis dengan hadirnya jaringan telegraf kabel kawat (*wire*) dan armada lokomotif serta gerobak uap (*wagon*). **Wire & Wagon** mendigitalisasi proses kerja stasiun ekspedisi masa itu ke dalam web application modern:
- **Pelanggan / Saudagar (Client)** memesan pengiriman komoditas (misal: bal kapas, suku cadang kuningan, rempah-rempah) melalui jaringan telegraf.
- **Kasir (Admin)** memverifikasi pembayaran faktur di kantor perbendaharaan stasiun.
- **Kepala Stasiun (Manager)** mengalokasikan armada kendaraan (sepeda onthel, gerobak kuda, truk uap, lokomotif uap, atau kapal uap sungai) dan menetapkan tarif per kilometer.
- **Inspektur Lapangan (Supervisor)** menugaskan kurir stasiun untuk melakukan pengiriman.
- **Sistem Otorisasi Ganda (Dual-ACC)**: Kurir dan Klien wajib sama-sama mengirimkan bukti foto serah-terima fisik di stasiun tujuan sebelum barang dinyatakan sampai.
- **Pemeriksaan Lapangan & Tutup Buku**: Supervisor memeriksa bukti kedua belah pihak secara berdampingan (*side-by-side*), dan Manager melakukan ACC finalisasi tutup buku perbendaharaan.

---

## 📁 Arsitektur Monorepo

```text
wire_n_wagon/
├── README.md                      # Panduan utama sistem monorepo (berkas ini)
├── docs/
│   └── README.md                  # Dokumentasi mendalam RBAC, Skema Database, & 23 Endpoints
└── apps/
    ├── api/                       # Backend RESTful API Service
    │   ├── README.md              # Panduan teknis backend, env, database, & migrasi
    │   ├── config/                # Konfigurasi database & strategi Passport.js
    │   ├── controllers/           # Logika bisnis (Auth, User, Vehicle, Order, ACC)
    │   ├── helpers/               # Helper hashing bcrypt & sign/verify JWT
    │   ├── middlewares/           # Middleware autentikasi JWT & otorisasi Role
    │   ├── migrations/            # Skema migrasi Sequelize (User, Vehicle, Order)
    │   ├── models/                # Definisi model Sequelize & relasi asosiasi
    │   ├── seeders/               # Data awal 6 user & 5 armada kendaraan 1900-an
    │   ├── routes/                # Pemetaan router API per modul
    │   ├── .env.example           # Template environment variable
    │   ├── .sequelizerc           # Konfigurasi path sequelize-cli
    │   ├── package.json           # Dependensi Node.js backend
    │   └── app.js                 # Entry point Express server
    │
    └── interface/                 # Frontend Web Client
        ├── README.md              # Panduan teknis frontend Vite & Tailwind v4
        ├── public/                # Aset statis (background.png, compass.png, logo.png, dll.)
        ├── src/
        │   ├── api/               # Axios & Service modul (auth, order, vehicle, user, acc)
        │   ├── app/               # Root App.jsx, context/AuthContext, routes/ (createBrowserRouter)
        │   ├── components/        # UI components (Navbar, ProtectedRoute, StatusBadge)
        │   ├── constants/         # Konstanta role, status, route types, demo credentials
        │   ├── helpers/           # Helper formatters (formatCurrency, formatDate)
        │   ├── hooks/             # Custom hooks (useAuth)
        │   ├── pages/             # Halaman Login, Register, Unauthorized & 6 Dashboards
        │   ├── index.css          # Desain tema vintage 1900-an (@import "tailwindcss";)
        │   └── main.jsx           # Entry point React DOM
        ├── index.html             # HTML template dengan tipografi klasik
        ├── vite.config.js         # Konfigurasi Vite & plugin Tailwind CSS v4
        └── package.json           # Dependensi React frontend
```

---

## 🛠️ Teknologi Utama (Tech Stack)

### Backend (`apps/api`)
- **Runtime:** Node.js (v18+)
- **Web Framework:** Express.js v4
- **ORM & Database:** Sequelize v6 & `sequelize-cli` (PostgreSQL / SQLite)
- **Keamanan & Autentikasi:**
  - `passport` dengan strategi `passport-local` (verifikasi kredensial) & `passport-jwt` (proteksi route privat)
  - `bcrypt` / `bcryptjs` untuk enkripsi password (salt 10 rounds)
  - `jsonwebtoken` untuk pembuatan access token berbasis claims role
  - `cors` untuk mengizinkan request lintas domain

### Frontend (`apps/interface`)
- **Framework:** React 18
- **Build Tool:** Vite (Ultra-fast HMR)
- **Styling:** **Tailwind CSS v4** (Konfigurasi modern via `@tailwindcss/vite` & `@import "tailwindcss";`)
- **HTTP Client:** Axios dengan interceptor token otomatis
- **Routing:** React Router DOM v6 dengan `<ProtectedRoute>` berbasis matriks peran
- **Ikonografi:** Lucide React

---

## 💻 Prasyarat Sistem
Pastikan perangkat Anda telah terpasang:
1. **Node.js** (v18.0.0 atau versi LTS yang lebih baru)
2. **NPM** (v9.0.0 atau lebih baru)
3. **Database** (Opsional jika ingin menggunakan PostgreSQL lokal port 5432, atau langsung gunakan SQLite bawaan tanpa setup server database tambahan).

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

Jalankan backend dan frontend pada dua jendela terminal terpisah:

### Terminal 1: Backend API
```bash
# 1. Pindah ke direktori api
cd apps/api

# 2. Pasang dependensi backend
npm install

# 3. Salin konfigurasi environment
cp .env.example .env

# 4. Jalankan migrasi tabel database (Users, Vehicles, Orders)
npx sequelize-cli db:migrate

# 5. Jalankan seeder akun dan armada kendaraan
npx sequelize-cli db:seed:all

# 6. Nyalakan backend server (berjalan di http://localhost:3000)
npm run dev
```

### Terminal 2: Frontend Interface
```bash
# 1. Pindah ke direktori interface
cd apps/interface

# 2. Pasang dependensi frontend
npm install

# 3. Nyalakan dev server Vite (berjalan di http://localhost:5173)
npm run dev
```

Buka peramban Anda di **`http://localhost:5173`**.

---

## 🔑 Daftar Kredensial Akun Percobaan (Demo Accounts)

Untuk mempermudah pengujian alur 6 peran yang berbeda, database seeder menyediakan akun siap pakai dengan kata sandi (*password*) yang seragam: **`password123`**

| Username | Role | Tanggung Jawab & Akses Deck | Fitur Utama di Dashboard |
|---|---|---|---|
| **`client1`** | `client` | Saudagar / Pelanggan Pengirim | Buat kargo kawat baru, tracking nomor resi, batalkan pesanan, input URL bukti foto & **ACC Terima Barang**. |
| **`courier1`** | `courier` | Kurir Armada Lapangan | Terima waybill penugasan kargo, input URL foto serah terima & **ACC Selesai Tugas**. |
| **`admin1`** | `admin` | Kasir & Petugas Kantor Stasiun | Verifikasi pembayaran pesanan (**Verifikasi Pembayaran**), catat tiket komplain/koreksi alamat stasiun. |
| **`supervisor1`** | `supervisor` | Inspektur Lapangan Ekspedisi | Tugaskan kurir ke armada (**Assign & Dispatch**), audit foto berdampingan (*side-by-side*) & **ACC Verifikasi Lapangan**. |
| **`manager1`** | `manager` | Kepala Stasiun Operasional | Tetapkan armada kendaraan 1900-an & tarif (**ACC Kendaraan & Tarif**), dan **ACC Finalisasi Ekspedisi** (tutup buku). |
| **`owner1`** | `owner` | Pemilik Ekspedisi (Proprietor) | Pantau metrik kas treasury, kelola armada (tambah/hapus kendaraan), buat kredensial staf stasiun baru. |

> 💡 **Tip:** Di halaman Login, tersedia tombol **Quick-Station Access** sehingga Anda dapat beralih peran dalam satu klik tanpa perlu mengetik ulang kredensial.

---

## 🔄 Alur Operasional Ekspedisi (The "ACC" Journey)

Perjalanan status sebuah pesanan kargo dikontrol secara deterministik melalui state machine:

1. **`Pending`**: Client membuat pesanan kargo baru via form stasiun.
2. **`Payment_Verified`**: Admin memverifikasi pembayaran faktur kargo (`is_paid = true`).
3. **`Vehicle_Assigned`**: Manager memilih armada kendaraan era 1900-an dan menetapkan tarif pengiriman (`price`).
4. **`On_Delivery`**: Supervisor menugaskan kurir lapangan ke pesanan tersebut.
5. **`Waiting_Verification` (Dual-ACC Otomatis)**:
   - Kurir mengunggah URL foto serah terima barang (`courier_proof_url`) &rarr; `is_courier_acc = true`.
   - Client mengunggah URL foto penerimaan barang (`client_proof_url`) &rarr; `is_client_acc = true`.
   - **Logika Otomatis**: Ketika kedua belah pihak telah menyelesaikan ACC masing-masing, sistem secara otomatis mengubah status menjadi `Waiting_Verification`.
6. **`Verified`**: Supervisor memeriksa kedua bukti foto secara berdampingan (*side-by-side*) lalu menekan tombol **"ACC Verifikasi Lapangan"**.
7. **`Completed`**: Manager menekan **"ACC Finalisasi Ekspedisi"** untuk menutup buku dan membukukan pendapatan ke kas perbendaharaan stasiun.

---

## 📚 Struktur Dokumentasi Terkait

Untuk pemahaman teknis yang lebih terperinci, silakan merujuk pada dokumentasi berkas masing-masing:
- [docs/README.md](docs/README.md): Spesifikasi lengkap Role-Based Access Control (RBAC), skema database, diagram status alur ACC, dan dokumentasi ke-23 REST API endpoints.
- [apps/api/README.md](apps/api/README.md): Panduan teknis arsitektur backend, konfigurasi environment variable, struktur model Sequelize, dan perintah CLI.
- [apps/interface/README.md](apps/interface/README.md): Panduan teknis frontend Vite, integrasi Tailwind CSS v4, desain UI telegraf 1900-an, dan penjelasan keenam modul dashboard.
