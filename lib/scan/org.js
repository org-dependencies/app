const db = require('../db/')
const client = require('../github/graphql')
const graph = require('../graph')
const log = require('../log')
const dependency = require('./dependency')

module.exports = async function scan (installationID, name, type) {
  // installation auth
  const graphql = await client.installation(installationID)

  // minor difference in user vs. org
  const query = type === 'User' ? graph.repositories.user : graph.repositories.org

  // gimme the edges!
  const variables = { login: name, endCursor: null }
  const repositories = []

  log.info('%s:blue scanning repositories in %s:magenta', installationID, name)

  // paginate through results
  for await (const response of client.iterator(graphql, query, variables)) {
    Array.prototype.push.apply(repositories, response.source.repositories.edges)
  }

  log.info('%s:blue found %d:cyan repositories in %s:magenta', installationID, repositories.length, name)

  // clean github data & process packages
  repositories.forEach(({ node }) => {
    // skip if no package.json found
    if (node.package === null || node.package.content === null) return

    db.repository.add(installationID, node)

    // scan for dependencies
    dependency(installationID, node)
  })
}
