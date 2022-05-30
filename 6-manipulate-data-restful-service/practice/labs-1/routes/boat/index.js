'use strict'

const { boat } = require('../../model')
const { promisify } = require('util')
const read = promisify(boat.read)

module.exports = async function (fastify, opts) {
  const {notFound} = fastify.httpErrors
  fastify.get('/:id', async function (request, reply) {
    const { id } = request.params
    try {
      const result = await read(id)
      reply.status(201)
      reply.send(result)
    } catch(err) {
      if (err.message === 'not found') throw notFound()
      else throw err
    }
  })
}
