<template>
  <v-container fluid class="fill-height align-start pa-6">
    <v-row>
      <v-col cols="12" md="3" lg="2">
        <v-card variant="flat" class="rounded-lg pa-3" border min-height="85vh">
          <div class="text-subtitle-1 font-weight-bold mb-3">
            <v-icon color="primary" class="me-1">mdi-account-multiple</v-icon> 전체 기사 명단
          </div>
          <v-divider class="mb-4"></v-divider>
          
          <div class="character-list">
            <draggable
              v-model="charList"
              :group="{ name: 'pilots', pull: 'clone', put: false }"
              :clone="cloneCharacter"
              item-key="id"
            >
              <template #item="{ element }">
                <v-card class="mb-2 pa-2 cursor-move rounded-md bg-surface" variant="outlined" border>
                  <div class="d-flex align-center gap-2">
                    <v-avatar size="32" border>
                      <v-img :src="element.img || ''" cover></v-img>
                    </v-avatar>
                    <div class="flex-grow-1 overflow-hidden">
                      <div class="font-weight-bold text-truncate text-high-emphasis" style="font-size: 0.8rem;">
                        {{ element.name }}
                      </div>
                      <div class="text-caption text-truncate text-medium-emphasis" style="font-size: 0.65rem;">
                        Lv.{{ element.level }}
                      </div>
                      <div class="text-caption text-primary font-weight-bold" style="font-size: 0.6rem;">
                        <v-icon size="10">mdi-sword-cross</v-icon> {{ element.combatPower }}
                      </div>
                    </div>
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
            <h2 class="text-h4 font-weight-black text-primary">
              <v-icon size="large" class="me-2">mdi-calendar-clock</v-icon>운행 예정표
            </h2>
          </div>

          <v-row>
            <v-col v-if="schedules.length === 0" cols="12" class="text-center py-10">
              <v-icon size="100" color="grey-lighten-2">mdi-bus-alert</v-icon>
              <p class="text-h6 text-grey-darken-1 mt-4">현재 등록된 운행표가 없습니다.</p>
            </v-col>

            <v-col v-for="bus in schedules" :key="bus.id" cols="12" md="6" xl="4">
              <v-card border elevation="2" class="rounded-xl overflow-hidden mb-6 mx-auto bus-card">
                <v-toolbar color="primary" density="compact" flat>
                  <v-icon icon="mdi-shield-cross" class="ms-3" size="small"></v-icon>
                  <v-toolbar-title class="text-subtitle-1 font-weight-bold">
                    {{ bus.raid }} [{{ bus.difficulty }}]
                  </v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn icon="mdi-delete" size="small" variant="text" @click="deleteSchedule(bus.id)"></v-btn>
                </v-toolbar>

                <v-card-text class="pa-6">
                  <div class="d-flex align-center mb-4 text-h6 font-weight-bold" :class="bus.dateTime ? 'text-red-accent-2' : 'text-grey'">
                    <v-icon class="me-2" size="small">mdi-clock-outline</v-icon>
                    {{ formatDateTime(bus.dateTime) }}
                  </div>

                  <v-divider class="mb-4"></v-divider>

                  <v-alert v-if="bus.members.length > 0" variant="tonal" color="blue" class="mb-4 rounded-lg py-2" density="compact">
                    <div class="d-flex justify-space-between align-center">
                      <div class="text-subtitle-2 font-weight-bold">
                        <v-icon size="small" class="me-1" color="orange-darken-2">mdi-arm-flex</v-icon> 파티 평균 전투력
                      </div>
                      <div class="text-h6 font-weight-black">{{ calculateAveragePower(bus.members) }}</div>
                    </div>
                  </v-alert>

                  <div class="text-subtitle-2 text-medium-emphasis mb-2 font-weight-bold">
                    <v-icon size="small" class="me-1">mdi-account-group</v-icon> 참여 기사 명단 (드롭하여 추가)
                  </div>

                  <draggable
                    v-model="bus.members"
                    group="pilots"
                    item-key="id"
                    class="d-flex flex-wrap pa-2 bg-surface-variant rounded-lg border-dashed"
                    style="min-height: 100px"
                    @change="updateSchedule(bus)"
                  >
                    <template #item="{ element, index }">
                      <v-card
                        variant="outlined"
                        class="ma-1 pa-2 rounded-lg member-card bg-surface"
                        style="width: calc(50% - 8px); min-height: 85px;"
                      >
                        <div class="d-flex justify-space-between align-start">
                          <span class="text-caption font-weight-black text-primary text-truncate">{{ element.job }}</span>
                          <v-btn icon="mdi-close" size="14" variant="text" color="grey" @click="removeMember(bus, index)"></v-btn>
                        </div>
                        <div class="text-body-2 font-weight-bold text-truncate text-high-emphasis">{{ element.name }}</div>
                        <div style="font-size: 0.7rem;" class="mt-1">
                          <div class="text-medium-emphasis">Lv.{{ element.level }}</div>
                          <div class="text-blue-accent-2 font-weight-bold">
                            <v-icon size="10">mdi-sword-cross</v-icon> {{ element.combatPower }}
                          </div>
                        </div>
                      </v-card>
                    </template>
                  </draggable>
                </v-card-text>

                <v-divider></v-divider>
                <v-card-actions class="pa-2 px-6">
                  <v-spacer></v-spacer>
                  <span class="text-caption text-grey">등록일: {{ formatDate(bus.createdAt) }}</span>
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
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

const schedules = ref([]);
const charList = ref([]);

onMounted(() => {
  const qChar = query(collection(db, "characters"), orderBy("createdAt", "desc"));
  onSnapshot(qChar, (snapshot) => {
    charList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });

  const qSched = query(collection(db, "schedules"), orderBy("dateTime", "asc"));
  onSnapshot(qSched, (snapshot) => {
    schedules.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
});

const calculateAveragePower = (members) => {
  if (!members || members.length === 0) return "0";
  const total = members.reduce((acc, cur) => {
    const power = typeof cur.combatPower === 'string' 
      ? parseFloat(cur.combatPower.replace(/,/g, '')) 
      : (cur.combatPower || 0);
    return acc + power;
  }, 0);
  return Math.floor(total / members.length).toLocaleString();
};

const updateSchedule = async (bus) => {
  try {
    const busRef = doc(db, "schedules", bus.id);
    await updateDoc(busRef, {
      members: JSON.parse(JSON.stringify(bus.members))
    });
  } catch (e) {
    alert("업데이트 실패: " + e.message);
  }
};

const removeMember = (bus, index) => {
  bus.members.splice(index, 1);
  updateSchedule(bus);
};

const cloneCharacter = (char) => ({ ...char, id: Date.now() + Math.random() });

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "출발 미정";
  const date = new Date(dateTimeStr);
  return isNaN(date.getTime()) ? "출발 미정" : date.toLocaleString('ko-KR', {
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
.cursor-move { cursor: move; }
.character-list { max-height: 75vh; overflow-y: auto; }
.bus-card { transition: transform 0.2s; }
.border-dashed { border: 2px dashed rgba(var(--v-border-color), 0.3) !important; }
.member-card { overflow: hidden; }
.text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>