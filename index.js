#!/usr/bin/env node

// load env variables FIRST
require('./lib/env')

const yargs = require('yargs')

const log = require('./lib/log')('server')

const website = require('./website')
const workers = require('./workers')

const { connect } = require('./lib/db/connection')

async function main (argv) {
  // attempt database connection first
  try {
    await connect()
  } catch (error) {
    log.error('Database connection failed')
    process.exit(1)
  }

  website.listen(process.env.PORT || process.env.DEPENDENCIES_WEBSITE_PORT || 4000)
  workers.listen(process.env.PORT || process.env.DEPENDENCIES_WORKERS_PORT || 4001)
}

yargs // eslint-disable-line no-unused-expressions
  .usage('$0 [args]')
  .command('$0', 'start dependencies server', () => {}, main)
  .help()
  .argv
