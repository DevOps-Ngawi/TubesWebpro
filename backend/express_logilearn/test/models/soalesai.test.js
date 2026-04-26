const prisma = require('../../src/models/prisma')
const SoalEsai = require('../../src/models/soalesai')

jest.mock('../../src/models/prisma', () => ({
  soals: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}))

describe('SoalEsai Model', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('getAllSoalEsai()', async () => {
    const fakeData = [{ id: 1, tipe: 'esai', text_soal: 'Jelaskan OOP', levels: {} }]
    prisma.soals.findMany.mockResolvedValue(fakeData)
    const result = await SoalEsai.getAllSoalEsai()
    expect(prisma.soals.findMany).toHaveBeenCalledWith({
      where: { tipe: 'esai' },
      include: { levels: true }
    })
    expect(result).toEqual(fakeData)
  })

  test('getSoalEsaiById()', async () => {
    const fakeData = { id: 1, tipe: 'esai', text_soal: 'Jelaskan OOP' }
    prisma.soals.findUnique.mockResolvedValue(fakeData)
    const result = await SoalEsai.getSoalEsaiById('1')
    expect(prisma.soals.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    })
    expect(result).toEqual(fakeData)
  })

  test('getSoalEsaiByLevel()', async () => {
    const fakeData = [{ id: 2, id_level: 3, tipe: 'esai', text_soal: 'Soal level 3' }]
    prisma.soals.findMany.mockResolvedValue(fakeData)
    const result = await SoalEsai.getSoalEsaiByLevel('3')
    expect(prisma.soals.findMany).toHaveBeenCalledWith({
      where: { id_level: 3, tipe: 'esai' }
    })
    expect(result).toEqual(fakeData)
  })

  test('createSoalEsai() dengan kata kunci', async () => {
    const fakeData = { id: 5, id_level: 2, tipe: 'esai', text_soal: 'Soal baru', kata_kunci: 'kunci1' }
    prisma.soals.create.mockResolvedValue(fakeData)
    const result = await SoalEsai.createSoalEsai(2, 'Soal baru', 'kunci1')
    expect(prisma.soals.create).toHaveBeenCalledWith({
      data: { id_level: 2, tipe: 'esai', text_soal: 'Soal baru', kata_kunci: 'kunci1' }
    })
    expect(result).toEqual(fakeData)
  })

  test('createSoalEsai() tanpa kata kunci (null)', async () => {
    const fakeData = { id: 6, id_level: 1, tipe: 'esai', text_soal: 'Soal tanpa kunci', kata_kunci: null }
    prisma.soals.create.mockResolvedValue(fakeData)
    const result = await SoalEsai.createSoalEsai(1, 'Soal tanpa kunci', undefined)
    expect(prisma.soals.create).toHaveBeenCalledWith({
      data: { id_level: 1, tipe: 'esai', text_soal: 'Soal tanpa kunci', kata_kunci: null }
    })
    expect(result).toEqual(fakeData)
  })

  test('updateSoalEsai() dengan semua field terisi', async () => {
    const fakeData = { id: 1, text_soal: 'Soal diperbarui', kata_kunci: 'kunci baru' }
    prisma.soals.update.mockResolvedValue(fakeData)
    const result = await SoalEsai.updateSoalEsai(1, 2, 'Soal diperbarui', 'kunci baru')
    expect(prisma.soals.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { id_level: 2, text_soal: 'Soal diperbarui', kata_kunci: 'kunci baru' }
    })
    expect(result).toEqual(fakeData)
  })

  test('updateSoalEsai() dengan idLevel null -> id_level undefined', async () => {
    const fakeData = { id: 1, text_soal: 'Soal diperbarui' }
    prisma.soals.update.mockResolvedValue(fakeData)
    const result = await SoalEsai.updateSoalEsai(1, null, 'Soal diperbarui', 'kunci')
    expect(prisma.soals.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { id_level: undefined, text_soal: 'Soal diperbarui', kata_kunci: 'kunci' }
    })
    expect(result).toEqual(fakeData)
  })

  test('updateSoalEsai() dengan textSoal dan kataKunci undefined', async () => {
    const fakeData = { id: 1, id_level: 2 }
    prisma.soals.update.mockResolvedValue(fakeData)
    const result = await SoalEsai.updateSoalEsai(1, 2, undefined, undefined)
    expect(prisma.soals.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { id_level: 2, text_soal: undefined, kata_kunci: undefined }
    })
    expect(result).toEqual(fakeData)
  })

  test('deleteSoalEsai()', async () => {
    prisma.soals.delete.mockResolvedValue({})
    await SoalEsai.deleteSoalEsai('1')
    expect(prisma.soals.delete).toHaveBeenCalledWith({
      where: { id: 1 }
    })
  })
})
