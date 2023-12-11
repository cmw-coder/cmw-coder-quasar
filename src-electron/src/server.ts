import Fastify from 'fastify';

import modifyRoute from 'backend/routes/modify';

const fastify = Fastify({
  logger: {
    level: 'warn',
  },
});

export const startServer = async () => {
  fastify.register(modifyRoute);
  await fastify.listen({
    host: '127.0.0.1',
    port: 3001,
  });
};
