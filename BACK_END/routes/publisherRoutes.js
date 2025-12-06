const express = require('express');
const router = express.Router();
const publisherController = require('../controllers/publisherControllers'); 

// 1. Thêm NXB mới
router.post('/', publisherController.createPublisher);

// 2. Lấy danh sách tất cả NXB
router.get('/', publisherController.getAllPublisher);

// --- CÁC ROUTE CÒN THIẾU ---

// 3. Cập nhật NXB (Sửa) - Method PUT
// Frontend gọi: /api/publisher/NXB001
router.put('/:id', publisherController.updatePublisher);

// 4. Xóa NXB - Method DELETE
// Frontend gọi: /api/publisher/NXB001
router.delete('/:id', publisherController.deletePublisher);

module.exports = router;