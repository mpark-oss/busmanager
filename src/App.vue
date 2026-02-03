<template>
  <v-app shadow>
    <v-app-bar color="primary-darken-1" elevation="2">
      <v-app-bar-title class="font-weight-black">
        <v-icon icon="mdi-bus-clock" class="me-2"></v-icon>
        흐흣 운수 
      </v-app-bar-title>
      
      <v-spacer></v-spacer>

      <v-btn to="/" prepend-icon="mdi-bus">버스 만들기</v-btn>
      <v-btn to="/schedule" prepend-icon="mdi-calendar-check">운행표 확인</v-btn>
      <v-btn to="/board" prepend-icon="mdi-clipboard-text-outline">쌀산기</v-btn>
      <v-btn to="/guestbook" prepend-icon="mdi-message-draw">방명록</v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<style>
/* 전역 스타일 */
body { font-family: 'Pretendard', sans-serif; }
</style>