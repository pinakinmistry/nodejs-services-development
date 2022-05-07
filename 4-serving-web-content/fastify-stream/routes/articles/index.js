'use strict'

const hnStream = require('hn-latest-stream')

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const { type = 'html', amount = 250 } = request.query
    type === 'html' ? reply.type('text/html') : reply.type('application/json')
    return hnStream(amount, type)
  })
}