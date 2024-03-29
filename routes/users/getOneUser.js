export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/users/:userId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const requestUserId = request.params.userId
    const user = await fastify.prisma.user.findUnique({
      where: {
        id: requestUserId
      }
    })

    if (!user) throw fastify.httpErrors.notFound('User not found')

    return {
      id: user.id,
      display_name: user.display_name,
      email: user.email,
      profileImageUrl: user.profile_image_url,
      role: user.role
    }
  }
}

const documentation = {
  tags: ['Users'],
  summary: 'Get one users',
  description: 'Get one users'
}

const response = {
  200: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      display_name: { type: 'string' },
      email: { type: 'string' },
      profileImageUrl: { type: 'string' },
      role: { type: 'string' }
    }
  },
  404: {
    type: 'object',
    description: 'Not Found Message',
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
