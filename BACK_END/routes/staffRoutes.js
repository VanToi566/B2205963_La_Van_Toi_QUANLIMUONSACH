const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffControllers');

// 1. Thêm nhân viên mới
router.post('/', staffController.createStaff);

// 2. Lấy danh sách nhân viên
router.get('/', staffController.getAllStaff);

// 3. Đăng nhập Nhân viên
router.post('/login', staffController.checkStaffLogin);

// 4. Đăng nhập Quản trị viên
router.post('/AdministratorLogin', staffController.checkAdministratorLogin);

// --- CÁC ROUTE QUAN TRỌNG CÒN THIẾU ---

// 5. Cập nhật nhân viên (Sửa thông tin / Đổi mật khẩu)
// Frontend gọi: PUT /api/staff/NV001
router.put('/:id', staffController.updateStaff);

// 6. Xóa nhân viên (Cho nghỉ việc)
// Frontend gọi: DELETE /api/staff/NV001
router.delete('/:id', staffController.deleteStaff);

// 7. Kiểm tra mã NV (Để ở cuối cùng để tránh xung đột)
router.get('/:MSNV', staffController.checkStaffCode);

module.exports = router;