<template>
  <v-container class="py-8" max-width="800">
    <v-card variant="flat" border class="rounded-xl pa-6 bg-white">
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
              class="mb-2"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="9">
            <v-text-field
              v-model="newMessage"
              label="자유롭게 한마디 남겨주세요!"
              variant="outlined"
              density="compact"
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
          <v-list-item
            v-for="msg in messages"
            :key="msg.id"
            class="mb-4 pa-4 rounded-lg border bg-grey-lighten-5"
          >
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold d-flex align-center">
              {{ msg.nickname }}
              <span class="text-caption text-grey ms-3">{{ formatDate(msg.createdAt) }}</span>
            </v-list-item-title>
            
            <v-list-item-subtitle class="text-body-1 text-black mt-1" style="opacity: 1;">
              {{ msg.content }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-btn
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                color="grey-lighten-1"
                @click="deleteMessage(msg.id)"
              ></v-btn>
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
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

const messages = ref([]);
const newName = ref('');
const newMessage = ref('');

// 1. 메시지 실시간 읽기
onMounted(() => {
  const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });
});

// 2. 메시지 추가
const addMessage = async () => {
  if (!newName.value || !newMessage.value) return alert('닉네임과 내용을 입력해주세요!');
  
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
.v-list-item {
  transition: all 0.2s;
}
.v-list-item:hover {
  background-color: #f0f0f0 !important;
}
</style>