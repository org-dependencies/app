const React = require('react')

const {
  Page, Container, Grid, Card, Form, Button, Text, Table
} = require('tabler-react')
const Session = require('../layouts/session')
const Layout = require('./layout')

module.exports = () => (
  <Session>
    <Container>
      <Layout />
      404
    </Container>
  </Session>
)
