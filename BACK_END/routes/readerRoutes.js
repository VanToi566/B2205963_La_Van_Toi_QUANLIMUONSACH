const express = require('express');
const router = express.Router();
const readerController = require('../controllers/readerControllers'); 

// 1. Tạo độc giả mới (Đăng ký)
router.post('/register', readerController.createReader);

// 2. Lấy danh sách tất cả độc giả
router.get('/', readerController.getAllReader);

// 3. Đăng nhập (Method POST là đúng rồi)
router.post('/login', readerController.checkReaderLogin);

// --- CÁC ROUTE CÒN THIẾU CỦA EM ---

// 4. Cập nhật thông tin độc giả (Sửa) - Method PUT
// Frontend gọi: axios.put('.../api/readers/DG001', data)
router.put('/:id', readerController.updateReader);

// 5. Xóa độc giả (Xóa mềm) - Method DELETE
// Frontend gọi: axios.delete('.../api/readers/DG001')
router.delete('/:id', readerController.deleteReader);

// 6. Tìm kiếm độc giả theo tên - Method GET
// Nên để /search/:name để không nhầm với route lấy chi tiết bên dưới
router.get('/search/:name', readerController.getReader);

// 7. Lấy chi tiết 1 độc giả theo Mã (Để ở cuối cùng)
router.get('/:MADOCGIA', readerController.checkReaderCode);

module.exports = router;