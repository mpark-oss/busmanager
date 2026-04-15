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
                  :class="{
                    'past-day': isPast(day.fullDate) && !isToday(day.fullDate),
                  }"
                >
                  <div
                    class="day-header pa-2 text-center font-weight-bold"
                    :class="{ 'today-header': isToday(day.fullDate) }"
                  >
                    <span :class="{ 'today-circle': isToday(day.fullDate) }">
                      {{ day.display }}
                    </span>
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
                        <v-icon size="15" class="me-1">
                          {{
                            element.isHomework === false
                              ? "mdi-bus"
                              : "mdi-clipboard-check"
                          }}
                        </v-icon>

                        <span
                          v-if="
                            element.departureTime &&
                            element.departureTime.includes('T')
                          "
                          class="time-text font-weight-black me-1"
                        >
                          {{
                            element.departureTime.split("T")[1].substring(0, 5)
                          }}
                        </span>

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

          <div
            v-for="(parties, raidName) in groupedParties"
            :key="raidName"
            class="mb-12"
          >
            <v-col cols="12" class="px-0 mb-6">
              <div class="d-flex flex-column items-start">
                <div
                  class="text-h4 font-weight-black px-5 py-1 rounded-r-xl d-flex align-center"
                  :style="{
                    borderLeft: `12px solid ${getRaidThemeColor(raidName)}`,
                    backgroundColor: 'rgba(var(--v-theme-primary), 0.05)',
                    color: getRaidThemeColor(raidName),
                  }"
                >
                  <v-icon
                    class="me-3"
                    :color="getRaidThemeColor(raidName)"
                    size="32"
                    >mdi-sword-cross</v-icon
                  >
                  {{ raidName }}
                </div>

                <div class="ms-8 mt-1 d-flex align-center">
                  <v-icon size="14" color="grey-darken-1" class="me-1"
                    >mdi-tray-full</v-icon
                  >
                  <span
                    class="text-subtitle-2 text-grey-darken-1 font-weight-bold"
                  >
                    총 {{ parties.length }}개의 파티
                  </span>
                </div>
              </div>
            </v-col>

            <v-row>
              <v-col
                v-for="party in parties"
                :key="party.id"
                cols="12"
                md="6"
                xl="4"
              >
                <v-card
                  :id="`party-card-${party.id}`"
                  border
                  class="rounded-xl overflow-hidden mb-6 bus-card transition-all shadow-sm"
                  :class="{
                    'today-card': isToday(party.departureTime),
                    'cleared-card': party.isCleared, // CSS 스타일 적용
                    'highlight-card': activePartyId === party.id, // 하이라이트 클래스
                    'cleared-card': party.isCleared,
                  }"
                >
                  <div v-if="party.isCleared" class="cleared-overlay">
                    <div class="cleared-text">CLEAR</div>
                  </div>
                  <v-toolbar
                    :color="
                      party.isCleared
                        ? 'success'
                        : getRaidThemeColor(party.raid)
                    "
                    density="compact"
                    flat
                    dark
                  >
                    <v-icon size="small" class="ms-3 me-2"
                      >mdi-shield-star</v-icon
                    >
                    <span
                      class="text-subtitle-1 font-weight-black text-truncate"
                    >
                      <v-chip
                        size="x-small"
                        :color="
                          party.isHomework ? 'blue-darken-2' : 'amber-darken-3'
                        "
                        variant="flat"
                        class="me-2 font-weight-black border"
                        label
                      >
                        {{ party.isHomework ? "숙제" : "버스" }}
                      </v-chip>
                      <v-chip
                        size="x-small"
                        color="white"
                        variant="outlined"
                        class="me-2 font-weight-black"
                        style="border-width: 1.5px !important"
                        label
                      >
                        {{ party.difficulty }}
                      </v-chip>

                      {{ party.title || party.raid }}
                    </span>

                    <v-spacer></v-spacer>

                    <v-tooltip text="일반 스케줄로 복사" location="top">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-export-variant"
                          size="small"
                          @click="exportToGeneralSchedule(party)"
                        ></v-btn>
                      </template>
                    </v-tooltip>

                    <v-btn
                      v-if="isOwner(party)"
                      icon="mdi-delete-outline"
                      size="small"
                      @click="deleteParty(party)"
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
                        :disabled="
                          party.isCleared || party.departureTime === '일정미정'
                        "
                      >
                        시간수정
                      </v-btn>
                    </div>

                    <v-divider class="mb-4"></v-divider>

                    <div
                      class="text-subtitle-2 mb-2 font-weight-bold text-grey"
                    >
                      참여 멤버
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <v-card
                        v-for="(member, idx) in party.members"
                        :key="idx"
                        variant="outlined"
                        class="pa-2 rounded-lg d-flex align-center member-card"
                        :class="{
                          'my-char-orange-highlight': isMyChar(member.name),
                        }"
                        style="width: calc(50% - 4px); height: 52px"
                      >
                        <v-avatar size="30" class="me-2">
                          <v-img :src="member.img"></v-img>
                        </v-avatar>
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
                            style="
                              font-size: 0.55rem !important;
                              line-height: 1;
                            "
                          >
                            {{ member.job }}
                          </div>
                        </div>
                      </v-card>
                    </div>

                    <div class="mt-4 text-right">
                      <v-btn
                        :color="party.isCleared ? 'white' : 'success'"
                        variant="flat"
                        size="x-small"
                        class="font-weight-black px-2"
                        @click="togglePartyClear(party)"
                      >
                        <v-icon start size="14">{{
                          party.isCleared ? "mdi-refresh" : "mdi-check-bold"
                        }}</v-icon>
                        {{ party.isCleared ? "" : "Clear" }}
                      </v-btn>
                      <v-chip size="x-small" variant="text" class="opacity-50">
                        생성자: {{ party.owner }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
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
  setDoc,
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

const sortedFixedParties = computed(() => {
  return [...myFixedParties.value].sort((a, b) => {
    const timeA = a.departureTime;
    const timeB = b.departureTime;

    // 1. '일정미정' 처리 (가장 후순위)
    if (timeA === "일정미정" && timeB !== "일정미정") return 1;
    if (timeA !== "일정미정" && timeB === "일정미정") return -1;
    if (timeA === "일정미정" && timeB === "일정미정") return 0;

    // 2. 날짜 및 시간순 정렬 (ISO 8601 형식 문자열 비교)
    // "2024-04-10T14:00" 형태이므로 문자열 비교(localeCompare)로 충분합니다.
    return timeA.localeCompare(timeB);
  });
});

const completedCount = computed(
  () => myFixedParties.value.filter((p) => p.isCleared).length,
);

const checkWeeklyReset = async (parties) => {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();

  // 1. 이번 주 수요일 06시(초기화 시점) 계산
  const lastWed = new Date(now);
  const diff = day < 3 || (day === 3 && hours < 6) ? day + 4 : day - 3;
  lastWed.setDate(now.getDate() - diff);
  lastWed.setHours(6, 0, 0, 0);

  for (const party of parties) {
    // 🔥 [방어막 1] DB 업데이트 중인 데이터는 건너뜀
    if (!party.lastUpdated) continue;

    const lastUpdate = party.lastUpdated?.toDate
      ? party.lastUpdated.toDate()
      : new Date(party.lastUpdated || 0);

    // 🔥 [방어막 2] 방금 막 수정한 데이터(60초 이내)는 초기화 방지
    const isJustUpdated = now.getTime() - lastUpdate.getTime() < 60000;
    if (isJustUpdated) continue;

    // 2. 마지막 업데이트가 지난 수요일 06시 이전이라면 (즉, 지난주 데이터라면)
    if (
      lastUpdate < lastWed &&
      (party.isCleared || party.departureTime !== "일정미정")
    ) {
      try {
        let nextDepartureTime = "일정미정";

        // 3. 기존 일정이 있을 경우 7일 더하기 로직
        if (party.departureTime && party.departureTime.includes("T")) {
          const prevDate = new Date(party.departureTime);

          if (!isNaN(prevDate)) {
            // [핵심] 로컬 시간 기준으로 7일 더하기
            prevDate.setDate(prevDate.getDate() + 7);

            // [toISOString 버그 해결]
            // 한국 시간대(+9시간)만큼 오프셋을 강제로 더해준 뒤
            // ISO 변환을 해야 T 앞뒤 날짜/시간이 한국 기준 그대로 유지됩니다.
            const offset = prevDate.getTimezoneOffset() * 60000; // 분 단위를 밀리초로
            const localISOTime = new Date(
              prevDate.getTime() - offset,
            ).toISOString();

            // "YYYY-MM-DDTHH:mm" 형식 추출
            nextDepartureTime = localISOTime.slice(0, 16);
          }
        }

        // 4. Firestore 업데이트 실행
        await updateDoc(doc(db, "fixed_parties", party.id), {
          isCleared: false,
          departureTime: nextDepartureTime, // 7일 연장된 시간 또는 일정미정
          lastUpdated: serverTimestamp(),
        });

        console.log(
          `[초기화 완료] ${party.raid} (${party.title}): 차주 일치 ${nextDepartureTime}로 갱신`,
        );
      } catch (e) {
        console.error("고정 스케줄 주간 초기화 처리 중 오류:", e);
      }
    }
  }
};

// 레이드별로 그룹화하되, 각 그룹 내 파티들을 시간순으로 정렬
const groupedParties = computed(() => {
  const groups = {};

  // 정렬된 리스트를 바탕으로 그룹 생성
  sortedFixedParties.value.forEach((party) => {
    if (!groups[party.raid]) {
      groups[party.raid] = [];
    }
    groups[party.raid].push(party);
  });

  return groups;
});

const exportToGeneralSchedule = async (party) => {
  // 1. 목적지 컬렉션 결정
  const targetCol = party.isHomework ? "homeworks" : "schedules";

  // 2. 문서 ID 생성 (샘플처럼 Firestore 자동 생성 ID 느낌을 주거나 고유 ID 부여)
  const newId = doc(collection(db, targetCol)).id;

  // 3. 샘플 데이터 구조와 100% 일치화 작업
  const exportData = {
    // 필수 기본 필드
    id: newId,
    raid: party.raid,
    difficulty: party.difficulty,
    isHomework: party.isHomework ?? targetCol === "homeworks",

    // 🔥 중요: 시간 필드명 매핑 (departureTime -> dateTime)
    // 샘플 데이터처럼 일정이 없으면 빈 문자열(""), 있으면 해당 시간 문자열
    dateTime:
      party.departureTime === "일정미정" || !party.departureTime
        ? ""
        : party.departureTime,

    // 멤버 데이터 (이미 배열 형태이므로 그대로 복사)
    members: JSON.parse(JSON.stringify(party.members)),

    // 샘플에 포함된 기타 필수 필드 강제 주입
    memo: null,
    password: null,
    createdAt: serverTimestamp(),
  };

  try {
    // 4. Firestore 저장
    await setDoc(doc(db, targetCol, newId), exportData);

    // 5. 성공 알림
    const menuName = party.isHomework ? "숙제 스케줄" : "버스 스케줄";
    alert(`✅ ${menuName} 내보내기 완료`);
  } catch (e) {
    console.error("내보내기 실패 상세:", e);
    alert("내보내기 중 오류가 발생했습니다.");
  }
};

onMounted(() => {
  const q = query(collection(db, "fixed_parties"), orderBy("raid", "asc"));
  onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // 🔥 최초 로드이거나, 데이터가 변경되었을 때만 초기화 체크 실행
    // 드래그 시에는 방어막 로직에 의해 무시됨
    checkWeeklyReset(data);

    fixedParties.value = data;
  });
});

const daysOfWeek = computed(() => {
  const days = [];
  const today = new Date();

  // 1. 가장 최근의 수요일 찾기
  // getDay(): 일(0), 월(1), 화(2), 수(3), 목(4), 금(5), 토(6)
  const currentDay = today.getDay();
  const diffToWednesday = currentDay >= 3 ? currentDay - 3 : currentDay + 4;

  const startWednesday = new Date(today);
  startWednesday.setDate(today.getDate() - diffToWednesday);
  startWednesday.setHours(0, 0, 0, 0); // 시간 초기화

  // 2. 수요일부터 화요일까지 7일 생성
  for (let i = 0; i < 7; i++) {
    const date = new Date(startWednesday);
    date.setDate(startWednesday.getDate() + i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const fullDate = `${year}-${month}-${day}`;

    // 요일 이름 (한글)
    const dayName = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];

    days.push({
      display: `${month}/${day} (${dayName})`,
      fullDate: fullDate,
    });
  }

  return days;
});

const isPast = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
};

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

  Object.keys(map).forEach((dateKey) => {
    map[dateKey].sort((a, b) => {
      // "2024-04-10T14:00" vs "2024-04-10T09:00"
      // 문자열 비교만으로도 시간순(오름차순) 정렬이 가능합니다.
      return a.departureTime.localeCompare(b.departureTime);
    });
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
  try {
    const newStatus = !party.isCleared; // 바뀔 상태
    const partyRef = doc(db, "fixed_parties", party.id);

    // 1. DB 업데이트 (Firestore)
    await updateDoc(partyRef, {
      isCleared: newStatus,
      lastUpdated: serverTimestamp(),
    });

    // 2. 로컬 스토리지 동기화 실행
    // 업데이트된 party 객체를 전달 (함수 내에서 isCleared를 참조하므로)
    syncFixedToLocal({ ...party, isCleared: newStatus });

    window.dispatchEvent(new Event("sync-fixed-to-local"));
  } catch (e) {
    console.error("업데이트 실패:", e);
  }
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

const isToday = (dateStr) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  // YYYY-MM-DD 형식으로 비교
  return dateStr === `${year}-${month}-${day}`;
};

const activePartyId = ref(null);

const scrollToDetail = (id) => {
  const el = document.getElementById(`party-card-${id}`);
  if (el) {
    // 1. 해당 위치로 스크롤
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // 2. 하이라이트 ID 설정
    activePartyId.value = id;
  }
};

const getRaidThemeColor = (raidName) => {
  const themes = {
    // 카제로스 레이드 시리즈 (전반적으로 묵직하고 강렬한 색상)
    "2막": "#2E7D32", // 진한 초록 (부패/독소 느낌)
    "3막": "#C62828", // 진한 빨강 (업화/불꽃 느낌)
    "4막": "#1565C0", // 진한 파랑 (심해/냉기 느낌)
    종막: "#4527A0", // 진한 보라 (종말/혼돈 느낌)

    // 에피소드 레이드 (신비롭고 날카로운 느낌)
    세르카: "#00695C", // 청록색 (신비로운 유적 느낌)
    지평: "#37474F", // 차가운 그레이 (경계/지평선 느낌)
  };

  // 목록에 없는 레이드일 경우 기본 브랜드 컬러인 primary(남색 계열)를 반환합니다.
  return themes[raidName] || "#5E35B1";
};

const syncFixedToLocal = (party) => {
  // 1. 대표 캐릭터명(Key의 핵심) 가져오기
  const mainCharName = localStorage.getItem("current_main_name");
  if (!mainCharName) return;

  // 2. 동적 스토리지 키 생성 및 데이터 로드
  const storageKey = `hw_chars_${mainCharName}`;
  const localData = JSON.parse(localStorage.getItem(storageKey) || "[]");

  if (localData.length === 0) return;

  const raidName = party.raid; // 예: "지평", "세르카", "종막"
  const isCleared = party.isCleared;

  // 3. 파티 멤버들 순회하며 내 원정대 캐릭터 업데이트
  party.members.forEach((member) => {
    // 로컬 배열에서 이름이 일치하는 캐릭터 객체 찾기
    const targetChar = localData.find((c) => c.name === member.name);

    if (
      targetChar &&
      targetChar.settings &&
      targetChar.settings.selectedGateIds
    ) {
      // 🎯 매칭 로직: selectedGateIds 중 레이드 이름이 포함된 모든 ID 추출
      // 예: raidName "지평" -> "어비스: 지평의 성당(3단계)_G1", "어비스: 지평의 성당(3단계)_G2" 매칭
      const targetGates = targetChar.settings.selectedGateIds.filter((id) =>
        id.includes(raidName),
      );

      targetGates.forEach((gateId) => {
        if (isCleared) {
          // [완료 처리] completedTasks 배열에 ID 추가 (중복 체크)
          if (!targetChar.completedTasks.includes(gateId)) {
            targetChar.completedTasks.push(gateId);
          }
        } else {
          // [초기화 처리] completedTasks 배열에서 해당 ID 제거
          targetChar.completedTasks = targetChar.completedTasks.filter(
            (id) => id !== gateId,
          );
        }
      });
    }
  });

  // 4. 수정된 전체 배열을 다시 로컬 스토리지에 덮어쓰기
  localStorage.setItem(storageKey, JSON.stringify(localData));

  // 5. 개인 숙제 페이지(리스너)에 신호 전송
  window.dispatchEvent(new Event("sync-fixed-to-local"));
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
  position: relative;
}
.day-header {
  font-size: 0.75rem;
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
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

/* style scoped 맨 아래 추가 */

.highlight-card {
  /* 강렬한 테두리 색상과 그림자 */
  border: 3px solid #ffeb3b !important; /* 노란색 계열 강조 */
  box-shadow: 0 0 25px rgba(255, 235, 59, 0.6) !important;
  transform: scale(1.02); /* 아주 살짝 커지는 효과 */
  z-index: 100;
  animation: pulse-highlight 1s infinite alternate; /* 깜빡이는 애니메이션 */
}

/* [추가] 하이라이트 깜빡임 애니메이션 */
@keyframes pulse-highlight {
  0% {
    box-shadow: 0 0 10px rgba(255, 235, 59, 0.4);
    border-color: #fbc02d;
  }
  100% {
    box-shadow: 0 0 30px rgba(255, 235, 59, 0.8);
    border-color: #ffeb3b;
  }
}

.bus-card {
  position: relative; /* 도장 오버레이 배치를 위해 카드 자체를 기준으로 설정 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cleared-card {
  filter: grayscale(0.5);
  opacity: 0.6;
  /* pointer-events: none; 를 삭제하세요! */
}

/* 추가로, 도장이 버튼을 가려도 클릭이 되도록 overlay 설정 확인 */
.cleared-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  z-index: 10;
  pointer-events: none; /* 👈 도장은 마우스에 잡히지 않아야 버튼이 눌립니다. */
}

/* 🔥 'CLEAR' 텍스트 도장 모양 */
.cleared-text {
  font-size: 3.5rem; /* 도장 크기 */
  font-weight: 900; /* 아주 굵은 글씨 */
  color: #4caf50; /* 완료를 상징하는 초록색 (Sucess 컬러) */
  border: 6px solid #4caf50; /* 도장 테두리 */
  padding: 5px 25px; /* 테두리와 글씨 사이 여백 */
  border-radius: 12px; /* 모서리 둥글게 */
  opacity: 0.6; /* 너무 튀지 않게 약간 투명하게 */
  letter-spacing: 5px; /* 글자 사이 간격 넓게 (도장 느낌) */
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.5); /* 은은한 네온 효과 */
}

/* 개인 숙제 페이지용 고정 공대 카드 스타일 */
.bus-card {
  position: relative;
  transition: all 0.3s ease;
}

/* 완료된 카드 효과 */
.cleared-card {
  filter: grayscale(0.6);
  opacity: 0.7;
  /* pointer-events: none; 은 절대 넣지 마세요! */
}

/* 도장 오버레이 */
.cleared-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-12deg);
  z-index: 5;
  pointer-events: none;
}

/* 'CLEAR' 도장 디자인 (약간 작게 조정) */
.cleared-text {
  font-size: 2.5rem; /* 크기 조정 */
  font-weight: 900;
  color: #4caf50;
  border: 4px solid #4caf50;
  padding: 2px 15px;
  border-radius: 10px;
  opacity: 0.6;
  letter-spacing: 3px;
  white-space: nowrap;
}

.past-day {
  background-color: rgba(0, 0, 0, 0.02); /* 배경을 살짝 어둡게 */
}
.past-day .day-header {
  opacity: 0.5; /* 헤더 글자를 흐리게 */
}

/* 기본 카드 보더 투명도 조절 */
.member-card {
  border: 1px solid rgba(128, 128, 128, 0.2) !important;
  transition: all 0.3s ease-in-out;
}

/* 🔥 내 캐릭터 강조 (라이트 모드: 진한 오렌지) */
.my-char-orange-highlight {
  border: 2px solid #e65100 !important; /* 진한 오렌지 보더 */
  background-color: rgba(230, 81, 0, 0.08) !important; /* 연한 오렌지 배경 */
}

.my-char-orange-highlight .text-caption {
  color: #bf360c !important; /* 이름 텍스트 색상 강조 */
}

/* 🔥 내 캐릭터 강조 (다크 모드: 네온 오렌지 글로우) */
/* 현재 사용하시는 theme 변수가 'dark'일 때 적용되도록 설정 */
[data-theme="dark"] .my-char-orange-highlight,
.v-theme--dark .my-char-orange-highlight {
  border: 2px solid #ff6d00 !important; /* 더 밝은 네온 오렌지 */
  background-color: rgba(255, 109, 0, 0.15) !important;
  box-shadow: 0 0 12px rgba(255, 109, 0, 0.5) !important; /* 오렌지색 광채 */
}

[data-theme="dark"] .my-char-orange-highlight .text-caption,
.v-theme--dark .my-char-orange-highlight .text-caption {
  color: #ffab40 !important; /* 다크모드 가독성을 위한 밝은 오렌지 이름 */
}

/* 오늘 날짜 컬럼 전체 하이라이트 */
.today-column {
  position: relative;
  /* 라이트 모드에서는 아주 연한 파란색/노란색 배경 */
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
  border-left: 1px solid rgba(var(--v-theme-primary), 0.2) !important;
  border-right: 1px solid rgba(var(--v-theme-primary), 0.2) !important;
  z-index: 1;
}

/* 다크모드일 때 오늘 날짜 배경 조금 더 강조 */
:deep(.v-theme--dark) .today-column {
  background-color: rgba(0, 229, 255, 0.03) !important;
}

/* [수정] 부모 헤더가 Flex이므로 absolute는 제거합니다 */
.today-badge {
  background: #e65100; /* 진한 오렌지 */
  color: white;
  font-size: 0.55rem;
  font-weight: 900;
  padding: 1px 6px;
  border-radius: 4px;
  line-height: 1.2;
  /* 위치 관련 absolute/transform 속성은 모두 삭제하세요 */
}

/* 오늘 날짜 텍스트 강조 */
.today-header .date-text {
  color: #e65100;
  font-size: 1rem; /* 오늘 날짜만 살짝 크게 */
}

/* 오늘 컬럼 전체 배경 (선택 사항: 더 눈에 띄게 함) */
.today-column {
  background-color: rgba(var(--v-theme-primary), 0.03) !important;
}

/* 다크모드 대응 */
:deep(.v-theme--dark) .today-badge {
  background: #ff6d00;
}
/* 오늘 날짜 헤더 스타일 */
.today-header {
  background-color: #e65100 !important; /* 진한 오렌지 배경 */
  color: white !important; /* 글자색은 화이트로 대비 */
  border-radius: 4px 4px 0 0; /* 윗부분만 살짝 라운드 */
  position: relative;
}

/* 다크모드일 때 오늘 헤더 */
:deep(.v-theme--dark) .today-header {
  background-color: #ff6d00 !important;
  box-shadow: 0 4px 10px rgba(255, 109, 0, 0.3); /* 은은한 네온 광채 */
}

.today-circle {
  background-color: #e65100;
  color: white;
  padding: 4px 10px;
  border-radius: 20px; /* 알약 모양 하이라이트 */
  display: inline-block;
  line-height: 1;
}

:deep(.v-theme--dark) .today-circle {
  background-color: #ff6d00;
  box-shadow: 0 0 8px rgba(255, 109, 0, 0.5);
}
</style>
