import { createRouter, createWebHistory } from 'vue-router';
import MakerView from '../views/MakerView.vue';
import ScheduleView from '../views/ScheduleView.vue';
import BoardView from '../views/BoardView.vue';
import GuestbookView from '../views/GuestbookView.vue';
import HellAbyss from '../views/HellAbyssCalcView.vue';
// 기존 메뉴
import HomeworkView from '../views/HomeworkView.vue';
// 신규 메뉴 (추가)
import HomeworkScheduleView from '../views/HomeworkScheduleView.vue';

const routes = [
  { path: '/', component: MakerView },
  { path: '/schedule', component: ScheduleView },
  { path: '/board', component: BoardView },
  { path: '/guestbook', component: GuestbookView },
  { path: '/hell-abyss', component: HellAbyss },
  // 두 메뉴가 모두 살아있도록 설정
  { path: '/homework', component: HomeworkView }, // 기존
  { path: '/homework-schedule', component: HomeworkScheduleView }, // 신규
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;