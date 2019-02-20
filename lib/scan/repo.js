const db = require('../db/repository')
const client = require('../github/graphql')
const graph = require('../graph')
const log = require('../log')
const dependency = require('./dependency')

module.exports = async function (installationID, owner, name) {
  // installation auth
  const graphql = await client.installation(installationID)

  // gimme content!
  const variables = { owner, name }
  let { repository } = await graphql(graph.repository, variables)

  log.info('%s:blue scanning %s:yellow/%s:yellow', installationID, owner, name)

  db.add(installationID, repository)

  // scan for dependencies
  dependency(installationID, repository)
}
