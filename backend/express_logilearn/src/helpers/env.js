function getRequiredEnv(name) {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Environment variable ${name} is required`)
  }
  return value
}

module.exports = {
  getRequiredEnv
}
