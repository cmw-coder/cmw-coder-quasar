import Fastify from 'fastify';

const fastify = Fastify({
  logger: {
    level: 'warn',
  },
});

export const main = async () => {
  fastify.listen(
    {
      host: '127.0.0.1',
      port: 3000,
    },
    (err: any) => {
      if (err) {
        fastify.log.error(err);
        fastify.close();
      }
    }
  );
};
