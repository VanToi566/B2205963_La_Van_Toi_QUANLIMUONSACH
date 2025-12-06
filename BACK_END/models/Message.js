const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  // Người gửi: Lưu Mã Độc Giả (DG...) hoặc Mã Nhân Viên (NV...)
  sender: { type: String, required: true },
  
  // Người nhận
  receiver: { type: String, required: true },
  
  // Nội dung tin nhắn (Không được để trống)
  message: { type: String, required: true },
  
  // Thời gian gửi
  timestamp: { type: Date, default: Date.now },

  // --- CÁC TRƯỜNG BỔ SUNG QUAN TRỌNG ---
  
  // Trạng thái đã xem hay chưa (để hiện badge thông báo đỏ)
  isRead: { type: Boolean, default: false },

  // Loại tin nhắn (text, image, system...) - Chuẩn bị cho việc gửi ảnh sau này
  type: { type: String, default: 'text' }
});

// Em lưu ý: Tên collection trong DB của em là 'Message' hay 'MESSENGER'?
// Tôi giữ nguyên là 'Message' theo code của em.
module.exports = mongoose.model("Message", MessageSchema, "Message");