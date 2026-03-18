<template>
  <v-container fluid class="fill-height align-start pa-6">
    <v-row>
      <v-col cols="12" md="3" lg="2">
        <div class="sticky-sidebar">
          <v-card
            variant="flat"
            class="rounded-lg pa-3 d-flex flex-column"
            border
            style="height: 100%"
          >
            <div class="text-subtitle-1 font-weight-bold mb-2">
              <v-icon color="primary" class="me-1" size="small"
                >mdi-account-multiple</v-icon
              >
              전체 기사 명단
            </div>
            <div class="search-container mb-3">
              <v-text-field
                v-model="searchQuery"
                prepend-inner-icon="mdi-magnify"
                placeholder="이름/직업 검색"
                variant="solo"
                density="compact"
                flat
                hide-details
                rounded="sm"
                class="compact-search-field"
                clearable
              ></v-text-field>
            </div>
            <v-divider class="mb-4"></v-divider>
            <div class="character-list-wrapper">
              <draggable
                :list="sortedCharList"
                :group="{ name: 'pilots', pull: 'clone', put: false }"
                :clone="cloneCharacter"
                item-key="id"
              >
                <template #item="{ element }">
                  <v-card
                    class="mb-2 pa-2 cursor-move rounded-md bg-surface"
                    variant="outlined"
                    border
                  >
                    <div class="d-flex align-center gap-2">
                      <v-avatar size="32" border
                        ><v-img :src="element.img || ''" cover></v-img
                      ></v-avatar>
                      <div class="flex-grow-1 overflow-hidden">
                        <div
                          class="font-weight-bold text-truncate text-high-emphasis"
                          style="font-size: 0.8rem"
                        >
                          {{ element.job }} | {{ element.name }}
                        </div>

                        <div
                          class="text-caption text-truncate text-medium-emphasis"
                          style="font-size: 0.65rem"
                        >
                          Lv.{{ element.level }}
                          <v-tooltip
                            v-if="topRosterMembers.includes(element.name)"
                            location="top"
                          >
                            <template v-slot:activator="{ props }">
                              <v-chip
                                v-bind="props"
                                size="x-small"
                                color="red"
                                variant="flat"
                                class="ms-2 px-1 pulse-badge"
                              >
                                <v-icon size="14" color="white"
                                  >mdi-skull</v-icon
                                >
                                <span
                                  class="ms-1 font-weight-bold"
                                  style="font-size: 0.7rem !important"
                                  >흐사게스타</span
                                >
                              </v-chip>
                            </template>
                            <span
                              >원정대 누적 신고 {{ topRosterCount }}회!</span
                            >
                          </v-tooltip>
                        </div>
                      </div>
                    </div>
                  </v-card>
                </template>
              </draggable>
            </div>
          </v-card>
        </div>
      </v-col>

      <v-col cols="12" md="9" lg="10">
        <v-card variant="flat" class="rounded-lg pa-4" border min-height="85vh">
          <div class="d-flex justify-space-between align-center mb-6">
            <h2 class="text-h4 font-weight-black text-primary">
              <v-icon size="large" class="me-2">mdi-calendar-clock</v-icon>버스
              예정표
            </h2>
          </div>

          <v-row class="mb-8">
            <v-col cols="12">
              <div
                class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center opacity-80"
              >
                <v-icon color="primary" class="me-2">mdi-calendar-range</v-icon>
                주간 버스 일정 드래그(오늘 기준 7일)
              </div>
              <div class="calendar-wrapper d-flex">
                <div
                  v-for="day in daysOfWeek"
                  :key="day.fullDate"
                  class="calendar-day-column flex-grow-1"
                >
                  <div
                    class="day-header pa-2 text-center font-weight-bold"
                    :class="{ 'today-header': isToday(day.fullDate) }"
                  >
                    {{ day.display }}
                  </div>
                  <draggable
                    :list="calendarSchedules[day.fullDate]"
                    group="schedule-items"
                    item-key="id"
                    class="day-dropzone pa-1"
                    :disabled="false"
                    @change="(e) => onDateDrop(e, day.fullDate)"
                  >
                    <template #item="{ element }">
                      <v-chip
                        size="x-small"
                        :color="getDifficultyColor(element.difficulty)"
                        variant="flat"
                        :class="{
                          'elevation-5': hoveredId === element.id,
                          'opacity-50 cursor-not-allowed': isLocked(element),
                        }"
                        class="mb-1 w-100 justify-start px-1 rounded-sm schedule-chip transition-swing"
                        label
                        :style="
                          isLocked(element) ? 'pointer-events: none;' : ''
                        "
                        @mouseenter="hoveredId = element.id"
                        @mouseleave="hoveredId = null"
                        @click="scrollToDetail(element.id)"
                      >
                        <span class="text-truncate font-weight-black">
                          [{{ element.difficulty[0] }}] {{ element.raid }}
                        </span>
                      </v-chip>
                    </template>
                  </draggable>
                </div>

                <div class="calendar-day-column pending-column flex-grow-1">
                  <div
                    class="day-header pa-2 text-center font-weight-bold bg-amber-lighten-4 text-amber-darken-4"
                  >
                    출발 미정
                  </div>
                  <draggable
                    :list="pendingSchedules"
                    group="schedule-items"
                    item-key="id"
                    class="day-dropzone pa-1 bg-amber-lighten-5"
                    @change="(e) => onDateDrop(e, '')"
                  >
                    <template #item="{ element }">
                      <v-chip
                        size="x-small"
                        color="amber-darken-2"
                        variant="flat"
                        class="mb-1 w-100 justify-start px-1 rounded-sm"
                        label
                        @mouseenter="hoveredId = element.id"
                        @mouseleave="hoveredId = null"
                        @click="scrollToDetail(element.id)"
                      >
                        <span class="text-truncate font-weight-black">{{
                          element.raid
                        }}</span>
                      </v-chip>
                    </template>
                  </draggable>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-divider class="mb-8"></v-divider>

          <v-row>
            <v-col
              v-if="upcomingSchedules.length === 0"
              cols="12"
              class="text-center py-10"
            >
              <v-icon size="100" color="grey-lighten-2">mdi-bus-alert</v-icon>
              <p class="text-h6 text-grey-darken-1 mt-4">
                예정된 운행표가 없습니다.
              </p>
            </v-col>

            <v-col
              v-for="bus in upcomingSchedules"
              :key="bus.id"
              cols="12"
              md="6"
              xl="4"
            >
              <v-card
                :id="`bus-card-${bus.id}`"
                border
                :elevation="
                  hoveredId === bus.id || clickedId === bus.id ? 8 : 2
                "
                class="rounded-xl overflow-hidden mb-6 mx-auto bus-card transition-all"
                :class="{
                  'today-card': isToday(bus.dateTime),
                  'pending-card': !bus.dateTime,
                  'highlight-focus':
                    hoveredId === bus.id || clickedId === bus.id,
                }"
              >
                <v-toolbar
                  :color="
                    !bus.dateTime
                      ? 'amber-darken-2'
                      : isToday(bus.dateTime)
                        ? 'deep-purple-accent-3'
                        : 'primary'
                  "
                  density="compact"
                  flat
                  :class="{ 'opacity-80': isLocked(bus) }"
                >
                  <v-btn
                    v-if="bus.password"
                    :icon="isLocked(bus) ? 'mdi-lock' : 'mdi-lock-open-variant'"
                    size="small"
                    variant="text"
                    class="ms-1"
                    :color="isLocked(bus) ? 'amber-lighten-4' : 'white'"
                    @click="toggleLock(bus)"
                  ></v-btn>
                  <v-icon
                    v-else
                    :icon="
                      !bus.dateTime
                        ? 'mdi-help-circle-outline'
                        : 'mdi-shield-cross'
                    "
                    class="ms-3 me-2"
                    size="small"
                  ></v-icon>

                  <div
                    class="d-flex align-center flex-grow-1 overflow-hidden"
                    style="min-width: 0"
                  >
                    <span class="text-subtitle-1 font-weight-black me-2">{{
                      bus.raid
                    }}</span>

                    <div
                      class="d-flex align-center flex-grow-1 overflow-hidden"
                      style="min-width: 0; cursor: pointer"
                      @click="openRaidPicker(bus)"
                    >
                      <v-chip
                        size="small"
                        :color="getDifficultyColor(bus.difficulty)"
                        class="font-weight-black text-white px-2 flex-shrink-0"
                        variant="flat"
                        label
                      >
                        {{ bus.difficulty }}
                      </v-chip>

                      <v-tooltip v-if="bus.memo" location="top" max-width="300">
                        <template v-slot:activator="{ props }">
                          <v-icon
                            v-bind="props"
                            color="amber-lighten-3"
                            size="small"
                            class="ms-2 pulse-memo-icon"
                          >
                            mdi-note-text
                          </v-icon>
                        </template>
                        <div class="pa-1">
                          <div class="text-caption font-weight-black mb-1">
                            MEMO
                          </div>
                          <div class="text-body-2">{{ bus.memo }}</div>
                        </div>
                      </v-tooltip>

                      <v-icon
                        size="small"
                        class="ms-1 opacity-60"
                        v-if="!isLocked(bus)"
                        >mdi-pencil-circle</v-icon
                      >
                      <v-chip
                        v-if="isToday(bus.dateTime)"
                        size="small"
                        color="white"
                        class="ms-2 font-weight-black today-badge flex-shrink-0"
                        variant="flat"
                        label
                      >
                        <v-icon start size="14" class="today-icon"
                          >mdi-star</v-icon
                        >
                        TODAY
                      </v-chip>
                      <v-chip
                        v-else-if="!bus.dateTime"
                        size="x-small"
                        color="white"
                        variant="outlined"
                        class="ms-2 flex-shrink-0"
                        >출발 미정</v-chip
                      >
                    </div>
                  </div>

                  <v-spacer></v-spacer>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    @click="deleteSchedule(bus.id)"
                    :disabled="isLocked(bus)"
                  ></v-btn>
                </v-toolbar>

                <v-card-text class="pa-6">
                  <div class="d-flex align-center justify-space-between mb-4">
                    <div
                      class="text-h6 font-weight-bold d-flex align-center"
                      :class="
                        !bus.dateTime
                          ? 'text-amber-darken-3'
                          : isToday(bus.dateTime)
                            ? 'text-deep-purple-accent-3'
                            : 'text-grey-darken-1'
                      "
                    >
                      <v-icon class="me-2" size="small"
                        >mdi-clock-outline</v-icon
                      >
                      {{ formatDateTime(bus.dateTime) }}
                    </div>
                    <v-btn
                      v-if="bus.dateTime"
                      size="small"
                      variant="tonal"
                      color="primary"
                      prepend-icon="mdi-clock-edit"
                      @click="openTimePicker(bus)"
                      :disabled="isLocked(bus)"
                    >
                      시간 수정
                    </v-btn>
                  </div>

                  <v-divider class="mb-4"></v-divider>
                  <v-alert
                    v-if="bus.members.length > 0"
                    variant="tonal"
                    :color="
                      isToday(bus.dateTime)
                        ? 'deep-purple'
                        : !bus.dateTime
                          ? 'amber'
                          : 'blue'
                    "
                    class="mb-4 rounded-lg py-2"
                    density="compact"
                  >
                    <div class="d-flex justify-space-between align-center">
                      <div class="text-subtitle-2 font-weight-bold">
                        <v-icon size="small" class="me-1">mdi-arm-flex</v-icon>
                        파티 평균 전투력
                      </div>
                      <div class="text-h6 font-weight-black">
                        {{ calculateAveragePower(bus.members) }}
                      </div>
                    </div>
                  </v-alert>

                  <div
                    class="text-subtitle-2 mb-2 font-weight-bold d-flex align-center text-grey-darken-1"
                  >
                    <v-icon size="small" class="me-1">mdi-account-group</v-icon>
                    참여 캐릭터 명단
                  </div>
                  <draggable
                    v-model="bus.members"
                    group="pilots"
                    item-key="id"
                    class="d-flex flex-wrap pa-2 rounded-lg border-dashed dropzone-area"
                    :disabled="isLocked(bus)"
                    @change="updateSchedule(bus)"
                  >
                    <template #item="{ element, index }">
                      <v-card
                        variant="outlined"
                        class="ma-1 pa-2 rounded-lg member-card bg-surface"
                        style="width: calc(50% - 8px); min-height: 85px"
                      >
                        <div class="d-flex justify-space-between align-start">
                          <span
                            class="text-caption font-weight-black text-primary text-truncate"
                            >{{ element.job }}</span
                          >
                          <v-btn
                            icon="mdi-close"
                            size="14"
                            variant="text"
                            color="grey"
                            v-if="!isLocked(bus)"
                            @click="removeMember(bus, index)"
                          ></v-btn>
                        </div>

                        <div class="text-body-2 font-weight-bold text-truncate">
                          {{ element.name }}
                          <v-tooltip
                            v-if="topRosterMembers.includes(element.name)"
                            location="top"
                          >
                            <template v-slot:activator="{ props }">
                              <v-chip
                                v-bind="props"
                                size="x-small"
                                color="red"
                                variant="flat"
                                class="ms-2 px-1 pulse-badge"
                              >
                                <v-icon size="14" color="white"
                                  >mdi-skull</v-icon
                                >
                                <span
                                  class="ms-1 font-weight-bold"
                                  style="font-size: 0.7rem !important"
                                  >흐사게스타</span
                                >
                              </v-chip>
                            </template>
                            <span
                              >원정대 누적 신고 {{ topRosterCount }}회!</span
                            >
                          </v-tooltip>
                        </div>

                        <div style="font-size: 0.7rem" class="mt-1">
                          <div class="text-medium-emphasis">
                            Lv.{{ element.level }}
                          </div>
                          <div class="text-blue-accent-2 font-weight-bold">
                            <v-icon size="10">mdi-sword-cross</v-icon>
                            {{ element.combatPower }}
                          </div>
                        </div>
                      </v-card>
                    </template>
                  </draggable>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="timeDialog" max-width="320">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="text-h6 font-weight-black">
          <v-icon color="primary" class="me-2">mdi-clock-edit</v-icon>운행 시간
          설정
        </v-card-title>
        <v-card-text>
          <div class="text-caption mb-4 text-medium-emphasis">
            출발 시각을 선택해주세요.
          </div>
          <v-text-field
            v-model="tempTime"
            type="time"
            variant="outlined"
            color="primary"
            rounded="lg"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" rounded="lg" @click="timeDialog = false"
            >취소</v-btn
          >
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="px-6"
            @click="saveTime"
            >저장</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editRaidDialog" max-width="400">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="text-h6 font-weight-black">
          <v-icon color="primary" class="me-2">mdi-sword-cross</v-icon>레이드
          정보 수정
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="tempRaid"
            :items="['2막', '3막', '4막', '종막', '세르카']"
            label="레이드 선택"
            variant="outlined"
            class="mb-2"
            @update:model-value="tempDifficulty = '노말'"
          ></v-select>
          <v-select
            v-model="tempDifficulty"
            :items="getDifficultyList(tempRaid)"
            label="난이도 선택"
            variant="outlined"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editRaidDialog = false">취소</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="px-6"
            @click="saveRaidInfo"
            >저장</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import draggable from "vuedraggable";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { inject } from "vue";
// App.vue에서 제공한 빌런 리스트 주입

const topVillains = inject("topVillains", []);
const topRosterMembers = inject("topRosterMembers", ref([]));
const topRosterCount = inject("topRosterCount", ref(0)); // [추가]

const schedules = ref([]);
const charList = ref([]);
const searchQuery = ref("");
const hoveredId = ref(null);
const clickedId = ref(null);

// 시간 수정 관련 상태 추가
const timeDialog = ref(false);
const tempTime = ref("");
const selectedBus = ref(null);

// [추가] 레이드 및 난이도 수정을 위한 상태
const editRaidDialog = ref(false);
const tempRaid = ref("");
const tempDifficulty = ref("");

const unlockedIds = ref([]);

// [추가] 현재 카드가 잠겨있는지 확인하는 함수
const isLocked = (bus) => {
  // 비밀번호가 설정되어 있고, 해제 리스트에 해당 ID가 없다면 잠긴 상태입니다.
  const hasPassword = bus.password && String(bus.password).trim() !== "";
  return hasPassword && !unlockedIds.value.includes(bus.id);
};

// [추가] 자물쇠 아이콘 클릭 시 작동하는 비밀번호 검증 함수
const toggleLock = (bus) => {
  if (!isLocked(bus)) {
    // 이미 풀려있는 경우 다시 잠금 처리
    unlockedIds.value = unlockedIds.value.filter((id) => id !== bus.id);
    return;
  }

  const inputPw = prompt(
    "이 스케줄의 잠금을 해제하려면 비밀번호를 입력하세요.",
  );
  if (inputPw === bus.password) {
    unlockedIds.value.push(bus.id);
  } else if (inputPw !== null) {
    alert("비밀번호가 일치하지 않습니다!");
  }
};

const openRaidPicker = (bus) => {
  if (isLocked(bus)) return; // [추가] 잠긴 상태면 팝업 차단
  selectedBus.value = bus;
  tempRaid.value = bus.raid;
  tempDifficulty.value = bus.difficulty;
  editRaidDialog.value = true;
};

// [추가] 레이드/난이도 정보 DB 업데이트
const saveRaidInfo = async () => {
  if (selectedBus.value) {
    const busRef = doc(db, "schedules", selectedBus.value.id);
    await updateDoc(busRef, {
      raid: tempRaid.value,
      difficulty: tempDifficulty.value,
    });
    editRaidDialog.value = false;
  }
};

// MakerView.vue에 있던 난이도 리스트 로직 재사용
const getDifficultyList = (raidName) => {
  if (raidName === "종막") return ["노말", "하드", "The First"];
  if (raidName === "세르카") return ["노말", "하드", "나이트메어"];
  if (raidName === "지평") return ["1단계", "2단계", "3단계"];
  return ["노말", "하드"];
};

onMounted(() => {
  const qChar = query(
    collection(db, "characters"),
    orderBy("createdAt", "desc"),
  );
  onSnapshot(qChar, (snapshot) => {
    charList.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });
  const qSched = query(collection(db, "schedules"), orderBy("dateTime", "asc"));
  onSnapshot(qSched, (snapshot) => {
    schedules.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });
});

/* --- 달력 관련 로직 (수정됨) --- */
const daysOfWeek = computed(() => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    // [수정] toISOString() 대신 로컬 시간 기준으로 YYYY-MM-DD 문자열 직접 생성
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dayNum = String(d.getDate()).padStart(2, "0");
    const localFullDate = `${year}-${month}-${dayNum}`;

    days.push({
      fullDate: localFullDate,
      display: d.toLocaleDateString("ko-KR", {
        month: "numeric",
        day: "numeric",
        weekday: "short",
      }),
    });
  }
  return days;
});

const calendarSchedules = computed(() => {
  const map = {};
  daysOfWeek.value.forEach((day) => (map[day.fullDate] = []));
  schedules.value.forEach((bus) => {
    if (bus.dateTime) {
      const dateKey = bus.dateTime.split("T")[0];
      if (map[dateKey]) map[dateKey].push(bus);
    }
  });
  return map;
});

const pendingSchedules = computed(() =>
  schedules.value.filter((bus) => !bus.dateTime),
);

const onDateDrop = async (event, targetDate) => {
  if (event.added) {
    const bus = event.added.element;
    const busRef = doc(db, "schedules", bus.id);

    // 기존 시간 보존 로직 추가
    let existingTime = "00:00";
    if (bus.dateTime && bus.dateTime.includes("T")) {
      existingTime = bus.dateTime.split("T")[1].substring(0, 5);
    }

    await updateDoc(busRef, {
      dateTime: targetDate ? `${targetDate}T${existingTime}` : "",
    });
  }
};

/* --- 시간 직접 수정 로직 추가 --- */
const openTimePicker = (bus) => {
  selectedBus.value = bus;
  if (bus.dateTime && bus.dateTime.includes("T")) {
    tempTime.value = bus.dateTime.split("T")[1].substring(0, 5);
  } else {
    tempTime.value = "00:00";
  }
  timeDialog.value = true;
};

const saveTime = async () => {
  if (selectedBus.value && tempTime.value) {
    const datePart = selectedBus.value.dateTime.split("T")[0];
    const newDateTime = `${datePart}T${tempTime.value}`;
    await updateDoc(doc(db, "schedules", selectedBus.value.id), {
      dateTime: newDateTime,
    });
    timeDialog.value = false;
  }
};

const scrollToDetail = (id) => {
  clickedId.value = id;
  setTimeout(() => {
    const element = document.getElementById(`bus-card-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 50);
};
/* -------------------- */

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

const upcomingSchedules = computed(() => {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
  );
  let list = schedules.value.filter((bus) => {
    if (!bus.dateTime) return true;
    return new Date(bus.dateTime) >= todayStart;
  });

  return [...list].sort((a, b) => {
    if (a.id === clickedId.value) return -1;
    if (b.id === clickedId.value) return 1;
    return new Date(a.dateTime || 0) - new Date(b.dateTime || 0);
  });
});

const sortedCharList = computed(() => {
  if (!searchQuery.value) return charList.value;
  const q = searchQuery.value.toLowerCase();
  const matched = charList.value.filter(
    (c) => c.name.toLowerCase().includes(q) || c.job.toLowerCase().includes(q),
  );
  const unmatched = charList.value.filter(
    (c) =>
      !c.name.toLowerCase().includes(q) && !c.job.toLowerCase().includes(q),
  );
  return [...matched, ...unmatched];
});

const calculateAveragePower = (members) => {
  if (!members || members.length === 0) return "0";
  const total = members.reduce((acc, cur) => {
    const power =
      typeof cur.combatPower === "string"
        ? parseFloat(cur.combatPower.replace(/,/g, ""))
        : cur.combatPower || 0;
    return acc + power;
  }, 0);
  return Math.floor(total / members.length).toLocaleString();
};

const updateSchedule = async (bus) => {
  try {
    const busRef = doc(db, "schedules", bus.id);
    await updateDoc(busRef, {
      members: JSON.parse(JSON.stringify(bus.members)),
    });
  } catch (e) {
    alert("업데이트 실패: " + e.message);
  }
};

// 난이도별 뱃지 색상 반환 함수
const getDifficultyColor = (difficulty) => {
  if (["The First", "나이트메어", "3단계"].includes(difficulty)) {
    return "deep-purple-accent-2"; // 🟣 보라색 (원하시는 색상)
  } else if (["하드", "2단계"].includes(difficulty)) {
    return "orange-darken-4"; // 🟠 주황색
  } else {
    return "light-green-accent-4"; // 🟢 노말 (초록색)
  }
};

const removeMember = (bus, index) => {
  bus.members.splice(index, 1);
  updateSchedule(bus);
};

const cloneCharacter = (char) => ({ ...char, id: Date.now() + Math.random() });

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "출발 미정";
  const date = new Date(dateTimeStr);
  return isNaN(date.getTime())
    ? "출발 미정"
    : date.toLocaleString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const deleteSchedule = async (id) => {
  if (confirm("해당 운행표를 삭제하시겠습니까?")) {
    try {
      await deleteDoc(doc(db, "schedules", id));
    } catch (e) {
      alert("삭제 실패: " + e.message);
    }
  }
};
</script>

<style scoped>
@media (min-width: 960px) {
  .sticky-sidebar {
    position: sticky;
    top: 24px;
    height: calc(100vh - 48px) !important;
    z-index: 10;
  }

  .character-list-wrapper {
    flex: 1;
    overflow-y: auto !important;
    padding-right: 8px;
  }
}

/* 캘린더 전체 컨테이너: 내부 요소가 튀어나오지 않게 제어 */
.calendar-wrapper {
  display: flex;
  width: 100%;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 8px;
  overflow: hidden;
  /* 중요: 칩이 삐져나오는 것 방지 */
}

/* 각 열의 너비를 1/8(12.5%)로 강제 고정 */
.calendar-day-column {
  flex: 0 0 12.5% !important;
  min-width: 0;
  /* 내부 텍스트 생략(ellipsis) 작동을 위한 필수 설정 */
  border-right: 1px solid rgba(var(--v-border-color), 0.08);
  display: flex;
  flex-direction: column;
}

/* 칩 내부 텍스트 생략 처리 강화 */
.schedule-chip {
  max-width: 100% !important;
  display: flex !important;
}

.text-truncate {
  display: block !important;
  width: 100% !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.calendar-day-column:last-child {
  border-right: none;
}

.day-header {
  font-size: 0.7rem;
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}

.today-header {
  background-color: #f5f3ff !important;
  color: #7c4dff !important;
}

.day-dropzone {
  flex-grow: 1;
  min-height: 120px;
  transition: background-color 0.2s;
}

.day-dropzone:hover {
  background-color: rgba(124, 77, 255, 0.05);
}

.pending-column {
  border-left: 2px solid #ffab00 !important;
}

.schedule-chip:hover {
  transform: translateY(-2px);
}

/* 하이라이트 및 포커스 효과 */
.highlight-focus {
  border: 3px solid #7c4dff !important;
  transform: scale(1.02);
  z-index: 10;
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.compact-search-field :deep(.v-field) {
  height: 32px !important;
  min-height: 32px !important;
  font-size: 0.75rem !important;
  padding: 0 8px !important;
}

.compact-search-field :deep(.v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 32px !important;
}

.today-card {
  border: 2px solid #7c4dff !important;
  box-shadow: 0 0 15px rgba(124, 77, 255, 0.4) !important;
  position: relative;
}

.today-badge {
  background: linear-gradient(45deg, #fff, #f5f5f5) !important;
  color: #6200ea !important;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  border-radius: 4px !important;
}

.today-icon {
  animation: glow-pulse 1.5s infinite ease-in-out;
}

@keyframes glow-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.pending-card {
  border: 2px solid #ffab00 !important;
}

.cursor-move {
  cursor: move;
}

.border-dashed {
  border: 2px dashed rgba(var(--v-border-color), 0.3) !important;
}

.dropzone-area {
  min-height: 100px;
  background-color: #f5f5f5;
}

:deep(.v-theme--dark) .dropzone-area {
  background-color: #1e1e1e !important;
}

.pulse-memo-icon {
  animation: memo-glow 2s infinite ease-in-out;
  filter: drop-shadow(0 0 2px rgba(255, 213, 79, 0.5));
}

@keyframes memo-glow {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
}

/* 툴팁 내부 텍스트 줄바꿈 허용 */
:deep(.v-tooltip__content) {
  white-space: pre-wrap !important;
  word-break: break-all !important;
  line-height: 1.4 !important;
}
</style>
