/**
 * Test Suite: levelController.js
 * Framework: Jest
 * Coverage target: > 80%
 */

jest.mock('../../src/models/level')
jest.mock('../../src/helpers/response')
jest.mock('axios')

const Level = require('../../src/models/level')
const response = require('../../src/helpers/response')
const axios = require('axios')
const {
    create, getAll, getAllBySection, getBySectionId,
    getById, update, remove, getSoalsByLevel, getSoalByLevelAndId,
    validateLevelInput, findLevelOrFail,
} = require('../../src/controllers/levelController')

const mockRes = () => ({ status: jest.fn(), json: jest.fn() })

beforeEach(() => {
    jest.clearAllMocks()
    response.mockImplementation(() => {})
})

describe('validateLevelInput()', () => {
    test('valid: semua field benar → return null', () => {
        expect(validateLevelInput('Level Pemula', '1', '1')).toBeNull()
    })
    test('valid: tanpa urutan → return null', () => {
        expect(validateLevelInput('Level Pemula', '1', undefined)).toBeNull()
    })
    test('invalid: nama kosong → return pesan error', () => {
        expect(validateLevelInput('', '1', null)).toBe('nama level wajib diisi')
    })
    test('invalid: nama hanya spasi → return pesan error', () => {
        expect(validateLevelInput('   ', '1', null)).toBe('nama level wajib diisi')
    })
    test('invalid: nama kurang 3 karakter → return pesan error', () => {
        expect(validateLevelInput('AB', '1', null)).toBe('nama level minimal 3 karakter')
    })
    test('invalid: idSection kosong → return pesan error', () => {
        expect(validateLevelInput('Level Valid', '', null)).toBe('section wajib dipilih')
    })
    test('invalid: idSection null → return pesan error', () => {
        expect(validateLevelInput('Level Valid', null, null)).toBe('section wajib dipilih')
    })
    test('invalid: urutan negatif → return pesan error', () => {
        expect(validateLevelInput('Level Valid', '1', '-1')).toBe('urutan level harus berupa angka positif')
    })
    test('invalid: urutan bukan angka → return pesan error', () => {
        expect(validateLevelInput('Level Valid', '1', 'abc')).toBe('urutan level harus berupa angka positif')
    })
    test('valid: urutan string kosong dianggap tidak diisi → return null', () => {
        expect(validateLevelInput('Level Valid', '1', '')).toBeNull()
    })
})

describe('findLevelOrFail()', () => {
    test('level ditemukan → return data', async () => {
        const fakeLevel = { id: 1, nama: 'Level Pemula' }
        Level.getLevelById.mockResolvedValue(fakeLevel)
        const res = mockRes()
        const result = await findLevelOrFail('1', res)
        expect(result).toEqual(fakeLevel)
        expect(response).not.toHaveBeenCalled()
    })

    test('level tidak ditemukan → kirim 404 dan return null', async () => {
        Level.getLevelById.mockResolvedValue(null)
        const res = mockRes()
        const result = await findLevelOrFail('999', res)
        expect(result).toBeNull()
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })
})
describe('create()', () => {
    test('berhasil buat level dengan semua field', async () => {
        const req = { body: { nama: 'Level Pemula', idSection: '1', deskripsi: 'Untuk pemula', urutan: '1' } }
        const res = mockRes()
        const fakeData = { id: 1, nama: 'Level Pemula' }
        Level.createLevel.mockResolvedValue(fakeData)

        await create(req, res)

        expect(Level.createLevel).toHaveBeenCalledWith('1', 'Level Pemula', 'Untuk pemula', '1')
        expect(response).toHaveBeenCalledWith(200, fakeData, 'level created successfully', res)
    })

    test('berhasil buat level tanpa deskripsi dan urutan', async () => {
        const req = { body: { nama: 'Level Lanjut', idSection: '2' } }
        const res = mockRes()
        Level.createLevel.mockResolvedValue({ id: 2, nama: 'Level Lanjut' })

        await create(req, res)

        expect(Level.createLevel).toHaveBeenCalledWith('2', 'Level Lanjut', null, null)
    })

    test('validasi gagal: nama kosong → 400', async () => {
        const req = { body: { nama: '', idSection: '1' } }
        const res = mockRes()
        await create(req, res)
        expect(response).toHaveBeenCalledWith(400, null, 'nama level wajib diisi', res)
        expect(Level.createLevel).not.toHaveBeenCalled()
    })

    test('validasi gagal: nama < 3 karakter → 400', async () => {
        const req = { body: { nama: 'AB', idSection: '1' } }
        const res = mockRes()
        await create(req, res)
        expect(response).toHaveBeenCalledWith(400, null, 'nama level minimal 3 karakter', res)
    })

    test('validasi gagal: idSection kosong → 400', async () => {
        const req = { body: { nama: 'Level Valid' } }
        const res = mockRes()
        await create(req, res)
        expect(response).toHaveBeenCalledWith(400, null, 'section wajib dipilih', res)
    })

    test('validasi gagal: urutan negatif → 400', async () => {
        const req = { body: { nama: 'Level Valid', idSection: '1', urutan: '-3' } }
        const res = mockRes()
        await create(req, res)
        expect(response).toHaveBeenCalledWith(400, null, 'urutan level harus berupa angka positif', res)
    })

    test('error database → 500', async () => {
        const req = { body: { nama: 'Level Valid', idSection: '1' } }
        const res = mockRes()
        Level.createLevel.mockRejectedValue(new Error('DB error'))
        await create(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to create level: DB error', res)
    })
})

describe('getAll()', () => {
    test('berhasil return semua level', async () => {
        const fakeLevels = [{ id: 1, nama: 'Level A' }, { id: 2, nama: 'Level B' }]
        Level.getAllLevels.mockResolvedValue(fakeLevels)
        const res = mockRes()
        await getAll({}, res)
        expect(response).toHaveBeenCalledWith(200, fakeLevels, 'get all levels', res)
    })

    test('tidak ada data → 404', async () => {
        Level.getAllLevels.mockResolvedValue(null)
        const res = mockRes()
        await getAll({}, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error database → 500', async () => {
        Level.getAllLevels.mockRejectedValue(new Error('DB error'))
        const res = mockRes()
        await getAll({}, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to get all levels: DB error', res)
    })
})

describe('getById()', () => {
    test('berhasil return level by id', async () => {
        const fakeLevel = { id: 1, nama: 'Level A' }
        Level.getLevelById.mockResolvedValue(fakeLevel)
        const req = { params: { id: '1' } }
        const res = mockRes()
        await getById(req, res)
        expect(response).toHaveBeenCalledWith(200, fakeLevel, 'get level by id: 1', res)
    })

    test('level tidak ada → 404', async () => {
        Level.getLevelById.mockResolvedValue(null)
        const req = { params: { id: '99' } }
        const res = mockRes()
        await getById(req, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error database → 500', async () => {
        Level.getLevelById.mockRejectedValue(new Error('Query failed'))
        const req = { params: { id: '1' } }
        const res = mockRes()
        await getById(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to get level by id: Query failed', res)
    })
})

describe('getAllBySection()', () => {
    test('berhasil return levels by section', async () => {
        const fakeLevels = [{ id: 1, nama: 'Level A' }]
        Level.getLevelsBySection.mockResolvedValue(fakeLevels)
        const req = { params: { slugSection: 'grammar' } }
        const res = mockRes()
        await getAllBySection(req, res)
        expect(response).toHaveBeenCalledWith(200, fakeLevels, 'get all levels by section: grammar', res)
    })

    test('data kosong → 404', async () => {
        Level.getLevelsBySection.mockResolvedValue(null)
        const req = { params: { slugSection: 'unknown' } }
        const res = mockRes()
        await getAllBySection(req, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })
})
describe('getBySectionId()', () => {
    test('berhasil return level by section dan id', async () => {
        const fakeLevel = { id: 1, nama: 'Level A' }
        Level.getLevelsBySectionId.mockResolvedValue(fakeLevel)
        const req = { params: { slugSection: 'grammar', id: '1' } }
        const res = mockRes()
        await getBySectionId(req, res)
        expect(response).toHaveBeenCalledWith(200, fakeLevel, 'get level by section: grammar', res)
    })

    test('data tidak ditemukan → 404', async () => {
        Level.getLevelsBySectionId.mockResolvedValue(null)
        const req = { params: { slugSection: 'grammar', id: '99' } }
        const res = mockRes()
        await getBySectionId(req, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })
})
describe('update()', () => {
    test('berhasil update level', async () => {
        const fakeLevel = { id: 1, nama: 'Level Lama' }
        const updatedLevel = { id: 1, nama: 'Level Baru' }
        Level.getLevelById.mockResolvedValue(fakeLevel)
        Level.updateLevel.mockResolvedValue(updatedLevel)
        const req = { params: { id: '1' }, body: { nama: 'Level Baru', idSection: '2', deskripsi: 'Desc', urutan: '2' } }
        const res = mockRes()
        await update(req, res)
        expect(Level.updateLevel).toHaveBeenCalledWith('1', '2', 'Level Baru', 'Desc', '2')
        expect(response).toHaveBeenCalledWith(200, updatedLevel, 'level updated successfully', res)
    })

    test('validasi gagal: nama kosong → 400', async () => {
        const req = { params: { id: '1' }, body: { nama: '', idSection: '1' } }
        const res = mockRes()
        await update(req, res)
        expect(response).toHaveBeenCalledWith(400, null, 'nama level wajib diisi', res)
        expect(Level.updateLevel).not.toHaveBeenCalled()
    })

    test('level tidak ditemukan → 404', async () => {
        Level.getLevelById.mockResolvedValue(null)
        const req = { params: { id: '99' }, body: { nama: 'Level Valid', idSection: '1' } }
        const res = mockRes()
        await update(req, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
        expect(Level.updateLevel).not.toHaveBeenCalled()
    })

    test('error database → 500', async () => {
        Level.getLevelById.mockResolvedValue({ id: 1 })
        Level.updateLevel.mockRejectedValue(new Error('Update failed'))
        const req = { params: { id: '1' }, body: { nama: 'Level Valid', idSection: '1' } }
        const res = mockRes()
        await update(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to update level: Update failed', res)
    })
})
describe('remove()', () => {
    test('berhasil hapus level', async () => {
        Level.getLevelById.mockResolvedValue({ id: 1, nama: 'Level A' })
        Level.deleteLevel.mockResolvedValue({})
        const req = { params: { id: '1' } }
        const res = mockRes()
        await remove(req, res)
        expect(Level.deleteLevel).toHaveBeenCalledWith('1')
        expect(response).toHaveBeenCalledWith(200, null, 'level deleted successfully', res)
    })

    test('level tidak ditemukan → 404, tidak hapus', async () => {
        Level.getLevelById.mockResolvedValue(null)
        const req = { params: { id: '99' } }
        const res = mockRes()
        await remove(req, res)
        expect(Level.deleteLevel).not.toHaveBeenCalled()
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error database → 500', async () => {
        Level.getLevelById.mockResolvedValue({ id: 1 })
        Level.deleteLevel.mockRejectedValue(new Error('Delete failed'))
        const req = { params: { id: '1' } }
        const res = mockRes()
        await remove(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to delete level: Delete failed', res)
    })
})
describe('getSoalsByLevel()', () => {
    test('berhasil return soals', async () => {
        const fakeSoals = [{ id: 1 }, { id: 2 }]
        Level.getSoalsByLevelId.mockResolvedValue(fakeSoals)
        const req = { params: { slugSection: 'grammar', id: '1' } }
        const res = mockRes()
        await getSoalsByLevel(req, res)
        expect(response).toHaveBeenCalledWith(200, fakeSoals, 'get soals by level: 1', res)
    })

    test('tidak ada soal → return array kosong dengan 200', async () => {
        Level.getSoalsByLevelId.mockResolvedValue([])
        const req = { params: { slugSection: 'grammar', id: '1' } }
        const res = mockRes()
        await getSoalsByLevel(req, res)
        expect(response).toHaveBeenCalledWith(200, [], expect.any(String), res)
    })
})
describe('getSoalByLevelAndId()', () => {
    test('berhasil return soal spesifik', async () => {
        const fakeLevel = { id: 1 }
        const fakeSoal = { id: 5, id_level: 1 }
        Level.getLevelsBySectionId.mockResolvedValue(fakeLevel)
        Level.getSoalByLevelIdAndSoalId.mockResolvedValue(fakeSoal)
        const req = { params: { slugSection: 'grammar', id: '1', idSoal: '5' } }
        const res = mockRes()
        await getSoalByLevelAndId(req, res)
        expect(response).toHaveBeenCalledWith(200, fakeSoal, 'get soal by level: 1 and soal id: 5', res)
    })

    test('level tidak ada di section (tapi ada di section lain) → 404', async () => {
        Level.getLevelsBySectionId.mockResolvedValue(null)
        Level.getLevelById.mockResolvedValue({ id: 1 }) 
        const req = { params: { slugSection: 'grammar', id: '1', idSoal: '5' } }
        const res = mockRes()
        await getSoalByLevelAndId(req, res)
        expect(response).toHaveBeenCalledWith(404, null, 'level 1 not found in section grammar', res)
    })

    test('level tidak ada sama sekali → 404', async () => {
        Level.getLevelsBySectionId.mockResolvedValue(null)
        Level.getLevelById.mockResolvedValue(null)
        const req = { params: { slugSection: 'grammar', id: '99', idSoal: '5' } }
        const res = mockRes()
        await getSoalByLevelAndId(req, res)
        expect(response).toHaveBeenCalledWith(404, null, 'level 99 not found', res)
    })

    test('soal tidak ditemukan di level → 404', async () => {
        Level.getLevelsBySectionId.mockResolvedValue({ id: 1 })
        Level.getSoalByLevelIdAndSoalId.mockResolvedValue(null)
        const req = { params: { slugSection: 'grammar', id: '1', idSoal: '99' } }
        const res = mockRes()
        await getSoalByLevelAndId(req, res)
        expect(response).toHaveBeenCalledWith(404, null, 'soal with id 99 not found in level 1', res)
    })

    test('error database → 500', async () => {
        Level.getLevelsBySectionId.mockRejectedValue(new Error('DB crash'))
        const req = { params: { slugSection: 'grammar', id: '1', idSoal: '5' } }
        const res = mockRes()
        await getSoalByLevelAndId(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to get soal by level and id: DB crash', res)
    })
})