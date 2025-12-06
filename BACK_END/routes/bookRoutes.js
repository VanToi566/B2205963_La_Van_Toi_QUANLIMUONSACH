const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bookController = require('../controllers/bookControllers');

// --- CẤU HÌNH MULTER ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Chỉ được upload file ảnh!'), false);
};

const upload = multer({ storage, fileFilter });

// --- ROUTES ---

// Tìm kiếm
router.get('/search', bookController.searchBook);

// Thêm sách
router.post('/', upload.single('HINHANH'), bookController.createBook);

// Lấy toàn bộ sách
router.get('/', bookController.getAllBooks);

// Cập nhật sách (FULL UPDATE)
router.put('/update/:MASACH', upload.single('HINHANH'), bookController.updateBook);

// Lấy chi tiết theo MASACH
router.get('/book/:MASACH', bookController.getBookID);
router.get('/:MASACH', bookController.checkBookCode);

// Cập nhật kho tự động
router.post('/update-stock/:MASACH', bookController.updateBookStock);

// Cập nhật số lượng nhập tay
router.put('/updateBooks/:id', bookController.enterQuantity);

module.exports = router;
