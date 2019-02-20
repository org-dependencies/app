const db = require('../db/dependency')
const log = require('../log')

module.exports = async function (installationID, repository) {
  const [org, name] = repository.full_name.split('/')

  if (repository.package === null || repository.package.content === null) {
    return log.info('%s:blue no package.json found in %s:yellow/%s:yellow', installationID, org, name)
  }

  log.info('%s:blue found package.json in %s:yellow/%s:yellow', installationID, org, name)

  let pkg

  try {
    pkg = JSON.parse(repository.package.content)
  } catch (err) {
    return log.info('%s:blue parsing package.json failed in %s:yellow/%s:yellow', installationID, org, name)
  }

  const types = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']

  // gather all dependencies
  for (const type of types) {
    if (!pkg[type]) continue

    // we only store the content of the dependencies object
    const content = JSON.stringify(pkg[type], null, 2)

    // construct packages object
    const packages = Object.entries(pkg[type]).map(([name, version]) => ({ name, version }))

    // loop & gather
    db.add(installationID, org, name, type, content, JSON.stringify(packages))
  }
}
