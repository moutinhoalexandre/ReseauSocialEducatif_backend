export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/users/:userId',
    schema: schema,
    // preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request, reply) {
    const requestUserId = request.params.userId

    const user = await fastify.prisma.user.findUnique({
      where: {
        id: requestUserId
      }
    })

    if (!user) throw fastify.httpErrors.notfound('User not found')

    return {
      id: user.id,
      display_name: user.display_name,
      email: user.email,
      profile_image_url: user.profile_image_url
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
      profile_image_url: { type: 'string' }
    }
  }
}

const params = {
  type: 'object',
  properties: {
    userId: {
      type: 'number',
      description: 'user id'
    }
  }
}

const schema = { ...documentation, response, params }
