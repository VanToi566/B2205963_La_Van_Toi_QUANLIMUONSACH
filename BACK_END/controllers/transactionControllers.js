const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Reader = require('../models/Reader');
const Staff = require('../models/Staff');
const Publisher = require('../models/Publisher');

// ======================= 1. TẠO PHIẾU MƯỢN =======================
module.exports.createTransaction = async (req, res) => {
  const { MADOCGIA, MASACH, MSNV, NGAYMUON, NGAYTRA } = req.body;

  if (!MADOCGIA || !MASACH || !MSNV || !NGAYTRA) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
  }

  try {
    // 🔥 BƯỚC 0 — GIỚI HẠN 3 QUYỂN ĐANG MƯỢN
    const currentBorrowed = await Transaction.countDocuments({
      MADOCGIA: MADOCGIA.trim(),
      TRANGTHAI: 0 // 0 = đang mượn
    });

    if (currentBorrowed >= 3) {
      return res.status(400).json({
        message: `Độc giả ${MADOCGIA} đã mượn đủ 3 quyển — không thể mượn thêm!`
      });
    }

    // --- BƯỚC 1: KIỂM TRA SÁCH CÓ TỒN TẠI KHÔNG ---
    const book = await Book.findOne({ MASACH });
    
    if (!book) {
        return res.status(404).json({ message: 'Sách không tồn tại trong hệ thống.' });
    }
    
    if (book.SOQUYEN <= 0) {
        return res.status(400).json({ message: 'Sách này đã hết hàng, không thể mượn.' });
    }

    // --- BƯỚC 2: TRỪ SỐ LƯỢNG TRONG KHO ---
    book.SOQUYEN = book.SOQUYEN - 1;
    await book.save();

    // --- BƯỚC 3: TẠO PHIẾU MƯỢN ---
    const newTransaction = new Transaction({
      MADOCGIA,
      MASACH,
      MSNV,
      NGAYMUON: NGAYMUON || new Date(),
      NGAYTRA,
      TRANGTHAI: 0,
      TIENPHAT: 0
    });

    await newTransaction.save();
    res.status(201).json({ message: 'Mượn sách thành công!', data: newTransaction });

  } catch (err) {
    console.error('Lỗi khi tạo phiếu mượn:', err);
    res.status(500).json({ message: err.message });
  }
};

// ======================= 2. LẤY TẤT CẢ PHIẾU MƯỢN =======================
module.exports.getAllTransaction = async (req, res) => {
  try {
    const list = await Transaction.find().sort({ NGAYMUON: -1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ======================= 3. TRẢ SÁCH =======================
module.exports.returnTransaction = async (req, res) => {
  const { id } = req.params; 
  const FINE_PER_DAY = 5000; 

  try {
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu mượn này.' });
    }

    if (transaction.TRANGTHAI === 1) {
      return res.status(400).json({ message: 'Sách này đã được trả rồi!' });
    }

    const today = new Date();
    const dueDate = new Date(transaction.NGAYTRA);
    
    let tienPhat = 0;
    let soNgayTre = 0;

    // --- TÍNH PHẠT ---
    if (today > dueDate) {
      const diffTime = Math.abs(today - dueDate);
      soNgayTre = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      tienPhat = soNgayTre * FINE_PER_DAY;
    }

    // --- CẬP NHẬT PHIẾU ---
    transaction.NGAYTHUCTRA = today;
    transaction.TIENPHAT = tienPhat;
    transaction.TRANGTHAI = 1; // Đã trả
    await transaction.save();

    // --- CỘNG LẠI SỐ LƯỢNG SÁCH ---
    const book = await Book.findOne({ MASACH: transaction.MASACH });
    if (book) {
      book.SOQUYEN += 1;
      await book.save();
    }

    res.status(200).json({
      message: 'Trả sách thành công',
      chiTiet: {
        ngayHen: dueDate,
        ngayTra: today,
        soNgayTre: soNgayTre,
        tienPhat: tienPhat
      }
    });

  } catch (err) {
    console.error('Lỗi khi trả sách:', err);
    res.status(500).json({ message: err.message });
  }
};

// ======================= 4. LỊCH SỬ MƯỢN CỦA 1 ĐỘC GIẢ =======================
module.exports.getBorrowerDetails = async (req, res) => {
  const { MADOCGIA } = req.query;

  if (!MADOCGIA) {
    return res.status(400).json({ message: 'Thiếu mã độc giả' });
  }

  try {
    const transactions = await Transaction.find({ MADOCGIA });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: 'Độc giả này chưa mượn sách nào.' });
    }

    const detailedInfo = await Promise.all(transactions.map(async (t) => {
      const book = await Book.findOne({ MASACH: t.MASACH });
      const reader = await Reader.findOne({ MADOCGIA: t.MADOCGIA });
      const staff = await Staff.findOne({ MSNV: t.MSNV });
      const publisher = book ? await Publisher.findOne({ MANXB: book.MANXB }) : null;

      return {
        _id: t._id,
        MADOCGIA: reader ? reader.MADOCGIA : 'N/A',
        TEN_DOCGIA: reader ? `${reader.HOLOT} ${reader.TEN}` : 'Không xác định',
        MASACH: t.MASACH,
        TENSACH: book ? book.TENSACH : 'Sách đã xóa',
        NGAYMUON: t.NGAYMUON,
        NGAYTRA: t.NGAYTRA,
        TRANGTHAI: t.TRANGTHAI,
        TIENPHAT: t.TIENPHAT,
        NGUOILAP: staff ? staff.HoTenNV : 'N/A',
        NXB: publisher ? publisher.TENNXB : 'N/A'
      };
    }));

    res.status(200).json(detailedInfo);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết' });
  }
};
