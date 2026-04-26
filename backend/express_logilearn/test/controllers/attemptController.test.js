/**
 * Test Suite: attemptController.js
 * Framework: Jest
 */

jest.mock('../../src/models/attempt');
jest.mock('../../src/helpers/response');

const Attempt = require('../../src/models/attempt');
const response = require('../../src/helpers/response');
const {
  getAllAttempts,
  getAttemptById,
  getAttemptsByLevel,
  getAttemptsByPelajar,
  create,
  submitAttempt,
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
      Attempt.recalculateScore.mockResolvedValue(fakeAttempt);
      
      await submitAttempt(req, res);
      
      expect(Attempt.recalculateScore).toHaveBeenCalledWith(1);
      expect(response).toHaveBeenCalledWith(200, fakeAttempt, 'Attempt submitted (score recalculated) successfully', res);
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
      Attempt.recalculateScore.mockResolvedValue(null);
      
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
});
