const JwbPG = require('../models/jawabanPG')
const Attempt = require('../models/attempt')
const response = require('../helpers/response')

async function create(req, res) {
    try {
        const {idAttempt} = req.params
        const {idOpsi} = req.body

        if (!idOpsi) {
            return response(400, null, `idOpsi wajib diisi`, res)
        }

        const data = await JwbPG.createJwbPG(idAttempt, idOpsi)
        
        await Attempt.recalculateScore(idAttempt)

        response(200, data, `jawabanPG created successfully`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to : ${err.message}`, res)
    }
}

async function getAll(req, res) {
    try {
        const data = await JwbPG.getAllJwbPGs()
        if(!data){
            return response(404, null, `data not found`, res)
        }
        response(200, data, `successfully`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to : ${err.message}`, res)
    } 
}

async function getById(req, res) {
    try {
        const {id} = req.params
        const data = await JwbPG.getJwbPGById(id)
        if(!data){
            return response(404, null, `data not found`, res)
        }
        response(200, data, `get level by id: ${id}`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to get level by id: ${err.message}`, res)
    }
}

module.exports = {
    getAll,
    getById,
    create
}