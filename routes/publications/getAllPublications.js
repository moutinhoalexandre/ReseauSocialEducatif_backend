export default async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/publications',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler () {
    const allPublication = await fastify.prisma.publication.findMany({
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

    return allPublication
  }
}

const documentation = {
  tags: ['Publications'],
  summary: 'Get all publications',
  description: 'Get all publications'
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
  }
}

const schema = { ...documentation, response }
