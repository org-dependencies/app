const App = require('@octokit/app')
const graphql = require('@octokit/graphql')

// TODO GH Enterprise: https://github.com/octokit/app.js#using-with-github-enterprise
// TODO Cache installation tokens outside of lru-cache https://github.com/octokit/app.js#caching-installation-tokens

// generate app identity jwt
const app = new App({ id: process.env.GITHUB_APP_ID, privateKey: process.env.GITHUB_PRIVATE_KEY })
const jwt = app.getSignedJsonWebToken()

// github client for app
exports.app = function () {
  return graphql.defaults({ headers: { authorization: `Bearer ${jwt}` } })
}

// github client for installation
exports.installation = async function (installationId) {
  const token = await app.getInstallationAccessToken({ installationId })

  return graphql.defaults({ headers: { authorization: `token ${token}` } })
}

// github client for user
exports.user = async function (token) {
  return graphql.defaults({ headers: { authorization: `token ${token}` } })
}

exports.iterator = function (client, query, variables) {
  let hasNextPage = true
  // let endCursor = false

  return {
    [Symbol.asyncIterator]: () => ({
      next () {
        if (!hasNextPage) {
          return Promise.resolve({ done: true })
        }

        return client(query, variables).then(response => {
          const { source: { repositories: { pageInfo } } } = response

          hasNextPage = pageInfo.hasNextPage
          variables.endCursor = pageInfo.endCursor

          return { value: response }
        })
      }
    })
  }
}
