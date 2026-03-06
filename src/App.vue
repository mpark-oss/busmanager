<template>
  <v-app :theme="theme">
    <v-app-bar :color="theme === 'light' ? 'primary' : '#111111'" elevation="2" border>

      <v-app-bar-title class="font-weight-black" style="flex: none !important; margin-right: 24px;">
        <div class="d-flex flex-row align-center">
          <v-img src="/stamp_logo.png" alt="흐흣 로고" width="50" height="50"
            class="me-3 rounded-lg border border-opacity-25" cover></v-img>
          <span class="text-h6">흐흣 수용소</span>
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
            <v-list-item v-for="char in mainCharSlots" :key="char.name" @click="switchAccount(char.name)"
              :class="currentMainName === char.name ? 'bg-orange-lighten-5 text-orange-darken-4' : ''"
              class="rounded-lg mb-1">
              <template v-slot:prepend>
                <v-avatar size="32" border><v-img :src="char.img" cover></v-img></v-avatar>
              </template>
              <v-list-item-title class="font-weight-black text-body-2">{{ char.name }}</v-list-item-title>
              <v-list-item-subtitle style="font-size: 0.65rem;">Lv. {{ char.level }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item prepend-icon="mdi-cog-outline" title="계정 추가/삭제" @click="charSettingDialog = true"
              class="rounded-lg"></v-list-item>
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
      <v-btn prepend-icon="mdi-clipboard-list" to="/homework">숙제 스케줄</v-btn>
      <v-btn to="/homework-schedule" prepend-icon="mdi-format-list-checks">개인 숙제 관리</v-btn>
      <v-btn to="/board" prepend-icon="mdi-calculator">쌀산기</v-btn>
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
            <v-text-field v-model="searchCharName" label="새 대표 캐릭터명" variant="outlined" hide-details density="compact"
              color="orange-darken-2" @keyup.enter="addNewSlot"></v-text-field>
            <v-btn color="orange-darken-2" icon="mdi-account-search" variant="flat" class="ms-2" :loading="isFetching"
              @click="addNewSlot"></v-btn>
          </div>
          <v-divider v-if="mainCharSlots.length > 0" class="my-4"></v-divider>
          <v-list v-if="mainCharSlots.length > 0" class="bg-transparent pa-0">
            <v-list-item v-for="char in mainCharSlots" :key="char.name" class="bg-grey-darken-4 rounded-lg mb-2 pa-2">
              <template v-slot:prepend><v-avatar size="40" border><v-img :src="char.img"
                    cover></v-img></v-avatar></template>
              <v-list-item-title class="font-weight-bold text-subtitle-2">{{ char.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">Lv. {{ char.level }}</v-list-item-subtitle>
              <template v-slot:append><v-btn icon="mdi-delete-outline" variant="text" color="error" size="small"
                  @click="removeSlot(char.name)"></v-btn></template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn variant="text"
            @click="charSettingDialog = false">닫기</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-main>
      <router-view></router-view>

      <v-fade-transition>
        <v-btn v-show="showFab" icon="mdi-chevron-up" color="primary" size="large" elevation="8" class="scroll-to-top"
          @click="scrollToTop"></v-btn>
      </v-fade-transition>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed, provide, onUnmounted } from 'vue';
import axios from 'axios';
import { db } from './firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';

const theme = ref(localStorage.getItem('theme') || 'light');
const mainCharSlots = ref([]);
const currentMainName = ref(localStorage.getItem('current_main_name') || "");
const charSettingDialog = ref(false);
const searchCharName = ref("");
const isFetching = ref(false);
const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";


const topVillains = ref([]); // 단일 객체에서 배열로 변경

onMounted(() => {
  // 상위 빌런들을 넉넉히 가져옴 (예: 최대 10명까지 동점자 체크 가능)
  const q = query(
    collection(db, "villains"),
    orderBy("reportCount", "desc"),
    limit(10)
  );

  onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      // 1. 최상위 점수 확인
      const maxCount = snapshot.docs[0].data().reportCount;

      // 2. 최상위 점수와 동일한 점수를 가진 모든 빌런을 배열에 담기
      topVillains.value = snapshot.docs
        .filter(doc => doc.data().reportCount === maxCount)
        .map(doc => ({
          name: doc.id,
          count: doc.data().reportCount
        }));

      console.log("현재 공동 1위 빌런들:", topVillains.value);
    } else {
      topVillains.value = []; // 데이터가 없으면 빈 배열
    }
  });
});

provide('topVillains', topVillains); // 이름을 topVillains로 변경하여 전달

// App.vue <script setup>
const topRosterMembers = ref([]);
const topRosterCount = ref(0);

onMounted(() => {
  // 1. 먼저 전체 통계에서 가장 높은 totalCount가 얼마인지 실시간으로 추적합니다.
  const qTop = query(collection(db, "roster_stats"), orderBy("totalCount", "desc"), limit(1));

  onSnapshot(qTop, (topSnapshot) => {
    if (!topSnapshot.empty) {
      const maxCount = topSnapshot.docs[0].data().totalCount || 0;
      topRosterCount.value = maxCount;

      // 2. 최고 횟수(maxCount)와 동일한 점수를 가진 모든 원정대를 다시 조회합니다. (공동 1등 처리)
      const qAllTop = query(collection(db, "roster_stats"), where("totalCount", "==", maxCount));
      
      onSnapshot(qAllTop, (allSnapshot) => {
        let allMembers = [];
        allSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.members) {
            allMembers = [...allMembers, ...data.members];
          }
        });
        // 공동 1등인 모든 원정대의 멤버들을 합쳐서 저장합니다.
        topRosterMembers.value = allMembers;
      });
    } else {
      topRosterMembers.value = [];
      topRosterCount.value = 0;
    }
  });
});

provide('topRosterMembers', topRosterMembers);
provide('topRosterCount', topRosterCount);

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


// App.vue <script setup> 내부에 추가
const showFab = ref(false);

const handleScroll = () => {
  // 300px 이상 스크롤 시 버튼 표시
  showFab.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 부드럽게 이동
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style>
body {
  font-family: 'Pretendard', sans-serif;
}

.v-theme--dark.v-application {
  background-color: #121212 !important;
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

.gap-2 {
  gap: 8px;
}

.cursor-pointer {
  cursor: pointer;
}

/* App.vue <style> 내부에 추가 */
.scroll-to-top {
  position: fixed !important;
  bottom: 32px;
  right: 32px;
  z-index: 99;
}
</style>