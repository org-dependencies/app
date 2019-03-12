# Dependencies

[![License][license-image]][license-url] [![version][npm-image]][npm-url] [![Build Status][circle-image]][circle-url]

> Standarized project metadata to specify the components, constructs and authorship of software

## Usage

### 1. Install the app using `npm`

```shell
$ npm install --global @dependencies/app
```

### 2. Database

Dependencies App requires a PostgreSQL database instance, you can find the database initialization scheams under the [`database` folder](./database/)

### 3. GitHub App

Follow the [App Setup instructions](./docs/app.md) to create a GitHub App.

### 4. Environment Configuration

Follow the [Environment Setup instructions](./docs/environment.md) to configure your Dependencies App environment.

### 5. Launch

```shell
$ dependencies
```

## Local development

This is a similar setup as described under [usage](#usage), but with minor differences.

### Requirements

- Node 10 or higher
- npm 6 or higher
- Docker

### 1. Fork repository

1. Fork this repository and clone to your workstation
2. Install project dependencies using `npm install`

### 2. Database (docker)

Follow the README in [org-dependencies/docker](https://github.com/org-dependencies/docker) for database initialization using docker.

### 3. Set up application and environment

Follow the [GitHub app](#3-github-app) and [environment configuration](#4-environment-configuration) steps from the Usage instructions above.

### 4. Develop!

Start the application:

1. Run `docker-compose up db` in your clone of org-dependencies/docker
2. Run `npm run dev` in your clone of org-dependencies/app

Please use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.3/) as you develop, and then submit a 
pull request when you are ready for a code review.

---
> Website: [dependencies.org](https://dependencies.org) &bull; 
> Github: [@org-dependencies](https://github.com/org-dependencies) &bull; 
> Twitter: [@OrgDependencies](https://twitter.com/OrgDependencies)

[license-url]: LICENSE
[license-image]: https://img.shields.io/github/license/org-dependencies/app.svg?style=for-the-badge&logo=circleci

[circle-url]: https://circleci.com/gh/org-dependencies/workflows/app
[circle-image]: https://img.shields.io/circleci/project/github/org-dependencies/app/master.svg?style=for-the-badge&logo=circleci

[npm-url]: https://www.npmjs.com/package/@dependencies/app
[npm-image]: https://img.shields.io/npm/v/@dependencies/app.svg?style=for-the-badge&logo=npm
