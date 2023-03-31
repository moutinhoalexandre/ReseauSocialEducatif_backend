import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
const pump = util.promisify(pipeline)

export default async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/publications',
    schema: schema,
    preValidation: [fastify.authenticate],
    handler: handler
  })

  async function handler (request) {
    const parts = request.parts()

    /* Declaring variables. */
    let title = ''
    let content = ''
    let userId = ''
    let userImageUrl = ''
    const image = {}

    /* A for loop that is iterating over the parts of the request. */
    for await (const part of parts) {
      if (part.fieldname === 'title') {
        console.log('title')
        title = part.value
      } else if (part.fieldname === 'content') {
        content = part.value
        console.log('content')
      } else if (part.fieldname === 'userId') {
        userId = Number(part.value)
      } else /* This is checking if the part of the request is an image. If it is, it is saving theimage to the public/images folder. */
      if (part.fieldname === 'image') {
        image.filename = part.filename
        console.log(image.filename)
        image.mimetype = part.mimetype
        const uniqueFilename = `${new Date().getTime()}-${image.filename}`
        const saveTo = `./public/images/${uniqueFilename}`
        userImageUrl = `/images/${uniqueFilename}`
        await pump(part.file, fs.createWriteStream(saveTo))
      }
    }

    if (!image.filename && !content) throw fastify.httpErrors.badRequest('A publication must contain at least one image or text')
    if (!title) throw fastify.httpErrors.badRequest('A title is mandatory')

    await fastify.prisma.publication.create({
      data: {
        title: title,
        content: content,
        userOnClassroom_Id: userId,
        image_url: userImageUrl
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

const response = {
  200: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  }
}

const schema = { ...documentation, response }
