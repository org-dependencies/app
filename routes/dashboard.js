const { Router } = require('express')

const db = require('../lib/db/installation')
const log = require('../lib/log')
const api = require('../lib/github/api')
const install = require('../lib/install')

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
  const octokit = await api.user(req.user.accessToken)

  // fetch installations for this user
  const { data: { installations } } = await octokit.apps.listInstallationsForAuthenticatedUser() // TODO paginate

  log.info('found %d:cyan installations', installations.length)

  // re-install user apps
  installations.map(install)

  res.redirect('/dashboard')
})

module.exports = route
