/**
 * Dedicated Unit Test Suite: evaluateBadges
 * File: test/services/evaluateBadges.test.js
 *
 * Menguji fungsi `evaluateBadges` dari gamificationService secara terisolasi.
 * Setiap skenario badge diuji secara terpisah sesuai kriteria penerimaan.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

const { evaluateBadges } = require('../../src/services/gamificationService');

// Konteks dasar: tidak ada badge yang sudah dimiliki, kondisi netral
const BASE_CONTEXT = {
  skor: 0,
  total_xp: 0,
  id_level: 1,
  id_pelajar: 1,
  existingBadgeTypes: [],
  isFirstPerfectScore: false,
  isFirstPassOnLevel: false,
};

// ---------------------------------------------------------------------------
// Requirement 3.2 — Badge PERFECT_SCORE
// WHEN seorang pelajar memperoleh skor 100 pada sebuah attempt untuk pertama
// kalinya, THE Gamification_Service SHALL memberikan badge "Skor Sempurna".
// ---------------------------------------------------------------------------
describe('evaluateBadges — PERFECT_SCORE (Req 3.2)', () => {
  test('memberikan PERFECT_SCORE ketika skor === 100 dan isFirstPerfectScore === true', () => {
    const context = { ...BASE_CONTEXT, skor: 100, isFirstPerfectScore: true };
    expect(evaluateBadges(context)).toContain('PERFECT_SCORE');
  });

  test('tidak memberikan PERFECT_SCORE ketika skor < 100 (boundary: 99)', () => {
    const context = { ...BASE_CONTEXT, skor: 99, isFirstPerfectScore: true };
    expect(evaluateBadges(context)).not.toContain('PERFECT_SCORE');
  });

  test('tidak memberikan PERFECT_SCORE ketika skor < 100 (skor 0)', () => {
    const context = { ...BASE_CONTEXT, skor: 0, isFirstPerfectScore: true };
    expect(evaluateBadges(context)).not.toContain('PERFECT_SCORE');
  });

  test('tidak memberikan PERFECT_SCORE ketika isFirstPerfectScore === false meskipun skor === 100', () => {
    const context = { ...BASE_CONTEXT, skor: 100, isFirstPerfectScore: false };
    expect(evaluateBadges(context)).not.toContain('PERFECT_SCORE');
  });

  // Req 3.6 — idempotency: badge sudah dimiliki tidak diduplikat
  test('tidak memberikan PERFECT_SCORE jika sudah ada di existingBadgeTypes (idempotency)', () => {
    const context = {
      ...BASE_CONTEXT,
      skor: 100,
      isFirstPerfectScore: true,
      existingBadgeTypes: ['PERFECT_SCORE'],
    };
    expect(evaluateBadges(context)).not.toContain('PERFECT_SCORE');
  });

  test('hanya mengandung PERFECT_SCORE ketika hanya syarat itu terpenuhi', () => {
    const context = { ...BASE_CONTEXT, skor: 100, isFirstPerfectScore: true };
    const result = evaluateBadges(context);
    expect(result).toContain('PERFECT_SCORE');
    expect(result).not.toContain('FIRST_PASS');
    expect(result).not.toContain('XP_1000');
    expect(result).not.toContain('XP_5000');
  });
});

// ---------------------------------------------------------------------------
// Requirement 3.3 — Badge FIRST_PASS
// WHEN seorang pelajar menyelesaikan sebuah level (skor ≥ 75) untuk pertama
// kalinya pada level tersebut, THE Gamification_Service SHALL memberikan badge
// "Lulus Pertama Kali".
// ---------------------------------------------------------------------------
describe('evaluateBadges — FIRST_PASS (Req 3.3)', () => {
  test('memberikan FIRST_PASS ketika skor tepat 75 dan isFirstPassOnLevel === true', () => {
    const context = { ...BASE_CONTEXT, skor: 75, isFirstPassOnLevel: true };
    expect(evaluateBadges(context)).toContain('FIRST_PASS');
  });

  test('memberikan FIRST_PASS ketika skor 80 dan isFirstPassOnLevel === true', () => {
    const context = { ...BASE_CONTEXT, skor: 80, isFirstPassOnLevel: true };
    expect(evaluateBadges(context)).toContain('FIRST_PASS');
  });

  test('memberikan FIRST_PASS ketika skor 100 dan isFirstPassOnLevel === true', () => {
    const context = { ...BASE_CONTEXT, skor: 100, isFirstPassOnLevel: true };
    expect(evaluateBadges(context)).toContain('FIRST_PASS');
  });

  test('tidak memberikan FIRST_PASS ketika skor tepat di bawah batas (boundary: 74)', () => {
    const context = { ...BASE_CONTEXT, skor: 74, isFirstPassOnLevel: true };
    expect(evaluateBadges(context)).not.toContain('FIRST_PASS');
  });

  test('tidak memberikan FIRST_PASS ketika skor 0 meskipun isFirstPassOnLevel === true', () => {
    const context = { ...BASE_CONTEXT, skor: 0, isFirstPassOnLevel: true };
    expect(evaluateBadges(context)).not.toContain('FIRST_PASS');
  });

  test('tidak memberikan FIRST_PASS ketika isFirstPassOnLevel === false meskipun skor >= 75', () => {
    const context = { ...BASE_CONTEXT, skor: 90, isFirstPassOnLevel: false };
    expect(evaluateBadges(context)).not.toContain('FIRST_PASS');
  });

  // Req 3.6 — idempotency
  test('tidak memberikan FIRST_PASS jika sudah ada di existingBadgeTypes (idempotency)', () => {
    const context = {
      ...BASE_CONTEXT,
      skor: 80,
      isFirstPassOnLevel: true,
      existingBadgeTypes: ['FIRST_PASS'],
    };
    expect(evaluateBadges(context)).not.toContain('FIRST_PASS');
  });

  test('hanya mengandung FIRST_PASS ketika hanya syarat itu terpenuhi', () => {
    const context = { ...BASE_CONTEXT, skor: 80, isFirstPassOnLevel: true };
    const result = evaluateBadges(context);
    expect(result).toContain('FIRST_PASS');
    expect(result).not.toContain('PERFECT_SCORE');
    expect(result).not.toContain('XP_1000');
    expect(result).not.toContain('XP_5000');
  });
});

// ---------------------------------------------------------------------------
// Requirement 3.4 — Badge XP_1000
// WHEN seorang pelajar mencapai Total_XP ≥ 1000 untuk pertama kalinya,
// THE Gamification_Service SHALL memberikan badge "Pelajar Rajin".
// ---------------------------------------------------------------------------
describe('evaluateBadges — XP_1000 (Req 3.4)', () => {
  test('memberikan XP_1000 ketika total_xp tepat 1000', () => {
    const context = { ...BASE_CONTEXT, total_xp: 1000 };
    expect(evaluateBadges(context)).toContain('XP_1000');
  });

  test('memberikan XP_1000 ketika total_xp lebih dari 1000', () => {
    const context = { ...BASE_CONTEXT, total_xp: 2500 };
    expect(evaluateBadges(context)).toContain('XP_1000');
  });

  test('tidak memberikan XP_1000 ketika total_xp tepat di bawah batas (boundary: 999)', () => {
    const context = { ...BASE_CONTEXT, total_xp: 999 };
    expect(evaluateBadges(context)).not.toContain('XP_1000');
  });

  test('tidak memberikan XP_1000 ketika total_xp === 0', () => {
    const context = { ...BASE_CONTEXT, total_xp: 0 };
    expect(evaluateBadges(context)).not.toContain('XP_1000');
  });

  // Req 3.6 — idempotency
  test('tidak memberikan XP_1000 jika sudah ada di existingBadgeTypes (idempotency)', () => {
    const context = {
      ...BASE_CONTEXT,
      total_xp: 1000,
      existingBadgeTypes: ['XP_1000'],
    };
    expect(evaluateBadges(context)).not.toContain('XP_1000');
  });

  test('hanya mengandung XP_1000 ketika total_xp 1000 dan belum ada badge XP lainnya', () => {
    const context = { ...BASE_CONTEXT, total_xp: 1000 };
    const result = evaluateBadges(context);
    expect(result).toContain('XP_1000');
    expect(result).not.toContain('XP_5000');
    expect(result).not.toContain('PERFECT_SCORE');
    expect(result).not.toContain('FIRST_PASS');
  });
});

// ---------------------------------------------------------------------------
// Requirement 3.5 — Badge XP_5000
// WHEN seorang pelajar mencapai Total_XP ≥ 5000 untuk pertama kalinya,
// THE Gamification_Service SHALL memberikan badge "Pejuang XP".
// ---------------------------------------------------------------------------
describe('evaluateBadges — XP_5000 (Req 3.5)', () => {
  test('memberikan XP_5000 ketika total_xp tepat 5000', () => {
    const context = { ...BASE_CONTEXT, total_xp: 5000 };
    expect(evaluateBadges(context)).toContain('XP_5000');
  });

  test('memberikan XP_5000 ketika total_xp lebih dari 5000', () => {
    const context = { ...BASE_CONTEXT, total_xp: 7000 };
    expect(evaluateBadges(context)).toContain('XP_5000');
  });

  test('tidak memberikan XP_5000 ketika total_xp tepat di bawah batas (boundary: 4999)', () => {
    const context = { ...BASE_CONTEXT, total_xp: 4999 };
    expect(evaluateBadges(context)).not.toContain('XP_5000');
  });

  test('tidak memberikan XP_5000 ketika total_xp === 1000 (cukup untuk XP_1000 saja)', () => {
    const context = { ...BASE_CONTEXT, total_xp: 1000 };
    expect(evaluateBadges(context)).not.toContain('XP_5000');
  });

  // Req 3.6 — idempotency
  test('tidak memberikan XP_5000 jika sudah ada di existingBadgeTypes (idempotency)', () => {
    const context = {
      ...BASE_CONTEXT,
      total_xp: 5000,
      existingBadgeTypes: ['XP_5000'],
    };
    expect(evaluateBadges(context)).not.toContain('XP_5000');
  });

  test('XP_5000 juga memberikan XP_1000 sekaligus jika keduanya belum dimiliki', () => {
    const context = { ...BASE_CONTEXT, total_xp: 5000 };
    const result = evaluateBadges(context);
    expect(result).toContain('XP_1000');
    expect(result).toContain('XP_5000');
  });

  test('XP_5000 tidak memberikan XP_1000 jika XP_1000 sudah dimiliki', () => {
    const context = {
      ...BASE_CONTEXT,
      total_xp: 5000,
      existingBadgeTypes: ['XP_1000'],
    };
    const result = evaluateBadges(context);
    expect(result).not.toContain('XP_1000');
    expect(result).toContain('XP_5000');
  });
});

// ---------------------------------------------------------------------------
// Requirement 3.1 + 3.6 — Tidak ada badge baru / idempotency penuh
// Evaluasi dilakukan setiap Submission_Flow, dan badge tidak pernah digandakan.
// ---------------------------------------------------------------------------
describe('evaluateBadges — Tidak ada badge baru & idempotency penuh (Req 3.1, 3.6)', () => {
  test('mengembalikan array kosong ketika tidak ada kondisi badge yang terpenuhi', () => {
    const context = { ...BASE_CONTEXT, skor: 50, total_xp: 500 };
    expect(evaluateBadges(context)).toEqual([]);
  });

  test('mengembalikan array kosong ketika skor 0 dan total_xp 0', () => {
    expect(evaluateBadges(BASE_CONTEXT)).toEqual([]);
  });

  test('mengembalikan array kosong ketika semua badge sudah dimiliki (idempotency penuh)', () => {
    const context = {
      ...BASE_CONTEXT,
      skor: 100,
      total_xp: 5000,
      isFirstPerfectScore: true,
      isFirstPassOnLevel: true,
      existingBadgeTypes: ['PERFECT_SCORE', 'FIRST_PASS', 'XP_1000', 'XP_5000'],
    };
    expect(evaluateBadges(context)).toEqual([]);
  });

  test('pemanggilan berulang dengan kondisi yang sama menghasilkan output yang sama (idempotency)', () => {
    const context = {
      ...BASE_CONTEXT,
      skor: 100,
      total_xp: 1000,
      isFirstPerfectScore: true,
      isFirstPassOnLevel: true,
    };
    const firstCall = evaluateBadges(context);
    const secondCall = evaluateBadges(context);
    expect(firstCall).toEqual(secondCall);
  });

  test('context tidak dimodifikasi setelah pemanggilan evaluateBadges', () => {
    const context = {
      ...BASE_CONTEXT,
      skor: 100,
      total_xp: 5000,
      isFirstPerfectScore: true,
      isFirstPassOnLevel: true,
    };
    const existingBefore = [...context.existingBadgeTypes];
    evaluateBadges(context);
    expect(context.existingBadgeTypes).toEqual(existingBefore);
  });
});

// ---------------------------------------------------------------------------
// Skenario beberapa badge sekaligus
// ---------------------------------------------------------------------------
describe('evaluateBadges — Beberapa badge sekaligus (Req 3.1–3.5)', () => {
  test('memberikan semua 4 badge sekaligus dalam satu context yang memenuhi semua syarat', () => {
    const context = {
      ...BASE_CONTEXT,
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

  test('memberikan PERFECT_SCORE dan FIRST_PASS (tanpa badge XP) ketika total_xp < 1000', () => {
    const context = {
      ...BASE_CONTEXT,
      skor: 100,
      total_xp: 500,
      isFirstPerfectScore: true,
      isFirstPassOnLevel: true,
    };
    const result = evaluateBadges(context);
    expect(result).toContain('PERFECT_SCORE');
    expect(result).toContain('FIRST_PASS');
    expect(result).not.toContain('XP_1000');
    expect(result).not.toContain('XP_5000');
    expect(result).toHaveLength(2);
  });

  test('memberikan XP_1000 dan XP_5000 saja ketika kondisi skor/first-pass tidak terpenuhi', () => {
    const context = {
      ...BASE_CONTEXT,
      skor: 50,
      total_xp: 5000,
    };
    const result = evaluateBadges(context);
    expect(result).toContain('XP_1000');
    expect(result).toContain('XP_5000');
    expect(result).not.toContain('PERFECT_SCORE');
    expect(result).not.toContain('FIRST_PASS');
    expect(result).toHaveLength(2);
  });
});
