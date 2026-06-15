const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

router.get('/dashboard', financeController.getDashboardStats);
router.post('/collect-fee', financeController.collectFee);
router.post('/expense', financeController.addExpense);
router.get('/student-fee/:studentId', financeController.getStudentFee);

module.exports = router;
