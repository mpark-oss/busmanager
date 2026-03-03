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
                            상위 3개 레이드 골드가 자동으로 합산됩니다. (현재 {{ getTotalGold().toLocaleString() }}G 획득)
                        </div>
                    </div>
                    <v-spacer></v-spacer>
                </div>

                <v-row v-if="characters.length === 0 && !isFetching" justify="center" class="py-12">
                    <v-col cols="12" sm="8" md="6" class="text-center">
                        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-search-outline</v-icon>
                        <h3 class="text-h5 font-weight-bold mb-2">설정된 대표 캐릭터가 없습니다.</h3>
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
                                    <div class="text-right mr-1">
                                        <div class="text-caption font-weight-bold text-amber-darken-4">
                                            {{ getCharGold(char).toLocaleString() }} G
                                        </div>
                                    </div>
                                    <v-btn icon="mdi-cog-outline" variant="text" color="grey-darken-1" size="small"
                                        @click="openCharSettings(char)"></v-btn>
                                    <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small"
                                        @click="deleteCharacter(char.name)"></v-btn>
                                </template>
                            </v-list-item>

                            <v-divider></v-divider>

                            <v-card-text class="pa-3">
                                <div v-if="hasVisibleDaily(char)">
                                    <div class="d-flex align-center mb-2">
                                        <v-chip size="x-small" color="orange" variant="flat"
                                            class="me-2 font-weight-bold">DAILY</v-chip>
                                        <span class="text-caption font-weight-black text-medium-emphasis">일일 숙제</span>
                                    </div>
                                    <div class="d-flex flex-column gap-3 mb-3">
                                        <template v-for="task in dailyTasks" :key="task.id">
                                            <div v-if="isTaskVisible(char, task.id)" class="task-container">
                                                <div class="d-flex align-center justify-space-between mb-1">
                                                    <v-checkbox v-model="char.completedTasks" :value="task.id"
                                                        :label="task.name" hide-details density="compact" color="orange"
                                                        @change="saveToLocal"
                                                        class="custom-chk flex-grow-1"></v-checkbox>
                                                    <div class="rest-input-wrapper">
                                                        <span
                                                            class="text-caption font-weight-bold grey--text mr-1">휴게</span>
                                                        <input type="number" v-model.number="char.restGauges[task.id]"
                                                            class="rest-input text-caption font-weight-black"
                                                            @change="validateAndSaveRest(char)" min="0" max="200"
                                                            step="10" />
                                                    </div>
                                                </div>
                                                <div class="rest-gauge-bar">
                                                    <div v-for="n in 10" :key="n" class="gauge-segment"
                                                        :class="getSegmentClass(char, task.id, n)">
                                                        <div class="gauge-fill" :style="getFillStyle(char, task.id, n)">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                    <v-divider class="my-3 border-opacity-25"></v-divider>
                                </div>

                                <div v-if="hasVisibleSpecial(char)">
                                    <div class="d-flex align-center mb-2">
                                        <v-chip size="x-small" color="cyan-darken-1" variant="flat"
                                            class="me-2 font-weight-bold text-white">SPECIAL</v-chip>
                                        <span class="text-caption font-weight-black text-medium-emphasis">주간 숙제</span>
                                    </div>
                                    <div class="d-flex flex-row flex-wrap mb-3" style="gap: 4px;">
                                        <template v-for="task in specialTasks" :key="task.id">
                                            <v-checkbox v-if="isTaskVisible(char, task.id)"
                                                v-model="char.completedTasks" :value="task.id" :label="task.label"
                                                hide-details density="compact" color="cyan-darken-2"
                                                @change="saveToLocal" class="custom-chk-horizontal"></v-checkbox>
                                        </template>
                                    </div>
                                    <v-divider class="my-3 border-opacity-25"></v-divider>
                                </div>
                                <template v-if="char.settings?.showWeekly">
                                    <div class="d-flex align-center mb-2">
                                        <v-chip size="x-small" color="primary" variant="flat"
                                            class="me-2 font-weight-bold">WEEKLY</v-chip>
                                        <span class="text-caption font-weight-black text-medium-emphasis">주간 레이드</span>
                                        <v-chip size="x-small"
                                            :color="getGoldRaidCount(char) >= 3 ? 'success' : 'grey-darken-1'"
                                            variant="tonal" class="ms-2 font-weight-black">
                                            {{ getGoldRaidCount(char) }} / 3
                                        </v-chip>
                                    </div>

                                    <div class="d-flex flex-column gap-2">
                                        <div v-for="groupName in (char.settings?.visibleGroups || [])" :key="groupName"
                                            class="raid-group-container border rounded-lg pa-1">
                                            <div class="d-flex align-center px-2 mb-1">
                                                <span class="text-caption font-weight-black text-primary flex-grow-1"
                                                    :style="isGoldExcluded(char, groupName) ? 'text-decoration: line-through; opacity: 0.5' : ''">
                                                    {{ groupName }}
                                                </span>
                                            </div>
                                            <div class="d-flex flex-wrap px-1">
                                                <template v-for="raid in getRaidsByGroup(groupName)" :key="raid.name">
                                                    <v-checkbox v-for="gate in raid.gates" :key="gate.g"
                                                        v-show="(char.settings?.selectedGateIds || []).includes(raid.name + '_G' + gate.g)"
                                                        v-model="char.completedTasks" :value="raid.name + '_G' + gate.g"
                                                        :disabled="isGateDisabled(char, raid, gate)"
                                                        @change="toggleGate(char, raid, gate)" hide-details
                                                        density="compact" color="primary" class="gate-chk">
                                                        <template v-slot:label>
                                                            <div class="d-flex align-center">
                                                                <v-chip size="x-small"
                                                                    :color="getDifficulty(raid.name).color" label
                                                                    class="me-1 text-white font-weight-black px-1"
                                                                    style="min-width: 24px; justify-content: center; height: 16px;">
                                                                    {{ getDifficulty(raid.name).text[0] }}
                                                                </v-chip>
                                                                <span class="text-overline font-weight-black">
                                                                    {{ gate.g }} 관문
                                                                    <span class="ms-1"
                                                                        style="font-size: 0.6rem; opacity: 0.7">
                                                                        ({{ (gate.gold / 1000).toFixed(1) }}k)
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </template>
                                                    </v-checkbox>
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-dialog v-model="charSettingsDialog" max-width="500" scrollable persistent>
            <v-card class="rounded-xl" v-if="targetChar">
                <v-card-title class="pa-4 font-weight-black d-flex align-center">
                    <v-icon class="me-2">mdi-cog</v-icon> {{ targetChar.name }} 카드 설정
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-4" style="height: 600px;">
                    <div class="text-subtitle-2 font-weight-bold mb-3 text-grey-darken-3">숙제 표시 여부</div>
                    <div class="bg-grey-lighten-4 rounded-lg pa-3 mb-4">
                        <div class="text-caption font-weight-bold mb-2">일일 숙제</div>
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <v-btn v-for="task in dailyTasks" :key="task.id" variant="flat" size="x-small"
                                :color="isTaskVisibleInSettings(task.id) ? 'orange' : 'grey-darken-2'"
                                class="text-white px-3" @click="toggleTaskVisibility(task.id)">
                                <v-icon start size="14">{{ isTaskVisibleInSettings(task.id) ? 'mdi-eye' : 'mdi-eye-off'
                                    }}</v-icon>
                                {{ task.name }}
                            </v-btn>
                        </div>
                        <v-divider class="mb-3"></v-divider>
                        <div class="text-caption font-weight-bold mb-2">주간 숙제</div>
                        <div class="d-flex flex-wrap gap-2">
                            <v-btn v-for="task in specialTasks" :key="task.id" variant="flat" size="x-small"
                                :color="isTaskVisibleInSettings(task.id) ? 'cyan-darken-2' : 'grey-darken-2'"
                                class="text-white px-3" @click="toggleTaskVisibility(task.id)">
                                <v-icon start size="14">{{ isTaskVisibleInSettings(task.id) ? 'mdi-eye' : 'mdi-eye-off'
                                    }}</v-icon>
                                {{ task.label }}
                            </v-btn>
                        </div>
                    </div>

                    <v-divider class="mb-4"></v-divider>
                    <div class="text-subtitle-2 font-weight-bold mb-1 text-grey-darken-3">레이드 설정 (드래그 순서 변경)</div>
                    <v-list density="compact" class="pa-0">
                        <draggable v-model="tempSettings.allGroups" handle=".drag-handle" item-key="toString">
                            <template #item="{ element: group }">
                                <div class="border rounded-lg mb-2 overflow-hidden bg-white shadow-sm">
                                    <v-list-item class="bg-grey-lighten-4 py-1">
                                        <template v-slot:prepend>
                                            <v-icon class="drag-handle me-2 cursor-move"
                                                color="grey-darken-2">mdi-drag-vertical</v-icon>
                                            <v-btn icon size="small" variant="flat" class="eye-btn shadow-sm"
                                                :color="tempSettings.visibleGroups.includes(group) ? 'primary' : 'grey-darken-3'"
                                                @click.stop="toggleGroupSelection(group)">
                                                <v-icon size="18">{{ tempSettings.visibleGroups.includes(group) ?
                                                    'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-list-item-title class="font-weight-black ms-2 cursor-pointer"
                                            @click="toggleExpand(group)">{{
                                                group }}</v-list-item-title>
                                        <template v-slot:append>
                                            <v-icon @click="toggleExpand(group)">{{ expandedGroup === group ?
                                                'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                                        </template>
                                    </v-list-item>
                                    <v-expand-transition>
                                        <div v-show="expandedGroup === group" class="pa-3 bg-white border-t">
                                            <div v-for="raid in getRaidsByGroup(group)" :key="raid.name"
                                                class="mb-4 last-mb-0">
                                                <div class="d-flex align-center mb-2">
                                                    <v-chip size="x-small" :color="getDifficulty(raid.name).color" label
                                                        class="me-2 text-white font-weight-black">{{
                                                            getDifficulty(raid.name).text
                                                        }}</v-chip>
                                                </div>
                                                <div class="d-flex flex-wrap gap-2">
                                                    <v-btn v-for="gate in raid.gates" :key="gate.g" variant="flat"
                                                        size="x-small" class="font-weight-black px-3 eye-gate-btn"
                                                        :color="(tempSettings.selectedGateIds || []).includes(raid.name + '_G' + gate.g) ? 'primary' : 'grey-darken-2'"
                                                        @click="toggleGateVisibility(raid.name, gate.g)">
                                                        <v-icon start size="14">{{ (tempSettings.selectedGateIds ||
                                                            []).includes(raid.name + '_G' + gate.g) ? 'mdi-eye' :
                                                            'mdi-eye-off'
                                                        }}</v-icon>
                                                        {{ gate.g }}관 ({{ (gate.gold / 1000).toFixed(1) }}k)
                                                    </v-btn>
                                                </div>
                                            </div>
                                        </div>
                                    </v-expand-transition>
                                </div>
                            </template>
                        </draggable>
                    </v-list>
                </v-card-text>
                <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="charSettingsDialog = false">취소</v-btn>
                    <v-btn color="primary" variant="flat" rounded="lg" class="px-6"
                        @click="saveCharSettings">저장하기</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="scheduleDialog" max-width="450">
            <v-card class="rounded-xl pa-2">
                <v-card-title class="font-weight-black d-flex align-center">
                    <v-icon color="primary" class="me-2">mdi-calendar-multiselect</v-icon>{{ activeCharName }}의 참여 일정
                </v-card-title>
                <v-card-text class="pa-4">
                    <v-list v-if="activeSchedules.length > 0">
                        <v-list-item v-for="item in activeSchedules" :key="item.id" border class="rounded-lg mb-3 pa-3">
                            <div class="d-flex justify-space-between align-center mb-2">
                                <v-chip :color="item.isHomework ? 'success' : 'error'" size="x-small" label
                                    class="font-weight-black text-white">
                                    {{ item.isHomework ? '숙제' : '버스' }}
                                </v-chip>
                                <span class="text-caption font-weight-bold text-primary">{{
                                    formatScheduleTime(item.dateTime)
                                }}</span>
                            </div>

                            <div class="d-flex align-center mb-2">
                                <v-chip size="x-small" :color="getDifficulty(item.difficulty).color" label
                                    class="me-2 text-white font-weight-black">
                                    {{ getDifficulty(item.difficulty).text }}
                                </v-chip>
                                <span class="text-subtitle-1 font-weight-black">{{ item.raid }}</span>
                            </div>

                            <div class="text-caption text-medium-emphasis d-flex align-center">
                                <v-icon size="16" class="me-1">mdi-account-group-outline</v-icon>
                                <span class="font-weight-bold">멤버: {{(item.members || []).map(p => p.name).join(', ')
                                }}</span>
                            </div>
                        </v-list-item>
                    </v-list>
                    <div v-else class="text-center py-6 text-grey">참여 중인 일정이 없습니다.</div>
                </v-card-text>
                <v-card-actions><v-spacer></v-spacer><v-btn variant="text" @click="scheduleDialog = false"
                        class="font-weight-bold">닫기</v-btn></v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import draggable from 'vuedraggable';
import { db } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";

const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";
const characters = ref([]);
const isFetching = ref(false);

const charSettingsDialog = ref(false);
const targetChar = ref(null);
const expandedGroup = ref(null);
const tempSettings = ref({ showDaily: true, showSpecial: true, showWeekly: true, visibleGroups: [], selectedGateIds: [], allGroups: [], hiddenTaskIds: [] });

const allSchedules = ref([]);
const scheduleDialog = ref(false);
const activeCharName = ref("");
const activeSchedules = ref([]);

const dailyTasks = [{ id: 'chaos', name: '카오스 던전' }, { id: 'guardian', name: '가디언 토벌' }];
const specialTasks = [{ id: 'sky', label: '천상' }, { id: 'hell', label: '지옥' }, { id: 'hall', label: '할' }];

const raidList = [
    { group: "세르카", name: "그림자: 세르카(나이트메어)", level: 1740, gold: 54000, gates: [{ g: 1, gold: 21000 }, { g: 2, gold: 33000 }] },
    { group: "세르카", name: "그림자: 세르카(하드)", level: 1730, gold: 44000, gates: [{ g: 1, gold: 17500 }, { g: 2, gold: 26500 }] },
    { group: "세르카", name: "그림자: 세르카(노말)", level: 1710, gold: 35000, gates: [{ g: 1, gold: 14000 }, { g: 2, gold: 21000 }] },
    { group: "종막", name: "종막: 카제로스(하드)", level: 1730, gold: 52000, gates: [{ g: 1, gold: 17000 }, { g: 2, gold: 35000 }] },
    { group: "종막", name: "종막: 카제로스(노말)", level: 1710, gold: 40000, gates: [{ g: 1, gold: 14000 }, { g: 2, gold: 26000 }] },
    { group: "4막", name: "4막: 아르모체(하드)", level: 1720, gold: 42000, gates: [{ g: 1, gold: 15000 }, { g: 2, gold: 27000 }] },
    { group: "4막", name: "4막: 아르모체(노말)", level: 1700, gold: 33000, gates: [{ g: 1, gold: 12500 }, { g: 2, gold: 20500 }] },
    { group: "3막", name: "3막: 모르둠(하드)", level: 1700, gold: 27000, gates: [{ g: 1, gold: 5000 }, { g: 2, gold: 8000 }, { g: 3, gold: 14000 }] },
    { group: "3막", name: "3막: 모르둠(노말)", level: 1680, gold: 21000, gates: [{ g: 1, gold: 4000 }, { g: 2, gold: 7000 }, { g: 3, gold: 10000 }] },
    { group: "2막", name: "2막: 아브렐슈드(하드)", level: 1690, gold: 23000, gates: [{ g: 1, gold: 7500 }, { g: 2, gold: 15500 }] },
    { group: "2막", name: "2막: 아브렐슈드(노말)", level: 1670, gold: 16500, gates: [{ g: 1, gold: 5500 }, { g: 2, gold: 11000 }] },
    { group: "1막", name: "1막: 에기르(하드)", level: 1680, gold: 18000, gates: [{ g: 1, gold: 5500 }, { g: 2, gold: 12500 }] },
    { group: "1막", name: "1막: 에기르(노말)", level: 1660, gold: 11500, gates: [{ g: 1, gold: 3500 }, { g: 2, gold: 8000 }] }
];

const raidGroups = computed(() => [...new Set(raidList.map(r => r.group))]);
const getRaidsByGroup = (groupName) => raidList.filter(r => r.group === groupName);

// --- 안전한 가시성 제어 ---
const isTaskVisible = (char, taskId) => {
    return !char.settings?.hiddenTaskIds?.includes(taskId);
};
const isTaskVisibleInSettings = (taskId) => {
    return !tempSettings.value.hiddenTaskIds?.includes(taskId);
};
const toggleTaskVisibility = (taskId) => {
    if (!tempSettings.value.hiddenTaskIds) tempSettings.value.hiddenTaskIds = [];
    const idx = tempSettings.value.hiddenTaskIds.indexOf(taskId);
    if (idx > -1) tempSettings.value.hiddenTaskIds.splice(idx, 1);
    else tempSettings.value.hiddenTaskIds.push(taskId);
};
const hasVisibleDaily = (char) => dailyTasks.some(t => isTaskVisible(char, t.id));
const hasVisibleSpecial = (char) => specialTasks.some(t => isTaskVisible(char, t.id));

// --- 레이드 비활성화 및 토글 (복구) ---
const isGateDisabled = (char, raid, gate) => {
    if (!char.completedTasks) return false;
    const currentId = raid.name + '_G' + gate.g;
    if (char.completedTasks.includes(currentId)) return false;
    return raidList.some(otherRaid =>
        otherRaid.group === raid.group &&
        otherRaid.name !== raid.name &&
        char.completedTasks.includes(otherRaid.name + '_G' + gate.g)
    );
};
const toggleGate = (char, raid, gate) => {
    const taskId = raid.name + '_G' + gate.g;
    if (char.completedTasks.includes(taskId)) {
        raidList.filter(r => r.group === raid.group && r.name !== raid.name).forEach(otherRaid => {
            const otherGateId = otherRaid.name + '_G' + gate.g;
            char.completedTasks = char.completedTasks.filter(id => id !== otherGateId);
        });
    }
    saveToLocal();
};

const getCharGold = (char) => {
    const visibleGroups = char.settings?.visibleGroups || [];
    let raidGoldList = [];
    visibleGroups.forEach(groupName => {
        let goldSum = 0;
        getRaidsByGroup(groupName).forEach(raid => {
            (raid.gates || []).forEach(gate => {
                if ((char.completedTasks || []).includes(raid.name + '_G' + gate.g)) goldSum += gate.gold;
            });
        });
        if (goldSum > 0) raidGoldList.push({ name: groupName, gold: goldSum });
    });
    return raidGoldList.sort((a, b) => b.gold - a.gold).slice(0, 3).reduce((sum, r) => sum + r.gold, 0);
};

const isGoldExcluded = (char, groupName) => {
    let raidGoldList = [];
    (char.settings?.visibleGroups || []).forEach(gName => {
        let goldSum = 0;
        getRaidsByGroup(gName).forEach(r => {
            r.gates.forEach(gate => { if ((char.completedTasks || []).includes(r.name + '_G' + gate.g)) goldSum += gate.gold; });
        });
        if (goldSum > 0) raidGoldList.push({ name: gName, gold: goldSum });
    });
    const targets = raidGoldList.sort((a, b) => b.gold - a.gold).slice(0, 3);
    return !targets.some(r => r.name === groupName);
};

const getDifficulty = (difficultyText) => {
    // 만약 전달받은 값이 없으면 안전하게 '노말' 처리
    const diff = difficultyText || "노말";

    if (diff.includes("나이트메어")) return { text: "나메", color: "purple-darken-1" };
    if (diff.includes("하드")) return { text: "하드", color: "orange-darken-1" };
    if (diff.includes("The First")) return { text: "퍼스트", color: "red-darken-4" };

    // 그 외는 모두 노말(초록색)
    return { text: "노말", color: "green-darken-1" };
};

const stripDifficulty = (name) => name.replace(/\(.*\)/, "").trim();
const getSegmentClass = (char, taskId, index) => { const score = char.restGauges?.[taskId] || 0; return score >= index * 20 ? 'full-active' : score >= index * 20 - 10 ? 'half-active' : ''; };
const getFillStyle = (char, taskId, index) => { const score = char.restGauges?.[taskId] || 0; return { width: score >= index * 20 ? '100%' : score >= index * 20 - 10 ? '50%' : '0%' }; };
const validateAndSaveRest = (char) => { dailyTasks.forEach(task => { let v = char.restGauges[task.id]; char.restGauges[task.id] = Math.max(0, Math.min(200, Math.round(v / 10) * 10)); }); saveToLocal(); };

// --- 설정 제어 ---
const getEyeIcon = (group) => tempSettings.value.visibleGroups.includes(group) ? 'mdi-eye' : 'mdi-eye-off';
const getEyeColor = (group) => tempSettings.value.visibleGroups.includes(group) ? 'primary' : 'grey-darken-3';
const toggleExpand = (group) => { expandedGroup.value = expandedGroup.value === group ? null : group; };
const toggleGroupSelection = (group) => {
    const idx = tempSettings.value.visibleGroups.indexOf(group);
    if (idx > -1) tempSettings.value.visibleGroups.splice(idx, 1);
    else tempSettings.value.visibleGroups.push(group);
};
const toggleGateVisibility = (raidName, gateNum) => {
    const id = raidName + '_G' + gateNum;
    if (!tempSettings.value.selectedGateIds) tempSettings.value.selectedGateIds = [];

    const idx = tempSettings.value.selectedGateIds.indexOf(id);

    if (idx > -1) {
        // 1. 관문을 끌 때
        tempSettings.value.selectedGateIds.splice(idx, 1);
    } else {
        // 2. 관문을 켤 때
        tempSettings.value.selectedGateIds.push(id);

        // [추가된 로직] 해당 레이드가 속한 그룹(Group)을 찾아서 자동으로 visibleGroups에 추가
        const parentRaid = raidList.find(r => r.name === raidName);
        if (parentRaid) {
            const groupName = parentRaid.group;
            if (!tempSettings.value.visibleGroups.includes(groupName)) {
                tempSettings.value.visibleGroups.push(groupName);
            }
        }
    }
};

const openCharSettings = (char) => {
    targetChar.value = char;
    const defaultOrder = raidGroups.value;
    if (!char.settings) char.settings = { visibleGroups: [], selectedGateIds: [], groupOrder: defaultOrder, hiddenTaskIds: [], showWeekly: true };
    tempSettings.value = JSON.parse(JSON.stringify(char.settings));
    if (!tempSettings.value.hiddenTaskIds) tempSettings.value.hiddenTaskIds = [];
    if (!tempSettings.value.selectedGateIds) tempSettings.value.selectedGateIds = [];
    if (!tempSettings.value.visibleGroups) tempSettings.value.visibleGroups = [];
    tempSettings.value.allGroups = tempSettings.value.groupOrder || defaultOrder;
    charSettingsDialog.value = true;
};

const saveCharSettings = () => {
    if (targetChar.value) {
        tempSettings.value.groupOrder = tempSettings.value.allGroups;
        targetChar.value.settings = JSON.parse(JSON.stringify(tempSettings.value));
        saveToLocal();
        charSettingsDialog.value = false;
    }
};

// --- 원본 로직 (휴게/ Siblings/일정) 완전 복구 ---
const getAccountKey = () => `hw_chars_${localStorage.getItem('current_main_name') || 'default'}`;
const getBlacklistKey = () => `hw_blacklist_${localStorage.getItem('current_main_name') || 'default'}`;
const saveToLocal = () => { localStorage.setItem(getAccountKey(), JSON.stringify(characters.value)); };
const getTotalGold = () => characters.value.reduce((sum, char) => sum + getCharGold(char), 0);

const deleteCharacter = (name) => {
    if (confirm(`${name} 삭제?`)) {
        const bl = JSON.parse(localStorage.getItem(getBlacklistKey()) || '[]');
        if (!bl.includes(name)) bl.push(name);
        localStorage.setItem(getBlacklistKey(), JSON.stringify(bl));
        characters.value = characters.value.filter(c => c.name !== name);
        saveToLocal();
    }
};

const updateDailyRestGauges = () => {
    const now = new Date();
    const today6AM = new Date(now);
    if (now.getHours() < 6) today6AM.setDate(today6AM.getDate() - 1);
    today6AM.setHours(6, 0, 0, 0);

    characters.value.forEach(char => {
        if (!char.restGauges) char.restGauges = { chaos: 0, guardian: 0 };
        if (!char.lastDailyUpdate) { char.lastDailyUpdate = today6AM.getTime(); return; }

        const daysDiff = Math.floor((today6AM.getTime() - new Date(char.lastDailyUpdate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 0) {
            dailyTasks.forEach(task => {
                let currentRest = char.restGauges[task.id] || 0;
                // 체크 여부에 따른 휴게 계산 (수요일 초기화 시에도 이 로직은 안전함)
                if ((char.completedTasks || []).includes(task.id)) { 
                    if (currentRest >= 40) currentRest -= 40; 
                } else { 
                    currentRest = Math.min(200, currentRest + 20); 
                }
                
                // 1일 이상 미접속 시 추가 휴게 부여
                if (daysDiff > 1) {
                    for (let i = 1; i < daysDiff; i++) currentRest = Math.min(200, currentRest + 20);
                }
                char.restGauges[task.id] = currentRest;
            });

            // [중요] 일일 숙제만 초기화 (주간 레이드는 App.vue의 수요일 로직이 담당)
            char.completedTasks = (char.completedTasks || []).filter(id => !['chaos', 'guardian'].includes(id));
            char.lastDailyUpdate = today6AM.getTime();
        }
    });
    saveToLocal();
};

const fetchMyExpedition = async (charName) => {
    if (!charName) return;
    isFetching.value = true;
    try {
        const res = await axios.get(`/api/characters/${encodeURIComponent(charName)}/siblings`, { headers: { 'authorization': `bearer ${API_KEY.trim()}` } });
        if (res.data && Array.isArray(res.data)) {
            const blacklist = JSON.parse(localStorage.getItem(getBlacklistKey()) || '[]');
            const savedData = JSON.parse(localStorage.getItem(getAccountKey()) || '[]');
            
            characters.value = res.data
                .filter(char => !blacklist.includes(char.CharacterName))
                .sort((a, b) => parseFloat(b.ItemAvgLevel.replace(',', '')) - parseFloat(a.ItemAvgLevel.replace(',', '')))
                .map(char => {
                    const existing = savedData.find(c => c.name === char.CharacterName);
                    return {
                        name: char.CharacterName, 
                        className: char.CharacterClassName, 
                        level: char.ItemAvgLevel, 
                        img: existing?.img || '',
                        completedTasks: existing?.completedTasks || [], 
                        restGauges: existing?.restGauges || { chaos: 0, guardian: 0 },
                        lastDailyUpdate: existing?.lastDailyUpdate || null,
                        // [UI 유지 핵심] 기존 설정이 있으면 그대로 가져오고, 없으면 기본값 부여
                        settings: existing?.settings || { 
                            visibleGroups: [], 
                            selectedGateIds: [], 
                            groupOrder: raidGroups.value, 
                            hiddenTaskIds: [], 
                            showWeekly: true 
                        }
                    };
                });
            updateDailyRestGauges();
            characters.value.forEach((c, i) => { if (!c.img) updateCharImage(c.name, i); });
        }
    } catch (e) { console.error(e); } finally { isFetching.value = false; }
};

const updateCharImage = async (name, index) => {
    try {
        const res = await axios.get(`/api/armories/characters/${encodeURIComponent(name)}/profiles`, { headers: { 'authorization': `bearer ${API_KEY.trim()}` } });
        if (res.data?.CharacterImage && characters.value[index]) { characters.value[index].img = res.data.CharacterImage; saveToLocal(); }
    } catch (e) { }
};

const fetchSchedules = () => {
    // 저장 페이지에서 사용한 컬렉션 이름과 매칭
    const collections = [
        { name: 'schedules', defaultHomework: false },
        { name: 'homeworks', defaultHomework: true }
    ];

    collections.forEach(conf => {
        onSnapshot(collection(db, conf.name), (snap) => {
            const data = snap.docs.map(doc => {
                const d = doc.data();
                return {
                    id: doc.id,
                    ...d,
                    // 저장된 isHomework가 없으면 컬렉션 성격에 따라 기본값 부여
                    isHomework: d.isHomework !== undefined ? d.isHomework : conf.defaultHomework,
                    colName: conf.name
                };
            });
            // 리스트 업데이트
            allSchedules.value = [...allSchedules.value.filter(s => s.colName !== conf.name), ...data];
        });
    });
};
const getCharSchedules = (name) => allSchedules.value.filter(r => (r.members || []).some(m => m.name === name) && (!r.dateTime || new Date(r.dateTime) >= new Date()));
const openScheduleModal = (name) => { activeCharName.value = name; activeSchedules.value = getCharSchedules(name); scheduleDialog.value = true; };
const formatScheduleTime = (t) => t ? new Date(t).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "시간 미정";

onMounted(() => {
    const main = localStorage.getItem('current_main_name');
    if (main) fetchMyExpedition(main);
    fetchSchedules();
    window.addEventListener('main-char-changed', (e) => fetchMyExpedition(e.detail));
});

// --- script setup 내부에 추가 ---

const getGoldRaidCount = (char) => {
    const visibleGroups = char.settings?.visibleGroups || [];
    let activeRaidGroups = 0;

    // 골드가 발생하는 그룹들만 필터링
    const raidGoldList = [];
    visibleGroups.forEach(groupName => {
        let goldSum = 0;
        getRaidsByGroup(groupName).forEach(raid => {
            (raid.gates || []).forEach(gate => {
                if ((char.completedTasks || []).includes(raid.name + '_G' + gate.g)) goldSum += gate.gold;
            });
        });
        if (goldSum > 0) raidGoldList.push({ name: groupName, gold: goldSum });
    });

    // 골드 합산 우선순위(상위 3개) 안에 드는 레이드 수 반환
    return raidGoldList.sort((a, b) => b.gold - a.gold).slice(0, 3).length;
};
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
    width: 45px;
    border: none;
    text-align: right;
    background: transparent;
    color: #fb8c00;
    outline: none;
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

.pulse-badge {
    animation: pulse 2s infinite;
    cursor: pointer;
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

.raid-group-container {
    background: rgba(var(--v-theme-primary), 0.02);
    margin-bottom: 4px;
}

.gate-chk {
    margin-top: -4px;
    margin-right: 4px;
}

.gate-chk :deep(.v-label) {
    padding-inline-start: 2px !important;
}

.eye-btn {
    min-width: 32px !important;
    width: 32px !important;
    height: 32px !important;
    border-radius: 8px !important;
}

.eye-gate-btn {
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.drag-handle {
    cursor: move !important;
    padding: 4px;
}

.cursor-pointer {
    cursor: pointer !important;
}

.last-mb-0:last-child {
    margin-bottom: 0 !important;
}

.border-b {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.border-t {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}
</style>