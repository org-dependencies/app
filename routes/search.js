const { Router } = require('express')

const db = require('../lib/db/search')
const colors = require('../lib/colors.json')

const route = Router()

route.get('/', async function (req, res) {
  const page = parseInt(req.query.page - 1 || 0)
  const search = req.query.q

  if (!search || search.length < 3) {
    return res.render('search/empty', { search })
  }

  // get user installations
  const installations = req.user.installations.map(installation => installation.id)

  const limit = 10
  const { rows } = await db.repositories(search, installations, limit, page * limit)

  if (rows.length === 0) {
    return res.render('search/404', { search })
  }

  const total = rows[0] ? rows[0].total : 0
  const pages = Math.ceil(total / limit)

  res.render('search/index', { colors, search, repositories: rows, total, pages, page: page + 1 })
})

module.exports = route
