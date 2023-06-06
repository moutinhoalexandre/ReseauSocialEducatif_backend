export default async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/auth/login',
    schema: schema,
    handler: handler
  })

  async function handler (request, reply) {
    const { email, password } = request.body

    const user = await fastify.prisma.user.findUnique({
      where: {
        email: email
      }
    })

    if (!user) throw fastify.httpErrors.notFound('User not found')

    const token = await reply.jwtSign({ role: user.role, userId: user.id })
    const passwordCheck = await fastify.bcrypt.compare(password, user.password)

    if (!passwordCheck) throw fastify.httpErrors.unauthorized('Incorrect password')

    const returnedUser = {
      id: user.id,
      displayName: user.display_name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profile_image_url
    }

    const displayNameUser = {
      displayName: user.display_name
    }

    reply
      .setCookie('token', token, {
        domain: 'localhost',
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: true,
        maxAge: 60 * 60 * 24
      })
      .setCookie('connectedUser', JSON.stringify(returnedUser), {
        domain: 'localhost',
        path: '/',
        secure: true,
        httpOnly: false,
        sameSite: true,
        maxAge: 60 * 60 * 24
      })
      .code(200)
      .send(displayNameUser)
  }
}

const documentation = {
  tags: ['Authentification'],
  summary: 'Connect an user',
  description: 'Connect an user by adding http only jwt token cookie and connectedUser cookie'
}

const body = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  }
}

const response = {
  200: {
    type: 'object',
    description: 'Success Message',
    properties: {
      id: { type: 'number' },
      displayName: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
      profileImageUrl: { type: 'string' }
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

const schema = { ...documentation, body, response }
