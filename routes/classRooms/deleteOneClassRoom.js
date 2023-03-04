export default async function (fastify) {
  fastify.route({
    method: 'DELETE',
    url: '/classRooms/:classroomId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const requestClassRoomId = request.params.classroomId

    const { role } = fastify.jwt.decode(request.cookies.token)

    if (role === 'admin') {
      const classRoom = await fastify.prisma.classRoom.findUnique({
        where: {
          id: requestClassRoomId
        }
      })

      if (!classRoom) throw fastify.httpErrors.notFound('ClassRoom not found')

      await fastify.prisma.classRoom.delete({
        where: {
          id: requestClassRoomId
        }
      })

      return { message: 'ClassRoom successfully deleted' }
    } else {
      throw fastify.httpErrors.unauthorized('You are not authorized to delete this ClassRoom')
    }
  }
}

const documentation = {
  tags: ['ClassRooms'],
  summary: 'Delete one classRoom',
  description: 'Delete one classRoom'
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
    classroomId: {
      type: 'number',
      description: 'Enter user id'
    }
  }
}

const schema = { ...documentation, response, params }
