<template>
  <v-container fluid class="bg-grey-lighten-4">
    <v-row>
      <v-col cols="12" md="7">
        <v-card 
          variant="flat" 
          border 
          class="rounded-xl pa-4 overflow-y-auto" 
          style="max-height: 85vh;"
        >
          <div class="d-flex justify-space-between align-center mb-6">
            <h2 class="text-h5 font-weight-black text-primary">
              <v-icon class="me-2">mdi-storesearch</v-icon> 유물 각인서 시세 (TOP 20)
            </h2>
            <v-chip size="small" color="secondary" variant="flat" class="font-weight-bold">
              {{ nextRefresh }}초 후 자동 갱신
            </v-chip>
          </div>

          <v-row dense>
            <v-col 
              v-for="item in marketItems" 
              :key="item.Id" 
              cols="12" 
              sm="6"
            >
              <v-hover v-slot="{ isHovering, props }">
                <v-card
                  v-bind="props"
                  :elevation="isHovering ? 4 : 1"
                  class="pa-2 rounded-lg border transition-swing cursor-pointer mb-2"
                  @click="selectItem(item)"
                  :class="{ 'border-primary border-md bg-blue-lighten-5': selectedItem?.Id === item.Id }"
                  min-height="85"
                >
                  <div class="d-flex align-center h-100">
                    <v-avatar size="45" rounded="lg" class="me-3 elevation-1">
                      <v-img :src="item.Icon"></v-img>
                    </v-avatar>
                    <div class="flex-grow-1 overflow-hidden">
                      <div class="text-subtitle-2 font-weight-bold text-truncate mb-1">
                        {{ item.Name }}
                      </div>
                      <div class="text-body-1 font-weight-black text-primary">
                        {{ item.CurrentMinPrice.toLocaleString() }} <small>G</small>
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card variant="flat" border class="rounded-xl pa-6 sticky-card">
          <div class="d-flex align-center mb-6">
            <v-icon color="secondary" size="32" class="me-3">mdi-calculator-variant</v-icon>
            <h2 class="text-h5 font-weight-black text-secondary">경매 분배금 계산기</h2>
          </div>

          <v-text-field
            v-model.number="calcPrice"
            label="아이템 가격 (Gold)"
            variant="outlined"
            prefix="💰"
            type="number"
            color="secondary"
            class="text-h5 mb-2"
            hide-details
          ></v-text-field>

          <div v-if="selectedItem" class="mt-4 mb-6">
            <v-chip closable color="secondary" variant="tonal" @click:close="selectedItem = null">
              선택: {{ selectedItem.Name }}
            </v-chip>
          </div>
          <v-sheet
            v-else
            color="grey-lighten-4"
            border
            rounded="lg"
            class="mt-4 mb-6 pa-4 d-flex align-center justify-center border-dashed"
            style="border-width: 2px !important;"
          >
            <v-icon color="grey-darken-1" class="me-2">mdi-cursor-default-click-outline</v-icon>
            <span class="text-body-2 font-weight-bold text-grey-darken-2">
              좌측 리스트에서 아이템을 선택하거나 가격을 입력하세요
            </span>
          </v-sheet>

          <v-table class="calculation-table border rounded-lg overflow-hidden">
            <thead>
              <tr class="bg-grey-lighten-4">
                <th class="text-left font-weight-bold">인원</th>
                <th class="text-center font-weight-bold">입찰 추천가</th>
                <th class="text-right font-weight-bold">1인 분배금</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in [2, 3, 4, 6, 8, 16]" :key="n" :class="{'bg-blue-lighten-5': n === 4 || n === 8}">
                <td class="font-weight-bold">{{ n }}인</td>
                <td class="text-center text-red-darken-1 font-weight-black">
                  {{ calculateBid(calcPrice, n).toLocaleString() }} G
                </td>
                <td class="text-right text-grey-darken-2" style="font-size: 0.85rem;">
                  {{ calculateDistribution(calcPrice, n).toLocaleString() }} G
                </td>
              </tr>
            </tbody>
          </v-table>
          
          <v-alert type="info" variant="tonal" density="compact" class="mt-6 text-caption" icon="mdi-information-outline">
            입찰 추천가는 수수료 5% 제외 후 선취점(1.1)을 적용한 금액입니다.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY;
const marketItems = ref([]);
const selectedItem = ref(null);
const calcPrice = ref(0);
const nextRefresh = ref(60);
let timer = null;

const fetchMarketData = async () => {
  try {
    // Page 1과 Page 2를 동시에 요청합니다.
    const requestPage1 = axios.post(
      'https://developer-lostark.game.onstove.com/markets/items',
      {
        CategoryCode: 40000,
        ItemGrade: "유물",
        ItemName: "각인서",
        Sort: "CURRENT_MIN_PRICE ",
        SortCondition: "DESC",
        PageNo: 1
      },
      { headers: { Authorization: `bearer ${API_KEY}` } }
    );

    const requestPage2 = axios.post(
      'https://developer-lostark.game.onstove.com/markets/items',
      {
        CategoryCode: 40000,
        ItemGrade: "유물",
        ItemName: "각인서",
        Sort: "CURRENT_MIN_PRICE ",
        SortCondition: "DESC",
        PageNo: 2
      },
      { headers: { Authorization: `bearer ${API_KEY}` } }
    );

    // 두 요청이 모두 완료될 때까지 기다립니다.
    const [res1, res2] = await Promise.all([requestPage1, requestPage2]);
    
    const itemsPage1 = res1.data.Items || [];
    const itemsPage2 = res2.data.Items || [];

    // 두 페이지의 데이터를 합쳐서 20개를 만듭니다.
    marketItems.value = [...itemsPage1, ...itemsPage2];
    console.log(marketItems);
    nextRefresh.value = 60;
  } catch (e) {
    console.error("Market API Error (Multi-page)", e);
  }
};

const selectItem = (item) => {
  selectedItem.value = item;
  calcPrice.value = item.CurrentMinPrice;
};

const calculateBid = (price, n) => Math.floor(price * 0.95 * ((n - 1) / n) / 1.1); //
const calculateDistribution = (price, n) => Math.floor((price * 0.95) / n); //

onMounted(() => {
  fetchMarketData();
  timer = setInterval(() => {
    if (nextRefresh.value > 0) {
      nextRefresh.value--;
    } else {
      fetchMarketData();
    }
  }, 1000);
});

onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.sticky-card { position: sticky; top: 20px; }
.calculation-table th { font-size: 0.8rem !important; }
.calculation-table td { height: 48px !important; }
.transition-swing { transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); }
.text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* 스크롤바 디자인 (선택 사항) */
.overflow-y-auto::-webkit-scrollbar { width: 6px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background-color: #e0e0e0; border-radius: 10px; }
</style>