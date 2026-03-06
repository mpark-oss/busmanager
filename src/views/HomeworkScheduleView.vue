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
                        <div
                            class="text-caption text-medium-emphasis font-weight-bold d-flex align-center flex-wrap gap-2">
                            <span>주간 수익 현황:</span>
                            <v-tooltip location="bottom" offset="10" transition="fade-transition">
                                <template v-slot:activator="{ props }">
                                    <span v-bind="props" class="text-primary cursor-help font-weight-black"
                                        style="border-bottom: 2px dotted currentColor; font-size: 1.1rem;">
                                        {{ getTotalGrossGold().toLocaleString() }}G
                                    </span>
                                </template>

                                <v-card variant="flat" color="grey-darken-4" class="pa-3 rounded-lg border">
                                    <div class="text-subtitle-2 font-weight-black mb-2 text-grey-lighten-1">💰 주간 수익 상세
                                        내역</div>

                                    <div class="d-flex flex-column gap-2" style="min-width: 180px;">
                                        <div class="d-flex justify-space-between align-center">
                                            <div class="d-flex align-center text-grey-lighten-2">
                                                <v-icon size="16" color="amber" class="me-2">mdi-sword-cross</v-icon>
                                                <span>레이드</span>
                                            </div>
                                            <span class="text-amber-accent-2 font-weight-bold">+{{
                                                getPureRaidGold().toLocaleString() }}G</span>
                                        </div>

                                        <div class="d-flex justify-space-between align-center">
                                            <div class="d-flex align-center text-grey-lighten-2">
                                                <v-icon size="16" color="light-blue-accent-2"
                                                    class="me-2">mdi-bus-side</v-icon>
                                                <span>버스</span>
                                            </div>
                                            <span
                                                :class="['font-weight-bold', getTotalBusGold() >= 0 ? 'text-light-blue-accent-2' : 'text-red-accent-2']">
                                                {{ getTotalBusGold() >= 0 ? '+' : '' }}{{
                                                    getTotalBusGold().toLocaleString() }}G
                                            </span>
                                        </div>

                                        <div class="d-flex justify-space-between align-center">
                                            <div class="d-flex align-center text-grey-lighten-2">
                                                <v-icon size="16" color="red-accent-2"
                                                    class="me-2">mdi-minus-box</v-icon>
                                                <span>더보기</span>
                                            </div>
                                            <span class="text-red-accent-2 font-weight-bold">-{{
                                                getTotalMoreCost().toLocaleString() }}G</span>
                                        </div>
                                    </div>
                                </v-card>
                            </v-tooltip>
                            <span class="text-grey">/</span>
                            <span class="text-grey-darken-1">{{ getMaxPossibleGold().toLocaleString() }}G</span>

                            <v-chip size="x-small"
                                :color="getMaxPossibleGold() - getTotalGrossGold() > 0 ? 'error' : 'success'"
                                variant="flat" class="font-weight-black">
                                {{ getMaxPossibleGold() - getTotalGrossGold() > 0 ? '남은 수익: ' + (getMaxPossibleGold() -
                                    getTotalGrossGold()).toLocaleString() + 'G' : '주간 수입 목표 완료' }}
                            </v-chip>

                        </div>
                    </div>
                    <v-spacer></v-spacer>
                    <div class="d-flex align-center mb-6">
                        <v-btn prepend-icon="mdi-account-edit-outline" color="primary" variant="flat" rounded="lg"
                            @click="openRosterManager">
                            화면 설정
                        </v-btn>
                    </div>

                    <v-dialog v-model="rosterDialog" max-width="500" scrollable>
                        <v-card class="rounded-xl">
                            <v-card-title class="pa-4 font-weight-black d-flex align-center">
                                <v-icon class="me-2">mdi-account-group</v-icon> 원정대 캐릭터 관리
                            </v-card-title>
                        

                            <div class="pa-4 bg-grey-lighten-4 rounded-lg mb-4">
                                <div class="text-subtitle-2 font-weight-bold mb-2">
                                    <v-icon size="small" color="primary" class="me-1">mdi-cloud-sync</v-icon>
                                    클라우드 동기화 (기기 간 공유)
                                </div>
                                <div class="text-caption text-grey-darken-1 mb-3">
                                    대표 캐릭터명 기반으로 숙제 상태를 서버에 보관합니다.
                                </div>

                                <v-row dense>
                                    <v-col cols="6">
                                        <v-btn block color="primary" variant="elevated" prepend-icon="mdi-cloud-upload"
                                            :loading="isSyncing" @click="saveToCloud">
                                            현재 상태 저장
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-btn block color="secondary" variant="outlined"
                                            prepend-icon="mdi-cloud-download" :loading="isSyncing"
                                            @click="loadFromCloud">
                                            데이터 불러오기
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </div>
                            <v-card-text class="pa-4" style="height: 500px;">
                                <div class="text-subtitle-2 font-weight-bold mb-2 text-primary">카드 순서 변경 (드래그)</div>
                                <v-list class="pa-0 border rounded-lg mb-6">
                                    <draggable v-model="tempRosterOrder" handle=".drag-handle" item-key="name">
                                        <template #item="{ element }">
                                            <v-list-item class="border-b last-mb-0">
                                                <template v-slot:prepend>
                                                    <v-icon
                                                        class="drag-handle cursor-move me-2">mdi-drag-vertical</v-icon>
                                                    <v-avatar size="32" border class="me-2">
                                                        <v-img :src="element.img"></v-img>
                                                    </v-avatar>
                                                </template>
                                                <v-list-item-title class="font-weight-bold">{{ element.name
                                                }}</v-list-item-title>
                                                <v-list-item-subtitle>Lv.{{ element.level }} {{ element.className
                                                }}</v-list-item-subtitle>
                                            </v-list-item>
                                        </template>
                                    </draggable>
                                </v-list>

                                <div v-if="blacklistedChars.length > 0">
                                    <div class="text-subtitle-2 font-weight-bold mb-2 text-error">삭제된 캐릭터 복구</div>
                                    <v-list class="pa-0 border rounded-lg bg-grey-lighten-4">
                                        <v-list-item v-for="name in blacklistedChars" :key="name">
                                            <v-list-item-title class="font-weight-medium">{{ name }}</v-list-item-title>
                                            <template v-slot:append>
                                                <v-btn size="small" variant="text" color="success"
                                                    prepend-icon="mdi-refresh" @click="restoreCharacter(name)">
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
                                <v-btn color="primary" variant="flat" rounded="lg" @click="saveRosterOrder">
                                    저장</v-btn>
                            </v-card-actions>
                        </v-card>

                    </v-dialog>
                </div>

                <v-row v-if="characters.length === 0 && !isFetching" justify="center" class="py-12">
                    <v-col cols="12" sm="8" md="6" class="text-center">
                        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-search-outline</v-icon>
                        <h3 class="text-h5 font-weight-bold mb-2">설정된 대표 캐릭터가 없습니다.</h3>
                    </v-col>
                </v-row>

                <v-row v-else>
                    <v-col v-for="char in characters" :key="char.name" cols="12" sm="6" md="4" lg="4" xl="3">
                        <v-hover v-slot="{ isHovering, props }">
                            <v-card v-bind="props" border variant="flat"
                                class="character-card rounded-xl overflow-hidden shadow-sm bg-card position-relative"
                                :style="char.isGoldCharacter ? 'border: 2px solid #FFB300 !important' : ''">

                                <v-list-item class="pa-3 bg-profile-header"
                                    :subtitle="`Lv. ${char.level} ${char.className}`">
                                    <template v-slot:prepend>
                                        <v-avatar size="60" border class="elevation-3 bg-grey-lighten-4">
                                            <v-img :src="char.img" cover position="top center"></v-img>
                                        </v-avatar>
                                    </template>
                                    <template v-slot:title>
                                        <div class="d-flex align-center">
                                            <v-btn icon variant="text" size="x-small"
                                                :color="char.isGoldCharacter ? 'amber-darken-3' : 'grey-lighten-1'"
                                                @click.stop="toggleGoldCharacter(char)" class="me-1">
                                                <v-icon size="18">{{ char.isGoldCharacter ? 'mdi-gold' :
                                                    'mdi-treasure-chest'}}</v-icon>
                                            </v-btn>
                                            <span class="text-subtitle-1 font-weight-black text-truncate"
                                                style="max-width: 130px;">{{ char.name }}</span>
                                            <v-tooltip v-if="topRosterMembers.includes(char.name)" location="top">
                                                <template v-slot:activator="{ props }">
                                                    <v-chip v-bind="props" size="x-small" color="lime" variant="flat"
                                                        class="ms-2 px-1 pulse-badge">
                                                        <v-icon size="14" color="red">mdi-alarm-light</v-icon>
                                                        <span class="ms-1 font-weight-bold"
                                                            style="font-size: 0.7rem !important;">흐사게스타</span>
                                                    </v-chip>
                                                </template>
                                                <span>원정대 누적 신고 {{ topRosterCount }}회!</span>
                                            </v-tooltip>
                                        </div>
                                    </template>
                                    <template v-slot:append>
                                        <div class="d-flex align-center">
                                            <div class="text-right mr-1">
                                                <div class="text-caption font-weight-bold"
                                                    :class="char.isGoldCharacter ? 'text-amber-darken-4' : 'text-grey-lighten-1'">
                                                    {{ (char.isGoldCharacter ? getCharGold(char) : 0).toLocaleString()
                                                    }} G
                                                </div>
                                            </div>

                                            <v-btn v-if="getCharSchedules(char.name).length > 0" icon variant="text"
                                                size="small" color="error" class="position-relative pulse-badge"
                                                @click.stop="openScheduleModal(char.name)">
                                                <v-icon>mdi-bell-outline</v-icon>
                                                <span class="bell-badge-count">{{ getCharSchedules(char.name).length
                                                    }}</span>
                                            </v-btn>

                                            <v-btn icon="mdi-cog-outline" variant="text" color="grey-darken-1"
                                                size="small" @click="openCharSettings(char)"></v-btn>

                                            <v-fade-transition>
                                                <v-btn v-if="isHovering" icon="mdi-delete-outline" variant="text"
                                                    color="error" size="small"
                                                    @click.stop="deleteCharacter(char.name)"></v-btn>
                                            </v-fade-transition>
                                        </div>
                                    </template>
                                </v-list-item>

                                <v-divider></v-divider>

                                <v-card-text class="pa-3">
                                    <div v-if="hasVisibleDaily(char)">
                                        <div class="d-flex align-center mb-2">
                                            <v-chip size="x-small" color="orange" variant="flat"
                                                class="me-2 font-weight-bold">DAILY</v-chip>
                                            <span class="text-caption font-weight-black text-medium-emphasis">일일
                                                숙제</span>
                                        </div>
                                        <div class="d-flex flex-column gap-3 mb-3">
                                            <template v-for="task in dailyTasks" :key="task.id">
                                                <div v-if="isTaskVisible(char, task.id)" class="task-container">
                                                    <div class="d-flex align-center justify-space-between mb-1">
                                                        <v-checkbox v-model="char.completedTasks" :value="task.id"
                                                            :label="task.name" hide-details density="compact"
                                                            color="orange" @change="saveToLocal"
                                                            class="custom-chk flex-grow-1"></v-checkbox>
                                                        <div class="rest-input-wrapper">
                                                            <span
                                                                class="text-caption font-weight-bold grey--text mr-1">휴게</span>
                                                            <input type="number"
                                                                v-model.number="char.restGauges[task.id]"
                                                                class="rest-input text-caption font-weight-black"
                                                                @change="validateAndSaveRest(char)" min="0" max="200"
                                                                step="20" />
                                                        </div>
                                                    </div>
                                                    <div class="rest-gauge-bar">
                                                        <div v-for="n in 10" :key="n" class="gauge-segment"
                                                            :class="getSegmentClass(char, task.id, n)">
                                                            <div class="gauge-fill"
                                                                :style="getFillStyle(char, task.id, n)">
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
                                            <span class="text-caption font-weight-black text-medium-emphasis">주간
                                                숙제</span>
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
                                            <span class="text-caption font-weight-black text-medium-emphasis">주간
                                                레이드</span>
                                            <v-chip size="x-small"
                                                :color="getGoldRaidCount(char) >= 3 ? 'success' : 'grey-darken-1'"
                                                variant="tonal" class="ms-2 font-weight-black">
                                                {{ getGoldRaidCount(char) }} / 3
                                            </v-chip>
                                        </div>

                                        <div class="d-flex flex-column gap-2">
                                            <div v-for="groupName in (char.settings?.visibleGroups || [])"
                                                :key="groupName" class="raid-group-container border rounded-lg pa-1">
                                                <div class="d-flex align-center px-2 mb-1">
                                                    <span
                                                        class="text-caption font-weight-black text-primary flex-grow-1"
                                                        :style="isGoldExcluded(char, groupName) ? 'text-decoration: line-through; opacity: 0.5' : ''">
                                                        {{ groupName }}
                                                        <v-btn icon variant="text" size="x-small"
                                                            :class="['ms-1', { 'bus-active-glow': hasBusSetting(char, groupName) }]"
                                                            :color="hasBusSetting(char, groupName) ? 'light-blue-accent-2' : 'grey-lighten-1'"
                                                            @click.stop="openBusDialog(char, groupName)">
                                                            <v-icon size="18">mdi-bus-side</v-icon>
                                                            <v-tooltip activator="parent" location="top">{{ groupName }}
                                                                버스 설정</v-tooltip>
                                                        </v-btn>
                                                    </span>

                                                </div>
                                                <div class="d-flex flex-column px-1">
                                                    <template v-for="raid in getRaidsByGroup(groupName)"
                                                        :key="raid.name">
                                                        <template v-for="gate in (raid.gates || [])" :key="gate.g">
                                                            <div v-if="gate && (char.settings?.selectedGateIds || []).includes(raid.name + '_G' + gate.g)"
                                                                class="d-flex align-center mb-n1">
                                                                <v-checkbox v-model="char.completedTasks"
                                                                    :value="raid.name + '_G' + gate.g"
                                                                    :disabled="isGateDisabled(char, raid, gate)"
                                                                    @change="toggleGate(char, raid, gate)" hide-details
                                                                    density="compact" color="primary"
                                                                    class="gate-chk flex-grow-1">
                                                                    <template v-slot:label>
                                                                        <div class="d-flex align-center">
                                                                            <v-chip size="x-small"
                                                                                :color="getDifficulty(raid.name).color"
                                                                                label
                                                                                class="me-1 text-white font-weight-black px-1"
                                                                                style="min-width: 24px; justify-content: center; height: 16px;">
                                                                                {{ getDifficulty(raid.name).text[0] }}
                                                                            </v-chip>
                                                                            <span
                                                                                class="text-overline font-weight-black">
                                                                                {{ gate.g }} 관문
                                                                                <span class="ms-1"
                                                                                    style="font-size: 0.6rem; opacity: 0.7">({{
                                                                                        (gate.gold / 1000).toFixed(1) }}k{{
                                                                                        raid.name.includes('싱글') ? ' 귀속' :
                                                                                            ''
                                                                                    }})</span>
                                                                            </span>
                                                                            <v-btn icon variant="text" size="x-small"
                                                                                :class="[
                                                                                    'me-1 gold-toggle-btn',
                                                                                    { 'is-active': isGoldGateSelected(char, raid.name, gate.g) }
                                                                                ]"
                                                                                :color="isGoldGateSelected(char, raid.name, gate.g) ? 'amber-accent-3' : 'grey-lighten-1'"
                                                                                @click.stop="toggleGoldGate(char, raid.name, gate.g)">
                                                                                <v-icon size="18">
                                                                                    {{ isGoldGateSelected(char,
                                                                                        raid.name, gate.g) ?
                                                                                        'mdi-currency-usd'
                                                                                    :'mdi-currency-usd-off' }}
                                                                                </v-icon>
                                                                                <v-tooltip activator="parent"
                                                                                    location="top">골드 보상 지정</v-tooltip>
                                                                            </v-btn>
                                                                        </div>
                                                                    </template>
                                                                </v-checkbox>

                                                                <v-btn icon variant="text" size="x-small"
                                                                    :color="(char.moreTasks || []).includes(raid.name + '_G' + gate.g + '_More') ? 'indigo-accent-2' : 'grey-lighten-1'"
                                                                    @click.stop="toggleMoreReward(char, raid.name, gate.g)"
                                                                    class="ms-1">
                                                                    <v-icon size="18">{{ (char.moreTasks ||
                                                                        []).includes(raid.name + '_G' + gate.g +
                                                                            '_More') ?
                                                                        'mdi-plus-box' :
                                                                        'mdi-plus-box-outline' }}</v-icon>
                                                                    <v-tooltip activator="parent" location="top"
                                                                        open-delay="300">
                                                                        더보기 비용: {{ gate.moreGold?.toLocaleString() }}G
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

        <v-dialog v-model="charSettingsDialog" max-width="500" scrollable persistent>
            <v-card class="rounded-xl" v-if="targetChar">
                <v-card-title class="pa-4 font-weight-black d-flex align-center">
                    <v-icon class="me-2">mdi-cog</v-icon> {{ targetChar.name }} 카드 설정
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-4" style="height: 600px;">
                    <div class="text-subtitle-2 font-weight-bold mb-3 text-high-emphasis">숙제 표시 여부</div>
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
                    <div class="text-subtitle-2 font-weight-bold mb-1 text-high-emphasis">레이드 설정 (드래그 순서 변경)</div>
                    <v-list density="compact" class="pa-0 shadow-none bg-transparent">
                        <draggable v-model="tempSettings.allGroups" handle=".drag-handle" item-key="toString">
                            <template #item="{ element: group }">
                                <div class="border rounded-lg mb-2 overflow-hidden shadow-sm"
                                    :class="theme === 'dark' ? 'bg-grey-darken-4' : 'bg-white'">
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
                                                        {{ gate.g }}관 ({{ (gate.gold / 1000).toFixed(1) }}k{{
                                                            raid.name.includes('싱글') ? '귀속' : '' }})
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
                            <div class="d-flex align-center justify-space-between mb-2 flex-wrap" style="gap: 8px;">

                                <div class="d-flex align-center" style="gap: 6px;">
                                    <v-chip :color="item.isHomework ? 'success' : 'error'" size="x-small" label
                                        class="font-weight-black text-white px-2">
                                        {{ item.isHomework ? '숙제' : '버스' }}
                                    </v-chip>

                                    <v-chip size="x-small" :color="getDifficulty(item.difficulty).color" label
                                        class="text-white font-weight-black px-2">
                                        {{ getDifficulty(item.difficulty).text }}
                                    </v-chip>

                                    <span class="text-subtitle-1 font-weight-black">{{ item.raid }}</span>
                                </div>

                                <span class="text-caption font-weight-bold text-primary">
                                    {{ formatScheduleTime(item.dateTime) }}
                                </span>
                            </div>

                            <div class="text-caption text-medium-emphasis d-flex align-center mt-1">
                                <v-icon size="16" class="me-1">mdi-account-group-outline</v-icon>
                                <span class="font-weight-bold">
                                    멤버: {{(item.members || []).map(p => p.name).join(', ')}}
                                </span>
                            </div>
                        </v-list-item>
                    </v-list>
                    <div v-else class="text-center py-6 text-grey">참여 중인 일정이 없습니다.</div>
                </v-card-text>
                <v-card-actions><v-spacer></v-spacer><v-btn variant="text" @click="scheduleDialog = false"
                        class="font-weight-bold">닫기</v-btn></v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="busDialog" max-width="350">
            <v-card class="rounded-xl pa-4">
                <v-card-title class="font-weight-black d-flex align-center px-0">
                    <v-icon color="light-blue-accent-3" class="me-2">mdi-bus-clock</v-icon> 버스 수입/지출 설정
                </v-card-title>

                <v-card-text class="pa-0 mt-4">
                    <div class="d-flex justify-center mb-6">
                        <v-btn-toggle v-model="busForm.isDriver" mandatory color="light-blue-accent-4" variant="flat"
                            rounded="lg">
                            <v-btn :value="true" class="px-6">기사 (수입)</v-btn>
                            <v-btn :value="false" class="px-6">승객 (지출)</v-btn>
                        </v-btn-toggle>
                    </div>

                    <v-text-field v-model.number="busForm.gold" :label="busForm.isDriver ? '수입 골드' : '지출 골드'" suffix="G"
                        variant="outlined" type="number" hide-details class="font-weight-bold"></v-text-field>
                </v-card-text>

                <v-card-actions class="px-0 mt-6">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="busDialog = false">취소</v-btn>
                    <v-btn color="light-blue-accent-4" variant="flat" rounded="lg" @click="saveBusSetting">설정 완료</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import draggable from 'vuedraggable';
import { db } from '../firebase';
import { collection, onSnapshot, setDoc, getDoc, serverTimestamp, doc } from "firebase/firestore";

import { inject } from 'vue';
// App.vue에서 제공한 빌런 리스트 주입
const topVillains = inject('topVillains', []);
const topRosterMembers = inject('topRosterMembers', ref([]));
const topRosterCount = inject('topRosterCount', ref(0)); // [추가]

const API_KEY = import.meta.env.VITE_LOSTARK_API_KEY || "";
const characters = ref([]);
const isFetching = ref(false);
const theme = ref(localStorage.getItem('theme') || 'light');

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
    { group: "세르카", name: "그림자: 세르카(나이트메어)", level: 1740, gold: 54000, gates: [{ g: 1, gold: 21000, moreGold: 6720 }, { g: 2, gold: 33000, moreGold: 10560 }] },
    { group: "세르카", name: "그림자: 세르카(하드)", level: 1730, gold: 44000, gates: [{ g: 1, gold: 17500, moreGold: 5600 }, { g: 2, gold: 26500, moreGold: 8480 }] },
    { group: "세르카", name: "그림자: 세르카(노말)", level: 1710, gold: 35000, gates: [{ g: 1, gold: 14000, moreGold: 4480 }, { g: 2, gold: 21000, moreGold: 6720 }] },
    { group: "종막", name: "종막: 카제로스(하드)", level: 1730, gold: 52000, gates: [{ g: 1, gold: 17000, moreGold: 5440 }, { g: 2, gold: 35000, moreGold: 11200 }] },
    { group: "종막", name: "종막: 카제로스(노말)", level: 1710, gold: 40000, gates: [{ g: 1, gold: 14000, moreGold: 4480 }, { g: 2, gold: 26000, moreGold: 8320 }] },
    { group: "4막", name: "4막: 아르모체(하드)", level: 1720, gold: 42000, gates: [{ g: 1, gold: 15000, moreGold: 4800 }, { g: 2, gold: 27000, moreGold: 8640 }] },
    { group: "4막", name: "4막: 아르모체(노말)", level: 1700, gold: 33000, gates: [{ g: 1, gold: 12500, moreGold: 4000 }, { g: 2, gold: 20500, moreGold: 6560 }] },
    { group: "3막", name: "3막: 모르둠(하드)", level: 1700, gold: 27000, gates: [{ g: 1, gold: 5000, moreGold: 1650 }, { g: 2, gold: 8000, moreGold: 2640 }, { g: 3, gold: 14000, moreGold: 4060 }] },
    { group: "3막", name: "3막: 모르둠(노말)", level: 1680, gold: 21000, gates: [{ g: 1, gold: 4000, moreGold: 1300 }, { g: 2, gold: 7000, moreGold: 2350 }, { g: 3, gold: 10000, moreGold: 3360 }] },
    { group: "3막", name: "3막: 모르둠(싱글)", level: 1680, gold: 21000, gates: [{ g: 1, gold: 4000, moreGold: 1300 }, { g: 2, gold: 7000, moreGold: 2350 }, { g: 3, gold: 10000, moreGold: 3360 }] },
    { group: "2막", name: "2막: 아브렐슈드(하드)", level: 1690, gold: 23000, gates: [{ g: 1, gold: 7500, moreGold: 2400 }, { g: 2, gold: 15500, moreGold: 5100 }] },
    { group: "2막", name: "2막: 아브렐슈드(노말)", level: 1670, gold: 16500, gates: [{ g: 1, gold: 5500, moreGold: 1820 }, { g: 2, gold: 11000, moreGold: 3720 }] },
    { group: "2막", name: "2막: 아브렐슈드(싱글)", level: 1670, gold: 16500, gates: [{ g: 1, gold: 5500, moreGold: 1820 }, { g: 2, gold: 11000, moreGold: 3720 }] },
    { group: "1막", name: "1막: 에기르(하드)", level: 1680, gold: 18000, gates: [{ g: 1, gold: 5500, moreGold: 1820 }, { g: 2, gold: 12500, moreGold: 4150 }] },
    { group: "1막", name: "1막: 에기르(노말)", level: 1660, gold: 11500, gates: [{ g: 1, gold: 3500, moreGold: 750 }, { g: 2, gold: 8000, moreGold: 1780 }] },
    { group: "1막", name: "1막: 에기르(싱글)", level: 1660, gold: 11500, gates: [{ g: 1, gold: 3500, moreGold: 750 }, { g: 2, gold: 8000, moreGold: 1780 }] },
    { group: "서막", name: "서막: 에키드나(하드)", level: 1640, gold: 7200, gates: [{ g: 1, gold: 2200, moreGold: 720 }, { g: 2, gold: 5000, moreGold: 1630 }] },
    { group: "서막", name: "서막: 에키드나(노말)", level: 1620, gold: 6100, gates: [{ g: 1, gold: 1900, moreGold: 310 }, { g: 2, gold: 4200, moreGold: 700 }] },
    { group: "서막", name: "서막: 에키드나(싱글)", level: 1620, gold: 6100, gates: [{ g: 1, gold: 1900, moreGold: 310 }, { g: 2, gold: 4200, moreGold: 700 }] }
];

const raidGroups = computed(() => [...new Set(raidList.map(r => r.group))]);
const getRaidsByGroup = (groupName) => raidList.filter(r => r.group === groupName);

const isTaskVisible = (char, taskId) => !char.settings?.hiddenTaskIds?.includes(taskId);
const isTaskVisibleInSettings = (taskId) => !tempSettings.value.hiddenTaskIds?.includes(taskId);
const toggleTaskVisibility = (taskId) => {
    if (!tempSettings.value.hiddenTaskIds) tempSettings.value.hiddenTaskIds = [];
    const idx = tempSettings.value.hiddenTaskIds.indexOf(taskId);
    if (idx > -1) tempSettings.value.hiddenTaskIds.splice(idx, 1);
    else tempSettings.value.hiddenTaskIds.push(taskId);
};
const hasVisibleDaily = (char) => dailyTasks.some(t => isTaskVisible(char, t.id));
const hasVisibleSpecial = (char) => specialTasks.some(t => isTaskVisible(char, t.id));

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

const toggleMoreReward = (char, raidName, gateG) => {
    if (!char.moreTasks) char.moreTasks = [];
    const taskId = raidName + '_G' + gateG + '_More';

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
        .filter(c => c.isGoldCharacter)
        .reduce((sum, char) => sum + getCharMaxPossibleGold(char), 0);
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
    const diff = difficultyText || "노말";
    if (diff.includes("나이트메어")) return { text: "나메", color: "purple-darken-1" };
    if (diff.includes("하드")) return { text: "하드", color: "orange-darken-1" };
    if (diff.includes("The First")) return { text: "퍼스트", color: "red-darken-4" };
    if (diff.includes("싱글")) return { text: "싱글", color: "light-blue-darken-1" };
    return { text: "노말", color: "green-darken-1" };
};

const getSegmentClass = (char, taskId, index) => { const score = char.restGauges?.[taskId] || 0; return score >= index * 20 ? 'full-active' : score >= index * 20 - 10 ? 'half-active' : ''; };
const getFillStyle = (char, taskId, index) => { const score = char.restGauges?.[taskId] || 0; return { width: score >= index * 20 ? '100%' : score >= index * 20 - 10 ? '50%' : '0%' }; };
const validateAndSaveRest = (char) => { dailyTasks.forEach(task => { let v = char.restGauges[task.id]; char.restGauges[task.id] = Math.max(0, Math.min(200, Math.round(v / 10) * 10)); }); saveToLocal(); };

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
    if (idx > -1) tempSettings.value.selectedGateIds.splice(idx, 1);
    else {
        tempSettings.value.selectedGateIds.push(id);
        const parentRaid = raidList.find(r => r.name === raidName);
        if (parentRaid && !tempSettings.value.visibleGroups.includes(parentRaid.group)) {
            tempSettings.value.visibleGroups.push(parentRaid.group);
        }
    }
};

const toggleGoldCharacter = (char) => {
    const currentGoldChars = characters.value.filter(c => c.isGoldCharacter).length;
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
            showWeekly: true
        };
    }

    tempSettings.value = JSON.parse(JSON.stringify(char.settings));

    // [핵심 수정 부분]
    // 기존에 저장된 순서(savedOrder)를 가져오되, 
    // 현재 raidList에는 있는데 저장된 데이터에는 없는 '신규 그룹'들을 찾아냅니다.
    const savedOrder = tempSettings.value.groupOrder || [];
    const newGroups = currentRaidGroups.filter(g => !savedOrder.includes(g));

    // 기존 순서 뒤에 새 레이드 그룹을 붙여서 설정창용 목록(allGroups)을 만듭니다.
    tempSettings.value.allGroups = [...savedOrder, ...newGroups];

    // 나머지 초기화 로직
    if (!tempSettings.value.hiddenTaskIds) tempSettings.value.hiddenTaskIds = [];
    if (!tempSettings.value.selectedGateIds) tempSettings.value.selectedGateIds = [];
    if (!tempSettings.value.visibleGroups) tempSettings.value.visibleGroups = [];

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

const getAccountKey = () => `hw_chars_${localStorage.getItem('current_main_name') || 'default'}`;
const getBlacklistKey = () => `hw_blacklist_${localStorage.getItem('current_main_name') || 'default'}`;

// [수정] 3. 데이터 저장 로직 보강 (moreTasks가 확실히 저장되도록 처리)
const saveToLocal = () => {
    const dataToSave = characters.value.map(char => ({
        ...char,
        completedTasks: char.completedTasks || [],
        moreTasks: char.moreTasks || [], // 더보기 데이터 명시적 포함
        settings: char.settings || {}
    }));
    localStorage.setItem(getAccountKey(), JSON.stringify(dataToSave));
};

const getTotalGold = () => characters.value.filter(c => c.isGoldCharacter).reduce((sum, char) => sum + getCharGold(char), 0);

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
                if ((char.completedTasks || []).includes(task.id)) { if (currentRest >= 40) currentRest -= 40; }
                else { currentRest = Math.min(200, currentRest + 20); }
                if (daysDiff > 1) for (let i = 1; i < daysDiff; i++) currentRest = Math.min(200, currentRest + 20);
                char.restGauges[task.id] = currentRest;
            });
            char.completedTasks = (char.completedTasks || []).filter(id => !['chaos', 'guardian'].includes(id));
            char.lastDailyUpdate = today6AM.getTime();
        }
    });
    saveToLocal();
};

const getCurrentWeekId = () => {
    const now = new Date();
    const day = now.getDay(); // 0(일) ~ 6(토)
    const hours = now.getHours();

    // 로직 설명: 
    // 오늘이 수요일(3)인데 아직 오전 6시 전이거나, 월(1)/화(2)/일(0)이라면 
    // 지난주 수요일이 이번 주차의 시작점입니다.
    const diff = (day < 3 || (day === 3 && hours < 6)) ? (day + 4) : (day - 3);

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
        const res = await axios.get(`/api/characters/${encodeURIComponent(charName)}/siblings`, {
            headers: { 'authorization': `bearer ${API_KEY.trim()}` }
        });

        if (res.data && Array.isArray(res.data)) {
            const blacklist = JSON.parse(localStorage.getItem(getBlacklistKey()) || '[]');
            const savedData = JSON.parse(localStorage.getItem(getAccountKey()) || '[]');

            const currentWeek = getCurrentWeekId();
            const lastSavedWeek = localStorage.getItem(`last_week_id_${localStorage.getItem('current_main_name')}`);
            const isNewWeek = lastSavedWeek !== currentWeek;

            // 1. 먼저 API 데이터를 객체화하여 매핑 준비
            const apiChars = res.data.filter(char => !blacklist.includes(char.CharacterName));

            // 2. 저장된 데이터(savedData)의 순서를 기준으로 리스트 재구성
            let newList = [];

            // 기존에 저장된 순서대로 먼저 채우기
            savedData.forEach(saved => {
                const apiMatch = apiChars.find(ac => ac.CharacterName === saved.name);
                if (apiMatch) {
                    newList.push(mapCharacterData(apiMatch, saved, isNewWeek, newList.length));
                }
            });

            // 저장된 데이터에 없는 새로운 캐릭터(또는 복구된 캐릭터) 추가
            const newChars = apiChars.filter(ac => !newList.some(nc => nc.name === ac.CharacterName));
            // 새 캐릭터들은 레벨순 정렬 후 뒤에 붙임
            newChars.sort((a, b) => parseFloat(b.ItemAvgLevel.replace(',', '')) - parseFloat(a.ItemAvgLevel.replace(',', '')));

            newChars.forEach(nc => {
                newList.push(mapCharacterData(nc, null, isNewWeek, newList.length));
            });

            characters.value = newList;

            if (isNewWeek) {
                localStorage.setItem(`last_week_id_${localStorage.getItem('current_main_name')}`, currentWeek);
                saveToLocal();
            }

            updateDailyRestGauges();
            characters.value.forEach((c, i) => { if (!c.img) updateCharImage(c.name, i); });
        }
    } catch (e) {
        console.error("원정대 정보 로드 실패:", e);
    } finally {
        isFetching.value = false;
    }
};

// 캐릭터 데이터 매핑 헬퍼 함수 (중복 코드 방지)
const mapCharacterData = (apiChar, existing, isNewWeek, index) => {
    return {
        name: apiChar.CharacterName,
        className: apiChar.CharacterClassName,
        level: apiChar.ItemAvgLevel,
        img: existing?.img || '',
        completedTasks: isNewWeek ? [] : (existing?.completedTasks || []),
        moreTasks: isNewWeek ? [] : (existing?.moreTasks || []),
        busTasks: isNewWeek ? {} : (existing?.busTasks || {}),
        restGauges: existing?.restGauges || { chaos: 0, guardian: 0 },
        lastDailyUpdate: existing?.lastDailyUpdate || null,
        settings: existing?.settings || {
            visibleGroups: [],
            selectedGateIds: [],
            groupOrder: raidGroups.value,
            hiddenTaskIds: [],
            showWeekly: true,
            goldSelectedGates: []
        },
        isGoldCharacter: existing?.isGoldCharacter !== undefined ? existing.isGoldCharacter : index < 6
    };
};

const updateCharImage = async (name, index) => {
    try {
        const res = await axios.get(`/api/armories/characters/${encodeURIComponent(name)}/profiles`, { headers: { 'authorization': `bearer ${API_KEY.trim()}` } });
        if (res.data?.CharacterImage && characters.value[index]) { characters.value[index].img = res.data.CharacterImage; saveToLocal(); }
    } catch (e) { }
};

const fetchSchedules = () => {
    const collections = [{ name: 'schedules', defaultHomework: false }, { name: 'homeworks', defaultHomework: true }];
    collections.forEach(conf => {
        onSnapshot(collection(db, conf.name), (snap) => {
            const data = snap.docs.map(doc => {
                const d = doc.data();
                return { id: doc.id, ...d, isHomework: d.isHomework !== undefined ? d.isHomework : conf.defaultHomework, colName: conf.name };
            });
            allSchedules.value = [...allSchedules.value.filter(s => s.colName !== conf.name), ...data];
        });
    });
};
const getCharSchedules = (name) => allSchedules.value.filter(r => (r.members || []).some(m => m.name === name) && (!r.dateTime || new Date(r.dateTime) >= new Date()));
const openScheduleModal = (name) => { activeCharName.value = name; activeSchedules.value = getCharSchedules(name); scheduleDialog.value = true; };
const formatScheduleTime = (t) => t ? new Date(t).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "시간 미정";

const getGoldRaidCount = (char) => {
    const visibleGroups = char.settings?.visibleGroups || [];
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
    return raidGoldList.sort((a, b) => b.gold - a.gold).slice(0, 3).length;
};

onMounted(() => {
    const main = localStorage.getItem('current_main_name');
    if (main) fetchMyExpedition(main);
    fetchSchedules();
    window.addEventListener('main-char-changed', (e) => fetchMyExpedition(e.detail));
});

// [추가] 캐릭터별 더보기 차감 전 '순수 획득 골드' 계산 (상단 대시보드용)
const getCharGrossGold = (char) => {
    if (!char.isGoldCharacter) return 0;

    const visibleGroups = char.settings?.visibleGroups || [];
    let raidGoldList = [];

    visibleGroups.forEach(groupName => {
        let goldSum = 0;
        getRaidsByGroup(groupName).forEach(raid => {
            (raid.gates || []).forEach(gate => {
                // 더보기 여부와 상관없이 '클리어 체크'된 골드만 합산
                if ((char.completedTasks || []).includes(raid.name + '_G' + gate.g)) {
                    goldSum += gate.gold;
                }
            });
        });
        if (goldSum > 0) raidGoldList.push({ gold: goldSum });
    });

    // 상위 3개 레이드 수익 합산
    return raidGoldList.sort((a, b) => b.gold - a.gold).slice(0, 3).reduce((sum, r) => sum + r.gold, 0);
};

const getTotalGrossGold = () => {
    if (!characters.value.length) return 0;
    return characters.value.reduce((sum, c) => sum + getCharGold(c), 0);
};

// [신규] 특정 관문이 골드 보상 대상으로 선택되었는지 확인 (UI 아이콘 색상 결정)
const isGoldGateSelected = (char, raidName, gateG) => {
    // 캐릭터 설정 내 goldSelectedGates 배열에 해당 관문 ID가 있는지 확인
    const taskId = raidName + '_G' + gateG;
    return char.settings?.goldSelectedGates?.includes(taskId);
};

// [보조] 현재 이 캐릭터가 몇 종류의 레이드에서 골드를 얻기로 했는지 카운트 (3개 제한용)
const getSelectedRaidTypeCount = (char) => {
    const selected = char.settings?.goldSelectedGates || [];
    // 관문 ID(예: '에기르_G1')에서 레이드 이름만 추출하여 중복 제거
    const raidNames = selected.map(id => id.split('_G')[0]);
    return new Set(raidNames).size;
};

// [신규] 골드 획득 관문 토글 함수 (캐릭터당 최대 3개 레이드 제한 로직 포함)
const toggleGoldGate = (char, raidName, gateG) => {
    // 1. 설정 데이터가 없을 경우를 대비한 초기화
    if (!char.settings) {
        char.settings = {
            goldSelectedGates: [],
            visibleGroups: [],
            selectedGateIds: [],
            groupOrder: raidGroups.value,
            hiddenTaskIds: [],
            showWeekly: true
        };
    }
    if (!char.settings.goldSelectedGates) char.settings.goldSelectedGates = [];

    const taskId = raidName + '_G' + gateG;
    const idx = char.settings.goldSelectedGates.indexOf(taskId);

    if (idx > -1) {
        // 2. 이미 지정된 경우: 리스트에서 제거 (해제)
        char.settings.goldSelectedGates.splice(idx, 1);
    } else {
        // 3. 새로 지정할 경우: 캐릭터당 '레이드 종류' 기준 3개 제한 체크
        // 현재 지정된 모든 관문 ID에서 레이드 이름만 추출하여 중복을 제거한 집합 생성
        const selectedRaidNames = new Set(
            char.settings.goldSelectedGates.map(id => id.split('_G')[0])
        );

        // 클릭한 레이드가 새로운 종류인데 이미 3종류를 선택했다면 경고 후 차단
        if (!selectedRaidNames.has(raidName) && selectedRaidNames.size >= 3) {
            alert("골드 보상은 캐릭터당 최대 3개의 레이드까지만 지정 가능합니다.");
            return;
        }

        // 제한에 걸리지 않으면 리스트에 추가
        char.settings.goldSelectedGates.push(taskId);
    }

    // 4. 변경된 데이터를 로컬 스토리지에 즉시 반영
    saveToLocal();
};
const getCharMaxPossibleGold = (char) => {
    if (!char.isGoldCharacter) return 0; // 골드 획득 캐릭터가 아니면 0원

    let totalMax = 0;
    const selectedGates = char.settings?.goldSelectedGates || [];

    // [핵심] 유저가 돈주머니를 켠 관문들의 골드만 합산
    selectedGates.forEach(gateId => {
        const [rName, gNum] = gateId.split('_G');
        const raid = raidList.find(r => r.name === rName);
        const gate = raid?.gates.find(g => g.g === parseInt(gNum));
        if (gate) totalMax += gate.gold;
    });

    // 현재 이 캐릭터가 체크(활성화)한 모든 '더보기' 비용 합산하여 차감
    let moreCost = 0;
    (char.moreTasks || []).forEach(moreId => {
        const [rName, gPart] = moreId.split('_G');
        const gNum = parseInt(gPart.replace('_More', ''));
        const raid = raidList.find(r => r.name === rName);
        const gate = raid?.gates.find(g => g.g === gNum);
        if (gate) moreCost += (gate.moreGold || 0);
    });

    return Math.max(0, totalMax - moreCost); // 지출이 더 크더라도 음수가 나오지 않게 방어
};

// 버스 팝업 관련 상태
const busDialog = ref(false);
const busTarget = ref({ char: null, groupName: '' }); // gateG 제거
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
        selected.forEach(id => {
            if (completed.includes(id)) {
                const [rName, gNum] = id.split('_G');
                const raid = raidList.find(r => r.name === rName);
                const gate = raid?.gates.find(g => g.g === parseInt(gNum));
                if (gate) current += Number(gate.gold);
            }
        });

        // 2. 더보기 지출 비용 차감 (골드 캐릭터일 때만 수행하도록 이동)
        let moreCost = 0;
        (char.moreTasks || []).forEach(id => {
            const [rName, gPart] = id.split('_G');
            const gNum = parseInt(gPart.replace('_More', ''));
            const raid = raidList.find(r => r.name === rName);
            const gate = raid?.gates.find(g => g.g === gNum);
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
            return sum + (goldVal * 0.95);
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
        selected.forEach(id => {
            if (completed.includes(id)) {
                const [rName, gNum] = id.split('_G');
                const raid = raidList.find(r => r.name === rName);
                const gate = raid?.gates.find(g => g.g === parseInt(gNum));
                if (gate) charRaidGold += Number(gate.gold);
            }
        });
        return sum + charRaidGold;
    }, 0);
};

// 2. 원정대 전체 버스 수지 합산
const getTotalBusGold = () => {
    return characters.value.reduce((sum, char) => sum + getCharBusNetGold(char), 0);
};

// 3. 원정대 전체 더보기 지출 합산
const getTotalMoreCost = () => {
    return characters.value.reduce((sum, char) => {
        // 골드 지정 캐릭터가 아니면 더보기 비용 합산 제외
        if (!char.isGoldCharacter) return sum;

        let charMoreCost = 0;
        (char.moreTasks || []).forEach(id => {
            const [rName, gPart] = id.split('_G');
            const gNum = parseInt(gPart.replace('_More', ''));
            const raid = raidList.find(r => r.name === rName);
            const gate = raid?.gates.find(g => g.g === gNum);
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
    blacklistedChars.value = JSON.parse(localStorage.getItem(getBlacklistKey()) || '[]');
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
    const bl = JSON.parse(localStorage.getItem(blKey) || '[]');
    const newBl = bl.filter(n => n !== name);
    localStorage.setItem(blKey, JSON.stringify(newBl));
    blacklistedChars.value = newBl;

    // 2. 전체 Siblings 데이터 재동기화 (fetch 함수 재호출)
    // fetchMyExpedition 내부의 filter가 새로운 블랙리스트(newBl)를 기준으로 작동하게 됩니다.
    const main = localStorage.getItem('current_main_name');
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
  // 로컬 스토리지에서 현재 선택된 대표 캐릭터명을 가져옵니다.
  const mainName = localStorage.getItem('current_main_name');
  
  if (!mainName) {
    return alert('상단 메뉴에서 대표 캐릭터를 먼저 설정하거나 선택해주세요!');
  }
  
  const confirmSave = confirm(`'${mainName}'현재 설정을 클라우드에 저장하시겠습니까?`);
  if (!confirmSave) return;

  isSyncing.value = true;
  try {
    const docRef = doc(db, "user_configs", mainName);
    
    // 현재 페이지의 숙제 데이터(characters)를 저장합니다.
    // 만약 변수명이 characters가 아니라면 해당 변수명으로 수정하세요.
    await setDoc(docRef, {
      characters: characters.value, 
      lastUpdated: serverTimestamp()
    });
    
    alert('클라우드 저장완료!');
  } catch (e) {
    console.error("Cloud Save Error:", e);
    alert('저장 중 오류가 발생했습니다.');
  } finally {
    isSyncing.value = false;
  }
};

// 2. 클라우드 불러오기 함수
const loadFromCloud = async () => {
  const mainName = localStorage.getItem('current_main_name');
  
  if (!mainName) {
    return alert('대표 캐릭터를 먼저 설정해주세요!');
  }

  const confirmLoad = confirm('클라우드에서 데이터를 불러오시겠습니까?\n(현재 화면의 내용이 서버 데이터로 교체됩니다.)');
  if (!confirmLoad) return;

  isSyncing.value = true;
  try {
    const docRef = doc(db, "user_configs", mainName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // 1. 메모리 데이터 갱신
      characters.value = data.characters;
      
      // 2. 로컬 스토리지 갱신 (App.vue의 저장 방식과 동일하게)
      // 숙제 관리 데이터 키값이 'homework_characters'라고 가정합니다.
      localStorage.setItem('homework_characters', JSON.stringify(data.characters));
      
      // 3. 만약 페이지 내에 saveLocal() 함수가 있다면 실행
      if (typeof saveLocal === 'function') saveLocal();
      
      alert('성공적으로 데이터를 동기화했습니다!');
    } else {
      alert('해당 캐릭터명으로 저장된 클라우드 데이터가 없습니다.');
    }
  } catch (e) {
    console.error("Cloud Load Error:", e);
    alert('데이터를 가져오는 중 오류가 발생했습니다.');
  } finally {
    isSyncing.value = false;
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
    color: #FFD740 !important;
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

/* 다크모드 대응 강조 */
.v-theme--dark .bus-active-glow {
    filter: drop-shadow(0 0 8px rgba(0, 176, 255, 1));
}
</style>