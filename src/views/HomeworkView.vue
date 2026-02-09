<template>
    <v-container fluid class="fill-height align-start pa-6">
        <v-row>
            <v-col cols="12" md="3" lg="2">
                <div class="sticky-sidebar">
                    <v-card variant="flat" class="rounded-lg pa-3 d-flex flex-column" border style="height: 100%;">
                        <div class="text-subtitle-1 font-weight-bold mb-2">
                            <v-icon color="success" class="me-1" size="small">mdi-account-check</v-icon> 숙제 참여 가능 명단
                        </div>
                        <div class="search-container mb-3">
                            <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" placeholder="이름/직업 검색"
                                variant="solo" density="compact" flat hide-details rounded="sm"
                                class="compact-search-field" clearable></v-text-field>
                        </div>
                        <v-divider class="mb-4"></v-divider>
                        <div class="character-list-wrapper">
                            <draggable :list="sortedCharList" :group="{ name: 'pilots', pull: 'clone', put: false }"
                                :clone="cloneCharacter" item-key="id">
                                <template #item="{ element }">
                                    <v-card class="mb-2 pa-2 cursor-move rounded-md bg-surface" variant="outlined"
                                        border>
                                        <div class="d-flex align-center gap-2">
                                            <v-avatar size="32" border><v-img :src="element.img || ''"
                                                    cover></v-img></v-avatar>
                                            <div class="flex-grow-1 overflow-hidden">
                                                <div class="font-weight-bold text-truncate text-high-emphasis"
                                                    style="font-size: 0.8rem;">{{ element.job }} | {{ element.name }}
                                                </div>
                                                <div class="text-caption text-truncate text-medium-emphasis"
                                                    style="font-size: 0.65rem;">Lv.{{ element.level }}</div>
                                            </div>
                                        </div>
                                    </v-card>
                                </template>
                            </draggable>
                        </div>
                    </v-card>
                </div>
            </v-col>

            <v-col cols="12" md="9" lg="10">
                <v-card variant="flat" class="rounded-lg pa-4" border min-height="85vh">
                    <div class="d-flex justify-space-between align-center mb-6">
                        <h2 class="text-h4 font-weight-black text-success">
                            <v-icon size="large" class="me-2">mdi-clipboard-check-multiple</v-icon>숙제 예정표
                        </h2>
                    </div>

                    <v-row class="mb-8">
                        <v-col cols="12">
                            <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center opacity-80">
                                <v-icon color="success" class="me-2">mdi-calendar-range</v-icon> 주간 일정 드래그 마스터 (오늘 기준
                                7일)
                            </div>
                            <div class="calendar-wrapper d-flex">
                                <div v-for="day in daysOfWeek" :key="day.fullDate"
                                    class="calendar-day-column flex-grow-1">
                                    <div class="day-header pa-2 text-center font-weight-bold"
                                        :class="{ 'today-header': isToday(day.fullDate) }">
                                        {{ day.display }}
                                    </div>

                                    <draggable :list="calendarSchedules[day.fullDate]" group="homework-items"
                                        item-key="id" class="day-dropzone pa-1"
                                        @change="(e) => onDateDrop(e, day.fullDate)">
                                        <template #item="{ element }">
                                            <v-chip size="x-small" :color="getDifficultyColor(element.difficulty)"
                                                variant="flat"
                                                class="mb-1 w-100 justify-start px-1 rounded-sm homework-chip transition-swing"
                                                :class="{ 'elevation-5': hoveredId === element.id }" label
                                                @mouseenter="hoveredId = element.id" @mouseleave="hoveredId = null"
                                                @click="scrollToDetail(element.id)">
                                                <span class="text-truncate font-weight-black">
                                                    [{{ element.difficulty[0] }}] {{ element.raid }}
                                                </span>
                                            </v-chip>
                                        </template>
                                    </draggable>
                                </div>

                                <div class="calendar-day-column pending-column flex-grow-1">
                                    <div
                                        class="day-header pa-2 text-center font-weight-bold bg-amber-lighten-4 text-amber-darken-4">
                                        일정 미정
                                    </div>
                                    <draggable :list="pendingHomeworks" group="homework-items" item-key="id"
                                        class="day-dropzone pa-1 bg-amber-lighten-5" @change="(e) => onDateDrop(e, '')">
                                        <template #item="{ element }">
                                            <v-chip size="x-small" color="amber-darken-2" variant="flat"
                                                class="mb-1 w-100 justify-start px-1 rounded-sm homework-chip"
                                                :class="{ 'elevation-5': hoveredId === element.id }" label
                                                @mouseenter="hoveredId = element.id" @mouseleave="hoveredId = null"
                                                @click="scrollToDetail(element.id)">
                                                <span class="text-truncate font-weight-black">{{ element.raid }}</span>
                                            </v-chip>
                                        </template>
                                    </draggable>
                                </div>
                            </div>
                        </v-col>
                    </v-row>

                    <v-divider class="mb-8"></v-divider>

                    <v-row>
                        <v-col v-if="upcomingHomeworks.length === 0" cols="12" class="text-center py-10">
                            <v-icon size="100" color="grey-lighten-2">mdi-calendar-remove</v-icon>
                            <p class="text-h6 text-grey-darken-1 mt-4">예정된 숙제가 없습니다.</p>
                        </v-col>

                        <v-col v-for="hw in upcomingHomeworks" :key="hw.id" cols="12" md="6" xl="4">
                            <v-card :id="`hw-card-${hw.id}`" border
                                :elevation="hoveredId === hw.id || clickedId === hw.id ? 12 : 2"
                                class="rounded-xl overflow-hidden mb-6 mx-auto homework-card transition-all" :class="{
                                    'today-card': isToday(hw.dateTime),
                                    'pending-card': !hw.dateTime,
                                    'highlight-focus': hoveredId === hw.id || clickedId === hw.id
                                }">
                                <v-toolbar
                                    :color="(!hw.dateTime) ? 'amber-darken-2' : (isToday(hw.dateTime) ? 'success' : 'teal-darken-1')"
                                    density="compact" flat>
                                    <v-icon :icon="!hw.dateTime ? 'mdi-clock-question' : 'mdi-shield-cross'"
                                        class="ms-3 me-2" size="small"></v-icon>

                                    <div class="d-flex align-center flex-grow-1 overflow-hidden" style="min-width: 0;">
                                        <span class="text-subtitle-1 font-weight-black me-2 text-truncate">{{ hw.raid
                                            }}</span>

                                        <v-chip size="small" :color="getDifficultyColor(hw.difficulty)"
                                            class="font-weight-black text-white px-2 flex-shrink-0" variant="flat"
                                            label>
                                            {{ hw.difficulty }}
                                        </v-chip>

                                        <v-chip v-if="isToday(hw.dateTime)" size="small" color="white"
                                            class="ms-2 font-weight-black today-badge flex-shrink-0" variant="flat"
                                            label>
                                            <v-icon start size="14" class="today-icon">mdi-star</v-icon> TODAY
                                        </v-chip>

                                        <v-chip v-else-if="!hw.dateTime" size="x-small" color="white" variant="outlined"
                                            class="ms-2 flex-shrink-0">일정 미정</v-chip>
                                    </div>

                                    <v-spacer></v-spacer>

                                    <v-btn icon="mdi-delete" size="small" variant="text"
                                        @click="deleteHomework(hw.id)"></v-btn>
                                </v-toolbar>

                                <v-card-text class="pa-6">
                                    <div class="d-flex align-center justify-space-between mb-4">
                                        <div class="text-h6 font-weight-bold d-flex align-center"
                                            :class="!hw.dateTime ? 'text-amber-darken-3' : (isToday(hw.dateTime) ? 'text-success' : 'text-grey-darken-1')">
                                            <v-icon class="me-2" size="small">mdi-clock-outline</v-icon>
                                            {{ formatDateTime(hw.dateTime) }}
                                        </div>
                                        <v-btn v-if="hw.dateTime" size="small" variant="tonal" color="success"
                                            prepend-icon="mdi-clock-edit" @click="openTimePicker(hw)">
                                            시간 수정
                                        </v-btn>
                                    </div>

                                    <v-divider class="mb-4"></v-divider>

                                    <v-alert v-if="hw.members.length > 0" variant="tonal"
                                        :color="isToday(hw.dateTime) ? 'success' : (!hw.dateTime ? 'amber' : 'teal')"
                                        class="mb-4 rounded-lg py-2" density="compact">
                                        <div class="d-flex justify-space-between align-center">
                                            <div class="text-subtitle-2 font-weight-bold"><v-icon size="small"
                                                    class="me-1">mdi-sword</v-icon> 파티 평균 전투력</div>
                                            <div class="text-h6 font-weight-black">{{ calculateAveragePower(hw.members)
                                                }}</div>
                                        </div>
                                    </v-alert>

                                    <div
                                        class="text-subtitle-2 mb-2 font-weight-bold d-flex align-center text-grey-darken-1">
                                        <v-icon size="small" class="me-1">mdi-account-group</v-icon> 참여 캐릭터 명단
                                    </div>
                                    <draggable v-model="hw.members" group="pilots" item-key="id"
                                        class="d-flex flex-wrap pa-2 rounded-lg border-dashed dropzone-area"
                                        @change="updateHomework(hw)">
                                        <template #item="{ element, index }">
                                            <v-card variant="outlined"
                                                class="ma-1 pa-2 rounded-lg member-card bg-surface"
                                                style="width: calc(50% - 8px); min-height: 85px;">
                                                <div class="d-flex justify-space-between align-start">
                                                    <span
                                                        class="text-caption font-weight-black text-success text-truncate">{{
                                                        element.job }}</span>
                                                    <v-btn icon="mdi-close" size="14" variant="text" color="grey"
                                                        @click="removeMember(hw, index)"></v-btn>
                                                </div>
                                                <div class="text-body-2 font-weight-bold text-truncate">{{ element.name
                                                    }}</div>
                                                <div style="font-size: 0.7rem;" class="mt-1">
                                                    <div class="text-medium-emphasis">Lv.{{ element.level }}</div>
                                                    <div class="text-teal-accent-4 font-weight-bold"><v-icon
                                                            size="10">mdi-sword-cross</v-icon> {{ element.combatPower }}
                                                    </div>
                                                </div>
                                            </v-card>
                                        </template>
                                    </draggable>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>

        <v-dialog v-model="timeDialog" max-width="320">
            <v-card class="rounded-xl pa-2">
                <v-card-title class="text-h6 font-weight-black">
                    <v-icon color="success" class="me-2">mdi-clock-edit</v-icon>시간 설정
                </v-card-title>
                <v-card-text>
                    <div class="text-caption mb-4 text-medium-emphasis">출발 시각을 선택해주세요.</div>
                    <v-text-field v-model="tempTime" type="time" variant="outlined" color="success"
                        rounded="lg"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" rounded="lg" @click="timeDialog = false">취소</v-btn>
                    <v-btn color="success" variant="flat" rounded="lg" class="px-6" @click="saveTime">저장</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import draggable from 'vuedraggable';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

const homeworks = ref([]);
const charList = ref([]);
const searchQuery = ref("");
const hoveredId = ref(null);
const clickedId = ref(null);

// 시간 수정 관련 상태
const timeDialog = ref(false);
const tempTime = ref("");
const selectedHw = ref(null);

onMounted(() => {
    onSnapshot(query(collection(db, "characters"), orderBy("createdAt", "desc")), (s) => {
        charList.value = s.docs.map(d => ({ id: d.id, ...d.data() }));
    });
    onSnapshot(query(collection(db, "homeworks"), orderBy("dateTime", "asc")), (s) => {
        homeworks.value = s.docs.map(d => ({ id: d.id, ...d.data() }));
    });
});

/* --- 달력 관련 로직 (수정됨) --- */
const daysOfWeek = computed(() => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);

        // [수정] toISOString() 대신 로컬 시간 기준으로 YYYY-MM-DD 문자열 직접 생성
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dayNum = String(d.getDate()).padStart(2, '0');
        const localFullDate = `${year}-${month}-${dayNum}`;

        days.push({
            fullDate: localFullDate,
            display: d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' })
        });
    }
    return days;
});

const calendarSchedules = computed(() => {
    const map = {};
    daysOfWeek.value.forEach(day => map[day.fullDate] = []);
    homeworks.value.forEach(hw => {
        if (hw.dateTime) {
            const dateKey = hw.dateTime.split('T')[0];
            if (map[dateKey]) map[dateKey].push(hw);
        }
    });
    return map;
});

const pendingHomeworks = computed(() => homeworks.value.filter(hw => !hw.dateTime));

const onDateDrop = async (event, targetDate) => {
    if (event.added) {
        const hw = event.added.element;
        const hwRef = doc(db, "homeworks", hw.id);

        // 기존 시간 보존 로직
        let existingTime = "00:00";
        if (hw.dateTime && hw.dateTime.includes('T')) {
            existingTime = hw.dateTime.split('T')[1].substring(0, 5);
        }

        await updateDoc(hwRef, {
            dateTime: targetDate ? `${targetDate}T${existingTime}` : ""
        });
    }
};

/* --- 시간 직접 수정 로직 --- */
const openTimePicker = (hw) => {
    selectedHw.value = hw;
    if (hw.dateTime && hw.dateTime.includes('T')) {
        tempTime.value = hw.dateTime.split('T')[1].substring(0, 5);
    } else {
        tempTime.value = "00:00";
    }
    timeDialog.value = true;
};

const saveTime = async () => {
    if (selectedHw.value && tempTime.value) {
        const datePart = selectedHw.value.dateTime.split('T')[0];
        const newDateTime = `${datePart}T${tempTime.value}`;
        await updateDoc(doc(db, "homeworks", selectedHw.value.id), { dateTime: newDateTime });
        timeDialog.value = false;
    }
};

/* --- 상세 카드 스크롤 및 하이라이트 --- */
const scrollToDetail = (id) => {
    clickedId.value = id;
    setTimeout(() => {
        const el = document.getElementById(`hw-card-${id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
};

const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.toDateString() === today.toDateString();
};

const upcomingHomeworks = computed(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    let list = homeworks.value.filter(hw => {
        if (!hw.dateTime) return true;
        return new Date(hw.dateTime) >= todayStart;
    });
    return [...list].sort((a, b) => {
        if (a.id === clickedId.value) return -1;
        if (b.id === clickedId.value) return 1;
        return new Date(a.dateTime || 0) - new Date(b.dateTime || 0);
    });
});

const sortedCharList = computed(() => {
    if (!searchQuery.value) return charList.value;
    const q = searchQuery.value.toLowerCase();
    return charList.value.filter(c => c.name.toLowerCase().includes(q) || c.job.toLowerCase().includes(q));
});

const calculateAveragePower = (members) => {
    if (!members || members.length === 0) return "0";
    const total = members.reduce((acc, cur) => {
        const power = typeof cur.combatPower === 'string' ? parseFloat(cur.combatPower.replace(/,/g, '')) : (cur.combatPower || 0);
        return acc + power;
    }, 0);
    return Math.floor(total / members.length).toLocaleString();
};

const updateHomework = async (hw) => {
    await updateDoc(doc(db, "homeworks", hw.id), { members: JSON.parse(JSON.stringify(hw.members)) });
};

const removeMember = (hw, index) => {
    hw.members.splice(index, 1);
    updateHomework(hw);
};

const cloneCharacter = (char) => ({ ...char, id: Date.now() + Math.random() });

const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "일정 미정";
    const date = new Date(dateTimeStr);
    return date.toLocaleString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' });
};

const deleteHomework = async (id) => {
    if (confirm("정말 삭제하시겠습니까?")) await deleteDoc(doc(db, "homeworks", id));
};

// 난이도별 뱃지 색상 반환 함수
const getDifficultyColor = (difficulty) => {
    if (['The First', '나이트메어'].includes(difficulty)) {
        return 'deep-purple-accent-2'; // 🟣 보라색
    } else if (difficulty === '하드') {
        return 'orange-darken-4';      // 🟠 주황색
    } else {
        return 'light-green-accent-4'; // 🟢 노말 (초록색)
    }
};
</script>

<style scoped>
@media (min-width: 960px) {
    .sticky-sidebar {
        position: sticky;
        top: 24px;
        height: calc(100vh - 48px) !important;
        z-index: 10;
    }

    .character-list-wrapper {
        flex: 1;
        overflow-y: auto !important;
        padding-right: 8px;
    }
}

.calendar-wrapper {
    display: flex;
    background: rgba(var(--v-theme-surface), 1);
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 12px;
    overflow: hidden;
}

.calendar-day-column {
    border-right: 1px solid rgba(var(--v-border-color), 0.12);
    min-height: 180px;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.calendar-day-column:last-child {
    border-right: none;
}

.day-header {
    font-size: 0.7rem;
    background: rgba(var(--v-theme-surface-variant), 0.05);
    border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}

.today-header {
    background-color: #E8F5E9 !important;
    color: #2E7D32 !important;
}

.day-dropzone {
    flex-grow: 1;
    min-height: 120px;
    transition: background-color 0.2s;
}

.day-dropzone:hover {
    background-color: rgba(76, 175, 80, 0.05);
}

.pending-column {
    border-left: 2px solid #FFAB00 !important;
}

.homework-chip {
    font-size: 0.65rem !important;
    cursor: pointer;
    transition: transform 0.2s;
}

.homework-chip:hover {
    transform: translateY(-2px);
}

.highlight-focus {
    border: 3px solid #4CAF50 !important;
    transform: scale(1.02);
    z-index: 10;
}

.homework-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.today-card {
    border: 2px solid #4CAF50 !important;
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.4) !important;
    position: relative;
}

.today-badge {
    background: linear-gradient(45deg, #FFF, #F1F8E9) !important;
    color: #2E7D32 !important;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
    border-radius: 4px !important;
}

.today-icon {
    animation: glow-pulse 1.5s infinite ease-in-out;
}

@keyframes glow-pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.2);
        opacity: 0.7;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.compact-search-field :deep(.v-field) {
    height: 32px !important;
    min-height: 32px !important;
    font-size: 0.75rem !important;
    padding: 0 8px !important;
}

.compact-search-field :deep(.v-field__input) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    min-height: 32px !important;
}

.border-dashed {
    border: 2px dashed rgba(var(--v-border-color), 0.3) !important;
}

.dropzone-area {
    min-height: 100px;
    background-color: #f1f8e9;
}

:deep(.v-theme--dark) .dropzone-area {
    background-color: #1b2e1b !important;
}
</style>