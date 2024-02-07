import { getHighlighter } from 'shiki';

export const highlighter = await getHighlighter({
  themes: ['dark-plus', 'light-plus'],
  langs: ['c', 'c++'],
});
