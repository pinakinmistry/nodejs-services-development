'use strict'

const got = require('got')

module.exports = async function (fastify, opts) {
  const {
    BOAT_SERVICE_PORT,
    BRAND_SERVICE_PORT
  } = process.env

  fastify.get('/:id', async function (request, reply) {
    const {id} = request.params
    const boat = await got(`http://localhost:${BOAT_SERVICE_PORT}/${id}`).json()
    const brand = await got(`http://localhost:${BRAND_SERVICE_PORT}/${boat.brand}`).json()
    reply.send({
      id: boat.id,
      color: boat.color,
      brand: brand.name
    })
  })
}
