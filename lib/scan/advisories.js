const { iterator } = require('../request')
const db = require('../db/advisories')

const paginate = function (response, options) {
  const next = response.body && response.body.urls && response.body.urls.next ? response.body.urls.next : false

  return next ? Object.assign({}, options, { path: next }) : false
}

module.exports = async function () {
  const options = { host: 'registry.npmjs.com', path: '/-/npm/v1/security/advisories?perPage=1000' }

  for await (const { body: { objects } } of iterator(options, paginate)) {
    objects.forEach(advisory => {
      const row = [
        'npm',
        advisory.id,
        advisory.module_name,
        advisory.severity,
        advisory.cwe,
        advisory.vulnerable_versions,
        advisory.overview,
        advisory.recommendation,
        advisory.url,
        advisory.created,
        advisory.updated
      ]

      db.add(...row)
    })
  }
}
