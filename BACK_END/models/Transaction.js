const mongoose = require('mongoose');

const transactionsSchema = new mongoose.Schema({
  // --- THÔNG TIN CƠ BẢN ---
  MADOCGIA: { type: String, required: true },
  MASACH: { type: String, required: true },
  MSNV: { type: String, required: true }, // Người lập phiếu
  
  // --- THỜI GIAN ---
  NGAYMUON: { type: Date, required: true, default: Date.now }, // Mặc định là lúc tạo phiếu
  NGAYTRA: { type: Date, required: true }, // Hạn trả (Deadline)

  // --- CÁC TRƯỜNG XỬ LÝ TRẢ SÁCH & PHẠT ---
  
  // Ngày thực tế độc giả mang sách đến trả (Lúc đầu chưa trả thì để trống)
  NGAYTHUCTRA: { type: Date }, 
  
  // Số tiền phạt (Mặc định là 0)
  TIENPHAT: { type: Number, default: 0 },
  
  // Trạng thái phiếu mượn
  // 0: Đang mượn, 1: Đã trả
  TRANGTHAI: { type: Number, default: 0 } 
});

// Liên kết với Collection cũ 'THEODOIMUONSACH'
const Transactions = mongoose.model('Transactions', transactionsSchema, 'THEODOIMUONSACH');

module.exports = Transactions;