const db = require('../db/dependency')
const log = require('../log')
const client = require('../github')

module.exports = async function (installation, results) {
  if (results.length === 0) {
    return log.info('%s:blue no dependencies found', installation)
  }

  // prep github client
  const github = await client.installation(installation)

  log.info('%s:blue found %s:cyan matches', installation, results.length)

  for (const match of results) {
    log.info('%s:blue found %s:cyan in %s:yellow/%s:yellow', installation, match.path, match.repository.owner.login, match.repository.name)

    // TODO grab sha id and use to store historical data
    const { data: { content } } = await github.request(match.git_url)

    let data

    try {
      data = JSON.parse(Buffer.from(content, 'base64'))
    } catch (err) {
      log.info('%s:blue parsing %s:cyan failed in %s:yellow/%s:yellow', installation, match.path, match.repository.owner.login, match.repository.name)

      continue
    }

    switch (match.name) {
      case 'composer.json':
        // TODO
        break

      case 'package-lock.json':
        if (!data.dependencies) continue

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
}
