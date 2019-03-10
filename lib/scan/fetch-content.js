const log = require('../log')
const parse = require('./parse')
const request = require('../retry-request')
const mm = require('micromatch')

module.exports = async function (installation, github, settings, items) {
  for (const item of items) {
    // avoid scanning node_modules for those who commit it
    if (mm.some(item.path, ['**/node_modules/**', '**/bower_components/**'])) continue

    // org settings
    if (settings) {
      // repo settings
      if (settings.repos) {
        // validate against repo include list
        if (settings.repos.include && !mm.some(item.repository.name, settings.repos.include)) continue

        // validate against repo exclude list
        if (settings.repos.exclude && mm.some(item.repository.name, settings.repos.exclude)) continue
      }

      if (settings.paths) {
        // validate against repo include list
        if (settings.paths.include && !mm.some(item.path, settings.paths.include)) continue

        // validate against repo exclude list
        if (settings.paths.exclude && mm.some(item.path, settings.paths.exclude)) continue
      }
    }

    request(github, item.git_url, ({ data: { content } }) => {
      log.info('%s:blue found %s:cyan in %s:yellow/%s:yellow', installation, item.path, item.repository.owner.login, item.repository.name)

      parse(installation, item, content)
    })
  }
}
