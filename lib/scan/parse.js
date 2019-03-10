const db = require('../db/dependency')
const log = require('../log')

module.exports = function (installation, match, content) {
  let data

  try {
    data = JSON.parse(Buffer.from(content, 'base64'))
  } catch (err) {
    log.info('%s:blue parsing %s:cyan failed in %s:yellow/%s:yellow', installation, match.path, match.repository.owner.login, match.repository.name)
    return
  }

  switch (match.name) {
    case 'composer.json':
      // TODO
      break

    case 'package-lock.json':
      if (!data.dependencies) break

      const packages = Object.entries(data.dependencies).map(([name, dep]) => ({ name, version: dep.version }))

      // print friendly source
      const source = JSON.stringify(packages, null, 2)

      db.add(installation, match.repository.id, ['npm', 'locked', 'resolved', match.path, source, JSON.stringify(packages)])
      break

    case 'package.json':
      const types = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']

      // gather all dependencies
      for (const type of types) {
        // does this type exist?
        if (!data[type] || Object.keys(data[type]).length === 0) continue

        // print friendly source
        const source = JSON.stringify(data[type], null, 2)

        // construct packages object
        const packages = Object.entries(data[type]).map(([name, version]) => ({ name, version }))

        db.add(installation, match.repository.id, ['npm', type, 'declared', match.path, source, JSON.stringify(packages)])
      }
      break
  }
}
