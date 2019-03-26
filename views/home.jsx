require('tabler-react/dist/Tabler.css')

const React = require('react')

const { Page } = require('tabler-react')
const Head = require('./_includes/head')

module.exports = () => (
  <html lang="en">
    <Head />
    <body>
      <Page>Hello</Page>
    </body>
  </html>
)
