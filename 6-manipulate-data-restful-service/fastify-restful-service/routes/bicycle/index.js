'use strict'

const { promisify } = require('util')
const { bicycle } = require('../../model')
const { uid } = bicycle
const read = promisify(bicycle.read)

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
}
