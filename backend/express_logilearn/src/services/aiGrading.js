const { GoogleGenAI } = require("@google/genai");

const { getRequiredEnv } = require('../helpers/env');

let aiInstance;
function getAi() {
  if (!aiInstance) {
    const apiKey = getRequiredEnv('GEMINI_API_KEY');
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

async function nilaiEsai(question, studentAnswer, keywords) {
  const prompt = `
Anda adalah dosen logika yang bertugas menilai jawaban esai mahasiswa.

Soal:
${question}

${keywords ? `Kata Kunci Utama yang harus ada/sesuai:\n${keywords}\n` : ''}
Jawaban Mahasiswa:
${studentAnswer}

Berikan penilaian berdasarkan ketepatan konsep dan kecocokan dengan kata kunci utama (jika ada).
Skor harus berupa nilai desimal antara 0.0 (sangat salah) sampai 1.0 (sangat benar/sempurna).
Berikan juga umpan balik (feedback) singkat dalam bahasa Indonesia yang konstruktif dan menjelaskan alasan pemberian skor tersebut.
`;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: {
              type: "number",
              description: "Skor desimal antara 0.0 (salah semua) dan 1.0 (benar sempurna)"
            },
            feedback: {
              type: "string",
              description: "Umpan balik singkat, jelas, dan konstruktif dalam bahasa Indonesia"
            }
          },
          required: ["score", "feedback"]
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    
    // Pastikan score valid dan antara 0 dan 1
    let score = parseFloat(data.score);
    if (isNaN(score)) {
      score = 0.5;
    } else if (score > 1.0) {
      // Jika model memberikan skor 0-100, bagi dengan 100
      score = score / 100.0;
    }
    // Batasi score dalam range 0.0 sampai 1.0
    score = Math.max(0.0, Math.min(1.0, score));

    return {
      score: score,
      feedback: data.feedback || "Penilaian berhasil dilakukan."
    };
  } catch (err) {
    console.error("Failed to parse Gemini response or generate content:", err);
    throw new Error("Gagal melakukan penilaian otomatis: " + err.message);
  }
}

module.exports = {
  nilaiEsai,
  gradeEssay: nilaiEsai
};
