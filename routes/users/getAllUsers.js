export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/users',
    schema: schema,
    // preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler () {
    const users = await fastify.prisma.user.findMany()

    return users
  }
}

const documentation = {
  tags: ['Users'],
  summary: 'Get all users',
  description: 'Get all users'
}

const response = {
  200: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        display_name: { type: 'string' },
        email: { type: 'string' },
        // password: { type: 'string' },
        profile_image_url: { type: 'string' }
        // role: { type: 'string' },
        // date_creation: { type: 'string' },
        // date_update: { type: 'string' }
      }
    }
  }
}

const schema = { ...documentation, response }
