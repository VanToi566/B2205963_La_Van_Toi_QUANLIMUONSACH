const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  MANXB: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true // Tự động xóa khoảng trắng thừa đầu/cuối
  },
  
  TENNXB: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  DIACHI: { 
    type: String, 
    required: true,
    trim: true 
  }
});

const Publisher = mongoose.model('Publisher', publisherSchema, 'NHAXUATBAN');

module.exports = Publisher;