const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');

// 🔥 FIX: Curly braces {} laga kar exact function import kiya
const { uploadNotice } = require('../config/multer'); 

router.post('/', uploadNotice.single('attachment'), noticeController.createNotice);
router.get('/', noticeController.getNotices);
router.delete('/:id', noticeController.deleteNotice);

module.exports = router;
