const log = require('./log')

async function paginate (github, options, callback) {
  try {
    for await (const result of github.paginate.iterator(options)) {
      callback(result)
    }
  } catch (err) {
    // was this request throttled?
    if (err.status === 403 && err.headers['retry-after']) {
      const retry = parseInt(err.headers['retry-after'])

      log.info('abuse block, retrying after %s:magenta seconds', retry)

      setTimeout(() => {
        log.info('retrying request %s:yellow', err.request.url)

        // continue pagination from last step
        paginate(github, err.request.url, callback)
      }, retry * 1000)
    } else {
      log.error('something went wrong: %s', err.message)
    }
  }
}

module.exports = paginate
