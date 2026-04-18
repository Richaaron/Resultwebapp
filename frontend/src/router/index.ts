import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Students from '../views/Students.vue';
import ScoreEntry from '../views/ScoreEntry.vue';
import ResultView from '../views/ResultView.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/students', name: 'Students', component: Students },
  { path: '/score-entry', name: 'ScoreEntry', component: ScoreEntry },
  { path: '/results/:id', name: 'ResultView', component: ResultView, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
