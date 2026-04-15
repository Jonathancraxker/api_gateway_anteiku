const fp = require('fastify-plugin');

async function proxyPlugin(fastify, opts) {
  // // microservicio de users público
  fastify.register(require('@fastify/http-proxy'), {
    upstream: process.env.USER_SERVICE_URL,
    prefix: '/auth',
    rewritePrefix: '/anteiku'
  });
  
  // microservicio de users
  fastify.register(require('@fastify/http-proxy'), {
    upstream: process.env.USER_SERVICE_URL,
    prefix: '/users',
    rewritePrefix: '/anteiku',
    preHandler: [
      fastify.verifyPermission('user:view'),
      async (request, reply) => {
        await request.jwtVerify();
      }
    ]
  });

  // microservicio de groups
  fastify.register(require('@fastify/http-proxy'), {
    upstream: process.env.GROUP_SERVICE_URL,
    prefix: '/groups',
    rewritePrefix: '/anteiku/groups',
    preHandler: [
      async (request, reply) => {
        await request.jwtVerify();
      }
    ]
  });

  // microservicio de tickets
  fastify.register(require('@fastify/http-proxy'), {
    upstream: process.env.TICKET_SERVICE_URL,
    prefix: '/tickets',
    rewritePrefix: '/anteiku',
    preHandler: [
      fastify.verifyPermission('tickets:view'),
      async (request, reply) => {
        await request.jwtVerify();
      }
    ]
  });
}

module.exports = fp(proxyPlugin);