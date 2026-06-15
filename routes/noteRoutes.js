const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { uploadNote } = require('../config/multer'); // Tumhara multer import

router.post('/upload', uploadNote.single('file'), noteController.uploadNote);
router.get('/', noteController.getNotes);

module.exports = router;
