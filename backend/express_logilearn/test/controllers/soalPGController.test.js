jest.mock('../../src/models/soalPG')
jest.mock('../../src/helpers/response')

const SoalPG = require('../../src/models/soalPG')
const response = require('../../src/helpers/response')
const {
    getAll, getById, getByLevel, create, update, delete: deleteHandler
} = require('../../src/controllers/soalPGController')

const mockRes = () => ({
    status: jest.fn(),
    json: jest.fn()
})

const fakeSoalData = {
    id: 1,
    id_level: 10,
    text_soal: 'Apa itu 1 + 1?',
    opsis: [
        { id: 1, text_opsi: '2', is_correct: true },
        { id: 2, text_opsi: '3', is_correct: false }
    ]
}

beforeEach(() => {
    jest.clearAllMocks()
    response.mockImplementation(() => {})
})

describe('soalPGController Unit Tests', () => {
    describe('getAll()', () => {
        test('success: return all soal PG', async () => {
            const data = [fakeSoalData]
            SoalPG.getAllSoalPG.mockResolvedValue(data)
            const res = mockRes()

            await getAll({}, res)

            expect(response).toHaveBeenCalledWith(200, data, 'get all soal PG', res)
        })

        test('empty: no soal found return 200 with empty array', async () => {
            SoalPG.getAllSoalPG.mockResolvedValue([])
            const res = mockRes()

            await getAll({}, res)

            expect(response).toHaveBeenCalledWith(200, [], 'no soal PG found', res)
        })

        test('error: database failure return 500', async () => {
            SoalPG.getAllSoalPG.mockRejectedValue(new Error('DB Error'))
            const res = mockRes()

            await getAll({}, res)

            expect(response).toHaveBeenCalledWith(500, null, expect.stringContaining('failed'), res)
        })
    })

    describe('getById()', () => {
        test('success: return soal by id', async () => {
            SoalPG.getSoalPGById.mockResolvedValue(fakeSoalData)
            const req = { params: { id: '1' } }
            const res = mockRes()

            await getById(req, res)

            expect(response).toHaveBeenCalledWith(200, fakeSoalData, 'get soal PG by id: 1', res)
        })

        test('not found: return 404', async () => {
            SoalPG.getSoalPGById.mockResolvedValue(null)
            const req = { params: { id: '99' } }
            const res = mockRes()

            await getById(req, res)

            expect(response).toHaveBeenCalledWith(404, null, 'soal PG not found', res)
        })
    })

    describe('getByLevel()', () => {
        test('success: return soals by level', async () => {
            const data = [fakeSoalData]
            SoalPG.getSoalPGByLevel.mockResolvedValue(data)
            const req = { params: { idLevel: '10' } }
            const res = mockRes()

            await getByLevel(req, res)

            expect(response).toHaveBeenCalledWith(200, data, 'get soal PG by level: 10', res)
        })

        test('empty: no soal for level return 200', async () => {
            SoalPG.getSoalPGByLevel.mockResolvedValue([])
            const req = { params: { idLevel: '99' } }
            const res = mockRes()

            await getByLevel(req, res)

            expect(response).toHaveBeenCalledWith(200, [], 'no soal PG found for level: 99', res)
        })
    })

    describe('create()', () => {
        const validBody = {
            id_level: 1,
            text_soal: 'Test Soal',
            opsi: [
                { text_opsi: 'A', is_correct: true },
                { text_opsi: 'B', is_correct: false }
            ]
        }

        test('success: create soal with valid data', async () => {
            SoalPG.createSoalPG.mockResolvedValue({ id: 1, ...validBody })
            const req = { body: validBody }
            const res = mockRes()

            await create(req, res)

            expect(SoalPG.createSoalPG).toHaveBeenCalledWith(1, 'Test Soal', validBody.opsi)
            expect(response).toHaveBeenCalledWith(200, expect.any(Object), 'soal PG created successfully', res)
        })

        test('invalid: missing required fields return 400', async () => {
            const req = { body: { text_soal: 'No level' } }
            const res = mockRes()

            await create(req, res)

            expect(response).toHaveBeenCalledWith(400, null, expect.stringContaining('missing or invalid'), res)
        })

        test('invalid: opsi less than 2 return 400', async () => {
            const req = { body: { ...validBody, opsi: [{ text_opsi: 'A', is_correct: true }] } }
            const res = mockRes()

            await create(req, res)

            expect(response).toHaveBeenCalledWith(400, null, 'minimal opsi jawaban harus 2', res)
        })

        test('invalid: no correct answer return 400', async () => {
            const req = {
                body: {
                    ...validBody,
                    opsi: [
                        { text_opsi: 'A', is_correct: false },
                        { text_opsi: 'B', is_correct: false }
                    ]
                }
            }
            const res = mockRes()

            await create(req, res)

            expect(response).toHaveBeenCalledWith(400, null, 'harus ada minimal 1 jawaban yang benar', res)
        })
    })

    describe('update()', () => {
        const updateBody = {
            text_soal: 'Updated Question',
            opsi: [
                { text_opsi: 'C', is_correct: true },
                { text_opsi: 'D', is_correct: false }
            ]
        }

        test('success: update existing soal', async () => {
            SoalPG.getSoalPGById.mockResolvedValue(fakeSoalData)
            SoalPG.updateSoalPG.mockResolvedValue({ id: 1, ...updateBody })
            const req = { params: { id: '1' }, body: updateBody }
            const res = mockRes()

            await update(req, res)

            expect(SoalPG.updateSoalPG).toHaveBeenCalledWith('1', 'Updated Question', updateBody.opsi)
            expect(response).toHaveBeenCalledWith(200, expect.any(Object), 'soal PG updated successfully', res)
        })

        test('not found: update non-existent soal return 404', async () => {
            SoalPG.getSoalPGById.mockResolvedValue(null)
            const req = { params: { id: '99' }, body: updateBody }
            const res = mockRes()

            await update(req, res)

            expect(response).toHaveBeenCalledWith(404, null, 'soal PG not found', res)
        })
    })

    describe('delete()', () => {
        test('success: delete existing soal', async () => {
            SoalPG.getSoalPGById.mockResolvedValue(fakeSoalData)
            SoalPG.deleteSoalPG.mockResolvedValue(fakeSoalData)
            const req = { params: { id: '1' } }
            const res = mockRes()

            await deleteHandler(req, res)

            expect(SoalPG.deleteSoalPG).toHaveBeenCalledWith('1')
            expect(response).toHaveBeenCalledWith(200, fakeSoalData, 'soal PG deleted successfully', res)
        })

        test('not found: delete non-existent soal return 404', async () => {
            SoalPG.getSoalPGById.mockResolvedValue(null)
            const req = { params: { id: '99' } }
            const res = mockRes()

            await deleteHandler(req, res)

            expect(response).toHaveBeenCalledWith(404, null, 'soal PG not found', res)
        })
    })
})
