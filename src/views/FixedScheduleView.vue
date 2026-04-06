<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <v-card variant="flat" class="rounded-lg pa-6" border min-height="85vh">
          <div class="d-flex justify-space-between align-center mb-6">
            <h2 class="text-h4 font-weight-black text-primary">
              <v-icon size="large" class="me-2">mdi-shield-star</v-icon>
              고정 공격대 스케줄 관리
            </h2>
            <div class="d-flex align-center gap-3">
              <v-chip color="primary" variant="flat" class="font-weight-bold">
                내 원정대 참여 공대: {{ myFixedParties.length }}개
              </v-chip>
              <v-chip color="success" variant="tonal" class="font-weight-bold">
                이번 주 완료: {{ completedCount }}
              </v-chip>
            </div>
          </div>

          <v-row class="mb-8">
            <v-col cols="12">
              <div class="calendar-wrapper d-flex shadow-sm">
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
                    group="fixed-items"
                    item-key="id"
                    class="day-dropzone pa-1"
                    @change="(e) => onDateDrop(e, day.fullDate)"
                  >
                    <template #item="{ element }">
                      <v-chip
                        size="x-small"
                        :color="
                          element.isCleared
                            ? 'success'
                            : getDifficultyColor(element.difficulty)
                        "
                        variant="flat"
                        class="mb-1 w-100 justify-start px-1 rounded-sm schedule-chip"
                        :class="{
                          'opacity-50': element.isCleared,
                          'border-bold': isOwner(element),
                        }"
                        label
                        @click="scrollToDetail(element.id)"
                      >
                        <v-icon v-if="isOwner(element)" size="10" class="me-1"
                          >mdi-crown</v-icon
                        >
                        <v-icon size="15" class="me-1">
                          {{
                            element.isHomework === false
                              ? "mdi-bus"
                              : "mdi-clipboard-check"
                          }}
                        </v-icon>
                        <span class="text-truncate font-weight-black">
                          [{{ element.difficulty[0] }}] {{ element.raid }} |
                          {{ element.title }}
                        </span>
                      </v-chip>
                    </template>
                  </draggable>
                </div>

                <div class="calendar-day-column pending-column flex-grow-1">
                  <div
                    class="day-header pa-2 text-center font-weight-bold bg-amber-lighten-4 text-amber-darken-4"
                  >
                    일정 미정
                  </div>
                  <draggable
                    :list="pendingSchedules"
                    group="fixed-items"
                    item-key="id"
                    class="day-dropzone pa-1 bg-amber-lighten-5"
                    @change="(e) => onDateDrop(e, '일정미정')"
                  >
                    <template #item="{ element }">
                      <v-chip
                        size="x-small"
                        color="amber-darken-2"
                        variant="flat"
                        class="mb-1 w-100 justify-start px-1"
                        label
                        @click="scrollToDetail(element.id)"
                      >
                        <v-icon v-if="isOwner(element)" size="10" class="me-1"
                          >mdi-crown</v-icon
                        >
                        <v-icon size="15" class="me-1">
                          {{
                            element.isHomework === false
                              ? "mdi-bus"
                              : "mdi-clipboard-check"
                          }}
                        </v-icon>
                        <span class="text-truncate font-weight-black">
                          [{{ element.difficulty[0] }}] {{ element.raid }} |
                          {{ element.title }}
                        </span>
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
              v-for="party in myFixedParties"
              :key="party.id"
              cols="12"
              md="6"
              xl="4"
            >
              <v-card
                :id="`party-card-${party.id}`"
                border
                class="rounded-xl overflow-hidden mb-6 bus-card transition-all"
                :class="{
                  'today-card': isToday(party.departureTime),
                  'cleared-card': party.isCleared,
                }"
              >
                <v-toolbar
                  :color="
                    party.isCleared
                      ? 'success'
                      : isToday(party.departureTime)
                        ? 'deep-purple-accent-3'
                        : 'primary'
                  "
                  density="compact"
                  flat
                >
                  <v-icon size="small" class="ms-3 me-2"
                    >mdi-shield-star</v-icon
                  >

                  <span class="text-subtitle-1 font-weight-black">
                    <v-chip
                      size="x-small"
                      :color="
                        party.isHomework ? 'blue-darken-2' : 'amber-darken-3'
                      "
                      variant="flat"
                      class="ms-3 font-weight-black"
                      label
                    >
                      {{ party.isHomework ? "숙제" : "버스" }}
                    </v-chip>
                    <v-chip
                      size="x-small"
                      :color="getDifficultyColor(party.difficulty)"
                      variant="flat"
                      class="ms-2 font-weight-black border"
                    >
                      {{ party.difficulty }}
                    </v-chip>
                    {{ party.raid }} | {{ party.title }}
                  </span>

                  <v-spacer></v-spacer>
                  <v-btn
                    v-if="isOwner(party)"
                    icon="mdi-delete-outline"
                    size="small"
                    @click="deleteParty(party)"
                  ></v-btn>
                  <v-btn
                    :icon="party.isCleared ? 'mdi-refresh' : 'mdi-check-bold'"
                    size="small"
                    @click="togglePartyClear(party)"
                  ></v-btn>
                </v-toolbar>

                <v-card-text class="pa-5">
                  <div class="d-flex align-center justify-space-between mb-4">
                    <div
                      class="text-h6 font-weight-bold d-flex align-center"
                      :class="party.isCleared ? 'text-grey' : ''"
                    >
                      <v-icon class="me-2" size="small"
                        >mdi-clock-outline</v-icon
                      >
                      {{ formatDateTime(party.departureTime) }}
                    </div>
                    <v-btn
                      v-if="isMyCharInParty(party)"
                      size="small"
                      variant="tonal"
                      color="primary"
                      @click="openTimePicker(party)"
                      :disabled="party.isCleared"
                    >
                      시간수정
                    </v-btn>
                  </div>

                  <v-divider class="mb-4"></v-divider>

                  <div class="text-subtitle-2 mb-2 font-weight-bold text-grey">
                    참여 멤버
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <v-card
                      v-for="(member, idx) in party.members"
                      :key="idx"
                      variant="outlined"
                      class="pa-2 rounded-lg d-flex align-center"
                      :style="
                        isMyChar(member.name)
                          ? 'border: 2px solid #FFB300; background: rgba(255,179,0,0.05)'
                          : 'border: 1px solid rgba(128,128,128,0.2)'
                      "
                      style="width: calc(50% - 4px); height: 52px"
                    >
                      <v-avatar size="30" class="me-2"
                        ><v-img :src="member.img"></v-img
                      ></v-avatar>
                      <div class="overflow-hidden">
                        <div
                          class="text-caption font-weight-bold text-truncate"
                          :class="{
                            'text-decoration-line-through opacity-40':
                              party.isCleared,
                          }"
                        >
                          {{ member.name }}
                        </div>
                        <div
                          class="text-overline"
                          style="font-size: 0.55rem !important; line-height: 1"
                        >
                          {{ member.job }}
                        </div>
                      </div>
                    </v-card>
                  </div>

                  <div class="mt-4 text-right">
                    <v-chip size="x-small" variant="text" class="opacity-50">
                      대표캐릭터: {{ party.owner }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="timeDialog" max-width="320">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="font-weight-black">일정 변경</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="tempTime"
            type="time"
            variant="outlined"
            color="primary"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="timeDialog = false">취소</v-btn>
          <v-btn color="primary" variant="flat" @click="saveTime">저장</v-btn>
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
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

const theme = ref(localStorage.getItem("theme") || "light");
const currentMain = localStorage.getItem("current_main_name") || "unknown";
const fixedParties = ref([]);
const timeDialog = ref(false);
const tempTime = ref("");
const selectedParty = ref(null);

let isInitialLoad = true;

// [규칙 3] 내 원정대 모든 캐릭터 이름 가져오기
const myCharNames = computed(() => {
  const saved = JSON.parse(
    localStorage.getItem(`hw_chars_${currentMain}`) || "[]",
  );
  return saved.map((c) => c.name);
});

const isMyCharInParty = (party) => {
  return party.members?.some((m) => myCharNames.value.includes(m.name));
};

const isMyChar = (name) => myCharNames.value.includes(name);

// [규칙 1] 내가 이 공격대의 생성주(Owner)인지 확인
const isOwner = (party) => party.owner === currentMain;

// [규칙 3] 내 원정대 캐릭터가 하나라도 포함된 모든 고정 공대 필터링
const myFixedParties = computed(() => {
  return fixedParties.value.filter((party) =>
    party.members?.some((m) => myCharNames.value.includes(m.name)),
  );
});

const completedCount = computed(
  () => myFixedParties.value.filter((p) => p.isCleared).length,
);

const checkWeeklyReset = async (parties) => {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();

  // 이번 주 수요일 06시 계산
  const lastWed = new Date(now);
  const diff = day < 3 || (day === 3 && hours < 6) ? day + 4 : day - 3;
  lastWed.setDate(now.getDate() - diff);
  lastWed.setHours(6, 0, 0, 0);

  for (const party of parties) {
    // 🔥 [방어막 1] lastUpdated가 null이면 서버에서 시간을 찍는 중이므로 초기화 패스
    if (!party.lastUpdated) continue;

    const lastUpdate = party.lastUpdated?.toDate
      ? party.lastUpdated.toDate()
      : new Date(party.lastUpdated || 0);

    // 🔥 [방어막 2] 방금 막 업데이트된 데이터(예: 1분 이내)는 초기화 대상에서 제외
    const isJustUpdated = now.getTime() - lastUpdate.getTime() < 60000; // 60초 이내
    if (isJustUpdated) continue;

    // 마지막 업데이트가 지난 수요일 06시 이전일 때만 초기화 실행
    if (
      lastUpdate < lastWed &&
      (party.isCleared || party.departureTime !== "일정미정")
    ) {
      try {
        await updateDoc(doc(db, "fixed_parties", party.id), {
          isCleared: false,
          departureTime: "일정미정",
          lastUpdated: serverTimestamp(),
        });
      } catch (e) {
        console.error("초기화 오류:", e);
      }
    }
  }
};

onMounted(() => {
  const q = query(collection(db, "fixed_parties"), orderBy("raid", "asc"));
  onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // 🔥 최초 로드이거나, 데이터가 변경되었을 때만 초기화 체크 실행
    // 드래그 시에는 방어막 로직에 의해 무시됨
    checkWeeklyReset(data);
    console.log(data);
    fixedParties.value = data;
  });
});

// 달력 및 시간 로직
const daysOfWeek = computed(() => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const localFullDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

const getDifficultyColor = (diff) => {
  if (!diff) return "grey";

  // 보라색 계열 (최상위 난이도)
  if (["The First", "나이트메어", "3단계"].includes(diff)) {
    return "deep-purple-accent-2";
  }
  // 주황색 계열 (중간 난이도)
  else if (["하드", "2단계"].includes(diff)) {
    return "orange-darken-4";
  }
  // 초록색 계열 (일반 난이도)
  else if (["노말", "1단계"].includes(diff)) {
    return "light-green-accent-4";
  }

  return "primary";
};

const calendarSchedules = computed(() => {
  const map = {};
  daysOfWeek.value.forEach((day) => (map[day.fullDate] = []));
  myFixedParties.value.forEach((party) => {
    if (party.departureTime?.includes("T")) {
      const dateKey = party.departureTime.split("T")[0];
      if (map[dateKey]) map[dateKey].push(party);
    }
  });
  return map;
});

const pendingSchedules = computed(() =>
  myFixedParties.value.filter(
    (p) => !p.departureTime || p.departureTime === "일정미정",
  ),
);

const onDateDrop = async (event, targetDate) => {
  // 1. 드래그 앤 드롭으로 리스트에 '추가'되었을 때만 실행
  if (event.added) {
    const party = event.added.element;

    // [규칙 1] 소유주 권한 체크
    if (!isMyCharInParty(party)) {
      alert("해당 파티의 멤버만 일정을 변경할 수 있습니다.");
      return;
    }

    try {
      const partyRef = doc(db, "fixed_parties", party.id);

      // 2. 기존 시간 정보 추출 (T 이후의 HH:mm:ss 부분)
      // 만약 기존에 시간이 없었다면 기본값 "00:00" 사용
      let existingTime = "00:00";
      if (party.departureTime && party.departureTime.includes("T")) {
        existingTime = party.departureTime.split("T")[1].substring(0, 5);
      }

      // 3. 타겟 날짜 설정
      let newDateTime = "";
      if (targetDate === "일정미정") {
        newDateTime = "일정미정";
      } else {
        // 드롭한 칸의 날짜(targetDate) + 기존 시간(existingTime)
        newDateTime = `${targetDate}T${existingTime}`;
      }

      // 4. Firestore 업데이트
      await updateDoc(partyRef, {
        departureTime: newDateTime,
        lastUpdated: serverTimestamp(),
      });

      console.log(`날짜 변경 완료: ${newDateTime}`);
    } catch (e) {
      console.error("날짜 업데이트 실패:", e);
      alert("날짜 변경 중 오류가 발생했습니다.");
    }
  }
};

const togglePartyClear = async (party) => {
  await updateDoc(doc(db, "fixed_parties", party.id), {
    isCleared: !party.isCleared,
    lastUpdated: serverTimestamp(),
  });
};

const openTimePicker = (party) => {
  selectedParty.value = party;
  tempTime.value = party.departureTime?.includes("T")
    ? party.departureTime.split("T")[1].substring(0, 5)
    : "00:00";
  timeDialog.value = true;
};

const saveTime = async () => {
  if (selectedParty.value && tempTime.value) {
    const datePart =
      selectedParty.value.departureTime?.split("T")[0] ||
      daysOfWeek.value[0].fullDate;
    await updateDoc(doc(db, "fixed_parties", selectedParty.value.id), {
      departureTime: `${datePart}T${tempTime.value}`,
      lastUpdated: serverTimestamp(),
    });
    timeDialog.value = false;
  }
};

const deleteParty = async (party) => {
  if (confirm(`'${party.raid}' 고정 공격대를 완전히 삭제하시겠습니까?`)) {
    await deleteDoc(doc(db, "fixed_parties", party.id));
  }
};

const formatDateTime = (val) => {
  if (!val || val === "일정미정") return "일정 미정";
  const date = new Date(val);
  return date.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isToday = (val) =>
  val?.split("T")[0] === new Date().toISOString().split("T")[0];

const scrollToDetail = (id) => {
  const el = document.getElementById(`party-card-${id}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
};
</script>

<style scoped>
.calendar-wrapper {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 12px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}
.calendar-day-column {
  flex: 0 0 12.5%;
  border-right: 1px solid rgba(var(--v-border-color), 0.08);
  min-height: 200px;
  display: flex;
  flex-direction: column;
}
.day-header {
  font-size: 0.75rem;
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}
.today-header {
  background: rgba(124, 77, 255, 0.1) !important;
  color: #7c4dff !important;
}
.day-dropzone {
  flex-grow: 1;
  min-height: 150px;
}
.schedule-chip {
  transition: transform 0.2s;
  cursor: pointer;
}
.border-bold {
  border: 1.5px solid gold !important;
}
.cleared-card {
  opacity: 0.6;
  filter: grayscale(0.5);
}
.today-card {
  border: 2px solid #7c4dff !important;
  box-shadow: 0 0 10px rgba(124, 77, 255, 0.2) !important;
}
.pending-column {
  border-left: 2px solid #ffab00 !important;
}
.gap-2 {
  gap: 8px;
}
</style>
