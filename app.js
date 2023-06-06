import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import AutoLoad from '@fastify/autoload'
import fastifyCors from '@fastify/cors'
import fastifyCookie from '@fastify/cookie'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyEnv from '@fastify/env'
import fastifyHelmet from '@fastify/helmet'
import fastifybcrypt from 'fastify-bcrypt'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'

export default async function (fastify, opts) {
  // Place here your custom code!
  fastify.register(fastifyCors, {
    origin: true,
    credentials: true
  })

  fastify.register(fastifyHelmet, {
    global: true,
    crossOriginEmbedderPolicy: false
  })

  fastify.register(fastifyCookie)

  fastify.register(fastifybcrypt, {
    saltWorkFactor: 10
  })

  /* It's a schema for the environment variables. */
  const envSchema = {
    type: 'object',
    required: ['JWT_SECRET_KEY'],
    properties: {
      JWT_SECRET_KEY: {
        type: 'string',
        default: '9a5Vx9zdc4eUv9b84tynDu8k4o2p5'
      }
    }
  }

  fastify.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true,
    confKey: 'config'
  })

  fastify.register(multipart)

  fastify.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'Réseau Social Educatif Back-end',
        description:
          'Documentation pour l\'API du Réseau Social Educatif créer par Alexandre MOUTINHO',
        version: '0.1.0'
      },
      host: 'localhost::3111',
      schemes: ['http'],
      consumes: ['application/json', 'multipart/form-data'],
      produces: ['application/json'],
      tags: [
        { name: 'Authentification', description: 'Authentification endpoints' },
        { name: 'Users', description: 'Users CRUD' },
        { name: 'ClassRooms', description: 'ClassRooms CRUD' },
        { name: 'UserOnClassRooms', description: 'UserOnClassRooms CRUD' },
        { name: 'Publications', description: 'Publications CRUD' },
        { name: 'Comments', description: 'Comments CRUD' }
      ],
      securityDefinitions: {
        apiKey: {
          description: 'Cookie necessary to use API calls',
          type: 'apiKey',
          name: 'token',
          in: 'cookie'
        }
      }
    }
  })

  /* It's a plugin that allows to generate a documentation for the API. */
  fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      persistAuthorization: true
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next()
      },
      preHandler: function (request, reply, next) {
        next()
      }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, req, reply) => {
      swaggerObject.host = req.hostname
      return swaggerObject
    }
  })

  // Do not touch the following lines
  const __dirname = dirname(fileURLToPath(import.meta.url))
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
    // ignorePattern: /.*(model|schema)\.js/
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    dirNameRoutePrefix: false,
    options: Object.assign({}, opts)
  })

  fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public', 'images'),
    prefix: '/images/' // préfixe optionnel pour les URL servies
  })
}
