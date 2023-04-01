import passwordValidator from 'password-validator'

export default async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/user/password/:userId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request, reply) {
    const requestUserId = Number(request.params.userId)
    const { role, id } = fastify.jwt.decode(request.cookies.token)
    const { newPassword, oldPassword } = request.body

    if (role === 'admin' || id === requestUserId) {
      const now = Date.now()
      const updateDate = new Date(now)

      if (!newPassword || !oldPassword) throw fastify.httpErrors.badRequest('Missing new password or old pswword')

      const user = await fastify.prisma.user.findUnique({
        where: {
          id: requestUserId
        }
      })

      if (!user) throw fastify.httpErrors.notFound('User not found')

      if (user.password !== oldPassword) throw fastify.httpErrors.unauthorized('You are not authorized to update this User password')

      // eslint-disable-next-line new-cap
      const schema = new passwordValidator()
      schema
        .is().min(8) // min 8 caractères
        .has().digits(1) // min 1 chiffre
        .has().uppercase(1) // min 1 caractère majuscule
        .has().lowercase(1) // min 1 caractère minuscule
        .has().symbols(1) // min 1 symbole
        .has().not().spaces() // ne doit pas contenir d'espace

      if (!schema.validate(newPassword)) throw fastify.httpErrors.badRequest("Mot de passe pas assez sécurisé, il doit contenir au moins 8 caractères, un chiffre, une majuscule, une minuscule, un symbole et ne pas contenir d'espace !")

      await fastify.prisma.user.update({
        where: {
          id: requestUserId
        },
        data: {
          password: newPassword,
          date_update: updateDate
        }
      })

      return { message: 'Password successfully updated' }
    } else {
      throw fastify.httpErrors.unauthorized('You are not authorized to update this User password')
    }
  }
}

const documentation = {
  tags: ['Users'],
  summary: 'Create one user',
  description: 'Create one user'
}

const response = {
  400: {
    type: 'object',
    description: 'No data',
    properties: {
      statusCode: { type: 'string' },
      error: { type: 'string' },
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

const schema = { ...documentation, response }
