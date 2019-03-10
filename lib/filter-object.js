module.exports = function (original, keys) {
  const clone = {}

  for (const key of Object.keys(original)) {
    if (keys.includes(key)) {
      clone[key] = original[key]
    }
  }

  return clone
}
