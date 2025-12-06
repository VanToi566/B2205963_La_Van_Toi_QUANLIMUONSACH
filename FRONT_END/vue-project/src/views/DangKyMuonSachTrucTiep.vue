<template>
  <div class="pagecontent">
    <div class="sidebar">
      <h2>MENU MƯỢN TRẢ</h2>
      <p class="active"><i class="fas fa-book"></i> MƯỢN TRỰC TIẾP</p>
      <p @click="navTo('LoanList')">
        <i class="fas fa-list"></i> DANH SÁCH ĐƠN MƯỢN
      </p>
      <p @click="navTo('SearchInfo')">
        <i class="fas fa-search"></i> TRA CỨU THÔNG TIN
      </p>
      <p @click="navTo('UpdateStock')">
        <i class="fas fa-boxes"></i> CẬP NHẬT KHO
      </p>
      <p @click="navTo('ReturnApprove')">
        <i class="fas fa-undo"></i> DUYỆT TRẢ SÁCH
      </p>
    </div>

    <div class="content">
      <button class="btn btn-back" @click="logout">
        <i class="fas fa-sign-out-alt"></i> Đăng Xuất
      </button>

      <div class="header">
        <h1>ĐĂNG KÝ MƯỢN SÁCH TRỰC TIẾP</h1>
      </div>

      <div class="card p-4 shadow-sm mb-5 text-dark">
        <h4 class="mb-3 text-primary">Nhập thông tin mượn</h4>
        <form @submit.prevent="submitForm">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Mã Độc Giả:</label>
              <input
                type="text"
                v-model="formData.MADOCGIA"
                class="form-control"
                placeholder="VD: DG001"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Mã Sách:</label>
              <input
                type="text"
                v-model="formData.MASACH"
                class="form-control"
                placeholder="VD: S001"
                required
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Mã Nhân Viên (Người lập):</label>
              <input
                type="text"
                v-model="formData.MSNV"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Hạn Trả (Ngày trả dự kiến):</label>
              <input
                type="date"
                v-model="formData.NGAYTRA"
                class="form-control"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100">
            <i class="fas fa-save"></i> Tạo Phiếu Mượn
          </button>
        </form>
      </div>

      <h3 class="mt-5 text-dark border-bottom pb-2">Lịch Sử Mượn Gần Đây</h3>
      <div class="table-responsive">
        <table class="table table-striped table-hover mt-3 text-dark">
          <thead class="table-primary">
            <tr>
              <th>Mã ĐG</th>
              <th>Mã Sách</th>
              <th>Nhân Viên</th>
              <th>Ngày Mượn</th>
              <th>Hạn Trả</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in transactions" :key="t._id">
              <td>{{ t.MADOCGIA }}</td>
              <td>{{ t.MASACH }}</td>
              <td>{{ t.MSNV }}</td>
              <td>{{ formatDate(t.NGAYMUON) }}</td>
              <td>{{ formatDate(t.NGAYTRA) }}</td>
              <td>
                <span v-if="t.TRANGTHAI === 1" class="badge bg-secondary"
                  >Đã trả</span
                >
                <span v-else class="badge bg-success">Đang mượn</span>
              </td>
            </tr>
          </tbody>
        </table>
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
      formData: {
        MADOCGIA: "",
        MASACH: "",
        MSNV: "",
        NGAYTRA: "", // Chỉ cần nhập ngày hẹn trả
      },
      transactions: [],
    };
  },
  mounted() {
    // Tự động điền Mã NV nếu đã đăng nhập (Optional)
    // Nếu em lưu MSNV lúc login thì lấy ra gán vào đây
    // this.formData.MSNV = ...

    this.loadTransactions();
  },
  methods: {
    // 1. Điều hướng chuẩn Vue Router
    navTo(routeName) {
      this.$router.push({ name: routeName });
    },

    // 2. Đăng xuất
    logout() {
      if (confirm("Đăng xuất khỏi hệ thống?")) {
        localStorage.clear();
        this.$router.push({ name: "StaffLogin" });
      }
    },

    // 3. Tải danh sách phiếu mượn
    async loadTransactions() {
      try {
        // SỬA URL: transactions -> transaction (số ít)
        const response = await fetch("http://localhost:3000/api/transaction");
        if (response.ok) {
          this.transactions = await response.json();
        }
      } catch (error) {
        console.error("Lỗi tải danh sách:", error);
      }
    },

    // 4. Gửi Form Tạo Phiếu Mượn
    async submitForm() {
      try {
        // SỬA URL: transactions -> transaction
        const response = await fetch("http://localhost:3000/api/transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...this.formData,
            NGAYMUON: new Date(), // Mặc định ngày mượn là hôm nay
          }),
        });

        const result = await response.json();

        if (response.ok) {
          alert("✅ Mượn sách thành công! (Kho đã được trừ)");
          this.loadTransactions(); // Reload bảng
          // Reset form (giữ lại mã NV cho tiện)
          this.formData.MADOCGIA = "";
          this.formData.MASACH = "";
        } else {
          alert("❌ Lỗi: " + result.message);
        }
      } catch (error) {
        console.error("Lỗi gửi dữ liệu:", error);
        alert("Lỗi kết nối server!");
      }
    },

    // Format ngày tháng
    formatDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("vi-VN");
    },
  },
};
</script>

<style scoped>
/* Layout */
.pagecontent {
  background: #f4f6f9;
  min-height: 100vh; /* Sửa lỗi chiều cao cố định */
  display: flex;
  font-family: "K2D", sans-serif;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: #0066cc;
  padding-top: 20px;
  position: fixed;
  height: 100%;
  color: white;
  z-index: 99;
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

/* Main Content */
.content {
  margin-left: 280px;
  padding: 40px;
  flex: 1;
}

.header {
  background: linear-gradient(135deg, #0066cc, #00c6ff);
  color: white;
  padding: 30px;
  text-align: center;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
  z-index: 100;
  transition: 0.3s;
}
.btn-back:hover {
  background-color: #ee5253;
}

/* Table */
.table thead {
  background-color: #0066cc;
  color: white;
}

/* Messenger Icon */
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
</style>
