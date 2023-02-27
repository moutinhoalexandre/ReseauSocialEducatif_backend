export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/userOnClassRooms/user/:userId',
    schema: schema,
    // preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const requestUserId = request.params.userId

    const userOnClassRoom = await fastify.prisma.userOnClassRoom.findMany({
      where: {
        userId: requestUserId
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
      throw fastify.httpErrors.notFound('User not found')
    }
  }
}

const documentation = {
  tags: ['UserOnClassRooms'],
  summary: 'Get all userOnClassRooms filtered by user',
  description: 'Get all userOnClassRooms filtered by user'
}

const response = {
  200: {
    type: 'array'
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
