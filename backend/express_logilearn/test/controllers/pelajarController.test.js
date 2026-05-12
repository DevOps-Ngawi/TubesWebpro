const bcrypt = require('bcryptjs');
const response = require('../../src/helpers/response');

const mockPrismaClient = {
  pelajars: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  attempts: {
    groupBy: jest.fn()
  },
  sections: {
    findMany: jest.fn()
  }
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

const { getProfile, changePassword } = require('../../src/controllers/pelajarController');

jest.mock('bcryptjs');
jest.mock('../../src/helpers/response');

const mockRes = () => ({ status: jest.fn(), json: jest.fn() });

describe('Pelajar Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    response.mockImplementation(() => { });
  });

  describe('getProfile()', () => {
    test('berhasil memuat profil pelajar', async () => {
      const req = { auth: { id: 1 } };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockResolvedValue({
        nama: 'John Doe',
        username: 'johndoe'
      });

      mockPrismaClient.attempts.groupBy.mockResolvedValue([
        { id_level: 1 },
        { id_level: 2 }
      ]);

      mockPrismaClient.sections.findMany.mockResolvedValue([
        {
          id: 1,
          levels: [{ id: 1 }, { id: 2 }]
        },
        {
          id: 2,
          levels: [{ id: 3 }]
        }
      ]);

      await getProfile(req, res);

      expect(mockPrismaClient.pelajars.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { nama: true, username: true }
      });

      expect(response).toHaveBeenCalledWith(
        200,
        {
          nama: 'John Doe',
          username: 'johndoe',
          statistik: {
            section_selesai: 1,
            level_selesai: 2
          }
        },
        "Data profil berhasil dimuat",
        res
      );
    });

    test('gagal memuat profil, pelajar tidak ditemukan (404)', async () => {
      const req = { auth: { id: 99 } };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockResolvedValue(null);

      await getProfile(req, res);

      expect(response).toHaveBeenCalledWith(404, null, "Pelajar tidak ditemukan", res);
    });

    test('error server saat memuat profil (500)', async () => {
      const req = { auth: { id: 1 } };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockRejectedValue(new Error('DB connection failed'));

      await getProfile(req, res);

      expect(response).toHaveBeenCalledWith(500, null, "Terjadi kesalahan: DB connection failed", res);
    });
  });

  describe('changePassword()', () => {
    test('berhasil mengganti password', async () => {
      const req = {
        auth: { id: 1 },
        body: { oldPassword: 'old123', newPassword: 'new123' }
      };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockResolvedValue({
        id: 1,
        password: 'hashedOldPassword'
      });
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.genSalt.mockResolvedValue('randomSalt');
      bcrypt.hash.mockResolvedValue('hashedNewPassword');
      mockPrismaClient.pelajars.update.mockResolvedValue({});

      await changePassword(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('old123', 'hashedOldPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('new123', 'randomSalt');
      expect(mockPrismaClient.pelajars.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'hashedNewPassword' }
      });
      expect(response).toHaveBeenCalledWith(200, null, "Kata sandi berhasil diganti", res);
    });

    test('gagal mengganti password karena password lama salah (401)', async () => {
      const req = {
        auth: { id: 1 },
        body: { oldPassword: 'wrongPassword', newPassword: 'new123' }
      };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockResolvedValue({
        id: 1,
        password: 'hashedOldPassword'
      });
      bcrypt.compare.mockResolvedValue(false);

      await changePassword(req, res);

      expect(response).toHaveBeenCalledWith(401, null, "Kata sandi saat ini salah", res);
      expect(mockPrismaClient.pelajars.update).not.toHaveBeenCalled();
    });

    test('error server saat mengganti password (500)', async () => {
      const req = {
        auth: { id: 1 },
        body: { oldPassword: 'old123', newPassword: 'new123' }
      };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockRejectedValue(new Error('DB Error'));

      await changePassword(req, res);

      expect(response).toHaveBeenCalledWith(500, null, "DB Error", res);
    });
  });
});
