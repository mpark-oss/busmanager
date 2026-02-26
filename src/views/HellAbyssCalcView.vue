<template>
  <v-container fluid class="fill-height align-start pa-6">
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <div class="d-flex align-center mb-4">
          <v-avatar size="40" class="me-3" color="primary" variant="tonal">
            <v-icon size="24">mdi-treasure-chest</v-icon>
          </v-avatar>
          <h2 class="text-h4 font-weight-black text-primary">지옥/나락 보상 실시간 가치 분석</h2>
        </div>

        <v-alert type="info" variant="tonal" class="mb-6 border-opacity-25 py-2">
          <div class="d-flex align-center flex-wrap justify-space-between w-100">
            <div class="text-body-2 font-weight-bold my-1">
              💡 로아 거래소 <strong>실시간 시세</strong>와 <strong>페온 가치</strong>가 반영된 결과입니다.
            </div>
            <div class="d-flex align-center bg-background pa-1 rounded-lg border my-1" style="min-width: 250px;">
              <span class="text-caption font-weight-black mx-3 opacity-80">블루크리스탈 100개당</span>
              <v-text-field 
                v-model.number="crystalPrice" 
                type="number" 
                density="compact" 
                variant="outlined" 
                color="primary" 
                hide-details 
                bg-color="surface" 
                suffix="골드" 
                class="font-weight-black"
              ></v-text-field>
            </div>
          </div>
        </v-alert>

        <v-row class="mb-6">
          <v-col cols="12" md="6">
            <v-card variant="flat" border class="rounded-xl pa-5 h-100 bg-surface">
              <div class="text-subtitle-1 font-weight-black mb-4">
                <v-icon color="primary" class="me-2">mdi-sword-cross</v-icon>던전 선택
              </div>
              <v-row dense>
                <v-col cols="4" v-for="dungeon in dungeons" :key="dungeon.id">
                  <v-card 
                    class="pa-3 text-center cursor-pointer transition-swing rounded-lg border" 
                    :color="selectedDungeon === dungeon.id ? 'primary' : undefined" 
                    :variant="selectedDungeon === dungeon.id ? 'tonal' : 'outlined'" 
                    :class="selectedDungeon === dungeon.id ? 'border-primary' : 'border-opacity-25'" 
                    @click="selectedDungeon = dungeon.id"
                  >
                    <div class="font-weight-black text-body-1">{{ dungeon.name }}</div>
                    <div class="text-caption opacity-80">{{ dungeon.level }}</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card variant="flat" border class="rounded-xl pa-5 h-100 bg-surface">
              <div class="text-subtitle-1 font-weight-black mb-4">
                <v-icon color="primary" class="me-2">mdi-stairs-up</v-icon>단계 선택
              </div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip 
                  v-for="step in 11" 
                  :key="step-1" 
                  size="large" 
                  :variant="selectedStage === (step-1) ? 'flat' : 'outlined'" 
                  :color="selectedStage === (step-1) ? 'primary' : 'grey'" 
                  class="font-weight-bold px-4" 
                  @click="selectedStage = (step-1)"
                >
                  {{ step - 1 }}단계
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <div v-if="isLoading" class="d-flex flex-column align-center justify-center py-12">
          <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
          <div class="mt-4 font-weight-bold opacity-70">실시간 경매장 데이터를 동기화 중입니다...</div>
        </div>

        <div v-else>
          <div class="text-h6 font-weight-black mb-4 d-flex align-center text-primary">
            <v-icon class="me-2">mdi-podium</v-icon> 가치 순위 (페온 포함)
          </div>
          <v-fade-transition group>
            <v-card 
              v-for="(box, index) in calculatedResults" 
              :key="box.name" 
              variant="outlined" 
              class="mb-3 rounded-xl hover-card border-opacity-25 bg-surface"
            >
              <div class="d-flex align-center pa-4">
                <v-avatar 
                  size="42" 
                  class="me-4 font-weight-black text-white" 
                  :class="index === 0 ? 'bg-amber-darken-2 elevation-3' : (index === 1 ? 'bg-grey-darken-1' : 'bg-brown-darken-1')"
                >
                  {{ index + 1 }}
                </v-avatar>
                <v-chip size="small" variant="tonal" color="primary" class="me-3 font-weight-bold">{{ box.type }}</v-chip>
                <v-img :src="box.image" width="44" height="44" class="me-4 rounded-lg border border-opacity-10 shadow-sm" cover></v-img>
                <div class="text-h6 font-weight-black">{{ box.name }}</div>
                <v-spacer></v-spacer>
                <div class="text-right me-4">
                  <div class="text-h5 font-weight-black d-flex align-center justify-end text-amber-accent-2">
                    <v-icon size="24" class="me-1">mdi-currency-usd-circle</v-icon>
                    {{ box.totalGold.toLocaleString() }}
                  </div>
                  <div class="text-caption font-weight-bold mt-1 text-medium-emphasis">{{ box.desc }}</div>
                </div>
              </div>
            </v-card>
          </v-fade-transition>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { rewardData } from '../data/rewardData.js';

const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";
const selectedDungeon = ref('hell_1');
const selectedStage = ref(6);
const crystalPrice = ref(3500); // 초기값 설정
const isLoading = ref(false);

const dungeons = ref([
  { id: 'hell_1', name: '지옥 1', level: '1640' },
  { id: 'hell_2', name: '지옥 2', level: '1700' },
  { id: 'hell_3', name: '지옥 3', level: '1730' },
  { id: 'abyss_1', name: '나락 1', level: '1640' },
  { id: 'abyss_2', name: '나락 2', level: '1700' },
  { id: 'abyss_3', name: '나락 3', level: '1730' },
]);

const itemInfo = ref({});
const pheonPrice = computed(() => crystalPrice.value / 85);

const getTargetItems = (dungeonId) => {
  const isType3 = dungeonId.endsWith('_3');
  return {
    dest: isType3 ? '운명의 파괴석 결정' : '운명의 파괴석',
    guard: isType3 ? '운명의 수호석 결정' : '운명의 수호석',
    leap: isType3 ? '위대한 운명의 돌파석' : '운명의 돌파석',
    fusion: isType3 ? '상급 아비도스 융화 재료' : '아비도스 융화 재료',
    grace: '용암의 숨결',
    blessing: '빙하의 숨결'
  };
};

const fetchAllMarketData = async () => {
  if (!API_KEY) return;
  isLoading.value = true;
  try {
    const itemsToFetch = [
      '운명의 파괴석', '운명의 수호석', '운명의 돌파석', '아비도스 융화 재료',
      '운명의 파괴석 결정', '운명의 수호석 결정', '위대한 운명의 돌파석', '상급 아비도스 융화 재료',
      '용암의 숨결', '빙하의 숨결'
    ];

    const itemPromises = itemsToFetch.map(name => 
      axios.post('/api/markets/items', {
        Sort: "CURRENT_MIN_PRICE", CategoryCode: 50000, ItemName: name, PageNo: 1, SortCondition: "ASC"
      }, { headers: { Authorization: `bearer ${API_KEY.trim()}` } })
    );

    const currencyPromise = axios.get('/api/markets/currencies', {
      headers: { Authorization: `bearer ${API_KEY.trim()}` }
    });

    const responses = await Promise.all([...itemPromises, currencyPromise]);
    
    itemsToFetch.forEach((name, idx) => {
      const item = responses[idx].data?.Items?.[0];
      if (item) {
        itemInfo.value[name] = { 
          price: item.CurrentMinPrice / item.BundleCount, 
          icon: item.Icon 
        };
      }
    });

    // 블루크리스탈 시세 정밀 처리
    const currencyData = responses[responses.length - 1].data;
    if (Array.isArray(currencyData)) {
      const crystalInfo = currencyData.find(c => c.Symbol === 'BC' || (c.Name && c.Name.includes('크리스탈')));
      if (crystalInfo) {
        crystalPrice.value = crystalInfo.BuyPrice;
      }
    }

    // 고정 아이콘 세팅
    itemInfo.value['골드'] = { icon: 'https://cdn-lostark.game.onstove.com/efui_combinedpath/item/currency_0.png' };
    itemInfo.value['어빌리티 스톤'] = { icon: 'https://cdn-lostark.game.onstove.com/efui_combinedpath/item/item_311.png' };
    itemInfo.value['팔찌'] = { icon: 'https://cdn-lostark.game.onstove.com/efui_combinedpath/item/item_313.png' };
    itemInfo.value['천상 도전권'] = { icon: 'https://cdn-lostark.game.onstove.com/efui_combinedpath/item/item_45133.png' };
    itemInfo.value['운명의 돌'] = { icon: 'https://cdn-lostark.game.onstove.com/efui_combinedpath/item/item_51303.png' };
    itemInfo.value['보석/젬'] = { icon: 'https://cdn-lostark.game.onstove.com/efui_combinedpath/item/item_210.png' };

  } catch (e) { 
    console.error("데이터 조회 에러:", e); 
  } finally { 
    isLoading.value = false; 
  }
};

onMounted(fetchAllMarketData);

const calculatedResults = computed(() => {
  const currentData = rewardData[selectedDungeon.value]?.find(d => d.step === selectedStage.value);
  if (!currentData || !itemInfo.value['용암의 숨결']) return [];

  const target = getTargetItems(selectedDungeon.value);
  const results = [];

  if (currentData.dest_stone || currentData.guard_stone) {
    const gold = (currentData.dest_stone || 0) * (itemInfo.value[target.dest]?.price || 0) + 
                 (currentData.guard_stone || 0) * (itemInfo.value[target.guard]?.price || 0);
    results.push({ type: '재련', name: '파괴석 / 수호석', image: itemInfo.value[target.dest]?.icon, totalGold: Math.floor(gold), desc: `파괴석 ${currentData.dest_stone?.toLocaleString()} / 수호석 ${currentData.guard_stone?.toLocaleString()}` });
  }

  if (currentData.leap) {
    const gold = currentData.leap * (itemInfo.value[target.leap]?.price || 0);
    results.push({ type: '재련', name: '돌파석', image: itemInfo.value[target.leap]?.icon, totalGold: Math.floor(gold), desc: `${target.leap} ${currentData.leap.toLocaleString()}개` });
  }

  if (currentData.fusion) {
    const gold = currentData.fusion * (itemInfo.value[target.fusion]?.price || 0);
    results.push({ type: '재련', name: '융화 재료', image: itemInfo.value[target.fusion]?.icon, totalGold: Math.floor(gold), desc: `${target.fusion} ${currentData.fusion.toLocaleString()}개` });
  }

  if (currentData.grace || currentData.blessing) {
    const gold = (currentData.grace || 0) * itemInfo.value['용암의 숨결'].price + (currentData.blessing || 0) * itemInfo.value['빙하의 숨결'].price;
    results.push({ type: '재련', name: '재련 보조', image: itemInfo.value['용암의 숨결'].icon, totalGold: Math.floor(gold), desc: `용암 ${currentData.grace}개 + 빙하 ${currentData.blessing}개` });
  }

  if (currentData.gold) {
    results.push({ type: '재화', name: '귀속 골드', image: itemInfo.value['골드'].icon, totalGold: currentData.gold, desc: `귀속 골드 ${currentData.gold.toLocaleString()}G` });
  }

  if (currentData.ability) {
    const gold = currentData.ability * (9 * pheonPrice.value);
    results.push({ type: '장신구', name: '어빌리티 스톤', image: itemInfo.value['어빌리티 스톤'].icon, totalGold: Math.floor(gold), desc: `스톤 ${currentData.ability}개 (페온 ${currentData.ability * 9}개 가치)` });
  }

  if (currentData.bracelet_cnt) {
    const pCnt = currentData.bracelet_grade === '고대' ? 20 : 15;
    const gold = currentData.bracelet_cnt * (pCnt * pheonPrice.value);
    results.push({ type: '장신구', name: `팔찌 (${currentData.bracelet_grade})`, image: itemInfo.value['팔찌'].icon, totalGold: Math.floor(gold), desc: `팔찌 ${currentData.bracelet_cnt}개 (페온 ${currentData.bracelet_cnt * pCnt}개 가치)` });
  }

  if (currentData.heaven_ticket) {
    results.push({ type: '특수', name: '천상 도전권', image: itemInfo.value['천상 도전권'].icon, totalGold: currentData.heaven_ticket * 3000, desc: `도전권 ${currentData.heaven_ticket}개` });
  }

  if (currentData.destiny) {
    results.push({ type: '특수', name: '운명의 돌', image: itemInfo.value['운명의 돌'].icon, totalGold: Math.floor(currentData.destiny * 5500), desc: `운명의 돌 ${currentData.destiny}개` });
  }

  if (currentData.gem_select || currentData.gem_random) {
    results.push({ type: '보석', name: '젬 상자', image: itemInfo.value['보석/젬'].icon, totalGold: 16655, desc: `보석 상자 (가치 역산 기준)` });
  }

  return results.sort((a, b) => b.totalGold - a.totalGold);
});
</script>

<style scoped>
.gap-2 { gap: 8px; }
.hover-card { transition: all 0.2s ease-in-out; }
.hover-card:hover { transform: translateY(-2px); border-color: rgb(var(--v-theme-primary)) !important; box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2); }
.shadow-sm { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
</style>