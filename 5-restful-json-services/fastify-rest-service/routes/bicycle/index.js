'use strict'

const { bicycle } = require('../../model')
const { promisify } = require('util')
const read = promisify(bicycle.read)

module.exports = async (fastify, opt) => {
  const { notFound } = fastify.httpErrors
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params
    try {
      return await read(id)
    } catch(err) {
      if (err.message === 'not found') throw notFound()
      else throw err
    }
  })
}