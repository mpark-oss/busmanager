<template>
  <v-container class="py-8" max-width="800">
    <v-card variant="flat" border class="rounded-xl pa-6 mb-6">
      <div class="d-flex align-center mb-4">
        <v-icon color="primary" class="me-2">mdi-link-variant</v-icon>
        <span class="text-h6 font-weight-black">바로가기 링크</span>
      </div>
      <v-row dense>
        <v-col v-for="link in quickLinks" :key="link.title" cols="6" sm="4" md="2.4">
          <v-btn block variant="tonal" :color="link.color" class="rounded-lg font-weight-bold" height="48"
            @click="openLink(link.url)">
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
        <v-icon start>mdi-alert-octagon</v-icon>흐흣 사건/사고
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
                <v-text-field v-model="newName" label="닉네임" variant="outlined" density="compact" hide-details readonly
                  :placeholder="!newName ? '캐릭터 미설정' : ''" class="mb-2 font-weight-bold"></v-text-field>
              </v-col>
              <v-col cols="12" sm="9">
                <v-text-field v-model="newMessage" :label="!newName ? '상단 메뉴에서 대표 캐릭터를 먼저 설정해주세요!' : '자유롭게 한마디 남겨주세요!'"
                  variant="outlined" density="compact" :disabled="!newName" append-inner-icon="mdi-send"
                  @click:append-inner="addMessage" hide-details></v-text-field>
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
                <v-divider class="my-3"></v-divider>
                <div class="px-2 pb-2">
                  <div v-for="reply in (msg.replies || [])" :key="reply.id" class="text-caption mb-1">
                    <b class="text-error">{{ reply.nickname }}:</b> {{ reply.content }}
                  </div>
                  <v-text-field v-model="msg.newReply" placeholder="댓글 작성..." variant="underlined" density="compact"
                    hide-details append-inner-icon="mdi-chat-plus-outline"
                    @click:append-inner="addComment('guestbook', msg)"
                    @keyup.enter="addComment('guestbook', msg)"></v-text-field>
                </div>
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
            <v-icon size="large" class="me-2">mdi-alert-octagon</v-icon> 흐흣 사건/사고
          </h2>

          <v-form @submit.prevent="submitReport" class="mb-8">
            <v-row dense>
              <v-col cols="12" sm="5">
                <v-text-field v-model="reportForm.targetName" label="신고 대상 캐릭터명" variant="outlined" density="compact"
                  append-inner-icon="mdi-magnify" placeholder="정확한 캐릭터명" hide-details
                  @update:model-value="isSearched = false" @keyup.enter="searchTarget"></v-text-field>
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field v-model="reportForm.incidentTime" label="사건 발생 시간" type="datetime-local"
                  variant="outlined" density="compact" hide-details></v-text-field>
              </v-col>

              <v-col cols="12" sm="3">
                <v-text-field v-model="reportForm.password" label="삭제 비번(4자리)" type="password" variant="outlined"
                  density="compact" maxlength="4" placeholder="숫자 4자리" hide-details></v-text-field>
              </v-col>

              <v-col cols="12" class="text-right mt-2">
                <v-btn color="primary" variant="tonal" rounded="lg" class="me-2" prepend-icon="mdi-magnify"
                  @click="searchTarget">
                  캐릭터 검색/확인
                </v-btn>

                <v-btn :color="isSearched ? 'error' : 'grey'" variant="flat" rounded="lg"
                  :prepend-icon="isSearched ? 'mdi-bullhorn' : 'mdi-lock'" @click="submitReport" :loading="isReporting"
                  :disabled="!isSearched">
                  {{ isSearched ? '신고 등록' : '캐릭터 검색 필요' }}
                </v-btn>
              </v-col>


              <v-col cols="12" class="mt-2">
                <v-textarea v-model="reportForm.reason" label="신고 사유" variant="outlined" rows="3"
                  placeholder="신고 사유를 상세히 적어주세요" hide-details></v-textarea>
              </v-col>

              <v-col cols="12" class="mt-2">
                <v-file-input v-model="reportForm.imageFile" label="증거 스크린샷" variant="outlined" density="compact"
                  prepend-icon="mdi-camera" accept="image/*" hide-details></v-file-input>
              </v-col>

            </v-row>
          </v-form>

          <v-divider class="mb-6"></v-divider>

          <v-text-field v-model="searchKeyword" label="신고 내역 통합 검색 (캐릭터명 입력)" placeholder="검색하면 해당 유저의 원정대 전체 내역이 나옵니다."
            prepend-inner-icon="mdi-account-search" variant="solo-filled" flat hide-details rounded="lg" clearable
            class="mb-6"></v-text-field>

          <v-fade-transition>
            <div v-if="searchKeyword" class="px-1 mb-4 d-flex align-center">
              <v-icon size="small" color="error" class="me-2">mdi-database-search</v-icon>
              <span class="text-subtitle-2 font-weight-bold">
                '{{ searchKeyword }}' 관련 통합 검색 결과:
                <span class="text-error">{{ filteredReports.length }}</span>건
              </span>
            </div>
          </v-fade-transition>

          <v-list class="bg-transparent">
            <v-fade-transition group>
              <v-list-item v-for="report in filteredReports" :key="report.id"
                class="mb-4 pa-4 rounded-lg border incident-item"
                :class="theme.global.current.value.dark ? 'bg-red-darken-4' : 'bg-red-lighten-5'">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-h6 font-weight-black text-error">🚨 대상: {{ report.targetName }}</span>
                  <span class="text-caption font-weight-bold">{{ formatDate(report.createdAt) }}</span>
                </div>
                <div class="text-subtitle-2 mb-2">
                  <b>발생 시각:</b> {{ report.incidentTime ? report.incidentTime.replace('T', ' ') : '정보 없음' }}
                </div>
                <div class="text-body-1 mb-2">{{ report.reason }}</div>
                <v-img v-if="report.imageUrl" :src="report.imageUrl" aspect-ratio="16/9" cover max-width="200"
                  height="120" class="rounded-lg mb-3 cursor-pointer thumbnail-hover border"
                  @click="openImage(report.imageUrl)">
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
                <div class="text-caption font-weight-bold"
                  :class="theme.global.current.value.dark ? 'text-red-lighten-3' : 'text-red-darken-2'">
                  올바른 길드 생활을 위해 반성하세요.
                </div>

                <template v-slot:append>
                  <v-btn icon="mdi-delete-outline" size="small" variant="elevated" color="bg-red-darken-4"
                    style="opacity: 1 !important;" @click="deleteReport(report)"></v-btn>
                </template>

                <v-divider class="my-3"></v-divider>
                <div class="px-2 pb-2">
                  <div v-for="reply in (report.replies || [])" :key="reply.id" class="text-caption mb-1">
                    <b class="text-error">{{ reply.nickname }}:</b> {{ reply.content }}
                  </div>

                  <v-text-field v-model="report.newReply" placeholder="댓글 작성..." variant="underlined" density="compact"
                    hide-details append-inner-icon="mdi-chat-plus-outline"
                    @click:append-inner="addComment('reports', report)"
                    @keyup.enter="addComment('reports', report)"></v-text-field>
                </div>
              </v-list-item>
            </v-fade-transition>
          </v-list>
          <div v-if="reports.length === 0" class="text-center py-10 text-grey">
            등록된 사건/사고 내역이 없습니다.
          </div>
          <div v-if="filteredReports.length === 0 && searchKeyword" class="text-center py-10 text-grey">
            '{{ searchKeyword }}'와 관련된 신고 내역이 없습니다.
          </div>
        </v-card>
      </v-window-item>
    </v-window>
  </v-container>
  <v-dialog v-model="imageDialog" max-width="90vw">
    <v-card class="bg-transparent shadow-none text-right">
      <v-btn icon="mdi-close" color="white" variant="text" @click="imageDialog = false"></v-btn>
      <v-img :src="selectedImage" max-height="85vh" contain class="rounded-lg shadow-lg"></v-img>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, setDoc, increment, getDocs } from 'firebase/firestore';
import { useTheme } from 'vuetify';
import axios from 'axios';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

// reportForm 초기 상태에 imageFile 추가
const reportForm = ref({ targetName: '', incidentTime: '', reason: '', password: '', imageFile: null });

const theme = useTheme();
const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";
const messages = ref([]);
const newName = ref('');
const newMessage = ref('');

// [수정] reportForm에 password 추가
const activeTab = ref('guestbook');
const reports = ref([]);
const isReporting = ref(false);

// GuestbookView.vue <script setup>
const imageDialog = ref(false);
const selectedImage = ref("");

// 이미지 클릭 시 호출할 함수
const openImage = (url) => {
  selectedImage.value = url;
  imageDialog.value = true;
};

// GuestbookView.vue <script setup>
const isSearched = ref(false); // 검색 완료 여부
const tempRosterList = ref([]); // 검색으로 가져온 원정대 명단

// [추가] 신고 검색어 상태값
const searchKeyword = ref('');

// [추가] 원정대 통합 검색 필터링 로직
const filteredReports = computed(() => {
  if (!searchKeyword.value.trim()) return reports.value;

  const keyword = searchKeyword.value.trim().toLowerCase();

  return reports.value.filter(report => {
    // 1. 대상자 이름 본인 확인
    const isDirectMatch = report.targetName.toLowerCase().includes(keyword);

    // 2. 해당 신고 데이터에 저장된 원정대 명단(rosterList) 중 일치하는 이름이 있는지 확인
    const isRosterMatch = (report.rosterList || []).some(name =>
      name.toLowerCase().includes(keyword)
    );

    return isDirectMatch || isRosterMatch;
  });
});

// [기존] 바로가기 링크 데이터
const quickLinks = [
  { title: '로아공홈', icon: 'mdi-home', url: 'https://lostark.game.onstove.com/Main', color: 'blue-darken-2' },
  { title: '로펙', icon: 'mdi-chart-box', url: 'https://lopec.kr/', color: 'cyan-darken-2' },
  { title: '로아와', icon: 'mdi-magnify', url: 'https://loawa.com/', color: 'deep-orange-darken-1' },
  { title: '로아인벤', icon: 'mdi-forum', url: 'https://lostark.inven.co.kr/', color: 'green-darken-2' },
  { title: '지옥/나락 효율', icon: 'mdi-calculator', url: 'https://loatto.kr/efficiency/hell-rewards/', color: 'indigo-darken-1' },
  { title: '영영소', icon: 'mdi-video-wireless', url: 'https://chzzk.naver.com/34ed30da91a4a278966346bac7b1075a/', color: 'green-accent-3' },
];

const openLink = (url) => {
  window.open(url, '_blank');
};

const searchTarget = async () => {
  if (!reportForm.value.targetName) return alert('검색할 캐릭터명을 입력하세요.');

  isSearched.value = false; // 검색 시작 시 초기화
  try {
    // 원정대 정보(siblings)를 바로 가져옵니다.
    const res = await axios.get(`/api/characters/${encodeURIComponent(reportForm.value.targetName)}/siblings`, {
      headers: { 'authorization': `bearer ${API_KEY.trim()}` }
    });

    if (res.data && Array.isArray(res.data)) {
      tempRosterList.value = res.data.map(c => typeof c === 'string' ? c : (c.CharacterName || c.name));
      isSearched.value = true; // 검색 성공 확정
    } else {
      alert('캐릭터를 찾을 수 없습니다. 정확한 이름을 입력해주세요.');
    }
  } catch (e) {
    console.error(e);
    alert('API 조회 중 오류가 발생했습니다.');
  }
};

const submitReport = async () => {
  // 1. 사전 유효성 검사
  if (!isSearched.value) {
    return alert('먼저 캐릭터 검색 버튼을 눌러 대상을 확인해주세요!');
  }
  if (!reportForm.value.reason || !reportForm.value.password) {
    return alert('신고 사유와 삭제 비밀번호를 입력해주세요!');
  }

  isReporting.value = true;

  try {
    // 2. 이미지 업로드 처리 (선택 사항)
    let imageUrl = "";
    if (reportForm.value.imageFile) {
      const file = Array.isArray(reportForm.value.imageFile)
        ? reportForm.value.imageFile[0]
        : reportForm.value.imageFile;

      if (file) {
        const fileRef = storageRef(storage, `reports/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
    }

    // 3. 원정대 키 생성 (searchTarget에서 미리 받아온 리스트 활용)
    // 중복 제거 후 가나다순 정렬하여 고유한 키 생성
    const rosterList = tempRosterList.value;
    const rosterKey = [...new Set(rosterList)].sort().join(',');

    // 4. 개별 신고 내역 저장 (imageUrl 포함)
    await addDoc(collection(db, "reports"), {
      targetName: reportForm.value.targetName,
      rosterKey: rosterKey,
      rosterList: rosterList,
      reason: reportForm.value.reason,
      password: reportForm.value.password,
      imageUrl: imageUrl,
      incidentTime: reportForm.value.incidentTime || new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    // 5. 원정대 통합 통계 업데이트
    const rosterRef = doc(db, "roster_stats", rosterKey);
    await setDoc(rosterRef, {
      totalCount: increment(1),
      members: rosterList,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // 6. 성공 알림 및 폼 초기화

    // 상태 초기화 (다음 신고를 위해 검색 상태도 리셋)
    isSearched.value = false;
    tempRosterList.value = [];
    reportForm.value = {
      targetName: '',
      incidentTime: '',
      reason: '',
      password: '',
      imageFile: null
    };

  } catch (e) {
    console.error("신고 저장 중 오류 발생:", e);
    alert('신고 등록 중 오류가 발생했습니다. 콘솔을 확인하세요.');
  } finally {
    isReporting.value = false;
  }
};

const deleteReport = async (report) => {
  const inputPw = prompt('이 신고를 삭제하려면 비밀번호를 입력하세요.');
  if (inputPw === null) return;

  const MASTER_PW = "0210";

  if (inputPw === report.password || inputPw === MASTER_PW) {
    if (confirm('정말로 삭제하시겠습니까?')) {
      try {
        // 1. 신고 내역 문서 삭제
        await deleteDoc(doc(db, "reports", report.id));

        // 2. roster_stats 테이블의 통합 점수 차감
        if (report.rosterKey) {
          const rosterRef = doc(db, "roster_stats", report.rosterKey);

          // Firestore의 increment(-1)을 사용하여 안전하게 차감
          await setDoc(rosterRef, {
            totalCount: increment(-1),
            lastUpdated: serverTimestamp()
          }, { merge: true });

          // (선택사항) 만약 점수가 0이 되면 문서를 지우고 싶다면 추가 로직이 필요하지만, 
          // 랭킹 시스템을 위해 마이너스만 되지 않게 관리하는 것이 좋습니다.
        }


      } catch (e) {
        console.error("삭제 중 오류:", e);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  } else {
    alert('비밀번호가 일치하지 않습니다!');
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
  window.addEventListener('paste', handlePaste); // 붙여넣기 이벤트 리스너 등록

  const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });

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
  window.removeEventListener('paste', handlePaste); // 리스너 제거
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

const addComment = async (collectionName, item) => {
  if (!newName.value) return alert('상단 메뉴에서 대표 캐릭터를 먼저 설정해야 작성이 가능합니다!');
  if (!item.newReply) return;

  try {
    const parentDocRef = doc(db, collectionName, item.id);
    const commentData = {
      nickname: newName.value,
      content: item.newReply,
      createdAt: new Date()
    };

    // 문서 내 replies 배열에 추가
    await setDoc(parentDocRef, {
      replies: [...(item.replies || []), { ...commentData, id: Date.now() }]
    }, { merge: true });

    item.newReply = '';
  } catch (e) {
    console.error("댓글 저장 오류:", e);
  }
};

// 2. 클립보드 이미지 붙여넣기 처리
const handlePaste = async (event) => {
  // 사건/사고 탭이 활성화되어 있을 때만 작동
  if (activeTab.value !== 'incident') return;

  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  for (const item of items) {
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      if (file) {
        // 클립보드 파일을 reportForm의 imageFile에 할당
        reportForm.value.imageFile = file;
        alert('클립보드 이미지가 첨부되었습니다.');
      }
    }
  }
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

.incident-item {
  border-left: 4px solid #F44336 !important;
}

.thumbnail-hover {
  transition: transform 0.2s ease-in-out, filter 0.2s ease;
}

.thumbnail-hover:hover {
  transform: scale(1.05);
  filter: brightness(0.8);
}

/* 맥락 상 맥스 사이즈 고정 (사이즈 통일) */
.v-img.thumbnail-hover {
  border-color: rgba(var(--v-theme-on-surface), 0.12) !important;
}
</style>