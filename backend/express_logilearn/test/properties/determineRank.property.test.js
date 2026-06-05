/**
 * Property-Based Tests for determineRank
 * Feature: gamifikasi-logilearn
 *
 * Validates: Requirements 2.1, 2.3
 */

const fc = require('fast-check');
const { determineRank } = require('../../src/services/gamificationService');

describe('determineRank — Property-Based Tests', () => {
  // Feature: gamifikasi-logilearn, Property 3: Level Rank Determination
  // Validates: Requirements 2.1
  it('determineRank selalu mengembalikan rank 1-5 untuk semua XP non-negatif', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        (totalXp) => {
          const rank = determineRank(totalXp);
          expect(rank).toBeGreaterThanOrEqual(1);
          expect(rank).toBeLessThanOrEqual(5);

          // Verify exact thresholds
          if (totalXp >= 6000) {
            expect(rank).toBe(5);
          } else if (totalXp >= 3000) {
            expect(rank).toBe(4);
          } else if (totalXp >= 1500) {
            expect(rank).toBe(3);
          } else if (totalXp >= 500) {
            expect(rank).toBe(2);
          } else {
            expect(rank).toBe(1);
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: gamifikasi-logilearn, Property 4: Level Rank Monotonicity
  // Validates: Requirements 2.3
  it('Level Rank bersifat monoton naik (rank tidak pernah turun saat XP bertambah)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50000 }),
        fc.integer({ min: 0, max: 10000 }),
        (totalXp, delta) => {
          const rankBefore = determineRank(totalXp);
          const rankAfter = determineRank(totalXp + delta);
          expect(rankAfter).toBeGreaterThanOrEqual(rankBefore);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
