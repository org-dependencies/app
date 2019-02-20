const { pool } = require('./connection')

exports.get = (installation, name) => {
  return pool.query(`SELECT * FROM repositories WHERE installation = $1 AND name = $2`, [installation, name])
}

// TODO: optimize for multiple inserts
exports.add = (installation, repo) => {
  const [org, name] = repo.full_name.split('/')

  const row = [
    installation,
    repo.id,
    org,
    name,
    repo.url,
    repo.language ? repo.language.name.toLowerCase() : null,
    repo.private
  ]

  return pool.query(`INSERT INTO
    repositories (installation, id, org, name, url, language, private)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (id) DO UPDATE
    SET org = EXCLUDED.org,
    name = EXCLUDED.name,
    url = EXCLUDED.url,
    language = EXCLUDED.language,
    private = EXCLUDED.private`, row)
}

exports.remove = (installation, id) => {
  return pool.query(`DELETE FROM repositories WHERE installation = $1 AND id = $2`, [installation, id])
}
