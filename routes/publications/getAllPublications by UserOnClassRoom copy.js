export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/publications/userOnClassRoom/:useronclassroomId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const requestUserOnclassRoomId = request.params.useronclassroomId
    const allPublication = await fastify.prisma.publication.findMany({
      where: {
        userOnClassroom_Id: requestUserOnclassRoomId
      },
      orderBy: [
        { id: 'desc' }
      ],
      include: {
        userOnClassRoom: {
          select: {
            user:
            {
              select:
              {
                id: true,
                display_name: true
              }
            },
            classroom:
            {
              select:
              {
                id: true,
                display_name: true
              }
            }
          }
        },
        _count: {
          select: { comment: true }
        }
      }
    })

    if (!(allPublication.length > 0)) throw fastify.httpErrors.notFound('Publication not found')

    return allPublication
  }
}

const documentation = {
  tags: ['Publications'],
  summary: 'Get all publications by userOnClassRoom',
  description: 'Get all publications by userOnClassRoom'
}

const params = {
  type: 'object',
  properties: {
    useronclassroomId: {
      type: 'number',
      description: 'Enter userOnClassRoom id'
    }
  }
}

const response = {
  200: {
    type: 'array',
    properties: {
      id: { type: 'number' },
      title: { type: 'string' },
      content: { type: 'string' },
      image_url: { type: 'string' },
      userOnClassroom_Id: { type: 'number' },
      date_creation: { type: 'string' },
      date_update: { type: 'string' },
      userOnClassRoom: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              display_name: { type: 'string' }
            }
          },
          classroom: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              display_name: { type: 'string' }
            }
          }
        }
      }
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

const schema = { ...documentation, response, params }
