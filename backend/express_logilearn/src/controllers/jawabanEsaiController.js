const { nilaiEsai } = require('../services/aiGrading')
const Soal = require('../models/soalesai')
const JwbEsai = require('../models/jawabanEsai')
const Attempt = require('../models/attempt')
const response = require('../helpers/response')

async function create(req, res) {
  try {
    const { jawaban } = req.body
    const { idSoal, idAttempt } = req.params

    const soalData = await Soal.getSoalEsaiById(idSoal)
    const soal = soalData.text_soal

    let result;
    try {
      result = await nilaiEsai(soal, jawaban, soalData.kata_kunci)
    } catch (aiErr) {
      console.error("AI Grading failed, using fallback:", aiErr.message);
      
      let score = 0.5; // Default neutral fallback score
      let feedback = "Jawaban Anda telah direkam. Penilaian otomatis tertunda karena kendala koneksi AI.";

      if (soalData.kata_kunci) {
        const keywords = soalData.kata_kunci.toLowerCase().split(',').map(k => k.trim());
        const lowercaseJawaban = (jawaban || "").toLowerCase();
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

    const data = await JwbEsai.createJwbEsai(
      idAttempt,
      idSoal,
      jawaban,
      result.score,
      result.feedback
    )

    await Attempt.recalculateScore(idAttempt)

    response(200, data, "successfully", res)
  } catch (err) {
    console.error(err.message)
    response(500, null, `failed to : ${err.message}`, res)
  }
}


async function getAll(req, res) {
    try {
        const data = await JwbEsai.getAllJwbEsais()
        response(200, data, `successfully`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to : ${err.message}`, res)
    } 
}

async function getById(req, res) {
    try {
        const { id } = req.params
        const data = await JwbEsai.getJwbEsaiById(id)
        response(200, data, `successfully`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to : ${err.message}`, res)
    } 
}

async function update(req, res) {
    try {
        const { id } = req.params
        const { skor, feedback, idAdmin } = req.body

        if (!skor) {
            return response(400, null, "Skor is required", res)
        }

        if (!feedback) {
            return response(400, null, "Feedback is required", res)
        }

        if (!idAdmin) {
            return response(400, null, "Id admin is required", res)
        }
        
        if (Number(skor) < 0 || Number(skor) > 1){
            return response(400, null, "Skor is not valid", res)
        }

        const updatedAnswer = await JwbEsai.updateJwbEsai(id, idAdmin, skor, feedback)
        
        if (updatedAnswer && updatedAnswer.id_attempt) {
             await Attempt.recalculateScore(updatedAnswer.id_attempt)
        }

        response(200, updatedAnswer, `successfully`, res)
    } catch(err) {
        console.log(err.message)
        response(500, null, `failed to : ${err.message}`, res)
    } 
}

module.exports = {
    create,
    getAll,
    getById,
    update
}