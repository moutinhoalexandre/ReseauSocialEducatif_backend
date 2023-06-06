import fs from 'fs'

export default async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/image/:userId',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request, reply) {
    const requestUserId = Number(request.params.userId)
    const { role, userId } = fastify.jwt.decode(request.cookies.token)

    if (role === 'admin' || userId === requestUserId) {
      const { filename, file } = await request.file()
      const uniqueFilename = `${new Date().getTime()}-${filename}`
      const saveTo = `./public/images/${uniqueFilename}`
      await file.pipe(fs.createWriteStream(saveTo))
      const imageUrl = `http://localhost:3111/images/${uniqueFilename}`

      const user = await fastify.prisma.user.findUnique({
        where: {
          id: requestUserId
        }
      })

      if (!user) throw fastify.httpErrors.notFound('User not found')

      const now = Date.now()
      const updateDate = new Date(now)

      const userFind = await fastify.prisma.user.update({
        where: {
          id: requestUserId
        },
        data: {
          profile_image_url: imageUrl,
          date_update: updateDate
        }
      })

      const token = await reply.jwtSign({
        role: userFind.role,
        userId: userFind.id
      })

      const returnedUser = {
        id: userFind.id,
        displayName: userFind.display_name,
        email: userFind.email,
        role: userFind.role,
        profileImageUrl: userFind.profile_image_url
      }

      const displayNameUser = {
        displayName: userFind.display_name
      }

      reply
        .setCookie('token', token, {
          domain: 'localhost',
          path: '/',
          secure: true,
          httpOnly: true,
          sameSite: true
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
    } else {
      throw fastify.httpErrors.unauthorized(
        'You are not authorized to update this User'
      )
    }
  }
}

const documentation = {
  tags: ['Users'],
  summary: 'test stockage image',
  description: 'test stockage image'
}

const response = {
  200: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      display_name: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
      profile_image_url: { type: 'string' }
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
  409: {
    type: 'object',
    description: 'Conflict Message',
    properties: {
      statusCode: { type: 'string' },
      error: { type: 'string' },
      message: { type: 'string' }
    }
  }
}

const schema = { ...documentation, response }
