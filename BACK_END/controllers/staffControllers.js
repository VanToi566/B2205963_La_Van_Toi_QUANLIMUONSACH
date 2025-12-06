const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs'); // Nhớ cài: npm install bcryptjs

// 1. THÊM NHÂN VIÊN MỚI (CÓ MÃ HÓA PASSWORD)
module.exports.createStaff = async (req, res) => {
  const { MSNV, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai } = req.body;

  if (!MSNV || !HoTenNV || !Password) {
    return res.status(400).json({ message: 'Vui lòng nhập đủ: MSNV, Tên, Mật khẩu.' });
  }

  try {
    // Kiểm tra trùng MSNV
    const existingStaff = await Staff.findOne({ MSNV });
    if (existingStaff) {
      return res.status(400).json({ message: 'Mã nhân viên này đã tồn tại!' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(Password, 10);

    const newStaff = new Staff({
      MSNV,
      HoTenNV,
      Password: hashedPassword, // Lưu mật khẩu đã mã hóa
      ChucVu,
      DiaChi,
      SoDienThoai,
      isDeleted: false // Mặc định đang làm việc
    });

    await newStaff.save();
    res.status(201).json({ message: 'Thêm nhân viên thành công!', staff: newStaff });

  } catch (err) {
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};

// 2. LẤY TẤT CẢ NHÂN VIÊN (CHƯA BỊ XÓA)
module.exports.getAllStaff = async (req, res) => {
  try {
    // Chỉ lấy nhân viên có isDeleted = false
    const list = await Staff.find({ isDeleted: false });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. CẬP NHẬT NHÂN VIÊN (UPDATE)
module.exports.updateStaff = async (req, res) => {
  const { id } = req.params; // Lấy MSNV từ URL
  const { HoTenNV, ChucVu, DiaChi, SoDienThoai, Password } = req.body;

  try {
    // Tìm nhân viên
    const staff = await Staff.findOne({ MSNV: id });
    if (!staff) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });

    // Cập nhật thông tin cơ bản
    staff.HoTenNV = HoTenNV || staff.HoTenNV;
    staff.ChucVu = ChucVu || staff.ChucVu;
    staff.DiaChi = DiaChi || staff.DiaChi;
    staff.SoDienThoai = SoDienThoai || staff.SoDienThoai;

    // Nếu có đổi mật khẩu thì phải mã hóa lại
    if (Password) {
      staff.Password = await bcrypt.hash(Password, 10);
    }

    await staff.save();
    res.json({ message: 'Cập nhật thành công', staff });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. XÓA NHÂN VIÊN (SOFT DELETE)
module.exports.deleteStaff = async (req, res) => {
  const { id } = req.params; // Lấy MSNV
  try {
    const staff = await Staff.findOneAndUpdate(
      { MSNV: id },
      { isDeleted: true }, // Đánh dấu là đã xóa
      { new: true }
    );
    
    if (!staff) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    
    res.json({ message: 'Đã xóa nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. ĐĂNG NHẬP NHÂN VIÊN (BẢO MẬT CAO)
module.exports.checkStaffLogin = async (req, res) => {
  const { MSNV, Password } = req.body; 
  // Gợi ý: Nên đăng nhập bằng Mã NV (MSNV) thay vì Họ Tên vì Họ Tên dễ trùng

  try {
    // Tìm nhân viên theo MSNV (hoặc HoTenNV tùy em, nhưng MSNV tốt hơn)
    // Và phải chưa bị xóa
    const staff = await Staff.findOne({ 
      $or: [{ MSNV: MSNV }, { HoTenNV: MSNV }], // Cho phép nhập Mã hoặc Tên
      isDeleted: false 
    });

    if (!staff) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại!' });
    }

    // So sánh mật khẩu nhập vào với mật khẩu mã hóa trong DB
    const isMatch = await bcrypt.compare(Password, staff.Password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng!' });
    }

    res.status(200).json({ message: 'Đăng nhập thành công', staff });

  } catch (err) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
};

// 6. CÁC HÀM PHỤ TRỢ (GIỮ NGUYÊN HOẶC SỬA NHẸ)
module.exports.findOne = async (query) => {
  return await Staff.findOne(query);
};

module.exports.checkStaffCode = async (req, res) => {
  try {
    const staff = await Staff.findOne({ MSNV: req.params.MSNV });
    if (!staff) return res.status(404).json({ message: 'Nhân viên không tồn tại!' });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tìm kiếm' });
  }
};

// 7. ĐĂNG NHẬP QUẢN TRỊ VIÊN (HARDCODE - TẠM CHẤP NHẬN CHO ĐỒ ÁN)
module.exports.checkAdministratorLogin = async (req, res) => {
  const { HOTEN, PASSWORD } = req.body;
  try {
    // Lưu ý: Cách này không bảo mật cho dự án thực tế, nhưng ok cho bài tập lớn
    const admins = [
      { name: 'La Văn Tới', pass: 'Abc@123' },
      { name: 'Trần Anh Thư', pass: 'Abc@123' }
    ];

    const admin = admins.find(a => a.name === HOTEN && a.pass === PASSWORD);

    if (admin) {
      return res.status(200).json({ message: 'Đăng nhập Admin thành công!' });
    } else {
      return res.status(400).json({ message: 'Sai thông tin đăng nhập Admin!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};