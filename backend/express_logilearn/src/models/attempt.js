const prisma = require('./prisma');
const gamificationService = require('../services/gamificationService');

const ATTEMPT_INCLUDE = {
  levels: {
    include: {
      sections: true,
      soals: true
    }
  },
  pelajars: true,
  jawaban_pgs: {
    include: {
      opsis: {
        include: {
          soals: true
        }
      }
    }
  },
  jawaban_esais: {
    include: {
      soals: true,
      admins: true
    }
  }
};

const ATTEMPT_SUMMARY_INCLUDE = {
  levels: {
    include: {
      sections: true
    }
  },
  pelajars: true
};

function parseIntegerOrNull(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseFloatOrNull(value) {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeScore(value) {
  const parsed = parseFloatOrNull(value);
  return parsed === null ? 0 : parsed;
}

function computeFinalPercentage(attempt) {
  if (!attempt || !attempt.levels || !attempt.levels.soals) {
    return 0;
  }

  let totalScore = 0;
  if (Array.isArray(attempt.jawaban_pgs)) {
    attempt.jawaban_pgs.forEach((j) => {
      totalScore += normalizeScore(j.skor);
    });
  }

  if (Array.isArray(attempt.jawaban_esais)) {
    attempt.jawaban_esais.forEach((j) => {
      totalScore += normalizeScore(j.skor);
    });
  }

  const maxScore = attempt.levels.soals.length;
  return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
}

class Attempt {
  static async getAllAttempts() {
    return prisma.attempts.findMany({
      include: ATTEMPT_INCLUDE,
      orderBy: { id: 'desc' }
    });
  }

  static async getAttemptById(id) {
    const attemptId = parseIntegerOrNull(id);
    if (attemptId === null) {
      throw new Error('Invalid attempt id');
    }

    return prisma.attempts.findUnique({
      where: { id: attemptId },
      include: ATTEMPT_INCLUDE
    });
  }

  static async getAttemptsByLevel(levelId) {
    const parsedLevelId = parseIntegerOrNull(levelId);
    if (parsedLevelId === null) {
      throw new Error('Invalid level id');
    }

    return prisma.attempts.findMany({
      where: { id_level: parsedLevelId },
      include: ATTEMPT_SUMMARY_INCLUDE,
      orderBy: { id: 'desc' }
    });
  }

  static async getAttemptsByPelajar(pelajarId) {
    const parsedPelajarId = parseIntegerOrNull(pelajarId);
    if (parsedPelajarId === null) {
      throw new Error('Invalid pelajar id');
    }

    return prisma.attempts.findMany({
      where: { id_pelajar: parsedPelajarId },
      include: ATTEMPT_SUMMARY_INCLUDE,
      orderBy: { id: 'desc' }
    });
  }

  static async createAttempt(id_level, id_pelajar, skor) {
    const levelId = parseIntegerOrNull(id_level);
    const pelajarId = parseIntegerOrNull(id_pelajar);
    if (levelId === null || pelajarId === null) {
      throw new Error('Invalid level or pelajar ID');
    }

    return prisma.attempts.create({
      data: {
        id_level: levelId,
        id_pelajar: pelajarId,
        skor: normalizeScore(skor)
      },
      include: ATTEMPT_SUMMARY_INCLUDE
    });
  }

  static async updateAttempt(id, skor) {
    const attemptId = parseIntegerOrNull(id);
    if (attemptId === null) {
      throw new Error('Invalid attempt id');
    }

    return prisma.attempts.update({
      where: { id: attemptId },
      data: { skor: normalizeScore(skor) },
      include: ATTEMPT_SUMMARY_INCLUDE
    });
  }

  static async deleteAttempt(id) {
    const attemptId = parseIntegerOrNull(id);
    if (attemptId === null) {
      throw new Error('Invalid attempt id');
    }

    return prisma.attempts.delete({ where: { id: attemptId } });
  }

  static async createAttemptWithAnswers(id_level, id_pelajar, skor, jawaban_pgs, jawaban_esais) {
    const levelId = parseIntegerOrNull(id_level);
    const pelajarId = parseIntegerOrNull(id_pelajar);
    if (levelId === null || pelajarId === null) {
      throw new Error('Invalid level or pelajar ID');
    }

    return prisma.$transaction(async (tx) => {
      const attempt = await tx.attempts.create({
        data: {
          id_level: levelId,
          id_pelajar: pelajarId,
          skor: normalizeScore(skor)
        }
      });

      if (Array.isArray(jawaban_pgs) && jawaban_pgs.length > 0) {
        await tx.jawabanPGs.createMany({
          data: jawaban_pgs.map((j) => ({
            id_attempt: attempt.id,
            id_opsi: parseIntegerOrNull(j.id_opsi),
            skor: normalizeScore(j.skor)
          }))
        });
      }

      if (Array.isArray(jawaban_esais) && jawaban_esais.length > 0) {
        await tx.jawabanEsais.createMany({
          data: jawaban_esais.map((j) => ({
            id_attempt: attempt.id,
            id_soal: parseIntegerOrNull(j.id_soal),
            text_jawaban_esai: j.text_jawaban_esai,
            skor: normalizeScore(j.skor)
          }))
        });
      }

      return attempt;
    });
  }

  static async recalculateScoreWithGamification(id) {
    const attemptId = parseIntegerOrNull(id);
    if (attemptId === null) {
      throw new Error('Invalid attempt id');
    }

    return prisma.$transaction(async (tx) => {
      const attempt = await tx.attempts.findUnique({
        where: { id: attemptId },
        include: {
          levels: {
            include: { soals: true }
          },
          jawaban_pgs: true,
          jawaban_esais: true
        }
      });

      if (!attempt) return null;

      const finalPercentage = computeFinalPercentage(attempt);

      const updatedAttempt = await tx.attempts.update({
        where: { id: attemptId },
        data: { skor: finalPercentage }
      });

      const gamificationResult = await gamificationService.process(
        tx,
        attempt.id_pelajar,
        finalPercentage,
        attempt.id_level,
        attempt.id
      );

      return {
        attempt: updatedAttempt,
        gamification: gamificationResult
      };
    });
  }

  static async recalculateScore(id) {
    const attemptId = parseIntegerOrNull(id);
    if (attemptId === null) {
      throw new Error('Invalid attempt id');
    }

    const attempt = await prisma.attempts.findUnique({
      where: { id: attemptId },
      include: {
        levels: {
          include: { soals: true }
        },
        jawaban_pgs: true,
        jawaban_esais: true
      }
    });

    if (!attempt) return null;

    const finalPercentage = computeFinalPercentage(attempt);
    return prisma.attempts.update({
      where: { id: attemptId },
      data: { skor: finalPercentage }
    });
  }

  static async getLeaderboard(levelId = null) {
    const where = levelId ? { id_level: parseIntegerOrNull(levelId) } : {};
    if (levelId !== null && where.id_level === null) {
      throw new Error('Invalid level id');
    }

    const leaderboard = await prisma.attempts.groupBy({
      by: ['id_pelajar'],
      where,
      _avg: { skor: true },
      _count: { id: true },
      orderBy: { _avg: { skor: 'desc' } },
      take: 10
    });

    const studentIds = leaderboard.map((l) => l.id_pelajar);
    const students = await prisma.pelajars.findMany({
      where: { id: { in: studentIds } }
    });

    return leaderboard
      .map((l) => {
        const student = students.find((s) => s.id === l.id_pelajar);
        return {
          id: l.id_pelajar,
          nama: student ? student.nama : 'Unknown',
          username: student ? student.username : 'Unknown',
          averageScore: l._avg.skor || 0,
          totalAttempts: l._count.id
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);
  }
}

module.exports = Attempt;
