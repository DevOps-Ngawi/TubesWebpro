const prisma = require('./prisma');

async function getAllSoalEsai() {
    return prisma.soals.findMany({
        where: { tipe: 'esai' },
        include: { levels: true }
    });
}

async function getSoalEsaiById(id) {
    return prisma.soals.findUnique({
        where: { id: Number(id) }
    });
}

async function getSoalEsaiByLevel(idLevel) {
    return prisma.soals.findMany({
        where: {
            id_level: Number(idLevel),
            tipe: 'esai'
        }
    });
}

async function createSoalEsai(idLevel, textSoal, kataKunci) {
    return prisma.soals.create({
        data: {
            id_level: Number(idLevel),
            tipe: 'esai',
            text_soal: textSoal,
            kata_kunci: kataKunci || null
        }
    });
}

async function updateSoalEsai(id, idLevel, textSoal, kataKunci) {
    return prisma.soals.update({
        where: { id: Number(id) },
        data: {
            id_level: idLevel ? Number(idLevel) : undefined,
            text_soal: textSoal !== undefined ? textSoal : undefined,
            kata_kunci: kataKunci !== undefined ? kataKunci : undefined
        }
    });
}

async function deleteSoalEsai(id) {
    return prisma.soals.delete({
        where: { id: Number(id) }
    });
}

module.exports = {
    getAllSoalEsai,
    getSoalEsaiById,
    getSoalEsaiByLevel,
    createSoalEsai,
    updateSoalEsai,
    deleteSoalEsai
};