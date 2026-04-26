const prisma = require('../../src/models/prisma')
const Section = require('../../src/models/section')

jest.mock('../../src/models/prisma', () => ({
  sections: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}))

describe('Section Model', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('getAllSections()', async () => {
    const fakeData = [{ id: 1, nama: 'Section A' }]
    prisma.sections.findMany.mockResolvedValue(fakeData)
    const result = await Section.getAllSections()
    expect(prisma.sections.findMany).toHaveBeenCalledWith({ include: { levels: true } })
    expect(result).toEqual(fakeData)
  })

  test('getSectionById()', async () => {
    const fakeData = { id: 1, nama: 'Section A' }
    prisma.sections.findUnique.mockResolvedValue(fakeData)
    const result = await Section.getSectionById('1')
    expect(prisma.sections.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { levels: true }
    })
    expect(result).toEqual(fakeData)
  })

  test('createSection()', async () => {
    const fakeData = { id: 1, nama: 'Section Baru', slug: 'section-baru' }
    prisma.sections.create.mockResolvedValue(fakeData)
    const result = await Section.createSection('Section Baru', 'section-baru')
    expect(prisma.sections.create).toHaveBeenCalledWith({
      data: { nama: 'Section Baru', slug: 'section-baru' }
    })
    expect(result).toEqual(fakeData)
  })

  test('updateSection()', async () => {
    const fakeData = { id: 1, nama: 'Section Update' }
    prisma.sections.update.mockResolvedValue(fakeData)
    const result = await Section.updateSection('1', 'Section Update')
    expect(prisma.sections.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { nama: 'Section Update' }
    })
    expect(result).toEqual(fakeData)
  })

  test('deleteSection()', async () => {
    prisma.sections.delete.mockResolvedValue({})
    await Section.deleteSection('1')
    expect(prisma.sections.delete).toHaveBeenCalledWith({
      where: { id: 1 }
    })
  })
})
