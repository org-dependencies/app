# Dependencies

[![License][license-image]][license-url] [![version][npm-image]][npm-url] [![Build Status][circle-image]][circle-url]

> Standarized project metadata to specify the components, constructs and authorship of software

## Usage

#### 1. install the app using `npm`

```shell
$ npm install --global @dependencies/app
```

##### 2. Database

Dependencies App requires a PostgreSQL database instance, you can find the database initialization scheams under the [`database` folder](./database/)

#### 3. GitHub App

Follow the [App Setup instructions](./docs/app.md) to create a GitHub App.

##### 4. Environment Configuration

Follow the [Environment Setup instructions](./docs/environment.md) to configure your Dependencies App environment

##### 5. Launch

```shell
$ dependencies
```

---
> Website: [dependencies.org](https://dependencies.org) &bull; 
> Github: [@OrgDependencies](https://github.com/OrgDependencies) &bull; 
> Twitter: [@OrgDependencies](https://twitter.com/OrgDependencies)

[license-url]: LICENSE
[license-image]: https://img.shields.io/github/license/OrgDependencies/app.svg?style=for-the-badge&logo=circleci

[circle-url]: https://circleci.com/gh/OrgDependencies/workflows/app
[circle-image]: https://img.shields.io/circleci/project/github/OrgDependencies/app/master.svg?style=for-the-badge&logo=circleci

[npm-url]: https://www.npmjs.com/package/@dependencies/app
[npm-image]: https://img.shields.io/npm/v/@dependencies/app.svg?style=for-the-badge&logo=npm
