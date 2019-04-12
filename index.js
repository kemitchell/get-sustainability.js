var assert = require('assert')
var http = require('http')
var https = require('https')
var runParallelLimit = require('run-parallel-limit')
var schema = require('sustainability-schema')
var tv4 = require('tv4')
var url = require('url')

var schemas = {
  project: schema.definitions.project,
  contributor: schema.definitions.contributor
}

module.exports = function (options, callback) {
  // Validate arguments.
  assert.strictEqual(typeof callback, 'function', 'callback argument must be a function')
  assert.strictEqual(typeof options, 'object', 'options argument must be an object')
  var uri = options.uri
  assert.strictEqual(typeof uri, 'string', 'uri option must be a string')
  var limit = options.limit || 5
  assert.strictEqual(typeof limit, 'number', 'limit option must be a number')
  assert(Number.isInteger(limit), 'limit option must be an integer')
  assert(limit > 0, 'limit options must be greater than 0')

  get({
    uri: uri,
    schemaName: 'project'
  }, function (error, project) {
    if (error) return callback(error)
    // The `contributors` array may contain references to endpoints for
    // data on particular contributors.  Map the unresolved
    // `contributors` array, fetching referenced resources.
    runParallelLimit(
      project.contributors.map(function (element) {
        return function (done) {
          if (element.hasOwnProperty('name')) {
            return done(null, element)
          }
          get({
            uri: element.uri,
            schemaName: 'contributor'
          }, done)
        }
      }),
      limit,
      function (error, resolvedContributors) {
        if (error) return callback(error)
        // Replace the unresolved `contributors` array with the newly
        // resolved `contributors` array.
        project.contributors = resolvedContributors
        callback(null, project)
      }
    )
  })
}

function get (options, callback) {
  assert.strictEqual(typeof callback, 'function', 'callback argument must be a function')
  assert.strictEqual(typeof options, 'object', 'options argument must be an object')
  var uri = options.uri
  assert.strictEqual(typeof uri, 'string', 'uri option must be a string')
  var schemaName = options.schemaName
  assert.strictEqual(typeof schemaName, 'string', 'schemaName option must be a string')
  assert(schemas.hasOwnProperty(schemaName), 'schemaName must be known schema')

  // Ensure that we support the URI's protocol.
  var parsed = url.parse(uri)
  var protocol = parsed.protocol
  var client
  if (protocol === 'https:') client = https
  else if (protocol === 'http:') client = http
  else {
    return callback(new Error('unsupported protocol: ' + protocol))
  }

  // Get the resource.
  client.get(uri, function (response) {
    var statusCode = response.statusCode
    if (statusCode !== 200) {
      return callback(new Error(uri + ' responsed ' + statusCode))
    }
    var chunks = []
    response
      .on('data', function (chunk) {
        chunks.push(chunk)
      })
      .once('error', function (error) {
        return callback(error)
      })
      .once('end', function () {
        var body = Buffer.concat(chunks)
        var data
        try {
          data = JSON.parse(body)
        } catch (error) {
          return callback(error)
        }
        // Validate the resource.
        if (!tv4.validate(data, schemas[schemaName])) {
          return callback(new Error('invalid ' + schemaName + ' object'))
        }
        return callback(null, data)
      })
  })
}
