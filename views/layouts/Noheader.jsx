const React = require('react')
const PropTypes = require('prop-types')

const { Page } = require('tabler-react')
const Head = require('../_includes/head')

const NoHeader = ({ children }) => (
  <html lang="en">
    <Head />
    <body>
      <Page>
        <Page.Main>{children}</Page.Main>
      </Page>
    </body>
  </html>
)

NoHeader.propTypes = {
  children: PropTypes.node.isRequired
}

module.exports = NoHeader
