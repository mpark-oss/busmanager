<template>
  <v-app :theme="theme">
    <v-app-bar :color="theme === 'light' ? 'primary' : '#111111'" 
      elevation="2"
      border>
      <v-app-bar-title class="font-weight-black">
        <v-icon icon="mdi-bus-clock" class="me-2"></v-icon>
        흐흣 운수 
      </v-app-bar-title>
      
      <v-spacer></v-spacer>

      <v-btn to="/" prepend-icon="mdi-bus">버스 만들기</v-btn>
      <v-btn to="/schedule" prepend-icon="mdi-calendar-check">운행표 확인</v-btn>
      <v-btn to="/board" prepend-icon="mdi-clipboard-text-outline">쌀산기</v-btn>
      <v-btn to="/guestbook" prepend-icon="mdi-message-draw">방명록</v-btn>

      <v-btn icon @click="toggleTheme" class="ms-2">
        <v-icon>{{ theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main class="">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

// 초기 테마 설정 (로컬 스토리지에 저장된 값이 있으면 사용)
const theme = ref(localStorage.getItem('theme') || 'light');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  // 사용자의 선택을 기억하도록 로컬 스토리지에 저장
  localStorage.setItem('theme', theme.value);
};
</script>

<style>
/* 전역 스타일 */
body { font-family: 'Pretendard', sans-serif; }
/* 다크모드일 때 전체 앱 배경색 강제 지정 */
.v-theme--dark.v-application {
  background-color: #121212 !important; /* 진한 회색 */
}

/* 다크모드일 때 컨테이너의 하얀 배경색 무효화 */
.v-theme--dark .v-container {
  background-color: transparent !important;
}

/* 각 메뉴의 카드 배경색도 다크모드에 맞게 조정 (선택 사항) */
.v-theme--dark .v-card {
  background-color: #1e1e1e !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* [추가] 다크모드 시 버튼들의 텍스트 색상도 가독성 좋게 조정 */
.v-theme--dark .v-btn {
  color: #e0e0e0 !important;
}

/* 헤더 하단에 아주 미세한 선을 넣어 구분감 주기 */
.v-theme--dark .v-app-bar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
</style>