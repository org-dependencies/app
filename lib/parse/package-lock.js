const db = require('../db/dependency')
const log = require('../log')
const semver = require('semver')
const findVersions = require('find-versions')

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

  if (!data.dependencies) return

  const packages = []

  for (const [name, dep] of Object.entries(data.dependencies)) {
    const pkg = { name }

    // validate the version numver
    let version = semver.valid(dep.version)

    // attempt to process non-semver versions
    // https://docs.npmjs.com/files/package-lock.json#version-1
    if (version === null) {
      const found = findVersions(dep.version)

      if (found.length) {
        version = found.pop().replace('.tgz', '')
      }
    }

    // only store recognizable versions
    if (version) {
      pkg.version = version

      packages.push(pkg)
    }
  }

  // print friendly source
  const source = JSON.stringify(packages, null, 2)

  db.add(installation, match.repository.id, ['npm', 'locked', 'resolved', match.path, source, JSON.stringify(packages)])
}
