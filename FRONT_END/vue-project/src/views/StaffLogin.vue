<template>
  <div class="page">
    <button class="btn btn-back" @click="goBack">
      <i class="fas fa-arrow-left"></i> Trang Chủ
    </button>

    <div
      class="container d-flex justify-content-center align-items-center vh-100"
    >
      <div class="card" style="width: 100%; max-width: 400px">
        <div class="card-body p-4">
          <h3 class="card-title text-center mb-4 text-primary font-weight-bold">
            ĐĂNG NHẬP NHÂN VIÊN
          </h3>

          <form id="loginForm" @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="msnv" class="form-label text-dark"
                >Mã số nhân viên (Hoặc Họ tên):</label
              >
              <input
                type="text"
                id="msnv"
                v-model="msnv"
                class="form-control"
                placeholder="VD: NV001"
                required
              />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label text-dark"
                >Mật khẩu:</label
              >
              <input
                type="password"
                id="password"
                v-model="password"
                class="form-control"
                placeholder="Nhập mật khẩu..."
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 mt-2"
              :disabled="isLoading"
            >
              {{ isLoading ? "Đang xử lý..." : "Đăng nhập" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msnv: "", // Đổi từ hoTen sang msnv cho chuẩn nghiệp vụ
      password: "",
      isLoading: false,
    };
  },
  methods: {
    async handleLogin() {
      this.isLoading = true;
      try {
        const response = await fetch("http://localhost:3000/api/staff/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            MSNV: this.msnv, // Gửi MSNV (Backend sẽ check MSNV hoặc HoTen)
            Password: this.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Lưu thông tin an toàn
          localStorage.setItem("HoTenNV", data.staff.HoTenNV);
          localStorage.setItem("MSNV", data.staff.MSNV); // Lưu mã để dùng sau này
          // Tuyệt đối KHÔNG lưu password

          alert("✅ Đăng nhập thành công");

          // Chuyển hướng chuẩn Vue Router
          this.$router.push({ name: "LoanList" }); // Chuyển đến trang Danh sách mượn
        } else {
          alert("❌ Lỗi: " + data.message);
        }
      } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert("Lỗi kết nối Server");
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      this.$router.push({ name: "Home" });
    },
  },
};
</script>

<style scoped>
.page {
  background: url("https://reviewedu.net/wp-content/uploads/2021/08/dai-hoc-can-tho-ctu1-1.jpg")
    no-repeat center center fixed;
  background-size: cover;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  font-family: "K2D", sans-serif;
}

.card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);
  /* Đã xóa margin-right: 50% để căn giữa */
}

/* Nút Back */
.btn-back {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #007bff;
  border-color: #007bff;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  border: none;
}
.btn-back:hover {
  background-color: #0056b3;
}

/* Input */
.form-control {
  padding: 10px;
  border-radius: 8px;
}
.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
