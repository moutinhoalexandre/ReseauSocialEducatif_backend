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

    const classRoom = await fastify.prisma.classRoom.findUnique({
      where: {
        id: requestClassRoomId
      }
    })

    if (!classRoom) throw fastify.httpErrors.notFound('ClassRoom not found')

    return classRoom
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
    properties: {
      id: { type: 'number' },
      display_name: { type: 'string' },
      date_creation: { type: 'string' },
      date_update: { type: 'string' }
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
    classroomId: {
      type: 'number',
      description: 'Enter classRoom id'
    }
  }
}

const schema = { ...documentation, response, params }
