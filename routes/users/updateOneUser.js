export default async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/user/:userId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request, reply) {
    const requestUserId = Number(request.params.userId)
    const { role, id } = fastify.jwt.decode(request.cookies.token)
    const { displayName, email } = request.body

    if (role === 'admin' || id === requestUserId) {
      const now = Date.now()
      const updateDate = new Date(now)

      const data = {}
      data.date_update = updateDate
      if (displayName) { data.display_name = displayName }
      if (email) { data.email = email }

      if (!displayName && !email) throw fastify.httpErrors.badRequest('Any data to update')

      const user = await fastify.prisma.user.findUnique({
        where: {
          id: requestUserId
        }
      })

      if (!user) throw fastify.httpErrors.notFound('User not found')

      await fastify.prisma.user.update({
        where: {
          id: requestUserId
        },
        data
      })

      return { message: 'User successfully updated' }
    } else {
      throw fastify.httpErrors.unauthorized('You are not authorized to update this User')
    }
  }
}

const documentation = {
  tags: ['Users'],
  summary: 'Create one user',
  description: 'Create one user'
}

const response = {
  400: {
    type: 'object',
    description: 'No data',
    properties: {
      statusCode: { type: 'string' },
      error: { type: 'string' },
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

const schema = { ...documentation, response }
