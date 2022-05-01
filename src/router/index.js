import { createRouter, createWebHistory } from 'vue-router';
import Profile from '../views/Profile.vue';

const routes = [
  {
    path: '/',
    name: 'Profil',
    component: Profile,
  },
  {
    path: '/ernaehrung',
    name: 'Ernährung',
    // route level code-splitting
    // this generates a separate chunk (nutrition.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "nutrition" */ '../views/Nutrition.vue'),
  },
  {
    path: '/training',
    name: 'Training',
    // route level code-splitting
    // this generates a separate chunk (workout.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "workout" */ '../views/Workout.vue'),
  },
  {
    path: '/settings',
    name: 'Einstellungen',
    // route level code-splitting
    // this generates a separate chunk (workout.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "workout" */ '../views/Settings.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
