'use strict'

module.exports = async function (fastify, opts) {
  const {
    BOAT_SERVICE_PORT,
    BRAND_SERVICE_PORT
  } = process.env

  fastify.get('/', async function (request, reply) {
    console.log(BOAT_SERVICE_PORT, BRAND_SERVICE_PORT)
    reply.send({
      BOAT_SERVICE_PORT, BRAND_SERVICE_PORT
    })
  })
}
