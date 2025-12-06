<template>
  <div class="pagecontent">
    <div class="container py-5 text-center">
      <h1>👋 CHÀO MỪNG QUẢN TRỊ VIÊN</h1>
      <p class="lead mt-3">
        Đây là bảng điều khiển chính. Vui lòng chọn chức năng từ menu bên.
      </p>
      <router-link :to="{ name: 'ThemNhanVien' }" class="btn btn-primary mt-4">
        Quản lý Nhân Viên
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminHome",
  // Có thể thêm logic load dữ liệu admin tại đây sau này
};
</script>

<style scoped>
.pagecontent {
  background-color: #f4f6f9;
  min-height: 100vh;
}
</style>
