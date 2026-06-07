const mockGenerateContent = jest.fn()
const mockGoogleGenAIMock = jest.fn(() => ({
  models: {
    generateContent: mockGenerateContent
  }
}))

jest.mock('../../src/helpers/env', () => ({
  getRequiredEnv: jest.fn()
}))

jest.mock('@google/genai', () => ({
  GoogleGenAI: mockGoogleGenAIMock
}))

const { getRequiredEnv } = require('../../src/helpers/env')
const { GoogleGenAI } = require('@google/genai')
const { nilaiEsai } = require('../../src/services/aiGrading')

describe('nilaiEsai', () => {
  const validResponse = {
    text: JSON.stringify({ score: '80', feedback: 'Bagus' })
  }

  beforeEach(() => {
    getRequiredEnv.mockReturnValue('dummy-key')
    mockGoogleGenAIMock.mockClear()
    mockGenerateContent.mockClear()
  })

  test('returns normalized score and feedback when AI response is valid', async () => {
    mockGenerateContent.mockResolvedValue(validResponse)

    const result = await nilaiEsai('soal', 'jawaban', 'kata_kunci')

    expect(result.score).toBe(0.8)
    expect(result.feedback).toBe('Bagus')
    expect(getRequiredEnv).toHaveBeenCalledWith('GEMINI_API_KEY')
    expect(mockGoogleGenAIMock).toHaveBeenCalledTimes(1)
  })

  test('normalizes a 100 score to 1.0 when model returns percentage-like score', async () => {
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify({ score: '100', feedback: 'Excellent' }) })

    const result = await nilaiEsai('soal', 'jawaban', 'kata_kunci')

    expect(result.score).toBe(1.0)
    expect(result.feedback).toBe('Excellent')
  })

  test('returns 0.5 for non-numeric score and valid feedback', async () => {
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify({ score: 'foo', feedback: 'Tidak valid' }) })

    const result = await nilaiEsai('soal', 'jawaban', 'kata_kunci')

    expect(result.score).toBe(0.5)
    expect(result.feedback).toBe('Tidak valid')
  })

  test('throws descriptive error when AI response is invalid JSON', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'not json' })

    await expect(nilaiEsai('soal', 'jawaban', 'kata_kunci')).rejects.toThrow(
      'Gagal melakukan penilaian otomatis'
    )
  })
})
