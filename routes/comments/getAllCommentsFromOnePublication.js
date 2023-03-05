export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/comments/:publicationId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const allCommentsFromOnePublication = await fastify.prisma.comment.findMany({
      where: {
        publication_id: request.params.publicationId
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
        }
      }
    })

    return allCommentsFromOnePublication
  }
}

const documentation = {
  tags: ['Comments'],
  summary: 'Get all comments from one publication',
  description: 'Get all comments from one publication'
}

const params = {
  type: 'object',
  properties: {
    publicationId: { type: 'number' }
  }
}

const response = {
  200: {
    type: 'array',
    items: {
      properties: {
        id: { type: 'number' },
        content: { type: 'string' },
        publication_id: { type: 'number' },
        userOnClassroom_Id: { type: 'string' },
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
  }
}

const schema = { ...documentation, params, response }
