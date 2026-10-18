# Wire & Wagon — API Backend Documentation

Dokumentasi teknis untuk layanan backend RESTful API **"Wire & Wagon"** (Sistem Manajemen Logistik & Ekspedisi Era 1900-an).

Layanan ini mengelola otentikasi berbasis token JWT, state machine alur "ACC" ekspedisi, otorisasi peran berjenjang (*RBAC*), manajemen inventaris armada era 1900-an, serta pelacakan pengiriman secara deterministik.

---

## 📑 Daftar Isi
1. [Arsitektur & Tech Stack](#arsitektur--tech-stack)
2. [Struktur Folder](#struktur-folder)
3. [Variabel Lingkungan (Environment Variables)](#variabel-lingkungan-environment-variables)
4. [Konfigurasi Basis Data (PostgreSQL & SQLite)](#konfigurasi-basis-data-postgresql--sqlite)
5. [Skema Model & Relasi Basis Data](#skema-model--relasi-basis-data)
6. [Mekanisme Autentikasi & Keamanan (Passport.js)](#mekanisme-autentikasi--keamanan-passportjs)
7. [Daftar 23 API Endpoints](#daftar-23-api-endpoints)
8. [Panduan Eksekusi Terminal & Perintah CLI](#panduan-eksekusi-terminal--perintah-cli)
9. [Format Respon & Penanganan Error](#format-respon--penanganan-error)

---

## 🛠️ Arsitektur & Tech Stack

* **Runtime:** Node.js (v18+)
* **Framework:** Express.js v4
* **ORM:** Sequelize v6 & `sequelize-cli`
* **Drivers Database:** `pg`, `pg-hstore` (PostgreSQL), `sqlite3` (SQLite)
* **Autentikasi & Otorisasi:**
  * `passport` (Strategy: `passport-local` untuk verifikasi akun, `passport-jwt` untuk proteksi rute API)
  * `bcrypt` / `bcryptjs` (Hashing salt 10 rounds)
  * `jsonwebtoken` (Sign & verify token JWT dengan expired 7 hari)
* **Lainnya:** `cors`, `dotenv`, `nodemon`

---

## 📂 Struktur Folder

```text
apps/api/
├── config/
│   ├── config.json          # Konfigurasi koneksi Sequelize (development, test, production)
│   └── passport.js          # Strategi Passport Local (login) dan JWT (auth header Bearer)
├── controllers/
│   ├── AuthController.js    # Register, login, dan getMe
│   ├── UserController.js    # Manajemen pengguna dan penambahan staf stasiun
│   ├── VehicleController.js # Manajemen inventaris armada kendaraan 1900-an
│   ├── OrderController.js   # Pembuatan order, filter manifest per peran, verifikasi bayar
│   └── AccController.js     # State machine transisi alur ACC dan metrik analitik
├── helpers/
│   ├── bcrypt.js            # Fungsi helper hashPassword dan comparePassword
│   └── jsonwebtoken.js      # Fungsi helper signToken dan verifyToken
├── middlewares/
│   └── auth.js              # Middleware authenticateJWT dan authorizeRoles(...roles)
├── migrations/
│   ├── 01-create-user.js    # Migrasi tabel Users
│   ├── 02-create-vehicle.js # Migrasi tabel Vehicles
│   └── 03-create-order.js   # Migrasi tabel Orders
├── models/
│   ├── index.js             # Inisialisasi Sequelize loader dinamis
│   ├── user.js              # Model User dengan hook beforeCreate/beforeUpdate
│   ├── vehicle.js           # Model Vehicle armada kendaraan
│   └── order.js             # Model Order dengan generator resi otomatis WW-1900-XXXX
├── seeders/
│   └── 01-initial-seed.js   # Seeder 6 akun pengguna & 5 armada era 1900-an
├── routes/
│   ├── index.js             # Router penggabung seluruh modul
│   ├── auth.js              # Rute otentikasi (/api/auth)
│   ├── users.js             # Rute staf & user (/api/users)
│   ├── vehicles.js          # Rute armada kendaraan (/api/vehicles)
│   ├── orders.js            # Rute operasional kargo (/api/orders)
│   └── acc.js               # Rute alur ACC & analitik (/api/acc)
├── .env.example             # Contoh konfigurasi environment
├── .env                     # Berkas environment aktif
├── .sequelizerc             # Pemetaan path direktori sequelize-cli
├── package.json             # Dependensi dan skrip npm
└── app.js                   # Berkas server Express utama
```

---

## ⚙️ Variabel Lingkungan (Environment Variables)

Berkas `.env` dapat dikonfigurasi dengan variabel berikut:

| Variabel | Tipe | Nilai Default | Penjelasan |
|---|---|---|---|
| `PORT` | Number | `3000` | Port listen server Express. |
| `JWT_SECRET` | String | `wire_n_wagon_secret_1900_key` | Kunci rahasia untuk menandatangani token JWT. |
| `NODE_ENV` | String | `development` | Mode runtime aplikasi (`development`, `test`, `production`). |
| `DB_USERNAME` | String | `postgres` | Username database PostgreSQL. |
| `DB_PASSWORD` | String | `password` | Password database PostgreSQL. |
| `DB_NAME` | String | `wire_n_wagon_dev` | Nama database. |
| `DB_HOST` | String | `127.0.0.1` | Host alamat server database. |
| `DB_PORT` | Number | `5432` | Port server database PostgreSQL. |
| `DB_DIALECT` | String | `postgres` | Dialek database (`postgres` atau `sqlite`). |
| `DB_STORAGE` | String | `./database.sqlite` | Lokasi berkas SQLite jika `DB_DIALECT=sqlite`. |

---

## 🗄️ Konfigurasi Basis Data (PostgreSQL & SQLite)

Backend ini dirancang fleksibel:
1. **PostgreSQL (Default Produksi/Staging):** Pastikan PostgreSQL aktif di port 5432 dan database `wire_n_wagon_dev` sudah dibuat.
2. **SQLite (Pengujian Lokal Zero-Config):** Cukup ubah di `.env`:
   ```env
   DB_DIALECT=sqlite
   DB_STORAGE=./database.sqlite
   ```
   Sequelize akan langsung membuat berkas `database.sqlite` tanpa memerlukan server eksternal.

---

## 🧬 Skema Model & Relasi Basis Data

### 1. `User`
* `id` (INTEGER, PK, Auto Increment)
* `username` (STRING, Unique, Not Null)
* `email` (STRING, Unique, Not Null)
* `password` (STRING, Not Null, di-hash via bcrypt)
* `role` (ENUM: `'client'`, `'courier'`, `'admin'`, `'supervisor'`, `'manager'`, `'owner'`, Default: `'client'`)
* **Relasi Asosiasi:**
  - `hasMany(Order, { foreignKey: 'clientId', as: 'clientOrders' })`
  - `hasMany(Order, { foreignKey: 'courierId', as: 'courierOrders' })`
  - `hasMany(Order, { foreignKey: 'supervisorId', as: 'supervisorOrders' })`
  - `hasMany(Order, { foreignKey: 'managerId', as: 'managerOrders' })`

### 2. `Vehicle`
* `id` (INTEGER, PK, Auto Increment)
* `name` (STRING, Not Null)
* `type` (STRING, Not Null) &rarr; *In-City*, *Inter-City*, *River*
* `capacity_kg` (INTEGER, Not Null)
* `cost_per_km` (INTEGER, Not Null)
* `is_available` (BOOLEAN, Default: true)
* **Relasi Asosiasi:**
  - `hasMany(Order, { foreignKey: 'vehicleId', as: 'orders' })`

### 3. `Order`
* `id` (INTEGER, PK, Auto Increment)
* `receipt_number` (STRING, Unique) &rarr; Format otomatis: `WW-1900-XXXX`
* `clientId`, `courierId`, `supervisorId`, `managerId`, `vehicleId`
* `origin`, `destination`, `route_type` (ENUM: `'in_city'`, `'inter_city'`)
* `item_name`, `weight_kg`, `price` (Default: 0), `is_paid` (Default: false)
* `is_courier_acc` (BOOLEAN), `courier_proof_url` (STRING)
* `is_client_acc` (BOOLEAN), `client_proof_url` (STRING)
* `is_supervisor_acc` (BOOLEAN), `is_manager_final_acc` (BOOLEAN)
* `status` (ENUM: `'Pending'`, `'Payment_Verified'`, `'Vehicle_Assigned'`, `'On_Delivery'`, `'Waiting_Verification'`, `'Verified'`, `'Completed'`, `'Cancelled'`)
* `issue_notes` (TEXT, Catatan kendala/tiket dari admin)
* **Relasi Asosiasi:**
  - `belongsTo(User, { foreignKey: 'clientId', as: 'client' })`
  - `belongsTo(User, { foreignKey: 'courierId', as: 'courier' })`
  - `belongsTo(User, { foreignKey: 'supervisorId', as: 'supervisor' })`
  - `belongsTo(User, { foreignKey: 'managerId', as: 'manager' })`
  - `belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' })`

---

## 🔒 Mekanisme Autentikasi & Keamanan (Passport.js)

1. **Login Flow (`passport-local`):**
   * Endpoint `POST /api/auth/login` memvalidasi username atau email beserta password.
   * Jika valid, server menandatangani token JWT berisi `{ id, username, role }`.
2. **Protected Routes Flow (`passport-jwt`):**
   * Middleware `authenticateJWT` mengekstrak token dari header HTTP:
     ```http
     Authorization: Bearer <access_token>
     ```
   * Jika token valid, user dimuat ke `req.user`.
3. **Role-Based Authorization (`authorizeRoles`):**
   * Middleware `authorizeRoles('manager', 'owner')` memvalidasi apakah `req.user.role` termasuk dalam izin akses. Jika tidak, mengembalikan error `403 Forbidden`.

---

## 📡 Daftar 23 API Endpoints

### A. Autentikasi (`/api/auth`)
* `POST /api/auth/register`: Pendaftaran client baru (body: `{ username, email, password }`).
* `POST /api/auth/login`: Login pengguna (body: `{ username, password }`).
* `GET /api/auth/me`: Ambil profil pengguna yang sedang login.

### B. Pengguna & Staf (`/api/users`)
* `GET /api/users`: Daftar pengguna (Role: `manager`, `owner`, `supervisor`. Filter: `?role=courier`).
* `POST /api/users`: Buat akun staf baru (Role: `manager`, `owner`).
* `DELETE /api/users/:id`: Hapus akun pengguna (Role: `owner`).

### C. Armada Kendaraan (`/api/vehicles`)
* `GET /api/vehicles`: Daftar seluruh armada kendaraan (Semua role terautentikasi).
* `POST /api/vehicles`: Tambah armada baru (Role: `manager`, `owner`).
* `PUT /api/vehicles/:id`: Perbarui armada & ketersediaan (Role: `manager`, `owner`).
* `DELETE /api/vehicles/:id`: Hapus armada (Role: `owner`).

### D. Operasional Pesanan (`/api/orders`)
* `POST /api/orders`: Buat pesanan baru (Role: `client`, status: `'Pending'`).
* `GET /api/orders`: Ambil daftar pesanan (Otomatis terfilter sesuai peran token JWT).
* `GET /api/orders/:id`: Detail satu pesanan beserta relasi & nomor resi.
* `PUT /api/orders/:id/verify-payment`: Verifikasi pembayaran (Role: `admin`, status: `'Payment_Verified'`).
* `PUT /api/orders/:id/issue`: Catat catatan kendala/tiket komplain (Role: `admin`).
* `PUT /api/orders/:id/cancel`: Batalkan pesanan pending (Role: `client`, `admin`, status: `'Cancelled'`).

### E. Alur Kerja "ACC" & Analitik (`/api/acc`)
* `PUT /api/acc/:orderId/manager-vehicle`: Alokasi kendaraan & harga (Role: `manager`, status: `'Vehicle_Assigned'`).
* `PUT /api/acc/:orderId/supervisor-assign`: Penugasan kurir (Role: `supervisor`, status: `'On_Delivery'`).
* `PUT /api/acc/:orderId/courier-deliver`: Kurir input URL foto serah terima (Role: `courier`).
* `PUT /api/acc/:orderId/client-receive`: Klien input URL foto penerimaan (Role: `client`).
  * *Otorisasi Ganda:* Jika kurir DAN klien telah ACC, status otomatis beralih ke `'Waiting_Verification'`.
* `PUT /api/acc/:orderId/supervisor-verify`: Verifikasi foto di lapangan (Role: `supervisor`, status: `'Verified'`).
* `PUT /api/acc/:orderId/manager-finalize`: Tutup buku ekspedisi (Role: `manager`, status: `'Completed'`).
* `GET /api/acc/analytics`: Laporan analitik pendapatan & sebaran armada (Role: `owner`, `manager`).

---

## 💻 Panduan Eksekusi Terminal & Perintah CLI

Jalankan perintah berikut di dalam folder `apps/api`:

```bash
# 1. Instalasi dependensi
npm install

# 2. Menjalankan migrasi database
npm run db:migrate
# atau: npx sequelize-cli db:migrate

# 3. Menjalankan seeding data akun dan armada
npm run db:seed
# atau: npx sequelize-cli db:seed:all

# 4. Reset total database (Undo -> Migrate -> Seed)
npm run db:reset

# 5. Menjalankan server dev dengan Nodemon
npm run dev

# 6. Menjalankan server produksi
npm start
```

---

## 📋 Format Respon & Penanganan Error

Seluruh respon API mengikuti struktur JSON standar:

### Respon Sukses (200 / 201)
```json
{
  "statusCode": 200,
  "message": "Expedition finalized by Manager. Status is now Completed",
  "data": { ... }
}
```

### Respon Error (400 / 401 / 403 / 404 / 500)
```json
{
  "statusCode": 403,
  "message": "Forbidden: Access denied for role 'courier'. Required role(s): manager, owner"
}
```
Semua error ditangani secara tersentralisasi melalui middleware global error handling di [app.js](app.js).
