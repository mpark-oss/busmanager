<template>
    <v-container fluid class="pa-6">
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center mb-6">
                    <v-avatar size="40" class="me-3" color="primary" variant="tonal">
                        <v-icon>mdi-calendar-check</v-icon>
                    </v-avatar>
                    <div>
                        <h2 class="text-h4 font-weight-black text-primary">숙제 스케줄러</h2>
                        <div class="text-caption text-medium-emphasis font-weight-bold">
                            상위 3개 레이드 골드가 자동으로 합산됩니다. (주간 {{ getTotalGold().toLocaleString() }}G 획득 가능)
                        </div>
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" prepend-icon="mdi-plus" class="rounded-lg"
                        @click="addCharacterDialog = true">
                        캐릭터 추가
                    </v-btn>
                </div>

                <v-row>
                    <v-col v-for="char in characters" :key="char.name" cols="12" sm="6" md="4" lg="4" xl="3">
                        <v-card border variant="flat" class="rounded-xl overflow-hidden shadow-sm bg-card">
                            <v-list-item class="pa-3 bg-profile-header"
                                :subtitle="`Lv. ${char.level} ${char.className}`">
                                <template v-slot:prepend>
                                    <v-avatar size="60" border class="elevation-3 bg-grey-lighten-4">
                                        <v-img :src="char.img" cover position="top center">
                                            <template v-slot:placeholder>
                                                <v-row class="fill-height ma-0" align="center" justify="center">
                                                    <v-progress-circular indeterminate color="grey-lighten-1" size="20"></v-progress-circular>
                                                </v-row>
                                            </template>
                                        </v-img>
                                    </v-avatar>
                                </template>
                                <template v-slot:title>
                                    <span class="text-subtitle-1 font-weight-black">{{ char.name }}</span>
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
                                    <v-chip size="x-small" color="orange" variant="flat" class="me-2 font-weight-bold">DAILY</v-chip>
                                    <span class="text-caption font-weight-black text-medium-emphasis">일일 숙제</span>
                                </div>
                                <div class="d-flex flex-column gap-1 mb-3">
                                    <v-checkbox v-for="task in dailyTasks" :key="task.id" v-model="char.completedTasks"
                                        :value="task.id" :label="task.name" hide-details density="compact"
                                        color="orange" @change="saveToLocal" class="custom-chk"></v-checkbox>
                                </div>

                                <v-divider class="my-3 border-opacity-25"></v-divider>

                                <div class="d-flex align-center mb-2">
                                    <v-chip size="x-small" color="primary" variant="flat" class="me-2 font-weight-bold">WEEKLY</v-chip>
                                    <span class="text-caption font-weight-black text-medium-emphasis">주간 레이드 (골드 획득 상위 3종)</span>
                                </div>
                                <div class="d-flex flex-column gap-1">
                                    <div v-for="raid in char.availableRaids" :key="raid.id" class="d-flex align-center">
                                        <v-checkbox v-model="char.completedTasks" :value="raid.id" hide-details
                                            :disabled="isRaidDisabled(char, raid)"
                                            density="compact" color="primary" @change="saveToLocal" class="custom-chk">
                                            <template v-slot:label>
                                                <div class="d-flex align-center w-100 py-1" :style="isRaidDisabled(char, raid) ? 'opacity: 0.4' : ''">
                                                    <v-sheet :color="getDifficulty(raid.name).color" class="difficulty-badge me-2 flex-shrink-0" rounded="sm">
                                                        {{ getDifficulty(raid.name).text }}
                                                    </v-sheet>
                                                    <span class="text-caption font-weight-medium text-wrap flex-grow-1" 
                                                        :class="{ 'text-decoration-line-through text-grey': isGoldExcluded(char, raid.id) }"
                                                        style="line-height: 1.2;">
                                                        {{ stripDifficulty(raid.name) }}
                                                    </span>
                                                    <span class="text-caption font-weight-bold text-amber-darken-3 ml-2 flex-shrink-0"
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

        <v-dialog v-model="addCharacterDialog" max-width="400">
            </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";
const characters = ref([]);
const addCharacterDialog = ref(false);
const newCharName = ref("");
const isFetching = ref(false);

const dailyTasks = [
    { id: 'chaos', name: '카오스 던전' },
    { id: 'guardian', name: '가디언 토벌' },
];

const raidList = [
    { group: "마녀", name: "고통의 마녀(나이트메어)", level: 1740, gold: 54000 },
    { group: "마녀", name: "고통의 마녀(하드)", level: 1730, gold: 44000 },
    { group: "마녀", name: "고통의 마녀(노멀)", level: 1710, gold: 35000 },
    { group: "종막", name: "종막: 최후의 날(하드)", level: 1730, gold: 52000 },
    { group: "종막", name: "종막: 최후의 날(노멀)", level: 1710, gold: 40000 },
    { group: "4막", name: "4막: 파멸의 성채(하드)", level: 1720, gold: 42000 },
    { group: "4막", name: "4막: 파멸의 성채(노멀)", level: 1700, gold: 33000 },
    { group: "3막", name: "3막: 칠흑(하드)", level: 1700, gold: 27000 },
    { group: "3막", name: "3막: 칠흑(노멀)", level: 1680, gold: 21000 },
    { group: "2막", name: "2막: 부유(하드)", level: 1690, gold: 23000 },
    { group: "2막", name: "2막: 부유(노멀)", level: 1670, gold: 14500 },
];

const getGoldTargetRaids = (char) => {
    const checkedRaids = char.completedTasks
        .map(taskId => raidList.find(r => r.name === taskId))
        .filter(r => r !== undefined);
    return checkedRaids.sort((a, b) => b.gold - a.gold).slice(0, 3);
};

const isGoldExcluded = (char, raidId) => {
    if (!char.completedTasks.includes(raidId)) return false;
    const targets = getGoldTargetRaids(char);
    return !targets.some(r => r.name === raidId);
};

const getCharGold = (char) => {
    return getGoldTargetRaids(char).reduce((sum, r) => sum + r.gold, 0);
};

const getTotalGold = () => {
    return characters.value.reduce((sum, char) => sum + getCharGold(char), 0);
};

const isRaidDisabled = (char, raid) => {
    if (char.completedTasks.includes(raid.id)) return false;
    return char.completedTasks.some(taskId => {
        const checkedRaid = raidList.find(r => r.name === taskId);
        return checkedRaid && checkedRaid.group === raid.group;
    });
};

const getDifficulty = (name) => {
    if (name.includes("나이트메어")) return { text: "나메", color: "purple-darken-1" };
    if (name.includes("하드")) return { text: "하드", color: "orange-darken-1" };
    if (name.includes("노멀")) return { text: "노말", color: "green-darken-1" };
    return { text: "일반", color: "grey" };
};

const stripDifficulty = (name) => {
    return name.replace(/\(.*\)/, "").trim();
};

const calculateRaids = (level) => {
    return raidList.filter(raid => level >= raid.level)
        .map(raid => ({ id: raid.name, name: raid.name, gold: raid.gold, group: raid.group }));
};

const saveToLocal = () => { 
    localStorage.setItem('hw_characters', JSON.stringify(characters.value)); 
};

// [수정] 삭제 시 블랙리스트에 추가하여 API가 다시 불러오지 못하게 차단
const deleteCharacter = (name) => {
    if (confirm(`${name} 삭제하시겠습니까?`)) {
        const blacklist = JSON.parse(localStorage.getItem('hw_blacklist') || '[]');
        if (!blacklist.includes(name)) {
            blacklist.push(name);
            localStorage.setItem('hw_blacklist', JSON.stringify(blacklist));
        }
        characters.value = characters.value.filter(c => c.name !== name);
        saveToLocal();
    }
};

const fetchMyExpedition = async (charName) => {
    isFetching.value = true;
    try {
        const url = `/api/characters/${encodeURIComponent(charName)}/siblings`;
        const response = await axios.get(url, {
            headers: { 'accept': 'application/json', 'authorization': `bearer ${API_KEY.trim()}` }
        });

        if (response.data && Array.isArray(response.data)) {
            const savedData = JSON.parse(localStorage.getItem('hw_characters') || '[]');
            const blacklist = JSON.parse(localStorage.getItem('hw_blacklist') || '[]');
            
            const newList = response.data
                // 블랙리스트에 있는 캐릭터는 제외
                .filter(char => !blacklist.includes(char.CharacterName))
                .sort((a, b) => parseFloat(b.ItemAvgLevel.replace(',', '')) - parseFloat(a.ItemAvgLevel.replace(',', '')))
                .map(char => {
                    const levelNum = parseFloat(char.ItemAvgLevel.replace(',', ''));
                    const existingChar = savedData.find(c => c.name === char.CharacterName);
                    
                    return {
                        name: char.CharacterName,
                        className: char.CharacterClassName,
                        level: char.ItemAvgLevel,
                        img: existingChar ? existingChar.img : '', 
                        completedTasks: existingChar ? existingChar.completedTasks : [],
                        availableRaids: calculateRaids(levelNum)
                    };
                });

            characters.value = newList;
            saveToLocal();

            // 이미지 로드 시 타임아웃 방지를 위해 순차적 업데이트 보강
            newList.forEach((c, index) => {
                if(!c.img) updateCharImage(c.name, index);
            });
        }
    } catch (e) {
        console.error("원정대 로드 실패:", e);
    } finally {
        isFetching.value = false;
    }
};

// [보강] 이미지 업데이트 시 에러 핸들링 추가
const updateCharImage = async (name, index) => {
    try {
        const url = `/api/armories/characters/${encodeURIComponent(name)}/profiles`;
        const res = await axios.get(url, {
            headers: { 'authorization': `bearer ${API_KEY.trim()}` }
        });
        // 1700 미만 캐릭터라도 공식 홈페이지에 데이터가 있다면 반드시 CharacterImage가 존재함
        if (res.data && res.data.CharacterImage) {
            if (characters.value[index]) {
                characters.value[index].img = res.data.CharacterImage;
                saveToLocal();
            }
        }
    } catch (e) {
        console.warn(`${name} 이미지 로드 실패:`, e);
    }
};

onMounted(() => {
    const savedMain = localStorage.getItem('main_char');
    if (savedMain) {
        const main = JSON.parse(savedMain);
        fetchMyExpedition(main.name);
    } else {
        const savedList = localStorage.getItem('hw_characters');
        if (savedList) characters.value = JSON.parse(savedList);
    }
    
    window.addEventListener('main-char-changed', () => {
        // 대표 캐릭터 변경 시 블랙리스트 초기화 여부 선택 (보통은 초기화하는 게 원정대가 달라지므로 맞음)
        localStorage.removeItem('hw_blacklist');
        const updatedMain = localStorage.getItem('main_char');
        if (updatedMain) fetchMyExpedition(JSON.parse(updatedMain).name);
    });
});
</script>

<style scoped>
/* 기존 스타일 유지 */
.gap-1 { gap: 2px; }
.shadow-sm { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important; }
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
.custom-chk :deep(.v-label) { font-size: 0.8rem !important; opacity: 1; }
.text-wrap { white-space: normal !important; word-break: keep-all; }
.text-caption { font-size: 0.75rem !important; }
.v-theme--light .bg-profile-header { background-color: #f5f5f5; }
.v-theme--dark .bg-profile-header { background-color: #2c2c2c; }
</style>