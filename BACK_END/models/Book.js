const mongoose = require('mongoose');

// Định nghĩa schema cho sách
const bookSchema = new mongoose.Schema({
  MASACH: { type: String, required: true, unique: true }, // Nên thêm unique để tránh trùng mã
  TENSACH: { type: String, required: true },
  
  // Thêm validation: Giá tiền không được âm
  DONGIA: { 
    type: Number, 
    required: true,
    min: [0, 'Đơn giá không được nhỏ hơn 0'] 
  },
  
  // Thêm validation: Số quyển không được âm
  SOQUYEN: { 
    type: Number, 
    required: true,
    min: [0, 'Số quyển không được nhỏ hơn 0']
  },
  
  NHAXUATBAN: { type: String, required: true },
  MANXB: { type: String, required: true },
  TACGIA: { type: String, required: true },

  // --- TRƯỜNG MỚI THÊM ---
  // Lưu đường dẫn ảnh (VD: /uploads/sach-01.jpg)
  // Không bắt buộc (required: false) để tránh lỗi dữ liệu cũ chưa có ảnh
  HINHANH: { type: String, default: '' } 
});

// Khai báo model và liên kết với collection 'SACH' trong MongoDB
const Book = mongoose.model('Book', bookSchema, 'SACH');
module.exports = Book;