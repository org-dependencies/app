const App = require('@octokit/app')
const throttling = require('@octokit/plugin-throttling')
const retry = require('@octokit/plugin-retry')
const Octokit = require('@octokit/rest').plugin([throttling, retry])

const log = require('./log')

// TODO GH Enterprise: https://github.com/octokit/app.js#using-with-github-enterprise
// TODO Cache installation tokens outside of lru-cache https://github.com/octokit/app.js#caching-installation-tokens

// generate app identity jwt
const app = new App({ id: process.env.GITHUB_APP_ID, privateKey: process.env.GITHUB_PRIVATE_KEY })
const jwt = app.getSignedJsonWebToken()

const throttle = {
  onRateLimit: (retryAfter, options) => {
    if (options.request.retryCount === 0) { // only retries once
      log.error('request quota exhausted for request %s %s retry after %s', options.method, options.url, retryAfter)
      return true
    }

    log.error('request quota exhausted for request %s %s no-retry', options.method, options.url)
  },

  onAbuseLimit: (retryAfter, options) => {
    // does not retry, only logs a warning
    log.error(`Abuse detected for request ${options.method} ${options.url}`)
  }
}

// github client for app
exports.app = function () {
  return new Octokit({ auth: `Bearer ${jwt}`, throttle })
}

// github client for installation
exports.installation = async function (installationId) {
  const token = await app.getInstallationAccessToken({ installationId })

  return new Octokit({ auth: `token ${token}`, throttle })
}

// github client for user
exports.user = async function (token) {
  return new Octokit({ auth: `token ${token}`, throttle })
}
