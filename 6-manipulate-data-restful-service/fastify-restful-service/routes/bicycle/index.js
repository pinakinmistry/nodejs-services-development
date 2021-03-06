'use strict'

const { promisify } = require('util')
const { bicycle } = require('../../model')
const { uid } = bicycle
const read = promisify(bicycle.read)
const create = promisify(bicycle.create)
const update = promisify(bicycle.update)
const del = promisify(bicycle.del)

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

  fastify.post('/:id/update', async function (request, reply) {
    const { id } = request.params
    const { data } = request.body
    try {
      await update(id, data)
      reply.code(204)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })

  fastify.put('/:id', async function (request, reply) {
    const { id } = request.params
    const { data } = request.body
    try {
      await update(id, data)
      reply.code(204)
    } catch (err) {
      if (err.message === 'not found') {
        await create(id, data)
        reply.code(201)
        return {}
      } else throw err
    }
  })

  fastify.delete('/:id', async function (request, reply) {
    const { id } = request.params
    try {
      await del(id)
      reply.code(204)
    } catch (err) {
      if (err.message === 'not found') return notFound()
      else throw err
    }
  })

}
