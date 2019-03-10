const filter = require('./filter-object')

module.exports = function (repo) {
  const keep = [
    'id',
    'node_id',
    'name',
    'full_name',
    'private',
    'html_url',
    'description',
    'fork',
    'created_at',
    'updated_at',
    'pushed_at',
    'homepage',
    'size',
    'stargazers_count',
    'watchers_count',
    'language',
    'forks_count',
    'archived',
    'open_issues_count',
    'license',
    'default_branch',
    'network_count',
    'subscribers_count'
  ]

  return filter(repo, keep)
}
