'use strict'

const { promisify } = require('util')
const { bicycle } = require('../../model')
const { uid } = bicycle
const read = promisify(bicycle.read)
const create = promisify(bicycle.create)
const update = promisify(bicycle.update)
const del = promisify(bicycle.del)

module.exports = async (fastify, opts) => {
  const { notFound } = fastify.httpErrors
  const idSchema = {
    type: 'integer'
  }
  const paramsSchema = {
    id: idSchema
  }
  const dataSchema = {
    type: 'object',
    required: ['brand', 'color'],
    additionalProperties: false,
    properties: {
      brand: {
        type: 'string',
      },
      color: {
        type: 'string'
      }
    }
  }
  const bodySchema = {
    type: 'object',
    required: ['data'],
    additionalProperties: false,
    properties: {
      data: dataSchema
    }
  }

  fastify.post('/', {
    schema: {
      body: bodySchema,
      response: {
        201: idSchema
      }
    }
  }, async (request, reply) => {
    const { data } = request.body
    const id = uid()
    await create(id, data)
    reply.code(201)
    return { id }
  })

  fastify.post('/:id/update', {
    schema: {
      params: paramsSchema,
      body: bodySchema
    }
  }, async (request, reply) => {
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

  fastify.get('/:id', {
    schema: {
      params: paramsSchema,
      response: {
        data: dataSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    try {
      return await read(id)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })

  fastify.put('/:id', {
    schema: {
      params: paramsSchema,
      body: bodySchema
    }
  }, async (request, reply) => {
    const { id } = request.params
    const { data } = request.body
    try {
      await create(id, data)
      reply.code(201)
      return { }
    } catch (err) {
      if (err.message === 'resource exists') {
        await update(id, data)
        reply.code(204)
      } else {
        throw err
      }
    }
  })

  fastify.delete('/:id', {
    schema: {
      params: paramsSchema
    }
  }, async (request, reply) => {
    const { id } = request.params
    try {
      await del(id)
      reply.code(204)
    } catch (err) {
      if (err.message === 'not found') throw notFound()
      throw err
    }
  })

}