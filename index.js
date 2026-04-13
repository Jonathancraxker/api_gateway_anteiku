const fastify = require('./src/app');
require('dotenv').config();

const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    
    // Escuchamos en 0.0.0.0 para evitar problemas de red en algunos entornos
    await fastify.listen({ port: port, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();