export default async function (fastify) {
  fastify.route({
    method: 'DELETE',
    url: '/publications/:publicationId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const publicationId = request.params.publicationId
    const { role } = fastify.jwt.decode(request.cookies.token)
    const { userId } = request.body

    const publicationToDelete = await fastify.prisma.publication.findUnique({
      where: {
        id: publicationId
      },
      include: {
        userOnClassRoom: true
      }
    })

    if (!publicationToDelete) throw fastify.httpErrors.notFound('Publication not found')

    if (publicationToDelete.userOnClassRoom.id === userId || role === 'admin') {
      const deleteComments = fastify.prisma.comment.deleteMany({
        where: {
          publication_id: publicationId
        }
      })

      const deletePublications = fastify.prisma.publication.delete({
        where: {
          id: publicationId
        }
      })

      await fastify.prisma.$transaction([deleteComments, deletePublications])

      return { message: 'Publication successfully deleted' }
    } else {
      throw fastify.httpErrors.unauthorized('The user is not authorized to delete this publication')
    }
  }
}

const documentation = {
  tags: ['Publications'],
  summary: 'Delete a publication',
  description: 'Delete a publication'
}

const params = {
  type: 'object',
  properties: {
    publicationId: { type: 'number' }
  }
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

const schema = { ...documentation, response, params }
