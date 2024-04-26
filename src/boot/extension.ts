import MarkdownIt from 'markdown-it';
import { fromHighlighter } from '@shikijs/markdown-it/core';
import { getHighlighter } from 'shiki';

export const highlighter = await getHighlighter({
  themes: ['dark-plus', 'light-plus'],
  langs: [
    'angular-html',
    'angular-ts',
    'apache',
    'asm',
    'bat',
    'c',
    'cmake',
    'cpp',
    'csharp',
    'css',
    'csv',
    'dart',
    'diff',
    'docker',
    'fortran-fixed-form',
    'fortran-free-form',
    'fsharp',
    'git-commit',
    'git-rebase',
    'glsl',
    'go',
    'graphql',
    'groovy',
    'haskell',
    'hjson',
    'hlsl',
    'html',
    'http',
    'java',
    'javascript',
    'json',
    'json5',
    'jsonc',
    'jsonl',
    'jsx',
    'kotlin',
    'latex',
    'lua',
    'make',
    'matlab',
    'mermaid',
    'nginx',
    'objective-c',
    'objective-cpp',
    'pascal',
    'perl',
    'php',
    'powershell',
    'python',
    'r',
    'riscv',
    'ruby',
    'rust',
    'sass',
    'scala',
    'scss',
    'shellscript',
    'sql',
    'ssh-config',
    'swift',
    'system-verilog',
    'tex',
    'toml',
    'tsx',
    'typescript',
    'vb',
    'verilog',
    'vhdl',
    'vue',
    'vue-html',
    'wasm',
    'wgsl',
    'yaml',
  ],
});

const markdownIt = MarkdownIt({
  breaks: true,
});

markdownIt.use(
  fromHighlighter(highlighter, {
    themes: {
      dark: 'dark-plus',
      light: 'light-plus',
    },
    transformers: [
      {
        span: (hast) => {
          if (typeof hast.properties.class === 'string') {
          }
        },
        pre: (hast) => {
          if (typeof hast.properties.style === 'string') {
            hast.properties.style = hast.properties.style.replace(
              /background-color:(#.{6});/g,
              'background-color:transparent;',
            );
          }
          return hast;
        },
      },
    ],
  }),
);

export { markdownIt };
