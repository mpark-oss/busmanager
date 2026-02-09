<template>
  <v-container fluid class="fill-height align-start pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="3" lg="2" class="pa-4 border-end d-flex flex-column"
        style="height: 100vh; max-height: 100vh;">

        <div class="flex-shrink-0">
          <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
            <v-icon color="primary" class="me-2">mdi-account-multiple</v-icon> 기사 명단
          </div>

          <v-text-field v-model="searchName" label="캐릭터 추가" append-inner-icon="mdi-magnify"
            @click:append-inner="fetchCharacter" @keyup.enter="fetchCharacter" :loading="isLoading"
            density="comfortable" variant="solo-filled" flat hide-details
            class="mb-4 rounded-lg custom-search-field"></v-text-field>
          <v-divider class="mb-4"></v-divider>
        </div>

        <div class="character-list-scroll custom-scroll flex-grow-1" style="overflow-y: auto; min-height: 0;">
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
                    <div class="font-weight-black text-body-2 text-truncate mb-1 text-name-fix">
                      {{ element.name }}
                    </div>

                    <div class="d-flex flex-column gap-0">
                      <div class="text-caption d-flex align-center" style="gap: 4px;">
                        <span class="level-badge">Lv.{{ element.level }}</span>
                        <span class="opacity-90 text-truncate text-job-fix">{{ element.job }}</span>
                      </div>

                      <div class="combat-power-text font-weight-black d-flex align-center mt-1"
                        style="font-size: 0.75rem;">
                        <v-icon size="12" class="me-1 text-name-fix">mdi-sword-cross</v-icon>
                        <span class="text-name-fix">{{ element.combatPower }}</span>
                      </div>
                    </div>
                  </div>

                  <v-btn icon="mdi-close-circle" size="18" variant="text"
                    :color="(element.rank <= 3 || theme.global.current.value.dark) ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'"
                    @click.stop="deleteChar(element.id)"></v-btn>
                </div>
              </v-card>
            </template>
          </draggable>
        </div>
      </v-col>

      <v-col cols="12" md="9" lg="10" class="pa-6 d-flex flex-column"
        style="height: 100vh; max-height: 100vh; overflow-y: auto;">
        <div class="d-flex justify-space-between align-center mb-6">
          <h2 class="text-h5 font-weight-black d-flex align-center">
            <v-icon class="me-2" color="primary">mdi-bus-school</v-icon> 캐릭터 정보 / 공격대 만들기
          </h2>
          <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" size="large" elevation="2" @click="addBusSlot">
            새 공대 만들기
          </v-btn>
        </div>

        <v-card variant="flat"
          class="rounded-xl pa-6 d-flex flex-column flex-grow-1 elevation-1 overflow-y-auto custom-scroll" border
          height="85vh">
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

                  <v-col cols="12" md="5">
                    <v-row no-gutters class="h-100">
                      <v-col cols="6" class="pe-1 d-flex flex-column">
                        <div class="text-subtitle-2 font-weight-black mb-2 opacity-70">착용 장비</div>
                        <div class="d-flex flex-column h-100">
                          <v-card v-for="item in filteredEquipment" :key="item.Name" variant="flat" border
                            class="pa-2 rounded-lg d-flex align-center mb-1 flex-grow-1">
                            <v-avatar size="32" rounded="sm" class="me-2 border border-opacity-25"
                              :style="{ backgroundColor: getEquipmentBgColor(item.Grade) }">
                              <v-img :src="item.Icon"></v-img>
                            </v-avatar>
                            <div class="overflow-hidden">
                              <div class="text-caption font-weight-black text-truncate"
                                style="line-height: 1.1; font-size: 0.75rem !important;">
                                {{ item.Name }}
                              </div>
                              <div class="text-overline opacity-60"
                                style="font-size: 0.5rem !important; line-height: 1;">
                                {{ item.Grade }}
                              </div>
                            </div>
                          </v-card>
                        </div>
                      </v-col>

                      <v-col cols="6" class="ps-1 d-flex flex-column">
                        <div class="text-subtitle-2 font-weight-black mb-2 opacity-70">악세서리 / 팔찌</div>
                        <div class="d-flex flex-column h-100">
                          <v-card v-for="acc in filteredAccessories" :key="acc.Name" variant="flat" border
                            class="pa-2 rounded-lg mb-1 flex-grow-1 accessory-polish-card d-flex align-center"
                            style="max-height: 100px; min-height: 60px;">
                            <v-avatar size="30" rounded="sm" class="me-2 flex-shrink-0"
                              :style="{ backgroundColor: getEquipmentBgColor(acc.Grade) }">
                              <v-img :src="acc.Icon"></v-img>
                            </v-avatar>

                            <div class="flex-grow-1 custom-scroll"
                              style="font-size: 0.65rem; overflow-y: auto; max-height: 80px;">
                              <div v-if="acc.displayInfo" v-html="acc.displayInfo" class="line-height-normal pe-1">
                              </div>
                              <div v-else class="text-caption text-grey">{{ acc.Type }}</div>
                            </div>
                          </v-card>
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col cols="12" md="4" class="d-flex flex-column">
                    <div class="text-subtitle-2 font-weight-black mb-3 opacity-70">아크그리드 정보</div>
                    <div class="d-flex flex-column mb-4">
                      <v-card v-for="slot in selectedChar.ArkGrid?.Slots" :key="slot.Index" variant="flat"
                        class="pa-1 rounded-lg d-flex align-center mb-1 ark-slot-card"
                        :style="{ backgroundColor: getArkGridBgColor(slot.Grade) }">

                        <v-avatar size="30" rounded="sm" class="me-2 border border-opacity-25 shadow-sm flex-shrink-0"
                          :style="{ backgroundColor: getEquipmentBgColor(slot.Grade) }">
                          <v-img :src="slot.Icon"></v-img>
                        </v-avatar>

                        <div class="flex-grow-1 overflow-hidden">
                          <div class="text-caption font-weight-black text-truncate ark-slot-name"
                            :class="{ 'text-white': theme.global.current.value.dark }"
                            style="line-height: 1.2 !important; font-size: 0.7rem;">{{
                              slot.Name }}</div>
                          <div class="text-overline font-weight-bold d-flex justify-space-between opacity-70"
                            style="line-height: 1 !important; font-size: 0.5rem !important;">
                            <span>{{ slot.Grade }}</span>
                            <span>{{ slot.Point }}PT</span>
                          </div>
                        </div>
                      </v-card>
                    </div>

                    <div class="text-subtitle-2 font-weight-black mb-2 opacity-70">아크그리드 상세 효과</div>
                    <v-card variant="outlined" border class="pa-2 rounded-xl flex-grow-1"
                      style="max-height: 240px; overflow-y: auto;">
                      <div v-for="effect in selectedChar.ArkGrid?.Effects" :key="effect.Name"
                        class="mb-1 d-flex align-center justify-space-between border-bottom border-opacity-10 pb-1">
                        <span class="text-caption font-weight-bold text-medium-emphasis">{{ effect.Name }}</span>
                        <v-chip size="x-small" color="primary" variant="flat" class="font-weight-black px-2">LV.{{
                          effect.Level }}</v-chip>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>

                <v-divider class="my-6"></v-divider>

                <v-row dense>
                  <v-col cols="12" md="6">
                    <div class="text-subtitle-2 font-weight-black mb-4 opacity-70">장착 보석</div>

                    <div class="d-flex flex-nowrap align-center overflow-x-auto custom-scroll pb-2" style="gap: 8px;">
                      <div v-for="(gem, index) in selectedChar.ArmoryGem?.Gems" :key="index"
                        class="text-center gem-wrapper flex-shrink-0">
                        <v-avatar size="52" rounded="lg" class="elevation-2 mb-1 border"><v-img
                            :src="gem.Icon"></v-img></v-avatar>
                        <div class="text-caption font-weight-black" style="font-size: 0.7rem;">{{ gem.Level }}LV</div>
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="12" md="6">
                    <div class="text-subtitle-2 font-weight-black mb-4 opacity-70">활성 각인</div>

                    <div class="d-flex flex-nowrap align-center overflow-x-auto custom-scroll pb-2" style="gap: 8px;">
                      <v-card v-for="engrave in selectedChar.ArmoryEngraving?.ArkPassiveEffects" :key="engrave.Name"
                        variant="outlined" border class="pa-2 px-3 rounded-pill d-flex align-center flex-shrink-0">
                        <v-chip size="x-small" color="orange-darken-4" class="me-2 font-weight-black text-white"
                          label>Lv.{{
                            engrave.Level }}</v-chip>
                        <span class="text-caption font-weight-bold text-truncate">{{ engrave.Name }}</span>
                      </v-card>
                    </div>
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
                    variant="outlined" class="mb-2" @update:model-value="bus.difficulty = '노말'"></v-select>

                  <v-select v-model="bus.difficulty" :items="getDifficultyList(bus.raid)" label="난이도" density="compact"
                    variant="outlined" class="mb-2"></v-select>
                  <div class="text-subtitle-2 font-weight-black mb-2 d-flex align-center text-high-emphasis">
                    <v-icon size="18" class="me-1">mdi-account-check</v-icon> 참여 공격대 목록
                  </div>
                  <div class="drop-zone pa-0 rounded-lg border-dashed mb-4"
                    :style="{ backgroundColor: theme.global.current.value.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }">

                    <draggable v-model="bus.members" group="pilots" item-key="id"
                      class="d-flex flex-wrap align-content-start bus-member-draggable-area pa-2 position-relative">
                      <template #item="{ element, index }">
                        <v-chip closable size="small" color="primary" class="ma-1 font-weight-bold text-white" label
                          @click:close="bus.members.splice(index, 1)">
                          {{ element.job }} | {{ element.name }} | Lv.{{ element.level }} | ⚔ {{ element.combatPower }}
                        </v-chip>
                      </template>

                      <template #footer>
                        <div v-if="bus.members.length === 0"
                          class="empty-drop-msg d-flex flex-column align-center justify-center pointer-events-none position-absolute w-100 h-100 top-0 left-0">
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

// 레이드 종류에 따라 난이도 목록을 반환하는 함수
const getDifficultyList = (raidName) => {
  if (raidName === '종막') {
    return ['노말', '하드', 'The First'];
  } else if (raidName === '세르카') {
    return ['노말', '하드', '나이트메어'];
  } else {
    // 그 외 (2막, 3막, 4막 등)
    return ['노말', '하드'];
  }
};

onMounted(() => {
  const qChar = query(collection(db, "characters"), orderBy("createdAt", "desc"));
  onSnapshot(qChar, (snapshot) => {
    charList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });

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

const getEquipmentBgColor = (grade) => {
  const colors = { '고대': '#3d3325', '유물': '#441c04', '전설': '#362003', '영웅': '#182233' };
  return colors[grade] || '#EEEEEE';
};

const getGradeColor = (grade) => {
  const colors = { '고대': '#E3C7A1', '유물': '#EF6C00', '전설': '#FFD200', '영웅': '#CE43FC' };
  return colors[grade] || '#999';
};

const filteredEquipment = computed(() => {
  if (!selectedChar.value?.ArmoryEquipment) return [];
  const targetTypes = ['무기', '투구', '상의', '하의', '장갑', '어깨'];
  return selectedChar.value.ArmoryEquipment.filter(item => targetTypes.includes(item.Type));
});

const filteredAccessories = computed(() => {
  if (!selectedChar.value?.ArmoryEquipment) return [];
  const targetTypes = ['목걸이', '귀걸이', '반지', '팔찌', '어빌리티 스톤'];

  return selectedChar.value.ArmoryEquipment
    .filter(item => targetTypes.includes(item.Type))
    .map(item => {
      let displayInfo = "";
      try {
        const tooltip = JSON.parse(item.Tooltip);
        for (const key in tooltip) {
          const element = tooltip[key];
          if (!element || !element.type) continue;

          // 1. 악세서리 & 팔찌 (ItemPartBox)
          if (element.type === 'ItemPartBox') {
            const title = element.value?.Element_000 || "";
            // 연마 효과 또는 팔찌 효과 추출
            if (title.includes("연마 효과") || title.includes("팔찌 효과")) {
              let content = element.value.Element_001;
              content = content.replace(/<img[^>]*>/g, ""); // 아이콘 제거
              displayInfo = content;
              break;
            }
          }

          // 2. 어빌리티 스톤 (IndentStringGroup) -> 무작위 각인 효과
          if (element.type === 'IndentStringGroup') {
            const title = element.value?.Element_000?.topStr || "";
            if (title.includes("무작위 각인 효과")) {
              const contentObj = element.value.Element_000.contentStr;
              let stoneHtml = "";
              for (const k in contentObj) {
                let str = contentObj[k].contentStr || "";
                str = str.replace(/<img[^>]*>/g, ""); // 아이콘 제거
                stoneHtml += str;
              }
              displayInfo = stoneHtml;
              break;
            }
          }
        }
      } catch (e) { console.error(e); }

      return { ...item, displayInfo };
    })
    .sort((a, b) => {
      const order = ['목걸이', '귀걸이', '반지', '팔찌', '어빌리티 스톤'];
      return order.indexOf(a.Type) - order.indexOf(b.Type);
    });
});

const confirmAndUpload = async (bus, index) => {
  if (bus.members.length === 0) return;
  try {
    isLoading.value = true;
    const scheduleData = {
      raid: bus.raid, difficulty: bus.difficulty, dateTime: bus.dateTime || "",
      members: JSON.parse(JSON.stringify(bus.members)), createdAt: new Date(), isHomework: bus.isHomework
    };
    const targetCollection = bus.isHomework ? "homeworks" : "schedules";
    await addDoc(collection(db, targetCollection), scheduleData);
    localBuses.value.splice(index, 1);
  } catch (e) { console.error(e); } finally { isLoading.value = false; }
};

const fetchCharacter = async () => {
  if (!searchName.value) return;
  isLoading.value = true;
  try {
    const url = `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(searchName.value)}/profiles`;
    const response = await axios.get(url, { headers: { 'accept': 'application/json', 'authorization': `bearer ${API_KEY.trim()}` } });
    const data = response.data;
    if (data && data.CharacterName) {
      const existingChar = charList.value.find(c => c.name === data.CharacterName);
      if (existingChar) await deleteDoc(doc(db, "characters", existingChar.id));
      await addDoc(collection(db, "characters"), {
        name: data.CharacterName, level: data.ItemAvgLevel, job: data.CharacterClassName, img: data.CharacterImage, combatPower: data.CombatPower, createdAt: new Date()
      });
      searchName.value = '';
    }
  } catch (e) { console.error(e); } finally { isLoading.value = false; }
};

const deleteChar = async (id) => { if (confirm("삭제하시겠습니까?")) await deleteDoc(doc(db, "characters", id)); };
const cloneCharacter = (char) => ({ ...char, id: Date.now() + Math.random() });
const addBusSlot = () => { localBuses.value.push({ localId: Date.now(), raid: '2막', difficulty: '노말', members: [], dateTime: '', isHomework: false }); };

const rankedCharList = computed(() => {
  const powerSorted = [...charList.value].sort((a, b) => {
    const powerA = parseInt(a.combatPower?.replace(/,/g, '') || 0);
    const powerB = parseInt(b.combatPower?.replace(/,/g, '') || 0);
    return powerB - powerA;
  });
  const top5Names = powerSorted.slice(0, 5).map(c => c.name);
  const top5 = powerSorted.slice(0, 5).map((char, index) => ({ ...char, rank: index + 1 }));
  const others = charList.value.filter(c => !top5Names.includes(c.name)).map(char => ({ ...char, rank: 999 }));
  return [...top5, ...others];
});
</script>

<style scoped>
/* [수정] 1~3등(상위권)만 흰색 텍스트와 그림자 효과 강제 적용 */
.rank-step-1 .text-name-fix,
.rank-step-1 .text-job-fix,
.rank-step-2 .text-name-fix,
.rank-step-2 .text-job-fix,
.rank-step-3 .text-name-fix,
.rank-step-3 .text-job-fix {
  text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.8) !important;
  color: white !important;
}

/* [추가] 그 외(4등, 5등, 일반)는 Vuetify 테마 색상(Light:검정, Dark:흰색)을 따름 */
.rank-step-4 .text-name-fix,
.rank-step-5 .text-name-fix,
.rank-normal .text-name-fix {
  color: rgb(var(--v-theme-on-surface)) !important;
  text-shadow: none !important;
}

.rank-step-4 .text-job-fix,
.rank-step-5 .text-job-fix,
.rank-normal .text-job-fix {
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  text-shadow: none !important;
}

:deep(.v-theme--light) .rank-step-2 {
  background: linear-gradient(135deg, #4a004d 0%, #7b1fa2 50%, #4a004d 100%) !important;
}

:deep(.v-theme--light) .rank-step-3 {
  background: linear-gradient(135deg, #7c5e00 0%, #b8860b 50%, #7c5e00 100%) !important;
}

.accessory-polish-card {
  background: rgba(var(--v-theme-surface-variant), 0.05) !important;
}

.ark-slot-card {
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}

.char-rank-card {
  position: relative;
  border: 1px solid rgba(128, 128, 128, 0.2) !important;
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.rank-number {
  font-size: 1.2rem;
  font-style: italic;
  margin-right: 4px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.char-rank-card .position-relative {
  z-index: 2 !important;
}

.rank-normal .text-name-fix {
  color: rgb(var(--v-theme-on-surface)) !important;
  text-shadow: none !important;
}

.rank-normal .text-job-fix {
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  text-shadow: none !important;
}

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

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 5px var(--rank-color), inset 0 0 5px var(--rank-color);
  }

  50% {
    box-shadow: var(--glow-intensity) var(--rank-color), inset 0 0 10px var(--rank-color);
  }

  100% {
    box-shadow: 0 0 5px var(--rank-color), inset 0 0 5px var(--rank-color);
  }
}

@keyframes twinkle {

  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.8);
  }

  50% {
    opacity: var(--star-opacity);
    transform: scale(1.1);
  }
}

.rank-step-1,
.rank-step-2,
.rank-step-3 {
  position: relative;
  background-size: 200% 200% !important;
  z-index: 1;
  color: white !important;
}

.rank-step-1 {
  --rank-color: #ff1e00;
  border: 2.5px solid #ff1e00 !important;
  animation: border-glow 1s linear infinite, pulse-glow 0.6s ease-in-out infinite !important;
  background: radial-gradient(circle at center, #600000 0%, #1a1a1a 80%) !important;
}

.rank-step-2 {
  --rank-color: #d011d6;
  border: 2px solid #d011d6 !important;
  background: linear-gradient(135deg, #150025 0%, #2a0045 50%, #150025 100%) !important;
  animation: border-glow 1.5s linear infinite !important;
}

.rank-step-3 {
  --rank-color: #ffe600;
  border: 2px solid #ffe600 !important;
  background: radial-gradient(ellipse at top right, #2b1d00 0%, #1a1a1a 80%) !important;
  animation: border-glow 2s linear infinite !important;
}

.rank-step-4 {
  --rank-color: #757575;
  border: 1.5px solid #E0E0E0 !important;
}

.rank-step-5 {
  --rank-color: #9b5c1d;
  border: 1.5px solid #9b5c1d !important;
}

.rank-step-1::before,
.rank-step-2::before,
.rank-step-3::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(1px 1px at 10% 10%, #fff, transparent), radial-gradient(1.5px 1.5px at 60% 30%, #fff, transparent), radial-gradient(1.5px 1.5px at 85% 90%, #fff, transparent);
  background-size: var(--star-density) var(--star-density);
  animation: twinkle 2s infinite ease-in-out;
  opacity: var(--star-opacity);
  z-index: 1;
}

.glow-overlay {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: sweep 2s infinite;
  z-index: 1;
}

@keyframes sweep {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

/* 1. 검색창 스타일 */
.custom-search-field :deep(.v-field__input) {
  min-height: 70px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  align-items: center;
  font-size: 0.95rem;
}

.custom-search-field :deep(.v-field) {
  height: 70px !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 2. 스크롤바 스타일 */
.character-list-scroll {
  /* max-height 제거 -> flex-grow로 제어 */
  padding-right: 8px;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  /* 가로 스크롤바 높이 추가 */
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 10px;
}


.level-badge {
  background: rgba(128, 128, 128, 0.1);
  padding: 0px 4px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 800;
  border: 1px solid rgba(128, 128, 128, 0.2);
  line-height: 1.2;
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

.bus-member-draggable-area {
  min-height: 120px !important;
  width: 100%;
  cursor: copy;
}

.drop-zone {
  position: relative;
  overflow: hidden;
}

.line-height-normal p,
.line-height-normal font,
.line-height-normal div {
  line-height: 1.2 !important;
  margin-bottom: 0 !important;
}

/* [추가] 화이트 모드일 때, 악세서리 정보 내의 '흰색' 폰트를 강제로 '진한 회색'으로 변경 */
:deep(.v-theme--light) .accessory-polish-card font[color='#FFFFFF'] {
  color: #424242 !important;
}

/* 기존에 추가했던 흰색 폰트 강제 변경 코드 아래에 이어서 작성하세요 */

/* [추가] 화이트 모드일 때, 어빌리티 스톤의 밝은 노란색(#FFFFAC)을 진한 오렌지/브라운 색으로 변경 */
:deep(.v-theme--light) .accessory-polish-card font[color='#FFFFAC'] {
  color: #E65100 !important;
  /* 진한 오렌지색 (가독성 확보) */
  font-weight: 900 !important;
}

/* (참고) 혹시 붉은색(#FE2E2E - 감소 각인)도 잘 안 보인다면 아래 코드도 추가 고려 */
/* :deep(.v-theme--light) .accessory-polish-card font[color='#FE2E2E'] { color: #D50000 !important; } */
</style>