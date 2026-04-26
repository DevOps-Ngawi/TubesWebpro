/**
 * Test Suite: levelController.js
 * Framework: Jest
 * Cakupan: create, getById, update, remove + validasi input
 */

// Mock dependencies
jest.mock('../../src/models/level')
jest.mock('../../src/helpers/response')

const Level = require('../../src/models/level')
const response = require('../../src/helpers/response')
const {
    create,
    getAll,
    getById,
    update,
    remove,
    getAllBySection,
} = require('../../src/controllers/levelController')

// Helper buat mock req dan res
const mockRes = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}

describe('create()', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        response.mockImplementation(() => {})
    })

    test('berhasil membuat level baru dengan semua field', async () => {
        const req = {
            body: { nama: 'Level Pemula', idSection: '1', deskripsi: 'Level untuk pemula', urutan: '1' }
        }
        const res = mockRes()
        const fakeData = { id: 1, nama: 'Level Pemula', id_section: 1, deskripsi: 'Level untuk pemula', urutan: 1 }
        Level.createLevel.mockResolvedValue(fakeData)

        await create(req, res)

        expect(Level.createLevel).toHaveBeenCalledWith('1', 'Level Pemula', 'Level untuk pemula', '1')
        expect(response).toHaveBeenCalledWith(200, fakeData, 'level created successfully', res)
    })

    test('berhasil membuat level tanpa deskripsi dan urutan (opsional)', async () => {
        const req = {
            body: { nama: 'Level Lanjut', idSection: '2' }
        }
        const res = mockRes()
        const fakeData = { id: 2, nama: 'Level Lanjut', id_section: 2 }
        Level.createLevel.mockResolvedValue(fakeData)

        await create(req, res)

        expect(Level.createLevel).toHaveBeenCalledWith('2', 'Level Lanjut', undefined, undefined)
        expect(response).toHaveBeenCalledWith(200, fakeData, 'level created successfully', res)
    })

    test('validasi: nama level kosong → return 400', async () => {
        const req = { body: { nama: '', idSection: '1' } }
        const res = mockRes()

        await create(req, res)

        expect(Level.createLevel).not.toHaveBeenCalled()
        expect(response).toHaveBeenCalledWith(400, null, 'nama level wajib diisi', res)
    })

    test('validasi: nama level hanya spasi → return 400', async () => {
        const req = { body: { nama: '   ', idSection: '1' } }
        const res = mockRes()

        await create(req, res)

        expect(response).toHaveBeenCalledWith(400, null, 'nama level wajib diisi', res)
    })

    test('validasi: nama level kurang dari 3 karakter → return 400', async () => {
        const req = { body: { nama: 'AB', idSection: '1' } }
        const res = mockRes()

        await create(req, res)

        expect(response).toHaveBeenCalledWith(400, null, 'nama level minimal 3 karakter', res)
    })

    test('validasi: idSection tidak ada → return 400', async () => {
        const req = { body: { nama: 'Level Valid' } }
        const res = mockRes()

        await create(req, res)

        expect(response).toHaveBeenCalledWith(400, null, 'section wajib dipilih', res)
    })

    test('validasi: urutan bukan angka positif → return 400', async () => {
        const req = { body: { nama: 'Level Valid', idSection: '1', urutan: '-5' } }
        const res = mockRes()

        await create(req, res)

        expect(response).toHaveBeenCalledWith(400, null, 'urutan level harus berupa angka positif', res)
    })

    test('error database → return 500', async () => {
        const req = { body: { nama: 'Level Valid', idSection: '1' } }
        const res = mockRes()
        Level.createLevel.mockRejectedValue(new Error('DB connection failed'))

        await create(req, res)

        expect(response).toHaveBeenCalledWith(500, null, 'failed to : DB connection failed', res)
    })
})

describe('getById()', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        response.mockImplementation(() => {})
    })

    test('berhasil mendapatkan level berdasarkan id', async () => {
        const req = { params: { id: '1' } }
        const res = mockRes()
        const fakeLevel = { id: 1, nama: 'Level Pemula', id_section: 1 }
        Level.getLevelById.mockResolvedValue(fakeLevel)

        await getById(req, res)

        expect(Level.getLevelById).toHaveBeenCalledWith('1')
        expect(response).toHaveBeenCalledWith(200, fakeLevel, 'get level by id: 1', res)
    })

    test('level tidak ditemukan → return 404', async () => {
        const req = { params: { id: '999' } }
        const res = mockRes()
        Level.getLevelById.mockResolvedValue(null)

        await getById(req, res)

        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error database → return 500', async () => {
        const req = { params: { id: '1' } }
        const res = mockRes()
        Level.getLevelById.mockRejectedValue(new Error('Query failed'))

        await getById(req, res)

        expect(response).toHaveBeenCalledWith(500, null, 'failed to get level by id: Query failed', res)
    })
})

describe('update()', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        response.mockImplementation(() => {})
    })

    test('berhasil mengupdate level', async () => {
        const req = {
            params: { id: '1' },
            body: { nama: 'Level Menengah', idSection: '2', deskripsi: 'Deskripsi baru', urutan: '2' }
        }
        const res = mockRes()
        const fakeLevel = { id: 1, nama: 'Level Pemula' }
        const updatedLevel = { id: 1, nama: 'Level Menengah', id_section: 2 }
        Level.getLevelById.mockResolvedValue(fakeLevel)
        Level.updateLevel.mockResolvedValue(updatedLevel)

        await update(req, res)

        expect(Level.updateLevel).toHaveBeenCalledWith('1', '2', 'Level Menengah', 'Deskripsi baru', '2')
        expect(response).toHaveBeenCalledWith(200, updatedLevel, 'level updated successfully', res)
    })

    test('validasi: nama kosong saat update → return 400', async () => {
        const req = {
            params: { id: '1' },
            body: { nama: '', idSection: '1' }
        }
        const res = mockRes()

        await update(req, res)

        expect(Level.updateLevel).not.toHaveBeenCalled()
        expect(response).toHaveBeenCalledWith(400, null, 'nama level wajib diisi', res)
    })

    test('level tidak ditemukan saat update → return 404', async () => {
        const req = {
            params: { id: '999' },
            body: { nama: 'Level Baru', idSection: '1' }
        }
        const res = mockRes()
        Level.getLevelById.mockResolvedValue(null)

        await update(req, res)

        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })
})

describe('remove()', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        response.mockImplementation(() => {})
    })

    test('berhasil menghapus level', async () => {
        const req = { params: { id: '1' } }
        const res = mockRes()
        Level.getLevelById.mockResolvedValue({ id: 1, nama: 'Level Pemula' })
        Level.deleteLevel.mockResolvedValue({})

        await remove(req, res)

        expect(Level.deleteLevel).toHaveBeenCalledWith('1')
        expect(response).toHaveBeenCalledWith(200, null, 'level deleted successfully', res)
    })

    test('level tidak ditemukan saat hapus → return 404', async () => {
        const req = { params: { id: '999' } }
        const res = mockRes()
        Level.getLevelById.mockResolvedValue(null)

        await remove(req, res)

        expect(Level.deleteLevel).not.toHaveBeenCalled()
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error database saat hapus → return 500', async () => {
        const req = { params: { id: '1' } }
        const res = mockRes()
        Level.getLevelById.mockResolvedValue({ id: 1 })
        Level.deleteLevel.mockRejectedValue(new Error('Delete failed'))

        await remove(req, res)

        expect(response).toHaveBeenCalledWith(500, null, 'failed to delete level: Delete failed', res)
    })
})

describe('getAll()', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        response.mockImplementation(() => {})
    })

    test('berhasil mendapatkan semua level', async () => {
        const req = {}
        const res = mockRes()
        const fakeLevels = [
            { id: 1, nama: 'Level Pemula' },
            { id: 2, nama: 'Level Menengah' }
        ]
        Level.getAllLevels.mockResolvedValue(fakeLevels)

        await getAll(req, res)

        expect(response).toHaveBeenCalledWith(200, fakeLevels, 'get all levels', res)
    })

    test('tidak ada data → return 404', async () => {
        const req = {}
        const res = mockRes()
        Level.getAllLevels.mockResolvedValue(null)

        await getAll(req, res)

        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })
})