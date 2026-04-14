const fp = require('fastify-plugin');

async function authPlugin(fastify, opts) {
  // Registro de JWT
fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET
});

fastify.decorate("verifyPermission", function (permissionRequired) {
  return async (request, reply) => {
    try {
      await request.jwtVerify();
      const userCheck = await fetch(`${process.env.USER_SERVICE_URL}/anteiku/validate-exists/${request.user.id}`);
      
      if (userCheck.status === 404) {
        return reply.status(401).send({
          statusCode: 401,
          message: "Tu cuenta ha sido eliminada o desactivada."
        });
      }
      const globalPerms = request.user.permissions?.permisos_globales || [];
      
      if (!globalPerms.includes(permissionRequired)) {
        return reply.status(403).send({
          statusCode: 403,
          intOp: "GW403",
          data: [{ message: `No tienes el permiso global necesario: ${permissionRequired}` }]
        });
      }
    } catch (err) {
      reply.send(err);
    }
  };
});
}

module.exports = fp(authPlugin);