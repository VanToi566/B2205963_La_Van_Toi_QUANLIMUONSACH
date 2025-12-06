<template>
  <div class="pagecontent">
    <header class="bg-primary text-white text-center py-4 shadow">
      <h1 class="font-weight-bold">THƯ VIỆN TRỰC TUYẾN</h1>
    </header>

    <nav class="nav-container mt-3">
      <div class="nav-item active">Thư Viện Online</div>
      <div class="nav-item" @click="navTo('MyBooks')">Lịch Sử Mượn</div>
      <div class="nav-item" @click="navTo('RequestReturn')">Yêu Cầu Trả</div>
      <div class="nav-item" @click="navTo('ChatWithStaff')">Hỗ Trợ Online</div>
    </nav>

    <button class="btn btn-back" @click="logout">Đăng Xuất</button>

    <section class="container my-5">
      <div class="row g-4">
        <div v-for="book in paginatedBooks" :key="book.MASACH" class="col-md-4">
          <div class="card book-card h-100 shadow-sm">
            <img
              :src="getImageUrl(book.HINHANH)"
              class="card-img-top book-cover"
              alt="Bìa sách"
              @error="$event.target.src = 'https://via.placeholder.com/150'"
            />

            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-primary fw-bold">
                {{ book.TENSACH }}
              </h5>
              <p class="text-muted mb-1">
                <small>TG: {{ book.TACGIA }}</small>
              </p>
              <p class="text-danger fw-bold mb-2">
                {{ formatCurrency(book.DONGIA) }}
              </p>

              <div class="mt-auto">
                <span v-if="book.SOQUYEN > 0" class="badge bg-success"
                  >Còn {{ book.SOQUYEN }} quyển</span
                >
                <span v-else class="badge bg-secondary">Hết hàng</span>

                <div class="form-check mt-3" v-if="book.SOQUYEN > 0">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="book.MASACH"
                    v-model="selectedBooks"
                    :id="'chk-' + book.MASACH"
                  />
                  <label
                    class="form-check-label user-select-none"
                    :for="'chk-' + book.MASACH"
                  >
                    Chọn mượn
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center mt-4" v-if="totalPages > 1">
        <button
          v-for="page in totalPages"
          :key="page"
          class="btn btn-sm mx-1"
          :class="currentPage === page ? 'btn-primary' : 'btn-outline-primary'"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
    </section>

    <section class="container my-5 pb-5">
      <div class="card shadow border-primary">
        <div class="card-body text-center">
          <h3 class="text-primary mb-3">Đăng Ký Mượn Sách</h3>
          <p class="text-muted">
            Bạn đã chọn: <strong>{{ selectedBooks.length }}</strong> cuốn sách.
          </p>

          <button
            @click="borrowBooks"
            class="btn btn-primary btn-lg px-5"
            :disabled="selectedBooks.length === 0 || isLoading"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            Xác Nhận Mượn
          </button>
        </div>
      </div>
    </section>

    <button class="messenger-icon" @click="navTo('ChatAI')">
      <span class="chat-text text-white">Hỏi AI</span>
      <i class="bi bi-robot"></i>
    </button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      books: [],
      selectedBooks: [],
      itemsPerPage: 6,
      currentPage: 1,
      isLoading: false,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.books.length / this.itemsPerPage);
    },
    paginatedBooks() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.books.slice(start, start + this.itemsPerPage);
    },
  },
  mounted() {
    this.checkLogin();
    this.fetchBooks();
  },
  methods: {
    checkLogin() {
      if (!localStorage.getItem("MaDocGia")) {
        alert("Vui lòng đăng nhập!");
        this.$router.push({ name: "ReaderLogin" });
      }
    },

    async fetchBooks() {
      try {
        const res = await axios.get("http://localhost:3000/api/books");
        this.books = res.data;
      } catch (error) {
        console.error("Lỗi tải sách:", error);
      }
    },

    async borrowBooks() {
      if (this.selectedBooks.length === 0) return;
      if (!confirm(`Xác nhận mượn ${this.selectedBooks.length} cuốn sách này?`))
        return;

      this.isLoading = true;
      const maDocGia = localStorage.getItem("MaDocGia");
      let successCount = 0;
      let errorMsgs = [];

      // Vì API Transaction hiện tại chỉ hỗ trợ tạo từng phiếu một, ta phải lặp
      // (Trong thực tế nên viết API mượn hàng loạt - Bulk Insert)
      for (const masach of this.selectedBooks) {
        try {
          await axios.post("http://localhost:3000/api/transaction", {
            MADOCGIA: maDocGia,
            MASACH: masach,
            MSNV: "ONLINE", // Đánh dấu là mượn online
            NGAYTRA: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Mặc định mượn 7 ngày
          });
          successCount++;
        } catch (err) {
          errorMsgs.push(
            `Sách ${masach}: ${err.response?.data?.message || "Lỗi"}`
          );
        }
      }

      this.isLoading = false;

      if (successCount > 0) {
        alert(
          `✅ Đăng ký thành công ${successCount} cuốn sách! Vui lòng đến thư viện để nhận sách.`
        );
        this.selectedBooks = [];
        this.fetchBooks(); // Reload để cập nhật số lượng kho
      }

      if (errorMsgs.length > 0) {
        alert("⚠️ Một số lỗi xảy ra:\n" + errorMsgs.join("\n"));
      }
    },

    // Tiện ích
    getImageUrl(path) {
      if (!path) return "https://via.placeholder.com/150";
      return `http://localhost:3000/${path.replace(/\\/g, "/")}`;
    },
    formatCurrency(value) {
      return value.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    },
    navTo(name) {
      this.$router.push({ name: name });
    },
    logout() {
      localStorage.clear();
      this.$router.push({ name: "ReaderLogin" });
    },
  },
};
</script>

<style scoped>
/* Giữ nguyên nền của em */
.pagecontent {
  background: linear-gradient(
    135deg,
    rgba(0, 102, 204, 0.1),
    rgba(0, 102, 204, 0.05)
  );
  min-height: 100vh;
  font-family: "K2D", sans-serif;
}

/* Menu */
.nav-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.nav-item {
  padding: 10px 20px;
  background: white;
  color: #007bff;
  font-weight: bold;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: 0.3s;
  border: 1px solid #007bff;
}

.nav-item:hover,
.nav-item.active {
  background: #007bff;
  color: white;
  transform: translateY(-2px);
}

/* Card Sách */
.book-card {
  transition: transform 0.2s;
  border: none;
}
.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15) !important;
}

.book-cover {
  height: 200px;
  object-fit: contain;
  background: #f8f9fa;
  padding: 10px;
}

/* Nút Back */
.btn-back {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
}

/* Chat Icon */
.messenger-icon {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #6c5ce7;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(108, 92, 231, 0.4);
  font-weight: bold;
  z-index: 100;
  transition: 0.3s;
}
.messenger-icon:hover {
  transform: scale(1.1);
}
</style>
