const { get } = require('https')

const pkg = require('../package.json')

const defaultOptions = {
  method: 'GET'
}

const defaultHeaders = {
  'User-Agent': `${pkg.name}@${pkg.version}`
}

const request = function (options) {
  // setup options
  const opts = Object.assign({}, defaultOptions, options)

  // setup headers
  opts.headers = (options && options.headers) ? Object.assign({}, defaultHeaders, options.headers || {}) : defaultHeaders

  return new Promise((resolve, reject) => {
    const request = get(opts)

    request.on('response', response => {
      const { statusCode } = response
      const contentType = response.headers['content-type']

      let error

      // simple error handler
      if (statusCode !== 200) {
        error = new Error(`Request Failed with Status Code: ${statusCode}`)
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type Expected application/json but received ${contentType}`)
      }

      if (error) {
        // consume response data to free up memory
        response.resume()
        reject(error)
        return
      }

      const chunks = []

      response.on('data', chunk => chunks.push(chunk))

      response.on('end', () => {
        const raw = Buffer.concat(chunks)

        try {
          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            headers: response.headers,
            body: JSON.parse(raw)
          })
        } catch (error) {
          reject(error)
        }
      })
    })

    request.on('error', reject)

    request.end()
  })
}

const iterator = function (options, paginate) {
  return {
    [Symbol.asyncIterator]: () => ({
      next () {
        if (options === false) return Promise.resolve({ done: true })

        return request(options).then(response => {
          // set the next iteration
          options = paginate(response, options)

          return { value: response }
        })
      }
    })
  }
}

exports.request = request
exports.iterator = iterator
