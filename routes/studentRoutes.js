const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { uploadProfile } = require('../config/multer'); 

// 🛡️ SECURITY GUARD IMPORT KIYA (JWT)
const { protect } = require('../middleware/authMiddleware');

// 🛡️ HAR ROUTE SE PEHLE 'protect' LAGA DIYA
router.post('/add-student', protect, studentController.addStudent);
router.get('/', protect, studentController.getStudents);
router.put('/:id', protect, studentController.updateStudent);
router.delete('/:id', protect, studentController.deleteStudent);

// Photo upload ko bhi secure kar diya
router.post('/upload-photo/:id', protect, uploadProfile.single('profileImage'), studentController.uploadPhoto);

module.exports = router;
