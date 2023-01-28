import fp from 'fastify-plugin'
import fastifyJWT from '@fastify/jwt'

export default fp(async function (fastify, opts) {
  fastify.register(fastifyJWT, {
    secret: fastify.config.JWT_SECRET_KEY,
    cookie: {
      cookieName: 'token',
      signed: false
    }
  })

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
})
