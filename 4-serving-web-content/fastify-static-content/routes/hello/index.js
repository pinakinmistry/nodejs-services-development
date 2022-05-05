module.exports = async (fastify, opt) => {
  fastify.get('/', (request, reply) => {
    reply.sendFile('hello.html')
  })
}