<template>
  <div class="page">
    <button class="btn btn-back" @click="goBack">
      <i class="fas fa-arrow-left"></i> Trang Chủ
    </button>

    <div
      class="container d-flex justify-content-center align-items-center vh-100"
    >
      <div class="card p-4" style="width: 100%; max-width: 400px">
        <div class="card-body">
          <h3 class="card-title text-center mb-4 text-primary font-weight-bold">
            ĐĂNG NHẬP ĐỘC GIẢ
          </h3>

          <form @submit.prevent="login">
            <div class="mb-3">
              <label class="form-label text-dark"
                >Họ và tên (Hoặc Mã ĐG):</label
              >
              <input
                type="text"
                v-model="hoTen"
                class="form-control"
                placeholder="VD: Nguyễn Văn A"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label text-dark">Mật khẩu:</label>
              <input
                type="password"
                v-model="password"
                class="form-control"
                placeholder="Nhập mật khẩu..."
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 mt-3"
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
      isLoading: false,
    };
  },
  methods: {
    async login() {
      this.isLoading = true;
      try {
        // GỌI API: /api/readers/login
        const response = await fetch(
          "http://localhost:3000/api/readers/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              // Backend đang check theo HOLOT, nhưng tốt nhất nên sửa Backend để check theo MADOCGIA
              // Tạm thời gửi HOLOT theo code cũ của em
              HOLOT: this.hoTen,
              PASSWORD: this.password,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          // LƯU THÔNG TIN QUAN TRỌNG (Không lưu password)
          localStorage.setItem("HoTenDG", data.reader.TEN); // Lưu tên để hiển thị
          localStorage.setItem("MaDocGia", data.reader.MADOCGIA); // QUAN TRỌNG: Dùng để chat/mượn sách

          alert("✅ Đăng nhập thành công!");

          // Chuyển hướng đến Thư Viện Online
          this.$router.push({ name: "LibraryOnline" });
        } else {
          alert("❌ Lỗi: " + data.message);
        }
      } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert("Không thể kết nối đến server");
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

/* Card login */
.card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 15px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);
  /* Xóa margin-right: 50% để căn giữa */
}

/* Nút Back */
.btn-back {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
}
.btn-back:hover {
  background-color: #0056b3;
}

/* Input field đẹp hơn */
.form-control {
  padding: 10px;
  border-radius: 8px;
}
.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
