const { pool } = require('./connection')

// TODO: optimize for multiple inserts
exports.add = (installation, repository, data) => {
  const query = `
    INSERT INTO dependencies (installation, repository, manager, type, mode, path, source, packages)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (installation, repository, path, type)
    DO UPDATE SET
      manager = EXCLUDED.manager,
      mode = EXCLUDED.mode,
      source = EXCLUDED.source,
      packages = EXCLUDED.packages`

  return pool.query(query, [installation, repository, ...data])
}

exports.remove = (installation, repository, path, type) => {
  const query = `
    DELETE FROM dependencies
    WHERE
      installation = $1 AND
      repository = $2 AND
      path = $3 AND
      type = $4`

  return pool.query(query, [installation, repository, path, type])
}

exports.removeRepo = (installation, repository) => {
  const query = `
    DELETE FROM dependencies
    WHERE
      installation = $1 AND
      repository = $2`

  return pool.query(query, [installation, repository])
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
    repository = $2
  ORDER BY
    path, type ASC`

  return pool.query(query, [installation, name])
}

exports.version = (installation, name, version, limit = 25, offset = 0) => {
  const query = `
  SELECT
    *,
    COUNT(*) OVER() AS total
  FROM
    dependencies AS D
    LEFT JOIN repositories AS R ON R.id = D.repository,
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

exports.versions = (installation, name) => {
  const query = `
  SELECT
    type,
    P.version,
    COUNT(P.version)
  FROM
    dependencies AS D,
    jsonb_to_recordset(D.packages) AS P(name text, version text)
  WHERE
    D.installation = $1
  AND
    P.name = $2
  GROUP BY type, P.version
  ORDER BY count DESC`

  return pool.query(query, [installation, name])
}

exports.dependants = (installation, name, limit = 25, offset = 0) => {
  const query = `
  SELECT
    *,
    COUNT(*) OVER() AS total
  FROM
    dependencies AS D
    LEFT JOIN repositories AS R ON R.id = D.repository,
    jsonb_to_recordset(D.packages) AS P(name text, version text)
  WHERE
    D.installation = $1
    AND P.name = $2

  LIMIT $3 OFFSET $4
`

  return pool.query(query, [installation, name, limit, Math.abs(offset)])
}

exports.stats = async (installation) => {
  let result
  const stats = {}

  const repositories = `
    SELECT
      COUNT(DISTINCT id) AS "count"
    FROM
      repositories
    WHERE
      installation = $1`

  result = await pool.query(repositories, [installation])

  stats.repositories = result.rows.shift()

  const managers = `
    SELECT
      manager, COUNT(DISTINCT P.name)
    FROM
      dependencies AS D,
      jsonb_to_recordset(D.packages) AS P(name text)
    WHERE
      installation = $1
    GROUP BY
      manager`

  result = await pool.query(managers, [installation])

  stats.managers = result.rows.map(row => ({ name: row.manager, count: row.count }))

  const modes = `
    SELECT
      manager, mode, COUNT(DISTINCT P.name)
    FROM
      dependencies AS D,
      jsonb_to_recordset(D.packages) AS P(name text)
    WHERE
      installation = $1
    GROUP BY
      manager, mode`

  result = await pool.query(modes, [installation])

  // group data by manager
  stats.modes = {}
  result.rows.forEach(row => {
    if (!stats.modes[row.manager]) stats.modes[row.manager] = []

    stats.modes[row.manager].push({ name: row.mode, count: row.count })
  })

  const types = `
    SELECT
      manager, type, COUNT(DISTINCT P.name)
    FROM
      dependencies AS D,
      jsonb_to_recordset(D.packages) AS P(name text)
    WHERE
      installation = $1
    GROUP BY
      manager, type`

  result = await pool.query(types, [installation])

  // group data by manager
  stats.types = {}
  result.rows.forEach(row => {
    if (!stats.types[row.manager]) stats.types[row.manager] = []

    stats.types[row.manager].push({ name: row.type, count: row.count })
  })

  return stats
}

exports.repositories = (installation, limit = 25, offset = 0) => {
  const query = `
  SELECT
    R.*,
    COUNT(P.name) FILTER (WHERE D.mode = 'declared') AS declared,
    COUNT(P.name) FILTER (WHERE D.mode = 'resolved') AS resolved,
    COUNT(R.id) OVER() AS total
  FROM
    repositories AS R LEFT JOIN dependencies AS D ON D.repository = R.id,
    jsonb_to_recordset(D.packages) AS P(name text)
  WHERE
    R.installation = $1
  GROUP BY R.id
  ORDER BY resolved DESC, R.repo ASC
  LIMIT $2 OFFSET $3
`

  return pool.query(query, [installation, limit, Math.abs(offset)])
}

exports.packages = (installation, limit = 25, offset = 0) => {
  const query = `
  SELECT
    P.name,
    COUNT(DISTINCT P.version) FILTER (WHERE D.mode = 'declared') AS declared,
    COUNT(DISTINCT P.version) FILTER (WHERE D.mode = 'resolved') AS resolved,
    COUNT(D.repository) AS dependants,
    COUNT(*) OVER() AS total
  FROM
    dependencies AS D,
    jsonb_to_recordset(D.packages) AS P(name text, version text)
  WHERE
    D.installation = $1
  GROUP BY P.name
  ORDER BY resolved DESC, declared DESC, P.name ASC
  LIMIT $2 OFFSET $3
`

  return pool.query(query, [installation, limit, Math.abs(offset)])
}

exports.listByManager = (installation, manager) => {
  const query = `
  SELECT DISTINCT
    repository,
    P.name,
    P.version
  FROM
    dependencies AS D
    LEFT JOIN repositories AS R ON D.repository = R.id
    LEFT JOIN LATERAL jsonb_to_recordset(D.packages) AS P(name text, version text) ON TRUE
  WHERE
    D.installation = $1 AND
    D.manager = $2`

  return pool.query(query, [installation, manager])
}
