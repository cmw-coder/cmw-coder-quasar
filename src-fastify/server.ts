import Fastify from 'fastify';

const fastify = Fastify({
  logger: {
    level: 'warn',
  },
});

export const main = async () => {
  fastify.register(import('./routes/modify'));
  await fastify.listen(
    {
      host: '127.0.0.1',
      port: 3001,
    }
  );
};
