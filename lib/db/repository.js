const { pool } = require('./connection')

// TODO: optimize for multiple inserts
exports.add = (installation, data) => {
  const query = `
    INSERT INTO repositories (installation, id, owner, repo, meta)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id)
    DO UPDATE SET
      owner = EXCLUDED.owner,
      repo = EXCLUDED.repo,
      meta = EXCLUDED.meta`

  return pool.query(query, [installation, ...data])
}

exports.get = (installation, repo) => {
  return pool.query(`SELECT * FROM repositories WHERE installation = $1 AND (repo = $2 OR id = $2)`, [installation, repo])
}

exports.remove = (installation, id) => {
  return pool.query(`DELETE FROM repositories WHERE installation = $1 AND id = $2`, [installation, id])
}
