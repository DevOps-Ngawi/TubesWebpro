const JwbPG = require('../../src/models/jawabanPG')
const Attempt = require('../../src/models/attempt')
const response = require('../../src/helpers/response')
const { getAll, getById, create } = require('../../src/controllers/jawabanPGController')

jest.mock('../../src/models/jawabanPG')
jest.mock('../../src/models/attempt')
jest.mock('../../src/helpers/response')

const mockRes = () => ({ status: jest.fn(), json: jest.fn() })

describe('JawabanPG Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    response.mockImplementation(() => {})
  })

  describe('create()', () => {
    test('berhasil membuat jawaban dan recalculate skor', async () => {
      const req = { params: { idAttempt: '10' }, body: { idOpsi: '5' } }
      const res = mockRes()
      const fakeData = { id: 1, id_attempt: 10, id_opsi: 5, skor: 1 }
      
      JwbPG.createJwbPG.mockResolvedValue(fakeData)
      Attempt.recalculateScore.mockResolvedValue({})

      await create(req, res)

      expect(JwbPG.createJwbPG).toHaveBeenCalledWith('10', '5')
      expect(Attempt.recalculateScore).toHaveBeenCalledWith('10')
      expect(response).toHaveBeenCalledWith(200, fakeData, `jawabanPG created successfully`, res)
    })

    test('error server saat membuat jawaban (500)', async () => {
      const req = { params: { idAttempt: '10' }, body: { idOpsi: '5' } }
      const res = mockRes()
      
      JwbPG.createJwbPG.mockRejectedValue(new Error('DB Error'))

      await create(req, res)

      expect(response).toHaveBeenCalledWith(500, null, `failed to : DB Error`, res)
    })
  })

  describe('getAll()', () => {
    test('berhasil mengembalikan semua data', async () => {
      const fakeData = [{ id: 1 }]
      JwbPG.getAllJwbPGs.mockResolvedValue(fakeData)
      const res = mockRes()

      await getAll({}, res)

      expect(response).toHaveBeenCalledWith(200, fakeData, `successfully`, res)
    })

    test('data tidak ditemukan (404)', async () => {
      JwbPG.getAllJwbPGs.mockResolvedValue(null)
      const res = mockRes()

      await getAll({}, res)

      expect(response).toHaveBeenCalledWith(404, null, `data not found`, res)
    })

    test('error server (500)', async () => {
      JwbPG.getAllJwbPGs.mockRejectedValue(new Error('Query failed'))
      const res = mockRes()

      await getAll({}, res)

      expect(response).toHaveBeenCalledWith(500, null, `failed to : Query failed`, res)
    })
  })

  describe('getById()', () => {
    test('berhasil mengembalikan data berdasarkan id', async () => {
      const fakeData = { id: 1 }
      JwbPG.getJwbPGById.mockResolvedValue(fakeData)
      const req = { params: { id: '1' } }
      const res = mockRes()

      await getById(req, res)

      expect(JwbPG.getJwbPGById).toHaveBeenCalledWith('1')
      expect(response).toHaveBeenCalledWith(200, fakeData, `get level by id: 1`, res)
    })

    test('data tidak ditemukan (404)', async () => {
      JwbPG.getJwbPGById.mockResolvedValue(null)
      const req = { params: { id: '99' } }
      const res = mockRes()

      await getById(req, res)

      expect(response).toHaveBeenCalledWith(404, null, `data not found`, res)
    })

    test('error server (500)', async () => {
      JwbPG.getJwbPGById.mockRejectedValue(new Error('Query failed'))
      const req = { params: { id: '1' } }
      const res = mockRes()

      await getById(req, res)

      expect(response).toHaveBeenCalledWith(500, null, `failed to get level by id: Query failed`, res)
    })
  })
})
