const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const uploadNotice = require('../config/multer'); // Document upload ke liye

router.post('/apply', uploadNotice.single('document'), leaveController.applyLeave);
router.get('/staff/:staffId', leaveController.getStaffLeaves);
router.get('/all', leaveController.getAllLeaves);
router.put('/update-status', leaveController.updateLeaveStatus);

module.exports = router;
