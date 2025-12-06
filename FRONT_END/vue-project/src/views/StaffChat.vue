<template>
  <div class="page">
    <button class="btn btn-back" @click="goBack">
      <i class="fas fa-arrow-left"></i> Trở lại
    </button>

    <div class="container-fluid chat-layout">
      <div class="sidebar-users">
        <div class="sidebar-header">
          <h5><i class="fas fa-users"></i> Độc giả cần hỗ trợ</h5>
        </div>
        <div class="user-list">
          <div
            v-for="user in users"
            :key="user.id"
            class="user-item"
            :class="{ active: currentReceiver === user.id }"
            @click="selectUser(user)"
          >
            <div class="avatar">{{ user.name.charAt(0) }}</div>
            <div class="user-info">
              <div class="name">{{ user.name }}</div>
              <small class="text-muted">{{ user.lastMessage }}</small>
            </div>
            <span v-if="user.unread > 0" class="badge bg-danger rounded-pill">{{
              user.unread
            }}</span>
          </div>
        </div>
      </div>

      <div class="chat-main">
        <div class="chat-header text-white" v-if="currentReceiver">
          Chat với: <strong>{{ currentReceiverName }}</strong> ({{
            currentReceiver
          }})
        </div>
        <div class="chat-header text-white" v-else>Chưa chọn độc giả nào</div>

        <div class="chat-box" ref="chatBox">
          <div v-if="!currentReceiver" class="text-center text-muted mt-5">
            <i class="fas fa-comments fa-3x mb-3"></i><br />
            Vui lòng chọn một độc giả bên trái để bắt đầu chat.
          </div>

          <div
            v-else
            v-for="(msg, index) in messages"
            :key="index"
            :class="[
              'chat-message',
              msg.sender === 'STAFF_SUPPORT' ? 'my-message' : 'other-message',
            ]"
          >
            <div class="msg-content">{{ msg.message }}</div>
          </div>
        </div>

        <div class="chat-input p-3 d-flex" v-if="currentReceiver">
          <input
            v-model="message"
            @keyup.enter="sendMessage"
            class="form-control me-2"
            placeholder="Nhập câu trả lời..."
          />
          <button @click="sendMessage" class="btn btn-primary">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import axios from "axios";

export default {
  data() {
    return {
      socket: null,
      users: [], // Danh sách độc giả đã từng nhắn tin
      currentReceiver: null, // ID độc giả đang chat
      currentReceiverName: "",
      messages: [],
      message: "",
      staffId: "STAFF_SUPPORT", // ID chung cho bộ phận CSKH
    };
  },
  mounted() {
    // 1. Kết nối Socket
    this.socket = io("http://localhost:3000");
    this.socket.emit("joinChat", { username: this.staffId });

    // 2. Lắng nghe tin nhắn mới
    this.socket.on("receiveMessage", (msg) => {
      // Nếu tin nhắn gửi đến STAFF
      if (msg.receiver === this.staffId) {
        this.handleIncomingMessage(msg);
      }
    });

    // 3. Tải danh sách người dùng đã chat (Giả lập hoặc lấy từ API)
    // Trong thực tế, em cần API: /api/chat/conversations để lấy list này
    // Tạm thời tôi giả lập logic:
    this.loadUserList();
  },
  methods: {
    // Giả lập lấy danh sách người chat
    async loadUserList() {
      // Ở đây em nên gọi API lấy danh sách những người đã nhắn tin cho Staff
      // Tạm thời hardcode để test giao diện
      this.users = [
        {
          id: "DG001",
          name: "Nguyễn Văn A",
          lastMessage: "Cho em hỏi...",
          unread: 2,
        },
        {
          id: "DG002",
          name: "Trần Thị B",
          lastMessage: "Sách này còn không?",
          unread: 0,
        },
      ];
    },

    // Chọn người để chat
    async selectUser(user) {
      this.currentReceiver = user.id;
      this.currentReceiverName = user.name;
      user.unread = 0; // Đánh dấu đã đọc

      // Tải lịch sử chat với người này
      await this.fetchHistory(user.id);
    },

    // Lấy lịch sử chat
    async fetchHistory(userId) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/chat/messages?user=${this.staffId}&partner=${userId}`
        );
        this.messages = response.data;
        this.scrollToBottom();
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      }
    },

    // Xử lý tin nhắn đến
    handleIncomingMessage(msg) {
      // Nếu đang chat với người này -> Hiện luôn
      if (this.currentReceiver === msg.sender) {
        this.messages.push(msg);
        this.scrollToBottom();
      } else {
        // Nếu không -> Tăng số tin chưa đọc trong danh sách
        const user = this.users.find((u) => u.id === msg.sender);
        if (user) {
          user.unread++;
          user.lastMessage = msg.message;
        } else {
          // Người mới
          this.users.unshift({
            id: msg.sender,
            name: "Độc giả mới", // Cần API lấy tên thật
            lastMessage: msg.message,
            unread: 1,
          });
        }
      }
    },

    sendMessage() {
      if (!this.message.trim() || !this.currentReceiver) return;

      const data = {
        sender: this.staffId,
        receiver: this.currentReceiver, // Gửi lại cho độc giả cụ thể
        message: this.message,
        timestamp: new Date(),
      };

      this.socket.emit("sendMessage", data);
      this.messages.push(data); // Tự hiện tin mình vừa gửi
      this.message = "";
      this.scrollToBottom();
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatBox;
        if (container) container.scrollTop = container.scrollHeight;
      });
    },

    goBack() {
      this.$router.push({ name: "LoanList" });
    },
  },
};
</script>

<style scoped>
.page {
  height: 100vh;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-layout {
  display: flex;
  width: 95%;
  height: 90vh;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* Cột trái: Danh sách User */
.sidebar-users {
  width: 300px;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.user-list {
  overflow-y: auto;
  flex: 1;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  transition: 0.2s;
  border-bottom: 1px solid #f1f1f1;
}

.user-item:hover,
.user-item.active {
  background-color: #e3f2fd;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
}

.user-info {
  flex: 1;
}
.name {
  font-weight: bold;
  font-size: 14px;
}

/* Cột phải: Chat Main */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px;
  background: #007bff;
  font-size: 1.1rem;
}

.chat-box {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-message {
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 70%;
  font-size: 15px;
}

.my-message {
  background: #007bff;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}

.other-message {
  background: #fff;
  border: 1px solid #ddd;
  align-self: flex-start;
  border-bottom-left-radius: 2px;
}

.btn-back {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
}
</style>
