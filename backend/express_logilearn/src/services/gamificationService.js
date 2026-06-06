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

async function process(tx, id_pelajar, skor, id_level, id_attempt) {
  // 1. Calculate XP gained
  const xp_gained = calculateXp(skor);

  // 2. Check if pelajar exists
  const pelajar = await tx.pelajars.findUnique({
    where: { id: id_pelajar }
  });
  if (!pelajar) {
    const err = new Error('Pelajar tidak ditemukan');
    err.status = 404;
    throw err;
  }

  // 3. Update XP and calculate new total XP
  let updatedPelajar;
  try {
    if (Object.prototype.hasOwnProperty.call(pelajar, 'xp')) {
      try {
        // Preferred: use atomic increment if supported by Prisma client
        updatedPelajar = await tx.pelajars.update({
          where: { id: id_pelajar },
          data: {
            xp: { increment: xp_gained }
          }
        });
      } catch (errIncrement) {
        // Fallback: some Prisma/client versions or DB states may not accept `increment` syntax
        console.error('Increment update failed, falling back to set:', errIncrement);
        const newXp = (pelajar.xp || 0) + xp_gained;
        updatedPelajar = await tx.pelajars.update({
          where: { id: id_pelajar },
          data: { xp: newXp }
        });
      }
    } else {
      // `xp` field is not present on the retrieved model — likely prisma client/schema mismatch
      console.warn('XP field missing on pelajars model; skipping xp update');
      updatedPelajar = pelajar; // continue using existing pelajar object downstream
    }
  } catch (e) {
    // If update fails, propagate a clear error
    console.error('Error updating pelajar XP:', e);
    const err = new Error('Gagal memperbarui XP pelajar');
    err.status = 500;
    throw err;
  }

  // 4. Determine level rank (ensure rank never decreases)
  const newRank = determineRank(updatedPelajar.xp);
  const new_level_rank = Math.max(pelajar.level_rank, newRank);
  const level_rank_up = new_level_rank > pelajar.level_rank;

  if (new_level_rank !== pelajar.level_rank) {
    await tx.pelajars.update({
      where: { id: id_pelajar },
      data: {
        level_rank: new_level_rank
      }
    });
  }

  // 5. Evaluate badges
  // 5.1. Fetch existing badges
  const pelajarBadges = await tx.pelajar_badges.findMany({
    where: { id_pelajar },
    include: { badges: true }
  });
  const existingBadgeTypes = pelajarBadges.map(pb => pb.badges.criteria_type);

  // 5.2. Determine isFirstPerfectScore
  const perfectCount = await tx.attempts.count({
    where: {
      id_pelajar,
      skor: 100,
      id: { not: id_attempt }
    }
  });
  const isFirstPerfectScore = perfectCount === 0;

  // 5.3. Determine isFirstPassOnLevel
  const passCount = await tx.attempts.count({
    where: {
      id_pelajar,
      id_level,
      skor: { gte: 75 },
      id: { not: id_attempt }
    }
  });
  const isFirstPassOnLevel = passCount === 0;

  // 5.4. Evaluate new badges
  const newBadgeTypes = evaluateBadges({
    skor,
    total_xp: updatedPelajar.xp,
    id_level,
    id_pelajar,
    existingBadgeTypes,
    isFirstPerfectScore,
    isFirstPassOnLevel
  });

  let newBadges = [];
  if (newBadgeTypes.length > 0) {
    // Find badge IDs
    const badgesInDb = await tx.badges.findMany({
      where: {
        criteria_type: { in: newBadgeTypes }
      }
    });

    if (badgesInDb.length > 0) {
      await tx.pelajar_badges.createMany({
        data: badgesInDb.map(b => ({
          id_pelajar,
          id_badge: b.id
        })),
        skipDuplicates: true
      });
      newBadges = badgesInDb.map(b => ({
        name: b.name,
        description: b.description
      }));
    }
  }

  return {
    xp_gained,
    total_xp: updatedPelajar.xp,
    level_rank_up,
    new_level_rank,
    new_badges: newBadges
  };
}

module.exports = { calculateXp, determineRank, evaluateBadges, process };
