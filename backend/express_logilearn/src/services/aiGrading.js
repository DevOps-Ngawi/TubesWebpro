const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

async function nilaiEsai(soal, jawaban) {
  const prompt = `
  Kamu adalah asisten penilai soal esai.

  Soal:
  ${soal}

  Jawaban pelajar:
  ${jawaban}

  Aturan penilaian:
  - Skor antara 0.0 sampai 1.0
  - 0.0 = salah total
  - 1.0 = benar dan lengkap
  - Jawaban sebagian benar diberi skor proporsional
  - Gunakan Bahasa Indonesia formal

  TUGAS:
  1. Tentukan skor
  2. Berikan feedback singkat (1-3 kalimat)

  FORMAT OUTPUT (WAJIB JSON VALID):
  {
    "score": number,
    "feedback": string
  }

  JANGAN menambahkan teks di luar JSON.
  `

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.01
    })
  })

  const data = await response.json()

  if (data.error) {
    console.error("GROQ ERROR:", data.error)
    throw new Error(data.error.message)
  }

  if (!data.choices || !data.choices.length) {
    console.error("GROQ RESPONSE:", data)
    throw new Error("AI response invalid")
  }

  const raw = data.choices[0].message.content.trim()

  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    console.error("RAW AI OUTPUT:", raw)
    throw new Error("AI output not JSON")
  }

  const parsed = JSON.parse(raw.substring(start, end + 1))

  return {
    score: Math.max(0, Math.min(parsed.score, 1)),
    feedback: parsed.feedback || ""
  }
}

module.exports = { nilaiEsai }
