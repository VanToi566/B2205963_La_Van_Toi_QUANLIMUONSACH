const Book = require('../models/Book');
const fs = require('fs');

// ========== 1. THÊM SÁCH ==========
module.exports.createBook = async (req, res) => {
  try {
    const { MASACH } = req.body;
    const existingBook = await Book.findOne({ MASACH });

    if (existingBook)
      return res.status(400).json({ message: 'Mã sách đã tồn tại!' });

    const newBook = new Book({
      ...req.body,
      HINHANH: req.file ? req.file.path : ''
    });

    await newBook.save();
    res.status(201).json({ message: 'Thêm sách thành công!', book: newBook });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== 2. LẤY TẤT CẢ SÁCH ==========
module.exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ _id: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== 3. TÌM SÁCH ==========
module.exports.searchBook = async (req, res) => {
  try {
    const keyword = req.query.q;
    const books = await Book.find({
      $or: [
        { MASACH: { $regex: keyword, $options: "i" }},
        { TENSACH: { $regex: keyword, $options: "i" }},
        { TACGIA: { $regex: keyword, $options: "i" }},
      ]
    });

    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tìm kiếm!' });
  }
};

// ========== 4. LẤY 1 SÁCH ==========
module.exports.getBookID = async (req, res) => {
  try {
    const book = await Book.findOne({ MASACH: req.params.MASACH });
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== 5. UPDATE SÁCH (FULL) ==========
module.exports.updateBook = async (req, res) => {
  try {
    const { MASACH } = req.params;
    const book = await Book.findOne({ MASACH });

    if (!book)
      return res.status(404).json({ message: 'Không tìm thấy sách!' });

    const updateData = req.body;

    // Nếu có ảnh mới → xóa ảnh cũ khỏi server
    if (req.file) {
      if (book.HINHANH && fs.existsSync(book.HINHANH)) {
        fs.unlinkSync(book.HINHANH);
      }
      updateData.HINHANH = req.file.path;
    }

    await Book.updateOne({ MASACH }, updateData);

    res.json({ message: 'Cập nhật sách thành công!' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== 6. CẬP NHẬT KHO ==========
module.exports.updateBookStock = async (req, res) => {
  try {
    const book = await Book.findOne({ MASACH: req.params.MASACH });
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách!' });

    book.SOQUYEN += 1;
    await book.save();

    res.json({ message: 'Đã cập nhật kho', book });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== 7. CẬP NHẬT SỐ LƯỢNG NHẬP TAY ==========
module.exports.enterQuantity = async (req, res) => {
  try {
    const book = await Book.findOne({ MASACH: req.params.id });
    if (!book) return res.status(404).json({ message: 'Không có sách!' });

    const add = parseInt(req.body.additionalQuantity);
    book.SOQUYEN += add;

    await book.save();
    res.json({ message: 'Đã cập nhật số lượng', updatedBook: book });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== 8. CHECK MÃ SÁCH ==========
module.exports.checkBookCode = async (req, res) => {
  try {
    const book = await Book.findOne({ MASACH: req.params.MASACH });
    if (!book) return res.status(404).json({ message: 'Không có sách!' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
