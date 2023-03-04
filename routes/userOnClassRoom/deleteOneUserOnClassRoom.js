export default async function (fastify) {
  fastify.route({
    method: 'DELETE',
    url: '/userOnClassRoom/:useronclassroomId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const requestUserOnClassRoomId = request.params.useronclassroomId

    const { role } = fastify.jwt.decode(request.cookies.token)

    if (role === 'admin') {
      const classRoom = await fastify.prisma.userOnClassRoom.findUnique({
        where: {
          id: requestUserOnClassRoomId
        }
      })

      if (!classRoom) throw fastify.httpErrors.notFound('UserOnClassRoom not found')

      await fastify.prisma.classRoom.delete({
        where: {
          id: requestUserOnClassRoomId
        }
      })

      return { message: 'ClassRoom successfully deleted' }
    } else {
      throw fastify.httpErrors.unauthorized('You are not authorized to delete this ClassRoom')
    }
  }
}

const documentation = {
  tags: ['UserOnClassRooms'],
  summary: 'Delete one UserOnClassRoom',
  description: 'Delete one UserOnClassRoom'
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
    useronclassroomId: {
      type: 'number',
      description: 'Enter user id'
    }
  }
}

const schema = { ...documentation, response, params }
