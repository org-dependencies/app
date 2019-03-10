const log = require('./log')

async function request (github, options, callback) {
  let result

  try {
    result = await github.request(options)
  } catch (err) {
    // was this request throttled?
    if (err.status === 403 && err.headers['retry-after']) {
      const retry = parseInt(err.headers['retry-after'])

      log.info('abuse block, retrying after %s:magenta seconds', retry)

      setTimeout(() => {
        log.info('retrying request %s:yellow', err.request.url)

        // retry the last call
        request(github, err.request.url, callback)
      }, retry * 1000)
    } else {
      log.error('something went wrong: %s', err.message)
    }
  }

  if (result) callback(result)
}

module.exports = request
