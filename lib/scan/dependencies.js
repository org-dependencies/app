const client = require('../github')
const paginate = require('../paginate-retry')
const fetch = require('./fetch')

const filenames = [
  'package.json',
  'package-lock.json'
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

  paginate(installation, options, fetch)
}
