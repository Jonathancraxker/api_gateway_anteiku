const fastify = require('fastify')({ logger: true });
require('dotenv').config();

fastify.register(require('@fastify/cors'), {
origin: ['http://localhost:4200', 'https://proyecto1-angular-i8cjekbyc-jonathans-projects-27d0782c.vercel.app'],
// origin: true,
credentials: true,
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization']
});

fastify.register(require('./plugins/rate-limit'));
fastify.register(require('./plugins/auth'));

fastify.register(require('./routes/gateway.routes'));
fastify.register(require('./plugins/proxy'));
fastify.register(require('./plugins/metrics')); // Métricas para capturar información de cada petición

module.exports = fastify;