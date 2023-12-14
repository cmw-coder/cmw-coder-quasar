import { boot } from 'quasar/wrappers';
import { getHighlighter, setCDN } from 'shiki';

setCDN('/node_modules/shiki/');
const highlighter = await getHighlighter({
  themes: ['dark-plus', 'light-plus'],
  langs: ['c', 'c++'],
});

export default boot(async ({ app }) => {
  app.config.globalProperties.$highlighter = highlighter;
});

export { highlighter };
