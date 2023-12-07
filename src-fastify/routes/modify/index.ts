import { FastifyPluginAsync } from 'fastify';
import { decode } from 'iconv-lite';

import { syncSchema, SyncType } from 'app/src-fastify/routes/modify/scheme';
import { modificationManager } from 'app/src-fastify/types/ModificationManager';

export default <FastifyPluginAsync>(async (fastify): Promise<void> => {
  fastify.post<SyncType>('/modify', { schema: syncSchema }, async (request) => {
    const { content, path } = request.body;
    modificationManager.updateModification(
      decode(Buffer.from(path, 'base64'), 'gb2312'),
      decode(Buffer.from(content, 'base64'), 'gb2312')
    );
    return {
      success: true,
    };
  });
});
