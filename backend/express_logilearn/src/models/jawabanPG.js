const prisma = require('./prisma')

async function getAllJwbPGs() {
    return prisma.jawabanPGs.findMany({
        include: {
            opsis: true
        }
    })
}

async function getJwbPGById(id) {
    return prisma.jawabanPGs.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            opsis: true
        }
    })
}

async function createJwbPG(idAttempt, idOpsi) {
    const opsi = await prisma.opsis.findUnique({
        where: {
            id: Number(idOpsi)
        }
    })
    const skor = opsi.is_correct ? 1 : 0
    return prisma.jawabanPGs.upsert({
        where: {
            id_attempt_id_opsi: {
                id_attempt: Number(idAttempt),
                id_opsi: Number(idOpsi)
            }
        },
        update: { skor },
        create: {
            id_attempt: Number(idAttempt),
            id_opsi: Number(idOpsi),
            skor: skor
        }
    })
}

module.exports = {
    getAllJwbPGs,
    getJwbPGById,
    createJwbPG
}