const React = require('react')

const {
  Page, Container, Grid, Card, Form, Button, Text
} = require('tabler-react')
const Session = require('./layouts/session')

module.exports = () => (
  <Session>
    <Page>
      <Container>
        <Grid.Row>
          <Grid.Col className="mx-auto col-login">
            <Text className="header-brand mb-6" align="center">
              <img
                className="header-brand-img"
                src="https://raw.githubusercontent.com/OrgDependencies/brand/master/logo.png"
                alt=""
              />
              Org Dependencies
            </Text>
            <Card>
              <Card.Body className="p-6">
                <Card.Title>
                  <Text align="center">Get Started</Text>
                </Card.Title>
                <Form.Group>
                  <Button block RootComponent="a" href="/auth/in" color="success">
                    Sign in with GitHub
                  </Button>
                </Form.Group>
                <Form.Group>
                  <Button block href="/installations/new" RootComponent="a" color="primary">
                    Install Dependencies App
                  </Button>
                </Form.Group>
              </Card.Body>
            </Card>

            <Text align="center">
              Want to run Dependencies App on your own?{' '}
              <a href="/installations/new">find out how</a>
            </Text>
          </Grid.Col>
        </Grid.Row>
      </Container>
    </Page>
  </Session>
)
