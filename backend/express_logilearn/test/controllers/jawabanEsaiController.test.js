jest.mock('../../src/services/aiGrading')
jest.mock('../../src/models/soalesai')
jest.mock('../../src/models/jawabanEsai')
jest.mock('../../src/models/attempt')
jest.mock('../../src/helpers/response')

const { nilaiEsai } = require('../../src/services/aiGrading')
const Soal = require('../../src/models/soalesai')
const JwbEsai = require('../../src/models/jawabanEsai')
const Attempt = require('../../src/models/attempt')
const response = require('../../src/helpers/response')
const { create, getAll, getById, update } = require('../../src/controllers/jawabanEsaiController')

const mockRes = () => ({ status: jest.fn(), json: jest.fn() })

beforeEach(() => {
    jest.clearAllMocks()
    response.mockImplementation(() => { })
})

describe('create()', () => {
    test('berhasil membuat jawaban esai dan grading AI', async () => {
        const req = { body: { jawaban: 'Ini jawaban dari soal' }, params: { idSoal: '1', idAttempt: '2' } }
        const res = mockRes()

        Soal.getSoalEsaiById.mockResolvedValue({ text_soal: 'Apa itu AI?' })
        nilaiEsai.mockResolvedValue({ score: 0.9, feedback: 'Bagus' })

        const fakeData = { id: 1, ...req.body }
        JwbEsai.createJwbEsai.mockResolvedValue(fakeData)
        Attempt.recalculateScore.mockResolvedValue()

        await create(req, res)

        expect(Soal.getSoalEsaiById).toHaveBeenCalledWith('1')
        expect(nilaiEsai).toHaveBeenCalledWith('Apa itu AI?', 'Ini jawaban dari soal')
        expect(JwbEsai.createJwbEsai).toHaveBeenCalledWith('2', '1', 'Ini jawaban dari soal', 0.9, 'Bagus')
        expect(Attempt.recalculateScore).toHaveBeenCalledWith('2')
        expect(response).toHaveBeenCalledWith(200, fakeData, 'successfully', res)
    })

    test('error database memanggil create -> 500', async () => {
        const req = { body: { jawaban: '' }, params: { idSoal: '1', idAttempt: '2' } }
        const res = mockRes()
        Soal.getSoalEsaiById.mockRejectedValue(new Error('DB Error'))

        await create(req, res)

        expect(response).toHaveBeenCalledWith(500, null, 'failed to : DB Error', res)
    })
})

describe('getAll()', () => {
    test('berhasil return semua jawaban', async () => {
        const fakeData = [{ id: 1 }, { id: 2 }]
        JwbEsai.getAllJwbEsais.mockResolvedValue(fakeData)
        const res = mockRes()
        await getAll({}, res)
        expect(response).toHaveBeenCalledWith(200, fakeData, 'successfully', res)
    })

    test('error database -> 500', async () => {
        JwbEsai.getAllJwbEsais.mockRejectedValue(new Error('DB error'))
        const res = mockRes()
        await getAll({}, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to : DB error', res)
    })
})

describe('getById()', () => {
    test('berhasil return jawaban by id', async () => {
        const fakeData = { id: 1 }
        JwbEsai.getJwbEsaiById.mockResolvedValue(fakeData)
        const req = { params: { id: '1' } }
        const res = mockRes()
        await getById(req, res)
        expect(response).toHaveBeenCalledWith(200, fakeData, 'successfully', res)
    })

    test('error database -> 500', async () => {
        JwbEsai.getJwbEsaiById.mockRejectedValue(new Error('DB error'))
        const req = { params: { id: '1' } }
        const res = mockRes()
        await getById(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to : DB error', res)
    })
})

describe('update()', () => {
    test('berhasil update jawaban, skor, dan feedback', async () => {
        const fakeData = { id: 1, id_attempt: '2' }
        JwbEsai.updateJwbEsai.mockResolvedValue(fakeData)
        Attempt.recalculateScore.mockResolvedValue()

        const req = { params: { id: '1' }, body: { skor: '0.8', feedback: 'Baik', idAdmin: 'admin1' } }
        const res = mockRes()
        await update(req, res)

        expect(JwbEsai.updateJwbEsai).toHaveBeenCalledWith('1', 'admin1', '0.8', 'Baik')
        expect(Attempt.recalculateScore).toHaveBeenCalledWith('2')
        expect(response).toHaveBeenCalledWith(200, fakeData, 'successfully', res)
    })

    test('berhasil update tanpa id_attempt di return data (opsional)', async () => {
        const fakeData = { id: 1 }
        JwbEsai.updateJwbEsai.mockResolvedValue(fakeData)

        const req = { params: { id: '1' }, body: { skor: '0.8', feedback: 'Baik', idAdmin: 'admin1' } }
        const res = mockRes()
        await update(req, res)

        expect(JwbEsai.updateJwbEsai).toHaveBeenCalledWith('1', 'admin1', '0.8', 'Baik')
        expect(Attempt.recalculateScore).not.toHaveBeenCalled()
        expect(response).toHaveBeenCalledWith(200, fakeData, 'successfully', res)
    })

    test('validasi gagal: skor kosong -> 400', async () => {
        const req = { params: { id: '1' }, body: { feedback: 'Baik', idAdmin: 'admin1' } }
        const res = mockRes()
        await update(req, res)
        expect(response).toHaveBeenCalledWith(400, null, 'Skor is required', res)
    })

    test('validasi gagal: feedback kosong -> 400', async () => {
        const req = { params: { id: '1' }, body: { skor: '0.8', idAdmin: 'admin1' } }
        const res = mockRes()
        await update(req, res)
        expect(response).toHaveBeenCalledWith(400, null, 'Feedback is required', res)
    })

    test('validasi gagal: idAdmin kosong -> 400', async () => {
        const req = { params: { id: '1' }, body: { skor: '0.8', feedback: 'Baik' } }
        const res = mockRes()
        await update(req, res)
        expect(response).toHaveBeenCalledWith(400, null, 'Id admin is required', res)
    })

    test('validasi gagal: skor kurang dari 0 -> 400', async () => {
        const req = { params: { id: '1' }, body: { skor: '-0.1', feedback: 'Baik', idAdmin: 'admin1' } }
        const res = mockRes()
        await update(req, res)
        expect(response).toHaveBeenCalledWith(400, null, 'Skor is not valid', res)
    })

    test('validasi gagal: skor lebih dari 1 -> 400', async () => {
        const req = { params: { id: '1' }, body: { skor: '1.5', feedback: 'Baik', idAdmin: 'admin1' } }
        const res = mockRes()
        await update(req, res)
        expect(response).toHaveBeenCalledWith(400, null, 'Skor is not valid', res)
    })

    test('error database -> 500', async () => {
        JwbEsai.updateJwbEsai.mockRejectedValue(new Error('DB error'))
        const req = { params: { id: '1' }, body: { skor: '0.8', feedback: 'Baik', idAdmin: 'admin1' } }
        const res = mockRes()
        await update(req, res)
        expect(response).toHaveBeenCalledWith(500, null, 'failed to : DB error', res)
    })
})
