const {
  parseIntegerOrNull,
  parseFloatOrNull,
  parsePage,
  parseLimit
} = require('../../src/helpers/numbers')

describe('numbers helper', () => {
  describe('parseIntegerOrNull', () => {
    test('returns integer for valid numeric string', () => {
      expect(parseIntegerOrNull('42')).toBe(42)
    })

    test('returns null for invalid integer input', () => {
      expect(parseIntegerOrNull('abc')).toBeNull()
    })

    test('returns null for empty string', () => {
      expect(parseIntegerOrNull('')).toBeNull()
    })
  })

  describe('parseFloatOrNull', () => {
    test('returns float for valid numeric string', () => {
      expect(parseFloatOrNull('3.14')).toBe(3.14)
    })

    test('returns null for invalid float input', () => {
      expect(parseFloatOrNull('xyz')).toBeNull()
    })
  })

  describe('parsePage', () => {
    test('returns the parsed page number when valid', () => {
      expect(parsePage('5')).toBe(5)
    })

    test('returns fallback for zero or negative values', () => {
      expect(parsePage('0')).toBe(1)
      expect(parsePage('-1')).toBe(1)
    })

    test('returns fallback for invalid input', () => {
      expect(parsePage('invalid')).toBe(1)
    })
  })

  describe('parseLimit', () => {
    test('returns the parsed limit when valid and within max', () => {
      expect(parseLimit('20')).toBe(20)
    })

    test('returns max when parsed value exceeds max', () => {
      expect(parseLimit('100', 10, 50)).toBe(50)
    })

    test('returns fallback for invalid or zero values', () => {
      expect(parseLimit('0', 10, 50)).toBe(10)
      expect(parseLimit('abc', 10, 50)).toBe(10)
    })
  })
})
