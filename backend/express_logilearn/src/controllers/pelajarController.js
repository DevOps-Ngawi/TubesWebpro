const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const response = require('../helpers/response');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
  try {
    const pelajarId = req.auth.id;

    const pelajar = await prisma.pelajars.findUnique({
      where: { id: pelajarId },
      select: { nama: true, username: true }
    });

    if (!pelajar) {
      return response(404, null, "Pelajar tidak ditemukan", res);
    }

    const lulusAttempts = await prisma.attempts.groupBy({
      by: ['id_level'],
      where: {
        id_pelajar: pelajarId,
        skor: { gte: 75 }
      }
    });
    const levelSelesaiCount = lulusAttempts.length;

    const allSections = await prisma.sections.findMany({
      include: { 
        levels: { select: { id: true } } 
      }
    });

    let sectionSelesaiCount = 0;
    const lulusLevelIds = lulusAttempts.map(attempt => attempt.id_level);

    allSections.forEach(section => {
      if (section.levels.length > 0) {
        const isAllLevelPassed = section.levels.every(lvl => lulusLevelIds.includes(lvl.id));
        if (isAllLevelPassed) {
          sectionSelesaiCount++;
        }
      }
    });

    const dataProfile = {
      id: pelajarId,
      nama: pelajar.nama,
      username: pelajar.username,
      statistik: {
        section_selesai: sectionSelesaiCount,
        level_selesai: levelSelesaiCount
      }
    };

    return response(200, dataProfile, "Data profil berhasil dimuat", res);
  } catch (error) {
    return response(500, null, `Terjadi kesalahan: ${error.message}`, res);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const pelajarId = req.auth.id;

    const pelajar = await prisma.pelajars.findUnique({
      where: { id: pelajarId }
    });

    const isMatch = await bcrypt.compare(oldPassword, pelajar.password);
    if (!isMatch) {
      return response(401, null, "Kata sandi saat ini salah", res);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.pelajars.update({
      where: { id: pelajarId },
      data: { password: hashedPassword }
    });

    return response(200, null, "Kata sandi berhasil diganti", res);
  } catch (error) {
    return response(500, null, error.message, res);
  }
};

const getStats = async (req, res) => {
  try {
    const pelajarId = Number.parseInt(req.params.id);
    if (Number.isNaN(pelajarId)) {
      return response(400, null, "ID pelajar tidak valid", res);
    }

    const pelajar = await prisma.pelajars.findUnique({
      where: { id: pelajarId }
    });

    if (!pelajar) {
      return response(404, null, "Pelajar tidak ditemukan", res);
    }

    const total_badges = await prisma.pelajar_badges.count({
      where: { id_pelajar: pelajarId }
    });

    const countHigherXp = await prisma.pelajars.count({
      where: {
        xp: { gt: pelajar.xp }
      }
    });

    const global_rank = countHigherXp + 1;

    const dataStats = {
      id: pelajar.id,
      nama: pelajar.nama,
      total_xp: pelajar.xp,
      level_rank: pelajar.level_rank,
      total_badges,
      global_rank
    };

    return response(200, dataStats, "Statistik pelajar berhasil dimuat", res);
  } catch (error) {
    return response(500, null, `Terjadi kesalahan: ${error.message}`, res);
  }
};

const getBadges = async (req, res) => {
  try {
    const pelajarId = Number.parseInt(req.params.id);
    if (Number.isNaN(pelajarId)) {
      return response(400, null, "ID pelajar tidak valid", res);
    }

    const pelajar = await prisma.pelajars.findUnique({
      where: { id: pelajarId }
    });

    if (!pelajar) {
      return response(404, null, "Pelajar tidak ditemukan", res);
    }

    const pelajarBadges = await prisma.pelajar_badges.findMany({
      where: { id_pelajar: pelajarId },
      include: { badges: true }
    });

    const dataBadges = pelajarBadges.map(pb => ({
      badge_name: pb.badges.name,
      badge_description: pb.badges.description,
      obtained_at: pb.obtained_at
    }));

    return response(200, dataBadges, "Badge pelajar berhasil dimuat", res);
  } catch (error) {
    return response(500, null, `Terjadi kesalahan: ${error.message}`, res);
  }
};

module.exports = { 
  getProfile, 
  changePassword,
  getStats,
  getBadges
};