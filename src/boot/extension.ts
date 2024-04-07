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

function addButtons(md: MarkdownIt) {
  const defaultRender = md.renderer.rules.fence;
  if (!defaultRender) return;
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const html = defaultRender(tokens, idx, options, env, self);
    return `
    <div class="custom-code-render">
      <div class="tool-wrapper">
        <div class="left">
          <div class="language">${options.langPrefix}</div>
        </div>
        <div class="right">
          <div class="copy-button" title="复制">
            <button class="q-btn q-btn-item non-selectable no-outline q-btn--standard q-btn--round bg-primary text-white q-btn--actionable q-focusable q-hoverable" tabindex="0" type="button" style="font-size: 8px;">
              <span class="q-focus-helper"></span>
              <span class="q-btn__content text-center col items-center q-anchor--skip justify-center row">
                <i class="q-icon notranslate material-icons" aria-hidden="true" role="img">navigation</i>
              </span>
            </button>
          </div>
          <div class="insert-button" title="插入">
            <button class="q-btn q-btn-item non-selectable no-outline q-btn--standard q-btn--round bg-primary text-white q-btn--actionable q-focusable q-hoverable" tabindex="0" type="button" style="font-size: 8px;">
              <span class="q-focus-helper"></span>
              <span class="q-btn__content text-center col items-center q-anchor--skip justify-center row">
                <i class="q-icon notranslate material-icons" aria-hidden="true" role="img">navigation</i>
              </span>
            </button>
          </div>
        </div>
      </div>
      <div class="code-content">
        ${html}
      </div>
    </div>
      `;
  };
}

markdownIt.use(addButtons);

export { markdownIt };
