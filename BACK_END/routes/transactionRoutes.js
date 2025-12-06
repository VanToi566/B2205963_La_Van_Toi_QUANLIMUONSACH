const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionControllers');

// 1. Tạo phiếu mượn (Đã bao gồm trừ kho sách)
// Frontend gọi: POST /api/transaction
router.post('/', transactionController.createTransaction);

// 2. Lấy tất cả danh sách mượn trả
// Frontend gọi: GET /api/transaction
router.get('/', transactionController.getAllTransaction);

// --- CÁC ROUTE CÒN THIẾU (BỔ SUNG NGAY) ---

// 3. Xem chi tiết lịch sử của 1 độc giả (Kèm tên sách, tên NV...)
// Frontend gọi: GET /api/transaction/borrower-details?MADOCGIA=DG001
router.get('/borrower-details', transactionController.getBorrowerDetails);

// 4. Trả sách & Tính tiền phạt
// Frontend gọi: PUT /api/transaction/return/ID_PHIEU_MUON
router.put('/return/:id', transactionController.returnTransaction);

module.exports = router;