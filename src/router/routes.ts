import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/main/dashboard',
  },
  {
    path: '/main',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/main/dashboard' },
      {
        path: 'dashboard',
        components: {
          header: () => import('layouts/headers/MainHeader.vue'),
          // leftDrawer: () => import('layouts/drawers/LeftMainDrawer.vue'),
          default: () => import('pages/DashboardPage.vue'),
          // rightDrawer: () => import('layouts/drawers/RightMainDrawer.vue'),
        },
      },
    ],
  },
  {
    path: '/simple',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [
      { path: '', redirect: '/simple/completion/inline' },
      {
        path: 'completion/inline',
        components: {
          default: () => import('pages/CompletionInline.vue'),
        },
      },
      {
        path: 'completion/snippet',
        components: {
          default: () => import('pages/CompletionSnippetPage.vue'),
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

export default routes;
