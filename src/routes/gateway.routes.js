async function gatewayRoutes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return {
      statusCode: 200,
      intOp: "GW100",
      data: [{
        status: "UP",
        service: "ANTEIKU_API_GATEWAY",
        serverTime: new Date().toISOString(),
        nodeVersion: process.version,
        message: "API Gateway is healthy and routing correctly"
      }]
    };
  });
}

module.exports = gatewayRoutes;