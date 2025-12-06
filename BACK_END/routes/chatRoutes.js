const express = require("express");
const router = express.Router();
// Import controller Chat
const chatController = require("../controllers/chatController");

// 1. Lấy lịch sử tin nhắn
// Gọi: GET /api/chat/messages?user=DG01&partner=NV01
router.get("/messages", chatController.getMessages);

// 2. Đánh dấu đã đọc (Khi người dùng click mở khung chat)
// Gọi: PUT /api/chat/read
router.put("/read", chatController.markAsRead);

// 3. Đếm số tin nhắn chưa đọc (Để hiển thị badge đỏ 🔴)
// Gọi: GET /api/chat/unread/DG01
router.get("/unread/:userId", chatController.getUnreadCount);

module.exports = router;