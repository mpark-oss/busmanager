import { createRouter, createWebHistory } from 'vue-router';
import MakerView from '../views/MakerView.vue';
import ScheduleView from '../views/ScheduleView.vue';
import BoardView from '../views/BoardView.vue';

const routes = [
  { path: '/', component: MakerView },
  { path: '/schedule', component: ScheduleView },
  { path: '/board', component: BoardView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;