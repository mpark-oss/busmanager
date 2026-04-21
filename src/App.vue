<template>
  <v-app :theme="theme">
    <div v-if="isAuthLoading" class="auth-loading-screen">
      <v-progress-circular
        indeterminate
        color="#5865F2"
        size="50"
      ></v-progress-circular>
    </div>

    <template v-else>
      <v-overlay
        :model-value="!isLoggedIn"
        persistent
        class="align-center justify-center"
        scrim="#000"
        z-index="9999"
      >
        <v-card class="pa-10 text-center rounded-xl" elevation="24" width="450">
          <v-card
            width="120"
            height="120"
            class="mx-auto mb-6 rounded-lg d-flex align-center justify-center elevation-0"
            style="background-color: transparent !important"
          >
            <v-img
              src="/stamp_logo.png"
              width="100%"
              height="100%"
              class="stamp-no-bg"
            ></v-img>
          </v-card>

          <h2 class="text-h5 font-weight-black mb-2">흐흣 수용소 입장</h2>
          <p class="text-body-2 text-medium-emphasis mb-8">
            흐흣 길드원만 이용 가능한 시스템입니다.<br />디스코드 인증을
            완료해주세요.
          </p>

          <v-btn
            v-if="!isKakaotalk"
            block
            color="#5865F2"
            size="x-large"
            variant="flat"
            class="font-weight-black rounded-lg"
            @click="handleLogin"
          >
            <template #prepend>
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="white"
                class="mr-2"
              >
                <path
                  d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"
                />
              </svg>
            </template>
            Discord Login
          </v-btn>
          <v-btn
            v-else
            block
            color="#FEE500"
            size="x-large"
            variant="flat"
            class="font-weight-black rounded-lg text-black"
            @click="forceOpenExternal"
          >
            <template #prepend>
              <v-icon>mdi-open-in-new</v-icon>
            </template>
            외부 브라우저로 로그인하기
          </v-btn>

          <p
            v-if="isKakaotalk"
            class="text-caption text-error mt-4 font-weight-bold text-center"
          >
            카카오톡 인앱에서는 로그인이 지원되지 않습니다.<br />
            위 버튼을 눌러 Safari 또는 Chrome으로 이동해주세요.
          </p>
        </v-card>
      </v-overlay>

      <template v-if="isLoggedIn">
        <v-app-bar
          :color="theme === 'light' ? 'primary' : '#111111'"
          elevation="2"
          border
        >
          <v-app-bar-title
            class="font-weight-black"
            style="flex: none !important; margin-right: 24px"
          >
            <div class="d-flex flex-row align-center">
              <v-card
                width="50"
                height="50"
                class="me-3 rounded-lg d-flex align-center justify-center elevation-0"
                style="background-color: transparent !important"
              >
                <v-img
                  src="/stamp_logo.png"
                  width="100%"
                  height="100%"
                  class="stamp-no-bg"
                ></v-img>
              </v-card>
              <span class="text-h6">흐흣 수용소</span>
            </div>
          </v-app-bar-title>

          <div class="d-flex align-center">
            <v-menu
              v-if="mainCharSlots.length > 0"
              offset-y
              transition="scale-transition"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="flat"
                  color="blue-darken-2"
                  class="rounded-pill px-4"
                  size="small"
                >
                  <v-avatar size="24" class="me-2" v-if="getCurrentSlot">
                    <v-img :src="getCurrentSlot.img" cover></v-img>
                  </v-avatar>
                  <span class="font-weight-black me-2">{{
                    currentMainName || "계정 선택"
                  }}</span>
                  <v-icon size="small">mdi-chevron-down</v-icon>
                </v-btn>
              </template>

              <v-list
                class="pa-2 rounded-xl mt-2"
                min-width="200"
                elevation="10"
              >
                <v-list-item
                  v-for="char in mainCharSlots"
                  :key="char.name"
                  @click="switchAccount(char.name)"
                  :class="
                    currentMainName === char.name
                      ? 'bg-orange-lighten-5 text-orange-darken-4'
                      : ''
                  "
                  class="rounded-lg mb-1"
                >
                  <template v-slot:prepend>
                    <v-avatar size="32" border
                      ><v-img :src="char.img" cover></v-img
                    ></v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-black text-body-2">{{
                    char.name
                  }}</v-list-item-title>
                  <v-list-item-subtitle style="font-size: 0.65rem"
                    >Lv. {{ char.level }}</v-list-item-subtitle
                  >
                </v-list-item>
                <v-divider class="my-2"></v-divider>
                <v-list-item
                  prepend-icon="mdi-cog-outline"
                  title="계정 추가/삭제"
                  @click="charSettingDialog = true"
                  class="rounded-lg"
                ></v-list-item>
              </v-list>
            </v-menu>

            <v-btn
              v-else
              variant="tonal"
              color="orange-darken-2"
              prepend-icon="mdi-account-plus"
              class="rounded-pill font-weight-black"
              @click="charSettingDialog = true"
            >
              대표 캐릭터를 설정하세요
            </v-btn>
          </div>

          <v-spacer></v-spacer>

          <template v-if="!isMobileMode">
            <v-btn to="/" prepend-icon="mdi-sword-cross">공격대 만들기</v-btn>
            <v-btn to="/schedule" prepend-icon="mdi-calendar-clock"
              >버스 스케줄</v-btn
            >
            <v-btn prepend-icon="mdi-clipboard-check-multiple" to="/homework"
              >숙제 스케줄</v-btn
            >
            <v-btn to="/fixed-schedule" prepend-icon="mdi-shield-star">
              고정 스케줄
            </v-btn>
            <v-btn to="/homework-schedule" prepend-icon="mdi-format-list-checks"
              >개인 숙제 관리</v-btn
            >
            <v-btn to="/board" prepend-icon="mdi-calculator">쌀산기</v-btn>
            <v-btn to="/guestbook" prepend-icon="mdi-message-draw"
              >커뮤니티</v-btn
            >
          </template>
          <v-btn
            icon
            @click="handleLogout"
            class="ms-2"
            color=""
            variant="text"
            title="로그아웃"
          >
            <v-icon>mdi-logout</v-icon>
          </v-btn>

          <v-btn icon @click="toggleTheme" class="ms-2">
            <v-icon>{{
              theme === "light" ? "mdi-weather-night" : "mdi-weather-sunny"
            }}</v-icon>
          </v-btn>
        </v-app-bar>

        <v-bottom-navigation
          v-if="isMobileMode"
          color="primary"
          grow
          border-top
        >
          <v-btn to="/homework-schedule">
            <v-icon>mdi-format-list-checks</v-icon>
            <span>개인 숙제 관리</span>
          </v-btn>

          <v-btn to="/guestbook">
            <v-icon>mdi-message-draw</v-icon>
            <span>커뮤니티</span>
          </v-btn>
        </v-bottom-navigation>

        <v-navigation-drawer
          v-if="isLoggedIn && !isMobileMode"
          v-model="eventDrawer"
          location="right"
          :rail="eventRail"
          permanent
          @click="eventRail = false"
          width="280"
          elevation="5"
          border
          class="event-toolbar"
        >
          <v-list-item nav class="px-2 py-3">
            <template v-slot:prepend>
              <v-btn
                variant="text"
                :icon="eventRail ? 'mdi-chevron-left' : 'mdi-chevron-right'"
                @click.stop="eventRail = !eventRail"
              ></v-btn>
            </template>
            <v-list-item-title class="font-weight-black"
              >일일 콘텐츠</v-list-item-title
            >
          </v-list-item>

          <v-divider></v-divider>

          <div v-if="!eventRail" class="pa-4">
            <div class="mb-6">
              <div class="d-flex align-center mb-3">
                <v-icon color="orange-darken-2" size="small" class="me-2"
                  >mdi-portal</v-icon
                >
                <span class="text-subtitle-2 font-weight-black"
                  >오늘의 카오스 게이트</span
                >
              </div>

              <div v-if="todayEvents.chaosGate.length > 0">
                <v-card
                  v-for="cg in todayEvents.chaosGate"
                  :key="cg.name"
                  variant="tonal"
                  class="pa-2 rounded-lg border-0 position-relative"
                  :color="
                    clearedEvents.chaosGate
                      ? 'grey-darken-3'
                      : 'orange-darken-4'
                  "
                  :style="{ opacity: clearedEvents.chaosGate ? 0.6 : 1 }"
                >
                  <div v-if="clearedEvents.chaosGate" class="success-stamp">
                    SUCCESS
                  </div>

                  <div class="d-flex align-center">
                    <v-avatar
                      size="32"
                      class="me-2 border"
                      :style="{
                        filter: clearedEvents.chaosGate
                          ? 'grayscale(1)'
                          : 'none',
                      }"
                    >
                      <v-img :src="cg.icon"></v-img>
                    </v-avatar>
                    <div class="overflow-hidden flex-grow-1">
                      <div class="text-caption font-weight-bold text-truncate">
                        {{ cg.name }}
                      </div>
                      <div
                        class="text-caption text-orange-darken-2 font-weight-black"
                      >
                        ⏰ {{ cg.time }}
                      </div>
                    </div>
                    <v-btn
                      size="x-small"
                      variant="flat"
                      class="ms-2"
                      :color="
                        clearedEvents.chaosGate ? 'grey' : 'orange-darken-2'
                      "
                      @click.stop="toggleEventClear('chaosGate')"
                    >
                      {{ clearedEvents.chaosGate ? "UNDO" : "DONE" }}
                    </v-btn>
                  </div>
                </v-card>
              </div>
              <div v-else class="text-caption text-disabled ps-7">
                오늘은 열리지 않습니다.
              </div>
            </div>

            <div class="mb-6">
              <div class="d-flex align-center mb-3">
                <v-icon color="red-darken-2" size="small" class="me-2"
                  >mdi-skull</v-icon
                >
                <span class="text-subtitle-2 font-weight-black"
                  >오늘의 필드 보스</span
                >
              </div>

              <div v-if="todayEvents.fieldBoss.length > 0">
                <v-card
                  v-for="fb in todayEvents.fieldBoss"
                  :key="fb.name"
                  variant="tonal"
                  class="pa-2 rounded-lg border-0 position-relative"
                  :color="
                    clearedEvents.fieldBoss ? 'grey-darken-3' : 'red-darken-4'
                  "
                  :style="{ opacity: clearedEvents.fieldBoss ? 0.6 : 1 }"
                >
                  <div v-if="clearedEvents.fieldBoss" class="success-stamp red">
                    SUCCESS
                  </div>

                  <div class="d-flex align-center">
                    <v-avatar
                      size="32"
                      class="me-2 border"
                      :style="{
                        filter: clearedEvents.fieldBoss
                          ? 'grayscale(1)'
                          : 'none',
                      }"
                    >
                      <v-img :src="fb.icon"></v-img>
                    </v-avatar>
                    <div class="overflow-hidden flex-grow-1">
                      <div class="text-caption font-weight-bold text-truncate">
                        {{ fb.name }}
                      </div>
                      <div
                        class="text-caption text-red-darken-2 font-weight-black"
                      >
                        ⏰ {{ fb.time }}
                      </div>
                    </div>
                    <v-btn
                      size="x-small"
                      variant="flat"
                      class="ms-2"
                      :color="clearedEvents.fieldBoss ? 'grey' : 'red-darken-2'"
                      @click.stop="toggleEventClear('fieldBoss')"
                    >
                      {{ clearedEvents.fieldBoss ? "UNDO" : "DONE" }}
                    </v-btn>
                  </div>
                </v-card>
              </div>
              <div v-else class="text-caption text-disabled ps-7">
                오늘은 등장하지 않습니다.
              </div>
            </div>

            <div class="mt-4">
              <div class="d-flex align-center mb-3">
                <v-icon color="blue-darken-2" size="small" class="me-2"
                  >mdi-island</v-icon
                >
                <span class="text-subtitle-2 font-weight-black"
                  >오늘의 모험 섬</span
                >
              </div>

              <div v-if="todayEvents.islands.length > 0">
                <v-card
                  v-for="island in todayEvents.islands"
                  :key="island.name"
                  variant="tonal"
                  class="mb-3 pa-2 rounded-lg border-0 position-relative"
                  :color="
                    clearedEvents.islands[island.name]
                      ? 'grey-darken-3'
                      : 'blue-darken-4'
                  "
                  :style="{
                    opacity: clearedEvents.islands[island.name] ? 0.6 : 1,
                  }"
                >
                  <div
                    v-if="clearedEvents.islands[island.name]"
                    class="success-stamp blue"
                  >
                    SUCCESS
                  </div>

                  <div class="d-flex align-center">
                    <div
                      class="position-relative me-2"
                      :style="{
                        filter: clearedEvents.islands[island.name]
                          ? 'grayscale(1)'
                          : 'none',
                      }"
                    >
                      <v-avatar size="32" class="border">
                        <v-img :src="island.icon"></v-img>
                      </v-avatar>
                      <v-avatar
                        v-if="island.hasGold"
                        size="16"
                        class="position-absolute"
                        style="
                          bottom: -2px;
                          right: -2px;
                          background: rgba(0, 0, 0, 0.6);
                          border: 1px solid #ffd700;
                        "
                      >
                        <v-img :src="island.goldIcon"></v-img>
                      </v-avatar>
                    </div>
                    <div class="overflow-hidden flex-grow-1">
                      <div class="d-flex align-center">
                        <span
                          class="text-caption font-weight-bold text-truncate"
                          >{{ island.name }}</span
                        >
                        <v-chip
                          v-if="island.hasGold"
                          size="x-small"
                          color="warning"
                          variant="flat"
                          class="ms-1"
                          style="height: 14px; font-size: 8px"
                          >GOLD</v-chip
                        >
                      </div>
                      <div
                        class="text-caption text-blue-darken-2 font-weight-black"
                      >
                        ⏰ {{ island.time }}
                      </div>
                    </div>
                    <v-btn
                      size="x-small"
                      variant="flat"
                      class="ms-2"
                      :color="
                        clearedEvents.islands[island.name]
                          ? 'grey'
                          : 'blue-darken-2'
                      "
                      @click.stop="toggleEventClear('island', island.name)"
                    >
                      {{ clearedEvents.islands[island.name] ? "UNDO" : "DONE" }}
                    </v-btn>
                  </div>
                </v-card>
              </div>
              <div v-else class="text-caption text-disabled ps-7">
                오늘 남은 일정이 없습니다.
              </div>
            </div>
          </div>

          <v-list v-else nav class="d-flex flex-column align-center pt-4">
            <v-icon color="orange-darken-2" class="mb-6">mdi-portal</v-icon>
            <v-icon color="red-darken-2" class="mb-6">mdi-skull</v-icon>
            <v-icon color="blue-darken-2">mdi-island</v-icon>
          </v-list>
        </v-navigation-drawer>

        <v-main>
          <router-view></router-view>

          <v-fade-transition>
            <v-btn
              v-show="showFab"
              icon="mdi-chevron-up"
              color="primary"
              size="large"
              elevation="8"
              class="scroll-to-top"
              @click="scrollToTop"
            ></v-btn>
          </v-fade-transition>
        </v-main>
      </template>

      <v-dialog v-model="charSettingDialog" max-width="400">
        <v-card class="rounded-xl pa-4">
          <v-card-title class="font-weight-black d-flex align-center">
            <v-icon class="me-2">mdi-account-multiple-plus</v-icon> 대표 캐릭터
            관리 ({{ mainCharSlots.length }}/5)
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center gap-2 mb-4">
              <v-text-field
                v-model="searchCharName"
                label="새 대표 캐릭터명"
                variant="outlined"
                hide-details
                density="compact"
                color="orange-darken-2"
                @keyup.enter="addNewSlot"
              ></v-text-field>
              <v-btn
                color="orange-darken-2"
                icon="mdi-account-search"
                variant="flat"
                class="ms-2"
                :loading="isFetching"
                @click="addNewSlot"
              ></v-btn>
            </div>
            <v-divider v-if="mainCharSlots.length > 0" class="my-4"></v-divider>
            <v-list v-if="mainCharSlots.length > 0" class="bg-transparent pa-0">
              <v-list-item
                v-for="char in mainCharSlots"
                :key="char.name"
                class="bg-grey-darken-4 rounded-lg mb-2 pa-2"
              >
                <template v-slot:prepend
                  ><v-avatar size="40" border
                    ><v-img :src="char.img" cover></v-img></v-avatar
                ></template>
                <v-list-item-title class="font-weight-bold text-subtitle-2">{{
                  char.name
                }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption"
                  >Lv. {{ char.level }}</v-list-item-subtitle
                >
                <template v-slot:append
                  ><v-btn
                    icon="mdi-delete-outline"
                    variant="text"
                    color="error"
                    size="small"
                    @click="removeSlot(char.name)"
                  ></v-btn
                ></template>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions
            ><v-spacer></v-spacer
            ><v-btn variant="text" @click="charSettingDialog = false"
              >닫기</v-btn
            ></v-card-actions
          >
        </v-card>
      </v-dialog>
    </template>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed, provide, onUnmounted } from "vue";
import axios from "axios";
// [수정] auth 추가 임포트
import { db, auth } from "./firebase";
import { onAuthStateChanged, getRedirectResult, getAuth } from "firebase/auth";
import { loginWithDiscord, logout } from "./auth";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from "firebase/firestore";
import { useRouter } from "vue-router";

import { useDisplay } from "vuetify";

const SKIP_AUTH_KEY = "access";
const SKIP_AUTH_VALUE = "member_guest";

const { mobile, width } = useDisplay();

const isMobileDevice = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
});

const isMobileMode = computed(() => {
  return isMobileDevice.value || width.value < 600;
});

const router = useRouter();

// --- 인증 관련 상태 ---
const isLoggedIn = ref(false);
const isAuthLoading = ref(true);

// --- 기존 상태 ---
const theme = ref(localStorage.getItem("theme") || "light");
const mainCharSlots = ref([]);
const currentMainName = ref(localStorage.getItem("current_main_name") || "");
const charSettingDialog = ref(false);
const searchCharName = ref("");
const isFetching = ref(false);
const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";
const topVillains = ref([]);
const topRosterMembers = ref([]);
const topRosterCount = ref(0);
const showFab = ref(false);

// [추가] <script setup> 내부에 삽입
const eventDrawer = ref(true);
const eventRail = ref(true);
const todayEvents = ref({ chaosGate: [], fieldBoss: [], islands: [] });
// 완료 상태 관리 (로컬 스토리지와 동기화됨)
const clearedEvents = ref({
  chaosGate: false,
  fieldBoss: false,
  islands: {}, // { "포르페": true, "무릉도원": false } 식으로 저장
});

const fetchLostArkCalendar = async () => {
  if (!API_KEY) return;
  try {
    const res = await axios.get(
      "https://developer-lostark.game.onstove.com/gamecontents/calendar",
      {
        headers: { Authorization: `bearer ${API_KEY.trim()}` },
      },
    );

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${date}`;

    console.log("todayStr ::: ", todayStr);
    console.log("res.data", res.data);

    // 1. 카오스 게이트
    const chaosGateData = res.data.find(
      (i) =>
        i.CategoryName === "카오스게이트" || i.CategoryName === "카오스 게이트",
    );
    if (chaosGateData) {
      const futureTimes = chaosGateData.StartTimes.filter(
        (t) => t.startsWith(todayStr) && new Date(t) > now,
      );
      todayEvents.value.chaosGate =
        futureTimes.length > 0
          ? [
              {
                name: chaosGateData.ContentsName,
                icon: chaosGateData.ContentsIcon,
                time: futureTimes[0].split("T")[1].substring(0, 5),
              },
            ]
          : [];
    }

    // 2. 필드 보스 (아이콘 추가)
    const fieldBossData = res.data.find((i) => i.CategoryName === "필드보스");
    if (fieldBossData) {
      const futureTimes = fieldBossData.StartTimes.filter(
        (t) => t.startsWith(todayStr) && new Date(t) > now,
      );
      todayEvents.value.fieldBoss =
        futureTimes.length > 0
          ? [
              {
                name: fieldBossData.ContentsName,
                icon: fieldBossData.ContentsIcon,
                time: futureTimes[0].split("T")[1].substring(0, 5),
              },
            ]
          : [];
    }

    const islandsData = res.data.filter((i) => i.CategoryName === "모험 섬");
    todayEvents.value.islands = islandsData
      .map((i) => {
        const futureTimes = i.StartTimes.filter(
          (t) => t.startsWith(todayStr) && new Date(t) > now,
        ).map((t) => t.split("T")[1].substring(0, 5));

        // 보상 목록에서 "골드" 아이템 찾기
        const goldReward = i.RewardItems[0]?.Items.find(
          (item) => item.Name === "골드",
        );

        return {
          name: i.ContentsName,
          icon: i.ContentsIcon,
          time: futureTimes.length > 0 ? futureTimes[0] : null,
          hasGold: !!goldReward, // 골드 보상 존재 여부 (boolean)
          goldIcon: goldReward ? goldReward.Icon : null, // 골드 아이콘 URL
        };
      })
      .filter((island) => island.time !== null);
  } catch (error) {
    console.error("캘린더 데이터 호출 실패:", error);
  }
};

// App.vue 스크립트 부분
//const MY_GUILD_ID = "1376571141556277380"; // "1295559813001908301"

const ALLOWED_GUILD_IDS = [
  "1376571141556277380", // 기존 길드 서버
  "1295559813001908301", // 새로 추가할 길드 서버
];

const forceOpenExternal = () => {
  const currentUrl = window.location.href;
  if (isIOS) {
    window.location.href = `kakaotalk://web/openExternalApp?url=${encodeURIComponent(currentUrl)}`;
  } else if (isAndroid) {
    window.location.href = `intent://${currentUrl.replace(/https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
  }
};

// App.vue 내 handleLogin 함수 부분
const handleLogin = async () => {
  try {
    const loginResult = await loginWithDiscord();
    if (!loginResult || !loginResult.accessToken) {
      throw new Error("토큰을 가져오지 못했습니다.");
    }

    const { accessToken } = loginResult;

    // 디스코드 가입 서버 목록 요청
    const res = await axios.get("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const guilds = res.data;

    const isMember = guilds.some((guild) =>
      ALLOWED_GUILD_IDS.includes(guild.id),
    );

    if (isMember) {
      isLoggedIn.value = true;
      if (mobile.value) {
        router.push("/homework-schedule");
      }
    } else {
      alert("흐흣 길드 멤버만 이용 가능합니다.");
      await logout(); // 서버 미가입 시 강제 로그아웃
      isLoggedIn.value = false;
    }
  } catch (error) {
    console.error("인증 실패:", error);
    // 에러 발생 시(401 포함) 무조건 로그아웃 처리하여 진입 차단
    await logout();
    isLoggedIn.value = false;
    alert(
      "디스코드 인증 서버와 통신 중 오류가 발생했습니다. 다시 로그인해주세요.",
    );
  }
};

const handleLogout = async () => {
  if (confirm("로그아웃 하시겠습니까?")) {
    await logout();
    isLoggedIn.value = false;
    location.reload(); // 안전한 세션 정리를 위해 새로고침 추천
  }
};

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const skipKey = urlParams.get(SKIP_AUTH_KEY);

  if (skipKey === SKIP_AUTH_VALUE) {
    console.log("⚠️ 파라미터에 의해 인증이 우회되었습니다.");
    isLoggedIn.value = true;
    isAuthLoading.value = false;

    // 파라미터 로그인의 경우 Firestore 스냅샷 등을 바로 실행해줘야 합니다.
    setupFirestoreSnapshots();

    // URL에서 파라미터를 깔끔하게 제거하고 싶다면 아래 주석 해제 (새로고침 시 로그인 풀림 방지 필요시 주의)
    //window.history.replaceState({}, document.title, window.location.pathname);
  }

  // 1. 리다이렉트 로그인 결과 확인 (signInWithRedirect 사용 시 필수)
  // 라우터 가드 이후, 돌아온 페이지에서 토큰을 처리하기 위해 가장 먼저 실행합니다.
  try {
    // [수정] getRedirectResult() 안에 'auth'를 반드시 넣어줘야 합니다.
    const loginResult = await getRedirectResult(auth);

    if (loginResult) {
      isLoggedIn.value = true;
    }
  } catch (error) {
    // 여기서 초기화 관련 에러가 발생했다면 auth 객체가 제대로 생성되지 않은 것입니다.
    console.error("리다이렉트 처리 중 오류:", error);
  }
  // 2. 파이어베이스 인증 상태 감시
  onAuthStateChanged(auth, (user) => {
    if (isLoggedIn.value) {
      isAuthLoading.value = false;
      return;
    }

    if (user) {
      isLoggedIn.value = true;
      setupFirestoreSnapshots();
    } else {
      isLoggedIn.value = false;
    }
    isAuthLoading.value = false;
  });

  // 3. 사용자 환경 설정 로드 (인증 여부와 상관없는 로컬 로직)
  const savedSlots = localStorage.getItem("main_char_slots");
  if (savedSlots) mainCharSlots.value = JSON.parse(savedSlots);
  if (!currentMainName.value && mainCharSlots.value.length > 0) {
    switchAccount(mainCharSlots.value[0].name);
  }

  checkWeeklyReset();
  window.addEventListener("scroll", handleScroll);

  loadDailyStatus();

  if (isLoggedIn.value) {
    fetchLostArkCalendar();
  }
});

const loadDailyStatus = () => {
  const saved = localStorage.getItem("lostark_daily_clears");
  const lastUpdate = localStorage.getItem("lostark_daily_last_date");

  if (saved && lastUpdate) {
    const now = new Date();

    // 로아 기준 '오늘'의 시작 시간(오전 6시)을 구하는 로직
    const getStandardTime = (date) => {
      const d = new Date(date);
      if (d.getHours() < 6) d.setDate(d.getDate() - 1); // 6시 전이면 어제로 취급
      d.setHours(6, 0, 0, 0);
      return d.getTime();
    };

    // 저장된 날짜와 현재 날짜의 '6시 기준 시점'이 다르면 초기화
    if (getStandardTime(now) !== getStandardTime(new Date(lastUpdate))) {
      clearedEvents.value = { chaosGate: false, fieldBoss: false, islands: {} };
      localStorage.removeItem("lostark_daily_clears");
    } else {
      clearedEvents.value = JSON.parse(saved);
    }
  }
};

// 상태 변경 시 저장하는 함수
const toggleEventClear = (type, islandName = null) => {
  if (type === "island") {
    clearedEvents.value.islands[islandName] =
      !clearedEvents.value.islands[islandName];
  } else {
    clearedEvents.value[type] = !clearedEvents.value[type];
  }

  localStorage.setItem(
    "lostark_daily_clears",
    JSON.stringify(clearedEvents.value),
  );
  localStorage.setItem("lostark_daily_last_date", new Date().toISOString());
};

const setupFirestoreSnapshots = () => {
  // 빌런 추적
  const qVillain = query(
    collection(db, "villains"),
    orderBy("reportCount", "desc"),
    limit(10),
  );
  onSnapshot(qVillain, (snapshot) => {
    if (!snapshot.empty) {
      const maxCount = snapshot.docs[0].data().reportCount;
      topVillains.value = snapshot.docs
        .filter((doc) => doc.data().reportCount === maxCount)
        .map((doc) => ({ name: doc.id, count: doc.data().reportCount }));
    }
  });

  // 원정대 통계
  const qTop = query(
    collection(db, "roster_stats"),
    orderBy("totalCount", "desc"),
    limit(1),
  );
  onSnapshot(qTop, (topSnapshot) => {
    if (!topSnapshot.empty) {
      const maxCount = topSnapshot.docs[0].data().totalCount || 0;
      topRosterCount.value = maxCount;
      const qAllTop = query(
        collection(db, "roster_stats"),
        where("totalCount", "==", maxCount),
      );
      onSnapshot(qAllTop, (allSnapshot) => {
        let allMembers = [];
        allSnapshot.forEach((doc) => {
          if (doc.data().members)
            allMembers = [...allMembers, ...doc.data().members];
        });
        topRosterMembers.value = allMembers;
      });
    }
  });
  fetchLostArkCalendar();
};

// --- 나머지 기존 함수들 (변경 없음) ---
provide("topVillains", topVillains);
provide("topRosterMembers", topRosterMembers);
provide("topRosterCount", topRosterCount);

const getCurrentSlot = computed(() =>
  mainCharSlots.value.find((c) => c.name === currentMainName.value),
);

const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
  localStorage.setItem("theme", theme.value);
};

const switchAccount = (name) => {
  currentMainName.value = name;
  localStorage.setItem("current_main_name", name);
  window.dispatchEvent(new CustomEvent("main-char-changed", { detail: name }));
};

const checkWeeklyReset = () => {
  const lastReset = localStorage.getItem("last_hw_reset");
  const now = new Date();
  const getRecentResetTime = () => {
    const d = new Date(now);
    const day = d.getDay();
    const diff = day < 3 || (day === 3 && d.getHours() < 6) ? day + 4 : day - 3;
    d.setDate(d.getDate() - diff);
    d.setHours(6, 0, 0, 0);
    return d.getTime();
  };
  const resetTime = getRecentResetTime();
  if (!lastReset || parseInt(lastReset) < resetTime) {
    mainCharSlots.value.forEach((slot) => {
      const storageKey = `hw_chars_${slot.name}`;
      const savedChars = localStorage.getItem(storageKey);
      if (savedChars) {
        const chars = JSON.parse(savedChars);
        const resetChars = chars.map((c) => ({
          ...c,
          completedTasks: c.completedTasks.filter((id) =>
            ["chaos", "guardian"].includes(id),
          ),
        }));
        localStorage.setItem(storageKey, JSON.stringify(resetChars));
      }
    });
    localStorage.setItem("last_hw_reset", resetTime.toString());
    window.dispatchEvent(
      new CustomEvent("main-char-changed", { detail: currentMainName.value }),
    );
  }
};

const addNewSlot = async () => {
  if (!searchCharName.value || mainCharSlots.value.length >= 5) return;
  isFetching.value = true;
  try {
    const url = `/api/armories/characters/${encodeURIComponent(searchCharName.value)}/profiles`;
    const res = await axios.get(url, {
      headers: { Authorization: `bearer ${API_KEY.trim()}` },
    });
    if (res.data) {
      const data = res.data;
      const newChar = {
        name: data.CharacterName,
        level: data.ItemAvgLevel,
        className: data.CharacterClassName,
        img: data.CharacterImage,
      };
      if (!mainCharSlots.value.some((c) => c.name === newChar.name)) {
        mainCharSlots.value.push(newChar);
        localStorage.setItem(
          "main_char_slots",
          JSON.stringify(mainCharSlots.value),
        );
        switchAccount(newChar.name);
      }
      searchCharName.value = "";
    }
  } catch (e) {
    alert("캐릭터를 찾을 수 없습니다.");
  } finally {
    isFetching.value = false;
  }
};

const removeSlot = (name) => {
  if (!confirm(`${name} 슬롯을 제거하시겠습니까?`)) return;
  mainCharSlots.value = mainCharSlots.value.filter((c) => c.name !== name);
  localStorage.setItem("main_char_slots", JSON.stringify(mainCharSlots.value));
  if (currentMainName.value === name)
    switchAccount(mainCharSlots.value[0]?.name || "");
};

const handleScroll = () => {
  showFab.value = window.scrollY > 300;
};
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style>
/* 기존 스타일 유지 */
body {
  font-family: "Pretendard", sans-serif;
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

.scroll-to-top {
  position: fixed !important;
  bottom: 32px; /* PC 기본 위치 */
  right: 32px;
  z-index: 99;
  transition: bottom 0.3s ease; /* 위치 변경 시 부드럽게 이동 */
}

/* 모바일 환경 (v-bottom-navigation 높이를 고려) */
@media (max-width: 600px) {
  .scroll-to-top {
    /* 하단 바 높이가 보통 56px~64px 정도이므로, 
       그보다 높은 위치(약 80px~100px)로 설정합니다 */
    bottom: 80px !important;
    right: 16px; /* 모바일은 화면이 좁으니 우측 여백도 살짝 줄임 */
  }
}

.stamp-no-bg :deep(img) {
  /* 이미지 자체의 미세한 검은 테두리가 있다면 1~2px 정도 안쪽으로 잘라냅니다 */
  clip-path: inset(1px);
  object-fit: contain;
}

.clean-appbar-logo :deep(img) {
  /* 1. 이미지 비율을 유지하며 컨테이너 안에 쏙 들어가게 합니다 (cover 제거 효과) */
  object-fit: contain !important;

  /* 2. 로그인 오버레이처럼 미세한 검은 테두리를 깎아냅니다 */
  clip-path: inset(1px);

  /* 3. 혹시나 배경색이 남아있다면 투명하게 강제합니다 */
  /*background: transparent !important;*/
}

.auth-loading-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #121212; /* 배경을 다크하게 잡아주면 더 자연스럽습니다 */
}

/* [추가] <style> 태그 하단 */
.event-toolbar {
  z-index: 1000 !important; /* AppBar보다 아래, Content보다 위 */
}

.v-theme--dark .event-toolbar {
  background-color: #111111 !important;
}

.event-toolbar :deep(.v-navigation-drawer__content) {
  overflow-x: hidden;
}

/* 접혔을 때 아이콘 정렬 간격 */
.v-navigation-drawer--rail .v-list-item {
  justify-content: center !important;
}

/* 도장 스타일 */
.success-stamp {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  border: 2px solid #ff5252;
  color: #ff5252;
  font-size: 1.2rem;
  font-weight: 900;
  padding: 0px 6px;
  border-radius: 4px;
  z-index: 10;
  pointer-events: none; /* 버튼 클릭 방해 금지 */
  letter-spacing: 1px;
  opacity: 0.9;
}

/* 흑백 처리 로직 */
.v-card[color="grey-darken-3"] {
  filter: grayscale(0.8);
}
</style>
