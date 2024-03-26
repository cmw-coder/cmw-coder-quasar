import MarkdownIt from 'markdown-it';
import { fromHighlighter } from '@shikijs/markdown-it/core';
import { getHighlighter } from 'shiki';

export const highlighter = await getHighlighter({
  themes: ['dark-plus', 'light-plus'],
  langs: ['c', 'c++'],
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
