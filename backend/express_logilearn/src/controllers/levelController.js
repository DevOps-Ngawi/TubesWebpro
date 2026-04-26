const Level = require('../models/level')
const response = require('../helpers/response')
const axios = require('axios')

function validateLevelInput(nama, idSection, urutan) {
    if (!nama || nama.trim() === '') return 'nama level wajib diisi'
    if (nama.trim().length < 3) return 'nama level minimal 3 karakter'
    if (!idSection) return 'section wajib dipilih'
    if (urutan !== undefined && urutan !== null && urutan !== '') {
        if (Number.isNaN(urutan) || Number(urutan) < 1) return 'urutan level harus berupa angka positif'
    }
    return null
}

async function findLevelOrFail(id, res) {
    const data = await Level.getLevelById(id)
    if (!data) { response(404, null, 'data not found', res); return null }
    return data
}

function handleError(err, context, res) {
    console.log(`[${context}] error: ${err.message}`)
    response(500, null, `failed to ${context}: ${err.message}`, res)
}


async function create(req, res) {
    try {
        const { nama, idSection, deskripsi, urutan } = req.body
        const err = validateLevelInput(nama, idSection, urutan)
        if (err) return response(400, null, err, res)
        const data = await Level.createLevel(idSection, nama.trim(), deskripsi || null, urutan || null)
        response(200, data, 'level created successfully', res)
    } catch (err) { handleError(err, 'create level', res) }
}

async function fetchLevels(req, res) {
    try {
        const { slugSection } = req.params
        const resp = await axios.get(`http://localhost:8000/getLevel.php?slug=${slugSection}`)
        if (!resp || !resp.data) return response(404, null, 'data not found', res)
        response(200, resp.data.data, 'get all levels', res)
    } catch (err) { handleError(err, 'fetch levels', res) }
}

async function getAll(req, res) {
    try {
        const data = await Level.getAllLevels()
        if (!data) return response(404, null, 'data not found', res)
        response(200, data, 'get all levels', res)
    } catch (err) { handleError(err, 'get all levels', res) }
}

async function getAllBySection(req, res) {
    try {
        const { slugSection } = req.params
        const data = await Level.getLevelsBySection(slugSection)
        if (!data) return response(404, null, 'data not found', res)
        response(200, data, `get all levels by section: ${slugSection}`, res)
    } catch (err) { handleError(err, 'get levels by section', res) }
}

async function getBySectionId(req, res) {
    try {
        const { slugSection, id } = req.params
        const data = await Level.getLevelsBySectionId(slugSection, id)
        if (!data) return response(404, null, 'data not found', res)
        response(200, data, `get level by section: ${slugSection}`, res)
    } catch (err) { handleError(err, 'get level by section id', res) }
}

async function getById(req, res) {
    try {
        const { id } = req.params
        const data = await Level.getLevelById(id)
        if (!data) return response(404, null, 'data not found', res)
        response(200, data, `get level by id: ${id}`, res)
    } catch (err) { handleError(err, 'get level by id', res) }
}

async function update(req, res) {
    try {
        const { id } = req.params
        const { nama, idSection, deskripsi, urutan } = req.body
        const err = validateLevelInput(nama, idSection, urutan)
        if (err) return response(400, null, err, res)
        const existing = await findLevelOrFail(id, res)
        if (!existing) return
        const updated = await Level.updateLevel(id, idSection, nama.trim(), deskripsi || null, urutan || null)
        response(200, updated, 'level updated successfully', res)
    } catch (err) { handleError(err, 'update level', res) }
}

async function remove(req, res) {
    try {
        const { id } = req.params
        const existing = await findLevelOrFail(id, res)
        if (!existing) return
        await Level.deleteLevel(id)
        response(200, null, 'level deleted successfully', res)
    } catch (err) { handleError(err, 'delete level', res) }
}

async function getSoalsByLevel(req, res) {
    try {
        const { slugSection, id } = req.params
        const data = await Level.getSoalsByLevelId(slugSection, id)
        if (!data || data.length === 0) {
            return response(200, [], `no soals found for level: ${id} in section: ${slugSection}`, res)
        }
        response(200, data, `get soals by level: ${id}`, res)
    } catch (err) { handleError(err, 'get soals by level', res) }
}

async function getSoalByLevelAndId(req, res) {
    try {
        const { slugSection, id, idSoal } = req.params
        const levelId = Number(id)
        const soalId = Number(idSoal)
        const levelInSection = await Level.getLevelsBySectionId(slugSection, levelId)
        if (!levelInSection) {
            const levelAnywhere = await Level.getLevelById(levelId)
            const msg = levelAnywhere
                ? `level ${levelId} not found in section ${slugSection}`
                : `level ${levelId} not found`
            return response(404, null, msg, res)
        }
        const data = await Level.getSoalByLevelIdAndSoalId(slugSection, levelId, soalId)
        if (!data) return response(404, null, `soal with id ${soalId} not found in level ${levelId}`, res)
        response(200, data, `get soal by level: ${levelId} and soal id: ${soalId}`, res)
    } catch (err) { handleError(err, 'get soal by level and id', res) }
}

module.exports = {
    fetchLevels, getAll, getAllBySection, getBySectionId,
    getById, create, update, remove, getSoalsByLevel, getSoalByLevelAndId,
    validateLevelInput, findLevelOrFail,
}