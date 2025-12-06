<template>
  <div class="page">
    <button class="btn btn-back" @click="goBack">
      <i class="fas fa-arrow-left"></i> Trở lại
    </button>

    <div class="chat-container">
      <div class="chat-header">
        <i class="fas fa-robot"></i> TRỢ LÝ THƯ VIỆN AI
      </div>

      <div class="chat-body" ref="chatBody">
        <div class="chat-message bot">
          Xin chào! Tôi là AI Thư Viện. Tôi có thể giúp bạn tra cứu sách nào?
        </div>

        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['chat-message', msg.sender]"
        >
          <span v-if="msg.sender === 'bot'">🤖 </span>
          <span v-else>🧑‍🎓 </span>
          {{ msg.text }}
        </div>

        <div v-if="isLoading" class="chat-message bot">
          <em>Đang suy nghĩ...</em>
        </div>
      </div>

      <div class="chat-footer">
        <button
          @click="toggleRecognition"
          class="btn me-2"
          :class="isRecording ? 'btn-danger' : 'btn-outline-secondary'"
        >
          <i class="fas" :class="isRecording ? 'fa-stop' : 'fa-microphone'"></i>
        </button>

        <input
          type="text"
          v-model="chatInput"
          class="form-control me-2"
          placeholder="Nhập câu hỏi về sách..."
          @keypress.enter="sendMessage"
          :disabled="isLoading"
        />

        <button
          @click="sendMessage"
          class="btn btn-primary"
          :disabled="isLoading || !chatInput"
        >
          <i class="fas fa-paper-plane"></i> Gửi
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChatBoxAI",
  data() {
    return {
      chatInput: "",
      messages: [],
      recognition: null,
      isRecording: false,
      isLoading: false, // Để khóa nút gửi khi đang chờ AI
    };
  },
  mounted() {
    // Khởi tạo Speech Recognition (Chuyển giọng nói thành văn bản)
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = "vi-VN";
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.chatInput = transcript;
        this.isRecording = false;
        // Tự động gửi sau khi nói xong (tùy chọn)
        setTimeout(() => this.sendMessage(), 500);
      };

      this.recognition.onerror = (event) => {
        console.error("Lỗi nhận diện giọng nói:", event.error);
        this.isRecording = false;
      };

      this.recognition.onend = () => {
        this.isRecording = false;
      };
    } else {
      console.warn("Trình duyệt không hỗ trợ nhận diện giọng nói.");
    }
  },
  methods: {
    // 1. Thêm tin nhắn vào khung chat
    appendMessage(text, sender) {
      this.messages.push({ text, sender });
      this.scrollToBottom();
    },

    // 2. Cuộn xuống cuối khung chat
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatBody;
        if (container) container.scrollTop = container.scrollHeight;
      });
    },

    // 3. Gửi tin nhắn lên Server AI
    async sendMessage() {
      if (!this.chatInput.trim()) return;

      const userMessage = this.chatInput;
      this.appendMessage(userMessage, "user");
      this.chatInput = "";
      this.isLoading = true; // Bật trạng thái loading

      try {
        // GỌI API BACKEND (Chú ý đường dẫn /api/chatbox/chat)
        const response = await fetch("http://localhost:3000/api/chatbox/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();
        const reply = data.reply || "Xin lỗi, tôi không hiểu ý bạn.";

        this.appendMessage(reply, "bot");
        this.speakText(reply); // Đọc câu trả lời
      } catch (error) {
        console.error("Lỗi:", error);
        this.appendMessage("Lỗi kết nối đến Server AI.", "bot");
      } finally {
        this.isLoading = false; // Tắt loading
      }
    },

    // 4. Xử lý nút Micro
    toggleRecognition() {
      if (!this.recognition) {
        alert("Trình duyệt của bạn không hỗ trợ chức năng này.");
        return;
      }
      if (this.isRecording) {
        this.recognition.stop();
      } else {
        this.recognition.start();
        this.isRecording = true;
      }
    },

    // 5. Chuyển văn bản thành giọng nói (TTS)
    async speakText(text) {
      try {
        // Gọi API TTS ở file app.js (http://localhost:3000/tts)
        const response = await fetch("http://localhost:3000/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) return;

        const blob = await response.blob();
        const audioURL = URL.createObjectURL(blob);
        const audio = new Audio(audioURL);
        audio.play();
      } catch (error) {
        console.error("Lỗi TTS:", error);
      }
    },

    goBack() {
      // Quay lại trang thư viện (Dùng Name Router đã đặt)
      this.$router.push({ name: "LibraryOnline" });
      // Hoặc nếu chưa đổi router thì dùng đường dẫn cũ:
      // this.$router.push('/ThuVienOnline');
    },
  },
};
</script>

<style scoped>
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("https://thsp.ctu.edu.vn/images/upload/MssDiem/atl1.jpg");
  background-size: cover;
  background-position: center;
}

/* Nút back đẹp hơn */
.btn-back {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  transition: 0.3s;
}
.btn-back:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.chat-container {
  width: 90%;
  max-width: 600px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95); /* Làm mờ nền chat chút */
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #0066cc, #00c6ff);
  color: white;
  padding: 20px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chat-message {
  padding: 12px 18px;
  border-radius: 15px;
  max-width: 80%;
  font-size: 15px;
  line-height: 1.4;
  word-wrap: break-word;
}

.chat-message.user {
  background: #007bff;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}

.chat-message.bot {
  background: #e9ecef;
  color: #333;
  align-self: flex-start;
  border-bottom-left-radius: 2px;
}

.chat-footer {
  display: flex;
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #ddd;
  align-items: center;
}

/* Scrollbar đẹp */
.chat-body::-webkit-scrollbar {
  width: 6px;
}
.chat-body::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}
</style>
