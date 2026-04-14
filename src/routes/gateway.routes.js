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
// http://localhost:3000/debug-error para probar el error_stack en la BD
async function gatewayRoutes(fastify, opts) {
    fastify.get('/debug-error', async (request, reply) => {
        throw new Error("Error de prueba para gateway_logs");
    });
};

module.exports = gatewayRoutes;