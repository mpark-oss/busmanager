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
                                <v-icon color="success" class="me-2">mdi-calendar-range</v-icon> 주간 레이드 일정  드래그(오늘 기준
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
                                            <v-chip size="x-small"
                                                :color="element.difficulty === '하드' ? 'red-darken-1' : 'success'"
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

                                        <v-col v-for="hw in upcomingHomeworks" :key="hw.id" cols="12" md="6" xl="4">
                                            <v-card :id="`hw-card-${hw.id}`" border
                                                :elevation="hoveredId === hw.id || clickedId === hw.id ? 8 : 2"
                                                class="rounded-xl overflow-hidden mb-6 mx-auto homework-card transition-all"
                                                :class="{
                                                    'today-card': isToday(hw.dateTime),
                                                    'pending-card': !hw.dateTime,
                                                    'highlight-focus': hoveredId === hw.id || clickedId === hw.id
                                                }">
                                            </v-card>
                                        </v-col>
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
                                                class="mb-1 w-100 justify-start px-1 rounded-sm" label>
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
                            <v-card border elevation="2" class="rounded-xl overflow-hidden mb-6 mx-auto homework-card"
                                :class="{ 'today-card': isToday(hw.dateTime), 'pending-card': !hw.dateTime }">
                                <v-toolbar
                                    :color="(!hw.dateTime) ? 'amber-darken-2' : (isToday(hw.dateTime) ? 'success' : 'teal-darken-1')"
                                    density="compact" flat>
                                    <v-icon :icon="!hw.dateTime ? 'mdi-clock-question' : 'mdi-check-circle-outline'"
                                        class="ms-3" size="small"></v-icon>
                                    <v-toolbar-title class="font-weight-black d-flex align-center">
                                        <span class="text-subtitle-1 me-3">{{ hw.raid }}</span>
                                        <v-chip size="small"
                                            :color="hw.difficulty === '하드' ? 'red-darken-4' : 'light-green-accent-4'"
                                            class="font-weight-black text-white px-3" variant="flat" label>
                                            {{ hw.difficulty }}
                                        </v-chip>

                                        <v-chip v-if="isToday(hw.dateTime)" size="small" color="white"
                                            class="ms-2 font-weight-black today-badge" variant="flat" label>
                                            <v-icon start size="14" class="today-icon">mdi-star</v-icon>
                                            TODAY
                                        </v-chip>
                                        <v-chip v-else-if="!hw.dateTime" size="x-small" color="white" variant="outlined"
                                            class="ms-2">일정 미정</v-chip>
                                    </v-toolbar-title>
                                    <v-spacer></v-spacer>
                                    <v-btn icon="mdi-delete" size="small" variant="text"
                                        @click="deleteHomework(hw.id)"></v-btn>
                                </v-toolbar>

                                <v-card-text class="pa-6">
                                    <div class="d-flex align-center mb-4 text-h6 font-weight-bold"
                                        :class="!hw.dateTime ? 'text-amber-darken-3' : (isToday(hw.dateTime) ? 'text-success' : 'text-grey')">
                                        <v-icon class="me-2" size="small">mdi-clock-outline</v-icon>
                                        {{ formatDateTime(hw.dateTime) }}
                                    </div>
                                    <v-divider class="mb-4"></v-divider>

                                    <v-alert v-if="hw.members.length > 0" variant="tonal"
                                        :color="isToday(hw.dateTime) ? 'success' : (!hw.dateTime ? 'amber' : 'teal')"
                                        class="mb-4 rounded-lg py-2" density="compact">
                                        <div class="d-flex justify-space-between align-center">
                                            <div class="text-subtitle-2 font-weight-bold"><v-icon size="small"
                                                    class="me-1">mdi-sword</v-icon> 파티 화력</div>
                                            <div class="text-h6 font-weight-black">{{ calculateAveragePower(hw.members)
                                                }}</div>
                                        </div>
                                    </v-alert>

                                    <div
                                        class="text-subtitle-2 mb-2 font-weight-bold d-flex align-center text-grey-darken-1">
                                        <v-icon size="small" class="me-1">mdi-account-group</v-icon> 숙제 멤버
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

onMounted(() => {
    const qChar = query(collection(db, "characters"), orderBy("createdAt", "desc"));
    onSnapshot(qChar, (snapshot) => {
        charList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });

    const qHw = query(collection(db, "homeworks"), orderBy("dateTime", "asc"));
    onSnapshot(qHw, (snapshot) => {
        homeworks.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
});

/* --- 달력 관련 로직 --- */
const daysOfWeek = computed(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push({
            fullDate: d.toISOString().split('T')[0],
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
        const currentTime = hw.dateTime && hw.dateTime.includes('T') ? hw.dateTime.split('T')[1] : "00:00";
        await updateDoc(hwRef, {
            dateTime: targetDate ? `${targetDate}T${currentTime}` : ""
        });
    }
};
/* -------------------- */

const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
};

// [추가] 상태 관리 변수
const hoveredId = ref(null);   // 마우스 오버 시 하이라이트용
const clickedId = ref(null);   // 클릭 시 정렬 우선순위용

// [수정] 상세 리스트 정렬 로직 (클릭된 아이템을 최상단으로)
const upcomingHomeworks = computed(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    let list = homeworks.value.filter(hw => {
        if (!hw.dateTime) return true;
        return new Date(hw.dateTime) >= todayStart;
    });

    // 클릭된 아이템이 있다면 가장 앞으로, 나머지는 시간순
    return [...list].sort((a, b) => {
        if (a.id === clickedId.value) return -1;
        if (b.id === clickedId.value) return 1;
        return new Date(a.dateTime || 0) - new Date(b.dateTime || 0);
    });
});

// [추가] 클릭 핸들러
const scrollToDetail = (id) => {
    clickedId.value = id;
    // 부드럽게 시각적 피드백을 주기 위해 잠시 후 강조 해제하거나 유지
    setTimeout(() => {
        const element = document.getElementById(`hw-card-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 50);
};

const sortedCharList = computed(() => {
    if (!searchQuery.value) return charList.value;
    const q = searchQuery.value.toLowerCase();
    const matched = charList.value.filter(c => c.name.toLowerCase().includes(q) || c.job.toLowerCase().includes(q));
    const unmatched = charList.value.filter(c => !c.name.toLowerCase().includes(q) && !c.job.toLowerCase().includes(q));
    return [...matched, ...unmatched];
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
    try {
        const hwRef = doc(db, "homeworks", hw.id);
        await updateDoc(hwRef, { members: JSON.parse(JSON.stringify(hw.members)) });
    } catch (e) { console.error("업데이트 실패", e); }
};

const removeMember = (hw, index) => {
    hw.members.splice(index, 1);
    updateHomework(hw);
};

const cloneCharacter = (char) => ({ ...char, id: Date.now() + Math.random() });

const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "일정 미정";
    const date = new Date(dateTimeStr);
    return isNaN(date.getTime()) ? "일정 미정" : date.toLocaleString('ko-KR', {
        month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit'
    });
};

const deleteHomework = async (id) => {
    if (confirm("삭제하시겠습니까?")) {
        try { await deleteDoc(doc(db, "homeworks", id)); }
        catch (e) { alert("삭제 실패"); }
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
    /* flex 자식의 truncate를 위해 설정 */
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

.pending-card {
    border: 2px solid #FFAB00 !important;
}

.cursor-move {
    cursor: move;
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