function parseIntegerOrNull(value) {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function parseFloatOrNull(value) {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

function parsePage(value, fallback = 1) {
  const parsed = parseIntegerOrNull(value)
  return parsed === null || parsed < 1 ? fallback : parsed
}

function parseLimit(value, fallback = 10, max = 50) {
  const parsed = parseIntegerOrNull(value)
  if (parsed === null || parsed < 1) return fallback
  return Math.min(parsed, max)
}

module.exports = {
  parseIntegerOrNull,
  parseFloatOrNull,
  parsePage,
  parseLimit
}
