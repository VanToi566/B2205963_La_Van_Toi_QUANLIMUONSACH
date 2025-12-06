const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  MSNV: { 
    type: String, 
    required: true, 
    unique: true, // Mã nhân viên là duy nhất
    trim: true    // Xóa khoảng trắng thừa
  },
  
  HoTenNV: { type: String, required: true, trim: true },
  Password: { type: String, required: true },
  ChucVu: { type: String, required: true, trim: true },
  DiaChi: { type: String, required: true, trim: true },
  SoDienThoai: { type: String, required: true, trim: true },

  // --- TRƯỜNG QUAN TRỌNG ---
  // false: Đang làm việc
  // true: Đã nghỉ việc (Ẩn khỏi danh sách)
  isDeleted: { type: Boolean, default: false }
});

const Staff = mongoose.model('Staff', staffSchema, 'NhanVien');

module.exports = Staff;