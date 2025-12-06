<template>
  <div class="page">
    <button class="btn btn-back" @click="goBack">
      <i class="fas fa-arrow-left"></i> Trở lại
    </button>

    <div class="container-fluid chat-container d-flex flex-column">
      <div class="chat-header text-center py-3 text-white">
        <h4><i class="fas fa-headset"></i> HỖ TRỢ TRỰC TUYẾN</h4>
        <small>Đang chat với nhân viên tư vấn</small>
      </div>

      <div class="chat-box flex-grow-1" ref="chatBox">
        <div class="chat-message other-message">
          <div class="avatar">NV</div>
          <div class="msg-content">
            <strong>Hệ thống:</strong><br />
            Xin chào <b>{{ username }}</b
            >! Bạn cần hỗ trợ vấn đề gì không?
          </div>
        </div>

        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="[
            'chat-message',
            isMyMessage(msg.sender) ? 'my-message' : 'other-message',
          ]"
        >
          <div class="avatar" v-if="!isMyMessage(msg.sender)">NV</div>
          <div class="msg-content">
            <small class="sender-name">{{
              isMyMessage(msg.sender) ? "Bạn" : "Nhân viên"
            }}</small>
            <div>{{ msg.message }}</div>
          </div>
        </div>
      </div>

      <div class="chat-input d-flex p-3 align-items-center">
        <button
          @click="toggleRecording"
          class="btn me-2 rounded-circle"
          :class="isRecording ? 'btn-danger pulse-animation' : 'btn-light'"
          title="Ghi âm"
        >
          <i class="fas" :class="isRecording ? 'fa-stop' : 'fa-microphone'"></i>
        </button>

        <input
          v-model="message"
          @keyup.enter="sendMessage"
          class="form-control me-2 rounded-pill"
          placeholder="Nhập tin nhắn..."
        />

        <button
          @click="sendMessage"
          class="btn btn-primary rounded-circle btn-send"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
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
      messages: [],
      message: "",
      username: "", // Tên độc giả (Lấy từ Login)
      userId: "", // Mã độc giả (Quan trọng để định danh)
      receiver: "STAFF_SUPPORT", // Gửi đến kênh chung của nhân viên
      recognition: null,
      isRecording: false,
    };
  },
  created() {
    // 1. Lấy thông tin người dùng thật từ LocalStorage
    this.userId = localStorage.getItem("MaDocGia");
    this.username = localStorage.getItem("HoTenDG") || "Độc giả";

    if (!this.userId) {
      alert("Vui lòng đăng nhập để sử dụng chat!");
      this.$router.push({ name: "ReaderLogin" });
    }
  },
  mounted() {
    // 2. Kết nối Socket
    this.socket = io("http://localhost:3000");

    // Tham gia phòng chat bằng ID của mình để nhận tin nhắn riêng
    this.socket.emit("joinChat", { username: this.userId });

    // Lắng nghe tin nhắn đến
    this.socket.on("receiveMessage", (msg) => {
      // Chỉ hiện tin nhắn liên quan đến mình
      if (msg.sender === this.userId || msg.receiver === this.userId) {
        this.messages.push(msg);
        this.scrollToBottom();
      }
    });

    // 3. Tải lịch sử chat cũ
    this.fetchHistory();

    // 4. Cấu hình Voice (Speech to Text)
    this.setupVoice();
  },
  methods: {
    // Kiểm tra tin nhắn của ai để hiển thị bên trái/phải
    isMyMessage(sender) {
      return sender === this.userId;
    },

    // Lấy lịch sử chat
    async fetchHistory() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/chat/messages?user=${this.userId}`
        );
        this.messages = response.data;
        this.scrollToBottom();
      } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
      }
    },

    // Gửi tin nhắn
    sendMessage() {
      if (this.message.trim() === "") return;

      const data = {
        sender: this.userId, // Gửi bằng Mã Độc Giả
        receiver: this.receiver, // Gửi cho Nhân viên
        message: this.message,
        timestamp: new Date(),
      };

      // Gửi qua Socket (Realtime)
      this.socket.emit("sendMessage", data);

      // Clear input
      this.message = "";
    },

    // Cuộn xuống cuối khung chat
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatBox;
        if (container) container.scrollTop = container.scrollHeight;
      });
    },

    // Thiết lập ghi âm
    setupVoice() {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = "vi-VN";
        this.recognition.continuous = false;

        this.recognition.onresult = (event) => {
          this.message = event.results[0][0].transcript;
          this.isRecording = false;
        };

        this.recognition.onerror = () => {
          this.isRecording = false;
        };
        this.recognition.onend = () => {
          this.isRecording = false;
        };
      }
    },

    toggleRecording() {
      if (!this.recognition) {
        alert("Trình duyệt không hỗ trợ!");
        return;
      }
      if (this.isRecording) {
        this.recognition.stop();
      } else {
        this.recognition.start();
        this.isRecording = true;
      }
    },

    goBack() {
      // Dùng Router Name để chuyển trang chuẩn
      this.$router.push({ name: "LibraryOnline" });
    },
  },
};
</script>

<style scoped>
/* Tổng thể */
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(
      135deg,
      rgba(0, 102, 204, 0.8),
      rgba(0, 102, 204, 0.2)
    ),
    url("https://thsp.ctu.edu.vn/images/upload/MssDiem/atl1.jpg");
  background-size: cover;
}

.chat-container {
  width: 95%;
  max-width: 500px;
  height: 85vh;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
}

/* Header */
.chat-header {
  background: linear-gradient(to right, #007bff, #00c6ff);
}

/* Chat Box */
.chat-box {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Message Styles */
.chat-message {
  display: flex;
  align-items: flex-end;
  max-width: 80%;
  animation: fadeIn 0.3s ease;
}

.my-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.other-message {
  align-self: flex-start;
}

.msg-content {
  padding: 10px 15px;
  border-radius: 18px;
  font-size: 15px;
  position: relative;
  word-wrap: break-word;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.my-message .msg-content {
  background-color: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
  margin-right: 10px;
}

.other-message .msg-content {
  background-color: #e9ecef;
  color: #333;
  border-bottom-left-radius: 4px;
  margin-left: 10px;
}

/* Avatar */
.avatar {
  width: 35px;
  height: 35px;
  background-color: #ccc;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
}
.other-message .avatar {
  background-color: #ff9f43;
} /* Màu cam cho nhân viên */

/* Input Area */
.chat-input {
  background: white;
  border-top: 1px solid #eee;
}

.btn-send {
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Nút Back */
.btn-back {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 30px;
  z-index: 100;
}

.sender-name {
  font-size: 0.75rem;
  opacity: 0.8;
  display: block;
  margin-bottom: 2px;
}

/* Hiệu ứng ghi âm */
.pulse-animation {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
