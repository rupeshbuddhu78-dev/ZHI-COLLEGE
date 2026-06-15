const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { uploadProfile } = require('../config/multer'); 

// 🔥 FIX: Fields ke naam HTML form wale 'resumeFile' aur 'certFile' se match kiye
router.post('/', uploadProfile.fields([
    { name: 'profilePic', maxCount: 1 }, 
    { name: 'resumeFile', maxCount: 1 }, 
    { name: 'certFile', maxCount: 1 }
]), staffController.addStaff);

router.get('/', staffController.getStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
