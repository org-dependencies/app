const connection = require('./connection')
const dependency = require('./dependency')
const installation = require('./installation')
const repository = require('./repository')
const advisories = require('./advisories')

module.exports = {
  connection,
  dependency,
  installation,
  repository,
  advisories
}
