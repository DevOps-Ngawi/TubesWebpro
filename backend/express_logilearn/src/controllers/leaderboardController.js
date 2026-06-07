const prisma = require('../models/prisma');
const response = require('../helpers/response');
const { parsePage, parseLimit, parseIntegerOrNull } = require('../helpers/numbers');

async function getGlobalLeaderboard(req, res) {
  try {
    const page = parsePage(req.query.page, 1);
    const limit = parseLimit(req.query.limit, 10, 50);

    const skip = (page - 1) * limit;

    const totalPelajars = await prisma.pelajars.count();
    const pelajars = await prisma.pelajars.findMany({
      orderBy: { xp: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        nama: true,
        xp: true,
        level_rank: true
      }
    });

    const datas = pelajars.map((p, index) => ({
      rank: skip + index + 1,
      id: p.id,
      nama: p.nama,
      total_xp: p.xp,
      level_rank: p.level_rank
    }));

    const hasNext = skip + limit < totalPelajars;
    const hasPrev = page > 1;

    const pagination = {
      prev: hasPrev ? `/api/leaderboard?page=${page - 1}&limit=${limit}` : "",
      next: hasNext ? `/api/leaderboard?page=${page + 1}&limit=${limit}` : "",
      max: Math.ceil(totalPelajars / limit).toString()
    };

    response(200, datas, 'Leaderboard berhasil dimuat', res, pagination);
  } catch (error) {
    console.log(error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

async function getLevelLeaderboard(req, res) {
  try {
    const levelId = parseIntegerOrNull(req.query.level_id);
    if (levelId === null) {
      return response(400, null, 'level_id harus diisi dan berupa angka positif', res);
    }

    // Check if level exists
    const level = await prisma.levels.findUnique({
      where: { id: levelId }
    });
    if (!level) {
      return response(404, null, 'Level tidak ditemukan', res);
    }

    // Group attempts by pelajar
    const leaderboard = await prisma.attempts.groupBy({
      by: ['id_pelajar'],
      where: { id_level: levelId },
      _avg: {
        skor: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _avg: {
          skor: 'desc'
        }
      },
      take: 10
    });

    const pelajarIds = leaderboard.map(l => l.id_pelajar);
    const pelajars = await prisma.pelajars.findMany({
      where: {
        id: { in: pelajarIds }
      }
    });

    const datas = leaderboard.map((l, index) => {
      const student = pelajars.find(s => s.id === l.id_pelajar);
      return {
        rank: index + 1,
        id: l.id_pelajar,
        nama: student ? student.nama : 'Unknown',
        average_score: l._avg.skor || 0,
        total_attempts: l._count.id
      };
    });

    response(200, datas, 'Leaderboard level berhasil dimuat', res);
  } catch (error) {
    console.log(error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

module.exports = {
  getGlobalLeaderboard,
  getLevelLeaderboard
};
