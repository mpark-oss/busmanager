<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h4 font-weight-black text-primary">
        <v-icon size="large" class="me-2">mdi-calendar-clock</v-icon>운행 예정표
      </h2>
    </div>

    <v-row>
      <v-col v-if="schedules.length === 0" cols="12" class="text-center py-10">
        <v-icon size="100" color="grey-lighten-2">mdi-bus-alert</v-icon>
        <p class="text-h6 text-grey-darken-1 mt-4">현재 등록된 운행표가 없습니다.</p>
      </v-col>

      <v-col v-for="bus in schedules" :key="bus.id" cols="12">
        <v-card border elevation="2" class="rounded-xl overflow-hidden mb-6 mx-auto" max-width="1000">
          <v-toolbar color="primary" density="compact" flat>
            <v-icon icon="mdi-shield-cross" class="ms-3" size="small"></v-icon>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold">
              {{ bus.raid }} [{{ bus.difficulty }}]
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-delete" size="small" variant="text" @click="deleteSchedule(bus.id)"></v-btn>
          </v-toolbar>

          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-6 text-h5 font-weight-bold text-red-darken-1">
              <v-icon class="me-2" size="small">mdi-clock-outline</v-icon>
              {{ formatDateTime(bus.dateTime) }}
            </div>

            <v-divider class="mb-6"></v-divider>

            <div class="text-subtitle-2 text-grey-darken-1 mb-4 font-weight-bold">
              <v-icon size="small" class="me-1">mdi-account-group</v-icon> 참여 기사 명단
            </div>

            <v-row dense>
              <v-col 
                v-for="(member, mIdx) in bus.members" 
                :key="mIdx" 
                cols="6"
                sm="4"
                md="3" 
              >
                <v-card
                  variant="outlined"
                  class="pa-2 rounded-lg member-card"
                  style="border-color: #e0e0e0; background-color: #fafafa; min-height: 90px;"
                >
                  <div class="d-flex justify-space-between align-start mb-1">
                    <span class="text-caption font-weight-black text-primary text-truncate">{{ member.job }}</span>
                  </div>
                  <div class="text-body-2 font-weight-bold text-truncate mb-1">{{ member.name }}</div>
                  
                  <div style="font-size: 0.7rem; line-height: 1.2;">
                    <div class="d-flex align-center text-grey-darken-1">
                      <v-icon size="10" color="orange-darken-2" class="me-1">mdi-sword-cross</v-icon>
                      Lv.{{ member.level }}
                    </div>
                    <div class="d-flex align-center text-blue-darken-2 font-weight-bold mt-1">
                      <v-icon size="10" color="blue-darken-2" class="me-1">mdi-lightning-bolt</v-icon>
                      전투력: {{ member.combatPower }}
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>
          <v-card-actions class="bg-grey-lighten-5 pa-2 px-6">
            <v-spacer></v-spacer>
            <span class="text-caption text-grey">등록일: {{ formatDate(bus.createdAt) }}</span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

const schedules = ref([]);

onMounted(() => {
  const q = query(collection(db, "schedules"), orderBy("dateTime", "asc"));
  onSnapshot(q, (snapshot) => {
    schedules.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
});

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  return date.toLocaleString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit'
  });
};

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const d = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  return d.toLocaleDateString();
};

const deleteSchedule = async (id) => {
  if (confirm("해당 운행표를 삭제하시겠습니까?")) {
    try {
      await deleteDoc(doc(db, "schedules", id));
    } catch (e) { alert("삭제 실패: " + e.message); }
  }
};
</script>

<style scoped>
.member-card {
  /* 카드 내용이 넘칠 경우 처리 */
  overflow: hidden;
}
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>