const App = require('@octokit/app')
const Octokit = require('@octokit/rest')

// TODO GH Enterprise: https://github.com/octokit/app.js#using-with-github-enterprise
// TODO Cache installation tokens outside of lru-cache https://github.com/octokit/app.js#caching-installation-tokens

// generate app identity jwt
const app = new App({ id: process.env.GITHUB_APP_ID, privateKey: process.env.GITHUB_PRIVATE_KEY })
const jwt = app.getSignedJsonWebToken()

// github client for app
exports.app = function () {
  return new Octokit({ auth: `Bearer ${jwt}` })
}

// github client for installation
exports.installation = async function (installationId) {
  const token = await app.getInstallationAccessToken({ installationId })

  return new Octokit({ auth: `token ${token}` })
}

// github client for user
exports.user = async function (token) {
  return new Octokit({ auth: `token ${token}` })
}
