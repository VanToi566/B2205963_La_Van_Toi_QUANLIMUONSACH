<template>
  <div class="pagecontent">
    <div class="sidebar">
      <h3 class="text-white text-center py-3">QUẢN TRỊ VIÊN</h3>
      <p @click="navTo('AddStaff')">
        <i class="fas fa-user-tie"></i> QUẢN LÝ NHÂN VIÊN
      </p>
      <p @click="navTo('AddBook')"><i class="fas fa-book"></i> QUẢN LÝ SÁCH</p>
      <p class="active"><i class="fas fa-users"></i> QUẢN LÝ ĐỘC GIẢ</p>
      <p @click="navTo('AddPublisher')">
        <i class="fas fa-building"></i> QUẢN LÝ NXB
      </p>
    </div>

    <div class="content">
      <button class="btn btn-back" @click="logout">
        <i class="fas fa-sign-out-alt"></i> Đăng Xuất
      </button>

      <div class="header mb-4">
        <h1>QUẢN LÝ ĐỘC GIẢ</h1>
      </div>

      <div class="card p-4 mb-5 shadow-sm">
        <h4 class="text-primary mb-3">
          {{ isEditMode ? "CẬP NHẬT THÔNG TIN" : "THÊM ĐỘC GIẢ MỚI" }}
        </h4>

        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Mã Độc Giả:</label>
              <input
                v-model="reader.MADOCGIA"
                type="text"
                class="form-control"
                :disabled="isEditMode"
                placeholder="VD: DG001"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Email:</label>
              <input
                v-model="reader.MAIL"
                type="email"
                class="form-control"
                required
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Họ Lót:</label>
              <input
                v-model="reader.HOLOT"
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Tên:</label>
              <input
                v-model="reader.TEN"
                type="text"
                class="form-control"
                required
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Ngày Sinh:</label>
              <input
                v-model="reader.NGAYSINH"
                type="date"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Giới Tính:</label>
              <select v-model="reader.PHAI" class="form-select">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Địa Chỉ:</label>
              <input
                v-model="reader.DIACHI"
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Số Điện Thoại:</label>
              <input
                v-model="reader.DIENTHOAI"
                type="text"
                class="form-control"
                required
              />
            </div>
          </div>

          <div class="d-flex gap-2">
            <button
              type="submit"
              class="btn"
              :class="isEditMode ? 'btn-warning' : 'btn-primary'"
            >
              <i class="fas" :class="isEditMode ? 'fa-save' : 'fa-plus'"></i>
              {{ isEditMode ? "Lưu Thay Đổi" : "Thêm Mới" }}
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

      <div class="card p-4 shadow-sm">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4>Danh Sách Độc Giả</h4>
          <div class="input-group w-50">
            <input
              type="text"
              class="form-control"
              v-model="searchQuery"
              placeholder="Tìm theo tên hoặc mã..."
            />
            <button class="btn btn-outline-primary" type="button">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>

        <table class="table table-hover align-middle">
          <thead class="table-primary text-center">
            <tr>
              <th>Mã ĐG</th>
              <th>Họ Tên</th>
              <th>Giới Tính</th>
              <th>Ngày Sinh</th>
              <th>Liên Hệ</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paginatedReaders" :key="r.MADOCGIA">
              <td class="fw-bold">{{ r.MADOCGIA }}</td>
              <td>{{ r.HOLOT }} {{ r.TEN }}</td>
              <td>{{ r.PHAI }}</td>
              <td>{{ formatDate(r.NGAYSINH) }}</td>
              <td>
                <small>{{ r.DIENTHOAI }}<br />{{ r.MAIL }}</small>
              </td>
              <td class="text-center">
                <button
                  class="btn btn-sm btn-info me-2 text-white"
                  @click="editReader(r)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteReader(r.MADOCGIA)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

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
      reader: {
        MADOCGIA: "",
        HOLOT: "",
        TEN: "",
        NGAYSINH: "",
        PHAI: "Nam",
        DIACHI: "",
        DIENTHOAI: "",
        MAIL: "",
      },
      readers: [],
      searchQuery: "",
      isEditMode: false,
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    filteredReaders() {
      if (!this.searchQuery) return this.readers;
      const query = this.searchQuery.toLowerCase();
      return this.readers.filter(
        (r) =>
          r.MADOCGIA.toLowerCase().includes(query) ||
          r.TEN.toLowerCase().includes(query)
      );
    },
    totalPages() {
      return Math.ceil(this.filteredReaders.length / this.itemsPerPage);
    },
    paginatedReaders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredReaders.slice(start, start + this.itemsPerPage);
    },
  },
  mounted() {
    this.loadReaders();
  },
  methods: {
    // 1. Tải danh sách
    async loadReaders() {
      try {
        const res = await axios.get("http://localhost:3000/api/readers");
        this.readers = res.data;
      } catch (error) {
        console.error("Lỗi tải danh sách:", error);
      }
    },

    // 2. Xử lý Thêm hoặc Sửa
    async handleSubmit() {
      try {
        if (this.isEditMode) {
          // GỌI API SỬA (PUT)
          await axios.put(
            `http://localhost:3000/api/readers/${this.reader.MADOCGIA}`,
            this.reader
          );
          alert("✅ Cập nhật thành công!");
        } else {
          // GỌI API THÊM (POST)
          const res = await axios.post(
            "http://localhost:3000/api/readers/register",
            this.reader
          );
          alert(
            `✅ Thêm thành công!\nMật khẩu mặc định: ${res.data.rawPassword}`
          );
        }

        this.resetForm();
        this.loadReaders(); // Reload bảng
      } catch (error) {
        alert("❌ Lỗi: " + (error.response?.data?.message || "Có lỗi xảy ra"));
      }
    },

    // 3. Xử lý Xóa
    async deleteReader(id) {
      if (!confirm("Bạn có chắc muốn xóa độc giả này không?")) return;
      try {
        await axios.delete(`http://localhost:3000/api/readers/${id}`);
        alert("🗑️ Đã xóa thành công!");
        this.loadReaders();
      } catch (error) {
        alert("Lỗi xóa: " + error.message);
      }
    },

    // 4. Chế độ sửa
    editReader(readerData) {
      this.isEditMode = true;
      // Copy object để tránh sửa trực tiếp vào bảng khi chưa lưu
      this.reader = { ...readerData };
      // Format ngày sinh cho input date
      if (this.reader.NGAYSINH)
        this.reader.NGAYSINH = this.reader.NGAYSINH.split("T")[0];
      // Cuộn lên form
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    cancelEdit() {
      this.resetForm();
    },

    resetForm() {
      this.reader = {
        MADOCGIA: "",
        HOLOT: "",
        TEN: "",
        NGAYSINH: "",
        PHAI: "Nam",
        DIACHI: "",
        DIENTHOAI: "",
        MAIL: "",
      };
      this.isEditMode = false;
    },

    // Tiện ích
    navTo(routeName) {
      this.$router.push({ name: routeName });
    },
    logout() {
      if (confirm("Đăng xuất?")) {
        localStorage.clear();
        this.$router.push({ name: "AdminLogin" });
      }
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    },
  },
};
</script>

<style scoped>
/* Style dùng chung */
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
  margin-bottom: 30px;
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
.btn-back:hover {
  background-color: #ee5253;
}
</style>
