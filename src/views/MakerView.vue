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
    // 환경 변수에서 가져온 키의 공백을 제거합니다.
    const cleanKey = API_KEY ? API_KEY.trim() : "";
    
    // 프록시 없이 직접 호출 (CORS 에러 발생 시 Vercel Edge Config 등이 필요할 수 있음)
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
    // 에러 발생 시 사용자에게 더 친절한 메시지를 보여줍니다.
    alert("검색 실패! API 키 설정이나 로스트아크 서버 상태를 확인해주세요.");
  } finally {
    isLoading.value = false;
  }
};

// 캐릭터 정보를 Firestore 'characters' 컬렉션에 저장하는 기능
const saveToList = async () => {
  if (!characterInfo.value) return;
  try {
    await addDoc(collection(db, "characters"), {
      ...characterInfo.value,
      createdAt: new Date()
    });
    alert("명단에 성공적으로 등록되었습니다!");
    characterInfo.value = null;
    searchName.value = '';
  } catch (e) {
    alert("등록 실패: " + e.message);
  }
};
</script>

<template>
  <v-container>
    <v-card class="pa-6 rounded-xl" border variant="flat">
      <h2 class="text-h5 font-weight-black mb-6 text-primary">
        <v-icon class="me-2">mdi-account-search</v-icon>캐릭터 검색 및 등록
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
          class="ms-2" 
          :loading="isLoading"
          @click="fetchCharacter"
        >
          검색
        </v-btn>
      </div>

      <v-expand-transition>
        <v-card v-if="characterInfo" class="mt-6 pa-4 bg-grey-lighten-4" variant="flat" border>
          <div class="d-flex align-center">
            <v-avatar size="80" class="me-4" border>
              <v-img :src="characterInfo.img"></v-img>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ characterInfo.name }}</div>
              <div class="text-body-2 text-grey-darken-1">
                {{ characterInfo.job }} | Lv.{{ characterInfo.level }}
              </div>
            </div>
            <v-spacer></v-spacer>
            <v-btn color="success" variant="flat" @click="saveToList">
              명단 등록
            </v-btn>
          </div>
        </v-card>
      </v-expand-transition>
    </v-card>
  </v-container>
</template>
