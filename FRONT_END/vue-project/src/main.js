import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Khởi tạo app
const app = createApp(App);

// Sử dụng Router
app.use(router);

// Mount vào DOM
app.mount('#app');