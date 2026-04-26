const mockPrismaClient = {
  attempts: {
    findMany: jest.fn()
  }
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

const { findPelajarStats } = require('../../src/models/pelajar');

describe('Pelajar Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('findPelajarStats() berhasil mengembalikan data attempts', async () => {
    const mockData = [{ id_level: 1 }, { id_level: 2 }];
    mockPrismaClient.attempts.findMany.mockResolvedValue(mockData);

    const result = await findPelajarStats(5);

    expect(mockPrismaClient.attempts.findMany).toHaveBeenCalledWith({
      where: {
        id_pelajar: 5,
        skor: { gte: 75 }
      },
      select: { id_level: true }
    });
    expect(result).toEqual(mockData);
  });

  test('findPelajarStats() mengembalikan array kosong jika tidak ada data riwayat', async () => {
    mockPrismaClient.attempts.findMany.mockResolvedValue([]);

    const result = await findPelajarStats(99);

    expect(result).toEqual([]);
  });

  test('findPelajarStats() meneruskan error jika terjadi kegagalan database', async () => {
    mockPrismaClient.attempts.findMany.mockRejectedValue(new Error('Koneksi Database Terputus'));

    await expect(findPelajarStats(5)).rejects.toThrow('Koneksi Database Terputus');
  });
});
