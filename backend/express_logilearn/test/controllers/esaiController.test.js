jest.mock('../../src/models/soalesai')
jest.mock('../../src/helpers/response')
jest.mock('axios')

const SoalEsai = require('../../src/models/soalesai')
const response = require('../../src/helpers/response')
const axios = require('axios')
const {
    getAllEsai, getEsaiById, getEsaiByLevel, createEsai, updateEsai, deleteEsai, fetchEsai
} = require('../../src/controllers/esaiController')

const mockRes = () => ({ status: jest.fn(), json: jest.fn() })

beforeEach(() => {
    jest.clearAllMocks()
    response.mockImplementation(() => {})
})

describe('getAllEsai()', () => {
    test('berhasil return semua soal esai', async () => {
        const fakeData = [{ id: 1, tipe: 'esai', text_soal: 'Jelaskan OOP' }]
        SoalEsai.getAllSoalEsai.mockResolvedValue(fakeData)
        const res = mockRes()
        await getAllEsai({}, res)
        expect(response).toHaveBeenCalledWith(200, fakeData, 'Berhasil mengambil semua soal esai', res)
    })

    test('tidak ada data -> 404', async () => {
        SoalEsai.getAllSoalEsai.mockResolvedValue(null)
        const res = mockRes()
        await getAllEsai({}, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error database -> 500', async () => {
        SoalEsai.getAllSoalEsai.mockRejectedValue(new Error('DB error'))
        const res = mockRes()
        await getAllEsai({}, res)
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res)
    })
})

describe('fetchEsai()', () => {
    test('berhasil fetch dari PHP API', async () => {
        const soalData = [{ id: 1, text_soal: 'Soal dari API' }]
        axios.get.mockResolvedValue({ data: { status: true, data: soalData } })
        const res = mockRes()
        await fetchEsai({}, res)
        expect(axios.get).toHaveBeenCalledWith('http://localhost:8000/getEsai.php')
        expect(response).toHaveBeenCalledWith(200, soalData, 'Berhasil mengambil semua soal esai', res)
    })

    test('status false dari PHP API -> 404', async () => {
        axios.get.mockResolvedValue({ data: { status: false } })
        const res = mockRes()
        await fetchEsai({}, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data soal esai tidak ditemukan', res)
    })

    test('resp.data null -> 404', async () => {
        axios.get.mockResolvedValue({ data: null })
        const res = mockRes()
        await fetchEsai({}, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data soal esai tidak ditemukan', res)
    })

    test('error fetch -> 500', async () => {
        axios.get.mockRejectedValue(new Error('Network error'))
        const res = mockRes()
        await fetchEsai({}, res)
        expect(response).toHaveBeenCalledWith(500, null, 'Gagal mengambil data: Network error', res)
    })
})

describe('getEsaiById()', () => {
    test('berhasil return soal esai by id', async () => {
        const fakeData = { id: 1, tipe: 'esai', text_soal: 'Jelaskan OOP' }
        SoalEsai.getSoalEsaiById.mockResolvedValue(fakeData)
        const req = { params: { id: '1' } }
        const res = mockRes()
        await getEsaiById(req, res)
        expect(response).toHaveBeenCalledWith(200, fakeData, 'Berhasil mengambil detail soal esai', res)
    })

    test('soal tidak ditemukan -> 404', async () => {
        SoalEsai.getSoalEsaiById.mockResolvedValue(null)
        const req = { params: { id: '99' } }
        const res = mockRes()
        await getEsaiById(req, res)
        expect(response).toHaveBeenCalledWith(404, null, 'Soal esai tidak ditemukan', res)
    })

    test('error database -> 500', async () => {
        SoalEsai.getSoalEsaiById.mockRejectedValue(new Error('DB error'))
        const req = { params: { id: '1' } }
        const res = mockRes()
        await getEsaiById(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res)
    })
})

describe('getEsaiByLevel()', () => {
    test('berhasil return soal esai by level', async () => {
        const fakeData = [{ id: 2, id_level: 3, tipe: 'esai' }]
        SoalEsai.getSoalEsaiByLevel.mockResolvedValue(fakeData)
        const req = { params: { id_level: '3' } }
        const res = mockRes()
        await getEsaiByLevel(req, res)
        expect(response).toHaveBeenCalledWith(200, fakeData, 'Berhasil mengambil soal esai level 3', res)
    })

    test('tidak ada data -> 404', async () => {
        SoalEsai.getSoalEsaiByLevel.mockResolvedValue(null)
        const req = { params: { id_level: '99' } }
        const res = mockRes()
        await getEsaiByLevel(req, res)
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res)
    })

    test('error database -> 500', async () => {
        SoalEsai.getSoalEsaiByLevel.mockRejectedValue(new Error('DB error'))
        const req = { params: { id_level: '3' } }
        const res = mockRes()
        await getEsaiByLevel(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res)
    })
})

describe('createEsai()', () => {
    test('berhasil create soal esai', async () => {
        const fakeData = { id: 5, id_level: 2, tipe: 'esai', text_soal: 'Soal baru', kata_kunci: 'kunci' }
        SoalEsai.createSoalEsai.mockResolvedValue(fakeData)
        const req = { body: { id_level: 2, text_soal: 'Soal baru', kata_kunci: 'kunci' } }
        const res = mockRes()
        await createEsai(req, res)
        expect(SoalEsai.createSoalEsai).toHaveBeenCalledWith(2, 'Soal baru', 'kunci')
        expect(response).toHaveBeenCalledWith(201, fakeData, 'Soal esai berhasil dibuat', res)
    })

    test('id_level atau text_soal kosong -> 400', async () => {
        const req = { body: { text_soal: 'Soal tanpa level' } }
        const res = mockRes()
        await createEsai(req, res)
        expect(SoalEsai.createSoalEsai).not.toHaveBeenCalled()
        expect(response).toHaveBeenCalledWith(400, null, 'id_level dan text_soal wajib diisi', res)
    })

    test('error database -> 500', async () => {
        SoalEsai.createSoalEsai.mockRejectedValue(new Error('DB error'))
        const req = { body: { id_level: 2, text_soal: 'Soal baru', kata_kunci: 'kunci' } }
        const res = mockRes()
        await createEsai(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res)
    })
})

describe('updateEsai()', () => {
    test('berhasil update soal esai', async () => {
        const fakeData = { id: 1, text_soal: 'Soal lama' }
        const updatedData = { id: 1, text_soal: 'Soal diperbarui' }
        SoalEsai.getSoalEsaiById.mockResolvedValue(fakeData)
        SoalEsai.updateSoalEsai.mockResolvedValue(updatedData)
        const req = { params: { id: '1' }, body: { id_level: 2, text_soal: 'Soal diperbarui', kata_kunci: 'kunci' } }
        const res = mockRes()
        await updateEsai(req, res)
        expect(SoalEsai.updateSoalEsai).toHaveBeenCalledWith('1', 2, 'Soal diperbarui', 'kunci')
        expect(response).toHaveBeenCalledWith(200, updatedData, 'Soal esai berhasil diperbarui', res)
    })

    test('soal tidak ditemukan -> 404', async () => {
        SoalEsai.getSoalEsaiById.mockResolvedValue(null)
        const req = { params: { id: '99' }, body: { text_soal: 'Update' } }
        const res = mockRes()
        await updateEsai(req, res)
        expect(SoalEsai.updateSoalEsai).not.toHaveBeenCalled()
        expect(response).toHaveBeenCalledWith(404, null, 'Soal esai tidak ditemukan', res)
    })

    test('error database -> 500', async () => {
        SoalEsai.getSoalEsaiById.mockResolvedValue({ id: 1 })
        SoalEsai.updateSoalEsai.mockRejectedValue(new Error('DB error'))
        const req = { params: { id: '1' }, body: { text_soal: 'Update' } }
        const res = mockRes()
        await updateEsai(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res)
    })
})

describe('deleteEsai()', () => {
    test('berhasil delete soal esai', async () => {
        SoalEsai.getSoalEsaiById.mockResolvedValue({ id: 1 })
        SoalEsai.deleteSoalEsai.mockResolvedValue({})
        const req = { params: { id: '1' } }
        const res = mockRes()
        await deleteEsai(req, res)
        expect(SoalEsai.deleteSoalEsai).toHaveBeenCalledWith('1')
        expect(response).toHaveBeenCalledWith(200, null, 'Soal esai berhasil dihapus', res)
    })

    test('soal tidak ditemukan -> 404', async () => {
        SoalEsai.getSoalEsaiById.mockResolvedValue(null)
        const req = { params: { id: '99' } }
        const res = mockRes()
        await deleteEsai(req, res)
        expect(SoalEsai.deleteSoalEsai).not.toHaveBeenCalled()
        expect(response).toHaveBeenCalledWith(404, null, 'Soal esai tidak ditemukan', res)
    })

    test('error database -> 500', async () => {
        SoalEsai.getSoalEsaiById.mockResolvedValue({ id: 1 })
        SoalEsai.deleteSoalEsai.mockRejectedValue(new Error('DB error'))
        const req = { params: { id: '1' } }
        const res = mockRes()
        await deleteEsai(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res)
    })
})
