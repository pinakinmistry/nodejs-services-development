'use strict'

const got = require('got')

module.exports = async function (fastify, opts) {
  const {
    BOAT_SERVICE_PORT,
    BRAND_SERVICE_PORT
  } = process.env
  const {notFound, badRequest} = fastify.httpErrors

  fastify.get('/:id', async function (request, reply) {
    const {id} = request.params
    try {
      const boat = await got(`http://localhost:${BOAT_SERVICE_PORT}/${id}`).json()
      const brand = await got(`http://localhost:${BRAND_SERVICE_PORT}/${boat.brand}`).json()
      reply.send({
        id: boat.id,
        color: boat.color,
        brand: brand.name
      })
    } catch (err) {
      if (!err.response) throw err
      else if (err.response.statusCode === 404) throw notFound()
      else if (err.response.statusCode === 400) throw badRequest()
      else throw err
    }
  })
}
