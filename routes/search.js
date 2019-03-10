const { Router } = require('express')

const db = require('../lib/db/search')

const route = Router()

route.get('/', async function (req, res) {
  const search = req.query.q

  if (!search || search.length < 3) {
    return res.render('search/empty', { search })
  }

  // get user installations
  const installations = req.user.installations.map(installation => installation.id)

  const repositories = await db.repositories(search, installations, 10)
  const packages = await db.packages(search, installations, 10)

  if (repositories.rows.length === 0 && packages.rows.length === 0) {
    return res.render('search/404', { search })
  }

  res.render('search/index', { search, repositories: repositories.rows, packages: packages.rows })
})

route.get('/repositories', async function (req, res) {
  const page = parseInt(req.query.page - 1 || 0)
  const search = req.query.q

  if (!search || search.length < 3) {
    return res.render('search/empty', { search })
  }

  // get user installations
  const installations = req.user.installations.map(installation => installation.id)

  const limit = 50
  const { rows } = await db.repositories(search, installations, limit, page * limit)

  if (rows.length === 0) {
    return res.render('search/404', { search })
  }

  const total = rows[0] ? rows[0].total : 0
  const pages = Math.ceil(total / limit)

  res.render('search/repositories', { search, repositories: rows, total, pages, page: page + 1 })
})

route.get('/packages', async function (req, res) {
  const page = parseInt(req.query.page - 1 || 0)
  const search = req.query.q

  if (!search || search.length < 3) {
    return res.render('search/empty', { search })
  }

  // get user installations
  const installations = req.user.installations.map(installation => installation.id)

  const limit = 50
  const { rows } = await db.packages(search, installations, limit, page * limit)

  if (rows.length === 0) {
    return res.render('search/404', { search })
  }

  const total = rows[0] ? rows[0].total : 0
  const pages = Math.ceil(total / limit)

  res.render('search/packages', { search, packages: rows, total, pages, page: page + 1 })
})

module.exports = route
