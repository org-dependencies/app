const client = require('../github')
const db = require('../db/repository')
const dependencies = require('./dependencies')
const filter = require('../filter-repo')
const log = require('../log')

module.exports = async function (installation, name) {
  const { rows: [ repository ] } = await db.get(installation, name)

  // TODO: stop if no record found

  log.info('%s:blue scanning %s:yellow/%s:yellow', installation, repository.owner, repository.repo)

  // prep github client
  const github = await client.installation(installation)

  // fetch repo meta data
  let { data } = await github.repos.get({ owner: repository.owner, repo: repository.repo })

  // TODO: handle 404

  // pick relevant fields
  const meta = filter(data)

  // update repositories table
  db.add(installation, [repository.id, data.owner.login, data.name, meta])

  // scan for dependencies
  dependencies(installation, data.owner.type, data.owner.login, data.name)
}
