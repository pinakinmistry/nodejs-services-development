'use strict'

const { boat } = require('../../model')
const { promisify } = require('util')
const read = promisify(boat.read)
const create = promisify(boat.create)

module.exports = async function (fastify, opts) {
  const {notFound} = fastify.httpErrors
  fastify.get('/:id', async function (request, reply) {
    const { id } = request.params
    try {
      const result = await read(id)
      reply.send(result)
    } catch(err) {
      if (err.message === 'not found') throw notFound()
      else throw err
    }
  })

  fastify.post('/', async function (request, reply) {
    const { data } = request.body
    const id = boat.uid()
    try {
      await create(id, data)
      reply.status(201)
      reply.send({id})
    } catch (err) {
      throw err
    }
  })
}
