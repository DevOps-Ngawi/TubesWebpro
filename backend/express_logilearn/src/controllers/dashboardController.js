const prisma = require('../models/prisma')
const response = require('../helpers/response')

async function getStats(req, res) {
    try {
        // Count totals
        const [totalSections, totalLevels, totalSoalPG, totalSoalEsai] = await Promise.all([
            prisma.sections.count(),
            prisma.levels.count(),
            prisma.soals.count({ where: { tipe: 'pg' } }),
            prisma.soals.count({ where: { tipe: 'esai' } })
        ])

        // Get sections with their level counts and soal counts
        const sectionsWithCounts = await prisma.sections.findMany({
            include: {
                levels: {
                    include: {
                        soals: true
                    }
                }
            }
        })

        const sectionBreakdown = sectionsWithCounts.map(section => ({
            id: section.id,
            nama: section.nama,
            totalLevels: section.levels.length,
            totalSoal: section.levels.reduce((acc, level) => acc + level.soals.length, 0),
            totalSoalPG: section.levels.reduce((acc, level) => acc + level.soals.filter(s => s.tipe === 'pg').length, 0),
            totalSoalEsai: section.levels.reduce((acc, level) => acc + level.soals.filter(s => s.tipe === 'esai').length, 0),
        }))

        const stats = {
            totals: {
                sections: totalSections,
                levels: totalLevels,
                soalPG: totalSoalPG,
                soalEsai: totalSoalEsai,
                totalSoal: totalSoalPG + totalSoalEsai
            },
            sectionBreakdown
        }

        response(200, stats, 'get dashboard stats', res)
    } catch (err) {
        console.log(err.message)
        response(500, null, `failed to get dashboard stats: ${err.message}`, res)
    }
}

module.exports = {
    getStats
}
