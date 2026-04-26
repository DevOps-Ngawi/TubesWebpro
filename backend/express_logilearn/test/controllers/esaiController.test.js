jest.mock('../../src/models/soalesai');
jest.mock('../../src/helpers/response');
jest.mock('axios');

const esaiModel = require('../../src/models/soalesai');
const response = require('../../src/helpers/response');
const axios = require('axios');
const {
    getAllEsai, getEsaiById, getEsaiByLevel, createEsai, updateEsai, deleteEsai, fetchEsai
} = require('../../src/controllers/esaiController');

const mockRes = () => ({ status: jest.fn(), json: jest.fn() });

beforeEach(() => {
    jest.clearAllMocks();
    response.mockImplementation(() => {});
});

describe('getAllEsai()', () => {
    test('Berhasil mengambil semua soal esai', async () => {
        const fakeData = [{ id: 1, text_soal: 'Soal 1' }];
        esaiModel.getAllSoalEsai.mockResolvedValue(fakeData);
        const res = mockRes();
        await getAllEsai({}, res);
        expect(response).toHaveBeenCalledWith(200, fakeData, 'Berhasil mengambil semua soal esai', res);
    });

    test('Data tidak ditemukan (null)', async () => {
        esaiModel.getAllSoalEsai.mockResolvedValue(null);
        const res = mockRes();
        await getAllEsai({}, res);
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res);
    });

    test('Error database', async () => {
        esaiModel.getAllSoalEsai.mockRejectedValue(new Error('DB error'));
        const res = mockRes();
        await getAllEsai({}, res);
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res);
    });
});

describe('fetchEsai()', () => {
    test('Berhasil fetch dari PHP API', async () => {
        const soalData = [{ id: 1, text_soal: 'Soal API' }];
        const fakeResp = { data: { status: true, data: soalData } };
        axios.get.mockResolvedValue(fakeResp);
        const res = mockRes();
        await fetchEsai({}, res);
        expect(axios.get).toHaveBeenCalledWith('http://localhost:8000/getEsai.php');
        expect(response).toHaveBeenCalledWith(200, soalData, 'Berhasil mengambil semua soal esai', res);
    });

    test('Status false dari PHP API', async () => {
        const fakeResp = { data: { status: false } };
        axios.get.mockResolvedValue(fakeResp);
        const res = mockRes();
        await fetchEsai({}, res);
        expect(response).toHaveBeenCalledWith(404, null, 'data soal esai tidak ditemukan', res);
    });

    test('Response data dari PHP API bernilai null', async () => {
        const fakeResp = { data: null };
        axios.get.mockResolvedValue(fakeResp);
        const res = mockRes();
        await fetchEsai({}, res);
        expect(response).toHaveBeenCalledWith(404, null, 'data soal esai tidak ditemukan', res);
    });

    test('Error saat fetch (network error)', async () => {
        axios.get.mockRejectedValue(new Error('Network error'));
        const res = mockRes();
        await fetchEsai({}, res);
        expect(response).toHaveBeenCalledWith(500, null, 'Gagal mengambil data: Network error', res);
    });
});

describe('getEsaiById()', () => {
    test('Berhasil mengambil soal esai by ID', async () => {
        const fakeData = { id: 1, text_soal: 'Soal 1' };
        esaiModel.getSoalEsaiById.mockResolvedValue(fakeData);
        const req = { params: { id: '1' } };
        const res = mockRes();
        await getEsaiById(req, res);
        expect(response).toHaveBeenCalledWith(200, fakeData, 'Berhasil mengambil detail soal esai', res);
    });

    test('Soal tidak ditemukan', async () => {
        esaiModel.getSoalEsaiById.mockResolvedValue(null);
        const req = { params: { id: '99' } };
        const res = mockRes();
        await getEsaiById(req, res);
        expect(response).toHaveBeenCalledWith(404, null, 'Soal esai tidak ditemukan', res);
    });

    test('Error database', async () => {
        esaiModel.getSoalEsaiById.mockRejectedValue(new Error('DB error'));
        const req = { params: { id: '1' } };
        const res = mockRes();
        await getEsaiById(req, res);
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res);
    });
});

describe('getEsaiByLevel()', () => {
    test('Berhasil mengambil soal esai by level', async () => {
        const fakeData = [{ id: 1, id_level: 3 }];
        esaiModel.getSoalEsaiByLevel.mockResolvedValue(fakeData);
        const req = { params: { id_level: '3' } };
        const res = mockRes();
        await getEsaiByLevel(req, res);
        expect(response).toHaveBeenCalledWith(200, fakeData, 'Berhasil mengambil soal esai level 3', res);
    });

    test('Data tidak ditemukan', async () => {
        esaiModel.getSoalEsaiByLevel.mockResolvedValue(null);
        const req = { params: { id_level: '99' } };
        const res = mockRes();
        await getEsaiByLevel(req, res);
        expect(response).toHaveBeenCalledWith(404, null, 'data not found', res);
    });

    test('Error database', async () => {
        esaiModel.getSoalEsaiByLevel.mockRejectedValue(new Error('DB error'));
        const req = { params: { id_level: '3' } };
        const res = mockRes();
        await getEsaiByLevel(req, res);
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res);
    });
});

describe('createEsai()', () => {
    test('Berhasil membuat soal esai baru', async () => {
        const fakeData = { id: 1, id_level: 2, text_soal: 'Soal baru', kata_kunci: 'kunci' };
        esaiModel.createSoalEsai.mockResolvedValue(fakeData);
        const req = { body: { id_level: 2, text_soal: 'Soal baru', kata_kunci: 'kunci' } };
        const res = mockRes();
        await createEsai(req, res);
        expect(esaiModel.createSoalEsai).toHaveBeenCalledWith(2, 'Soal baru', 'kunci');
        expect(response).toHaveBeenCalledWith(201, fakeData, 'Soal esai berhasil dibuat', res);
    });

    test('id_level atau text_soal kosong', async () => {
        const req = { body: { text_soal: 'Soal tanpa level' } };
        const res = mockRes();
        await createEsai(req, res);
        expect(esaiModel.createSoalEsai).not.toHaveBeenCalled();
        expect(response).toHaveBeenCalledWith(400, null, 'id_level dan text_soal wajib diisi', res);
    });

    test('Error database', async () => {
        esaiModel.createSoalEsai.mockRejectedValue(new Error('DB error'));
        const req = { body: { id_level: 2, text_soal: 'Soal baru', kata_kunci: 'kunci' } };
        const res = mockRes();
        await createEsai(req, res);
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res);
    });
});

describe('updateEsai()', () => {
    test('Berhasil update soal esai', async () => {
        const fakeData = { id: 1 };
        const updatedData = { id: 1, id_level: 2, text_soal: 'Soal diperbarui', kata_kunci: 'kunci' };
        esaiModel.getSoalEsaiById.mockResolvedValue(fakeData);
        esaiModel.updateSoalEsai.mockResolvedValue(updatedData);
        const req = { params: { id: '1' }, body: { id_level: 2, text_soal: 'Soal diperbarui', kata_kunci: 'kunci' } };
        const res = mockRes();
        await updateEsai(req, res);
        expect(esaiModel.updateSoalEsai).toHaveBeenCalledWith('1', 2, 'Soal diperbarui', 'kunci');
        expect(response).toHaveBeenCalledWith(200, updatedData, 'Soal esai berhasil diperbarui', res);
    });

    test('Soal tidak ditemukan', async () => {
        esaiModel.getSoalEsaiById.mockResolvedValue(null);
        const req = { params: { id: '99' }, body: { text_soal: 'Update' } };
        const res = mockRes();
        await updateEsai(req, res);
        expect(esaiModel.updateSoalEsai).not.toHaveBeenCalled();
        expect(response).toHaveBeenCalledWith(404, null, 'Soal esai tidak ditemukan', res);
    });

    test('Error database', async () => {
        esaiModel.getSoalEsaiById.mockResolvedValue({ id: 1 });
        esaiModel.updateSoalEsai.mockRejectedValue(new Error('DB error'));
        const req = { params: { id: '1' }, body: { text_soal: 'Update' } };
        const res = mockRes();
        await updateEsai(req, res);
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res);
    });
});

describe('deleteEsai()', () => {
    test('Berhasil menghapus soal esai', async () => {
        esaiModel.getSoalEsaiById.mockResolvedValue({ id: 1 });
        esaiModel.deleteSoalEsai.mockResolvedValue({});
        const req = { params: { id: '1' } };
        const res = mockRes();
        await deleteEsai(req, res);
        expect(esaiModel.deleteSoalEsai).toHaveBeenCalledWith('1');
        expect(response).toHaveBeenCalledWith(200, null, 'Soal esai berhasil dihapus', res);
    });

    test('Soal tidak ditemukan', async () => {
        esaiModel.getSoalEsaiById.mockResolvedValue(null);
        const req = { params: { id: '99' } };
        const res = mockRes();
        await deleteEsai(req, res);
        expect(esaiModel.deleteSoalEsai).not.toHaveBeenCalled();
        expect(response).toHaveBeenCalledWith(404, null, 'Soal esai tidak ditemukan', res);
    });

    test('Error database', async () => {
        esaiModel.getSoalEsaiById.mockResolvedValue({ id: 1 });
        esaiModel.deleteSoalEsai.mockRejectedValue(new Error('DB error'));
        const req = { params: { id: '1' } };
        const res = mockRes();
        await deleteEsai(req, res);
        expect(response).toHaveBeenCalledWith(500, null, 'DB error', res);
    });
});
