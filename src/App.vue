<template>
  <v-app :theme="theme">
    <v-app-bar :color="theme === 'light' ? 'primary' : '#111111'" elevation="2" border>
      
      <v-app-bar-title class="font-weight-black" style="flex: none !important; margin-right: 24px;">
        <div class="d-flex flex-row align-center">
          <v-img src="/stamp_logo.png" alt="흐흣 로고" width="50" height="50" class="me-3 rounded-lg border border-opacity-25" cover></v-img>
          <span class="text-h6">흐흣 운수</span>
        </div>
      </v-app-bar-title>

      <div class="d-flex align-center">
        <v-menu v-if="mainCharSlots.length > 0" offset-y transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="flat" color="blue-darken-2" class="rounded-pill px-4" size="small">
              <v-avatar size="24" class="me-2" v-if="getCurrentSlot">
                <v-img :src="getCurrentSlot.img" cover></v-img>
              </v-avatar>
              <span class="font-weight-black me-2">{{ currentMainName || '계정 선택' }}</span>
              <v-icon size="small">mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list class="pa-2 rounded-xl mt-2" min-width="200" elevation="10">
            <v-list-item v-for="char in mainCharSlots" :key="char.name" 
              @click="switchAccount(char.name)"
              :class="currentMainName === char.name ? 'bg-orange-lighten-5 text-orange-darken-4' : ''"
              class="rounded-lg mb-1"
            >
              <template v-slot:prepend>
                <v-avatar size="32" border><v-img :src="char.img" cover></v-img></v-avatar>
              </template>
              <v-list-item-title class="font-weight-black text-body-2">{{ char.name }}</v-list-item-title>
              <v-list-item-subtitle style="font-size: 0.65rem;">Lv. {{ char.level }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-divider class="my-2"></v-divider>
            
            <v-list-item prepend-icon="mdi-cog-outline" title="계정 추가/삭제" 
              @click="charSettingDialog = true" class="rounded-lg"></v-list-item>
          </v-list>
        </v-menu>

        <v-btn v-else variant="tonal" color="orange-darken-2" prepend-icon="mdi-account-plus" 
          class="rounded-pill font-weight-black" @click="charSettingDialog = true">
          대표 캐릭터를 설정하세요
        </v-btn>
      </div>
      
      <v-spacer></v-spacer>

      <v-btn to="/" prepend-icon="mdi-bus">공격대 만들기</v-btn>
      <v-btn to="/schedule" prepend-icon="mdi-calendar-check">버스 스케줄</v-btn>
      <v-btn prepend-icon="mdi-clipboard-check" to="/homework">숙제 스케줄</v-btn>
      <v-btn to="/homework-schedule" prepend-icon="mdi-calendar-check">개인 숙제 관리</v-btn>
      <v-btn to="/board" prepend-icon="mdi-clipboard-text-outline">쌀산기</v-btn>
      <v-btn to="/guestbook" prepend-icon="mdi-message-draw">커뮤니티</v-btn>

      <v-btn icon @click="toggleTheme" class="ms-2">
        <v-icon>{{ theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-dialog v-model="charSettingDialog" max-width="400">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="font-weight-black d-flex align-center">
          <v-icon class="me-2">mdi-account-multiple-plus</v-icon> 대표 캐릭터 관리 ({{ mainCharSlots.length }}/5)
        </v-card-title>
        <v-card-text>
          <div class="d-flex align-center gap-2 mb-4">
            <v-text-field v-model="searchCharName" label="새 대표 캐릭터명" variant="outlined" hide-details density="compact" color="orange-darken-2" @keyup.enter="addNewSlot"></v-text-field>
            <v-btn color="orange-darken-2" icon="mdi-account-search" variant="flat" class="ms-2" :loading="isFetching" @click="addNewSlot"></v-btn>
          </div>
          <v-divider v-if="mainCharSlots.length > 0" class="my-4"></v-divider>
          <v-list v-if="mainCharSlots.length > 0" class="bg-transparent pa-0">
            <v-list-item v-for="char in mainCharSlots" :key="char.name" class="bg-grey-darken-4 rounded-lg mb-2 pa-2">
              <template v-slot:prepend><v-avatar size="40" border><v-img :src="char.img" cover></v-img></v-avatar></template>
              <v-list-item-title class="font-weight-bold text-subtitle-2">{{ char.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">Lv. {{ char.level }}</v-list-item-subtitle>
              <template v-slot:append><v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="removeSlot(char.name)"></v-btn></template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn variant="text" @click="charSettingDialog = false">닫기</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-main><router-view></router-view></v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed, provide } from 'vue';
import axios from 'axios';
import { db } from './firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const theme = ref(localStorage.getItem('theme') || 'light');
const mainCharSlots = ref([]);
const currentMainName = ref(localStorage.getItem('current_main_name') || "");
const charSettingDialog = ref(false);
const searchCharName = ref("");
const isFetching = ref(false);
const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";


const topVillain = ref(null);

onMounted(() => {
  // 1. villains 컬렉션에서 신고 횟수(reportCount)가 가장 높은 1명만 실시간 감시
  const q = query(
    collection(db, "villains"), 
    orderBy("reportCount", "desc"), 
    limit(1)
  );

  onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      topVillain.value = {
        name: doc.id,
        count: doc.data().reportCount
      };
      console.log("현재 원정대 공공의 적:", topVillain.value.name);
    }
  });
});

// 모든 하위 컴포넌트에서 'topVillain'이라는 이름으로 이 데이터를 사용할 수 있게 주입
provide('topVillain', topVillain);

// 현재 선택된 슬롯의 전체 데이터 반환
const getCurrentSlot = computed(() => {
  return mainCharSlots.value.find(c => c.name === currentMainName.value);
});

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme.value);
};

const switchAccount = (name) => {
  currentMainName.value = name;
  localStorage.setItem('current_main_name', name);
  window.dispatchEvent(new CustomEvent('main-char-changed', { detail: name }));
};

// [수정] 매주 수요일 오전 6시 초기화 로직 (오류 해결 버전)
const checkWeeklyReset = () => {
  const lastReset = localStorage.getItem('last_hw_reset');
  const now = new Date();
  
  // 최근 수요일 오전 6시 계산 함수 (함수 내부에서 바로 정의 및 사용)
  const getRecentResetTime = () => {
    const d = new Date(now);
    const day = d.getDay(); // 0(일) ~ 6(토)
    // 오늘이 수요일(3)이고 6시 이전이면 지난주 수요일로 계산, 아니면 이번주 수요일
    const diff = (day < 3 || (day === 3 && d.getHours() < 6)) ? (day + 4) : (day - 3);
    d.setDate(d.getDate() - diff);
    d.setHours(6, 0, 0, 0);
    return d.getTime();
  };

  const resetTime = getRecentResetTime();

  // 저장된 마지막 초기화 시간이 계산된 resetTime보다 이전이면 전체 초기화
  if (!lastReset || parseInt(lastReset) < resetTime) {
    // 모든 계정 슬롯 순회
    mainCharSlots.value.forEach(slot => {
      const storageKey = `hw_chars_${slot.name}`;
      const savedChars = localStorage.getItem(storageKey);
      if (savedChars) {
        const chars = JSON.parse(savedChars);
        // 수요일 6시에는 주간 레이드 + 신규 항목(천상/지옥/할)을 모두 비움
        const resetChars = chars.map(c => ({ 
          ...c, 
          // 일일 숙제(chaos, guardian)는 updateDailyRestGauges에서 매일 처리하므로 건드리지 않음
          // 주간 레이드 및 sky, hell, hall 등 모든 주간 항목을 비우기 위해 
          // 일일 숙제 ID만 남기고 필터링하거나, 그냥 전체를 비워도 됨
          completedTasks: c.completedTasks.filter(id => ['chaos', 'guardian'].includes(id)) 
        }));
        localStorage.setItem(storageKey, JSON.stringify(resetChars));
      }
    });
    
    localStorage.setItem('last_hw_reset', resetTime.toString());
    console.log("주간 데이터가 수요일 오전 6시 기준으로 초기화되었습니다.");
    
    // 현재 페이지 데이터 갱신을 위해 이벤트 발송
    window.dispatchEvent(new CustomEvent('main-char-changed', { detail: currentMainName.value }));
  }
};

const addNewSlot = async () => {
  if (!searchCharName.value || mainCharSlots.value.length >= 5) return;
  isFetching.value = true;
  try {
    const url = `/api/armories/characters/${encodeURIComponent(searchCharName.value)}/profiles`;
    const res = await axios.get(url, { headers: { 'Authorization': `bearer ${API_KEY.trim()}` } });
    if (res.data) {
      const data = res.data;
      const newChar = { name: data.CharacterName, level: data.ItemAvgLevel, className: data.CharacterClassName, img: data.CharacterImage };
      if (!mainCharSlots.value.some(c => c.name === newChar.name)) {
        mainCharSlots.value.push(newChar);
        localStorage.setItem('main_char_slots', JSON.stringify(mainCharSlots.value));
        switchAccount(newChar.name);
      }
      searchCharName.value = "";
    }
  } catch (e) { alert("캐릭터를 찾을 수 없습니다."); } finally { isFetching.value = false; }
};

const removeSlot = (name) => {
  if (!confirm(`${name} 슬롯을 제거하시겠습니까?`)) return;
  mainCharSlots.value = mainCharSlots.value.filter(c => c.name !== name);
  localStorage.setItem('main_char_slots', JSON.stringify(mainCharSlots.value));
  if (currentMainName.value === name) {
    const nextChar = mainCharSlots.value[0];
    switchAccount(nextChar ? nextChar.name : "");
  }
};

onMounted(() => {
  const savedSlots = localStorage.getItem('main_char_slots');
  if (savedSlots) mainCharSlots.value = JSON.parse(savedSlots);
  if (!currentMainName.value && mainCharSlots.value.length > 0) switchAccount(mainCharSlots.value[0].name);
  checkWeeklyReset();
});
</script>

<style>
body { font-family: 'Pretendard', sans-serif; }
.v-theme--dark.v-application { background-color: #121212 !important; }
.v-theme--dark .v-card { background-color: #1e1e1e !important; border-color: rgba(255, 255, 255, 0.1) !important; }
.v-theme--dark .v-btn { color: #e0e0e0 !important; }
.v-theme--dark .v-app-bar { border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; }
.gap-2 { gap: 8px; }
.cursor-pointer { cursor: pointer; }
</style>