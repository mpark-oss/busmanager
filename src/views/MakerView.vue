<template>
  <v-container fluid class="bg-grey-lighten-4 fill-height align-start">
    <v-row>
      <v-col cols="12" md="3" lg="2">
        <v-card variant="flat" class="rounded-lg pa-3" border min-height="85vh">
          <div class="text-subtitle-1 font-weight-bold mb-3">
            <v-icon color="primary" class="me-1">mdi-account-plus</v-icon> 캐릭터 추가
          </div>
          
          <v-text-field
            v-model="searchName"
            label="캐릭터명"
            append-inner-icon="mdi-magnify"
            @click:append-inner="fetchCharacter"
            @keyup.enter="fetchCharacter"
            :loading="isLoading"
            density="compact"
            variant="outlined"
            hide-details
            class="mb-4"
          ></v-text-field>

          <v-divider class="mb-4"></v-divider>

          <div class="character-list">
            <draggable
              v-model="charList"
              :group="{ name: 'pilots', pull: 'clone', put: false }"
              :clone="cloneCharacter"
              item-key="id"
            >
              <template #item="{ element }">
                <v-card class="mb-2 pa-2 cursor-move rounded-md" variant="tonal" color="primary" border>
                  <div class="d-flex align-center gap-2">
                    <v-avatar size="40" border class="me-2 bg-white">
                      <v-img :src="element.img || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'"></v-img>
                    </v-avatar>
                    <div class="flex-grow-1 overflow-hidden">
                      <div class="font-weight-bold text-truncate" style="font-size: 0.85rem;">{{ element.name }}</div>
                      <div class="text-caption text-truncate" style="font-size: 0.7rem;">
                        {{ element.job }} | {{ element.level }}
                      </div>
                    </div>
                    <v-btn icon="mdi-close" size="18" variant="text" color="grey" @click="deleteChar(element.id)"></v-btn>
                  </div>
                </v-card>
              </template>
            </draggable>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="9" lg="10">
        <v-card variant="flat" class="rounded-lg pa-4" border min-height="85vh">
          <div class="d-flex justify-space-between align-center mb-6">
            <h2 class="text-h5 font-weight-black text-primary">
              <v-icon class="me-2">mdi-bus-clock</v-icon>버스 편성 대기실
            </h2>
            <v-btn color="primary" prepend-icon="mdi-plus-thick" rounded="pill" elevation="2" @click="addBusSlot">
              새 버스 만들기
            </v-btn>
          </div>

          <v-row dense>
            <v-col v-for="(bus, bIdx) in localBuses" :key="bus.localId" cols="12" sm="6" xl="4">
              <v-card border elevation="1" class="rounded-xl overflow-hidden mx-auto bus-card" max-width="450">
                <v-toolbar color="primary" density="compact" flat>
                  <v-icon icon="mdi-bus-side" class="ms-3" size="small"></v-icon>
                  <v-toolbar-title class="text-body-2 font-weight-bold">신규 편성 중</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn icon="mdi-close" size="x-small" @click="localBuses.splice(bIdx, 1)"></v-btn>
                </v-toolbar>

                <v-card-text class="pa-4">
                  <v-row dense>
                    <v-col cols="12">
                      <v-select v-model="bus.raid" :items="['2막', '3막', '4막', '종막', '세르카']" label="레이드 선택" density="compact" variant="outlined" class="mb-2"></v-select>
                    </v-col>
                    <v-col cols="12">
                      <v-select v-model="bus.difficulty" :items="['노말', '하드']" label="난이도 선택" density="compact" variant="outlined" class="mb-2"></v-select>
                    </v-col>
                  </v-row>

                  <div class="drop-zone pa-3 bg-grey-lighten-4 rounded-lg">
                    <div class="text-caption text-center text-grey mb-2" v-if="bus.members.length === 0">기사님을 여기에 드롭!</div>
                    <draggable v-model="bus.members" group="pilots" item-key="id" class="d-flex flex-wrap" style="min-height: 50px">
                      <template #item="{ element, index }">
                        <v-chip closable size="small" class="ma-1 font-weight-bold" color="primary" label @click:close="bus.members.splice(index, 1)">
                          <v-avatar start v-if="element.img">
                            <v-img :src="element.img"></v-img>
                          </v-avatar>
                          {{ element.name }} ({{ element.level }})
                        </v-chip>
                      </template>
                    </draggable>
                  </div>

                  <v-text-field v-model="bus.dateTime" type="datetime-local" label="출발 시간" variant="outlined" density="compact" class="mt-4"></v-text-field>
                </v-card-text>

                <v-card-actions class="pa-3">
                  <v-btn color="success" variant="flat" block rounded="lg" @click="confirmAndUpload(bus, bIdx)">운행표 확정 등록</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import draggable from 'vuedraggable';
import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";

// Vercel 환경 변수 연동
const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY; 
// Allorigins는 Authorization 헤더를 포함할 경우 별도의 처리가 필요할 수 있어 직접 호출 또는 전용 프록시 사용 권장
const PROXY_URL = "https://api.allorigins.win/raw?url=";

const searchName = ref('');
const charList = ref([]);
const localBuses = ref([]);
const isLoading = ref(false);

onMounted(() => {
  const q = query(collection(db, "characters"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    charList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
});

const fetchCharacter = async () => {
  if (!searchName.value) return;
  isLoading.value = true;
  try {
    const cleanKey = API_KEY ? API_KEY.trim() : "";
    // [이미지 포함] 프로필 API 호출
    const targetUrl = `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(searchName.value)}/profiles`;
    const finalUrl = `${PROXY_URL}${encodeURIComponent(targetUrl)}`;
    
    const response = await axios.get(finalUrl, { 
      headers: { 
        // Allorigins 사용 시 Authorization 헤더를 싣는 것이 제한적일 수 있음
        'accept': 'application/json', 
        'authorization': `bearer ${cleanKey}` 
      } 
    });
    
    const data = response.data;
    if (data && data.CharacterName) {
      await addDoc(collection(db, "characters"), {
        name: data.CharacterName,
        level: data.ItemAvgLevel, 
        job: data.CharacterClassName,
        combatPower: data.CombatPower || "0",
        img: data.CharacterImage, // 캐릭터 사진 저장
        createdAt: new Date()
      });
      searchName.value = '';
    } else { alert("정보를 찾을 수 없습니다."); }
  } catch (e) { 
    console.error(e);
    alert("검색 실패! API 키나 프록시 상태를 확인해주세요."); 
  } finally { isLoading.value = false; }
};

const deleteChar = async (id) => { if(confirm("삭제하시겠습니까?")) await deleteDoc(doc(db, "characters", id)); };
const addBusSlot = () => { localBuses.value.push({ localId: Date.now(), raid: '2막', difficulty: '노말', members: [], dateTime: '' }); };
const cloneCharacter = (char) => ({ ...char, id: Date.now() + Math.random() });

const confirmAndUpload = async (bus, index) => {
  if (!bus.dateTime) return alert('출발 시간을 선택해주세요!');
  if (bus.members.length === 0) return alert('기사를 1명 이상 등록해주세요!');
  try {
    await addDoc(collection(db, "schedules"), {
      raid: bus.raid, 
      difficulty: bus.difficulty, 
      members: JSON.parse(JSON.stringify(bus.members)), 
      dateTime: bus.dateTime, 
      createdAt: new Date()
    });
    localBuses.value.splice(index, 1);
    alert('운행표가 등록되었습니다!');
  } catch (e) { alert(e.message); }
};
</script>

<style scoped>
.cursor-move { cursor: move; }
.drop-zone { border: 1px dashed #ccc; min-height: 80px; }
.bus-card { transition: all 0.2s ease-in-out; }
.bus-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
.character-list { max-height: 70vh; overflow-y: auto; }
</style>
