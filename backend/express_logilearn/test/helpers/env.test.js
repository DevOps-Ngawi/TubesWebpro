const { getRequiredEnv } = require('../../src/helpers/env')

describe('getRequiredEnv', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  test('returns value when the environment variable exists and is not empty', () => {
    process.env.TEST_REQUIRED = 'valid-value'
    expect(getRequiredEnv('TEST_REQUIRED')).toBe('valid-value')
  })

  test('throws when the environment variable is missing', () => {
    delete process.env.TEST_REQUIRED
    expect(() => getRequiredEnv('TEST_REQUIRED')).toThrow(
      'Environment variable TEST_REQUIRED is required'
    )
  })

  test('throws when the environment variable is blank or whitespace', () => {
    process.env.TEST_REQUIRED = '   '
    expect(() => getRequiredEnv('TEST_REQUIRED')).toThrow(
      'Environment variable TEST_REQUIRED is required'
    )
  })
})
