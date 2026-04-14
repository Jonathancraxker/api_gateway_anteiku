const fastify = require('fastify')({ logger: true });
require('dotenv').config();

fastify.register(require('@fastify/cors'), {
// origin: ['http://localhost:4200'],
origin: true,
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization']
});

// Registrar Plugins personalizados
fastify.register(require('./plugins/rate-limit'));
fastify.register(require('./plugins/auth'));

fastify.register(require('./routes/gateway.routes'));
// El proxy va al final para asegurar que los decoradores de auth ya existan
fastify.register(require('./plugins/proxy'));

module.exports = fastify;