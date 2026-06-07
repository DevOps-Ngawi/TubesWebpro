# Implementation Plan: Gamifikasi LogiLearn

## Overview

Implementasi sistem gamifikasi LogiLearn mencakup empat komponen inti: XP, Level Rank otomatis, Badge pencapaian, dan Leaderboard berbasis XP. Backend dibangun dengan Express.js + Prisma ORM + PostgreSQL, frontend dengan Flutter. Semua logika gamifikasi dijalankan atomik di dalam satu transaksi Prisma yang dipicu oleh `POST /api/attempts/submit`.

## Tasks

- [x] 1. Persiapan database — migrasi Prisma dan seed data badge
  - [x] 1.1 Tambahkan kolom `xp` (Int, default 0) dan `level_rank` (Int, default 1) ke model `pelajars` di `prisma/schema.prisma`
    - Tambahkan relasi `pelajar_badges pelajar_badges[]` pada model `pelajars`
    - _Requirements: 8.1_
  - [x] 1.2 Tambahkan kolom `created_at` (DateTime, default now()) ke model `attempts` di `prisma/schema.prisma`
    - _Requirements: 8.2_
  - [x] 1.3 Buat model `badges` dan `pelajar_badges` baru di `prisma/schema.prisma`
    - `badges`: id, name (unique), description, criteria_type
    - `pelajar_badges`: id, id_pelajar (FK), id_badge (FK), obtained_at (default now()), @@unique([id_pelajar, id_badge]), @@index([id_pelajar])
    - _Requirements: 8.3, 8.4, 7.4_
  - [x] 1.4 Jalankan `npx prisma migrate dev` untuk menerapkan perubahan skema dan buat file migrasi
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 1.5 Tambahkan seed data 4 badge ke `prisma/seed.js` (PERFECT_SCORE, FIRST_PASS, XP_1000, XP_5000)
    - Seed: "Skor Sempurna", "Lulus Pertama Kali", "Pelajar Rajin", "Pejuang XP"
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 2. Implementasi GamificationService — pure functions dan logika inti
  - [x] 2.1 Buat file `src/services/gamificationService.js` dengan pure function `calculateXp(score)`
    - Formula: `return Math.floor(score * 1.0)` untuk skor 0–100
    - Lempar error untuk skor di luar rentang [0, 100]
    - _Requirements: 1.1, 1.3_
  - [-]* 2.2 Tulis property test untuk `calculateXp` (Property 1 & 8)
    - **Property 1: XP Calculation Bounds** — skor valid [0,100] menghasilkan xp dalam [0,100] dan === Math.floor(score)
    - **Validates: Requirements 1.1**
    - **Property 8: Invalid Score Rejection** — skor < 0 atau > 100 harus throw error, tidak ada DB write
    - **Validates: Requirements 1.3**
    - Gunakan `fast-check` dengan `numRuns: 100`
  - [x] 2.3 Implementasi pure function `determineRank(totalXp)` di `gamificationService.js`
    - Return 1 (0–499), 2 (500–1499), 3 (1500–2999), 4 (3000–5999), 5 (≥6000)
    - _Requirements: 2.1_
  - [-]* 2.4 Tulis property test untuk `determineRank` (Property 3 & 4)
    - **Property 3: Level Rank Determination** — semua total_xp non-negatif menghasilkan rank dalam {1,2,3,4,5}, konsisten dengan threshold
    - **Validates: Requirements 2.1**
    - **Property 4: Level Rank Monotonicity** — rank(xp + delta) >= rank(xp) untuk delta >= 0
    - **Validates: Requirements 2.3**
    - Gunakan `fast-check` dengan `numRuns: 100`
  - [x] 2.5 Implementasi pure function `evaluateBadges(context)` di `gamificationService.js`
    - Evaluasi PERFECT_SCORE, FIRST_PASS, XP_1000, XP_5000 berdasarkan context
    - Tidak mengembalikan badge yang sudah ada di `existingBadgeTypes`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 2.6 Tulis unit test untuk `evaluateBadges` di file test terpisah
    - Test setiap skenario badge secara terisolasi (PERFECT_SCORE, FIRST_PASS, XP_1000, XP_5000)
    - Test kasus tidak ada badge baru, badge sudah dimiliki (idempotency)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [~] 2.7 Implementasi fungsi utama `process(tx, id_pelajar, skor, id_level, id_attempt)` di `gamificationService.js`
    - Panggil `calculateXp`, `determineRank`, update pelajar atomik dengan `tx.pelajars.update({ data: { xp: { increment: xp_gained } } })`
    - Pastikan `level_rank` tidak pernah turun (monoton naik): gunakan `Math.max(currentRank, newRank)`
    - Evaluasi badge, insert ke `pelajar_badges` dengan `createMany({ skipDuplicates: true })`
    - Return `GamificationResult`: { xp_gained, total_xp, level_rank_up, new_level_rank, new_badges }
    - _Requirements: 1.2, 1.4, 2.2, 2.3, 3.1, 7.1, 7.3, 7.4_
  - [ ]* 2.8 Tulis property test untuk XP Monotonicity dan Badge Idempotency (Property 2 & 5)
    - **Property 2: XP Monotonicity** — total_xp setelah attempt >= total_xp sebelumnya untuk skor ≥ 0
    - **Validates: Requirements 1.4, 7.1**
    - **Property 5: Badge Idempotency** — panggil process berkali-kali dengan kondisi yang sama menghasilkan badge tersimpan tepat sekali
    - **Validates: Requirements 3.6, 7.4**
    - Gunakan `fast-check` dengan `numRuns: 100`

- [~] 3. Checkpoint — Pastikan semua unit test dan property test GamificationService lulus
  - Pastikan semua tests pass, tanya user jika ada pertanyaan.

- [ ] 4. Modifikasi AttemptController — integrasi GamificationService ke Submission_Flow
  - [~] 4.1 Modifikasi `src/models/attempt.js`: buat method `recalculateScoreWithGamification(id_attempt)` yang transaction-aware
    - Bungkus dalam `prisma.$transaction`, panggil `gamificationService.process` di dalam tx
    - Pertahankan fungsi `recalculateScore` lama agar backward-compatible
    - Return `{ attempt, gamification: GamificationResult }`
    - _Requirements: 7.1, 7.2_
  - [~] 4.2 Modifikasi `src/controllers/attemptController.js` pada handler `submit`
    - Panggil `Attempt.recalculateScoreWithGamification` alih-alih `recalculateScore`
    - Tambahkan `xp_gained`, `total_xp`, `level_rank_up`, `new_level_rank`, `new_badges` ke response body
    - Tangani error 422 (skor invalid) dan 500 (kegagalan transaksi) sesuai design
    - _Requirements: 1.5, 2.4, 2.5, 3.7, 7.2_
  - [ ]* 4.3 Tulis integration test untuk `POST /api/attempts/submit`
    - Verifikasi response body mencakup semua field gamifikasi
    - Verifikasi HTTP 422 untuk skor invalid
    - Verifikasi HTTP 500 dan rollback jika transaksi gagal
    - _Requirements: 1.5, 2.4, 2.5, 3.7, 7.2_

- [ ] 5. Implementasi Leaderboard Controller dan Route
  - [~] 5.1 Buat `src/controllers/leaderboardController.js` dengan fungsi `getGlobalLeaderboard`
    - Query `pelajars` ORDER BY xp DESC, LIMIT capped 50, mendukung pagination `?page=&limit=`
    - Return array `{ rank, id, nama, total_xp, level_rank }` dengan pagination metadata
    - Kembalikan array kosong (200) jika tidak ada data
    - _Requirements: 4.1, 4.3, 4.4, 4.5_
  - [~] 5.2 Tambahkan fungsi `getLevelLeaderboard` ke `leaderboardController.js`
    - Query attempts GROUP BY id_pelajar WHERE id_level = {id}, ORDER BY AVG(skor) DESC, LIMIT 10
    - Return array `{ rank, id, nama, average_score, total_attempts }`
    - Kembalikan HTTP 404 jika level_id tidak ditemukan
    - _Requirements: 4.2, 4.6_
  - [ ]* 5.3 Tulis property test untuk Leaderboard Ordering dan Pagination Consistency (Property 6 & 7)
    - **Property 6: Leaderboard Ordering Invariant** — setiap dua entry berurutan pada response harus total_xp[i] >= total_xp[i+1]
    - **Validates: Requirements 4.1**
    - **Property 7: Leaderboard Pagination Consistency** — union semua halaman = prefix full leaderboard, tanpa duplikat dan tanpa gap
    - **Validates: Requirements 4.3**
    - Gunakan `fast-check` dengan `numRuns: 100`
  - [~] 5.4 Buat `src/routes/leaderboardRoutes.js` dan daftarkan ke `src/app.js`
    - `GET /api/leaderboard` → `getGlobalLeaderboard`
    - `GET /api/leaderboard?level_id={id}` → `getLevelLeaderboard`
    - _Requirements: 4.1, 4.2_
  - [ ]* 5.5 Tulis integration test untuk endpoint leaderboard
    - Verifikasi urutan descending global leaderboard
    - Verifikasi capping limit > 50 menggunakan 50
    - Verifikasi HTTP 404 untuk level_id tidak ditemukan
    - Verifikasi array kosong untuk leaderboard tanpa data
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6_

- [~] 6. Checkpoint — Pastikan semua tests leaderboard lulus
  - Pastikan semua tests pass, tanya user jika ada pertanyaan.

- [ ] 7. Implementasi endpoint Stats dan Badges di Pelajar Controller
  - [~] 7.1 Tambahkan fungsi `getStats` ke `src/controllers/pelajarController.js`
    - Query pelajar by id, hitung `global_rank` dengan subquery COUNT pelajar yang XP-nya lebih tinggi
    - Return `{ id, nama, total_xp, level_rank, total_badges, global_rank }`
    - Default: `total_xp=0`, `level_rank=1`, `total_badges=0` untuk pelajar tanpa attempt
    - Kembalikan HTTP 404 jika id tidak ditemukan
    - _Requirements: 5.1, 5.2, 5.3_
  - [~] 7.2 Tambahkan fungsi `getBadges` ke `src/controllers/pelajarController.js`
    - Query `pelajar_badges` JOIN `badges` WHERE id_pelajar = id
    - Return array `{ badge_name, badge_description, obtained_at }`
    - Kembalikan HTTP 404 jika id pelajar tidak ditemukan
    - _Requirements: 3.8, 3.9_
  - [~] 7.3 Modifikasi `src/routes/pelajarRoutes.js`: tambahkan route `GET /api/pelajar/:id/stats` dan `GET /api/pelajar/:id/badges`
    - _Requirements: 5.1, 3.8_
  - [ ]* 7.4 Tulis integration test untuk endpoint stats dan badges
    - Verifikasi semua field stats untuk pelajar dengan dan tanpa attempt
    - Verifikasi HTTP 404 untuk id tidak dikenal pada kedua endpoint
    - Verifikasi default values (total_xp=0, level_rank=1, total_badges=0)
    - _Requirements: 5.1, 5.2, 5.3, 3.8, 3.9_

- [ ] 8. Implementasi Flutter Client — integrasi response gamifikasi di QuizResultScreen
  - [~] 8.1 Update model/DTO Dart untuk `AttemptSubmitResponse` agar menyertakan field gamifikasi
    - Tambahkan: `xp_gained`, `total_xp`, `level_rank_up`, `new_level_rank`, `new_badges` (List)
    - _Requirements: 1.5, 2.4, 2.5, 3.7_
  - [~] 8.2 Modifikasi `QuizResultScreen` untuk menampilkan `xp_gained` dari response
    - Tampilkan nilai XP yang diperoleh pada layar hasil kuis
    - _Requirements: 6.1_
  - [~] 8.3 Tambahkan notifikasi kenaikan level ke `QuizResultScreen` jika `level_rank_up == true`
    - Tampilkan dialog atau banner dengan `new_level_rank`
    - _Requirements: 6.2_
  - [~] 8.4 Tambahkan notifikasi badge ke `QuizResultScreen` untuk setiap badge di `new_badges`
    - Iterasi array `new_badges`, tampilkan notifikasi per badge
    - _Requirements: 6.3_
  - [ ]* 8.5 Tulis widget test untuk `QuizResultScreen`
    - Test tampilan `xp_gained`
    - Test dialog level-up muncul jika `level_rank_up: true`
    - Test notifikasi badge muncul jika `new_badges` tidak kosong
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 9. Implementasi Flutter Client — halaman profil dan leaderboard
  - [~] 9.1 Modifikasi halaman profil pelajar untuk memanggil `GET /api/pelajar/:id/stats`
    - Tampilkan `total_xp`, `level_rank`, `total_badges`
    - _Requirements: 6.4_
  - [~] 9.2 Implementasi halaman leaderboard dengan memanggil `GET /api/leaderboard`
    - Tampilkan daftar peringkat pelajar berdasarkan XP
    - _Requirements: 6.5_
  - [~] 9.3 Tambahkan error handling di `ApiService` Flutter untuk semua response 4xx/5xx dari Gamification_API
    - Tampilkan pesan dari `payload.message` sebagai SnackBar atau dialog
    - Pastikan tidak ada crash pada kondisi error
    - _Requirements: 6.6_
  - [ ]* 9.4 Tulis widget test untuk halaman profil dan leaderboard
    - Test tampilan data stats pada halaman profil
    - Test tampilan daftar leaderboard
    - Test state error ditampilkan tanpa crash
    - _Requirements: 6.4, 6.5, 6.6_

- [~] 10. Final checkpoint — Pastikan semua tests (backend dan frontend) lulus
  - Pastikan semua tests pass, tanya user jika ada pertanyaan.

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task merujuk ke requirement spesifik untuk traceability
- Property-based test menggunakan `fast-check` (Jest) untuk backend, minimal 100 iterasi per properti
- Semua operasi gamifikasi backend berjalan atomik dalam satu `prisma.$transaction`
- Pure functions (`calculateXp`, `determineRank`, `evaluateBadges`) diuji secara terisolasi sebelum integrasi
- Atomic increment Prisma (`{ xp: { increment: xp_gained } }`) wajib digunakan untuk mencegah race condition
- Constraint `@@unique([id_pelajar, id_badge])` melindungi badge idempotency di level database

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4"] },
    { "id": 2, "tasks": ["1.5", "2.1", "2.3"] },
    { "id": 3, "tasks": ["2.2", "2.4", "2.5"] },
    { "id": 4, "tasks": ["2.6", "2.7"] },
    { "id": 5, "tasks": ["2.8", "4.1"] },
    { "id": 6, "tasks": ["4.2", "5.1", "5.2"] },
    { "id": 7, "tasks": ["4.3", "5.3", "5.4", "7.1", "7.2"] },
    { "id": 8, "tasks": ["5.5", "7.3", "8.1"] },
    { "id": 9, "tasks": ["7.4", "8.2", "8.3", "8.4"] },
    { "id": 10, "tasks": ["8.5", "9.1", "9.2", "9.3"] },
    { "id": 11, "tasks": ["9.4"] }
  ]
}
```
