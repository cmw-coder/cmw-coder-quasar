export const syncSchema = {
  body: {
    type: 'object',
    required: ['content', 'path'],
    properties: {
      content: {
        type: 'string',
      },
      path: {
        type: 'string',
      },
    },
  },
};

export interface SyncType {
  Body: {
    content: string;
    path: string;
  };
}
