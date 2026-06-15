const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// 🔥 FIX: uploadProfile ki jagah uploadStaff import kiya, taaki files 'ZhiStaffFiles' folder mein jayein
const { uploadStaff } = require('../config/multer'); 

// 🛡️ FIX: uploadStaff.fields ka use karke middleware taiyar kiya
const uploadMiddleware = uploadStaff.fields([
    { name: 'profilePic', maxCount: 1 }, 
    { name: 'resumeFile', maxCount: 1 }, 
    { name: 'certFile', maxCount: 1 }
]);

// Staff Add karne ka route
router.post('/', (req, res, next) => {
    uploadMiddleware(req, res, function (err) {
        if (err) {
            console.error("Multer Middleware Error:", err);
            // Agar file upload mein koi dikkat aaye toh yahan se saaf JSON error milega
            return res.status(500).json({ success: false, message: "File Upload Error: " + err.message });
        }
        next(); // Agar file sahi se upload ho gayi, toh controller (addStaff) par jao
    });
}, staffController.addStaff);

router.get('/', staffController.getStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
