/**
 * Test Suite: gamificationService.js — calculateXp, determineRank, evaluateBadges
 * Framework: Jest
 * Requirements: 1.1, 1.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

const { calculateXp, evaluateBadges } = require('../../src/services/gamificationService');

describe('calculateXp(score)', () => {
  describe('Skor valid (0–100)', () => {
    test('skor 0 menghasilkan XP 0', () => {
      expect(calculateXp(0)).toBe(0);
    });

    test('skor 100 menghasilkan XP 100', () => {
      expect(calculateXp(100)).toBe(100);
    });

    test('skor 50 menghasilkan XP 50', () => {
      expect(calculateXp(50)).toBe(50);
    });

    test('skor desimal 99.9 dibulatkan ke bawah menjadi 99', () => {
      expect(calculateXp(99.9)).toBe(99);
    });

    test('skor desimal 75.5 dibulatkan ke bawah menjadi 75', () => {
      expect(calculateXp(75.5)).toBe(75);
    });

    test('skor 1 menghasilkan XP 1', () => {
      expect(calculateXp(1)).toBe(1);
    });

    test('skor desimal 0.9 dibulatkan ke bawah menjadi 0', () => {
      expect(calculateXp(0.9)).toBe(0);
    });
  });

  describe('Skor tidak valid (di luar [0, 100])', () => {
    test('skor negatif -1 melempar error dengan status 422', () => {
      expect(() => calculateXp(-1)).toThrow('Skor tidak valid: harus berada dalam rentang 0–100');
    });

    test('skor -0.001 melempar error', () => {
      expect(() => calculateXp(-0.001)).toThrow();
    });

    test('skor 101 melempar error dengan status 422', () => {
      expect(() => calculateXp(101)).toThrow('Skor tidak valid: harus berada dalam rentang 0–100');
    });

    test('skor 100.001 melempar error', () => {
      expect(() => calculateXp(100.001)).toThrow();
    });

    test('error memiliki properti status 422 untuk skor negatif', () => {
      let err;
      try {
        calculateXp(-10);
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.status).toBe(422);
    });

    test('error memiliki properti status 422 untuk skor > 100', () => {
      let err;
      try {
        calculateXp(200);
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.status).toBe(422);
    });
  });

  describe('Hasil XP selalu dalam rentang [0, 100] untuk skor valid', () => {
    const validScores = [0, 10, 25, 50, 75, 90, 99, 100];

    validScores.forEach((score) => {
      test(`xp untuk skor ${score} berada dalam [0, 100]`, () => {
        const xp = calculateXp(score);
        expect(xp).toBeGreaterThanOrEqual(0);
        expect(xp).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Formula: floor(score * 1.0)', () => {
    test('hasil calculateXp selalu sama dengan Math.floor(score) untuk skor valid', () => {
      const testScores = [0, 33.3, 50, 66.7, 80, 99.9, 100];
      testScores.forEach((score) => {
        expect(calculateXp(score)).toBe(Math.floor(score));
      });
    });
  });
});

/**
 * Test Suite: gamificationService.js — evaluateBadges
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

describe('evaluateBadges(context)', () => {
  // Konteks dasar tanpa badge yang sudah dimiliki
  const baseContext = {
    skor: 0,
    total_xp: 0,
    id_level: 1,
    id_pelajar: 1,
    existingBadgeTypes: [],
    isFirstPerfectScore: false,
    isFirstPassOnLevel: false,
  };

  describe('PERFECT_SCORE badge', () => {
    test('memberikan PERFECT_SCORE ketika skor === 100 dan isFirstPerfectScore === true', () => {
      const context = { ...baseContext, skor: 100, isFirstPerfectScore: true };
      expect(evaluateBadges(context)).toContain('PERFECT_SCORE');
    });

    test('tidak memberikan PERFECT_SCORE ketika skor < 100', () => {
      const context = { ...baseContext, skor: 99, isFirstPerfectScore: true };
      expect(evaluateBadges(context)).not.toContain('PERFECT_SCORE');
    });

    test('tidak memberikan PERFECT_SCORE ketika isFirstPerfectScore === false', () => {
      const context = { ...baseContext, skor: 100, isFirstPerfectScore: false };
      expect(evaluateBadges(context)).not.toContain('PERFECT_SCORE');
    });

    test('tidak memberikan PERFECT_SCORE jika sudah ada di existingBadgeTypes', () => {
      const context = {
        ...baseContext,
        skor: 100,
        isFirstPerfectScore: true,
        existingBadgeTypes: ['PERFECT_SCORE'],
      };
      expect(evaluateBadges(context)).not.toContain('PERFECT_SCORE');
    });
  });

  describe('FIRST_PASS badge', () => {
    test('memberikan FIRST_PASS ketika skor >= 75 dan isFirstPassOnLevel === true', () => {
      const context = { ...baseContext, skor: 75, isFirstPassOnLevel: true };
      expect(evaluateBadges(context)).toContain('FIRST_PASS');
    });

    test('memberikan FIRST_PASS untuk skor tepat 100 dengan isFirstPassOnLevel === true', () => {
      const context = { ...baseContext, skor: 100, isFirstPassOnLevel: true };
      expect(evaluateBadges(context)).toContain('FIRST_PASS');
    });

    test('tidak memberikan FIRST_PASS ketika skor < 75', () => {
      const context = { ...baseContext, skor: 74, isFirstPassOnLevel: true };
      expect(evaluateBadges(context)).not.toContain('FIRST_PASS');
    });

    test('tidak memberikan FIRST_PASS ketika isFirstPassOnLevel === false', () => {
      const context = { ...baseContext, skor: 80, isFirstPassOnLevel: false };
      expect(evaluateBadges(context)).not.toContain('FIRST_PASS');
    });

    test('tidak memberikan FIRST_PASS jika sudah ada di existingBadgeTypes', () => {
      const context = {
        ...baseContext,
        skor: 80,
        isFirstPassOnLevel: true,
        existingBadgeTypes: ['FIRST_PASS'],
      };
      expect(evaluateBadges(context)).not.toContain('FIRST_PASS');
    });
  });

  describe('XP_1000 badge', () => {
    test('memberikan XP_1000 ketika total_xp >= 1000', () => {
      const context = { ...baseContext, total_xp: 1000 };
      expect(evaluateBadges(context)).toContain('XP_1000');
    });

    test('memberikan XP_1000 ketika total_xp > 1000', () => {
      const context = { ...baseContext, total_xp: 2500 };
      expect(evaluateBadges(context)).toContain('XP_1000');
    });

    test('tidak memberikan XP_1000 ketika total_xp < 1000', () => {
      const context = { ...baseContext, total_xp: 999 };
      expect(evaluateBadges(context)).not.toContain('XP_1000');
    });

    test('tidak memberikan XP_1000 jika sudah ada di existingBadgeTypes', () => {
      const context = {
        ...baseContext,
        total_xp: 1000,
        existingBadgeTypes: ['XP_1000'],
      };
      expect(evaluateBadges(context)).not.toContain('XP_1000');
    });
  });

  describe('XP_5000 badge', () => {
    test('memberikan XP_5000 ketika total_xp >= 5000', () => {
      const context = { ...baseContext, total_xp: 5000 };
      expect(evaluateBadges(context)).toContain('XP_5000');
    });

    test('memberikan XP_5000 ketika total_xp > 5000', () => {
      const context = { ...baseContext, total_xp: 7000 };
      expect(evaluateBadges(context)).toContain('XP_5000');
    });

    test('tidak memberikan XP_5000 ketika total_xp < 5000', () => {
      const context = { ...baseContext, total_xp: 4999 };
      expect(evaluateBadges(context)).not.toContain('XP_5000');
    });

    test('tidak memberikan XP_5000 jika sudah ada di existingBadgeTypes', () => {
      const context = {
        ...baseContext,
        total_xp: 5000,
        existingBadgeTypes: ['XP_5000'],
      };
      expect(evaluateBadges(context)).not.toContain('XP_5000');
    });

    test('XP_5000 juga memberikan XP_1000 jika belum dimiliki', () => {
      const context = { ...baseContext, total_xp: 5000 };
      const result = evaluateBadges(context);
      expect(result).toContain('XP_1000');
      expect(result).toContain('XP_5000');
    });
  });

  describe('Tidak ada badge baru', () => {
    test('mengembalikan array kosong ketika tidak ada badge yang memenuhi syarat', () => {
      const context = { ...baseContext, skor: 50, total_xp: 500 };
      expect(evaluateBadges(context)).toEqual([]);
    });

    test('mengembalikan array kosong ketika semua badge sudah dimiliki', () => {
      const context = {
        ...baseContext,
        skor: 100,
        total_xp: 5000,
        isFirstPerfectScore: true,
        isFirstPassOnLevel: true,
        existingBadgeTypes: ['PERFECT_SCORE', 'FIRST_PASS', 'XP_1000', 'XP_5000'],
      };
      expect(evaluateBadges(context)).toEqual([]);
    });
  });

  describe('Beberapa badge sekaligus', () => {
    test('dapat memberikan semua badge sekaligus dalam satu context', () => {
      const context = {
        ...baseContext,
        skor: 100,
        total_xp: 5000,
        isFirstPerfectScore: true,
        isFirstPassOnLevel: true,
        existingBadgeTypes: [],
      };
      const result = evaluateBadges(context);
      expect(result).toContain('PERFECT_SCORE');
      expect(result).toContain('FIRST_PASS');
      expect(result).toContain('XP_1000');
      expect(result).toContain('XP_5000');
      expect(result).toHaveLength(4);
    });
  });
});
