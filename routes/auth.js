const express = require('express')

const client = require('../lib/github')
const passport = require('../lib/passport')

const route = express.Router()

route.get('/in', passport.authenticate('github'))
route.get('/callback', passport.authenticate('github', { failureRedirect: '/home' }), (req, res) => res.redirect('/dashboard')) // TODO: failure redirect should go to an error page

route.get('/out', (req, res) => {
  req.logout()
  res.redirect('/home')
})

// refresh the user session
route.get('/refresh', async function dashboard (req, res) {
  // exit early
  if (!req.user) return res.redirect('/home')

  const github = await client.user(req.user.accessToken)

  // fetch installations for this user
  const { data: { installations } } = await github.apps.listInstallationsForAuthenticatedUser() // TODO paginate

  // update user session
  req.session.passport.user.installations = installations

  res.redirect('/dashboard')
})

module.exports = route
