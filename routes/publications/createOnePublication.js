export default async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/publications',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const { title, content, userId } = request.body

    await fastify.prisma.publication.create({
      data: {
        title: title,
        content: content,
        userOnClassroom_Id: userId
      }
    })

    return { message: 'Publication successfully created' }
  }
}

const documentation = {
  tags: ['Publications'],
  summary: 'Create a publication',
  description: 'Create a publication'
}

const body = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    content: { type: 'string' },
    userId: { type: 'number' }
  }
}

const response = {
  200: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  }
}

const schema = { ...documentation, body, response }
