<template>
  <v-container class="py-8" max-width="800">
    <v-card variant="flat" border class="rounded-xl pa-6 mb-6">
      <div class="d-flex align-center mb-4">
        <v-icon color="primary" class="me-2">mdi-link-variant</v-icon>
        <span class="text-h6 font-weight-black">바로가기 링크</span>
      </div>
      <v-row dense>
        <v-col v-for="link in quickLinks" :key="link.title" cols="6" sm="4" md="2.4">
          <v-btn
            block
            variant="tonal"
            :color="link.color"
            class="rounded-lg font-weight-bold"
            height="48"
            @click="openLink(link.url)"
          >
            <v-icon start size="small">{{ link.icon }}</v-icon>
            {{ link.title }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="mb-4">
      <v-tab value="guestbook" class="font-weight-black">
        <v-icon start>mdi-message-draw</v-icon>흐흣 낙서장
      </v-tab>
      <v-tab value="incident" class="font-weight-black text-error">
        <v-icon start>mdi-alert-octagon</v-icon>사건/사고 게시판
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="guestbook">
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
      </v-window-item>

      <v-window-item value="incident">
        <v-card variant="flat" border class="rounded-xl pa-6">
          <h2 class="text-h4 font-weight-black text-error mb-6">
            <v-icon size="large" class="me-2">mdi-alert-octagon</v-icon> 사건/사고 게시판
          </h2>

          <v-form @submit.prevent="submitReport" class="mb-8">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field 
                  v-model="reportForm.targetName" 
                  label="신고 대상 캐릭터명" 
                  variant="outlined" 
                  density="compact" 
                  append-inner-icon="mdi-magnify"
                  @click:append-inner="searchTarget"
                  placeholder="정확한 캐릭터명을 입력하세요"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field 
                  v-model="reportForm.incidentTime" 
                  label="사건 발생 시간" 
                  type="datetime-local"
                  variant="outlined" 
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea 
                  v-model="reportForm.reason" 
                  label="신고 사유" 
                  variant="outlined" 
                  rows="3"
                  placeholder="신고 사유를 상세히 적어주세요 (작성자는 익명으로 등록됩니다)"
                ></v-textarea>
              </v-col>
              <v-col cols="12" class="text-right mt-2">
                <v-btn color="error" variant="flat" rounded="lg" prepend-icon="mdi-bullhorn" @click="submitReport" :loading="isReporting">
                  신고 등록
                </v-btn>
              </v-col>
            </v-row>
          </v-form>

          <v-divider class="mb-6"></v-divider>

          <v-list class="bg-transparent">
            <v-fade-transition group>
              <v-list-item v-for="report in reports" :key="report.id" class="mb-4 pa-4 rounded-lg border incident-item"
                :class="theme.global.current.value.dark ? 'bg-red-darken-4' : 'bg-red-lighten-5'">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-h6 font-weight-black text-error">🚨 대상: {{ report.targetName }}</span>
                  <span class="text-caption font-weight-bold">{{ formatDate(report.createdAt) }}</span>
                </div>
                <div class="text-subtitle-2 mb-2"><b>발생 시각:</b> {{ report.incidentTime.replace('T', ' ') }}</div>
                <div class="text-body-1 mb-2">{{ report.reason }}</div>
                <div class="text-caption text-medium-emphasis">신고 상태: 조사 중</div>
                <template v-slot:append>
                  <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error"
                    @click="deleteReport(report.id)"></v-btn>
                </template>
              </v-list-item>
            </v-fade-transition>
          </v-list>

          <div v-if="reports.length === 0" class="text-center py-10 text-grey">
            등록된 사건/사고 내역이 없습니다.
          </div>
        </v-card>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, setDoc, increment } from 'firebase/firestore';
import { useTheme } from 'vuetify';
import axios from 'axios';

const theme = useTheme();
const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";
const messages = ref([]);
const newName = ref('');
const newMessage = ref('');

// [추가] 탭 및 신고 관련 상태
const activeTab = ref('guestbook');
const reports = ref([]);
const isReporting = ref(false);
const reportForm = ref({ targetName: '', incidentTime: '', reason: '' });

// [기존] 바로가기 링크 데이터
const quickLinks = [
  { title: '로아공홈', icon: 'mdi-home', url: 'https://lostark.game.onstove.com/Main', color: 'blue-darken-2' },
  { title: '로펙', icon: 'mdi-chart-box', url: 'https://lopec.kr/', color: 'cyan-darken-2' },
  { title: '로아와', icon: 'mdi-magnify', url: 'https://loawa.com/', color: 'deep-orange-darken-1' },
  { title: '로아인벤', icon: 'mdi-forum', url: 'https://lostark.inven.co.kr/', color: 'green-darken-2' },
  { title: '지옥/나락 효율', icon: 'mdi-calculator', url: 'https://loatto.kr/efficiency/hell-rewards/', color: 'indigo-darken-1' },
  { title: '영영소', icon: 'mdi-video-wireless', url: 'https://m.chzzk.naver.com/34ed30da91a4a278966346bac7b1075a/', color: 'green-accent-3' },
];

const openLink = (url) => {
  window.open(url, '_blank');
};

// [추가] 캐릭터 검색 API
const searchTarget = async () => {
  if (!reportForm.value.targetName) return alert('검색할 캐릭터명을 입력하세요.');
  try {
    const res = await axios.get(`/api/armories/characters/${encodeURIComponent(reportForm.value.targetName)}/profiles`, {
      headers: { 'authorization': `bearer ${API_KEY.trim()}` }
    });
    if (res.data) {
      alert(`확인된 대상: [${res.data.CharacterClassName}] Lv.${res.data.ItemAvgLevel}`);
    } else {
      alert('캐릭터를 찾을 수 없습니다.');
    }
  } catch (e) {
    alert('API 조회 중 오류가 발생했습니다.');
  }
};

// [추가] 신고 등록 기능
const submitReport = async () => {
  if (!reportForm.value.targetName || !reportForm.value.reason) return alert('대상 캐릭터와 사유를 입력해주세요!');
  
  isReporting.value = true;
  try {
    // 1. 신고 기록 저장
    await addDoc(collection(db, "reports"), {
      targetName: reportForm.value.targetName,
      incidentTime: reportForm.value.incidentTime,
      reason: reportForm.value.reason,
      createdAt: serverTimestamp()
    });

    // 2. [빌런 집계] villains 컬렉션에 누적 포인트 합산
    const villainRef = doc(db, "villains", reportForm.value.targetName);
    await setDoc(villainRef, {
      reportCount: increment(1),
      lastReported: serverTimestamp()
    }, { merge: true });

    alert('신고가 등록되었습니다. 해당 유저는 빌런 포인트가 누적됩니다.');
    reportForm.value = { targetName: '', incidentTime: '', reason: '' };
  } catch (e) {
    console.error(e);
  } finally {
    isReporting.value = false;
  }
};

// [추가] 신고 삭제
const deleteReport = async (id) => {
  if (confirm('이 신고 기록을 삭제하시겠습니까?')) {
    await deleteDoc(doc(db, "reports", id));
  }
};

// --- 기존 로직 ---
const loadCurrentMainName = () => {
  const savedName = localStorage.getItem('current_main_name');
  newName.value = savedName || '';
};

const handleMainCharChange = (e) => {
  newName.value = e.detail;
};

onMounted(() => {
  loadCurrentMainName();
  window.addEventListener('main-char-changed', handleMainCharChange);

  // 기존 낙서장 구독
  const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });

  // [추가] 신고 게시판 구독
  const reportQ = query(collection(db, "reports"), orderBy("createdAt", "desc"));
  onSnapshot(reportQ, (snapshot) => {
    reports.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });
});

onUnmounted(() => {
  window.removeEventListener('main-char-changed', handleMainCharChange);
});

const addMessage = async () => {
  if (!newName.value) return alert('상단 메뉴에서 대표 캐릭터를 먼저 설정해야 작성이 가능합니다!');
  if (!newMessage.value) return alert('내용을 입력해주세요!');

  try {
    await addDoc(collection(db, "guestbook"), {
      nickname: newName.value,
      content: newMessage.value,
      createdAt: serverTimestamp()
    });
    newMessage.value = '';
  } catch (e) {
    console.error(e);
  }
};

const deleteMessage = async (id) => {
  if (confirm('이 낙서를 지울까요?')) {
    await deleteDoc(doc(db, "guestbook", id));
  }
};

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

/* [추가] 신고 아이템 스타일 */
.incident-item {
  border-left: 4px solid #F44336 !important;
}
</style>