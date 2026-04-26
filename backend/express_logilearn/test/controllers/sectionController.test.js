jest.mock('../../src/models/section')
jest.mock('../../src/helpers/response')
jest.mock('axios')

const Section = require('../../src/models/section')
const response = require('../../src/helpers/response')
const axios = require('axios')
const {
    getAll, fetchSections, getById, create, update, remove
} = require('../../src/controllers/sectionController')

const mockRes = () => ({ status: jest.fn(), json: jest.fn() })

beforeEach(() => {
    jest.clearAllMocks()
    response.mockImplementation(() => {})
})

describe('getAll()', () => {
    test('berhasil return semua section', async () => {
        const fakeData = [{ id: 1, nama: 'Section A' }]
        Section.getAllSections.mockResolvedValue(fakeData)
        const res = mockRes()
        await getAll({}, res)
        expect(response).toHaveBeenCalledWith(200, fakeData, 'get all sections', res)
    })

    test('tidak ada data -> 404', async () => {
        Section.getAllSections.mockResolvedValue(null)
        const res = mockRes()
        await getAll({}, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error database -> 500', async () => {
        Section.getAllSections.mockRejectedValue(new Error('DB error'))
        const res = mockRes()
        await getAll({}, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to get all sections: DB error', res)
    })
})

describe('fetchSections()', () => {
    test('berhasil fetch PHP API', async () => {
        const fakeData = { data: { data: [{ id: 1, nama: 'Section API' }] } }
        axios.get.mockResolvedValue(fakeData)
        const res = mockRes()
        await fetchSections({}, res)
        expect(axios.get).toHaveBeenCalledWith('http://localhost:8000/getSection.php')
        expect(response).toHaveBeenCalledWith(200, fakeData.data.data, 'get all sections from PHP API', res)
    })

    test('tidak ada respon dari PHP API -> 404', async () => {
        axios.get.mockResolvedValue(null)
        const res = mockRes()
        await fetchSections({}, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error fetch -> 500', async () => {
        axios.get.mockRejectedValue(new Error('Network error'))
        const res = mockRes()
        await fetchSections({}, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to fetch sections from PHP API: Network error', res)
    })
})

describe('getById()', () => {
    test('berhasil return section by id', async () => {
        const fakeData = { id: 1, nama: 'Section A' }
        Section.getSectionById.mockResolvedValue(fakeData)
        const req = { params: { id: '1' } }
        const res = mockRes()
        await getById(req, res)
        expect(response).toHaveBeenCalledWith(200, fakeData, 'get section by id: 1', res)
    })

    test('section tidak ditemukan -> 404', async () => {
        Section.getSectionById.mockResolvedValue(null)
        const req = { params: { id: '99' } }
        const res = mockRes()
        await getById(req, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error database -> 500', async () => {
        Section.getSectionById.mockRejectedValue(new Error('DB error'))
        const req = { params: { id: '1' } }
        const res = mockRes()
        await getById(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to get section by id: DB error', res)
    })
})

describe('create()', () => {
    test('berhasil create section', async () => {
        const fakeData = { id: 1, nama: 'Section Baru', slug: 'section-baru' }
        Section.createSection.mockResolvedValue(fakeData)
        const req = { body: { nama: 'Section Baru', slug: 'section-baru' } }
        const res = mockRes()
        await create(req, res)
        expect(Section.createSection).toHaveBeenCalledWith('Section Baru', 'section-baru')
        expect(response).toHaveBeenCalledWith(200, fakeData, 'section created successfully', res)
    })

    test('error database -> 500', async () => {
        Section.createSection.mockRejectedValue(new Error('DB error'))
        const req = { body: { nama: 'Section Baru', slug: 'section-baru' } }
        const res = mockRes()
        await create(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to create section: DB error', res)
    })
})

describe('update()', () => {
    test('berhasil update section', async () => {
        const fakeData = { id: 1, nama: 'Section Lama' }
        const updatedData = { id: 1, nama: 'Section Baru' }
        Section.getSectionById.mockResolvedValue(fakeData)
        Section.updateSection.mockResolvedValue(updatedData)
        const req = { params: { id: '1' }, body: { nama: 'Section Baru' } }
        const res = mockRes()
        await update(req, res)
        expect(Section.updateSection).toHaveBeenCalledWith('1', 'Section Baru')
        expect(response).toHaveBeenCalledWith(200, updatedData, 'section updated successfully', res)
    })

    test('section tidak ditemukan -> 404', async () => {
        Section.getSectionById.mockResolvedValue(null)
        const req = { params: { id: '99' }, body: { nama: 'Section Baru' } }
        const res = mockRes()
        await update(req, res)
        expect(Section.updateSection).not.toHaveBeenCalled()
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error database -> 500', async () => {
        Section.getSectionById.mockResolvedValue({ id: 1 })
        Section.updateSection.mockRejectedValue(new Error('DB error'))
        const req = { params: { id: '1' }, body: { nama: 'Section Baru' } }
        const res = mockRes()
        await update(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to update section: DB error', res)
    })
})

describe('remove()', () => {
    test('berhasil delete section', async () => {
        Section.getSectionById.mockResolvedValue({ id: 1 })
        Section.deleteSection.mockResolvedValue({})
        const req = { params: { id: '1' } }
        const res = mockRes()
        await remove(req, res)
        expect(Section.deleteSection).toHaveBeenCalledWith('1')
        expect(response).toHaveBeenCalledWith(200, null, 'section deleted successfully', res)
    })

    test('section tidak ditemukan -> 404', async () => {
        Section.getSectionById.mockResolvedValue(null)
        const req = { params: { id: '99' } }
        const res = mockRes()
        await remove(req, res)
        expect(Section.deleteSection).not.toHaveBeenCalled()
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error database -> 500', async () => {
        Section.getSectionById.mockResolvedValue({ id: 1 })
        Section.deleteSection.mockRejectedValue(new Error('DB error'))
        const req = { params: { id: '1' } }
        const res = mockRes()
        await remove(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to delete section: DB error', res)
    })
})
