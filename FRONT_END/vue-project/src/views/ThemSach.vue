<template>
  <div class="pagecontent">
    <div class="sidebar">
      <h3 class="text-white text-center py-3">QUẢN TRỊ VIÊN</h3>
      <p @click="navTo('AddStaff')">
        <i class="fas fa-user-tie"></i> QUẢN LÝ NHÂN VIÊN
      </p>
      <p class="active"><i class="fas fa-book"></i> QUẢN LÝ SÁCH</p>
      <p @click="navTo('AddReader')">
        <i class="fas fa-users"></i> QUẢN LÝ ĐỘC GIẢ
      </p>
      <p @click="navTo('AddPublisher')">
        <i class="fas fa-building"></i> QUẢN LÝ NXB
      </p>
    </div>

    <div class="content">
      <button class="btn btn-back" @click="logout">
        <i class="fas fa-sign-out-alt"></i> Đăng Xuất
      </button>

      <div class="header mb-4">
        <h1>QUẢN LÝ SÁCH THƯ VIỆN</h1>
      </div>

      <!-- FORM -->
      <div class="card p-4 mb-5 shadow-sm">
        <h4 class="text-primary mb-3">
          {{ isEditMode ? "CẬP NHẬT THÔNG TIN SÁCH" : "THÊM SÁCH MỚI" }}
        </h4>

        <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
          <div class="row">
            <div class="col-md-8">
              <!-- MASACH - TENSACH -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label>Mã Sách:</label>
                  <input
                    v-model="book.MASACH"
                    type="text"
                    class="form-control"
                    :disabled="isEditMode"
                    required
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label>Tên Sách:</label>
                  <input
                    v-model="book.TENSACH"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
              </div>

              <!-- DONGIA - SOQUYEN - NAM -->
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label>Đơn Giá:</label>
                  <input
                    v-model="book.DONGIA"
                    type="number"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-md-4 mb-3">
                  <label>Số Lượng:</label>
                  <input
                    v-model="book.SOQUYEN"
                    type="number"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-md-4 mb-3">
                  <label>Năm XB:</label>
                  <input
                    v-model="book.NHAXUATBAN"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
              </div>

              <!-- NXB – TG -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label>Mã NXB:</label>
                  <input
                    v-model="book.MANXB"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label>Tác Giả:</label>
                  <input
                    v-model="book.TACGIA"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- ẢNH -->
            <div class="col-md-4 text-center">
              <label class="fw-bold">Ảnh Bìa Sách</label>

              <div class="image-preview mb-3">
                <img
                  v-if="previewImage"
                  :src="previewImage"
                  class="img-fluid rounded border"
                />
                <div
                  v-else
                  class="placeholder-img bg-light d-flex align-items-center justify-content-center"
                >
                  <span class="text-muted">Chưa có ảnh</span>
                </div>
              </div>

              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                class="form-control"
                accept="image/*"
              />
            </div>
          </div>

          <div class="d-flex gap-2 mt-3">
            <button
              type="submit"
              class="btn"
              :class="isEditMode ? 'btn-warning' : 'btn-primary'"
            >
              <i class="fas" :class="isEditMode ? 'fa-save' : 'fa-plus'"></i>
              {{ isEditMode ? "Lưu Thay Đổi" : "Thêm Sách" }}
            </button>

            <button
              v-if="isEditMode"
              type="button"
              class="btn btn-secondary"
              @click="cancelEdit"
            >
              Hủy Bỏ
            </button>
          </div>
        </form>
      </div>

      <!-- TABLE -->
      <div class="card p-4 shadow-sm">
        <div class="d-flex justify-content-between mb-3">
          <h4>Danh Sách Sách</h4>
          <div class="input-group w-50">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control"
              placeholder="Tìm kiếm..."
            />
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-primary text-center">
              <tr>
                <th>Ảnh</th>
                <th>Mã</th>
                <th>Tên Sách</th>
                <th>Giá & Kho</th>
                <th>Thông Tin</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="b in paginatedBooks" :key="b.MASACH">
                <td class="text-center">
                  <img
                    :src="getImageUrl(b.HINHANH)"
                    class="book-thumb"
                    @error="
                      $event.target.src = 'https://via.placeholder.com/50'
                    "
                  />
                </td>

                <td>{{ b.MASACH }}</td>
                <td>{{ b.TENSACH }}</td>

                <td>
                  {{ formatCurrency(b.DONGIA) }}<br />
                  <small>Kho: {{ b.SOQUYEN }}</small>
                </td>

                <td>
                  TG: {{ b.TACGIA }} <br />
                  NXB: {{ b.MANXB }}
                </td>

                <td class="text-center">
                  <button
                    class="btn btn-info btn-sm text-white"
                    @click="editBook(b)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->
        <nav v-if="totalPages > 1" class="mt-3">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--">Trước</button>
            </li>

            <li class="page-item disabled">
              <span class="page-link"
                >{{ currentPage }} / {{ totalPages }}</span
              >
            </li>

            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <button class="page-link" @click="currentPage++">Sau</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      book: {
        MASACH: "",
        TENSACH: "",
        DONGIA: 0,
        SOQUYEN: 1,
        NHAXUATBAN: "",
        MANXB: "",
        TACGIA: "",
      },

      selectedFile: null,
      previewImage: null,

      books: [],
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 5,

      isEditMode: false,
      oldImage: "",
    };
  },

  computed: {
    filteredBooks() {
      if (!this.searchQuery) return this.books;
      const q = this.searchQuery.toLowerCase();
      return this.books.filter(
        (b) =>
          b.MASACH.toLowerCase().includes(q) ||
          b.TENSACH.toLowerCase().includes(q)
      );
    },

    totalPages() {
      return Math.ceil(this.filteredBooks.length / this.itemsPerPage);
    },

    paginatedBooks() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredBooks.slice(start, start + this.itemsPerPage);
    },
  },

  mounted() {
    this.loadBooks();
  },

  methods: {
    async loadBooks() {
      try {
        const res = await axios.get("http://localhost:3000/api/books");
        this.books = res.data;
      } catch (err) {
        console.error("Load lỗi:", err);
      }
    },

    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        this.previewImage = URL.createObjectURL(this.selectedFile);
      }
    },

    /** SUBMIT (ADD hoặc UPDATE) */
    async handleSubmit() {
      try {
        const formData = new FormData();

        Object.keys(this.book).forEach((k) => formData.append(k, this.book[k]));

        if (this.selectedFile) {
          formData.append("HINHANH", this.selectedFile);
        } else {
          formData.append("HINHANH", this.oldImage);
        }

        if (this.isEditMode) {
          await axios.put(
            `http://localhost:3000/api/books/update/${this.book.MASACH}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          alert("Cập nhật sách thành công!");
        } else {
          await axios.post("http://localhost:3000/api/books", formData);
          alert("Thêm sách thành công!");
        }

        this.resetForm();
        this.loadBooks();
      } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || "Không xác định"));
      }
    },

    resetForm() {
      this.book = {
        MASACH: "",
        TENSACH: "",
        DONGIA: 0,
        SOQUYEN: 1,
        NHAXUATBAN: "",
        MANXB: "",
        TACGIA: "",
      };

      this.selectedFile = null;
      this.previewImage = null;
      this.oldImage = "";
      this.$refs.fileInput.value = "";
      this.isEditMode = false;
    },

    getImageUrl(path) {
      if (!path) return "https://via.placeholder.com/50";
      return `http://localhost:3000/${path.replace(/\\/g, "/")}`;
    },

    formatCurrency(v) {
      return v.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    },

    editBook(b) {
      this.isEditMode = true;
      this.book = { ...b };
      this.previewImage = this.getImageUrl(b.HINHANH);
      this.oldImage = b.HINHANH;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    cancelEdit() {
      this.resetForm();
    },

    navTo(r) {
      this.$router.push({ name: r });
    },

    logout() {
      localStorage.clear();
      this.$router.push({ name: "AdminLogin" });
    },
  },
};
</script>
<style scoped>
/* Style chung */
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
  z-index: 100;
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
  text-align: center;
  color: #004085;
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
  z-index: 101;
}

/* Ảnh preview */
.image-preview {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.image-preview img {
  max-height: 100%;
  object-fit: contain;
}

.placeholder-img {
  width: 100%;
  height: 100%;
  border: 2px dashed #ccc;
}

/* Ảnh thumbnail trong bảng */
.book-thumb {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
