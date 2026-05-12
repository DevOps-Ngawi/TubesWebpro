const prisma = require('../../src/models/prisma')
const JwbPG = require('../../src/models/jawabanPG')

jest.mock('../../src/models/prisma', () => ({
  jawabanPGs: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  opsis: {
    findUnique: jest.fn(),
  }
}))

describe('JawabanPG Model', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllJwbPGs()', () => {
    test('berhasil mengembalikan semua data jawaban PG', async () => {
      const mockData = [{ id: 1 }, { id: 2 }]
      prisma.jawabanPGs.findMany.mockResolvedValue(mockData)

      const result = await JwbPG.getAllJwbPGs()

      expect(prisma.jawabanPGs.findMany).toHaveBeenCalledWith({
        include: { opsis: true }
      })
      expect(result).toEqual(mockData)
    })
  })

  describe('getJwbPGById()', () => {
    test('berhasil mengembalikan data berdasarkan id', async () => {
      const mockData = { id: 1, id_attempt: 10 }
      prisma.jawabanPGs.findUnique.mockResolvedValue(mockData)

      const result = await JwbPG.getJwbPGById(1)

      expect(prisma.jawabanPGs.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { opsis: true }
      })
      expect(result).toEqual(mockData)
    })
  })

  describe('createJwbPG()', () => {
    test('berhasil membuat jawaban benar (skor 1)', async () => {
      const mockOpsi = { id: 5, is_correct: true }
      const mockCreated = { id: 1, id_attempt: 10, id_opsi: 5, skor: 1 }
      
      prisma.opsis.findUnique.mockResolvedValue(mockOpsi)
      prisma.jawabanPGs.create.mockResolvedValue(mockCreated)

      const result = await JwbPG.createJwbPG(10, 5)

      expect(prisma.opsis.findUnique).toHaveBeenCalledWith({
        where: { id: 5 }
      })
      expect(prisma.jawabanPGs.create).toHaveBeenCalledWith({
        data: {
          id_attempt: 10,
          id_opsi: 5,
          skor: 1
        }
      })
      expect(result).toEqual(mockCreated)
    })

    test('berhasil membuat jawaban salah (skor 0)', async () => {
      const mockOpsi = { id: 6, is_correct: false }
      const mockCreated = { id: 2, id_attempt: 10, id_opsi: 6, skor: 0 }
      
      prisma.opsis.findUnique.mockResolvedValue(mockOpsi)
      prisma.jawabanPGs.create.mockResolvedValue(mockCreated)

      const result = await JwbPG.createJwbPG(10, 6)

      expect(prisma.opsis.findUnique).toHaveBeenCalledWith({
        where: { id: 6 }
      })
      expect(prisma.jawabanPGs.create).toHaveBeenCalledWith({
        data: {
          id_attempt: 10,
          id_opsi: 6,
          skor: 0
        }
      })
      expect(result).toEqual(mockCreated)
    })
  })
})
