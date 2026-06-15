// 📁 config/multer.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config(); // .env ko padhne ke liye

// --- CLOUDINARY SECURE CONFIGURATION ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// 1. Profile Photos ke liye storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiStudentProfiles',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    },
});
const uploadProfile = multer({ storage: storage });

// 2. Global Notices (PDF/Images) ke liye storage
const noticeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'ZhiNotices', resource_type: 'auto' },
});
const uploadNotice = multer({ storage: noticeStorage });

// 3. Leave Documents ke liye Cloudinary Storage
const leaveStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'ZhiLeaves', resource_type: 'auto' },
});
const uploadLeave = multer({ storage: leaveStorage });

// 4. Staff Files ke liye storage
const staffStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiStaffFiles',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx']
    },
});
const uploadStaff = multer({ storage: staffStorage });

// 5. Study Notes ke liye storage
const noteStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'ZhiNotes', resource_type: 'auto' },
});
const uploadNote = multer({ storage: noteStorage });

// SARE UPLOADERS KO EXPORT KAR RAHE HAIN TAAKI KAHIN BHI USE HO SAKE
module.exports = {
    uploadProfile,
    uploadNotice,
    uploadLeave,
    uploadStaff,
    uploadNote
};
