// Đảm bảo em import đúng tên file Model em đã lưu (Message.js hay Messenger.js)
const Message = require("../models/Message"); 

// 1. LẤY LỊCH SỬ TIN NHẮN
const getMessages = async (req, res) => {
  const { user, partner } = req.query; // user: người hiện tại, partner: người đang chat cùng (nếu có)
  
  try {
    let query = {};

    // Nếu có partner (chat 1-1), chỉ lấy tin giữa 2 người
    if (partner) {
      query = {
        $or: [
          { sender: user, receiver: partner },
          { sender: partner, receiver: user }
        ]
      };
    } else {
      // Nếu không (logic cũ của em), lấy tất cả tin liên quan đến user
      query = {
        $or: [{ sender: user }, { receiver: user }]
      };
    }

    const messages = await Message.find(query).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy tin nhắn" });
  }
};

// 2. GỬI TIN NHẮN (Dùng cho Socket.io hoặc API)
const sendMessage = async (data) => {
  try {
    const newMessage = new Message({
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
      type: data.type || 'text', // Mặc định là text
      isRead: false // Mặc định là chưa xem
    });

    await newMessage.save();
    return newMessage;
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    throw error;
  }
};

// 3. ĐÁNH DẤU ĐÃ XEM (QUAN TRỌNG ĐỂ TẮT THÔNG BÁO)
// API này sẽ được gọi khi người dùng click mở khung chat
const markAsRead = async (req, res) => {
  const { sender, receiver } = req.body; // sender là người gửi tin (đối phương), receiver là mình

  try {
    await Message.updateMany(
      { sender: sender, receiver: receiver, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: "Đã đánh dấu đã đọc" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật trạng thái" });
  }
};

// 4. ĐẾM TIN NHẮN CHƯA ĐỌC (ĐỂ HIỆN BADGE ĐỎ 🔴)
const getUnreadCount = async (req, res) => {
  const { userId } = req.params;
  try {
    const count = await Message.countDocuments({ 
      receiver: userId, 
      isRead: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Lỗi đếm tin nhắn" });
  }
};

module.exports = { getMessages, sendMessage, markAsRead, getUnreadCount };