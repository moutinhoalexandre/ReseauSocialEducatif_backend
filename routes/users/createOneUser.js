import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
const pump = util.promisify(pipeline)

export default async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/user',
    schema: schema,
    handler: handler
  })

  async function handler (request, reply) {
    const parts = request.parts()

    /* Declaring variables. */
    let email = ''
    let password = ''
    let displayName = ''
    let userImageUrl = ''
    const image = {}

    /* A for loop that is iterating over the parts of the request. */
    for await (const part of parts) {
      if (part.fieldname === 'email') {
        email = part.value
      } else if (part.fieldname === 'password') {
        password = part.value
      } else if (part.fieldname === 'displayName') {
        displayName = part.value
      } else /* This is checking if the part of the request is an image. If it is, it is saving theimage to the public/images folder. */
      if (part.fieldname === 'image') {
        image.filename = part.filename
        image.mimetype = part.mimetype
        const uniqueFilename = `${new Date().getTime()}-${image.filename}`
        const saveTo = `./public/images/${uniqueFilename}`
        userImageUrl = `/images/${uniqueFilename}`
        await pump(part.file, fs.createWriteStream(saveTo))
      }
    }

    if (!image.filename) {
      userImageUrl = '/public/images/avatar.jpg'
    }

    const user = await fastify.prisma.user.findUnique({
      where: {
        email: email
      }
    })

    if (user) throw fastify.httpErrors.conflict('User already exists')

    const hash = await fastify.bcrypt.hash(password)

    const newUser = await fastify.prisma.user.create({
      data: {
        email: email,
        display_name: displayName,
        password: hash,
        profile_image_url: userImageUrl
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
