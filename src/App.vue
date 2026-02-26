<template>
  <v-app :theme="theme">
    <v-app-bar :color="theme === 'light' ? 'primary' : '#111111'" 
      elevation="2"
      border>
      
      <v-app-bar-title class="font-weight-black" style="flex: none !important; margin-right: 24px;">
        <div class="d-flex flex-row align-center">
          <v-img 
            src="/favicon.ico.png" 
            alt="흐흣 로고"
            width="50" 
            height="50" 
            max-width="50"
            class="me-3 rounded-lg border border-opacity-25"
            cover
          ></v-img>
          
          <span class="text-h6">흐흣 운수</span>
        </div>
      </v-app-bar-title>

      <div v-if="mainCharacter" class="d-flex align-center cursor-pointer" style="cursor: pointer;" @click="charSettingDialog = true">
        <v-avatar size="32" border class="me-2">
          <v-img :src="mainCharacter.img" cover></v-img>
        </v-avatar>
        <div class="d-flex flex-column" style="line-height: 1.2;">
          <span class="text-caption font-weight-black">{{ mainCharacter.name }}</span>
          <span class="text-overline text-grey-lighten-1" style="font-size: 0.6rem !important;">Lv. {{ mainCharacter.level }}</span>
        </div>
        <v-icon size="small" class="ms-1">mdi-chevron-down</v-icon>
      </div>
      <v-btn v-else variant="tonal" size="small" prepend-icon="mdi-account-circle" @click="charSettingDialog = true">
        캐릭터 설정
      </v-btn>
      
      <v-spacer></v-spacer>

      <v-btn to="/" prepend-icon="mdi-bus">공격대 만들기</v-btn>
      <v-btn to="/schedule" prepend-icon="mdi-calendar-check">버스 스케줄</v-btn>
      <v-btn prepend-icon="mdi-clipboard-check" to="/homework">숙제 스케줄</v-btn>
      <v-btn to="/homework-schedule" prepend-icon="mdi-calendar-check">개인 숙제 관리</v-btn>
      <v-btn to="/board" prepend-icon="mdi-clipboard-text-outline">쌀산기</v-btn>
      <v-btn to="/guestbook" prepend-icon="mdi-message-draw">방명록</v-btn>

      <v-btn icon @click="toggleTheme" class="ms-2">
        <v-icon>{{ theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-dialog v-model="charSettingDialog" max-width="400">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="font-weight-black d-flex align-center">
          <v-icon class="me-2">mdi-account-cog</v-icon> 기준 캐릭터 설정
        </v-card-title>
        <v-card-text>
          <div class="d-flex align-center gap-2 mb-4">
            <v-text-field
              v-model="searchCharName"
              label="캐릭터명 입력"
              variant="outlined"
              hide-details
              density="compact"
              color="orange-darken-2"
              @keyup.enter="setMainCharacter"
            ></v-text-field>
            <v-btn color="orange-darken-2" icon="mdi-account-search" variant="flat" class="ms-2" :loading="isFetching" @click="setMainCharacter"></v-btn>
          </div>
          
          <v-divider v-if="mainCharacter" class="my-4"></v-divider>
          
          <div v-if="mainCharacter" class="pa-3 bg-grey-darken-4 rounded-lg d-flex align-center">
             <v-avatar size="48" class="me-3" border><v-img :src="mainCharacter.img" cover></v-img></v-avatar>
             <div>
               <div class="font-weight-bold text-subtitle-1">{{ mainCharacter.name }}</div>
               <div class="text-caption text-grey">Lv. {{ mainCharacter.level }} {{ mainCharacter.className }}</div>
             </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="charSettingDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const theme = ref(localStorage.getItem('theme') || 'light');
const mainCharacter = ref(null);
const charSettingDialog = ref(false);
const searchCharName = ref("");
const isFetching = ref(false);
const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme.value);
};

// [신규] 매주 수요일 오전 6시 초기화 로직
const checkWeeklyReset = () => {
  const lastReset = localStorage.getItem('last_hw_reset');
  const now = new Date();
  
  // 최근 수요일 오전 6시 계산
  const getRecentResetTime = () => {
    const d = new Date(now);
    const day = d.getDay(); // 0(일) ~ 6(토)
    const diff = (day < 3 || (day === 3 && d.getHours() < 6)) ? (day + 4) : (day - 3);
    d.setDate(d.getDate() - diff);
    d.setHours(6, 0, 0, 0);
    return d.getTime();
  };

  const resetTime = getRecentResetTime();

  // 저장된 마지막 초기화 시간이 최근 수요일 06시보다 이전이면 초기화 진행
  if (!lastReset || parseInt(lastReset) < resetTime) {
    const savedChars = localStorage.getItem('hw_characters');
    if (savedChars) {
      const chars = JSON.parse(savedChars);
      const resetChars = chars.map(c => ({ ...c, completedTasks: [] }));
      localStorage.setItem('hw_characters', JSON.stringify(resetChars));
      localStorage.setItem('last_hw_reset', resetTime.toString());
      console.log("주간 숙제가 수요일 오전 6시 기준으로 초기화되었습니다.");
      // 현재 페이지가 숙제 관리 페이지라면 새로고침 유도 (이벤트 발송)
      window.dispatchEvent(new CustomEvent('main-char-changed'));
    }
  }
};

const setMainCharacter = async () => {
  if (!searchCharName.value) return;
  isFetching.value = true;
  try {
    const url = `/api/armories/characters/${encodeURIComponent(searchCharName.value)}/profiles`;
    const res = await axios.get(url, {
      headers: { 'Authorization': `bearer ${API_KEY.trim()}` }
    });
    
    if (res.data) {
      const data = res.data;
      mainCharacter.value = {
        name: data.CharacterName,
        level: data.ItemAvgLevel, // ItemAvgLevel로 일치시킴
        className: data.CharacterClassName,
        img: data.CharacterImage
      };
      localStorage.setItem('main_char', JSON.stringify(mainCharacter.value));
      searchCharName.value = "";
      window.dispatchEvent(new CustomEvent('main-char-changed'));
    }
  } catch (e) {
    alert("캐릭터를 찾을 수 없습니다.");
  } finally {
    isFetching.value = false;
  }
};

onMounted(() => {
  const saved = localStorage.getItem('main_char');
  if (saved) mainCharacter.value = JSON.parse(saved);
  
  // 앱 실행 시 초기화 여부 체크
  checkWeeklyReset();
});
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