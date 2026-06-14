const axios = require("axios");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

async function nilaiEsai(question, studentAnswer, keywords) {
  const systemPrompt = `Anda adalah dosen logika yang bertugas menilai jawaban esai mahasiswa. 
Berikan penilaian dalam format JSON dengan dua field:
- "score": nilai desimal antara 0.0 (sangat salah) sampai 1.0 (sangat benar/sempurna)
- "feedback": umpan balik singkat, jelas, dan konstruktif dalam bahasa Indonesia

Hanya kembalikan JSON valid, tanpa teks tambahan.`;

  const userPrompt = `Soal:
${question}

${keywords ? `Kata Kunci Utama yang harus ada/sesuai:\n${keywords}\n` : ""}Jawaban Mahasiswa:
${studentAnswer}

Berikan penilaian berdasarkan ketepatan konsep dan kecocokan dengan kata kunci utama (jika ada).`;

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "poolside/laguna-m.1:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0].message.content.trim();
    const data = JSON.parse(content);

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
    console.error("Failed to call OpenRouter or parse response:", err);
    throw new Error("Gagal melakukan penilaian otomatis: " + err.message);
  }
}

module.exports = {
  nilaiEsai,
  gradeEssay: nilaiEsai
};
