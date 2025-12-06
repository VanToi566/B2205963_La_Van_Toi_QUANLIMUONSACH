<template>
  <div class="pagea">
    <div class="sidebar">
      <h2>MENU MƯỢN TRẢ</h2>
      <p @click="navTo('LoanRegister')">
        <i class="fas fa-book"></i> MƯỢN TRỰC TIẾP
      </p>
      <p @click="navTo('LoanList')">
        <i class="fas fa-list"></i> DANH SÁCH ĐƠN MƯỢN
      </p>
      <p @click="navTo('SearchInfo')">
        <i class="fas fa-search"></i> TRA CỨU THÔNG TIN
      </p>
      <p @click="navTo('UpdateStock')">
        <i class="fas fa-boxes"></i> CẬP NHẬT KHO
      </p>
      <p class="active"><i class="fas fa-undo"></i> DUYỆT TRẢ SÁCH</p>
    </div>

    <div class="container">
      <button class="btn btn-back" @click="logout">Đăng Xuất</button>

      <div class="header">
        <h1 style="font-family: K2D">QUẢN LÝ TRẢ SÁCH & PHẠT</h1>
      </div>

      <div class="card shadow-sm mt-4 text-dark">
        <div class="card-body">
          <table class="table table-bordered table-hover align-middle">
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
              <tr v-for="item in activeTransactions" :key="item._id">
                <td>
                  <small>{{ item._id.slice(-6) }}...</small>
                </td>
                <td>{{ item.MADOCGIA }}</td>
                <td>{{ item.MASACH }}</td>
                <td>{{ formatDate(item.NGAYMUON) }}</td>
                <td :class="{ 'text-danger fw-bold': isOverdue(item.NGAYTRA) }">
                  {{ formatDate(item.NGAYTRA) }}
                </td>

                <td class="text-center">
                  <span v-if="isOverdue(item.NGAYTRA)" class="badge bg-danger"
                    >Quá hạn</span
                  >
                  <span v-else class="badge bg-warning text-dark"
                    >Đang mượn</span
                  >
                </td>

                <td class="text-center">
                  <button
                    class="btn btn-success btn-sm"
                    @click="approveReturn(item._id)"
                  >
                    <i class="fas fa-check-circle"></i> Xác Nhận Trả
                  </button>
                </td>
              </tr>

              <tr v-if="activeTransactions.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  Hiện không có yêu cầu trả sách nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="message" :class="['alert text-center mt-3', alertClass]">
        {{ message }}
      </div>
    </div>

    <button class="messenger-icon" @click="navTo('StaffChat')">
      <span class="chat-text" style="color: white">Chat NV</span>
      <i class="bi bi-chat-dots"></i>
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      transactions: [], // Danh sách tất cả giao dịch
      message: "",
      alertClass: "alert-info",
    };
  },
  computed: {
    // Lọc ra các phiếu ĐANG MƯỢN (TRANGTHAI = 0) để nhân viên xử lý
    activeTransactions() {
      return this.transactions.filter((t) => t.TRANGTHAI === 0);
    },
  },
  created() {
    this.fetchTransactions();
  },
  methods: {
    // 1. Lấy dữ liệu từ Backend
    async fetchTransactions() {
      try {
        const response = await fetch("http://localhost:3000/api/transaction");
        if (response.ok) {
          this.transactions = await response.json();
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    },

    // 2. Xử lý Trả Sách (Gọi API PUT)
    async approveReturn(transactionId) {
      if (!confirm("Bạn có chắc chắn muốn xác nhận trả sách cho phiếu này?"))
        return;

      try {
        // Gọi API Backend: PUT /return/:id
        const response = await fetch(
          `http://localhost:3000/api/transaction/return/${transactionId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Lỗi khi trả sách");
        }

        // --- XỬ LÝ HIỂN THỊ TIỀN PHẠT ---
        const { soNgayTre, tienPhat } = result.chiTiet;

        if (soNgayTre > 0) {
          alert(
            `⚠️ CẢNH BÁO TRẢ MUỘN!\n----------------------\n⏳ Trễ hạn: ${soNgayTre} ngày\n💰 SỐ TIỀN PHẠT: ${tienPhat.toLocaleString()} VNĐ\n\nVui lòng thu tiền phạt trước khi hoàn tất.`
          );
          this.message = `Đã trả sách (Có phạt: ${tienPhat.toLocaleString()} VNĐ)`;
          this.alertClass = "alert-warning";
        } else {
          alert("✅ Trả sách thành công! Đúng hạn.");
          this.message = "Trả sách thành công.";
          this.alertClass = "alert-success";
        }

        // Load lại danh sách để dòng vừa trả biến mất
        this.fetchTransactions();
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi xảy ra: " + error.message);
      }
    },

    // 3. Tiện ích
    navTo(routeName) {
      this.$router.push({ name: routeName });
    },
    logout() {
      if (confirm("Đăng xuất?")) {
        localStorage.clear();
        this.$router.push({ name: "StaffLogin" });
      }
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
/* Giữ nguyên style nền của em */
.pagea {
  background: linear-gradient(
    135deg,
    rgba(0, 102, 204, 0.8),
    rgba(0, 102, 204, 0.2)
  );
  color: white;
  min-height: 100vh;
  display: flex;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: #0066cc;
  padding: 20px;
  position: fixed;
  height: 100%;
  transition: 0.3s;
  z-index: 100;
}

.sidebar h2 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 30px;
  text-transform: uppercase;
}

.sidebar p {
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.sidebar p i {
  margin-right: 10px;
  width: 20px;
}

.sidebar p:hover,
.sidebar p.active {
  background: #004d99;
  transform: scale(1.05);
  border-left: 4px solid #ffcc00;
}

/* Nội dung */
.container {
  margin-left: 270px;
  padding: 20px;
  flex: 1;
}

.header h1 {
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Bảng */
.table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.table thead {
  background: #0066cc;
  color: white;
}

.table tbody tr:hover {
  background: #f1f9ff;
}

/* Nút back */
.btn-back {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  z-index: 101;
}

/* Chat Icon */
.messenger-icon {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #0078ff;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 120, 255, 0.7);
  z-index: 102;
}
</style>
