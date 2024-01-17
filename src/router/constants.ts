import { RouteRecordRaw } from 'vue-router';

import { WindowType } from 'shared/types/WindowType';

export const routes: RouteRecordRaw[] = [
  {
    name: 'root',
    path: '/',
    redirect: 'main/dashboard',
  },
  {
    name: WindowType.Floating,
    path: '/floating',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'projectId',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/ProjectIdPage.vue'),
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
        path: 'completions',
        components: {
          header: () => import('layouts/headers/FloatingHeader.vue'),
          default: () => import('pages/CompletionFloatingPage.vue'),
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
        path: 'dashboard',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          // leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          default: () => import('pages/DashboardPage.vue'),
          // rightDrawer: () => import('layouts/drawers/RightMainDrawer.vue'),
        },
      },
      {
        path: 'feedback',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          default: () => import('pages/FeedbackPage.vue'),
        },
      },
      {
        path: 'login',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          default: () => import('pages/LoginPage.vue'),
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
