const dotenv = require('dotenv')
const { readFileSync } = require('fs')

// load env variables
dotenv.config()

// re-assign port for PaaS environments
if (!process.env.DEPENDENCIES_APP_PORT && process.env.PORT) {
  process.env.DEPENDENCIES_APP_PORT = process.env.PORT
}

// correct private key format
if (process.env.GITHUB_PRIVATE_KEY) {
  process.env.GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n')
}

// load private key file into env
if (process.env.GITHUB_PRIVATE_KEY_PATH && !process.env.GITHUB_PRIVATE_KEY) {
  process.env.GITHUB_PRIVATE_KEY = readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, 'utf8')
}
