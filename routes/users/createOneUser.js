export default async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/user',
    schema: schema,
    handler: handler
  })

  async function handler (request, reply) {
    const { email, display_name: displayName, password } = request.body

    const hash = await fastify.bcrypt.hash(password)

    const newUser = await fastify.prisma.user.create({
      data: {
        email: email,
        display_name: displayName,
        password: hash
      }
    })

    const returnedUser = {
      id: newUser.id,
      displayName: newUser.display_name,
      email: newUser.email,
      role: newUser.role,
      profileImageUrl: newUser.profile_image_url
    }

    reply
      .setCookie('connectedUser', JSON.stringify(returnedUser), {
        domain: 'localhost',
        path: '/',
        secure: true,
        httpOnly: false,
        sameSite: true
      })
      .code(200)
      .send(returnedUser)
  }
}

const documentation = {
  tags: ['Users'],
  summary: 'Create one user',
  description: 'Create one user'
}

const body = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    display_name: { type: 'string' },
    password: { type: 'string' }
  }
}

const response = {
  200: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      displayName: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
      profileImageUrl: { type: 'string' }
    }
  }
}

const schema = { ...documentation, response, body }
