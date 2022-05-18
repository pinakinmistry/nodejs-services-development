'use strict'

const model = require('../../model')

module.exports = async function (fastify, opts) {
  fastify.get('/:id', function (request, reply) {
    model.boat.read(request.params.id, (err, result) => {
      console.log(request.params, result)
      if (err) {
        if (err.message === 'not found') {
          reply.notFound()
        } else reply.send(err)
      }
      reply.send(result)
    })
  })
}
