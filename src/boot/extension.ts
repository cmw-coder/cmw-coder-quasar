import MarkdownIt from 'markdown-it';
import { fromHighlighter } from '@shikijs/markdown-it/core';
import { getHighlighter } from 'shiki';

export const highlighter = await getHighlighter({
  themes: ['dark-plus', 'light-plus'],
  langs: [
    'ansi',
    'asm',
    'c',
    'cpp',
    'csharp',
    'css',
    'diff',
    'html',
    'java',
    'javascript',
    'python',
    'rust',
    'typescript',
    'vue',
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
