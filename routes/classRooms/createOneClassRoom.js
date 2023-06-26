export default async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/classRoom',
    schema: schema,
    handler: handler
  })

  async function handler (request, reply) {
    const { displayName } = request.body
    console.log(displayName)

    const classRoom = await fastify.prisma.classRoom.findUnique({
      where: {
        display_name: displayName
      }
    })

    if (classRoom) throw fastify.httpErrors.conflict('ClassRoom already exists')

    await fastify.prisma.classRoom.create({
      data: {
        display_name: displayName
      }
    })

    return { message: 'classRoom successfully created' }
  }
}

const documentation = {
  tags: ['ClassRooms'],
  summary: 'Create one classRoom',
  description: 'Create one classRoom'
}

const body = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    display_name: { type: 'string' },
    password: { type: 'string' }
  }
}

const response = {
  200: {
    type: 'object',
    description: 'Success Message',
    properties: {
      message: { type: 'string' }
    }
  },
  409: {
    type: 'object',
    description: 'Conflict Message',
    properties: {
      statusCode: { type: 'string' },
      error: { type: 'string' },
      message: { type: 'string' }
    }
  }
}

const schema = { ...documentation, response, body }
