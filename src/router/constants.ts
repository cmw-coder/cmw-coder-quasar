import { RouteRecordRaw } from 'vue-router';

import { WindowType } from 'shared/types/WindowType';

// noinspection JSUnusedGlobalSymbols
export const routes: RouteRecordRaw[] = [
  {
    name: 'root',
    path: '/',
    redirect: '/main',
  },
  {
    name: 'floating',
    path: '/floating',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'chat',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/ChatIframePage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Chat,
          },
        },
      },
      {
        path: 'commit',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/CommitPage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Commit,
          },
          default: {
            windowType: WindowType.Commit,
          },
        },
      },
      {
        path: 'completions',
        components: {
          default: () => import('pages/CompletionImmersivePage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Completions,
          },
        },
      },
      {
        path: 'feedback',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/FeedbackPage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Feedback,
          },
        },
      },
      {
        path: 'login',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/LoginPage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Login,
          },
        },
      },
      {
        path: 'project-id',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/ProjectIdPage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.ProjectId,
          },
        },
      },
      {
        path: 'update',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/UpdatePage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Update,
          },
        },
      },
      {
        path: 'settings',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/SettingsPage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Setting,
          },
        },
      },
      {
        path: 'welcome',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/WelcomePage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Welcome,
          },
        },
      },
    ],
  },
  {
    name: WindowType.Main,
    path: '/main',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'mainRoot',
        path: '',
        redirect: '/main/chat',
      },
      {
        path: 'chat',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          default: () => import('pages/ChatIframePage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Main,
          },
        },
      },
      {
        path: 'commit',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          default: () => import('pages/CommitPage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Main,
          },
          default: {
            windowType: WindowType.Main,
          },
        },
      },
      {
        path: 'developer',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          default: () => import('pages/DeveloperPage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Main,
          },
        },
      },
      {
        path: 'feedback',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          default: () => import('pages/FeedbackPage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Main,
          },
        },
      },
      {
        path: 'settings',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          default: () => import('pages/SettingsPage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Main,
          },
        },
      },
      {
        path: 'workflow',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          default: () => import('pages/WorkflowPage.vue'),
        },
        props: {
          header: {
            windowType: WindowType.Main,
          },
        },
      },
    ],
  },

  // Always leave this as the last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];
