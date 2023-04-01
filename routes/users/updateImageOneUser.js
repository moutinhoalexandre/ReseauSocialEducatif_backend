// import path, { dirname } from 'path'
import fs from 'fs'

export default async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/image/:userId',
    schema: schema,
    handler: handler
  })

  async function handler (request, reply) {
    const { filename, file } = await request.file()
    const uniqueFilename = `${new Date().getTime()}-${filename}`
    const saveTo = `./public/images/${uniqueFilename}`
    await file.pipe(fs.createWriteStream(saveTo))
    const imageUrl = `/images/${uniqueFilename}`

    const requestUserId = Number(request.params.userId)
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

    return userFind
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
}

const schema = { ...documentation, response }
