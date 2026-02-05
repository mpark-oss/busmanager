<template>
  <v-container fluid class="fill-height align-start pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="3" lg="2" class="pa-4 border-end">
        <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
          <v-icon color="primary" class="me-2">mdi-account-multiple</v-icon> 기사 명단
        </div>
        <v-text-field v-model="searchName" label="캐릭터 추가" append-inner-icon="mdi-magnify"
          @click:append-inner="fetchCharacter" @keyup.enter="fetchCharacter" :loading="isLoading" density="compact"
          variant="solo-filled" flat hide-details class="mb-4 rounded-lg"></v-text-field>

        <v-divider class="mb-4"></v-divider>

        <div class="character-list custom-scroll">
          <draggable v-model="charList" :group="{ name: 'pilots', pull: 'clone', put: false }" :clone="cloneCharacter"
            item-key="id">
            <template #item="{ element }">
              <v-card class="mb-2 pa-2 cursor-pointer rounded-lg char-item-card transition-swing" variant="flat" border
                @click="selectCharacter(element.name)">
                <div class="d-flex align-center gap-3">
                  <v-avatar size="40" class="elevation-1 border">
                    <v-img :src="element.img || ''" cover></v-img>
                  </v-avatar>
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="font-weight-black text-body-2 text-truncate">{{ element.name }}</div>
                    <div class="text-caption text-medium-emphasis">{{ element.job }} | Lv.{{ element.level }}</div>
                  </div>
                  <v-btn icon="mdi-close-circle" size="18" variant="text" color="grey"
                    @click.stop="deleteChar(element.id)"></v-btn>
                </div>
              </v-card>
            </template>
          </draggable>
        </div>
      </v-col>

      <v-col cols="12" md="9" lg="10" class="pa-6 d-flex flex-column">
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
                          class="me-3 border border-opacity-25 bg-white shadow-sm flex-shrink-0">
                          <v-img :src="slot.Icon"></v-img>
                        </v-avatar>

                        <div class="flex-grow-1 overflow-hidden">
                          <div class="text-caption font-weight-black text-truncate ark-slot-name"
                            :class="{ 'text-white': theme.global.current.value.dark }"
                            style="line-height: 1.2 !important;">
                            {{ slot.Name }}
                          </div>

                          <div class="text-overline font-weight-bold d-flex justify-space-between"
                            :class="{ 'text-grey-lighten-3': theme.global.current.value.dark || slot.Grade === '유물' }"
                            style="line-height: 1 !important;">
                            <span>{{ slot.Grade }} 코어</span>
                            <span
                              :class="theme.global.current.value.dark || slot.Grade === '유물' ? 'text-blue-lighten-4' : 'text-blue-darken-4'">
                              {{ slot.Point }}PT
                            </span>
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
              <div v-else class="d-flex flex-column align-center justify-center flex-grow-1 text-center py-12"><v-icon
                  size="100" color="primary" class="opacity-20 mb-6">mdi-card-account-details-outline</v-icon>
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

const slotNameColor = computed(() => {
  return theme.global.current.value.dark ? '#FFFFFF !important' : '#000000 !important';
});

const slotSubtextColor = (grade) => {
  const isDark = theme.global.current.value.dark;
  return (isDark || grade === '유물') ? '#E0E0E0' : '#424242';
};

const slotPtColor = (grade) => {
  const isDark = theme.global.current.value.dark;
  return (isDark || grade === '유물') ? '#BBDEFB' : '#0D47A1';
};

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
    const response = await axios.get(url, { headers: { 'accept': 'application/json', 'authorization': `bearer ${API_KEY.trim()}` } });
    const data = response.data;
    if (data?.CharacterName) {
      await addDoc(collection(db, "characters"), {
        name: data.CharacterName, level: data.ItemAvgLevel, job: data.CharacterClassName,
        img: data.CharacterImage, combatPower: data.CombatPower, createdAt: new Date()
      });
      searchName.value = '';
    }
  } catch (e) { alert("검색 실패"); } finally { isLoading.value = false; }
};

const deleteChar = async (id) => { if (confirm("삭제하시겠습니까?")) await deleteDoc(doc(db, "characters", id)); };
const addBusSlot = () => { localBuses.value.push({ localId: Date.now(), raid: '2막', difficulty: '노말', members: [], dateTime: '' }); };
const cloneCharacter = (char) => ({ ...char, id: Date.now() + Math.random() });

const confirmAndUpload = async (bus, index) => {
  if (bus.members.length === 0) return alert('기사님을 등록해주세요!');
  try {
    await addDoc(collection(db, "schedules"), {
      raid: bus.raid, difficulty: bus.difficulty, members: JSON.parse(JSON.stringify(bus.members)), dateTime: bus.dateTime || "", createdAt: new Date()
    });
    localBuses.value.splice(index, 1);
    alert('등록 성공!');
  } catch (e) { alert(e.message); }
};
</script>

<style scoped>
/* 캐릭터 명단 고정 스크롤 영역 설정 */
.character-list {
  max-height: calc(100vh - 200px); /* 화면 전체 높이에서 검색 영역 상단 여백을 뺀 높이 */
  overflow-y: auto;
  padding-right: 4px;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 10px;
}

.char-item-card:hover {
  border-color: #7C4DFF !important;
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

/* [아크그리드 텍스트 강제 적용 스타일] */
.ark-slot-name {
  line-height: 1.2 !important;
  font-weight: 900 !important;
}

.ark-slot-pt {
  font-weight: 900 !important;
}

/* 다크모드 전용 텍스트 강제 고정 */
.v-theme--dark .ark-slot-name {
  color: #FFFFFF !important;
}

/* 유물 등급은 항상 밝은 텍스트 유지 */
.ark-slot-card[style*="background-color: rgb(239, 108, 0)"] .ark-slot-name {
  color: #FFFFFF !important;
}
</style>