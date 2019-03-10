const { Router } = require('express')

const db = require('../lib/db/')
const scan = require('../lib/scan/')

const route = Router({ mergeParams: true })

// pagination limit
const limit = 50

route.use(async function (req, res, next) {
  // view values
  res.locals.org = req.params.org

  // pagination helper
  req.query.page = parseInt(req.query.page - 1 || 0)

  // prep installations ids
  req.installations = req.user.installations.map(installation => installation.account.login)

  // validate this user is a member of this org
  if (!req.installations.includes(req.params.org)) {
    return res.render('org/404')
  }

  // get the installation reference
  const { rows: [ installation ] } = await db.installation.get(req.params.org)

  // no installation?
  if (!installation) {
    return res.render('org/404')
  }

  req.installation = installation
  res.locals.installation = installation

  next()
})

route.get('/', async function (req, res) {
  const stats = await db.dependency.stats(req.installation.id)

  const repositories = await db.dependency.repositories(req.installation.id, 10)

  const packages = await db.dependency.packages(req.installation.id, 10)

  res.render('org/index', { stats, repositories: repositories.rows, packages: packages.rows })
})

route.get('/repositories', async function (req, res) {
  const { rows } = await db.dependency.repositories(req.installation.id, limit, req.query.page * limit)

  const total = rows[0] ? rows[0].total : 0
  const pages = Math.ceil(total / limit)

  res.render('org/repositories', { repositories: rows, total, pages, page: req.query.page + 1 })
})

route.get('/repositories/:name', async function (req, res) {
  const { name } = req.params

  const { rows: [ repository ] } = await db.repository.get(req.installation.id, name)

  if (!repository) {
    return res.render(`repository/404`, { name, installation: req.installation })
  }

  const { rows } = await db.dependency.repository(req.installation.id, repository.id)

  return res.render(`repository/index`, { name, repository, dependencies: rows })
})

route.get('/repositories/:name/scan', async function (req, res) {
  const { name } = req.params

  scan.repo(req.installation.id, name)

  // TODO send to intermediary page

  res.redirect(`/${req.params.org}/repositories/${name}`)
})

route.get('/dependencies', async function (req, res) {
  let { rows } = await db.dependency.packages(req.installation.id, limit, req.query.page * limit)

  const total = rows[0] ? rows[0].total : 0
  const pages = Math.ceil(total / limit)

  res.render('org/dependencies', { dependencies: rows, total, pages, page: req.query.page + 1 })
})

route.get('/dependencies/:name*/v/:version', async function (req, res) {
  let { name, version } = req.params

  // handle scoped packages
  name += req.params[0] ? req.params[0] : ''

  const dependants = await db.dependency.version(req.installation.id, name, version)

  const total = dependants.rows[0] ? dependants.rows[0].total : 0
  const pages = Math.ceil(total / limit)

  return res.render(`org/version`, { name, version, dependants: dependants.rows, total, pages, page: req.query.page + 1 })
})

route.get('/dependencies/:name*', async function (req, res) {
  let { name } = req.params

  // handle scoped packages
  name += req.params[0] ? req.params[0] : ''

  const versions = await db.dependency.versions(req.installation.id, name)

  const dependants = await db.dependency.dependants(req.installation.id, name)

  const total = dependants.rows[0] ? dependants.rows[0].total : 0
  const pages = Math.ceil(total / limit)

  return res.render(`org/dependency`, { name, versions: versions.rows, dependants: dependants.rows, total, pages, page: req.query.page + 1 })
})

route.get('/scan', async function (req, res) {
  scan.org(req.installation.id, req.installation.name, req.user.accessToken)

  // TODO add intermediary page

  res.redirect(`/${req.params.org}`)
})

module.exports = route
