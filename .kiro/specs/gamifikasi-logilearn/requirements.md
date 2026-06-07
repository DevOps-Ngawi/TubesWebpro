# Dokumen Persyaratan: Gamifikasi LogiLearn

## Pendahuluan

Fitur gamifikasi LogiLearn bertujuan meningkatkan motivasi dan keterlibatan pelajar dalam menggunakan aplikasi mobile LogiLearn. Fitur ini mencakup empat komponen utama: sistem XP (Experience Points), Level Rank otomatis, Badge pencapaian, dan Leaderboard berbasis XP. Implementasi melibatkan backend Express.js (dengan Prisma ORM dan PostgreSQL) dan aplikasi mobile Flutter yang berkomunikasi melalui REST API.

Domain yang sudah ada: `sections → levels → soals (PG/Esai) → attempts → jawaban`. Fitur gamifikasi diintegrasikan ke dalam alur ini, dipicu setiap kali pelajar menyelesaikan sebuah attempt.

---

## Glosarium

- **Pelajar**: Pengguna terdaftar pada aplikasi LogiLearn yang mengikuti kuis.
- **Attempt**: Satu sesi pengerjaan kuis untuk sebuah level oleh seorang pelajar.
- **Skor**: Nilai persentase (0–100) yang diperoleh pelajar dari sebuah attempt.
- **XP (Experience Points)**: Poin pengalaman yang diperoleh pelajar setelah menyelesaikan sebuah attempt, dihitung berdasarkan skor.
- **Total_XP**: Akumulasi seluruh XP yang diperoleh pelajar sepanjang waktu.
- **Level_Rank**: Tingkat peringkat pelajar yang ditentukan secara otomatis berdasarkan Total_XP.
- **Badge**: Lencana digital yang diberikan kepada pelajar atas pencapaian tertentu.
- **Leaderboard**: Papan peringkat yang menampilkan daftar pelajar berurut berdasarkan Total_XP.
- **Gamification_Service**: Layanan backend (Express.js) yang menangani logika perhitungan XP, penentuan Level_Rank, dan evaluasi Badge.
- **Gamification_API**: Kumpulan endpoint REST yang mengekspos data gamifikasi kepada Flutter client.
- **Flutter_Client**: Aplikasi mobile LogiLearn berbasis Flutter/Dart.
- **Submission_Flow**: Alur yang dipicu saat pelajar memanggil `POST /api/attempts/submit`.

---

## Persyaratan

### Persyaratan 1: Perhitungan dan Penyimpanan XP

**User Story:** Sebagai pelajar, saya ingin mendapatkan XP setiap kali menyelesaikan kuis, sehingga saya dapat melihat perkembangan usaha belajar saya secara kuantitatif.

#### Kriteria Penerimaan

1. WHEN seorang pelajar menyelesaikan sebuah attempt (Submission_Flow dipanggil), THE Gamification_Service SHALL menghitung XP yang diperoleh menggunakan formula: `xp_gained = floor(skor * 1.0)`, di mana `skor` adalah nilai persentase attempt tersebut (rentang 0–100), sehingga XP yang diperoleh berada pada rentang 0–100 per attempt.
2. WHEN Gamification_Service selesai menghitung xp_gained, THE Gamification_Service SHALL menambahkan xp_gained ke kolom `xp` milik pelajar yang bersangkutan di tabel `pelajars` secara atomik dalam satu transaksi database.
3. IF skor pada attempt bernilai negatif atau melebihi 100, THEN THE Gamification_Service SHALL menolak kalkulasi XP dan mengembalikan kode status HTTP 422 beserta pesan kesalahan yang menjelaskan bahwa skor tidak valid.
4. THE Gamification_Service SHALL memastikan nilai kolom `xp` pada tabel `pelajars` tidak pernah bernilai negatif setelah operasi penambahan XP.
5. WHEN Submission_Flow selesai diproses, THE Gamification_API SHALL menyertakan field `xp_gained` dan `total_xp` di dalam response body `POST /api/attempts/submit`.

---

### Persyaratan 2: Level Rank Otomatis

**User Story:** Sebagai pelajar, saya ingin level rank saya naik secara otomatis seiring bertambahnya XP, sehingga saya merasakan perkembangan yang nyata dalam perjalanan belajar saya.

#### Kriteria Penerimaan

1. WHEN Gamification_Service selesai memperbarui Total_XP pelajar, THE Gamification_Service SHALL mengevaluasi ulang Level_Rank pelajar tersebut berdasarkan tabel ambang batas berikut:
   - Level Rank 1 (Pemula): Total_XP 0–499
   - Level Rank 2 (Pelajar): Total_XP 500–1499
   - Level Rank 3 (Mahir): Total_XP 1500–2999
   - Level Rank 4 (Ahli): Total_XP 3000–5999
   - Level Rank 5 (Master): Total_XP ≥ 6000
2. WHEN hasil evaluasi menunjukkan Level_Rank baru lebih tinggi dari Level_Rank saat ini, THE Gamification_Service SHALL memperbarui kolom `level_rank` pada tabel `pelajars` dalam transaksi yang sama dengan pembaruan XP.
3. THE Gamification_Service SHALL memastikan Level_Rank pelajar tidak pernah turun akibat pembaruan XP (Level_Rank bersifat monoton naik).
4. WHEN Submission_Flow selesai diproses dan terjadi kenaikan Level_Rank, THE Gamification_API SHALL menyertakan field `level_rank_up` bernilai `true` dan `new_level_rank` di dalam response body `POST /api/attempts/submit`.
5. WHEN Submission_Flow selesai diproses dan tidak terjadi kenaikan Level_Rank, THE Gamification_API SHALL menyertakan field `level_rank_up` bernilai `false` di dalam response body `POST /api/attempts/submit`.

---

### Persyaratan 3: Sistem Badge

**User Story:** Sebagai pelajar, saya ingin menerima badge atas pencapaian tertentu, sehingga saya termotivasi untuk mencapai target-target khusus dalam belajar.

#### Kriteria Penerimaan

1. THE Gamification_Service SHALL mengevaluasi kelayakan badge pelajar setiap kali Submission_Flow dipanggil, setelah XP dan Level_Rank diperbarui.
2. WHEN seorang pelajar memperoleh skor 100 pada sebuah attempt untuk pertama kalinya, THE Gamification_Service SHALL memberikan badge "Skor Sempurna" kepada pelajar tersebut.
3. WHEN seorang pelajar menyelesaikan sebuah level (skor ≥ 75) untuk pertama kalinya pada level tersebut, THE Gamification_Service SHALL memberikan badge "Lulus Pertama Kali" spesifik untuk level tersebut kepada pelajar tersebut.
4. WHEN seorang pelajar mencapai Total_XP ≥ 1000 untuk pertama kalinya, THE Gamification_Service SHALL memberikan badge "Pelajar Rajin" kepada pelajar tersebut.
5. WHEN seorang pelajar mencapai Total_XP ≥ 5000 untuk pertama kalinya, THE Gamification_Service SHALL memberikan badge "Pejuang XP" kepada pelajar tersebut.
6. IF badge yang dievaluasi sudah dimiliki pelajar (terdapat rekaman di tabel `pelajar_badges`), THEN THE Gamification_Service SHALL tidak menambahkan duplikat badge tersebut ke pelajar yang sama.
7. WHEN Submission_Flow selesai diproses, THE Gamification_API SHALL menyertakan field `new_badges` berupa array yang berisi daftar badge yang baru diperoleh pada attempt tersebut di dalam response body `POST /api/attempts/submit`. Array kosong `[]` dikembalikan jika tidak ada badge baru.
8. WHEN Flutter_Client memanggil `GET /api/pelajar/:id/badges`, THE Gamification_API SHALL mengembalikan seluruh badge yang dimiliki pelajar dengan id tersebut beserta field `badge_name`, `badge_description`, dan `obtained_at`.
9. IF `id` pelajar pada `GET /api/pelajar/:id/badges` tidak ditemukan di database, THEN THE Gamification_API SHALL mengembalikan kode status HTTP 404 beserta pesan bahwa pelajar tidak ditemukan.

---

### Persyaratan 4: Leaderboard Berbasis XP

**User Story:** Sebagai pelajar, saya ingin melihat peringkat saya dibandingkan pelajar lain berdasarkan total XP, sehingga saya terdorong untuk belajar lebih giat dan bersaing secara sehat.

#### Kriteria Penerimaan

1. WHEN Flutter_Client memanggil `GET /api/leaderboard`, THE Gamification_API SHALL mengembalikan daftar maksimum 50 pelajar terurut secara menurun (descending) berdasarkan kolom `xp` di tabel `pelajars`, masing-masing menyertakan field `id`, `nama`, `total_xp`, dan `level_rank`.
2. WHEN Flutter_Client memanggil `GET /api/leaderboard?level_id={id}`, THE Gamification_API SHALL mengembalikan daftar maksimum 10 pelajar terurut secara menurun berdasarkan rata-rata skor attempt pada level tersebut, masing-masing menyertakan field `id`, `nama`, `average_score`, dan `total_attempts`.
3. WHEN Flutter_Client memanggil `GET /api/leaderboard` dengan parameter `page` (integer positif) dan `limit` (integer 1–50), THE Gamification_API SHALL mengembalikan subset pelajar yang sesuai dengan parameter paginasi tersebut.
4. IF parameter `limit` pada `GET /api/leaderboard` melebihi 50, THEN THE Gamification_API SHALL menggunakan nilai 50 sebagai batas maksimum dan mengembalikan respons normal tanpa error.
5. WHEN leaderboard global tidak memiliki data pelajar, THE Gamification_API SHALL mengembalikan array kosong dengan kode status HTTP 200.
6. WHEN Flutter_Client memanggil `GET /api/leaderboard?level_id={id}` dengan `id` level yang tidak ada di database, THE Gamification_API SHALL mengembalikan kode status HTTP 404 beserta pesan bahwa level tidak ditemukan.

---

### Persyaratan 5: Statistik Pelajar

**User Story:** Sebagai pelajar, saya ingin melihat ringkasan statistik gamifikasi saya, sehingga saya dapat memantau perkembangan XP, Level Rank, dan badge yang telah saya kumpulkan di satu tempat.

#### Kriteria Penerimaan

1. WHEN Flutter_Client memanggil `GET /api/pelajar/:id/stats`, THE Gamification_API SHALL mengembalikan data pelajar dengan field `id`, `nama`, `total_xp`, `level_rank`, `total_badges`, dan `global_rank` (posisi pelajar tersebut di leaderboard global).
2. IF `id` pelajar pada `GET /api/pelajar/:id/stats` tidak ditemukan di database, THEN THE Gamification_API SHALL mengembalikan kode status HTTP 404 beserta pesan bahwa pelajar tidak ditemukan.
3. WHILE pelajar belum menyelesaikan satu pun attempt, THE Gamification_API SHALL mengembalikan `total_xp` bernilai 0, `level_rank` bernilai 1, dan `total_badges` bernilai 0 pada endpoint `GET /api/pelajar/:id/stats`.

---

### Persyaratan 6: Integrasi Flutter Client

**User Story:** Sebagai pelajar, saya ingin melihat animasi dan notifikasi ketika mendapatkan XP, naik level, atau menerima badge baru setelah menyelesaikan kuis, sehingga pengalaman belajar terasa lebih menyenangkan dan interaktif.

#### Kriteria Penerimaan

1. WHEN Flutter_Client menerima response sukses dari `POST /api/attempts/submit`, THE Flutter_Client SHALL menampilkan nilai `xp_gained` kepada pelajar pada layar hasil kuis.
2. WHEN Flutter_Client menerima `level_rank_up` bernilai `true` dari response `POST /api/attempts/submit`, THE Flutter_Client SHALL menampilkan notifikasi kenaikan level kepada pelajar.
3. WHEN Flutter_Client menerima array `new_badges` yang tidak kosong dari response `POST /api/attempts/submit`, THE Flutter_Client SHALL menampilkan notifikasi untuk setiap badge baru yang diterima pelajar.
4. WHEN Flutter_Client memuat halaman profil pelajar, THE Flutter_Client SHALL memanggil `GET /api/pelajar/:id/stats` dan menampilkan `total_xp`, `level_rank`, dan `total_badges`.
5. WHEN Flutter_Client memuat halaman leaderboard, THE Flutter_Client SHALL memanggil `GET /api/leaderboard` dan menampilkan daftar peringkat pelajar berdasarkan XP.
6. IF Flutter_Client menerima response kode status HTTP 4xx atau 5xx dari Gamification_API, THEN THE Flutter_Client SHALL menampilkan pesan kesalahan yang informatif kepada pelajar tanpa menyebabkan crash pada aplikasi.

---

### Persyaratan 7: Integritas Data dan Konsistensi Transaksi

**User Story:** Sebagai pengelola sistem, saya ingin semua pembaruan data gamifikasi dilakukan secara atomik dan konsisten, sehingga tidak ada kondisi data yang korup akibat kegagalan sebagian operasi.

#### Kriteria Penerimaan

1. WHEN Gamification_Service memproses Submission_Flow, THE Gamification_Service SHALL menjalankan seluruh operasi pembaruan XP, Level_Rank, dan evaluasi badge dalam satu transaksi database tunggal.
2. IF terjadi kegagalan pada salah satu operasi di dalam transaksi Submission_Flow (misalnya kegagalan menulis ke database), THEN THE Gamification_Service SHALL melakukan rollback seluruh transaksi dan mengembalikan kode status HTTP 500 beserta pesan kesalahan.
3. THE Gamification_Service SHALL menggunakan mekanisme penguncian optimistik atau transaksi serializable untuk mencegah kondisi race condition pada pembaruan kolom `xp` ketika pelajar yang sama mengirimkan lebih dari satu attempt secara bersamaan.
4. THE Gamification_Service SHALL memastikan setiap badge hanya dapat diberikan satu kali kepada seorang pelajar, dengan mengandalkan constraint unik pada kombinasi `(id_pelajar, id_badge)` di tabel `pelajar_badges`.

---

### Persyaratan 8: Skema Database

**User Story:** Sebagai pengembang backend, saya ingin perubahan skema database didefinisikan dengan jelas, sehingga migrasi Prisma dapat dijalankan tanpa konflik dengan data yang sudah ada.

#### Kriteria Penerimaan

1. THE Gamification_Service SHALL menggunakan tabel `pelajars` yang sudah ada dengan penambahan kolom `xp` bertipe `Int` dengan nilai default 0 dan kolom `level_rank` bertipe `Int` dengan nilai default 1.
2. THE Gamification_Service SHALL menggunakan tabel `attempts` yang sudah ada dengan penambahan kolom `created_at` bertipe `DateTime` dengan nilai default `now()`.
3. THE Gamification_Service SHALL menggunakan tabel baru `badges` dengan kolom: `id` (Int, PK, autoincrement), `name` (String, unik), `description` (String), `criteria_type` (String).
4. THE Gamification_Service SHALL menggunakan tabel baru `pelajar_badges` dengan kolom: `id` (Int, PK, autoincrement), `id_pelajar` (Int, FK ke `pelajars.id`), `id_badge` (Int, FK ke `badges.id`), `obtained_at` (DateTime, default `now()`), serta constraint unik pada pasangan `(id_pelajar, id_badge)`.
