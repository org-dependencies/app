const client = require('../../lib/github')
const db = require('../../lib/db/')
const paginate = require('../lib/retry-paginate')
const fetch = require('../lib/fetch-content')
const log = require('../lib/log')
const yaml = require('js-yaml')

const filenames = [
  'package.json',
  'yarn.lock',
  'package-lock.json'
  // 'composer.json'
]

module.exports = async function (req, res) {
  // prep github client
  const github = await client.installation(req.body.installation)

  // TODO deal with 404
  const installation = await db.installation.get(req.body.installation)
  const repository = await db.repository.get(req.body.installation, req.body.repository)

  // fetch ignore
  let settings

  // TODO settings should be separately fetched & stored
  try {
    const { data: { content } } = await github.repos.getContents({ owner: installation.name, repo: '.dependencies', path: '.dependencies/settings.yml' })

    // TODO: validate against a schema to avoid in-code type checks
    settings = yaml.safeLoad(Buffer.from(content, 'base64'))
  } catch (err) {
    // no settings found
  }

  for (const filename of filenames) {
    if (repository) {
      log.info('%s:blue searching for %s:cyan dependencies in %s:yellow/%s:yellow', installation.id, filename, installation.name, repository.repo)
    } else {
      log.info('%s:blue searching for %s:cyan dependencies in %s:yellow', installation.id, filename, installation.name)
    }

    // determine search scope
    const scope = repository ? 'repo' : repository.type.toLowerCase() === 'user' ? 'user' : 'org'
    const owner = repository ? `${installation.name}/${repository.repo}` : installation.name

    // construct search query
    // attempt to exclude as many bad paths as early as possible
    // but it only does top level paths
    const q = `${scope}:${owner} filename:${filename} -path:node_modules -path:bower_components`

    const options = github.search.code.endpoint.merge({ q, per_page: 100 })

    await paginate(github, options, ({ data: { items } }) => fetch(installation, github, settings, items))
  }

  res.sendStatus(201)
}
