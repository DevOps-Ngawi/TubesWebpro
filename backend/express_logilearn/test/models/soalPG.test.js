const prisma = require('../../src/models/prisma')
const SoalPG = require('../../src/models/soalPG')

jest.mock('../../src/models/prisma', () => ({
    soals: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    opsis: {
        deleteMany: jest.fn(),
    }
}))

describe('SoalPG Model Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('getAllSoalPG() calls findMany with correct filter', async () => {
        prisma.soals.findMany.mockResolvedValue([])
        
        await SoalPG.getAllSoalPG()
        
        expect(prisma.soals.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { tipe: 'pg' },
            include: { opsis: true }
        }))
    })

    test('getSoalPGById() calls findUnique with numeric id', async () => {
        prisma.soals.findUnique.mockResolvedValue(null)
        
        await SoalPG.getSoalPGById('123')
        
        expect(prisma.soals.findUnique).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 123 }
        }))
    })

    test('getSoalPGByLevel() calls findMany with level filter', async () => {
        prisma.soals.findMany.mockResolvedValue([])
        
        await SoalPG.getSoalPGByLevel('10')
        
        expect(prisma.soals.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { id_level: 10, tipe: 'pg' }
        }))
    })

    test('createSoalPG() calls create with nested opsis', async () => {
        prisma.soals.create.mockResolvedValue({ id: 1 })
        const opsi = [
            { text_opsi: 'Opsi A', is_correct: true },
            { text_opsi: 'Opsi B', is_correct: false }
        ]
        
        await SoalPG.createSoalPG(1, 'Text Soal', opsi)
        
        expect(prisma.soals.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                id_level: 1,
                tipe: 'pg',
                text_soal: 'Text Soal',
                opsis: {
                    create: opsi
                }
            })
        }))
    })

    test('updateSoalPG() deletes old opsis before updating', async () => {
        prisma.opsis.deleteMany.mockResolvedValue({ count: 2 })
        prisma.soals.update.mockResolvedValue({ id: 1 })
        const opsi = [{ text_opsi: 'New', is_correct: true }]
        
        await SoalPG.updateSoalPG('1', 'New Text', opsi)
        
        expect(prisma.opsis.deleteMany).toHaveBeenCalledWith({
            where: { id_soal: 1 }
        })
        expect(prisma.soals.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 1 },
            data: expect.objectContaining({
                text_soal: 'New Text',
                opsis: {
                    create: opsi
                }
            })
        }))
    })

    test('deleteSoalPG() calls delete with correct id', async () => {
        prisma.soals.delete.mockResolvedValue({ id: 1 })
        
        await SoalPG.deleteSoalPG('1')
        
        expect(prisma.soals.delete).toHaveBeenCalledWith({
            where: { id: 1 }
        })
    })
})
