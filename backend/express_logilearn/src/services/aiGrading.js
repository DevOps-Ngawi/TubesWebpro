const axios = require("axios");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function nilaiEsai(question, studentAnswer, keywords) {
  const systemPrompt = `Anda adalah guru yang menilai jawaban esai siswa dengan cara yang SUPPORTIF dan MENDORONG semangat belajar.
Berikan penilaian dalam format JSON dengan dua field:
- "score": nilai desimal antara 0.0 sampai 1.0
- "feedback": umpan balik maksimal 1-2 kalimat pendek, jelas, dan positif dalam bahasa Indonesia

PANDUAN PEMBERIAN SKOR:
- Fokus pada ESENSI dan KONSEP UTAMA jawaban, bukan pada kesempurnaan redaksi atau detail kecil.
- Jika jawaban siswa sudah menyebutkan inti yang BENAR, berikan skor 1.0 meskipun ada perbedaan kecil dalam penulisan.
- Skor 1.0: Konsep utama benar. Jawaban menunjukkan pemahaman yang jelas.
- Skor 0.7–0.9: Benar sebagian besar, ada sedikit bagian yang kurang tepat secara konsep.
- Skor 0.4–0.6: Jawaban ada relevansinya tapi pemahaman masih kurang.
- Skor 0.0–0.3: Jawaban salah atau tidak relevan sama sekali.

PENTING: Jangan kurangi skor hanya karena perbedaan ejaan kecil, informasi tambahan yang tidak diminta, atau cara penulisan yang berbeda.
Hanya kembalikan JSON valid, tanpa teks tambahan.`;

  const userPrompt = `Soal:
${question}

${keywords ? `Kata Kunci Utama (gunakan sebagai panduan, bukan persyaratan mutlak):\n${keywords}\n` : ""}Jawaban Siswa:
${studentAnswer}

Nilai berdasarkan ketepatan KONSEP UTAMA. Jika inti jawaban sudah benar, berikan skor 1.0.`;


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
        temperature: 0.1 // Konsisten dan langsung ke inti jawaban
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 4000 // Batasi waktu tunggu API Groq maksimal 4 detik agar tidak hang
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

    // Bulatkan ke 1.0 jika skor hampir sempurna (>= 0.85)
    // Ini mencegah pengurangan skor tidak adil untuk jawaban yang jelas benar
    if (score >= 0.85) {
      score = 1.0;
    }


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

