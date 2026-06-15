// --- 2. CLOUDINARY CONFIGURATION ---
cloudinary.config({
    cloud_name: 'dzbpiv7ds',
    api_key: '812196161439545',
    api_secret: 'gWdxF2wJvGeuMqvpDgmNogS2pdY',
    secure: true
});

// Profile Photos ke liye storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiStudentProfiles',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    },
});
const upload = multer({ storage: storage });

// Global Notices (PDF/Images) ke liye storage
const noticeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiNotices',
        resource_type: 'auto'
    },
});
const uploadNotice = multer({ storage: noticeStorage });

// 🔥 NAYA: Leave Documents ke liye Cloudinary Storage 🔥
const leaveStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiLeaves',
        resource_type: 'auto'
    },
});
const uploadLeave = multer({ storage: leaveStorage });

// Staff Files ke liye storage
const staffStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiStaffFiles',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx']
    },
});
const uploadStaff = multer({ storage: staffStorage });

// Study Notes ke liye storage
const noteStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiNotes',
        resource_type: 'auto'
    },
});
const uploadNote = multer({ storage: noteStorage });


