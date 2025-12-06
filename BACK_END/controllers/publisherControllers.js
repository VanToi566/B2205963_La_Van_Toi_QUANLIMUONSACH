const Publisher = require('../models/Publisher');

// 1. THÊM NXB MỚI
module.exports.createPublisher = async (req, res) => {
  const { MANXB, TENNXB, DIACHI } = req.body;

  // Validation cơ bản
  if (!MANXB || !TENNXB || !DIACHI) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ: Mã, Tên, Địa chỉ.' });
  }

  try {
    const existingPublisher = await Publisher.findOne({ MANXB });
    if (existingPublisher) {
      return res.status(400).json({ message: 'Mã NXB này đã tồn tại!' });
    }

    const newPublisher = new Publisher({ MANXB, TENNXB, DIACHI });
    await newPublisher.save();

    res.status(201).json({ message: 'Thêm NXB thành công!', data: newPublisher });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// 2. LẤY TẤT CẢ NXB
module.exports.getAllPublisher = async (req, res) => {
  try {
    const list = await Publisher.find();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách', error: err.message });
  }
};

// 3. CẬP NHẬT NXB (MỚI THÊM)
module.exports.updatePublisher = async (req, res) => {
  const { id } = req.params; // Lấy MANXB từ URL
  const { TENNXB, DIACHI } = req.body;

  try {
    const updated = await Publisher.findOneAndUpdate(
      { MANXB: id },
      { TENNXB, DIACHI },
      { new: true } // Trả về data mới sau khi update
    );

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy NXB để sửa' });
    }

    res.status(200).json({ message: 'Cập nhật thành công', data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật', error: err.message });
  }
};

// 4. XÓA NXB (MỚI THÊM)
module.exports.deletePublisher = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Publisher.findOneAndDelete({ MANXB: id });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy NXB để xóa' });
    }

    res.status(200).json({ message: 'Đã xóa NXB thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa NXB', error: err.message });
  }
};