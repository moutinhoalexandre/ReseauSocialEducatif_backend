import fp from 'fastify-plugin'
import Prisma from '@prisma/client'
const { PrismaClient } = Prisma

export default fp(async (fastify, opts) => {
  const prisma = new PrismaClient()
  await prisma.$connect()

  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async (fastify) => {
    await fastify.prisma.$disconnect()
  })
})
