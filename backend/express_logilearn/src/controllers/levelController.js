const Level = require('../models/level')
const response = require('../helpers/response')
const axios = require('axios')

async function create(req, res) {
    try {
        // Ambil field baru: deskripsi dan urutan
        const {nama, idSection, deskripsi, urutan} = req.body

        // Validasi server-side
        if (!nama || nama.trim() === '') {
            return response(400, null, `nama level wajib diisi`, res)
        }
        if (nama.trim().length < 3) {
            return response(400, null, `nama level minimal 3 karakter`, res)
        }
        if (!idSection) {
            return response(400, null, `section wajib dipilih`, res)
        }
        if (urutan !== undefined && urutan !== null && urutan !== '' && (isNaN(urutan) || Number(urutan) < 1)) {
            return response(400, null, `urutan level harus berupa angka positif`, res)
        }

        const data = await Level.createLevel(idSection, nama.trim(), deskripsi, urutan)
        response(200, data, `level created successfully`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to : ${err.message}`, res)
    }
}

async function fetchLevels(req, res) {
    try {
        const {slugSection} = req.params
        const resp = await axios.get(`http://localhost:8000/getLevel.php?slug=${slugSection}`)
        if(!resp){
            return response(404, null, `data not found`, res)
        }
        response(200, resp.data.data, `get all levels`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to : ${err.message}`, res)
    }
}

async function getAll(req, res) {
    try {
        const data = await Level.getAllLevels()
        if(!data){
            return response(404, null, `data not found`, res)
        }
        response(200, data, `get all levels`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to : ${err.message}`, res)
    }
}

async function getAllBySection(req, res) {
    try {
        const {slugSection} = req.params
        const data = await Level.getLevelsBySection(slugSection)
        if(!data){
            return response(404, null, `data not found`, res)
        }
        response(200, data, `get all levels by section: ${slugSection}`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to : ${err.message}`, res)
    }
}

async function getBySectionId(req, res) {
    try {
        const {slugSection, id} = req.params
        const data = await Level.getLevelsBySectionId(slugSection, id)
        if(!data){
            return response(404, null, `data not found`, res)
        }
        response(200, data, `get level by section: ${slugSection}`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to get level by section: ${err.message}`, res)
    }
}

async function getById(req, res) {
    try {
        const {id} = req.params
        const data = await Level.getLevelById(id)
        if(!data){
            return response(404, null, `data not found`, res)
        }
        response(200, data, `get level by id: ${id}`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to get level by id: ${err.message}`, res)
    }
}

async function update(req, res) {
    try {
        const {id} = req.params
        const {nama, idSection, deskripsi, urutan} = req.body

        // Validasi server-side
        if (!nama || nama.trim() === '') {
            return response(400, null, `nama level wajib diisi`, res)
        }
        if (nama.trim().length < 3) {
            return response(400, null, `nama level minimal 3 karakter`, res)
        }
        if (!idSection) {
            return response(400, null, `section wajib dipilih`, res)
        }

        const data = await Level.getLevelById(id)
        if(!data){
            return response(404, null, `data not found`, res)
        }
        const updated = await Level.updateLevel(id, idSection, nama.trim(), deskripsi, urutan)
        response(200, updated, `level updated successfully`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to update level: ${err.message}`, res)
    }
}

async function remove(req, res) {
    try {
        const {id} = req.params
        const data = await Level.getLevelById(id)
        if(!data){
            return response(404, null, `data not found`, res)
        }
        await Level.deleteLevel(id)
        response(200, null, `level deleted successfully`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to delete level: ${err.message}`, res)
    }
}

async function getSoalsByLevel(req, res) {
    try {
        const {slugSection, id} = req.params
        console.log(`getSoalsByLevel called: slugSection=${slugSection}, levelId=${id}`)
        const data = await Level.getSoalsByLevelId(slugSection, id)
        console.log(`getSoalsByLevel result: found ${data ? data.length : 0} soals`)
        if(!data || data.length === 0){
            return response(200, [], `no soals found for level: ${id} in section: ${slugSection}`, res)
        }
        response(200, data, `get soals by level: ${id}`, res)
    } catch(err) {
        console.log(`getSoalsByLevel error: ${err.message}`)
        response(500, null, `failed to get soals by level: ${err.message}`, res)
    }
}

async function getSoalByLevelAndId(req, res) {
    try {
        const {slugSection, id, idSoal} = req.params
        const levelId = Number(id)
        const soalId = Number(idSoal)
        
        const levelInSection = await Level.getLevelsBySectionId(slugSection, levelId)
        if (!levelInSection) {
            const levelAnywhere = await Level.getLevelById(levelId)
            if (levelAnywhere) {
                return response(404, null, `level ${levelId} not found in section ${slugSection}`, res)
            } else {
                return response(404, null, `level ${levelId} not found`, res)
            }
        }
        
        const data = await Level.getSoalByLevelIdAndSoalId(slugSection, levelId, soalId)
        if(!data){
            const prisma = require('../config/prisma')
            const soalExists = await prisma.soals.findUnique({
                where: { id: soalId }
            })
            if (soalExists) {
                return response(404, null, `soal with id ${soalId} not found in level ${levelId}`, res)
            } else {
                return response(404, null, `soal with id ${soalId} not found`, res)
            }
        }
        response(200, data, `get soal by level: ${levelId} and soal id: ${soalId}`, res)
    } catch(err) {
        console.log(`getSoalByLevelAndId error: ${err.message}`)
        response(500, null, `failed to get soal: ${err.message}`, res)
    }
}

module.exports = {
    fetchLevels,
    getAll,
    getAllBySection,
    getBySectionId,
    getById,
    create,
    update,
    remove,
    getSoalsByLevel,
    getSoalByLevelAndId
}