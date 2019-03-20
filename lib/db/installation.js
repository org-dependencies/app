const { pool } = require('./connection')

exports.add = (...args) => {
  const query = `
    INSERT INTO installations (id, name, type, url)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      type = EXCLUDED.type,
      url = EXCLUDED.url`

  return pool.query(query, args)
}

exports.get = async id => {
  const { rows: [ installation ] } = await pool.query(`SELECT * FROM installations WHERE id = $1 LIMIT 1`, [id])

  console.log(installation)

  return installation
}

exports.remove = (installation) => {
  pool.query(`DELETE FROM installations WHERE id = $1`, [installation])
  pool.query(`DELETE FROM repositories WHERE installation = $1`, [installation])
  pool.query(`DELETE FROM dependencies WHERE installation = $1`, [installation])
}

exports.list = (installations) => {
  // cast ids to strings
  installations = installations.map(String)

  const query = `
    SELECT COALESCE(COUNT(R.id), 0) AS total, I.*
    FROM installations AS I LEFT JOIN repositories AS R ON (I.id = R.installation)
    WHERE I.id = ANY ($1)
    GROUP BY I.id`

  return pool.query(query, [[installations]])
}
