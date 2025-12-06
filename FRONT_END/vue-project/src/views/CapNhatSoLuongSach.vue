<template>
  <div class="pagecontent">
    <div class="sidebar">
      <h2>MENU KHO SÁCH</h2>
      <p @click="navTo('LoanRegister')">
        <i class="fas fa-book"></i> ĐƠN ĐĂNG KÝ MƯỢN
      </p>
      <p @click="navTo('SearchInfo')">
        <i class="fas fa-search"></i> TRA CỨU MƯỢN TRẢ
      </p>
      <p @click="navTo('LoanRegister')">
        <i class="fas fa-user-plus"></i> MƯỢN TRỰC TIẾP
      </p>

      <p class="active"><i class="fas fa-boxes"></i> CẬP NHẬT KHO SÁCH</p>

      <p @click="navTo('ReturnApprove')">
        <i class="fas fa-undo"></i> DUYỆT TRẢ SÁCH
      </p>

      <p @click="navTo('AddBook')">
        <i class="fas fa-plus-circle"></i> THÊM SÁCH MỚI
      </p>
    </div>

    <button class="btn btn-back" @click="logout">
      <i class="fas fa-sign-out-alt"></i> Đăng Xuất
    </button>

    <div class="container">
      <div class="header">
        <h2 class="text-center">QUẢN LÝ KHO & TRA CỨU</h2>
      </div>

      <div class="card p-4 mb-4 shadow-sm text-dark">
        <h5 class="mb-3">Tìm kiếm sách</h5>
        <div class="input-group mb-3">
          <input
            type="text"
            class="form-control"
            placeholder="Nhập Mã Sách (VD: S001)..."
            v-model="bookId"
            @keyup.enter="fetchBook"
          />
          <button class="btn btn-primary" @click="fetchBook">
            <i class="fas fa-search"></i> Tìm Kiếm
          </button>
        </div>
      </div>

      <div id="bookInfo" class="card p-4 shadow-sm text-dark" v-if="book">
        <h3 class="text-center text-primary mb-4">THÔNG TIN CHI TIẾT</h3>

        <div class="row">
          <div class="col-md-6">
            <p><strong>Mã sách:</strong> {{ book.MASACH }}</p>
            <p><strong>Tên sách:</strong> {{ book.TENSACH }}</p>
            <p><strong>Tác giả:</strong> {{ book.TACGIA }}</p>
            <p><strong>Nhà xuất bản:</strong> {{ book.NHAXUATBAN }}</p>
          </div>
          <div class="col-md-6">
            <p><strong>Đơn giá:</strong> {{ formatCurrency(book.DONGIA) }}</p>
            <p>
              <strong>Tồn kho hiện tại:</strong>
              <span class="badge bg-warning text-dark fs-6">{{
                book.SOQUYEN
              }}</span>
            </p>
          </div>
        </div>

        <hr />

        <h5 class="mt-3">Nhập kho (Thêm số lượng)</h5>
        <div class="input-group mb-3">
          <input
            type="number"
            class="form-control"
            placeholder="Nhập số lượng cần thêm (VD: 5)"
            v-model.number="newQuantity"
          />
          <button class="btn btn-success" @click="updateQuantity">
            <i class="fas fa-save"></i> Cập Nhật Kho
          </button>
        </div>
        <small class="text-muted"
          >* Nhập số âm để giảm kho (nếu cần điều chỉnh sai sót)</small
        >
      </div>
    </div>

    <button class="messenger-icon" @click="navTo('StaffChat')">
      <span class="chat-text">Chat NV</span>
      <i class="bi bi-chat-dots"></i>
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      bookId: "",
      newQuantity: 0,
      book: null,
    };
  },
  methods: {
    // 1. Hàm điều hướng chung (Sửa lại dùng Router Name)
    navTo(routeName) {
      this.$router.push({ name: routeName });
    },

    // 2. Đăng xuất
    logout() {
      if (confirm("Bạn có chắc muốn đăng xuất?")) {
        localStorage.removeItem("HoTenNV"); // Xóa session nếu có
        this.$router.push({ name: "StaffLogin" });
      }
    },

    // 3. Tìm sách theo Mã Sách (MASACH)
    async fetchBook() {
      if (!this.bookId) {
        alert("Vui lòng nhập Mã sách!");
        return;
      }

      try {
        // Gọi API: GET /api/books/:MASACH
        const response = await fetch(
          `http://localhost:3000/api/books/book/${this.bookId}`
        );

        if (response.ok) {
          this.book = await response.json();
          this.newQuantity = 0; // Reset ô nhập số lượng
        } else {
          alert("❌ Không tìm thấy sách với mã này!");
          this.book = null;
        }
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi kết nối server!");
      }
    },

    // 4. Cập nhật số lượng
    async updateQuantity() {
      if (!this.bookId || this.newQuantity === 0) {
        alert("Vui lòng nhập số lượng cần thay đổi!");
        return;
      }

      try {
        // Gọi API: PUT /api/books/updateBooks/:id
        const response = await fetch(
          `http://localhost:3000/api/books/updateBooks/${this.bookId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ additionalQuantity: this.newQuantity }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          alert("✅ Cập nhật kho thành công!");
          // Cập nhật lại số liệu trên giao diện ngay lập tức
          this.book.SOQUYEN = result.updatedBook.SOQUYEN;
          this.newQuantity = 0;
        } else {
          alert("❌ Thất bại: " + result.message);
        }
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi khi cập nhật!");
      }
    },

    // Hàm phụ trợ: Format tiền tệ
    formatCurrency(value) {
      if (!value) return "0 VNĐ";
      return value.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    },
  },
};
</script>

<style scoped>
/* Layout chính */
.pagecontent {
  background: #f4f6f9; /* Màu nền sáng chuyên nghiệp hơn */
  min-height: 100vh;
  display: flex;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: #0066cc;
  padding-top: 20px;
  position: fixed;
  height: 100%;
  color: white;
  z-index: 100;
}

.sidebar h2 {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 30px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 15px;
}

.sidebar p {
  padding: 15px 25px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
}

.sidebar p i {
  margin-right: 15px;
  width: 20px;
  text-align: center;
}

.sidebar p:hover,
.sidebar p.active {
  background-color: #005bb5;
  border-left: 5px solid #ff9f43;
}

/* Nội dung chính */
.container {
  margin-left: 280px; /* Bằng width sidebar */
  padding: 40px;
  flex: 1;
}

.header {
  margin-bottom: 30px;
}

.header h2 {
  color: #0066cc;
  font-weight: bold;
}

/* Card Info */
#bookInfo {
  background: white;
  border-radius: 8px;
}

/* Nút Logout */
.btn-back {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 5px;
  transition: 0.3s;
  z-index: 101;
}

.btn-back:hover {
  background-color: #ee5253;
}

/* Nút Chat */
.messenger-icon {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #0078ff;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 120, 255, 0.4);
  font-weight: bold;
  z-index: 102;
}

.messenger-icon:hover {
  transform: translateY(-5px);
}
</style>
