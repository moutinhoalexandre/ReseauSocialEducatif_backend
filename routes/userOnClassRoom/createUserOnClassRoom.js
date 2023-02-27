export default async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/userOnClassRoom',
    schema: schema,
    handler: handler
  })

  async function handler (request, reply) {
    const { userId, classroomId } = request.body
    console.log(userId)
    console.log(classroomId)

    const classRoom = await fastify.prisma.userOnClassRoom.findMany({
      where: {
        userId: userId,
        classroomId: classroomId
      }
    })

    if (classRoom.length > 0) throw fastify.httpErrors.conflict('UserOnClassRoom already exists')

    await fastify.prisma.userOnClassRoom.create({
      data: {
        userId: userId,
        classroomId: classroomId
      }

    })

    return { message: 'UserOnClassRoom successfully created' }
  }
}

const documentation = {
  tags: ['UserOnClassRooms'],
  summary: 'Create one userOnclassRoom',
  description: 'Create one userOnclassRoom'
}

const body = {
  type: 'object',
  properties: {
    userId: { type: 'number' },
    classroomId: { type: 'number' }
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

const schema = { ...documentation, response, body }
