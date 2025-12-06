const bcrypt = require('bcryptjs');
const Reader = require('../models/Reader');

// 1. TẠO ĐỌC GIẢ MỚI
module.exports.createReader = async (req, res) => {
    const { 
        MADOCGIA, HOLOT, TEN, MAIL, NGAYSINH, PHAI, DIACHI, DIENTHOAI 
    } = req.body;

    if (!MADOCGIA || !HOLOT || !TEN || !MAIL) {
        return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin bắt buộc.' });
    }

    try {
        // Kiểm tra trùng
        const existingReader = await Reader.findOne({ MADOCGIA });
        if (existingReader) {
            return res.status(400).json({ message: 'Mã độc giả đã tồn tại.' });
        }

        // Tạo mật khẩu ngẫu nhiên 8 ký tự
        const chars = 'abcdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
        const rawPassword = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const newReader = new Reader({
            MADOCGIA, HOLOT, TEN, MAIL,
            PASSWORD: hashedPassword,
            NGAYSINH, PHAI, DIACHI, DIENTHOAI,
            isDeleted: false // Mặc định là đang hoạt động
        });

        await newReader.save();

        res.status(201).json({
            message: 'Tạo độc giả thành công!',
            rawPassword // Trả về password để nhân viên cấp cho độc giả
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. LẤY TẤT CẢ ĐỌC GIẢ (CHỈ LẤY NGƯỜI CHƯA BỊ XÓA)
module.exports.getAllReader = async (req, res) => {
    try {
        // QUAN TRỌNG: Chỉ lấy những người có isDeleted = false
        const data = await Reader.find({ isDeleted: false });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. CẬP NHẬT ĐỌC GIẢ (SỬA) - MỚI THÊM
module.exports.updateReader = async (req, res) => {
    const { id } = req.params; // Lấy MADOCGIA từ URL
    const updateData = req.body; // Dữ liệu cần sửa

    try {
        // Tìm và cập nhật
        const updatedReader = await Reader.findOneAndUpdate(
            { MADOCGIA: id },
            updateData,
            { new: true } // Trả về data mới sau khi sửa
        );

        if (!updatedReader) {
            return res.status(404).json({ message: 'Không tìm thấy độc giả.' });
        }

        res.status(200).json({ 
            message: 'Cập nhật thành công!', 
            reader: updatedReader 
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật', error: err.message });
    }
};

// 4. XÓA ĐỌC GIẢ (XÓA MỀM) - MỚI THÊM
module.exports.deleteReader = async (req, res) => {
    const { id } = req.params; // Lấy MADOCGIA

    try {
        // Không dùng deleteOne, mà dùng update để set isDeleted = true
        const deletedReader = await Reader.findOneAndUpdate(
            { MADOCGIA: id },
            { isDeleted: true },
            { new: true }
        );

        if (!deletedReader) {
            return res.status(404).json({ message: 'Không tìm thấy độc giả.' });
        }

        res.status(200).json({ message: 'Đã xóa độc giả thành công.' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi xóa độc giả', error: err.message });
    }
};

// 5. ĐĂNG NHẬP (CÓ CHECK BỊ KHÓA HAY CHƯA)
module.exports.checkReaderLogin = async (req, res) => {
    const { HOLOT, PASSWORD } = req.body; // HOLOT ở đây em đang dùng nhập cả "Họ và Tên"

    try {
        // Logic tách tên cũ của em (hơi rủi ro nếu trùng tên, nhưng tạm giữ nguyên)
        const parts = HOLOT.trim().split(' ');
        const hoLot = parts.slice(0, -1).join(' ');
        const ten = parts.at(-1);

        const reader = await Reader.findOne({ HOLOT: hoLot, TEN: ten });

        if (!reader) return res.status(400).json({ message: 'Sai thông tin đăng nhập!' });

        // KIỂM TRA QUAN TRỌNG: Nếu tài khoản đã bị xóa thì không cho đăng nhập
        if (reader.isDeleted) {
            return res.status(403).json({ message: 'Tài khoản này đã bị khóa/xóa.' });
        }

        const isMatch = await bcrypt.compare(PASSWORD, reader.PASSWORD);
        if (!isMatch) return res.status(400).json({ message: 'Sai mật khẩu!' });

        res.json({ message: 'Đăng nhập thành công!', reader });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 6. TÌM KIẾM ĐỌC GIẢ (THEO TÊN)
module.exports.getReader = async (req, res) => {
    try {
        const { name } = req.params;
        // Chỉ tìm trong những người chưa bị xóa
        const readers = await Reader.find({
            TEN: { $regex: new RegExp(name, 'i') },
            isDeleted: false 
        });

        if (!readers.length) return res.status(404).json({ message: 'Không tìm thấy!' });

        res.json(readers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 7. LẤY CHI TIẾT 1 ĐỌC GIẢ (CHECK CODE)
module.exports.checkReaderCode = async (req, res) => {
    try {
        const reader = await Reader.findOne({ MADOCGIA: req.params.MADOCGIA, isDeleted: false });
        if (!reader) return res.status(404).json({ message: 'Không tồn tại!' });
        res.json(reader);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};