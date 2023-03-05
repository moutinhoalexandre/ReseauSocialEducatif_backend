export default async function (fastify) {
  fastify.route({
    method: 'DELETE',
    url: '/comment/:commentId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const commentId = request.params.commentId
    const { role } = fastify.jwt.decode(request.cookies.token)
    const { userId } = request.body

    const commentToDelete = await fastify.prisma.comment.findUnique({
      where: {
        id: commentId
      },
      include: {
        userOnClassRoom: true
      }
    })

    if (!commentToDelete) throw fastify.httpErrors.notFound('Comment not found')

    if (commentToDelete.userOnClassRoom.id === userId || role === 'admin') {
      await fastify.prisma.comment.delete({
        where: {
          id: commentId
        }
      })

      return { message: 'Comment successfully deleted' }
    } else {
      throw fastify.httpErrors.unauthorized('The user is not authorized to delete this comment')
    }
  }
}

const documentation = {
  tags: ['Comments'],
  summary: 'Delete a comment',
  description: 'Delete a comment'
}

const params = {
  type: 'object',
  properties: {
    commentId: {
      type: 'number',
      description: 'Enter comment id'
    }
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
