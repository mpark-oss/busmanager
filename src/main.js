import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 라우터 불러오기

// Vuetify 관련 설정
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// 1. vuetify 인스턴스를 먼저 생성합니다 (선언)
const vuetify = createVuetify({
  components,
  directives,
})

// 2. 앱 인스턴스를 생성합니다.
const app = createApp(App)

// 3. 생성된 인스턴스들을 앱에 등록합니다. (사용)
app.use(router)
app.use(vuetify)

// 4. 마지막으로 화면에 붙입니다.
app.mount('#app')