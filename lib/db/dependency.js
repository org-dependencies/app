const { pool } = require('./connection')

exports.versions = (installation, name) => {
  const query = `
  SELECT
    P.version,
    COUNT(P.version)
  FROM
    dependencies AS D,
    jsonb_to_recordset(D.packages) AS P(name text, version text)
  WHERE
    D.installation = $1
  AND
    P.name = $2
  GROUP BY P.version
  ORDER BY count DESC`

  return pool.query(query, [installation, name])
}

exports.repository = (installation, name) => {
  const query = `
  SELECT
    *
  FROM
    dependencies
  WHERE
    installation = $1
  AND
    repository = $2`

  return pool.query(query, [installation, name])
}

exports.dependants = (installation, name, limit = 25, offset = 0) => {
  const query = `
  SELECT
    *,
    COUNT(*) OVER() AS total
  FROM
    dependencies AS D,
    jsonb_to_recordset(D.packages) AS P(name text, version text)
  WHERE
    D.installation = $1
  AND
    P.name = $2
  LIMIT $3 OFFSET $4
`

  return pool.query(query, [installation, name, limit, Math.abs(offset)])
}

exports.version = (installation, name, version, limit = 25, offset = 0) => {
  const query = `
  SELECT
    *,
    COUNT(*) OVER() AS total
  FROM
    dependencies AS D,
    jsonb_to_recordset(D.packages) AS P(name text, version text)
  WHERE
    D.installation = $1
  AND
    P.name = $2
  AND
    P.version = $3
  LIMIT $4 OFFSET $5
`

  return pool.query(query, [installation, name, version, limit, Math.abs(offset)])
}

exports.stats = (installation) => {
  const query = `
  SELECT * FROM
    (
    SELECT
      COUNT(DISTINCT id) AS "Repositories"
    FROM
      repositories
    WHERE
      installation = $1
    ) AS repositories,
    (
    SELECT
      COUNT(DISTINCT P.name) FILTER(WHERE D.type = 'dependencies') AS "Dependencies",
      COUNT(DISTINCT P.name) FILTER(WHERE D.type = 'devDependencies') AS "devDependencies",
      COUNT(DISTINCT P.name) FILTER(WHERE D.type = 'peerDependencies') AS "peerDependencies",
      COUNT(DISTINCT P.name) FILTER(WHERE D.type = 'optionalDependencies') AS "optionalDependencies"
    FROM
      dependencies AS D,
      jsonb_to_recordset(D.packages) AS P(name text)
    WHERE
      installation = $1
    ) AS dependencies`

  return pool.query(query, [installation])
}

exports.repositories = (installation, limit = 25, offset = 0) => {
  const query = `
  SELECT
    R.*,
    COUNT(P.name),
    COUNT(R.id) OVER() AS total
  FROM
    repositories AS R LEFT JOIN dependencies AS D ON D.repository = R.name,
    jsonb_to_recordset(D.packages) AS P(name text)
  WHERE
    R.installation = $1
  GROUP BY R.id
  ORDER BY count DESC, R.name ASC
  LIMIT $2 OFFSET $3
`

  return pool.query(query, [installation, limit, Math.abs(offset)])
}

exports.packages = (installation, limit = 25, offset = 0) => {
  const query = `
  SELECT
    P.name,
    COUNT(P.name),
    COUNT(*) OVER() AS total
  FROM
    dependencies AS D,
    jsonb_to_recordset(D.packages) AS P(name text)
  WHERE
    D.installation = $1
  GROUP BY P.name
  ORDER BY count DESC, P.name ASC
  LIMIT $2 OFFSET $3
`

  return pool.query(query, [installation, limit, Math.abs(offset)])
}

// TODO: optimize for multiple inserts
exports.add = async (...args) => {
  const query = `
  INSERT INTO
    dependencies (installation, org, repository, type, content, packages)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT
    (installation, org, repository, type)
  DO UPDATE SET
    content = EXCLUDED.content,
    packages = EXCLUDED.packages`

  const result = await pool.query(query, args)

  return result
}

exports.remove = (installation, id) => {
  return pool.query(`DELETE FROM dependencies WHERE installation = $1 AND id = $2`, [installation, id])
}
