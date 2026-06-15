const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/save', attendanceController.saveStudentAttendance);
router.get('/', attendanceController.getStudentAttendance);
router.post('/teacher/punch', attendanceController.teacherPunch);

module.exports = router;
