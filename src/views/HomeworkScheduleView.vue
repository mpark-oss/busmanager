<template>
    <v-container fluid class="pa-6">
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center mb-6">
                    <v-avatar size="40" class="me-3" color="primary" variant="tonal">
                        <v-icon>mdi-calendar-check</v-icon>
                    </v-avatar>
                    <div>
                        <h2 class="text-h4 font-weight-black text-primary">개인 숙제 관리</h2>
                        <div class="text-caption text-medium-emphasis font-weight-bold">
                            상위 3개 레이드 골드가 자동으로 합산됩니다. (주간 {{ getTotalGold().toLocaleString() }}G 획득 가능)
                        </div>
                    </div>
                    <v-spacer></v-spacer>
                </div>

                <v-row v-if="characters.length === 0 && !isFetching" justify="center" class="py-12">
                    <v-col cols="12" sm="8" md="6" class="text-center">
                        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-search-outline</v-icon>
                        <h3 class="text-h5 font-weight-bold mb-2">설정된 대표 캐릭터가 없습니다.</h3>
                        <p class="text-body-1 text-medium-emphasis mb-6">
                            상단바의 <strong>'+'</strong> 버튼을 눌러 대표 캐릭터를 등록하면<br>
                            해당 계정의 원정대 목록을 불러옵니다.
                        </p>
                    </v-col>
                </v-row>

                <v-row v-else>
                    <v-col v-for="char in characters" :key="char.name" cols="12" sm="6" md="4" lg="4" xl="3">
                        <v-card border variant="flat" class="rounded-xl overflow-hidden shadow-sm bg-card">
                            <v-list-item class="pa-3 bg-profile-header"
                                :subtitle="`Lv. ${char.level} ${char.className}`">
                                <template v-slot:prepend>
                                    <v-avatar size="60" border class="elevation-3 bg-grey-lighten-4">
                                        <v-img :src="char.img" cover position="top center"></v-img>
                                    </v-avatar>
                                </template>
                                <template v-slot:title>
                                    <div class="d-flex align-center">
                                        <span class="text-subtitle-1 font-weight-black">{{ char.name }}</span>
                                        <v-chip v-if="getCharSchedules(char.name).length > 0" size="x-small"
                                            color="error" variant="flat" class="ms-2 font-weight-black pulse-badge"
                                            style="cursor: pointer;" @click.stop="openScheduleModal(char.name)">
                                            일정 {{ getCharSchedules(char.name).length }}
                                        </v-chip>
                                    </div>
                                </template>
                                <template v-slot:append>
                                    <div class="text-right mr-2">
                                        <div class="text-caption font-weight-bold text-amber-darken-4">
                                            {{ getCharGold(char).toLocaleString() }} G
                                        </div>
                                    </div>
                                    <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small"
                                        @click="deleteCharacter(char.name)"></v-btn>
                                </template>
                            </v-list-item>

                            <v-divider></v-divider>

                            <v-card-text class="pa-3">
                                <div class="d-flex align-center mb-2">
                                    <v-chip size="x-small" color="orange" variant="flat"
                                        class="me-2 font-weight-bold">DAILY</v-chip>
                                    <span class="text-caption font-weight-black text-medium-emphasis">일일 숙제</span>
                                </div>

                                <div class="d-flex flex-column gap-3 mb-3">
                                    <div v-for="task in dailyTasks" :key="task.id" class="task-container">
                                        <div class="d-flex align-center justify-space-between mb-1">
                                            <v-checkbox v-model="char.completedTasks" :value="task.id"
                                                :label="task.name" hide-details density="compact" color="orange"
                                                @change="saveToLocal" class="custom-chk flex-grow-1"></v-checkbox>

                                            <div class="rest-input-wrapper">
                                                <span class="text-caption font-weight-bold grey--text mr-1">휴게</span>
                                                <input type="number" v-model.number="char.restGauges[task.id]"
                                                    class="rest-input text-caption font-weight-black"
                                                    @change="validateAndSaveRest(char)" min="0" max="200" step="10" />
                                            </div>
                                        </div>

                                        <div class="rest-gauge-bar">
                                            <div v-for="n in 10" :key="n" class="gauge-segment"
                                                :class="getSegmentClass(char, task.id, n)">
                                                <div class="gauge-fill" :style="getFillStyle(char, task.id, n)"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <v-divider class="my-3 border-opacity-25"></v-divider>

                                <div class="d-flex align-center mb-2">
                                    <v-chip size="x-small" color="cyan-darken-1" variant="flat"
                                        class="me-2 font-weight-bold text-white">SPECIAL</v-chip>
                                    <span class="text-caption font-weight-black text-medium-emphasis">주간 숙제</span>
                                </div>
                                <div class="d-flex flex-row flex-wrap mb-3" style="gap: 4px;">
                                    <v-checkbox v-for="task in specialTasks" :key="task.id"
                                        v-model="char.completedTasks" :value="task.id" :label="task.label" hide-details
                                        density="compact" color="cyan-darken-2" @change="saveToLocal"
                                        class="custom-chk-horizontal"></v-checkbox>
                                </div>

                                <v-divider class="my-3 border-opacity-25"></v-divider>

                                <div class="d-flex align-center mb-2">
                                    <v-chip size="x-small" color="primary" variant="flat"
                                        class="me-2 font-weight-bold">WEEKLY</v-chip>
                                    <span class="text-caption font-weight-black text-medium-emphasis">주간 레이드</span>
                                </div>
                                <div class="d-flex flex-column gap-1">
                                    <div v-for="raid in char.availableRaids" :key="raid.id" class="d-flex align-center">
                                        <v-checkbox v-model="char.completedTasks" :value="raid.id" hide-details
                                            :disabled="isRaidDisabled(char, raid)" density="compact" color="primary"
                                            @change="saveToLocal" class="custom-chk">
                                            <template v-slot:label>
                                                <div class="d-flex align-center w-100 py-1"
                                                    :style="isRaidDisabled(char, raid) ? 'opacity: 0.4' : ''">
                                                    <v-sheet :color="getDifficulty(raid.name).color"
                                                        class="difficulty-badge me-2" rounded="sm">
                                                        {{ getDifficulty(raid.name).text }}
                                                    </v-sheet>
                                                    <span class="text-caption font-weight-medium text-wrap flex-grow-1"
                                                        :class="{ 'text-decoration-line-through text-grey': isGoldExcluded(char, raid.id) }">
                                                        {{ stripDifficulty(raid.name) }}
                                                    </span>
                                                    <span class="text-caption font-weight-bold text-amber-darken-3 ml-2"
                                                        :class="{ 'text-decoration-line-through text-grey': isGoldExcluded(char, raid.id) }">
                                                        {{ (raid.gold / 1000).toFixed(1) }}k
                                                    </span>
                                                </div>
                                            </template>
                                        </v-checkbox>
                                    </div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-dialog v-model="scheduleDialog" max-width="450">
            <v-card class="rounded-xl pa-2">
                <v-card-title class="font-weight-black d-flex align-center">
                    <v-icon color="primary" class="me-2">mdi-calendar-multiselect</v-icon>
                    {{ activeCharName }}의 참여 일정
                </v-card-title>
                <v-card-text class="pa-4">
                    <v-list v-if="activeSchedules.length > 0">
                        <v-list-item v-for="item in activeSchedules" :key="item.id" border class="rounded-lg mb-3 pa-3">
                            <div class="d-flex justify-space-between align-center mb-1">
                                <v-chip :color="item.isBus ? 'error' : 'success'" size="x-small" label
                                    class="font-weight-black text-white">
                                    {{ item.isBus ? '버스' : '숙제' }}
                                </v-chip>
                                <span class="text-caption font-weight-bold text-primary">{{
                                    formatScheduleTime(item.dateTime)
                                    }}</span>
                            </div>
                            <div class="text-subtitle-1 font-weight-black mb-1">{{ item.raidName }}</div>
                            <div class="text-caption text-medium-emphasis">
                                <v-icon size="14" class="me-1">mdi-account-group</v-icon>
                                {{item.members.map(p => p.name).join(', ')}}
                            </div>
                        </v-list-item>
                    </v-list>
                    <div v-else class="text-center py-6 text-grey">참여 중인 일정이 없습니다.</div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="scheduleDialog = false" class="font-weight-bold">닫기</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { db } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";

const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";
const characters = ref([]);
const isFetching = ref(false);

// 일정 상태
const allSchedules = ref([]);
const scheduleDialog = ref(false);
const activeCharName = ref("");
const activeSchedules = ref([]);

const dailyTasks = [{ id: 'chaos', name: '카오스 던전' }, { id: 'guardian', name: '가디언 토벌' }];
const raidList = [
    { group: "마녀", name: "그림자: 세르카(나이트메어)", level: 1740, gold: 54000 },
    { group: "마녀", name: "그림자: 세르카(하드)", level: 1730, gold: 44000 },
    { group: "마녀", name: "그림자: 세르카(노말)", level: 1710, gold: 35000 },
    { group: "종막", name: "종막: 카제로스(하드)", level: 1730, gold: 52000 },
    { group: "종막", name: "종막: 카제로스(노말)", level: 1710, gold: 40000 },
    { group: "4막", name: "4막: 아르모체(하드)", level: 1720, gold: 42000 },
    { group: "4막", name: "4막: 아르모체(노말)", level: 1700, gold: 33000 },
    { group: "3막", name: "3막: 모르둠(하드)", level: 1700, gold: 27000 },
    { group: "3막", name: "3막: 모르둠(노말)", level: 1680, gold: 21000 },
    { group: "2막", name: "2막: 아브렐슈드(하드)", level: 1690, gold: 23000 },
    { group: "2막", name: "2막: 아브렐슈드(노말)", level: 1670, gold: 14500 },
    { group: "1막", name: "1막: 에기르(하드)", level: 1680, gold: 18000 },
    { group: "1막", name: "1막: 에기르(노말)", level: 1660, gold: 11500 }
];

const specialTasks = [
    { id: 'sky', label: '천상' },
    { id: 'hell', label: '지옥' },
    { id: 'hall', label: '할' }
];

const fetchSchedules = () => {
    const collections = [
        { name: 'schedules', isBus: true }, 
        { name: 'homeworks', isBus: false }
    ];
    
    collections.forEach(colConfig => {
        onSnapshot(collection(db, colConfig.name), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // 혹시 데이터에 isBus가 없더라도 컬렉션 이름 기준으로 강제 설정
                isBus: doc.data().isBus !== undefined ? doc.data().isBus : colConfig.isBus,
                colName: colConfig.name
            }));
            
            // 기존 리스트에서 현재 업데이트된 컬렉션 데이터만 교체
            const filteredOther = allSchedules.value.filter(s => s.colName !== colConfig.name);
            allSchedules.value = [...filteredOther, ...data];
        });
    });
};

const getCharSchedules = (charName) => {
    const now = new Date();
    return allSchedules.value.filter(raid => {
        // [핵심] members 배열 내에 이름이 있는지 확인
        const isParticipant = raid.members?.some(p => p.name === charName);
        const isFuture = raid.dateTime ? new Date(raid.dateTime) >= now : true;
        return isParticipant && isFuture;
    });
};

const openScheduleModal = (charName) => {
    activeCharName.value = charName;
    activeSchedules.value = getCharSchedules(charName);
    scheduleDialog.value = true;
};

const formatScheduleTime = (timeStr) => {
    if (!timeStr) return "시간 미정";
    const date = new Date(timeStr);
    return date.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getAccountKey = () => `hw_chars_${localStorage.getItem('current_main_name') || 'default'}`;
const getBlacklistKey = () => `hw_blacklist_${localStorage.getItem('current_main_name') || 'default'}`;

const getRestValue = (char, taskId) => char.restGauges?.[taskId] || 0;
const getSegmentClass = (char, taskId, index) => {
    const score = getRestValue(char, taskId);
    const threshold = index * 20;
    if (score >= threshold) return 'full-active';
    if (score >= threshold - 10) return 'half-active';
    return '';
};
const getFillStyle = (char, taskId, index) => {
    const score = getRestValue(char, taskId);
    const currentSegmentMax = index * 20;
    if (score >= currentSegmentMax) return { width: '100%' };
    if (score >= currentSegmentMax - 10) return { width: '50%' };
    return { width: '0%' };
};

const validateAndSaveRest = (char) => {
    dailyTasks.forEach(task => {
        let val = char.restGauges[task.id];
        if (val < 0) val = 0; if (val > 200) val = 200;
        char.restGauges[task.id] = Math.round(val / 10) * 10;
    });
    saveToLocal();
};

const updateDailyRestGauges = () => {
    const now = new Date();
    const today6AM = new Date(now);
    if (now.getHours() < 6) today6AM.setDate(today6AM.getDate() - 1);
    today6AM.setHours(6, 0, 0, 0);

    characters.value.forEach(char => {
        if (!char.restGauges) char.restGauges = { chaos: 0, guardian: 0 };
        if (!char.lastDailyUpdate) {
            char.lastDailyUpdate = today6AM.getTime();
            return;
        }
        const lastUpdate = new Date(char.lastDailyUpdate);
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysDiff = Math.floor((today6AM.getTime() - lastUpdate.getTime()) / msPerDay);

        if (daysDiff > 0) {
            dailyTasks.forEach(task => {
                const isCompleted = char.completedTasks.includes(task.id);
                let currentRest = char.restGauges[task.id] || 0;
                if (isCompleted) {
                    if (currentRest >= 40) currentRest -= 40;
                } else {
                    currentRest = Math.min(200, currentRest + 20);
                }
                if (daysDiff > 1) {
                    for (let i = 1; i < daysDiff; i++) {
                        currentRest = Math.min(200, currentRest + 20);
                    }
                }
                char.restGauges[task.id] = currentRest;
            });
            char.completedTasks = char.completedTasks.filter(id => !['chaos', 'guardian'].includes(id));
            char.lastDailyUpdate = today6AM.getTime();
        }
    });
    saveToLocal();
};

const getCharGold = (char) => {
    const checkedRaids = char.completedTasks.map(taskId => raidList.find(r => r.name === taskId)).filter(r => r !== undefined);
    return checkedRaids.sort((a, b) => b.gold - a.gold).slice(0, 3).reduce((sum, r) => sum + r.gold, 0);
};
const getTotalGold = () => characters.value.reduce((sum, char) => sum + getCharGold(char), 0);
const isGoldExcluded = (char, raidId) => {
    if (!char.completedTasks.includes(raidId)) return false;
    const targets = char.completedTasks.map(taskId => raidList.find(r => r.name === taskId)).filter(r => r !== undefined).sort((a, b) => b.gold - a.gold).slice(0, 3);
    return !targets.some(r => r.name === raidId);
};
const isRaidDisabled = (char, raid) => {
    if (char.completedTasks.includes(raid.id)) return false;
    return char.completedTasks.some(taskId => { const checkedRaid = raidList.find(r => r.name === taskId); return checkedRaid && checkedRaid.group === raid.group; });
};
const getDifficulty = (name) => {
    if (name.includes("나이트메어")) return { text: "나메", color: "purple-darken-1" };
    if (name.includes("하드")) return { text: "하드", color: "orange-darken-1" };
    return { text: "노말", color: "green-darken-1" };
};
const stripDifficulty = (name) => name.replace(/\(.*\)/, "").trim();

const saveToLocal = () => { localStorage.setItem(getAccountKey(), JSON.stringify(characters.value)); };
const deleteCharacter = (name) => {
    if (confirm(`${name} 삭제하시겠습니까?`)) {
        const blacklist = JSON.parse(localStorage.getItem(getBlacklistKey()) || '[]');
        blacklist.push(name);
        localStorage.setItem(getBlacklistKey(), JSON.stringify(blacklist));
        characters.value = characters.value.filter(c => c.name !== name);
        saveToLocal();
    }
};

const fetchMyExpedition = async (charName) => {
    if (!charName) { characters.value = []; return; }
    isFetching.value = true;
    try {
        const url = `/api/characters/${encodeURIComponent(charName)}/siblings`;
        const res = await axios.get(url, { headers: { 'authorization': `bearer ${API_KEY.trim()}` } });
        if (res.data && Array.isArray(res.data)) {
            const savedData = JSON.parse(localStorage.getItem(getAccountKey()) || '[]');
            const blacklist = JSON.parse(localStorage.getItem(getBlacklistKey()) || '[]');
            characters.value = res.data.filter(char => !blacklist.includes(char.CharacterName)).sort((a, b) => parseFloat(b.ItemAvgLevel.replace(',', '')) - parseFloat(a.ItemAvgLevel.replace(',', ''))).map(char => {
                const existing = savedData.find(c => c.name === char.CharacterName);
                const levelNum = parseFloat(char.ItemAvgLevel.replace(',', ''));
                return {
                    name: char.CharacterName, className: char.CharacterClassName, level: char.ItemAvgLevel, img: existing ? existing.img : '', completedTasks: existing ? existing.completedTasks : [],
                    restGauges: existing ? existing.restGauges : { chaos: 0, guardian: 0 }, lastDailyUpdate: existing ? existing.lastDailyUpdate : null,
                    availableRaids: raidList.filter(r => levelNum >= r.level).map(r => ({ id: r.name, name: r.name, gold: r.gold, group: r.group }))
                };
            });
            updateDailyRestGauges();
            characters.value.forEach((c, i) => { if (!c.img) updateCharImage(c.name, i); });
        }
    } catch (e) { console.error(e); } finally { isFetching.value = false; }
};

const updateCharImage = async (name, index) => {
    try {
        const url = `/api/armories/characters/${encodeURIComponent(name)}/profiles`;
        const res = await axios.get(url, { headers: { 'authorization': `bearer ${API_KEY.trim()}` } });
        if (res.data && res.data.CharacterImage) { if (characters.value[index]) { characters.value[index].img = res.data.CharacterImage; saveToLocal(); } }
    } catch (e) { }
};

onMounted(() => {
    const currentMain = localStorage.getItem('current_main_name');
    if (currentMain) fetchMyExpedition(currentMain);
    fetchSchedules();
    window.addEventListener('main-char-changed', (e) => { fetchMyExpedition(e.detail); });
});
</script>

<style scoped>
.task-container {
    background: rgba(var(--v-theme-surface-variant), 0.03);
    padding: 8px;
    border-radius: 12px;
}

.rest-gauge-bar {
    display: flex;
    gap: 2px;
    height: 12px;
    width: 100%;
    background: rgba(0, 0, 0, 0.1);
    padding: 2px;
    border-radius: 4px;
}

.gauge-segment {
    flex: 1;
    background: rgba(128, 128, 128, 0.2);
    border-radius: 1px;
    overflow: hidden;
    position: relative;
}

.gauge-fill {
    height: 100%;
    background: #9e9e9e;
    transition: width 0.3s ease, background-color 0.3s ease;
}

.full-active .gauge-fill,
.half-active .gauge-fill {
    background: linear-gradient(to bottom, #4CAF50, #2E7D32);
    box-shadow: 0 0 4px rgba(76, 175, 80, 0.5);
}

.rest-input-wrapper {
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 8px;
    border-radius: 6px;
}

.rest-input {
    width: 35px;
    border: none;
    text-align: right;
    background: transparent;
    color: #fb8c00;
    outline: none;
}

.rest-input::-webkit-inner-spin-button {
    display: none;
}

.difficulty-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 18px;
    font-size: 0.65rem !important;
    font-weight: 800;
    color: white;
}

.custom-chk :deep(.v-label) {
    font-size: 0.8rem !important;
    opacity: 1;
}

.shadow-sm {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.v-theme--light .bg-profile-header {
    background-color: #f5f5f5;
}

.v-theme--dark .bg-profile-header {
    background-color: #2c2c2c;
}

.text-wrap {
    white-space: normal !important;
    word-break: keep-all;
}

.pulse-badge {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.6;
        transform: scale(1.05);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}
</style>