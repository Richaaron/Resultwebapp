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
import Setup from '../views/Setup.vue';
import ResultChecker from '../views/ResultChecker.vue';
import Settings from '../views/Settings.vue';

const routes = [
  { path: '/setup', name: 'Setup', component: Setup, meta: { public: true } },
  { path: '/:schoolSlug/login', name: 'Login', component: Login, meta: { public: true } },
  { path: '/:schoolSlug/check-result', name: 'ResultChecker', component: ResultChecker, meta: { public: true } },
  { 
    path: '/:schoolSlug', 
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'students', name: 'Students', component: Students },
      { path: 'subjects', name: 'Subjects', component: Subjects, meta: { admin: true } },
      { path: 'broadsheet', name: 'Broadsheet', component: Broadsheet },
      { path: 'score-entry', name: 'ScoreEntry', component: ScoreEntry },
      { path: 'results/:id', name: 'ResultView', component: ResultView, props: true },
      { path: 'teachers', name: 'Teachers', component: Teachers, meta: { admin: true } },
      { path: 'settings', name: 'Settings', component: Settings, meta: { admin: true } },
    ]
  },
  { path: '/', redirect: '/setup' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  const schoolSlug = to.params.schoolSlug as string;
  
  if (!auth.user && auth.token) {
    await auth.fetchMe();
  }

  if (to.meta.public) {
    if (auth.isAuthenticated && schoolSlug) next(`/${schoolSlug}`);
    else next();
  } else {
    if (!auth.isAuthenticated) {
      if (schoolSlug) next(`/${schoolSlug}/login`);
      else next('/setup');
    }
    else if (to.meta.admin && !auth.isAdmin) {
      next(`/${schoolSlug}`);
    }
    else next();
  }
});

export default router;
