const express = require('express');
const router = express.Router();
const markController = require('../controllers/markController');

router.post('/upload', markController.uploadMarks);
router.get('/:studentId', markController.getStudentMarks);

module.exports = router;
