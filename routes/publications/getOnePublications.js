export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/publications/:publicationId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const requestpublicationId = request.params.publicationId
    const onePublication = await fastify.prisma.publication.findUnique({
      where: {
        id: requestpublicationId
      },
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

    if (!onePublication) throw fastify.httpErrors.notFound('Publication not found')

    return onePublication
  }
}

const documentation = {
  tags: ['Publications'],
  summary: 'Get one publication',
  description: 'Get one publication'
}

const params = {
  type: 'object',
  properties: {
    publicationId: {
      type: 'number',
      description: 'Enter publication id'
    }
  }
}

const response = {
  200: {
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
