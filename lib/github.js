const App = require('@octokit/app')
const Octokit = require('@octokit/rest')
const db = require('./db/installation')

// TODO GH Enterprise: https://github.com/octokit/app.js#using-with-github-enterprise

const getToken = async (id) => {
  const installation = await db.get(id)

  const token = installation.token && installation.token.value ? installation.token.value : false

  return token
}

const cache = {
  get: (id) => {
    const token = getToken(id)

    console.log(id, token)

    return token
  },

  async set (id, token, expiry) {
    await db.set(id, { token: { token, expiry } })
  }
}

console.log(cache.get('foo'))
const id = process.env.GITHUB_APP_ID
const privateKey = process.env.GITHUB_PRIVATE_KEY

// generate app identity jwt
const app = new App({ id, privateKey, cache })
const jwt = app.getSignedJsonWebToken()

// github client for app
exports.app = function () {
  return new Octokit({ auth: `Bearer ${jwt}` })
}

// github client for installation
exports.installation = async function (installationId) {
  const token = await app.getInstallationAccessToken({ installationId })

  console.log(token)

  return new Octokit({ auth: `token ${token}` })
}

// github client for user
exports.user = async function (token) {
  return new Octokit({ auth: `token ${token}` })
}
