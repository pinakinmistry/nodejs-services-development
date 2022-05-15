'use strict'

const { bicycle } = require('../../model')
const { promisify } = require('util')
const read = promisify(bicycle.read)

module.exports = async (fastify, opt) => {
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params
    bicycle.read(id, (err, result) => {
      if (err) {
        if (err.message === 'not found') reply.notFound()
        else reply.send(err)
      } else reply.send(result)
    })
    await reply
  })
}