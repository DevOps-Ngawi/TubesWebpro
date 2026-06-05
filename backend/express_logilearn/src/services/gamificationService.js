/**
 * Gamification Service
 * Handles XP calculation, level rank determination, and badge evaluation.
 *
 * Requirements: 1.1, 1.3, 2.1, 3.x
 */

/**
 * Menghitung XP yang diperoleh dari sebuah skor attempt.
 *
 * Formula: floor(score * 1.0)
 * Skor harus berada dalam rentang [0, 100].
 *
 * @param {number} score - Skor persentase attempt (0–100)
 * @returns {number} XP yang diperoleh (0–100)
 * @throws {Error} Jika skor di luar rentang [0, 100] (HTTP 422)
 *
 * Validates: Requirements 1.1, 1.3
 */
function calculateXp(score) {
  if (score < 0 || score > 100) {
    const err = new Error('Skor tidak valid: harus berada dalam rentang 0–100');
    err.status = 422;
    throw err;
  }
  return Math.floor(score * 1.0);
}

/**
 * Menentukan Level Rank berdasarkan total XP kumulatif pelajar.
 *
 * Threshold:
 *   Rank 1 (Pemula)  : 0     – 499
 *   Rank 2 (Pelajar) : 500   – 1499
 *   Rank 3 (Mahir)   : 1500  – 2999
 *   Rank 4 (Ahli)    : 3000  – 5999
 *   Rank 5 (Master)  : ≥ 6000
 *
 * @param {number} totalXp - Total XP kumulatif pelajar (integer non-negatif)
 * @returns {number} Level Rank (1–5)
 *
 * Validates: Requirements 2.1
 */
function determineRank(totalXp) {
  if (totalXp >= 6000) return 5;
  if (totalXp >= 3000) return 4;
  if (totalXp >= 1500) return 3;
  if (totalXp >= 500) return 2;
  return 1;
}

/**
 * Mengevaluasi badge baru yang diperoleh pelajar berdasarkan konteks attempt.
 *
 * Badge yang dievaluasi:
 *   - PERFECT_SCORE : skor === 100 untuk pertama kalinya
 *   - FIRST_PASS    : skor >= 75 di level ini untuk pertama kalinya
 *   - XP_1000       : total_xp >= 1000 untuk pertama kalinya
 *   - XP_5000       : total_xp >= 5000 untuk pertama kalinya
 *
 * Tidak mengembalikan badge yang sudah ada di `existingBadgeTypes`.
 *
 * @param {{
 *   skor: number,
 *   total_xp: number,
 *   id_level: number,
 *   id_pelajar: number,
 *   existingBadgeTypes: string[],
 *   isFirstPerfectScore: boolean,
 *   isFirstPassOnLevel: boolean
 * }} context
 * @returns {string[]} Daftar criteria_type badge baru yang diperoleh
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */
function evaluateBadges(context) {
  const { skor, total_xp, existingBadgeTypes, isFirstPerfectScore, isFirstPassOnLevel } = context;
  const newBadgeTypes = [];

  // PERFECT_SCORE: skor 100 untuk pertama kali
  if (isFirstPerfectScore && skor === 100 && !existingBadgeTypes.includes('PERFECT_SCORE')) {
    newBadgeTypes.push('PERFECT_SCORE');
  }

  // FIRST_PASS: skor >= 75 di level ini untuk pertama kali
  if (isFirstPassOnLevel && skor >= 75 && !existingBadgeTypes.includes('FIRST_PASS')) {
    newBadgeTypes.push('FIRST_PASS');
  }

  // XP_1000: total_xp >= 1000
  if (total_xp >= 1000 && !existingBadgeTypes.includes('XP_1000')) {
    newBadgeTypes.push('XP_1000');
  }

  // XP_5000: total_xp >= 5000
  if (total_xp >= 5000 && !existingBadgeTypes.includes('XP_5000')) {
    newBadgeTypes.push('XP_5000');
  }

  return newBadgeTypes;
}

module.exports = { calculateXp, determineRank, evaluateBadges };
