<template>
  <v-container fluid class="fill-height align-start pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="3" lg="2" class="pa-4 border-end d-flex flex-column"
        style="height: 100vh; overflow: hidden;">
        <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
          <v-icon color="primary" class="me-2">mdi-account-multiple</v-icon> 기사 명단
        </div>

        <v-text-field v-model="searchName" label="캐릭터 추가" append-inner-icon="mdi-magnify"
          @click:append-inner="fetchCharacter" @keyup.enter="fetchCharacter" :loading="isLoading" density="comfortable"
          variant="solo-filled" flat hide-details class="mb-4 rounded-lg custom-search-field"></v-text-field>
        <v-divider class="mb-4"></v-divider>

        <div class="character-list-scroll custom-scroll flex-grow-1">
          <draggable :model-value="rankedCharList" :group="{ name: 'pilots', pull: 'clone', put: false }"
            :clone="cloneCharacter" item-key="id">
            <template #item="{ element }">
              <v-card class="mb-4 pa-3 cursor-pointer rounded-xl char-rank-card transition-swing overflow-hidden"
                :class="element.rank <= 5 ? `rank-step-${element.rank}` : 'rank-normal'" variant="flat"
                @click="selectCharacter(element.name)">

                <div v-if="element.rank <= 5" class="glow-overlay"></div>

                <div class="d-flex align-center gap-3 position-relative" style="z-index: 2;">
                  <div v-if="element.rank <= 5" class="rank-number font-weight-black">
                    #{{ element.rank }}
                  </div>

                  <v-avatar size="42" class="elevation-4 border-2 shadow-lg">
                    <v-img :src="element.img || ''" cover></v-img>
                  </v-avatar>

                  <div class="flex-grow-1 overflow-hidden">
                    <div class="font-weight-black text-body-2 text-truncate text-white mb-1">
                      {{ element.name }}
                    </div>

                    <div class="d-flex flex-column gap-0">
                      <div class="text-caption d-flex align-center" style="gap: 4px;">
                        <span class="level-badge">Lv.{{ element.level }}</span>
                        <span class="text-grey-lighten-2 opacity-70 text-truncate">{{ element.job }}</span>
                      </div>

                      <div class="combat-power-text font-weight-black d-flex align-center mt-1"
                        style="font-size: 0.75rem;">
                        <v-icon size="12" class="me-1">mdi-sword-cross</v-icon>
                        {{ element.combatPower }}
                      </div>
                    </div>
                  </div>

                  <v-btn icon="mdi-close-circle" size="18" variant="text" color="rgba(255,255,255,0.3)"
                    @click.stop="deleteChar(element.id)"></v-btn>
                </div>
              </v-card>
            </template>
          </draggable>
        </div>
      </v-col>

      <v-col cols="12" md="9" lg="10" class="pa-6 d-flex flex-column" style="height: 100vh; overflow-y: auto;">
        <div class="d-flex justify-space-between align-center mb-6">
          <h2 class="text-h5 font-weight-black d-flex align-center">
            <v-icon class="me-2" color="primary">mdi-bus-school</v-icon> 캐릭터 정보 / 공격대 만들기
          </h2>
          <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" size="large" elevation="2" @click="addBusSlot">
            새 공대 만들기
          </v-btn>
        </div>

        <v-card variant="flat" class="rounded-xl pa-6 d-flex flex-column flex-grow-1 elevation-1" border
          min-height="85vh">
          <div v-if="localBuses.length === 0" class="flex-grow-1 d-flex flex-column">
            <v-fade-transition hide-on-leave>
              <div v-if="selectedChar && !isDetailLoading" class="dashboard-container w-100">
                <v-row class="mb-6" align="stretch">
                  <v-col cols="12" md="3">
                    <div class="text-subtitle-2 font-weight-black mb-3 opacity-70">프로필 요약</div>
                    <v-card class="profile-card rounded-xl overflow-hidden elevation-3 h-100 d-flex flex-column"
                      theme="dark">
                      <v-img :src="selectedChar.ArmoryProfile?.CharacterImage" cover class="align-end" height="300">
                        <div class="profile-gradient pa-4 w-100 text-white">
                          <div class="text-h6 font-weight-black mb-1 text-truncate">{{
                            selectedChar.ArmoryProfile?.CharacterName }}</div>
                          <div class="text-caption font-weight-bold mb-3 d-flex align-center opacity-90">
                            {{ selectedChar.ArmoryProfile?.CharacterClassName }}
                            <v-divider vertical class="mx-2 my-1 border-white"
                              v-if="selectedChar.ArkPassive?.Title"></v-divider>
                            <span class="text-amber-accent-1" v-if="selectedChar.ArkPassive?.Title">{{
                              selectedChar.ArkPassive.Title }}</span>
                          </div>
                          <div class="text-h5 font-weight-black text-amber-accent-2 mb-1">Lv.{{
                            selectedChar.ArmoryProfile?.ItemAvgLevel }}</div>
                          <div class="d-flex align-center gap-2">
                            <v-icon color="red-accent-2" size="18">mdi-sword-cross</v-icon>
                            <span class="text-h6 font-weight-black text-red-accent-1">{{
                              selectedChar.ArmoryProfile?.CombatPower }}</span>
                          </div>
                        </div>
                      </v-img>
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="4">
                    <div class="text-subtitle-2 font-weight-black mb-3 opacity-70">착용 장비</div>
                    <div class="d-flex flex-column justify-space-between h-100 pb-1">
                      <v-card v-for="item in filteredEquipment" :key="item.Name" variant="flat" border
                        class="pa-2 rounded-lg d-flex align-center flex-grow-1 mb-1">
                        <v-avatar size="36" rounded="sm" class="me-3 border border-opacity-25"
                          :style="{ backgroundColor: getEquipmentBgColor(item.Grade) }"><v-img
                            :src="item.Icon"></v-img></v-avatar>
                        <div class="overflow-hidden">
                          <div class="text-caption font-weight-black text-truncate" style="line-height: 1.2;">{{
                            item.Name }}
                          </div>
                          <div class="text-overline text-medium-emphasis"
                            style="font-size: 0.55rem !important; line-height: 1;">{{ item.Grade }}</div>
                        </div>
                      </v-card>
                    </div>
                  </v-col>

                  <v-col cols="12" md="5">
                    <div class="text-subtitle-2 font-weight-black mb-3 opacity-70">아크그리드 정보</div>
                    <div class="d-flex flex-column h-100">
                      <v-card v-for="slot in selectedChar.ArkGrid?.Slots" :key="slot.Index" variant="flat"
                        class="pa-2 rounded-lg d-flex align-center mb-1 flex-grow-1 shadow-sm ark-slot-card"
                        :style="{ backgroundColor: getArkGridBgColor(slot.Grade) }">
                        <v-avatar size="36" rounded="lg"
                          class="me-3 border border-opacity-25 bg-white shadow-sm flex-shrink-0"><v-img
                            :src="slot.Icon"></v-img></v-avatar>
                        <div class="flex-grow-1 overflow-hidden">
                          <div class="text-caption font-weight-black text-truncate ark-slot-name"
                            :class="{ 'text-white': theme.global.current.value.dark }"
                            style="line-height: 1.2 !important;">{{
                              slot.Name }}</div>
                          <div class="text-overline font-weight-bold d-flex justify-space-between"
                            :class="{ 'text-grey-lighten-3': theme.global.current.value.dark || slot.Grade === '유물' }"
                            style="line-height: 1 !important;">
                            <span>{{ slot.Grade }} 코어</span>
                            <span
                              :class="theme.global.current.value.dark || slot.Grade === '유물' ? 'text-blue-lighten-4' : 'text-blue-darken-4'">{{
                                slot.Point }}PT</span>
                          </div>
                        </div>
                      </v-card>
                    </div>
                  </v-col>
                </v-row>

                <v-divider class="my-6"></v-divider>

                <v-row>
                  <v-col cols="12" md="7">
                    <div class="text-subtitle-2 font-weight-black mb-4 opacity-70">장착 보석 현황</div>
                    <div class="d-flex flex-wrap gap-2 mb-6">
                      <div v-for="(gem, index) in selectedChar.ArmoryGem?.Gems" :key="index"
                        class="text-center gem-wrapper">
                        <v-avatar size="52" rounded="lg" class="elevation-2 mb-1 border"><v-img
                            :src="gem.Icon"></v-img></v-avatar>
                        <div class="text-caption font-weight-black" style="font-size: 0.7rem;">{{ gem.Level }}LV</div>
                      </div>
                    </div>
                    <div class="text-subtitle-2 font-weight-black mb-4 opacity-70">활성 각인서 효과</div>
                    <div class="d-flex flex-wrap gap-2">
                      <v-card v-for="engrave in selectedChar.ArmoryEngraving?.ArkPassiveEffects" :key="engrave.Name"
                        variant="outlined" border class="pa-2 px-3 rounded-pill d-flex align-center">
                        <v-chip size="x-small" color="orange-darken-4" class="me-2 font-weight-black text-white"
                          label>Lv.{{
                            engrave.Level }}</v-chip>
                        <span class="text-caption font-weight-bold">{{ engrave.Name }}</span>
                      </v-card>
                    </div>
                  </v-col>
                  <v-col cols="12" md="5">
                    <div class="text-subtitle-2 font-weight-black mb-4 opacity-70">아크그리드 상세 효과</div>
                    <v-card variant="outlined" border class="pa-4 rounded-xl">
                      <div v-for="effect in selectedChar.ArkGrid?.Effects" :key="effect.Name"
                        class="mb-2 d-flex align-center justify-space-between border-bottom border-opacity-10 pb-1">
                        <span class="text-body-2 font-weight-bold text-medium-emphasis">{{ effect.Name }}</span>
                        <v-chip size="x-small" color="primary" variant="flat" class="font-weight-black px-2">LV.{{
                          effect.Level }}</v-chip>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
              <div v-else-if="isDetailLoading" class="d-flex align-center justify-center flex-grow-1 py-12">
                <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
              </div>
              <div v-else class="d-flex flex-column align-center justify-center flex-grow-1 text-center py-12">
                <v-icon size="100" color="primary" class="opacity-20 mb-6">mdi-card-account-details-outline</v-icon>
                <h3 class="text-h4 font-weight-bold opacity-50">캐릭터 클릭시 상세 정보</h3>
              </div>
            </v-fade-transition>
          </div>

          <v-row dense v-else>
            <v-col v-for="(bus, bIdx) in localBuses" :key="bus.localId" cols="12" sm="6" xl="4">
              <v-card border elevation="1" class="rounded-xl overflow-hidden bus-card mb-4 bg-surface">
                <v-toolbar color="primary" density="compact" flat>
                  <v-icon :icon="bus.isHomework ? 'mdi-calendar-check' : 'mdi-bus-side'" class="ms-3" size="small"
                    color="white"></v-icon>
                  <v-toolbar-title class="text-body-2 font-weight-bold text-white">
                    {{ bus.isHomework ? '신규 숙제 편성' : '신규 버스 편성' }}
                  </v-toolbar-title>

                  <v-spacer></v-spacer>

                  <div class="d-flex align-center me-2">
                    <span class="text-caption me-2 text-white">{{ bus.isHomework ? '숙제' : '버스' }}</span>
                    <v-switch v-model="bus.isHomework" :false-value="false" :true-value="true" hide-details
                      density="compact" color="secondary" inset></v-switch>
                  </div>

                  <v-btn icon="mdi-close" size="x-small" color="white" @click="localBuses.splice(bIdx, 1)"></v-btn>
                </v-toolbar>
                <v-card-text class="pa-4">
                  <v-select v-model="bus.raid" :items="['2막', '3막', '4막', '종막', '세르카']" label="레이드" density="compact"
                    variant="outlined" class="mb-2"></v-select>
                  <v-select v-model="bus.difficulty" :items="['노말', '하드']" label="난이도" density="compact"
                    variant="outlined" class="mb-2"></v-select>
                  <div class="text-subtitle-2 font-weight-black mb-2 d-flex align-center text-high-emphasis">
                    <v-icon size="18" class="me-1">mdi-account-check</v-icon> 참여 공격대 목록
                  </div>
                  <div class="drop-zone pa-0 rounded-lg border-dashed mb-4"
                    :style="{ backgroundColor: theme.global.current.value.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }">

                    <draggable v-model="bus.members" group="pilots" item-key="id"
                      class="d-flex flex-wrap align-content-start bus-member-draggable-area pa-2">
                      <template #item="{ element, index }">
                        <v-chip closable size="small" color="primary" class="ma-1 font-weight-bold text-white" label
                          @click:close="bus.members.splice(index, 1)">
                          {{ element.job }} | {{ element.name }} | Lv.{{ element.level }} | ⚔ {{ element.combatPower }}
                        </v-chip>
                      </template>

                      <template #footer>
                        <div v-if="bus.members.length === 0"
                          class="empty-drop-msg d-flex flex-column align-center justify-center pointer-events-none">
                          <v-icon size="24" class="mb-1">mdi-drag-variant</v-icon>
                          <div class="text-caption">기사를 이리로 드래그하세요</div>
                        </div>
                      </template>
                    </draggable>
                  </div>
                  <v-text-field v-model="bus.dateTime" type="datetime-local" label="출발 시간" variant="outlined"
                    density="compact"></v-text-field>
                </v-card-text>
                <v-card-actions class="pa-3"><v-btn color="success" variant="flat" block rounded="lg"
                    @click="confirmAndUpload(bus, bIdx)">확정 등록</v-btn></v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import draggable from 'vuedraggable';
import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useTheme } from 'vuetify';

const theme = useTheme();
const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";
const searchName = ref('');
const charList = ref([]);
const localBuses = ref([]);
const isLoading = ref(false);
const selectedChar = ref(null);
const isDetailLoading = ref(false);

const registeredBuses = ref([]);

onMounted(() => {
  // 기존 캐릭터 명단 쿼리
  const qChar = query(collection(db, "characters"), orderBy("createdAt", "desc"));
  onSnapshot(qChar, (snapshot) => {
    charList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });

  // 신규: 등록된 버스 명단 쿼리
  const qBus = query(collection(db, "buses"), orderBy("dateTime", "asc"));
  onSnapshot(qBus, (snapshot) => {
    registeredBuses.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
});

const selectCharacter = async (charName) => {
  isDetailLoading.value = true;
  selectedChar.value = null;
  try {
    const url = `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(charName)}`;
    const response = await axios.get(url, { headers: { 'accept': 'application/json', 'authorization': `bearer ${API_KEY.trim()}` } });
    if (response.data) selectedChar.value = response.data;
  } catch (e) { console.error(e); } finally { isDetailLoading.value = false; }
};

const getArkGridBgColor = (grade) => {
  switch (grade) {
    case '영웅': return '#D1C4E9';
    case '전설': return '#FFF59D';
    case '유물': return '#EF6C00';
    case '고대': return '#F5F5DC';
    default: return '#EEEEEE';
  }
};

const slotNameColor = computed(() => theme.global.current.value.dark ? '#FFFFFF !important' : '#000000 !important');
const getEquipmentBgColor = (grade) => {
  const colors = { '고대': '#3d3325', '유물': '#441c04', '전설': '#362003' };
  return colors[grade] || '#EEEEEE';
};

const filteredEquipment = computed(() => {
  if (!selectedChar.value?.ArmoryEquipment) return [];
  const targetTypes = ['무기', '투구', '상의', '하의', '장갑', '어깨'];
  return selectedChar.value.ArmoryEquipment.filter(item => targetTypes.includes(item.Type));
});


const confirmAndUpload = async (bus, index) => {
  if (bus.members.length === 0) {
    alert("최소 한 명 이상의 캐릭터를 편성해 주세요.");
    return;
  }

  try {
    isLoading.value = true;

    const scheduleData = {
      raid: bus.raid,
      difficulty: bus.difficulty,
      dateTime: bus.dateTime || "",
      members: JSON.parse(JSON.stringify(bus.members.map(m => ({
        name: m.name,
        job: m.job,
        level: m.level,
        combatPower: m.combatPower,
        img: m.img
      })))),
      createdAt: new Date(),
      isHomework: bus.isHomework // 상태값 저장
    };

    // 토글 상태에 따라 저장할 컬렉션 결정
    // 버스(false) -> schedules / 숙제(true) -> homeworks
    const targetCollection = bus.isHomework ? "homeworks" : "schedules";
    
    await addDoc(collection(db, targetCollection), scheduleData);

    const typeMsg = bus.isHomework ? "숙제 스케줄" : "운행표";
    alert(`${bus.raid} ${typeMsg}가 등록되었습니다.`);

    localBuses.value.splice(index, 1);
  } catch (e) {
    console.error("등록 실패:", e);
    alert("등록 중 오류가 발생했습니다.");
  } finally {
    isLoading.value = false;
  }
};

const fetchCharacter = async () => {
  if (!searchName.value) return;
  isLoading.value = true;

  try {
    const url = `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(searchName.value)}/profiles`;
    const response = await axios.get(url, {
      headers: {
        'accept': 'application/json',
        'authorization': `bearer ${API_KEY.trim()}`
      }
    });

    const data = response.data;

    if (data && data.CharacterName) {
      // 1. 기존 동일 캐릭터가 있는지 확인
      const existingChar = charList.value.find(c => c.name === data.CharacterName);

      // 2. 기존 캐릭터 삭제 (순위 및 위치 갱신을 위함)
      if (existingChar) {
        await deleteDoc(doc(db, "characters", existingChar.id));
      }

      // 3. 신규 데이터 등록
      // createdAt을 현재 시간으로 설정하여 5등 밖일 경우 최상단에 오도록 함
      await addDoc(collection(db, "characters"), {
        name: data.CharacterName,
        level: data.ItemAvgLevel,
        job: data.CharacterClassName,
        img: data.CharacterImage,
        combatPower: data.CombatPower,
        createdAt: new Date()
      });

      searchName.value = '';
    } else {
      alert("캐릭터를 찾을 수 없습니다.");
    }
  } catch (e) {
    console.error(e);
    alert("검색 중 오류가 발생했습니다.");
  } finally {
    isLoading.value = false;
  }
};

const deleteChar = async (id) => { if (confirm("삭제하시겠습니까?")) await deleteDoc(doc(db, "characters", id)); };
const cloneCharacter = (char) => ({ ...char, id: Date.now() + Math.random() });

// 1. 슬롯 추가 시 기본값 설정 (default: 버스 상태, isHomework: false)
const addBusSlot = () => {
  localBuses.value.push({ 
    localId: Date.now(), 
    raid: '2막', 
    difficulty: '노말', 
    members: [], 
    dateTime: '',
    isHomework: false // false면 버스(ON), true면 숙제(OFF)
  });
};

const rankedCharList = computed(() => {
  // 1. 먼저 전체 데이터를 전투력 순으로 정렬하여 '진짜 순위'를 계산합니다.
  const powerSorted = [...charList.value].sort((a, b) => {
    const powerA = parseInt(a.combatPower?.replace(/,/g, '') || 0);
    const powerB = parseInt(b.combatPower?.replace(/,/g, '') || 0);
    return powerB - powerA;
  });

  // 2. 상위 5명을 추출합니다. (랭킹 존)
  const top5Names = powerSorted.slice(0, 5).map(c => c.name);
  const top5 = powerSorted.slice(0, 5).map((char, index) => ({
    ...char,
    rank: index + 1
  }));

  // 3. 나머지 캐릭터들을 추출하고 '추가된 시간(createdAt)' 최신순으로 정렬합니다.
  const others = charList.value
    .filter(c => !top5Names.includes(c.name)) // 상위 5명 제외
    .sort((a, b) => {
      // 파이어베이스 Timestamp 또는 Date 객체 대응
      const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime();
      const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime();
      return dateB - dateA; // 최신순
    })
    .map(char => ({ ...char, rank: 999 })); // 6등 이하는 순위 표시 제외용 임의 값

  // 4. 상위 5명 + 나머지 최신순 목록을 합쳐서 반환합니다.
  return [...top5, ...others];
});
</script>

<style scoped>
/* 검색창 높이 및 내부 정렬 수정 */
.custom-search-field :deep(.v-field__input) {
  min-height: 70px !important;
  /* 높이를 48px로 상향 */
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  align-items: center;
  font-size: 0.95rem;
  /* 텍스트 크기 살짝 키움 */
}

.custom-search-field :deep(.v-field) {
  height: 70px !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  /* 테두리를 살짝 주어 구분감 강화 */
}

.custom-search-field :deep(.v-field__append-inner) {
  align-items: center;
  padding-top: 0 !important;
}

.character-list-scroll {
  max-height: calc(100vh - 200px);
  overflow-y: auto !important;
  padding-right: 8px;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 10px;
}

.char-rank-card {
  position: relative;
  background: rgba(45, 45, 45, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
}

.rank-number {
  font-size: 1.2rem;
  font-style: italic;
  margin-right: 4px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.glow-overlay {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent);
  transition: none;
  animation: sweep 2s infinite;
  /* 3초에서 2초로 단축 */
}

@keyframes sweep {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

.rank-step-1 {
  border: 2px solid #ff1e00 !important;
  box-shadow: inset 0 0 20px rgba(255, 215, 0, 0.2), 0 0 15px rgba(255, 215, 0, 0.4) !important;
  background: linear-gradient(135deg, #2b2100 0%, #1a1a1a 100%) !important;
}

.rank-step-1 .rank-number,
.rank-step-1 .combat-power-text {
  color: #ff1e00 !important;
}

.rank-step-2 {
  border: 2px solid #d011d6 !important;
  box-shadow: inset 0 0 20px rgba(0, 242, 255, 0.1), 0 0 15px rgba(0, 242, 255, 0.3) !important;
  background: linear-gradient(135deg, #001f2b 0%, #1a1a1a 100%) !important;
}

.rank-step-2 .rank-number,
.rank-step-2 .combat-power-text {
  color: #d011d6 !important;
}

.rank-step-3 {
  border: 2px solid #ffe600 !important;
  box-shadow: 0 0 10px rgba(255, 170, 0, 0.2) !important;
  background: linear-gradient(135deg, #241800 0%, #1a1a1a 100%) !important;
}

.rank-step-3 .rank-number,
.rank-step-3 .combat-power-text {
  color: #ffe600 !important;
}

.rank-step-4 {
  border: 1.5px solid #E0E0E0 !important;
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%) !important;
}

.rank-step-4 .rank-number,
.rank-step-4 .combat-power-text {
  color: #E0E0E0 !important;
}

.rank-step-5 {
  border: 1.5px solid #9b5c1d !important;
  background: linear-gradient(135deg, #261400 0%, #1a1a1a 100%) !important;
}

.rank-step-5 .rank-number,
.rank-step-5 .combat-power-text {
  color: #9b5c1d !important;
}

.rank-normal {
  opacity: 0.85;
}

.rank-normal:hover {
  opacity: 1;
  transform: translateX(5px);
}

.profile-card {
  background: #1a1a2e;
  min-height: 100%;
}

.profile-gradient {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 10%, transparent 100%);
}

.gem-wrapper {
  width: 56px;
}

.gap-2 {
  gap: 8px;
}

.border-dashed {
  border: 1px dashed rgba(128, 128, 128, 0.3) !important;
}

/* 아크그리드 가독성 유지 */
.ark-slot-name {
  line-height: 1.2 !important;
  font-weight: 900 !important;
}

.v-theme--dark .ark-slot-name {
  color: #FFFFFF !important;
}

.ark-slot-card[style*="background-color: rgb(239, 108, 0)"] .ark-slot-name {
  color: #FFFFFF !important;
}

/* 레벨 배지 스타일 */
.level-badge {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0px 4px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 800;
  border: 1px solid rgba(255, 255, 255, 0.2);
  line-height: 1.2;
}

/* 랭킹 1위~5위별 레벨 배지 색상 포인트 (선택 사항) */
.rank-step-1 .level-badge {
  border-color: rgba(255, 30, 0, 0.5);
  color: #ff1e00;
}

.rank-step-2 .level-badge {
  border-color: rgba(132, 23, 146, 0.5);
  color: #d011d6;
}

.rank-step-3 .level-badge {
  border-color: rgba(255, 170, 0, 0.5);
  color: #ffe600;
}

.rank-step-4 .level-badge {
  border-color: #E0E0E0;
  color: #E0E0E0;
}

.rank-step-5 .level-badge {
  border-color: #9b5c1d;
  color: #9b5c1d;
}

/* 기존 전투력 텍스트 위치 미세 조정 */
.combat-power-text {
  letter-spacing: -0.02em;
}

/* --- 랭킹 애니메이션 고도화 --- */

/* 1. 테두리를 따라 흐르는 빛 애니메이션 */
@keyframes border-glow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 3. [핵심] 테두리 회전 애니메이션 정의 */
@keyframes border-beam {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 2. 카드 전체가 숨쉬는 듯한 광채 효과 */
@keyframes pulse-glow {
  0% { box-shadow: 0 0 5px var(--rank-color), inset 0 0 5px var(--rank-color); }
  50% { box-shadow: var(--glow-intensity) var(--rank-color), inset 0 0 10px var(--rank-color); }
  100% { box-shadow: 0 0 5px var(--rank-color), inset 0 0 5px var(--rank-color); }
}

/* 랭킹 카드 공통 설정 */
.rank-step-1, .rank-step-2, .rank-step-3, .rank-step-4, .rank-step-5 {
  position: relative;
  background-size: 200% 200% !important;
  z-index: 1;
  /* 변수 초기화 */
  --glow-intensity: 0 0 15px; 
}

/* [1등] 압도적인 화력: 가장 빠른 속도와 강한 광채 */
.rank-step-1 {
  --rank-color: #ff1e00;
  --glow-intensity: 0 0 30px;
  border: 2.5px solid #ff1e00 !important;
  animation: border-glow 1.5s linear infinite, pulse-glow 0.8s ease-in-out infinite !important;
  background: linear-gradient(135deg, #4a0000, #1a1a1a, #ff1e00, #1a1a1a) !important;
  background-size: 300% 300% !important;
}
.rank-step-1 .rank-number { font-size: 1.5rem; text-shadow: 0 0 15px #ff1e00; }

/* [2등] 매우 빠름: 선명한 네온 효과 */
.rank-step-2 {
  --rank-color: #d011d6;
  --glow-intensity: 0 0 25px;
  border: 2px solid #d011d6 !important;
  animation: border-glow 2s linear infinite, pulse-glow 1.2s ease-in-out infinite !important;
  background: linear-gradient(135deg, #2b002b, #1a1a1a, #d011d6) !important;
}

/* [3등] 보통 빠름: 황금빛 광채 */
.rank-step-3 {
  --rank-color: #ffe600;
  --glow-intensity: 0 0 20px;
  border: 2px solid #ffe600 !important;
  animation: border-glow 3s linear infinite, pulse-glow 1.8s ease-in-out infinite !important;
  background: linear-gradient(135deg, #241800, #1a1a1a, #ffe600) !important;
}

/* [4등] 차분함: 은은한 실버 광원 */
.rank-step-4 {
  --rank-color: #E0E0E0;
  --glow-intensity: 0 0 10px;
  border: 1.5px solid #E0E0E0 !important;
  animation: border-glow 5s linear infinite, pulse-glow 3s ease-in-out infinite !important;
  background: linear-gradient(135deg, #2d2d2d, #1a1a1a) !important;
}

/* [5등] 기본: 아주 느리고 정적인 효과 */
.rank-step-5 {
  --rank-color: #9b5c1d;
  --glow-intensity: 0 0 8px;
  border: 1.5px solid #9b5c1d !important;
  animation: border-glow 8s linear infinite, pulse-glow 4s ease-in-out infinite !important;
  background: #1a1a1a !important;
}

/* 랭킹 텍스트 색상 동기화 */
.rank-step-1 .rank-number, .rank-step-1 .combat-power-text { color: #ff1e00 !important; }
.rank-step-2 .rank-number, .rank-step-2 .combat-power-text { color: #d011d6 !important; }
.rank-step-3 .rank-number, .rank-step-3 .combat-power-text { color: #ffe600 !important; }
.rank-step-4 .rank-number, .rank-step-4 .combat-power-text { color: #E0E0E0 !important; }
.rank-step-5 .rank-number, .rank-step-5 .combat-power-text { color: #9b5c1d !important; }

/* 빛 반사 효과(Glow Overlay) 속도도 순위에 맞춤 */
.rank-step-1 .glow-overlay { animation-duration: 1s; }
.rank-step-2 .glow-overlay { animation-duration: 1.5s; }
.rank-step-3 .glow-overlay { animation-duration: 2s; }
.rank-step-4 .glow-overlay { animation-duration: 3s; }
.rank-step-5 .glow-overlay { animation-duration: 4s; }

/* --- 은하수 & 우주 배경 효과 --- */

/* 1. 움직이는 우주 안개(Nebula) */
@keyframes nebula-move {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 2. 별빛 반짝임(Twinkle) */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 랭킹 카드 공통 (1~3등 전용 우주 효과) */
.rank-step-1::before, .rank-step-2::before, .rank-step-3::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  /* 다중 box-shadow로 작은 별들 표현 */
  background-image: 
    radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 50px 160px, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 80px 40px, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 160px 120px, #fff, rgba(0,0,0,0));
  background-size: 200px 200px;
  animation: twinkle 3s infinite ease-in-out;
  opacity: 0.5;
  z-index: 0;
}

/* [1등] 태양계 파괴급: 붉은 블랙홀 & 강력한 성운 */
.rank-step-1 {
  --rank-color: #ff1e00;
  --glow-intensity: 0 0 35px;
  border: 2.5px solid #ff1e00 !important;
  animation: border-glow 1.2s linear infinite, pulse-glow 0.7s ease-in-out infinite !important;
  background: radial-gradient(circle at center, #660000 0%, #1a1a1a 70%, #000 100%) !important;
  box-shadow: inset 0 0 50px rgba(255, 30, 0, 0.3) !important;
}

/* [2등] 보랏빛 은하: 차원 이동 효과 */
.rank-step-2 {
  --rank-color: #d011d6;
  --glow-intensity: 0 0 25px;
  border: 2px solid #d011d6 !important;
  animation: border-glow 1.8s linear infinite, pulse-glow 1.1s ease-in-out infinite !important;
  background: linear-gradient(135deg, #1a0033 0%, #d011d6 50%, #1a0033 100%) !important;
  background-size: 400% 400% !important;
  animation: nebula-move 5s ease infinite, border-glow 1.8s linear infinite !important;
}

/* [3등] 황금 성단: 초신성 폭발 직전 */
.rank-step-3 {
  --rank-color: #ffe600;
  --glow-intensity: 0 0 20px;
  border: 2px solid #ffe600 !important;
  animation: border-glow 2.5s linear infinite, pulse-glow 1.5s ease-in-out infinite !important;
  background: radial-gradient(ellipse at top right, #4d3300 0%, #1a1a1a 60%) !important;
}

/* 4~5등은 이전의 깔끔한 스타일 유지 */
.rank-step-4 { --rank-color: #E0E0E0; --glow-intensity: 0 0 10px; border: 1.5px solid #E0E0E0 !important; animation: border-glow 5s linear infinite; background: #1a1a1a !important; }
.rank-step-5 { --rank-color: #9b5c1d; --glow-intensity: 0 0 5px; border: 1.5px solid #9b5c1d !important; animation: border-glow 8s linear infinite; background: #1a1a1a !important; }

/* 텍스트 가독성을 위해 z-index 조정 */
.char-rank-card .position-relative {
  z-index: 2 !important;
}

/* 드래그 앤 드롭 타겟 영역 최적화 */
.bus-member-draggable-area {
  min-height: 120px;
  /* 드롭 영역을 확실하게 확보 */
  width: 100%;
  cursor: copy;
  /* 드래그 중 드롭 가능하다는 커서 표시 */
  transition: background-color 0.2s ease;
}

/* 드래그 앤 드롭 타겟 영역 최적화 */
.bus-member-draggable-area {
  min-height: 120px !important;
  /* 최소 높이 강제 확보 */
  width: 100%;
  cursor: copy;
}

/* 안내 문구가 실제 드롭 이벤트를 방해하지 않도록 보완 */
.empty-drop-msg {
  position: absolute;
  /* 영역 중앙에 띄움 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  pointer-events: none;
  /* 중요: 드래그 요소가 이 위를 지나갈 때 간섭 방지 */
  opacity: 0.3;
}

/* 드롭 존 레이아웃 유지 */
.drop-zone {
  position: relative;
  /* empty-drop-msg 배치를 위해 필요 */
  overflow: hidden;
}

/* 드래그 중인 원본 요소의 스타일 (선택 사항) */
.sortable-ghost {
  opacity: 0.3;
  background: var(--v-theme-primary) !important;
}

.sortable-drag {
  cursor: grabbing;
}
</style>