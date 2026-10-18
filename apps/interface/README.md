# Wire & Wagon — Frontend Interface Documentation

Dokumentasi teknis untuk antarmuka web client **"Wire & Wagon"** (Sistem Manajemen Logistik & Ekspedisi Era 1900-an).

Aplikasi frontend ini dibangun menggunakan **Vite**, **React 18**, dan **Tailwind CSS v4** dengan gaya visual khas kantor telegraf & ekspedisi uap era Revolusi Industri 1900-an.

---

## 📑 Daftar Isi
1. [Tech Stack & Pilihan Desain](#tech-stack--pilihan-desain)
2. [Struktur Folder](#struktur-folder)
3. [Konfigurasi Tailwind CSS v4 & Vite](#konfigurasi-tailwind-css-v4--vite)
4. [Sistem Desain Visual Era 1900-an](#sistem-desain-visual-era-1900-an)
5. [Manajemen State Autentikasi (AuthContext)](#manajemen-state-autentikasi-authcontext)
6. [Arsitektur Rute & Komponen ProtectedRoute](#arsitektur-rute--komponen-protectedroute)
7. [Visual Progress Stepper & Status Badge](#visual-progress-stepper--status-badge)
8. [Modul 6 Dashboard Peran](#modul-6-dashboard-peran)
9. [Panduan Eksekusi Terminal](#panduan-eksekusi-terminal)

---

## 🛠️ Tech Stack & Pilihan Desain

* **Framework:** React 18
* **Build Tool:** Vite (Ultra-fast Hot Module Replacement)
* **CSS Framework:** **Tailwind CSS v4** (Konfigurasi tanpa file `tailwind.config.js` v3 lama)
* **Routing:** React Router DOM v6
* **HTTP Client:** Axios (Dilengkapi Bearer Token Request Interceptor & 401 Response Interceptor)
* **Icons:** Lucide React
* **Typography:** Google Fonts (*Cinzel* untuk heading, *Newsreader* untuk isi, *Courier Prime* untuk telegraf monospace)

---

## 📂 Struktur Folder

```text
apps/interface/
├── public/                 # Aset statis (background.png, compass.png, logo.png, dll.)
├── src/
│   ├── api/
│   │   ├── axiosInstance.js# Client HTTP tersentralisasi dengan Bearer token injector
│   │   └── services/       # Service modular (auth, order, vehicle, user, acc)
│   ├── app/
│   │   ├── App.jsx         # Root component pembungkus AuthProvider & RouterProvider
│   │   ├── context/        # Global AuthContext & state manajemen sesi
│   │   └── routes/         # createBrowserRouter & layout rute terproteksi
│   ├── components/         # Komponen UI (Navbar, ProtectedRoute, StatusBadge)
│   ├── constants/          # Konstanta role, status order, route types, demo credentials
│   ├── helpers/            # Helper formatters (formatCurrency, formatDate)
│   ├── hooks/              # Custom hooks (useAuth)
│   ├── pages/              # Halaman Login, Register, Unauthorized
│   │   └── dashboards/     # 6 Dashboard khusus peran (Client, Courier, Admin, dll.)
│   ├── index.css           # Konfigurasi Tailwind CSS v4 & styling vintage
│   └── main.jsx            # Mounting React DOM ke elemen #root
├── index.html              # HTML shell dengan preconnect font klasik
├── vite.config.js          # Integrasi plugin @tailwindcss/vite
└── package.json            # Dependensi interface
```

---

## 🎨 Konfigurasi Tailwind CSS v4 & Vite

Proyek ini menggunakan **Tailwind CSS v4** standar terbaru:
1. **Plugin Vite (`vite.config.js`):**
   ```javascript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import tailwindcss from '@tailwindcss/vite';

   export default defineConfig({
     plugins: [
       react(),
       tailwindcss()
     ]
   });
   ```
2. **Import Style (`src/index.css`):**
   ```css
   @import "tailwindcss";
   ```
   *Tidak memerlukan berkas konfigurasi `tailwind.config.js` atau postcss lama.*

---

## 📜 Sistem Desain Visual Era 1900-an

Desain antarmuka memancarkan nuansa kantor ekspedisi dan perbendaharaan telegraf awal abad ke-20:
* **Palet Warna:**
  - Background dasar: `bg-stone-100` (warna kertas perkamen / buku besar kuno).
  - Kartu & Kontainer: `bg-stone-50` berpadu dengan border tegas `border-stone-300`.
  - Aksen Tombol: `bg-amber-800 hover:bg-amber-900 text-stone-100` menyerupai cap segel lilin dan kayu mahoni.
  - Nomor Resi: `font-mono text-amber-950 font-bold bg-amber-50 border-amber-300` berformat `WW-1900-XXXX`.
* **Tipografi:**
  - **Cinzel**: Digunakan untuk judul stasiun, nama armada, dan heading resmi.
  - **Newsreader**: Digunakan untuk teks deskriptif naratif.
  - **Courier Prime**: Digunakan untuk transmisi kawat telegraf, nomor resi, dan angka nominal biaya.

---

## 🔐 Manajemen State Autentikasi (AuthContext)

Berkas [src/context/AuthContext.jsx](src/context/AuthContext.jsx) membungkus seluruh aplikasi dan mengekspos hook `useAuth()`:
* `user`: Objek data pengguna aktif `{ id, username, email, role }`.
* `token`: Token JWT yang tersimpan di `localStorage`.
* `login(username, password)`: Melakukan POST ke `/api/auth/login`, menyimpan token, dan memperbarui state.
* `register(username, email, password)`: Registrasi client baru dan otomatis mengarahkan ke dashboard.
* `logout()`: Menghapus token dari storage dan mengarahkan kembali ke gerbang login.

---

## 🛡️ Arsitektur Rute & Komponen ProtectedRoute

Pada [src/App.jsx](src/App.jsx), setiap peran diproteksi oleh `<ProtectedRoute allowedRoles={[...]}>`:
* Jika pengguna belum login &rarr; Otomatis diarahkan ke `/login`.
* Jika peran pengguna tidak ada di dalam `allowedRoles` &rarr; Diarahkan ke `/unauthorized`.
* Rute root (`/`) dan `/dashboard` otomatis diarahkan ke sub-route spesifik melalui komponen `DashboardDispatcher`:
  - `client` &rarr; `/dashboard/client`
  - `courier` &rarr; `/dashboard/courier`
  - `admin` &rarr; `/dashboard/admin`
  - `supervisor` &rarr; `/dashboard/supervisor`
  - `manager` &rarr; `/dashboard/manager`
  - `owner` &rarr; `/dashboard/owner`

---

## 📈 Visual Progress Stepper & Status Badge

Berkas [src/components/StatusBadge.jsx](src/components/StatusBadge.jsx) menyediakan visual progress bar interaktif untuk melacak 7 tahapan alur ekspedisi:
```text
[1. Pending] ──> [2. Payment Verified] ──> [3. Vehicle Assigned] ──> [4. On Delivery]
      ──> [5. Waiting Verification (Dual ACC)] ──> [6. Verified] ──> [7. Completed]
```
Jika status pesanan dibatalkan, komponen secara elegan menampilkan peringatan kartu merah *Cancelled*.

---

## 🖥️ Modul 6 Dashboard Peran

### 1. Client Dashboard (`/dashboard/client`)
* **Pembuatan Kargo:** Form pengiriman kargo baru dengan input berat (kg), komoditas, rute (*In-City* / *Inter-City*), stasiun asal, dan stasiun tujuan.
* **Pelacakan Manifest:** Melihat status resi dan progress stepper.
* **ACC Terima Barang:** Input URL foto penerimaan barang (`client_proof_url`) saat status `On_Delivery`.

### 2. Courier Dashboard (`/dashboard/courier`)
* **Lembar Tugas Kurir:** Daftar waybill pengiriman yang ditugaskan khusus kepada kurir yang login.
* **ACC Selesai Tugas:** Input URL foto serah terima barang (`courier_proof_url`) saat status `On_Delivery`.
* **Indikator Dual-ACC:** Memperlihatkan apakah Klien juga sudah memberikan konfirmasi ACC.

### 3. Admin Dashboard (`/dashboard/admin`)
* **Buku Besar Kasir:** Menampilkan seluruh pesanan kargo lintas saudagar.
* **Verifikasi Pembayaran:** Tombol memvalidasi pembayaran saat status `Pending` (`is_paid = true`).
* **Catatan Tiket Stasiun:** Form pencatatan kendala atau koreksi alamat kargo (`issue_notes`).

### 4. Supervisor Dashboard (`/dashboard/supervisor`)
* **Penugasan Kurir:** Dropdown pemilihan kurir stasiun saat status `Vehicle_Assigned`.
* **Audit Foto Berdampingan (*Side-by-Side*):** Modal khusus yang menampilkan foto bukti kurir dan foto bukti klien secara berdampingan.
* **ACC Verifikasi Lapangan:** Tombol menyetujui keabsahan pengiriman fisik saat status `Waiting_Verification`.

### 5. Manager Dashboard (`/dashboard/manager`)
* **Alokasi Armada 1900-an:** Memilih jenis kendaraan (*Sepeda, Gerobak Kuda, Truk Uap, Kereta Lokomotif, Kapal Uap*) dan menentukan tarif saat status `Payment_Verified`.
* **ACC Finalisasi Ekspedisi:** Menutup buku ekspedisi saat status `Verified` dan mencatat keuntungan ke kas stasiun.
* **Kartu Analitik:** Menampilkan metrik volume pengiriman aktif.

### 6. Owner Dashboard (`/dashboard/owner`)
* **Perbendaharaan Stasiun (Treasury):** Kartu metrik total pendapatan dari order yang telah `Completed`.
* **Inventaris Armada:** Menambah armada baru, mengubah status kesiapan operasional (`is_available`), atau menghapus kendaraan.
* **Kredensial Staf:** Menambah akun staf baru (`courier`, `admin`, `supervisor`, `manager`) dan mencabut akses.

---

## 💻 Panduan Eksekusi Terminal

Jalankan perintah berikut di dalam direktori `apps/interface`:

```bash
# 1. Instalasi dependensi
npm install

# 2. Menjalankan development server Vite
npm run dev

# 3. Menjalankan pengujian build produksi
npm run build

# 4. Menjalankan pratinjau hasil build (preview)
npm run preview
```
Aplikasi dapat dibuka melalui browser pada alamat **`http://localhost:5173`**.
