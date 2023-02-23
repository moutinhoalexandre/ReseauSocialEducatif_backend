
// export default async function (fastify) {
//   fastify.route({
//     method: 'DELETE',
//     url: '/publications/:publicationId',
//     schema: schema,
//     preValidation: [fastify.authenticate],
//     handler: handler
//   })

//   async function handler (request) {
//     const publicationId = request.params.publicationId
//     const { userId, role } = fastify.jwt.decode(request.cookies.token)

//     const publicationToDelete = await fastify.prisma.publication.findUnique({
//       where: {
//         id: publicationId
//       },
//       include: {
//         user: true
//       }
//     })

//     if (publicationToDelete.user.id === userId || role === 'admin') {
//       const deleteComments = fastify.prisma.comment.deleteMany({
//         where: {
//           publication_id: publicationId
//         }
//       })

//       const deletePublications = fastify.prisma.publication.delete({
//         where: {
//           id: publicationId
//         }
//       })

//       await fastify.prisma.$transaction([deleteComments, deletePublications])

//       return { message: 'Publication successfully deleted' }
//     } else {
//       throw fastify.httpErrors.unauthorized('The user is not authorized to delete this publication')
//     }
//   }
// }

// const documentation = {
//   tags: ['Publications'],
//   summary: 'Delete a publication',
//   description: 'Delete a publication'
// }

// const params = {
//   type: 'object',
//   properties: {
//     publicationId: { type: 'number' }
//   }
// }

// const response = {
//   200: {
//     type: 'object',
//     properties: {
//       message: { type: 'string' }
//     }
//   },
//   401: {
//     type: 'object',
//     properties: {
//       statusCode: { type: 'string' },
//       error: { type: 'string' },
//       message: { type: 'string' }
//     }
//   }
// }

// const schema = { ...documentation, response, params }

export default async function (fastify) {
  fastify.route({
    method: 'DELETE',
    url: '/users/:userId',
    schema: schema,
    // preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const requestUserId = request.params.userId
    const { role } = fastify.jwt.decode(request.cookies.token)

    if (role === 'admin') {
      const deleteUser = fastify.prisma.publication.delete({
        where: {
          id: requestUserId
        }
      })

      if (!deleteUser) throw fastify.httpErrors.notfound('User not found')

      await fastify.prisma.$transaction(deleteUser)

      return { message: 'User successfully deleted' }
    } else {
      throw fastify.httpErrors.unauthorized('You are not authorized to delete this User')
    }
  }
}

const documentation = {
  tags: ['Users'],
  summary: 'Delete one user',
  description: 'Delete one user'
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
