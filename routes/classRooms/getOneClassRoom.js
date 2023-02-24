export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/classRooms/:classroomId',
    schema: schema,
    // preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const requestClassRoomId = request.params.classroomId

    if (requestClassRoomId === ':classroomId') throw fastify.httpErrors.forbidden('Please enter classRoom Id')

    const classRoom = await fastify.prisma.classRoom.findUnique({
      where: {
        id: Number(requestClassRoomId)
      }
    })

    if (!classRoom) throw fastify.httpErrors.notFound('User not found')

    return {
      id: classRoom.id,
      display_name: classRoom.display_name
    }
  }
}

const documentation = {
  tags: ['ClassRooms'],
  summary: 'Get one classRooms',
  description: 'Get one classRooms'
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
  },
  403: {
    type: 'object',
    description: 'Forbidden Message',
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
