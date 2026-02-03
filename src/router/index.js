import { createRouter, createWebHistory } from 'vue-router';
import MakerView from '../views/MakerView.vue';
import ScheduleView from '../views/ScheduleView.vue';
import BoardView from '../views/BoardView.vue';
import GuestbookView from '../views/GuestbookView.vue'


const routes = [
  { path: '/', component: MakerView },
  { path: '/schedule', component: ScheduleView },
  { path: '/board', component: BoardView },
  { path: '/guestbook', component: GuestbookView }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;