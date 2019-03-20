const paginate = require('./retry-paginate')
const fetch = require('./fetch-content')
const log = require('./log')
const yaml = require('js-yaml')

const filenames = [
  'package.json',
  'yarn.lock',
  'package-lock.json'
  // 'composer.json'
]

module.exports = async function (installation, github, type, login, repo) {
  // fetch ignore
  let settings

  try {
    const { data: { content } } = await github.repos.getContents({ owner: login, repo: '.dependencies', path: '.dependencies/settings.yml' })

    // TODO: validate against a schema to avoid in-code type checks
    settings = yaml.safeLoad(Buffer.from(content, 'base64'))
  } catch (err) {
    // no settings found
  }

  for (const filename of filenames) {
    if (repo) {
      log.info('%s:blue searching for %s:cyan dependencies in %s:yellow/%s:yellow', installation, filename, login, repo)
    } else {
      log.info('%s:blue searching for %s:cyan dependencies in %s:yellow', installation, filename, login)
    }

    // determine search scope
    const scope = repo ? 'repo' : type.toLowerCase() === 'user' ? 'user' : 'org'
    const owner = repo ? `${login}/${repo}` : login

    // construct search query
    // attempt to exclude as many bad paths as early as possible
    // but it only does top level paths
    const q = `${scope}:${owner} filename:${filename} -path:node_modules -path:bower_components`

    const options = github.search.code.endpoint.merge({ q, per_page: 100 })

    await paginate(github, options, ({ data: { items } }) => fetch(installation, github, settings, items))
  }
}
