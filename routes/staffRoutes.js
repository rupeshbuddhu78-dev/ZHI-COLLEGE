const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { uploadStaff } = require('../config/multer'); 

const uploadMiddleware = uploadStaff.fields([
    { name: 'profilePic', maxCount: 1 }, 
    { name: 'resumeFile', maxCount: 1 }, 
    { name: 'certFile', maxCount: 1 }
]);

// Staff Core API Endpoints
router.post('/', (req, res, next) => {
    uploadMiddleware(req, res, function (err) {
        if (err) {
            console.error("Multer Middleware Error:", err);
            return res.status(500).json({ success: false, message: "File Upload Error: " + err.message });
        }
        next(); 
    });
}, staffController.addStaff);

router.get('/', staffController.getStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

// 🔴 NEW ADDITION: PASSWORD RESET ENDPOINT ROUTE
router.put('/:id/reset-password', staffController.resetPassword);

module.exports = router;
