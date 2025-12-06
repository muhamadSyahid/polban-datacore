# Polban DataCore - Backend Documentation

Dokumentasi ini ditujukan untuk pengembang yang akan melanjutkan pengembangan backend DataCore. Dokumen ini berisi penjelasan teknis mengenai struktur kode, pola desain, dan panduan pengembangan.

## 📂 Struktur Direktori

Berikut adalah peta navigasi untuk memahami kode sumber (`src/`):

- **`api/`**: Berisi controller dan service untuk endpoint publik yang diakses oleh frontend (DataView).
- **`auth/`**: Modul otentikasi. Menangani validasi token dan komunikasi auth dengan DataHub.
- **`common/`**: Kode yang digunakan bersama, seperti Decorators, Interceptors, dan Utilities.
- **`config/`**: Konfigurasi aplikasi (env vars validation).
- **`constants/`**: Konstanta global seperti nama job, endpoint URL, dll.
- **`database/`**: Konfigurasi koneksi database dan skema Drizzle ORM.
  - `schema/`: Definisi tabel dan relasi.
- **`etl/`**: **Jantung aplikasi ini**. Menangani proses Extract, Transform, dan Load.
  - `datahub/`: Service khusus untuk mengambil data dari API DataHub.
- **`jobs/`**: Definisi Cron Jobs untuk penjadwalan otomatis.

---

## 🧠 Konsep Utama

### 1. Pola ETL (Extract, Transform, Load)

Backend ini bukan sekadar CRUD biasa. Ia bertindak sebagai _Data Warehouse_ mini.

- **Extract**: Dilakukan oleh `DataHubService` (`src/etl/datahub/`). Kita mengambil data mentah (JSON) dari API DataHub.
- **Load**: Data mentah disimpan "apa adanya" (atau dengan sedikit penyesuaian tipe data) ke dalam tabel **Fact** (misal: `fact_mahasiswa`). Ini dilakukan oleh `EtlRepository`.
- **Transform/Aggregate**: Kita tidak melakukan query berat (`GROUP BY`, `COUNT`, dll) secara _real-time_ saat user me-request API. Sebaliknya, kita melakukan kalkulasi berat ini di background dan menyimpannya ke **Materialized Views** (atau tabel agregasi).

### 2. Materialized Views & Aggregation

Untuk performa query yang cepat, kita menggunakan konsep Materialized View.
Saat job ETL berjalan (`EtlService`), setelah data baru masuk, kita me-refresh view ini.

Contoh alur:

1. Job `SYNC_MAHASISWA` berjalan -> Data baru masuk ke tabel `fact_mahasiswa`.
2. Job `AGGREGATE_GENDER` berjalan -> Perintah SQL `REFRESH MATERIALIZED VIEW mv_mahasiswa_gender` dieksekusi.
3. API Endpoint `/api/v1/mahasiswa/gender` hanya perlu melakukan `SELECT * FROM mv_mahasiswa_gender`.

### 3. Caching (Redis)

Meskipun Materialized View sudah cepat, kita tetap menggunakan Redis untuk caching di level HTTP Response.
Interceptor akan mengecek apakah request yang sama sudah ada di Redis. Jika ada, return langsung tanpa menyentuh database.

### 4. Otentikasi & Otorisasi (Auth Proxy)

DataCore **tidak menyimpan data user** (email, password) dan **tidak men-generate token JWT** sendiri. Seluruh proses manajemen user dan otentikasi dilakukan terpusat di **DataHub**.

- **Login Proxy**: Saat user login via DataCore (misal dari Admin Web / DataView), DataCore meneruskan request ke API DataHub (`/api/login`). Token yang didapat dari DataHub dikembalikan ke user.
- **Token Validation**: Saat ada request masuk ke endpoint terproteksi di DataCore, sistem akan memvalidasi token tersebut ke DataHub (`/api/user`) dan menyimpan hasilnya di Cache (Redis) selama 5 menit untuk mengurangi beban request ke DataHub.
- **System Token**: Untuk komunikasi antar-server (misal saat ETL Job berjalan), DataCore menggunakan akun khusus (System User) untuk mendapatkan token dari DataHub.

---

## 📊 API Endpoints

Untuk melihat daftar lengkap endpoint, struktur request, dan contoh response, silakan kunjungi dokumentasi kami:

🔗 [https://ikhsan3adi.is-a.dev/polban-datacore-api-docs/](https://ikhsan3adi.is-a.dev/polban-datacore-api-docs/)

---

## 🛠️ Panduan Pengembangan

### Bagaimana cara menambahkan data baru dari DataHub?

1.  **Cek API DataHub**: Pastikan endpoint tersedia di DataHub.
2.  **Buat DTO**: Di `src/etl/datahub/dto/`, buat class DTO untuk memetakan respon JSON dari DataHub.
3.  **Update `DataHubService`**: Tambahkan method `getNewData()` yang menggunakan `HttpService` untuk fetch data.
4.  **Update Database Schema**:
    - Edit `src/database/schema/fact.schema.ts` untuk membuat tabel penampung baru.
    - Jalankan `bun run db:generate` dan `bun run db:migrate`.
5.  **Update `EtlService`**: Tambahkan logika untuk memanggil `DataHubService` dan menyimpan ke DB.

### Bagaimana cara membuat Agregasi/Statistik baru?

1.  **Desain Query SQL**: Coba dulu query agregasi (GROUP BY, dll) di tool database (DBeaver/pgAdmin).
2.  **Buat Materialized View**:
    - Definisikan view baru di skema Drizzle (`src/database/schema/aggregate.schema.ts`).
    - Buat migrasi dengan menjalankan `bun run db:generate` dan `bun run db:migrate`.
3.  **Buat Endpoint API**:
    - Buat Controller dan Service baru di `src/api/`.
    - Lakukan query `SELECT *` sederhana ke view yang baru dibuat.

### Bagaimana cara debug proses Job ETL?

Untuk mengetes tanpa menunggu jadwal:

1. Terdapat beberapa endpoint debug yang dapat digunakan untuk menguji fungsi ETL secara langsung.
   - `GET /api/etl/debug/fullSync` (memerlukan `Authorization` header dengan token `DATACORE_ADMIN`)
   - `POST /api/jobs/run` (memerlukan `Authorization` header dengan token `DATACORE_ADMIN`, `DATAHUB_ADMIN` atau `DATAHUB_PARTICIPANT` serta request body berupa `{"jobName": "<nama_job> (default: 'full-sync-and-aggregate')"}`)
2. Jalankan layanan [DataHub](https://github.com/ErsyaHasby/polban-datahub).
3. Jalankan `bun run start:dev` untuk menjalankan server secara lokal.
4. Hit endpoint tersebut via Postman/Curl.

---

## ⚠️ Troubleshooting Umum

**Q: Data tidak muncul di API padahal Cron Job sukses?**

A: Cek apakah Materialized View sudah di-refresh? Kadang data masuk ke tabel Fact, tapi view belum diperbarui. Pastikan `EtlService` memanggil fungsi refresh setelah insert data.

**Q: Error koneksi database saat development?**

A: Pastikan container Docker untuk Postgres dan Redis menyala. Cek file `.env` apakah kredensialnya sesuai.

**Q: Perubahan skema database tidak terdeteksi?**

A: Drizzle Kit perlu di-generate ulang. Jalankan `bun run db:generate` setiap kali mengubah file di `src/database/schema/`.

**Q: Error saat sync data atau akses endpoint terproteksi (401 Unauthorized / Connection Refused)?**

A:

  1. Pastikan service **DataHub** sudah berjalan. DataCore butuh DataHub untuk validasi token dan ambil data.
  2. Cek kredensial `DATACORE_SYSTEM_EMAIL` dan `DATACORE_SYSTEM_PASSWORD` di `.env`. Akun ini harus terdaftar di DataHub.

**Q: Error "command not found" atau "module not found" saat install/run?**

A: Pastikan Anda sudah masuk ke direktori backend (`cd backend`) sebelum menjalankan perintah `bun install` atau `bun run start`.

**Q: Error "database does not exist" atau tabel tidak ditemukan?**

A:

  1. Pastikan database `polban_datacore` (atau nama sesuai `.env`) sudah dibuat di Postgres.
  2. Jangan lupa jalankan migrasi: `bun run db:migrate`.

**Q: Error aneh lainnya?**
A: Coba hapus folder `node_modules` dan `bun.lockb`, lalu install ulang dependencies (`bun install`). Kadang cache package bisa bermasalah.
