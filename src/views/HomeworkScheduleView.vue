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
                            상단바의 <strong>'캐릭터 설정'</strong> 버튼을 눌러 대표 캐릭터를 등록하면<br>
                            원정대 목록을 자동으로 불러옵니다.
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

        <v-dialog v-model="addCharacterDialog" max-width="400" persistent v-if="false"></v-dialog>
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
    if (name.includes("노말")) return { text: "노말", color: "green-darken-1" };
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

const updateCharImage = async (name, index) => {
    try {
        const url = `/api/armories/characters/${encodeURIComponent(name)}/profiles`;
        const res = await axios.get(url, {
            headers: { 'authorization': `bearer ${API_KEY.trim()}` }
        });
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
        localStorage.removeItem('hw_blacklist');
        const updatedMain = localStorage.getItem('main_char');
        if (updatedMain) fetchMyExpedition(JSON.parse(updatedMain).name);
    });
});
</script>

<style scoped>
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