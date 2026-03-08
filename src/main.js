import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify 관련 설정
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // MDI 폰트 불러오기

// [수정] 인스턴스를 하나로 합치고 설정을 통합합니다.
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi', // 기본 아이콘 세트를 mdi로 설정
  },
})

const app = createApp(App)

app.use(router)
app.use(vuetify) // 통합된 vuetify 설정 적용

app.mount('#app')