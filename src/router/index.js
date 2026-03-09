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

import { getAuth, onAuthStateChanged } from 'firebase/auth';

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

// 💡 네비게이션 가드: 페이지를 이동하기 전에 먼저 실행됨
router.beforeEach(async (to, from, next) => {
  // 인증 정보를 가져올 때까지 라우터가 여기서 기다립니다.
  await getCurrentUser(); 
  next();
});

export default router;