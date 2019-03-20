const db = require('../../lib/db/')
const client = require('../../lib/github')
const log = require('../lib/log')
const filter = require('../lib/filter-repo')
const search = require('../lib/search')

module.exports = async function (req, res) {
  // prep github client
  let github
  let options

  // minor difference in user vs. org
  if (req.user.accessToken) {
    github = await client.user(req.user.accessToken)
    options = github.apps.listInstallationReposForAuthenticatedUser.endpoint.merge({ installation_id: installation, per_page: 100 })
  } else {
    github = await client.installation(req.installation.id)
    options = github.repos.listForOrg.endpoint.merge({ org: req.installation.name, per_page: 100 })
  }

  log.info('%s:blue scanning repositories in %s:magenta', req.installation.id, req.installation.name)

  let repos = []

  // paginate through results
  for await (const { data } of github.paginate.iterator(options)) {
    Array.prototype.push.apply(repos, data.repositories || data)
  }

  log.info('%s:blue found %d:cyan repositories in %s:magenta', req.installation.id, repos.length, req.installation.name)

  // update repositories table
  for (const repository of repos) {
    // filter to only desired properties
    const meta = filter(repository)

    // TODO multi insert
    await db.repository.add(req.installation.id, [repository.id, repository.owner.login, repository.name, meta])
  }

  // search for dependencies
  await search(req.installation.id, github, req.user.accessToken ? 'user' : 'org', req.installation.name)

  res.send(201)
}
