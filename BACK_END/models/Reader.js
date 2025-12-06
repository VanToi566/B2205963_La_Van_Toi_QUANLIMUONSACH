const mongoose = require('mongoose');

const readerSchema = new mongoose.Schema({
  MADOCGIA: { 
    type: String, 
    required: true, 
    unique: true, // Mã độc giả không được trùng
    trim: true    // Xóa khoảng trắng thừa
  },
  
  HOLOT: { type: String, required: true, trim: true },
  TEN: { type: String, required: true, trim: true },
  
  MAIL: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  
  PASSWORD: { type: String, required: true },
  NGAYSINH: { type: Date, required: true },
  PHAI: { type: String, required: true }, // Nam/Nữ
  DIACHI: { type: String, required: true },
  DIENTHOAI: { type: String, required: true, trim: true },

  // --- TRƯỜNG MỚI (QUAN TRỌNG ĐỂ XÓA) ---
  // false: Đang hoạt động bình thường
  // true: Đã bị xóa (ẩn đi)
  isDeleted: { type: Boolean, default: false }
});

const Reader = mongoose.model('Reader', readerSchema, 'DOCGIA');
module.exports = Reader;