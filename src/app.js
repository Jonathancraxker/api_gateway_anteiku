const fastify = require('fastify')({ logger: true });
require('dotenv').config();

// 1. Rate Limiting (Petición del profe: 429 Too many requests)
fastify.register(require('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    statusCode: 429,
    intOp: "GW429",
    data: [{ message: "Too many requests" }]
  })
});

// 2. JWT para validar tokens
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET
});

// 3. Decorador para verificar permisos (RBAC)
fastify.decorate("verifyPermission", (permissionRequired) => {
  return async (request, reply) => {
    try {
      await request.jwtVerify();
      const userPermissions = request.user.permisos || []; // Suponiendo que el JWT trae los permisos
      
      if (!userPermissions.includes(permissionRequired)) {
        return reply.status(403).send({
          statusCode: 403,
          intOp: "GW403",
          data: [{ message: "No tienes el permiso necesario: " + permissionRequired }]
        });
      }
    } catch (err) {
      reply.send(err);
    }
  };
});

// 4. PROXIES (Enrutamiento)

// Auth y Register (Sin validación de token)
fastify.register(require('@fastify/http-proxy'), {
  upstream: process.env.USER_SERVICE_URL,
  prefix: '/auth', // Todo lo que llegue a :3000/auth va al User Service
});

// Users (CON validación de permisos)
fastify.register(require('@fastify/http-proxy'), {
  upstream: process.env.USER_SERVICE_URL,
  prefix: '/users',
  preHandler: fastify.verifyPermission('user:view') // Solo usuarios con este permiso pueden acceder
});

// Grupos (CON validación de permisos)
fastify.register(require('@fastify/http-proxy'), {
  upstream: process.env.GROUP_SERVICE_URL,
  prefix: '/groups',
  preHandler: fastify.verifyPermission('groups:view') // Solo usuarios con este permiso pueden acceder
});

// Tickets (CON validación de permisos)
fastify.register(require('@fastify/http-proxy'), {
  upstream: process.env.TICKET_SERVICE_URL,
  prefix: '/tickets',
  preHandler: async (request, reply) => {
    // Aquí puedes meter lógica de permisos global o por ruta
    await request.jwtVerify();
  }
});

module.exports = fastify;