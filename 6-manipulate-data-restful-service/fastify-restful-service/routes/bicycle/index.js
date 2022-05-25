'use strict'

const { promisify } = require('util')
const { bicycle } = require('../../model')
const { uid } = bicycle
const read = promisify(bicycle.read)
const create = promisify(bicycle.create)

module.exports = async function (fastify, opts) {
  const { notFound } = fastify.httpErrors
  fastify.get('/:id', async function (request, reply) {
    const { id } = request.params
    try {
      return await read(id)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })

  fastify.post('/', async function (request, reply) {
    const id = uid()
    const { data } = request.body
    console.log(data)
    await create(id, data)
    reply.code(201)
    return { id }
  })

}
