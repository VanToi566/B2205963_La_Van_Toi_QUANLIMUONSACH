<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* --- STYLE TOÀN CỤC (Áp dụng cho mọi trang) --- */

/* Import font K2D nếu chưa có ở index.html (hoặc dùng link CDN) */
@import url("https://fonts.googleapis.com/css2?family=K2D:wght@300;400;500;700&display=swap");

#app {
  /* Thiết lập font chữ mặc định cho toàn bộ ứng dụng */
  font-family: "K2D", sans-serif, Arial;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f4f6f9; /* Màu nền xám nhẹ dễ chịu cho mắt */
}

/* Tùy chỉnh thanh cuộn (Scrollbar) cho đẹp */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animation chuyển trang mượt mà (Tùy chọn) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
