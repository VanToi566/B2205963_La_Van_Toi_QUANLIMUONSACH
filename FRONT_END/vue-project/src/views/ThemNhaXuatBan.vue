<template>
  <div class="pagecontent">
    <div class="sidebar">
      <h3 class="text-white text-center py-3">QUẢN TRỊ VIÊN</h3>
      <p @click="navTo('AddStaff')">
        <i class="fas fa-user-tie"></i> QUẢN LÝ NHÂN VIÊN
      </p>
      <p @click="navTo('AddBook')"><i class="fas fa-book"></i> QUẢN LÝ SÁCH</p>
      <p @click="navTo('AddReader')">
        <i class="fas fa-users"></i> QUẢN LÝ ĐỘC GIẢ
      </p>
      <p class="active"><i class="fas fa-industry"></i> QUẢN LÝ NXB</p>
    </div>

    <div class="content">
      <button class="btn btn-back" @click="logout">
        <i class="fas fa-sign-out-alt"></i> Đăng Xuất
      </button>

      <div class="header mb-4">
        <h1>QUẢN LÝ NHÀ XUẤT BẢN</h1>
      </div>

      <div class="card p-4 mb-5 shadow-sm">
        <h4 class="text-primary mb-3">
          {{ isEditMode ? "CẬP NHẬT NHÀ XUẤT BẢN" : "THÊM NXB MỚI" }}
        </h4>

        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Mã NXB:</label>
              <input
                v-model="publisher.MANXB"
                type="text"
                class="form-control"
                :disabled="isEditMode"
                placeholder="VD: NXB001"
                required
              />
            </div>
            <div class="col-md-8 mb-3">
              <label class="form-label">Tên Nhà Xuất Bản:</label>
              <input
                v-model="publisher.TENNXB"
                type="text"
                class="form-control"
                required
              />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Địa Chỉ:</label>
            <input
              v-model="publisher.DIACHI"
              type="text"
              class="form-control"
              required
            />
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
          <h4>Danh Sách Nhà Xuất Bản</h4>
          <div class="d-flex gap-2">
            <input
              type="text"
              class="form-control"
              v-model="searchQuery"
              placeholder="Tìm kiếm..."
            />
            <button class="btn btn-success text-nowrap" @click="exportToExcel">
              <i class="fas fa-file-excel"></i> Xuất Excel
            </button>
          </div>
        </div>

        <table class="table table-hover align-middle">
          <thead class="table-primary text-center">
            <tr>
              <th>Mã NXB</th>
              <th>Tên Nhà Xuất Bản</th>
              <th>Địa Chỉ</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pub in paginatedPublishers" :key="pub.MANXB">
              <td class="fw-bold">{{ pub.MANXB }}</td>
              <td>{{ pub.TENNXB }}</td>
              <td>{{ pub.DIACHI }}</td>
              <td class="text-center">
                <button
                  class="btn btn-sm btn-warning me-2"
                  @click="editPublisher(pub)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deletePublisher(pub.MANXB)"
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
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      publisher: { MANXB: "", TENNXB: "", DIACHI: "" },
      publishersData: [],
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 5,
      isEditMode: false,
    };
  },
  computed: {
    filteredPublishers() {
      if (!this.searchQuery) return this.publishersData;
      const query = this.searchQuery.toLowerCase();
      return this.publishersData.filter(
        (p) =>
          p.MANXB.toLowerCase().includes(query) ||
          p.TENNXB.toLowerCase().includes(query)
      );
    },
    totalPages() {
      return Math.ceil(this.filteredPublishers.length / this.itemsPerPage);
    },
    paginatedPublishers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredPublishers.slice(start, start + this.itemsPerPage);
    },
  },
  mounted() {
    this.loadPublisher();
  },
  methods: {
    // 1. Tải danh sách
    async loadPublisher() {
      try {
        const res = await axios.get("http://localhost:3000/api/publisher");
        this.publishersData = res.data;
      } catch (error) {
        console.error("Lỗi tải danh sách:", error);
      }
    },

    // 2. Thêm hoặc Sửa
    async handleSubmit() {
      try {
        if (this.isEditMode) {
          // GỌI API SỬA (PUT)
          await axios.put(
            `http://localhost:3000/api/publisher/${this.publisher.MANXB}`,
            this.publisher
          );
          alert("✅ Cập nhật thành công!");
        } else {
          // GỌI API THÊM (POST)
          await axios.post(
            "http://localhost:3000/api/publisher",
            this.publisher
          );
          alert("✅ Thêm mới thành công!");
        }
        this.resetForm();
        this.loadPublisher();
      } catch (error) {
        alert("❌ Lỗi: " + (error.response?.data?.message || error.message));
      }
    },

    // 3. Xóa NXB
    async deletePublisher(id) {
      if (!confirm(`Bạn có chắc muốn xóa NXB mã ${id} không?`)) return;
      try {
        await axios.delete(`http://localhost:3000/api/publisher/${id}`);
        alert("🗑️ Đã xóa thành công!");
        this.loadPublisher();
      } catch (error) {
        alert("Lỗi xóa: " + error.response?.data?.message);
      }
    },

    // 4. Chế độ sửa
    editPublisher(item) {
      this.isEditMode = true;
      this.publisher = { ...item };
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    resetForm() {
      this.publisher = { MANXB: "", TENNXB: "", DIACHI: "" };
      this.isEditMode = false;
    },
    cancelEdit() {
      this.resetForm();
    },

    // Xuất Excel
    exportToExcel() {
      const ws = XLSX.utils.json_to_sheet(this.publishersData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Publishers");
      XLSX.writeFile(wb, "DanhSachNXB.xlsx");
    },

    // Điều hướng
    navTo(routeName) {
      this.$router.push({ name: routeName });
    },
    logout() {
      if (confirm("Đăng xuất Admin?")) {
        localStorage.clear();
        this.$router.push({ name: "AdminLogin" });
      }
    },
  },
};
</script>

<style scoped>
/* Giữ nguyên style chung của em */
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
</style>
