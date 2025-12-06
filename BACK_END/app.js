
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/database");
const path = require("path");
const gtts = require("gtts");

// --- 1. IMPORT ROUTES ---
const bookRoutes = require("./routes/bookRoutes");
const readerRoutes = require("./routes/readerRoutes");
const staffRoutes = require("./routes/staffRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const publisherRoutes = require("./routes/publisherRoutes");
const chatRoutes = require("./routes/chatRoutes");     // Chat giữa người với người
const ChatBoxRoutes = require("./routes/ChatBoxRoutes"); // Chat với AI (Đã đổi tên theo ý em)

// Kết nối database
connectDB();

const app = express();
const server = http.createServer(app);

// --- 2. MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:8080", // Port Vue.js
    credentials: true,
}));

// Cấu hình thư mục ảnh public
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. ĐĂNG KÝ ROUTES ---
app.use("/api/books", bookRoutes);
app.use("/api/readers", readerRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/publisher", publisherRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/chat", chatRoutes);       // Chat người
app.use("/api/chatbox", ChatBoxRoutes); // Chat AI (Gọi API: POST /api/chatbox/chat)

// --- 4. API TEXT-TO-SPEECH ---
app.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Vui lòng nhập văn bản" });
    const tts = new gtts(text, "vi");
    res.set({ "Content-Type": "audio/mpeg", "Transfer-Encoding": "chunked" });
    tts.stream().pipe(res);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
});

// --- 5. SOCKET.IO (CHAT REALTIME) ---
const { sendMessage } = require("./controllers/chatController");

const io = new Server(server, {
  cors: { origin: "http://localhost:8080" },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinChat", ({ username }) => {
    socket.join(username);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const newMessage = await sendMessage(data);
      io.to(data.sender).emit("receiveMessage", newMessage);
      io.to(data.receiver).emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("Lỗi socket:", err);
    }
  });

  socket.on("disconnect", () => console.log(`User disconnected: ${socket.id}`));
});

// --- 6. CHẠY SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});