const db = require('../db/dependency')
const log = require('../log')

const parseJSON = (content) => {
  try {
    return JSON.parse(Buffer.from(content, 'base64'))
  } catch (err) {
    return false
  }
}

module.exports = function (installation, match, content) {
  const data = parseJSON(content)

  if (!data) {
    log.info('%s:blue parsing %s:cyan failed in %s:yellow/%s:yellow', installation, match.path, match.repository.owner.login, match.repository.name)
    return
  }

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
}
