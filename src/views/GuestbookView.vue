<template>
  <v-container class="py-8" max-width="800">
    <v-card variant="flat" border class="rounded-xl pa-6">
      <h2 class="text-h4 font-weight-black text-primary mb-6">
        <v-icon size="large" class="me-2">mdi-message-draw</v-icon> 흐흣 낙서장
      </h2>

      <v-form @submit.prevent="addMessage" class="mb-8">
        <v-row dense>
          <v-col cols="12" sm="3">
            <v-text-field 
              v-model="newName" 
              label="닉네임" 
              variant="outlined" 
              density="compact" 
              hide-details
              readonly 
              :placeholder="!newName ? '캐릭터 미설정' : ''"
              class="mb-2 font-weight-bold"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="9">
            <v-text-field 
              v-model="newMessage" 
              :label="!newName ? '상단 메뉴에서 대표 캐릭터를 먼저 설정해주세요!' : '자유롭게 한마디 남겨주세요!'" 
              variant="outlined" 
              density="compact"
              :disabled="!newName"
              append-inner-icon="mdi-send" 
              @click:append-inner="addMessage" 
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>
      </v-form>

      <v-divider class="mb-6"></v-divider>

      <v-list lines="two" class="bg-transparent">
        <v-fade-transition group>
          <v-list-item v-for="msg in messages" :key="msg.id" class="mb-4 pa-4 rounded-lg border transition-swing"
            :class="theme.global.current.value.dark ? 'bg-grey-darken-3' : 'bg-grey-lighten-5'">
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold d-flex align-center"
              :class="{ 'text-white': theme.global.current.value.dark }">
              {{ msg.nickname }}
              <span class="text-caption text-medium-emphasis ms-3">{{ formatDate(msg.createdAt) }}</span>
            </v-list-item-title>

            <v-list-item-subtitle class="text-body-1 mt-1"
              :class="theme.global.current.value.dark ? 'text-white' : 'text-black'" style="opacity: 1;">
              {{ msg.content }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-btn icon="mdi-delete-outline" size="small" variant="text" color="medium-emphasis"
                @click="deleteMessage(msg.id)"></v-btn>
            </template>
          </v-list-item>
        </v-fade-transition>
      </v-list>

      <div v-if="messages.length === 0" class="text-center py-10 text-grey">
        첫 번째 낙서의 주인공이 되어보세요!
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useTheme } from 'vuetify';

const theme = useTheme();
const messages = ref([]);
const newName = ref('');
const newMessage = ref('');

// 대표 캐릭터 정보를 로컬스토리지에서 가져오는 함수
const loadCurrentMainName = () => {
  const savedName = localStorage.getItem('current_main_name');
  newName.value = savedName || '';
};

// 계정 변경 이벤트를 처리하는 함수
const handleMainCharChange = (e) => {
  newName.value = e.detail;
};

// 1. 메시지 실시간 읽기 및 초기 설정
onMounted(() => {
  loadCurrentMainName(); // 초기 이름 로드
  window.addEventListener('main-char-changed', handleMainCharChange); // 계정 변경 감지 리스너 등록

  const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });
});

// 컴포넌트 해제 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('main-char-changed', handleMainCharChange);
});

// 2. 메시지 추가
const addMessage = async () => {
  // 대표 캐릭터가 설정되지 않았을 경우 안내
  if (!newName.value) {
    return alert('상단 메뉴에서 대표 캐릭터를 먼저 설정해야 작성이 가능합니다!');
  }
  
  if (!newMessage.value) return alert('내용을 입력해주세요!');

  try {
    await addDoc(collection(db, "guestbook"), {
      nickname: newName.value,
      content: newMessage.value,
      createdAt: serverTimestamp()
    });
    newMessage.value = ''; // 입력창 비우기
  } catch (e) {
    console.error(e);
  }
};

// 3. 메시지 삭제
const deleteMessage = async (id) => {
  if (confirm('이 낙서를 지울까요?')) {
    await deleteDoc(doc(db, "guestbook", id));
  }
};

// 날짜 포맷팅 함수
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};
</script>

<style scoped>
.transition-swing {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-swing:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.08) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>