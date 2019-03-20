const bodyParser = require('body-parser')
const express = require('express')
const { createServer } = require('http')
const log = require('./lib/log')

const webhooks = require('./webhooks')

// initiate new express instance
const app = express()

// routes
const account = require('./routes/account')
const org = require('./routes/org')
const advisories = require('./routes/advisories')
const repository = require('./routes/repository')
const scan = require('./routes/scan')

// assign common middlewares
// TODO add further performance middlewares
app.use(bodyParser.json({ limit: '2mb' }))

app.post('/gh/account', account)
app.post('/gh/advisories', advisories)
app.post('/gh/repository', repository)
app.post('/gh/scan', scan)
app.post('/gh/org', org)

// listen to webhooks
app.post('/gh/webhooks', webhooks)

app.listen = function (port) {
  createServer(this).listen(port, () => log.info('listening on port %s:yellow', port))
}

module.exports = app
