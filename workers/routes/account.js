const db = require('../../lib/db/installation')
const log = require('../lib/log')
const client = require('../../lib/github')

module.exports = async function (req, res) {
  const github = await client.user(req.body.accessToken)

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
    await db.add(...data)

    // scan org
    await scan(installation.id, installation.account.login, installation.account.type === 'User' ? req.user.accessToken : null)
  }

  res.send(200)
}
