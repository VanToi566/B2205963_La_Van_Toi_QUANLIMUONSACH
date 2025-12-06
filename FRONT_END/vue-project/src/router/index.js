import { createRouter, createWebHistory } from 'vue-router';

// Import trang chủ (Load ngay lập tức)
import HomeLogin from '@/views/HomeLogin.vue';

const routes = [
    // --- 1. TRANG CHỦ & AUTH ---
    { 
        path: '/', 
        name: 'Home', 
        component: HomeLogin 
    },
    { 
        path: '/login/reader', 
        name: 'ReaderLogin', 
        component: () => import('@/views/ReaderLogin.vue') // Lazy load
    },
    { 
        path: '/login/staff', 
        name: 'StaffLogin', 
        component: () => import('@/views/StaffLogin.vue') 
    },
    { 
        path: '/login/admin', 
        name: 'AdminLogin', 
        component: () => import('@/views/AdminLogin.vue') 
    },

    // --- 2. KHU VỰC ĐỘC GIẢ (READER) ---
    { 
        path: '/library', 
        name: 'LibraryOnline', 
        component: () => import('@/views/ThuVienOnline.vue') 
    },
    { 
        path: '/my-books', 
        name: 'MyBooks', 
        component: () => import('@/views/DocGiaXemSachDaMuon.vue') 
    },
    { 
        path: '/chat/ai', 
        name: 'ChatAI', 
        component: () => import('@/views/ChatBoxAI.vue') 
    },
    { 
        path: '/chat/staff', 
        name: 'ChatWithStaff', 
        component: () => import('@/views/ReaderChat.vue') 
    },
    {
        path: '/request-return',
        name: 'RequestReturn',
        component: () => import('@/views/YeuCauTraSachTuDocGia.vue')
    },

    // --- 3. KHU VỰC NHÂN VIÊN (STAFF) ---
    
    // Quản lý Mượn/Trả
    { 
        path: '/staff/loan-register', // Đổi từ DangKyMuonSachTrucTiep
        name: 'LoanRegister', 
        component: () => import('@/views/DangKyMuonSachTrucTiep.vue') 
    },
    { 
        path: '/staff/loan-list', 
        name: 'LoanList', 
        component: () => import('@/views/DanhSachDonDangKyMuon.vue') 
    },
    { 
        path: '/staff/return-approve', // Duyệt trả & Phạt
        name: 'ReturnApprove', 
        component: () => import('@/views/NhanVienDuyetTraSach.vue') 
    },
    
    // Quản lý Sách
    { 
        path: '/staff/books/add', 
        name: 'AddBook', 
        component: () => import('@/views/ThemSach.vue') 
    },
    {
        path: '/staff/books/stock',
        name: 'UpdateStock',
        component: () => import('@/views/CapNhatSoLuongSach.vue')
    },
    // Route SỬA SÁCH (Mới thêm để sau này dùng)
    {
        path: '/staff/books/edit/:id', 
        name: 'EditBook',
        component: () => import('@/views/ThemSach.vue'), // Tái sử dụng form thêm để sửa
        props: true
    },

    // Quản lý Độc giả (CRUD)
    { 
        path: '/staff/readers/add', 
        name: 'AddReader', 
        component: () => import('@/views/ThemDocGia.vue') 
    },
    // Route SỬA ĐỘC GIẢ (Quan trọng cho yêu cầu Sửa/Xóa của em)
    { 
        path: '/staff/readers/edit/:id', 
        name: 'EditReader', 
        component: () => import('@/views/ThemDocGia.vue'), // Tái sử dụng form thêm
        props: true 
    },
    
    // Quản lý Khác
    { 
        path: '/staff/publisher/add', 
        name: 'AddPublisher', 
        component: () => import('@/views/ThemNhaXuatBan.vue') 
    },
    { 
        path: '/staff/search-info', 
        name: 'SearchInfo', 
        component: () => import('@/views/TimThongTinMuonSach.vue') 
    },
    { 
        path: '/staff/chat', 
        name: 'StaffChat', 
        component: () => import('@/views/StaffChat.vue') 
    },

    // --- 4. ADMIN ---
    { 
        path: '/admin/staff/add', 
        name: 'AddStaff', 
        component: () => import('@/views/ThemNhanVien.vue') 
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;