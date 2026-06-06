const bcrypt = require('bcryptjs');
const response = require('../../src/helpers/response');

const mockPrismaClient = {
  pelajars: {
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn()
  },
  attempts: {
    groupBy: jest.fn()
  },
  sections: {
    findMany: jest.fn()
  },
  pelajar_badges: {
    count: jest.fn(),
    findMany: jest.fn()
  }
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

const { getProfile, changePassword, getStats, getBadges } = require('../../src/controllers/pelajarController');

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

  describe('getStats()', () => {
    test('berhasil memuat statistik pelajar', async () => {
      const req = { params: { id: '1' } };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockResolvedValue({
        id: 1,
        nama: 'John Doe',
        xp: 1200,
        level_rank: 2
      });

      mockPrismaClient.pelajar_badges.count.mockResolvedValue(3);
      mockPrismaClient.pelajars.count.mockResolvedValue(5); // 5 users with higher XP

      await getStats(req, res);

      expect(mockPrismaClient.pelajars.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrismaClient.pelajar_badges.count).toHaveBeenCalledWith({
        where: { id_pelajar: 1 }
      });
      expect(mockPrismaClient.pelajars.count).toHaveBeenCalledWith({
        where: { xp: { gt: 1200 } }
      });

      expect(response).toHaveBeenCalledWith(
        200,
        {
          id: 1,
          nama: 'John Doe',
          total_xp: 1200,
          level_rank: 2,
          total_badges: 3,
          global_rank: 6
        },
        "Statistik pelajar berhasil dimuat",
        res
      );
    });

    test('gagal memuat statistik, pelajar tidak ditemukan (404)', async () => {
      const req = { params: { id: '99' } };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockResolvedValue(null);

      await getStats(req, res);

      expect(response).toHaveBeenCalledWith(404, null, "Pelajar tidak ditemukan", res);
    });

    test('gagal memuat statistik, ID pelajar tidak valid (400)', async () => {
      const req = { params: { id: 'abc' } };
      const res = mockRes();

      await getStats(req, res);

      expect(response).toHaveBeenCalledWith(400, null, "ID pelajar tidak valid", res);
    });

    test('error server saat memuat statistik (500)', async () => {
      const req = { params: { id: '1' } };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockRejectedValue(new Error('Connection failed'));

      await getStats(req, res);

      expect(response).toHaveBeenCalledWith(500, null, "Terjadi kesalahan: Connection failed", res);
    });
  });

  describe('getBadges()', () => {
    test('berhasil memuat badge pelajar', async () => {
      const req = { params: { id: '1' } };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockResolvedValue({
        id: 1,
        nama: 'John Doe'
      });

      const mockObtainedAt = new Date();
      mockPrismaClient.pelajar_badges.findMany.mockResolvedValue([
        {
          obtained_at: mockObtainedAt,
          badges: {
            name: 'Skor Sempurna',
            description: 'Raih skor 100 untuk pertama kalinya'
          }
        }
      ]);

      await getBadges(req, res);

      expect(mockPrismaClient.pelajars.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrismaClient.pelajar_badges.findMany).toHaveBeenCalledWith({
        where: { id_pelajar: 1 },
        include: { badges: true }
      });

      expect(response).toHaveBeenCalledWith(
        200,
        [
          {
            badge_name: 'Skor Sempurna',
            badge_description: 'Raih skor 100 untuk pertama kalinya',
            obtained_at: mockObtainedAt
          }
        ],
        "Badge pelajar berhasil dimuat",
        res
      );
    });

    test('gagal memuat badge, pelajar tidak ditemukan (404)', async () => {
      const req = { params: { id: '99' } };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockResolvedValue(null);

      await getBadges(req, res);

      expect(response).toHaveBeenCalledWith(404, null, "Pelajar tidak ditemukan", res);
    });

    test('gagal memuat badge, ID pelajar tidak valid (400)', async () => {
      const req = { params: { id: 'abc' } };
      const res = mockRes();

      await getBadges(req, res);

      expect(response).toHaveBeenCalledWith(400, null, "ID pelajar tidak valid", res);
    });

    test('error server saat memuat badge (500)', async () => {
      const req = { params: { id: '1' } };
      const res = mockRes();

      mockPrismaClient.pelajars.findUnique.mockRejectedValue(new Error('Connection failed'));

      await getBadges(req, res);

      expect(response).toHaveBeenCalledWith(500, null, "Terjadi kesalahan: Connection failed", res);
    });
  });
});
