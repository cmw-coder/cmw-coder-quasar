import path from 'path';

export const treeSitterCPath = process.env.PROD
  ? `"${path.join(process.resourcesPath, 'tree-sitter', 'tree-sitter-c.wasm')}"`
  : path.join(__dirname, '../../src-electron/assets/tree-sitter/tree-sitter-c.wasm');
