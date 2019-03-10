const db = require('../db/dependency')
const yarnParser = require('@yarnpkg/lockfile').parse
const yarnNameParser = require('parse-package-name')

const parseYarn = (source) => {
  try {
    const result = yarnParser(source)
    return result.object
  } catch (err) {
    return false
  }
}

module.exports = function (installation, match, content) {
  const source = Buffer.from(content, 'base64').toString('utf8')
  const data = parseYarn(source)

  const packages = []

  for (const pkg of Object.keys(data)) {
    const { name } = yarnNameParser(pkg)
    const version = data[pkg].version

    packages.push({ name, version })
  }

  db.add(installation, match.repository.id, ['npm', 'locked', 'resolved', match.path, source, JSON.stringify(packages)])
}
