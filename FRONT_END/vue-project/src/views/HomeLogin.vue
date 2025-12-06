<template>
  <div class="page">
    <div class="sidebar">
      <h2><i class="fas fa-book-reader"></i> NỘI QUY HỆ THỐNG</h2>
      <div class="rules">
        <ul>
          <li>
            <i class="fas fa-check-circle"></i> 1. Độc giả phải đăng nhập để
            mượn sách.
          </li>
          <li>
            <i class="fas fa-check-circle"></i> 2. Nhân viên chỉ có quyền duyệt
            hoặc từ chối đơn mượn.
          </li>
          <li>
            <i class="fas fa-check-circle"></i> 3. Quản trị viên có quyền quản
            lý tất cả các hoạt động.
          </li>
          <li>
            <i class="fas fa-check-circle"></i> 4. Mỗi người chỉ mượn tối đa 3
            cuốn sách.
          </li>
          <li>
            <i class="fas fa-check-circle"></i> 5. Mượn sách phải trả đúng hạn
            để tránh phạt.
          </li>
        </ul>
      </div>
    </div>

    <div class="card shadow-lg">
      <div class="header text-center mb-4">
        <h1 class="title">HỆ THỐNG THƯ VIỆN</h1>
        <p class="subtitle">Vui lòng chọn vai trò để tiếp tục</p>
      </div>

      <div class="card-body">
        <button
          @click="navTo('ReaderLogin')"
          class="btn btn-primary btn-lg w-100 mb-3 hover-effect"
        >
          <div class="d-flex align-items-center justify-content-center">
            <i class="fas fa-user-graduate me-2"></i> Đăng Nhập Độc Giả
          </div>
        </button>

        <button
          @click="navTo('StaffLogin')"
          class="btn btn-success btn-lg w-100 mb-3 hover-effect"
        >
          <div class="d-flex align-items-center justify-content-center">
            <i class="fas fa-user-tie me-2"></i> Đăng Nhập Nhân Viên
          </div>
        </button>

        <button
          @click="navTo('AdminLogin')"
          class="btn btn-warning btn-lg w-100 hover-effect text-white"
        >
          <div class="d-flex align-items-center justify-content-center">
            <i class="fas fa-user-shield me-2"></i> Đăng Nhập Quản Trị
          </div>
        </button>
      </div>
    </div>

    <div class="footer">
      <p>
        &copy; 2025 Hệ Thống Quản Lý Thư Viện Đại Học - Developed by Students
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeLogin",
  methods: {
    // Hàm điều hướng chung, sử dụng Router Name
    navTo(routeName) {
      this.$router.push({ name: routeName });
    },
  },
};
</script>

<style scoped>
/* Tổng thể trang */
.page {
  font-family: "K2D", sans-serif;
  background: linear-gradient(
      135deg,
      rgba(0, 102, 204, 0.9),
      rgba(0, 50, 100, 0.8)
    ),
    url("https://thsp.ctu.edu.vn/images/upload/MssDiem/atl1.jpg"); /* Thêm ảnh nền mờ */
  background-size: cover;
  background-position: center;
  background-blend-mode: multiply;
  color: white;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

/* Sidebar bên trái */
.sidebar {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  color: white;
  width: 350px;
  height: 100vh;
  padding: 40px;
  position: absolute;
  top: 0;
  left: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.sidebar h2 {
  font-size: 1.5rem;
  margin-bottom: 30px;
  font-weight: bold;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.rules ul {
  list-style: none;
  padding-left: 0;
}

.rules ul li {
  font-size: 1.1rem;
  margin-bottom: 20px;
  line-height: 1.5;
  display: flex;
  align-items: start;
}

.rules ul li i {
  color: #2ecc71;
  margin-right: 10px;
  margin-top: 5px;
}

/* Card Đăng Nhập */
.card {
  border-radius: 20px;
  padding: 40px;
  width: 500px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
  z-index: 20;
  margin-left: 300px; /* Đẩy sang phải để không bị Sidebar che */
}

.card:hover {
  transform: translateY(-5px);
}

.title {
  color: #004085;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-style: italic;
}

/* Nút bấm */
.btn {
  font-weight: bold;
  border-radius: 50px;
  padding: 12px;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.hover-effect:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.footer {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-left: 175px; /* Cân chỉnh footer */
}

/* Responsive: Ẩn sidebar trên màn hình nhỏ */
@media (max-width: 900px) {
  .sidebar {
    display: none;
  }
  .card {
    margin-left: 0;
    width: 90%;
  }
  .footer {
    margin-left: 0;
  }
}
</style>
