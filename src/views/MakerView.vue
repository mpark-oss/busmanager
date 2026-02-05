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
            <v-icon class="me-2" color="primary">mdi-bus-school</v-icon> 캐릭터 정보 / 버스 만들기
          </h2>
          <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" size="large" elevation="2" @click="addBusSlot">
            새 버스 슬롯 만들기
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
                  <v-icon icon="mdi-bus-side" class="ms-3" size="small" color="white"></v-icon>
                  <v-toolbar-title class="text-body-2 font-weight-bold text-white">신규 버스 편성</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn icon="mdi-close" size="x-small" color="white" @click="localBuses.splice(bIdx, 1)"></v-btn>
                </v-toolbar>
                <v-card-text class="pa-4">
                  <v-select v-model="bus.raid" :items="['2막', '3막', '4막', '종막', '세르카']" label="레이드" density="compact"
                    variant="outlined" class="mb-2"></v-select>
                  <v-select v-model="bus.difficulty" :items="['노말', '하드']" label="난이도" density="compact"
                    variant="outlined" class="mb-2"></v-select>
                  <div class="text-subtitle-2 font-weight-black mb-2 d-flex align-center text-high-emphasis">
                    <v-icon size="18" class="me-1">mdi-account-check</v-icon> 참여 기사 목록
                  </div>
                  <div class="drop-zone pa-3 rounded-lg border-dashed mb-4"
                    :style="{ backgroundColor: theme.global.current.value.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }">
                    <div v-if="bus.members.length === 0"
                      class="d-flex flex-column align-center justify-center py-4 text-medium-emphasis">
                      <v-icon size="24" class="mb-1">mdi-drag-variant</v-icon>
                      <div class="text-caption">기사를 이리로 드래그하세요</div>
                    </div>
                    <draggable v-model="bus.members" group="pilots" item-key="id" class="d-flex flex-wrap">
                      <template #item="{ element, index }">
                        <v-chip closable size="small" color="primary" class="ma-1 font-weight-bold text-white" label
                          @click:close="bus.members.splice(index, 1)">
                          {{ element.job }} | {{ element.name }} | Lv.{{ element.level }} | ⚔ {{ element.combatPower }}
                        </v-chip>
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

onMounted(() => {
  const q = query(collection(db, "characters"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => { charList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); });
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
const addBusSlot = () => localBuses.value.push({ localId: Date.now(), raid: '2막', difficulty: '노말', members: [], dateTime: '' });
const cloneCharacter = (char) => ({ ...char, id: Date.now() + Math.random() });

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
  border: 2px solid #00F2FF !important;
  box-shadow: inset 0 0 20px rgba(0, 242, 255, 0.1), 0 0 15px rgba(0, 242, 255, 0.3) !important;
  background: linear-gradient(135deg, #001f2b 0%, #1a1a1a 100%) !important;
}

.rank-step-2 .rank-number,
.rank-step-2 .combat-power-text {
  color: #00F2FF !important;
}

.rank-step-3 {
  border: 2px solid #FFAA00 !important;
  box-shadow: 0 0 10px rgba(255, 170, 0, 0.2) !important;
  background: linear-gradient(135deg, #241800 0%, #1a1a1a 100%) !important;
}

.rank-step-3 .rank-number,
.rank-step-3 .combat-power-text {
  color: #FFAA00 !important;
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
  border: 1.5px solid #CD7F32 !important;
  background: linear-gradient(135deg, #261400 0%, #1a1a1a 100%) !important;
}

.rank-step-5 .rank-number,
.rank-step-5 .combat-power-text {
  color: #CD7F32 !important;
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
  border-color: rgba(0, 242, 255, 0.5);
  color: #00f2ff;
}

.rank-step-3 .level-badge {
  border-color: rgba(255, 170, 0, 0.5);
  color: #ffaa00;
}

/* 기존 전투력 텍스트 위치 미세 조정 */
.combat-power-text {
  letter-spacing: -0.02em;
}

/* 1. 테두리를 따라 흐르는 빛 애니메이션 */
@keyframes border-glow {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* 2. 카드 전체가 숨쉬는 듯한 광채 효과 */
@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 5px var(--rank-color), inset 0 0 5px var(--rank-color);
  }

  50% {
    box-shadow: 0 0 20px var(--rank-color), inset 0 0 10px var(--rank-color);
  }

  100% {
    box-shadow: 0 0 5px var(--rank-color), inset 0 0 5px var(--rank-color);
  }
}

/* 랭킹 카드 공통 애니메이션 설정 */
.rank-step-1,
.rank-step-2,
.rank-step-3,
.rank-step-4,
.rank-step-5 {
  position: relative;
  background-size: 200% 200% !important;
  animation: border-glow 4s linear infinite, pulse-glow 2s ease-in-out infinite !important;
  z-index: 1;
}

/* 등급별 고유 색상 변수 설정 */
.rank-step-1 {
  --rank-color: #ff1e00;
  border: 2px solid #ff1e00 !important;
}

.rank-step-2 {
  --rank-color: #00F2FF;
  border: 2px solid #00F2FF !important;
}

.rank-step-3 {
  --rank-color: #FFAA00;
  border: 2px solid #FFAA00 !important;
}

.rank-step-4 {
  --rank-color: #E0E0E0;
  border: 1.5px solid #E0E0E0 !important;
}

.rank-step-5 {
  --rank-color: #CD7F32;
  border: 1.5px solid #CD7F32 !important;
}

/* 배경에 살짝 흐르는 그라데이션 추가 */
.rank-step-1 {
  background: linear-gradient(135deg, #2b1100, #1a1a1a, #4a0000) !important;
}

.rank-step-2 {
  background: linear-gradient(135deg, #001f2b, #1a1a1a, #003d4d) !important;
}

.rank-step-3 {
  background: linear-gradient(135deg, #241800, #1a1a1a, #4d3300) !important;
}
</style>