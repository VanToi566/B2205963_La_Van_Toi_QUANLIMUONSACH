const express = require("express");
const router = express.Router();
const axios = require("axios");
const Book = require("../models/Book"); // Import Model Sách để AI đọc dữ liệu

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

router.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ reply: "Vui lòng nhập nội dung!" });

    try {
        // 1. LẤY DỮ LIỆU SÁCH TỪ DB (Cung cấp kiến thức cho AI)
        // Chỉ lấy tên sách, tác giả và số lượng để tiết kiệm token
        const books = await Book.find({}, 'TENSACH TACGIA SOQUYEN MASACH');
        
        // Tạo một đoạn văn bản tóm tắt dữ liệu thư viện
        const libraryData = books.map(b => 
            `- Sách: "${b.TENSACH}", Tác giả: ${b.TACGIA}, Mã: ${b.MASACH}, Kho còn: ${b.SOQUYEN} quyển.`
        ).join("\n");

        // 2. XÂY DỰNG "NHÂN CÁCH" (SYSTEM INSTRUCTION)
        // Dạy cho AI biết nó là ai và nhiệm vụ là gì
        const systemPrompt = `
        Bạn là Trợ lý ảo của Thư viện Đại học (Library Assistant).
        Nhiệm vụ của bạn là giải đáp thắc mắc cho sinh viên dựa trên dữ liệu sách dưới đây.
        
        DỮ LIỆU SÁCH HIỆN CÓ:
        ${libraryData}
        
        QUY ĐỊNH:
        - Nếu sinh viên hỏi sách không có trong danh sách trên, hãy báo là thư viện chưa có.
        - Nếu số lượng bằng 0, hãy báo là đã hết sách.
        - Trả lời ngắn gọn, thân thiện, xưng là "Trợ lý thư viện".
        - Nếu sinh viên hỏi về mượn trả, hãy nhắc họ mang thẻ sinh viên đến quầy.
        `;

        // 3. GỌI GOOGLE GEMINI API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`;

        const requestData = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemPrompt }, // Bơm não cho AI trước
                        { text: `Câu hỏi của sinh viên: ${userMessage}` } // Sau đó mới đưa câu hỏi
                    ]
                }
            ]
        };

        const response = await axios.post(apiUrl, requestData, {
            headers: { "Content-Type": "application/json" }
        });

        const replyText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Hệ thống đang bận.";
        
        res.json({ reply: replyText });

    } catch (error) {
        console.error("Lỗi AI Chat:", error.response?.data || error.message);
        res.status(500).json({ reply: "Xin lỗi, server AI đang gặp sự cố." });
    }
});

module.exports = router;