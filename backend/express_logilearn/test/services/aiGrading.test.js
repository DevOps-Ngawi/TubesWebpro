const mockAxiosPost = jest.fn()

jest.mock('axios', () => ({
  post: mockAxiosPost
}))

const { nilaiEsai } = require('../../src/services/aiGrading')

describe('nilaiEsai', () => {
  const validResponse = {
    data: {
      choices: [
        {
          message: {
            content: JSON.stringify({ score: '80', feedback: 'Bagus' })
          }
        }
      ]
    }
  }

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = 'dummy-key'
    mockAxiosPost.mockClear()
  })

  test('returns normalized score and feedback when AI response is valid', async () => {
    mockAxiosPost.mockResolvedValue(validResponse)

    const result = await nilaiEsai('soal', 'jawaban', 'kata_kunci')

    expect(result.score).toBe(0.8)
    expect(result.feedback).toBe('Bagus')
    expect(mockAxiosPost).toHaveBeenCalledTimes(1)
  })

  test('normalizes a 100 score to 1.0 when model returns percentage-like score', async () => {
    mockAxiosPost.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({ score: '100', feedback: 'Excellent' })
            }
          }
        ]
      }
    })

    const result = await nilaiEsai('soal', 'jawaban', 'kata_kunci')

    expect(result.score).toBe(1.0)
    expect(result.feedback).toBe('Excellent')
  })

  test('returns 0.5 for non-numeric score and valid feedback', async () => {
    mockAxiosPost.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({ score: 'foo', feedback: 'Tidak valid' })
            }
          }
        ]
      }
    })

    const result = await nilaiEsai('soal', 'jawaban', 'kata_kunci')

    expect(result.score).toBe(0.5)
    expect(result.feedback).toBe('Tidak valid')
  })

  test('throws descriptive error when AI response is invalid JSON', async () => {
    mockAxiosPost.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'not json'
            }
          }
        ]
      }
    })

    await expect(nilaiEsai('soal', 'jawaban', 'kata_kunci')).rejects.toThrow(
      'Gagal melakukan penilaian otomatis'
    )
  })
})
