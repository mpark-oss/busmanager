<template>
  <v-container fluid class="board-container">
    <v-row>
      <v-col cols="12" md="6" lg="7">
        <v-card variant="flat" border class="rounded-xl pa-4 overflow-y-auto" style="max-height: 85vh">
          <div class="d-flex justify-space-between align-center mb-6">
            <h2 class="text-h5 font-weight-black text-primary">
              <v-icon class="me-2">mdi-storesearch</v-icon> 유물 각인서 시세
              (TOP 20)
            </h2>
            <v-chip size="small" color="secondary" variant="flat" class="font-weight-bold">
              {{ nextRefresh }}초 후 자동 갱신
            </v-chip>
          </div>

          <v-row dense>
            <v-col v-for="item in marketItems" :key="item.Id" cols="12" sm="6">
              <v-hover v-slot="{ isHovering, props }">
                <v-card v-bind="props" :elevation="isHovering ? 4 : 1"
                  class="pa-2 rounded-lg transition-swing cursor-pointer mb-2" @click="selectItem(item)"
                  :variant="selectedItem?.Id === item.Id ? 'tonal' : 'outlined'"
                  :color="selectedItem?.Id === item.Id ? 'primary' : undefined"
                  :class="{ 'border-md': selectedItem?.Id === item.Id }">
                  <div class="d-center align-center h-100">
                    <v-avatar size="45" rounded="lg" class="me-3 elevation-1">
                      <v-img :src="item.Icon"></v-img>
                    </v-avatar>
                    <div class="flex-grow-1 overflow-hidden">
                      <div class="text-subtitle-2 font-weight-bold text-truncate mb-1">
                        {{ item.Name }}
                      </div>
                      <div class="text-body-1 font-weight-black text-primary">
                        {{ item.CurrentMinPrice.toLocaleString() }}
                        <small>G</small>
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="5">
        <v-card variant="flat" border class="rounded-xl pa-6 sticky-card">
          <div class="d-flex align-center mb-6">
            <v-icon color="secondary" size="32" class="me-3">mdi-calculator-variant</v-icon>
            <h2 class="text-h5 font-weight-black text-secondary">
              경매 전략 및 버스 정산
            </h2>
          </div>

          <v-text-field v-model.number="calcPrice" label="시장 가격 (Gold)" variant="outlined" prefix="💰" type="number"
            color="secondary" class="text-h5 mb-4" hide-details @focus="$event.target.select()"></v-text-field>

          <v-table class="calculation-table border rounded-lg overflow-hidden">
            <thead>
              <tr class="bg-grey-lighten-4">
                <th class="text-center font-weight-bold" style="width: 15%">
                  인원
                </th>
                <th class="text-center font-weight-bold">
                  본인 사용<br /><small>(입찰가 / 분배금)</small>
                </th>
                <th class="text-center font-weight-bold">
                  쌀먹 모드<br /><small>(입찰가 / 분배금)</small>
                </th>
                <th class="text-center font-weight-bold text-deep-orange-darken-2">
                  기사 정산금<br /><small>(1인 송금액)</small>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in [2, 3, 4, 6, 8, 16]" :key="n" :class="{ 'highlight-row': [4, 8, 16].includes(n) }">
                <td class="text-center font-weight-bold">{{ n }}인</td>

                <td class="text-center">
                  <div class="text-blue-darken-3 font-weight-bold">
                    {{ calculateBid(calcPrice, n).toLocaleString() }} G
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    분배:
                    {{
                      calculateDistByBid(
                        calculateBid(calcPrice, n),
                        n,
                      ).toLocaleString()
                    }}
                    G
                  </div>
                </td>

                <td class="text-center">
                  <div class="text-red-darken-3 font-weight-black">
                    {{ calculateMaxGainBid(calcPrice, n).toLocaleString() }} G
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    분배:
                    {{
                      calculateDistByBid(
                        calculateMaxGainBid(calcPrice, n),
                        n,
                      ).toLocaleString()
                    }}
                    G
                  </div>
                </td>

                <td class="text-center">
                  <div class="text-deep-orange-darken-1 font-weight-black">
                    {{ calculateDriverShare(calcPrice, n).toLocaleString() }} G
                  </div>
                  <div class="text-caption text-deep-orange-lighten-1">
                    수수료 5% 제외
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div class="mt-6 pa-4 rounded-lg bg-grey-lighten-4">
            <div class="d-flex align-start mb-2">
              <v-icon size="16" color="blue" class="mt-1 me-2">mdi-information</v-icon>
              <span class="text-caption">**본인 사용**: 내가 낙찰받아 약 10%의 이득을 챙기는
                최적가입니다.</span>
            </div>
            <div class="d-flex align-start mb-2">
              <v-icon size="16" color="red" class="mt-1 me-2">mdi-alert</v-icon>
              <span class="text-caption">**쌀먹 모드**: 상대가 입찰 버튼을 누르는 순간 상대방이 손해를
                보게 유도하여 나의 분배금을 높이거나 유찰을 유도합니다.</span>
            </div>
            <div class="d-flex align-start mb-2">
              <v-icon size="16" color="deep-orange" class="mt-1 me-2">mdi-bus</v-icon>
              <span class="text-caption">**기사 정산금**: 버스 시 사용. 낙찰 기사가 판매 후 보내줄
                금액</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";

const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY;
const marketItems = ref([]);
const selectedItem = ref(null);
const calcPrice = ref(0);
const nextRefresh = ref(60);
let timer = null;

// 입찰 계산 로직
const calculateBid = (p, n) =>
  p > 0 ? Math.floor((p * 0.95 * ((n - 1) / n)) / 1.1) : 0;
const calculateMaxGainBid = (p, n) =>
  p > 0 ? Math.floor((p * 0.95 * ((n - 1) / n)) / 1.21) : 0;
const calculateDistByBid = (bid, n) =>
  bid > 0 && n > 1 ? Math.floor(bid / (n - 1)) : 0;

// [버스 전용] 1인당 정산금: (시장가 * 0.95) / N
const calculateDriverShare = (p, n) => (p > 0 ? Math.floor((p * 0.95) / n) : 0);

// API 데이터 호출 (생략 없이 유지)
const fetchMarketData = async () => {
  try {
    const commonParams = {
      CategoryCode: 40000,
      ItemGrade: "유물",
      ItemName: "각인서",
      Sort: "CURRENT_MIN_PRICE ",
      SortCondition: "DESC",
    };
    const [res1, res2] = await Promise.all([
      axios.post(
        "https://developer-lostark.game.onstove.com/markets/items",
        { ...commonParams, PageNo: 1 },
        { headers: { Authorization: `bearer ${API_KEY}` } },
      ),
      axios.post(
        "https://developer-lostark.game.onstove.com/markets/items",
        { ...commonParams, PageNo: 2 },
        { headers: { Authorization: `bearer ${API_KEY}` } },
      ),
    ]);
    marketItems.value = [
      ...(res1.data.Items || []),
      ...(res2.data.Items || []),
    ];
    nextRefresh.value = 60;
  } catch (e) {
    console.error(e);
  }
};

const selectItem = (item) => {
  selectedItem.value = item;
  calcPrice.value = item.CurrentMinPrice;
};

onMounted(() => {
  fetchMarketData();
  timer = setInterval(() => {
    nextRefresh.value > 0 ? nextRefresh.value-- : fetchMarketData();
  }, 1000);
});
onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.board-container {
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background));
}

.sticky-card {
  position: sticky;
  top: 20px;
}

.calculation-table th {
  font-size: 0.65rem !important;
  line-height: 1.2;
  padding: 8px 2px !important;
  text-align: center !important;
}

.calculation-table td {
  padding: 8px 4px !important;
}

.highlight-row {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.transition-swing {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
</style>
