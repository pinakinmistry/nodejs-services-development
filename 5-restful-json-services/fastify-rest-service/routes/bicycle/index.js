'use strict'

const { bicycle } = require('../../model')
const { promisify } = require('util')
const read = promisify(bicycle.read)

module.exports = async (fastify, opt) => {
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params
    try {
      return await read(id)
    } catch(err) {
      if (err.message === 'not found') reply.notFound()
      else reply.send(err)
    }
  })
}