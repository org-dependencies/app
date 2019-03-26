const { join } = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const day = require('dayjs')
const express = require('express')
const relativeTime = require('dayjs/plugin/relativeTime')
const session = require('express-session')
const SessionStorage = require('connect-pg-simple')(session)

// import local dependencies
const { pool } = require('./lib/db/connection')
const auth = require('./routes/auth')
const dashboard = require('./routes/dashboard')
const log = require('./lib/log')
const passport = require('./lib/passport')

// routes
const org = require('./routes/org')
const search = require('./routes/search')
const webhooks = require('./routes/webhooks')

// initiate new express instance
const app = express()

// view helpers
day.extend(relativeTime)
app.locals.day = day

// configure app variables
app.set('view engine', 'jsx')
app.set('views', join(__dirname, 'views'))
app.engine('jsx', require('express-react-views').createEngine())

// assign common middlewares
// TODO add further performance middlewares
app.use(cookieParser())
app.use(bodyParser.json({ limit: '2mb' }))

// setup sessions
// TODO optimize session management
app.use(session({
  store: new SessionStorage({ pool }),
  secret: process.env.DEPENDENCIES_APP_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day
  secure: new URL(process.env.DEPENDENCIES_APP_LINK).protocol === 'https:'
}))

// assign passport middleware
app.use(passport.initialize())
app.use(passport.session())

// custom express logging
app.use(/^(?!\/assets).+/, (req, res, next) => {
  // queue the log to send as soon as the response is finished
  res.on('finish', () => log.info('%s:blue %s:gray %s:green', req.method, req.originalUrl, res.statusCode))
  next()
})

// assign static assets path
app.use('/assets', express.static(join(__dirname, 'assets')))

// assign user view variables
app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.path = req.path
  res.locals.require = require // this is not ideal

  next()
})

const checkLogin = (req, res, next) => {
  return req.user ? next() : res.redirect('/home')
}

// assign routes
app.use('/auth', auth)

app.get('/home', (req, res) => res.render('home'))

app.use('/dashboard', checkLogin, dashboard)

app.use('/search', checkLogin, search)

app.use('/:org', checkLogin, org)

app.get('/', (req, res) => res.redirect('/home'))

// listen to webhooks
app.post('/', webhooks)

module.exports = app
