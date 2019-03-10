const db = require('../db/')
const client = require('../github')
const log = require('../log')
const filter = require('../filter-repo')
const dependency = require('./dependencies')

module.exports = async function scan (installation, name, token) {
  // prep github client
  let github
  let options

  // minor difference in user vs. org
  if (token) {
    github = await client.user(token)
    options = github.apps.listInstallationReposForAuthenticatedUser.endpoint.merge({ installation_id: installation, per_page: 100 })
  } else {
    github = await client.installation(installation)
    options = github.repos.listForOrg.endpoint.merge({ org: name, per_page: 100 })
  }

  log.info('%s:blue scanning repositories in %s:magenta', installation, name)

  let repos = []

  // paginate through results
  for await (const { data } of github.paginate.iterator(options)) {
    Array.prototype.push.apply(repos, data.repositories || data)
  }

  log.info('%s:blue found %d:cyan repositories in %s:magenta', installation, repos.length, name)

  // update repositories table
  for (const repository of repos) {
    // filter to only desired properties
    const meta = filter(repository)

    // TODO multi insert
    db.repository.add(installation, [repository.id, repository.owner.login, repository.name, meta])
  }

  // scan for dependencies
  dependency(installation, token ? 'user' : 'org', name)
}
