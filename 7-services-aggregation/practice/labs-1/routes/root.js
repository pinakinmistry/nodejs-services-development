'use strict'

const got = require('got')

module.exports = async function (fastify, opts) {
  const {
    BOAT_SERVICE_PORT,
    BRAND_SERVICE_PORT
  } = process.env
  const {notFound, badRequest} = fastify.httpErrors
  const gotConfig = reply => ({
    timeout: 1250,
    hooks: {
      beforeRetry: [
        () => {
          console.log('$$$$$$$$ Retrying')
          // Either throw or reply:
          // throw Error()
          // or
          reply.status(500)
          reply.send()
        }
      ]
    }
  })

  fastify.get('/:id', async function (request, reply) {
    const {id} = request.params
    try {
      const boat = await got(`http://localhost:${BOAT_SERVICE_PORT}/${id}`, gotConfig(reply)).json()
      const brand = await got(`http://localhost:${BRAND_SERVICE_PORT}/${boat.brand}`, gotConfig(reply)).json()
      reply.send({
        id: boat.id,
        color: boat.color,
        brand: brand.name
      })
    } catch (err) {
      if (!err.response) throw err
      if (err.response.statusCode === 404) {
        throw notFound()
      }
      if (err.response.statusCode === 400) {
        throw badRequest()
      }
      throw err
    }
  })
}
