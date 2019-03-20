const { Router } = require('express')

const db = require('../../lib/db/installation')
const log = require('../lib/log')
const client = require('../../lib/github')

const route = Router()

// dashboard overview
route.get('/', async function (req, res) {
  // refresh session when user is redirected back from github
  if (req.query.installation_id && req.query.setup_action) {
    return res.redirect('/auth/refresh')
  }

  // only show installations belonging to the user
  const userInstallations = req.user.installations.map(installation => installation.id)

  if (userInstallations.length === 0) {
    return res.render('dashboard/404')
  }

  let { rows } = await db.list(userInstallations)

  if (rows.length === 0) {
    return res.render('dashboard/404')
  }

  res.render('dashboard/index', { installations: rows })
})

route.get('/scan', async function (req, res) {
  const github = await client.user(req.user.accessToken)

  // fetch installations for this user
  const { data: { installations } } = await github.apps.listInstallationsForAuthenticatedUser() // TODO paginate

  log.info('found %d:cyan installations', installations.length)

  // re-install user apps
  for (const installation of installations) {
    const data = [
      installation.id,
      installation.account.login,
      installation.account.type,
      installation.html_url
    ]

    // add installation
    db.add(...data)

    // scan org
    // TODO WORKERS
    // scan(installation.id, installation.account.login, installation.account.type === 'User' ? req.user.accessToken : null)
  }

  res.redirect('/dashboard')
})

module.exports = route
