/**
 * Test Suite: attemptController.js
 * Framework: Jest
 */

jest.mock('../../src/models/attempt');
jest.mock('../../src/helpers/response');
jest.mock('../../src/models/prisma', () => ({
  opsis: { findMany: jest.fn() },
  jawabanPGs: { upsert: jest.fn() },
  soals: { findMany: jest.fn() },
  jawabanEsais: { upsert: jest.fn() }
}));
jest.mock('../../src/services/aiGrading', () => ({
  nilaiEsai: jest.fn()
}));

const Attempt = require('../../src/models/attempt');
const response = require('../../src/helpers/response');
const prisma = require('../../src/models/prisma');
const { nilaiEsai } = require('../../src/services/aiGrading');
const {
  getAllAttempts,
  getAttemptById,
  getAttemptsByLevel,
  getAttemptsByPelajar,
  create,
  submitAttempt,
  submitBatch,
  update,
  remove
} = require('../../src/controllers/attemptController');

const mockRes = () => ({ status: jest.fn(), json: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  response.mockImplementation(() => {});
});

describe('Attempt Controller', () => {
  describe('getAllAttempts()', () => {
    test('berhasil return semua attempt dan hitung stat', async () => {
      const fakeAttempts = [
        { id: 1, skor: 100, levels: { nama: 'Level 1' } },
        { id: 2, skor: 50, levels: { nama: 'Level 1' } },
        { id: 3, skor: 80, levels: { nama: 'Level 2' } }
      ];
      Attempt.getAllAttempts.mockResolvedValue(fakeAttempts);
      const res = mockRes();
      
      await getAllAttempts({}, res);
      
      // Expected stats: 
      // Level 1 avg = 75, Level 2 avg = 80
      // Lowest level = Level 1 (75)
      // Total average = 230 / 3 = 76.666...
      
      expect(response).toHaveBeenCalledWith(200, expect.objectContaining({
        attempts: fakeAttempts,
        stats: expect.objectContaining({
          totalAttempts: 3,
          lowestAvgLevel: 'Level 1',
          lowestAvgScore: 75
        })
      }), 'Berhasil mendapatkan semua attempt', res);
    });

    test('error database -> 500', async () => {
      Attempt.getAllAttempts.mockRejectedValue(new Error('DB error'));
      const res = mockRes();
      await getAllAttempts({}, res);
      expect(response).toHaveBeenCalledWith(500, null, 'Terjadi kesalahan server: DB error', res);
    });
  });

  describe('getAttemptById()', () => {
    test('berhasil return attempt by id', async () => {
      const fakeAttempt = { id: 1, skor: 80 };
      Attempt.getAttemptById.mockResolvedValue(fakeAttempt);
      const req = { params: { id: '1' } };
      const res = mockRes();
      
      await getAttemptById(req, res);
      
      expect(response).toHaveBeenCalledWith(200, fakeAttempt, 'Berhasil mendapatkan attempt dengan id: 1', res);
    });

    test('attempt tidak ditemukan -> 404', async () => {
      Attempt.getAttemptById.mockResolvedValue(null);
      const req = { params: { id: '99' } };
      const res = mockRes();
      
      await getAttemptById(req, res);
      
      expect(response).toHaveBeenCalledWith(404, null, 'Attempt tidak ditemukan', res);
    });

    test('pelajar tidak berhak mengakses attempt milik orang lain -> 403', async () => {
      const fakeAttempt = { id: 1, id_pelajar: 2 };
      Attempt.getAttemptById.mockResolvedValue(fakeAttempt);
      const req = { params: { id: '1' }, auth: { type: 'PELAJAR', id: 5 } };
      const res = mockRes();

      await getAttemptById(req, res);

      expect(response).toHaveBeenCalledWith(403, null, 'Attempt tidak tersedia untuk pengguna ini', res);
    });
  });

  describe('getAttemptsByLevel()', () => {
    test('berhasil return attempts by level', async () => {
      const fakeAttempts = [{ id: 1, id_level: 2 }];
      Attempt.getAttemptsByLevel.mockResolvedValue(fakeAttempts);
      const req = { params: { levelId: '2' } };
      const res = mockRes();
      
      await getAttemptsByLevel(req, res);
      
      expect(response).toHaveBeenCalledWith(200, fakeAttempts, 'Berhasil mendapatkan attempt untuk level: 2', res);
    });
  });

  describe('getAttemptsByPelajar()', () => {
    test('berhasil return attempts by pelajar', async () => {
      const fakeAttempts = [{ id: 1, id_pelajar: 3 }];
      Attempt.getAttemptsByPelajar.mockResolvedValue(fakeAttempts);
      const req = { params: { pelajarId: '3' } };
      const res = mockRes();
      
      await getAttemptsByPelajar(req, res);
      
      expect(response).toHaveBeenCalledWith(200, fakeAttempts, 'Berhasil mendapatkan attempt untuk pelajar: 3', res);
    });
  });

  describe('create()', () => {
    test('berhasil create attempt', async () => {
      const req = { body: { id_level: 1, id_pelajar: 2, skor: 0 } };
      const res = mockRes();
      const fakeAttempt = { id: 1, id_level: 1, id_pelajar: 2, skor: 0 };
      Attempt.createAttempt.mockResolvedValue(fakeAttempt);
      
      await create(req, res);
      
      expect(Attempt.createAttempt).toHaveBeenCalledWith(1, 2, 0);
      expect(response).toHaveBeenCalledWith(200, fakeAttempt, 'Attempt berhasil dibuat', res);
    });

    test('validasi gagal -> 400', async () => {
      const req = { body: { id_level: 1 } }; // id_pelajar dan skor missing
      const res = mockRes();
      
      await create(req, res);
      
      expect(response).toHaveBeenCalledWith(400, null, 'id_level, id_pelajar, dan skor harus diisi', res);
      expect(Attempt.createAttempt).not.toHaveBeenCalled();
    });

    test('create attempt via PELAJAR auth', async () => {
      const req = { 
        body: { id_level: 1 },
        auth: { type: 'PELAJAR', id: 5 }
      }; // auth id used
      const res = mockRes();
      const fakeAttempt = { id: 1, id_level: 1, id_pelajar: 5, skor: 0 };
      Attempt.createAttempt.mockResolvedValue(fakeAttempt);
      
      await create(req, res);
      
      expect(Attempt.createAttempt).toHaveBeenCalledWith(1, 5, 0); // skor default 0
      expect(response).toHaveBeenCalledWith(200, fakeAttempt, 'Attempt berhasil dibuat', res);
    });
  });

  describe('submitAttempt()', () => {
    test('berhasil submit dan recalculate', async () => {
      const req = { body: { id_attempt: 1 } };
      const res = mockRes();
      const fakeAttempt = { id: 1, skor: 85 };
      const fakeGamification = {
        xp_gained: 85,
        total_xp: 100,
        level_rank_up: false,
        new_level_rank: 1,
        new_badges: []
      };
      Attempt.recalculateScoreWithGamification.mockResolvedValue({
        attempt: fakeAttempt,
        gamification: fakeGamification
      });
      
      await submitAttempt(req, res);
      
      expect(Attempt.recalculateScoreWithGamification).toHaveBeenCalledWith(1);
      expect(response).toHaveBeenCalledWith(200, {
        ...fakeAttempt,
        ...fakeGamification
      }, 'Attempt submitted (score recalculated) successfully', res);
    });

    test('id_attempt kosong -> 400', async () => {
      const req = { body: {} };
      const res = mockRes();
      
      await submitAttempt(req, res);
      
      expect(response).toHaveBeenCalledWith(400, null, 'id_attempt harus diisi', res);
    });

    test('attempt tidak ditemukan saat recalculate -> 404', async () => {
      const req = { body: { id_attempt: 99 } };
      const res = mockRes();
      Attempt.recalculateScoreWithGamification.mockResolvedValue(null);
      
      await submitAttempt(req, res);
      
      expect(response).toHaveBeenCalledWith(404, null, 'Attempt tidak ditemukan', res);
    });
  });

  describe('update()', () => {
    test('berhasil update attempt', async () => {
      Attempt.getAttemptById.mockResolvedValue({ id: 1 });
      Attempt.updateAttempt.mockResolvedValue({ id: 1, skor: 90 });
      const req = { params: { id: '1' }, body: { skor: 90 } };
      const res = mockRes();
      
      await update(req, res);
      
      expect(Attempt.updateAttempt).toHaveBeenCalledWith('1', 90);
      expect(response).toHaveBeenCalledWith(200, { id: 1, skor: 90 }, 'Attempt berhasil diupdate', res);
    });

    test('skor kosong -> 400', async () => {
      const req = { params: { id: '1' }, body: {} };
      const res = mockRes();
      
      await update(req, res);
      
      expect(response).toHaveBeenCalledWith(400, null, 'skor harus diisi', res);
    });

    test('attempt tidak ditemukan -> 404', async () => {
      Attempt.getAttemptById.mockResolvedValue(null);
      const req = { params: { id: '99' }, body: { skor: 90 } };
      const res = mockRes();
      
      await update(req, res);
      
      expect(response).toHaveBeenCalledWith(404, null, 'Attempt tidak ditemukan', res);
    });
  });

  describe('remove()', () => {
    test('berhasil remove attempt', async () => {
      Attempt.getAttemptById.mockResolvedValue({ id: 1 });
      Attempt.deleteAttempt.mockResolvedValue({ id: 1 });
      const req = { params: { id: '1' } };
      const res = mockRes();
      
      await remove(req, res);
      
      expect(Attempt.deleteAttempt).toHaveBeenCalledWith('1');
      expect(response).toHaveBeenCalledWith(200, { id: 1 }, 'Attempt berhasil dihapus', res);
    });

    test('attempt tidak ditemukan -> 404', async () => {
      Attempt.getAttemptById.mockResolvedValue(null);
      const req = { params: { id: '99' } };
      const res = mockRes();
      
      await remove(req, res);
      
      expect(response).toHaveBeenCalledWith(404, null, 'Attempt tidak ditemukan', res);
      expect(Attempt.deleteAttempt).not.toHaveBeenCalled();
    });
  });

  describe('submitBatch()', () => {
    test('berhasil submit pg dan esai secara batch', async () => {
      const req = {
        params: { idAttempt: '1' },
        body: {
          answers: [
            { tipe: 'pg', idOpsi: 10 },
            { tipe: 'esai', idSoal: 2, jawaban: 'Logika' }
          ]
        }
      };
      const res = mockRes();

      prisma.opsis.findMany.mockResolvedValue([{ id: 10, is_correct: true }]);
      prisma.soals.findMany.mockResolvedValue([{ id: 2, text_soal: 'Soal 2', kata_kunci: 'logika' }]);
      nilaiEsai.mockResolvedValue({ score: 1.0, feedback: 'Bagus' });
      prisma.jawabanPGs.upsert.mockResolvedValue({});
      prisma.jawabanEsais.upsert.mockResolvedValue({});

      const fakeAttempt = { id: 1, skor: 100 };
      const fakeGamification = {
        xp_gained: 100,
        total_xp: 200,
        level_rank_up: false,
        new_level_rank: 2,
        new_badges: []
      };
      Attempt.recalculateScoreWithGamification.mockResolvedValue({
        attempt: fakeAttempt,
        gamification: fakeGamification
      });

      await submitBatch(req, res);

      expect(prisma.opsis.findMany).toHaveBeenCalled();
      expect(prisma.soals.findMany).toHaveBeenCalled();
      expect(nilaiEsai).toHaveBeenCalledWith('Soal 2', 'Logika', 'logika');
      expect(prisma.jawabanPGs.upsert).toHaveBeenCalled();
      expect(prisma.jawabanEsais.upsert).toHaveBeenCalled();
      expect(Attempt.recalculateScoreWithGamification).toHaveBeenCalledWith('1');
      expect(response).toHaveBeenCalledWith(200, {
        ...fakeAttempt,
        ...fakeGamification
      }, 'Batch attempt submitted successfully', res);
    });

    test('validasi gagal -> answers bukan array -> 400', async () => {
      const req = { params: { idAttempt: '1' }, body: {} };
      const res = mockRes();

      await submitBatch(req, res);

      expect(response).toHaveBeenCalledWith(400, null, 'answers harus berupa array', res);
    });
  });
});
