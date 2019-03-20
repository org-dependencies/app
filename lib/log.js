const logger = require('oh-my-log')

const options = {
  prefix: '%__name:blue  %__date:gray ›'
}

module.exports = function (name) {
  const info = logger(`[${name}]`, options)
  const error = logger(`[${name}]`, Object.assign(options, { func: console.error }))

  return { info, error }
}
