const response = require('../helpers/response');
const Attempt = require('../models/attempt');
const prisma = require('../models/prisma');
const { nilaiEsai } = require('../services/aiGrading');

async function getAllAttempts(req, res) {
  try {
    const data = await Attempt.getAllAttempts();

    // Stats Calculations
    const totalAttempts = data ? data.length : 0;
    const averageScore = totalAttempts > 0
      ? data.reduce((acc, curr) => acc + Number(curr.skor || 0), 0) / totalAttempts
      : 0;

    // Calculate Level with lowest average score
    const levelScores = {};
    if (data) {
      data.forEach(a => {
        if (a.levels && a.levels.nama) {
          if (!levelScores[a.levels.nama]) {
            levelScores[a.levels.nama] = { total: 0, count: 0 };
          }
          levelScores[a.levels.nama].total += Number(a.skor || 0);
          levelScores[a.levels.nama].count += 1;
        }
      });
    }

    let lowestAvgLevel = '-';
    let lowestAvgScore = Infinity;
    for (const [levelName, levelData] of Object.entries(levelScores)) {
      const avg = levelData.total / levelData.count;
      if (avg < lowestAvgScore) {
        lowestAvgScore = avg;
        lowestAvgLevel = levelName;
      }
    }
    if (lowestAvgScore === Infinity) lowestAvgScore = 0;

    const responsePayload = {
      attempts: data || [],
      stats: {
        totalAttempts,
        averageScore,
        lowestAvgLevel,
        lowestAvgScore
      }
    };

    response(200, responsePayload, 'Berhasil mendapatkan semua attempt', res);
  } catch (error) {
    console.log(error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

async function getAttemptById(req, res) {
  try {
    const { id } = req.params;
    const data = await Attempt.getAttemptById(id);
    if (!data) {
      return response(404, null, 'Attempt tidak ditemukan', res);
    }
    response(200, data, `Berhasil mendapatkan attempt dengan id: ${id}`, res);
  } catch (error) {
    console.log(error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

async function getAttemptsByLevel(req, res) {
  try {
    const { levelId } = req.params;
    const data = await Attempt.getAttemptsByLevel(levelId);
    response(200, data || [], `Berhasil mendapatkan attempt untuk level: ${levelId}`, res);
  } catch (error) {
    console.log(error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

async function getAttemptsByPelajar(req, res) {
  try {
    const { pelajarId } = req.params;
    const data = await Attempt.getAttemptsByPelajar(pelajarId);
    response(200, data || [], `Berhasil mendapatkan attempt untuk pelajar: ${pelajarId}`, res);
  } catch (error) {
    console.log(error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

async function create(req, res) {
  try {
    let { id_level, id_pelajar, skor } = req.body;

    if (req.auth && req.auth.type === 'PELAJAR') {
      id_pelajar = req.auth.id;
      if (skor === undefined) skor = 0;
    }

    if (!id_level || !id_pelajar || skor === undefined) {
      return response(400, null, 'id_level, id_pelajar, dan skor harus diisi', res);
    }

    const data = await Attempt.createAttempt(id_level, id_pelajar, skor);
    response(200, data, 'Attempt berhasil dibuat', res);
  } catch (error) {
    console.log(error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

async function submitAttempt(req, res) {
  try {
    let { id_attempt } = req.body;
    
    if (!id_attempt) {
       return response(400, null, 'id_attempt harus diisi', res);
    }

    const result = await Attempt.recalculateScoreWithGamification(id_attempt);

    if (!result) {
      return response(404, null, 'Attempt tidak ditemukan', res);
    }

    const { attempt, gamification } = result;
    const responsePayload = {
      ...attempt,
      xp_gained: gamification.xp_gained,
      total_xp: gamification.total_xp,
      level_rank_up: gamification.level_rank_up,
      new_level_rank: gamification.new_level_rank,
      new_badges: gamification.new_badges
    };

    response(200, responsePayload, 'Attempt submitted (score recalculated) successfully', res);

  } catch (error) {
    if (error.status === 422) {
      return response(422, null, error.message, res);
    }
    console.log(error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

async function submitBatch(req, res) {
  try {
    const { idAttempt } = req.params;
    const { answers } = req.body;

    if (!idAttempt) {
      return response(400, null, 'idAttempt wajib diisi', res);
    }
    if (!answers || !Array.isArray(answers)) {
      return response(400, null, 'answers harus berupa array', res);
    }

    const pgAnswers = answers.filter(a => a.tipe === 'pg');
    const esaiAnswers = answers.filter(a => a.tipe === 'esai');

    // 1. Process PG Answers
    if (pgAnswers.length > 0) {
      const pgOpsiIds = pgAnswers.map(a => Number(a.idOpsi)).filter(Boolean);
      const opsis = await prisma.opsis.findMany({
        where: { id: { in: pgOpsiIds } }
      });

      await Promise.all(pgAnswers.map(async (ans) => {
        const opsi = opsis.find(o => o.id === Number(ans.idOpsi));
        if (opsi) {
          const skor = opsi.is_correct ? 1 : 0;
          await prisma.jawabanPGs.upsert({
            where: {
              id_attempt_id_opsi: {
                id_attempt: Number(idAttempt),
                id_opsi: Number(ans.idOpsi)
              }
            },
            update: { skor },
            create: {
              id_attempt: Number(idAttempt),
              id_opsi: Number(ans.idOpsi),
              skor: skor
            }
          });
        }
      }));
    }

    // 2. Process Esai Answers
    if (esaiAnswers.length > 0) {
      const esaiSoalIds = esaiAnswers.map(a => Number(a.idSoal)).filter(Boolean);
      const soals = await prisma.soals.findMany({
        where: { id: { in: esaiSoalIds } }
      });

      await Promise.all(esaiAnswers.map(async (ans) => {
        const soalData = soals.find(s => s.id === Number(ans.idSoal));
        if (soalData) {
          const soalText = soalData.text_soal;
          let result;
          
          try {
            result = await nilaiEsai(soalText, ans.jawaban, soalData.kata_kunci);
          } catch (aiErr) {
            console.error("AI Grading failed in batch, using fallback:", aiErr.message);
            let score = 0.5;
            let feedback = "Jawaban Anda telah direkam. Penilaian otomatis tertunda karena kendala koneksi AI.";

            if (soalData.kata_kunci) {
              const keywords = soalData.kata_kunci.toLowerCase().split(',').map(k => k.trim()).filter(Boolean);
              const lowercaseJawaban = String(ans.jawaban || "").toLowerCase();
              let matches = 0;
              keywords.forEach(k => {
                if (lowercaseJawaban.includes(k)) {
                  matches++;
                }
              });

              if (matches === keywords.length) {
                score = 1.0;
                feedback = "Jawaban Anda benar dan memenuhi semua kata kunci utama.";
              } else if (matches > 0) {
                score = Number((matches / keywords.length).toFixed(2));
                feedback = `Jawaban Anda sebagian benar (cocok ${matches} dari ${keywords.length} kata kunci utama).`;
              } else {
                score = 0.0;
                feedback = "Jawaban kurang tepat karena tidak mengandung kata kunci utama yang diharapkan.";
              }
            }

            result = { score, feedback: feedback + " (Penilaian otomatis cadangan)" };
          }

          await prisma.jawabanEsais.upsert({
            where: {
              id_attempt_id_soal: {
                id_attempt: Number(idAttempt),
                id_soal: Number(ans.idSoal)
              }
            },
            update: {
              text_jawaban_esai: sanitizeString(ans.jawaban),
              skor: result.score,
              feedback: sanitizeString(result.feedback)
            },
            create: {
              id_attempt: Number(idAttempt),
              id_soal: Number(ans.idSoal),
              text_jawaban_esai: sanitizeString(ans.jawaban),
              skor: result.score,
              feedback: sanitizeString(result.feedback)
            }
          });
        }
      }));
    }

    const finalizeResult = await Attempt.recalculateScoreWithGamification(idAttempt);

    if (!finalizeResult) {
      return response(404, null, 'Attempt tidak ditemukan', res);
    }

    const { attempt, gamification } = finalizeResult;
    const responsePayload = {
      ...attempt,
      xp_gained: gamification.xp_gained,
      total_xp: gamification.total_xp,
      level_rank_up: gamification.level_rank_up,
      new_level_rank: gamification.new_level_rank,
      new_badges: gamification.new_badges
    };

    response(200, responsePayload, 'Batch attempt submitted successfully', res);
  } catch (error) {
    console.error("Batch submit failed:", error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  const nullChar = String.fromCodePoint(0);
  return str.replace(new RegExp(nullChar, 'g'), '');
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { skor } = req.body;

    if (skor === undefined) {
      return response(400, null, 'skor harus diisi', res);
    }

    const attempt = await Attempt.getAttemptById(id);
    if (!attempt) {
      return response(404, null, 'Attempt tidak ditemukan', res);
    }

    const data = await Attempt.updateAttempt(id, skor);
    response(200, data, 'Attempt berhasil diupdate', res);
  } catch (error) {
    console.log(error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    const attempt = await Attempt.getAttemptById(id);
    if (!attempt) {
      return response(404, null, 'Attempt tidak ditemukan', res);
    }

    const data = await Attempt.deleteAttempt(id);
    response(200, data, 'Attempt berhasil dihapus', res);
  } catch (error) {
    console.log(error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

async function getLeaderboard(req, res) {
  try {
    const { levelId } = req.params;
    const data = await Attempt.getLeaderboard(levelId);
    response(200, data || [], 'Berhasil mendapatkan leaderboard', res);
  } catch (error) {
    console.log(error.message);
    response(500, null, `Terjadi kesalahan server: ${error.message}`, res);
  }
}

module.exports = {
  getAllAttempts,
  getAttemptById,
  getAttemptsByLevel,
  getAttemptsByPelajar,
  create,
  submitAttempt,
  submitBatch,
  update,
  remove,
  getLeaderboard
};
