const axios = require("axios");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function nilaiEsai(question, studentAnswer, keywords) {
  const systemPrompt = `Anda adalah dosen logika yang bertugas menilai jawaban esai siswa. 
Berikan penilaian dalam format JSON dengan dua field:
- "score": nilai desimal antara 0.0 (sangat salah) sampai 1.0 (sangat benar/sempurna)
- "feedback": umpan balik maksimal 1-2 kalimat pendek, jelas, dan konstruktif dalam bahasa Indonesia

Hanya kembalikan JSON valid, tanpa teks tambahan.`;

  const userPrompt = `Soal:
${question}

${keywords ? `Kata Kunci Utama yang harus ada/sesuai:\n${keywords}\n` : ""}Jawaban Siswa:
${studentAnswer}

Berikan penilaian berdasarkan ketepatan konsep dan kecocokan dengan kata kunci utama (jika ada).`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 150, // Batasi token keluaran agar sangat cepat
        temperature: 0.2 // Konsisten dan langsung ke inti jawaban
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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
    console.error("Failed to call Groq or parse response:", err);
    throw new Error("Gagal melakukan penilaian otomatis: " + err.message);
  }
}

module.exports = {
  nilaiEsai,
  gradeEssay: nilaiEsai
};

