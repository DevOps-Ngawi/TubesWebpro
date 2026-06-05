/**
 * Property-Based Tests for calculateXp
 * Feature: gamifikasi-logilearn
 *
 * Validates: Requirements 1.1, 1.3
 */

const fc = require('fast-check');
const { calculateXp } = require('../../src/services/gamificationService');

describe('calculateXp — Property-Based Tests', () => {
  // Feature: gamifikasi-logilearn, Property 1: XP Calculation Bounds
  // Validates: Requirements 1.1
  it('xp_gained selalu dalam [0, 100] untuk skor valid', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }),
        (score) => {
          const xp = calculateXp(score);
          return xp >= 0 && xp <= 100 && xp === Math.floor(score);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: gamifikasi-logilearn, Property 8: Invalid Score Rejection
  // Validates: Requirements 1.3
  it('skor di luar [0, 100] harus direjek', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.float({ max: -0.001, noNaN: true }),
          fc.float({ min: 100.001, max: 1e6, noNaN: true })
        ),
        (invalidScore) => {
          expect(() => calculateXp(invalidScore)).toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
