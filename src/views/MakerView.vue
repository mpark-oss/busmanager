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
                    <v-avatar size="36" class="bg-white" border>
                      <v-img :src="element.img || ''" cover></v-img>
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
                      <v-select v-model="bus.raid" :items="['2막', '3막', '4막', '종막', '세르카']" label="레이드" density="compact" variant="outlined" class="mb-2"></v-select>
                    </v-col>
                    <v-col cols="12">
                      <v-select v-model="bus.difficulty" :items="['노말', '하드']" label="난이도" density="compact" variant="outlined" class="mb-2"></v-select>
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
                          {{ element.name }}
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

import { ref } from 'vue';

import axios from 'axios';

import { db } from '../firebase';

import { collection, addDoc } from "firebase/firestore";



const searchName = ref('');

const characterInfo = ref(null);

const isLoading = ref(false);



// Vercel 환경 변수에서 키를 가져옵니다.

const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY;



const fetchCharacter = async () => {

  if (!searchName.value) return;

  isLoading.value = true;

  characterInfo.value = null;



  try {

    const cleanKey = API_KEY ? API_KEY.trim() : "";

    

    // [수정 핵심] 프록시를 제거하고 직접 호출합니다. 

    // 로스트아크 API는 브라우저 직접 호출 시 CORS 에러가 날 수 있으므로 

    // 만약 에러가 지속되면 Vercel의 Serverless Function 기능을 써야 하지만, 

    // 일단 가장 표준적인 직접 호출 방식으로 교정합니다.

    const url = `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(searchName.value)}/profiles`;

    

    const response = await axios.get(url, {

      headers: { 

        'accept': 'application/json',

        'authorization': `bearer ${cleanKey}` 

      }

    });



    if (response.data) {

      characterInfo.value = {

        name: response.data.CharacterName,

        job: response.data.CharacterClassName,

        level: response.data.ItemAvgLevel,

        img: response.data.CharacterImage

      };

    } else {

      alert("캐릭터를 찾을 수 없습니다.");

    }

  } catch (error) {

    console.error("API Error:", error);

    alert("캐릭터 검색 중 오류가 발생했습니다. API 키나 네트워크 상태를 확인해주세요.");

  } finally {

    isLoading.value = false;

  }

};



const addToBus = async () => {

  if (!characterInfo.value) return;

  try {

    await addDoc(collection(db, "characters"), {

      ...characterInfo.value,

      createdAt: new Date()

    });

    alert("버스 기사 명단에 등록되었습니다!");

    characterInfo.value = null;

    searchName.value = '';

  } catch (e) {

    alert("등록 실패: " + e.message);

  }

};

</script>

<style scoped>
.cursor-move { cursor: move; }
.drop-zone { border: 1px dashed #ccc; min-height: 80px; }
.bus-card { transition: all 0.2s ease-in-out; }
.bus-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
.character-list { max-height: 70vh; overflow-y: auto; }
</style>
