const { PrismaClient } = require('@prisma/client');
const Attempt = require('../../src/models/attempt');

// Mock @prisma/client
jest.mock('@prisma/client', () => {
  const mPrisma = {
    attempts: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    jawabanPGs: {
      createMany: jest.fn(),
    },
    jawabanEsais: {
      createMany: jest.fn(),
    },
  };
  mPrisma.$transaction = jest.fn(async (callback) => callback(mPrisma));
  
  return {
    PrismaClient: jest.fn(() => mPrisma)
  };
});

const prisma = new PrismaClient(); // This refers to the mocked instance

describe('Attempt Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAllAttempts()', async () => {
    const fakeData = [{ id: 1, skor: 100 }];
    prisma.attempts.findMany.mockResolvedValue(fakeData);

    const result = await Attempt.getAllAttempts();

    expect(prisma.attempts.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { id: 'desc' }
    }));
    expect(result).toEqual(fakeData);
  });

  test('getAttemptById()', async () => {
    const fakeData = { id: 1, skor: 80 };
    prisma.attempts.findUnique.mockResolvedValue(fakeData);

    const result = await Attempt.getAttemptById(1);

    expect(prisma.attempts.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 }
    }));
    expect(result).toEqual(fakeData);
  });

  test('getAttemptsByLevel()', async () => {
    const fakeData = [{ id: 1, id_level: 2 }];
    prisma.attempts.findMany.mockResolvedValue(fakeData);

    const result = await Attempt.getAttemptsByLevel(2);

    expect(prisma.attempts.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id_level: 2 }
    }));
    expect(result).toEqual(fakeData);
  });

  test('getAttemptsByPelajar()', async () => {
    const fakeData = [{ id: 1, id_pelajar: 3 }];
    prisma.attempts.findMany.mockResolvedValue(fakeData);

    const result = await Attempt.getAttemptsByPelajar(3);

    expect(prisma.attempts.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id_pelajar: 3 }
    }));
    expect(result).toEqual(fakeData);
  });

  test('createAttempt()', async () => {
    const fakeData = { id: 1, id_level: 2, id_pelajar: 3, skor: 90 };
    prisma.attempts.create.mockResolvedValue(fakeData);

    const result = await Attempt.createAttempt(2, 3, 90);

    expect(prisma.attempts.create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        id_level: 2,
        id_pelajar: 3,
        skor: 90
      }
    }));
    expect(result).toEqual(fakeData);
  });

  test('updateAttempt()', async () => {
    const fakeData = { id: 1, skor: 95 };
    prisma.attempts.update.mockResolvedValue(fakeData);

    const result = await Attempt.updateAttempt(1, 95);

    expect(prisma.attempts.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: { skor: 95 }
    }));
    expect(result).toEqual(fakeData);
  });

  test('deleteAttempt()', async () => {
    prisma.attempts.delete.mockResolvedValue({});

    await Attempt.deleteAttempt(1);

    expect(prisma.attempts.delete).toHaveBeenCalledWith({
      where: { id: 1 }
    });
  });

  test('createAttemptWithAnswers()', async () => {
    const fakeAttempt = { id: 10, id_level: 1, id_pelajar: 1, skor: 0 };
    prisma.attempts.create.mockResolvedValue(fakeAttempt);
    prisma.jawabanPGs.createMany.mockResolvedValue({});
    prisma.jawabanEsais.createMany.mockResolvedValue({});

    const jawaban_pgs = [{ id_opsi: 1, skor: 1 }];
    const jawaban_esais = [{ id_soal: 2, text_jawaban_esai: 'test', skor: 0 }];

    const result = await Attempt.createAttemptWithAnswers(1, 1, 0, jawaban_pgs, jawaban_esais);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.attempts.create).toHaveBeenCalled();
    expect(prisma.jawabanPGs.createMany).toHaveBeenCalled();
    expect(prisma.jawabanEsais.createMany).toHaveBeenCalled();
    expect(result).toEqual(fakeAttempt);
  });

  test('recalculateScore() - no attempt found', async () => {
    prisma.attempts.findUnique.mockResolvedValue(null);
    const result = await Attempt.recalculateScore(1);
    expect(result).toBeNull();
  });

  test('recalculateScore() - calculate correctly', async () => {
    const fakeAttempt = {
      id: 1,
      levels: { soals: [{}, {}, {}, {}] }, // 4 soals
      jawaban_pgs: [{ skor: 1 }, { skor: 1 }], // score 2
      jawaban_esais: [{ skor: 0.5 }] // score 0.5
    }; // total = 2.5, max = 4. Final = 2.5/4 * 100 = 62.5
    
    prisma.attempts.findUnique.mockResolvedValue(fakeAttempt);
    prisma.attempts.update.mockResolvedValue({ id: 1, skor: 62.5 });

    const result = await Attempt.recalculateScore(1);

    expect(prisma.attempts.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: { skor: 62.5 }
    }));
    expect(result).toEqual({ id: 1, skor: 62.5 });
  });
});
