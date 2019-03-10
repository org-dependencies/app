const { pool } = require('./connection')

exports.add = (...args) => {
  const query = `
    INSERT INTO advisories
      (manager, id, package, severity, cwe, versions, overview, recommendation, url, created, updated)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (id, manager)
    DO UPDATE SET
      package = EXCLUDED.package,
      severity = EXCLUDED.severity,
      cwe = EXCLUDED.cwe,
      versions = EXCLUDED.versions,
      overview = EXCLUDED.overview,
      recommendation = EXCLUDED.recommendation,
      url = EXCLUDED.url,
      created = EXCLUDED.created,
      updated = EXCLUDED.updated`

  return pool.query(query, args)
}

exports.get = (id, manager) => {
  return pool.query(`SELECT * FROM advisories WHERE id = $1 AND manager = $2`, [id, manager])
}

exports.list = (manager) => {
  return pool.query(`SELECT * FROM advisories WHERE manager = $1`, [manager])
}

exports.listByManager = (installation, manager) => {
  const query = `
  SELECT DISTINCT
    repository,
    P.name,
    P.version
  FROM
    dependencies AS D
    LEFT JOIN LATERAL jsonb_to_recordset(D.packages) AS P(name text, version text) ON TRUE
  WHERE
    installation = $1 AND
    mode = 'resolved' AND
    manager = $2`

  return pool.query(query, [installation, manager])
}
