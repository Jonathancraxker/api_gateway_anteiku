const fp = require('fastify-plugin');

// Plugin para limitar la cantidad de peticiones que un cliente puede hacer en un periodo de tiempo determinado
module.exports = fp(async (fastify) => {
  fastify.register(require('@fastify/rate-limit'), {
    max: 50, // Máximo 50 peticiones por IP
    timeWindow: '1 minute', // Ventana de tiempo de 1 minuto
    errorResponseBuilder: (request, context) => ({
      statusCode: 429,
      intOp: "GW429",
      data: [{ message: "Too many requests",
        retryAfter: context.after
      }]
    })
  });
});