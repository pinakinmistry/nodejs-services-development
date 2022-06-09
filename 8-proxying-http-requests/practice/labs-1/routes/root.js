'use strict'

module.exports = async function (fastify, opts) {
  const {badRequest} = fastify.httpErrors

  fastify.get('/', async function (request, reply) {
    const {url} = request.query

    try {
      new URL(url)
    } catch (err) {
      throw badRequest()
    }
    return reply.from(url)
  })
}
