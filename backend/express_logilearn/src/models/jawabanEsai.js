const prisma = require('./prisma')

function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\u0000/g, '');
}

async function getAllJwbEsais() {
    return prisma.jawabanEsais.findMany()
}

async function getJwbEsaiById(id) {
    return prisma.jawabanEsais.findUnique({
        where: {
            id: Number(id)
        }
    })
}

async function createJwbEsai(idAttempt, idSoal, jawabanEsai, skor, feedback) {
    return prisma.jawabanEsais.create({
        data: {
            id_attempt: Number(idAttempt),
            id_soal: Number(idSoal),
            text_jawaban_esai: sanitizeString(jawabanEsai),
            skor: skor,
            feedback: sanitizeString(feedback)
        }
    })
}

async function updateJwbEsai(id, idAdmin, skor, feedback) {
    return prisma.jawabanEsais.update({
        where: {
            id: Number(id)
        },
        data: {
            id_admin: idAdmin,
            skor: skor,
            feedback: sanitizeString(feedback)
        }
    })
}

module.exports = {
    getAllJwbEsais,
    getJwbEsaiById,
    createJwbEsai,
    updateJwbEsai
}