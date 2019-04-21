const React = require('react')
const PropTypes = require('prop-types')

const {
  Page, Container, Site, Avatar, Button, Dropdown, Nav, Text
} = require('tabler-react')
const Head = require('../_includes/head')
const Logo = require('../layouts/logo')

const Session = ({ children, user = { avatar_url: '', name: 'No Name' } }) => (
  <html lang="en">
    <Head />
    <body>
      <Page>
        <Page.Main>
          <Site.Header className="py-4">
            <Logo />
            <div className="d-flex order-lg-2 ml-auto">
              <Dropdown>
                {/* Avatar and menu controls */}
                {/* eslint-disable jsx-a11y/anchor-is-valid */}
                <a
                  className="nav-link pr-0 leading-none"
                  data-toggle="dropdown"
                  aria-expanded="false"
                  href="#"
                >
                  <Avatar className="rounded" imageURL={user.avatar_url} />
                  <Text className="ml-2">{user.name}</Text>
                </a>
                {/*  eslint-enable */}
                <Dropdown.Menu>
                  <Dropdown.Item to="/auth/out">Sign out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Site.Header>
          <div
            id="headerMenuCollapse"
            className="header collapse d-lg-flex p-0"
            style={{ backgroundColor: '#FFF' }}
          >
            <Container>
              {/* Site navigation */}
              <Nav tabbed className="border-0">
                <Nav.Item icon="home" to="/dashboard">
                  Home
                </Nav.Item>
                <Nav.Item icon="search" to="/search">
                  Search
                </Nav.Item>
              </Nav>
            </Container>
          </div>
          {children}
        </Page.Main>
      </Page>
    </body>
  </html>
)

Session.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.node.isRequired
}

module.exports = Session
