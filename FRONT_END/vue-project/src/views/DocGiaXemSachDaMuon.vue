<template>
  <div class="page">
    <button class="btn btn-back" @click="logout">Đăng Xuất</button>

    <div class="container py-4">
      <div class="header mb-4">
        <h1>LỊCH SỬ MƯỢN SÁCH CỦA: {{ HoTenDG }}</h1>
      </div>

      <nav class="nav-container mb-4">
        <div class="nav-item" @click="navTo('LibraryOnline')">
          Thư Viện Online
        </div>
        <div class="nav-item active">Lịch Sử Mượn</div>
        <div class="nav-item" @click="navTo('ChatWithStaff')">
          Chat Nhân Viên
        </div>
        <div class="nav-item" @click="navTo('ChatAI')">Hỏi AI</div>
      </nav>

      <div class="card shadow-lg bg-white-transparent">
        <div class="card-body">
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-dark">Đang tải dữ liệu...</p>
          </div>

          <div
            v-else-if="transactions.length === 0"
            class="alert alert-info text-center"
          >
            Bạn chưa mượn cuốn sách nào. Hãy ghé thăm thư viện nhé!
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle text-dark">
              <thead class="table-primary text-center">
                <tr>
                  <th>Sách</th>
                  <th>Ngày Mượn</th>
                  <th>Hạn Trả</th>
                  <th>Người Lập</th>
                  <th>Trạng Thái</th>
                  <th>Tiền Phạt</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedItems" :key="item._id">
                  <td>
                    <strong>{{ item.TENSACH }}</strong
                    ><br />
                    <small class="text-muted">Mã: {{ item.MASACH }}</small>
                  </td>
                  <td class="text-center">{{ formatDate(item.NGAYMUON) }}</td>
                  <td class="text-center">{{ formatDate(item.NGAYTRA) }}</td>
                  <td class="text-center">{{ item.NGUOILAP }}</td>

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

                  <td class="text-center text-danger fw-bold">
                    {{
                      item.TIENPHAT > 0 ? formatCurrency(item.TIENPHAT) : "-"
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-flex justify-content-center mt-3" v-if="totalPages > 1">
            <button
              class="btn btn-sm btn-primary me-2"
              @click="prevPage"
              :disabled="currentPage === 1"
            >
              Trước
            </button>
            <span class="align-self-center mx-2"
              >Trang {{ currentPage }} / {{ totalPages }}</span
            >
            <button
              class="btn btn-sm btn-primary ms-2"
              @click="nextPage"
              :disabled="currentPage === totalPages"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-3 text-white">
      <p>
        <i class="fas fa-info-circle"></i> Nếu có sai sót về thông tin mượn trả,
        vui lòng liên hệ nhân viên qua Chat.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "DocGiaXemDanhSachDaMuon",
  data() {
    return {
      HoTenDG: "",
      transactions: [],
      isLoading: false,
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.transactions.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.transactions.slice(start, start + this.itemsPerPage);
    },
  },
  mounted() {
    this.checkLogin();
    this.fetchMyHistory();
  },
  methods: {
    // 1. Kiểm tra đăng nhập (Lấy từ localStorage)
    checkLogin() {
      const storedName = localStorage.getItem("HoTenDG"); // Hoặc dùng MaDocGia nếu em lưu
      // Giả sử em lưu MaDocGia khi đăng nhập
      const storedID = localStorage.getItem("MaDocGia");

      if (!storedID) {
        alert("Vui lòng đăng nhập trước!");
        this.$router.push({ name: "ReaderLogin" });
        return;
      }
      this.HoTenDG = storedName || "Bạn";
    },

    // 2. Gọi API lấy lịch sử mượn
    async fetchMyHistory() {
      this.isLoading = true;
      const maDocGia = localStorage.getItem("MaDocGia"); // Cần lưu cái này lúc Login

      try {
        // GỌI API: GET /api/transaction/borrower-details?MADOCGIA=DG001
        const response = await fetch(
          `http://localhost:3000/api/transaction/borrower-details?MADOCGIA=${maDocGia}`
        );

        if (response.ok) {
          const data = await response.json();
          // Sắp xếp: Mới nhất lên đầu
          this.transactions = data.sort(
            (a, b) => new Date(b.NGAYMUON) - new Date(a.NGAYMUON)
          );
        } else {
          // Nếu backend trả về lỗi (ví dụ 404: Chưa mượn sách nào)
          this.transactions = [];
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // 3. Tiện ích
    navTo(routeName) {
      this.$router.push({ name: routeName });
    },
    logout() {
      localStorage.clear();
      this.$router.push({ name: "ReaderLogin" });
    },
    formatDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("vi-VN");
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
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
  },
};
</script>

<style scoped>
.page {
  background: linear-gradient(
      135deg,
      rgba(0, 102, 204, 0.8),
      rgba(0, 102, 204, 0.2)
    ),
    url("https://thsp.ctu.edu.vn/images/upload/MssDiem/atl1.jpg");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  color: white;
  font-family: "K2D", sans-serif;
}

/* Header */
.header h1 {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: bold;
  text-align: center;
}

/* Nav Menu */
.nav-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.nav-item {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-item:hover,
.nav-item.active {
  background: #ff6b6b;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
}

/* Card trong suốt */
.bg-white-transparent {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
}

/* Nút Back */
.btn-back {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
}
</style>
