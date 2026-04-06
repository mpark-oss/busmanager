import { createRouter, createWebHistory } from 'vue-router';
import MakerView from '../views/MakerView.vue';
import ScheduleView from '../views/ScheduleView.vue';
import BoardView from '../views/BoardView.vue';
import GuestbookView from '../views/GuestbookView.vue';
import HellAbyss from '../views/HellAbyssCalcView.vue';
import HomeworkView from '../views/HomeworkView.vue';
import HomeworkScheduleView from '../views/HomeworkScheduleView.vue';
import FixedScheduleView from '../views/FixedScheduleView.vue';

import { getAuth, onAuthStateChanged } from 'firebase/auth';

const routes = [
  { path: '/', component: MakerView },
  { path: '/schedule', component: ScheduleView },
  { path: '/board', component: BoardView },
  { path: '/guestbook', component: GuestbookView },
  { path: '/hell-abyss', component: HellAbyss },
  { path: '/homework', component: HomeworkView },
  { path: '/homework-schedule', component: HomeworkScheduleView },
  { 
    path: '/fixed-schedule', 
    name: 'fixed-schedule', 
    component: FixedScheduleView 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

// 네비게이션 가드 수정
router.beforeEach(async (to, from, next) => {
  // 1. 인증 정보 대기
  await getCurrentUser();

  // 2. 모바일 여부 판별 (Vuetify 기준 또는 범용 모바일 체크)
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 1264;

  // 3. 모바일이면서 루트('/')로 접속했을 경우 리다이렉트
  if (isMobile && to.path === '/') {
    return next('/homework-schedule');
  }

  next();
});

export default router;