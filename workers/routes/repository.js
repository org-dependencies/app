const client = require('../../lib/github')
const db = require('../../lib/db/repository')
const search = require('../lib/search')
const filter = require('../lib/filter-repo')
const log = require('../lib/log')

module.exports = async function (req, res) {
  const repository = await db.get(req.body.installation, req.body.repository)

  if (!repository) return res.sendStatus(404)

  log.info('%s:blue scanning %s:yellow/%s:yellow', req.body.installation, repository.owner, repository.repo)

  // prep github client
  const github = await client.installation(req.body.installation)

  res.sendStatus(200)

  return

  // fetch repo meta data
  let { data } = await github.repos.get({ owner: repository.owner, repo: repository.repo })

  // TODO: handle 404

  // pick relevant fields
  const meta = filter(data)

  // update repositories table
  await db.add(req.body.installation, [repository.id, data.owner.login, data.name, meta])

  // search for dependencies
  // await search(req.body.installation, github, data.owner.type, data.owner.login, data.name)

  res.sendStatus(201)
}
