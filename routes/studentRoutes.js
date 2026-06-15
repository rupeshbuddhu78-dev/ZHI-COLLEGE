const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const upload = require('../config/multer'); // Tumhara multer import (Photo ke liye)

router.post('/add-student', studentController.addStudent);
router.get('/', studentController.getStudents);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.post('/upload-photo/:id', upload.single('profileImage'), studentController.uploadPhoto);

module.exports = router;
