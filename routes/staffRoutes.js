const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { uploadProfile } = require('../config/multer'); 

// 🛡️ FIX: Multer ko wrap kiya taki error aane par HTML ki jagah JSON mile
const uploadMiddleware = uploadProfile.fields([
    { name: 'profilePic', maxCount: 1 }, 
    { name: 'resumeFile', maxCount: 1 }, 
    { name: 'certFile', maxCount: 1 }
]);

router.post('/', (req, res, next) => {
    uploadMiddleware(req, res, function (err) {
        if (err) {
            console.error("Multer Middleware Error:", err);
            return res.status(500).json({ success: false, message: "File Upload Error: " + err.message });
        }
        next(); // Sab theek hai toh controller pe jao
    });
}, staffController.addStaff);

router.get('/', staffController.getStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
