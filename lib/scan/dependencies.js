const db = require('../db/dependency')
const log = require('../log')
const client = require('../github')

const filenames = [
  'package.json' // TODO: why does tis retur package-lock.json
  // 'composer.json'
]

module.exports = async function (installation, type, login, repo) {
  // prep github client
  const github = await client.installation(installation)

  // determine search scope
  const scope = repo ? 'repo' : type.toLowerCase() === 'user' ? 'user' : 'org'
  const owner = repo ? `${login}/${repo}` : login
  const files = filenames.map(name => 'filename:' + name).join('+')

  // construct search query
  const q = `${scope}:${owner}+${files}`

  const options = github.search.code.endpoint.merge({ q, per_page: 100 })

  let results = []

  // paginate through results
  try {
    for await (const { data: { items } } of github.paginate.iterator(options)) {
      Array.prototype.push.apply(results, items)
    }
  } catch (err) {
    log.error('something went wrong: %s', err.message)
  }

  if (results.length === 0) {
    return log.info('%s:blue no dependencies found in %s:yellow', installation, login)
  }

  for (const match of results) {
    log.info('%s:blue found %s:cyan in %s:yellow/%s:yellow', installation, match.path, match.repository.owner.login, match.repository.name)

    const { data: { sha, content } } = await github.request(match.url)

    let data

    try {
      data = JSON.parse(Buffer.from(content, 'base64'))
    } catch (err) {
      return log.info('%s:blue parsing %s:cyan failed in %s:yellow/%s:yellow', installation, match.path, match.repository.owner.login, match.repository.name)
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
