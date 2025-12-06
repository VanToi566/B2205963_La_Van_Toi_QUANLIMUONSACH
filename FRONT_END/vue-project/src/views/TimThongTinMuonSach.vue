<template>
  <div class="pagecontent">
    <div class="sidebar">
      <h2>MENU MƯỢN TRẢ</h2>
      <p @click="navTo('LoanRegister')">
        <i class="fas fa-book"></i> MƯỢN TRỰC TIẾP
      </p>
      <p @click="navTo('LoanList')">
        <i class="fas fa-list"></i> DANH SÁCH ĐƠN MƯỢN
      </p>
      <p class="active"><i class="fas fa-search"></i> TRA CỨU THÔNG TIN</p>
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

      <div class="header mb-4">
        <h1>TRA CỨU LỊCH SỬ MƯỢN</h1>
      </div>

      <div class="card p-4 shadow-sm text-dark mb-4">
        <label class="form-label fw-bold">Nhập Mã Độc Giả cần tra cứu:</label>
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="VD: DG001"
            v-model="madocgia"
            @keyup.enter="searchHistory"
          />
          <button class="btn btn-primary" @click="searchHistory">
            <i class="fas fa-search"></i> Tìm Kiếm
          </button>
        </div>
      </div>

      <div v-if="transactions.length > 0" class="card p-4 shadow-sm text-dark">
        <h4 class="text-primary mb-3">
          Lịch sử mượn của: {{ transactions[0].TEN_DOCGIA }} ({{ madocgia }})
        </h4>

        <div class="table-responsive">
          <table class="table table-striped table-hover align-middle">
            <thead class="table-info text-center">
              <tr>
                <th>Mã Sách</th>
                <th>Tên Sách</th>
                <th>Ngày Mượn</th>
                <th>Ngày Trả (Hẹn/Thực)</th>
                <th>Trạng Thái</th>
                <th>Ghi Chú</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in transactions" :key="t._id">
                <td>{{ t.MASACH }}</td>
                <td>{{ t.TENSACH }}</td>
                <td class="text-center">{{ formatDate(t.NGAYMUON) }}</td>

                <td class="text-center">
                  <div v-if="t.TRANGTHAI === 1" class="text-success">
                    Thực tế: {{ formatDate(t.NGAYTRA) }}
                  </div>
                  <div v-else class="text-danger">
                    Hạn: {{ formatDate(t.NGAYTRA) }}
                  </div>
                </td>

                <td class="text-center">
                  <span v-if="t.TRANGTHAI === 1" class="badge bg-secondary"
                    >Đã trả</span
                  >
                  <span v-else-if="isOverdue(t.NGAYTRA)" class="badge bg-danger"
                    >Quá hạn</span
                  >
                  <span v-else class="badge bg-warning text-dark"
                    >Đang mượn</span
                  >
                </td>

                <td class="text-center">
                  <span v-if="t.TIENPHAT > 0" class="text-danger fw-bold"
                    >Phạt: {{ formatCurrency(t.TIENPHAT) }}</span
                  >
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="searched && transactions.length === 0"
        class="alert alert-warning text-center mt-3"
      >
        Không tìm thấy dữ liệu mượn trả của mã độc giả "<strong>{{
          madocgia
        }}</strong
        >".
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
      madocgia: "",
      transactions: [],
      searched: false,
    };
  },
  methods: {
    // 1. Gọi API tra cứu
    async searchHistory() {
      if (!this.madocgia.trim()) {
        alert("Vui lòng nhập Mã Độc Giả!");
        return;
      }

      this.searched = false;
      this.transactions = [];

      try {
        // GỌI API: GET /api/transaction/borrower-details?MADOCGIA=...
        const response = await fetch(
          `http://localhost:3000/api/transaction/borrower-details?MADOCGIA=${this.madocgia}`
        );

        if (response.ok) {
          const data = await response.json();
          this.transactions = data;
        } else {
          // Nếu API trả về 404 (Không tìm thấy)
          this.transactions = [];
        }
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi kết nối Server!");
      } finally {
        this.searched = true;
      }
    },

    // 2. Tiện ích
    navTo(routeName) {
      this.$router.push({ name: routeName });
    },
    logout() {
      if (confirm("Đăng xuất?")) {
        localStorage.clear();
        this.$router.push({ name: "StaffLogin" });
      }
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    },
    formatCurrency(value) {
      return value.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    },
    isOverdue(dueDate) {
      return new Date() > new Date(dueDate);
    },
  },
};
</script>

<style scoped>
/* Giữ nguyên style chung */
.pagecontent {
  background: #f4f6f9;
  min-height: 100vh;
  display: flex;
  font-family: "K2D", sans-serif;
}

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
