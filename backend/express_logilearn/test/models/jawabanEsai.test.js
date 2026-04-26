const prisma = require('../../src/models/prisma')
const JwbEsai = require('../../src/models/jawabanEsai')

jest.mock('../../src/models/prisma', () => ({
  jawabanEsais: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))

describe('JawabanEsai Model', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('getAllJwbEsais()', async () => {
    const fakeData = [{ id: 1, text_jawaban_esai: 'Testing' }]
    prisma.jawabanEsais.findMany.mockResolvedValue(fakeData)

    const result = await JwbEsai.getAllJwbEsais()

    expect(prisma.jawabanEsais.findMany).toHaveBeenCalledTimes(1)
    expect(result).toEqual(fakeData)
  })

  test('getJwbEsaiById()', async () => {
    const fakeData = { id: 1, text_jawaban_esai: 'Testing' }
    prisma.jawabanEsais.findUnique.mockResolvedValue(fakeData)

    const result = await JwbEsai.getJwbEsaiById('1')

    expect(prisma.jawabanEsais.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    })
    expect(result).toEqual(fakeData)
  })

  test('createJwbEsai()', async () => {
    const fakeData = { id: 1 }
    prisma.jawabanEsais.create.mockResolvedValue(fakeData)

    const result = await JwbEsai.createJwbEsai('2', '3', 'Jawaban', 0.8, 'Bagus')

    expect(prisma.jawabanEsais.create).toHaveBeenCalledWith({
      data: {
        id_attempt: 2,
        id_soal: 3,
        text_jawaban_esai: 'Jawaban',
        skor: 0.8,
        feedback: 'Bagus'
      }
    })
    expect(result).toEqual(fakeData)
  })

  test('updateJwbEsai()', async () => {
    const fakeData = { id: 1 }
    prisma.jawabanEsais.update.mockResolvedValue(fakeData)

    const result = await JwbEsai.updateJwbEsai('1', 'admin1', 0.9, 'Sangat Bagus')

    expect(prisma.jawabanEsais.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        id_admin: 'admin1',
        skor: 0.9,
        feedback: 'Sangat Bagus'
      }
    })
    expect(result).toEqual(fakeData)
  })

})
