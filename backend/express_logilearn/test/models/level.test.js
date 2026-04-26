const prisma = require('../../src/models/prisma')
const Level = require('../../src/models/level')

// Mock prisma saja
jest.mock('../../src/models/prisma', () => ({
  levels: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  soals: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  }
}))

describe('Level Model', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('getAllLevels()', async () => {
    prisma.levels.findMany.mockResolvedValue([{ id: 1 }])

    const result = await Level.getAllLevels()

    expect(prisma.levels.findMany).toHaveBeenCalled()
    expect(result).toEqual([{ id: 1 }])
  })

  test('getLevelById()', async () => {
    prisma.levels.findUnique.mockResolvedValue({ id: 1 })

    const result = await Level.getLevelById('1')

    expect(prisma.levels.findUnique).toHaveBeenCalled()
    expect(result).toEqual({ id: 1 })
  })

  test('createLevel()', async () => {
    prisma.levels.create.mockResolvedValue({ id: 1 })

    const result = await Level.createLevel('1', 'Level A', 'desc', '2')

    expect(prisma.levels.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        id_section: 1,
        nama: 'Level A',
        deskripsi: 'desc',
        urutan: 2
      })
    }))
    expect(result).toEqual({ id: 1 })
  })

  test('updateLevel()', async () => {
    prisma.levels.update.mockResolvedValue({ id: 1 })

    const result = await Level.updateLevel('1', '2', 'Level B', null, null)

    expect(prisma.levels.update).toHaveBeenCalled()
    expect(result).toEqual({ id: 1 })
  })

  test('deleteLevel()', async () => {
    prisma.levels.delete.mockResolvedValue({})

    await Level.deleteLevel('1')

    expect(prisma.levels.delete).toHaveBeenCalled()
  })

  test('getSoalsByLevelId() - level tidak ada', async () => {
    prisma.levels.findFirst.mockResolvedValue(null)

    const result = await Level.getSoalsByLevelId('grammar', '1')

    expect(result).toEqual([])
  })

  test('getSoalsByLevelId() - ada data', async () => {
    prisma.levels.findFirst.mockResolvedValue({ id: 1 })
    prisma.soals.findMany.mockResolvedValue([{ id: 1 }])

    const result = await Level.getSoalsByLevelId('grammar', '1')

    expect(result).toEqual([{ id: 1 }])
  })

  test('getSoalByLevelIdAndSoalId() - level tidak ada', async () => {
    prisma.levels.findFirst.mockResolvedValue(null)
    prisma.levels.findUnique.mockResolvedValue(null)

    const result = await Level.getSoalByLevelIdAndSoalId('grammar', '1', '1')

    expect(result).toBeNull()
  })

  test('getSoalByLevelIdAndSoalId() - soal ditemukan', async () => {
    prisma.levels.findFirst.mockResolvedValue({ id: 1, sections: {} })
    prisma.soals.findFirst.mockResolvedValue({ id: 1 })

    const result = await Level.getSoalByLevelIdAndSoalId('grammar', '1', '1')

    expect(result).toEqual({ id: 1 })
  })

})