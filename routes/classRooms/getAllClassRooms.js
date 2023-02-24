export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/classRooms',
    schema: schema,
    // preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler () {
    const classRoom = await fastify.prisma.classRoom.findMany()

    return classRoom
  }
}

const documentation = {
  tags: ['ClassRooms'],
  summary: 'Get all classRooms',
  description: 'Get all classRooms'
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
        profile_image_url: { type: 'string' }
      }
    }
  }
}

const schema = { ...documentation, response }
