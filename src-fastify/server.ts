import Fastify from 'fastify';

import modify from 'routes/modify';

const fastify = Fastify({
  logger: {
    level: 'warn',
  },
});

export const main = async () => {
  fastify.register(modify);
  await fastify.listen({
    host: '127.0.0.1',
    port: 3001,
  });
};
