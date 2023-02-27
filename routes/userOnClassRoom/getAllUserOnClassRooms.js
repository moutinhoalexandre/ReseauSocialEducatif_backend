export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/userOnClassRooms',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler () {
    const userOnClassRoom = await fastify.prisma.userOnClassRoom.findMany({
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

    return userOnClassRoom
  }
}

const documentation = {
  tags: ['UserOnClassRooms'],
  summary: 'Get all userOnClassRooms',
  description: 'Get all userOnClassRooms'
}

const response = {
  200: {
    type: 'array'
  }
}

const schema = { ...documentation, response }
