const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// 🔥 Naya Multer Import (Sirf Leave upload wala uploader nikala hai)
const { uploadLeave } = require('../config/multer'); 

// Yahan 'uploadLeave' use kiya hai
router.post('/apply', uploadLeave.single('document'), leaveController.applyLeave);

router.get('/staff/:staffId', leaveController.getStaffLeaves);
router.get('/all', leaveController.getAllLeaves);
router.put('/update-status', leaveController.updateLeaveStatus);

module.exports = router;
