const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// 🔥 Naya Multer Import (Sirf Profile upload wala uploader nikala hai)
const { uploadProfile } = require('../config/multer'); 

router.post('/add-student', studentController.addStudent);
router.get('/', studentController.getStudents);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// Yahan 'uploadProfile' use kiya hai
router.post('/upload-photo/:id', uploadProfile.single('profileImage'), studentController.uploadPhoto);

module.exports = router;
