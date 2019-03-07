const db = require('../db/')
const client = require('../github')
const log = require('../log')
const filter = require('../filter-repo')
const dependency = require('./dependencies')

module.exports = async function scan (installation, name, type) {
  // prep github client
  const github = await client.installation(installation)

  let options = {}

  // minor difference in user vs. org
  if (type.toLowerCase() === 'user') {
    options = github.repos.listForUser.endpoint.merge({ username: name, per_page: 100 })
  } else {
    options = github.repos.listForOrg.endpoint.merge({ org: name, per_page: 100 })
  }

  log.info('%s:blue scanning repositories in %s:magenta', installation, name)

  let repositories = []

  // paginate through results
  for await (const { data } of github.paginate.iterator(options)) {
    Array.prototype.push.apply(repositories, data)
  }

  log.info('%s:blue found %d:cyan repositories in %s:magenta', installation, repositories.length, name)

  // update repositories table
  for (const repository of repositories) {
    // filter to only desired properties
    const meta = filter(repository)

    // TODO multi insert
    db.repository.add(installation, [repository.id, repository.owner.login, repository.name, meta])
  }

  // scan for dependencies
  dependency(installation, type, name)
}
