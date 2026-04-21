<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <div>
            <h2 class="text-h4 font-weight-black text-primary">
              개인 숙제 관리
            </h2>

            <div
              class="text-caption text-medium-emphasis font-weight-bold d-flex align-center flex-wrap gap-2"
            >
              <span>주간 수익 현황:</span>
              <v-tooltip
                location="bottom"
                offset="10"
                transition="fade-transition"
                theme="dark"
                content-class="custom-tooltip-bg"
              >
                <template v-slot:activator="{ props }">
                  <span
                    v-bind="props"
                    class="text-primary cursor-help font-weight-black num-style"
                    style="
                      border-bottom: 2px dotted currentColor;
                      font-size: 1.1rem;
                    "
                  >
                    {{ getTotalGrossGold().toLocaleString() }}G
                  </span>
                </template>

                <div class="pa-1">
                  <div
                    class="text-subtitle-2 font-weight-black mb-2 white-text"
                  >
                    주간 수익 상세 내역
                  </div>

                  <div
                    class="d-flex flex-column gap-1"
                    style="min-width: 200px"
                  >
                    <div class="d-flex justify-space-between align-center">
                      <div class="d-flex align-center white-text">
                        <v-icon size="16" color="amber" class="me-2"
                          >mdi-sword-cross</v-icon
                        >
                        <span class="font-weight-bold">레이드</span>
                      </div>
                      <span
                        class="text-amber-accent-2 font-weight-bold num-style"
                      >
                        +{{ getPureRaidGold().toLocaleString() }}G
                      </span>
                    </div>

                    <div
                      class="d-flex justify-space-between align-center ps-6 pe-1 text-caption"
                      style="opacity: 0.8"
                    >
                      <span class="white-text">ㄴ 일반 골드</span>
                      <span class="white-text num-style"
                        >{{
                          getTotalGoldBreakdown().tradeable.toLocaleString()
                        }}G</span
                      >
                    </div>
                    <div
                      class="d-flex justify-space-between align-center ps-6 pe-1 text-caption"
                      style="opacity: 0.8"
                    >
                      <span class="text-light-green-accent-1"
                        >ㄴ 귀속 골드</span
                      >
                      <span class="text-light-green-accent-1 num-style"
                        >{{
                          getTotalGoldBreakdown().bound.toLocaleString()
                        }}G</span
                      >
                    </div>

                    <v-divider
                      class="my-1 border-opacity-25"
                      color="white"
                    ></v-divider>

                    <div class="d-flex justify-space-between align-center">
                      <div class="d-flex align-center white-text">
                        <v-icon
                          size="16"
                          color="light-blue-accent-2"
                          class="me-2"
                          >mdi-bus-side</v-icon
                        >
                        <span>버스</span>
                      </div>
                      <span
                        :class="[
                          'font-weight-bold num-style',
                          getTotalBusGold() >= 0
                            ? 'text-light-blue-accent-2'
                            : 'text-red-accent-2',
                        ]"
                      >
                        {{ getTotalBusGold() >= 0 ? "+" : ""
                        }}{{ getTotalBusGold().toLocaleString() }}G
                      </span>
                    </div>

                    <div class="d-flex justify-space-between align-center">
                      <div class="d-flex align-center white-text">
                        <v-icon size="16" color="red-accent-2" class="me-2"
                          >mdi-minus-box</v-icon
                        >
                        <span>더보기</span>
                      </div>
                      <span
                        class="text-red-accent-2 font-weight-bold num-style"
                      >
                        -{{ getTotalMoreCost().toLocaleString() }}G
                      </span>
                    </div>
                  </div>
                </div>
              </v-tooltip>

              <span class="text-grey">/</span>
              <span class="">{{ getMaxPossibleGold().toLocaleString() }}G</span>

              <v-chip
                size="x-small"
                :color="
                  getMaxPossibleGold() -
                    (getPureRaidGold() - getTotalMoreCost()) >
                  0
                    ? 'error'
                    : 'success'
                "
                variant="flat"
                class="font-weight-black num-style"
              >
                <template
                  v-if="
                    getMaxPossibleGold() -
                      (getPureRaidGold() - getTotalMoreCost()) >
                    0
                  "
                >
                  레이드 남은 수익:
                  {{
                    Math.max(
                      0,
                      getMaxPossibleGold() -
                        (getPureRaidGold() - getTotalMoreCost()),
                    ).toLocaleString()
                  }}G
                </template>
                <template v-else> 주간 레이드 목표 완료 </template>
              </v-chip>
            </div>
          </div>
          <v-spacer></v-spacer>
          <div class="d-flex align-center mb-6">
            <v-btn
              prepend-icon="mdi-account-group"
              color="amber-darken-3"
              variant="flat"
              rounded="lg"
              class="me-2"
              @click="fixedPartyModal = true"
            >
              내 고정 팟 보기
            </v-btn>

            <v-btn
              prepend-icon="mdi-account-edit-outline"
              color="primary"
              variant="flat"
              rounded="lg"
              @click="openRosterManager"
            >
              화면 설정
            </v-btn>
          </div>

          <v-dialog v-model="rosterDialog" max-width="500" scrollable>
            <v-card class="rounded-xl">
              <v-card-title class="pa-4 font-weight-black d-flex align-center">
                <v-icon class="me-2">mdi-account-group</v-icon> 원정대 캐릭터
                관리
              </v-card-title>

              <div class="pa-4 bg-grey-lighten-4 rounded-lg mb-4">
                <div class="text-subtitle-2 font-weight-bold mb-2">
                  <v-icon size="small" color="primary" class="me-1"
                    >mdi-cloud-sync</v-icon
                  >
                  클라우드 동기화 (기기 간 공유)
                </div>
                <div class="text-caption text-grey-darken-1 mb-3">
                  대표 캐릭터명 기반으로 숙제 상태를 서버에 보관합니다.
                </div>

                <v-row dense>
                  <v-col cols="6">
                    <v-btn
                      block
                      color="primary"
                      variant="elevated"
                      prepend-icon="mdi-cloud-upload"
                      :loading="isSyncing"
                      @click="saveToCloud"
                    >
                      현재 상태 저장
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn
                      block
                      color="secondary"
                      variant="outlined"
                      prepend-icon="mdi-cloud-download"
                      :loading="isSyncing"
                      @click="loadFromCloud"
                    >
                      데이터 불러오기
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
              <v-card-text class="pa-4" style="height: 500px">
                <div class="text-subtitle-2 font-weight-bold mb-2 text-primary">
                  카드 순서 변경 (드래그)
                </div>
                <v-list class="pa-0 border rounded-lg mb-6">
                  <draggable
                    v-model="tempRosterOrder"
                    handle=".drag-handle"
                    item-key="name"
                  >
                    <template #item="{ element }">
                      <v-list-item class="border-b last-mb-0">
                        <template v-slot:prepend>
                          <v-icon class="drag-handle cursor-move me-2"
                            >mdi-drag-vertical</v-icon
                          >
                          <v-avatar size="32" border class="me-2">
                            <v-img :src="element.img"></v-img>
                          </v-avatar>
                        </template>
                        <v-list-item-title class="font-weight-bold">{{
                          element.name
                        }}</v-list-item-title>
                        <v-list-item-subtitle
                          >Lv.{{ element.level }}
                          {{ element.className }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </template>
                  </draggable>
                </v-list>

                <div v-if="blacklistedChars.length > 0">
                  <div class="text-subtitle-2 font-weight-bold mb-2 text-error">
                    삭제된 캐릭터 복구
                  </div>
                  <v-list class="pa-0 border rounded-lg bg-grey-lighten-4">
                    <v-list-item v-for="name in blacklistedChars" :key="name">
                      <v-list-item-title class="font-weight-medium">{{
                        name
                      }}</v-list-item-title>
                      <template v-slot:append>
                        <v-btn
                          size="small"
                          variant="text"
                          color="success"
                          prepend-icon="mdi-refresh"
                          @click="restoreCharacter(name)"
                        >
                          복구
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>
              </v-card-text>

              <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="rosterDialog = false">닫기</v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  rounded="lg"
                  @click="saveRosterOrder"
                >
                  저장</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>

        <v-row
          v-if="characters.length === 0 && !isFetching"
          justify="center"
          class="py-12"
        >
          <v-col cols="12" sm="8" md="6" class="text-center">
            <v-icon size="64" color="grey-lighten-1" class="mb-4"
              >mdi-account-search-outline</v-icon
            >
            <h3 class="text-h5 font-weight-bold mb-2">
              설정된 대표 캐릭터가 없습니다.
            </h3>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col
            v-for="char in characters"
            :key="char.name"
            cols="12"
            sm="6"
            md="4"
            lg="4"
            xl="3"
          >
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                v-bind="props"
                border
                variant="flat"
                class="character-card rounded-xl overflow-hidden shadow-sm bg-card position-relative"
                :style="
                  char.isGoldCharacter
                    ? 'border: 2px solid #FFB300 !important'
                    : ''
                "
              >
                <v-list-item
                  class="pa-3 bg-profile-header"
                  :subtitle="`Lv. ${char.level} ${char.className}`"
                >
                  <template v-slot:prepend>
                    <v-avatar
                      size="60"
                      border
                      class="elevation-3 bg-grey-lighten-4"
                    >
                      <v-img
                        :src="char.img"
                        cover
                        position="top center"
                      ></v-img>
                    </v-avatar>
                  </template>
                  <template v-slot:title>
                    <div class="d-flex align-center">
                      <v-btn
                        icon
                        variant="text"
                        size="x-small"
                        :color="
                          char.isGoldCharacter
                            ? 'amber-darken-3'
                            : 'grey-lighten-1'
                        "
                        @click.stop="toggleGoldCharacter(char)"
                        class="me-1"
                      >
                        <v-icon size="18">{{
                          char.isGoldCharacter
                            ? "mdi-gold"
                            : "mdi-treasure-chest"
                        }}</v-icon>
                      </v-btn>
                      <span
                        class="text-subtitle-1 font-weight-black text-truncate"
                        style="max-width: 130px"
                        >{{ char.name }}</span
                      >
                      <div
                        class="d-flex align-center text-caption font-weight-bold text-medium-emphasis"
                        style="margin: 0.5rem"
                      >
                        <v-icon size="14" class="me-1" color="grey-darken-1"
                          >mdi-sword-cross</v-icon
                        >
                        <span class="num-style">
                          {{
                            typeof char.cbPower === "number"
                              ? char.cbPower.toLocaleString()
                              : char.cbPower
                          }}
                        </span>
                      </div>
                      <v-tooltip
                        v-if="topRosterMembers.includes(char.name)"
                        location="top"
                      >
                        <template v-slot:activator="{ props }">
                          <v-chip
                            v-bind="props"
                            size="x-small"
                            color="red"
                            variant="flat"
                            class="ms-2 px-1 pulse-badge"
                          >
                            <v-icon size="14" color="white">mdi-skull</v-icon>
                          </v-chip>
                        </template>
                        <span>원정대 누적 신고 {{ topRosterCount }}회!</span>
                      </v-tooltip>
                    </div>
                  </template>
                  <template v-slot:append>
                    <div class="d-flex align-center">
                      <div class="text-right mr-1">
                        <div
                          class="text-caption font-weight-bold num-style"
                          :class="
                            char.isGoldCharacter
                              ? 'text-amber-darken-4'
                              : 'text-light-blue-darken-2'
                          "
                        >
                          {{ getCharGold(char).toLocaleString() }} G
                        </div>
                      </div>

                      <v-btn
                        v-if="getCharSchedules(char.name).length > 0"
                        icon
                        variant="text"
                        size="small"
                        color="error"
                        class="position-relative pulse-badge"
                        @click.stop="openScheduleModal(char.name)"
                      >
                        <v-icon>mdi-bell-outline</v-icon>
                        <span class="bell-badge-count">{{
                          getCharSchedules(char.name).length
                        }}</span>
                      </v-btn>

                      <v-btn
                        icon="mdi-cog-outline"
                        variant="text"
                        color="grey-darken-1"
                        size="small"
                        @click="openCharSettings(char)"
                      ></v-btn>

                      <div style="width: 40px" class="d-flex justify-center">
                        <v-fade-transition>
                          <v-btn
                            v-if="isHovering || isMobileMode"
                            icon="mdi-delete-outline"
                            variant="text"
                            color="error"
                            size="small"
                            @click.stop="deleteCharacter(char.name)"
                          ></v-btn>
                        </v-fade-transition>
                      </div>
                    </div>
                  </template>
                </v-list-item>

                <v-divider></v-divider>

                <v-card-text class="pa-3">
                  <div v-if="hasVisibleDaily(char)">
                    <div class="d-flex align-center mb-2">
                      <v-chip
                        size="x-small"
                        color="orange"
                        variant="flat"
                        class="me-2 font-weight-bold"
                        >DAILY</v-chip
                      >
                      <span
                        class="text-caption font-weight-black text-medium-emphasis"
                        >일일 숙제</span
                      >
                    </div>
                    <div class="d-flex flex-column gap-3 mb-3">
                      <template v-for="task in dailyTasks" :key="task.id">
                        <div
                          v-if="isTaskVisible(char, task.id)"
                          class="task-container"
                        >
                          <div
                            class="d-flex align-center justify-space-between mb-1"
                          >
                            <v-checkbox
                              v-model="char.completedTasks"
                              :value="task.id"
                              :label="task.name"
                              hide-details
                              density="compact"
                              color="orange"
                              @change="handleDailyCheck(char, task.id)"
                              class="custom-chk flex-grow-1"
                            ></v-checkbox>
                            <div class="rest-input-wrapper">
                              <span
                                class="text-caption font-weight-bold grey--text mr-1"
                                >휴게</span
                              >
                              <input
                                type="number"
                                v-model.number="char.restGauges[task.id]"
                                class="rest-input text-caption font-weight-black"
                                @change="validateAndSaveRest(char)"
                                min="0"
                                max="200"
                                step="20"
                              />
                            </div>
                          </div>
                          <div class="rest-gauge-bar">
                            <div
                              v-for="n in 10"
                              :key="n"
                              class="gauge-segment"
                              :class="getSegmentClass(char, task.id, n)"
                            >
                              <div
                                class="gauge-fill"
                                :style="getFillStyle(char, task.id, n)"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                    <v-divider class="my-3 border-opacity-25"></v-divider>
                  </div>

                  <div v-if="hasVisibleSpecial(char)">
                    <div class="d-flex align-center mb-2">
                      <v-chip
                        size="x-small"
                        color="cyan-darken-1"
                        variant="flat"
                        class="me-2 font-weight-bold text-white"
                        >SPECIAL</v-chip
                      >
                      <span
                        class="text-caption font-weight-black text-medium-emphasis"
                        >주간 숙제</span
                      >
                    </div>
                    <div
                      class="d-flex flex-row flex-wrap mb-3"
                      style="gap: 4px"
                    >
                      <template v-for="task in specialTasks" :key="task.id">
                        <v-checkbox
                          v-if="isTaskVisible(char, task.id)"
                          v-model="char.completedTasks"
                          :value="task.id"
                          :label="task.label"
                          hide-details
                          density="compact"
                          color="cyan-darken-2"
                          @change="saveToLocal"
                          class="custom-chk-horizontal"
                        ></v-checkbox>
                      </template>
                    </div>
                    <v-divider class="my-3 border-opacity-25"></v-divider>
                  </div>

                  <template v-if="char.settings?.showWeekly">
                    <div class="d-flex align-center mb-2">
                      <v-chip
                        size="x-small"
                        color="primary"
                        variant="flat"
                        class="me-2 font-weight-bold"
                        >WEEKLY</v-chip
                      >
                      <span
                        class="text-caption font-weight-black text-medium-emphasis"
                        >주간 레이드</span
                      >
                      <v-chip
                        size="x-small"
                        :color="
                          getGoldRaidCount(char) >= 3
                            ? 'success'
                            : 'grey-darken-1'
                        "
                        variant="tonal"
                        class="ms-2 font-weight-black"
                      >
                        {{ getGoldRaidCount(char) }} / 3
                      </v-chip>
                    </div>

                    <div class="d-flex flex-column gap-2">
                      <div
                        v-for="groupName in char.settings?.visibleGroups || []"
                        :key="groupName"
                        class="raid-group-container border rounded-lg pa-1"
                      >
                        <div class="d-flex align-center px-2 mb-1">
                          <span
                            class="text-caption font-weight-black text-primary flex-grow-1"
                            :style="
                              isGoldExcluded(char, groupName)
                                ? 'text-decoration: line-through; opacity: 0.5'
                                : ''
                            "
                          >
                            {{ groupName }}
                            <v-btn
                              icon
                              variant="text"
                              size="x-small"
                              :class="[
                                'ms-1',
                                {
                                  'bus-active-glow': hasBusSetting(
                                    char,
                                    groupName,
                                  ),
                                },
                              ]"
                              :color="
                                hasBusSetting(char, groupName)
                                  ? 'light-blue-accent-2'
                                  : 'grey-lighten-1'
                              "
                              @click.stop="openBusDialog(char, groupName)"
                            >
                              <v-icon size="18">mdi-bus-side</v-icon>
                              <v-tooltip activator="parent" location="top"
                                >{{ groupName }} 버스 설정</v-tooltip
                              >
                            </v-btn>
                          </span>
                        </div>
                        <div class="d-flex flex-column px-1">
                          <template
                            v-for="raid in getRaidsByGroup(groupName)"
                            :key="raid.name"
                          >
                            <template
                              v-for="gate in raid.gates || []"
                              :key="gate.g"
                            >
                              <div
                                v-if="
                                  gate &&
                                  (
                                    char.settings?.selectedGateIds || []
                                  ).includes(raid.name + '_G' + gate.g)
                                "
                                class="d-flex align-center mb-n1"
                              >
                                <v-checkbox
                                  v-model="char.completedTasks"
                                  :value="raid.name + '_G' + gate.g"
                                  :disabled="isGateDisabled(char, raid, gate)"
                                  @change="toggleGate(char, raid, gate)"
                                  hide-details
                                  density="compact"
                                  color="primary"
                                  class="gate-chk flex-grow-1"
                                >
                                  <template v-slot:label>
                                    <div class="d-flex align-center">
                                      <v-chip
                                        size="x-small"
                                        :color="getDifficulty(raid.name).color"
                                        label
                                        class="me-1 text-white font-weight-black px-1"
                                        style="
                                          min-width: 40px;
                                          justify-content: center;
                                          height: 16px;
                                        "
                                      >
                                        {{
                                          getDifficulty(
                                            raid.name,
                                          ).text.startsWith("Lv")
                                            ? getDifficulty(raid.name).text
                                            : getDifficulty(raid.name).text[0]
                                        }}
                                      </v-chip>
                                      <span
                                        class="text-overline font-weight-black"
                                      >
                                        {{ gate.g }} 관문
                                        <span
                                          class="ms-1 num-style"
                                          style="
                                            font-size: 0.6rem;
                                            opacity: 0.7;
                                          "
                                          >({{
                                            (gate.gold / 1000).toFixed(1)
                                          }}k{{
                                            /싱글|1단계|2단계|3단계/.test(
                                              raid.name,
                                            )
                                              ? "귀속"
                                              : ""
                                          }})</span
                                        >
                                      </span>
                                      <v-btn
                                        icon
                                        variant="text"
                                        size="x-small"
                                        :class="[
                                          'me-1 gold-toggle-btn',
                                          {
                                            'is-active': isGoldGateSelected(
                                              char,
                                              raid.name,
                                              gate.g,
                                            ),
                                          },
                                        ]"
                                        :color="
                                          isGoldGateSelected(
                                            char,
                                            raid.name,
                                            gate.g,
                                          )
                                            ? 'amber-accent-3'
                                            : 'grey-lighten-1'
                                        "
                                        @click.stop="
                                          toggleGoldGate(char, raid, gate.g)
                                        "
                                      >
                                        <v-icon size="18">
                                          {{
                                            isGoldGateSelected(
                                              char,
                                              raid.name,
                                              gate.g,
                                            )
                                              ? "mdi-currency-usd"
                                              : "mdi-currency-usd-off"
                                          }}
                                        </v-icon>
                                        <v-tooltip
                                          activator="parent"
                                          location="top"
                                          >골드 보상 지정</v-tooltip
                                        >
                                      </v-btn>
                                    </div>
                                  </template>
                                </v-checkbox>

                                <v-btn
                                  icon
                                  variant="text"
                                  size="x-small"
                                  :color="
                                    (char.moreTasks || []).includes(
                                      raid.name + '_G' + gate.g + '_More',
                                    )
                                      ? 'indigo-accent-2'
                                      : 'grey-lighten-1'
                                  "
                                  @click.stop="
                                    toggleMoreReward(char, raid.name, gate.g)
                                  "
                                  class="ms-1"
                                >
                                  <v-icon size="18">{{
                                    (char.moreTasks || []).includes(
                                      raid.name + "_G" + gate.g + "_More",
                                    )
                                      ? "mdi-plus-box"
                                      : "mdi-plus-box-outline"
                                  }}</v-icon>
                                  <v-tooltip
                                    activator="parent"
                                    location="top"
                                    open-delay="300"
                                  >
                                    더보기 비용:
                                    {{ gate.moreGold?.toLocaleString() }}G
                                  </v-tooltip>
                                </v-btn>
                              </div>
                            </template>
                          </template>
                        </div>
                      </div>
                    </div>
                  </template>
                </v-card-text>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog
      v-model="charSettingsDialog"
      max-width="500"
      scrollable
      persistent
    >
      <v-card class="rounded-xl" v-if="targetChar">
        <v-card-title class="pa-4 font-weight-black d-flex align-center">
          <v-icon class="me-2">mdi-cog</v-icon> {{ targetChar.name }} 카드 설정
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4" style="height: 600px">
          <div class="text-subtitle-2 font-weight-bold mb-3 text-high-emphasis">
            숙제 표시 여부
          </div>
          <div class="bg-grey-lighten-4 rounded-lg pa-3 mb-4">
            <div class="text-caption font-weight-bold mb-2">일일 숙제</div>
            <div class="d-flex flex-wrap gap-2 mb-3">
              <v-btn
                v-for="task in dailyTasks"
                :key="task.id"
                variant="flat"
                size="x-small"
                :color="
                  isTaskVisibleInSettings(task.id) ? 'orange' : 'grey-darken-2'
                "
                class="text-white px-3"
                @click="toggleTaskVisibility(task.id)"
              >
                <v-icon start size="14">{{
                  isTaskVisibleInSettings(task.id) ? "mdi-eye" : "mdi-eye-off"
                }}</v-icon>
                {{ task.name }}
              </v-btn>
            </div>
            <v-divider class="mb-3"></v-divider>
            <div class="text-caption font-weight-bold mb-2">주간 숙제</div>
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                v-for="task in specialTasks"
                :key="task.id"
                variant="flat"
                size="x-small"
                :color="
                  isTaskVisibleInSettings(task.id)
                    ? 'cyan-darken-2'
                    : 'grey-darken-2'
                "
                class="text-white px-3"
                @click="toggleTaskVisibility(task.id)"
              >
                <v-icon start size="14">{{
                  isTaskVisibleInSettings(task.id) ? "mdi-eye" : "mdi-eye-off"
                }}</v-icon>
                {{ task.label }}
              </v-btn>
            </div>
          </div>

          <v-divider class="mb-4"></v-divider>
          <div class="text-subtitle-2 font-weight-bold mb-1 text-high-emphasis">
            레이드 설정 (드래그 순서 변경)
          </div>
          <v-list density="compact" class="pa-0 shadow-none bg-transparent">
            <draggable
              v-model="tempSettings.allGroups"
              handle=".drag-handle"
              item-key="toString"
            >
              <template #item="{ element: group }">
                <div
                  class="border rounded-lg mb-2 overflow-hidden shadow-sm"
                  :class="theme === 'dark' ? 'bg-grey-darken-4' : 'bg-white'"
                >
                  <v-list-item class="bg-grey-lighten-4 py-1">
                    <template v-slot:prepend>
                      <v-icon
                        class="drag-handle me-2 cursor-move"
                        color="grey-darken-2"
                        >mdi-drag-vertical</v-icon
                      >
                      <v-btn
                        icon
                        size="small"
                        variant="flat"
                        class="eye-btn shadow-sm"
                        :color="
                          tempSettings.visibleGroups.includes(group)
                            ? 'primary'
                            : 'grey-darken-3'
                        "
                        @click.stop="toggleGroupSelection(group)"
                      >
                        <v-icon size="18">{{
                          tempSettings.visibleGroups.includes(group)
                            ? "mdi-eye"
                            : "mdi-eye-off"
                        }}</v-icon>
                      </v-btn>
                    </template>
                    <v-list-item-title
                      class="font-weight-black ms-2 cursor-pointer"
                      @click="toggleExpand(group)"
                      >{{ group }}</v-list-item-title
                    >
                    <template v-slot:append>
                      <v-icon @click="toggleExpand(group)">{{
                        expandedGroup === group
                          ? "mdi-chevron-up"
                          : "mdi-chevron-down"
                      }}</v-icon>
                    </template>
                  </v-list-item>
                  <v-expand-transition>
                    <div
                      v-show="expandedGroup === group"
                      class="pa-3 bg-white border-t"
                    >
                      <div
                        v-for="raid in getRaidsByGroup(group)"
                        :key="raid.name"
                        class="mb-4 last-mb-0"
                      >
                        <div class="d-flex align-center mb-2">
                          <v-chip
                            size="x-small"
                            :color="getDifficulty(raid.name).color"
                            label
                            class="me-2 text-white font-weight-black"
                            >{{ getDifficulty(raid.name).text }}</v-chip
                          >
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                          <v-btn
                            v-for="gate in raid.gates"
                            :key="gate.g"
                            variant="flat"
                            size="x-small"
                            class="font-weight-black px-3 eye-gate-btn"
                            :color="
                              (tempSettings.selectedGateIds || []).includes(
                                raid.name + '_G' + gate.g,
                              )
                                ? 'primary'
                                : 'grey-darken-2'
                            "
                            @click="toggleGateVisibility(raid.name, gate.g)"
                          >
                            <v-icon start size="14">{{
                              (tempSettings.selectedGateIds || []).includes(
                                raid.name + "_G" + gate.g,
                              )
                                ? "mdi-eye"
                                : "mdi-eye-off"
                            }}</v-icon>
                            {{ gate.g }}관 ({{
                              (gate.gold / 1000).toFixed(1)
                            }}k{{
                              /싱글|1단계|2단계|3단계/.test(raid.name)
                                ? "귀속"
                                : ""
                            }})
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
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="px-6"
            @click="saveCharSettings"
            >저장하기</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="scheduleDialog" max-width="450">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="font-weight-black d-flex align-center">
          <v-icon color="primary" class="me-2">mdi-calendar-multiselect</v-icon
          >{{ activeCharName }}의 참여 일정
        </v-card-title>
        <v-card-text class="pa-4">
          <v-list v-if="activeSchedules.length > 0">
            <v-list-item
              v-for="item in activeSchedules"
              :key="item.id"
              border
              class="rounded-lg mb-3 pa-3"
            >
              <div
                class="d-flex align-center justify-space-between mb-2 flex-wrap"
                style="gap: 8px"
              >
                <div class="d-flex align-center" style="gap: 6px">
                  <v-chip
                    :color="item.isHomework ? 'success' : 'error'"
                    size="x-small"
                    label
                    class="font-weight-black text-white px-2"
                  >
                    {{ item.isHomework ? "숙제" : "버스" }}
                  </v-chip>

                  <v-chip
                    size="x-small"
                    :color="getDifficulty(item.difficulty).color"
                    label
                    class="text-white font-weight-black px-2"
                  >
                    {{ getDifficulty(item.difficulty).text }}
                  </v-chip>

                  <span class="text-subtitle-1 font-weight-black">{{
                    item.raid
                  }}</span>
                </div>

                <div class="d-flex align-center">
                  <v-chip
                    v-if="isToday(item.dateTime)"
                    color="error"
                    size="x-small"
                    variant="flat"
                    class="font-weight-black text-white me-2 px-2"
                  >
                    오늘
                  </v-chip>

                  <span
                    class="text-caption font-weight-bold"
                    :class="
                      isToday(item.dateTime) ? 'text-error' : 'text-primary'
                    "
                  >
                    {{ formatScheduleTime(item.dateTime) }}
                  </span>
                </div>
              </div>

              <div
                class="text-caption text-medium-emphasis d-flex align-center mt-1"
              >
                <v-icon size="16" class="me-1"
                  >mdi-account-group-outline</v-icon
                >
                <span class="font-weight-bold">
                  멤버: {{ (item.members || []).map((p) => p.name).join(", ") }}
                </span>
              </div>
            </v-list-item>
          </v-list>
          <div v-else class="text-center py-6 text-grey">
            참여 중인 일정이 없습니다.
          </div>
        </v-card-text>
        <v-card-actions
          ><v-spacer></v-spacer
          ><v-btn
            variant="text"
            @click="scheduleDialog = false"
            class="font-weight-bold"
            >닫기</v-btn
          ></v-card-actions
        >
      </v-card>
    </v-dialog>
    <v-dialog v-model="busDialog" max-width="350">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="font-weight-black d-flex align-center px-0">
          <v-icon color="light-blue-accent-3" class="me-2"
            >mdi-bus-clock</v-icon
          >
          버스 수입/지출 설정
        </v-card-title>

        <v-card-text class="pa-0 mt-4">
          <div class="d-flex justify-center mb-6">
            <v-btn-toggle
              v-model="busForm.isDriver"
              mandatory
              color="light-blue-accent-4"
              variant="flat"
              rounded="lg"
            >
              <v-btn :value="true" class="px-6">기사 (수입)</v-btn>
              <v-btn :value="false" class="px-6">승객 (지출)</v-btn>
            </v-btn-toggle>
          </div>

          <v-text-field
            v-model.number="busForm.gold"
            :label="busForm.isDriver ? '수입 골드' : '지출 골드'"
            suffix="G"
            variant="outlined"
            type="number"
            hide-details
            class="font-weight-bold"
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="px-0 mt-6">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="busDialog = false">취소</v-btn>
          <v-btn
            color="light-blue-accent-4"
            variant="flat"
            rounded="lg"
            @click="saveBusSetting"
            >설정 완료</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="fixedPartyModal" max-width="900" scrollable>
      <v-card class="rounded-xl pa-4">
        <v-card-title
          class="text-h5 font-weight-black d-flex align-center pb-4"
        >
          <v-icon color="amber-darken-3" class="me-2">mdi-shield-check</v-icon>
          내 원정대 고정 공격대
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="fixedPartyModal = false"
          ></v-btn>
        </v-card-title>

        <v-card-text class="pa-2">
          <v-row v-if="myFixedParties.length > 0">
            <v-col v-for="party in myFixedParties" :key="party.id" cols="12">
              <v-card
                border
                variant="flat"
                class="rounded-xl pa-5 mb-4 bg-grey-lighten-5 position-relative bus-card"
                :class="{ 'cleared-card': party.isCleared }"
                style="transition: none !important"
              >
                <div v-if="party.isCleared" class="cleared-overlay">
                  <div class="cleared-text">CLEAR</div>
                </div>

                <div
                  class="d-flex justify-space-between align-start mb-6"
                  style="position: relative; z-index: 2"
                >
                  <div>
                    <div class="d-flex align-center flex-wrap gap-2 mb-2">
                      <v-chip
                        size="small"
                        :color="party.isHomework ? 'success' : 'error'"
                        variant="flat"
                        label
                        class="font-weight-black"
                      >
                        {{ party.isHomework ? "숙제" : "버스" }}
                      </v-chip>
                      <v-chip
                        size="small"
                        color="orange-darken-1"
                        label
                        class="font-weight-black text-white"
                      >
                        {{ party.difficulty }}
                      </v-chip>
                      <v-chip
                        size="small"
                        color="primary"
                        label
                        class="font-weight-black"
                      >
                        {{ party.raid }} | {{ party.title }}
                      </v-chip>
                    </div>

                    <div
                      class="text-h6 font-weight-black d-flex align-center pb-4"
                      :class="
                        party.isCleared
                          ? 'text-grey opacity-60'
                          : 'text-high-emphasis'
                      "
                    >
                      <v-icon
                        class="me-2"
                        size="small"
                        :color="party.isCleared ? 'grey' : 'primary'"
                      >
                        mdi-clock-outline
                      </v-icon>
                      {{ formatDateTime(party.departureTime) }}
                    </div>
                  </div>

                  <v-btn
                    :color="party.isCleared ? 'success' : 'primary'"
                    :variant="party.isCleared ? 'flat' : 'tonal'"
                    size="large"
                    rounded="lg"
                    class="font-weight-black px-6"
                    style="z-index: 10"
                    @click.stop="togglePartyClear(party)"
                  >
                    <v-icon start>
                      {{ party.isCleared ? "mdi-refresh" : "mdi-check-bold" }}
                    </v-icon>
                    {{ party.isCleared ? "" : "CLEAR" }}
                  </v-btn>
                </div>

                <div
                  class="d-flex flex-wrap gap-3 mt-2"
                  style="overflow: hidden; position: relative; z-index: 2"
                >
                  <v-card
                    v-for="(member, idx) in party.members"
                    :key="idx"
                    variant="flat"
                    border
                    class="d-flex align-center pa-2 rounded-lg"
                    style="
                      width: 220px;
                      height: 60px;
                      flex: 0 0 220px;
                      overflow: hidden;
                      transition: none !important;
                    "
                  >
                    <v-avatar size="36" class="me-2 border-sm flex-shrink-0">
                      <v-img :src="member.img" cover></v-img>
                    </v-avatar>

                    <div
                      class="flex-grow-1 d-flex flex-column justify-center overflow-hidden"
                      style="height: 40px"
                    >
                      <div
                        class="text-caption font-weight-black fixed-card-text"
                      >
                        {{ member.name }}
                      </div>

                      <div
                        class="text-overline opacity-60 text-truncate"
                        :class="
                          theme === 'dark'
                            ? 'text-grey-lighten-1'
                            : 'text-grey-darken-1'
                        "
                        style="
                          font-size: 0.6rem !important;
                          line-height: 1;
                          height: 0.8rem;
                        "
                      >
                        {{ member.job }}
                      </div>
                    </div>

                    <v-icon
                      v-if="myCharNames.includes(member.name)"
                      color="amber-darken-3"
                      size="small"
                      class="ms-1 flex-shrink-0"
                    >
                      mdi-star
                    </v-icon>
                  </v-card>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <div v-else class="text-center py-12">
            <v-icon size="80" color="grey-lighten-2"
              >mdi-shield-off-outline</v-icon
            >
            <div class="text-h6 mt-4 text-grey-lighten-1 font-weight-bold">
              참여 중인 고정 공격대가 없습니다.
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="extremeModal" max-width="450" persistent>
      <v-card class="rounded-xl overflow-hidden shadow-24" border="sm">
        <v-img
          height="220"
          src="/extreme_img.png"
          cover
          class="align-end text-white"
        >
          <v-card-title
            class="font-weight-black pb-4"
            style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8)"
          >
          </v-card-title>
        </v-img>

        <v-card-text class="pa-6">
          <div class="d-flex align-center mb-4">
            <v-avatar size="48" color="orange-darken-4" class="me-3 shadow-lg">
              <v-icon color="white">mdi-sword-cross</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-black">
                {{ currentExtremeEvent?.name }}
              </div>
              <div class="text-caption text-orange-darken-2 font-weight-bold">
                원정대 통합 주간 1회 보상
              </div>
            </div>
          </div>

          <v-sheet color="grey-lighten-4" class="pa-4 rounded-lg border mb-4">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-body-2">입장 가능 난이도</span>
              <v-chip
                color="orange-darken-4"
                size="small"
                variant="flat"
                class="font-weight-black"
              >
                {{ recommendedDifficulty?.name }}
              </v-chip>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2">클리어 골드 보상</span>
              <span class="text-h6 font-weight-black text-orange-darken-3">
                {{ recommendedDifficulty?.gold.toLocaleString() }} G
              </span>
            </div>
          </v-sheet>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn
            variant="text"
            color="grey-darken-1"
            size="small"
            @click="hideExtremeModalForWeek"
          >
            이번 주 안 보기
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn variant="text" color="grey" @click="extremeModal = false"
            >닫기</v-btn
          >

          <v-btn
            color="orange-darken-4"
            variant="elevated"
            class="px-6 font-weight-black"
            @click="handleExtremeClear"
          >
            클리어 완료
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import draggable from "vuedraggable";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  setDoc,
  getDoc,
  serverTimestamp,
  doc,
  query, // <--- 추가
  orderBy, // <--- 추가 (이미 있다면 패스)
  where,
  updateDoc,
  getDocs,
} from "firebase/firestore";

import { inject } from "vue";

import { useDisplay } from "vuetify";

const { mobile } = useDisplay();
const isMobileMode = computed(() => mobile.value);

const topVillains = inject("topVillains", []);
const topRosterMembers = inject("topRosterMembers", ref([]));
const topRosterCount = inject("topRosterCount", ref(0)); // [추가]

const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";
const characters = ref([]);
const isFetching = ref(false);
const theme = ref(localStorage.getItem("theme") || "light");

const charSettingsDialog = ref(false);
const targetChar = ref(null);
const expandedGroup = ref(null);
const tempSettings = ref({
  showDaily: true,
  showSpecial: true,
  showWeekly: true,
  visibleGroups: [],
  selectedGateIds: [],
  allGroups: [],
  hiddenTaskIds: [],
});

const allSchedules = ref([]);
const scheduleDialog = ref(false);
const activeCharName = ref("");
const activeSchedules = ref([]);

// 1. 상세 난이도 및 보상 정보 정의
const EXTREME_DIFFICULTIES = [
  { id: "nightmare", name: "나이트메어", level: 1770, gold: 45000 },
  { id: "hard", name: "하드", level: 1750, gold: 45000 },
  { id: "normal", name: "노멀", level: 1720, gold: 20000 },
];

const EXTREME_EVENTS = [
  {
    id: "extreme_aegir",
    name: "1막: 에기르 [Extreme]",
    startDate: "2026-04-22T06:00:00",
    endDate: "2026-05-20T06:00:00",
    color: "#FFD700",
  },
  {
    id: "extreme_brel",
    name: "2막: 아브렐슈드 [Extreme]",
    startDate: "2026-05-20T06:00:00",
    endDate: "2026-06-17T06:00:00",
    color: "#7B1FA2",
  },
];

// [수정] 1. 테스트 날짜를 상수로 고정하여 리렌더링 시 오차 방지
const TEST_NOW = new Date();

const currentExtremeEvent = computed(() => {
  return EXTREME_EVENTS.find((event) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return TEST_NOW >= start && TEST_NOW < end;
  });
});

// [수정] 데이터가 출렁여도 마지막 값을 꽉 잡고 있는 변수
const stableMaxLevel = ref(0);

const recommendedDifficulty = computed(() => {
  const mainName = localStorage.getItem("current_main_name");
  if (!mainName) return null;

  // 1. 우선순위: 로컬 스토리지를 "기준점"으로 삼습니다. (메모리는 계속 변하기 때문)
  const storageKey = `hw_chars_${mainName}`;
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");

  // 2. 로컬 데이터가 있다면 거기서 먼저 레벨을 뽑습니다.
  if (saved.length > 0) {
    const levels = saved.map(
      (c) => parseFloat(String(c.level || "0").replace(/,/g, "")) || 0,
    );
    const maxL = Math.max(...levels);
    if (maxL >= 1720) stableMaxLevel.value = maxL;
  }

  // 3. 만약 메모리(characters.value)에 데이터가 "완성"된 상태라면 그것으로 업데이트합니다.
  if (characters.value && characters.value.length > 0 && !isFetching.value) {
    const memLevels = characters.value.map(
      (c) => parseFloat(String(c.level || "0").replace(/,/g, "")) || 0,
    );
    const memMax = Math.max(...memLevels);
    if (memMax >= 1720) stableMaxLevel.value = memMax;
  }

  // 4. 최종 결정
  if (stableMaxLevel.value < 1720) return null;
  return (
    EXTREME_DIFFICULTIES.find((diff) => stableMaxLevel.value >= diff.level) ||
    null
  );
});

console.log("currentExtremeEvent", currentExtremeEvent);
console.log("recommendedDifficulty", recommendedDifficulty);

// 1. 팝업 노출 여부 제어 변수
const extremeModal = ref(false);

// 2. '이번 주 안 보기' 키 생성
const getExtremeHideKey = () => {
  const weekId = getExtremeClearKey().replace("extreme_clear_", "");
  return `extreme_hide_${weekId}`;
};

// 3. 팝업을 띄울지 말지 결정하는 로직
const checkExtremeModal = () => {
  // 이미 클리어했거나, '이번 주 안 보기'를 눌렀다면 띄우지 않음
  const isHide = localStorage.getItem(getExtremeHideKey()) === "true";

  if (currentExtremeEvent.value && recommendedDifficulty.value) {
    if (!isExtremeCleared.value && !isHide) {
      extremeModal.value = true;
    }
  }
};

// 4. '이번 주 안 보기' 처리
const hideExtremeModalForWeek = () => {
  localStorage.setItem(getExtremeHideKey(), "true");
  extremeModal.value = false;
};

const handleExtremeClear = () => {
  // 클리어 상태를 true로 변경하고 로컬 스토리지에 저장
  isExtremeCleared.value = true;
  localStorage.setItem(getExtremeClearKey(), "true");

  // 팝업 닫기
  extremeModal.value = false;
};

// 4. 클리어 키 생성 (기존과 동일)
const getExtremeClearKey = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = day >= 3 && now.getHours() >= 6 ? day - 3 : day + 4;
  const lastWed = new Date(now);
  lastWed.setDate(now.getDate() - diff);
  return `extreme_clear_${lastWed.toISOString().split("T")[0]}`;
};

// 클리어 여부 관리
const isExtremeCleared = ref(
  localStorage.getItem(getExtremeClearKey()) === "true",
);

const toggleExtremeClear = () => {
  isExtremeCleared.value = !isExtremeCleared.value;
  localStorage.setItem(getExtremeClearKey(), isExtremeCleared.value);
};

const checkAndResetWeekly = async (parties) => {
  const now = new Date();
  const lastWednesday = new Date();
  const day = lastWednesday.getDay();
  const diff =
    day < 3 || (day === 3 && lastWednesday.getHours() < 6) ? day + 4 : day - 3;
  lastWednesday.setDate(lastWednesday.getDate() - diff);
  lastWednesday.setHours(6, 0, 0, 0);

  for (const party of parties) {
    // 1. lastUpdated가 없는 신규 데이터는 패스
    if (!party.lastUpdated) continue;

    // 2. Firestore Timestamp를 Date 객체로 안전하게 변환
    const lastUpdateDate = party.lastUpdated?.toDate
      ? party.lastUpdated.toDate()
      : new Date(party.lastUpdated);

    // 3. 조건: 마지막 업데이트가 수요일 06시 이전인데, 아직 데이터가 남아있는 경우만!
    if (
      lastUpdateDate < lastWednesday &&
      (party.departureTime !== "일정미정" || party.isCleared === true)
    ) {
      console.log(`[초기화 실행] ${party.raid}`);
      try {
        const partyRef = doc(db, "fixed_parties", party.id);
        await updateDoc(partyRef, {
          departureTime: "일정미정",
          isCleared: false,
          // 여기서 lastUpdated를 수요일 06시 1초 후로 설정해서 중복 초기화 방지
          lastUpdated: lastWednesday.getTime() + 1000,
        });
      } catch (e) {
        console.error("초기화 오류:", e);
      }
    }
  }
};

const togglePartyClear = async (party) => {
  try {
    const newStatus = !party.isCleared; // 바뀔 상태 (true/false)
    const partyRef = doc(db, "fixed_parties", party.id);

    // 1. DB 업데이트 (Firestore)
    await updateDoc(partyRef, {
      isCleared: newStatus,
      lastUpdated: serverTimestamp(),
    });

    // 2. 로컬 스토리지 데이터 동기화
    const mainCharName = localStorage.getItem("current_main_name");
    if (mainCharName) {
      const storageKey = `hw_chars_${mainCharName}`;
      // 로컬 스토리지에서 데이터 가져오기
      let localData = JSON.parse(localStorage.getItem(storageKey) || "[]");

      const raidName = party.raid; // 고정 공대 레이드명 (예: "지평", "종막")

      // 파티 멤버 중 내 원정대에 포함된 캐릭터들만 찾아서 숙제 체크/해제
      party.members.forEach((member) => {
        const targetChar = localData.find((c) => c.name === member.name);

        if (
          targetChar &&
          targetChar.settings &&
          targetChar.settings.selectedGateIds
        ) {
          // 해당 레이드 키워드가 포함된 관문 ID들 필터링
          const targetGates = targetChar.settings.selectedGateIds.filter((id) =>
            id.includes(raidName),
          );

          targetGates.forEach((gateId) => {
            if (newStatus) {
              // [클리어] completedTasks에 ID 추가
              if (!targetChar.completedTasks.includes(gateId)) {
                targetChar.completedTasks.push(gateId);
              }
            } else {
              // [초기화] completedTasks에서 ID 제거
              targetChar.completedTasks = targetChar.completedTasks.filter(
                (id) => id !== gateId,
              );
            }
          });
        }
      });

      // 3. 수정된 데이터를 로컬 스토리지에 다시 저장
      localStorage.setItem(storageKey, JSON.stringify(localData));

      // 4. 🔥 현재 화면의 캐릭터 리스트 변수 즉시 갱신 (반응형 반영)
      // 변수명이 'characters'인지 'myExpedition'인지 확인 후 교체하세요!
      if (typeof characters !== "undefined") {
        characters.value = [...localData];
      }

      console.log(
        `[동기화 완료] ${raidName} 레이드 상태가 로컬 숙제 데이터에 반영되었습니다.`,
      );
    }
  } catch (e) {
    console.error("클리어 상태 업데이트 실패:", e);
    alert("업데이트 중 오류가 발생했습니다.");
  }
};

const dailyTasks = [
  { id: "chaos", name: "카오스 던전" },
  { id: "guardian", name: "가디언 토벌" },
];

const specialTasks = [
  { id: "sky", label: "천상" },
  { id: "show", label: "증명" },
  { id: "hell", label: "지옥" },
  { id: "hall", label: "할" },
  { id: "hyulsuk", label: "혈석" },
  { id: "singlecoin", label: "싱코" },
];

const isToday = (dateInput) => {
  if (!dateInput) return false;

  const date = new Date(dateInput);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const raidList = [
  {
    group: "지평의 성당",
    name: "어비스: 지평의 성당(3단계)",
    level: 1750,
    gold: 50000,
    gates: [
      { g: 1, gold: 20000, moreGold: 6400 },
      { g: 2, gold: 30000, moreGold: 9600 },
    ],
  },
  {
    group: "지평의 성당",
    name: "어비스: 지평의 성당(2단계)",
    level: 1720,
    gold: 40000,
    gates: [
      { g: 1, gold: 16000, moreGold: 5120 },
      { g: 2, gold: 24000, moreGold: 7680 },
    ],
  },
  {
    group: "지평의 성당",
    name: "어비스: 지평의 성당(1단계)",
    level: 1700,
    gold: 30000,
    gates: [
      { g: 1, gold: 13500, moreGold: 4320 },
      { g: 2, gold: 16500, moreGold: 5280 },
    ],
  },
  {
    group: "세르카",
    name: "그림자: 세르카(나이트메어)",
    level: 1740,
    gold: 54000,
    gates: [
      { g: 1, gold: 21000, moreGold: 6720 },
      { g: 2, gold: 33000, moreGold: 10560 },
    ],
  },
  {
    group: "세르카",
    name: "그림자: 세르카(하드)",
    level: 1730,
    gold: 44000,
    gates: [
      { g: 1, gold: 17500, moreGold: 5600 },
      { g: 2, gold: 26500, moreGold: 8480 },
    ],
  },
  {
    group: "세르카",
    name: "그림자: 세르카(노말)",
    level: 1710,
    gold: 35000,
    gates: [
      { g: 1, gold: 14000, moreGold: 4480 },
      { g: 2, gold: 21000, moreGold: 6720 },
    ],
  },
  {
    group: "종막",
    name: "종막: 카제로스(하드)",
    level: 1730,
    gold: 52000,
    gates: [
      { g: 1, gold: 17000, moreGold: 5440 },
      { g: 2, gold: 35000, moreGold: 11200 },
    ],
  },
  {
    group: "종막",
    name: "종막: 카제로스(노말)",
    level: 1710,
    gold: 40000,
    gates: [
      { g: 1, gold: 14000, moreGold: 4480 },
      { g: 2, gold: 26000, moreGold: 8320 },
    ],
  },
  {
    group: "4막",
    name: "4막: 아르모체(하드)",
    level: 1720,
    gold: 42000,
    gates: [
      { g: 1, gold: 15000, moreGold: 4800 },
      { g: 2, gold: 27000, moreGold: 8640 },
    ],
  },
  {
    group: "4막",
    name: "4막: 아르모체(노말)",
    level: 1700,
    gold: 33000,
    gates: [
      { g: 1, gold: 12500, moreGold: 4000 },
      { g: 2, gold: 20500, moreGold: 6560 },
    ],
  },
  {
    group: "3막",
    name: "3막: 모르둠(하드)",
    level: 1700,
    gold: 27000,
    gates: [
      { g: 1, gold: 5000, moreGold: 1650 },
      { g: 2, gold: 8000, moreGold: 2640 },
      { g: 3, gold: 14000, moreGold: 4060 },
    ],
  },
  {
    group: "3막",
    name: "3막: 모르둠(노말)",
    level: 1680,
    gold: 21000,
    gates: [
      { g: 1, gold: 4000, moreGold: 1300 },
      { g: 2, gold: 7000, moreGold: 2350 },
      { g: 3, gold: 10000, moreGold: 3360 },
    ],
  },
  {
    group: "3막",
    name: "3막: 모르둠(싱글)",
    level: 1680,
    gold: 21000,
    gates: [
      { g: 1, gold: 4000, moreGold: 1300 },
      { g: 2, gold: 7000, moreGold: 2350 },
      { g: 3, gold: 10000, moreGold: 3360 },
    ],
  },

  {
    group: "2막",
    name: "2막: 아브렐슈드(하드)",
    level: 1690,
    gold: 23000,
    gates: [
      { g: 1, gold: 7500, moreGold: 2400 },
      { g: 2, gold: 15500, moreGold: 5100 },
    ],
  },
  {
    group: "2막",
    name: "2막: 아브렐슈드(노말)",
    level: 1670,
    gold: 16500,
    gates: [
      { g: 1, gold: 5500, moreGold: 1820 },
      { g: 2, gold: 11000, moreGold: 3720 },
    ],
  },
  {
    group: "2막",
    name: "2막: 아브렐슈드(싱글)",
    level: 1670,
    gold: 16500,
    gates: [
      { g: 1, gold: 5500, moreGold: 1820 },
      { g: 2, gold: 11000, moreGold: 3720 },
    ],
  },
  {
    group: "1막",
    name: "1막: 에기르(하드)",
    level: 1680,
    gold: 18000,
    gates: [
      { g: 1, gold: 5500, moreGold: 1820 },
      { g: 2, gold: 12500, moreGold: 4150 },
    ],
  },
  {
    group: "1막",
    name: "1막: 에기르(노말)",
    level: 1660,
    gold: 11500,
    gates: [
      { g: 1, gold: 3500, moreGold: 750 },
      { g: 2, gold: 8000, moreGold: 1780 },
    ],
  },
  {
    group: "1막",
    name: "1막: 에기르(싱글)",
    level: 1660,
    gold: 11500,
    gates: [
      { g: 1, gold: 3500, moreGold: 750 },
      { g: 2, gold: 8000, moreGold: 1780 },
    ],
  },
  {
    group: "서막",
    name: "서막: 에키드나(하드)",
    level: 1640,
    gold: 7200,
    gates: [
      { g: 1, gold: 2200, moreGold: 720 },
      { g: 2, gold: 5000, moreGold: 1630 },
    ],
  },
  {
    group: "서막",
    name: "서막: 에키드나(노말)",
    level: 1620,
    gold: 6100,
    gates: [
      { g: 1, gold: 1900, moreGold: 310 },
      { g: 2, gold: 4200, moreGold: 700 },
    ],
  },
  {
    group: "서막",
    name: "서막: 에키드나(싱글)",
    level: 1620,
    gold: 6100,
    gates: [
      { g: 1, gold: 1900, moreGold: 310 },
      { g: 2, gold: 4200, moreGold: 700 },
    ],
  },
  {
    group: "에픽",
    name: "에픽: 베히모스(노말)",
    level: 1640,
    gold: 3600,
    gates: [
      { g: 1, gold: 1100, moreGold: 720 },
      { g: 2, gold: 2500, moreGold: 1630 },
    ],
  },
];

const raidGroups = computed(() => [...new Set(raidList.map((r) => r.group))]);
const getRaidsByGroup = (groupName) =>
  raidList.filter((r) => r.group === groupName);

const isTaskVisible = (char, taskId) =>
  !char.settings?.hiddenTaskIds?.includes(taskId);
const isTaskVisibleInSettings = (taskId) =>
  !tempSettings.value.hiddenTaskIds?.includes(taskId);
const toggleTaskVisibility = (taskId) => {
  if (!tempSettings.value.hiddenTaskIds) tempSettings.value.hiddenTaskIds = [];
  const idx = tempSettings.value.hiddenTaskIds.indexOf(taskId);
  if (idx > -1) tempSettings.value.hiddenTaskIds.splice(idx, 1);
  else tempSettings.value.hiddenTaskIds.push(taskId);
};
const hasVisibleDaily = (char) =>
  dailyTasks.some((t) => isTaskVisible(char, t.id));
const hasVisibleSpecial = (char) =>
  specialTasks.some((t) => isTaskVisible(char, t.id));

const isGateDisabled = (char, raid, gate) => {
  if (!char.completedTasks) return false;
  const currentId = raid.name + "_G" + gate.g;
  if (char.completedTasks.includes(currentId)) return false;
  return raidList.some(
    (otherRaid) =>
      otherRaid.group === raid.group &&
      otherRaid.name !== raid.name &&
      char.completedTasks.includes(otherRaid.name + "_G" + gate.g),
  );
};

const toggleGate = (char, raid, gate) => {
  const taskId = raid.name + "_G" + gate.g;

  // 1. 체크박스를 해제하는 경우
  if (!char.completedTasks.includes(taskId)) {
    // 🔥 [추가] 만약 1관문을 해제했다면, 해당 레이드의 모든 관문을 해제합니다.
    if (gate.g === 1) {
      raid.gates.forEach((g) => {
        const targetId = raid.name + "_G" + g.g;
        char.completedTasks = char.completedTasks.filter(
          (id) => id !== targetId,
        );
      });
    }
    // (선택 사항) 마지막 관문 체크 해제 시 전체 해제하고 싶다면 기존 로직 유지
    const isLastGate = gate.g === raid.gates[raid.gates.length - 1].g;
    if (isLastGate) {
      raid.gates.forEach((g) => {
        const targetId = raid.name + "_G" + g.g;
        char.completedTasks = char.completedTasks.filter(
          (id) => id !== targetId,
        );
      });
    }
  }
  // 2. 체크박스를 체크하는 경우
  else {
    // [기존 로직] 마지막 관문을 체크하면 이전 모든 관문 자동 체크
    const isLastGate = gate.g === raid.gates[raid.gates.length - 1].g;
    if (isLastGate) {
      raid.gates.forEach((g) => {
        const targetId = raid.name + "_G" + g.g;
        if (!char.completedTasks.includes(targetId)) {
          char.completedTasks.push(targetId);
        }
      });
    }

    // [기존 유지] 같은 그룹 내의 다른 난이도 관문들 해제 (예: 하드1관 체크 시 노말1관 제거)
    raidList
      .filter((r) => r.group === raid.group && r.name !== raid.name)
      .forEach((otherRaid) => {
        const otherGateId = otherRaid.name + "_G" + gate.g;
        char.completedTasks = char.completedTasks.filter(
          (id) => id !== otherGateId,
        );
      });
  }

  saveToLocal();
};

// [추가] 고정 공격대 관련 상태 변수
const fixedParties = ref([]); // 전체 고정 공격대 리스트
const fixedPartyModal = ref(false); // 모달 제어

// [추가] 내 원정대 캐릭터 이름 리스트 (필터링용)
const myCharNames = computed(() => characters.value.map((c) => c.name));

const myFixedParties = computed(() => {
  if (fixedParties.value.length === 0) return [];

  // 내 원정대 캐릭터 중 하나라도 포함되어 있는지 검사
  return fixedParties.value.filter((party) => {
    return party.members?.some((m) => myCharNames.value.includes(m.name));
  });
});

let isFirstLoad = true;

const fetchFixedParties = () => {
  const q = query(collection(db, "fixed_parties"), orderBy("raid", "desc"));

  onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 🔥 핵심: 데이터를 처음 불러올 때만 초기화 로직 실행 (버튼 클릭 시엔 실행 안 함)
    if (isFirstLoad && data.length > 0) {
      checkAndResetWeekly(data);
      isFirstLoad = false;
    }

    fixedParties.value = data;
  });
};

const toggleMoreReward = (char, raidName, gateG) => {
  if (!char.moreTasks) char.moreTasks = [];
  const taskId = raidName + "_G" + gateG + "_More";

  const idx = char.moreTasks.indexOf(taskId);
  if (idx > -1) {
    char.moreTasks.splice(idx, 1);
  } else {
    char.moreTasks.push(taskId);
  }
  saveToLocal(); // 여기서 반응형 시스템에 의해 상단 UI가 자동 업데이트됩니다.
};

const getMaxPossibleGold = () => {
  return characters.value
    .filter((c) => c.isGoldCharacter)
    .reduce((sum, char) => sum + getCharMaxPossibleGold(char), 0);
};

const isGoldExcluded = (char, groupName) => {
  let raidGoldList = [];
  (char.settings?.visibleGroups || []).forEach((gName) => {
    let goldSum = 0;
    getRaidsByGroup(gName).forEach((r) => {
      r.gates.forEach((gate) => {
        if ((char.completedTasks || []).includes(r.name + "_G" + gate.g))
          goldSum += gate.gold;
      });
    });
    if (goldSum > 0) raidGoldList.push({ name: gName, gold: goldSum });
  });
  const targets = raidGoldList.sort((a, b) => b.gold - a.gold).slice(0, 3);
  return !targets.some((r) => r.name === groupName);
};

const getDifficulty = (difficultyText) => {
  const diff = difficultyText || "노말";
  if (diff.includes("나이트메어"))
    return { text: "나메", color: "purple-darken-1" };
  if (diff.includes("3단계")) return { text: "Lv 3", color: "purple-darken-1" };
  if (diff.includes("하드")) return { text: "하드", color: "orange-darken-1" };
  if (diff.includes("2단계")) return { text: "Lv 2", color: "orange-darken-1" };
  if (diff.includes("The First"))
    return { text: "퍼스트", color: "red-darken-4" };
  if (diff.includes("싱글"))
    return { text: "싱글", color: "light-blue-darken-1" };
  if (diff.includes("1단계")) return { text: "Lv 1", color: "green-darken-1" };
  return { text: "노말", color: "green-darken-1" };
};

const getSegmentClass = (char, taskId, index) => {
  const score = char.restGauges?.[taskId] || 0;
  return score >= index * 20
    ? "full-active"
    : score >= index * 20 - 10
      ? "half-active"
      : "";
};
const getFillStyle = (char, taskId, index) => {
  const score = char.restGauges?.[taskId] || 0;
  return {
    width:
      score >= index * 20 ? "100%" : score >= index * 20 - 10 ? "50%" : "0%",
  };
};
const validateAndSaveRest = (char) => {
  dailyTasks.forEach((task) => {
    let v = char.restGauges[task.id];
    char.restGauges[task.id] = Math.max(
      0,
      Math.min(200, Math.round(v / 10) * 10),
    );
  });
  saveToLocal();
};

const toggleExpand = (group) => {
  expandedGroup.value = expandedGroup.value === group ? null : group;
};

const toggleGroupSelection = (group) => {
  const idx = tempSettings.value.visibleGroups.indexOf(group);

  if (idx > -1) {
    // 1. [그룹 숨기기 처리]
    tempSettings.value.visibleGroups.splice(idx, 1);

    // 🔥 [핵심 추가] 해당 그룹에 속한 모든 레이드와 관문 ID를 가져옴
    const raidsInGroup = getRaidsByGroup(group);
    const allGateIdsInGroup = [];

    raidsInGroup.forEach((raid) => {
      raid.gates.forEach((gate) => {
        allGateIdsInGroup.push(`${raid.name}_G${gate.g}`);
      });
    });

    // 2. 설정창 임시 데이터(tempSettings)에서 골드 선택 해제
    if (tempSettings.value.goldSelectedGates) {
      tempSettings.value.goldSelectedGates =
        tempSettings.value.goldSelectedGates.filter(
          (gid) => !allGateIdsInGroup.includes(gid),
        );
    }

    // 3. 가시성 선택 리스트(selectedGateIds)에서도 제거 (관문 눈 아이콘들도 꺼지게 함)
    if (tempSettings.value.selectedGateIds) {
      tempSettings.value.selectedGateIds =
        tempSettings.value.selectedGateIds.filter(
          (gid) => !allGateIdsInGroup.includes(gid),
        );
    }

    // 4. 실제 캐릭터 데이터의 더보기 및 완료 내역 즉시 정리
    if (targetChar.value) {
      // 더보기 해제
      if (targetChar.value.moreTasks) {
        targetChar.value.moreTasks = targetChar.value.moreTasks.filter(
          (mid) => !allGateIdsInGroup.some((gid) => mid === gid + "_More"),
        );
      }
      // 숙제 완료 체크 해제
      if (targetChar.value.completedTasks) {
        targetChar.value.completedTasks =
          targetChar.value.completedTasks.filter(
            (cid) => !allGateIdsInGroup.includes(cid),
          );
      }
    }
  } else {
    // 5. [그룹 보이기 처리]
    tempSettings.value.visibleGroups.push(group);
  }
};

const toggleGateVisibility = (raidName, gateNum) => {
  const id = raidName + "_G" + gateNum;
  if (!tempSettings.value.selectedGateIds)
    tempSettings.value.selectedGateIds = [];

  const idx = tempSettings.value.selectedGateIds.indexOf(id);

  if (idx > -1) {
    // 1. [숨기기 처리] 관문 가시성 제거
    tempSettings.value.selectedGateIds.splice(idx, 1);

    // 🔥 [핵심 수정] 설정창 임시 데이터(tempSettings) 내의 골드 선택 리스트에서도 즉시 제거
    if (tempSettings.value.goldSelectedGates) {
      tempSettings.value.goldSelectedGates =
        tempSettings.value.goldSelectedGates.filter((gid) => gid !== id);
    }

    // 2. 실제 캐릭터 데이터의 더보기 및 완료 내역도 즉시 정리 (이건 즉시 반영됨)
    if (targetChar.value) {
      // 더보기 해제
      if (targetChar.value.moreTasks) {
        const moreTaskId = id + "_More";
        targetChar.value.moreTasks = targetChar.value.moreTasks.filter(
          (mid) => mid !== moreTaskId,
        );
      }
      // 숙제 완료 체크 해제
      if (targetChar.value.completedTasks) {
        targetChar.value.completedTasks =
          targetChar.value.completedTasks.filter((cid) => cid !== id);
      }
    }
  } else {
    // 3. [보이기 처리]
    tempSettings.value.selectedGateIds.push(id);
    const parentRaid = raidList.find((r) => r.name === raidName);
    if (
      parentRaid &&
      !tempSettings.value.visibleGroups.includes(parentRaid.group)
    ) {
      tempSettings.value.visibleGroups.push(parentRaid.group);
    }
  }
};

const toggleGoldCharacter = (char) => {
  const currentGoldChars = characters.value.filter(
    (c) => c.isGoldCharacter,
  ).length;
  if (!char.isGoldCharacter && currentGoldChars >= 6) {
    alert("골드 획득 캐릭터는 최대 6명까지 지정 가능합니다.");
    return;
  }
  char.isGoldCharacter = !char.isGoldCharacter;
  saveToLocal();
};

const openCharSettings = (char) => {
  targetChar.value = char;
  // 현재 raidList를 기반으로 한 최신 그룹 목록
  const currentRaidGroups = raidGroups.value;

  if (!char.settings) {
    char.settings = {
      visibleGroups: [],
      selectedGateIds: [],
      groupOrder: currentRaidGroups, // 최신 목록 주입
      hiddenTaskIds: [],
      showWeekly: true,
    };
  }

  if (char.settings.visibleGroups) {
    char.settings.visibleGroups = char.settings.visibleGroups.filter((g) =>
      currentRaidGroups.includes(g),
    );
  }

  if (char.settings.groupOrder) {
    char.settings.groupOrder = char.settings.groupOrder.filter((g) =>
      currentRaidGroups.includes(g),
    );
  }

  tempSettings.value = JSON.parse(JSON.stringify(char.settings));

  // [핵심 수정 부분]
  // 기존에 저장된 순서(savedOrder)를 가져오되,
  // 현재 raidList에는 있는데 저장된 데이터에는 없는 '신규 그룹'들을 찾아냅니다.
  const savedOrder = tempSettings.value.groupOrder || [];
  const newGroups = currentRaidGroups.filter((g) => !savedOrder.includes(g));

  // 기존 순서 뒤에 새 레이드 그룹을 붙여서 설정창용 목록(allGroups)을 만듭니다.
  tempSettings.value.allGroups = [...savedOrder, ...newGroups];

  // 나머지 초기화 로직
  if (!tempSettings.value.hiddenTaskIds) tempSettings.value.hiddenTaskIds = [];
  if (!tempSettings.value.selectedGateIds)
    tempSettings.value.selectedGateIds = [];
  if (!tempSettings.value.visibleGroups) tempSettings.value.visibleGroups = [];

  charSettingsDialog.value = true;
};

const saveCharSettings = () => {
  if (targetChar.value) {
    // 1. 드래그로 변경된 전체 그룹 순서를 저장
    tempSettings.value.groupOrder = tempSettings.value.allGroups;

    // 2. 🔥 핵심 수정: visibleGroups의 순서를 groupOrder(allGroups) 순서와 일치시킵니다.
    // 현재 선택된(눈이 켜진) 그룹들만 필터링하되, 순서는 드래그한 순서를 따릅니다.
    tempSettings.value.visibleGroups = tempSettings.value.allGroups.filter(
      (group) => tempSettings.value.visibleGroups.includes(group),
    );

    // 3. 최종 데이터를 캐릭터 객체에 반영
    targetChar.value.settings = JSON.parse(JSON.stringify(tempSettings.value));

    saveToLocal();
    charSettingsDialog.value = false;
  }
};

const getAccountKey = () =>
  `hw_chars_${localStorage.getItem("current_main_name") || "default"}`;
const getBlacklistKey = () =>
  `hw_blacklist_${localStorage.getItem("current_main_name") || "default"}`;

// [수정] 3. 데이터 저장 로직 보강 (moreTasks가 확실히 저장되도록 처리)
const saveToLocal = () => {
  const dataToSave = characters.value.map((char) => ({
    ...char,
    completedTasks: char.completedTasks || [],
    moreTasks: char.moreTasks || [], // 더보기 데이터 명시적 포함
    settings: char.settings || {},
  }));
  localStorage.setItem(getAccountKey(), JSON.stringify(dataToSave));
};

// [추가] 일일 숙제 체크 시 휴식 게이지 40단위 소모 로직
const handleDailyCheck = (char, taskId) => {
  // 1. 체크박스를 '체크'한 경우에만 게이지 소모 판단
  if (char.completedTasks.includes(taskId)) {
    const currentRest = char.restGauges[taskId] || 0;

    // 🔥 핵심: 게이지가 40 이상일 때만 딱 40 소모
    // 20이 있다면 소모 안 됨, 60이 있다면 20이 남음
    if (currentRest >= 40) {
      char.restGauges[taskId] = currentRest - 40;
    }
  }
  // 2. 체크를 해제한 경우(실수 등)에 대한 복구 로직은
  // 게이지를 다시 돌려주는 것이 게임 데이터와 일치하지 않을 수 있어 넣지 않았습니다.

  saveToLocal(); // 변경사항 저장
};

const getTotalGold = () => {
  // 기존 6캐릭 골드 계산 [cite: 147]
  let baseGold = characters.value
    .filter((c) => c.isGoldCharacter)
    .reduce((sum, char) => sum + getCharGold(char), 0);

  // 이벤트 골드 합산 [cite: 148, 149]
  let eventGold = 0;
  if (
    currentExtremeEvent.value &&
    recommendedDifficulty.value &&
    isExtremeCleared.value // 이 값이 true일 때만 합산됨
  ) {
    eventGold = recommendedDifficulty.value.gold;
  }

  return baseGold + eventGold;
};

const deleteCharacter = (name) => {
  if (confirm(`${name} 삭제?`)) {
    const bl = JSON.parse(localStorage.getItem(getBlacklistKey()) || "[]");
    if (!bl.includes(name)) bl.push(name);
    localStorage.setItem(getBlacklistKey(), JSON.stringify(bl));
    characters.value = characters.value.filter((c) => c.name !== name);
    saveToLocal();
  }
};

const updateDailyRestGauges = () => {
  const now = new Date();
  const today6AM = new Date(now);
  if (now.getHours() < 6) today6AM.setDate(today6AM.getDate() - 1);
  today6AM.setHours(6, 0, 0, 0);

  characters.value.forEach((char) => {
    if (!char.lastDailyUpdate) {
      char.lastDailyUpdate = today6AM.getTime();
      return;
    }

    const daysDiff = Math.floor(
      (today6AM.getTime() - new Date(char.lastDailyUpdate).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysDiff > 0) {
      dailyTasks.forEach((task) => {
        let currentRest = char.restGauges[task.id] || 0;
        // 🎯 핵심: 이 시점의 completedTasks에는 주간 초기화 전의 기록이 남아있음
        if (char.completedTasks.includes(task.id)) {
          // 숙제 완료 시 휴게 소모 (로직에 따라 가감)
        } else {
          currentRest = Math.min(200, currentRest + 20 * daysDiff);
        }
        char.restGauges[task.id] = currentRest;
      });

      // 일일 체크박스만 초기화
      char.completedTasks = char.completedTasks.filter(
        (id) => id !== "chaos" && id !== "guardian",
      );
      char.lastDailyUpdate = today6AM.getTime();
    }
  });
};

const getCurrentWeekId = () => {
  const now = new Date();
  const day = now.getDay(); // 0(일) ~ 6(토)
  const hours = now.getHours();

  // 로직 설명:
  // 오늘이 수요일(3)인데 아직 오전 6시 전이거나, 월(1)/화(2)/일(0)이라면
  // 지난주 수요일이 이번 주차의 시작점입니다.
  const diff = day < 3 || (day === 3 && hours < 6) ? day + 4 : day - 3;

  const lastWednesday = new Date(now);
  lastWednesday.setDate(now.getDate() - diff);
  lastWednesday.setHours(6, 0, 0, 0); // 시간을 정확히 오전 6시로 고정

  // 이 시간값을 문자열 ID로 반환 (예: "1709110800000")
  return lastWednesday.getTime().toString();
};

const fetchMyExpedition = async (charName) => {
  if (!charName) return;
  isFetching.value = true;

  try {
    const res = await axios.get(
      `/api/characters/${encodeURIComponent(charName)}/siblings`,
      {
        headers: { authorization: `bearer ${API_KEY.trim()}` },
      },
    );

    if (res.data && Array.isArray(res.data)) {
      const blacklist = JSON.parse(
        localStorage.getItem(getBlacklistKey()) || "[]",
      );
      const savedData = JSON.parse(
        localStorage.getItem(getAccountKey()) || "[]",
      );

      // ✅ [추가/수정] API 데이터 매핑 전, 로컬 데이터 기반으로 일일 숙제 정산부터 수행
      // 그래야 수요일 초기화로 레이드가 날아가기 전 상태의 '일일 숙제' 여부를 체크할 수 있습니다.
      characters.value = savedData;
      updateDailyRestGauges();

      const currentWeek = getCurrentWeekId();
      const lastSavedWeek = localStorage.getItem(
        `last_week_id_${localStorage.getItem("current_main_name")}`,
      );
      const isNewWeek = lastSavedWeek !== currentWeek;

      // 1. API 데이터 필터링 (원본 유지)
      const apiChars = res.data.filter(
        (char) => !blacklist.includes(char.CharacterName),
      );

      // 2. 저장된 순서(savedData) 기준 리스트 재구성 (원본 유지)
      let newList = [];
      // characters.value에는 이미 위에서 정산된 데이터가 들어있음
      characters.value.forEach((saved) => {
        const apiMatch = apiChars.find((ac) => ac.CharacterName === saved.name);
        if (apiMatch) {
          newList.push(
            mapCharacterData(apiMatch, saved, isNewWeek, newList.length),
          );
        }
      });

      // 신규 캐릭터 추가 로직 (원본 유지)
      const newChars = apiChars.filter(
        (ac) => !newList.some((nc) => nc.name === ac.CharacterName),
      );
      newChars.sort(
        (a, b) =>
          parseFloat(b.ItemAvgLevel.replace(",", "")) -
          parseFloat(a.ItemAvgLevel.replace(",", "")),
      );

      newChars.forEach((nc) => {
        newList.push(mapCharacterData(nc, null, isNewWeek, newList.length));
      });

      characters.value = newList;

      if (isNewWeek) {
        localStorage.setItem(
          `last_week_id_${localStorage.getItem("current_main_name")}`,
          currentWeek,
        );
        saveToLocal();
      }

      // ✅ [삭제] 기존 맨 아래에 있던 updateDailyRestGauges()는 위로 이동했으므로 여기서는 뺍니다.

      // 이미지 및 전투력 업데이트 (원본 유지)
      characters.value.forEach((c, i) => {
        if (!c.img || !c.cbPower || c.cbPower === 0 || c.cbPower === "0") {
          updateCharImage(c.name, i);
        }
      });
    }
  } catch (e) {
    console.error("원정대 정보 로드 실패:", e);
  } finally {
    isFetching.value = false;
  }
};

const mapCharacterData = (apiChar, existing, isNewWeek, index) => {
  let currentTasks = existing?.completedTasks || [];
  if (isNewWeek) {
    currentTasks = currentTasks.filter(
      (id) => id === "chaos" || id === "guardian",
    );
  }

  return {
    name: apiChar.CharacterName,
    className: apiChar.CharacterClassName,
    level: apiChar.ItemAvgLevel,
    cbPower: existing?.cbPower || 0, // 이전에 추가한 전투력 유지
    img: existing?.img || "",

    // 🔥 정제된 숙제 리스트 적용
    completedTasks: currentTasks,

    // 더보기도 주간 단위이므로 isNewWeek일 때 초기화
    moreTasks: existing?.moreTasks || [],

    // 버스 설정도 주간 단위 초기화 (이미 작성하신 로직 유지)
    busTasks: isNewWeek ? {} : existing?.busTasks || {},

    restGauges: existing?.restGauges || { chaos: 0, guardian: 0 },
    lastDailyUpdate: existing?.lastDailyUpdate || null,

    settings: existing?.settings || {
      visibleGroups: [],
      selectedGateIds: [],
      groupOrder: raidGroups.value,
      hiddenTaskIds: [],
      showWeekly: true,
      goldSelectedGates: [],
    },
    isGoldCharacter:
      existing?.isGoldCharacter !== undefined
        ? existing.isGoldCharacter
        : index < 6,
  };
};

const updateCharImage = async (name, index) => {
  try {
    const res = await axios.get(
      `/api/armories/characters/${encodeURIComponent(name)}/profiles`,
      { headers: { authorization: `bearer ${API_KEY.trim()}` } },
    );

    if (res.data && characters.value[index]) {
      // 1. 이미지 업데이트
      if (res.data.CharacterImage) {
        characters.value[index].img = res.data.CharacterImage;
      }

      // 2. 전투력(CombatPower) 추출 (최상위 객체에서 바로 가져오기)
      // res.data.CombatPower 가 문자열("1,620,000")일 수도 있으니 정제 로직 포함
      const rawCp = res.data.CombatPower;

      if (rawCp !== undefined && rawCp !== null) {
        // 숫자와 소수점 외 문자 제거 후 정수 변환
        const pureValue = String(rawCp).replace(/[^0-9.]/g, "");
        characters.value[index].cbPower =
          Math.floor(parseFloat(pureValue)) || 0;
      } else {
        characters.value[index].cbPower = 0;
      }

      saveToLocal();
    }
  } catch (e) {
    console.error(`${name} 프로필 업데이트 실패:`, e);
  }
};

const fetchSchedules = () => {
  const collections = [
    { name: "schedules", defaultHomework: false },
    { name: "homeworks", defaultHomework: true },
  ];
  collections.forEach((conf) => {
    onSnapshot(collection(db, conf.name), (snap) => {
      const data = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          isHomework:
            d.isHomework !== undefined ? d.isHomework : conf.defaultHomework,
          colName: conf.name,
        };
      });
      allSchedules.value = [
        ...allSchedules.value.filter((s) => s.colName !== conf.name),
        ...data,
      ];
    });
  });
};
const getCharSchedules = (name) =>
  allSchedules.value.filter(
    (r) =>
      (r.members || []).some((m) => m.name === name) &&
      (!r.dateTime || new Date(r.dateTime) >= new Date()),
  );
const openScheduleModal = (name) => {
  activeCharName.value = name;
  activeSchedules.value = getCharSchedules(name);
  scheduleDialog.value = true;
};
const formatScheduleTime = (t) =>
  t
    ? new Date(t).toLocaleString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "시간 미정";

// [수정] 골드 보상으로 지정된 레이드 중 완료된 레이드 개수만 카운트
const getGoldRaidCount = (char) => {
  if (
    !char.settings?.goldSelectedGates ||
    char.settings.goldSelectedGates.length === 0
  )
    return 0;

  const completed = char.completedTasks || [];
  const goldSelected = char.settings.goldSelectedGates;

  // 골드 선택된 관문 ID들에서 레이드 이름만 추출 (중복 제거)
  // 예: ['에기르_G1', '에기르_G2'] -> ['에기르']
  const goldRaidNames = [
    ...new Set(goldSelected.map((id) => id.split("_G")[0])),
  ];

  let completedGoldRaidCount = 0;

  goldRaidNames.forEach((raidName) => {
    // 해당 레이드에 속한 관문들 중 골드 선택된 관문 리스트 추출
    const selectedGatesInThisRaid = goldSelected.filter((id) =>
      id.startsWith(raidName),
    );

    // 선택된 모든 관문이 완료(completed) 되었는지 확인
    const isRaidFullyFinished = selectedGatesInThisRaid.every((id) =>
      completed.includes(id),
    );

    if (isRaidFullyFinished) {
      completedGoldRaidCount++;
    }
  });

  return completedGoldRaidCount;
};

onMounted(async () => {
  // <--- 함수 앞에 async를 붙여줍니다.
  const main = localStorage.getItem("current_main_name");
  if (main) {
    await fetchMyExpedition(main);
    updateAllCombatPowers();
  }

  fetchSchedules();

  window.addEventListener("main-char-changed", async (e) => {
    await fetchMyExpedition(e.detail);
    updateAllCombatPowers();
  });

  fetchFixedParties();

  await syncHomeworkWithFixedParties();

  setTimeout(() => {
    checkExtremeModal();
  }, 1500); // API 로딩 시간을 고려한 여유 시간
});

// [추가] 캐릭터별 더보기 차감 전 '순수 획득 골드' 계산 (상단 대시보드용)
const getCharGrossGold = (char) => {
  if (!char.isGoldCharacter) return 0;

  const visibleGroups = char.settings?.visibleGroups || [];
  let raidGoldList = [];

  visibleGroups.forEach((groupName) => {
    let goldSum = 0;
    getRaidsByGroup(groupName).forEach((raid) => {
      (raid.gates || []).forEach((gate) => {
        // 더보기 여부와 상관없이 '클리어 체크'된 골드만 합산
        if ((char.completedTasks || []).includes(raid.name + "_G" + gate.g)) {
          goldSum += gate.gold;
        }
      });
    });
    if (goldSum > 0) raidGoldList.push({ gold: goldSum });
  });

  // 상위 3개 레이드 수익 합산
  return raidGoldList
    .sort((a, b) => b.gold - a.gold)
    .slice(0, 3)
    .reduce((sum, r) => sum + r.gold, 0);
};

const getTotalGrossGold = () => {
  if (!characters.value.length) return 0;

  // 1. 기존 캐릭터별 골드 수익 합산
  let total = characters.value.reduce((sum, c) => sum + getCharGold(c), 0);

  // 2. 익스트림 이벤트 골드 조건부 합산
  if (
    currentExtremeEvent.value &&
    recommendedDifficulty.value &&
    isExtremeCleared.value
  ) {
    total += recommendedDifficulty.value.gold;
  }

  return total;
};

// [신규] 특정 관문이 골드 보상 대상으로 선택되었는지 확인 (UI 아이콘 색상 결정)
const isGoldGateSelected = (char, raidName, gateG) => {
  // 캐릭터 설정 내 goldSelectedGates 배열에 해당 관문 ID가 있는지 확인
  const taskId = raidName + "_G" + gateG;
  return char.settings?.goldSelectedGates?.includes(taskId);
};

// [보조] 현재 이 캐릭터가 몇 종류의 레이드에서 골드를 얻기로 했는지 카운트 (3개 제한용)
const getSelectedRaidTypeCount = (char) => {
  const selected = char.settings?.goldSelectedGates || [];
  // 관문 ID(예: '에기르_G1')에서 레이드 이름만 추출하여 중복 제거
  const raidNames = selected.map((id) => id.split("_G")[0]);
  return new Set(raidNames).size;
};

const toggleGoldGate = (char, raid, gateG) => {
  // 0. 기초 데이터 추출 (전체 관문 수 파악을 위해 raid 객체 사용)
  const raidName = raid.name; // 예: "에기르"
  const allGates = raid.gates; // 예: [ {name: '1관문'}, {name: '2관문'} ]
  const totalGateCount = allGates.length;

  // 1. 설정 데이터 초기화 (기존 로직 유지)
  if (!char.settings) {
    char.settings = {
      goldSelectedGates: [],
      visibleGroups: [],
      selectedGateIds: [],
      groupOrder: raidGroups.value,
      hiddenTaskIds: [],
      showWeekly: true,
    };
  }
  if (!char.settings.goldSelectedGates) char.settings.goldSelectedGates = [];

  const taskId = raidName + "_G" + gateG;
  const idx = char.settings.goldSelectedGates.indexOf(taskId);

  // 2. 현재 누른 관문이 마지막 관문인지 확인 (gateG는 보통 1부터 시작하므로)
  const isLastGate = parseInt(gateG) === totalGateCount;

  if (idx > -1) {
    // [해제 로직]
    if (isLastGate) {
      // 마지막 관문 해제 시: 해당 레이드의 모든 관문("에기르_G1", "에기르_G2" 등)을 한꺼번에 제거
      char.settings.goldSelectedGates = char.settings.goldSelectedGates.filter(
        (id) => !id.startsWith(raidName + "_G"),
      );
    } else {
      // 일반 관문 해제 시: 해당 관문만 제거
      char.settings.goldSelectedGates.splice(idx, 1);
    }
  } else {
    // [지정 로직]
    const selectedRaidNames = new Set(
      char.settings.goldSelectedGates.map((id) => id.split("_G")[0]),
    );

    // 3개 제한 체크 (기존 로직 유지)
    if (!selectedRaidNames.has(raidName) && selectedRaidNames.size >= 3) {
      alert("골드 보상은 캐릭터당 최대 3개의 레이드까지만 지정 가능합니다.");
      return;
    }

    if (isLastGate) {
      // 마지막 관문 지정 시: 1관문부터 마지막 관문까지 루프를 돌며 모두 추가
      for (let i = 1; i <= totalGateCount; i++) {
        const targetId = raidName + "_G" + i;
        // 중복 추가 방지 체크 후 삽입
        if (!char.settings.goldSelectedGates.includes(targetId)) {
          char.settings.goldSelectedGates.push(targetId);
        }
      }
    } else {
      // 일반 관문 지정 시: 해당 관문만 추가
      char.settings.goldSelectedGates.push(taskId);
    }
  }

  // 4. 저장
  saveToLocal();
};

const getCharMaxPossibleGold = (char) => {
  if (!char.isGoldCharacter) return 0; // 골드 획득 캐릭터가 아니면 0원

  let totalMax = 0;
  const selectedGates = char.settings?.goldSelectedGates || [];

  // [핵심] 유저가 돈주머니를 켠 관문들의 골드만 합산
  selectedGates.forEach((gateId) => {
    const [rName, gNum] = gateId.split("_G");
    const raid = raidList.find((r) => r.name === rName);
    const gate = raid?.gates.find((g) => g.g === parseInt(gNum));
    if (gate) totalMax += gate.gold;
  });

  // 현재 이 캐릭터가 체크(활성화)한 모든 '더보기' 비용 합산하여 차감
  let moreCost = 0;
  (char.moreTasks || []).forEach((moreId) => {
    const [rName, gPart] = moreId.split("_G");
    const gNum = parseInt(gPart.replace("_More", ""));
    const raid = raidList.find((r) => r.name === rName);
    const gate = raid?.gates.find((g) => g.g === gNum);
    if (gate) moreCost += gate.moreGold || 0;
  });

  return Math.max(0, totalMax - moreCost); // 지출이 더 크더라도 음수가 나오지 않게 방어
};

// 버스 팝업 관련 상태
const busDialog = ref(false);
const busTarget = ref({ char: null, groupName: "" }); // gateG 제거
const busForm = ref({ isDriver: true, gold: 0 });

const openBusDialog = (char, groupName) => {
  if (!char) return;
  busTarget.value = { char, groupName };
  // groupName을 키로 사용하여 기존 설정 불러오기
  const existing = char.busTasks?.[groupName] || { isDriver: true, gold: 0 };
  busForm.value = { ...existing };
  busDialog.value = true;
};

const saveBusSetting = () => {
  const { char, groupName } = busTarget.value;
  if (!char) return;
  if (!char.busTasks) char.busTasks = {};

  // 골드 입력 시 groupName을 키로 저장
  if (busForm.value.gold <= 0) {
    delete char.busTasks[groupName];
  } else {
    char.busTasks[groupName] = { ...busForm.value };
  }

  saveToLocal();
  busDialog.value = false;
};

const hasBusSetting = (char, groupName) => {
  return !!char.busTasks?.[groupName];
};

const getCharGold = (char) => {
  let current = 0;

  // 골드 획득 캐릭터로 지정된 경우에만 레이드 수익과 더보기 비용을 계산합니다
  if (char.isGoldCharacter) {
    // 1. 지정된 관문 기본 골드 합산
    const selected = char.settings?.goldSelectedGates || [];
    const completed = char.completedTasks || [];
    selected.forEach((id) => {
      if (completed.includes(id)) {
        const [rName, gNum] = id.split("_G");
        const raid = raidList.find((r) => r.name === rName);
        const gate = raid?.gates.find((g) => g.g === parseInt(gNum));
        if (gate) current += Number(gate.gold);
      }
    });

    // 2. 더보기 지출 비용 차감 (골드 캐릭터일 때만 수행하도록 이동)
    let moreCost = 0;
    (char.moreTasks || []).forEach((id) => {
      const [rName, gPart] = id.split("_G");
      const gNum = parseInt(gPart.replace("_More", ""));
      const raid = raidList.find((r) => r.name === rName);
      const gate = raid?.gates.find((g) => g.g === gNum);
      if (gate) moreCost += Number(gate.moreGold || 0);
    });

    current -= moreCost; // 계산된 더보기 비용을 수익에서 차감
  }

  // 3. 버스 수지 합산 (버스는 골드 지정 여부와 상관없이 수입/지출을 계산함)
  return current + getCharBusNetGold(char);
};

// [수정] 캐릭터별 버스 순수익 계산 (기사 수입 5% 수수료 차감 반영)
const getCharBusNetGold = (char) => {
  if (!char.busTasks) return 0;
  return Object.values(char.busTasks).reduce((sum, bus) => {
    const goldVal = Number(bus.gold) || 0;
    if (bus.isDriver) {
      // 기사(수입)일 경우: 5% 우편 수수료 차감 후 95%만 합산
      return sum + goldVal * 0.95;
    } else {
      // 승객(지출)일 경우: 입력한 금액 그대로 차감
      return sum - goldVal;
    }
  }, 0);
};

// 1. 원정대 전체 순수 레이드 클리어 골드 합산
const getPureRaidGold = () => {
  return characters.value.reduce((sum, char) => {
    if (!char.isGoldCharacter) return sum;
    let charRaidGold = 0;
    const selected = char.settings?.goldSelectedGates || [];
    const completed = char.completedTasks || [];
    selected.forEach((id) => {
      if (completed.includes(id)) {
        const [rName, gNum] = id.split("_G");
        const raid = raidList.find((r) => r.name === rName);
        const gate = raid?.gates.find((g) => g.g === parseInt(gNum));
        if (gate) charRaidGold += Number(gate.gold);
      }
    });
    return sum + charRaidGold;
  }, 0);
};

const formatDateTime = (val) => {
  if (!val || val === "일정미정") return "일정 미정";
  const date = new Date(val);
  return date.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// [추가] 상단 툴팁 상세용: 전체 레이드 수익을 일반/귀속으로 분류
const getTotalGoldBreakdown = () => {
  let tradeable = 0;
  let bound = 0;

  characters.value.forEach((char) => {
    if (!char.isGoldCharacter) return;

    const selected = char.settings?.goldSelectedGates || [];
    const completed = char.completedTasks || [];

    selected.forEach((id) => {
      if (completed.includes(id)) {
        const [rName, gNum] = id.split("_G");
        const raid = raidList.find((r) => r.name === rName);
        const gate = raid?.gates.find((g) => g.g === parseInt(gNum));

        if (gate) {
          // 이름에 싱글, 1단계, 2단계, 3단계가 포함되면 귀속골드로 분류
          if (/싱글|1단계|2단계|3단계/.test(raid.name)) {
            bound += Number(gate.gold);
          } else {
            tradeable += Number(gate.gold);
          }
        }
      }
    });
  });

  return { tradeable, bound };
};

// 2. 원정대 전체 버스 수지 합산
const getTotalBusGold = () => {
  return characters.value.reduce(
    (sum, char) => sum + getCharBusNetGold(char),
    0,
  );
};

// 3. 원정대 전체 더보기 지출 합산
const getTotalMoreCost = () => {
  return characters.value.reduce((sum, char) => {
    // 골드 지정 캐릭터가 아니면 더보기 비용 합산 제외
    if (!char.isGoldCharacter) return sum;

    let charMoreCost = 0;
    (char.moreTasks || []).forEach((id) => {
      const [rName, gPart] = id.split("_G");
      const gNum = parseInt(gPart.replace("_More", ""));
      const raid = raidList.find((r) => r.name === rName);
      const gate = raid?.gates.find((g) => g.g === gNum);
      if (gate) charMoreCost += Number(gate.moreGold || 0);
    });
    return sum + charMoreCost;
  }, 0);
};

// 캐릭터 관리 관련 상태
const rosterDialog = ref(false);
const tempRosterOrder = ref([]);
const blacklistedChars = ref([]);

// 관리 팝업 열기
const openRosterManager = () => {
  tempRosterOrder.value = [...characters.value];
  blacklistedChars.value = JSON.parse(
    localStorage.getItem(getBlacklistKey()) || "[]",
  );
  rosterDialog.value = true;
};

// 순서 저장
const saveRosterOrder = () => {
  characters.value = [...tempRosterOrder.value];
  saveToLocal(); // 기존에 만든 저장 함수 활용
  rosterDialog.value = false;
};

// 블랙리스트에서 캐릭터 복구 (새로고침 없이 즉시 반영)
const restoreCharacter = async (name) => {
  // 1. 로컬 스토리지의 블랙리스트에서 해당 이름 제거
  const blKey = getBlacklistKey();
  const bl = JSON.parse(localStorage.getItem(blKey) || "[]");
  const newBl = bl.filter((n) => n !== name);
  localStorage.setItem(blKey, JSON.stringify(newBl));
  blacklistedChars.value = newBl;

  // 2. 전체 Siblings 데이터 재동기화 (fetch 함수 재호출)
  // fetchMyExpedition 내부의 filter가 새로운 블랙리스트(newBl)를 기준으로 작동하게 됩니다.
  const main = localStorage.getItem("current_main_name");
  if (main) {
    await fetchMyExpedition(main); // 비동기 완료를 기다림

    // 3. UI 반응성 갱신 (다이얼로그의 순서 변경 리스트도 동시 업데이트)
    tempRosterOrder.value = [...characters.value];
  }
};

// [추가] DB 동기화 로직
const isSyncing = ref(false);

// 1. 클라우드 저장 함수
const saveToCloud = async () => {
  const mainName = localStorage.getItem("current_main_name");
  if (!mainName) {
    return alert("상단 메뉴에서 대표 캐릭터를 먼저 설정하거나 선택해주세요!");
  }

  const confirmSave = confirm(
    `'${mainName}' 현재 설정을 클라우드에 저장하시겠습니까?`,
  );
  if (!confirmSave) return;

  isSyncing.value = true;
  try {
    const docRef = doc(db, "user_configs", mainName);

    // [수정] 로컬에서 현재 블랙리스트 명단을 직접 가져옵니다.
    const currentBlacklist = JSON.parse(
      localStorage.getItem(getBlacklistKey()) || "[]",
    );

    await setDoc(
      docRef,
      {
        characters: characters.value,
        blacklist: currentBlacklist, // 🔥 블랙리스트 추가 저장
        lastUpdated: serverTimestamp(),
      },
      { merge: true },
    ); // 기존 데이터 유지를 위해 merge 옵션 추천

    alert("✅ 클라우드 저장완료!");
  } catch (e) {
    console.error("Cloud Save Error:", e);
    alert("저장 중 오류가 발생했습니다.");
  } finally {
    isSyncing.value = false;
  }
};

// 2. 클라우드 불러오기 함수
const loadFromCloud = async () => {
  const mainName = localStorage.getItem("current_main_name");
  if (!mainName) return alert("대표 캐릭터를 먼저 설정해주세요!");

  const confirmLoad = confirm(
    "클라우드 데이터를 불러오시겠습니까? (로컬 설정이 교체됩니다.)",
  );
  if (!confirmLoad) return;

  isSyncing.value = true;
  try {
    const docRef = doc(db, "user_configs", mainName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // 1. 캐릭터 리스트 복구 (메모리 주입)
      characters.value = data.characters.map((char) => ({
        ...char,
        completedTasks: char.completedTasks || [],
        moreTasks: char.moreTasks || [],
        busTasks: char.busTasks || {},
        settings: char.settings || {},
      }));

      // 2. 🔥 [핵심] 블랙리스트 복구
      const serverBlacklist = data.blacklist || [];
      const bKey = `hw_blacklist_${mainName}`; // 또는 getBlacklistKey() 사용

      // 로컬 스토리지에 즉시 물리적 저장
      localStorage.setItem(bKey, JSON.stringify(serverBlacklist));

      // 화면 반응형 변수(UI) 업데이트
      if (typeof blacklistedChars !== "undefined") {
        blacklistedChars.value = serverBlacklist;
      }

      // 3. 캐릭터 리스트 로컬 저장 (기존 saveToLocal 호출)
      saveToLocal();

      // 4. 기타 연동 로직
      if (typeof updateDailyRestGauges === "function") updateDailyRestGauges();

      // 5. 🔥 [중요] 블랙리스트가 적용된 상태로 API 데이터를 다시 필터링
      // 이 함수가 실행되어야 '삭제된 캐릭터'가 화면에서 즉시 사라집니다.
      await fetchMyExpedition(mainName);

      alert("☁️ 클라우드 동기화 완료!");
    } else {
      alert("저장된 클라우드 데이터가 없습니다.");
    }
  } catch (e) {
    console.error("Cloud Load Error:", e);
    alert("데이터를 가져오는 중 오류가 발생했습니다.");
  } finally {
    isSyncing.value = false;
  }
};

const updateAllCombatPowers = async () => {
  if (characters.value.length === 0) return;

  // API 호출 제한을 피하기 위해 순차적으로 실행
  for (let i = 0; i < characters.value.length; i++) {
    const char = characters.value[i];

    // 너무 잦은 호출 방지 (0.2초 대기)
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 기존에 만든 updateCharImage 함수 호출 (내부에 cbPower 갱신 로직 포함됨)
    await updateCharImage(char.name, i);
  }
};

const syncHomeworkWithFixedParties = async () => {
  const main = localStorage.getItem("current_main_name");
  if (!main) return;

  const storageKey = `hw_chars_${main}`;
  let localData = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (localData.length === 0) return;

  try {
    // 1. 내가 포함된 모든 고정 파티 정보 가져오기
    // (내가 owner가 아니더라도 내 캐릭터가 members에 포함된 모든 파티)
    const myCharNames = localData.map((c) => c.name);
    const q = query(collection(db, "fixed_parties"));
    const querySnapshot = await getDocs(q);

    let isModified = false;

    querySnapshot.forEach((doc) => {
      const party = doc.data();

      // 클리어된 파티만 확인
      if (party.isCleared) {
        const raidName = party.raid;

        // 파티 멤버 중 내 캐릭터가 있는지 확인
        party.members.forEach((member) => {
          if (myCharNames.includes(member.name)) {
            const targetChar = localData.find((c) => c.name === member.name);

            if (targetChar && targetChar.settings?.selectedGateIds) {
              // 해당 레이드의 관문 ID들 필터링
              const targetGates = targetChar.settings.selectedGateIds.filter(
                (id) => id.includes(raidName),
              );

              targetGates.forEach((gateId) => {
                // 로컬 스토리지에 아직 체크가 안 되어 있다면 추가
                if (!targetChar.completedTasks.includes(gateId)) {
                  targetChar.completedTasks.push(gateId);
                  isModified = true;
                }
              });
            }
          }
        });
      }
    });

    // 2. 변경사항이 있다면 로컬 스토리지 저장 및 화면 갱신
    if (isModified) {
      localStorage.setItem(storageKey, JSON.stringify(localData));
      // 현재 페이지의 반응형 변수(예: characters) 업데이트
      if (typeof characters !== "undefined") {
        characters.value = [...localData];
      }
      console.log("고정 공대 클리어 내역이 숙제 관리와 동기화되었습니다.");
    }
  } catch (e) {
    console.error("동기화 오류:", e);
  }
};
</script>

<style scoped>
/* [추가] 1. 알림 벨 스타일 */
.notify-bell-btn {
  top: 10px;
  right: 10px;
  z-index: 10;
  width: 24px !important;
  height: 24px !important;
}

.bell-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff5252;
  color: white;
  font-size: 0.6rem;
  padding: 0 4px;
  border-radius: 10px;
  font-weight: bold;
  border: 1px solid white;
}

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
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}

.full-active .gauge-fill,
.half-active .gauge-fill {
  background: linear-gradient(to bottom, #4caf50, #2e7d32);
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

.bell-badge-count {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #ff5252;
  color: white;
  font-size: 0.65rem;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 1.5px solid white;
  padding: 0 2px;
  z-index: 1;
}

.character-card {
  transition: transform 0.2s ease;
}

.character-card:hover {
  transform: translateY(-2px);
}

/* 기본 토글 버튼 스타일 */
.gold-toggle-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  opacity: 0.6;
}

/* 활성화 상태 (돈주머니 켜짐) */
.gold-toggle-btn.is-active {
  opacity: 1 !important;
  transform: scale(1.1);
  /* 다크모드에서 눈에 띄는 네온 효과 */
  filter: drop-shadow(0 0 5px rgba(255, 193, 7, 0.6));
}

/* 다크모드 전용 보정 */
.v-theme--dark .gold-toggle-btn.is-active {
  color: #ffd740 !important;
  /* 더 밝은 노란색 */
  filter: drop-shadow(0 0 8px rgba(255, 215, 64, 0.8));
}

/* 비활성화 상태 (돈주머니 꺼짐) */
.gold-toggle-btn:not(.is-active) {
  filter: grayscale(100%);
}

/* 마우스 호버 시 효과 */
.gold-toggle-btn:hover {
  background-color: rgba(255, 193, 7, 0.1) !important;
  opacity: 1;
}

/* [추가] 골드 미지정 시 레이드 텍스트 가독성 처리 */
.gold-excluded-text {
  opacity: 0.4;
  filter: blur(0.2px);
  transition: all 0.3s ease;
}

/* 버스 설정 완료 시 푸른빛 글로우 효과 */
.bus-active-glow {
  filter: drop-shadow(0 0 5px rgba(0, 176, 255, 0.8));
  animation: bus-pulse 2s infinite ease-in-out;
}

@keyframes bus-pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.15);
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.num-style {
  font-family: "Pretendard", sans-serif;
  /* 기존 폰트 유지 */
  font-weight: 500;
  /* 너무 두껍지 않게 */
  letter-spacing: -0.02em;
  /* 숫자는 자간을 살짝 좁히는 게 예뻐요 */
  opacity: 0.8;
  /* 서브타이틀 특유의 은은한 느낌 */
  font-variant-numeric: tabular-nums;
  /* 숫자 폭을 일정하게 맞춰서 정렬 시 깔끔함 */
}

/* 다크모드 대응 강조 */
.v-theme--dark .bus-active-glow {
  filter: drop-shadow(0 0 8px rgba(0, 176, 255, 1));
}

/* 툴팁 배경색을 확실하게 검은색으로 고정 */
:deep(.custom-tooltip-bg) {
  background-color: rgba(0, 0, 0, 0.9) !important;
  color: white !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5) !important;
  opacity: 1 !important;
}

.white-text {
  color: white !important;
}

/* 텍스트 취소선으로 인한 높이 변화 방지 */
.fixed-card-text {
  position: relative;
  display: inline-block;
  line-height: 1.2;
  height: 1.2rem; /* 높이 강제 고정 */
  transition: opacity 0.2s ease;
}

/* 완료 시 실제 선을 긋는 대신 스타일로 처리 */
.is-cleared-text {
  opacity: 0.4 !important;
}

/* 텍스트 중앙에 물리적인 선을 가상 요소로 배치 (레이아웃에 영향 X) */
.is-cleared-text::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background-color: currentColor;
  transform: translateY(-50%);
}

/* 완료된 카드 효과 */
.cleared-card {
  filter: grayscale(0.6);
  opacity: 0.7;
  /* pointer-events: none; 은 절대 넣지 마세요! */
}

/* 도장 오버레이 */
.cleared-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-12deg);
  z-index: 5;
  pointer-events: none;
}

/* 'CLEAR' 도장 디자인 (약간 작게 조정) */
.cleared-text {
  font-size: 2.5rem; /* 크기 조정 */
  font-weight: 900;
  color: #4caf50;
  border: 4px solid #4caf50;
  padding: 2px 15px;
  border-radius: 10px;
  opacity: 0.6;
  letter-spacing: 3px;
  white-space: nowrap;
}

/* 배너 배경 그라데이션 애니메이션 */
.extreme-banner {
  background: linear-gradient(-45deg, #1a237e, #4a148c, #880e4f, #01579b);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("https://www.transparenttextures.com/patterns/carbon-fibre.png");
  opacity: 0.1;
  pointer-events: none;
}

/* 클리어 도장 스타일 */
.extreme-success-stamp {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-10deg);
  border: 8px solid rgba(255, 215, 0, 0.7);
  color: rgba(255, 215, 0, 0.7);
  font-size: 4rem;
  font-weight: 900;
  padding: 10px 40px;
  border-radius: 20px;
  z-index: 10;
  pointer-events: none;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  letter-spacing: 5px;
}

.cleared-btn-text {
  color: #4a148c !important;
}

.event-avatar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.clear-btn {
  transition: all 0.3s ease;
}

.clear-btn:hover {
  transform: scale(1.05);
}
</style>
