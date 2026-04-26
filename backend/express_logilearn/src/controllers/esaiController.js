const esaiModel = require('../models/soalesai');
const response = require('../helpers/response');
const axios = require('axios');

const getAllEsai = async (req, res) => {
    try {
        const data = await esaiModel.getAllSoalEsai();
        return response(200, data, "Berhasil mengambil semua soal esai", res);
    } catch (error) {
        return response(500, null, error.message, res);
    }
};

const getEsaiById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await esaiModel.getSoalEsaiById(id);
        
        if (!data) {
            return response(404, null, "Soal esai tidak ditemukan", res);
        }
        
        return response(200, data, "Berhasil mengambil detail soal esai", res);
    } catch (error) {
        return response(500, null, error.message, res);
    }
};

const getEsaiByLevel = async (req, res) => {
    try {
        const { id_level } = req.params;
        const data = await esaiModel.getSoalEsaiByLevel(id_level);
        return response(200, data, `Berhasil mengambil soal esai level ${id_level}`, res);
    } catch (error) {
        return response(500, null, error.message, res);
    }
};

const createEsai = async (req, res) => {
    try {
        const { id_level, text_soal, kata_kunci } = req.body;
        
        if (!id_level || !text_soal) {
            return response(400, null, "id_level dan text_soal wajib diisi", res);
        }

        const data = await esaiModel.createSoalEsai(id_level, text_soal, kata_kunci);
        return response(201, data, "Soal esai berhasil dibuat", res);
    } catch (error) {
        return response(500, null, error.message, res);
    }
};

const updateEsai = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_level, text_soal, kata_kunci } = req.body;

        const cekData = await esaiModel.getSoalEsaiById(id);
        if (!cekData) {
            return response(404, null, "Soal esai tidak ditemukan", res);
        }

        const data = await esaiModel.updateSoalEsai(id, id_level, text_soal, kata_kunci);
        return response(200, data, "Soal esai berhasil diperbarui", res);
    } catch (error) {
        return response(500, null, error.message, res);
    }
};

const deleteEsai = async (req, res) => {
    try {
        const { id } = req.params;
        await esaiModel.deleteSoalEsai(id);
        return response(200, null, "Soal esai berhasil dihapus", res);
    } catch (error) {
        return response(500, null, error.message, res);
    }
};

const fetchEsai = async (req, res) => {
    try {
        const resp = await axios.get('http://localhost:8000/getEsai.php');
        
        if(!resp.data || !resp.data.status){
            return response(404, null, `data soal esai tidak ditemukan`, res);
        }
        
        return response(200, resp.data.data, `Berhasil mengambil semua soal esai`, res);
    } catch(err) {
        console.log(err.message);
        return response(500, null, `Gagal mengambil data: ${err.message}`, res);
    }
};

module.exports = { getAllEsai, getEsaiById, getEsaiByLevel, createEsai, updateEsai, deleteEsai, fetchEsai };