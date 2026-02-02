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

<template>
  <v-container>
    <v-card class="pa-6 rounded-xl shadow-lg" border variant="flat">
      <h2 class="text-h5 font-weight-black mb-6 text-primary">
        <v-icon class="me-2">mdi-bus-school</v-icon>버스 기사 등록
      </h2>
      
      <div class="d-flex gap-2">
        <v-text-field
          v-model="searchName"
          label="캐릭터명을 입력하세요"
          variant="outlined"
          density="comfortable"
          hide-details
          @keyup.enter="fetchCharacter"
        ></v-text-field>
        <v-btn 
          color="primary" 
          size="large" 
          class="ms-2 rounded-lg" 
          :loading="isLoading"
          @click="fetchCharacter"
        >
          검색
        </v-btn>
      </div>

      <v-expand-transition>
        <v-card v-if="characterInfo" class="mt-6 pa-4 bg-grey-lighten-4 rounded-lg" variant="flat" border>
          <div class="d-flex align-center">
            <v-avatar size="80" border class="me-4">
              <v-img :src="characterInfo.img"></v-img>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ characterInfo.name }}</div>
              <div class="text-body-2 text-grey-darken-1">
                {{ characterInfo.job }} | Lv.{{ characterInfo.level }}
              </div>
            </div>
            <v-spacer></v-spacer>
            <v-btn color="success" prepend-icon="mdi-plus" variant="flat" @click="addToBus">
              명단에 추가
            </v-btn>
          </div>
        </v-card>
      </v-expand-transition>
    </v-card>
  </v-container>
</template>
