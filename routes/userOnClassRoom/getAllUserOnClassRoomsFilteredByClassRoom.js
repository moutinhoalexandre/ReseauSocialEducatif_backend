export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/userOnClassRooms/classRoom/:classroomId',
    schema: schema,
    // preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const requestClassRoomId = request.params.classroomId

    const userOnClassRoom = await fastify.prisma.userOnClassRoom.findMany({
      where: {
        classroomId: Number(requestClassRoomId)
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true
          }
        },
        classroom: {
          select: {
            id: true,
            display_name: true
          }
        }
      }
    }
    )

    if (userOnClassRoom.length > 0) {
      return userOnClassRoom
    } else {
      throw fastify.httpErrors.notFound('ClassRoom not found')
    }
  }
}

const documentation = {
  tags: ['UserOnClassRooms'],
  summary: 'Get all userOnClassRooms filtered by classRoom',
  description: 'Get all userOnClassRooms filtered by classRoom'
}

const response = {
  200: {
    type: 'array'
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
