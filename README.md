<div align="center">

![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Montserrat&weight=600&size=32&duration=3000&pause=2000&color=FFFFFF&center=true&vCenter=true&width=435&lines=Polban+DataCore)

<img src="https://github.com/ihsan-ramadhan/polban-dataview/raw/main/laravel-vue/public/images/polban-logo.png" alt="Polban Logo" width="120" />

**Aplikasi Layanan DataCore**

Aplikasi ini bertugas untuk memuat, mengekstrak dan mentransformasi/mengagregasi data dari DataHub dan menyediakannya melalui REST API.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

<div align="center">

---

### 📈 Project Stats

![GitHub repo size](https://img.shields.io/github/repo-size/muhamadSyahid/polban-datacore?style=flat-square&color=FF6384)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/muhamadSyahid/polban-datacore?style=flat-square&color=2196F3)
![GitHub last commit](https://img.shields.io/github/last-commit/muhamadSyahid/polban-datacore?style=flat-square&color=646CFF)

</div>

---

## 📖 Tentang Proyek

**Polban DataCore** adalah komponen agregator dan backend utama dari ekosistem [**Polban Dataverse**](https://github.com/ikhsan3adi/polban-dataverse). Aplikasi ini berfungsi sebagai jembatan cerdas yang menghubungkan sumber data mentah dengan visualisasi data.

Tugas utama DataCore meliputi:

1.  **Extract**: Mengambil data mentah (Mahasiswa, Dosen, Akademik) dari DataHub.
2.  **Load**: Menyimpan data tersebut ke dalam database internal untuk pemrosesan.
3.  **Transform & Aggregate**: Mengolah data mentah menjadi data statistik yang bermakna (misal: sebaran gender, tren IPK, rasio dosen).
4.  **Serve**: Menyediakan data matang tersebut melalui REST API yang cepat dan ter-cache.

### 🔗 Ekosistem Polban Dataverse

Proyek ini merupakan bagian dari kolaborasi tiga tim pengembang:

1.  **[DataHub](https://github.com/ErsyaHasby/polban-datahub)** - Mengelola _database_, struktur tabel, halaman admin, dan data partisipan (Sumber Data).
2.  **[DataCore](https://github.com/muhamadSyahid/polban-datacore)** - Mengagregasi data dari DataHub dan menyediakannya melalui REST API (Backend & Processing).
3.  **[DataView](https://github.com/ihsan-ramadhan/polban-dataview)** - Mengambil data dari API DataCore dan memvisualisasikannya kepada pengguna (Frontend Visualisasi).

---

## ⚙️ Arsitektur Sistem & Alur Data

Sistem DataCore bekerja menggunakan prinsip **ETL (Extract, Transform, Load)** yang dijalankan secara terjadwal (Cron Job) atau manual.

### 1. Extract (Pengambilan Data)

Sistem melakukan request HTTP ke API DataHub menggunakan `DataHubService`.

- **Incremental Sync**: Mengambil hanya data yang berubah sejak sinkronisasi terakhir untuk efisiensi.
- **Auth**: Menggunakan System Token untuk otentikasi antar-layanan.

### 2. Load (Penyimpanan)

Data mentah disimpan ke dalam tabel "Fact" di database PostgreSQL menggunakan `EtlRepository`.

- `FactMahasiswa`
- `FactDosen`
- `FactAkademik`

### 3. Transform & Aggregate (Pengolahan)

Data mentah diolah menjadi data statistik (Aggregated Data) dan disimpan dalam **Materialized Views**. Proses ini dilakukan oleh `EtlService`.

- **Guest Data**: Gender, Jenis SLTA, Domisili, Agama, Jalur Pendaftaran.
- **Kemahasiswaan**: Total Mahasiswa, Gender, Jenis SLTA, Agama.
- **Akademik**: Distribusi Nilai, Tren IP Rata-rata, Tren IP Tertinggi, Jalur Pendaftaran.

### 4. Serving (Penyajian)

Data yang sudah teragregasi di Materialized View disajikan melalui REST API. Untuk meningkatkan performa, **Redis** digunakan untuk melakukan caching pada level response API (Response Caching).

---

## 🛠️ Tech Stack

### Backend

- **Runtime**: [Bun](https://bun.sh/) - JavaScript runtime yang cepat.
- **Framework**: [NestJS](https://nestjs.com/) - Framework Node.js yang progresif.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript dengan tipe data statis.
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Database relasional open source.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - ORM TypeScript yang ringan dan performant.
- **Caching**: [Redis](https://redis.io/) - In-memory data store untuk caching respon API.
- **HTTP Client**: Axios (via `@nestjs/axios`).
- **Job Scheduling**: Cron (via `@nestjs/schedule`).

### Frontend (Admin DataCore)

- **Framework**: [Vue.js](https://vuejs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Custom CSS dengan CSS Variables

---

## 📊 API Endpoints

Untuk melihat daftar lengkap endpoint, struktur request, dan contoh response, silakan kunjungi dokumentasi kami:

🔗 [https://ikhsan3adi.is-a.dev/polban-datacore-api-docs/](https://ikhsan3adi.is-a.dev/polban-datacore-api-docs/)

---

## 👥 Tim Pengembang (Kelompok C3.2)

<div align="center">

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/ikhsan3adi">
        <img src="https://github.com/ikhsan3adi.png" width="100px;" alt="Ikhsan"/><br />
        <sub><b>Ikhsan Satriadi</b></sub>
      </a><br />
      <sub>Backend - Data Processing & DevOps</sub>
      <sub><br>241511080</br></sub>
    </td>
    <td align="center">
      <a href="https://github.com/muhamadSyahid">
        <img src="https://github.com/muhamadSyahid.png" width="100px;" alt="Syahid"/><br />
        <sub><b>Muhamad Syahid</b></sub>
      </a><br />
      <sub>Backend - API & DevOps</sub>
      <sub><br>241511081</br></sub>
    </td>
    <td align="center">
      <a href="https://github.com/RizkySatria123">
        <img src="https://github.com/RizkySatria123.png" width="100px;" alt="Rizky"/><br />
        <sub><b>Rizky Satria Gunawan</b></sub>
      </a><br />
      <sub>Frontend</sub>
      <sub><br>241511089</br></sub>
    </td>
    <td align="center">
      <a href="https://github.com/yajidms">
          <img src="https://github.com/yajidms.png" width="100px;" alt="Yazid"/><br />
        <sub><b>Yazid Alrasyid</b></sub>
      </a><br />
      <sub>Frontend</sub>
      <sub><br>241511093</br></sub>
    </td>
  </tr>
</table>

</div>

---

## ⭐ Acknowledgments

Terima kasih kepada:

- **Politeknik Negeri Bandung** - Institusi pendidikan
- **Dosen Manager** - Bimbingan dan arahan proyek
- **Tim DataHub & DataView** - Kolaborasi yang solid
- **Open Source Community** - Libraries dan tools yang digunakan

---

## 📚 Resources & Documentation

### Official Docs

- [NestJS Documentation](https://docs.nestjs.com/)
- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [Drizzle Documentation](https://orm.drizzle.team/docs/)

### Related Repositories

- [DataVerse Repository](https://github.com/ikhsan3adi/polban-dataverse)
- [DataHub Repository](https://github.com/ErsyaHasby/polban-datahub)
- [DataCore Repository](https://github.com/muhamadSyahid/polban-datacore)
- [DataView Repository](https://github.com/ihsan-ramadhan/polban-dataview)

- [DataCore API Docs Repository](https://github.com/ikhsan3adi/polban-datacore-api-docs)
