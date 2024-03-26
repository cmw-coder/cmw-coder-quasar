import { RouteRecordRaw } from 'vue-router';

import { WindowType } from 'shared/types/WindowType';

export const routes: RouteRecordRaw[] = [
  {
    name: 'root',
    path: '/',
    redirect: '/main',
  },
  {
    name: WindowType.Floating,
    path: '/floating',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'completions',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/CompletionFloatingPage.vue'),
        },
      },
      {
        path: 'feedback',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/FeedbackPage.vue'),
        },
      },
      {
        path: 'login',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/LoginPage.vue'),
        },
      },
      {
        path: 'projectId',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/ProjectIdPage.vue'),
        },
      },
      {
        path: 'update',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/UpdatePage.vue'),
        },
      },
    ],
  },
  {
    name: WindowType.Immersive,
    path: '/immersive',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [
      {
        path: 'completions',
        components: {
          default: () => import('pages/CompletionImmersivePage.vue'),
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
          default: () => import('pages/ChatPage.vue'),
          // rightDrawer: () => import('layouts/drawers/RightMainDrawer.vue'),
          footer: () => import('layouts/footers/QuestionFooter.vue'),
        },
      },
      {
        path: 'developer',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          default: () => import('pages/DeveloperPage.vue'),
        },
      },
      {
        path: 'feedback',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          default: () => import('pages/FeedbackPage.vue'),
        },
      },
      {
        path: 'settings',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          default: () => import('pages/SettingsPage.vue'),
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
