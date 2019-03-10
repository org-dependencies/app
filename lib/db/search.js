const { pool } = require('./connection')

exports.repositories = (string, installations, limit = 25, offset = 0) => {
  // cast ids to strings
  installations = installations.map(String)

  const query = `
  SELECT
    R.*,
    COUNT(P.name) FILTER (WHERE D.mode = 'declared') AS declared,
    COUNT(P.name) FILTER (WHERE D.mode = 'resolved') AS resolved,
    COUNT(R.id) OVER() AS total
  FROM
    repositories AS R
    LEFT OUTER JOIN dependencies AS D ON D.repository = R.id
    LEFT JOIN LATERAL jsonb_to_recordset(D.packages) AS P(name text) ON TRUE
  WHERE
    (owner LIKE $1 OR repo LIKE $1) AND R.installation = ANY($2)
  GROUP BY R.id
  ORDER BY resolved DESC, R.repo ASC
  LIMIT $3 OFFSET $4`

  return pool.query(query, [`%${string}%`, installations, limit, Math.abs(offset)])
}

exports.packages = (string, installations, limit = 25, offset = 0) => {
  // cast ids to strings
  installations = installations.map(String)

  const query = `
  SELECT
    P.name,
    I.name AS org,
    COUNT(DISTINCT P.version) FILTER (WHERE D.mode = 'declared') AS declared,
    COUNT(DISTINCT P.version) FILTER (WHERE D.mode = 'resolved') AS resolved,
    COUNT(D.repository) AS dependants,
    COUNT(*) OVER() AS total
  FROM
    dependencies AS D
    LEFT JOIN installations AS I ON D.installation = I.id
    LEFT JOIN LATERAL jsonb_to_recordset(D.packages) AS P(name text, version text) ON TRUE
  WHERE
    P.name LIKE $1 AND D.installation = ANY($2)
  GROUP BY I.id, P.name
  ORDER BY resolved DESC, declared DESC, P.name ASC
  LIMIT $3 OFFSET $4`

  return pool.query(query, [`%${string}%`, installations, limit, Math.abs(offset)])
}
