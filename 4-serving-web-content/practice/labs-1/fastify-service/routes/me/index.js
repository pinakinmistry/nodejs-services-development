'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return reply.view('me.hbs', { title: 'Using point-of-view and handlebars' })
  })
}
