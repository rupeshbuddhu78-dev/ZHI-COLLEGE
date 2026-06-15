const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const upload = require('../config/multer'); // Tumhara multer import

router.post('/', upload.fields([
    { name: 'profilePic', maxCount: 1 }, 
    { name: 'resume', maxCount: 1 }, 
    { name: 'cert', maxCount: 1 }
]), staffController.addStaff);

router.get('/', staffController.getStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
