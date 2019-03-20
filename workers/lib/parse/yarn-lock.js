const db = require('../../../lib/db/dependency')
const yarnParser = require('@yarnpkg/lockfile').parse
const yarnNameParser = require('parse-package-name')
const log = require('../log')

const parseYarn = (source) => {
  try {
    const result = yarnParser(source)
    return result.object
  } catch (err) {
    return false
  }
}

module.exports = async function (installation, match, content) {
  const source = Buffer.from(content, 'base64').toString('utf8')
  const data = parseYarn(source)

  if (!data) {
    log.error('%s:blue parsing %s:cyan failed in %s:yellow/%s:yellow', installation, match.path, match.repository.owner.login, match.repository.name)
    return
  }

  log.info('%s:blue parsing %s:cyan in %s:yellow/%s:yellow', installation, match.path, match.repository.owner.login, match.repository.name)

  const packages = []

  for (const pkg of Object.keys(data)) {
    const { name } = yarnNameParser(pkg)
    const version = data[pkg].version

    packages.push({ name, version })
  }

  await db.add(installation, match.repository.id, ['npm', 'locked', 'resolved', match.path, source, JSON.stringify(packages)])
}
