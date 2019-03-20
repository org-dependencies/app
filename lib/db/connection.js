const { Pool } = require('pg')

const log = require('../log')

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD
})

// shut down on errors
pool.on('error', error => {
  log.error('Unexpected database error', error)
  process.exit(1)
})

exports.pool = pool

exports.connect = () => pool.connect()
