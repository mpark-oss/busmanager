<template>
  <v-app :theme="theme">
    <v-app-bar :color="theme === 'light' ? 'primary' : '#111111'" 
      elevation="2"
      border>
      
      <v-app-bar-title class="font-weight-black">
        <div class="d-flex flex-row align-center">
          <v-img 
            src="/favicon.ico.png" 
            alt="흐흣 로고"
            width="32" 
            height="32" 
            max-width="32"
            class="me-3 rounded-lg border border-opacity-25"
            cover
          ></v-img>
          
          <span class="text-h6">흐흣 운수</span>
        </div>
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

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

const theme = ref(localStorage.getItem('theme') || 'light');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme.value);
};
</script>

<style>
/* 기존 스타일 유지 */
body { font-family: 'Pretendard', sans-serif; }
.v-theme--dark.v-application {
  background-color: #121212 !important;
}
.v-theme--dark .v-container {
  background-color: transparent !important;
}
.v-theme--dark .v-card {
  background-color: #1e1e1e !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.v-theme--dark .v-btn {
  color: #e0e0e0 !important;
}
.v-theme--dark .v-app-bar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
</style>