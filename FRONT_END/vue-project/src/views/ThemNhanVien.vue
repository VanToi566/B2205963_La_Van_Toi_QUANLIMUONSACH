<template>
  <div class="pagecontent">
    <div class="sidebar">
      <h3 class="text-white text-center py-3">QUẢN TRỊ VIÊN</h3>
      <p class="active"><i class="fas fa-user-tie"></i> QUẢN LÝ NHÂN VIÊN</p>
      <p @click="navTo('AddBook')"><i class="fas fa-book"></i> QUẢN LÝ SÁCH</p>
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
        <h1>QUẢN LÝ NHÂN SỰ</h1>
      </div>

      <div class="card p-4 mb-5 shadow-sm">
        <h4 class="text-primary mb-3">
          {{ isEditMode ? "CẬP NHẬT NHÂN VIÊN" : "THÊM NHÂN VIÊN MỚI" }}
        </h4>

        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Mã Nhân Viên:</label>
              <input
                v-model="staff.MSNV"
                type="text"
                class="form-control"
                :disabled="isEditMode"
                placeholder="VD: NV001"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Họ và Tên:</label>
              <input
                v-model="staff.HoTenNV"
                type="text"
                class="form-control"
                required
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Chức Vụ:</label>
              <select v-model="staff.ChucVu" class="form-select">
                <option value="Thủ thư">Thủ thư</option>
                <option value="Quản lý kho">Quản lý kho</option>
                <option value="Nhân viên hỗ trợ">Nhân viên hỗ trợ</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Mật Khẩu:</label>
              <input
                v-model="staff.Password"
                type="password"
                class="form-control"
                :placeholder="
                  isEditMode
                    ? 'Để trống nếu không đổi mật khẩu'
                    : 'Nhập mật khẩu...'
                "
                :required="!isEditMode"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Địa Chỉ:</label>
              <input
                v-model="staff.DiaChi"
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Số Điện Thoại:</label>
              <input
                v-model="staff.SoDienThoai"
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
          <h4>Danh Sách Nhân Sự</h4>
          <div class="input-group w-50">
            <input
              type="text"
              class="form-control"
              v-model="searchQuery"
              placeholder="Tìm theo tên hoặc mã..."
            />
            <button class="btn btn-outline-primary">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>

        <table class="table table-hover align-middle">
          <thead class="table-primary text-center">
            <tr>
              <th>Mã NV</th>
              <th>Họ Tên</th>
              <th>Chức Vụ</th>
              <th>Liên Hệ</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in paginatedStaff" :key="s.MSNV">
              <td class="fw-bold">{{ s.MSNV }}</td>
              <td>{{ s.HoTenNV }}</td>
              <td>
                <span class="badge bg-info text-dark">{{ s.ChucVu }}</span>
              </td>
              <td>
                <small>{{ s.SoDienThoai }}<br />{{ s.DiaChi }}</small>
              </td>
              <td class="text-center">
                <button
                  class="btn btn-sm btn-warning me-2"
                  @click="editStaff(s)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteStaff(s.MSNV)"
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
//import * as XLSX from "xlsx";

export default {
  data() {
    return {
      staff: {
        MSNV: "",
        HoTenNV: "",
        Password: "",
        ChucVu: "Thủ thư",
        DiaChi: "",
        SoDienThoai: "",
      },
      staffList: [],
      searchQuery: "",
      isEditMode: false,
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    filteredStaff() {
      if (!this.searchQuery) return this.staffList;
      const query = this.searchQuery.toLowerCase();
      return this.staffList.filter(
        (s) =>
          s.MSNV.toLowerCase().includes(query) ||
          s.HoTenNV.toLowerCase().includes(query)
      );
    },
    totalPages() {
      return Math.ceil(this.filteredStaff.length / this.itemsPerPage);
    },
    paginatedStaff() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredStaff.slice(start, start + this.itemsPerPage);
    },
  },
  mounted() {
    this.loadStaff();
  },
  methods: {
    async loadStaff() {
      try {
        const res = await axios.get("http://localhost:3000/api/staff");
        this.staffList = res.data;
      } catch (error) {
        console.error("Lỗi tải danh sách:", error);
      }
    },

    async handleSubmit() {
      try {
        if (this.isEditMode) {
          // GỌI API SỬA
          // Nếu không nhập pass mới thì xóa trường password đi để backend không update
          const updateData = { ...this.staff };
          if (!updateData.Password) delete updateData.Password;

          await axios.put(
            `http://localhost:3000/api/staff/${this.staff.MSNV}`,
            updateData
          );
          alert("✅ Cập nhật thành công!");
        } else {
          // GỌI API THÊM
          await axios.post("http://localhost:3000/api/staff", this.staff);
          alert("✅ Thêm nhân viên thành công!");
        }

        this.resetForm();
        this.loadStaff();
      } catch (error) {
        alert("❌ Lỗi: " + (error.response?.data?.message || "Có lỗi xảy ra"));
      }
    },

    async deleteStaff(id) {
      if (!confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
      try {
        await axios.delete(`http://localhost:3000/api/staff/${id}`);
        alert("🗑️ Đã xóa thành công!");
        this.loadStaff();
      } catch (error) {
        alert("Lỗi xóa: " + error.message);
      }
    },

    editStaff(data) {
      this.isEditMode = true;
      this.staff = { ...data, Password: "" }; // Không điền password cũ vào ô input
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    cancelEdit() {
      this.resetForm();
    },

    resetForm() {
      this.staff = {
        MSNV: "",
        HoTenNV: "",
        Password: "",
        ChucVu: "Thủ thư",
        DiaChi: "",
        SoDienThoai: "",
      };
      this.isEditMode = false;
    },

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
/* Style dùng chung với các trang quản lý khác */
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
