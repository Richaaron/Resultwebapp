import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';
import Dashboard from '../views/Dashboard.vue';
import Students from '../views/Students.vue';
import ScoreEntry from '../views/ScoreEntry.vue';
import ResultView from '../views/ResultView.vue';
import Login from '../views/Login.vue';
import Teachers from '../views/Teachers.vue';
import Subjects from '../views/Subjects.vue';
import Broadsheet from '../views/Broadsheet.vue';

const routes = [
  { path: '/login', name: 'Login', component: Login, meta: { public: true } },
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/students', name: 'Students', component: Students },
  { path: '/subjects', name: 'Subjects', component: Subjects, meta: { admin: true } },
  { path: '/broadsheet', name: 'Broadsheet', component: Broadsheet },
  { path: '/score-entry', name: 'ScoreEntry', component: ScoreEntry },
  { path: '/results/:id', name: 'ResultView', component: ResultView, props: true },
  { path: '/teachers', name: 'Teachers', component: Teachers, meta: { admin: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  
  if (!auth.user && auth.token) {
    await auth.fetchMe();
  }

  if (to.meta.public) {
    if (auth.isAuthenticated) next('/');
    else next();
  } else {
    if (!auth.isAuthenticated) next('/login');
    else if (to.meta.admin && !auth.isAdmin) next('/');
    else next();
  }
});

export default router;
