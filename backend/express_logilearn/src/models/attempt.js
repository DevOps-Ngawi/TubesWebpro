const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Attempt {
  static async getAllAttempts() {
    try {
      const attempts = await prisma.attempts.findMany({
        include: {
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
        },
        orderBy: {
          id: 'desc'
        }
      });
      return attempts;
    } catch (error) {
      throw error;
    }
  }

  static async getAttemptById(id) {
    try {
      const attempt = await prisma.attempts.findUnique({
        where: { id: parseInt(id) },
        include: {
          levels: {
            include: {
              sections: true
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
        }
      });
      return attempt;
    } catch (error) {
      throw error;
    }
  }

  static async getAttemptsByLevel(levelId) {
    try {
      const attempts = await prisma.attempts.findMany({
        where: { id_level: parseInt(levelId) },
        include: {
          levels: {
            include: {
              sections: true
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
        },
        orderBy: {
          id: 'desc'
        }
      });
      return attempts;
    } catch (error) {
      throw error;
    }
  }

  static async getAttemptsByPelajar(pelajarId) {
    try {
      const attempts = await prisma.attempts.findMany({
        where: { id_pelajar: parseInt(pelajarId) },
        include: {
          levels: {
            include: {
              sections: true
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
        },
        orderBy: {
          id: 'desc'
        }
      });
      return attempts;
    } catch (error) {
      throw error;
    }
  }

  static async createAttempt(id_level, id_pelajar, skor) {
    try {
      const attempt = await prisma.attempts.create({
        data: {
          id_level: parseInt(id_level),
          id_pelajar: parseInt(id_pelajar),
          skor: parseFloat(skor)
        },
        include: {
          levels: {
            include: {
              sections: true
            }
          },
          pelajars: true
        }
      });
      return attempt;
    } catch (error) {
      throw error;
    }
  }

  static async updateAttempt(id, skor) {
    try {
      const attempt = await prisma.attempts.update({
        where: { id: parseInt(id) },
        data: {
          skor: parseFloat(skor)
        },
        include: {
          levels: {
            include: {
              sections: true
            }
          },
          pelajars: true
        }
      });
      return attempt;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAttempt(id) {
    try {
      const attempt = await prisma.attempts.delete({
        where: { id: parseInt(id) }
      });
      return attempt;
    } catch (error) {
      throw error;
    }
  }

  static async createAttemptWithAnswers(id_level, id_pelajar, skor, jawaban_pgs, jawaban_esais) {
    try {
      return await prisma.$transaction(async (tx) => {
        const attempt = await tx.attempts.create({
          data: {
            id_level: parseInt(id_level),
            id_pelajar: parseInt(id_pelajar),
            skor: parseFloat(skor)
          }
        });

        if (jawaban_pgs && jawaban_pgs.length > 0) {
          await tx.jawabanPGs.createMany({
            data: jawaban_pgs.map(j => ({
              id_attempt: attempt.id,
              id_opsi: parseInt(j.id_opsi),
              skor: parseFloat(j.skor)
            }))
          });
        }

        if (jawaban_esais && jawaban_esais.length > 0) {
          await tx.jawabanEsais.createMany({
            data: jawaban_esais.map(j => ({
              id_attempt: attempt.id,
              id_soal: parseInt(j.id_soal),
              text_jawaban_esai: j.text_jawaban_esai,
              skor: parseFloat(j.skor)
            }))
          });
        }

        return attempt;
      });
    } catch (error) {
      throw error;
    }
  }
  static async recalculateScore(id) {
    try {
      const attempt = await prisma.attempts.findUnique({
        where: { id: parseInt(id) },
        include: {
          levels: {
            include: {
              soals: true
            }
          },
          jawaban_pgs: true,
          jawaban_esais: true
        }
      });

      if (!attempt) return null;

      let totalScore = 0;

      if (attempt.jawaban_pgs) {
        attempt.jawaban_pgs.forEach(j => {
          totalScore += parseFloat(j.skor || 0);
        });
      }

      if (attempt.jawaban_esais) {
        attempt.jawaban_esais.forEach(j => {
          totalScore += parseFloat(j.skor || 0);
        });
      }

      const maxScore = attempt.levels && attempt.levels.soals ? attempt.levels.soals.length : 0;
      const finalPercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      return await prisma.attempts.update({
        where: { id: parseInt(id) },
        data: {
          skor: finalPercentage
        }
      });

    } catch (error) {
      throw error;
    }
  }

  static async getLeaderboard(levelId = null) {
    try {
      const where = levelId ? { id_level: parseInt(levelId) } : {};
      
      const leaderboard = await prisma.attempts.groupBy({
        by: ['id_pelajar'],
        where,
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

      const studentIds = leaderboard.map(l => l.id_pelajar);
      const students = await prisma.pelajars.findMany({
        where: {
          id: { in: studentIds }
        }
      });

      return leaderboard.map(l => {
        const student = students.find(s => s.id === l.id_pelajar);
        return {
          id: l.id_pelajar,
          nama: student ? student.nama : 'Unknown',
          username: student ? student.username : 'Unknown',
          averageScore: l._avg.skor || 0,
          totalAttempts: l._count.id
        };
      }).sort((a, b) => b.averageScore - a.averageScore);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Attempt;
