const log = require('./log')
const client = require('./github')

async function paginate (installation, options, callback) {
  // prep github client
  const github = await client.installation(installation)

  const results = []

  try {
    for await (const { data: { items } } of github.paginate.iterator(options)) {
      Array.prototype.push.apply(results, items)
    }
  } catch (err) {
    // was this request throttled?
    if (err.status === 403 && err.headers['retry-after']) {
      const retry = parseInt(err.headers['retry-after'])

      log.info('abuse block, retrying after %s:magenta seconds', retry)

      setTimeout(() => {
        log.info('retrying request %s:yellow', err.request.url)
        paginate(installation, err.request.url, callback)
      }, retry * 1000)
    } else {
      log.error('something went wrong: %s', err.message)
    }
  }

  callback(installation, results)
}

module.exports = paginate
