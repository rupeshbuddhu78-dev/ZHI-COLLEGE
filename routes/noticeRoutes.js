const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const uploadNotice = require('../config/multer'); // Notice wala multer import

router.post('/', uploadNotice.single('attachment'), noticeController.createNotice);
router.get('/', noticeController.getNotices);
router.delete('/:id', noticeController.deleteNotice);

module.exports = router;
