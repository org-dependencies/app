const fragments = {
  data: `
    fragment data on Repository {
      id
      url
      full_name: nameWithOwner
      private: isPrivate
      language: primaryLanguage {
        name
      }
      package: object(expression: "HEAD:package.json") {
        ... on Blob {
          content: text
        }
      }
    }`,

  connection: `
    fragment connection on RepositoryConnection {
      edges {
        node {
          ...data
        }
      }
    }`
}

exports.repository = `
  ${fragments.data} query ($owner: String! $name: String!) {
    repository(owner: $owner, name: $name) {
      ...data
    }
  }`

exports.repositories = {
  user: `
    ${fragments.connection} ${fragments.data} query ($login: String! $endCursor: String) {
      source: user(login: $login) {
        repositories(first: 100 after: $endCursor) {
          ...connection
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }`,

  org: `
    ${fragments.connection} ${fragments.data} query ($login: String! $endCursor: String) {
      source: organization(login: $login) {
        repositories(first: 100 after: $endCursor) {
          ...connection
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }`
}
