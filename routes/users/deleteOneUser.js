export default async function (fastify) {
  fastify.route({
    method: 'DELETE',
    url: '/users/:userId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const requestUserId = request.params.userId
    const { role } = fastify.jwt.decode(request.cookies.token)

    if (role === 'admin') {
      const user = await fastify.prisma.user.findUnique({
        where: {
          id: requestUserId
        }
      })

      if (!user) throw fastify.httpErrors.notFound('User not found')

      const deleteUser = fastify.prisma.user.delete({
        where: {
          id: requestUserId
        }
      })

      await fastify.prisma.$transaction([deleteUser])

      return { message: 'User successfully deleted' }
    } else {
      throw fastify.httpErrors.unauthorized('You are not authorized to delete this User')
    }
  }
}

const documentation = {
  tags: ['Users'],
  summary: 'Delete one user',
  description: 'Delete one user'
}

const response = {
  200: {
    type: 'object',
    description: 'Success Message',
    properties: {
      message: { type: 'string' }
    }
  },
  401: {
    type: 'object',
    description: 'Unauthorized Message',
    properties: {
      statusCode: { type: 'string' },
      error: { type: 'string' },
      message: { type: 'string' }
    }
  }
}

const params = {
  type: 'object',
  properties: {
    userId: {
      type: 'number',
      description: 'Enter user id'
    }
  }
}

const schema = { ...documentation, response, params }
