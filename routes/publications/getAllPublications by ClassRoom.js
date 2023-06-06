export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/publications/classroom/:classroomId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const requestClassRoomId = parseInt(request.params.classroomId)
    const allPublication = await fastify.prisma.publication.findMany({
      where: {
        userOnClassRoom: {
          classroomId: requestClassRoomId
        }
      },
      orderBy: { id: 'desc' },
      include: {
        userOnClassRoom: {
          select: {
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
        },
        _count: {
          select: { comment: true }
        }
      }
    })

    if (allPublication.length === 0) {
      throw fastify.httpErrors.notFound('Publication not found')
    }

    return allPublication
  }
}

const documentation = {
  tags: ['Publications'],
  summary: 'Get all publications by ClassRoom',
  description: 'Get all publications by ClassRoom'
}

const params = {
  type: 'object',
  properties: {
    classroomId: {
      type: 'number',
      description: 'Enter ClassRoom id'
    }
  }
}

const response = {
  200: {
    type: 'array',
    items: {
      type: 'object',
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
