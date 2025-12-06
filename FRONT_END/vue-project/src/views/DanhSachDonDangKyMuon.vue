<template>
  <div class="pagecontent">
    <div class="sidebar">
      <h2>MENU MƯỢN TRẢ</h2>
      <p @click="navTo('LoanRegister')">
        <i class="fas fa-book"></i> MƯỢN TRỰC TIẾP
      </p>
      <p class="active"><i class="fas fa-list"></i> DANH SÁCH ĐƠN MƯỢN</p>
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
        <h1>DANH SÁCH PHIẾU MƯỢN SÁCH</h1>
      </div>

      <div
        class="alert alert-info text-center mt-4"
        v-if="transactions.length === 0"
      >
        <i class="fas fa-info-circle"></i> Chưa có phiếu mượn nào trong hệ
        thống.
      </div>

      <div class="card shadow-sm mt-4 text-dark" v-else>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover align-middle">
              <thead class="table-primary text-center">
                <tr>
                  <th>Mã Phiếu</th>
                  <th>Độc Giả</th>
                  <th>Sách</th>
                  <th>Ngày Mượn</th>
                  <th>Hạn Trả</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedTransactions" :key="item._id">
                  <td>
                    <small>{{ item._id.slice(-6) }}...</small>
                  </td>
                  <td>
                    <strong>{{ item.MADOCGIA }}</strong>
                  </td>
                  <td>{{ item.MASACH }}</td>
                  <td>{{ formatDate(item.NGAYMUON) }}</td>
                  <td>{{ formatDate(item.NGAYTRA) }}</td>

                  <td class="text-center">
                    <span v-if="item.TRANGTHAI === 1" class="badge bg-secondary"
                      >Đã trả</span
                    >
                    <span
                      v-else-if="isOverdue(item.NGAYTRA)"
                      class="badge bg-danger"
                      >Quá hạn</span
                    >
                    <span v-else class="badge bg-success">Đang mượn</span>
                  </td>

                  <td class="text-center">
                    <button
                      v-if="item.TRANGTHAI === 0"
                      class="btn btn-warning btn-sm"
                      @click="processReturn(item._id)"
                    >
                      <i class="fas fa-undo"></i> Trả Sách
                    </button>
                    <span v-else class="text-success"
                      ><i class="fas fa-check"></i> Hoàn tất</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-container mt-3" v-if="totalPages > 1">
            <button
              class="btn btn-sm btn-outline-primary"
              @click="prevPage"
              :disabled="currentPage === 1"
            >
              <i class="fas fa-chevron-left"></i> Trước
            </button>
            <span class="mx-3 fw-bold"
              >Trang {{ currentPage }} / {{ totalPages }}</span
            >
            <button
              class="btn btn-sm btn-outline-primary"
              @click="nextPage"
              :disabled="currentPage === totalPages"
            >
              Sau <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
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
      transactions: [], // Chứa dữ liệu từ API MongoDB
      currentPage: 1,
      itemsPerPage: 10, // Hiển thị 10 dòng mỗi trang
    };
  },
  computed: {
    // Cắt danh sách theo trang
    paginatedTransactions() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.transactions.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.transactions.length / this.itemsPerPage);
    },
  },
  mounted() {
    this.fetchTransactions(); // Gọi API ngay khi vào trang
  },
  methods: {
    // 1. LẤY DỮ LIỆU TỪ BACKEND
    async fetchTransactions() {
      try {
        // Gọi đúng API chúng ta đã xây dựng: GET /api/transaction
        const response = await fetch("http://localhost:3000/api/transaction");
        if (response.ok) {
          const data = await response.json();
          // Sắp xếp phiếu mới nhất lên đầu
          this.transactions = data.sort(
            (a, b) => new Date(b.NGAYMUON) - new Date(a.NGAYMUON)
          );
        } else {
          console.error("Lỗi tải dữ liệu");
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Không thể kết nối đến Server!");
      }
    },

    // 2. XỬ LÝ TRẢ SÁCH (Gọi API Return)
    async processReturn(transactionId) {
      if (!confirm("Xác nhận nhận lại sách này?")) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/transaction/return/${transactionId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await response.json();

        if (response.ok) {
          // Kiểm tra phạt
          const { tienPhat, soNgayTre } = result.chiTiet;
          if (soNgayTre > 0) {
            alert(
              `⚠️ SÁCH TRẢ TRỄ ${soNgayTre} NGÀY!\n💰 Tiền phạt: ${tienPhat.toLocaleString()} VNĐ`
            );
          } else {
            alert("✅ Trả sách thành công!");
          }
          // Load lại bảng
          this.fetchTransactions();
        } else {
          alert("Lỗi: " + result.message);
        }
      } catch (error) {
        console.error(error);
        alert("Lỗi kết nối server");
      }
    },

    // 3. ĐIỀU HƯỚNG
    navTo(routeName) {
      this.$router.push({ name: routeName });
    },
    logout() {
      if (confirm("Đăng xuất?")) {
        localStorage.clear();
        this.$router.push({ name: "StaffLogin" });
      }
    },

    // 4. TIỆN ÍCH
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("vi-VN");
    },
    isOverdue(dueDate) {
      return new Date() > new Date(dueDate);
    },
  },
};
</script>

<style scoped>
/* Giữ nguyên style nền và sidebar của em, chỉ chỉnh lại chút cho gọn */
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

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
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
