<template>
  <div class="login-container">
    <button class="btn btn-back" @click="goBack">Trở lại Trang Chủ</button>

    <div
      class="container d-flex justify-content-center align-items-center vh-100"
    >
      <div class="card" style="width: 100%; max-width: 400px">
        <div class="card-body">
          <h4 class="card-title text-center mb-4">ĐĂNG NHẬP QUẢN TRỊ VIÊN</h4>

          <form @submit.prevent="login">
            <div class="mb-3">
              <label for="hoTen" class="form-label">Họ và tên:</label>
              <input
                type="text"
                id="hoTen"
                v-model="hoTen"
                class="form-control"
                placeholder="Nhập họ tên..."
                required
              />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Mật khẩu:</label>
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
              class="btn btn-primary w-100"
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
      hoTen: "",
      password: "",
      isLoading: false, // Thêm trạng thái loading để UX tốt hơn
    };
  },
  methods: {
    async login() {
      this.isLoading = true; // Bắt đầu load
      try {
        const response = await fetch(
          "http://localhost:3000/api/staff/AdministratorLogin",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              HOTEN: this.hoTen,
              PASSWORD: this.password,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          // 1. Lưu thông tin (KHÔNG LƯU PASSWORD)
          localStorage.setItem("HoTenQTV", this.hoTen);
          localStorage.setItem("Role", "ADMIN"); // Đánh dấu là Admin

          alert("Đăng nhập thành công!");

          // 2. Chuyển hướng đúng theo Router mới (Vào trang Thêm Sách hoặc Dashboard)
          // Sử dụng 'name' thay vì đường dẫn cứng
          this.$router.push({ name: "AddBook" });
        } else {
          alert("Lỗi đăng nhập: " + data.message);
        }
      } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert("Không thể kết nối đến server");
      } finally {
        this.isLoading = false; // Kết thúc load
      }
    },
    goBack() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.login-container {
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
  background: rgba(
    255,
    255,
    255,
    0.85
  ); /* Tăng độ đậm nền một chút cho dễ đọc */
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* Đã xóa margin-right: 50% để card nằm giữa */
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 15px 40px rgba(0, 0, 0, 0.4);
}

h4.card-title {
  color: #00458f;
  font-weight: bold;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  padding: 10px;
  font-weight: bold;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-back {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #dc3545; /* Màu đỏ cho nút thoát/back */
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
}

.btn-back:hover {
  background-color: #c82333;
}

.form-control {
  font-size: 16px;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 8px;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
