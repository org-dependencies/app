const packageJSON = require('./package')
const packageLock = require('./package-lock')
const yarnLock = require('./yarn-lock')

module.exports = function (installation, match, content) {
  switch (match.name) {
    case 'yarn.lock':
      return yarnLock(installation, match, content)

    case 'package-lock.json':
      return packageLock(installation, match, content)

    case 'package.json':
      return packageJSON(installation, match, content)
  }
}
