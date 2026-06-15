const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { uploadProfile } = require('../config/multer'); 

// 🛡️ SECURITY GUARD (protect) HATA DIYA HAI TEMPORARILY TESTING KE LIYE

// Bina token ke direct admission/testing ke liye open routes
router.post('/add-student', studentController.addStudent);
router.get('/', studentController.getStudents);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// Photo upload ko bhi open kar diya
router.post('/upload-photo/:id', uploadProfile.single('profileImage'), studentController.uploadPhoto);

module.exports = router;
