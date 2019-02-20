#!/usr/bin/env node

// load env variables FIRST
require('./lib/env')

const yargs = require('yargs')
const { uncaughtException, unhandledRejection } = require('uncaught-extender')

const log = require('./lib/log')

process.on('uncaughtException', uncaughtException)
process.on('unhandledRejection', unhandledRejection)
process.on('uncaughtException:*', log.exit)
process.on('unhandledRejection:*', log.exit)

const app = require('./app')
const { connect } = require('./lib/db/connection')

async function main (argv) {
  // attempt database connection first
  try {
    await connect()
  } catch (error) {
    log.exit('Database connection failed')
  }

  const port = process.env.PORT || process.env.DEPENDENCIES_APP_PORT || 3000

  app.listen(port, () => log.info('listening on port %s:yellow', port))
}

yargs // eslint-disable-line no-unused-expressions
  .usage('$0 [args]')
  .command('$0', 'start dependencies server', () => {}, main)
  .help()
  .argv
