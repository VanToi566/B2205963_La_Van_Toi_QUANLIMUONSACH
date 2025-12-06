<template>
  <div class="page">
    <button class="btn btn-back" @click="goBack">Quay Lại</button>

    <div class="container py-4">
      <div class="header text-center mb-4 text-white">
        <h1>YÊU CẦU TRẢ SÁCH</h1>
      </div>

      <nav class="nav-container mb-4">
        <div class="nav-item" @click="navTo('LibraryOnline')">Thư Viện</div>
        <div class="nav-item" @click="navTo('MyBooks')">Lịch Sử</div>
        <div class="nav-item active">Trả Sách</div>
        <div class="nav-item" @click="navTo('ChatWithStaff')">Hỗ Trợ</div>
      </nav>

      <div class="card shadow-lg">
        <div class="card-body">
          <h4 class="text-primary mb-3">Sách Bạn Đang Mượn</h4>

          <div
            v-if="borrowingBooks.length === 0"
            class="alert alert-success text-center"
          >
            Bạn không có cuốn sách nào đang mượn.
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-dark text-center">
                <tr>
                  <th>Tên Sách</th>
                  <th>Ngày Mượn</th>
                  <th>Hạn Trả</th>
                  <th>Trạng Thái</th>
                  <th>Hướng Dẫn</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in borrowingBooks" :key="book._id">
                  <td>
                    <strong>{{ book.TENSACH }}</strong
                    ><br />
                    <small>Mã: {{ book.MASACH }}</small>
                  </td>
                  <td class="text-center">{{ formatDate(book.NGAYMUON) }}</td>
                  <td
                    class="text-center"
                    :class="{ 'text-danger fw-bold': isOverdue(book.NGAYTRA) }"
                  >
                    {{ formatDate(book.NGAYTRA) }}
                  </td>
                  <td class="text-center">
                    <span v-if="isOverdue(book.NGAYTRA)" class="badge bg-danger"
                      >Quá Hạn</span
                    >
                    <span v-else class="badge bg-warning text-dark"
                      >Đang Mượn</span
                    >
                  </td>
                  <td class="text-center">
                    <button
                      class="btn btn-primary btn-sm"
                      @click="showInstruction(book)"
                    >
                      <i class="fas fa-info-circle"></i> Cách Trả
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="alert alert-info mt-4 text-center shadow">
        <h5><i class="fas fa-bullhorn"></i> QUY ĐỊNH TRẢ SÁCH</h5>
        <p>Để trả sách, vui lòng mang sách trực tiếp đến quầy thư viện.</p>
        <p>
          Nếu bạn không thể đến, vui lòng liên hệ nhân viên qua mục
          <strong>Chat Hỗ Trợ</strong>.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      allTransactions: [],
    };
  },
  computed: {
    // Chỉ lọc ra những cuốn ĐANG MƯỢN (TRANGTHAI = 0)
    borrowingBooks() {
      return this.allTransactions.filter((t) => t.TRANGTHAI === 0);
    },
  },
  mounted() {
    this.fetchMyBooks();
  },
  methods: {
    async fetchMyBooks() {
      const maDocGia = localStorage.getItem("MaDocGia");
      if (!maDocGia) return;

      try {
        // GỌI API BACKEND THẬT
        const response = await fetch(
          `http://localhost:3000/api/transaction/borrower-details?MADOCGIA=${maDocGia}`
        );
        if (response.ok) {
          this.allTransactions = await response.json();
        }
      } catch (error) {
        console.error("Lỗi:", error);
      }
    },

    showInstruction(book) {
      alert(
        `ĐỂ TRẢ SÁCH "${
          book.TENSACH
        }":\n\n1. Mang sách đến quầy thư viện.\n2. Đọc Mã phiếu: ${book._id.slice(
          -6
        )}\n3. Nhân viên sẽ kiểm tra và xác nhận trả trên hệ thống.`
      );
    },

    navTo(routeName) {
      this.$router.push({ name: routeName });
    },
    goBack() {
      this.$router.push({ name: "LibraryOnline" });
    },

    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    },
    isOverdue(date) {
      return new Date() > new Date(date);
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
  min-height: 100vh;
  font-family: "K2D", sans-serif;
}

.nav-container {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.nav-item {
  padding: 10px 20px;
  background: white;
  color: #007bff;
  font-weight: bold;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.nav-item:hover,
.nav-item.active {
  background: #ff6b6b;
  color: white;
  transform: translateY(-2px);
}

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
