const db = require('./db/installation')
const scan = require('./scan/org')

module.exports = async function install (installation) {
  // add installation
  db.add(installation)
  // scan org
  scan(installation.id, installation.account.login, installation.account.type)
}
